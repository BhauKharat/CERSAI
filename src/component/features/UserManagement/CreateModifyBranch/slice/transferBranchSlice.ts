import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  TransferBranchRequest,
  TransferBranchSuccessResponse,
  TransferBranchErrorResponse,
  TransferBranchState,
} from '../types/transferBranchTypes';

// Initial state
const initialState: TransferBranchState = {
  transferLoading: false,
  transferSuccess: false,
  transferError: null,
  workflowId: null,
  message: null,
  transferData: null,
};

// Async thunk for transferring branch
export const transferBranch = createAsyncThunk<
  {
    workflowId: string;
    message: string;
    transferData: TransferBranchSuccessResponse['data'];
  },
  TransferBranchRequest,
  { rejectValue: string }
>(
  'transferBranch/transferBranch',
  async (transferData, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Transferring branch...'));
    try {
      const response = await Secured.post(
        API_ENDPOINTS.transfer_branch,
        transferData
      );
      // Check response status to determine success
      if (response.status === 200) {
        // Success response with message and data (workflowId)
        const data = response.data as TransferBranchSuccessResponse;
        dispatch(hideLoader());
        return {
          workflowId: data.data.workflowId,
          message: 'Submitted for approval',
          transferData: data.data,
        };
      } else {
        // Error response
        const data = response.data as TransferBranchErrorResponse;
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage || data.message || 'Failed to transfer branch'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: TransferBranchErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response?.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          if (axiosError.response?.data) {
            const errorData = axiosError.response.data;

            // Handle new error structure: { error: { status, code, type, message } }
            if (errorData.error) {
              return rejectWithValue(
                errorData.error.message ||
                  errorData.error.code ||
                  'Failed to transfer branch'
              );
            }

            // Handle old error structure: { data: { errorMessage }, message }
            return rejectWithValue(
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to transfer branch'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          // Handle new error structure: { error: { status, code, type, message } }
          if (errorData.error) {
            return rejectWithValue(
              errorData.error.message ||
                errorData.error.code ||
                'Failed to transfer branch'
            );
          }

          // Handle old error structure: { data: { errorMessage }, message }
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to transfer branch'
          );
        }
      }
      return rejectWithValue(
        'Network error occurred while transferring branch'
      );
    }
  }
);

// Transfer branch slice
const transferBranchSlice = createSlice({
  name: 'transferBranch',
  initialState,
  reducers: {
    clearTransferError: (state) => {
      state.transferError = null;
    },
    resetTransferState: (state) => {
      state.transferLoading = false;
      state.transferSuccess = false;
      state.transferError = null;
      state.workflowId = null;
      state.message = null;
      state.transferData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(transferBranch.pending, (state) => {
        state.transferLoading = true;
        state.transferError = null;
      })
      .addCase(transferBranch.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transferSuccess = true;
        state.workflowId = action.payload.workflowId;
        state.message = action.payload.message;
        state.transferData = action.payload.transferData;
        state.transferError = null;
      })
      .addCase(transferBranch.rejected, (state, action) => {
        state.transferLoading = false;
        state.transferSuccess = false;
        state.transferError = action.payload as string;
        state.workflowId = null;
        state.message = null;
      });
  },
});

export const { clearTransferError, resetTransferState } =
  transferBranchSlice.actions;
export default transferBranchSlice.reducer;
