import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  EntityProfileSubmissionResponse,
  EntityProfileSubmissionState,
  EntityProfileMetadata,
} from '../types/entityProfileSubmissionTypes';
import { FormField } from '../types/formTypes';
import { StepDocument } from '../types/stepDataTypes';

// Initial state
const initialState: EntityProfileSubmissionState = {
  loading: false,
  success: false,
  error: null,
  response: null,
};

// Async thunk to submit entity profile
export const submitEntityProfile = createAsyncThunk(
  'entityProfileSubmission/submitEntityProfile',
  async (
    {
      formValues,
      workflowId,
      userId,
      formFields,
      stepDocuments,
    }: {
      formValues: Record<string, string | File | null>;
      workflowId: string;
      userId: string;
      formFields?: FormField[];
      stepDocuments: StepDocument[];
    },
    { rejectWithValue }
  ) => {
    try {
      // Check if formValues is empty
      const formValuesCount = Object.keys(formValues).length;

      if (formValuesCount === 0) {
        return rejectWithValue('No form data to submit');
      }

      // Build dynamic field name mapping from form configuration
      const fieldNameMapping: Record<string, string> = {};

      // Create mapping for file fields using fieldFileName if available
      if (formFields) {
        formFields.forEach((field) => {
          if (
            (field.fieldType === 'file' ||
              field.fieldType === 'textfield_with_image') &&
            field.fieldFileName
          ) {
            // Map form field name to API expected field name for file part
            fieldNameMapping[`${field.fieldName}_file`] = field.fieldFileName;
          }
        });
      }

      // Separate files, document IDs, and regular form data
      const files: Record<string, File> = {};
      const documentIds: Record<string, string> = {};
      const metadata: EntityProfileMetadata = {};

      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
          // Handle new file uploads
          const mappedKey = fieldNameMapping[key] || key;
          files[mappedKey] = value;
          console.log(`📤 New file upload: ${key} -> ${mappedKey}`);
        } else if (key.endsWith('_documentId') && typeof value === 'string') {
          // Handle existing document IDs
          documentIds[key] = value;
          console.log(`📋 Existing document ID: ${key} = ${value}`);
        } else if (value !== null && value !== undefined && value !== '') {
          // Handle regular text values
          metadata[key] = String(value);
        }
      });

      // Check if we have any data to send
      const metadataCount = Object.keys(metadata).length;
      const filesCount = Object.keys(files).length;
      const documentIdsCount = Object.keys(documentIds).length;

      if (metadataCount === 0 && filesCount === 0 && documentIdsCount === 0) {
        console.error('❌ No metadata, files, or document IDs to submit!');
        return rejectWithValue(
          'No data to submit - metadata, files, and document IDs are all empty'
        );
      }

      console.log('📊 Form data summary:', {
        metadata: metadataCount,
        newFiles: filesCount,
        existingDocuments: documentIdsCount,
      });

      // Dynamically validate required fields based on form configuration
      if (formFields && formFields.length > 0) {
        const requiredFieldsInfo = formFields
          .filter(
            (field) =>
              field.validationRules && field.validationRules.required === true
          )
          .map((field) => ({
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
          }));

        let missingFieldsInfo = requiredFieldsInfo.filter((fieldInfo) => {
          const value =
            metadata[fieldInfo.fieldName] || files[fieldInfo.fieldName];
          return !value || (typeof value === 'string' && value.trim() === '');
        });

        missingFieldsInfo = missingFieldsInfo.filter(
          (m) => !stepDocuments.some((d) => d.fieldKey === m.fieldName)
        );

        if (missingFieldsInfo.length > 0) {
          const missingFieldLabels = missingFieldsInfo.map(
            (field) => field.fieldLabel
          );

          console.log(missingFieldLabels, stepDocuments);
          console.warn('⚠️ Missing required fields:', missingFieldsInfo);
          const errorMessage = `Missing required fields: ${missingFieldLabels.join(', ')}`;
          return rejectWithValue(errorMessage);
        }

        console.log('✅ All required fields are present');
      } else {
        console.log(
          'ℹ️ No form fields provided for validation, skipping required field check'
        );
      }

      // Create FormData for multipart/form-data request
      const formData = new FormData();

      // Try both approaches - first with Blob, then fallback to string
      // Add metadata as JSON string with proper content type (matching curl example)
      const metadataJson = JSON.stringify(metadata);
      // console.log('📋 Final metadata JSON:', metadataJson);

      // Validate metadata JSON before sending
      try {
        JSON.parse(metadataJson);
        console.log('✅ Metadata JSON is valid');
      } catch (error) {
        console.error('❌ Invalid metadata JSON:', error);
        return rejectWithValue('Invalid metadata JSON format');
      }

      formData.append('metadata', metadataJson);
      formData.append('workflowId', workflowId);
      formData.append('userId', userId);

      // Add new files
      Object.entries(files).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
        console.log(`📎 Added file to FormData: ${fieldName} = ${file.name}`);
      });

      // Add existing document IDs to metadata (they should be sent as part of metadata, not as separate form fields)
      Object.entries(documentIds).forEach(([key, documentId]) => {
        metadata[key] = documentId;
        console.log(`📋 Added document ID to metadata: ${key} = ${documentId}`);
      });

      // Re-create metadata JSON with document IDs included
      if (Object.keys(documentIds).length > 0) {
        const updatedMetadataJson = JSON.stringify(metadata);
        console.log(
          '📋 Updated metadata JSON with document IDs:',
          updatedMetadataJson
        );

        // Replace the metadata in FormData
        formData.set('metadata', updatedMetadataJson);
      }

      // Debug: Log FormData contents
      interface FormDataEntry {
        key: string;
        value: string;
        type: string;
        size?: number;
        mimeType?: string;
        lastModified?: number;
      }

      const formDataEntries: FormDataEntry[] = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          const fileInfo: FormDataEntry = {
            key,
            value: `File(${value.name})`,
            type: 'File',
            size: value.size,
            mimeType: value.type,
            lastModified: value.lastModified,
          };
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
          formDataEntries.push(fileInfo);
        } else {
          console.log(`  ${key}: ${value}`);
          formDataEntries.push({
            key,
            value: String(value),
            type: typeof value,
          });
        }
      }

      // console.log('📊 Complete FormData structure:', formDataEntries);

      // Additional check: Verify FormData is not empty
      const formDataSize = Array.from(formData.entries()).length;

      if (formDataSize === 0) {
        return rejectWithValue('FormData is empty - no data to submit');
      }

      // Make API call with FormData
      // Note: Don't set Content-Type manually, let axios handle it for FormData
      const response = await Secured.post(
        API_ENDPOINTS.submit_entity_profile,
        formData
      );

      console.log('✅ Entity profile submission successful:', response.data);
      return response.data as EntityProfileSubmissionResponse;
    } catch (error: unknown) {
      console.error('❌ Entity profile submission failed:', error);

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
          axiosError.response?.data?.error || axiosError.response?.data;

        console.error('📋 Error details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
        });

        // Log the full error response for debugging
        if (axiosError.response?.data) {
          console.error(
            '🔍 Full error response:',
            JSON.stringify(axiosError.response.data, null, 2)
          );
        }

        // Handle form validation errors (status 400 with ERROR_FORM_VALIDATION)
        if (
          axiosError.response?.status === 400 &&
          errorData &&
          typeof errorData === 'object' &&
          'type' in errorData &&
          errorData.type === 'ERROR_FORM_VALIDATIONS' &&
          'errors' in errorData &&
          Array.isArray(errorData.errors)
        ) {
          console.error('🔍 Field validation errors:', errorData.errors);

          // Return structured error for field-level validation
          return rejectWithValue({
            type: 'FIELD_VALIDATION_ERROR',
            message:
              (errorData as { message?: string }).message ||
              'Form validation failed',
            fieldErrors: errorData.errors.reduce(
              (
                acc: Record<string, string>,
                err: { field: string; message: string }
              ) => {
                acc[err.field] = err.message;
                return acc;
              },
              {}
            ),
            status: axiosError.response.status,
            code: (errorData as { code?: string }).code,
          });
        }

        // Handle other error types
        const errorMessage =
          (errorData && typeof errorData === 'object' && 'message' in errorData
            ? (errorData as { message?: string }).message
            : null) ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to submit entity profile';

        return rejectWithValue({
          type: 'GENERAL_ERROR',
          message: errorMessage,
          status: axiosError.response?.status,
          code:
            errorData && typeof errorData === 'object' && 'code' in errorData
              ? (errorData as { code?: string }).code
              : undefined,
        });
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit entity profile';
      return rejectWithValue(errorMessage);
    }
  }
);

// Entity Profile Submission slice
const entityProfileSubmissionSlice = createSlice({
  name: 'entityProfileSubmission',
  initialState,
  reducers: {
    // Reset submission state
    resetSubmissionState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.response = null;
    },

    // Clear error
    clearSubmissionError: (state) => {
      state.error = null;
    },

    // Set error
    setSubmissionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitEntityProfile.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.response = null;
      })
      .addCase(submitEntityProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.response = action.payload;
      })
      .addCase(submitEntityProfile.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.response = null;
      });
  },
});

// Export actions
export const {
  resetSubmissionState,
  clearSubmissionError,
  setSubmissionError,
} = entityProfileSubmissionSlice.actions;

// Export reducer
export default entityProfileSubmissionSlice.reducer;

// Root state interface for selectors
interface RootState {
  entityProfileSubmission: EntityProfileSubmissionState;
}

// Selectors
export const selectSubmissionLoading = (state: RootState) =>
  state.entityProfileSubmission.loading;
export const selectSubmissionSuccess = (state: RootState) =>
  state.entityProfileSubmission.success;
export const selectSubmissionError = (state: RootState) =>
  state.entityProfileSubmission.error;
export const selectSubmissionResponse = (state: RootState) =>
  state.entityProfileSubmission.response;
