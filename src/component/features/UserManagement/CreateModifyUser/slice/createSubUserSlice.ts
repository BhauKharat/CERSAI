import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  CreateSubUserRequest,
  CreateSubUserSuccessResponse,
  CreateSubUserErrorResponse,
  CreateSubUserState,
} from '../types/createSubUserTypes';
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
  errorData: CreateSubUserErrorResponse | ErrorResponseWithNestedError,
  fallback: string
): { message: string; fieldErrors?: Record<string, string> } => {
  console.log(
    '🚀 extractErrorInfo - Input errorData:',
    JSON.stringify(errorData, null, 2)
  );
  const data = errorData as ErrorResponseWithNestedError;
  console.log('🚀 extractErrorInfo - data.error:', data.error);
  console.log('🚀 extractErrorInfo - data.error?.type:', data.error?.type);

  const isFormValidationError =
    data.error?.type === 'ERROR_FORM_VALIDATION' ||
    data.error?.type === 'ERROR_FORM_VALIDATIONS';
  console.log(
    '🚀 extractErrorInfo - isFormValidationError:',
    isFormValidationError
  );
  console.log('🚀 extractErrorInfo - data.error?.errors:', data.error?.errors);

  const hasFieldErrors =
    isFormValidationError &&
    data.error?.errors &&
    Array.isArray(data.error.errors) &&
    data.error.errors.length > 0;
  console.log('🚀 extractErrorInfo - hasFieldErrors:', hasFieldErrors);

  let fieldErrors: Record<string, string> | undefined;
  let message = '';

  if (hasFieldErrors && data.error?.errors) {
    fieldErrors = {};
    const fieldErrorMessages: string[] = [];

    data.error.errors.forEach((fieldError) => {
      fieldErrors![fieldError.field] = fieldError.message;
      fieldErrorMessages.push(fieldError.message);
      console.log(
        `🚀 extractErrorInfo - Added field error: ${fieldError.field} = ${fieldError.message}`
      );
    });
    console.log('🚀 extractErrorInfo - Final fieldErrors:', fieldErrors);

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

  console.log('🚀 extractErrorInfo - Final message:', message);

  const result = { message, fieldErrors };
  console.log('🚀 extractErrorInfo - Final result:', result);
  return result;
};

// Initial state
const initialState: CreateSubUserState = {
  loading: false,
  data: null,
  error: null,
};

// Error payload type for rejected actions
interface CreateSubUserErrorPayload {
  message: string;
  fieldErrors?: Record<string, string>;
}

// Async thunk for creating sub user
export const createSubUser = createAsyncThunk<
  {
    userId?: string;
    workflowId: string;
    workflowStatus: string;
    operationalStatus?: string;
    actionType?: string;
    performedBy?: string;
    performedAt?: string;
    message: string;
  },
  CreateSubUserRequest,
  { rejectValue: CreateSubUserErrorPayload }
>(
  'createSubUser/createSubUser',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Creating sub user...'));
      console.log('Calling create sub user API:', requestData);

      const response = await Secured.post(
        API_ENDPOINTS.create_sub_user,
        requestData
      );

      console.log('Create sub user API Response:', response);

      // Handle success response
      if (response.status === 200) {
        dispatch(hideLoader());
        const successData = response.data as CreateSubUserSuccessResponse;
        return {
          ...successData.data,
          message: 'Submitted for approval',
        };
      }

      // Handle error response with success: false
      if (response.status === 500 || response.status === 400) {
        dispatch(hideLoader());
        const errorData = response.data as CreateSubUserErrorResponse;
        const errorInfo = extractErrorInfo(
          errorData,
          'Failed to create sub user'
        );
        return rejectWithValue(errorInfo);
      }
      dispatch(hideLoader());
      // Fallback error
      return rejectWithValue({ message: 'Invalid response format' });
    } catch (error: unknown) {
      console.error('Create sub user API error:', error);
      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                status?: number;
                type?: string;
                message?: string;
                code?: string;
                errors?: Array<{
                  field: string;
                  message: string;
                }>;
              };
              data?: CreateSubUserErrorResponse['data'];
              message?: string;
            };
            status?: number;
          };
        };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;

        console.log('🚀 Create Sub User Error Response:', {
          status,
          errorData,
          errorType: errorData?.error?.type,
          hasErrors: !!errorData?.error?.errors,
          errors: errorData?.error?.errors,
        });

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
              'Failed to create sub user'
            );
            console.log('🚀 Extracted Error Info:', errorInfo);
            return rejectWithValue(errorInfo);
          }
        }

        // Handle other errors
        if (errorData) {
          const errorInfo = extractErrorInfo(
            errorData,
            'Failed to create sub user'
          );
          console.log('🚀 Extracted Error Info (other):', errorInfo);
          return rejectWithValue(errorInfo);
        }
      }
      dispatch(hideLoader());
      return rejectWithValue({
        message: 'Network error occurred while creating sub user',
      });
    }
  }
);

// Create sub user slice
const createSubUserSlice = createSlice({
  name: 'createSubUserManagement',
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
      .addCase(createSubUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(createSubUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.payload?.message || 'Failed to create sub user';
        state.data = null;
      });
  },
});

export const { clearError, resetState } = createSubUserSlice.actions;
export default createSubUserSlice.reducer;
