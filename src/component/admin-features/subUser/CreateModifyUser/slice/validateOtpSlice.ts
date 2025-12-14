import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../../../Constant';
import { allowedGroupsCersai } from '../../../../../enums/userRoles.enum';
import {
  hideLoader,
  showLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { RootState } from '../../../../../redux/store';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import {
  ApiErrorResponse,
  ErrorInnerData,
  ResendOtpPayload,
  ValidateOtpErrorResponse,
  ValidateOtpPayload,
  ValidateOtpRequest,
  ValidateOtpState,
  ValidateOtpSuccessResponse,
} from '../types/validateOtpTypes';

// Initial state
const initialState: ValidateOtpState = {
  loading: false,
  data: null,
  error: null,
  mobileOtpError: null,
  emailOtpError: null,
};

// Async thunk for validating OTP
export const validateOtp = createAsyncThunk<
  { otp_identifier: string },
  ValidateOtpRequest,
  { rejectValue: string }
>(
  'validateOtp/validateOtp',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Validating OTP...'));
      console.log(
        'Calling validate OTP API with payload:',
        JSON.stringify(requestData, null, 2)
      );
      const token = localStorage.getItem('token');

      const response = await axios({
        method: 'post',
        url: `${process.env.REACT_APP_API_BASE_URL}${API_ENDPOINTS.validate_otp_user_management}`,
        data: requestData,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        transformRequest: [(data) => JSON.stringify(data)], // Manually stringify to preserve empty strings
      });

      console.log('Validate OTP API Response:', response.data);

      // Handle success response
      if (response.data && response.data.success === true) {
        dispatch(hideLoader());
        const successData = response.data as ValidateOtpSuccessResponse;
        return successData.data;
      }

      // Handle error response with success: false
      if (response.data && response.data.success === false) {
        dispatch(hideLoader());
        const errorData = response.data as ValidateOtpErrorResponse;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to validate OTP'
        );
      }

      // Fallback error
      return rejectWithValue('Invalid response format');
    } catch (error: unknown) {
      console.error('Validate OTP API error:', error);
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: ValidateOtpErrorResponse };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to validate OTP'
          );
        }
      }
      return rejectWithValue('Network error occurred while validating OTP');
    }
  }
);

export const resendOtpReq = createAsyncThunk<
  { success: boolean; message: string },
  ResendOtpPayload,
  { rejectValue: string }
>('signup/resendOtp', async (payload, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState;
    const { adminUserDetails } = state.auth;

    const isAdmin =
      adminUserDetails?.data?.groups?.some((role) =>
        allowedGroupsCersai.includes(role)
      ) ?? false;

    const endpoint = isAdmin
      ? API_ENDPOINTS.POST_RESEND_OTP_ADMIN
      : API_ENDPOINTS.post_resend_otp;

    const response = await Secured.post(endpoint, payload);
    return response.data;
  } catch (error: unknown) {
    let errorMessage = 'An unexpected error occurred.';
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response: unknown }).response &&
      typeof (error as { response: unknown }).response === 'object'
    ) {
      const apiError = (error as { response: ApiErrorResponse }).response;
      const data = apiError.data;

      if (data) {
        errorMessage =
          data.data?.errorMessage ||
          data.message ||
          (typeof data === 'string' ? data : errorMessage);
      }
    }
    return rejectWithValue(errorMessage);
  }
});

export const validateOtpHandle = createAsyncThunk<
  ValidateOtpSuccessResponse,
  ValidateOtpPayload,
  { rejectValue: string }
>(
  'signup/validateOtpHandle',
  async (payload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { adminUserDetails } = state.auth;

      const isAdmin =
        adminUserDetails?.data?.groups?.some((role) =>
          allowedGroupsCersai.includes(role)
        ) ?? false;

      // const endpoint = isAdmin
      //   ? API_ENDPOINTS.POST_VALIDATE_OTP
      //   : API_ENDPOINTS.post_resend_otp;
      const endpoint = isAdmin
        ? API_ENDPOINTS.POST_VALIDATE_OTP_ADMIN
        : API_ENDPOINTS.post_resend_otp;

      const response = await Secured.post(endpoint, payload);

      if (response.status === 200 || response.data?.success === true) {
        return response.data as ValidateOtpSuccessResponse;
      }

      const responseData: ErrorInnerData | undefined = response.data?.data;
      const isValid = responseData?.valid;

      if (isValid === false) {
        const smsOtpValid = responseData?.smsOtpValid;
        const emailOtpValid = responseData?.emailOtpValid;

        // Generate specific error message based on which OTP is invalid
        if (!smsOtpValid && !emailOtpValid) {
          return rejectWithValue('Invalid OTP for both mobile and email');
        } else if (!smsOtpValid) {
          return rejectWithValue('Invalid OTP for mobile');
        } else if (!emailOtpValid) {
          return rejectWithValue('Invalid OTP for email');
        } else {
          return rejectWithValue('Invalid OTP');
        }
      }
      return response.data as ValidateOtpSuccessResponse;
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response: unknown }).response &&
        typeof (error as { response: unknown }).response === 'object'
      ) {
        const apiError = (error as { response: ApiErrorResponse }).response;
        const data = apiError.data;

        if (data) {
          errorMessage =
            data.data?.errorMessage ||
            data.message ||
            (typeof data === 'string' ? data : errorMessage);
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Validate OTP slice
const validateOtpSlice = createSlice({
  name: 'validateOtp',
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
      .addCase(validateOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      })
      .addCase(validateOtpHandle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.mobileOtpError = null;
        state.emailOtpError = null;
      })
      .addCase(validateOtpHandle.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.mobileOtpError = null;
        state.emailOtpError = null;
      })
      .addCase(validateOtpHandle.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload || 'Failed to validate OTP';
        state.error = errorMessage;

        // Set field-specific errors based on the error message
        if (
          errorMessage.includes('mobile and email') ||
          errorMessage.includes('both')
        ) {
          state.mobileOtpError = 'Invalid OTP';
          state.emailOtpError = 'Invalid OTP';
        } else if (errorMessage.includes('mobile')) {
          state.mobileOtpError = 'Invalid OTP';
          state.emailOtpError = null;
        } else if (errorMessage.includes('email')) {
          state.emailOtpError = 'Invalid OTP';
          state.mobileOtpError = null;
        } else {
          // Generic error, show on both fields
          state.mobileOtpError = errorMessage;
          state.emailOtpError = errorMessage;
        }
      });
  },
});

export const { clearError, resetState } = validateOtpSlice.actions;
export default validateOtpSlice.reducer;
