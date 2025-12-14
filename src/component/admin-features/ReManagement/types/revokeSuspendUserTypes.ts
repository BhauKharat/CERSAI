export interface RevokeSuspendUserParams {
  userId: string | null;
  remark?: string;
  reason?: string;
  file?: File | null;
}

export interface RevokeSuspendUserResponse {
  success: boolean;
  message: string;
  data:
    | {
        userId: string;
        workflowId: string;
        status: string;
      }
    | {
        errorCode: string;
        errorMessage: string;
      };
}

export interface RevokeSuspendUserState {
  revokingSuspension: boolean;
  revokeSuspendError: string | null;
}
