// Validate OTP Request and Response Types

export interface ValidateOtpRequest {
  identifier: string;
  signUpValidation: boolean;
  mobileOtp: string;
  emailOtp: string;
}

export interface ValidateOtpSuccessResponse {
  success: true;
  message: string;
  data: {
    otp_identifier: string;
  };
}

export interface ValidateOtpPayload {
  identifier: string;
  mobileOtp: string;
  emailOtp: string;
  signUpValidation?: boolean;
}
export interface ValidateOtpErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface ErrorInnerData {
  errorMessage?: string;
  valid?: boolean;
  smsOtpValid?: boolean;
  emailOtpValid?: boolean;
}

export interface ValidateOtpState {
  loading: boolean;
  data: {
    otp_identifier: string;
  } | null;
  error: string | null;
  mobileOtpError: string | null;
  emailOtpError: string | null;
}

export interface ErrorInnerData {
  errorMessage?: string;
  valid?: boolean;
  smsOtpValid?: boolean;
  emailOtpValid?: boolean;
}

export interface ApiErrorResponse {
  data?: {
    data?: ErrorInnerData;
    message?: string;
    success?: boolean;
  };
}

export interface ResendOtpPayload {
  otpIdentifier: string;
  type: 'email' | 'mobile';
}
