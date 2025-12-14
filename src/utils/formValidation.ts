import * as Yup from 'yup';

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
  noFuture?: boolean;
  noFutureMessage?: string;
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

// Text field validation
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

  // For optional fields, only validate length/format if there's a value
  if (rules.minLength) {
    const minLength =
      typeof rules.minLength === 'string'
        ? parseInt(rules.minLength, 10)
        : rules.minLength;
    const message =
      rules.minLengthMessage || VALIDATION_MESSAGES.MIN_LENGTH(minLength);

    // Only validate minLength if field is required OR has a value
    if (isRequired) {
      schema = schema.min(minLength, message);
    } else {
      // For optional fields, only validate if not empty
      schema = schema.test(
        'min-length-optional',
        message,
        function (value: string | undefined) {
          if (!value || value.trim() === '') return true; // Allow empty for optional fields
          return value.length >= minLength;
        }
      );
    }
  }

  if (rules.maxLength) {
    const maxLength =
      typeof rules.maxLength === 'string'
        ? parseInt(rules.maxLength, 10)
        : rules.maxLength;
    const message =
      rules.maxLengthMessage || VALIDATION_MESSAGES.MAX_LENGTH(maxLength);

    // Only validate maxLength if field is required OR has a value
    if (isRequired) {
      schema = schema.max(maxLength, message);
    } else {
      // For optional fields, only validate if not empty
      schema = schema.test(
        'max-length-optional',
        message,
        function (value: string | undefined) {
          if (!value || value.trim() === '') return true; // Allow empty for optional fields
          return value.length <= maxLength;
        }
      );
    }
  }

  // Skip regx validation for email and landline fields - custom validations will handle them
  const isEmailField = fieldName && /email/i.test(fieldName);
  const isLandlineField = fieldName && /landline/i.test(fieldName);
  if (rules.regx && !isEmailField && !isLandlineField) {
    schema = schema.test(
      'regex-validation',
      rules.regxMessage || VALIDATION_MESSAGES.INVALID_FORMAT,
      function (value: string | undefined) {
        if (!value || value.trim() === '') return true;
        return new RegExp(rules.regx!).test(value);
      }
    );
  }

  // Add landline validation - allow + at start followed by digits
  if (fieldName && /landline/i.test(fieldName)) {
    schema = schema.test(
      'landline-validation',
      rules.regxMessage || 'Please enter a valid landline number',
      function (value: string | undefined) {
        if (!value || value.trim() === '') {
          return true;
        }

        // Allow optional + at start, followed by digits only
        const landlineRegex = /^\+?\d+$/;
        return landlineRegex.test(value);
      }
    );
  }

  // Add mobile/phone number validation for fields with mobile or phone in the name
  if (fieldName && /(mobile|phone)/i.test(fieldName)) {
    schema = schema.test(
      'mobile-validation',
      'Please enter a valid mobile number (minimum 10 digits)',
      function (value: string | undefined) {
        console.log(`🔍 Mobile validation running for ${fieldName}:`, {
          value,
          isEmpty: !value || value.trim() === '',
          length: value?.length,
        });
        if (!value || value.trim() === '') {
          return true;
        }
        // Check if the value has at least 10 digits
        const digitsOnly = value.replace(/\D/g, '');
        const isValid = digitsOnly.length >= value?.length;

        return isValid;
      }
    );
  }

  // Add email validation for fields with email in the name
  if (fieldName && /email/i.test(fieldName)) {
    schema = schema.test(
      'email-validation',
      'Please enter a valid email address',
      function (value: string | undefined) {
        if (!value || value.trim() === '') {
          return true;
        }

        // Email regex: alphanumeric and all special chars allowed
        // Allow any character except whitespace before and after @
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const hasAtSymbol = (value.match(/@/g) || []).length === 1;
        const isValid = emailRegex.test(value) && hasAtSymbol;

        // Debug logging for validation failures
        if (!isValid) {
          console.log('❌ Email validation failed:', {
            value,
            passedRegex: emailRegex.test(value),
            hasAtSymbol,
            fieldName: this.path,
          });
        }

        return isValid;
      }
    );
  }

  return schema;
};

// File validation
export const createFileSchema = (
  rules: ValidationRules,
  fieldLabel: string
): Yup.MixedSchema => {
  let schema = Yup.mixed();

  const fileRules = rules.validationFile || rules;
  // Only require file if imageRequired is explicitly true
  const isFileRequired =
    fileRules.imageRequired === true ||
    String(fileRules.imageRequired) === 'true';

  if (isFileRequired) {
    const message =
      fileRules.imageRequiredMessage || `${fieldLabel} is required`;
    schema = schema.required(message);
  }

  if (fileRules.imageFormat && Array.isArray(fileRules.imageFormat)) {
    schema = schema.test(
      'fileFormat',
      VALIDATION_MESSAGES.INVALID_FILE_FORMAT,
      (value: unknown): boolean => {
        if (!value) return !fileRules.imageRequired;
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
      if (!value) return !fileRules.imageRequired;
      const file = value as File;
      return validateFileSize(file, maxSizeInMB);
    });
  }

  return schema;
};

