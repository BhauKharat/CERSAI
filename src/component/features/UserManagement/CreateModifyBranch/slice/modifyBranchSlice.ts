import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  ModifyBranchState,
  ModifyBranchRequest,
  ModifyBranchSuccessResponse,
  ModifyBranchErrorResponse,
} from '../types/modifyBranch';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: ModifyBranchState = {
  loading: false,
  success: false,
  error: null,
  workflowId: null,
  message: null,
};

// Type for the return value that includes message
type ModifyBranchReturnType = {
  workflowId: string;
  branchName: string;
  status: string;
  message: string;
};

// Async thunk for modifying branch
export const modifyBranch = createAsyncThunk<
  ModifyBranchReturnType,
  { branchCode: string; data: ModifyBranchRequest },
  { rejectValue: string }
>(
  'modifyBranch/modifyBranch',
  async ({ branchCode, data }, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Modifying branch...'));
    try {
      const response = await Secured.put(
        `${API_ENDPOINTS.modify_branch}/${encodeURIComponent(branchCode)}`,
        data
      );
      const responseData = response.data as
        | ModifyBranchSuccessResponse
        | ModifyBranchErrorResponse;

      // Check for success - either explicit success field or presence of message and data (HTTP 200)
      if (
        responseData.success !== false &&
        (responseData.success || (responseData.message && responseData.data))
      ) {
        dispatch(hideLoader());
        // Handle both string and object data formats
        const data = responseData.data;
        if (typeof data === 'string') {
          // If data is a string (workflow ID), create object structure
          return {
            workflowId: data,
            branchName: '',
            status: '',
            message: responseData.message || 'Submitted for approval',
          };
        } else if (data && typeof data === 'object' && 'workflowId' in data) {
          // If data is an object with workflowId, use it
          return {
            workflowId: data.workflowId,
            branchName: data.branchName,
            status: data.status,
            message: responseData.message || 'Submitted for approval',
          };
        } else {
          // Fallback case
          return {
            workflowId: '',
            branchName: '',
            status: '',
            message: responseData.message || 'Submitted for approval',
          };
        }
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          responseData.data?.errorMessage ||
            responseData.message ||
            'Failed to modify branch'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: ModifyBranchErrorResponse;
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
                  'Failed to modify branch'
              );
            }

            // Handle old error structure: { data: { errorMessage }, message }
            return rejectWithValue(
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to modify branch'
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
                'Failed to modify branch'
            );
          }

          // Handle old error structure: { data: { errorMessage }, message }
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to modify branch'
          );
        }
      }
      return rejectWithValue('Network error occurred while modifying branch');
    }
  }
);

// Modify branch slice
const modifyBranchSlice = createSlice({
  name: 'modifyBranch',
  initialState,
  reducers: {
    clearModifyError: (state) => {
      state.error = null;
    },
    resetModifyState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.workflowId = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(modifyBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(modifyBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.workflowId = action.payload.workflowId;
        state.message = action.payload.message || null;
        state.error = null;
      })
      .addCase(modifyBranch.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to modify branch';
      });
  },
});

export const { clearModifyError, resetModifyState } = modifyBranchSlice.actions;
export default modifyBranchSlice.reducer;
