import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  SubUserCreateBranchErrorResponse,
  SubUserCreateBranchState,
  SubUserCreateBranchSuccessResponse,
  SubUserModifyBranchRequest,
} from '../types/SubUserCreateBranch';
import { StatusSubUserBranchType } from '../types/SubUserSingleBranch';

// Helper type for error response with nested error object
interface ErrorResponseWithNestedError {
  error?: {
    message?: string;
    status?: number;
    code?: string;
    type?: string;
  };
  data?: {
    errorMessage?: string;
  };
  message?: string;
}

// Helper function to extract error message from various error response formats
const extractErrorMessage = (
  errorData: SubUserCreateBranchErrorResponse | ErrorResponseWithNestedError,
  fallback: string
): string => {
  const data = errorData as ErrorResponseWithNestedError;
  return (
    data.error?.message || data.data?.errorMessage || data.message || fallback
  );
};

// Initial state for region creation
const initialState: SubUserCreateBranchState = {
  createLoading: false,
  createSuccess: false,
  createError: null,
  workflowId: null,
  modifyLoading: false,
  modifySuccess: false,
  modifyError: null,
  modifyWorkflowId: null,
};

// Async thunk for modifying an existing region
export const StatusSubUserBranch = createAsyncThunk<
  SubUserCreateBranchSuccessResponse,
  {
    regionCode: string;
    regionData: StatusSubUserBranchType;
    statusType: string;
    userId?: string;
  },
  { rejectValue: string }
>(
  'createBranch/modifyBranch',
  async (
    { regionCode, regionData, statusType, userId },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('De-activating Branch...'));
    try {
      const url = `${API_ENDPOINTS.get_my_task_branch_by_workflow(regionCode) + '/' + statusType}${userId ? `?userId=${userId}` : ''}`;
      console.log('API URL:', url);
      console.log('Request Payload:', regionData);
      const response = await Secured.post(url, regionData);

      const data = response.data;
      console.log('data;====', data);

      // Success case - return the response with message
      dispatch(hideLoader());
      return {
        success: true,
        message: data.message || 'Operation completed successfully',
        data: data.data || data,
      } as SubUserCreateBranchSuccessResponse;
    } catch (error: unknown) {
      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: SubUserCreateBranchErrorResponse;
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

        // Handle 400 or 401 - return full error object as JSON string
        if (status === 400 || status === 401) {
          if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            console.log('Rejecting with error data:', errorData);
            return rejectWithValue(JSON.stringify(errorData));
          }
        }

        // Handle other errors - return full error object as JSON string
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(JSON.stringify(errorData));
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for modifying an existing region
export const modifySubUserBranch = createAsyncThunk<
  SubUserCreateBranchSuccessResponse['data'],
  { regionCode: string; regionData: SubUserModifyBranchRequest },
  { rejectValue: string }
>(
  'createBranch/modifyBranch',
  async ({ regionCode, regionData }, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Modifying region...'));
    try {
      const response = await Secured.put(
        `${API_ENDPOINTS.create_region}/${regionCode}`,
        regionData
      );

      const data = response.data as
        | SubUserCreateBranchSuccessResponse
        | SubUserCreateBranchErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage || data.message || 'Failed to modify region'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: SubUserCreateBranchErrorResponse;
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
            return rejectWithValue(
              extractErrorMessage(errorData, 'Failed to modify branch')
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            extractErrorMessage(errorData, 'Failed to modify branch')
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create Branch slice
const SubUserStatusUpdateBranchSlice = createSlice({
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
    },
    clearModifyError: (state) => {
      state.modifyError = null;
    },
    resetModifyState: (state) => {
      state.modifyLoading = false;
      state.modifySuccess = false;
      state.modifyError = null;
      state.modifyWorkflowId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create region cases
      .addCase(StatusSubUserBranch.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(StatusSubUserBranch.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.workflowId = action?.payload?.data?.workflowId || null;
        state.createError = null;
      })
      .addCase(StatusSubUserBranch.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError =
          (action.payload as string) || 'Failed to create region';
      })
      // Modify region cases
      .addCase(modifySubUserBranch.pending, (state) => {
        state.modifyLoading = true;
        state.modifyError = null;
        state.modifySuccess = false;
      })
      .addCase(modifySubUserBranch.fulfilled, (state, action) => {
        state.modifyLoading = false;
        state.modifySuccess = true;
        state.modifyWorkflowId = action.payload.workflowId;
        state.modifyError = null;
      })
      .addCase(modifySubUserBranch.rejected, (state, action) => {
        state.modifyLoading = false;
        state.modifySuccess = false;
        state.modifyError = action.payload || 'Failed to modify region';
      });
  },
});

export const {
  clearCreateError,
  resetCreateState,
  clearModifyError,
  resetModifyState,
} = SubUserStatusUpdateBranchSlice.actions;
export default SubUserStatusUpdateBranchSlice.reducer;
