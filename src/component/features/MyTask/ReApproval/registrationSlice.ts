/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  RegistrationData,
  RegistrationDataResponse,
} from './registrationTypes';
import { get } from '../../../../services/CKYCAdmin/api';

const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;

interface RegistrationDataState {
  data: RegistrationData | null;
  loading: boolean;
  error: string | null;
}

const initialState: RegistrationDataState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk to fetch registration data
export const fetchRegistrationData = createAsyncThunk<
  RegistrationData,
  { workFlowId: string; userId: string },
  { rejectValue: string }
>(
  'reApproval/fetchRegistrationData',
  async ({ workFlowId, userId }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL_RE}/api/v1/registration?workflowId=${workFlowId}&userId=${userId}`;
      const response = await get<RegistrationDataResponse>(url);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch registration data'
        );
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch registration data'
      );
    }
  }
);

const registrationSlice = createSlice({
  name: 'reApprovalRegistration',
  initialState,
  reducers: {
    clearRegistrationData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegistrationData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRegistrationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearRegistrationData } = registrationSlice.actions;
export default registrationSlice.reducer;
