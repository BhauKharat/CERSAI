/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../redux/store';
import { get } from '../../../../services/CKYCAdmin/api';
import { API_ENDPOINTS } from 'Constant';

/*
  Slice: ipWhitelisting
  Purpose: Fetch & store IP Whitelisting list from CKYC Admin API
*/

// -------------------- Types --------------------
export interface WhitelistedIPData {
  id: string;
  srNo: number;
  reName: string;
  fiCode: string;
  ipAddress: string;
  ipWhitelistedFor: string;
  validFrom: string;
  validTill: string;
  lastUpdatedOn: string;
  lastUpdatedBy: string;
  status: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ApiSortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface IPWhitelistingPage {
  content: WhitelistedIPData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FetchIPWhitelistingParams {
  page?: number;
  size?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
  searchText?: string;
  reName?: string;
  reId?: string;
  status?: string;
}

export interface IPWhitelistingState {
  data: IPWhitelistingPage | null;
  loading: boolean;
  error: string | null;
  lastParams?: FetchIPWhitelistingParams | null;
  lastFetchedAt?: string | null;
}

// -------------------- Initial State --------------------
const initialState: IPWhitelistingState = {
  data: null,
  loading: false,
  error: null,
  lastParams: null,
  lastFetchedAt: null,
};

// -------------------- Thunk --------------------
export const fetchIPWhitelisting = createAsyncThunk<
  IPWhitelistingPage,
  FetchIPWhitelistingParams,
  { state: RootState; rejectValue: string }
>('ipWhitelisting/fetch', async (params, thunkAPI) => {
  try {
    const {
      page = 0,
      size = 10,
      sortField = 'created_at',
      sortDirection = 'desc',
      searchQuery,
      searchText,
      reName,
      reId,
      status,
    } = params || {};

    const qs = new URLSearchParams();
    qs.append('page', String(page));
    qs.append('size', String(size));
    qs.append('sortField', sortField);
    qs.append('sortDirection', sortDirection);

    if (searchQuery) qs.append('searchQuery', searchQuery);
    if (searchText) qs.append('searchText', searchText);
    if (reName) qs.append('reName', reName);
    if (reId) qs.append('reId', reId);
    if (status) qs.append('status', status);

    const url = `${API_ENDPOINTS.IP_WHITELISTING}?${qs.toString()}`;

    const token = (thunkAPI.getState() as RootState).auth?.authToken;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await get<ApiResponse<IPWhitelistingPage>>(url, config);
    console.log('Response in fetchIPWhitelisting: ', response);
    if (!response?.data?.data) {
      return thunkAPI.rejectWithValue('Unexpected API response');
    }

    return response.data.data;
  } catch (err: unknown) {
    const message =
      (err as any)?.response?.data?.message ||
      (err as any)?.message ||
      'Failed to fetch IP whitelisting data';
    return thunkAPI.rejectWithValue(String(message));
  }
});

// -------------------- Slice --------------------
const ipWhitelistingSlice = createSlice({
  name: 'ipWhitelisting',
  initialState,
  reducers: {
    setLastParams(
      state,
      action: PayloadAction<FetchIPWhitelistingParams | null>
    ) {
      state.lastParams = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetIPWhitelistingState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIPWhitelisting.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastParams = action.meta.arg ?? null;
      })
      .addCase(
        fetchIPWhitelisting.fulfilled,
        (state, action: PayloadAction<IPWhitelistingPage>) => {
          state.loading = false;
          state.data = action.payload;
          state.error = null;
          state.lastFetchedAt = new Date().toISOString();
        }
      )
      .addCase(fetchIPWhitelisting.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error?.message ??
          'Failed to fetch IP whitelisting data';
      });
  },
});

// -------------------- Exports --------------------
export const { setLastParams, clearError, resetIPWhitelistingState } =
  ipWhitelistingSlice.actions;

export const selectIPWhitelistingState = (state: RootState) =>
  state.ipWhitelistingAdmin;
export const selectIPWhitelistingData = (state: RootState) =>
  state.ipWhitelistingAdmin.data;
export const selectIPWhitelistingLoading = (state: RootState) =>
  state.ipWhitelistingAdmin.loading;
export const selectIPWhitelistingError = (state: RootState) =>
  state.ipWhitelistingAdmin.error;

export default ipWhitelistingSlice.reducer;
