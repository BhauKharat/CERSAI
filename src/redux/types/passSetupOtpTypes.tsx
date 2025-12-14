export interface SendOtpRequest {
  emailId: string;
  mobileNo: string;
  token: string;
}

export interface SendOtpSuccessResponse {
  success: true;
  message: string;
  data: {
    otp_identifier: string;
  };
}

export interface FieldIssue {
  field: string;
  issue: string;
}

export interface SendOtpErrorResponse {
  success: false;
  message: string;
  data: FieldIssue[];
}

export interface AuthOtpState {
  loading: boolean;
  otpIdentifier: string;
  error: string | null;
  token: string | null;
  tokenValidationLoading: boolean;
  isTokenValid: boolean;
  tokenValidationError: string | null;
}
