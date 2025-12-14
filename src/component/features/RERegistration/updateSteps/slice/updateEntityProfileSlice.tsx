/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';
import { EntityProfileSubmissionResponse } from '../../types/entityProfileSubmissionTypes';
export const submitUpdatedEntityProfile = createAsyncThunk(
  'entityProfileSubmission/submitEntityProfile',
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
      const formData = new FormData();

      // Prepare metadata object (only non-file fields with non-empty values)
      const metadata: Record<string, string> = {};
      const fileFields: Record<string, File> = {};

      // Separate metadata fields from file fields
      // Only include metadata fields that have non-empty values
      // Only include files that are newly uploaded (File instances)
      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
          // Only send newly uploaded files
          fileFields[key] = value;
        } else if (value !== null && value !== undefined && value !== '') {
          // Only send non-empty metadata values
          metadata[key] = String(value);
        }
      });
      // Add metadata as JSON string
      formData.append('metadata', JSON.stringify(metadata));

      // Add userId
      formData.append('userId', userId);

      // Add files with their field names (only newly uploaded files)
      Object.entries(fileFields).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
      });

      //Make the API call (PUT request for update)
      const response = await Secured.put(
        API_ENDPOINTS.submit_update_entity_profile,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
