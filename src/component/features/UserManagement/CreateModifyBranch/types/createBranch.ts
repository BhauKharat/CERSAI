// Create Branch Request Types
export interface CreateBranchRequest {
  branchCode: string;
  branchName: string;
  regionCode: string;
  regionName?: string;
  userId?: string;
  address: {
    line1: string;
    line2?: string;
    line3?: string;
    countryCode: string;
    country?: string;
    state: string;
    district: string;
    countryName?: string;
    city: string;
    digiPin?: string;
    pinCode: string;
    alternatePinCode?: string;
  };
}

export interface CreateBranchSuccessResponse {
  message: string;
  data: string; // workflowId
}

export interface CreateBranchErrorResponse {
  success?: false;
  message?: string;
  data?: {
    errorCode: string;
    errorMessage: string;
  };
  error?: {
    status: number;
    code: string;
    type: string;
    message: string;
  };
}

export interface CreateBranchState {
  createLoading: boolean;
  createSuccess: boolean;
  createError: string | null;
  workflowId: string | null;
  message: string | null; // success message
}
