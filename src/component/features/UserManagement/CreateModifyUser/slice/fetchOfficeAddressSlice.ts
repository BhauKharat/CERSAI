import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  FetchOfficeAddressRequest,
  FetchOfficeAddressSuccessResponse,
  FetchOfficeAddressErrorResponse,
  FetchOfficeAddressState,
} from '../types/fetchOfficeAddressTypes';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: FetchOfficeAddressState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for fetching office addresses
export const fetchOfficeAddress = createAsyncThunk<
  FetchOfficeAddressSuccessResponse,
  FetchOfficeAddressRequest,
  { rejectValue: string }
>(
  'fetchOfficeAddress/fetchOfficeAddress',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Fetching office addresses...'));

      const response = await Secured.get<FetchOfficeAddressSuccessResponse>(
        '/api/v1/sub-users/address'
      );

      dispatch(hideLoader());

      if (response.data && response.data.data) {
        return response.data;
      } else {
        return rejectWithValue('Failed to fetch office addresses');
      }
    } catch (error: unknown) {
      dispatch(hideLoader());

      const err = error as {
        response?: {
          data?: FetchOfficeAddressErrorResponse;
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
            'Failed to fetch office addresses'
        );
      }

      // Handle other errors
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch office addresses'
      );
    }
  }
);

// Slice
const fetchOfficeAddressSlice = createSlice({
  name: 'fetchOfficeAddress',
  initialState,
  reducers: {
    clearFetchOfficeAddressData: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficeAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfficeAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(fetchOfficeAddress.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload || 'Failed to fetch office addresses';
      });
  },
});

export const { clearFetchOfficeAddressData } = fetchOfficeAddressSlice.actions;
export default fetchOfficeAddressSlice.reducer;
