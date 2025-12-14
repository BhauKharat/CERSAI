import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  UserState,
  SubUserUser,
  SubUserUserErrorResponse,
  SubUserUserSuccessResponse,
} from '../types/User';

// Initial state
const initialState: UserState = {
  loading: false,
  regions: [],
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  error: null,
};

// Types for the new API request
interface WorkflowFilter {
  operation: string;
  filters: {
    workflow_type?: string[];
    status?: string[];
    role?: string;
    region?: string;
    branch?: string;
  };
}

interface FetchUserRequestPayload {
  filters: WorkflowFilter[];
  page: number;
  pageSize: number;
  isPendingRequestAPI: boolean;
  sortBy: string;
  sortDesc: boolean;
  search?: string;
}

// Types for the API response
interface ApiUserWorkflowItem {
  workflow_id: string;
  workflow_type: string;
  status: string;
  meta_data?: {
    role?: string;
    userId?: string;
    username?: string;
    initiatedBy?: string;
    lastActionOn?: string;
    region?: string;
    regionName?: string;
    regionCode?: string;
    branch?: string;
    branchName?: string;
    branchCode?: string;
    [key: string]: unknown; // Allow additional properties
  };
  payload?: {
    userDetails?: {
      role?: string;
      regionCode?: string;
      regionName?: string;
      branchCode?: string;
      branchName?: string;
      [key: string]: unknown;
    };
    concernedUserDetails?: {
      userId?: string;
      userType?: string;
      username?: string;
    };
    initiatorDetails?: {
      actionDateTime?: string;
      actionByUserName?: string;
    };
  };
  created_at?: string;
}

// Async thunk for fetching users with new API
export const fetchUser = createAsyncThunk<
  SubUserUserSuccessResponse['data'],
  {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    workflowType?: string;
    role?: string;
    region?: string;
    branch?: string;
  },
  { rejectValue: string }
