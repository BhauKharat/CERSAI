/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, post } from '../../../../services/CKYCAdmin/api';
import { ENDPOINTS } from '../../../../utils/constants';
import { store } from '../../../../redux/store';
import {
  UserProfilePendingApprovalsResponse,
  UserProfilePendingApprovalsParams,
  UserProfileWorkflowDetailsData,
  UserProfileWorkflowDetailsParams,
  UserProfileApproveParams,
  UserProfileApproveResponse,
  UserProfileRejectParams,
  UserProfileRejectResponse,
  UserProfileApprovalState,
} from '../types/userProfileApprovalTypes';

// ============================================
// Initial State
// ============================================

const initialState: UserProfileApprovalState = {
  // Pending approvals list
  pendingApprovals: [],
  pagination: null,
  pendingLoading: false,
  pendingError: null,

  // Selected workflow details
  workflowDetails: null,
  detailsLoading: false,
  detailsError: null,

  // Action states
  actionLoading: false,
  actionError: null,
  actionSuccess: false,
  actionMessage: null,
};

// ============================================
// Helper function to get auth config
// ============================================

const getAuthConfig = () => {
  const state = store.getState() as any;
  const token = state.auth?.authToken;
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

// ============================================
// Async Thunks
// ============================================

// Raw API response format for pending approvals
interface RawPendingApprovalItem {
  srNo: number;
  workflowId: string;
  userId: string;
  userName: string;
  userType: string;
  fiCode: string;
  status: string;
  displayStatus: string;
  submittedOn: string;
  submittedBy: string;
  submittedByName: string;
  acknowledgementNo: string;
  pendingApproverRole: string;
  approvalLevel: number;
}

interface RawPendingApprovalsResponse {
  content: RawPendingApprovalItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Fetch pending user profile update approvals
 * API: POST /admin/api/v1/re-user-profile-workflow/pending
 * Body: { page, pageSize, sortBy, sortDesc, filters: [{ operation, filters }] }
 */
export const fetchUserProfilePendingApprovals = createAsyncThunk<
  UserProfilePendingApprovalsResponse['data'],
  UserProfilePendingApprovalsParams,
  { rejectValue: string }
>(
  'userProfileApproval/fetchPendingApprovals',
  async (params, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();

      // Build filters object for the API
      const filtersObj: Record<string, any> = {};

      // Add status filter
      if (params.status) {
        filtersObj.status = [params.status];
      }

      // Add date filters with correct keys (same as EntityProfile)
      if (params.fromDate) filtersObj.created_at__gte = params.fromDate;
      if (params.toDate) filtersObj.created_at__lte = params.toDate;

      if (params.searchTerm) filtersObj.searchTerm = params.searchTerm;

      // Build request body with proper filter structure
      const requestBody: Record<string, any> = {
        page: params.page ?? 0,
        pageSize: params.pageSize ?? 10,
        sortBy: params.sortBy ?? 'created_at',
        sortDesc: params.sortDesc ?? true,
        search: null,
        filters: [
          {
            operation: 'AND',
            filters: filtersObj,
          },
        ],
      };

      const url = ENDPOINTS.USER_PROFILE_PENDING_APPROVALS;

      const response = await post<RawPendingApprovalsResponse>(
        url,
        requestBody,
        config
      );

      // Transform raw API response to expected format
      // API may return { data: { content: [...] } } or { content: [...] }
      const responseData = response.data;

      // Debug: Log API response
      // eslint-disable-next-line no-console
      console.log('API Response responseData:', responseData);

      // Handle both wrapped and unwrapped response formats
      const rawData = (responseData as any)?.data || responseData;

      // eslint-disable-next-line no-console
      console.log('API Response rawData (after unwrap):', rawData);

      // Handle case where content might be undefined or null
      const contentArray = rawData?.content || [];

      // Map the content array - use raw API fields directly
      const pendingApprovals = contentArray.map(
        (item: RawPendingApprovalItem) => ({
          ...item,
          // Also map to expected field names for backwards compatibility
          requestorUserId: item.userId,
          requestorName: item.userName,
          requestorUserType: item.userType,
        })
      );

      const pagination = {
        page: rawData?.page ?? 0,
        pageSize: rawData?.size ?? 10,
        totalCount: rawData?.totalElements ?? 0,
        totalPages: rawData?.totalPages ?? 0,
        hasNext: rawData?.hasNext ?? false,
        hasPrev: rawData?.hasPrevious ?? false,
      };

      return {
        pendingApprovals,
        pagination,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch pending approvals'
      );
    }
  }
);

/**
 * Fetch workflow details for a specific user profile update request
 */
export const fetchUserProfileWorkflowDetails = createAsyncThunk<
  UserProfileWorkflowDetailsData,
  UserProfileWorkflowDetailsParams,
  { rejectValue: string }
>(
  'userProfileApproval/fetchWorkflowDetails',
  async ({ workflowId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.getUserProfileWorkflowDetails(workflowId);

      // eslint-disable-next-line no-console
      console.log('Fetching workflow details from:', url);

      const response = await get<any>(url, config);

      // eslint-disable-next-line no-console
      console.log('Workflow details response:', response.data);

      // Handle response - API returns { data: { workflow: {...}, documents: [...] } }
      const responseData = response.data?.data || response.data;

      return responseData;
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
 * Approve a user profile update request
 * API: POST /admin/api/v1/re-user-profile-workflow/approval
 * Body: { workflowId, action: "APPROVE", remarks }
 */
export const approveUserProfileUpdate = createAsyncThunk<
  UserProfileApproveResponse['data'],
  UserProfileApproveParams,
  { rejectValue: string }
>(
  'userProfileApproval/approve',
  async ({ workflowId, remark }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.USER_PROFILE_APPROVAL;

      const requestBody = {
        workflowId,
        action: 'APPROVE',
        remarks: remark,
      };

      // eslint-disable-next-line no-console
      console.log('Approve request URL:', url);
      // eslint-disable-next-line no-console
      console.log('Approve request body:', requestBody);

      const response = await post<any>(url, requestBody, config);

      // eslint-disable-next-line no-console
      console.log('Approve response:', response.data);

      const responseData = response.data?.data || response.data;
      return responseData;
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
 * Reject a user profile update request
 * API: POST /admin/api/v1/re-user-profile-workflow/approval
 * Body: { workflowId, action: "REJECT", reason, remarks }
 */
export const rejectUserProfileUpdate = createAsyncThunk<
  UserProfileRejectResponse['data'],
  UserProfileRejectParams,
  { rejectValue: string }
>(
  'userProfileApproval/reject',
  async ({ workflowId, reason }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.USER_PROFILE_APPROVAL;

      const requestBody = {
        workflowId,
        action: 'REJECT',
        reason: reason,
        remarks: reason,
      };

      // eslint-disable-next-line no-console
      console.log('Reject request URL:', url);
      // eslint-disable-next-line no-console
      console.log('Reject request body:', requestBody);

      const response = await post<any>(url, requestBody, config);

      // eslint-disable-next-line no-console
      console.log('Reject response:', response.data);

      const responseData = response.data?.data || response.data;
      return responseData;
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

const userProfileApprovalSlice = createSlice({
  name: 'userProfileApproval',
  initialState,
  reducers: {
    // Reset entire state
    resetUserProfileApprovalState: (state) => {
      Object.assign(state, initialState);
    },

    // Reset action state only
    resetUserProfileActionState: (state) => {
      state.actionLoading = false;
      state.actionError = null;
      state.actionSuccess = false;
      state.actionMessage = null;
    },

    // Clear workflow details
    clearUserProfileWorkflowDetails: (state) => {
      state.workflowDetails = null;
      state.detailsError = null;
      state.detailsLoading = false;
    },

    // Clear pending approvals
    clearUserProfilePendingApprovals: (state) => {
      state.pendingApprovals = [];
      state.pagination = null;
      state.pendingError = null;
      state.pendingLoading = false;
    },
  },
  extraReducers: (builder) => {
    // -------------------------
    // Fetch Pending Approvals
    // -------------------------
    builder
      .addCase(fetchUserProfilePendingApprovals.pending, (state) => {
        state.pendingLoading = true;
        state.pendingError = null;
      })
      .addCase(
        fetchUserProfilePendingApprovals.fulfilled,
        (
          state,
          action: PayloadAction<UserProfilePendingApprovalsResponse['data']>
        ) => {
          state.pendingLoading = false;
          state.pendingApprovals = action.payload.pendingApprovals;
          state.pagination = action.payload.pagination;
          state.pendingError = null;
        }
      )
      .addCase(fetchUserProfilePendingApprovals.rejected, (state, action) => {
        state.pendingLoading = false;
        state.pendingError =
          action.payload || 'Failed to fetch pending approvals';
        state.pendingApprovals = [];
        state.pagination = null;
      });

    // -------------------------
    // Fetch Workflow Details
    // -------------------------
    builder
      .addCase(fetchUserProfileWorkflowDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(
        fetchUserProfileWorkflowDetails.fulfilled,
        (state, action: PayloadAction<UserProfileWorkflowDetailsData>) => {
          state.detailsLoading = false;
          state.workflowDetails = action.payload;
          state.detailsError = null;
        }
      )
      .addCase(fetchUserProfileWorkflowDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || 'Failed to fetch workflow details';
        state.workflowDetails = null;
      });

    // -------------------------
    // Approve User Profile Update
    // -------------------------
    builder
      .addCase(approveUserProfileUpdate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
        state.actionMessage = null;
      })
      .addCase(
        approveUserProfileUpdate.fulfilled,
        (state, action: PayloadAction<UserProfileApproveResponse['data']>) => {
          state.actionLoading = false;
          state.actionSuccess = true;
          state.actionMessage = action.payload.message;
          state.actionError = null;
        }
      )
      .addCase(approveUserProfileUpdate.rejected, (state, action) => {
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
      .addCase(rejectUserProfileUpdate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
        state.actionMessage = null;
      })
      .addCase(
        rejectUserProfileUpdate.fulfilled,
        (state, action: PayloadAction<UserProfileRejectResponse['data']>) => {
          state.actionLoading = false;
          state.actionSuccess = true;
          state.actionMessage = action.payload.message;
          state.actionError = null;
        }
      )
      .addCase(rejectUserProfileUpdate.rejected, (state, action) => {
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
  resetUserProfileApprovalState,
  resetUserProfileActionState,
  clearUserProfileWorkflowDetails,
  clearUserProfilePendingApprovals,
} = userProfileApprovalSlice.actions;

export default userProfileApprovalSlice.reducer;
