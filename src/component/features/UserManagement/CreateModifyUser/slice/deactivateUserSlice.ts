import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  DeactivateUserParams,
  DeactivateUserResponse,
  DeactivateUserState,
} from '../types/deactivateUserTypes';

// Async thunk for deactivating user
export const deactivateUser = createAsyncThunk(
  'deactivateUser/deactivateUser',
  async (params: DeactivateUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Deactivating user...'));

      const requestBody = {
        userId: params.userId,
        actionType: 'DEACTIVATE',
        reason: params.reason,
        remarks: params.remarks,
      };

      const url = API_ENDPOINTS.deactivate_user;
      const response = await Secured.post(url, requestBody);

      const responseData = response.data as DeactivateUserResponse;
      dispatch(hideLoader());
      return {
        ...responseData,
        message: 'Submitted for approval',
      };
    } catch (error: unknown) {
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data:
              | DeactivateUserResponse
              | {
                  error?: {
                    message: string;
                    status: number;
                    code?: string;
                    type: string;
                  };
                  message?: string;
                  status?: number;
                  type?: string;
                  isValidationError?: boolean;
                };
            status: number;
          };
        };
        const errorData = axiosError.response.data;
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          let errorMessage = '';

          // First check for nested error structure (format 1: {error: {message, status, type}})
          if ('error' in errorData && errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
          // Check for flat error structure (format 2: {message, status, type})
          else if ('message' in errorData && errorData.message) {
            errorMessage = errorData.message;
          }
          // Fallback
          else {
            errorMessage = 'Failed to deactivate user';
          }

          return rejectWithValue(errorMessage);
        }

        // Handle other errors
        let errorMessage = '';

        // First check for nested error structure (format 1: {error: {message, status, type}})
        if ('error' in errorData && errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
        // Check for flat error structure (format 2: {message, status, type})
        else if ('message' in errorData && errorData.message) {
          errorMessage = errorData.message;
        }
        // Fallback with status code information
        else {
          errorMessage = `Failed to deactivate user (Status: ${status})`;
        }

        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Network error occurred while deactivating user');
    }
  }
);

const initialState: DeactivateUserState = {
  deactivating: false,
  deactivateError: null,
};

const deactivateUserSlice = createSlice({
  name: 'deactivateUser',
  initialState,
  reducers: {
    clearDeactivateError: (state) => {
      state.deactivateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deactivateUser.pending, (state) => {
        state.deactivating = true;
        state.deactivateError = null;
      })
      .addCase(deactivateUser.fulfilled, (state) => {
        state.deactivating = false;
        state.deactivateError = null;
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.deactivating = false;
        state.deactivateError = action.payload as string;
      });
  },
});

export const { clearDeactivateError } = deactivateUserSlice.actions;
export default deactivateUserSlice.reducer;
