import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  FetchRegionsRequest,
  FetchRegionsSuccessResponse,
  FetchRegionsErrorResponse,
  FetchRegionsState,
} from '../types/fetchRegionsTypes';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: FetchRegionsState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for fetching regions
export const fetchRegions = createAsyncThunk<
  FetchRegionsSuccessResponse,
  FetchRegionsRequest,
  { rejectValue: string }
>(
  'fetchRegions/fetchRegions',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Fetching regions...'));

      const response = await Secured.get<FetchRegionsSuccessResponse>(
        `${API_ENDPOINTS.fetch_regions}?userId=${requestData.userId}`
      );

      dispatch(hideLoader());

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to fetch regions'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());

      const err = error as {
        response?: {
          data?: FetchRegionsErrorResponse;
          status?: number;
        };
        message?: string;
      };
      const status = err.response?.status;

      // Handle 500 status
      if (status === 500) {
        return rejectWithValue(
          'Something went wrong on our side. Please try again later'
        );
      }

      // Handle 400 or 401 - show backend error
      if (status === 400 || status === 401) {
        return rejectWithValue(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch regions'
        );
      }

      // Handle other errors
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch regions'
      );
    }
  }
);

// Slice
const fetchRegionsSlice = createSlice({
  name: 'fetchRegions',
  initialState,
  reducers: {
    clearFetchRegionsData: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload || 'Failed to fetch regions';
      });
  },
});

export const { clearFetchRegionsData } = fetchRegionsSlice.actions;
export default fetchRegionsSlice.reducer;
