import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  BranchState,
  SubUserBranchErrorResponse,
  SubUserBranchSuccessResponse,
} from '../types/Branch';

// Initial state
const initialState: BranchState = {
  loading: false,
  regions: [],
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  error: null,
};

// Async thunk for fetching regions
export const fetchBranch = createAsyncThunk<
  SubUserBranchSuccessResponse['data'],
  {
    page?: number;
    size?: number;
    search?: string;
    searchText?: string;
    status?: string;
    activity?: string;
    sortField?: string;
    sortDirection?: string;
    isUserSpecific: boolean;
  },
  { rejectValue: string }
>(
  'region/subuser/fetchBranch',
  async (
    {
      page = 0,
      size = 10,
      search = '',
      searchText = '',
      status = 'All',
      activity = '',
      sortField = 'submittedOn',
      sortDirection = 'desc',
      isUserSpecific = false,
    },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Loading branchs...'));
    try {
      let url = `${API_ENDPOINTS.get_my_task_branch}?page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}&isUserSpecific=${isUserSpecific}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      // Use searchText if provided, otherwise use search
      const finalSearchText = searchText || search;
      if (finalSearchText) {
        url += `&searchText=${encodeURIComponent(finalSearchText)}`;
      }
      if (status && status !== 'All') {
        url += `&status=${encodeURIComponent(status)}`;
      }
      if (activity) {
        url += `&activity=${encodeURIComponent(activity)}`;
      }
      if (isUserSpecific) {
        url += `isUserSpecific=${encodeURIComponent(isUserSpecific)}`;
      }

      const response = await Secured.get(url);
      console.log(response.data);
      const data = response.data as
        | SubUserBranchSuccessResponse
        | SubUserBranchErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(data.message || 'Failed to fetch regions');
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: SubUserBranchErrorResponse; status?: number };
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
      console.log('error:---', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

// Region slice
const subUserBranchSlice = createSlice({
  name: 'subUserbranch',
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
      .addCase(fetchBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranch.fulfilled, (state) => {
        // state.loading = false;
        // state.regions = action.payload.content;
        // state.totalPages = action.payload.totalPages;
        // state.totalElements = action.payload.totalElements;
        // state.pageNumber = action.payload.number;
        state.error = null;
      })
      .addCase(fetchBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch regions';
      });
  },
});

export const { clearError, resetRegionState, setPageNumber } =
  subUserBranchSlice.actions;
export default subUserBranchSlice.reducer;
