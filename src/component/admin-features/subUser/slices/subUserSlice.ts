/* eslint-disable @typescript-eslint/no-explicit-any */
// features/subUser/subUserSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api/index';
import { RootState } from '../../../../redux/store';
import { API_ENDPOINTS } from 'Constant';
import DateUtils from '../../../../utils/dateUtils';
import { formatWorkflowType } from '../../../../utils/enumUtils';

// Types
interface Address {
  line1: string;
  line2: string;
  line3: string;
  countryCode: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  pincodeInCaseOfOthers: string | null;
  id: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface ApprovalWorkflow {
  workflowId: string;
  userAccountAction: string;
  workflowData: any;
  initiatedBy: string;
  approvalStatus: 'APPROVE' | 'REJECT' | 'PENDING';
  type: string;
  pendingWithUserId: string | null;
  pendingAtStage: string | null;
  requisitionReason: string | null;
  suspensionStartDate: string | null;
  suspensionEndDate: string | null;
  suspensionPeriodDays: number | null;
  totalNoOfApprovals: number;
  subWorkflows: any[];
  createdDate: string;
  updatedDate: string;
}

export interface SubUser {
  title: string;
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
  functionalityMapped: Record<string, string[]> | null; // Changed from string to object
  role: string;
  authServerUserId: string;
  status:
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';
  operationalStatus?: string;
  workflowStatus?: string;
  suspendTillDate: string | null;
  id: string;
  address: Address;
  approvalMasterWorkflow: ApprovalWorkflow[];
  createdBy: string | null;
  updatedBy: string | null;
  modifiedBy?: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface SubUserFilters {
  searchQuery: string;
  statusFilter?: string;
  currentPage: number;
  pageSize: number;
}

interface SubUserState {
  users: SubUser[];
  filteredUsers: SubUser[];
  totalUsers: number;
  loading: boolean;
  error: SubUserError | null;
  filters: SubUserFilters;
  selectedUser: SubUser | null;
  totalPages?: number | null;
}

const initialState: SubUserState = {
  users: [],
  filteredUsers: [],
  totalUsers: 0,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    statusFilter: undefined,
    currentPage: 1,
    pageSize: 10,
  },
  selectedUser: null,
  totalPages: null,
};

// Error types for better error handling
export interface SubUserError {
  errorCode: string;
  errorMessage: string;
}

// Async Thunk for fetching all users with token authentication
// export const fetchUsers = createAsyncThunk<
//   SubUser[],
//   void,
//   { rejectValue: SubUserError; state: { auth: { token: string | null } } }
// >('subUser/fetchUsers', async (_, { getState, rejectWithValue }) => {
//   const { token } = getState().auth;

//   if (!token) {
//     return rejectWithValue({
//       errorCode: 'NO_AUTH_TOKEN',
//       errorMessage: 'No authentication token found',
//     });
//   }

//   try {
//     const response = await fetch(`${API_BASE_URL}/users`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       return rejectWithValue({
//         errorCode: errorData.errorCode || `HTTP_${response.status}`,
//         errorMessage:
//           errorData.errorMessage || `HTTP error! status: ${response.status}`,
//       });
//     }

//     const data = await response.json();
//     return data;
//   } catch (error: any) {
//     if (error.response?.data) {
//       return rejectWithValue({
//         errorCode: error.response.data.errorCode || 'FETCH_USERS_ERROR',
//         errorMessage:
//           error.response.data.errorMessage || 'Failed to fetch users',
//       });
//     }
//     return rejectWithValue({
//       errorCode: 'NETWORK_ERROR',
//       errorMessage: error.message || 'Network request failed',
//     });
//   }
// });

// export const fetchUsers = createAsyncThunk<
//   SubUser[],
//   void,
//   { rejectValue: SubUserError; state: RootState }
// >('subUser/fetchUsers', async (_, { getState, rejectWithValue }) => {
//   try {
//     console.log('getState : ', getState);
//     // `Secured` already attaches token from the store via interceptors
//     const response = await Secured.get(`${API_BASE_URL}`);

//     // Axios automatically parses JSON
//     const data = response.data;
//     console.log('Response from fetch user: ', data?.data);

//     // Map to SubUser[] (transform operationalStatus → status if needed)
//     const users: SubUser[] = (data?.data?.content || []).map((item: any) => ({
//       ...item.user,
//       status: item.user.operationalStatus, // overwrite/transform
//     }));
//     console.log('Users in fetchSubusers: ', users);

//     console.log('In Fetch users: ', users);

//     return users;
//   } catch (error: any) {
//     if (error.response?.data) {
//       return rejectWithValue({
//         errorCode: error.response.data.errorCode || 'FETCH_USERS_ERROR',
//         errorMessage:
//           error.response.data.errorMessage || 'Failed to fetch users',
//       });
//     }
//     return rejectWithValue({
//       errorCode: 'NETWORK_ERROR',
//       errorMessage: error.message || 'Network request failed',
//     });
//   }
// });

// export const fetchUsers = createAsyncThunk<
//   { users: SubUser[]; totalPages: number; totalUsers: number }, // return type
//   void,
//   { rejectValue: SubUserError; state: RootState }
// >('subUser/fetchUsers', async (_, { rejectWithValue }) => {
//   try {
//     const response = await Secured.get(`${API_BASE_URL}`);
//     const data = response.data;

//     const users: SubUser[] = (data?.data?.content || []).map((item: any) => ({
//       ...item.user,
//       address: item.address, // attach address too
//       status: item.user.operationalStatus, // map API field
//     }));

//     return {
//       users,
//       totalPages: data?.data?.totalPages ?? 0,
//       totalUsers: data?.data?.totalElements ?? users.length,
//     };
//   } catch (error: any) {
//     if (error.response?.data) {
//       return rejectWithValue({
//         errorCode: error.response.data.errorCode || 'FETCH_USERS_ERROR',
//         errorMessage:
//           error.response.data.errorMessage || 'Failed to fetch users',
//       });
//     }
//     return rejectWithValue({
//       errorCode: 'NETWORK_ERROR',
//       errorMessage: error.message || 'Network request failed',
//     });
//   }
// });

const statusMapped: any = {
  // Legacy mappings
  Approved: 'ACTIVE',
  Pending: 'IN_ACTIVE',
  Rejected: 'REJECTED',
  Suspended: 'SUSPENDED',
  Inactive: 'INACTIVE',
  Deactivated: 'DEACTIVATED',
  // Direct mappings (API values)
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  INACTIVE: 'INACTIVE',
  IN_ACTIVE: 'IN_ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
};

// Helper function to format workflow type for display is now imported from enumUtils

// Async Thunk for fetching Track Status (workflow-based users)
export const fetchTrackStatusUsers = createAsyncThunk<
  { users: SubUser[]; totalPages: number; totalUsers: number },
  {
    page: number;
    size: number;
    searchQuery?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    sortDesc?: boolean;
  },
  { rejectValue: SubUserError; state: RootState }
>(
  'subUser/fetchTrackStatusUsers',
  async (
    { page, size, sortBy, search, status, sortDesc },
    { rejectWithValue }
  ) => {
    try {
      const requestBody = {
        filters: [
          {
            operation: 'AND',
            filters: {
              workflow_type: [
                'CERSAI_USER_CREATION',
                'CERSAI_USER_MODIFICATION',
                'CERSAI_USER_SUSPENSION',
                'CERSAI_USER_SUSPENSION_REVOKE',
                'CERSAI_USER_DEACTIVATION',
              ],
              status: ['PENDING', 'APPROVED', 'REJECTED'],
            },
          },
        ],
        page: page,
        pageSize: size,
        sortBy: sortBy,
        search: search,
        status: status,
        sortDesc: sortDesc ? sortDesc : true,
      };

      const response = await Secured.post(
        `${API_ENDPOINTS.admin_subuser_workflow_list}/track-status`,
        requestBody
      );

      const data = response.data;

      // Map workflow data to SubUser format
      const users: SubUser[] = (data?.data?.content || []).map(
        (workflow: any) => {
          const user = workflow.payload?.userDetails?.user || {};
          const initiator = workflow.payload?.initiatorDetails || {};
          const concernedUser = workflow.payload?.concernedUserDetails || {};
          const approvals = workflow.payload?.approvalWorkflow?.approvals || [];

          // Format date for display
          // const formatDate = (dateString: string) => {
          //   if (!dateString) return '';
          //   const date = new Date(dateString);
          //   return date.toLocaleString('en-IN', {
          //     day: '2-digit',
          //     month: '2-digit',
          //     year: 'numeric',
          //     hour: '2-digit',
          //     minute: '2-digit',
          //   });
          // };

          // Extract approval/rejection details from approvals array

          // Find the latest approval/rejection entry
          const latestApproval =
            approvals.length > 0
              ? approvals.reduce((latest: any, current: any) => {
                  const latestDate = new Date(
                    latest.actionDateTime || latest.createdDate || 0
                  );
                  const currentDate = new Date(
                    current.actionDateTime || current.createdDate || 0
                  );
                  return currentDate > latestDate ? current : latest;
                })
              : null;

          // Determine approval/rejection details
          let approvedBy = null;
          let approvedOn = null;
          let rejectedBy = null;
          let rejectedOn = null;
          let remark = null;

          if (latestApproval) {
            const actionBy =
              latestApproval.actionBy ||
              latestApproval.approverUserId ||
              latestApproval.userId;
            const actionByName = latestApproval.actionByUserName || '';
            const actionDateTime = latestApproval.actionDateTime;

            // Format as "Name [UserID]" or just "UserID" if name not available
            const displayName = actionByName
              ? `${actionByName} [${actionBy}]`
              : actionBy;

            if (latestApproval.action === 'APPROVED') {
              approvedBy = displayName;
              approvedOn = DateUtils.formatDate(actionDateTime);
            } else if (latestApproval.action === 'REJECTED') {
              rejectedBy = displayName;
              rejectedOn = DateUtils.formatDate(actionDateTime);
              remark =
                latestApproval.remarks ||
                latestApproval.reason ||
                'Incomplete Information';
            }
          }

          // Parse username from concernedUserDetails if available
          const fullName = concernedUser.username || '';
          const nameParts = fullName.split(' ');
          const parsedFirstName = nameParts[0] || '';
          const parsedLastName =
            nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
          const parsedMiddleName =
            nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

          return {
            // Use concernedUserDetails.userId for the actual user ID (e.g., CU007)
            id: concernedUser.userId || user.userId || '-',
            workflowId: workflow.workflow_id, // Store workflow_id separately
            actualUserId: concernedUser.userId || user.userId, // Store actual userId
            // Use concernedUserDetails.username if user details are not available
            firstName: user.firstName || parsedFirstName,
            middleName: user.middleName || parsedMiddleName,
            lastName: user.lastName || parsedLastName,
            emailId: user.email || '',
            mobileNumber: user.mobile || '',
            countryCode: user.countryCode || '',
            citizenship: user.citizenship || '',
            ckycNumber: user.ckycNumber || '',
            title: user.title || '',
            designation: user.designation || '',
            proofOfIdentity: user.proofOfIdentity || '',
            proofOfIdentityNumber: user.proofOfIdentityNumber || '',
            dob: user.dateOfBirth || '',
            gender: user.gender || '',
            employeeCode: user.employeeCode || '',
            functionalityMapped: user.functionalityMapped || null,
            // Use concernedUserDetails.userType if user.role is not available
            role: user.role || concernedUser.userType || '',
            authServerUserId: '',
            status: workflow.status || 'PENDING',
            operationalStatus: workflow.status || 'PENDING',
            workflowStatus: formatWorkflowType(workflow.workflow_type || ''),
            suspendTillDate: null,
            address: workflow.payload?.userDetails?.address || ({} as Address),
            approvalMasterWorkflow: [],
            // Use initiatorDetails.actionBy for submitted by user ID
            createdBy: initiator.actionBy || initiator.userId || null,
            // Use initiatorDetails.actionByUserName for submitted by name
            initiatorName:
              initiator.actionByUserName ||
              initiator.name ||
              initiator.userName ||
              null,
            updatedBy: null,
            modifiedBy: null,
            // Use initiatorDetails.actionDateTime for submitted on
            createdDate: initiator.actionDateTime || workflow.created_at || '',
            updatedDate: workflow.updated_at || '',
            // Add fields for StatusScreen - use extracted approval/rejection details
            rejectedBy: rejectedBy || undefined,
            rejectedOn: rejectedOn || undefined,
            remark: remark || undefined,
            approvedBy: approvedBy || undefined,
            approvedOn: approvedOn || undefined,
          } as any;
        }
      );

      return {
        users,
        totalPages: data?.data?.totalPages || 0,
        totalUsers: data?.data?.totalElements || 0,
      };
    } catch (error: any) {
      console.error('Error fetching track status:', error);
      return rejectWithValue({
        errorCode: error?.response?.data?.errorCode || 'FETCH_ERROR',
        errorMessage:
          error?.response?.data?.errorMessage ||
          'Failed to fetch track status users',
      });
    }
  }
);

export const fetchUsers = createAsyncThunk<
  { users: SubUser[]; totalPages: number; totalUsers: number }, // return type
  {
    page: number;
    size: number;
    searchQuery: string;
    sortBy?: string;
    search?: string;
    status?: string;
    role?: string;
    order?: string;
    userId?: string; // Add userId filter for fetching specific user
  }, // arg type
  { rejectValue: SubUserError; state: RootState }
>(
  'subUser/fetchUsers',
  async (
    { page, size, sortBy, status, search, role, order, userId },
    { rejectWithValue }
  ) => {
    try {
      // Build filters object for the new API
      const filters: Record<string, any> = {};

      // Add userId filter (for fetching specific user)
      if (userId && userId.trim() !== '') {
        filters.userId = userId.trim();
      }

      // Add search query filter (email search)
      // if (searchQuery && searchQuery.trim() !== '') {
      //   filters.email = searchQuery.trim();
      // }

      // Add role filter
      if (role && role !== '' && role !== 'ALL') {
        filters.roleType = role;
      }

      // Add status filter
      if (status && status !== '' && status !== 'ALL') {
        filters.operationalStatus = statusMapped[status];
      }

      // Build request payload with new structure
      // Always send the filters object, even if empty (API expects it)
      const requestBody = [
        {
          operation: 'AND',
          filters: filters,
        },
      ];

      // Build URL with pagination and sorting
      // let reqUrl = `${API_ENDPOINTS.createNewUser_adminSubUser_management}/getAll?page=${page}&size=${size}`;
      let reqUrl = `${API_ENDPOINTS.createNewUser_adminSubUser_management}/fetch-all?page=${page}&size=${size}`;
      if (sortBy && order) {
        reqUrl = reqUrl + `&sortBy=${sortBy}&order=${order}`;
      }
      if (search && search.trim() !== '') {
        reqUrl = reqUrl + `&search=${encodeURIComponent(search.trim())}`;
      }
      // Send the request - interceptor will handle array payloads correctly
      const response = await Secured.post(reqUrl, requestBody);

      const data = response.data;

      // Map the new API response structure to SubUser format
      const users: SubUser[] = (data?.data?.content || []).map((item: any) => ({
        id: item.userId,
        firstName: item.firstName,
        middleName: item.middleName || '',
        lastName: item.lastName,
        emailId: item.email,
        mobileNumber: item.mobile,
        countryCode: item.countryCode,
        citizenship: item.citizenship,
        ckycNumber: item.ckycNumber,
        title: item.title,
        designation: item.designation,
        gender: item.gender,
        dob: item.dateOfBirth,
        proofOfIdentity: item.proofOfIdentity,
        proofOfIdentityNumber: item.proofOfIdentityNumber,
        employeeCode: item.employeeCode,
        role: item.roleType,
        operationalStatus: item.operationalStatus,
        workflowStatus: item.workflowStatus,
        createdBy: item.createdBy,
        modifiedBy: item.modifiedBy,
        createdDate: item.createdDate,
        updatedDate: item.updatedDate,
        status: item.operationalStatus,
        functionalityMapped: item.functionalityMapped || {}, // Add functionality mapping
        address: {
          line1: item.line1 || '',
          line2: item.line2 || '',
          line3: item.line3 || '',
          countryCode: item.addressCountryCode || '',
          state: item.state || '',
          district: item.district || '',
          city: item.city || '',
          pincode: item.pincode || '',
        },
      }));

      return {
        users,
        totalPages: data?.data?.totalPages ?? 0,
        totalUsers: data?.data?.totalElements ?? users.length,
      };
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.data) {
        return rejectWithValue({
          errorCode: error.response.data.errorCode || 'FETCH_USERS_ERROR',
          errorMessage:
            error.response.data.errorMessage || 'Failed to fetch users',
        });
      }
      return rejectWithValue({
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'Network request failed',
      });
    }
  }
);

