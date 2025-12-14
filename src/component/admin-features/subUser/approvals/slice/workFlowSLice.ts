// slices/workflowSlice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../../Constant';
import { formatActivity } from '../../../../../utils/enumUtils';

// Updated API Response Types to match your new structure
export interface User {
  id: string;
  title: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  designation: string;
  emailId: string;
  citizenship: string;
  ckycNumber: string;
  countryCode: string;
  mobileNumber: string;
  proofOfIdentity: string;
  proofOfIdentityNumber: string;
  dob: string;
  gender: string;
  employeeCode: string;
  functionalityMapped: string;
  role: string;
}

export interface Address {
  line1: string;
  line2: string;
  line3: string;
  countryCode: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  pincodeInCaseOfOthers: string | null;
}

export interface UserDto {
  user: User;
  address: Address;
}

export interface SubWorkflow {
  id: string;
  approvalLevel: number;
  currentStatus: string;
  createdDate: string;
  updatedDate: string;
  assignedTo?: string;
  remarks?: string;
  reason?: string;
}

export interface WorkflowApproval {
  workflowId: string;
  userAccountAction: string;
  workflowData: any;
  userDto: UserDto;
  initiatedBy: string;
  approvalStatus: 'PENDING' | 'APPROVE' | 'REJECT';
  type: 'SINGLE' | 'MULTIPLE' | 'NOT_REQUIRED';
  pendingAtStage: number;
  totalNoOfApprovals: number;
  subWorkflows: SubWorkflow[];
  createdDate: string;
  updatedDate: string;

  // New fields from API
  requisitionReason?: string;
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  suspensionPeriodDays?: number;
}

// Request interfaces for approval API
export interface ApprovalRequest {
  workflowId: string;
  action: 'APPROVE' | 'REJECT';
  remarks: string;
  reason: string;
}

// Response interface for approval API
export interface ApprovalResponse {
  success: boolean;
  message: string;
  httpCode: number;
  httpStatus: string;
  localDateTime: string;
  data: {
    approvalWorkflow: WorkflowApproval;
  };
}

// Error type
interface ApiError {
  errorCode: string;
  errorMessage: string | undefined;
}

// Filters interface
interface WorkflowFilters {
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  pageSize: number;
}

// Table data interface for easier rendering
export interface TableWorkflowData {
  key: string;
  srNo: number;
  userName: string;
  employeeCode: string;
  emailId: string;
  role: string;
  action: string;
  status: string;
  pendingAtStage: number;
  createdDate: string;
  originalData: WorkflowApproval;
}

// State interface
interface WorkflowState {
  approvals: WorkflowApproval[];
  filteredApprovals: WorkflowApproval[];
  selectedApproval: WorkflowApproval | null;
  filters: WorkflowFilters;
  totalApprovals: number;
  loading: boolean;
  approvalLoading: boolean;
  error: string | ApiError | null;
  approvalError: string | ApiError | null;
}

// Initial state
const initialState: WorkflowState = {
  approvals: [],
  filteredApprovals: [],
  selectedApproval: null,
  filters: {
    searchQuery: '',
    statusFilter: 'All',
    currentPage: 1,
    pageSize: 10,
  },
  totalApprovals: 0,
  loading: false,
  approvalLoading: false,
  error: null,
  approvalError: null,
};

// Async thunk for fetching pending approvals
export const fetchPendingApprovals = createAsyncThunk<
  WorkflowApproval[],
  void,
  {
    rejectValue: { errorCode: string; errorMessage: string };
    state: { auth: { token: string | null } };
  }
>(
  'workflow/fetchPendingApprovals',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;

    if (!token) {
      return rejectWithValue({
        errorCode: 'NO_AUTH_TOKEN',
        errorMessage: 'No authentication token found',
      });
    }

    try {
      const response = await fetch(
        `${API_ENDPOINTS.admin_subuser_workflow_list}/pending-requests`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue({
          errorCode: errorData.errorCode || `HTTP_${response.status}`,
          errorMessage:
            errorData.errorMessage || `HTTP error! status: ${response.status}`,
        });
      }

      const data: WorkflowApproval[] = await response.json();
      return data;
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue({
          errorCode:
            error.response.data.errorCode || 'FETCH_PENDING_APPROVALS_ERROR',
          errorMessage:
            error.response.data.errorMessage ||
            'Failed to fetch pending approvals',
        });
      }
      return rejectWithValue({
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'Network request failed',
      });
    }
  }
);

// New async thunk for approving/rejecting workflow
// export const submitWorkflowApproval = createAsyncThunk<
//   ApprovalResponse,
//   ApprovalRequest,
//   { rejectValue: { errorCode: string; errorMessage: string }; state: { auth: { token: string | null } } }
// >(
//   'workflow/submitWorkflowApproval',
//   async (approvalRequest, { getState, rejectWithValue }) => {
//     const { token } = getState().auth;

//     if (!token) {
//       return rejectWithValue({
//         errorCode: 'NO_AUTH_TOKEN',
//         errorMessage: 'No authentication token found',
//       });
//     }

//     try {
//       const response = await fetch('http://10.31.53.53:8083/api/v1/user-workflow/approve', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(approvalRequest),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         return rejectWithValue({
//           errorCode: errorData.errorCode || `HTTP_${response.status}`,
//           errorMessage: errorData.errorMessage || `HTTP error! status: ${response.status}`,
//         });
//       }

//       const data: ApprovalResponse = await response.json();
//       return data;
//     } catch (error: any) {
//       if (error.response?.data) {
//         return rejectWithValue({
//           errorCode: error.response.data.errorCode || 'SUBMIT_APPROVAL_ERROR',
//           errorMessage: error.response.data.errorMessage || 'Failed to submit approval',
//         });
//       }
//       return rejectWithValue({
//         errorCode: 'NETWORK_ERROR',
//         errorMessage: error.message || 'Network request failed',
//       });
//     }
//   }
// );

