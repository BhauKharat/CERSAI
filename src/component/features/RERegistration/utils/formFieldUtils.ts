/**
 * Utility functions for form field operations
 */

/**
 * Dynamically finds a field value from form values based on search terms
 * @param formValues - The form values object to search in
 * @param searchTerms - Array of terms to search for in field names (case-insensitive)
 * @returns The first matching field value as string, or empty string if not found
 *
 * @example
 * const formValues = { hoiEmail: 'test@example.com', hoiMobile: '1234567890' };
 * const email = findFieldValue(formValues, ['email', 'mail']); // Returns 'test@example.com'
 * const mobile = findFieldValue(formValues, ['mobile', 'phone']); // Returns '1234567890'
 */
export const findFieldValue = (
  formValues: Record<string, unknown>,
  searchTerms: string[]
): string => {
  for (const key of Object.keys(formValues)) {
    const lowerKey = key.toLowerCase();
    if (searchTerms.some((term) => lowerKey.includes(term.toLowerCase()))) {
      return formValues[key] ? String(formValues[key]) : '';
    }
  }
  return '';
};

/**
 * Extracts common OTP-related fields (mobile, email, countryCode) from form values
 * @param formValues - The form values object to extract from
 * @returns Object containing mobile, email, and countryCode
 *
 * @example
 * const formValues = { hoiEmail: 'test@example.com', hoiMobile: '1234567890', hoiCountryCode: '+91' };
 * const otpData = extractOTPFields(formValues);
 * // Returns: { mobile: '1234567890', email: 'test@example.com', countryCode: '+91' }
 */
export const extractOTPFields = (
  formValues: Record<string, unknown>
): {
  mobile: string;
  email: string;
  countryCode: string;
} => {
  return {
    mobile: findFieldValue(formValues, ['mobile', 'phone']),
    email: findFieldValue(formValues, ['email', 'mail']),
    countryCode:
      findFieldValue(formValues, ['countrycode', 'country']) || '+91',
  };
};
