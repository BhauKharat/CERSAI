/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormikProps } from 'formik';
import { processApiError, isValidationError } from './errorHandler';
import { FormField } from '../../component/features/Authenticate/types/formTypes';

/**
 * Dynamic field mapping utility for any form
 * Maps API field names to form field names intelligently
 */
export const createDynamicFieldMapper = (formFields: FormField[]) => {
  return (apiFieldName: string): string => {
    const normalizedApiField = (apiFieldName || '').toLowerCase().trim();

    // 1. Direct exact match (case-insensitive)
    const exactMatch = formFields.find(
      (field) => field.fieldName.toLowerCase() === normalizedApiField
    );
    if (exactMatch) {
      return exactMatch.fieldName;
    }

    // 2. Direct case-sensitive match
    const directMatch = formFields.find(
      (field) => field.fieldName === apiFieldName
    );
    if (directMatch) {
      return directMatch.fieldName;
    }

    // 3. Fuzzy matching - find field that contains the API field name
    const containsMatch = formFields.find((field) =>
      field.fieldName.toLowerCase().includes(normalizedApiField)
    );
    if (containsMatch) {
      return containsMatch.fieldName;
    }

    // 4. Reverse fuzzy matching - find field where API field contains form field name
    const reverseMatch = formFields.find((field) =>
      normalizedApiField.includes(field.fieldName.toLowerCase())
    );
    if (reverseMatch) {
      return reverseMatch.fieldName;
    }

    // 5. Smart pattern matching using common field name variations
    const fieldPatterns = [
      // Remove common separators and variations
      normalizedApiField.replace(/[-_\s]/g, ''),
      normalizedApiField.replace(/[-_\s]/g, '').replace(/number|no|id$/i, ''),
      normalizedApiField
        .replace(/[-_\s]/g, '')
        .replace(/^user|customer|client/i, ''),
    ];

    for (const pattern of fieldPatterns) {
      const patternMatch = formFields.find((field) => {
        const normalizedFormField = field.fieldName
          .toLowerCase()
          .replace(/[-_\s]/g, '');
        return (
          normalizedFormField.includes(pattern) ||
          pattern.includes(normalizedFormField)
        );
      });
      if (patternMatch) {
        return patternMatch.fieldName;
      }
    }

    // 6. Semantic matching for common field types
    const semanticMappings = {
      // Mobile/Phone variations
      mobile: ['phone', 'mobile', 'cell', 'cellular', 'contact'],
      phone: ['mobile', 'phone', 'cell', 'cellular', 'contact'],

      // Email variations
      email: ['email', 'mail', 'emailaddress', 'emailid'],

      // Name variations
      firstname: ['fname', 'givenname', 'forename'],
      lastname: ['lname', 'surname', 'familyname'],
      middlename: ['mname', 'middleinitial'],

      // Address variations
      address: ['addr', 'location', 'residence'],
      city: ['town', 'municipality'],
      state: ['province', 'region'],
      country: ['nation', 'nationality'],

      // ID variations
      id: ['identifier', 'userid', 'customerid'],

      // Date variations
      dateofbirth: ['dob', 'birthdate', 'birthday'],

      // Other common variations
      gender: ['sex'],
      occupation: ['job', 'profession', 'work'],
    };

    // Check semantic mappings
    for (const [formFieldType, variations] of Object.entries(
      semanticMappings
    )) {
      if (
        variations.some((variation) => normalizedApiField.includes(variation))
      ) {
        const semanticMatch = formFields.find((field) =>
          field.fieldName.toLowerCase().includes(formFieldType)
        );
        if (semanticMatch) {
          return semanticMatch.fieldName;
        }
      }
    }

    // 7. Check if API field matches any form field when common prefixes/suffixes are removed
    const cleanApiField = normalizedApiField
      .replace(/^(user|customer|client|person|individual)[-_]?/i, '')
      .replace(/[-_]?(number|no|id|code|value|data)$/i, '');

    const cleanMatch = formFields.find((field) => {
      const cleanFormField = field.fieldName
        .toLowerCase()
        .replace(/^(user|customer|client|person|individual)[-_]?/i, '')
        .replace(/[-_]?(number|no|id|code|value|data)$/i, '');
      return cleanFormField === cleanApiField;
    });
    if (cleanMatch) {
      return cleanMatch.fieldName;
    }

    // 8. Fallback: Return original field name (might exist in formik values)
    return apiFieldName;
  };
};