// Slice
const subUserSlice = createSlice({
  name: 'subUser',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.statusFilter = action.payload;
      state.filters.currentPage = 1; // Reset to first page when filter changes
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.currentPage = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<SubUser | null>) => {
      state.selectedUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredUsers = state.users;
    },
    // Client-side filtering
    applyFilters: (state) => {
      let filtered = [...state.users];

      // Apply search filter
      if (state.filters.searchQuery.trim()) {
        const query = state.filters.searchQuery.toLowerCase().trim();
        filtered = filtered.filter((user) => {
          const fullName =
            `${user.firstName} ${user.middleName} ${user.lastName}`.toLowerCase();
          return (
            fullName.includes(query) ||
            user.emailId.toLowerCase().includes(query) ||
            user.employeeCode.toLowerCase().includes(query) ||
            user.ckycNumber.includes(query)
          );
        });
      }

      // Apply status filter
      if (state.filters.statusFilter && state.filters.statusFilter !== 'ALL') {
        // Map display statuses to API statuses
        const statusMap: Record<string, string> = {
          Approved: 'ACTIVE',
          Pending: 'PENDING',
          Rejected: 'REJECTED',
          Suspended: 'SUSPENDED',
          Inactive: 'INACTIVE',
        };

        const apiStatus =
          statusMap[state.filters.statusFilter] || state.filters.statusFilter;
        filtered = filtered.filter((user) => user.status === apiStatus);
      }

      state.filteredUsers = filtered;
      state.totalUsers = filtered.length;

      // Reset to first page if current page is out of bounds
      const totalPages = Math.ceil(filtered.length / state.filters.pageSize);
      if (state.filters.currentPage > totalPages && totalPages > 0) {
        state.filters.currentPage = 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Track Status Users
      .addCase(fetchTrackStatusUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackStatusUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.filteredUsers = action.payload.users;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchTrackStatusUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as SubUserError;
        state.users = [];
        state.filteredUsers = [];
        state.totalUsers = 0;
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(fetchUsers.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.users = action.payload;
      //   state.filteredUsers = action.payload;
      //   state.totalUsers = action.payload.;
      //   state.error = null;
      // })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.filteredUsers = action.payload.users;
        state.totalUsers = action.payload.totalUsers;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as SubUserError;
        state.users = [];
        state.filteredUsers = [];
        state.totalUsers = 0;
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setSelectedUser,
  clearError,
  resetFilters,
  applyFilters,
} = subUserSlice.actions;

export default subUserSlice.reducer;
