/* eslint-disable @typescript-eslint/no-explicit-any */

import { CMS_URL } from 'Constant';

/**
 * Utility functions for handling dynamic geographical data in registration forms
 */

/**
 * Creates dynamic geographical value mappings for all possible field combinations
 * @param stepData - Step data from API response
 * @param formValues - Current form values
 * @returns Record with all possible geographical field mappings
 */
export const createGeographicalValueMappings = (
  stepData: any,
  formValues: Record<string, unknown>
): Record<string, unknown> => {
  const geographicalFields = ['country', 'state', 'district', 'pincode'];
  const prefixes = [
    'correspondence',
    'register',
    'current',
    'permanent',
    'iau',
  ];
  const mappings: Record<string, unknown> = {};

  // Add all step data and form values first (prioritize formValues)
  const stepDataValues = stepData?.data || {};
  Object.assign(mappings, stepDataValues, formValues);

  // Create dynamic mappings for all geographical field combinations
  geographicalFields.forEach((geoField) => {
    prefixes.forEach((prefix) => {
      const prefixedField = `${prefix}${geoField.charAt(0).toUpperCase() + geoField.slice(1)}`;

      // Create fallback chain for each prefixed geographical field (prioritize formValues)
      mappings[prefixedField] =
        formValues[prefixedField] ||
        formValues[geoField] ||
        stepDataValues[prefixedField] ||
        stepDataValues[geoField] ||
        // Additional fallbacks for common variations
        formValues[`${prefix}_${geoField}`] ||
        stepDataValues[`${prefix}_${geoField}`] ||
        formValues[`${prefix}${geoField}`] ||
        stepDataValues[`${prefix}${geoField}`];

      // Also create direct field mappings
      if (!mappings[geoField]) {
        mappings[geoField] =
          formValues[geoField] ||
          formValues[prefixedField] ||
          stepDataValues[geoField] ||
          stepDataValues[prefixedField];
      }
    });
  });

  // Add IAU-specific mappings with numbered suffixes (iau1, iau2)
  [1, 2].forEach((num) => {
    geographicalFields.forEach((geoField) => {
      const iauField = `iau${geoField.charAt(0).toUpperCase() + geoField.slice(1)}${num}`;

      // If IAU field already has a value, use it
      if (formValues[iauField]) {
        mappings[iauField] = formValues[iauField];
      }
    });
  });

  console.log('🗺️ Geographical value mappings created:', mappings);

  return mappings;
};

/**
 * Replaces URL parameters with actual values from the provided mappings
 * @param url - URL with parameters in {parameterName} format
 * @param allValues - Record containing all possible values
 * @returns Processed URL with parameters replaced
 */
export const replaceUrlParameters = (
  url: string,
  allValues: Record<string, unknown>
): string => {
  let processedUrl = url;

  // Replace URL parameters with actual values
  // Look for patterns like {parameterName} in the URL
  const parameterMatches = url.match(/\{([^}]+)\}/g);

  if (parameterMatches) {
    parameterMatches.forEach((match) => {
      const paramName = match.replace(/[{}]/g, ''); // Remove curly braces

      console.log(`🔍 Looking up parameter: ${paramName}`);

      // Try to find the value from various sources with enhanced lookup
      const paramValue =
        allValues[paramName] ||
        allValues[paramName.toLowerCase()] ||
        allValues[paramName.toUpperCase()] ||
        // Try with common prefixes
        allValues[
          `correspondence${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`
        ] ||
        allValues[
          `register${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`
        ] ||
        allValues[
          `current${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`
        ] ||
        allValues[
          `permanent${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`
        ] ||
        // Try with underscore variations
        allValues[`correspondence_${paramName}`] ||
        allValues[`register_${paramName}`] ||
        allValues[`current_${paramName}`] ||
        allValues[`permanent_${paramName}`];

      console.log(`🔍 Found value for ${paramName}:`, paramValue);

      if (paramValue) {
        processedUrl = processedUrl.replace(match, String(paramValue));
        console.log(
          `🔄 Replaced URL parameter ${match} with value: ${paramValue}`
        );
      } else {
        console.warn(`⚠️ No value found for URL parameter: ${paramName}`);
        console.log(
          'Available values:',
          Object.keys(allValues).filter((key) =>
            key.toLowerCase().includes(paramName.toLowerCase())
          )
        );
      }
    });
  }

  console.log(`🌐 Final processed URL: ${processedUrl}`);
  return processedUrl;
};

/**
 * Checks if a field name represents a geographical field
 * @param fieldName - Name of the field to check
 * @returns True if field is geographical, false otherwise
 */
export const isGeographicalField = (fieldName: string): boolean => {
  const geoKeywords = [
    'country',
    'state',
    'district',
    'pincode',
    'city',
    'region',
    'province',
  ];
  const lowerFieldName = fieldName.toLowerCase();
  return geoKeywords.some((keyword) => lowerFieldName.includes(keyword));
};

/**
 * Processes geographical fields and fetches dropdown options
 * @param flattenedFields - Array of form fields
 * @param stepData - Step data from API
 * @param formValues - Current form values
 * @param dispatch - Redux dispatch function
 * @param fetchDependentDropdownOptions - Action creator for fetching dropdown options
 */
export const processGeographicalFields = (
  flattenedFields: any[],
  stepData: any,
  formValues: Record<string, unknown>,
  dispatch: any,
  fetchDependentDropdownOptions: any
): void => {
  if (!flattenedFields || flattenedFields.length === 0) {
    return;
  }

  // Create dynamic geographical value mappings
  const allValues = createGeographicalValueMappings(stepData, formValues);

  // Find geography fields and fetch their dropdown options using field URLs
  flattenedFields.forEach((field) => {
    // Check if this is a geography field with a dropdown URL
    if (
      field.fieldAttributes?.url &&
      isGeographicalField(field.fieldName || '')
    ) {
      // Replace URL parameters with actual values
      const processedUrl = replaceUrlParameters(
        field.fieldAttributes.url,
        allValues
      );

      console.log(
        `📋 Field ${field.fieldName}: Original URL: ${field.fieldAttributes.url}`
      );
      console.log(
        `📋 Field ${field.fieldName}: Processed URL: ${processedUrl}`
      );
      console.log(
        `📋 Field ${field.fieldName}: Has unresolved params: ${processedUrl.includes('{')}`
      );

      // Only fetch if URL has been properly processed (no remaining parameters)
      if (!processedUrl.includes('{')) {
        console.log(`✅ Making API call for ${field.fieldName}`);
        // Add CMS_URL prefix only if URL doesn't already start with http
        const fullUrl = processedUrl.startsWith('http')
          ? processedUrl
          : `${CMS_URL}${processedUrl}`;

        // Fetch dropdown options using the processed URL
        dispatch(
          fetchDependentDropdownOptions({
            url: fullUrl,
            fieldId: field.id,
            fieldName: field.fieldName,
            responseMapping: field.fieldAttributes.responseMapping || {
              label: 'label',
              value: 'value',
            },
          })
        );
      } else {
        console.warn(
          `⚠️ Skipping API call for ${field.fieldName} - URL still contains unresolved parameters: ${processedUrl}`
        );
      }
    }
  });
};
