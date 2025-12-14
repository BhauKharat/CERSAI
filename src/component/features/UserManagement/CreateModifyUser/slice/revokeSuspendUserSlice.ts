import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  RevokeSuspendUserParams,
  RevokeSuspendUserResponse,
  RevokeSuspendUserState,
} from '../types/revokeSuspendUserTypes';

// Async thunk for revoking user suspension
export const revokeSuspendUser = createAsyncThunk(
  'revokeSuspendUser/revokeSuspendUser',
  async (params: RevokeSuspendUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Revoking user suspension...'));

      const requestBody = {
        userId: params.userId,
        actionType: 'SUSPENSION_REVOKE',
        reason: params.reason,
        remarks: params.remarks,
      };

      const url: string = API_ENDPOINTS.revoke_suspend_user;
      const response = await Secured.post(url, requestBody);

      const responseData = response.data as RevokeSuspendUserResponse;
      dispatch(hideLoader());

      // Check for success: either responseData.success is true OR status is 200
      if (responseData.success === true || response.status === 200) {
        return {
          ...responseData,
          success: true,
          message: 'Submitted for approval',
        };
      } else {
        const errorData = responseData.data as {
          errorCode: string;
          errorMessage: string;
        };
        return rejectWithValue(
          errorData.errorMessage || 'Failed to revoke user suspension'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data:
              | RevokeSuspendUserResponse
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
                  data?: { errorMessage?: string };
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
          // Check for legacy error format (format 3: {data: {errorMessage}})
          else if (
            'data' in errorData &&
            errorData.data &&
            typeof errorData.data === 'object' &&
            'errorMessage' in errorData.data
          ) {
            errorMessage = String(errorData.data.errorMessage);
          }
          // Fallback
          else {
            errorMessage = 'Failed to revoke user suspension';
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
        // Check for legacy error format (format 3: {data: {errorMessage}})
        else if (
          'data' in errorData &&
          errorData.data &&
          typeof errorData.data === 'object' &&
          'errorMessage' in errorData.data
        ) {
          errorMessage = String(errorData.data.errorMessage);
        }
        // Fallback with status code information
        else {
          errorMessage = `Failed to revoke user suspension (Status: ${status})`;
        }

        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(
        'Network error occurred while revoking user suspension'
      );
    }
  }
);

const initialState: RevokeSuspendUserState = {
  revokingSuspension: false,
  revokeSuspendError: null,
};

const revokeSuspendUserSlice = createSlice({
  name: 'revokeSuspendUser',
  initialState,
  reducers: {
    clearRevokeSuspendError: (state) => {
      state.revokeSuspendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(revokeSuspendUser.pending, (state) => {
        state.revokingSuspension = true;
        state.revokeSuspendError = null;
      })
      .addCase(revokeSuspendUser.fulfilled, (state) => {
        state.revokingSuspension = false;
        state.revokeSuspendError = null;
      })
      .addCase(revokeSuspendUser.rejected, (state, action) => {
        state.revokingSuspension = false;
        state.revokeSuspendError = action.payload as string;
      });
  },
});

export const { clearRevokeSuspendError } = revokeSuspendUserSlice.actions;
export default revokeSuspendUserSlice.reducer;
