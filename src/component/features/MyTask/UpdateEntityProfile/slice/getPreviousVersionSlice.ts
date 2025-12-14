import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  GetPreviousVersionResponse,
  GetPreviousVersionError,
  GetPreviousVersionState,
} from '../types/getPreviousVersionTypes';

// Async thunk for fetching previous version data
export const fetchPreviousVersionData = createAsyncThunk<
  GetPreviousVersionResponse,
  string,
  { rejectValue: GetPreviousVersionError }
>(
  'getPreviousVersion/fetchPreviousVersionData',
  async (updateRequestId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.get_previous_version(updateRequestId)
      );

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      const axiosError = error as {
        response?: { data?: GetPreviousVersionError };
      };
      if (axiosError.response?.data) {
        return rejectWithValue(axiosError.response.data);
      }
      return rejectWithValue({
        success: false,
        message: 'Network error occurred',
        data: {
          errorCode: 'NETWORK_ERROR',
          errorMessage: 'Failed to fetch previous version data',
        },
      });
    }
  }
);

// Initial state
const initialState: GetPreviousVersionState = {
  data: null,
  loading: false,
  error: null,
};

// Create slice
const getPreviousVersionSlice = createSlice({
  name: 'getPreviousVersion',
  initialState,
  reducers: {
    clearPreviousVersionData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
    clearPreviousVersionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreviousVersionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreviousVersionData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPreviousVersionData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || 'Failed to fetch previous version data';
        state.data = null;
      });
  },
});

export const { clearPreviousVersionData, clearPreviousVersionError } =
  getPreviousVersionSlice.actions;
export default getPreviousVersionSlice.reducer;
