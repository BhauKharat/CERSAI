// src/utils/validationUtils.ts

// Regex patterns
export const REGEX = {
  FIRST_NAME: /^[A-Za-z'.\s]+$/, // Alphabets, space, apostrophe, dot
  MIDDLE_LAST_NAME: /^[A-Za-z'.\s]+$/, // Alphabets, space, apostrophe, dot
  PINCODE: /^[1-9][0-9]{5}$/, // 6 digits, cannot start with 0
  MOBILE: /^[6-9]\d{9}$/, // Indian mobile numbers (10 digits, starts 6–9)
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Simple email pattern
  CUSTOM_EMAIL: /^(?=.*@)[A-Za-z0-9`~@#$%^&*()._+\-=]+$/, // Alphanumeric + selected special chars `~@#$%^&*()._+-=  must contain '@'
  ALPHANUMERIC_WITH_SPECIALS: /^[A-Za-z0-9`~@#$%^&*()_+\-=]+$/, // Alphanumeric + selected special chars `~@#$%^&*()_+-=
  ALPHANUMERIC: /^[A-Za-z0-9]+$/, // Alphanumeric only (letters and numbers)
  ALPHANUMERIC_WITH_SPACES: /^[A-Za-z0-9\s]+$/, // Alphanumeric + spaces (letters, numbers, and spaces)
  ADDRESS_LINE: /^[A-Za-z0-9\s`~@#$%^&*()_+\-=]+$/, // Alphanumeric + space + special chars `~@#$%^&*()_+-=
  INDIA_MOBILE: /^[6-9]\d{9}$/, // India: starts with 6–9, exactly 10 digits
  INTERNATIONAL_MOBILE: /^\+?\d{8,15}$/, // International: allows +, numeric only, 8–15 digits
  ALPHANUM_PLUS: /^[A-Za-z0-9+]+$/, // Alphanumeric + '+' sign only
  DIGIPIN_REGEX: /^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/i, // Digipin format XXX-XXX-XXXX with allowed characters
};
// maxLengthByIdType
export const maxLengthByIdType: Record<string, number> = {
  PAN_CARD: 10,
  AADHAAR: 4,
  VOTER_ID: 10,
  DRIVING_LICENSE: 18,
  PASSPORT: 8,
  DIGIPIN: 12,
};

// maxLengthByFieldType
export const maxLengthByFieldType: Record<string, number> = {
  STATE: 50,
  DISTRICT: 50,
  CITY: 50,
  PINCODE: 50,
};

// Validation functions
export const ValidationUtils = {
  isValidFirstName(name?: string): boolean {
    return !!name && REGEX.FIRST_NAME.test(name.trim());
  },

  isValidMiddleLastName(name?: string): boolean {
    return !!name && REGEX.MIDDLE_LAST_NAME.test(name.trim());
  },

  isValidPincode(pincode?: string): boolean {
    return !!pincode && REGEX.PINCODE.test(pincode);
  },

  isValidIndiaMobile(mobile?: string): boolean {
    return !!mobile && REGEX.MOBILE.test(mobile);
  },

  isValidEmail(email?: string): boolean {
    return !!email && REGEX.CUSTOM_EMAIL.test(email.trim());
  },

  /** Validates alphanumeric + allowed special characters `~@#$%^&*()_+-= */
  isValidAlphaNumWithSpecialChar(value?: string): boolean {
    return !!value && REGEX.ALPHANUMERIC_WITH_SPECIALS.test(value.trim());
  },

  /** Allows alphabets, numbers, and '+' only */
  isValidAlphaNumPlus(value?: string): boolean {
    return !!value && REGEX.ALPHANUM_PLUS.test(value.trim());
  },

  /** Validates alphanumeric only (letters and numbers) */
  isValidAlphanumeric(value?: string): boolean {
    return !!value && REGEX.ALPHANUMERIC.test(value);
  },

  /** Validates alphanumeric with spaces (letters, numbers, and spaces) */
  isValidAlphanumericWithSpaces(value?: string): boolean {
    return !!value && REGEX.ALPHANUMERIC_WITH_SPACES.test(value.trim());
  },

  /**
   * Validate mobile number.
   * - India: 10 digits, starts with 6–9.
   * - International: numeric, 8–15 digits, optional '+' prefix.
   */
  isValidMobileNumber(value?: string, countryCode?: string): boolean {
    if (!value) return false;
    const mobile = value.trim();

    // Case 1: Indian numbers
    if (
      countryCode === 'IN' ||
      countryCode === '+91' ||
      countryCode === 'IND'
    ) {
      return REGEX.INDIA_MOBILE.test(mobile);
    }

    // Case 2: Non-Indian numbers
    return REGEX.INTERNATIONAL_MOBILE.test(mobile);
  },

  /**
   * Validate address line.
   * Alphanumeric + space + selected special chars `~@#$%^&*()_+-=
   */
  isValidAddressLine(value?: string): boolean {
    if (!value) return false;
    return REGEX.ADDRESS_LINE.test(value.trim());
  },

  // Aadhaar (India) - Last 4 digits only
  isValidAadhaar(value?: string, countryCode: string = 'IN'): boolean {
    if (!value) return false;
    const v = String(value).replace(/\s+/g, '');
    if (countryCode.toUpperCase() !== 'IN') {
      // Generic fallback: accept numeric strings 4 digits for other countries
      return /^\d{4}$/.test(v);
    }
    // India: Aadhaar last 4 digits - exactly 4 numeric digits
    return /^\d{4}$/.test(v);
  },

  // PAN (India) - 5 letters, 4 digits, 1 letter
  isValidPAN(value?: string, countryCode: string = 'IN'): boolean {
    if (!value) return false;
    const v = String(value).trim().toUpperCase();
    if (countryCode.toUpperCase() !== 'IN') {
      // fallback: alphanumeric 5-15
      return /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/i.test(v);
    }
    return /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/.test(v);
  },

  /**
   * Validate PAN based on Constitution type.
   * The 4th character of PAN indicates the entity type:
   * - P: Individual / Sole Proprietorship
   * - F: Partnership Firm
   * - C: Company (Private Limited / Public Limited)
   * - G: Central/State Govt Dept or Agency
   * - H: HUF
   * - L: Local Authority
   * - J: Artificial Juridical Person
   * - A: Association of Persons (AOP) / Body of Individuals (BOI)
   * - E: Limited Liability Partnership
   * - T: Trust
   */
  isValidPANForConstitution(
    value?: string,
    constitution?: string
  ): { isValid: boolean; message: string } {
    if (!value) return { isValid: false, message: 'PAN is required' };

    const v = String(value).trim().toUpperCase();
    const constitutionUpper = (constitution || '').toUpperCase();

    // First check basic PAN format
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v)) {
      return {
        isValid: false,
        message:
          'PAN must be in the format AAAAA9999A (5 letters, 4 digits, 1 letter)',
      };
    }

    // Map constitution to expected 4th character
    const constitutionToPanChar: Record<
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

    const expectedMapping = constitutionToPanChar[constitutionUpper];

    if (!expectedMapping) {
      // No specific constitution mapping found, use generic validation
      return { isValid: true, message: '' };
    }

    const fourthChar = v.charAt(3);
    const allowedChars = Array.isArray(expectedMapping.char)
      ? expectedMapping.char
      : [expectedMapping.char];

    if (!allowedChars.includes(fourthChar)) {
      return {
        isValid: false,
        message: `PAN must be in the format ${expectedMapping.format}`,
      };
    }

    return { isValid: true, message: '' };
  },

  // Passport
  // India-specific: typically 1 letter + 7 digits (total 8) — but use some flexibility.
  // Other countries: accept alphanumeric length 6-9 as common fallback.
  isValidPassport(value?: string, countryCode: string = 'IN'): boolean {
    if (!value) return false;
    const v = String(value).trim().toUpperCase();

    if (countryCode.toUpperCase() === 'IN') {
      // India's passports: 1 letter followed by 7 digits is typical (e.g., A1234567)
      return /^[A-Z]{1}[0-9]{7}$/.test(v);
    }

    // Generic fallback for many countries: 6-9 alphanumeric (some use 8)
    return /^[A-Z]{1}[0-9]{7}$/.test(v);
  },

  // Voter ID (EPIC) - India: typically 3 letters followed by 7 digits (example: ABC1234567)
  // Other countries: fallback to alphanumeric 6-20
  isValidVoterId(value?: string, countryCode: string = 'IN'): boolean {
    if (!value) return false;
    const v = String(value).trim().toUpperCase();

    if (countryCode.toUpperCase() === 'IN') {
      // Common EPIC format: 3 letters + 7 digits (some variants exist)
      if (/^[A-Z]{3}[0-9]{7}$/.test(v)) return true;
      // Sometimes states emit different formats — allow a relaxed check too:
      return /^[A-Z]{3}[0-9]{7}$/.test(v);
    }

    // Fallback: alphanumeric 6-20
    return /^[A-Z]{3}[0-9]{7}$/i.test(v);
  },

  // Driving License
  // India: formats vary by state. Common pattern: 2 letters (state) + 2 digits + 11 digits OR combinations.
  // We'll check a few common patterns and provide a relaxed fallback for India.
  // Other countries: fallback to alphanumeric 6-20
  isValidDrivingLicense(value?: string, countryCode: string = 'IN'): boolean {
    if (!value) return false;
    const v = String(value).trim().toUpperCase().replace(/\s+/g, '');

    if (countryCode.toUpperCase() === 'IN') {
      // Some common patterns observed in India (not exhaustive):
      const patterns = [
        // KA01AB1234567 or KA01-123456789012 (simplified)
        /^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$/,
      ];
      return patterns.some((r) => r.test(v));
    }

    // Generic fallback (other countries): alphanumeric 6-20 (no spaces)
    return /^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$/i.test(v);
  },
};

export const isValidDigipin = (value: string): boolean => {
  if (!value) return false;

  // Remove all non-alphanumeric characters for validation
  const processedValue = value.replace(/[^A-Za-z0-9]/g, '');

  // Check if processed value matches the pattern (10 characters from allowed set)
  // Allowed characters: 2-9, C, F, J, K, L, M, P, T
  const allowedChars = /^[2-9CFJKLMPT]{10}$/i;

  return allowedChars.test(processedValue);
};

// -------------------------
// Verhoeff algorithm for Aadhaar checksum validation
// NOTE: No longer used since Aadhaar validation now only requires last 4 digits
// Kept for reference in case full 12-digit validation is needed in future
// -------------------------
// const verhoeffD = [
//   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
//   [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
//   [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
//   [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
//   [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
//   [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
//   [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
//   [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
//   [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
// ];

// const verhoeffP = [
//   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
//   [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
//   [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
//   [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
//   [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
//   [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
//   [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
//   [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
// ];

// const verhoeffInv = [0,4,3,2,1,5,6,7,8,9];

// function verhoeffValidate(num: string): boolean {
//   // num is a string of digits
//   let c = 0;
//   const digits = num
//     .split('')
//     .reverse()
//     .map((d) => parseInt(d, 10));
//   for (let i = 0; i < digits.length; i++) {
//     const digit = digits[i];
//     if (isNaN(digit)) return false;
//     c = verhoeffD[c][verhoeffP[i % 8][digit]];
//   }
//   return c === 0;
// }
