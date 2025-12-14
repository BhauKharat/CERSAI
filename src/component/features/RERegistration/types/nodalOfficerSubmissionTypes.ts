// Types for Nodal Officer submission API
import { FormField } from './formTypes';

export interface NodalOfficerSubmissionRequest {
  formValues: Record<string, string | File | null>;
  workflowId: string;
  userId: string;
  formFields: FormField[];
}

export interface NodalOfficerSubmissionResponse {
  message: string;
  data: {
    workflowId: string;
    stepName: string;
    status: string;
  };
}

export interface NodalOfficerSubmissionError {
  type?: 'FIELD_VALIDATION_ERROR' | 'GENERAL_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface NodalOfficerSubmissionState {
  loading: boolean;
  success: boolean;
  error: string | null;
  response: NodalOfficerSubmissionResponse | null;
}
