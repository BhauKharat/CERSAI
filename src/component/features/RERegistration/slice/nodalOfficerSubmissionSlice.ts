import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  NodalOfficerSubmissionRequest,
  NodalOfficerSubmissionResponse,
  NodalOfficerSubmissionState,
} from '../types/nodalOfficerSubmissionTypes';

// Initial state
const initialState: NodalOfficerSubmissionState = {
  loading: false,
  success: false,
  error: null,
  response: null,
};

// Async thunk to submit nodal officer details
export const submitNodalOfficer = createAsyncThunk(
  'nodalOfficerSubmission/submitNodalOfficer',
  async (
    { formValues, workflowId, userId }: NodalOfficerSubmissionRequest,
    { rejectWithValue }
  ) => {
    try {
      console.log('🚀 Starting Nodal Officer submission process');
      console.log('📋 Form values received:', Object.keys(formValues));
      console.log('🔧 Workflow ID:', workflowId);
      console.log('👤 User ID:', userId);

      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Prepare metadata object (non-file fields)
      const metadata: Record<string, unknown> = {};
      const fileFields: Record<string, File> = {};

      // Separate files from other form data
      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`📎 File field detected: ${key} -> ${value.name}`);
          fileFields[key] = value;
        } else if (value !== null && value !== undefined && value !== '') {
          metadata[key] = value;
        }
      });

      console.log('📊 Metadata fields:', Object.keys(metadata));
      console.log('📎 File fields:', Object.keys(fileFields));

      // Add metadata as JSON string
      formData.append('metadata', JSON.stringify(metadata));

      // Add userId and workflowId
      formData.append('userId', userId);
      formData.append('workflowId', workflowId);

      // Add file fields
      Object.entries(fileFields).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
        console.log(
          `📎 Added file: ${fieldName} -> ${file.name} (${file.size} bytes)`
        );
      });

      // Log FormData contents for debugging
      console.log('📦 FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Validate FormData
      const formDataEntries = Array.from(formData.entries());
      console.log(`📊 Total FormData entries: ${formDataEntries.length}`);

      // Additional check: Verify FormData is not empty
      const formDataSize = Array.from(formData.entries()).length;

      if (formDataSize === 0) {
        return rejectWithValue('FormData is empty - no data to submit');
      }

      // Make API call with FormData
      // Note: Don't set Content-Type manually, let axios handle it for FormData
      const response = await Secured.post(
        API_ENDPOINTS.submit_nodal_officer,
        formData
      );

      console.log('✅ Nodal Officer submission successful:', response.data);
      return response.data as NodalOfficerSubmissionResponse;
    } catch (error: unknown) {
      console.error('❌ Nodal Officer submission failed:', error);

      // Handle different types of errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: {
                status?: number;
                code?: string;
                type?: string;
                message?: string;
                errors?: Array<{ field: string; message: string }>;
              };
              status?: number;
              code?: string;
              type?: string;
              errors?: Array<{ field: string; message: string }>;
            };
            status?: number;
            statusText?: string;
            headers?: Record<string, unknown>;
          };
          message?: string;
        };

        const errorData =
          axiosError.response?.data || axiosError.response?.data?.error;
        const status = axiosError.response?.status;
        const statusText = axiosError.response?.statusText;

        console.error('🔍 Nodal Officer API Error Details:', {
          status,
          statusText,
          errorData,
        });

        console.log(
          '🔍 Raw errorData structure:',
          JSON.stringify(errorData, null, 2)
        );

        // Define interface for validation error structure
        interface ValidationErrorStructure {
          type: string;
          message?: string;
          errors: Array<{ field: string; message: string }>;
        }

        // Handle form validation errors (status 400 with ERROR_FORM_VALIDATION)
        // Check both direct structure and nested under 'error' object
        const validationErrorData =
          errorData && typeof errorData === 'object' && 'error' in errorData
            ? (errorData as { error: unknown }).error
            : errorData;

        console.log(
          '🔍 Validation error data:',
          JSON.stringify(validationErrorData, null, 2)
        );

        // Type guard function to check if data matches validation error structure
        const isValidationError = (
          data: unknown
        ): data is ValidationErrorStructure => {
          return (
            data !== null &&
            typeof data === 'object' &&
            'type' in data &&
            'errors' in data &&
            (data as ValidationErrorStructure).type ===
              'ERROR_FORM_VALIDATIONS' &&
            Array.isArray((data as ValidationErrorStructure).errors)
          );
        };

        if (
          axiosError.response?.status === 400 &&
          isValidationError(validationErrorData)
        ) {
          console.error(
            '🔍 Nodal Officer field validation errors:',
            validationErrorData.errors
          );

          // Return structured error for field-level validation
          return rejectWithValue({
            type: errorData?.type,
            message:
              validationErrorData.message ||
              'Nodal Officer form validation failed',
            fieldErrors: validationErrorData.errors.reduce(
              (
                acc: Record<string, string>,
                err: { field: string; message: string }
              ) => {
                acc[err.field] = err.message;
                return acc;
              },
              {}
            ),
          });
        }

        // Handle other validation errors (usually 400 with field-specific errors)
        if (status === 400 && errorData && typeof errorData === 'object') {
          const validationError = errorData as {
            message?: string;
            errors?: Record<string, string[]>;
          };

          if (validationError.errors) {
            console.error(
              '🔍 Nodal Officer field validation errors:',
              validationError.errors
            );
          }

          return rejectWithValue(
            validationError.message || 'Validation failed'
          );
        }

        // Handle other HTTP errors
        const errorMessage =
          errorData && typeof errorData === 'object' && 'message' in errorData
            ? (errorData as { message?: string }).message
            : axiosError.message || `HTTP ${status}: ${statusText}`;

        return rejectWithValue(
          errorMessage || 'Nodal Officer submission failed'
        );
      }

      // Handle network errors or other exceptions
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : 'Network error or unexpected failure';

      return rejectWithValue(errorMessage || 'Unknown error occurred');
    }
  }
);

// Redux slice
const nodalOfficerSubmissionSlice = createSlice({
  name: 'nodalOfficerSubmission',
  initialState,
  reducers: {
    resetSubmissionState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.response = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitNodalOfficer.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.response = null;
      })
      .addCase(submitNodalOfficer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.response = action.payload;
      })
      .addCase(submitNodalOfficer.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.response = null;
      });
  },
});

// Export actions
export const { resetSubmissionState, clearError } =
  nodalOfficerSubmissionSlice.actions;

// Export selectors
export const selectNodalOfficerSubmissionLoading = (state: {
  nodalOfficerSubmission: NodalOfficerSubmissionState;
}) => state.nodalOfficerSubmission.loading;

export const selectNodalOfficerSubmissionSuccess = (state: {
  nodalOfficerSubmission: NodalOfficerSubmissionState;
}) => state.nodalOfficerSubmission.success;

export const selectNodalOfficerSubmissionError = (state: {
  nodalOfficerSubmission: NodalOfficerSubmissionState;
}) => state.nodalOfficerSubmission.error;

export const selectNodalOfficerSubmissionResponse = (state: {
  nodalOfficerSubmission: NodalOfficerSubmissionState;
}) => state.nodalOfficerSubmission.response;

// Export reducer
export default nodalOfficerSubmissionSlice.reducer;
