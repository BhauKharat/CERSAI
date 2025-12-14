// Types for merge branch functionality

export interface MergeBranchRequest {
  targetBranchCode: string;
  sourceBranchCodes: string[];
  userId?: string;
  remarks?: string;
}

export interface MergeBranchSuccessResponse {
  success: true;
  message: string;
  data: {
    workflowId: string;
    branchCode: string;
    branchName: string;
    status: string;
  };
}

export interface MergeBranchErrorResponse {
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

export interface MergeBranchState {
  mergeLoading: boolean;
  mergeSuccess: boolean;
  mergeError: string | null;
  workflowId: string | null;
  message: string | null;
  mergeData: MergeBranchSuccessResponse['data'] | null;
}
