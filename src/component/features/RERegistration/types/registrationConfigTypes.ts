/* eslint-disable @typescript-eslint/no-explicit-any */

// Multi-step form interface
export interface MultiStepForm {
  formorder: number;
  formtype: string;
  formname: string;
}

// Form settings interface
export interface FormSettings {
  formGroup: boolean;
  showProgress: boolean;
  enablecaptcha: boolean;
  ismultisteps: boolean;
  multistepforms: MultiStepForm[];
}

// Form configuration interface
export interface RegistrationFormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formDescription: string;
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
  redirectUrl: string;
  formSettings: FormSettings;
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

// API response interface
export interface RegistrationConfigApiResponse {
  status: boolean;
  message: string;
  data: RegistrationFormConfiguration;
}

// Redux state interface
export interface RegistrationConfigState {
  configuration: RegistrationFormConfiguration | null;
  steps: MultiStepForm[];
  loading: boolean;
  error: string | null;
}

// Initial state
export const initialState: RegistrationConfigState = {
  configuration: null,
  steps: [],
  loading: false,
  error: null,
};
