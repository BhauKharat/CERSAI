/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/slices/otpModalSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';
import {
  ValidateOtpPayload,
  ValidateOtpSuccessResponse,
} from '../../../../redux/types/otpModalTypes';
import { RootState } from '../../../../redux/store';
import { allowedGroupsCersai } from '../../../../enums/userRoles.enum';

interface SignupState {
  isLoading: boolean;
  validationResult: ValidateOtpSuccessResponse | null;
  error: string | null;
  mobileOtpError: string | null;
  emailOtpError: string | null;
}

interface ResendOtpPayload {
  identifier: string;
  type: 'EMAIL' | 'MOBILE';
}

const initialState: SignupState = {
  isLoading: false,
  validationResult: null,
  error: null,
  mobileOtpError: null,
  emailOtpError: null,
};

export const validateOtpReq = createAsyncThunk<
  ValidateOtpSuccessResponse,
  ValidateOtpPayload,
  {
    rejectValue:
      | string
      | {
          code?: string;
          message?: string;
          error?: { code?: string; message?: string };
        };
  }
>('signup/validateOtp', async (payload, { rejectWithValue, getState }) => {
  try {
    const state = getState() as RootState;
    const { adminUserDetails } = state.auth;
    const isAdmin =
      adminUserDetails?.data?.groups?.some((role) =>
        allowedGroupsCersai.includes(role)
      ) ?? false;

    const endpoint = payload.forceAdminEndpoint
      ? API_ENDPOINTS.POST_VALIDATE_OTP_ADMIN
      : isAdmin
        ? API_ENDPOINTS.POST_VALIDATE_OTP_ADMIN
        : API_ENDPOINTS.POST_VALIDATE_OTP;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { forceAdminEndpoint, ...apiPayload } = payload;

    const response = await Secured.post(endpoint, apiPayload);
    const responseData = response.data?.data;
    const isValid = responseData?.valid;

    if (isValid === false) {
      const smsOtpValid = responseData?.smsOtpValid;
      const emailOtpValid = responseData?.emailOtpValid;

      // Generate specific error message based on which OTP is invalid
      if (!smsOtpValid && !emailOtpValid) {
        return rejectWithValue('Invalid OTP for both mobile and email');
      } else if (!smsOtpValid) {
        return rejectWithValue('Invalid OTP for mobile');
      } else {
        return rejectWithValue('Invalid OTP');
      }
    }
    return response.data as ValidateOtpSuccessResponse;
  } catch (error: any) {
    const errorPayload =
      error?.response?.data || error?.response?.data?.error || error?.message;
    return rejectWithValue(
      errorPayload || { message: 'An unexpected error occurred.' }
    );
  }
});

export const validateOtpHandle = createAsyncThunk<
  ValidateOtpSuccessResponse,
  ValidateOtpPayload,
  {
    rejectValue:
      | string
      | {
          code?: string;
          message?: string;
          error?: { code?: string; message?: string };
        };
  }
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
        : API_ENDPOINTS.POST_VALIDATE_OTP;

      const response = await Secured.post(endpoint, payload);

      if (response.status === 200 || response.data?.success === true) {
        return response.data as ValidateOtpSuccessResponse;
      }

      const responseData = response.data?.data;
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
    } catch (error: any) {
      const errorPayload =
        error?.response?.data || error?.response?.data?.error || error?.message;
      return rejectWithValue(
        errorPayload || { message: 'An unexpected error occurred.' }
      );
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
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.data?.errorMessage ||
        error?.response?.data?.message ||
        'Failed to resend OTP'
    );
  }
});

const otpModalSlice = createSlice({
  name: 'signup/validateOtp',
  initialState,
  reducers: {
    clearOtpErrors: (state) => {
      state.error = null;
      state.mobileOtpError = null;
      state.emailOtpError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateOtpReq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.mobileOtpError = null;
        state.emailOtpError = null;
      })
      .addCase(
        validateOtpReq.fulfilled,
        (state, action: PayloadAction<ValidateOtpSuccessResponse>) => {
          state.isLoading = false;
          state.validationResult = action.payload;
          state.mobileOtpError = null;
          state.emailOtpError = null;
        }
      )
      .addCase(validateOtpReq.rejected, (state, action) => {
        state.isLoading = false;
        const err = action.payload as
          | string
          | {
              code?: string;
              message?: string;
              error?: { code?: string; message?: string };
            };
        const apiCode =
          (err as { code?: string })?.code ||
          (err as { error?: { code?: string } })?.error?.code;
        const apiMessage =
          (err as { message?: string })?.message ||
          (err as { error?: { message?: string } })?.error?.message ||
          (typeof err === 'string' ? err : 'Failed to validate OTP');
        state.error = apiMessage;

        if (apiCode === 'ERR_RE_IN_001') {
          state.mobileOtpError = apiMessage;
          state.emailOtpError = null;
          return;
        }

        // Set field-specific errors based on the error message
        if (
          apiMessage.includes('mobile and email') ||
          apiMessage.includes('both')
        ) {
          state.mobileOtpError = 'Invalid OTP';
          state.emailOtpError = 'Invalid OTP';
        } else if (apiMessage.includes('mobile')) {
          state.mobileOtpError = 'Invalid OTP';
          state.emailOtpError = null;
        } else if (apiMessage.includes('email')) {
          state.emailOtpError = 'Invalid OTP';
          state.mobileOtpError = null;
        } else {
          state.mobileOtpError = null;
          state.emailOtpError = apiMessage;
        }
      })
      .addCase(validateOtpHandle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.mobileOtpError = null;
        state.emailOtpError = null;
      })
      .addCase(
        validateOtpHandle.fulfilled,
        (state, action: PayloadAction<ValidateOtpSuccessResponse>) => {
          state.isLoading = false;
          state.validationResult = action.payload;
          state.mobileOtpError = null;
          state.emailOtpError = null;
        }
      )
      .addCase(validateOtpHandle.rejected, (state, action) => {
        state.isLoading = false;
        const err = action.payload as
          | string
          | {
              code?: string;
              message?: string;
              error?: { code?: string; message?: string };
            };
        const apiCode =
          (err as { code?: string })?.code ||
          (err as { error?: { code?: string } })?.error?.code;
        const apiMessage =
          (err as { message?: string })?.message ||
          (err as { error?: { message?: string } })?.error?.message ||
          (typeof err === 'string' ? err : 'Failed to validate OTP');
        state.error = apiMessage;

        if (apiCode === 'ERR_RE_IN_001') {
          state.mobileOtpError = apiMessage;
          state.emailOtpError = null;
          return;
        }

        // Set field-specific errors based on the error message
        if (
          apiMessage.includes('mobile and email') ||
          apiMessage.includes('both')
        ) {
          state.mobileOtpError = 'Invalid OTP';
          state.emailOtpError = 'Invalid OTP';
        } else if (apiMessage.includes('mobile')) {
          state.mobileOtpError = 'Invalid OTP';
          state.emailOtpError = null;
        } else if (apiMessage.includes('email')) {
          state.emailOtpError = 'Invalid OTP';
          state.mobileOtpError = null;
        } else {
          state.mobileOtpError = null;
          state.emailOtpError = apiMessage;
        }
      })
      .addCase(resendOtpReq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtpReq.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOtpReq.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to resend OTP';
      });
  },
});

export const { clearOtpErrors } = otpModalSlice.actions;
export default otpModalSlice.reducer;
