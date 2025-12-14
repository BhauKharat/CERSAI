/* eslint-disable @typescript-eslint/no-explicit-any */
// Dropdown Option Interface
export interface DropdownOption {
  label: string;
  value: string;
}

// Validation Rules Interface
export interface ValidationRules {
  required?: boolean;
  requiredMessage?: string;
  maxLength?: string;
  maxLengthMessage?: string;
  minLength?: string;
  minLengthMessage?: string;
  regx?: string;
  regxMessage?: string;
  regsMessage?: string;
  imageFormat?: string[];
  imageRequired?: boolean;
  imageRequiredMessage?: string;
  size?: string;
  sizeMessage?: string;
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
  source?: string;
  trigger?: string;
  url?: string;
  method?: string;
  headers?: Record<string, any>;
  urlData?: any;
  payloadTemplate?: Record<string, any>;
  responseMapping?: {
    label: string;
    value: string;
  };
}

// Conditional Logic Interface
export interface ConditionalLogic {
  when: {
    field: string;
    operator: string;
    value: string[];
  };
  then: {
    validationRules?: ValidationRules;
    fieldAttributes?: {
      type: string;
      trigger: string;
      url: string;
      method: string;
      headers: Record<string, any>;
      urlData: string;
      payloadTemplate: Record<string, any>;
      responseMapping: {
        label: string;
        value: string;
      };
      description: string;
      autoPopulate: string[];
    };
  };
  else?: {
    validationRules?: ValidationRules;
    fieldAttributes?: {
      type: string;
      trigger: string;
      url: string;
      method: string;
      headers: Record<string, any>;
      urlData: string;
      payloadTemplate: Record<string, any>;
      responseMapping: {
        label: string;
        value: string;
      };
      description: string;
      autoPopulate: string[];
    };
  };
  fieldAttributes?: {
    type: string;
    trigger: string;
    url: string;
    method: string;
    headers: Record<string, any>;
    urlData: string;
    payloadTemplate: Record<string, any>;
    responseMapping: {
      label: string;
      value: string;
    };
    description: string;
    autoPopulate: string[];
  };
}

// Form Field Interface
export interface FormField {
  id: number;
  filedIsUnique?: boolean;
  formType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType:
    | 'textfield'
    | 'dropdown'
    | 'file'
    | 'textfield_with_image'
    | 'textfield_with_verify'
    | 'date'
    | 'checkbox';
  fieldPlaceholder: string;
  fieldOptions?: any[];
  fieldFileName?: string;
  fieldMaster?: string;
  validationRules: ValidationRules | null;
  fieldOrder: number;
  fieldOrderGroup?: number;
  isRequired?: boolean;
  isActive: boolean;
  fieldWidth: string;
  defaultValue?: any;
  helpText?: string | null;
  languageSlug: string;
  fieldGroup?: string | null;
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
  formSubtitle: string;
  formDescription: string;
  formSettings: {
    formgroup?: boolean;
    showprogress?: boolean;
    enablecaptcha?: boolean;
    isMultiSteps?: boolean;
    stepsData?: {
      nextStep?: string;
      currentStep?: string;
    };
  };
  submissionSettings: {
    clearButton?: boolean;
    clearButtonText?: string;
    submitButton?: boolean;
    submitButtonText?: string;
    validateIsGroup?: boolean;
    validateButton?: boolean;
    validateButtonText?: string;
    validateGroupButtons?: {
      validateButton?: boolean;
      validateButtonText?: string;
    }[];
  };
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  parentId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// API Response Interface
export interface FormFieldsResponse {
  status: boolean;
  message: string;
  data: {
    fields: FormField[];
    groupedFields: Record<string, any>;
    configuration: FormConfiguration;
    formType: string;
  };
}

// Form Values Interface
export interface FormValues {
  [key: string]: string | File | null;
}

// Field Error Interface
export interface FieldError {
  field: string;
  message: string;
}

// Form State Interface
export interface FormState {
  fields: FormField[];
  configuration: FormConfiguration | null;
  formValues: FormValues;
  fieldErrors: FieldError[];
  loading: boolean;
  error: string | null;
  currentStep: number;
  totalSteps: number;
  dropdownOptions: Record<string, Array<{ label: string; value: string }>>;
}

// Dropdown Option Interface
export interface DropdownOption {
  label: string;
  value: string;
  name?: string;
  code?: string;
}

// Step Interface
export interface FormStep {
  stepNumber: number;
  fields: FormField[];
  title: string;
}

// Component Props Interfaces
export interface DynamicFieldProps {
  field: FormField;
  value: string | File | null;
  onChange: (value: string | File | null) => void;
  error?: string;
  options?: DropdownOption[];
  onDropdownChange?: (fieldName: string, value: string) => void;
}

export interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  steps: FormStep[];
}

export interface FormActionsProps {
  onClear: () => void;
  onSave: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  loading?: boolean;
}
