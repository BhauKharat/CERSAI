/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utility functions for form data processing
 */

/**
 * Filters out empty values from form data object
 * @param formData - The form data object to filter
 * @returns Filtered object with empty values removed
 */
export const filterEmptyValues = (
  formData: Record<string, any>
): Record<string, any> => {
  return Object.keys(formData).reduce(
    (acc, key) => {
      const value = formData[key];
      // Keep values that are not empty strings, null, or undefined
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );
};

/**
 * Filters out empty values with additional options
 * @param formData - The form data object to filter
 * @param options - Additional filtering options
 * @returns Filtered object with empty values removed
 */
export const filterEmptyValuesAdvanced = (
  formData: Record<string, any>,
  options: {
    keepZero?: boolean;
    keepFalse?: boolean;
    keepEmptyArrays?: boolean;
    keepEmptyObjects?: boolean;
  } = {}
): Record<string, any> => {
  const {
    keepZero = true,
    keepFalse = true,
    keepEmptyArrays = true,
    keepEmptyObjects = true,
  } = options;

  return Object.keys(formData).reduce(
    (acc, key) => {
      const value = formData[key];

      // Always exclude null and undefined
      if (value === null || value === undefined) {
        return acc;
      }

      // Handle empty strings
      if (value === '') {
        return acc;
      }

      // Handle zero values
      if (value === 0 && !keepZero) {
        return acc;
      }

      // Handle false values
      if (value === false && !keepFalse) {
        return acc;
      }

      // Handle empty arrays
      if (Array.isArray(value) && value.length === 0 && !keepEmptyArrays) {
        return acc;
      }

      // Handle empty objects
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0 &&
        !keepEmptyObjects
      ) {
        return acc;
      }

      acc[key] = value;
      return acc;
    },
    {} as Record<string, any>
  );
};
