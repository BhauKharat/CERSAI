/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  WorkflowPendingRequestData,
  WorkflowPendingRequestResponse,
  WorkflowPendingRequestPayload,
} from './workflowPendingRequestTypes';
import { post } from '../../../../services/CKYCAdmin/api';

const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;

interface WorkflowPendingRequestState {
  data: WorkflowPendingRequestData[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkflowPendingRequestState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk to fetch workflow pending request
export const fetchWorkflowPendingRequest = createAsyncThunk<
  WorkflowPendingRequestData[],
  WorkflowPendingRequestPayload,
  { rejectValue: string }
>(
  'reApproval/fetchWorkflowPendingRequest',
  async (payload, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL_RE}/api/v1/update-profile/workflow/pending-request`;
      const response = await post<WorkflowPendingRequestResponse>(url, payload);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch workflow pending request'
        );
      }

      console.log('🚀 Workflow pending request API response:', response.data);
      console.log('📦 Workflow data array:', response.data.data);

      // Log submission data for each workflow
      if (Array.isArray(response.data.data)) {
        response.data.data.forEach(
          (workflow: WorkflowPendingRequestData, index: number) => {
            console.log(`📋 Workflow ${index + 1}:`, {
              workflowId: workflow.workflowId,
              submittedBy:
                workflow.payload?.submission?.submittedBy ||
                workflow.submission?.submittedBy,
              submittedAt:
                workflow.payload?.submission?.submittedAt ||
                workflow.submission?.submittedAt,
              fiCode: workflow.payload?.entityDetails?.fiCode,
              institutionName:
                workflow.payload?.entityDetails?.nameOfInstitution,
            });
          }
        );
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch workflow pending request'
      );
    }
  }
);

const workflowPendingRequestSlice = createSlice({
  name: 'reApprovalWorkflowPendingRequest',
  initialState,
  reducers: {
    clearWorkflowPendingRequest: (state) => {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflowPendingRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowPendingRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchWorkflowPendingRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearWorkflowPendingRequest } =
  workflowPendingRequestSlice.actions;
export default workflowPendingRequestSlice.reducer;
