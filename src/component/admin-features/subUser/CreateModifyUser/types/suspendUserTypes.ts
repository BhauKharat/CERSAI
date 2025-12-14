export interface SuspendUserParams {
  userId: string;
  remark: string;
  suspensionFromDate: string;
  suspensionToDate: string;
  suspensionReason: string;
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
  error?: {
    status?: number;
    code?: string;
    type?: string;
    message?: string;
    timestamp?: string;
  };
}

export interface SuspendUserState {
  suspending: boolean;
  suspendError: string | null;
}
