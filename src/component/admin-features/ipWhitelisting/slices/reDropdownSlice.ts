import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../redux/store';
import { post } from '../../../../services/CKYCAdmin/api';
import { API_ENDPOINTS } from 'Constant';

/*
  Slice: reDropdown
  Purpose: Fetch & store Reporting Entity list for dropdown with pagination and search
*/

// -------------------- Types --------------------
export interface ReEntity {
  id: string;
  name: string;
  fiCode: string;
}

export interface ReDropdownPage {
  content: ReEntity[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FetchReDropdownParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  search?: string;
}

export interface ReDropdownState {
  data: ReEntity[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
}

// -------------------- Initial State --------------------
const initialState: ReDropdownState = {
  data: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
  searchTerm: '',
};

// -------------------- Thunk --------------------
export const fetchReDropdown = createAsyncThunk<
  { data: ReDropdownPage; append: boolean },
  FetchReDropdownParams & { append?: boolean },
  { state: RootState; rejectValue: string }
>('reDropdown/fetch', async (params, thunkAPI) => {
  try {
    const {
      page = 0,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDesc = true,
      search = '',
      append = false,
    } = params || {};

    const requestBody = {
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortDesc,
      search: search || '',
    };

    const url = API_ENDPOINTS.IP_WHITELISTING_RE_LIST;

    const token = (thunkAPI.getState() as RootState).auth?.authToken;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await post<ApiResponse<ReDropdownPage>>(
      url,
      requestBody,
      config
    );
    console.log('Response in fetchReDropdown: ', response);

    if (!response?.data?.data) {
      return thunkAPI.rejectWithValue('Unexpected API response');
    }

    return { data: response.data.data, append };
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
      'Failed to fetch RE dropdown data';
    return thunkAPI.rejectWithValue(String(message));
  }
});

// -------------------- Slice --------------------
const reDropdownSlice = createSlice({
  name: 'reDropdown',
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
      state.currentPage = 0;
      state.data = [];
      state.hasMore = true;
    },
    clearReDropdown(state) {
      state.data = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.searchTerm = '';
      state.error = null;
    },
    resetReDropdownState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReDropdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchReDropdown.fulfilled,
        (
          state,
          action: PayloadAction<{ data: ReDropdownPage; append: boolean }>
        ) => {
          state.loading = false;
          const { data, append } = action.payload;

          if (append) {
            state.data = [...state.data, ...data.content];
          } else {
            state.data = data.content;
          }

          state.currentPage = data.number;
          state.totalPages = data.totalPages;
          state.hasMore = !data.last;
          state.error = null;
        }
      )
      .addCase(fetchReDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error?.message ??
          'Failed to fetch RE dropdown data';
      });
  },
});

// -------------------- Exports --------------------
export const { setSearchTerm, clearReDropdown, resetReDropdownState } =
  reDropdownSlice.actions;

export const selectReDropdownState = (state: RootState) => state.reDropdown;
export const selectReDropdownData = (state: RootState) => state.reDropdown.data;
export const selectReDropdownLoading = (state: RootState) =>
  state.reDropdown.loading;
export const selectReDropdownError = (state: RootState) =>
  state.reDropdown.error;
export const selectReDropdownHasMore = (state: RootState) =>
  state.reDropdown.hasMore;

export default reDropdownSlice.reducer;
