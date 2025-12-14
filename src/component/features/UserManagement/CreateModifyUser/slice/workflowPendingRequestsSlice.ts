import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  WorkflowPendingRequestsRequest,
  WorkflowPendingRequestsSuccessResponse,
  WorkflowPendingRequestsErrorResponse,
  WorkflowPendingRequestsState,
} from '../types/workflowPendingRequestsTypes';

const initialState: WorkflowPendingRequestsState = {
  loading: false,
  data: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  error: null,
};

// Async thunk for fetching workflow pending requests
export const fetchWorkflowPendingRequests = createAsyncThunk<
  WorkflowPendingRequestsSuccessResponse['data'],
  Partial<WorkflowPendingRequestsRequest>,
  { rejectValue: string }
>('workflowPendingRequests/fetch', async (request, { rejectWithValue }) => {
  try {
    console.log('Calling workflow pending requests API with data:', request);

    // Default payload structure
    const payload: WorkflowPendingRequestsRequest = {
      filters: request.filters || [
        {
          operation: 'AND',
          filters: {
            workflow_type: [
              'RE_USER_CREATION',
              'RE_USER_MODIFICATION',
              'RE_USER_SUSPENSION',
              'RE_USER_SUSPENSION_REVOKE',
              'RE_USER_DEACTIVATION',
            ],
            status: ['PENDING', 'APPROVED', 'REJECTED'],
          },
        },
      ],
      page: request.page ?? 1,
      pageSize: request.pageSize || 10,
      isPendingRequestAPI: request.isPendingRequestAPI ?? false,
      sortBy: request.sortBy || 'created_at',
      sortDesc: request.sortDesc ?? true,
      search: request.search,
    };

    const response = await Secured.post(
      API_ENDPOINTS.workflow_pending_requests,
      payload
    );

    const data:
      | WorkflowPendingRequestsSuccessResponse
      | WorkflowPendingRequestsErrorResponse = response.data;

    if ('success' in data && data.success === false) {
      console.error('Workflow pending requests API error:', data.message);
      return rejectWithValue(
        data.message || 'Failed to fetch workflow pending requests'
      );
    }

    console.log('Workflow pending requests API success:', data.data);
    return (data as WorkflowPendingRequestsSuccessResponse).data;
  } catch (error: unknown) {
    console.error('Workflow pending requests API error:', error);

    // Handle axios error response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
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
        if (axiosError.response?.data?.message) {
          return rejectWithValue(axiosError.response.data.message);
        }
      }

      // Handle other errors
      if (axiosError.response?.data?.message) {
        return rejectWithValue(axiosError.response.data.message);
      }
    }

    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while fetching workflow pending requests'
    );
  }
});

const workflowPendingRequestsSlice = createSlice({
  name: 'workflowPendingRequests',
  initialState,
  reducers: {
    clearData: (state) => {
      state.data = [];
      state.totalElements = 0;
      state.totalPages = 0;
      state.currentPage = 0;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflowPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.error = null;
      })
      .addCase(fetchWorkflowPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to fetch workflow pending requests';
        state.data = [];
      });
  },
});

export const { clearData, clearError } = workflowPendingRequestsSlice.actions;
export default workflowPendingRequestsSlice.reducer;
