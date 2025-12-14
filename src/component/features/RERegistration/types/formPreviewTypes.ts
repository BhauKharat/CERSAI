/* eslint-disable @typescript-eslint/no-explicit-any */

// Form Field Interface
export interface FormField {
  id: number;
  filedIsUnique?: boolean;
  formType: string;
  fieldName: string;
  fieldLabel: string;
  fieldFileName?: string | null;
  fieldType:
    | 'textfield'
    | 'dropdown'
    | 'checkbox'
    | 'date'
    | 'textfield_with_image'
    | 'textfield_with_verify'
    | 'file';
  fieldPlaceholder: string | null;
  fieldOptions: Array<{
    code?: string;
    name?: string;
    label?: string;
    value?: string;
    status?: string;
    isocode?: string;
  }>;
  fieldMaster?: string | null;
  validationRules: {
    required?: boolean;
    requiredMessage?: string;
    maxLength?: string;
    maxLengthMessage?: string;
    minLength?: string;
    minLengthMessage?: string;
    regx?: string;
    regxMessage?: string;
    regsMessage?: string; // API sometimes uses this variant
    numberValudation?: boolean;
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
  } | null;
  fieldOrder: number;
  fieldOrderGroup: number;
  isRequired?: boolean | null;
  isActive: boolean;
  fieldWidth: string;
  defaultValue: string | number | boolean | null;
  helpText: string | null;
  languageSlug: string;
  fieldGroup: string;
  conditionalLogic: Array<{
    when: {
      field: string;
      operator: string;
      value: string | string[];
    };
    then: {
      validationRules?: Record<string, unknown>;
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
    else?: {
      validationRules?: Record<string, unknown>;
      fieldAttributes?: Record<string, unknown>;
    };
  }> | null;
  cssClasses: string | null;
  fieldAttributes: {
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
  } | null;
  formTypes?: string[];
  createdat: string;
  updatedat: string;
}

// Form Configuration Interface
export interface FormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formDescription: string;
  formSettings: {
    formGroup: boolean;
    showProgress?: boolean;
    enablecaptcha?: boolean;
    isMultiSteps?: boolean;
    stepsData?: {
      nextStep?: string;
      previousStep?: string;
      currentStep?: string;
    };
  };
  submissionSettings: {
    clearButton?: boolean;
    submitButton?: boolean;
    submitButtonText?: string;
    validateIsGroup?: boolean;
  };
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  parentId?: number;
}

// Grouped Fields Interface
export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: FormField[];
  };
}

// API Response Interface
export interface FormPreviewApiResponse {
  status: boolean;
  message: string;
  data: {
    fields: FormField[];
    groupedFields: GroupedFields;
    configuration: FormConfiguration;
    formType: string;
  };
}

// Form Values Interface
export interface FormValues {
  [key: string]: string | boolean | File | null;
}

// Redux State Interface
export interface FormPreviewState {
  fields: FormField[];
  groupedFields: GroupedFields;
  configuration: FormConfiguration | null;
  formValues: FormValues;
  loading: boolean;
  error: string | null;
}

// Initial State
export const initialState: FormPreviewState = {
  fields: [],
  groupedFields: {},
  configuration: null,
  formValues: {},
  loading: false,
  error: null,
};