/**
 * Universal form error handler that can be used with any form
 * Handles ERROR_FORM_VALIDATION errors by setting field-specific errors
 * Handles other error types by returning general error messages
 */
export const handleFormApiError = <T = any>(
  error: unknown,
  formik: FormikProps<T>,
  formFields: FormField[] = [],
  staticFieldNames: string[] = []
): string => {
  console.log('🚀 Form Error Handler - Processing error:', error);

  // Process the error using standardized error handler
  const processedError = processApiError(error);

  // Add a small delay to ensure processing is complete
  setTimeout(() => {
    console.log(
      '🚀 Form Error Handler - Processed Error (after delay):',
      processedError
    );
  }, 0);

  console.log(
    '🚀 Form Error Handler - Processed Error (immediate):',
    processedError
  );

  // Handle ERROR_FORM_VALIDATION with field-specific messages
  console.log(
    '🚀 Form Handler - isValidationError:',
    isValidationError(processedError)
  );
  console.log(
    '🚀 Form Handler - processedError.fieldErrors:',
    processedError.fieldErrors
  );
  console.log('🚀 Form Handler - processedError.type:', processedError.type);

  if (isValidationError(processedError) && processedError.fieldErrors) {
    const mapField = createDynamicFieldMapper(formFields);

    // Get all available form field names for validation
    const availableFields = new Set([
      ...formFields.map((field) => field.fieldName),
      ...staticFieldNames,
    ]);

    // Set field errors and collect unmapped ones
    const unmappedMessages: string[] = [];
    let fieldErrorsSet = 0;

    Object.entries(processedError.fieldErrors).forEach(([field, message]) => {
      const mappedField = mapField(field);

      console.log(`🚀 Error Mapping: ${field} -> ${mappedField}`);

      // Check if the mapped field exists in our form or formik values
      if (
        availableFields.has(mappedField) ||
        Object.prototype.hasOwnProperty.call(formik.values, mappedField)
      ) {
        formik.setFieldError(mappedField, message);
        fieldErrorsSet++;
        console.log(`✅ Set error for field: ${mappedField} - ${message}`);
      } else {
        // Collect unmapped field errors for general display
        unmappedMessages.push(`${field}: ${message}`);
        console.log(`❌ Could not map field: ${field} -> ${mappedField}`);
      }
    });

    // Return appropriate error messages
    if (fieldErrorsSet > 0) {
      // If we successfully set field errors, show a summary message
      if (unmappedMessages.length > 0) {
        return `Please correct the errors above. Additional issues: ${unmappedMessages.join(
          ', '
        )}`;
      } else {
        return 'Please correct the validation errors highlighted in the form.';
      }
    } else if (unmappedMessages.length > 0) {
      // If no field errors were set but we have unmapped errors
      return unmappedMessages.join(', ');
    } else if (processedError.message) {
      // Fallback to general error message
      return processedError.message;
    } else {
      return 'Please correct the validation errors above.';
    }
  } else {
    // Handle non-validation errors (ERROR_INVALID_DATA, etc.) - show general message only
    return processedError.message;
  }
};

/**
 * Simplified error handler for forms without dynamic fields
 * Uses only static field names for mapping
 */
export const handleStaticFormApiError = <T = any>(
  error: unknown,
  formik: FormikProps<T>,
  staticFieldNames: string[]
): string => {
  return handleFormApiError(error, formik, [], staticFieldNames);
};
