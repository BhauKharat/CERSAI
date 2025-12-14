// Validation rules interface
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

// Field options interface
export interface FieldOption {
  label: string;
  value: string;
  name?: string;
  code?: string;
}

// Institution type interface
export interface InstitutionType {
  status: string;
  name: string;
  code: string;
}

// Extended field option interface for regulator-based institution types
export interface RegulatorFieldOption extends FieldOption {
  regulator?: string;
  types?: InstitutionType[];
}

// Conditional logic interface
export interface ConditionalLogic {
  when: {
    field: string;
    operator: string;
    value: string | string[] | null;
  };
  then: {
    validationRules?: ValidationRules;
    fieldAttributes?: FieldAttributes;
  };
}

// Field attributes interface
export interface FieldAttributes {
  source?: string;
  type?: string;
  trigger?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  urlData?: string | null;
  payloadTemplate?: Record<string, unknown>;
  responseMapping?: {
    label: string;
    value: string;
  };
  description?: string;
  autoPopulate?: string[];
}

// Form field interface
export interface TrackStatusFormField {
  id: number;
  formType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldPlaceholder?: string | null;
  fieldOptions: FieldOption[];
  fieldMaster?: Record<string, unknown> | null;
  validationRules: ValidationRules | null;
  fieldOrder: number;
  fieldOrderGroup: number;
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

// Form configuration interface
export interface TrackStatusFormConfiguration {
  formSettings?: {
    formGroup?: boolean;
  };
  formSubtitle?: string;
}

// Grouped fields interface
export interface TrackStatusGroupedFields {
  [groupName: string]: {
    label: string;
    fields: TrackStatusFormField[];
  };
}

// API response interface
export interface TrackStatusFormPreviewApiResponse {
  status: boolean;
  message: string;
  data: {
    fields: TrackStatusFormField[];
    groupedFields: TrackStatusGroupedFields;
    configuration?: TrackStatusFormConfiguration;
  };
}

// Form values interface
export interface TrackStatusFormValues {
  [fieldName: string]: string | boolean | number | null | undefined;
}

// Redux state interface
export interface TrackStatusFormPreviewState {
  loading: boolean;
  error: string | null;
  configuration: TrackStatusFormConfiguration | null;
  fields: TrackStatusFormField[];
  groupedFields: TrackStatusGroupedFields;
  formValues: TrackStatusFormValues;
}
