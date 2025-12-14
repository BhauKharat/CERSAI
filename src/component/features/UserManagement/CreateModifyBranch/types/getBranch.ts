// Get Branch Request Types
export interface GetBranchRequest {
  branchCode: string;
}

export interface GetBranchData {
  branchCode: string;
  branchName: string;
  address: {
    id: null;
    line1: string;
    line2: string;
    line3: string;
    countryCode: string;
    state: string;
    district: string;
    city?: string;
    cityTown?: string;
    pinCode: string;
    alternatePinCode: string;
    digiPin: null;
  };
  regionCode: string | null;
}

export interface GetBranchSuccessResponse {
  success: true;
  message: string;
  data: GetBranchData;
}

export interface GetBranchErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode: string;
    errorMessage: string;
  };
}

export interface GetBranchState {
  loading: boolean;
  data: GetBranchData | null;
  error: string | null;
}
