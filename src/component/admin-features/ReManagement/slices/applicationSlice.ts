/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { get, post } from '../../../../services/CKYCAdmin/api';
// // import { ENDPOINTS } from '../../../../utils/constants';
// import {
//   ApplicationsResponse,
//   ApplicationsState,
//   ISortBy,
// } from '../types/applicationTypes';
// import { store } from '../../../../redux/store';

// const initialState: ApplicationsState = {
//   data: null,
//   loading: false,
//   error: null,
// };

// export const fetchApplications = createAsyncThunk<
//   ApplicationsResponse,
//   {
//     page?: number;
//     size?: number;
//     searchQuery?: string;
//     fromDate?: string;
//     toDate?: string;
//     status?: string;
//     sortBy?: ISortBy;
//   }
// >(
//   'applications/fetchAll',
//   async (
//     { page = 0, size = 10, searchQuery = '', fromDate, toDate = '', sortBy },
//     { rejectWithValue }
//   ) => {
//     try {
//       const ENDPOINT = `https://fcbbbc038efd.ngrok-free.app/re/api/v1/admin-callback/re/list`;
//       // let url = `${ENDPOINTS.APPLICATIONS}?page=${page}&size=${size}`;
//       let url = `${ENDPOINT}`;
//       if (sortBy) {
//         url += `&sortBy=${sortBy.key}&order=${sortBy.type}`;
//       }

//       const filters = [];

//       filters.push({
//         column: ['reportingEntityName', 'registrationDate', 'pan'],
//         operator: 'ILIKE',
//         value: searchQuery.trim(),
//       });

//       if (fromDate) {
//         filters.push({
//           column: ['registrationDate'],
//           operator: '>',
//           value: fromDate,
//         });
//       }

//       if (toDate) {
//         filters.push({
//           column: ['registrationDate'],
//           operator: '<',
//           value: toDate,
//         });
//       }

//       console.log('Fetching applications from:', url);

//       // Get token from Redux state
//       const state = store.getState() as any;
//       const token = state.auth?.authToken;
//       // Add Authorization header manually if needed
//       const config = token
//         ? {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         : {};

//       console.log('Fetching applications from:', url);
//       const response = await get<{ data: ApplicationsResponse }>(
//         url, // URL
//         // filters, // Data
//         config // Optional config
//       );
//       console.log('API Response:', response.data);
//       return response.data.data; // Return the nested data property
//     } catch (error: any) {
//       console.error('Error in fetchApplications:', error);
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch applications'
//       );
//     }
//   }
// );

