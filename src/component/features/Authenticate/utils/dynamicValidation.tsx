import * as Yup from 'yup';
import {
  FormField,
  ValidationRules,
  DynamicFormValues,
} from '../types/formTypes';

export const createDynamicValidationSchema = (fields: FormField[]) => {
  const schemaFields: Record<string, Yup.StringSchema> = {};

  // Find the actual CKYC field name from the API
  const ckycField = fields.find(
    (field) =>
      field.fieldName.toLowerCase().includes('ckyc') ||
      field.fieldName.toLowerCase().includes('kyc')
  );
  const ckycFieldName = ckycField?.fieldName || 'ckycNumber';

  console.log('Dynamic Validation - CKYC Field:', {
    ckycField,
    ckycFieldName,
    allFields: fields.map((f) => f.fieldName),
  });

  // Add essential static validations for critical fields
  schemaFields.citizenship = Yup.string().required('Citizenship is required');

  // Add CKYC validation for Indian citizenship using the actual field name
  schemaFields[ckycFieldName] = Yup.string().when('citizenship', {
    is: 'Indian',
    then: (s) =>
      s
        .required('CKYC Number is required')
        .matches(/^\d{14}$/, 'CKYC Number must be exactly 14 digits'),
    otherwise: (s) => s.notRequired(),
  });

  fields.forEach((field) => {
    const { fieldName, validationRules, conditionalLogic } = field;

    // Skip if we already have validation for this field (e.g., essential static fields)
    if (schemaFields[fieldName]) {
      return;
    }

    // Start with base validation
    let fieldSchema: Yup.StringSchema;
    const isMobileField = /(mobile|phone)/i.test(fieldName);
    const isEmailField = /email/i.test(fieldName);

    switch (field.fieldType) {
      case 'textfield':
        fieldSchema = Yup.string();
        // Add mobile validation for mobile fields
        if (isMobileField) {
          fieldSchema = addMobileValidation(fieldSchema);
        }
        // Add email validation for email fields
        if (isEmailField) {
          fieldSchema = addEmailValidation(fieldSchema);
        }
        break;
      case 'dropdown':
        fieldSchema = Yup.string();
        break;
      default:
        fieldSchema = Yup.string();
    }

    // Apply conditional logic if present
    if (conditionalLogic && conditionalLogic.length > 0) {
      conditionalLogic.forEach((logic) => {
        const { when, then, else: elseRules } = logic;

        fieldSchema = fieldSchema.when(when.field, {
          is: (value: unknown) => {
            switch (when.operator) {
              case 'equals':
                return value === when.value;
              case 'in':
                return (
                  Array.isArray(when.value) &&
                  when.value.includes(value as string)
                );
              default:
                return true;
            }
          },
          then: (schema: Yup.StringSchema) =>
            applyValidationRules(
              schema,
              then?.validationRules || validationRules,
              isMobileField,
              isEmailField
            ),
          otherwise: (schema: Yup.StringSchema) =>
            applyValidationRules(
              schema,
              elseRules?.validationRules || validationRules,
              isMobileField,
              isEmailField
            ),
        });
      });
    } else {
      // Apply base validation rules
      fieldSchema = applyValidationRules(
        fieldSchema,
        validationRules,
        isMobileField,
        isEmailField
      );
    }

    schemaFields[fieldName] = fieldSchema;
  });

  return Yup.object().shape(schemaFields);
};

const applyValidationRules = (
  schema: Yup.StringSchema,
  rules?: ValidationRules,
  isMobileField: boolean = false,
  isEmailField: boolean = false
) => {
  if (!rules) return schema;

  let validatedSchema = schema;

  // Required validation
  if (rules.required) {
    validatedSchema = validatedSchema.required(
      rules.requiredMessage || 'This field is required'
    );
  }

  // Skip min/max length validation for mobile and email fields (they have custom validation)
  if (!isMobileField && !isEmailField) {
    // Min length validation
    if (rules.minLength) {
      const minLength = parseInt(rules.minLength);
      validatedSchema = validatedSchema.min(
        minLength,
        rules.minLengthMessage || `Minimum ${minLength} characters required`
      );
    }

    // Max length validation
    if (rules.maxLength) {
      const maxLength = parseInt(rules.maxLength);
      validatedSchema = validatedSchema.max(
        maxLength,
        rules.maxLengthMessage || `Maximum ${maxLength} characters allowed`
      );
    }
  }

  // Regex validation (skip for mobile/email as they have custom validation)
  if (rules.regx && !isMobileField && !isEmailField) {
    validatedSchema = validatedSchema.matches(
      new RegExp(rules.regx),
      rules.regxMessage || 'Invalid format'
    );
  }

  // Number validation
  if (rules.numberValudation) {
    validatedSchema = validatedSchema.matches(
      /^\d+$/,
      'Only numbers are allowed'
    );
  }

  return validatedSchema;
};

// Helper function to add mobile validation based on country code
const addMobileValidation = (schema: Yup.StringSchema) => {
  return schema.test('mobile-validation', function (value: string | undefined) {
    if (!value || value.trim() === '') {
      return true;
    }
    const digitsOnly = value.replace(/\D/g, '');

    const countryCode = String(
      (this.parent as Record<string, unknown>).countryCode || ''
    ).toLowerCase();
    const isIndianCountryCode = ['+91', '91', 'india'].some((v) =>
      countryCode.includes(v)
    );

    if (isIndianCountryCode) {
      if (digitsOnly.length !== 10) {
        return this.createError({
          message:
            'Mobile number must be exactly 10 digits for Indian country code',
        });
      }
    } else {
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return this.createError({
          message: 'Mobile number must be between 8-15 digits',
        });
      }
    }
    return true;
  });
};

// Helper function to add email validation
const addEmailValidation = (schema: Yup.StringSchema) => {
  return schema.test(
    'email-validation',
    'Please enter a valid email address',
    function (value: string | undefined) {
      if (!value || value.trim() === '') {
        return true;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const hasAtSymbol = (value.match(/@/g) || []).length === 1;
      const isValid = emailRegex.test(value) && hasAtSymbol;

      //  log for validation failures
      if (!isValid) {
        console.log(' Email validation failed in dynamicValidation:', {
          value,
          passedRegex: emailRegex.test(value),
          hasAtSymbol,
        });
      }

      return isValid;
    }
  );
};

export const createInitialValues = (fields: FormField[]): DynamicFormValues => {
  const initialValues: DynamicFormValues = {};

  // Find the actual CKYC field name from the API
  const ckycField = fields.find(
    (field) =>
      field.fieldName.toLowerCase().includes('ckyc') ||
      field.fieldName.toLowerCase().includes('kyc')
  );
  const ckycFieldName = ckycField?.fieldName || 'ckycNumber';

  // Add essential static fields
  initialValues.citizenship = '';
  initialValues[ckycFieldName] = '';

  fields.forEach((field) => {
    initialValues[field.fieldName] = '';
  });

  return initialValues;
};

export const getFieldsByOrder = (fields: FormField[]): FormField[] => {
  return fields.sort((a, b) => {
    // First sort by fieldOrderGroup, then by fieldOrder
    if (a.fieldOrderGroup !== b.fieldOrderGroup) {
      return a.fieldOrderGroup - b.fieldOrderGroup;
    }
    return a.fieldOrder - b.fieldOrder;
  });
};
