import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  SubUserSingleBranchState,
  SubUserSingleBranchSuccessResponse,
  SubUserSingleBranchErrorResponse,
} from '../types/SubUserSingleBranch';

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
  errorData: SubUserSingleBranchErrorResponse | ErrorResponseWithNestedError,
  fallback: string
): string => {
  const data = errorData as ErrorResponseWithNestedError;
  return (
    data.error?.message || data.data?.errorMessage || data.message || fallback
  );
};

// Async thunk for fetching single region by code
export const fetchSubUserBranchByID = createAsyncThunk(
  'singleBranch/fetchBranchByWorkFlow',
  async (workFlow: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching region details...'));

      const response = await Secured.get(
        API_ENDPOINTS.get_my_task_branch_by_workflow(workFlow)
      );

      // Handle the response data structure
      // const responseData = response.data as SubUserSingleBranchSuccessResponse;

      // Hide loader on success
      // dispatch(hideLoader());

      // return responseData.data;
      const data = response.data as
        | SubUserSingleBranchSuccessResponse
        | SubUserSingleBranchErrorResponse;
      console.log('data;====', data);
      if (data.success) {
        dispatch(hideLoader());
        return data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage || data.message || 'Failed to modify region'
        );
      }
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data: SubUserSingleBranchErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            extractErrorMessage(errorData, 'Failed to fetch branch')
          );
        }

        // Handle other errors
        const errorData = axiosError.response.data;
        return rejectWithValue(
          extractErrorMessage(errorData, 'Failed to fetch branch')
        );
      }
      return rejectWithValue('Network error occurred while fetching branch');
    }
  }
);

// Async thunk for fetching single region by code
export const fetchSubUserBranchByCode = createAsyncThunk(
  'singleBranch/fetchBranchByWorkFlow',
  async (workFlow: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching branch details...'));

      const response = await Secured.get(
        API_ENDPOINTS.get_my_task_branch_by_code(workFlow)
      );

      // Handle the response data structure
      const responseData = response.data as SubUserSingleBranchSuccessResponse;

      // Hide loader on success
      dispatch(hideLoader());

      return responseData.data;
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data: SubUserSingleBranchErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            extractErrorMessage(errorData, 'Failed to fetch branch')
          );
        }

        // Handle other errors
        const errorData = axiosError.response.data;
        return rejectWithValue(
          extractErrorMessage(errorData, 'Failed to fetch branch')
        );
      }
      return rejectWithValue('Network error occurred while fetching branch');
    }
  }
);

const initialState: SubUserSingleBranchState = {
  loading: false,
  data: null,
  error: null,
};

const SubUserSingleBranchSlice = createSlice({
  name: 'singleBranch',
  initialState,
  reducers: {
    resetSingleBranchState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    clearSingleBranchError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubUserBranchByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubUserBranchByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchSubUserBranchByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { resetSingleBranchState, clearSingleBranchError } =
  SubUserSingleBranchSlice.actions;
export default SubUserSingleBranchSlice.reducer;