// Helper function to format display status
const getDisplayStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    APPROVE: 'Approved',
    REJECT: 'Rejected',
  };
  return statusMap[status] || status;
};

// Helper function to apply filters
const applyFiltersToData = (
  approvals: WorkflowApproval[],
  filters: WorkflowFilters
): WorkflowApproval[] => {
  let filtered = [...approvals];

  // Apply status filter
  if (filters.statusFilter !== 'All') {
    filtered = filtered.filter(
      (approval) => approval.approvalStatus === filters.statusFilter
    );
  }

  // Apply search filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter((approval) => {
      const fullName =
        `${approval.userDto.user.firstName} ${approval.userDto.user.middleName} ${approval.userDto.user.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        approval.userDto.user.employeeCode.toLowerCase().includes(query) ||
        approval.userDto.user.emailId.toLowerCase().includes(query) ||
        approval.workflowId.toLowerCase().includes(query) ||
        approval.userAccountAction.toLowerCase().includes(query)
      );
    });
  }

  return filtered;
};

// Helper function to transform data for table display
export const transformWorkflowData = (
  approvals: WorkflowApproval[],
  currentPage: number,
  pageSize: number
): TableWorkflowData[] => {
  return approvals.map((approval, index) => ({
    key: approval.workflowId,
    srNo: (currentPage - 1) * pageSize + index + 1,
    userName:
      `${approval.userDto.user.firstName} ${approval.userDto.user.middleName} ${approval.userDto.user.lastName}`.trim(),
    employeeCode: approval.userDto.user.employeeCode,
    emailId: approval.userDto.user.emailId,
    role: approval.userDto.user.role,
    action: formatActivity(approval.userAccountAction),
    status: getDisplayStatus(approval.approvalStatus),
    pendingAtStage: approval.pendingAtStage,
    createdDate: new Date(approval.createdDate).toLocaleDateString(),
    originalData: approval,
  }));
};

// Create slice
const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      state.filteredApprovals = applyFiltersToData(
        state.approvals,
        state.filters
      );
      state.totalApprovals = state.filteredApprovals.length;
      state.filters.currentPage = 1; // Reset to first page
    },

    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.statusFilter = action.payload;
      state.filteredApprovals = applyFiltersToData(
        state.approvals,
        state.filters
      );
      state.totalApprovals = state.filteredApprovals.length;
      state.filters.currentPage = 1; // Reset to first page
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.currentPage = action.payload;
    },

    setSelectedApproval: (
      state,
      action: PayloadAction<WorkflowApproval | null>
    ) => {
      state.selectedApproval = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearApprovalError: (state) => {
      state.approvalError = null;
    },

    applyFilters: (state) => {
      state.filteredApprovals = applyFiltersToData(
        state.approvals,
        state.filters
      );
      state.totalApprovals = state.filteredApprovals.length;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredApprovals = state.approvals;
      state.totalApprovals = state.approvals.length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pending approvals cases
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.approvals = action.payload;
        state.filteredApprovals = applyFiltersToData(
          action.payload,
          state.filters
        );
        state.totalApprovals = state.filteredApprovals.length;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as ApiError;
        state.approvals = [];
        state.filteredApprovals = [];
        state.totalApprovals = 0;
      });
    // // Submit workflow approval cases
    // .addCase(submitWorkflowApproval.pending, (state) => {
    //   state.approvalLoading = true;
    //   state.approvalError = null;
    // })
    // .addCase(submitWorkflowApproval.fulfilled, (state, action) => {
    //   state.approvalLoading = false;
    //   state.approvalError = null;

    //   // Update the approved workflow in the state
    //   const updatedWorkflow = action.payload.data.approvalWorkflow;
    //   const index = state.approvals.findIndex(approval => approval.workflowId === updatedWorkflow.workflowId);

    //   if (index !== -1) {
    //     // Update the existing workflow with the new data
    //     state.approvals[index] = { ...state.approvals[index], ...updatedWorkflow };

    //     // Re-apply filters to update filtered approvals
    //     state.filteredApprovals = applyFiltersToData(state.approvals, state.filters);
    //     state.totalApprovals = state.filteredApprovals.length;

    //     // Update selected approval if it matches
    //     if (state.selectedApproval && state.selectedApproval.workflowId === updatedWorkflow.workflowId) {
    //       state.selectedApproval = state.approvals[index];
    //     }
    //   }
    // })
    // .addCase(submitWorkflowApproval.rejected, (state, action) => {
    //   state.approvalLoading = false;
    //   state.approvalError = action.payload as ApiError;
    // });
  },
});

// Export actions
export const {
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setSelectedApproval,
  clearError,
  clearApprovalError,
  applyFilters,
  resetFilters,
} = workflowSlice.actions;

// Selectors for easier data access
export const selectCurrentPageData = (state: { workflow: WorkflowState }) => {
  const { filteredApprovals, filters } = state.workflow;
  const startIndex = (filters.currentPage - 1) * filters.pageSize;
  const endIndex = startIndex + filters.pageSize;
  return filteredApprovals.slice(startIndex, endIndex);
};

export const selectPaginationInfo = (state: { workflow: WorkflowState }) => {
  const { totalApprovals, filters } = state.workflow;
  const totalPages = Math.ceil(totalApprovals / filters.pageSize);
  const hasNextPage = filters.currentPage < totalPages;
  const hasPrevPage = filters.currentPage > 1;

  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    totalApprovals,
    currentPage: filters.currentPage,
    pageSize: filters.pageSize,
  };
};

// Export reducer
export default workflowSlice.reducer;
