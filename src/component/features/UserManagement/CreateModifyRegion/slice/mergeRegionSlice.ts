import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  MergeRegionState,
  MergeRegionRequest,
  MergeRegionSuccessResponse,
  MergeRegionErrorResponse,
  ApiErrorResponse,
} from '../types/mergeRegion';

// Async thunk for merging regions
export const mergeRegions = createAsyncThunk(
  'mergeRegion/mergeRegions',
  async (requestData: MergeRegionRequest, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Merging regions...'));

      const response = await Secured.post(
        API_ENDPOINTS.merge_region,
        requestData
      );

      // Handle the response data structure
      const responseData = response.data as MergeRegionSuccessResponse;

      // Hide loader on success
      dispatch(hideLoader());

      return {
        workflowId: responseData.data,
        message: 'Submitted for approval',
      };
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data: ApiErrorResponse | MergeRegionErrorResponse;
            status?: number;
          };
        };
        const errorData = axiosError.response.data;
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          // Check if the error has the nested "error" structure
          if ('error' in errorData && errorData.error) {
            const apiError = errorData.error;
            // Return a formatted error message with code and message
            return rejectWithValue(
              apiError.message || apiError.code || 'Failed to merge regions'
            );
          }

          // Fallback to old error structure
          if ('message' in errorData) {
            return rejectWithValue(
              errorData.message || 'Failed to merge regions'
            );
          }
        }

        // Handle other errors
        // Check if the error has the nested "error" structure
        if ('error' in errorData && errorData.error) {
          const apiError = errorData.error;
          // Return a formatted error message with code and message
          return rejectWithValue(
            apiError.message || apiError.code || 'Failed to merge regions'
          );
        }

        // Fallback to old error structure
        if ('message' in errorData) {
          return rejectWithValue(
            errorData.message || 'Failed to merge regions'
          );
        }
      }
      return rejectWithValue('Network error occurred while merging regions');
    }
  }
);

const initialState: MergeRegionState = {
  loading: false,
  data: null,
  message: null,
  error: null,
};

const mergeRegionSlice = createSlice({
  name: 'mergeRegion',
  initialState,
  reducers: {
    resetMergeState: (state) => {
      state.loading = false;
      state.data = null;
      state.message = null;
      state.error = null;
    },
    clearMergeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(mergeRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.workflowId;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(mergeRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
        state.message = null;
      });
  },
});

export const { resetMergeState, clearMergeError } = mergeRegionSlice.actions;
export default mergeRegionSlice.reducer;
