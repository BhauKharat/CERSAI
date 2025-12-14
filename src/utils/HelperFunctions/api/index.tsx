/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { store } from '../../../redux/store';
import { API_URL, API_URL_REINITILIZE, toastErrorMessages } from 'Constant';
import { resetAuth } from '../../../redux/slices/registerSlice/authSlice';
import { resetHOI } from '../../../redux/slices/registerSlice/institutiondetailSlice';
import { resetRegitsration } from '../../../redux/slices/registerSlice/registrationSlice';
import { resetAddressState } from '../../../redux/slices/registerSlice/addressSlice';
import { resetNodal } from '../../../redux/slices/registerSlice/nodalOfficerSlice';
import { resetAdminOfficerState } from '../../../redux/slices/registerSlice/institutionadminSlice';
import { resetPreview } from '../../../redux/slices/registerSlice/applicationPreviewSlice';
import { processApiError } from '../errorHandler';
// import { toast } from 'react-toastify';

// Flags to prevent multiple redirects
let isRedirecting = false;
let redirectCount = 0;
const MAX_REDIRECTS = 1;

export const resetState = () => {
  store.dispatch(resetAuth());
  store.dispatch(resetRegitsration());
  store.dispatch(resetAddressState());
  store.dispatch(resetHOI());
  store.dispatch(resetNodal());
  store.dispatch(resetAdminOfficerState());
  store.dispatch(resetPreview());
};

// Function to handle logout and redirect
const handleAuthError = (error: any) => {
  if (isRedirecting || redirectCount >= MAX_REDIRECTS) {
    console.log('Redirect already in progress or max redirects reached');
    return;
  }

  const currentPath = window.location.pathname;
  const authPages = [
    '/login',
    '/re-signup',
    '/re-forgot-password',
    '/re-set-new-password',
  ];
  const isOnAuthPage = authPages.some((page) => currentPath.includes(page));

  if (isOnAuthPage) {
    console.log('Already on auth page, skipping redirect');
    return;
  }
  const state = store.getState();
  const role = state.auth?.userDetails?.role;
  console.log('isOnAuthPage', role);
  console.log('Handling auth error for URL:', error.config?.url);
  if (role == 'registrationEntity') {
    // window.location.replace('/ckyc/re/dashboard');
  } else {
    // window.location.replace('/ckyc/admin/dashboard');
  }

  // isRedirecting = true;
  // redirectCount++;

  // try {
  //   // resetState();
  //   // localStorage.clear();
  //   // sessionStorage.clear();
  //   // console.log('Redirecting to login page');
  //   console.log('redirect:----');
  //   window.location.replace('/ckyc/re/dashboard');
  // } catch (error) {
  //   console.error('Error during auth error handling:', error);
  // }

  // setTimeout(() => {
  //   window.location.replace('/ckyc/re/dashboard');
  // }, 5000);
};

// MAIN SECURED INSTANCE - WITH INTERCEPTOR
export const Secured = axios.create({
  baseURL: API_URL,
  // Don't set Content-Type here - let axios handle it based on data type
});

Secured.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.authToken;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Set Content-Type based on data type
    if (config.data instanceof FormData) {
      // For FormData, don't set Content-Type - let axios handle it with boundary
      console.log(
        '🚀 API Request - FormData detected, letting axios handle Content-Type'
      );
    } else if (config.data && typeof config.data === 'object') {
      // For regular JSON requests, set application/json and filter empty values
      config.headers['Content-Type'] = 'application/json';

      // Helper function to check if a value is empty
      const isEmpty = (value: any): boolean => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
      };

      // Filter out empty values from the data object (only for JSON requests)
      // Skip filtering if data is an array (e.g., for filter APIs)
      if (config.method === 'post' && !Array.isArray(config.data)) {
        const filteredData: Record<string, any> = {};
        Object.keys(config.data).forEach((key) => {
          if (!isEmpty(config.data[key])) {
            filteredData[key] = config.data[key];
          }
        });
        config.data = filteredData;
        console.log('🚀 API Request - Filtered empty values from JSON payload');
      } else if (Array.isArray(config.data)) {
        console.log(
          '🚀 API Request - Array payload detected, skipping filtering'
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to clean empty values from data (recursive)
export const cleanEmptyValues = (
  data: Record<string, unknown>
): Record<string, unknown> => {
  const isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length === 0;
    }
    return false;
  };

  const cleanRecursively = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      // Clean array elements recursively and filter out empty ones
      const cleanedArray = obj
        .map(cleanRecursively)
        .filter((item) => !isEmpty(item));
      return cleanedArray.length > 0 ? cleanedArray : undefined;
    }

    if (typeof obj === 'object' && obj !== null) {
      // Clean object properties recursively
      const cleaned: Record<string, unknown> = {};
      Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
        const cleanedValue = cleanRecursively(value);
        if (!isEmpty(cleanedValue)) {
          cleaned[key] = cleanedValue;
        }
      });
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }

    // For primitive values, return as-is if not empty
    return isEmpty(obj) ? undefined : obj;
  };

  const result = cleanRecursively(data);
  return (result as Record<string, unknown>) || {};
};

