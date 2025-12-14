export interface FieldOption {
  code: string;
  name: string;
  isocode?: string;
  status?: string;
}

export interface ValidationRules {
  required?: boolean;
  maxLength?: string;
  minLength?: string;
  regx?: string;
  numberValudation?: boolean;
  requiredMessage?: string;
  maxLengthMessage?: string;
  minLengthMessage?: string;
  regxMessage?: string;
}

export interface FieldAttributes {
  type?: string;
  trigger?: string;
  url?: string;
  method?: string;
  urlData?: string;
  description?: string;
  autoPopulate?: string[];
  responseMapping?: {
    label: string;
    value: string;
  };
}

export interface ConditionalLogic {
  when: {
    field: string;
    operator: string;
    value: string | string[];
  };
  then?: {
    validationRules?: ValidationRules;
    fieldAttributes?: FieldAttributes;
  };
  else?: {
    validationRules?: ValidationRules;
    fieldAttributes?: FieldAttributes;
  };
}

export interface FormField {
  id: number;
  formType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldPlaceholder?: string;
  fieldOptions?: FieldOption[];
  fieldMaster?: string;
  validationRules?: ValidationRules;
  fieldOrder: number;
  fieldOrderGroup: number;
  isRequired?: boolean;
  isActive: boolean;
  fieldWidth: string;
  languageSlug: string;
  fieldAttributes?: FieldAttributes;
  conditionalLogic?: ConditionalLogic[];
}

export interface FormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formSettings: {
    formGroup: boolean;
    showProgress: boolean;
    enableCaptcha: boolean;
    isMultiSteps: boolean;
  };
  validationSettings: {
    validateOnBlur: boolean;
    showErrorsInline: boolean;
  };
  submissionSettings: {
    clearButton: boolean;
    clearButtonText: string;
    submitButton: boolean;
    submitButtonText: string;
    validateIsGroup: boolean;
    validateButton: boolean;
  };
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
}

export interface FormFieldsResponse {
  status: boolean;
  message: string;
  data: {
    fields: FormField[];
    grouped_fields: FormField[][];
    configuration: FormConfiguration;
    form_type: string;
  };
}

export interface DynamicFormValues {
  [key: string]: string | number | boolean;
}
