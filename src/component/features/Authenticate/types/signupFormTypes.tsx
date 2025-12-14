// Re-export existing types for compatibility
export * from './formTypes';

// Additional types specific to signup slice
export interface SignupFieldError {
  field: string;
  message: string;
}

export interface SignupFormState {
  fields: FormField[];
  groupedFields: FormField[][];
  configuration: FormConfiguration | null;
  formValues: DynamicFormValues;
  fieldErrors: SignupFieldError[];
  loading: boolean;
  error: string | null;
  isCkycVerified: boolean;
  useDynamicForm: boolean;
}

// Import the base types from formTypes
import {
  FormField,
  FormConfiguration,
  DynamicFormValues,
  FormFieldsResponse,
} from './formTypes';

// Export for convenience
export type {
  FormField,
  FormConfiguration,
  DynamicFormValues,
  FormFieldsResponse,
};
