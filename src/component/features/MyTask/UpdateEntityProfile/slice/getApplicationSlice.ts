import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../../Constant';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  GetApplicationState,
  GetApplicationResponse,
  GetApplicationError,
} from '../types/getApplicationTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: GetApplicationState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk for fetching application data
export const fetchApplicationData = createAsyncThunk(
  'getApplication/fetchApplicationData',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Fetching application data...'));
      const response = await Secured.get(API_ENDPOINTS.get_application);

      const successData = response.data as GetApplicationResponse;
      dispatch(hideLoader());

      // Handle case where API returns success but no data (e.g., "No Pending Entity Profile Request")
      if (successData.success && !successData.data) {
        return rejectWithValue(
          successData.message || 'No pending requests found'
        );
      }

      return successData.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: GetApplicationError };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          dispatch(hideLoader());
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch application data'
          );
        }
      }
      dispatch(hideLoader());
      return rejectWithValue(
        'Network error occurred while fetching application data'
      );
    }
  }
);

// Create slice
const getApplicationSlice = createSlice({
  name: 'getApplication',
  initialState,
  reducers: {
    clearApplicationData: (state) => {
      state.data = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchApplicationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearApplicationData, clearError } = getApplicationSlice.actions;
export default getApplicationSlice.reducer;
