// Frontend Form Configuration Types
// These types match the structure from the API response but are defined in the frontend

import {
  ValidationRules,
  FieldAttributes,
  ConditionalLogic,
} from '../../types/formTypes';

export interface FrontendFormField {
  id: number;
  formType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldPlaceholder?: string;
  fieldFileName?: string;
  fieldOptions?: DropdownOption[];
  fieldMaster?: string; // Master data key for fetching options from API
  validationRules?: ValidationRules | null;
  fieldOrder: number;
  fieldOrderGroup: number;
  isActive: boolean;
  isUnique: boolean;
  fieldWidth: string;
  languageSlug: string;
  fieldGroup?: string; // Field group for grouping fields
  conditionalLogic?: ConditionalLogic[];
  fieldAttributes?: FieldAttributes;
}

export interface DropdownOption {
  code: string;
  name: string;
  status?: string;
  isocode?: string;
  regulator?: string;
  types?: DropdownOption[];
}

export interface FormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formDescription: string;
  formSettings: {
    formGroup: boolean;
    showProgress?: boolean;
    showprogress?: boolean;
    enablecaptcha: boolean;
    isMultiSteps?: boolean;
    ismultisteps?: boolean;
    multistepforms?: Array<{
      formorder: number;
      formtype: string;
      formname: string;
    }>;
    stepsData?: {
      nextStep?: string;
      previousStep?: string;
      currentStep: string;
    };
  };
  submissionSettings: {
    clearButton: boolean;
    clearButtonText?: string;
    submitButton: boolean;
    submitButtonText: string;
    validateIsGroup?: boolean;
    validateButton?: boolean;
    validateButtonText?: string;
    validateGroupButtons?: Array<{
      validateButton: boolean;
      validateButtonText: string;
    }>;
  };
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  parentId?: number | null;
}

export interface FrontendFormConfig {
  fields: FrontendFormField[];
  groupedFields?: Record<string, { label: string; fields: FrontendFormField[] }>;
  configuration: FormConfiguration;
  formType: string;
}

// Master data keys that need to be fetched from API
export type MasterDataKey =
  | 'regulators'
  | 'institutionTypes'
  | 'constitutions'
  | 'citizenship'
  | 'titles'
  | 'gender'
  | 'countryCode'
  | 'proofOfIdentities'
  | string;

export interface MasterDataConfig {
  key: MasterDataKey;
  endpoint?: string; // Optional custom endpoint, otherwise uses default master data API
}

