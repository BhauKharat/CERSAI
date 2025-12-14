// Head of Institution Submission Types

export interface HeadOfInstitutionMetadata {
  [key: string]: string | number | boolean | null;
}

export interface HeadOfInstitutionSubmissionRequest {
  metadata: HeadOfInstitutionMetadata;
  workflowId: string;
  userId: string;
  files?: Record<string, File>;
}

export interface HeadOfInstitutionSubmissionResponse {
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

export interface HeadOfInstitutionSubmissionError {
  type: 'FIELD_VALIDATION_ERROR' | 'GENERAL_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  code?: string;
}

export interface HeadOfInstitutionSubmissionState {
  loading: boolean;
  success: boolean;
  error: string | HeadOfInstitutionSubmissionError | null;
  response: HeadOfInstitutionSubmissionResponse | null;
}

export interface HeadOfInstitutionFormData {
  formValues: Record<string, string | File | null>;
  workflowId?: string;
  userId?: string;
}
