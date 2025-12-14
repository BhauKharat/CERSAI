import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  UserAddressState,
  UserAddressSuccessResponse,
  UserAddressErrorResponse,
  UserAddressParams,
} from '../types/userAddressTypes';

// Initial state
const initialState: UserAddressState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for fetching user address
export const fetchUserAddress = createAsyncThunk<
  UserAddressSuccessResponse['data'],
  UserAddressParams,
  { rejectValue: string }
>('userAddress/fetchUserAddress', async (params, { rejectWithValue }) => {
  try {
    console.log('Calling user address API with params:', params); // Debug log

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('userType', params.userType);

    if (params.addressType) {
      queryParams.append('addressType', params.addressType);
    }
    if (params.regionName) {
      queryParams.append('regionName', params.regionName);
    }
    if (params.branchName) {
      queryParams.append('branchName', params.branchName);
    }

    const url = `${API_ENDPOINTS.get_user_address}?${queryParams.toString()}`;
    console.log('API URL:', url); // Debug log

    const response = await Secured.get(url);
    console.log('API Response:', response.data); // Debug log

    // Handle success response
    if (response.data && response.data.success === true) {
      return response.data.data;
    }

    // Handle error response with success: false
    if (response.data && response.data.success === false) {
      const errorData = response.data as UserAddressErrorResponse;
      return rejectWithValue(
        errorData.data?.errorMessage ||
          errorData.message ||
          'Failed to fetch user address'
      );
    }

    // Fallback error
    return rejectWithValue('Invalid response format');
  } catch (error: unknown) {
    console.error('User address API error:', error); // Debug log

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: UserAddressErrorResponse; status?: number };
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
              'Failed to fetch user address'
          );
        }
      }

      // Handle other errors
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch user address'
        );
      }
    }
    return rejectWithValue(
      'Network error occurred while fetching user address'
    );
  }
});

// User address slice
const userAddressSlice = createSlice({
  name: 'userAddress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError, resetState, clearData } = userAddressSlice.actions;
export default userAddressSlice.reducer;
