import { AppDispatch, RootState } from '@redux/store';
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resendOtp, validateOtp } from '../slice/authSlice';
import { showLoader, hideLoader } from '../slice/loaderSlice';

interface ForgotPassOtpProps {
  isOpen: boolean;
  onClose: () => void;
  onOtpSubmit: (mobileOtp: string, emailOtp: string) => void;
  data?: { mobile: string | null; email: string | null };
}
interface ApiError {
  data?: {
    errorMessage?: string;
  };
}
const ForgotPassOtp: React.FC<ForgotPassOtpProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(30);
  const [emailTimer, setEmailTimer] = useState(30);
  const [mobileResendCount, setMobileResendCount] = useState(1);
  const [emailResendCount, setEmailResendCount] = useState(1);
  const [isMobileOtpValid, setIsMobileOtpValid] = useState<boolean>(true); // Validation state for mobile OTP
  const [isEmailOtpValid, setIsEmailOtpValid] = useState<boolean>(true); // Validation state for email OTP
  const [mobileErrorMessage, setMobileErrorMessage] = useState<string>(''); // Error message for mobile OTP
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>(''); // Error message for email OTP
  // const [mobileOtpError, setMobileOtpError] = useState(false);
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  console.log('Data in ForgotPassOtp : ', data);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const otpIdentifier =
    useSelector((state: RootState) => state.auth.otpIdentifier) || ''; // from forgotPassword

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

  const getNextResendTime = (count: number): number => {
    if (count === 0) return 30; // first resend → 30 sec
    if (count === 1) return 60; // second resend → 1 min
    return 120; // third+ resend → 2 min
  };

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
      // type === 'mobile' ? setMobileOtp(otpArray) : setEmailOtp(otpArray);
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

  const handleResend = async (type: 'mobile' | 'email') => {
    if (!otpIdentifier) {
      console.error('Missing OTP identifier');
      return;
    }
    if (type === 'mobile') {
      const nextTime = getNextResendTime(mobileResendCount);
      setMobileTimer(nextTime);
      setMobileResendCount((prev) => prev + 1);
    } else {
      const nextTime = getNextResendTime(emailResendCount);
      setEmailTimer(nextTime);
      setEmailResendCount((prev) => prev + 1);
    }

    try {
      dispatch(showLoader('Please Wait...'));

      const resultAction = await dispatch(
        resendOtp({ identifier: otpIdentifier, type })
      );

      if (resendOtp.fulfilled.match(resultAction)) {
        console.log(resultAction.payload.message);
      } else {
        console.error(resultAction.payload as string);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error(apiError?.data?.errorMessage || 'Failed to resend OTP');
    } finally {
      dispatch(hideLoader());
    }
  };

  const isOtpComplete = (otp: string[]) => {
    return otp.every((digit) => digit !== ''); // Simple validation: check if all OTP fields are filled
  };

  const handleSubmit = async () => {
    const isMobileValid = isOtpComplete(mobileOtp);
    const isEmailValid = isOtpComplete(emailOtp);

    setIsMobileOtpValid(isMobileValid);
    setIsEmailOtpValid(isEmailValid);

    // Set error messages
    setMobileErrorMessage(
      isMobileValid ? '' : 'Please enter complete Mobile OTP'
    );
    setEmailErrorMessage(isEmailValid ? '' : 'Please enter complete Email OTP');

    if (!isMobileValid || !isEmailValid) {
      return;
    }
    dispatch(showLoader('Please Wait...'));
    try {
      const resultAction = await dispatch(
        validateOtp({
          identifier: otpIdentifier,
          mobileOtp: mobileOtp.join(''),
          emailOtp: emailOtp.join(''),
          signUpValidation: false,
        })
      );

      if (validateOtp.fulfilled.match(resultAction)) {
        console.log(resultAction.payload.message);
        navigate('/re-set-forget-new-password/' + btoa(data?.email ?? '')); // Or whatever your route is
      } else {
        console.error(resultAction.payload as string);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error(apiError?.data?.errorMessage || 'Failed to resend OTP');
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleClose = () => {
    setMobileOtp(Array(6).fill(''));
    setEmailOtp(Array(6).fill(''));
    setMobileTimer(30);
    setEmailTimer(30);
    setMobileResendCount(1);
    setEmailResendCount(1);
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

        <div className="otp-section">
          <div className="otp-header">
            <label htmlFor="mobile-otp" className="otp-label">
              Mobile OTP<span className="required">*</span>
            </label>
            <div className="otp-timer">
              {formatTime(mobileTimer)}sec
              {mobileTimer === 0 && (
                <button
                  onClick={() => handleResend('mobile')}
                  className="resend-button"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
          <div className="otp-input-group">
            {mobileOtp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  mobileOtpRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, idx, 'mobile')}
                className={`otp-input ${!isMobileOtpValid && 'invalid'}`} // Apply the red border if invalid
              />
            ))}
          </div>
          <div className="otp-info-row">
            <span className="otp-info">{`OTP Sent on ${data?.mobile}`}</span>
            {!isMobileOtpValid && (
              <span className="error-message">{mobileErrorMessage}</span>
            )}{' '}
            {/* Show error message on the right */}
          </div>
        </div>

        <div className="otp-section">
          <div className="otp-header">
            <label htmlFor="email-otp" className="otp-label">
              Email OTP<span className="required">*</span>
            </label>
            <div className="otp-timer">
              {formatTime(emailTimer)}sec
              {emailTimer === 0 && (
                <button
                  onClick={() => handleResend('email')}
                  className="resend-button"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
          <div className="otp-input-group">
            {emailOtp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  emailOtpRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, idx, 'email')}
                className={`otp-input ${!isEmailOtpValid && 'invalid'}`} // Apply the red border if invalid
              />
            ))}
          </div>
          <div className="otp-info-row">
            <span className="otp-info">{`OTP Sent on ${data?.email}`}</span>
            {!isEmailOtpValid && (
              <span className="error-message">{emailErrorMessage}</span>
            )}{' '}
            {/* Show error message on the right */}
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

export default ForgotPassOtp;
