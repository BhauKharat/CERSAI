import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  BranchState,
  BranchSuccessResponse,
  BranchErrorResponse,
} from '../types/branch';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: BranchState = {
  loading: false,
  branches: [],
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  error: null,
};

// Async thunk for fetching branches
export const fetchBranches = createAsyncThunk<
  BranchSuccessResponse['data'],
  {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortDirection?: string;
    regionCode?: string;
  },
  { rejectValue: string }
>(
  'branch/fetchBranches',
  async (
    {
      page = 0,
      size = 10,
      search = '',
      status = '',
      sortField = 'createdAt',
      sortDirection = 'desc',
      regionCode = '',
    },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Loading branches...'));
    try {
      let url = `${API_ENDPOINTS.get_branch}?page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}`;

      // Add searchText parameter (always include, even if empty)
      url += `&searchText=${encodeURIComponent(search)}`;

      // Add status parameter (always include, even if empty)
      url += `&status=${encodeURIComponent(status || '')}`;

      // Add regionCode parameter if provided
      if (regionCode) {
        url += `&regionCode=${encodeURIComponent(regionCode)}`;
      }

      console.log('API URL:', url);
      const response = await Secured.get(url);
      console.log('API Response:', response.data);
      console.log('Search term used:', search);
      console.log(
        'Number of results returned:',
        response.data?.data?.content?.length
      );
      const data = response.data as BranchSuccessResponse | BranchErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(data.message || 'Failed to fetch branches');
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: BranchErrorResponse; status?: number };
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
                'Failed to fetch branches'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch branches'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Branch slice
const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBranchState: () => {
      return initialState;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        // Clear previous data when starting new search
        state.branches = [];
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        // Remove local loading state - using loaderSlice instead
        state.branches = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageNumber = action.payload.number;
        state.error = null;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        // Remove local loading state - using loaderSlice instead
        state.error = action.payload || 'Failed to fetch branches';
      });
  },
});

export const { clearError, resetBranchState, setPageNumber } =
  branchSlice.actions;
export default branchSlice.reducer;
