// Selector.ts - Updated selectors with OTP support

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../../../redux/store';

// Basic selectors
export const selectCreateUserState = (state: RootState) => state.createUser;

// Loading selectors
export const selectCreateLoading = createSelector(
  selectCreateUserState,
  (state) => state.createLoading
);

export const selectValidationLoading = createSelector(
  selectCreateUserState,
  (state) => state.validationLoading
);

export const selectSendOtpLoading = createSelector(
  selectCreateUserState,
  (state) => state.sendOtpLoading
);

export const selectAnyLoading = createSelector(
  selectCreateLoading,
  selectValidationLoading,
  selectSendOtpLoading,
  (createLoading, validationLoading, sendOtpLoading) =>
    createLoading || validationLoading || sendOtpLoading
);

// Success selectors
export const selectCreateSuccess = createSelector(
  selectCreateUserState,
  (state) => state.createSuccess
);

export const selectValidationSuccess = createSelector(
  selectCreateUserState,
  (state) => state.validationSuccess
);

export const selectSendOtpSuccess = createSelector(
  selectCreateUserState,
  (state) => state.sendOtpSuccess
);

// Error selectors
export const selectCreateError = createSelector(
  selectCreateUserState,
  (state) => state.createError
);

export const selectValidationError = createSelector(
  selectCreateUserState,
  (state) => state.validationError
);

export const selectSendOtpError = createSelector(
  selectCreateUserState,
  (state) => state.sendOtpError
);

// Data selectors
export const selectCreatedUser = createSelector(
  selectCreateUserState,
  (state) => state.createdUser
);

export const selectFormData = createSelector(
  selectCreateUserState,
  (state) => state.formData
);

export const selectValidationData = createSelector(
  selectCreateUserState,
  (state) => state.validationData
);

export const selectOtpData = createSelector(
  selectCreateUserState,
  (state) => state.otpData
);

// Derived selectors
export const selectFormattedError = createSelector(
  selectCreateError,
  selectValidationError,
  selectSendOtpError,
  (createError, validationError, sendOtpError) => {
    const error = createError || validationError || sendOtpError;
    return error ? `${error.errorCode}: ${error.errorMessage}` : null;
  }
);

export const selectCanSubmit = createSelector(
  selectValidationSuccess,
  selectSendOtpSuccess,
  selectAnyLoading,
  (validationSuccess, sendOtpSuccess, anyLoading) =>
    validationSuccess && sendOtpSuccess && !anyLoading
);

// OTP specific selectors
export const selectEmailOtp = createSelector(
  selectOtpData,
  (otpData) => otpData?.data?.successResponse?.emailOtp || null
);

export const selectMobileOtp = createSelector(
  selectOtpData,
  (otpData) => otpData?.data?.successResponse?.mobileOtp || null
);

export const selectOtpMessage = createSelector(
  selectOtpData,
  (otpData) => otpData?.message || null
);
