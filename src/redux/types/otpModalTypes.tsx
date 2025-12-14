// redux/types/otpModalTypes.ts

export interface ValidateOtpPayload {
  identifier: string;
  mobileOtp: string;
  emailOtp: string;
  signUpValidation?: boolean;
  forceAdminEndpoint?: boolean;
}

export interface ValidateOtpSuccessInner {
  message: string;
}

export interface ValidateOtpSuccessData {
  valid: boolean;
  otpIdentifier: string;
  emailOtpValid: boolean;
  smsOtpValid: boolean;
  notificationType: string;
  message?: string; // Optional message field for backward compatibility
}

export interface ValidateOtpSuccessResponse {
  success: boolean;
  message?: string;
  data: ValidateOtpSuccessData;
}

export interface ValidateOtpErrorDetail {
  field: string;
  issue: string;
}

export interface ValidateOtpErrorData {
  errorCode: string;
  errorMessage: string;
  details: ValidateOtpErrorDetail[];
}

export interface ValidateOtpErrorResponse {
  success: false;
  message: string;
  data: ValidateOtpErrorData;
}
