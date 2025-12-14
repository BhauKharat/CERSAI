// Validation Rules Interface
export interface ValidationRules {
  required?: boolean;
  required_message?: string;
  max_length?: string;
  max_length_message?: string;
  min_length?: string;
  min_length_message?: string;
  regx?: string;
  regs_message?: string;
  regx_message?: string;
  image_format?: string[];
  image_required?: boolean;
  image_required_message?: string;
  size?: string;
  size_message?: string;
}

// Field Attributes Interface for External API
export interface FieldAttributes {
  type?: string;
  trigger?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  url_data?: string;
  payload_template?: Record<string, unknown>;
  response_mapping?: {
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
    validation_rules?: ValidationRules;
    field_attributes?: {
      type: string;
      trigger: string;
      url: string;
      method: string;
      headers: Record<string, string>;
      url_data: string;
      payload_template: Record<string, unknown>;
      response_mapping: {
        label: string;
        value: string;
      };
      description: string;
      auto_populate: string[];
    };
  };
  field_attributes?: {
    type: string;
    trigger: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    url_data: string;
    payload_template: Record<string, unknown>;
    response_mapping: {
      label: string;
      value: string;
    };
    description: string;
    auto_populate: string[];
  };
}

// Field Options Interface
export interface FieldOption {
  label: string;
  value: string;
}

// Admin User Details Form Field Interface
export interface TrackStatusFormField {
  id: number;
  formType: string;
  fieldName: string;
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
  fieldOrderGroup: number;
  fieldMaster?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// Form Configuration Interface
export interface TrackStatusFormConfiguration {
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
    fields: TrackStatusFormField[];
  };
}

// API Response Interface
export interface TrackStatusResponse {
  status: boolean;
  message: string;
  data: {
    fields: TrackStatusFormField[];
    groupedFields: GroupedFields;
    configuration: TrackStatusFormConfiguration;
    formType: string;
  };
}

// Form Values Interface
export interface TrackStatusFormValues {
  [key: string]: string | boolean | File | null;
}

// Field Error Interface
export interface TrackStatusFieldError {
  field: string;
  message: string;
}

// Redux State Interface
export interface TrackStatusState {
  fields: TrackStatusFormField[];
  groupedFields: GroupedFields;
  configuration: TrackStatusFormConfiguration | null;
  formValues: TrackStatusFormValues;
  fieldErrors: TrackStatusFieldError[];
  dropdownOptions: Record<number, DropdownOption[]>;
  loading: boolean;
  error: string | null;
  formSubtitle: string;
  // Workflow data
  workflowData: WorkflowData | null;
  workflowLoading: boolean;
  workflowError: string | null;
  trackStatusData: TrackStatusData[];
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

// Workflow Data Interfaces
export interface WorkflowDocument {
  fieldKey: string;
  type: string;
  id: string;
}

export interface WorkflowPayload {
  hoi?: Record<string, unknown>;
  addresses?: Record<string, unknown>;
  submission?: Record<string, unknown>;
  nodalOfficer?: Record<string, unknown>;
  entityDetails?: Record<string, unknown>;
  application_esign?: Record<string, unknown>;
  institutionalAdminUser?: Record<string, unknown>;
  approvalWorkflow?: {
    pendingAtLevel?: number;
  };
}

export interface WorkflowData {
  workflowId: string;
  workflowType: string;
  status: string;
  payload: WorkflowPayload;
  currentStep: string;
  executedSteps: string[];
  documents: WorkflowDocument[];
}

export interface WorkflowApiResponse {
  success: boolean;
  data: WorkflowData;
  message: string;
}

// Track Status Data Interface for table display
export interface TrackStatusData {
  ackNumber: string;
  reName: string;
  status: string;
  submittedOn: string;
  pendingAtLevel?: number;
}
