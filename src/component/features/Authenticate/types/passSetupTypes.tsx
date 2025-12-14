export interface PassSetupRequest {
  password: string;
  userId: string;
  dscCertificateFile: string; // base64 string
}

export interface PassSetupResponse {
  success: boolean;
  message: string;

  data: string;
}

export interface PassSetupState {
  loading: boolean;
  error: string | null;
  success: boolean;

  message: string;
}
