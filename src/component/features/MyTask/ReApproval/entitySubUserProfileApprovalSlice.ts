/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get, post } from '../../../../services/CKYCAdmin/api';
import { ENDPOINTS } from '../../../../utils/constants';
import { store } from '../../../../redux/store';
import {
  EntityProfilePendingApprovalsResponse,
  EntityProfilePendingApprovalsParams,
  EntityProfileWorkflowDetailsData,
  EntityProfileWorkflowDetailsParams,
  EntityProfileApproveParams,
  EntityProfileApproveResponse,
  EntityProfileRejectParams,
  EntityProfileRejectResponse,
  EntityProfileApprovalState,
} from './entitySubUserProfileApprovalTypes';

// ============================================
// Initial State
// ============================================

const initialState: EntityProfileApprovalState = {
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
  workflow_id: string;
  workflow_type: string;
  initiator_service: string;
  status: string;
  current_step: string;
  payload: {
    entityDetails?: {
      fiCode?: string;
      nameOfInstitution?: string;
    };
    submission?: {
      submittedAt?: string;
      submittedBy?: string;
    };
    application_esign?: {
      acknowledgementNo?: string;
    };
  };
  meta_data: {
    reId?: string;
    userId?: string;
    pendingWith?: string;
    acknowledgementNo?: string;
  };
  created_at: string;
  updated_at: string;
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
 * Fetch pending entity profile update approvals
 * API: POST /admin/api/v1/re-initiated-workflow/pending
 * Body: { page, pageSize, sortBy, sortDesc, filters: [{ operation, filters }] }
 */
export const fetchEntityProfilePendingApprovals = createAsyncThunk<
  EntityProfilePendingApprovalsResponse['data'],
  EntityProfilePendingApprovalsParams,
  { rejectValue: string }
>(
  'entityProfileApproval/fetchPendingApprovals',
  async (params, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();

      // Build filters object for the API - must include workflow_type and pendingWith
      const filtersObj: Record<string, any> = {
        workflow_type: 'RE_ENTITY_PROFILE_UPDATE',
        pendingWith: 'CERSAI',
      };

      // Add status filter - default to SUBMITTED if not provided
      if (params.status) {
        filtersObj.status = [params.status];
      } else {
        filtersObj.status = ['SUBMITTED'];
      }

      // Add date filters with correct keys
      if (params.fromDate) filtersObj.created_at__gte = params.fromDate;
      if (params.toDate) filtersObj.created_at__lte = params.toDate;

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

      const url = ENDPOINTS.ENTITY_SUB_USER_PROFILE_PENDING_APPROVALS;

      const response = await post<RawPendingApprovalsResponse>(
        url,
        requestBody,
        config
      );

      // Transform raw API response to expected format
      const responseData = response.data;

      // Debug: Log API response
      // eslint-disable-next-line no-console
      console.log('Entity Profile API Response responseData:', responseData);

      // Handle both wrapped and unwrapped response formats
      const rawData = (responseData as any)?.data || responseData;

      // eslint-disable-next-line no-console
      console.log(
        'Entity Profile API Response rawData (after unwrap):',
        rawData
      );

      // Handle case where content might be undefined or null
      const contentArray = rawData?.content || [];

      // Map the content array - transform raw API fields to expected format
      const pendingApprovals = contentArray.map(
        (item: RawPendingApprovalItem) => ({
          workflowId: item.workflow_id,
          workflowType: item.workflow_type,
          status: item.status,
          fiCode: item.payload?.entityDetails?.fiCode || '',
          institutionName: item.payload?.entityDetails?.nameOfInstitution || '',
          submittedOn: item.payload?.submission?.submittedAt || item.created_at,
          submittedBy:
            item.payload?.submission?.submittedBy ||
            item.meta_data?.userId ||
            '',
          acknowledgementNo:
            item.meta_data?.acknowledgementNo ||
            item.payload?.application_esign?.acknowledgementNo ||
            '',
          reId: item.meta_data?.reId || '',
          userId: item.meta_data?.userId || '',
          createdAt: item.created_at,
          updatedAt: item.updated_at,
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
 * Fetch workflow details for a specific entity profile update request
 * API: GET /admin/api/v1/re-user-profile-workflow/track-status/{workflowId}/details
 */
export const fetchEntityProfileWorkflowDetails = createAsyncThunk<
  EntityProfileWorkflowDetailsData,
  EntityProfileWorkflowDetailsParams,
  { rejectValue: string }
>(
  'entityProfileApproval/fetchWorkflowDetails',
  async ({ workflowId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.getEntityProfileWorkflowDetails(workflowId);

      // eslint-disable-next-line no-console
      console.log('Fetching entity workflow details from:', url);

      const response = await get<any>(url, config);

      // eslint-disable-next-line no-console
      console.log('Entity workflow details response:', response.data);

      // Handle response - API returns { data: { workflowId, payload, documents, ... } }
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
 * Approve an entity profile update request
 * API: POST /admin/api/v1/update-profile/workflow/action
 * Body: { workflowId, action: "APPROVE", remarks }
 */
export const approveEntityProfileUpdate = createAsyncThunk<
  EntityProfileApproveResponse['data'],
  EntityProfileApproveParams,
  { rejectValue: string }
>(
  'entityProfileApproval/approve',
  async ({ workflowId, remark }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.ENTITY_PROFILE_ACTION;

      const requestBody = {
        workflowId,
        action: 'APPROVE',
        remarks: remark,
      };

      // eslint-disable-next-line no-console
      console.log('Entity Profile Approve request URL:', url);
      // eslint-disable-next-line no-console
      console.log('Entity Profile Approve request body:', requestBody);

      const response = await post<any>(url, requestBody, config);

      // eslint-disable-next-line no-console
      console.log('Entity Profile Approve response:', response.data);

      const responseData = response.data?.data || response.data;
      return {
        ...responseData,
        message:
          responseData?.message ||
          'Entity profile update approved successfully',
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to approve entity profile update'
      );
    }
  }
);

/**
 * Reject an entity profile update request
 * API: POST /admin/api/v1/update-profile/workflow/action
 * Body: { workflowId, action: "REJECT", remarks }
 */
export const rejectEntityProfileUpdate = createAsyncThunk<
  EntityProfileRejectResponse['data'],
  EntityProfileRejectParams,
  { rejectValue: string }
>(
  'entityProfileApproval/reject',
  async ({ workflowId, reason }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.ENTITY_PROFILE_ACTION;

      const requestBody = {
        workflowId,
        action: 'REJECT',
        remarks: reason,
      };

      // eslint-disable-next-line no-console
      console.log('Entity Profile Reject request URL:', url);
      // eslint-disable-next-line no-console
      console.log('Entity Profile Reject request body:', requestBody);

      const response = await post<any>(url, requestBody, config);

      // eslint-disable-next-line no-console
      console.log('Entity Profile Reject response:', response.data);

      const responseData = response.data?.data || response.data;
      return {
        ...responseData,
        message:
          responseData?.message ||
          'Entity profile update rejected successfully',
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to reject entity profile update'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const entityProfileApprovalSlice = createSlice({
  name: 'entityProfileApproval',
  initialState,
  reducers: {
    // Reset entire state
    resetEntityProfileApprovalState: (state) => {
      Object.assign(state, initialState);
    },

    // Reset action state only
    resetEntityProfileActionState: (state) => {
      state.actionLoading = false;
      state.actionError = null;
      state.actionSuccess = false;
      state.actionMessage = null;
    },

    // Clear workflow details
    clearEntityProfileWorkflowDetails: (state) => {
      state.workflowDetails = null;
      state.detailsError = null;
      state.detailsLoading = false;
    },

    // Clear pending approvals
    clearEntityProfilePendingApprovals: (state) => {
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
      .addCase(fetchEntityProfilePendingApprovals.pending, (state) => {
        state.pendingLoading = true;
        state.pendingError = null;
      })
      .addCase(
        fetchEntityProfilePendingApprovals.fulfilled,
        (
          state,
          action: PayloadAction<EntityProfilePendingApprovalsResponse['data']>
        ) => {
          state.pendingLoading = false;
          state.pendingApprovals = action.payload.pendingApprovals;
          state.pagination = action.payload.pagination;
          state.pendingError = null;
        }
      )
      .addCase(fetchEntityProfilePendingApprovals.rejected, (state, action) => {
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
      .addCase(fetchEntityProfileWorkflowDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(
        fetchEntityProfileWorkflowDetails.fulfilled,
        (state, action: PayloadAction<EntityProfileWorkflowDetailsData>) => {
          state.detailsLoading = false;
          state.workflowDetails = action.payload;
          state.detailsError = null;
        }
      )
      .addCase(fetchEntityProfileWorkflowDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || 'Failed to fetch workflow details';
        state.workflowDetails = null;
      });

    // -------------------------
    // Approve Entity Profile Update
    // -------------------------
    builder
      .addCase(approveEntityProfileUpdate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
        state.actionMessage = null;
      })
      .addCase(
        approveEntityProfileUpdate.fulfilled,
        (
          state,
          action: PayloadAction<EntityProfileApproveResponse['data']>
        ) => {
          state.actionLoading = false;
          state.actionSuccess = true;
          state.actionMessage = action.payload.message;
          state.actionError = null;
        }
      )
      .addCase(approveEntityProfileUpdate.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = false;
        state.actionError =
          action.payload || 'Failed to approve entity profile update';
        state.actionMessage = null;
      });

    // -------------------------
    // Reject Entity Profile Update
    // -------------------------
    builder
      .addCase(rejectEntityProfileUpdate.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
        state.actionMessage = null;
      })
      .addCase(
        rejectEntityProfileUpdate.fulfilled,
        (state, action: PayloadAction<EntityProfileRejectResponse['data']>) => {
          state.actionLoading = false;
          state.actionSuccess = true;
          state.actionMessage = action.payload.message;
          state.actionError = null;
        }
      )
      .addCase(rejectEntityProfileUpdate.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = false;
        state.actionError =
          action.payload || 'Failed to reject entity profile update';
        state.actionMessage = null;
      });
  },
});

// ============================================
// Exports
// ============================================

export const {
  resetEntityProfileApprovalState,
  resetEntityProfileActionState,
  clearEntityProfileWorkflowDetails,
  clearEntityProfilePendingApprovals,
} = entityProfileApprovalSlice.actions;

export default entityProfileApprovalSlice.reducer;
