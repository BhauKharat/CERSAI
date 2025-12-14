/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from '../../../../utils/constants';
import { Secured } from '../../../../utils/HelperFunctions/api';

interface ISortBy {
  key: string;
  type: string;
}

interface IPWhitelistingWorkflow {
  workflow_id: string;
  workflow_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  payload: any;
  [key: string]: any;
}

interface IPWhitelistingWorkflowsResponse {
  content: IPWhitelistingWorkflow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface IPWhitelistingWorkflowsState {
  data: IPWhitelistingWorkflowsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: IPWhitelistingWorkflowsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchIPWhitelistingWorkflows = createAsyncThunk<
  IPWhitelistingWorkflowsResponse,
  {
    page?: number;
    size?: number;
    fromDate?: string;
    toDate?: string;
    sortBy?: ISortBy;
    workflowType: string;
    reId?: string;
    searchText?: string;
  }
>(
  'ipWhitelistingWorkflows/fetchAll',
  async (
    {
      page = 1,
      size = 10,
      fromDate,
      toDate = '',
      sortBy,
      workflowType,
      reId,
      searchText,
    },
    { rejectWithValue }
  ) => {
    try {
      const url = ENDPOINTS.IP_WHITELISTING_WORKFLOWS;

      const filters = [];
      const mainFilterData: any = {
        workflow_type: workflowType,
        status: ['PENDING'],
      };

      if (reId) {
        mainFilterData.reId = reId;
      }

      if (searchText) {
        mainFilterData.ipAddress = searchText;
      }

      if (fromDate) {
        mainFilterData['created_at__gte'] = fromDate;
      }

      if (toDate) {
        mainFilterData['created_at__lte'] = toDate;
      }

      const mainFilter: any = {
        operation: 'AND',
        filters: mainFilterData,
      };

      filters.push(mainFilter);

      const formdata = {
        filters: filters,
        page: page.toString(),
        pageSize: size.toString(),
        sortBy: sortBy?.key ?? 'created_at',
        sortDesc: sortBy?.type === 'asc' ? false : true,
      };

      const response = await Secured.post(url, formdata, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('IP Whitelisting Workflows API Response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error in fetchIPWhitelistingWorkflows:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch IP whitelisting workflows'
      );
    }
  }
);

export const approveRejectIPWhitelistingWorkflows = createAsyncThunk<
  any,
  {
    workflowIds: string[];
    remark?: string;
    action: 'approve' | 'reject';
  }
>(
  'ipWhitelistingWorkflows/approveReject',
  async ({ workflowIds, remark, action }, { rejectWithValue }) => {
    try {
      const url =
        action === 'approve'
          ? ENDPOINTS.IP_WHITELISTING_APPROVAL
          : ENDPOINTS.IP_WHITELISTING_REJECT;

      // FIX: Use the provided remark or default to 'Approve' for approve action
      const remarkValue = remark || (action === 'approve' ? 'Approve' : '');

      const payload = {
        workflowIds: workflowIds,
        remark: remarkValue,
      };

      console.log('IP Whitelisting Approval/Reject Request:', {
        action,
        url,
        payload,
        remarkReceived: remark,
        remarkValue,
      });

      const response = await Secured.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(
        'IP Whitelisting Approval/Reject API Response:',
        response.data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error in approveRejectIPWhitelistingWorkflows:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to approve/reject IP whitelisting workflows'
      );
    }
  }
);

const ipWhitelistingWorkflowSlice = createSlice({
  name: 'ipWhitelistingWorkflows',
  initialState,
  reducers: {
    clearIPWhitelistingWorkflows: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIPWhitelistingWorkflows.pending, (state) => {
        console.log('fetchIPWhitelistingWorkflows.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchIPWhitelistingWorkflows.fulfilled,
        (state, action: PayloadAction<IPWhitelistingWorkflowsResponse>) => {
          console.log('fetchIPWhitelistingWorkflows.fulfilled - Payload:', {
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
      .addCase(fetchIPWhitelistingWorkflows.rejected, (state, action) => {
        console.error('fetchIPWhitelistingWorkflows.rejected:', {
          error: action.error,
          payload: action.payload,
          meta: action.meta,
        });
        state.loading = false;
        state.error =
          (action.payload as string) ||
          'Failed to fetch IP whitelisting workflows';
      })
      .addCase(approveRejectIPWhitelistingWorkflows.pending, (state) => {
        console.log('approveRejectIPWhitelistingWorkflows.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRejectIPWhitelistingWorkflows.fulfilled, (state) => {
        console.log('approveRejectIPWhitelistingWorkflows.fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(
        approveRejectIPWhitelistingWorkflows.rejected,
        (state, action) => {
          console.error('approveRejectIPWhitelistingWorkflows.rejected:', {
            error: action.error,
            payload: action.payload,
          });
          state.loading = false;
          state.error =
            (action.payload as string) ||
            'Failed to approve/reject IP whitelisting workflows';
        }
      );
  },
});

export const { clearIPWhitelistingWorkflows } =
  ipWhitelistingWorkflowSlice.actions;

export default ipWhitelistingWorkflowSlice.reducer;
