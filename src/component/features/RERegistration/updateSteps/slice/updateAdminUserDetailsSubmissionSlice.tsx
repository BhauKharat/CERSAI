/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';

export interface AdminUserSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    workflowId: string;
    stepName: string;
    status: string;
  };
}

export const submitUpdatedAdminUserDetails = createAsyncThunk(
  'adminUserSubmission/submitAdminUserDetails',
  async (
    {
      formValues,
      userId,
    }: {
      formValues: Record<
        string,
        string | File | number | boolean | object | null
      >;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        '📥 Received formValues for Admin User submission:',
        formValues
      );

      const formData = new FormData();

      // Prepare metadata object (all non-file fields)
      const metadata: Record<string, string> = {};
      const fileFields: Record<string, File> = {};

      // Separate metadata fields from file fields
      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
          fileFields[key] = value;
        } else if (value !== null && value !== undefined && value !== '') {
          metadata[key] = String(value);
        }
      });

      // Add metadata as JSON string
      formData.append('metadata', JSON.stringify(metadata));

      // Add userId
      formData.append('userId', userId);

      // Add files with their field names
      Object.entries(fileFields).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
      });

      // Log the FormData structure (for debugging)
      console.log('📦 FormData structure for Admin User submission:');
      for (const [key, value] of (formData as any).entries()) {
        if (key === 'metadata') {
          console.log(`  ${key}: ${value}`);
        } else if (value instanceof File) {
          console.log(`  ${key}: File - ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Make the API call
      const response = await Secured.put(
        API_ENDPOINTS.submit_update_admin_user_details,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(
        '✅ Admin User details submission successful:',
        response.data
      );
      return response.data as AdminUserSubmissionResponse;
    } catch (error: unknown) {
      console.error('❌ Admin User details submission failed:', error);

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

        if (axiosError.response?.data) {
          console.error(
            '🔍 Full error response:',
            JSON.stringify(axiosError.response.data, null, 2)
          );
        }

        // Handle form validation errors
        if (
          axiosError.response?.status === 400 &&
          errorData &&
          typeof errorData === 'object' &&
          'type' in errorData &&
          (errorData.type === 'ERROR_FORM_VALIDATION' ||
            errorData.type === 'ERROR_FORM_VALIDATIONS') &&
          'errors' in errorData &&
          Array.isArray(errorData.errors)
        ) {
          console.error('🔍 Field validation errors:', errorData.errors);

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

        const errorMessage =
          (errorData && typeof errorData === 'object' && 'message' in errorData
            ? (errorData as { message?: string }).message
            : null) ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to submit admin user details';

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
          : 'Failed to submit admin user details';
      return rejectWithValue(errorMessage);
    }
  }
);
