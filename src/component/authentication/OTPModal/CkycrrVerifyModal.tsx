import React, { useEffect, useRef, useState } from 'react';
import './OTPModal.css';
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import {
  fetchCkycDetails,
  getCkycVerifiedRequest,
} from '../../../redux/slices/signupSlice';

interface OTPModalProps {
  otpIdentifier: string | undefined;
  isOpen: boolean;
  ckycNumber: string | number;
  onClose: () => void;
  setShowSuccessModal: (value: boolean) => void;
  updateOtpIdentifier: (otpIdentifier: string) => void;
  updateData: (data: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    emailId: string;
    gender: string;
  }) => void;
  onError?: () => void;
}

const CkycrrVerifyModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  setShowSuccessModal,
  ckycNumber,
  otpIdentifier,
  updateOtpIdentifier,
  updateData,
  onError,
}) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(0);
  const [mobileResendCount, setMobileResendCount] = useState(0);
  const [isMobileOtpValid, setIsMobileOtpValid] = useState<boolean>(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState<string>('');

  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const mobileIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      // Reset all OTP related states
      setMobileOtp(Array(6).fill(''));
      setIsMobileOtpValid(true);
      setMobileErrorMessage('');
      setMobileResendCount(0);

      // Start timer
      startTimer(getResendTimer(0));

      // Focus first input
      setTimeout(() => {
        const firstInput = mobileOtpRefs.current[0];
        if (firstInput) firstInput.focus();
      }, 100);
    } else {
      // Clear timers when modal closes
      clearTimers();
    }

    return () => clearTimers();
  }, [isOpen]);

  const handleResendOtp = async () => {
    const resultAction = await dispatch(fetchCkycDetails(`${ckycNumber}`));
    setMobileOtp(Array(6).fill(''));

    if (fetchCkycDetails.fulfilled.match(resultAction)) {
      toast.success('OTP resent successfully');
      updateOtpIdentifier(resultAction.payload.otp_identifier);
      const nextCount = mobileResendCount + 1;
      setMobileResendCount(nextCount);
      startTimer(getResendTimer(nextCount));
      setIsMobileOtpValid(true);
      setMobileErrorMessage('');
    } else {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Failed to resend OTP');
    }
  };

  const validateOtp = (otp: string[]) => otp.every((digit) => digit !== '');

  const handleSubmit = async () => {
    const isMobileValid = validateOtp(mobileOtp);

    setIsMobileOtpValid(isMobileValid);

    if (!isMobileValid) {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Please enter valid OTPs.');
      return;
    } else setMobileErrorMessage('');

    if (!otpIdentifier) {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Identifier not found.');
      return;
    }

    const mobileOtpStr = mobileOtp.join('');

    try {
      const response = await getCkycVerifiedRequest({
        identifier: otpIdentifier,
        otp: mobileOtpStr,
      });
      console.log(response, 'paylod daatat');
      toast.success('OTP verified successfully');
      setShowSuccessModal(true);
      updateData(response.data);
      onClose();
    } catch (error: unknown) {
      setMobileOtp(Array(6).fill(''));
      console.log(error);
      setIsMobileOtpValid(false);
      setMobileErrorMessage('OTP verification failed.');
    }
    setTimeout(() => {
      onClose();
      // Or call onError if provided
      onError?.();
    }, 1000);
  };

  const formatTime = (sec: number) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setIsMobileOtpValid(true);
    setMobileErrorMessage('');
    const value = e.target.value;
    const otpArray = [...mobileOtp];

    if (/^\d?$/.test(value)) {
      otpArray[index] = value;
      setMobileOtp(otpArray);

      if (value && index < otpArray.length - 1) {
        const nextInput = mobileOtpRefs.current[index + 1];
        if (nextInput) nextInput.focus();
      }
    }

    if (value === '' && index > 0) {
      const prevInput = mobileOtpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
  };

  const clearTimers = () => {
    if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
  };

  const startTimer = (duration: number) => {
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
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2
          className="modal-title"
          style={{ textAlign: 'left', marginBottom: '15px' }}
        >
          OTP Verification
        </h2>

        {/* Mobile OTP Section */}
        <div className="otp-section">
          <div className="otp-header">
            <label htmlFor="mobile-otp" className="otp-label">
              Mobile/Email OTP<span className="required">*</span>
            </label>
            <div className="otp-timer">
              {formatTime(mobileTimer)}
              {mobileTimer === 0 && (
                <button onClick={handleResendOtp} className="resend-button">
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
                onChange={(e) => handleOtpChange(e, idx)}
                className={`otp-input ${!isMobileOtpValid && 'invalid'}`}
              />
            ))}
          </div>
          {!isMobileOtpValid && (
            <span className="error-message">{mobileErrorMessage}</span>
          )}
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

export default CkycrrVerifyModal;
