/* eslint-disable @typescript-eslint/no-explicit-any */

// Multi-step form interface for update
export interface UpdateMultiStepForm {
  formorder: number;
  formtype: string;
  formname: string;
}

// Form settings interface for update
export interface UpdateFormSettings {
  formGroup: boolean;
  showProgress: boolean;
  enablecaptcha: boolean;
  ismultisteps: boolean;
  multistepforms: UpdateMultiStepForm[];
}

// Form configuration interface for update
export interface UpdateFormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formDescription: string;
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
  redirectUrl: string;
  formSettings: UpdateFormSettings;
  validationSettings: Record<string, any>;
  submissionSettings: Record<string, any>;
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  parentId: string | null;
  createdat: string;
  updatedat: string;
}

// API response interface for update
export interface UpdateConfigApiResponse {
  status: boolean;
  message: string;
  data: UpdateFormConfiguration;
}

// Redux state interface for update configuration
export interface UpdateConfigState {
  configuration: UpdateFormConfiguration | null;
  steps: UpdateMultiStepForm[];
  loading: boolean;
  error: string | null;
}

// Initial state for update configuration
export const initialState: UpdateConfigState = {
  configuration: null,
  steps: [],
  loading: false,
  error: null,
};
