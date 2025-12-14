// Send OTP Request and Response Types

export interface SendOtpRequest {
  emailId: string;
  mobileNo: string;
}

export interface SendOtpSuccessResponse {
  success: true;
  message: string;
  data: {
    otp_identifier: string;
  };
}

export interface SendOtpErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage?: string;
  };
}

export interface SendOtpState {
  loading: boolean;
  data: {
    otpIdentifier: string;
  } | null;
  error: string | null;
}
