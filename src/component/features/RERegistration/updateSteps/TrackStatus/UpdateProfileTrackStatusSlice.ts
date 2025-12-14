/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';

// Types
export interface Application {
  srNo: number;
  workflowId: string;
  profileType: string;
  status: string;
  displayStatus: string;
  submittedOn: string;
  submittedBy: string;
  acknowledgementNo: string;
}

export interface TrackStatusResponse {
  applications: Application[];
}

export interface TrackStatusState {
  data: TrackStatusResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrackStatusState = {
  data: null,
  loading: false,
  error: null,
};

// Fetch parameters interface
export interface FetchTrackStatusParams {
  userId: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: boolean; // true for ascending, false for descending
  searchTerm?: string; // Search term for content search
}

// Async thunk for fetching track status by userId
export const fetchTrackStatusByUserId = createAsyncThunk<
  TrackStatusResponse,
  FetchTrackStatusParams
>(
  'updateProfileTrackStatus/fetchByUserId',
  async (
    {
      userId,
      page = 0,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = false,
      searchTerm = '',
    },
    { rejectWithValue }
  ) => {
    try {
      let url = `${API_ENDPOINTS.track_status_update(userId)}&page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      // Add searchTerm if provided
      if (searchTerm && searchTerm.trim()) {
        url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
      }

      console.log('🚀 Calling API:', url);

      const response = await Secured.get(url);

      console.log('✅ Track Status API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error in fetchTrackStatusByUserId:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch track status'
      );
    }
  }
);

const trackStatusSlice = createSlice({
  name: 'updateProfileTrackStatus',
  initialState,
  reducers: {
    clearTrackStatus: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackStatusByUserId.pending, (state) => {
        console.log('⏳ fetchTrackStatusByUserId.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTrackStatusByUserId.fulfilled,
        (state, action: PayloadAction<TrackStatusResponse>) => {
          console.log('✅ fetchTrackStatusByUserId.fulfilled - Payload:', {
            hasApplications: !!action.payload?.applications,
            applicationsLength: action.payload?.applications?.length || 0,
            data: action.payload,
          });

          state.loading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchTrackStatusByUserId.rejected, (state, action) => {
        console.error('❌ fetchTrackStatusByUserId.rejected:', {
          error: action.error,
          payload: action.payload,
          meta: action.meta,
        });
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch track status';
      });
  },
});

export const { clearTrackStatus } = trackStatusSlice.actions;

// Selectors
export const selectTrackStatusData = (state: {
  updateProfileTrackStatus: TrackStatusState;
}) => state.updateProfileTrackStatus.data;
export const selectTrackStatusLoading = (state: {
  updateProfileTrackStatus: TrackStatusState;
}) => state.updateProfileTrackStatus.loading;
export const selectTrackStatusError = (state: {
  updateProfileTrackStatus: TrackStatusState;
}) => state.updateProfileTrackStatus.error;

export default trackStatusSlice.reducer;
