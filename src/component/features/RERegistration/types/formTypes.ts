// Validation Rules Interface
export interface ValidationRules {
  required?: boolean | string;
  requiredMessage?: string;
  maxLength?: string;
  maxLengthMessage?: string;
  minLength?: string;
  minLengthMessage?: string;
  regx?: string;
  regxMessage?: string;
  imageFormat?: string[];
  imageRequired?: boolean;
  imageRequiredMessage?: string;
  size?: string;
  sizeMessage?: string;
  numberValudation?: boolean; // Note: API uses this spelling (typo), keeping for compatibility
  numberValidation?: boolean; // Correct spelling variant
  isAdultAge?: string; // Minimum age requirement (e.g., '18')
  maxDate?: string | boolean; // Maximum date constraint (e.g., 'true' for today's date)
  validationFile?: {
    imageFormat?: string[];
    imageRequired?: boolean;
    imageRequiredMessage?: string;
    size?: string;
    sizeMessage?: string;
  };
}

// Field Attributes Interface
export interface FieldAttributes {
  type?: string;
  trigger?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  urlData?: string;
  payloadTemplate?: Record<string, unknown>;
  responseMapping?: {
    label: string;
    value: string;
  };
  description?: string;
  autoPopulate?: string[];
}

// Conditional Logic Interface
export interface ConditionalLogic {
  when: {
    field: string;
    operator: string;
    value: string | string[] | null;
  };
  fieldAttributes?: {
    type?: string;
    trigger?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    urlData?: string;
    payloadTemplate?: Record<string, unknown>;
    responseMapping?: {
      label: string;
      value: string;
    };
    description?: string;
    autoPopulate?: string[];
  };
  then?: {
    validationRules?: ValidationRules;
    fieldAttributes?: {
      type?: string;
      trigger?: string;
      url?: string;
      method?: string;
      headers?: Record<string, string>;
      urlData?: string;
      payloadTemplate?: Record<string, unknown>;
      responseMapping?: {
        label: string;
        value: string;
      };
      description?: string;
      autoPopulate?: string[];
    };
    autoFillFields?: string[]; // Fields to auto-fill
    selectedFields?: string[]; // Source fields for auto-fill
  };
  else?: {
    validationRules?: ValidationRules;
    fieldAttributes?: {
      type?: string;
      trigger?: string;
      url?: string;
      method?: string;
      headers?: Record<string, string>;
      urlData?: string;
      payloadTemplate?: Record<string, unknown>;
      responseMapping?: {
        label: string;
        value: string;
      };
      description?: string;
      autoPopulate?: string[];
    };
  };
}

// Field Option Interface
export interface FieldOption {
  label?: string;
  value?: string;
  name?: string;
  code?: string;
  regulator?: string;
  types?: Array<{
    code: string;
    name: string;
    status: string;
  }>;
  [key: string]: unknown;
}

// Dropdown Option Interface
export interface DropdownOption {
  label: string;
  value: string;
}

// Form Field Interface
export interface FormField {
  id: number;
  formType: string;
  fieldName: string;
  fieldFileName?: string;
  fieldLabel: string;
  fieldType:
    | 'textfield'
    | 'dropdown'
    | 'checkbox'
    | 'date'
    | 'textfield_with_image'
    | 'textfield_with_verify'
    | 'file';
  fieldPlaceholder?: string;
  fieldOptions?: FieldOption[];
  fieldMaster?: string;
  validationRules?: ValidationRules | null;
  fieldOrder: number;
  isRequired?: boolean;
  isActive?: boolean;
  fieldWidth?: string;
  defaultValue?: string | number | boolean | null;
  helpText?: string | null;
  languageSlug?: string;
  fieldGroup?: string;
  conditionalLogic?: ConditionalLogic[] | null;
  cssClasses?: string | null;
  fieldAttributes?: FieldAttributes | null;
  createdAt?: string;
  updatedAt?: string;
}

// Form Configuration Interface
export interface FormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle?: string;
  formDescription?: string;
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  formSettings?: {
    formGroup?: boolean;
    showProgress?: boolean;
    enableCaptcha?: boolean;
  };
  validationSettings?: {
    validateOnBlur?: boolean;
    showErrorsInline?: boolean;
  };
  submissionSettings?: {
    emailNotification?: boolean;
    webhookUrl?: string;
    validateButton?: boolean | string;
    validateButtonText?: string;
    submitButton?: boolean | string;
    submitButtonText?: string;
    clearButton?: boolean | string;
    clearButtonText?: string;
  };
  isActive?: boolean;
  languageSlug?: string;
  formLayout?: string;
  formTheme?: string;
  allowMultipleSubmissions?: boolean;
  requiresAuthentication?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Form Step Interface
export interface FormStep {
  stepNumber: number;
  fields: FormField[];
  title: string;
}

// API Response Interface
export interface FormFieldsResponse {
  status: boolean;
  message: string;
  data: {
    fields: FormField[];
    configuration: FormConfiguration;
    formType?: string;
  };
}

// Form Values Interface
export interface FormValues {
  [key: string]: string | boolean | File | null | unknown;
}

// Field Error Interface
export interface FieldError {
  field: string;
  message: string;
}

// Redux State Interface
export interface FormState {
  fields: FormField[];
  configuration: FormConfiguration | null;
  formValues: FormValues;
  fieldErrors: FieldError[];
  loading: boolean;
  error: string | null;
  currentStep: number;
  totalSteps: number;
  dropdownOptions: Record<number, DropdownOption[]>;
}
