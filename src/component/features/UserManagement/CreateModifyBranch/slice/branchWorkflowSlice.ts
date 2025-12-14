import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  BranchWorkflowState,
  BranchWorkflowSuccessResponse,
  BranchWorkflowErrorResponse,
} from '../types/branchWorkflow';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: BranchWorkflowState = {
  loading: false,
  workflows: [],
  totalPages: 0,
  totalElements: 0,
  pageNumber: 0,
  error: null,
};

// Async thunk for fetching branch workflows
export const fetchBranchWorkflows = createAsyncThunk<
  BranchWorkflowSuccessResponse['data'],
  {
    page?: number;
    size?: number;
    searchText?: string;
    sortField?: string;
    sortDirection?: string;
  },
  { rejectValue: string }
>(
  'branchWorkflow/fetchBranchWorkflows',
  async (
    {
      page = 0,
      size = 10,
      searchText = '',
      sortField = 'submittedOn',
      sortDirection = 'desc',
    },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Loading branch workflows...'));
    try {
      let url = `${API_ENDPOINTS.get_my_task_branch}?page=${page}&size=${size}&sortField=${sortField}&sortDirection=${sortDirection}`;

      // Add searchText parameter (always include, even if empty)
      url += `&searchText=${encodeURIComponent(searchText)}`;

      console.log('Branch Workflows API URL:', url);
      const response = await Secured.get(url);
      console.log('Branch Workflows API Response:', response.data);

      const data = response.data as
        | BranchWorkflowSuccessResponse
        | BranchWorkflowErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.message || 'Failed to fetch branch workflows'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: BranchWorkflowErrorResponse; status?: number };
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
                'Failed to fetch branch workflows'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch branch workflows'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Branch workflow slice
const branchWorkflowSlice = createSlice({
  name: 'branchWorkflow',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBranchWorkflowState: () => {
      return initialState;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchWorkflows.pending, (state) => {
        state.workflows = [];
        state.error = null;
      })
      .addCase(fetchBranchWorkflows.fulfilled, (state, action) => {
        state.workflows = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageNumber = action.payload.number;
        state.error = null;
      })
      .addCase(fetchBranchWorkflows.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch branch workflows';
      });
  },
});

export const { clearError, resetBranchWorkflowState, setPageNumber } =
  branchWorkflowSlice.actions;
export default branchWorkflowSlice.reducer;
