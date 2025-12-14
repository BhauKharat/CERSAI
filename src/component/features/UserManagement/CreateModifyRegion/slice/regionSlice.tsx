import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  RegionState,
  RegionSuccessResponse,
  RegionErrorResponse,
} from '../types/region';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: RegionState = {
  loading: false,
  regions: [],
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  error: null,
};

// Async thunk for fetching regions
export const fetchRegions = createAsyncThunk<
  RegionSuccessResponse['data'],
  {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortDirection?: string;
  },
  { rejectValue: string }
>(
  'region/fetchRegions',
  async (
    {
      page = 0,
      size = 10,
      search = '',
      status = 'All',
      sortField = 'createdAt',
      sortDirection = 'desc',
    },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Loading regions...'));
    try {
      let url = `${API_ENDPOINTS.get_region}?page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}`;
      if (search) {
        url += `&searchText=${encodeURIComponent(search)}`;
      }
      if (status && status !== 'All') {
        url += `&status=${encodeURIComponent(status)}`;
      }

      const response = await Secured.get(url);
      console.log(response.data);
      const data = response.data as RegionSuccessResponse | RegionErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        // Handle case where API returns success but no content
        if (
          !data.data ||
          !data.data.content ||
          data.data.content.length === 0
        ) {
          return {
            content: [],
            pageable: {
              pageNumber: 0,
              pageSize: size,
              sort: {
                empty: true,
                unsorted: true,
                sorted: false,
              },
              offset: 0,
              unpaged: false,
              paged: true,
            },
            last: true,
            totalPages: 0,
            totalElements: 0,
            size: size,
            number: 0,
            sort: {
              empty: true,
              unsorted: true,
              sorted: false,
            },
            first: true,
            numberOfElements: 0,
            empty: true,
          };
        }
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(data.message || 'Failed to fetch regions');
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: RegionErrorResponse; status?: number };
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
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to fetch regions'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch regions'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Region slice
const regionSlice = createSlice({
  name: 'region',
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
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageNumber = action.payload.number;
        state.error = null;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        // Don't clear regions on error - preserve existing data so table doesn't disappear
        // Only clear if regions array is already empty (initial load failure)
        if (state.regions.length === 0) {
          state.regions = [];
          state.totalPages = 0;
          state.totalElements = 0;
        }
        state.error = action.payload || 'Failed to fetch regions';
      });
  },
});

export const { clearError, resetRegionState, setPageNumber } =
  regionSlice.actions;
export default regionSlice.reducer;
