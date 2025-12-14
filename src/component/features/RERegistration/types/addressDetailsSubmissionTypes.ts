// Address Details Submission Types

export interface AddressDetailsMetadata {
  [key: string]: string | number | boolean | null;
}

export interface AddressDetailsSubmissionRequest {
  metadata: AddressDetailsMetadata;
  workflowId: string;
  userId: string;
  files?: Record<string, File>;
}

export interface AddressDetailsSubmissionResponse {
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

export interface AddressDetailsSubmissionError {
  type: 'FIELD_VALIDATION_ERROR' | 'GENERAL_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  code?: string;
}

export interface AddressDetailsSubmissionState {
  loading: boolean;
  success: boolean;
  error: string | AddressDetailsSubmissionError | null;
  response: AddressDetailsSubmissionResponse | null;
}

export interface AddressDetailsFormData {
  formValues: Record<string, string | File | null>;
  workflowId?: string;
  userId?: string;
}
