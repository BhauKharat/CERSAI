import { useState, useCallback } from 'react';

/**
 * Helper function to mask Aadhaar number - show only last 4 digits
 * @param value - The Aadhaar number to mask
 * @returns Masked Aadhaar number (XXXXXXXX1234)
 */
export const maskAadhaarNumber = (value: string): string => {
  if (!value) return value;
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly.length <= 4) {
    return digitsOnly;
  }

  // Mask first 8 digits with X, show last 4 digits
  const maskedPart = 'X'.repeat(Math.min(8, digitsOnly.length - 4));
  const visiblePart = digitsOnly.slice(-4);

  return maskedPart + visiblePart;
};

/**
 * Custom hook for Aadhaar number masking with focus handling
 * Provides smart masking - shows full number while typing, masks when not focused
 *
 * @returns Object containing:
 *   - isAadhaarFocused: boolean state tracking if field is focused
 *   - getDisplayValue: function to get masked/unmasked value based on focus
 *   - handleAadhaarFocus: onFocus handler
 *   - handleAadhaarBlur: onBlur handler
 *   - handleAadhaarChange: onChange handler that extracts only digits
 */
export const useAadhaarMasking = () => {
  const [isAadhaarFocused, setIsAadhaarFocused] = useState<boolean>(false);

  /**
   * Get display value - masked when not focused, unmasked when focused
   */
  const getDisplayValue = useCallback(
    (value: string, shouldMask: boolean): string => {
      if (shouldMask && !isAadhaarFocused) {
        return maskAadhaarNumber(value);
      }
      return value;
    },
    [isAadhaarFocused]
  );

  /**
   * Handle focus event - show unmasked value
   */
  const handleAadhaarFocus = useCallback(() => {
    setIsAadhaarFocused(true);
  }, []);

  /**
   * Handle blur event - show masked value
   */
  const handleAadhaarBlur = useCallback(() => {
    setIsAadhaarFocused(false);
  }, []);

  /**
   * Handle change event - extract only digits from input
   */
  const handleAadhaarChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      originalOnChange: (fieldName: string, value: string) => void,
      fieldName: string
    ) => {
      const digitsOnly = e.target.value.replace(/\D/g, '');
      originalOnChange(fieldName, digitsOnly);
    },
    []
  );

  return {
    isAadhaarFocused,
    getDisplayValue,
    handleAadhaarFocus,
    handleAadhaarBlur,
    handleAadhaarChange,
  };
};
