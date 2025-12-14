import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  CreateUserRequest,
  CreateUserSuccessResponse,
  CreateUserErrorResponse,
  CreateUserState,
} from '../types/createUserTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: CreateUserState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for creating user
export const createUser = createAsyncThunk<
  { userId: string; workflowId: string; workflowStatus: string },
  CreateUserRequest,
  { rejectValue: string }
>(
  'createUser/createUser',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Creating user...'));
      console.log('Calling create user API:', requestData);

      const response = await Secured.post(
        API_ENDPOINTS.create_user_management,
        requestData
      );

      console.log('Create user API Response:', response.data);

      // Handle success response
      if (response.data && response.data.success === true) {
        dispatch(hideLoader());
        const successData = response.data as CreateUserSuccessResponse;
        return successData.data;
      }

      // Handle error response with success: false
      if (response.data && response.data.success === false) {
        dispatch(hideLoader());
        const errorData = response.data as CreateUserErrorResponse;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to create user'
        );
      }
      dispatch(hideLoader());
      // Fallback error
      return rejectWithValue('Invalid response format');
    } catch (error: unknown) {
      console.error('Create user API error:', error);
      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: CreateUserErrorResponse; status?: number };
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
                'Failed to create user'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to create user'
          );
        }
      }
      dispatch(hideLoader());
      return rejectWithValue('Network error occurred while creating user');
    }
  }
);

// Create user slice
const createUserSlice = createSlice({
  name: 'createUserManagement',
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError, resetState } = createUserSlice.actions;
export default createUserSlice.reducer;
