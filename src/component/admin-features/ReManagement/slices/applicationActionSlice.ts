/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../../../services/CKYCAdmin/api';
import { ENDPOINTS } from '../../../../utils/constants';
import {
  ApplicationActionRequest,
  ApplicationActionResponse,
  ApplicationActionError,
} from '../types/applicationActionTypes';
import { store } from '../../../../redux/store';

interface ApplicationActionState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: ApplicationActionResponse['data'] | null;
}

const initialState: ApplicationActionState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

export const updateApplicationStatus = createAsyncThunk(
  'application/updateStatus',
  async (requestData: ApplicationActionRequest, { rejectWithValue }) => {
    try {
      // Get token from Redux state
      const state = store.getState() as any;
      const token = state.auth?.authToken;
      // Add Authorization header manually if needed
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};
      let APIURL = '';
      let requestDataJSON = undefined;
      if (!requestData.apiType) {
        throw undefined;
      }

      APIURL = ENDPOINTS.updateApplicationStatus(requestData?.apiType);
      requestDataJSON = {
        workflowId: requestData?.workflowId,
        reason: requestData?.reason,
        remarks: requestData?.remarks,
        modifiableFields:
          requestData?.apiType === 'request-for-modification'
            ? requestData.modifiableFields || undefined
            : undefined,
      };

      console.log('APIURL===', APIURL);
      console.log('requestDataJSON===', requestDataJSON);
      const response = await api.post(APIURL, requestDataJSON, config);
      return response.data as ApplicationActionResponse;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue({
          success: false,
          message:
            error.response.data.message ||
            'Failed to update application status',
          data: error.response.data.data || '',
        });
      }
      return rejectWithValue({
        success: false,
        message: error.message || 'An unexpected error occurred',
        data: '',
      });
    }
  }
);

const applicationActionSlice = createSlice({
  name: 'applicationAction',
  initialState,
  reducers: {
    resetActionState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.data = null;
      })
      .addCase(
        updateApplicationStatus.fulfilled,
        (state, action: PayloadAction<ApplicationActionResponse>) => {
          state.loading = false;
          state.success = true;
          state.error = null;
          state.data = action.payload.data;
        }
      )
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as ApplicationActionError)?.message ||
          'Failed to update application status';
        state.data = null;
      });
  },
});

export const { resetActionState } = applicationActionSlice.actions;
export default applicationActionSlice.reducer;
