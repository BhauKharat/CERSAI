import * as Yup from 'yup';
import { ValidationUtils } from '../../../../utils/validationUtils';

// Constitution to PAN 4th character mapping
const CONSTITUTION_TO_PAN_CHAR: Record<
  string,
  { char: string | string[]; format: string }
> = {
  INDIVIDUAL: { char: 'P', format: 'AAAPA9999A' },
  'SOLE PROPRIETORSHIP': { char: 'P', format: 'AAAPA9999A' },
  'PARTNERSHIP FIRM': { char: 'F', format: 'AAAFA9999A' },
  COMPANY: { char: 'C', format: 'AAACA9999A' },
  'PRIVATE LIMITED COMPANY': { char: 'C', format: 'AAACA9999A' },
  'PUBLIC LIMITED COMPANY': { char: 'C', format: 'AAACA9999A' },
  'CENTRAL/STATE GOVT DEPT OR AGENCY': { char: 'G', format: 'AAAGA9999A' },
  HUF: { char: 'H', format: 'AAAHA9999A' },
  'LOCAL AUTHORITY': { char: 'L', format: 'AAALA9999A' },
  'ARTIFICIAL JURIDICAL PERSON': { char: 'J', format: 'AAAJA9999A' },
  'ASSOCIATION OF PERSONS (AOP) / BODY OF INDIVIDUALS (BOI)': {
    char: ['A', 'B'],
    format: 'AAA(A/B)A9999A',
  },
  'LIMITED LIABILITY PARTNERSHIP': { char: 'E', format: 'AAAEA9999A' },
  TRUST: { char: 'T', format: 'AAATA9999A' },
};

// Types for validation rules
export interface ValidationRules {
  required?: boolean | string;
  requiredMessage?: string;
  minLength?: number | string;
  minLengthMessage?: string;
  maxLength?: number | string;
  maxLengthMessage?: string;
  regx?: string;
  regxMessage?: string;
  regsMessage?: string; // Backend uses 'regsMessage' (with 's') instead of 'regxMessage'
  imageRequired?: boolean;
  imageRequiredMessage?: string;
  imageFormat?: string[];
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

export interface FormField {
  id: string | number;
  fieldName: string;
  fieldFileName?: string;
  fieldType:
    | 'textfield'
    | 'dropdown'
    | 'checkbox'
    | 'file'
    | 'textfield_with_image'
    | 'textfield_with_verify'
    | 'date';
  fieldLabel: string;
  validationRules?: ValidationRules | null;
  // Optional conditional logic (loosely typed here to avoid coupling)
  conditionalLogic?: Array<{
    when: { field: string; operator: string; value: string | string[] | null };
    then?: { validationRules?: ValidationRules };
    fieldAttributes?: Record<string, unknown>;
  }> | null;
}

// Common validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  MIN_LENGTH: (min: number) => `Minimum ${min} characters required`,
  MAX_LENGTH: (max: number) => `Maximum ${max} characters allowed`,
  INVALID_FORMAT: 'Invalid format',
  FILE_REQUIRED: 'File is required',
  FILE_SIZE_EXCEEDED: 'File size too large',
  INVALID_FILE_FORMAT: 'Invalid file format',
  INVALID_AADHAAR: 'Please enter a valid Aadhaar number',
  INVALID_PAN: 'Please enter a valid PAN number',
  INVALID_PASSPORT: 'Please enter a valid Passport number',
  INVALID_VOTER_ID: 'Please enter a valid Voter ID',
  INVALID_DRIVING_LICENSE: 'Please enter a valid Driving License number',
};

// Mapping of Proof of Identity types to their validation functions
export const PROOF_OF_IDENTITY_VALIDATORS: Record<
  string,
  {
    validator: (value: string, countryCode?: string) => boolean;
    message: string;
  }
