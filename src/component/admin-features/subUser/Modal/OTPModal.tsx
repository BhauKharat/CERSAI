/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import './OTPModal.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import {
  verifyOtp,
  clearVerifyOtpError,
  clearVerifyOtpSuccess,
  selectVerifyOtpLoading,
  selectVerifyOtpError,
  selectVerifyOtpSuccess,
} from '../CreateNewUser/slices/createUserSlice'; // Update the import path
import SuccessModal from './SuccessModal/successModal'; // Import SuccessModal

// Updated interface to include the OTP props
interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShowSuccessModal: (value: boolean) => void;
  email: string;
  mobile: string;
  countryCode: string;
  // New props for OTP verification
  emailOtp?: string | null;
  mobileOtp?: string | null;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  setShowSuccessModal,
  email,
  mobile,
  countryCode,
  emailOtp: receivedEmailOtp, // Rename to avoid confusion with state
  mobileOtp: receivedMobileOtp, // Rename to avoid confusion with state
}) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(0);
  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileResendCount, setMobileResendCount] = useState(0);
  const [emailResendCount, setEmailResendCount] = useState(0);
  const [isMobileOtpValid, setIsMobileOtpValid] = useState<boolean>(true);
  const [isEmailOtpValid, setIsEmailOtpValid] = useState<boolean>(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  const [showSuccessModalLocal, setShowSuccessModalLocal] =
    useState<boolean>(false);

  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const mobileIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const emailIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const verifyOtpLoading = useSelector(selectVerifyOtpLoading);
  const verifyOtpError = useSelector(selectVerifyOtpError);
  const verifyOtpSuccess = useSelector(selectVerifyOtpSuccess);

  // Timer getter based on resend count
  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
  };

  // Reset + start timer function
  const startTimer = (type: 'mobile' | 'email', duration: number) => {
    if (type === 'mobile') {
      clearInterval(mobileIntervalRef.current!);
      setMobileTimer(duration);
      mobileIntervalRef.current = setInterval(() => {
        setMobileTimer((prev) => {
          if (prev <= 1) {
            clearInterval(mobileIntervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(emailIntervalRef.current!);
      setEmailTimer(duration);
      emailIntervalRef.current = setInterval(() => {
        setEmailTimer((prev) => {
          if (prev <= 1) {
            clearInterval(emailIntervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const clearTimers = () => {
    if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
    if (emailIntervalRef.current) clearInterval(emailIntervalRef.current);
  };

  useEffect(() => {
    if (isOpen) {
      startTimer('mobile', getResendTimer(mobileResendCount));
      startTimer('email', getResendTimer(emailResendCount));
    } else {
      clearTimers();
    }
    return () => clearTimers();
  }, [emailResendCount, isOpen, mobileResendCount]);

  // Handle verification success
  useEffect(() => {
    if (verifyOtpSuccess) {
      setShowSuccessModalLocal(true);
      dispatch(clearVerifyOtpSuccess());
    }
  }, [verifyOtpSuccess, dispatch]);

  // Handle verification error
  useEffect(() => {
    if (verifyOtpError) {
      // Set error messages based on the API error
      setMobileErrorMessage(
        verifyOtpError.errorMessage || 'OTP verification failed'
      );
      setEmailErrorMessage(
        verifyOtpError.errorMessage || 'OTP verification failed'
      );
      setIsMobileOtpValid(false);
      setIsEmailOtpValid(false);

      // Clear the error after showing it
      setTimeout(() => {
        dispatch(clearVerifyOtpError());
      }, 100);
    }
  }, [verifyOtpError, dispatch]);

  const formatTime = (sec: number) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: 'mobile' | 'email'
  ) => {
    const value = e.target.value;
    const otpArray = type === 'mobile' ? [...mobileOtp] : [...emailOtp];

    if (/^\d?$/.test(value)) {
      otpArray[index] = value;
      if (type === 'mobile') {
        setMobileOtp(otpArray);
      } else {
        setEmailOtp(otpArray);
      }

      if (value && index < otpArray.length - 1) {
        const nextInput =
          type === 'mobile'
            ? mobileOtpRefs.current[index + 1]
            : emailOtpRefs.current[index + 1];
        if (nextInput) nextInput.focus();
      }
    }

    if (value === '' && index > 0) {
      const prevInput =
        type === 'mobile'
          ? mobileOtpRefs.current[index - 1]
          : emailOtpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const validateOtp = (otp: string[]) => otp.every((digit) => digit !== '');

  const handleSubmit = async () => {
    const isMobileValid = validateOtp(mobileOtp);
    const isEmailValid = validateOtp(emailOtp);

    setIsMobileOtpValid(isMobileValid);
    setIsEmailOtpValid(isEmailValid);

    if (!isMobileValid)
      setMobileErrorMessage('Please enter complete Mobile OTP.');
    else setMobileErrorMessage('');

    if (!isEmailValid) setEmailErrorMessage('Please enter complete Email OTP.');
    else setEmailErrorMessage('');

    if (!isMobileValid || !isEmailValid) {
      console.error('Please enter valid OTPs');
      return;
    }

    const enteredMobileOtp = mobileOtp.join('');
    const enteredEmailOtp = emailOtp.join('');

    try {
      // First verify mobile OTP
      await dispatch(
        verifyOtp({
          emailOrMobile: `${countryCode}${mobile}`,
          otp: enteredMobileOtp,
        })
      ).unwrap();

      // If mobile OTP is successful, verify email OTP
      await dispatch(
        verifyOtp({
          emailOrMobile: email,
          otp: enteredEmailOtp,
        })
      ).unwrap();

      // Both OTPs verified successfully - success will be handled in useEffect
    } catch (error: unknown) {
      // Error handling is done in useEffect through Redux state
      console.error('OTP verification failed:', error);
    }
  };

  const handleResendOtp = async (type: 'email' | 'mobile') => {
    try {
      // Here you would dispatch your resend OTP action
      // For now, we'll just reset the timer
      console.log(`Resending ${type} OTP...`);

      if (type === 'mobile') {
        const nextCount = mobileResendCount + 1;
        setMobileResendCount(nextCount);
        startTimer('mobile', getResendTimer(nextCount));
      } else {
        const nextCount = emailResendCount + 1;
        setEmailResendCount(nextCount);
        startTimer('email', getResendTimer(nextCount));
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to resend OTP';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error(errorMessage);
    }
  };

  const handleClose = () => {
    setMobileOtp(Array(6).fill(''));
    setEmailOtp(Array(6).fill(''));
    setMobileResendCount(0);
    setEmailResendCount(0);
    setIsMobileOtpValid(true);
    setIsEmailOtpValid(true);
    setMobileErrorMessage('');
    setEmailErrorMessage('');
    clearTimers();
    // Clear any Redux errors
    dispatch(clearVerifyOtpError());
    dispatch(clearVerifyOtpSuccess());
    onClose();
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModalLocal(false);
    setShowSuccessModal(true); // Notify parent component
    handleClose(); // Close the OTP modal
  };

  // Mask email function
  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;

    const maskedLocal =
      localPart.length <= 2
        ? localPart
        : localPart.charAt(0) +
          '*'.repeat(localPart.length - 2) +
          localPart.charAt(localPart.length - 1);

    return `${maskedLocal}@${domain}`;
  };

  // Mask mobile function
  const maskMobile = (mobile: string): string => {
    if (!mobile) return '';
    if (mobile.length <= 4) return mobile;

    return (
      mobile.substring(0, 2) +
      '*'.repeat(mobile.length - 4) +
      mobile.substring(mobile.length - 2)
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal">
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
          <h2 className="modal-title">OTP Verification</h2>

          {/* Mobile OTP Section */}
          <div className="otp-section">
            <div className="otp-header">
              <label htmlFor="mobile-otp" className="otp-label">
                Mobile OTP<span className="required">*</span>
              </label>
              <div className="otp-timer">
                {formatTime(mobileTimer)}
                {mobileTimer === 0 && (
                  <button
                    onClick={() => handleResendOtp('mobile')}
                    className="resend-button"
                    disabled={verifyOtpLoading}
                  >
                    Send again
                  </button>
                )}
              </div>
            </div>
            <div className="otp-input-group">
              {mobileOtp.map((digit, idx) => (
                <input
                  id="mobile-otp"
                  key={idx}
                  ref={(el) => {
                    mobileOtpRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, idx, 'mobile')}
                  className={`otp-input ${!isMobileOtpValid && 'invalid'}`}
                  disabled={verifyOtpLoading}
                />
              ))}
            </div>
            <div className="otp-info-row">
              <span className="otp-info">
                OTP Sent on {countryCode} {maskMobile(mobile)}
              </span>
              {!isMobileOtpValid && (
                <span className="error-message">{mobileErrorMessage}</span>
              )}
            </div>
          </div>

          {/* Email OTP Section */}
          <div className="otp-section">
            <div className="otp-header">
              <label htmlFor="email-otp" className="otp-label">
                Email OTP<span className="required">*</span>
              </label>
              <div className="otp-timer">
                {formatTime(emailTimer)}
                {emailTimer === 0 && (
                  <button
                    onClick={() => handleResendOtp('email')}
                    className="resend-button"
                    disabled={verifyOtpLoading}
                  >
                    Send again
                  </button>
                )}
              </div>
            </div>
            <div className="otp-input-group">
              {emailOtp.map((digit, idx) => (
                <input
                  id="email-otp"
                  key={idx}
                  ref={(el) => {
                    emailOtpRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, idx, 'email')}
                  className={`otp-input ${!isEmailOtpValid && 'invalid'}`}
                  disabled={verifyOtpLoading}
                />
              ))}
            </div>
            <div className="otp-info-row">
              <span className="otp-info">OTP Sent on {maskEmail(email)}</span>
              {!isEmailOtpValid && (
                <span className="error-message">{emailErrorMessage}</span>
              )}
            </div>
          </div>

          <div className="submit-button-container">
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={verifyOtpLoading}
            >
              {verifyOtpLoading ? 'Verifying...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModalLocal}
        onClose={handleSuccessModalClose}
        message="The details verified successfully"
        buttonText="Okay"
        width={400}
      />
    </>
  );
};

export default OTPModal;