// Reusable function for FormData requests with file upload support
export const postFormData = async (
  url: string,
  data: Record<string, unknown>,
  options: {
    additionalFields?: Record<string, string>;
    cleanMetadata?: boolean;
    metadataKey?: string;
  } = {}
) => {
  const {
    additionalFields = {},
    cleanMetadata = true,
    metadataKey = 'metadata',
  } = options;

  try {
    // Get auth token
    const state = store.getState();
    const token = state.auth.authToken;

    // Create FormData
    const formData = new FormData();

    // Separate files from metadata
    const metadataOnly: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`Adding file to FormData: ${key}`, value);
        formData.append(key, value);
      } else {
        metadataOnly[key] = value;
      }
    });

    // Clean metadata if requested
    const finalMetadata = cleanMetadata
      ? cleanEmptyValues(metadataOnly)
      : metadataOnly;

    // Add metadata as JSON string
    if (Object.keys(finalMetadata).length > 0) {
      formData.append(metadataKey, JSON.stringify(finalMetadata));
    }

    // Add additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Make request with axios
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let axios handle FormData boundary
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('FormData request error:', error);

    // Handle API error responses with structured error format
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;

      // Create structured error object for better handling
      const structuredError = {
        status: apiError.status,
        code: apiError.code,
        type: apiError.type,
        message: apiError.message,
        errors: apiError.errors || [], // Field-specific errors for form validation
        originalError: error,
      };

      console.error('Structured API error:', structuredError);
      throw structuredError;
    }

    throw error;
  }
};

Secured.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Secured interceptor error:', error);

    // Process the error using our error handler
    const processedError = processApiError(error);
    console.log('🚀 Processed Error:', processedError);

    // Handle authentication errors (401/403)
    if (processedError.status === 401 || processedError.status === 403) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest =
        requestUrl.includes('login') ||
        requestUrl.includes('signup') ||
        requestUrl.includes('auth') ||
        requestUrl.includes('token') ||
        requestUrl.includes('refresh') ||
        requestUrl.includes('forgot') ||
        requestUrl.includes('password');

      if (isAuthRequest) {
        console.log('Auth request failed, not redirecting:', requestUrl);
        // Return the processed error for auth requests
        const enhancedError = {
          ...error,
          processedError,
          message: processedError.message,
        };
        return Promise.reject(enhancedError);
      }

      console.error(toastErrorMessages.unauthorizedErrorMessage);
      // toast.error(toastErrorMessages.unauthorizedErrorMessage);
      handleAuthError(error);
    }

    // Enhance the error object with processed error information
    const enhancedError = {
      ...error,
      processedError,
      message: processedError.message,
    };

    return Promise.reject(enhancedError);
  }
);

// REINITIALIZE INSTANCE - NO INTERCEPTOR, HANDLES 403 GRACEFULLY
export const ReinitializeAPI = axios.create({
  baseURL: API_URL_REINITILIZE,
  headers: {
    'Content-Type': 'application/json',
  },
});

ReinitializeAPI.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.authToken;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// NO RESPONSE INTERCEPTOR FOR REINITIALIZE API
// This allows 403 errors to be handled by the component

// AUTH INSTANCE - FOR LOGIN/SIGNUP/PASSWORD RESET - NO INTERCEPTOR
export const AuthAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NO INTERCEPTORS FOR AUTH API

// MASTER DATA INSTANCE - FOR DROPDOWNS/GEOGRAPHY - NO INTERCEPTOR
export const MasterAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

MasterAPI.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.authToken;
    console.log('Token====', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// NO RESPONSE INTERCEPTOR FOR MASTER API
// Master data failures shouldn't trigger logout

// Reset flags when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login')) {
      isRedirecting = false;
      redirectCount = 0;
    }
  });

  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login')) {
      isRedirecting = false;
      redirectCount = 0;
    }
  });
}
