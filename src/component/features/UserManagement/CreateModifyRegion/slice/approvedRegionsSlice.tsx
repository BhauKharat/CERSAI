import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  ApprovedRegionsState,
  ApprovedRegionsSuccessResponse,
  ApprovedRegionsErrorResponse,
} from '../types/approvedRegions';

// Async thunk for fetching approved regions
export const fetchApprovedRegions = createAsyncThunk(
  'approvedRegions/fetchApprovedRegions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(API_ENDPOINTS.get_approved_regions);

      // Handle the response data structure
      const responseData = response.data as ApprovedRegionsSuccessResponse;
      return responseData.data || responseData; // Handle both wrapped and unwrapped responses
    } catch (error: unknown) {
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: ApprovedRegionsErrorResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage || 'Failed to fetch approved regions'
        );
      }
      return rejectWithValue(
        'Network error occurred while fetching approved regions'
      );
    }
  }
);

const initialState: ApprovedRegionsState = {
  loading: false,
  data: [],
  error: null,
};

const approvedRegionsSlice = createSlice({
  name: 'approvedRegions',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.data = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchApprovedRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = [];
      });
  },
});

export const { resetState, clearError } = approvedRegionsSlice.actions;
export default approvedRegionsSlice.reducer;
