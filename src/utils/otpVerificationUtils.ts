/* eslint-disable @typescript-eslint/no-explicit-any */

export interface OTPVerificationData {
  mobile?: string;
  email?: string;
  countryCode?: string;
  [key: string]: any;
}

export interface OTPVerificationCallbacks {
  onSuccess: () => void;
  onClose: () => void;
  onError?: (error: string) => void;
}

/**
 * Utility class for handling OTP verification across different forms
 */
export class OTPVerificationUtils {
  /**
   * Extract OTP data from form values
   */
  static extractOTPData(formValues: Record<string, any>): OTPVerificationData {
    return {
      mobile: formValues.mobile || formValues.mobileNumber || formValues.phone,
      email: formValues.email || formValues.emailAddress,
      countryCode: formValues.countryCode || formValues.country_code || '+91',
      // Include all form values for context
      ...formValues,
    };
  }

  /**
   * Get masked values for display in OTP modal
   */
  static getMaskedValues(otpData: OTPVerificationData): {
    maskedMobile: string;
    maskedEmail: string;
    maskedCountryCode: string;
  } {
    const maskEmail = (email: string): string => {
      if (!email) return '';
      const [local, domain] = email.split('@');
      if (!domain) return email;
      const shown = (local || '').slice(0, 2);
      const starsLen = Math.max((local || '').length - shown.length, 0);
      const stars = '*'.repeat(starsLen);
      return `${shown}${stars}@${domain}`;
    };

    const maskMobile = (mobile: string, countryCode?: string): string => {
      const code = (countryCode || '').trim();
      const digits = (mobile || '').replace(/\D+/g, '');

      if (digits.length < 4) return mobile;

      const lastTwo = digits.slice(-2);
      const stars = '*'.repeat(Math.max(digits.length - 2, 0));
      return `${code} ${stars}${lastTwo}`;
    };
    console.log('otpData=====', otpData);
    return {
      maskedMobile: maskMobile(otpData.mobile || '', otpData.countryCode),
      maskedEmail: maskEmail(otpData.email || ''),
      maskedCountryCode: otpData.countryCode || '+91',
    };
  }

  /**
   * Validate form and prepare for OTP verification
   */
  static async validateFormForOTP(
    formValues: Record<string, any>,
    validateFunction: () => Promise<boolean>
  ): Promise<{
    isValid: boolean;
    otpData?: OTPVerificationData;
  }> {
    try {
      const isValid = await validateFunction();

      if (!isValid) {
        console.log('Form validation failed');
        return { isValid: false };
      }

      const otpData = this.extractOTPData(formValues);
      console.log('Form validation passed, OTP data extracted:', otpData);

      return {
        isValid: true,
        otpData,
      };
    } catch (error) {
      console.error('Validation error:', error);
      return { isValid: false };
    }
  }
}

/**
 * React hook for OTP verification state management
 */
export const useOTPVerificationState = () => {
  const [isOTPModalOpen, setIsOTPModalOpen] = React.useState(false);
  const [otpData, setOtpData] = React.useState<OTPVerificationData | null>(
    null
  );

  const openOTPModal = React.useCallback((data: OTPVerificationData) => {
    console.log('otpData useOTPVerificationState=====', data);

    // Create updated data object
    const updatedData = { ...data };

    // Check all keys in the data object for email or mobile values
    Object.keys(data).forEach((key) => {
      const value = data[key];
      console.log(`Checking key: ${key}, value: ${value}`);

      // Check if key contains email-related terms
      if (key.toLowerCase().includes('email') && value) {
        console.log(`Found email in key: ${key}, value: ${value}`);
        updatedData.email = value;
      }

      // Check if key contains mobile/phone-related terms
      if (
        (key.toLowerCase().includes('mobile') ||
          key.toLowerCase().includes('phone') ||
          key.toLowerCase().includes('number')) &&
        value
      ) {
        console.log(`Found mobile in key: ${key}, value: ${value}`);
        updatedData.mobile = value;
      }
    });

    console.log('Updated data with extracted email/mobile:', updatedData);
    setOtpData(updatedData);
    setIsOTPModalOpen(true);
  }, []);

  const closeOTPModal = React.useCallback(() => {
    setIsOTPModalOpen(false);
    setOtpData(null);
  }, []);

  return {
    isOTPModalOpen,
    otpData,
    openOTPModal,
    closeOTPModal,
  };
};

// Import React for the hook
import React from 'react';
