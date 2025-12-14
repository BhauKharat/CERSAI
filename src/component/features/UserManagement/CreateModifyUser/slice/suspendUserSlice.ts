import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  SuspendUserParams,
  SuspendUserResponse,
  SuspendUserState,
} from '../types/suspendUserTypes';

// Async thunk for suspending user
export const suspendUser = createAsyncThunk(
  'suspendUser/suspendUser',
  async (params: SuspendUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Suspending user...'));

      const requestBody = {
        userId: params.userId,
        actionType: 'SUSPEND',
        reason: params.reason,
        remarks: params.remarks,
      };

      const url = API_ENDPOINTS.suspend_user;
      const response = await Secured.post(url, requestBody);

      const responseData = response.data as SuspendUserResponse;
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
              | SuspendUserResponse
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
            errorMessage = 'Failed to suspend user';
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
          errorMessage = `Failed to suspend user (Status: ${status})`;
        }

        return rejectWithValue(errorMessage);
      }
      return rejectWithValue('Network error occurred while suspending user');
    }
  }
);

const initialState: SuspendUserState = {
  suspending: false,
  suspendError: null,
};

const suspendUserSlice = createSlice({
  name: 'suspendUser',
  initialState,
  reducers: {
    clearSuspendError: (state) => {
      state.suspendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(suspendUser.pending, (state) => {
        state.suspending = true;
        state.suspendError = null;
      })
      .addCase(suspendUser.fulfilled, (state) => {
        state.suspending = false;
        state.suspendError = null;
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.suspending = false;
        state.suspendError = action.payload as string;
      });
  },
});

export const { clearSuspendError } = suspendUserSlice.actions;
export default suspendUserSlice.reducer;