>(
  'region/subuser/fetchUser',
  async (
    {
      page = 0,
      size = 10,
      search = '',
      status = 'PENDING',
      workflowType,
      role = '',
      region = '',
      branch = '',
    },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Loading users...'));
    try {
      // Build filters object
      const filters: WorkflowFilter['filters'] = {};

      // Add status if provided and not empty
      if (status && status.trim() !== '') {
        filters.status = [status === 'All' ? 'PENDING' : status];
      }

      // Add workflow_type as array if provided
      if (workflowType) {
        filters.workflow_type = [workflowType];
      }

      // Add role if provided and not empty
      if (role && role.trim() !== '') {
        filters.role = role;
      }

      // Add region if provided and not empty
      if (region && region.trim() !== '') {
        filters.region = region;
      }

      // Add branch if provided and not empty
      if (branch && branch.trim() !== '') {
        filters.branch = branch;
      }

      // Build request payload
      const payload: FetchUserRequestPayload = {
        filters: [
          {
            operation: 'AND',
            filters: filters,
          },
        ],
        page: page, // API uses 0-based page numbering
        pageSize: size,
        isPendingRequestAPI: true,
        sortBy: 'created_at',
        sortDesc: true,
      };

      // Add search if provided
      if (search) {
        payload.search = search;
      }

      const response = await Secured.post(
        API_ENDPOINTS.get_sub_users_workflow_pending_requests,
        payload
      );

      console.log('User API response:', response.data);

      // The new API returns { data: { content: [], ... } }
      const responseData = response.data;

      if (responseData && responseData.data) {
        dispatch(hideLoader());

        // Helper function to map workflow_type to activity
        const mapWorkflowTypeToActivity = (workflowType: string): string => {
          const mapping: Record<string, string> = {
            RE_USER_CREATION: 'Creation',
            RE_USER_MODIFICATION: 'Modification',
            RE_USER_DEACTIVATION: 'De-activation',
            RE_USER_SUSPENSION: 'Suspension',
            RE_USER_SUSPENSION_REVOKE: 'Revoke Suspension',
          };
          return mapping[workflowType] || workflowType;
        };

        // Transform API response items to SubUserUser format
        const transformedContent: SubUserUser[] = (
          responseData.data.content || []
        ).map((item: ApiUserWorkflowItem, index: number) => {
          const metaData = item.meta_data || {};
          const payload = item.payload || {};
          const userDetails = payload.userDetails || {};
          const concernedUserDetails = payload.concernedUserDetails || {};
          const initiatorDetails = payload.initiatorDetails || {};

          return {
            id: index + 1,
            serialNumber: index + 1,
            userId: metaData.userId || concernedUserDetails.userId || '',
            userName: metaData.username || concernedUserDetails.username || '',
            user_type: concernedUserDetails.userType || metaData.role || '',
            regionName:
              (metaData.region as string)?.trim() ||
              (metaData.regionName as string)?.trim() ||
              (userDetails.regionCode as string)?.trim() ||
              '',
            status:
              item.status === 'PENDING'
                ? 'Pending Approval'
                : item.status || 'Pending Approval',
            activity: mapWorkflowTypeToActivity(item.workflow_type || ''),
            workflowId: item.workflow_id || '',
            role: metaData.role || '',
            userType: concernedUserDetails.userType || metaData.role || '',
            region:
              (metaData.region as string)?.trim() ||
              (metaData.regionName as string)?.trim() ||
              (userDetails.regionCode as string)?.trim() ||
              '',
            branch:
              (metaData.branch as string)?.trim() ||
              (metaData.branchName as string)?.trim() ||
              (userDetails.branchCode as string)?.trim() ||
              '',
            branchName:
              (metaData.branch as string)?.trim() ||
              (metaData.branchName as string)?.trim() ||
              (userDetails.branchCode as string)?.trim() ||
              '',
            submittedOn:
              initiatorDetails.actionDateTime ||
              metaData.lastActionOn ||
              item.created_at ||
              '',
            submittedBy:
              initiatorDetails.actionByUserName || metaData.initiatedBy || '',
            originalData: item, // Store original workflow data for prepopulation
          };
        });

        // Transform the response to match the expected structure
        return {
          content: transformedContent,
          activity: '', // Not used at top level
          totalElements: responseData.data.totalElements || 0,
          totalPages: responseData.data.totalPages || 0,
          number: (responseData.data.currentPage || 1) - 1, // Convert 1-based to 0-based
          size: responseData.data.size || size,
          last: responseData.data.last || false,
          first: (responseData.data.currentPage || 1) === 1,
          numberOfElements: transformedContent.length,
          empty: responseData.data.totalElements === 0,
          pageable: {
            pageNumber: (responseData.data.currentPage || 1) - 1,
            pageSize: responseData.data.size || size,
            sort: {
              empty: false,
              unsorted: false,
              sorted: true,
            },
            offset:
              ((responseData.data.currentPage || 1) - 1) *
              (responseData.data.size || size),
            unpaged: false,
            paged: true,
          },
          sort: {
            empty: false,
            unsorted: false,
            sorted: true,
          },
        };
      } else {
        dispatch(hideLoader());
        return rejectWithValue('Invalid response format');
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?:
              | SubUserUserErrorResponse
              | { message?: string; data?: { errorMessage?: string } };
            status?: number;
          };
        };
        const status = axiosError.response?.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            return rejectWithValue(
              (errorData as SubUserUserErrorResponse).data?.errorMessage ||
                (errorData as { message?: string }).message ||
                'Failed to fetch users'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            (errorData as SubUserUserErrorResponse).data?.errorMessage ||
              (errorData as { message?: string }).message ||
              'Failed to fetch users'
          );
        }
      }
      console.log('error:---', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

// Region slice
const subUserUserSlice = createSlice({
  name: 'subUseruser',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegionState: () => {
      return initialState;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state) => {
        // state.loading = false;
        // state.regions = action.payload.content;
        // state.totalPages = action.payload.totalPages;
        // state.totalElements = action.payload.totalElements;
        // state.pageNumber = action.payload.number;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch users';
      });
  },
});

export const { clearError, resetRegionState, setPageNumber } =
  subUserUserSlice.actions;
export default subUserUserSlice.reducer;
