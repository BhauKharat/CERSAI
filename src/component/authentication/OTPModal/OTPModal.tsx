import React, { useEffect, useState, useRef } from 'react';
import './OTPModal.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  resendOtpReq,
  validateOtpReq,
} from '../../ui/Modal/slice/otpModalSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { toast } from 'react-toastify';
import { maskEmail, maskMobile } from '../../../utils/maskUtils';
import {
  showLoader,
  hideLoader,
} from '../../../redux/slices/loader/loaderSlice';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShowSuccessModal: (value: boolean) => void;
  email: string;
  mobile: string;
  countryCode: string;
  signUpValidation?: boolean;
}

interface ApiErrorResponse {
  data?: {
    data?: {
      errorMessage?: string;
      details?: Array<{
        field: string;
        issue: string;
      }>;
    };
  };
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  setShowSuccessModal,
  email,
  mobile,
  countryCode,
  signUpValidation = false,
}) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(0);
  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileResendCount, setMobileResendCount] = useState(0); // 🔄
  const [emailResendCount, setEmailResendCount] = useState(0); // 🔄
  const [isMobileOtpValid, setIsMobileOtpValid] = useState<boolean>(true);
  const [isEmailOtpValid, setIsEmailOtpValid] = useState<boolean>(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');

  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const mobileIntervalRef = useRef<NodeJS.Timeout | null>(null); // 🔄
  const emailIntervalRef = useRef<NodeJS.Timeout | null>(null); // 🔄

  const dispatch = useDispatch<AppDispatch>();
  const otpIdentifier = useSelector(
    (state: RootState) => state.signup.otpIdentifier
  );

  // 🔁 Timer getter based on resend count
  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
  };

  // 🔁 Reset + start timer function
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

    if (!isMobileValid) setMobileErrorMessage('Invalid OTP, Please Try again.');
    else setMobileErrorMessage('');

    if (!isEmailValid) setEmailErrorMessage('Invalid OTP, Please Try again.');
    else setEmailErrorMessage('');

    if (!isMobileValid || !isEmailValid) {
      toast.error('Please enter valid OTPs');
      return;
    }

    if (!otpIdentifier) {
      toast.error('Identifier not found.');
      return;
    }

    const mobileOtpStr = mobileOtp.join('');
    const emailOtpStr = emailOtp.join('');

    dispatch(showLoader('Verifying OTP...'));
    try {
      const result = await dispatch(
        validateOtpReq({
          identifier: otpIdentifier,
          mobileOtp: mobileOtpStr,
          emailOtp: emailOtpStr,
          signUpValidation: signUpValidation,
        })
      ).unwrap();

      toast.success(result?.data?.message || 'OTP verified successfully');
      setShowSuccessModal(true);
      handleClose();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      const errorData = err?.data?.data;
      const genericError =
        errorData?.errorMessage || 'OTP verification failed.';
      const details = errorData?.details || [];

      details.forEach((detail: { field: string; issue: string }) => {
        if (detail.field === 'mobileOtp') {
          setMobileErrorMessage(detail.issue || genericError);
          setIsMobileOtpValid(false);
        }
        if (detail.field === 'emailOtp') {
          setEmailErrorMessage(detail.issue || genericError);
          setIsEmailOtpValid(false);
        }
        if (detail.field === 'otp') {
          toast.error(`${detail.field}: ${detail.issue}`);
        }
      });
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleResendOtp = async (type: 'EMAIL' | 'MOBILE') => {
    if (!otpIdentifier) {
      toast.error('Identifier not found');
      return;
    }

    try {
      const res = await dispatch(
        resendOtpReq({
          identifier: otpIdentifier,
          type,
        })
      ).unwrap();

      toast.success(res.message || 'OTP resent successfully');

      if (type === 'MOBILE') {
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

      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setMobileOtp(Array(6).fill(''));
    setEmailOtp(Array(6).fill(''));
    setMobileResendCount(0);
    setEmailResendCount(0);
    clearTimers();
    onClose();
  };

  if (!isOpen) return null;

  return (
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
              {formatTime(mobileTimer)}sec
              {mobileTimer === 0 && (
                <button
                  onClick={() => handleResendOtp('MOBILE')}
                  className="resend-button"
                >
                  Resend
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
              {formatTime(emailTimer)}sec
              {emailTimer === 0 && (
                <button
                  onClick={() => handleResendOtp('EMAIL')}
                  className="resend-button"
                >
                  Resend
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
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
