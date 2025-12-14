import React, { useEffect, useState, useRef } from 'react';
import '../../register/OTPModalregister/otpModalRegister.css';
import { useDispatch, useSelector } from 'react-redux';
import { validateOtp } from '../../../redux/slices/registerSlice/authSlice';
import { RootState, AppDispatch } from '../../../redux/store';
import {
  showLoader,
  hideLoader,
} from '../../../redux/slices/loader/loaderSlice';
import { resendOtpReq } from '../../ui/Modal/slice/otpModalSlice';
import { maskEmail, maskMobile } from '../../../utils/maskUtils';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOtpSubmit: (mobileOtp: string, emailOtp: string) => void;
  countryCode: string | undefined;
  email: string | undefined;
  mobile: string | undefined;
}

const OTPModalRegister: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  onOtpSubmit,
  countryCode,
  email,
  mobile,
}) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));

  const [mobileTimer, setMobileTimer] = useState(30);
  const [emailTimer, setEmailTimer] = useState(30);
  const [mobileResendCount, setMobileResendCount] = useState(0);
  const [emailResendCount, setEmailResendCount] = useState(0);

  const [isMobileOtpValid, setIsMobileOtpValid] = useState(true);
  const [isEmailOtpValid, setIsEmailOtpValid] = useState(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  const [resendError, setResendError] = useState<string>('');
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const dispatch = useDispatch<AppDispatch>();
  const identifier = useSelector(
    (state: RootState) => state.passSetupOtp.otpIdentifier
  );

  // Constants for resend limits
  const MAX_RESEND_ATTEMPTS = 2;

  // Check if both OTPs are complete
  const isMobileOtpComplete = mobileOtp.every((digit) => digit !== '');
  const isEmailOtpComplete = emailOtp.every((digit) => digit !== '');
  const isSubmitEnabled = isMobileOtpComplete && isEmailOtpComplete;

  // Check if resend limit reached
  const isMobileResendDisabled = mobileResendCount >= MAX_RESEND_ATTEMPTS;
  const isEmailResendDisabled = emailResendCount >= MAX_RESEND_ATTEMPTS;

  // Countdown timers
  useEffect(() => {
    if (!isOpen) return;

    const mobileInterval = setInterval(() => {
      setMobileTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const emailInterval = setInterval(() => {
      setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(mobileInterval);
      clearInterval(emailInterval);
    };
  }, [isOpen]);

  const formatTime = (sec: number) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
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

  const handleResend = async (type: 'EMAIL' | 'MOBILE') => {
    const currentIdentifier = identifier || identifier;
    if (!currentIdentifier) {
      console.error('Identifier not found');
      return;
    }

    // Check if resend limit reached
    const currentCount =
      type === 'MOBILE' ? mobileResendCount : emailResendCount;
    if (currentCount >= MAX_RESEND_ATTEMPTS) {
      // Maximum resend attempts reached, no action needed
      return;
    }

    try {
      await dispatch(
        resendOtpReq({
          identifier: currentIdentifier,
          type,
        })
      ).unwrap();

      if (type === 'MOBILE') {
        const nextCount = mobileResendCount + 1;
        setMobileResendCount(nextCount);
        setMobileTimer(getResendTimer(nextCount));
      } else {
        const nextCount = emailResendCount + 1;
        setEmailResendCount(nextCount);
        setEmailTimer(getResendTimer(nextCount));
      }
      setResendError(''); // Clear any previous errors
      console.log(`${type.toUpperCase()} OTP resent successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to resend OTP';
      setResendError(errorMessage);
      console.error(errorMessage);
    }
  };

  const validateisOtp = (otp: string[]) => {
    return otp.every((digit) => digit !== '');
  };

  const handleSubmit = async () => {
    const isMobileValid = validateisOtp(mobileOtp);
    const isEmailValid = validateisOtp(emailOtp);

    setIsMobileOtpValid(isMobileValid);
    setIsEmailOtpValid(isEmailValid);

    if (!isMobileValid) {
      setMobileErrorMessage('Invalid OTP, Please Try again.');
    } else {
      setMobileErrorMessage('');
    }

    if (!isEmailValid) {
      setEmailErrorMessage('Invalid OTP, Please Try again.');
    } else {
      setEmailErrorMessage('');
    }

    if (isMobileValid && isEmailValid) {
      const mobileOtpStr = mobileOtp.join('');
      const emailOtpStr = emailOtp.join('');

      try {
        dispatch(showLoader('Please Wait...'));
        const resultAction = await dispatch(
          validateOtp({
            identifier: identifier || '',
            mobileOtp: mobileOtpStr,
            emailOtp: emailOtpStr,
            signUpValidation: false,
          })
        );

        if (validateOtp.fulfilled.match(resultAction)) {
          onOtpSubmit(mobileOtpStr, emailOtpStr);
        } else {
          console.log(
            'OTP validation failed: ' + (resultAction.payload as string)
          );
        }
      } catch (err) {
        console.error('Validation error:', err);
        alert('Unexpected error occurred during OTP validation');
      } finally {
        dispatch(hideLoader());
      }
    }
  };

  const handleClose = () => {
    setMobileOtp(Array(6).fill(''));
    setEmailOtp(Array(6).fill(''));
    onClose(); // ❗️ No timer or count reset
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        <h2 className="modal-title">OTP Verification</h2>

        <div className="otp-section">
          <div className="otp-header">
            <label htmlFor="mobile-otp-input-0" className="otp-label">
              Mobile OTP<span className="required">*</span>
            </label>
            <div className="otp-timer">
              {formatTime(mobileTimer)}
              {mobileTimer === 0 && !isMobileResendDisabled && (
                <button
                  onClick={() => handleResend('MOBILE')}
                  className="resend-button"
                >
                  Send again
                </button>
              )}
              {mobileTimer === 0 && isMobileResendDisabled && (
                // <span className="resend-disabled-text" style={{ color: '#999', fontSize: '12px' }}>
                //   Max attempts reached
                // </span>
                <></>
              )}
            </div>
          </div>
          <div className="otp-input-group">
            {mobileOtp.map((digit, idx) => (
              <input
                key={idx}
                id={`mobile-otp-input-${idx}`}
                ref={(el) => {
                  mobileOtpRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, idx, 'mobile')}
                className={`otp-input ${!isMobileOtpValid && 'invalid'}`}
                aria-label={`Mobile OTP digit ${idx + 1}`}
              />
            ))}
          </div>
          <div className="otp-info-row">
            <span className="otp-info">
              OTP Sent on {countryCode} {maskMobile(mobile || '')}
            </span>
            {!isMobileOtpValid && (
              <span className="error-message">{mobileErrorMessage}</span>
            )}
          </div>
        </div>

        <div className="otp-section">
          <div className="otp-header">
            <label htmlFor="email-otp-input-0" className="otp-label">
              Email OTP<span className="required">*</span>
            </label>
            <div className="otp-timer">
              {formatTime(emailTimer)}
              {emailTimer === 0 && !isEmailResendDisabled && (
                <button
                  onClick={() => handleResend('EMAIL')}
                  className="resend-button"
                >
                  Send again
                </button>
              )}
              {emailTimer === 0 && isEmailResendDisabled && (
                // <span className="resend-disabled-text" style={{ color: '#999', fontSize: '12px' }}>
                //   Max attempts reached
                // </span>
                <></>
              )}
            </div>
          </div>
          <div className="otp-input-group">
            {emailOtp.map((digit, idx) => (
              <input
                key={idx}
                id={`email-otp-input-${idx}`}
                ref={(el) => {
                  emailOtpRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, idx, 'email')}
                className={`otp-input ${!isEmailOtpValid && 'invalid'}`}
                aria-label={`Email OTP digit ${idx + 1}`}
              />
            ))}
          </div>
          <div className="otp-info-row">
            <span className="otp-info">
              OTP Sent on {maskEmail(email || '')}
            </span>
            {!isEmailOtpValid && (
              <span className="error-message">{emailErrorMessage}</span>
            )}
          </div>
        </div>
        {resendError && (
          <div
            className="erroServer"
            style={{ color: 'red', marginTop: '12px', fontFamily: 'inherit' }}
          >
            {resendError}
          </div>
        )}
        <div className="submit-button-container">
          <button
            className={`submit-button ${!isSubmitEnabled ? 'disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!isSubmitEnabled}
          >
            Validate
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModalRegister;
