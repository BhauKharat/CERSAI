// Send OTP Request and Response Types

export interface SendOtpRequest {
  emailId?: string;
  mobileNo?: string;
  countryCode: string;
  requestType: string;
}

export interface SendOtpSuccessResponse {
  message: string;
  data: {
    otpIdentifier: string;
    maskedEmail: string;
    maskedMobile: string;
    expiryMinutes: number;
    message: string;
  };
}

export interface SendOtpErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage?: string;
  };
  error?: {
    status?: number;
    code?: string;
    type?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface SendOtpState {
  loading: boolean;
  data: {
    otpIdentifier: string;
    maskedEmail: string;
    maskedMobile: string;
    expiryMinutes: number;
    message: string;
  } | null;
  error: string | null;
}
