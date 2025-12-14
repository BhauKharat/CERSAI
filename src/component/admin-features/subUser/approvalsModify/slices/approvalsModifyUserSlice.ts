/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../../Constant';

// Types
export interface ApprovalRequest {
  workflowId: string;
  action: string;
  remarks: string;
  reason: string;
}

export interface SubWorkflow {
  id: string;
  approvalLevel: number;
  assignedTo: string;
  currentStatus: string;
  remarks: string;
  reason: string;
  createdDate: string;
  updatedDate: string;
}

export interface ApprovalWorkflow {
  workflowId: string;
  userAccountAction: string;
  workflowData: Record<string, any>;
  initiatedBy: string;
  approvalStatus: string;
  type: string;
  requisitionReason: string;
  totalNoOfApprovals: number;
  subWorkflows: SubWorkflow[];
  createdDate: string;
  updatedDate: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  httpCode: number;
  httpStatus: string;
  localDateTime: string;
  data: {
    approvalWorkflow: ApprovalWorkflow;
  };
}

export interface WorkflowState {
  loading: boolean;
  error: string | null;
  success: boolean;
  approvalData: ApprovalResponse['data'] | null;
  message: string;
}

// Async thunk for approving workflow - simplified typing
export const approveWorkflow = createAsyncThunk<
  ApprovalResponse,
  ApprovalRequest,
  { rejectValue: string }
>(
  'modifyUserWorkflow/approve',
  async (approvalData: ApprovalRequest, { getState, rejectWithValue }) => {
    try {
      // Type assertion for the state to get auth token
      const state = getState() as { auth: { token: string } };
      const { token } = state.auth;

      const response = await fetch(
        `${API_ENDPOINTS.admin_subuser_workflow_list}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(approvalData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

const userWorkflowSlice = createSlice({
  name: 'userWorkflow',
  initialState: {
    loading: false,
    error: null,
    success: false,
    approvalData: null,
    message: '',
  } as WorkflowState,
  reducers: {
    clearWorkflowState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    resetApprovalData: (state) => {
      state.approvalData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(approveWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(approveWorkflow.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.message = action.payload.message;
        state.approvalData = action.payload.data;
        state.error = null;
      })
      .addCase(approveWorkflow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearWorkflowState, resetApprovalData } =
  userWorkflowSlice.actions;
export default userWorkflowSlice.reducer;
