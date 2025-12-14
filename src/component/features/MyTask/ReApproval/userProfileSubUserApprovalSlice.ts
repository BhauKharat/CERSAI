/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  UserProfileSubUserApprovalData,
  UserProfileSubUserApprovalResponse,
  UserProfileSubUserApprovalPayload,
} from './userProfileSubUserApprovalTypes';
import { get } from '../../../../services/CKYCAdmin/api';

const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;

interface UserProfileSubUserApprovalState {
  data: UserProfileSubUserApprovalData[];
  loading: boolean;
  error: string | null;
}

const initialState: UserProfileSubUserApprovalState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk to fetch user profile sub user approval list
export const fetchUserProfileSubUserApprovalList = createAsyncThunk<
  UserProfileSubUserApprovalData[],
  UserProfileSubUserApprovalPayload,
  { rejectValue: string }
>(
  'userProfileSubUserApproval/fetchList',
  async (payload, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL_RE}/api/v1/user-profile-workflows/pending?approverId=${payload.approverId}`;
      const response = await get<UserProfileSubUserApprovalResponse>(url);

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message ||
            'Failed to fetch user profile sub user approval list'
        );
      }

      return response.data.data.pendingApprovals;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch user profile sub user approval list'
      );
    }
  }
);

const userProfileSubUserApprovalSlice = createSlice({
  name: 'userProfileSubUserApproval',
  initialState,
  reducers: {
    clearUserProfileSubUserApprovalList: (state) => {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfileSubUserApprovalList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfileSubUserApprovalList.fulfilled,
        (state, action) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        fetchUserProfileSubUserApprovalList.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? 'Unknown error';
        }
      );
  },
});

export const { clearUserProfileSubUserApprovalList } =
  userProfileSubUserApprovalSlice.actions;
export default userProfileSubUserApprovalSlice.reducer;
