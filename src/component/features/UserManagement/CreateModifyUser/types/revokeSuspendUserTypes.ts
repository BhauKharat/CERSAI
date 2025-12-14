export interface RevokeSuspendUserParams {
  userId: string;
  reason: string;
  remarks: string;
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
