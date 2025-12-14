import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';

export interface SuspensionApproval {
  actionBy: string;
  action: string;
  reason: string;
  remarks: string;
  actionDateTime: string;
  actionByUserName: string;
  approvalLevel: number;
}

export interface SuspensionDetails {
  suspendedBy: string;
  suspendedByName: string;
  suspendedOn: string;
  suspensionRemark: string;
}

interface SuspensionDetailsState {
  data: SuspensionDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: SuspensionDetailsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchSuspensionDetails = createAsyncThunk(
  'suspensionDetails/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.post(
        API_ENDPOINTS.workflow_pending_requests,
        {
          filters: [
            {
              operation: 'AND',
              filters: {
                workflow_type: ['RE_USER_SUSPENSION'],
                status: ['APPROVED'],
                userId: userId,
              },
            },
          ],
          page: 0,
          pageSize: 1,
          sortBy: 'created_at',
          sortDesc: true,
        }
      );

      if (
        response.data?.data?.content &&
        response.data.data.content.length > 0
      ) {
        const workflow = response.data.data.content[0];

        console.log('Suspension Details - Full workflow:', workflow);
        console.log('Suspension Details - payload:', workflow.payload);
        console.log(
          'Suspension Details - userDetails:',
          workflow.payload?.userDetails
        );

        const userDetails = workflow.payload?.userDetails;
        const initiatorDetails = workflow.payload?.initiatorDetails || {};
        const metaData = workflow.meta_data || {};

        // Get initiator information (who suspended the user)
        const initiatedBy =
          initiatorDetails.actionByUserName || metaData.username || '';
        const initiatedByUserId =
          initiatorDetails.userId || metaData.initiatedBy || '';

        // Get suspension date
        const suspendedOn =
          initiatorDetails.actionDateTime ||
          metaData.lastActionOn ||
          workflow.created_at ||
          '';

        // Get suspension remark from userDetails
        const remarkValue = userDetails?.remarks || userDetails?.reason || '';

        console.log('Suspension Details - initiatedBy:', initiatedBy);
        console.log(
          'Suspension Details - initiatedByUserId:',
          initiatedByUserId
        );
        console.log('Suspension Details - suspendedOn:', suspendedOn);
        console.log('Suspension Details - Final remark value:', remarkValue);

        return {
          suspendedBy: initiatedByUserId,
          suspendedByName: initiatedBy || initiatedByUserId,
          suspendedOn: suspendedOn,
          suspensionRemark: remarkValue,
        } as SuspensionDetails;
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch suspension details';
      return rejectWithValue(errorMessage);
    }
  }
);

const suspensionDetailsSlice = createSlice({
  name: 'suspensionDetails',
  initialState,
  reducers: {
    clearSuspensionDetails: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuspensionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuspensionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchSuspensionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSuspensionDetails } = suspensionDetailsSlice.actions;
export default suspensionDetailsSlice.reducer;
