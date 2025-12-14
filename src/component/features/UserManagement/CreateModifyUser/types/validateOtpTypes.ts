// Validate OTP Request and Response Types

export interface ValidateOtpRequest {
  identifier: string;
  signUpValidation?: boolean;
  mobileOtp: string; // Always required, use empty string if not changed
  emailOtp: string; // Always required, use empty string if not changed
}

export interface ValidateOtpSuccessResponse {
  success: true;
  message: string;
  data: {
    otp_identifier: string;
  };
}

export interface ValidateOtpErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface ValidateOtpState {
  loading: boolean;
  data: {
    otp_identifier: string;
  } | null;
  error: string | null;
}