> = {
  AADHAAR: {
    validator: ValidationUtils.isValidAadhaar,
    message: VALIDATION_MESSAGES.INVALID_AADHAAR,
  },
  AADHAR: {
    validator: ValidationUtils.isValidAadhaar,
    message: VALIDATION_MESSAGES.INVALID_AADHAAR,
  },
  PAN: {
    validator: ValidationUtils.isValidPAN,
    message: VALIDATION_MESSAGES.INVALID_PAN,
  },
  PAN_CARD: {
    validator: ValidationUtils.isValidPAN,
    message: VALIDATION_MESSAGES.INVALID_PAN,
  },
  PASSPORT: {
    validator: ValidationUtils.isValidPassport,
    message: VALIDATION_MESSAGES.INVALID_PASSPORT,
  },
  VOTER_ID: {
    validator: ValidationUtils.isValidVoterId,
    message: VALIDATION_MESSAGES.INVALID_VOTER_ID,
  },
  VOTERID: {
    validator: ValidationUtils.isValidVoterId,
    message: VALIDATION_MESSAGES.INVALID_VOTER_ID,
  },
  DRIVING_LICENSE: {
    validator: ValidationUtils.isValidDrivingLicense,
    message: VALIDATION_MESSAGES.INVALID_DRIVING_LICENSE,
  },
  DL: {
    validator: ValidationUtils.isValidDrivingLicense,
    message: VALIDATION_MESSAGES.INVALID_DRIVING_LICENSE,
  },
  'DRIVING LICENSE': {
    validator: ValidationUtils.isValidDrivingLicense,
    message: VALIDATION_MESSAGES.INVALID_DRIVING_LICENSE,
  },
};

// File validation helpers
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeInBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateFileFormat = (
  file: File,
  allowedFormats: string[]
): boolean => {
  const fileExtension = file.name?.split('.').pop()?.toLowerCase();
  return fileExtension
    ? allowedFormats.map((f) => f.toLowerCase()).includes(fileExtension)
    : false;
};

