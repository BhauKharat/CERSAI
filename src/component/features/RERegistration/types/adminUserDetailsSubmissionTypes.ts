// Admin User Details Submission Types

export interface AdminUserDetailsMetadata {
  [key: string]: string | number | boolean | null;
}

export interface AdminUserDetailsSubmissionRequest {
  metadata: AdminUserDetailsMetadata;
  workflowId: string;
  userId: string;
  files?: Record<string, File>;
}

export interface AdminUserDetailsSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    workflowId?: string;
    stepName?: string;
    status?: string;
    [key: string]: unknown;
  };
  error?: {
    status?: number;
    code?: string;
    type?: string;
    message?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface AdminUserDetailsSubmissionError {
  type: 'FIELD_VALIDATION_ERROR' | 'GENERAL_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  code?: string;
}

export interface AdminUserDetailsSubmissionState {
  loading: boolean;
  success: boolean;
  error: string | AdminUserDetailsSubmissionError | null;
  response: AdminUserDetailsSubmissionResponse | null;
}

export interface AdminUserDetailsFormData {
  formValues: Record<string, string | File | null>;
  workflowId?: string;
  userId?: string;
}
