// Validation Rules Interface
export interface ValidationRules {
  required?: boolean;
  requiredMessage?: string;
  maxLength?: string;
  maxLengthMessage?: string;
  minLength?: string;
  minLengthMessage?: string;
  regx?: string;
  regsMessage?: string;
  regxMessage?: string;
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

export interface FieldAttributes {
  type?: string;
  trigger?: string;
  url?: string;
  method?: string;
  fieldAttributes?: Record<string, unknown>;
  urlData?: string;
  payloadTemplate?: Record<string, unknown>;
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
    value: string | null;
  };
  then: {
    validationRules?: ValidationRules;
    fieldAttributes?: {
      type: string;
      trigger: string;
      url: string;
      method: string;
      headers: Record<string, string>;
      urlData: string;
      payloadTemplate: Record<string, unknown>;
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
    headers: Record<string, string>;
    urlData: string;
    payloadTemplate: Record<string, unknown>;
    responseMapping: {
      label: string;
      value: string;
    };
    description: string;
    autoPopulate: string[];
  };
}

// Field Options Interface
export interface FieldOption {
  label: string;
  value: string;
}

// Address Details Form Field Interface
export interface AddressFormField {
  id: number;
  formType: string;
  fieldName: string;
  fieldFileName: string;
  fieldLabel: string;
  fieldType:
    | 'textfield'
    | 'dropdown'
    | 'checkbox'
    | 'date'
    | 'textfield_with_image'
    | 'textfield_with_verify'
    | 'file';
  fieldPlaceholder: string;
  fieldOptions: FieldOption[];
  validationRules: ValidationRules | null;
  fieldOrder: number;
  isRequired: boolean;
  isActive: boolean;
  fieldWidth: string;
  defaultValue: string | number | boolean | null;
  helpText: string | null;
  languageSlug: string;
  fieldGroup: string;
  conditionalLogic: ConditionalLogic[] | null;
  cssClasses: string | null;
  fieldAttributes: FieldAttributes | null;
  createdAt: string;
  updatedAt: string;
}

// Form Configuration Interface
export interface AddressFormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formDescription: string;
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
  redirectUrl: string;
  formSettings: {
    formGroup: boolean;
    showProgress: boolean;
    enableCaptcha: boolean;
  };
  validationSettings: {
    validateOnBlur: boolean;
    showErrorsInline: boolean;
  };
  submissionSettings: {
    emailNotification: boolean;
    webhookUrl: string;
  };
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  createdAt: string;
  updatedAt: string;
}

// Grouped Fields Interface
export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: AddressFormField[];
  };
}

// API Response Interface
export interface AddressDetailsResponse {
  status: boolean;
  message: string;
  data: {
    fields: AddressFormField[];
    groupedFields: GroupedFields;
    configuration: AddressFormConfiguration;
    formType: string;
  };
}

// Form Values Interface
export interface AddressFormValues {
  [key: string]: string | boolean | File | null;
}

// Field Error Interface
export interface AddressFieldError {
  field: string;
  message: string;
}

// Redux State Interface
export interface AddressDetailsState {
  fields: AddressFormField[];
  groupedFields: GroupedFields;
  configuration: AddressFormConfiguration | null;
  formValues: AddressFormValues;
  fieldErrors: AddressFieldError[];
  loading: boolean;
  error: string | null;
  dropdownOptions: Record<number, DropdownOption[]>;
  dependentDropdownLoading: Record<number, boolean>;
}

// External API Response Interface for Geography
export interface GeographyApiResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: string;
    name: string;
    code?: string;
    [key: string]: unknown;
  }>;
}

// Dropdown Option Interface
export interface DropdownOption {
  label: string;
  value: string;
}
