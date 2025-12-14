import * as Yup from 'yup';
import { ValidationUtils } from '../../../../utils/validationUtils';

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
    validator: (value: string) => {
      // For Proof of Identity Number, check for exactly 4 digits
      return /^[0-9]{4}$/.test(value);
    },
    message: 'Enter last 4 digits of Aadhar ',
  },
  AADHAR: {
    validator: (value: string) => {
      // For Proof of Identity Number, check for exactly 4 digits
      return /^[0-9]{4}$/.test(value);
    },
    message: 'Enter last 4 digits of Aadhar ',
  },
  PAN: {
    validator: (value: string) => {
      return /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/.test(value);
    },
    message: 'Invalid PAN format (4th character must be P, e.g., AAAPA1234A)',
  },
  PAN_CARD: {
    validator: (value: string) => {
      return /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/.test(value);
    },
    message: 'Invalid PAN format (4th character must be P, e.g., AAAPA1234A)',
  },
  PASSPORT: {
    validator: (value: string) => {
      return /^[A-Z]{1}[0-9]{7}$/.test(value);
    },
    message: 'Invalid Passport number (e.g., A1234567)',
  },
  VOTER_ID: {
    validator: (value: string) => {
      return /^[A-Z]{3}[0-9]{7}$/.test(value);
    },
    message: 'Invalid Voter ID format (e.g., ABC1234567)',
  },
  VOTERID: {
    validator: (value: string) => {
      return /^[A-Z]{3}[0-9]{7}$/.test(value);
    },
    message: 'Invalid Voter ID format (e.g., ABC1234567)',
  },
  DRIVING_LICENSE: {
    validator: (value: string) => {
      return /^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$/.test(value);
    },
    message: 'Invalid Driving License format (e.g., MH1420110062821)',
  },
  DL: {
    validator: (value: string) => {
      return /^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$/.test(value);
    },
    message: 'Invalid Driving License format (e.g., MH1420110062821)',
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

  // Apply regex validation for any field with a regex pattern (required or optional)
  // If field is optional and empty, validation passes. If value is provided, it must match regex.
  if (rules.regx) {
    const message = rules.regxMessage || `Please enter a valid ${fieldLabel}`;
    schema = schema.test(
      'regex-validation',
      message,
      function (value: string | undefined | null) {
        if (!value || value.trim() === '') {
          return true;
        }

        try {
          const regex = new RegExp(rules.regx!);
          const isValid = regex.test(value);

          // Log validation details for debugging
          if (!isValid) {
            console.log(`🔍 Regex validation failed for ${fieldLabel}:`, {
              value,
              pattern: rules.regx,
              fieldName,
              isRequired,
            });
          }

          return isValid;
        } catch (error) {
          console.error(
            `Invalid regex pattern for ${fieldLabel}:`,
            rules.regx,
            error
          );
          return true; // If regex is invalid, pass validation
        }
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
          const countryCode = countryCodeField
            ? this.parent[countryCodeField]
            : 'IN';

          return ValidationUtils.isValidMobileNumber(value, countryCode);
        }
      );
    }

    // Pincode validation (only for non-"Other" pincode fields)
    if (fieldNameLower.includes('pincode') || fieldNameLower.includes('pin')) {
      schema = schema.test(
        'pincode-validation',
        // 'Please enter a valid 6-digit pincode',
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
    if (fieldNameLower.includes('pincodeother')) {
      schema = schema.test(
        'pincode-other-validation',
        // 'Please enter a valid 6-digit pincode',
        function (value: string | undefined | null) {
          if (!value || value.trim() === '') {
            return true;
          }
          return ValidationUtils.isValidPincode(value);
        }
      );
    }

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
  }

  return schema;
};

export const createFileSchema = (
  rules: ValidationRules,
  fieldLabel: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldName?: string // Kept for API consistency and future file-specific validations
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

export const buildValidationSchema = (
  fields: FormField[]
): Yup.ObjectSchema<Record<string, unknown>> => {
  const schemaFields: Record<string, Yup.Schema> = {};

  fields.forEach((field) => {
    const rules = field.validationRules;

    if (!rules && !field.conditionalLogic) return;

    let fieldSchema: Yup.StringSchema | Yup.MixedSchema | Yup.BooleanSchema;

    // Create base schema based on field type
    switch (field.fieldType) {
      case 'textfield':
      case 'dropdown':
        // If no base rules, start with basic string schema
        fieldSchema = rules
          ? createTextFieldSchema(rules, field.fieldLabel, field.fieldName)
          : Yup.string();
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
        fieldSchema = rules
          ? createTextFieldSchema(rules, field.fieldLabel, field.fieldName)
          : Yup.string();

        // File part validation - use fieldFileName or fallback to fieldName_file
        // Match the pattern used in UpdateEntityProfileStep (line 114)
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        const fileRules = rules?.validationFile || {};

        // Check if we need file validation - either in base rules or conditional logic
        const hasBaseFileValidation =
          fileRules.imageRequired || fileRules.imageFormat || fileRules.size;

        const hasConditionalFileValidation = field.conditionalLogic?.some(
          (cond) => cond?.then?.validationRules?.validationFile
        );

        if (hasBaseFileValidation || hasConditionalFileValidation) {
          // Create base file schema (may be optional if only conditional validation exists)
          let fileSchema =
            hasBaseFileValidation && rules
              ? createFileSchema(rules, field.fieldLabel, fileFieldName)
              : Yup.mixed(); // Start with optional schema if no base validation

          // Apply conditional logic to file validation if present
          if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
            for (const cond of field.conditionalLogic) {
              const whenField = cond?.when?.field;
              const operator = cond?.when?.operator || 'equals';
              const rawValue = cond?.when?.value;
              const values = Array.isArray(rawValue) ? rawValue : [rawValue];
              const thenRules = cond?.then?.validationRules || {};

              if (whenField && thenRules.validationFile) {
                fileSchema = fileSchema.when(
                  whenField,
                  (depValue: unknown, schema: Yup.MixedSchema) => {
                    let match = false;
                    const depString = depValue != null ? String(depValue) : '';

                    switch (operator) {
                      case 'in':
                      case 'equals':
                        match = values.map(String).includes(depString);
                        break;
                      case 'not_in':
                      case 'not_equals':
                        match = !values.map(String).includes(depString);
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
                      // Merge base file rules with conditional file rules (handle null base rules)
                      const mergedRules: ValidationRules = {
                        ...(rules || {}),
                        ...thenRules,
                        validationFile: {
                          ...(rules?.validationFile || {}),
                          ...thenRules.validationFile,
                        },
                      };
                      return createFileSchema(
                        mergedRules,
                        field.fieldLabel,
                        field.fieldName
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
            const fileFieldName = `${field.fieldName}_file`;
            const fileSchema = createFileSchema(
              rules,
              field.fieldLabel,
              fileFieldName
            );
            schemaFields[fileFieldName] = fileSchema;
          }
        }
        break;
      }

      case 'file':
        fieldSchema = rules
          ? createFileSchema(rules, field.fieldLabel, field.fieldName)
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

        if (whenField) {
          fieldSchema = (fieldSchema as Yup.StringSchema).when(
            whenField,
            (depValue: unknown, schema: Yup.StringSchema) => {
              let match = false;
              const depString = depValue != null ? String(depValue) : '';

              switch (operator) {
                case 'in':
                case 'equals':
                case 'equal': // Added support for 'equal' operator
                  match = values.map(String).includes(depString);
                  break;
                case 'not_in':
                case 'not_equals':
                  match = !values.map(String).includes(depString);
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
                // Merge base and conditional rules (handle null base rules)
                const mergedRules: ValidationRules = {
                  ...(rules || {}),
                  ...thenRules,
                };
                return createTextFieldSchema(
                  mergedRules,
                  field.fieldLabel,
                  field.fieldName
                );
              }
              return schema;
            }
          );
        }
      }
    }

    // Add dynamic Proof of Identity validation based on selected ID type
    // Check if this field is a "Proof of Identity Number" field
    const isProofOfIdentityNumber =
      field.fieldName.toLowerCase().includes('proofofidentity') &&
      field.fieldName.toLowerCase().includes('number');

    if (
      isProofOfIdentityNumber &&
      (field.fieldType === 'textfield' ||
        field.fieldType === 'textfield_with_image')
    ) {
      // Find the corresponding "Proof of Identity" dropdown field
      // Typically named like "noProofOfIdentity" when number field is "noProofOfIdentityNumber"
      const proofTypeFieldName = field.fieldName.replace(/number$/i, '');

      // Add conditional validation based on the selected ID type
      fieldSchema = (fieldSchema as Yup.StringSchema).test(
        'proof-of-identity-validation',
        'Invalid ID number format',
        function (value: string | undefined | null) {
          // If field is empty, let required validation handle it
          if (!value || value.trim() === '') {
            return true;
          }

          // Get the selected proof of identity type from context
          const proofOfIdentityType = this.parent[proofTypeFieldName];

          if (!proofOfIdentityType) {
            // If no ID type selected yet, skip validation
            return true;
          }

          // Normalize the proof type to uppercase for matching
          const normalizedProofType = String(proofOfIdentityType)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '_');

          // Check if we have a validator for this proof type
          const validatorConfig =
            PROOF_OF_IDENTITY_VALIDATORS[normalizedProofType];

          if (!validatorConfig) {
            // If no specific validator found, allow the value
            // (might be a custom ID type)
            return true;
          }

          // Run the specific validator
          const isValid = validatorConfig.validator(value.trim(), 'IN');

          if (!isValid) {
            // Use the specific error message for this ID type
            return this.createError({
              message: validatorConfig.message,
            });
          }

          return true;
        }
      );
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
      const fileFieldName =
        field.fieldType === 'textfield_with_image'
          ? field.fieldFileName || `${field.fieldName}_file`
          : field.fieldName;

      if (field.fieldType === 'textfield_with_image') {
        fileValue = formValues[fileFieldName];
      }

      // For file upload fields, check if file is attached OR uploaded
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

          // Skip file validation errors if file already exists OR newly uploaded
          if (
            field &&
            (field.fieldType === 'file' ||
              field.fieldType === 'textfield_with_image')
          ) {
            const fileFieldName =
              field.fieldType === 'textfield_with_image'
                ? field.fieldFileName || `${field.fieldName}_file`
                : field.fieldName;

            // Check if file already exists in backend
            const hasExistingFile =
              existingDocuments && existingDocuments[fileFieldName];

            // Check if file is newly uploaded (File object in formValues)
            const hasNewFile = formValues[fileFieldName] instanceof File;

            // If this error is for a file field and (file exists OR newly uploaded), skip it
            if (err.path === fileFieldName && (hasExistingFile || hasNewFile)) {
              console.log(
                `✅ Skipping validation error for ${err.path} - ${
                  hasExistingFile ? 'file exists' : 'file uploaded'
                }`
              );
              return;
            }
          }

          errors[err.path] = err.message;
        }
      });

      // If all errors were filtered out, validation actually passed
      const isValid = Object.keys(errors).length === 0;
      return { isValid, errors };
    }
    return { isValid: false, errors: {} };
  }
};

// Export default validation configuration
export const DEFAULT_VALIDATION_CONFIG = {
  FILE_SIZE_LIMIT_MB: 1,
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
  ALLOWED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx'],
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 255,
};
