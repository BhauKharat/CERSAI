// Types for approved branches functionality

export interface ApprovedBranch {
  branchCode: string;
  branchName: string;
}

export interface ApprovedBranchesSuccessResponse {
  success: true;
  data: ApprovedBranch[];
}

export interface ApprovedBranchesErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode: string;
    errorMessage: string;
  };
}

export interface ApprovedBranchesState {
  branches: ApprovedBranch[];
  loading: boolean;
  error: string | null;
}
