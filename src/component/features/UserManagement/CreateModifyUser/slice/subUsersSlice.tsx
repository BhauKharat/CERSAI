import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  UsersState,
  FetchUsersParams,
  UsersSuccessResponse,
  UsersErrorResponse,
  ApiUser,
  RawApiUser,
} from '../types/users';

// Transform raw API user to ApiUser format
const transformToApiUser = (rawUser: RawApiUser, index: number): ApiUser => {
  const fullName = [
    rawUser.firstName || '',
    rawUser.middleName || '',
    rawUser.lastName || '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    srNo: index + 1,
    userId: rawUser.userId,
    role: rawUser.userType || rawUser.roleType || '',
    username: fullName || '-',
    region: rawUser.region || '-',
    citizenship: rawUser.citizenship || '-',
    status: (rawUser.workflowStatus || 'APPROVED') as
      | 'APPROVED'
      | 'REJECTED'
      | 'SUSPENDED'
      | 'PENDING',
    branch: rawUser.branch || undefined,
    lastUpdatedOn: rawUser.updatedDate || undefined,
    lastUpdatedBy: rawUser.updatedBy || undefined,
    address: undefined,
  };
};

// Async thunk for fetching sub-users
export const fetchSubUsers = createAsyncThunk(
  'subUsers/fetchSubUsers',
  async (params: FetchUsersParams = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Fetching sub-users...'));

      // Build query parameters manually to avoid encoding issues
      const page = params.page || 0;
      const size = params.size || 100;
      const sortBy = 'createdDate,desc';

      // Build URL with search in query params
      let url = `${API_ENDPOINTS.get_sub_users}?page=${page}&size=${size}&sortBy=${sortBy}&filterByReportingEntity=true`;

      // Add search to query params if provided
      if (params.search && params.search.trim() !== '') {
        url += `&search=${encodeURIComponent(params.search.trim())}`;
      }

      // Build payload with filters as an array
      // Only include userType, region, branch, and operationalStatus in filters if they have values
      const filters: {
        userType?: string | string[];
        region?: string;
        branch?: string;
        operationalStatus?: string;
      } = {};

      // Add operationalStatus from params, default to ACTIVE if not provided
      filters.operationalStatus = params.operationalStatus || 'ACTIVE';

      if (params.userType) {
        if (Array.isArray(params.userType)) {
          if (params.userType.length > 0) {
            filters.userType = params.userType;
          }
        } else if (params.userType.trim() !== '') {
          filters.userType = [params.userType];
        }
      }

      if (params.region && params.region.trim() !== '') {
        filters.region = params.region;
      }

      if (params.branch && params.branch.trim() !== '') {
        filters.branch = params.branch;
      }
      const payload: {
        operation: string;
        filters: typeof filters;
      }[] = [
        {
          operation: 'AND',
          filters: filters,
        },
      ];
      const response = await Secured.post(url, payload);
      const responseData = response.data as UsersSuccessResponse;
      const transformedContent = responseData.data.content.map(
        (rawUser, index) => transformToApiUser(rawUser, index)
      );

      dispatch(hideLoader());

      return {
        content: transformedContent,
        totalElements: responseData.data.totalElements,
        totalPages: responseData.data.totalPages,
        currentPage: responseData.data.currentPage,
      };
    } catch (error: unknown) {
      dispatch(hideLoader());
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: UsersErrorResponse; status?: number };
        };
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage || 'Failed to fetch sub-users'
          );
        }

        // Handle other errors
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage || 'Failed to fetch sub-users'
        );
      }
      return rejectWithValue('Network error occurred while fetching sub-users');
    }
  }
);

const initialState: UsersState = {
  data: [],
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
};

const subUsersSlice = createSlice({
  name: 'subUsers',
  initialState,
  reducers: {
    resetState: (state) => {
      state.data = [];
      state.error = null;
      state.totalElements = 0;
      state.totalPages = 0;
      state.currentPage = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubUsers.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchSubUsers.fulfilled, (state, action) => {
        state.data = action.payload.content;
        state.error = null;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchSubUsers.rejected, (state, action) => {
        state.error = action.payload as string;
        state.data = [];
        state.totalElements = 0;
        state.totalPages = 0;
      });
  },
});

export const { resetState, clearError } = subUsersSlice.actions;
export default subUsersSlice.reducer;
