import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  GetBranchState,
  GetBranchData,
  GetBranchSuccessResponse,
  GetBranchErrorResponse,
} from '../types/getBranch';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: GetBranchState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for getting branch details
export const getBranch = createAsyncThunk<
  GetBranchData,
  string,
  { rejectValue: string }
>('getBranch/getBranch', async (branchCode, { rejectWithValue, dispatch }) => {
  dispatch(showLoader('Fetching branch details...'));
  try {
    const response = await Secured.get(
      `${API_ENDPOINTS.get_branch}/${branchCode}`
    );
    const data = response.data as
      | GetBranchSuccessResponse
      | GetBranchErrorResponse;

    if (data.success) {
      dispatch(hideLoader());
      // Map API response to match our type structure
      const branchData = data.data;
      // Ensure city field is mapped correctly (API may return 'city' or 'cityTown')
      if (
        branchData.address &&
        'city' in branchData.address &&
        !branchData.address.cityTown
      ) {
        const addressWithCity =
          branchData.address as GetBranchData['address'] & { city?: string };
        branchData.address.cityTown = addressWithCity.city || '';
      }
      return branchData;
    } else {
      dispatch(hideLoader());
      return rejectWithValue(
        data.data?.errorMessage ||
          data.message ||
          'Failed to fetch branch details'
      );
    }
  } catch (error: unknown) {
    dispatch(hideLoader());
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: GetBranchErrorResponse; status?: number };
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
              'Failed to fetch branch details'
          );
        }
      }

      // Handle other errors
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch branch details'
        );
      }
    }
    return rejectWithValue('Network error occurred');
  }
});

// Get branch slice
const getBranchSlice = createSlice({
  name: 'getBranch',
  initialState,
  reducers: {
    clearGetBranchError: (state) => {
      state.error = null;
    },
    resetGetBranchState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getBranch.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload || 'Failed to fetch branch details';
      });
  },
});

export const { clearGetBranchError, resetGetBranchState } =
  getBranchSlice.actions;
export default getBranchSlice.reducer;
