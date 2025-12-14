import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../redux/store';
import { post } from '../../../../services/CKYCAdmin/api';
import { API_ENDPOINTS } from 'Constant';

/*
  Slice: ipWhitelistingTrackStatus
  Purpose: Fetch & store IP Whitelisting Track Status workflow pending requests
*/

// -------------------- Types --------------------
export interface TrackStatusData {
  id: number;
  reName: string;
  fiCode: string;
  ipAddress: string;
  whitelistedFor: string;
  validFrom: string;
  validTill: string;
  status: string;
  remark: string;
  statusUpdatedOn: string;
  statusUpdatedBy: string;
}

export interface WorkflowItem {
  workflow_id: string;
  workflow_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  reName?: string;
  fiCode?: string;
  ipAddress?: string;
  whitelistedFor?: string;
  validFrom?: string;
  validTill?: string;
  statusUpdatedOn?: string;
  statusUpdatedBy?: string;
  payload?: {
    initiatorDetails?: {
      userId?: string;
    };
    ipWhitelisting?: {
      ipAddress?: string;
      ipWhitelistedFor?: string;
      validFrom?: string;
      validTill?: string;
      reason?: string;
      status?: string;
      blockedReason?: string;
    };
    reportingEntityDetails?: {
      reId?: string;
      fiCode?: string;
      reName?: string;
    };
    remark?: string;
  };
  meta_data?: {
    userId?: string;
    reId?: string;
    initiatedBy?: string;
  };
}

export interface TrackStatusPage {
  content: WorkflowItem[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FetchTrackStatusParams {
  workflowType:
    | 'IP_WHITELISTING_BLOCKED_IP_ADDRESS'
    | 'IP_WHITELISTING_UNBLOCKED_IP_ADDRESS';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  ipAddress?: string;
  reId?: string;
}

export interface TrackStatusState {
  data: TrackStatusPage | null;
  loading: boolean;
  error: string | null;
  lastParams?: FetchTrackStatusParams | null;
  lastFetchedAt?: string | null;
}

// -------------------- Initial State --------------------
const initialState: TrackStatusState = {
  data: null,
  loading: false,
  error: null,
  lastParams: null,
  lastFetchedAt: null,
};

// -------------------- Thunk --------------------
export const fetchTrackStatus = createAsyncThunk<
  TrackStatusPage,
  FetchTrackStatusParams,
  { state: RootState; rejectValue: string }
>('ipWhitelistingTrackStatus/fetch', async (params, thunkAPI) => {
  try {
    const {
      workflowType,
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortDesc = true,
      ipAddress,
      reId,
    } = params || {};

    interface RequestBody {
      filters: Array<{
        operation: string;
        filters: Record<string, unknown>;
      }>;
      page: string;
      pageSize: string;
      sortBy: string;
      sortDesc: boolean;
    }

    const filters: Record<string, unknown> = {
      workflow_type: workflowType,
    };

    if (reId) {
      filters.reId = reId;
    }

    if (ipAddress) {
      filters.ipAddress = ipAddress;
    }

    const requestBody: RequestBody = {
      filters: [
        {
          operation: 'AND',
          filters,
        },
      ],
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortDesc,
    };

    const url = API_ENDPOINTS.IP_WHITELISTING_TRACK_STATUS;

    const token = (thunkAPI.getState() as RootState).auth?.authToken;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await post<ApiResponse<TrackStatusPage>>(
      url,
      requestBody,
      config
    );
    console.log('Response in fetchTrackStatus: ', response);

    if (!response?.data?.data) {
      return thunkAPI.rejectWithValue('Unexpected API response');
    }

    return response.data.data;
  } catch (err: unknown) {
    interface ErrorResponse {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    }
    const error = err as ErrorResponse;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch track status data';
    return thunkAPI.rejectWithValue(String(message));
  }
});

// -------------------- Slice --------------------
const ipWhitelistingTrackStatusSlice = createSlice({
  name: 'ipWhitelistingTrackStatus',
  initialState,
  reducers: {
    setLastParams(state, action: PayloadAction<FetchTrackStatusParams | null>) {
      state.lastParams = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetTrackStatusState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackStatus.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastParams = action.meta.arg ?? null;
      })
      .addCase(
        fetchTrackStatus.fulfilled,
        (state, action: PayloadAction<TrackStatusPage>) => {
          state.loading = false;
          state.data = action.payload;
          state.error = null;
          state.lastFetchedAt = new Date().toISOString();
        }
      )
      .addCase(fetchTrackStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error?.message ??
          'Failed to fetch track status data';
      });
  },
});

// -------------------- Exports --------------------
export const { setLastParams, clearError, resetTrackStatusState } =
  ipWhitelistingTrackStatusSlice.actions;

export const selectTrackStatusState = (state: RootState) =>
  state.ipWhitelistingTrackStatus;
export const selectTrackStatusData = (state: RootState) =>
  state.ipWhitelistingTrackStatus.data;
export const selectTrackStatusLoading = (state: RootState) =>
  state.ipWhitelistingTrackStatus.loading;
export const selectTrackStatusError = (state: RootState) =>
  state.ipWhitelistingTrackStatus.error;

export default ipWhitelistingTrackStatusSlice.reducer;
