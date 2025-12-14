/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { get } from '../../../../services/CKYCAdmin/api';
import { ENDPOINTS } from '../../../../utils/constants';
import { store } from '../../../../redux/store';
import {
  UserProfileTrackStatusListResponse,
  UserProfileTrackStatusListParams,
  UserProfileTrackStatusDetailResponse,
  UserProfileTrackStatusDetailData,
  UserProfileTrackStatusDetailParams,
  UserProfileTrackStatusState,
} from '../types/userProfileTrackStatusTypes';

// ============================================
// Initial State
// ============================================

const initialState: UserProfileTrackStatusState = {
  // List state
  applications: [],
  pagination: null,
  listLoading: false,
  listError: null,

  // Detail state
  detail: null,
  detailLoading: false,
  detailError: null,
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

/**
 * Fetch user profile update track status list
 */
export const fetchUserProfileTrackStatusList = createAsyncThunk<
  UserProfileTrackStatusListResponse['data'],
  UserProfileTrackStatusListParams,
  { rejectValue: string }
>('userProfileTrackStatus/fetchList', async (params, { rejectWithValue }) => {
  try {
    const config = getAuthConfig();

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('userId', params.userId);

    if (params.status) queryParams.append('status', params.status);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.page !== undefined)
      queryParams.append('page', params.page.toString());
    if (params.pageSize !== undefined)
      queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder !== undefined)
      queryParams.append('sortOrder', String(params.sortOrder));

    const url = `${ENDPOINTS.USER_PROFILE_TRACK_STATUS}?${queryParams.toString()}`;

    const response = await get<UserProfileTrackStatusListResponse>(url, config);

    if (!response.data.success) {
      return rejectWithValue(
        response.data.message || 'Failed to fetch track status list'
      );
    }

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch track status list'
    );
  }
});

/**
 * Fetch user profile update track status detail
 */
export const fetchUserProfileTrackStatusDetail = createAsyncThunk<
  UserProfileTrackStatusDetailData,
  UserProfileTrackStatusDetailParams,
  { rejectValue: string }
>(
  'userProfileTrackStatus/fetchDetail',
  async ({ workflowId, userId }, { rejectWithValue }) => {
    try {
      const config = getAuthConfig();
      const url = ENDPOINTS.getUserProfileTrackStatusDetails(
        workflowId,
        userId
      );

      const response = await get<UserProfileTrackStatusDetailResponse>(
        url,
        config
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch track status detail'
        );
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch track status detail'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const userProfileTrackStatusSlice = createSlice({
  name: 'userProfileTrackStatus',
  initialState,
  reducers: {
    // Reset entire state
    resetUserProfileTrackStatusState: (state) => {
      Object.assign(state, initialState);
    },

    // Clear list
    clearUserProfileTrackStatusList: (state) => {
      state.applications = [];
      state.pagination = null;
      state.listError = null;
      state.listLoading = false;
    },

    // Clear detail
    clearUserProfileTrackStatusDetail: (state) => {
      state.detail = null;
      state.detailError = null;
      state.detailLoading = false;
    },
  },
  extraReducers: (builder) => {
    // -------------------------
    // Fetch Track Status List
    // -------------------------
    builder
      .addCase(fetchUserProfileTrackStatusList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(
        fetchUserProfileTrackStatusList.fulfilled,
        (
          state,
          action: PayloadAction<UserProfileTrackStatusListResponse['data']>
        ) => {
          state.listLoading = false;
          state.applications = action.payload.applications;
          state.pagination = action.payload.pagination;
          state.listError = null;
        }
      )
      .addCase(fetchUserProfileTrackStatusList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || 'Failed to fetch track status list';
        state.applications = [];
        state.pagination = null;
      });

    // -------------------------
    // Fetch Track Status Detail
    // -------------------------
    builder
      .addCase(fetchUserProfileTrackStatusDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(
        fetchUserProfileTrackStatusDetail.fulfilled,
        (state, action: PayloadAction<UserProfileTrackStatusDetailData>) => {
          state.detailLoading = false;
          state.detail = action.payload;
          state.detailError = null;
        }
      )
      .addCase(fetchUserProfileTrackStatusDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload || 'Failed to fetch track status detail';
        state.detail = null;
      });
  },
});

// ============================================
// Exports
// ============================================

export const {
  resetUserProfileTrackStatusState,
  clearUserProfileTrackStatusList,
  clearUserProfileTrackStatusDetail,
} = userProfileTrackStatusSlice.actions;

export default userProfileTrackStatusSlice.reducer;
