import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../Constant';
import { Secured } from '../../../../utils/HelperFunctions/api/index';

export interface UserDetail {
  userId: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  email?: string;
  citizenship?: string;
  ckycNumber?: string;
  countryCode?: string;
  mobile?: string;
  proofOfIdentity?: string;
  proofOfIdentityNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  employeeCode?: string;
  operationalStatus?: string;
  workflowStatus?: string;
  roleType?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  addressCountryCode?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  functionalityMapped?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface SubUser {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: string;
  emailId: string;
  mobileNumber: string;
  status: string;
  createdDate: string;
  createdBy: string;
  userName: string;
}

export interface WorkflowFetchPayload {
  filters: {
    operation: string;
    filters: {
      workflow_type: string | string[];
    };
  }[];
  page: number;
  pageSize: number;
  sortBy: string;
  sortDesc: boolean;
  search?: string;
}

export interface WorkflowPayloadUser {
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  [key: string]: unknown;
}

export interface WorkflowPayloadAddress {
  city: string;
  line1: string;
  [key: string]: unknown;
}

export interface WorkflowPayloadInitiator {
  userId: string;
  [key: string]: unknown;
}

export interface WorkflowPayload {
  userDetails?: {
    user: WorkflowPayloadUser;
    address: WorkflowPayloadAddress;
    remarks?: string;
    [key: string]: unknown;
  };
  initiatorDetails: WorkflowPayloadInitiator;
  [key: string]: unknown;
}

export interface WorkflowMetaData {
  email?: string;
  mobile?: string;
  userName?: string;
  userRole?: string;
  userId?: string;
  role?: string;
  ckycNumber?: string;
  lastActionBy?: string;
  lastActionOn?: string;
  [key: string]: unknown;
}

export interface WorkflowItem {
  workflow_id: string;
  workflow_type: string;
  initiator_service: string;
  status: string;
  current_step: string;
  payload: WorkflowPayload;
  created_at: string;
  updated_at: string;
  meta_data?: WorkflowMetaData;
  [key: string]: unknown;
}

export interface WorkflowApiResponse {
  content: WorkflowItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface WorkflowActionPayload {
  workflowId: string;
  action: 'APPROVE' | 'REJECT';
  reason: string;
  remarks: string;
}

export interface ApiError {
  errorCode?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

interface SubUserState {
  currentPageData: WorkflowItem[];
  loading: boolean;
  actionLoading: boolean;
  detailLoading: boolean;
  error: ApiError | string | null;
  filters: {
    currentPage: number;
    pageSize: number;
    searchQuery: string;
    statusFilter: string;
    [key: string]: unknown;
  };
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  selectedUser: SubUser | null;
  detailedUser: UserDetail | null;
}

const initialState: SubUserState = {
  currentPageData: [],
  loading: false,
  actionLoading: false,
  detailLoading: false,
  error: null,
  filters: {
    currentPage: 0,
    pageSize: 10,
    searchQuery: '',
    statusFilter: 'PENDING',
  },
  totalUsers: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  selectedUser: null,
  detailedUser: null,
};

export const fetchUsers = createAsyncThunk<
  WorkflowApiResponse,
  WorkflowFetchPayload,
  { rejectValue: ApiError }
>('subUser/fetchUsers', async (payload, { rejectWithValue }) => {
  const endpoint = `${API_ENDPOINTS.get_pending_user}/pending`;
  try {
    const response = await Secured.post(endpoint, payload);
    if (response.status && response.status >= 400) {
      return rejectWithValue(response.data as ApiError);
    }
    const data = response.data;
    if (data && data.data) {
      return data.data as WorkflowApiResponse;
    }
    return rejectWithValue({
      errorCode: 'API_FORMAT_ERROR',
      errorMessage: 'Unexpected API response structure.',
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: ApiError } };
    return rejectWithValue(
      err.response?.data || {
        errorCode: 'API_CALL_FAILED',
        errorMessage: 'Workflow service call failed.',
      }
    );
  }
});

export const fetchUserDetailsById = createAsyncThunk<
  UserDetail,
  string,
  { rejectValue: ApiError }
>('subUser/fetchUserDetailsById', async (userId, { rejectWithValue }) => {
  const endpoint = `${API_ENDPOINTS.get_all_user}?page=0&size=1`;
  const payload = [{ operation: 'AND', filters: { userId: userId } }];
  try {
    const response = await Secured.post(endpoint, payload);
    const data = response?.data?.data;
    if (data && data.content && data.content.length > 0) {
      return data.content[0] as UserDetail;
    }
    return rejectWithValue({
      errorCode: 'USER_NOT_FOUND',
      errorMessage: 'User details not found for the given ID.',
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: ApiError } };
    return rejectWithValue(
      err.response?.data || {
        errorCode: 'API_CALL_FAILED',
        errorMessage: 'Failed to fetch user details.',
      }
    );
  }
});

export const approveOrRejectWorkflow = createAsyncThunk<
  { workflowId: string },
  WorkflowActionPayload,
  { rejectValue: ApiError }
>('subUser/approveOrRejectWorkflow', async (payload, { rejectWithValue }) => {
  try {
    const endpoint = `${API_ENDPOINTS.approval_reject_user}/approval`;
    const response = await Secured.post(endpoint, payload);
    if (response.data) {
      return { workflowId: payload.workflowId };
    }
    return rejectWithValue({
      errorMessage: 'API did not return a success message.',
    });
  } catch (error: unknown) {
    const err = error as { response?: { data?: ApiError } };
    console.error('Error in workflow action:', err);
    return rejectWithValue(
      err.response?.data || {
        errorMessage: `Failed to ${payload.action.toLowerCase()} request.`,
      }
    );
  }
});

export const fetchTrackStatusUsers = createAsyncThunk<
  WorkflowApiResponse,
  { page: number; size: number },
  { rejectValue: ApiError }
>('subUser/fetchTrackStatusUsers', async (params) => {
  return {
    content: [],
    page: params.page - 1,
    size: params.size,
    totalElements: 0,
    totalPages: 0,
    last: true,
    currentPage: params.page - 1,
    hasNext: false,
    hasPrevious: false,
  };
});

const dashboardSubUserSlice = createSlice({
  name: 'subUser',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDetailedUser: (state) => {
      state.detailedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const apiData = action.payload;
        state.currentPageData = apiData.content;
        state.totalUsers = apiData.totalElements;
        state.totalPages = apiData.totalPages;
        state.hasNextPage = apiData.hasNext;
        state.hasPrevPage = apiData.hasPrevious;
        state.filters.currentPage = apiData.currentPage + 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.errorMessage ||
          action.error.message ||
          'Failed to fetch data';
        state.currentPageData = [];
        state.totalUsers = 0;
      })
      // approveOrRejectWorkflow
      .addCase(approveOrRejectWorkflow.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(approveOrRejectWorkflow.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentPageData = state.currentPageData.filter(
          (item) => item.workflow_id !== action.payload.workflowId
        );
        state.totalUsers = Math.max(0, state.totalUsers - 1);
      })
      .addCase(approveOrRejectWorkflow.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || { errorMessage: 'Action failed' };
      })
      // fetchTrackStatusUsers
      .addCase(fetchTrackStatusUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrackStatusUsers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchTrackStatusUsers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserDetailsById.pending, (state) => {
        state.detailLoading = true;
        state.detailedUser = null;
        state.error = null;
      })
      .addCase(fetchUserDetailsById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailedUser = action.payload;
      })
      .addCase(fetchUserDetailsById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || {
          errorMessage: 'Failed to fetch details',
        };
      });
  },
});

export const { setCurrentPage, clearError, clearDetailedUser } =
  dashboardSubUserSlice.actions;

export default dashboardSubUserSlice.reducer;
