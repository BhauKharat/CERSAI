// Entity Profile Submission Types

export interface EntityProfileMetadata {
  [key: string]: string | number | boolean | null;
}

export interface EntityProfileSubmissionRequest {
  metadata: EntityProfileMetadata;
  workflowId: string;
  userId: string;
  files?: Record<string, File>;
}

export interface EntityProfileSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    applicationId?: string;
    workflowId?: string;
    status?: string;
    [key: string]: unknown;
  };
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
}

export interface EntityProfileSubmissionError {
  type: 'FIELD_VALIDATION_ERROR' | 'GENERAL_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  code?: string;
}

export interface EntityProfileSubmissionState {
  loading: boolean;
  success: boolean;
  error: string | EntityProfileSubmissionError | null;
  response: EntityProfileSubmissionResponse | null;
}

export interface EntityProfileFormData {
  formValues: Record<string, string | File | null>;
  workflowId?: string;
  userId?: string;
}
