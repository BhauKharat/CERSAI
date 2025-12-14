/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Validation Rules and Functions for Nodal Officer Form
 * Based on API field configuration
 */

// Validation rule interface
export interface ValidationRule {
  required?: boolean;
  requiredMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
  regx?: string;
  regxMessage?: string;
  numberValidation?: boolean;
  isAdultAge?: number;
  maxDate?: boolean;
}

// Conditional logic interface
export interface ConditionalLogic {
  when: {
    field: string;
    operator: 'equals' | 'equal' | 'in' | 'is';
    value: string | string[];
  };
  then?: {
    validationRules: ValidationRule;
  };
  else?: {
    validationRules: ValidationRule;
  };
}

// Field validation config
export interface FieldValidationConfig {
  fieldName: string;
  validationRules?: ValidationRule;
  conditionalLogic?: ConditionalLogic[];
}

// Static validation rules extracted from JSON
export const nodalOfficerValidationRules: Record<
  string,
  FieldValidationConfig
> = {
  citizenship: {
    fieldName: 'citizenship',
    validationRules: {
      required: true,
      requiredMessage: 'Please select citizenship',
    },
  },
  ckycNo: {
    fieldName: 'ckycNo',
    conditionalLogic: [
      {
        when: {
          field: 'citizenship',
          operator: 'equals',
          value: 'Indian',
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage:
              'Please enter the CKYC number as Citizenship is India.',
            maxLength: 14,
            maxLengthMessage: 'CKYC number must be exactly 14 characters long.',
            minLength: 14,
            minLengthMessage: 'CKYC number must be exactly 14 characters long.',
            regx: '^[0-9]{14}$',
            regxMessage: 'CKYC number must contain only 14 digits.',
          },
        },
      },
    ],
  },
  title: {
    fieldName: 'title',
    validationRules: {
      required: true,
      requiredMessage: 'Please select a title (Mr./Mrs./Ms.).',
    },
  },
  firstName: {
    fieldName: 'firstName',
    validationRules: {
      required: true,
      requiredMessage: 'Please enter your first name.',
      regx: "^[A-Za-z\\s.'-]+$",
      regxMessage:
        'First Name can only contain letters, spaces, apostrophes, dots, and hyphens.',
      maxLength: 33,
      maxLengthMessage: 'First Name cannot exceed 33 characters.',
      minLength: 2,
      minLengthMessage: 'First Name must be at least 2 characters.',
    },
  },
  middleName: {
    fieldName: 'middleName',
    validationRules: {
      required: false,
      regx: "^[A-Za-z\\s.'-]+$",
      regxMessage:
        'Middle Name can only contain letters, spaces, apostrophes, dots, and hyphens.',
      maxLength: 33,
      maxLengthMessage: 'Middle Name cannot exceed 33 characters.',
      minLength: 2,
      minLengthMessage: 'Middle Name must be at least 2 characters if entered.',
    },
  },
  lastName: {
    fieldName: 'lastName',
    validationRules: {
      required: false,
      regx: "^[A-Za-z\\s.'-]+$",
      regxMessage:
        'Last Name can only contain letters, spaces, apostrophes, dots, and hyphens.',
      maxLength: 33,
      maxLengthMessage: 'Last Name cannot exceed 33 characters.',
      minLength: 2,
      minLengthMessage: 'Last Name must be at least 2 characters.',
    },
  },
  gender: {
    fieldName: 'gender',
    validationRules: {
      required: true,
      requiredMessage: 'Please select your gender.',
    },
  },
  dob: {
    fieldName: 'dob',
    validationRules: {
      required: true,
      requiredMessage: 'Please select your DOB.',
      isAdultAge: 18,
      maxDate: true,
    },
  },
  designation: {
    fieldName: 'designation',
    validationRules: {
      required: true,
      requiredMessage: 'Please enter your designation',
      maxLength: 100,
      maxLengthMessage: 'Designation cannot exceed 100 characters.',
      regx: '^[A-Za-z0-9 `~@#$%^&*()_+\\-=]{1,100}$',
      regxMessage:
        'Designation can only contain alphanumeric characters and specific symbols.',
    },
  },
  employeeCode: {
    fieldName: 'employeeCode',
    validationRules: {
      required: true,
      requiredMessage: 'Employee Code is required',
      regx: '^[A-Za-z0-9+]{0,50}$',
      regxMessage: 'Employee code must within 50 character',
      maxLength: 50,
      maxLengthMessage: 'Enter value not more then 50',
    },
  },
  email: {
    fieldName: 'email',
    validationRules: {
      required: true,
      requiredMessage: 'Please enter your email address.',
      maxLength: 254,
      maxLengthMessage: 'Email address cannot exceed 254 characters.',
      regx: '^(?=.*@)[A-Za-z0-9`~@#$%^&*.()_+\\-=]+$',
      regxMessage: 'Please enter a valid email address format.',
    },
  },
  countryCode: {
    fieldName: 'countryCode',
    validationRules: {
      required: true,
      requiredMessage: 'Please select a country code.',
      maxLength: 60,
      maxLengthMessage: 'Valid length for country code is 60 character',
    },
  },
  mobile: {
    fieldName: 'mobile',
    conditionalLogic: [
      {
        when: {
          field: 'countryCode',
          operator: 'in',
          value: ['+91'],
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage: 'Mobile number is required for Indian citizens.',
            maxLength: 10,
            maxLengthMessage:
              'Mobile number must be 10 digits for Indian citizens.',
            minLength: 10,
            minLengthMessage:
              'Mobile number must be 10 digits for Indian citizens.',
            numberValidation: true,
            regx: '^[0-9]{10}$',
            regxMessage: 'Mobile number must be 10 digits only.',
          },
        },
        else: {
          validationRules: {
            required: true,
            requiredMessage: 'Mobile number is required.',
            maxLength: 15,
            maxLengthMessage: 'Mobile number cannot exceed 15 digits.',
            minLength: 8,
            minLengthMessage: 'Mobile number must be at least 8 digits.',
            numberValidation: true,
            regx: '^[0-9]+$',
            regxMessage: 'Mobile number must contain only digits.',
          },
        },
      },
    ],
  },
  landline: {
    fieldName: 'landline',
    validationRules: {
      required: false,
      regx: '^[A-Za-z0-9+]{0,15}$',
      regxMessage: 'Landline number must contain only digits.',
      maxLength: 15,
      maxLengthMessage: 'Landline number cannot exceed 15 digits.',
    },
  },
  addressLine1: {
    fieldName: 'addressLine1',
    validationRules: {
      required: true,
      requiredMessage: 'Please enter address line 1',
    },
  },
  addressLine2: {
    fieldName: 'addressLine2',
    validationRules: {
      required: false,
    },
  },
  addressLine3: {
    fieldName: 'addressLine3',
    validationRules: {
      required: false,
    },
  },
  country: {
    fieldName: 'country',
    validationRules: {
      required: true,
      requiredMessage: 'Please select country',
      maxLength: 60,
      maxLengthMessage: 'Max length for country is 60',
    },
  },
  state: {
    fieldName: 'state',
    conditionalLogic: [
      {
        when: {
          field: 'country',
          operator: 'equal',
          value: 'India',
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage: 'Please select state',
            maxLength: 60,
            maxLengthMessage: 'Max length for state is 60',
          },
        },
        else: {
          validationRules: {
            required: false,
            maxLength: 60,
            maxLengthMessage: 'Max length for state is 60',
          },
        },
      },
    ],
  },
  district: {
    fieldName: 'district',
    conditionalLogic: [
      {
        when: {
          field: 'country',
          operator: 'equal',
          value: 'India',
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage: 'Please select district',
            maxLength: 40,
            maxLengthMessage: 'Max lengths for district is 40',
          },
        },
        else: {
          validationRules: {
            required: false,
            maxLength: 40,
            maxLengthMessage: 'Max lengths for district is 40',
          },
        },
      },
    ],
  },
  city: {
    fieldName: 'city',
    conditionalLogic: [
      {
        when: {
          field: 'country',
          operator: 'equal',
          value: 'India',
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage: 'Please select city',
            maxLength: 60,
            maxLengthMessage: 'Max length for district is 60',
          },
        },
        else: {
          validationRules: {
            required: false,
            maxLength: 60,
            maxLengthMessage: 'Max length for district is 60',
          },
        },
      },
    ],
  },
  pincode: {
    fieldName: 'pincode',
    conditionalLogic: [
      {
        when: {
          field: 'country',
          operator: 'equal',
          value: 'India',
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage: 'Please select PIN CODE',
            maxLength: 6,
            maxLengthMessage: 'Max length for district is 6',
          },
        },
        else: {
          validationRules: {
            required: false,
            requiredMessage: 'Enter PIN CODE',
            numberValidation: true,
            regx: '^[0-9]{1,50}$',
            regxMessage: 'Pin code only accept digit',
            maxLength: 50,
            maxLengthMessage: 'Max length for pin code 50',
          },
        },
      },
    ],
  },
  pincodeOther: {
    fieldName: 'pincodeOther',
    conditionalLogic: [
      {
        when: {
          field: 'pincode',
          operator: 'is',
          value: 'other',
        },
        then: {
          validationRules: {
            required: true,
            requiredMessage: 'Enter Pin code other',
            numberValidation: true,
            regx: '^[0-9]{6}$',
            regxMessage: 'Pin code only accept 6 digit',
            maxLength: 6,
            maxLengthMessage: 'Max length for pin code 6',
          },
        },
        else: {
          validationRules: {
            required: false,
            numberValidation: true,
            regx: '^[0-9]{50}$',
            regxMessage: 'Pin code only accept 50 digit',
            maxLength: 50,
            maxLengthMessage: 'Max length for pin code 50',
          },
        },
      },
    ],
  },
  digipin: {
    fieldName: 'digipin',
    validationRules: {
      required: false,
      maxLength: 12,
      maxLengthMessage: 'Max length for digipin is 12',
      regx: '^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$',
      regxMessage:
        'Please enter a valid Digipin (eg: 29C-45F-7JMT). Only digits 2-9 and letters C,F,J,K,L,M,P,T are allowed.',
    },
  },
  poi: {
    fieldName: 'poi',
    validationRules: {
      required: true,
      requiredMessage: 'Please select proof of identity',
    },
  },
  poiNumber: {
    fieldName: 'poiNumber',
    validationRules: {
      required: true,
      requiredMessage: 'Enter proof of identity number and file',
    },
  },
  boardResolutionDate: {
    fieldName: 'boardResolutionDate',
    validationRules: {
      required: true,
      requiredMessage: 'Please select your date.',
      maxDate: true,
    },
  },
};

