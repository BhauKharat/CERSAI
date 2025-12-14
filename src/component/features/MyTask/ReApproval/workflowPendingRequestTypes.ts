/* eslint-disable @typescript-eslint/no-explicit-any */
// Workflow pending request types for ReApproval module

export interface WorkflowPendingRequestFilters {
  userId: string;
  workflow_type: string;
  pendingWith: string;
}

export interface WorkflowPendingRequestPayload {
  filters: WorkflowPendingRequestFilters;
}

export interface WorkflowPendingRequestData {
  workflowId: string;
  reId: string;
  userId: string;
  workflowType: string;
  status: string;
  pendingWith: string;
  createdAt: string;
  updatedAt: string;
  payload?: {
    submission?: {
      submittedBy?: string;
      submittedAt?: string;
    };
    entityDetails?: {
      fiCode?: string;
      nameOfInstitution?: string;
    };
    application_esign?: {
      acknowledgementNo?: string;
    };
    [key: string]: any;
  };
  submission?: {
    submittedBy?: string;
    submittedAt?: string;
  };
  [key: string]: any; // Allow additional fields
}

export interface WorkflowPendingRequestResponse {
  success: boolean;
  message: string;
  data: WorkflowPendingRequestData[];
}
