/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, post } from '../../../../services/CKYCAdmin/api';
import { ENDPOINTS } from '../../../../utils/constants';

// ============================================
// Types
// ============================================

export interface REUserProfileWorkflowDetailsParams {
  workflowId: string;
  approverId: string;
}

export interface REUserProfileApproveParams {
  workflowId: string;
  userId: string;
  remark: string;
}

export interface REUserProfileRejectParams {
  workflowId: string;
  userId: string;
  remark: string;
}

export interface REUserProfileWorkflowState {
  workflowDetails: any | null;
  detailsLoading: boolean;
  detailsError: string | null;
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: boolean;
  actionMessage: string | null;
}

// ============================================
// Initial State
// ============================================

const initialState: REUserProfileWorkflowState = {
  workflowDetails: null,
  detailsLoading: false,
  detailsError: null,
  actionLoading: false,
  actionError: null,
  actionSuccess: false,
  actionMessage: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Fetch workflow details for a specific user profile update request (RE Portal)
 * API: GET /re/api/v1/user-profile-workflows/{workflowId}/details?approverId={approverId}
 */
export const fetchREUserProfileWorkflowDetails = createAsyncThunk<
  any,
  REUserProfileWorkflowDetailsParams,
  { rejectValue: string }
>(
  'reUserProfileWorkflow/fetchWorkflowDetails',
  async ({ workflowId, approverId }, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getREUserProfileWorkflowDetails(
        workflowId,
        approverId
      );

      console.log('🚀 Fetching RE User Profile workflow details from:', url);

      const response = await get<any>(url);

      console.log(
        '📦 RE User Profile workflow details response:',
        response.data
      );

      // Handle response - API returns { success: true, data: { workflow: {...}, documents: [...] } }
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch workflow details'
        );
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch workflow details'
      );
    }
  }
);

/**
 * Approve a user profile update request (RE Portal)
 * API: POST /re/api/v1/user-profile-workflows/{workflowId}/approve?userId={userId}
 * Body: { remark: "..." }
 */
export const approveREUserProfileUpdate = createAsyncThunk<
  any,
  REUserProfileApproveParams,
  { rejectValue: string }
>(
  'reUserProfileWorkflow/approve',
  async ({ workflowId, userId, remark }, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getREUserProfileApprove(workflowId, userId);

      const requestBody = {
        remark: remark,
      };

      console.log('✅ Approve request URL:', url);
      console.log('✅ Approve request body:', requestBody);

      const response = await post<any>(url, requestBody);

      console.log('✅ Approve response:', response.data);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to approve user profile update'
        );
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to approve user profile update'
      );
    }
  }
);

/**
 * Reject a user profile update request (RE Portal)
 * API: POST /re/api/v1/user-profile-workflows/{workflowId}/reject?userId={userId}
 * Body: { remark: "..." }
 */
export const rejectREUserProfileUpdate = createAsyncThunk<
  any,
  REUserProfileRejectParams,
  { rejectValue: string }
>(
  'reUserProfileWorkflow/reject',
  async ({ workflowId, userId, remark }, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getREUserProfileReject(workflowId, userId);

      const requestBody = {
        remark: remark,
      };

      console.log('❌ Reject request URL:', url);
      console.log('❌ Reject request body:', requestBody);

      const response = await post<any>(url, requestBody);

      console.log('❌ Reject response:', response.data);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to reject user profile update'
        );
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to reject user profile update'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const reUserProfileWorkflowSlice = createSlice({
  name: 'reUserProfileWorkflow',
  initialState,
  reducers: {
    // Reset entire state
    resetREUserProfileWorkflowState: (state) => {
      Object.assign(state, initialState);
    },

    // Reset action state only
    resetREUserProfileActionState: (state) => {
      state.actionLoading = false;
      state.actionError = null;
      state.actionSuccess = false;
      state.actionMessage = null;
    },

    // Clear workflow details
    clearREUserProfileWorkflowDetails: (state) => {
      state.workflowDetails = null;
      state.detailsError = null;
      state.detailsLoading = false;
    },
  },
  extraReducers: (builder) => {
    // -------------------------
    // Fetch Workflow Details
    // -------------------------
    builder
      .addCase(fetchREUserProfileWorkflowDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(
        fetchREUserProfileWorkflowDetails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.detailsLoading = false;
          state.workflowDetails = action.payload;
          state.detailsError = null;
        }
      )
      .addCase(fetchREUserProfileWorkflowDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || 'Failed to fetch workflow details';
        state.workflowDetails = null;
      });

    // -------------------------
    // Approve User Profile Update
    // -------------------------
    builder
      .addCase(approveREUserProfileUpdate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
        state.actionMessage = null;
      })
      .addCase(
        approveREUserProfileUpdate.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.actionLoading = false;
          state.actionSuccess = true;
          state.actionMessage =
            action.payload.message || 'User profile approved successfully';
          state.actionError = null;
        }
      )
      .addCase(approveREUserProfileUpdate.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = false;
        state.actionError =
          action.payload || 'Failed to approve user profile update';
        state.actionMessage = null;
      });

    // -------------------------
    // Reject User Profile Update
    // -------------------------
    builder
      .addCase(rejectREUserProfileUpdate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
        state.actionMessage = null;
      })
      .addCase(
        rejectREUserProfileUpdate.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.actionLoading = false;
          state.actionSuccess = true;
          state.actionMessage =
            action.payload.message || 'User profile rejected successfully';
          state.actionError = null;
        }
      )
      .addCase(rejectREUserProfileUpdate.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = false;
        state.actionError =
          action.payload || 'Failed to reject user profile update';
        state.actionMessage = null;
      });
  },
});

// ============================================
// Exports
// ============================================

export const {
  resetREUserProfileWorkflowState,
  resetREUserProfileActionState,
  clearREUserProfileWorkflowDetails,
} = reUserProfileWorkflowSlice.actions;

export default reUserProfileWorkflowSlice.reducer;
