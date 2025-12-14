export interface SuspendUserParams {
  userId: string;
  reason: string;
  remarks: string;
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