/**
 * Get validation rules for a field with conditional logic applied
 */
export const getValidationRules = (
  fieldName: string,
  formData: Record<string, any>
): ValidationRule | null => {
  const config = nodalOfficerValidationRules[fieldName];
  if (!config) return null;

  // Check for conditional logic
  if (config.conditionalLogic && config.conditionalLogic.length > 0) {
    for (const logic of config.conditionalLogic) {
      const { when, then, else: elseRules } = logic;
      const dependentValue = formData[when.field];

      let conditionMet = false;

      switch (when.operator) {
        case 'equals':
        case 'equal':
          conditionMet =
            String(dependentValue).toLowerCase() ===
            String(when.value).toLowerCase();
          break;
        case 'in':
          conditionMet =
            Array.isArray(when.value) && when.value.includes(dependentValue);
          break;
        case 'is':
          conditionMet =
            String(dependentValue).toLowerCase() ===
            String(when.value).toLowerCase();
          break;
      }

      if (conditionMet && then?.validationRules) {
        return then.validationRules;
      } else if (!conditionMet && elseRules?.validationRules) {
        return elseRules.validationRules;
      }
    }
  }

  return config.validationRules || null;
};

/**
 * Validate a single field value
 */
export const validateField = (
  fieldName: string,
  value: any,
  formData: Record<string, any>
): string => {
  const rules = getValidationRules(fieldName, formData);
  if (!rules) return '';

  const stringValue = String(value || '').trim();

  // Required validation
  if (rules.required && !stringValue) {
    return rules.requiredMessage || `${fieldName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!stringValue && !rules.required) {
    return '';
  }

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    return (
      rules.minLengthMessage ||
      `Minimum length is ${rules.minLength} characters`
    );
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return (
      rules.maxLengthMessage ||
      `Maximum length is ${rules.maxLength} characters`
    );
  }

  // Regex validation
  if (rules.regx) {
    const regex = new RegExp(rules.regx);
    if (!regex.test(stringValue)) {
      return rules.regxMessage || 'Invalid format';
    }
  }

  // Number validation
  if (rules.numberValidation) {
    if (!/^\d+$/.test(stringValue)) {
      return 'Only numbers are allowed';
    }
  }

  // Date validations (isAdultAge, maxDate) would be handled separately in date components

  return '';
};

/**
 * Validate multiple fields
 */
export const validateFields = (
  fieldNames: string[],
  formData: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fieldNames.forEach((fieldName) => {
    const value = formData[fieldName];
    const error = validateField(fieldName, value, formData);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Validate all fields in the form
 */
export const validateAllFields = (
  formData: Record<string, any>
): Record<string, string> => {
  const fieldNames = Object.keys(nodalOfficerValidationRules);
  return validateFields(fieldNames, formData);
};

/**
 * Validate a field using ONLY regex pattern (for UpdateSubUserProfile)
 * Ignores required, minLength, maxLength, and other validations
 */
export const validateFieldRegexOnly = (
  fieldName: string,
  value: any,
  formData: Record<string, any>
): string => {
  const rules = getValidationRules(fieldName, formData);
  if (!rules) return '';

  const stringValue = String(value || '').trim();

  // Skip validation if field is empty
  if (!stringValue) {
    return '';
  }

  // Only check regex pattern
  if (rules.regx) {
    const regex = new RegExp(rules.regx);
    if (!regex.test(stringValue)) {
      return rules.regxMessage || 'Invalid format';
    }
  }

  return '';
};

/**
 * Validate multiple fields using regex only
 */
export const validateFieldsRegexOnly = (
  fieldNames: string[],
  formData: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  fieldNames.forEach((fieldName) => {
    const value = formData[fieldName];
    const error = validateFieldRegexOnly(fieldName, value, formData);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Proof of Identity Validation Functions (from validationUtils.ts)
 */

// Aadhaar (India) - Last 4 digits only
export const isValidAadhaar = (value?: string): boolean => {
  if (!value) return false;
  const v = String(value).replace(/\s+/g, '');
  // Aadhaar last 4 digits - exactly 4 numeric digits
  return /^\d{4}$/.test(v);
};

// PAN (India) - 5 letters, 4 digits, 1 letter
export const isValidPAN = (value?: string): boolean => {
  if (!value) return false;
  const v = String(value).trim().toUpperCase();
  return /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/.test(v);
};

// Passport - 1 letter followed by 7 digits (e.g., A1234567)
export const isValidPassport = (value?: string): boolean => {
  if (!value) return false;
  const v = String(value).trim().toUpperCase();
  return /^[A-Z]{1}[0-9]{7}$/.test(v);
};

// Voter ID (EPIC) - 3 letters followed by 7 digits (example: ABC1234567)
export const isValidVoterId = (value?: string): boolean => {
  if (!value) return false;
  const v = String(value).trim().toUpperCase();
  return /^[A-Z]{3}[0-9]{7}$/.test(v);
};

// Driving License - State code (2 letters) + 2 digits + 11-13 alphanumeric
export const isValidDrivingLicense = (value?: string): boolean => {
  if (!value) return false;
  const v = String(value).trim().toUpperCase().replace(/\s+/g, '');
  // Common pattern: KA01AB1234567 or KA01-123456789012
  return /^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$/.test(v);
};

/**
 * Validate Proof of Identity Number based on POI type
 */
export const validateProofOfIdentityNumber = (
  value: string,
  proofType: string
): string => {
  if (!value || !proofType) {
    return '';
  }

  const upperProofType = proofType.toUpperCase();

  switch (upperProofType) {
    case 'AADHAAR':
      if (!isValidAadhaar(value)) {
        return 'Enter last 4 digits of Aadhaar';
      }
      break;

    case 'PAN_CARD':
      if (!isValidPAN(value)) {
        return 'Invalid PAN format';
      }
      break;

    case 'PASSPORT':
      if (!isValidPassport(value)) {
        return 'Invalid Passport number';
      }
      break;

    case 'VOTER_ID':
      if (!isValidVoterId(value)) {
        return 'Invalid Voter ID format';
      }
      break;

    case 'DRIVING_LICENSE':
      if (!isValidDrivingLicense(value)) {
        return 'Invalid Driving License format';
      }
      break;

    default:
      return '';
  }

  return '';
};

/**
 * Check if a field should be validated (not disabled, etc.)
 */
export const shouldValidateField = (
  fieldName: string,
  formData: Record<string, any>,
  isCkycVerified: boolean
): boolean => {
  // CKYC verified fields should not be validated as they're disabled
  const ckycFields = [
    'citizenship',
    'title',
    'firstName',
    'middleName',
    'lastName',
    'gender',
    'countryCode',
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'country',
    'state',
    'district',
    'city',
    'pincode',
    'digipin',
  ];

  if (isCkycVerified && ckycFields.includes(fieldName)) {
    return false;
  }

  return true;
};
