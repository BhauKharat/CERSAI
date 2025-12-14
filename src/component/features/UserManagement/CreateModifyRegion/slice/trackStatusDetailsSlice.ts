import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  TrackStatusDetailsState,
  TrackStatusDetailsSuccessResponse,
  TrackStatusDetailsErrorResponse,
} from '../types/trackStatusDetails';

// Async thunk for fetching track status details by workflow ID
export const fetchTrackStatusDetails = createAsyncThunk(
  'trackStatusDetails/fetchTrackStatusDetails',
  async (workflowId: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching workflow details...'));

      const response = await Secured.get(
        `/api/v1/regions/track-status/${workflowId}`
      );

      // Handle the response data structure
      const responseData = response.data as TrackStatusDetailsSuccessResponse;

      // Hide loader on success
      dispatch(hideLoader());

      return responseData.data;
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: TrackStatusDetailsErrorResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch workflow details'
        );
      }
      return rejectWithValue(
        'Network error occurred while fetching workflow details'
      );
    }
  }
);

const initialState: TrackStatusDetailsState = {
  loading: false,
  data: null,
  error: null,
};

const trackStatusDetailsSlice = createSlice({
  name: 'trackStatusDetails',
  initialState,
  reducers: {
    resetTrackStatusDetailsState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    clearTrackStatusDetailsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackStatusDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackStatusDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchTrackStatusDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { resetTrackStatusDetailsState, clearTrackStatusDetailsError } =
  trackStatusDetailsSlice.actions;
export default trackStatusDetailsSlice.reducer;
