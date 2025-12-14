// Types for transfer branch functionality

export interface TransferBranchRequest {
  branchCode: string;
  newRegionCode: string;
  userId: string;
}

export interface TransferBranchSuccessResponse {
  success: true;
  message: string;
  data: {
    workflowId: string;
    status: string;
  };
}

export interface TransferBranchErrorResponse {
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

export interface TransferBranchState {
  transferLoading: boolean;
  transferSuccess: boolean;
  transferError: string | null;
  workflowId: string | null;
  message: string | null;
  transferData: TransferBranchSuccessResponse['data'] | null;
}
