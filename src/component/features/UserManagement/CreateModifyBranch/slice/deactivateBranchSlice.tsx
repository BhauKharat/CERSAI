import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  DeactivateBranchState,
  DeactivateBranchRequest,
  DeactivateBranchSuccessResponse,
  DeactivateBranchErrorResponse,
} from '../types/deactivateBranch';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: DeactivateBranchState = {
  loading: false,
  success: false,
  error: null,
  workflowId: null,
  message: null,
};

// Async thunk for deactivating branch
export const deactivateBranch = createAsyncThunk<
  {
    workflowId: string;
    message: string;
    deactivateData: DeactivateBranchSuccessResponse['data'];
  },
  DeactivateBranchRequest,
  { rejectValue: string }
>(
  'deactivateBranch/deactivateBranch',
  async (deactivateData, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Deactivating branch...'));
    try {
      const url = `${API_ENDPOINTS.deactivate_branch}/${deactivateData.branchCode}/deactivate`;
      const payload = {
        branchCode: deactivateData.branchCode,
        remark: deactivateData.remark,
        userId: deactivateData.userId,
      };
      console.log('Deactivate Branch API URL:', url);
      console.log('Deactivate Branch Payload:', payload);
      const response = await Secured.put(url, payload);
      // Check response status to determine success
      if (response.status === 200) {
        // Success response with message and data (workflowId)
        const data = response.data as DeactivateBranchSuccessResponse;
        dispatch(hideLoader());
        return {
          workflowId: data.data.workflowId,
          message: 'Submitted for approval',
          deactivateData: data.data,
        };
      } else {
        // Error response
        const data = response.data as DeactivateBranchErrorResponse;
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage ||
            data.message ||
            'Failed to deactivate branch'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: DeactivateBranchErrorResponse;
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
                  'Failed to deactivate branch'
              );
            }

            // Handle old error structure: { data: { errorMessage }, message }
            return rejectWithValue(
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to deactivate branch'
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
                'Failed to deactivate branch'
            );
          }

          // Handle old error structure: { data: { errorMessage }, message }
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to deactivate branch'
          );
        }
      }
      return rejectWithValue(
        'Network error occurred while deactivating branch'
      );
    }
  }
);

// Deactivate branch slice
const deactivateBranchSlice = createSlice({
  name: 'deactivateBranch',
  initialState,
  reducers: {
    clearDeactivateError: (state) => {
      state.error = null;
    },
    resetDeactivateState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.workflowId = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deactivateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deactivateBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.workflowId = action.payload.workflowId;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(deactivateBranch.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.workflowId = null;
        state.message = null;
      });
  },
});

export const { clearDeactivateError, resetDeactivateState } =
  deactivateBranchSlice.actions;
export default deactivateBranchSlice.reducer;
