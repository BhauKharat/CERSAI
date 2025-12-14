export interface DeactivateUserParams {
  userId: string;
  reason: string;
  remarks: string;
}

export interface DeactivateUserResponse {
  success: boolean;
  message: string;
  data:
    | {
        userId: string;
        workflowId: string;
        workflowStatus?: string;
        status?: string;
      }
    | string;
}

export interface DeactivateUserState {
  deactivating: boolean;
  deactivateError: string | null;
}