// Date field validation
export const createDateFieldSchema = (
  rules: ValidationRules,
  fieldLabel: string
): Yup.DateSchema<Date | undefined> => {
  let schema = Yup.date().typeError('Invalid date format'); // allows undefined, fixes type issues

  // Required validation
  if (rules.required === true || String(rules.required) === 'true') {
    const message =
      rules.requiredMessage ||
      (typeof rules.required === 'string'
        ? rules.required
        : `${fieldLabel} is required`);
    schema = schema.required(message);
  }

  // No future date validation
  if (rules.noFuture) {
    const message =
      rules.noFutureMessage || `${fieldLabel} cannot be in the future`;
    schema = schema.max(new Date(), message);
  }

  return schema;
};

// Build main schema
export const buildValidationSchema = (
  fields: FormField[]
): Yup.ObjectSchema<Record<string, unknown>> => {
  const schemaFields: Record<string, Yup.Schema> = {};

  fields.forEach((field) => {
    const rules = field.validationRules;
    if (!rules) return;

    let fieldSchema:
      | Yup.StringSchema
      | Yup.MixedSchema
      | Yup.BooleanSchema
      | Yup.DateSchema;

    switch (field.fieldType) {
      case 'textfield':
      case 'dropdown':
        fieldSchema = createTextFieldSchema(
          rules,
          field.fieldLabel,
          field.fieldName
        );
        break;

      case 'date':
        fieldSchema = createDateFieldSchema(rules, field.fieldLabel);
        break;

      case 'checkbox':
        fieldSchema = Yup.boolean();
        if (rules.required === true || String(rules.required) === 'true') {
          const message =
            rules.requiredMessage || `${field.fieldLabel} is required`;
          fieldSchema = (fieldSchema as Yup.BooleanSchema).oneOf(
            [true],
            message
          );
        }
        break;

      case 'file':
        fieldSchema = createFileSchema(rules, field.fieldLabel);
        break;

      case 'textfield_with_image': {
        // Create schema for the text field
        fieldSchema = createTextFieldSchema(
          rules,
          field.fieldLabel,
          field.fieldName
        );

        // Create schema for the file field
        const fileRules = rules;
        const fileFieldName = field.fieldFileName || `${field.fieldName}File`;

        // Only create file schema if imageRequired is true or other file validations exist
        // This ensures optional fields don't show validation errors
        // Skip file schema creation if imageRequired is explicitly false
        const isImageRequired =
          fileRules.imageRequired === true ||
          String(fileRules.imageRequired) === 'true';
        const hasImageRequiredFalse =
          fileRules.imageRequired === false ||
          String(fileRules.imageRequired) === 'false';

        if (
          !hasImageRequiredFalse &&
          (isImageRequired || fileRules.imageFormat || fileRules.size)
        ) {
          const fileSchema = createFileSchema(
            fileRules,
            `${field.fieldLabel} Document`
          );
          schemaFields[fileFieldName] = fileSchema;
        }
        break;
      }

      case 'textfield_with_verify': {
        fieldSchema = createTextFieldSchema(
          rules,
          field.fieldLabel,
          field.fieldName
        );
        const verifyFileRules = rules.validationFile || rules;
        const isVerifyImageRequired =
          verifyFileRules.imageRequired === true ||
          String(verifyFileRules.imageRequired) === 'true';
        const hasVerifyImageRequiredFalse =
          verifyFileRules.imageRequired === false ||
          String(verifyFileRules.imageRequired) === 'false';

        if (
          !hasVerifyImageRequiredFalse &&
          (isVerifyImageRequired ||
            verifyFileRules.imageFormat ||
            verifyFileRules.size)
        ) {
          const fileSchema = createFileSchema(rules, field.fieldLabel);
          schemaFields[`${field.fieldName}File`] = fileSchema;
        }
        break;
      }

      default:
        fieldSchema = Yup.string();
    }

    // Conditional logic
    if (
      (field.fieldType === 'textfield' ||
        field.fieldType === 'textfield_with_verify') &&
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
              if (operator === 'equals') {
                const depString = depValue != null ? String(depValue) : '';
                match = values.map(String).includes(depString);
              }

              if (match) {
                const mergedRules: ValidationRules = { ...rules, ...thenRules };
                return createTextFieldSchema(mergedRules, field.fieldLabel);
              }
              return schema;
            }
          );
        }
      }
    }

    schemaFields[field.fieldName] = fieldSchema;
  });

  return Yup.object().shape(schemaFields);
};

// Field validation helper
export const validateField = (
  field: FormField,
  value: unknown,
  formValues: Record<string, unknown>
): boolean => {
  const rules = field.validationRules;
  if (!rules) return true;

  const isRequired =
    rules.required === true || String(rules.required) === 'true';

  if (!isRequired) return true;

  switch (field.fieldType) {
    case 'textfield':
    case 'dropdown':
      return Boolean(value && String(value).trim() !== '');

    case 'date':
      return Boolean(value);

    case 'file':
    case 'textfield_with_image': {
      let fileValue = value;
      if (field.fieldType === 'textfield_with_image') {
        fileValue = formValues[`${field.fieldName}_file`];
      }
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

// Async validate all
export const validateAllFields = async (
  fields: FormField[],
  formValues: Record<string, unknown>,
  validationSchema: Yup.ObjectSchema<Record<string, unknown>> | null
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  if (!validationSchema) return { isValid: true, errors: {} };

  try {
    await validationSchema.validate(formValues, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) errors[err.path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
};

// Default config
export const DEFAULT_VALIDATION_CONFIG = {
  FILE_SIZE_LIMIT_MB: 1,
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
  ALLOWED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx'],
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 255,
};

// export const DEFAULT_VALIDATION_CONFIG = {
//   FILE
