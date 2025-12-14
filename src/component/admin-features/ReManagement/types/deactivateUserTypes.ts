export interface DeactivateUserParams {
  userId?: string;
  remark?: string;
  reason?: string;
  fileBase64?: File | null;
}

// export interface DeactivateUserResponse {
//   success: boolean;
//   message: string;
//   data:
//     | {
//         userId: string;
//         workflowId: string;
//         workflowStatus?: string;
//         status?: string;
//       }
//     | string;
// }

export interface DeactivateUserResponse {
  success: boolean;
  message: string;
  type: string;
  timeStamp: string;
  data: {
    userId: string;
    workflowId: string;
    operation: string;
    status: string;
    message: string;
    operationTime: string;
    requiresApproval: boolean;
  };
}

export interface DeactivateUserState {
  deactivating: boolean;
  deactivateError: string | null;
}
