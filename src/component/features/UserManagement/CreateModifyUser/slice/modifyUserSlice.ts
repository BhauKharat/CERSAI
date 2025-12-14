import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  ModifyUserRequest,
  ModifyUserSuccessResponse,
  ModifyUserErrorResponse,
  ModifyUserState,
} from '../types/modifyUserTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Helper type for error response with nested error object
interface ErrorResponseWithNestedError {
  error?: {
    message?: string;
    status?: number;
    code?: string;
    type?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
  data?: {
    errorMessage?: string;
  };
  message?: string;
}

// Helper function to extract error message and field errors from various error response formats
const extractErrorInfo = (
  errorData: ModifyUserErrorResponse | ErrorResponseWithNestedError,
  fallback: string
): { message: string; fieldErrors?: Record<string, string> } => {
  const data = errorData as ErrorResponseWithNestedError;
  const isFormValidationError =
    data.error?.type === 'ERROR_FORM_VALIDATION' ||
    data.error?.type === 'ERROR_FORM_VALIDATIONS';
  const hasFieldErrors =
    isFormValidationError &&
    data.error?.errors &&
    Array.isArray(data.error.errors) &&
    data.error.errors.length > 0;

  let fieldErrors: Record<string, string> | undefined;
  let message = '';

  if (hasFieldErrors && data.error?.errors) {
    fieldErrors = {};
    const fieldErrorMessages: string[] = [];

    data.error.errors.forEach((fieldError) => {
      fieldErrors![fieldError.field] = fieldError.message;
      fieldErrorMessages.push(fieldError.message);
    });

    // For ERROR_FORM_VALIDATIONS, prioritize field error messages
    // Show the first field error message, or combine them if multiple
    if (fieldErrorMessages.length > 0) {
      message =
        fieldErrorMessages.length === 1
          ? fieldErrorMessages[0]
          : fieldErrorMessages.join('; ');
    }
  }

  // Fallback to other message sources if no field error messages
  if (!message) {
    message =
      data.error?.message ||
      data.data?.errorMessage ||
      data.message ||
      fallback;
  }

  return { message, fieldErrors };
};

// Initial state
const initialState: ModifyUserState = {
  loading: false,
  data: null,
  error: null,
};

// Error payload type for rejected actions
interface ModifyUserErrorPayload {
  message: string;
  fieldErrors?: Record<string, string>;
}

// Async thunk for modifying user
export const modifyUser = createAsyncThunk<
  {
    userId: string;
    workflowId: string;
    workflowStatus: string;
    message: string;
  },
  { userId: string; requestData: ModifyUserRequest },
  { rejectValue: ModifyUserErrorPayload }
>(
  'modifyUser/modifyUser',
  async ({ userId, requestData }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Modifying user...'));
      console.log(
        'Calling modify user API for userId:',
        userId,
        'with data:',
        requestData
      );

      // Add userId to the payload
      const payload = {
        userId,
        ...requestData,
      };

      // Use the new endpoint: /re/api/v1/sub-users
      const response = await Secured.put(
        `${API_ENDPOINTS.create_sub_user}`,
        payload
      );

      const data: ModifyUserSuccessResponse | ModifyUserErrorResponse =
        response.data;
      dispatch(hideLoader());
      if (data.success === false) {
        console.error('Modify user API error:', data.message);
        return rejectWithValue({
          message: data.message || 'Failed to modify user',
        });
      }

      console.log('Modify user API success:', data.data);
      return {
        ...(data as ModifyUserSuccessResponse).data,
        message: 'Submitted for approval',
      };
    } catch (error: unknown) {
      console.error('Modify user API error:', error);
      dispatch(hideLoader());
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                message?: string;
                status?: number;
                code?: string;
                type?: string;
              };
              message?: string;
              data?: {
                errorMessage?: string;
              };
            };
            status?: number;
          };
        };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue({
            message: 'Something went wrong on our side. Please try again later',
          });
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          if (errorData) {
            const errorInfo = extractErrorInfo(
              errorData,
              'Failed to modify user'
            );
            return rejectWithValue(errorInfo);
          }
        }

        // Handle other errors
        if (errorData) {
          const errorInfo = extractErrorInfo(
            errorData,
            'Failed to modify user'
          );
          return rejectWithValue(errorInfo);
        }
      }

      return rejectWithValue({
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while modifying user',
      });
    }
  }
);

const modifyUserSlice = createSlice({
  name: 'modifyUser',
  initialState,
  reducers: {
    clearData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(modifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(modifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.payload?.message || 'Failed to modify user';
        state.data = null;
      });
  },
});

export const { clearData, clearError } = modifyUserSlice.actions;
export default modifyUserSlice.reducer;
