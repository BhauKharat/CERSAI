import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  MergeBranchRequest,
  MergeBranchSuccessResponse,
  MergeBranchErrorResponse,
  MergeBranchState,
} from '../types/mergeBranchTypes';

// Initial state
const initialState: MergeBranchState = {
  mergeLoading: false,
  mergeSuccess: false,
  mergeError: null,
  workflowId: null,
  message: null,
  mergeData: null,
};

// Async thunk for merging branches
export const mergeBranch = createAsyncThunk<
  {
    workflowId: string;
    message: string;
    mergeData: MergeBranchSuccessResponse['data'];
  },
  MergeBranchRequest,
  { rejectValue: string }
>(
  'mergeBranch/mergeBranch',
  async (mergeData, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Merging branches...'));
    try {
      const response = await Secured.post(
        API_ENDPOINTS.merge_branch,
        mergeData
      );
      // Check response status to determine success
      if (response.status === 200) {
        // Success response with message and data (workflowId)
        const data = response.data as MergeBranchSuccessResponse;
        dispatch(hideLoader());
        return {
          workflowId: data.data.workflowId,
          message: 'Submitted for approval',
          mergeData: data.data,
        };
      } else {
        // Error response
        const data = response.data as MergeBranchErrorResponse;
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage || data.message || 'Failed to merge branches'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: MergeBranchErrorResponse;
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
                  'Failed to merge branches'
              );
            }

            // Handle old error structure: { data: { errorMessage }, message }
            return rejectWithValue(
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to merge branches'
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
                'Failed to merge branches'
            );
          }

          // Handle old error structure: { data: { errorMessage }, message }
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to merge branches'
          );
        }
      }
      return rejectWithValue('Network error occurred while merging branches');
    }
  }
);

// Merge branch slice
const mergeBranchSlice = createSlice({
  name: 'mergeBranch',
  initialState,
  reducers: {
    clearMergeError: (state) => {
      state.mergeError = null;
    },
    resetMergeState: (state) => {
      state.mergeLoading = false;
      state.mergeSuccess = false;
      state.mergeError = null;
      state.workflowId = null;
      state.message = null;
      state.mergeData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(mergeBranch.pending, (state) => {
        state.mergeLoading = true;
        state.mergeError = null;
      })
      .addCase(mergeBranch.fulfilled, (state, action) => {
        state.mergeLoading = false;
        state.mergeSuccess = true;
        state.workflowId = action.payload.workflowId;
        state.message = action.payload.message;
        state.mergeData = action.payload.mergeData;
        state.mergeError = null;
      })
      .addCase(mergeBranch.rejected, (state, action) => {
        state.mergeLoading = false;
        state.mergeSuccess = false;
        state.mergeError = action.payload as string;
      });
  },
});

export const { clearMergeError, resetMergeState } = mergeBranchSlice.actions;
export default mergeBranchSlice.reducer;
