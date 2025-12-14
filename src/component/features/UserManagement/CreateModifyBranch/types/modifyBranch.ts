// Modify Branch Request Types
export interface ModifyBranchRequest {
  branchName: string;
  branchCode: string;
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
    city: string;
    digiPin?: string;
    pinCode: string;
    alternatePinCode?: string;
  };
}

export interface ModifyBranchSuccessResponse {
  success: true;
  message: string;
  data:
    | string
    | {
        branchName: string;
        workflowId: string;
        status: string;
      };
}

export interface ModifyBranchErrorResponse {
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

export interface ModifyBranchState {
  loading: boolean;
  success: boolean;
  error: string | null;
  workflowId: string | null;
  message: string | null;
}
