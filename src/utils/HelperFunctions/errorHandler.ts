/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Error response interfaces based on your API specification
 */
export interface ApiErrorField {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    status: number;
    code: string;
    type: string;
    message: string;
    errors?: ApiErrorField[];
  };
}

export interface ProcessedError {
  message: string;
  status: number;
  code: string;
  type: string;
  fieldErrors?: Record<string, string>;
  isValidationError: boolean;
}

/**
 * Processes API error responses and returns a standardized error object
 * @param error - The error object from axios or fetch
 * @returns ProcessedError object with standardized error information
 */
export const processApiError = (error: any): ProcessedError => {
  console.log('🚀 Processing API Error:', error);

  // Default error structure
  const defaultError: ProcessedError = {
    message: 'An unexpected error occurred. Please try again.',
    status: 500,
    code: error?.code || 'ERR_UNKNOWN',
    type: error?.type || 'ERROR_UNKNOWN',
    isValidationError: false,
  };

  try {
    // Handle axios errors
    if (error.response?.data) {
      const errorData = error.response.data;
      console.log('🚀 Raw Error Response Data:', errorData);

      // Check if it matches your API error format
      if (errorData.error) {
        const apiError = errorData.error;

        // Determine if this is a validation error that should show field-specific errors
        const isFormValidationError =
          apiError.type === 'ERROR_FORM_VALIDATION' ||
          apiError.type === 'ERROR_FORM_VALIDATIONS';
        const hasFieldErrors =
          apiError.errors &&
          Array.isArray(apiError.errors) &&
          apiError.errors.length > 0;

        const processedError: ProcessedError = {
          message:
            apiError.message || getDefaultMessageByStatus(apiError.status),
          status: apiError.status,
          code: apiError.code,
          type: apiError.type,
          fieldErrors: undefined, // Will be set below if applicable
          isValidationError: isFormValidationError,
        };

        // Handle ERROR_FORM_VALIDATION - always show field-specific errors
        if (isFormValidationError && hasFieldErrors) {
          const fieldErrors: Record<string, string> = {};

          apiError.errors.forEach(
            (fieldError: ApiErrorField, index: number) => {
              console.log(`🚀 Processing field error ${index}:`, fieldError);
              console.log(
                `🚀 Field: ${fieldError.field}, Message: ${fieldError.message}`
              );
              fieldErrors[fieldError.field] = fieldError.message;
            }
          );

          console.log('🚀 Final fieldErrors object:', fieldErrors);
          processedError.fieldErrors = fieldErrors;

          // For ERROR_FORM_VALIDATION, prioritize field errors over general message
          if (!processedError.message || processedError.message.trim() === '') {
            processedError.message =
              'Please correct the validation errors highlighted in the form.';
          }
        }
        // Handle ERROR_INVALID_DATA and other types - show general message only
        else {
          // For non-validation errors, don't set field errors even if they exist
          // This ensures only ERROR_FORM_VALIDATION shows field-specific errors
          processedError.fieldErrors = undefined;

          // Ensure we have a meaningful message for non-validation errors
          if (!processedError.message || processedError.message.trim() === '') {
            processedError.message = getDefaultMessageByStatus(apiError.status);
          }
        }

        console.log('🚀 Final Processed Error:', processedError);
        console.log('🚀 Final Field Errors:', processedError.fieldErrors);

        // Create a deep copy to ensure no reference issues
        const finalError = {
          ...processedError,
          fieldErrors: processedError.fieldErrors
            ? { ...processedError.fieldErrors }
            : undefined,
        };

        console.log('🚀 Returning Final Error:', finalError);
        console.log('🚀 Returning Final Field Errors:', finalError.fieldErrors);
        return finalError;
      }

      // Handle other error formats (legacy support)
      if (errorData.message) {
        return {
          ...defaultError,
          message: errorData.message,
          status: error.response.status || 500,
        };
      }
    }

    // Handle fetch errors or network errors
    if (error.message) {
      return {
        ...defaultError,
        message: error.message,
        status: error.status || 500,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        ...defaultError,
        message: error,
      };
    }
  } catch (processingError) {
    console.error('Error while processing API error:', processingError);
  }

  return defaultError;
};

/**
 * Returns default error messages based on HTTP status codes
 */
const getDefaultMessageByStatus = (status: number): string => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict detected. The resource already exists or is in use.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The request took too long to process.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Formats field errors for display in forms
 * @param fieldErrors - Object containing field-specific error messages
 * @returns Formatted string of all field errors
 */
export const formatFieldErrors = (
  fieldErrors: Record<string, string>
): string => {
  return Object.entries(fieldErrors)
    .map(([field, message]) => `${field}: ${message}`)
    .join(', ');
};

/**
 * Checks if an error is a validation error
 * @param error - Processed error object
 * @returns boolean indicating if it's a validation error
 */
export const isValidationError = (error: ProcessedError): boolean => {
  return error.isValidationError || error.type === 'ERROR_FORM_VALIDATION';
};

/**
 * Checks if an error is an authentication error
 * @param error - Processed error object
 * @returns boolean indicating if it's an auth error
 */
export const isAuthError = (error: ProcessedError): boolean => {
  return error.status === 401 || error.status === 403;
};

/**
 * Gets user-friendly error message for toast notifications
 * @param error - Processed error object
 * @returns User-friendly error message
 */
export const getToastErrorMessage = (error: ProcessedError): string => {
  if (error.isValidationError && error.fieldErrors) {
    return error.message || 'Please correct the validation errors.';
  }

  return error.message;
};

/**
 * Helper function for Redux slices to handle API errors consistently
 * @param error - The error from the API call (from rejectWithValue)
 * @returns Processed error information
 */
export const handleSliceError = (error: any): ProcessedError => {
  // Check if the error already has processed error information (from interceptor)
  if (error.processedError) {
    return error.processedError;
  }

  // Process the error if it hasn't been processed yet
  return processApiError(error);
};

/**
 * Creates a standardized error message for Redux slice rejection
 * @param error - The error object
 * @returns String message for rejectWithValue
 */
export const createSliceErrorMessage = (error: any): string => {
  const processedError = handleSliceError(error);
  return processedError.message;
};

/**
 * Creates a detailed error object for Redux slice rejection
 * @param error - The error object
 * @returns Detailed error object for rejectWithValue
 */
export const createSliceErrorObject = (error: any): ProcessedError => {
  return handleSliceError(error);
};
