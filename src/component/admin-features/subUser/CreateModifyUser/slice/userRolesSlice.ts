import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  UserRolesState,
  UserRolesSuccessResponse,
  UserRolesErrorResponse,
} from '../types/userRolesTypes';

// Initial state
const initialState: UserRolesState = {
  loading: false,
  data: [],
  error: null,
};

// Async thunk for fetching user roles
export const fetchUserRoles = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>('userRoles/fetchUserRoles', async (_, { rejectWithValue }) => {
  try {
    console.log('Calling user roles API:', API_ENDPOINTS.get_user_roles); // Debug log

    const response = await Secured.get(API_ENDPOINTS.get_user_roles);
    console.log('User roles API Response:', response.data); // Debug log

    // Handle success response
    if (response.data && response.data.success === true) {
      const successData = response.data as UserRolesSuccessResponse;
      return successData.data;
    }

    // Handle error response with success: false
    if (response.data && response.data.success === false) {
      const errorData = response.data as UserRolesErrorResponse;
      return rejectWithValue(
        errorData.data?.errorMessage ||
          errorData.message ||
          'Failed to fetch user roles'
      );
    }

    // Fallback error
    return rejectWithValue('Invalid response format');
  } catch (error: unknown) {
    console.error('User roles API error:', error); // Debug log

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: UserRolesErrorResponse };
      };
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch user roles'
        );
      }
    }
    return rejectWithValue('Network error occurred while fetching user roles');
  }
});

// User roles slice
const userRolesSlice = createSlice({
  name: 'userRoles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = [];
      });
  },
});

export const { clearError, resetState } = userRolesSlice.actions;
export default userRolesSlice.reducer;
