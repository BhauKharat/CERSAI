/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  // SubUserSingleRegionState,
  SubUserSingleRegionErrorResponse,
  SubUserSingleRegionSuccessResponse,
} from '../types/SubUserSingleRegion';
import {
  SubUserCreateRegionErrorResponse,
  SubUserCreateRegionSuccessResponse,
} from '../types/SubUserCreateRegion';

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
  errorData: SubUserSingleRegionErrorResponse | ErrorResponseWithNestedError,
  fallback: string
): string => {
  const data = errorData as ErrorResponseWithNestedError;
  return (
    data.error?.message || data.data?.errorMessage || data.message || fallback
  );
};

// Async thunk for fetching single region by code
export const fetchSubUserRegionByCode = createAsyncThunk(
  'singleRegion/fetchRegionByWorkFlow',
  async (workFlow: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching region details...'));

      const response = await Secured.get(
        API_ENDPOINTS.get_my_task_region_by_workflow(workFlow)
      );

      // Handle the response data structure
      // const responseData = response.data as SubUserSingleRegionSuccessResponse;
      const data = response.data as
        | SubUserCreateRegionSuccessResponse
        | SubUserCreateRegionErrorResponse;
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
      // Hide loader on success
      // dispatch(hideLoader());

      // return responseData;
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data: SubUserSingleRegionErrorResponse;
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
            extractErrorMessage(errorData, 'Failed to fetch region')
          );
        }

        // Handle other errors
        const errorData = axiosError.response.data;
        return rejectWithValue(
          extractErrorMessage(errorData, 'Failed to fetch region')
        );
      }
      return rejectWithValue('Network error occurred while fetching region');
    }
  }
);

const initialState: SubUserSingleRegionSuccessResponse = {
  loading: false,
  data: undefined,
  error: null,
};

const SubUserSingleRegionSlice = createSlice({
  name: 'singleRegion',
  initialState,
  reducers: {
    resetSingleRegionState: (state) => {
      state.loading = false;
      state.data = undefined;
      state.error = null;
    },
    clearSingleRegionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubUserRegionByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubUserRegionByCode.fulfilled, (state, action) => {
        state.loading = false;
        console.log('action.payload hook;====', action.payload);
        // Ensure the payload is of the correct type for state.data
        if (
          action.payload &&
          typeof action.payload === 'object' &&
          'data' in action.payload &&
          // Add a more specific check for SubUserSingleRegionSuccessResponse shape
          (action.payload as any).success === true &&
          (action.payload as any).data &&
          typeof (action.payload as any).data === 'object' &&
          // Check for a property unique to SubUserSingleRegionSuccessResponse
          'sourceRegionCodes' in (action.payload as any).data === false
        ) {
          state.data = (
            action.payload as unknown as SubUserSingleRegionSuccessResponse
          ).data;
        } else {
          state.data = undefined;
        }
        state.error = null;
      })
      .addCase(fetchSubUserRegionByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = undefined;
      });
  },
});

export const { resetSingleRegionState, clearSingleRegionError } =
  SubUserSingleRegionSlice.actions;
export default SubUserSingleRegionSlice.reducer;
