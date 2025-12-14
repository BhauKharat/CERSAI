export interface SuspendUserParams {
  userId: string;
  remark: string;
  suspensionFromDate: string;
  suspensionToDate: string;
  suspensionReason: string;
  file?: File | null;
}

export interface SuspendUserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus?: string;
    status?: string;
  };
}

export interface SuspendUserState {
  suspending: boolean;
  suspendError: string | null;
}
