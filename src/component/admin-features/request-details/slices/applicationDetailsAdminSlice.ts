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

export const fetchApplicationDetailsAdmincms = createAsyncThunk<
  ApplicationDetails,
  { workFlowId: string; userId: string },
  { rejectValue: string }
>(
  'applicationDetails/fetchAdmin',
  async ({ workFlowId, userId }, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getApplicationDetailsadmincms(workFlowId, userId);
      const response = await get<ApplicationDetailsResponse>(url);
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch application details'
        );
      }
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch application details'
      );
    }
  }
);

const applicationDetailsSlice = createSlice({
  name: 'applicationDetailsdataAdmin',
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
      .addCase(fetchApplicationDetailsAdmincms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationDetailsAdmincms.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchApplicationDetailsAdmincms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearApplicationDetail } = applicationDetailsSlice.actions;
export default applicationDetailsSlice.reducer;
