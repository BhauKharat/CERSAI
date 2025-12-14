import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  CreateBranchState,
  CreateBranchRequest,
  CreateBranchSuccessResponse,
  CreateBranchErrorResponse,
} from '../types/createBranch';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: CreateBranchState = {
  createLoading: false,
  createSuccess: false,
  createError: null,
  workflowId: null,
  message: null,
};

// Async thunk for creating a branch
export const createBranch = createAsyncThunk<
  { workflowId: string; message: string },
  CreateBranchRequest,
  { rejectValue: string }
>(
  'createBranch/createBranch',
  async (branchData, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Creating branch...'));
    try {
      const response = await Secured.post(
        API_ENDPOINTS.create_branch,
        branchData
      );
      // Check response status to determine success
      if (response.status === 200) {
        // Success response with message and data (workflowId)
        const data = response.data as CreateBranchSuccessResponse;
        dispatch(hideLoader());
        return {
          workflowId: data.data,
          message: 'Submitted for approval',
        };
      } else {
        // Error response
        const data = response.data as CreateBranchErrorResponse;
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage || data.message || 'Failed to create branch'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: CreateBranchErrorResponse;
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
                  'Failed to create branch'
              );
            }

            // Handle old error structure: { data: { errorMessage }, message }
            return rejectWithValue(
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to create branch'
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
                'Failed to create branch'
            );
          }

          // Handle old error structure: { data: { errorMessage }, message }
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to create branch'
          );
        }
      }
      return rejectWithValue('Network error occurred while creating branch');
    }
  }
);

// Create branch slice
const createBranchSlice = createSlice({
  name: 'createBranch',
  initialState,
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createSuccess = false;
      state.createError = null;
      state.workflowId = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBranch.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.workflowId = action.payload.workflowId;
        state.message = action.payload.message;
        state.createError = null;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError = action.payload as string;
        state.workflowId = null;
        state.message = null;
      });
  },
});

export const { clearCreateError, resetCreateState } = createBranchSlice.actions;
export default createBranchSlice.reducer;
