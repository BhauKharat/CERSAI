// Deactivate Branch Request Types
export interface DeactivateBranchRequest {
  branchCode: string;
  remark: string;
  userId: string;
}

export interface DeactivateBranchSuccessResponse {
  success: true;
  message: string;
  data: {
    branchName: string;
    status: string;
    workflowId: string;
    branchCode: string;
  };
}

export interface DeactivateBranchErrorResponse {
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

export type DeactivateBranchApiResponse =
  | DeactivateBranchSuccessResponse
  | DeactivateBranchErrorResponse;

export interface DeactivateBranchState {
  loading: boolean;
  success: boolean;
  error: string | null;
  workflowId: string | null;
  message: string | null;
}
