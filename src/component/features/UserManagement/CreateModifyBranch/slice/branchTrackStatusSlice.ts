import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  BranchTrackStatusState,
  BranchTrackStatusSuccessResponse,
  BranchTrackStatusErrorResponse,
} from '../types/branchTrackStatus';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: BranchTrackStatusState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for fetching branch track status
export const fetchBranchTrackStatus = createAsyncThunk<
  BranchTrackStatusSuccessResponse['data'],
  string, // workflowId
  { rejectValue: string }
>(
  'branchTrackStatus/fetchBranchTrackStatus',
  async (workflowId, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Loading branch details...'));
    try {
      const url = API_ENDPOINTS.get_branch_track_status(workflowId);
      console.log('Branch Track Status API URL:', url);
      const response = await Secured.get(url);
      console.log('Branch Track Status API Response:', response.data);

      const data = response.data as
        | BranchTrackStatusSuccessResponse
        | BranchTrackStatusErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.message || 'Failed to fetch branch track status'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: BranchTrackStatusErrorResponse };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch branch track status'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Branch track status slice
const branchTrackStatusSlice = createSlice({
  name: 'branchTrackStatus',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBranchTrackStatusState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchTrackStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(fetchBranchTrackStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchBranchTrackStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch branch track status';
        state.data = null;
      });
  },
});

export const { clearError, resetBranchTrackStatusState } =
  branchTrackStatusSlice.actions;
export default branchTrackStatusSlice.reducer;
