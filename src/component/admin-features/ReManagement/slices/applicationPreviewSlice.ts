/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApplicationDetails,
  ApplicationDetailsResponse,
} from '../types/applicationPreviewTypes';
import { get } from '../../../../services/CKYCAdmin/api'; // Adjust path as needed
import { ENDPOINTS } from '../../../../utils/constants';

interface ApplicationDetailsState {
  data: ApplicationDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationDetailsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchApplicationDetails = createAsyncThunk<
  ApplicationDetails,
  string, // acknowledgementNo is now required
  { rejectValue: string }
>(
  'applicationDetails/fetch',
  async (acknowledgementNo, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getApplicationDetails(acknowledgementNo);
      const response = await get<ApplicationDetailsResponse>(url);
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch application details'
        );
      }
      return response.data.data; // Return the nested data property of type ApplicationDetails
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch application details'
      );
    }
  }
);

const applicationDetailsSlice = createSlice({
  name: 'applicationDetails',
  initialState,
  reducers: {
    clearApplicationDetail: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchApplicationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearApplicationDetail } = applicationDetailsSlice.actions;
export default applicationDetailsSlice.reducer;
