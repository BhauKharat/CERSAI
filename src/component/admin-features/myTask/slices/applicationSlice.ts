/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from '../../../../utils/constants';
import {
  ApplicationsResponse,
  ApplicationsState,
  ISortBy,
} from '../types/applicationTypes';
import { Secured } from '../../../../utils/HelperFunctions/api';

const initialState: ApplicationsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchApplications = createAsyncThunk<
  ApplicationsResponse,
  {
    page?: number;
    size?: number;
    searchQuery?: string;
    fromDate?: string;
    toDate?: string;
    status?: string[];
    sortBy?: ISortBy;
    isModifiableRequest?: boolean;
    apiType?: 'APPLICATIONS' | 'TRACK_STATUS'; // ✅ added
  }
>(
  'applications/fetchAll',
  async (
    {
      page = 0,
      size = 10,
      searchQuery = '',
      fromDate,
      toDate = '',
      sortBy,
      status,
      isModifiableRequest,
      apiType = 'APPLICATIONS', // ✅ default
    },
    { rejectWithValue }
  ) => {
    try {
      // ✅ choose endpoint dynamically
      const url =
        apiType === 'TRACK_STATUS'
          ? ENDPOINTS.TRACK_STATUS
          : ENDPOINTS.APPLICATIONS;

      const filters = [];
      const mainFilter: any = {
        operation: 'AND',
        filters: {
          workflow_type: 'RE_REGISTRATION',
        },
      };

      if (status) {
        mainFilter.filters.status = status;
      }

      if (isModifiableRequest !== undefined) {
        mainFilter.filters.isModifiableRequest = isModifiableRequest;
      }

      filters.push(mainFilter);

      if (fromDate || toDate) {
        const dateFilter: any = {
          operation: 'AND',
          filters: {},
        };

        if (fromDate) {
          dateFilter.filters['created_at__gte'] = fromDate;
        }

        if (toDate) {
          dateFilter.filters['created_at__lte'] = toDate;
        }
        filters.push(dateFilter);
      }

      const formdata = {
        filters: filters,
        page: page ?? 0,
        pageSize: size ?? 0,
        sortBy: sortBy?.key ?? 'created_at',
        // order: sortBy?.type ?? undefined,
        sortDesc: sortBy?.type === 'asc' ? false : true,
        search: searchQuery ?? '',
      };

      const response = await Secured.post(url, formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in fetchApplications:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch applications'
      );
    }
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    // This reducer was moved to requestDetailsSlice for better state management.
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        console.log('fetchApplications.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchApplications.fulfilled,
        (state, action: PayloadAction<ApplicationsResponse>) => {
          console.log('fetchApplications.fulfilled - Payload:', {
            hasContent: !!action.payload?.content,
            contentLength: action.payload?.content?.length || 0,
            firstItem: action.payload?.content?.[0],
            pagination: {
              page: action.payload?.page,
              size: action.payload?.size,
              totalElements: action.payload?.totalElements,
              totalPages: action.payload?.totalPages,
            },
          });

          state.loading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(fetchApplications.rejected, (state, action) => {
        console.error('fetchApplications.rejected:', {
          error: action.error,
          payload: action.payload,
          meta: action.meta,
        });
        state.loading = false;
        state.error =
          (action.payload as string) || 'Failed to fetch applications';
      });
  },
});

export const { actions } = applicationSlice;

export default applicationSlice.reducer;
