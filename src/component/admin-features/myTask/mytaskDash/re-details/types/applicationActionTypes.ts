export interface ApplicationActionRequest {
  workflowId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_MODIFICATION';
  reason?: string;
  apiType?: string;
  remarks?: string;
  modifiableFields?: string[];
}

export interface ApplicationActionResponse {
  success: boolean;
  message: string;
  data: {
    acknowledgmentNo: string;
    status: string;
    action: string;
    modifiableFields: string[] | null;
    actionTimestamp: string;
  };
}

export interface ApplicationActionError {
  success: boolean;
  message: string;
  data: string;
}