// const applicationSlice = createSlice({
//   name: 'applications',
//   initialState,
//   reducers: {
//     // This reducer was moved to requestDetailsSlice for better state management.
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchApplications.pending, (state) => {
//         console.log('fetchApplications.pending');
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(
//         fetchApplications.fulfilled,
//         (state, action: PayloadAction<ApplicationsResponse>) => {
//           console.log('fetchApplications.fulfilled - Payload:', {
//             hasContent: !!action.payload?.content,
//             contentLength: action.payload?.content?.length || 0,
//             firstItem: action.payload?.content?.[0],
//             pagination: {
//               page: action.payload?.page,
//               size: action.payload?.size,
//               totalElements: action.payload?.totalElements,
//               totalPages: action.payload?.totalPages,
//             },
//           });

//           state.loading = false;
//           state.data = action.payload;
//           state.error = null;
//         }
//       )
//       .addCase(fetchApplications.rejected, (state, action) => {
//         console.error('fetchApplications.rejected:', {
//           error: action.error,
//           payload: action.payload,
//           meta: action.meta,
//         });
//         state.loading = false;
//         state.error =
//           (action.payload as string) || 'Failed to fetch applications';
//       });
//   },
// });

// export const { actions } = applicationSlice;

// export default applicationSlice.reducer;

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../redux/store';
import { get } from '../../../../services/CKYCAdmin/api';
import { API_ENDPOINTS } from 'Constant';

/*
  Slice: reportingEntities
  Purpose: Fetch & store Reporting Entities (RE) list from CKYC Admin API
  Notes:
  - Fully typed
  - Uses thunkAPI.getState() to read auth token (no direct store import)
  - Builds query params cleanly and supports both string and structured sort
  - Stores last request params and lastFetchedAt timestamp for better state tracking
*/

// -------------------- Types --------------------
export interface ReportingEntity {
  nameOfInstitution: string;
  regulator?: string | null;
  institutionType?: string | null;
  constitution?: string | null;
  proprietorName?: string | null;
  registrationNo?: string | null;
  panNo?: string | null;
  cinNo?: string | null;
  llpinNo?: string | null;
  gstinNo?: string | null;
  reWebsite?: string | null;
  operationalStatus?: string | null;
  createdAt?: string | null; // ISO timestamp
  fiCode?: string | null;
  // any other fields returned by the API can be added here
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

export interface ReportingEntitiesPage {
  content: ReportingEntity[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number; // current page number
  sort: ApiSortInfo;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type SortParam = string | { key: string; type?: 'asc' | 'desc' };

export interface FetchReportingEntitiesParams {
  name?: string;
  status?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  sort?: SortParam; // e.g. 'createdAt,desc' or { key: 'createdAt', order: 'desc' }
  size?: number; // page size
  page?: number; // page number
  searchQuery?: string;
  panNo?: string;
}

export interface ReportingEntitiesState {
  data: ReportingEntitiesPage | null;
  loading: boolean;
  error: string | null;
  // helpful metadata for UI and debugging
  lastParams?: FetchReportingEntitiesParams | null;
  lastFetchedAt?: string | null;
}

// -------------------- Initial State --------------------
const initialState: ReportingEntitiesState = {
  data: null,
  loading: false,
  error: null,
  lastParams: null,
  lastFetchedAt: null,
};

// -------------------- Helpers --------------------
const buildSortString = (sort?: SortParam): string | undefined => {
  if (!sort) return undefined;
  if (typeof sort === 'string') return sort;
  return `${sort.key},${sort.type ?? 'desc'}`;
};

// -------------------- Thunk --------------------
export const fetchReportingEntities = createAsyncThunk<
  ReportingEntitiesPage,
  FetchReportingEntitiesParams,
  { state: RootState; rejectValue: string }
>('reportingEntities/fetch', async (params, thunkAPI) => {
  try {
    const {
      name,
      status,
      fromDate,
      toDate,
      sort,
      size = 10,
      page = 0,
      panNo,
    } = params || {};

    const qs = new URLSearchParams();
    if (name) qs.append('name', name);
    if (status) qs.append('status', status);
    if (fromDate) qs.append('fromDate', fromDate);
    if (toDate) qs.append('toDate', toDate);
    const sortStr = buildSortString(sort);
    if (sortStr) qs.append('sort', sortStr);

    if (panNo) qs.append('panNo', panNo);
    qs.append('size', String(size));
    qs.append('page', String(page));

    const url = `${API_ENDPOINTS.RE_LIST}?${qs.toString()}`;

    // read token from state (no direct store import)
    const token = (thunkAPI.getState() as RootState).auth?.authToken;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await get<ApiResponse<ReportingEntitiesPage>>(url, config);
    console.log('Response in fetchReportingEntities: ', response);

    // Validate response shape minimally
    if (!response?.data?.data) {
      return thunkAPI.rejectWithValue('Unexpected API response');
    }

    return response.data.data;
  } catch (err: unknown) {
    // Prefer backend-provided message, fall back to generic
    const message =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any)?.response?.data?.message ||
      (err as any)?.message ||
      'Failed to fetch reporting entities';
    return thunkAPI.rejectWithValue(String(message));
  }
});

// -------------------- Slice --------------------
const reportingEntitiesSlice = createSlice({
  name: 'reportingEntities',
  initialState,
  reducers: {
    setLastParams(
      state,
      action: PayloadAction<FetchReportingEntitiesParams | null>
    ) {
      state.lastParams = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetReportingEntitiesState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportingEntities.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastParams = action.meta.arg ?? null;
      })
      .addCase(
        fetchReportingEntities.fulfilled,
        (state, action: PayloadAction<ReportingEntitiesPage>) => {
          state.loading = false;
          state.data = action.payload;
          state.error = null;
          state.lastFetchedAt = new Date().toISOString();
        }
      )
      .addCase(fetchReportingEntities.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error?.message ??
          'Failed to fetch reporting entities';
      });
  },
});

// -------------------- Exports --------------------
export const { setLastParams, clearError, resetReportingEntitiesState } =
  reportingEntitiesSlice.actions;

export const selectReportingEntitiesState = (state: RootState) =>
  state.reportingEntities;
export const selectReportingEntitiesData = (state: RootState) =>
  state.reportingEntities.data;
export const selectReportingEntitiesLoading = (state: RootState) =>
  state.reportingEntities.loading;
export const selectReportingEntitiesError = (state: RootState) =>
  state.reportingEntities.error;

export default reportingEntitiesSlice.reducer;
