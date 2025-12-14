import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  FetchBranchesRequest,
  FetchBranchesSuccessResponse,
  FetchBranchesErrorResponse,
  FetchBranchesState,
} from '../types/fetchBranchesTypes';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: FetchBranchesState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for fetching branches
export const fetchBranches = createAsyncThunk<
  FetchBranchesSuccessResponse,
  FetchBranchesRequest,
  { rejectValue: string }
>(
  'fetchBranches/fetchBranches',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Fetching branches...'));

      const response = await Secured.get<FetchBranchesSuccessResponse>(
        `${API_ENDPOINTS.fetch_branches}?regionId=${requestData.regionId}`
      );

      dispatch(hideLoader());

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || 'Failed to fetch branches'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());

      const err = error as {
        response?: {
          data?: FetchBranchesErrorResponse;
          status?: number;
        };
        message?: string;
      };
      const status = err.response?.status;

      // Handle 500 status
      if (status === 500) {
        return rejectWithValue(
          'Something went wrong on our side. Please try again later'
        );
      }

      // Handle 400 or 401 - show backend error
      if (status === 400 || status === 401) {
        return rejectWithValue(
          err.response?.data?.message ||
            err.message ||
            'Failed to fetch branches'
        );
      }

      // Handle other errors
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch branches'
      );
    }
  }
);

// Slice
const fetchBranchesSlice = createSlice({
  name: 'fetchBranches',
  initialState,
  reducers: {
    clearBranchesData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload || 'Failed to fetch branches';
      });
  },
});

export const { clearBranchesData } = fetchBranchesSlice.actions;
export default fetchBranchesSlice.reducer;