export const createTextFieldSchema = (
  rules: ValidationRules,
  fieldLabel: string,
  fieldName?: string
): Yup.StringSchema => {
  let schema = Yup.string();

  const isRequired =
    rules.required === true || String(rules.required) === 'true';

  if (isRequired) {
    const message =
      rules.requiredMessage ||
      (typeof rules.required === 'string'
        ? rules.required
        : `${fieldLabel} is required`);

    schema = schema.required(message);
  }

  if (rules.minLength) {
    const minLength =
      typeof rules.minLength === 'string'
        ? parseInt(rules.minLength, 10)
        : rules.minLength;
    const message =
      rules.minLengthMessage || VALIDATION_MESSAGES.MIN_LENGTH(minLength);

    schema = schema.test(
      'min-length-validation',
      message,
      function (value: string | undefined | null) {
        if (!value || value.trim() === '') {
          return true;
        }

        return value.length >= minLength;
      }
    );
  }

  if (rules.maxLength) {
    const maxLength =
      typeof rules.maxLength === 'string'
        ? parseInt(rules.maxLength, 10)
        : rules.maxLength;
    const message =
      rules.maxLengthMessage || VALIDATION_MESSAGES.MAX_LENGTH(maxLength);

    schema = schema.test(
      'max-length-validation',
      message,
      function (value: string | undefined | null) {
        if (!value || value.trim() === '') {
          return true;
        }

        return value.length <= maxLength;
      }
    );
  }

  // Skip regex validation for proof of identity number fields
  // since validation is handled separately in formSlice.ts with correct format per ID type
  const isProofOfIdentityNumber = fieldName
    ?.toLowerCase()
    .includes('proofofidentitynumber');

  if (rules.regx && !isProofOfIdentityNumber) {
    schema = schema.test(
      'regex-validation',
      rules.regxMessage ||
        rules.regsMessage ||
        VALIDATION_MESSAGES.INVALID_FORMAT,
      function (value: string | undefined | null) {
        if (!value || value.trim() === '') {
          return true;
        }

        return new RegExp(rules.regx!).test(value);
      }
    );
  }

  // Add field-specific validations based on field name patterns
  if (fieldName) {
    const fieldNameLower = fieldName.toLowerCase();

    // Email validation
    if (fieldNameLower.includes('email')) {
      schema = schema.test(
        'email-validation',
        'Please enter a valid email address',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }
          return ValidationUtils.isValidEmail(value);
        }
      );
    }

    // Mobile number validation
    if (
      fieldNameLower.includes('mobile') &&
      !fieldNameLower.includes('countrycode')
    ) {
      schema = schema.test(
        'mobile-validation',
        'Please enter a valid mobile number',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }

          // Get country code from form context if available
          const countryCodeField = Object.keys(this.parent || {}).find((key) =>
            key.toLowerCase().includes('countrycode')
          );
          const countryCodeValue = countryCodeField
            ? this.parent[countryCodeField]
            : 'IN';
          const countryCode = countryCodeValue || 'IN';

          return ValidationUtils.isValidMobileNumber(value, countryCode);
        }
      );
    }

    // Pincode validation (only for non-"Other" pincode fields, excluding digipin and llpin)
    if (
      (fieldNameLower.includes('pincode') || fieldNameLower.includes('pin')) &&
      !fieldNameLower.includes('other') &&
      !fieldNameLower.includes('digipin') &&
      !fieldNameLower.includes('llpin')
    ) {
      schema = schema.test(
        'pincode-validation',
        'Please enter a valid 6-digit pincode',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }

          // If value is "other", skip validation
          if (String(value).toLowerCase() === 'other') {
            return true;
          }

          return ValidationUtils.isValidPincode(value);
        }
      );
    }

    // PincodeOther validation (numeric, 6 digits)
    // if (fieldNameLower.includes('pincodeother')) {
    //   schema = schema.test(
    //     'pincode-other-validation',
    //     'Please enter a valid 6-digit pincode',
    //     function (value: string | undefined | null) {
    //       if (!value || value.trim() === '') {
    //         return true;
    //       }
    //       return ValidationUtils.isValidPincode(value);
    //     }
    //   );
    // }

    // First name validation
    if (
      (fieldNameLower.includes('firstname') ||
        fieldNameLower.includes('first_name')) &&
      !fieldNameLower.includes('middle') &&
      !fieldNameLower.includes('last')
    ) {
      schema = schema.test(
        'first-name-validation',
        'Please enter a valid first name (letters, spaces, apostrophe, and dots only)',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }
          return ValidationUtils.isValidFirstName(value);
        }
      );
    }

    // Middle name validation
    if (
      fieldNameLower.includes('middlename') ||
      fieldNameLower.includes('middle_name')
    ) {
      schema = schema.test(
        'middle-name-validation',
        'Please enter a valid middle name (letters, spaces, apostrophe, and dots only)',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }
          return ValidationUtils.isValidMiddleLastName(value);
        }
      );
    }

    // Last name validation
    if (
      fieldNameLower.includes('lastname') ||
      fieldNameLower.includes('last_name')
    ) {
      schema = schema.test(
        'last-name-validation',
        'Please enter a valid last name (letters, spaces, apostrophe, and dots only)',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }
          return ValidationUtils.isValidMiddleLastName(value);
        }
      );
    }

    // CKYC Number validation (14 digits)
    if (fieldNameLower.includes('ckycnumber')) {
      schema = schema.test(
        'ckyc-number-validation',
        'Please enter a valid 14-digit CKYC number',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }
          // CKYC number should be 14 digits
          return /^\d{14}$/.test(value.trim());
        }
      );
    }

    // Proof of Identity Number validation is handled in formSlice.ts validateField function
    // with correct format validation for each ID type (e.g., Aadhaar last 4 digits only)

    // Constitution validation removed - dropdown already ensures valid selection
    // The form now stores constitution codes (e.g., "E", "J") instead of names

    // Designation validation
    if (fieldNameLower.includes('designation')) {
      schema = schema.test(
        'designation-validation',
        'Please enter a valid designation (alphanumeric characters and specific symbols only)',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true; // Let required rule handle empty value
          }
          // Designation can contain alphanumeric characters and specific symbols
          // Based on API: ^[A-Za-z0-9 `~@#$%^&*()_+\-=]{1,100}$
          const designationRegex = /^[A-Za-z0-9 `~@#$%^&*()_+\-=]{1,100}$/;
          return designationRegex.test(value);
        }
      );
    }

    // Employee Code validation
    if (
      fieldNameLower.includes('employcode') ||
      fieldNameLower.includes('employeecode')
    ) {
      schema = schema.test(
        'employeecode-validation',
        'Employee code must contain only alphanumeric characters and + sign',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true; // Let required rule handle empty value
          }
          // Employee code can contain alphanumeric characters and + sign
          // Based on API: ^[A-Za-z0-9+]{0,50}$
          const employeeCodeRegex = /^[A-Za-z0-9+]{0,50}$/;
          return employeeCodeRegex.test(value);
        }
      );
    }

    // PAN validation based on Constitution type
    // This validates PAN format based on the selected constitution
    if (fieldNameLower === 'pan' || fieldNameLower.endsWith('pan')) {
      schema = schema.test(
        'pan-constitution-validation',
        'Please enter a valid PAN number',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }

          const panValue = value.trim().toUpperCase();

          // Basic PAN format validation (5 letters, 4 digits, 1 letter)
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panValue)) {
            return this.createError({
              message:
                'PAN must be in the format AAAAA9999A (5 letters, 4 digits, 1 letter)',
            });
          }

          // Get the constitution from form context
          const constitutionField = Object.keys(this.parent || {}).find(
            (key) => key.toLowerCase() === 'constitution'
          );

          if (!constitutionField) {
            return true; // Skip constitution-specific validation if field not found
          }

          const constitution = String(
            this.parent[constitutionField] || ''
          ).toUpperCase();

          if (!constitution) {
            return true; // Skip if no constitution selected
          }

          const expectedMapping = CONSTITUTION_TO_PAN_CHAR[constitution];

          if (!expectedMapping) {
            return true; // No specific mapping for this constitution
          }

          const fourthChar = panValue.charAt(3);
          const allowedChars = Array.isArray(expectedMapping.char)
            ? expectedMapping.char
            : [expectedMapping.char];

          if (!allowedChars.includes(fourthChar)) {
            return this.createError({
              message: `PAN must be in the format ${expectedMapping.format}`,
            });
          }

          return true;
        }
      );
    }
  }

  return schema;
};

export const createFileSchema = (
  rules: ValidationRules,
  fieldLabel: string
): Yup.MixedSchema => {
  let schema = Yup.mixed();

  const fileRules = rules.validationFile || rules;
  const isImageRequired =
    fileRules?.imageRequired === true ||
    String(fileRules?.imageRequired).toLowerCase() === 'true';
  const isFieldRequired =
    rules?.required === true ||
    String(rules?.required).toLowerCase() === 'true';
  const isRequired = isImageRequired || isFieldRequired;

  if (isRequired) {
    const message =
      fileRules?.imageRequiredMessage ||
      rules?.requiredMessage ||
      `${fieldLabel} is required`;
    schema = schema.required(message);
  }

  if (fileRules.imageFormat && Array.isArray(fileRules.imageFormat)) {
    schema = schema.test(
      'fileFormat',
      VALIDATION_MESSAGES.INVALID_FILE_FORMAT,
      (value: unknown): boolean => {
        if (!value) return !isRequired;
        const file = value as File;
        return validateFileFormat(file, fileRules.imageFormat!);
      }
    );
  }

  if (fileRules.size) {
    const maxSizeInMB = parseFloat(fileRules.size.replace(/mb|MB/i, ''));
    const message =
      fileRules.sizeMessage || VALIDATION_MESSAGES.FILE_SIZE_EXCEEDED;

    schema = schema.test('fileSize', message, (value: unknown): boolean => {
      if (!value) return !isRequired;
      const file = value as File;
      return validateFileSize(file, maxSizeInMB);
    });
  }

  return schema;
};

// Helper to check if a field has intrinsic validation based on its name
const hasIntrinsicValidation = (fieldName: string): boolean => {
  const lowerName = fieldName.toLowerCase();
  return (
    lowerName.includes('email') ||
    (lowerName.includes('mobile') && !lowerName.includes('countrycode')) ||
    (lowerName.includes('pincode') &&
      !lowerName.includes('other') &&
      !lowerName.includes('llpin')) ||
    (lowerName.includes('pin') &&
      !lowerName.includes('llpin') &&
      !lowerName.includes('digipin')) ||
    lowerName.includes('pincodeother') ||
    ((lowerName.includes('firstname') || lowerName.includes('first_name')) &&
      !lowerName.includes('middle') &&
      !lowerName.includes('last')) ||
    lowerName.includes('middlename') ||
    lowerName.includes('middle_name') ||
    lowerName.includes('lastname') ||
    lowerName.includes('last_name') ||
    lowerName.includes('ckycnumber') ||
    lowerName.includes('proofofidentitynumber') ||
    lowerName.includes('designation') ||
    lowerName.includes('employcode') ||
    lowerName.includes('employeecode')
  );
};

export const buildValidationSchema = (
  fields: FormField[]
): Yup.ObjectSchema<Record<string, unknown>> => {
  const schemaFields: Record<string, Yup.Schema> = {};

  fields.forEach((field) => {
    const rules = field.validationRules;

    // Allow fields with conditional logic OR fields that might have intrinsic validation based on name
    // (e.g. email, mobile, pan, etc. handled in createTextFieldSchema)
    if (
      !rules &&
      !field.conditionalLogic &&
      !hasIntrinsicValidation(field.fieldName)
    )
      return;

    let fieldSchema: Yup.StringSchema | Yup.MixedSchema | Yup.BooleanSchema;

    // Create base schema based on field type
    switch (field.fieldType) {
      case 'textfield':
      case 'dropdown':
        // If no base rules, start with basic string schema but still pass to createTextFieldSchema
        // to pick up name-based validations
        fieldSchema = createTextFieldSchema(
          rules || {},
          field.fieldLabel,
          field.fieldName
        );
        break;

      case 'checkbox':
        // Checkbox validation - typically just boolean
        fieldSchema = Yup.boolean();
        if (
          rules &&
          (rules.required === true || String(rules.required) === 'true')
        ) {
          // eslint-disable-next-line prettier/prettier
          const message =
            rules.requiredMessage || `${field.fieldLabel} is required`;
          // eslint-disable-next-line prettier/prettier
          fieldSchema = (fieldSchema as Yup.BooleanSchema).oneOf(
            [true],
            message
          );
        }
        break;

      case 'textfield_with_image': {
        // Text part validation - if no base rules, start with basic string schema
        // For fields with conditional logic and no base required rule, start with optional string
        const hasConditionalLogicOnly =
          field.conditionalLogic &&
          field.conditionalLogic.length > 0 &&
          (!rules || rules.required !== true);

        fieldSchema =
          rules && !hasConditionalLogicOnly
            ? createTextFieldSchema(rules, field.fieldLabel, field.fieldName)
            : Yup.string().optional();

        // File part validation - use fieldFileName or fallback to fieldName_file
        // Match the pattern used in UpdateEntityProfileStep (line 114)
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        // Check both nested validationFile and top-level rules for file validation
        const fileRules = rules?.validationFile || rules || {};

        // Check if we need file validation - either in base rules or conditional logic
        const hasBaseFileValidation =
          fileRules.imageRequired ||
          fileRules.imageFormat ||
          fileRules.size ||
          rules?.imageRequired ||
          rules?.imageFormat ||
          rules?.size;

        const hasConditionalFileValidation = field.conditionalLogic?.some(
          (cond) => cond?.then?.validationRules?.validationFile
        );

        if (hasBaseFileValidation || hasConditionalFileValidation) {
          // Create base file schema (may be optional if only conditional validation exists)
          let fileSchema =
            hasBaseFileValidation && rules
              ? createFileSchema(rules, field.fieldLabel)
              : Yup.mixed(); // Start with optional schema if no base validation

          // Apply conditional logic to file validation if present
          if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
            for (const cond of field.conditionalLogic) {
              const whenField = cond?.when?.field;
              const operator = cond?.when?.operator || 'equals';
              const rawValue = cond?.when?.value;
              const values = Array.isArray(rawValue) ? rawValue : [rawValue];
              const thenRules = cond?.then?.validationRules || {};

              // Get else rules for file validation
              const condWithElse = cond as {
                else?: { validationRules?: ValidationRules };
              };
              const elseRules = condWithElse?.else?.validationRules || {};

              if (
                whenField &&
                (thenRules.validationFile || elseRules.validationFile)
              ) {
                fileSchema = fileSchema.when(
                  whenField,
                  (depValue: unknown, schema: Yup.MixedSchema) => {
                    let match = false;
                    const depString = depValue != null ? String(depValue) : '';

                    switch (operator) {
                      case 'in':
                      case 'equals':
                      case 'is':
                        match = values
                          .map((v) => String(v).toLowerCase())
                          .includes(depString.toLowerCase());
                        break;
                      case 'not_in':
                      case 'not_equals':
                      case 'is_not':
                        match = !values
                          .map((v) => String(v).toLowerCase())
                          .includes(depString.toLowerCase());
                        break;
                      case 'is_not_empty':
                        match = depString !== '';
                        break;
                      case 'is_empty':
                        match = depString === '';
                        break;
                      default:
                        match = false;
                    }

                    if (match && thenRules.validationFile) {
                      // Merge base file rules with conditional file rules (handle null base rules)
                      const mergedRules: ValidationRules = {
                        ...(rules || {}),
                        ...thenRules,
                        validationFile: {
                          ...(rules?.validationFile || {}),
                          ...thenRules.validationFile,
                        },
                      };
                      return createFileSchema(mergedRules, field.fieldLabel);
                    } else if (!match && elseRules.validationFile) {
                      // Condition not matched - check if else rules say file is not required
                      const isElseFileRequired =
                        elseRules.validationFile.imageRequired === true ||
                        String(elseRules.validationFile.imageRequired) ===
                          'true';

                      if (!isElseFileRequired) {
                        // File is optional in else case
                        return Yup.mixed().optional();
                      }

                      // Else rules require the file
                      const mergedElseRules: ValidationRules = {
                        ...(rules || {}),
                        ...elseRules,
                        validationFile: {
                          ...(rules?.validationFile || {}),
                          ...elseRules.validationFile,
                        },
                      };
                      return createFileSchema(
                        mergedElseRules,
                        field.fieldLabel
                      );
                    }
                    return schema;
                  }
                );
              }
            }
          }

          schemaFields[fileFieldName] = fileSchema;
        }
        break;
      }

      case 'textfield_with_verify': {
        // Text part validation - if no base rules, start with basic string schema
        fieldSchema = rules
          ? createTextFieldSchema(rules, field.fieldLabel, field.fieldName)
          : Yup.string();

        // File part validation (stored as fieldName_file)
        if (rules) {
          const verifyFileRules = rules.validationFile || rules;
          if (
            verifyFileRules.imageRequired ||
            verifyFileRules.imageFormat ||
            verifyFileRules.size
          ) {
            const fileSchema = createFileSchema(rules, field.fieldLabel);
            schemaFields[`${field.fieldName}_file`] = fileSchema;
          }
        }
        break;
      }

      case 'file':
        fieldSchema = rules
          ? createFileSchema(rules, field.fieldLabel)
          : Yup.mixed();
        break;

      case 'date': {
        // Date validation - dates are stored as strings in 'YYYY-MM-DD' format
        fieldSchema = Yup.string();

        const isRequired = rules
          ? rules.required === true || String(rules.required) === 'true'
          : false;

        if (isRequired && rules) {
          const message =
            rules.requiredMessage ||
            (typeof rules.required === 'string'
              ? rules.required
              : `${field.fieldLabel} is required`);
          fieldSchema = fieldSchema.required(message);
        }

        // Optional: Add date format validation
        fieldSchema = (fieldSchema as Yup.StringSchema).test(
          'is-valid-date',
          'Please enter a valid date',
          function (value: string | undefined | null) {
            // If empty and not required, it's valid
            if (!value || value.trim() === '') {
              return !isRequired;
            }
            // Check if it's a valid date string
            const date = new Date(value);
            return !isNaN(date.getTime());
          }
        );
        break;
      }

      default:
        fieldSchema = Yup.string();
    }

    // Apply conditional validation rules dynamically (only for text inputs)
    if (
      (field.fieldType === 'textfield' ||
        field.fieldType === 'textfield_with_verify' ||
        field.fieldType === 'textfield_with_image') &&
      field.conditionalLogic &&
      Array.isArray(field.conditionalLogic)
    ) {
      for (const cond of field.conditionalLogic) {
        const whenField = cond?.when?.field;
        const operator = cond?.when?.operator || 'equals';
        const rawValue = cond?.when?.value;
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        const thenRules = cond?.then?.validationRules || {};
        // Get else rules if they exist - type assertion for conditional logic with else block
        const condWithElse = cond as {
          else?: { validationRules?: ValidationRules };
        };
        const elseRules = condWithElse?.else?.validationRules || {};

        if (whenField) {
          fieldSchema = (fieldSchema as Yup.StringSchema).when(
            whenField,
            (depValue: unknown, schema: Yup.StringSchema) => {
              let match = false;
              const depString = depValue != null ? String(depValue) : '';

              switch (operator) {
                case 'in':
                case 'equals':
                case 'is':
                  match = values
                    .map((v) => String(v).toLowerCase())
                    .includes(depString.toLowerCase());
                  break;
                case 'not_in':
                case 'not_equals':
                case 'is_not':
                  match = !values
                    .map((v) => String(v).toLowerCase())
                    .includes(depString.toLowerCase());
                  break;
                case 'is_not_empty':
                  match = depString !== '';
                  break;
                case 'is_empty':
                  match = depString === '';
                  break;
                default:
                  match = false;
              }

              if (match) {
                // Condition matched - use "then" rules with full validation
                const mergedRules: ValidationRules = {
                  ...(rules || {}),
                  ...thenRules,
                };
                return createTextFieldSchema(
                  mergedRules,
                  field.fieldLabel,
                  field.fieldName
                );
              } else if (Object.keys(elseRules).length > 0) {
                // Condition not matched - check if else rules say field is not required
                const isElseRequired =
                  elseRules.required === true ||
                  String(elseRules.required) === 'true';

                if (!isElseRequired) {
                  // Field is optional in else case - return simple optional string schema
                  // without strict validation (no regex, minLength, maxLength)
                  return Yup.string().optional();
                }

                // Else rules require the field - apply full validation
                const mergedElseRules: ValidationRules = {
                  ...(rules || {}),
                  ...elseRules,
                };
                return createTextFieldSchema(
                  mergedElseRules,
                  field.fieldLabel,
                  field.fieldName
                );
              }
              // No else rules, return the original schema
              return schema;
            }
          );
        }
      }
    }

    // Add main field schema (possibly decorated with conditionals)
    schemaFields[field.fieldName] = fieldSchema;
  });

  return Yup.object().shape(schemaFields);
};

// Validation helper for individual field validation
export const validateField = (
  field: FormField,
  value: unknown,
  formValues: Record<string, unknown>
): boolean => {
  const rules = field.validationRules;
  if (!rules) return true;

  // Check if field is required
  const isRequired =
    rules.required === true || String(rules.required) === 'true';

  if (!isRequired) return true; // Non-required fields are always valid

  // Check based on field type
  switch (field.fieldType) {
    case 'textfield':
    case 'dropdown':
      return Boolean(value && String(value).trim() !== '');

    case 'date': {
      // Date validation - check if date string exists and is valid
      if (!value || String(value).trim() === '') {
        return false;
      }
      const date = new Date(String(value));
      return !isNaN(date.getTime());
    }

    case 'file':
    case 'textfield_with_image': {
      // For textfield_with_image, check the _file field
      let fileValue = value;
      if (field.fieldType === 'textfield_with_image') {
        fileValue = formValues[`${field.fieldName}_file`];
      }

      // For file upload fields, check if file is attached
      const hasFile =
        fileValue &&
        ((typeof fileValue === 'string' && fileValue.trim() !== '') ||
          fileValue instanceof File ||
          (Array.isArray(fileValue) && fileValue.length > 0));

      return Boolean(hasFile);
    }

    default:
      return true;
  }
};

// Async validation function
export const validateAllFields = async (
  fields: FormField[],
  formValues: Record<string, unknown>,
  validationSchema: Yup.ObjectSchema<Record<string, unknown>> | null,
  existingDocuments?: Record<string, string>
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  if (!validationSchema) {
    return { isValid: true, errors: {} };
  }

  try {
    await validationSchema.validate(formValues, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          // Check if this is a file field error and if the file already exists
          const field = fields.find(
            (f) =>
              f.fieldName === err.path ||
              f.fieldFileName === err.path ||
              `${f.fieldName}_file` === err.path
          );

          // Skip file validation errors if file already exists
          if (
            field &&
            existingDocuments &&
            (field.fieldType === 'file' ||
              field.fieldType === 'textfield_with_image')
          ) {
            const fileFieldName =
              field.fieldType === 'textfield_with_image'
                ? field.fieldFileName || `${field.fieldName}_file`
                : field.fieldName;

            // If this error is for a file field and the file exists, skip it
            if (
              err.path === fileFieldName &&
              existingDocuments[fileFieldName]
            ) {
              console.log(
                `✅ Skipping validation error for ${err.path} - file exists`
              );
              return;
            }
          }

          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
};

// Validate a single field - useful for on-blur/on-change validation
export const validateSingleField = async (
  field: FormField,
  value: unknown,
  formValues: Record<string, unknown>,
  validationSchema: Yup.ObjectSchema<Record<string, unknown>> | null
): Promise<string | null> => {
  if (!validationSchema) {
    return null;
  }

  try {
    // Create a partial form data with the field we're validating
    const partialData = {
      ...formValues,
      [field.fieldName]: value,
    };

    // Try to validate just this field using validateAt
    await validationSchema.validateAt(field.fieldName, partialData);
    return null;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.message;
    }
    return null;
  }
};

// Validate PAN against Constitution inline (for immediate feedback)
export const validatePANForConstitution = (
  panValue: string,
  constitution: string
): string | null => {
  if (!panValue || panValue.trim() === '') {
    return null; // Don't show error for empty value
  }

  const pan = panValue.trim().toUpperCase();

  // Basic PAN format validation
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    return 'PAN must be in the format AAAAA9999A (5 letters, 4 digits, 1 letter)';
  }

  if (!constitution || constitution.trim() === '') {
    return null; // Can't validate against constitution if not selected
  }

  const constitutionUpper = constitution.toUpperCase();
  const expectedMapping = CONSTITUTION_TO_PAN_CHAR[constitutionUpper];

  if (!expectedMapping) {
    return null; // Unknown constitution, skip validation
  }

  const fourthChar = pan.charAt(3);
  const allowedChars = Array.isArray(expectedMapping.char)
    ? expectedMapping.char
    : [expectedMapping.char];

  if (!allowedChars.includes(fourthChar)) {
    return `PAN must be in the format ${expectedMapping.format}`;
  }

  return null;
};

// Export default validation configuration
export const DEFAULT_VALIDATION_CONFIG = {
  FILE_SIZE_LIMIT_MB: 1,
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
  ALLOWED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx'],
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 255,
};
