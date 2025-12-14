import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  RegionWorkflowState,
  RegionWorkflowSuccessResponse,
  RegionWorkflowErrorResponse,
} from '../types/regionWorkflow';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: RegionWorkflowState = {
  loading: false,
  workflows: [],
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  error: null,
};

// Async thunk for fetching region workflows
export const fetchRegionWorkflows = createAsyncThunk<
  RegionWorkflowSuccessResponse['data'],
  {
    page?: number;
    size?: number;
    searchText?: string;
    status?: string;
    sortField?: string;
    sortDirection?: string;
  },
  { rejectValue: string }
>(
  'regionWorkflow/fetchRegionWorkflows',
  async (
    {
      page = 0,
      size = 10,
      searchText = '',
      status = '',
      sortField = 'submittedOn',
      sortDirection = 'desc',
    },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Loading region workflows...'));
    try {
      let url = `/api/v1/region-workflows?page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}&searchText=${encodeURIComponent(searchText)}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await Secured.get(url);
      console.log('Region Workflows Response:', response.data);

      const data = response.data as
        | RegionWorkflowSuccessResponse
        | RegionWorkflowErrorResponse;

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
              sort: [],
              offset: 0,
              unpaged: false,
              paged: true,
            },
            last: true,
            totalPages: 0,
            totalElements: 0,
            size: size,
            number: 0,
            sort: [],
            first: true,
            numberOfElements: 0,
            empty: true,
          };
        }
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.message || 'Failed to fetch region workflows'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: RegionWorkflowErrorResponse; status?: number };
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
                'Failed to fetch region workflows'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch region workflows'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Region workflow slice
const regionWorkflowSlice = createSlice({
  name: 'regionWorkflow',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegionWorkflowState: () => {
      return initialState;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegionWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegionWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageNumber = action.payload.number;
        state.error = null;
      })
      .addCase(fetchRegionWorkflows.rejected, (state, action) => {
        state.loading = false;
        // Don't clear workflows on error - preserve existing data so table doesn't disappear
        // Only clear if workflows array is already empty (initial load failure)
        if (state.workflows.length === 0) {
          state.workflows = [];
          state.totalPages = 0;
          state.totalElements = 0;
        }
        state.error = action.payload || 'Failed to fetch region workflows';
      });
  },
});

export const { clearError, resetRegionWorkflowState, setPageNumber } =
  regionWorkflowSlice.actions;
export default regionWorkflowSlice.reducer;
