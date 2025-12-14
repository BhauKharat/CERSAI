// Types for Update Entity Profile Action API

export interface UpdateEntityActionRequest {
  workflowId: string;
  action: 'APPROVED' | 'REJECTED';
}

export interface UpdateEntityActionResponse {
  success: boolean;
  message: string;
  data: {
    updationStatus: string;
  };
}

export interface UpdateEntityActionError {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export interface UpdateEntityActionState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: UpdateEntityActionResponse | null;
}
