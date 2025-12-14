/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import '../../authentication/passwordSetup/PasswordSetupOtp.css';
// import { ReactComponent as CKYCRRLogo } from '../../../assets/ckycrr_sign_up_logo.svg';
// import { ReactComponent as BackArrowIcon } from '../../../assets/back_arrow.svg';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  sendOtp,
  setAuthToken,
  validateActivateToken,
} from '../slice/passSetupOtpSlice';
import { showLoader, hideLoader } from '../slice/loaderSlice';
import { jwtDecode } from 'jwt-decode';
import { maskEmail, maskMobile } from '../../../../utils/maskUtils';
import {
  resendOtpReq,
  validateOtpReq,
} from '../../../ui/Modal/slice/otpModalSlice';
import { toast } from 'react-toastify';

interface TokenPayload {
  email: string;
  mobileNumber: string;
}
interface ErrorDetail {
  field: string;
  issue: string;
}

interface ApiErrorResponse {
  data?: {
    data?: {
      errorMessage?: string;
      details?: ErrorDetail[];
      data?: unknown; // For the nested data you're logging
    };
  };
}
const PasswordsSetupOtp: React.FC = () => {
  const [mobileOtp, setMobileOtp] = useState(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(30);
  const [emailTimer, setEmailTimer] = useState(30);
  const [mobileResendCount, setMobileResendCount] = useState(0);
  const [emailResendCount, setEmailResendCount] = useState(0);
  const [emailId, setEmailId] = useState('');
  const [mobileNum, setMobileNum] = useState('');
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isMobileOtpValid, setIsMobileOtpValid] = useState<boolean>(true);
  const [isEmailOtpValid, setIsEmailOtpValid] = useState<boolean>(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState<string>('');
  const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [showAlreadySetupMessage, setShowAlreadySetupMessage] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // const location = useLocation();

  const otpIdentifier = useSelector(
    (state: RootState) => state.passSetupOtp.otpIdentifier
  );

  // Constants for resend limits
  const MAX_RESEND_ATTEMPTS = 2;

  // Check if resend limit reached
  const isMobileResendDisabled = mobileResendCount >= MAX_RESEND_ATTEMPTS;
  const isEmailResendDisabled = emailResendCount >= MAX_RESEND_ATTEMPTS;

  // Get resend timer based on attempt count
  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
  };

  const effectRan = useRef(false);

  // useEffect(() => {
  //   if (effectRan.current) return;
  //   effectRan.current = true;

  //   const queryParams = new URLSearchParams(window.location.search);
  //   const token = queryParams.get('token');
  //   if (token) {
  //     try {
  //       const decoded = jwtDecode<TokenPayload>(token);
  //       console.log('Decoded token:', decoded);
  //       dispatch(setAuthToken(token));

  //       setEmailId(decoded?.email);
  //       setMobileNum(decoded?.mobileNumber);

  //       if (decoded?.email) {
  //         setEmailId(decoded.email);
  //         dispatch(showLoader('Please Wait...'));
  //         console.log('Please Wait');
  //         console.log(
  //           'decoded.email_id',
  //           decoded.email,
  //           'decoded.mobile_no',
  //           decoded.mobileNumber
  //         );

  //         dispatch(
  //           sendOtp({
  //             emailId: decoded.email,
  //             mobileNo: decoded.mobileNumber,
  //             token: token,
  //           })
  //         )
  //           .unwrap()
  //           .then((res) => {
  //             console.log('OTP sent successfully', res);
  //           })
  //           .catch((err) => {
  //             console.error('OTP send failed', err);
  //           });
  //       }
  //     } catch (error) {
  //       console.error('Token decode failed', error);
  //     } finally {
  //       dispatch(hideLoader());
  //     }
  //   }
  // }, [dispatch]);

  // Timer
  // useEffect(() => {
  //   if (effectRan.current) return;
  //   effectRan.current = true;

  //   const queryParams = new URLSearchParams(window.location.search);
  //   const token = queryParams.get('token');
  //   if (token) {
  //     try {
  //       const decoded = jwtDecode<TokenPayload>(token);
  //       console.log('Decoded token:', decoded);
  //       dispatch(setAuthToken(token));

  //       setEmailId(decoded?.email);
  //       setMobileNum(decoded?.mobileNumber);

  //       if (decoded?.email) {
  //         setEmailId(decoded.email);

  //         // NEW: First validate the token before sending OTP
  //         dispatch(showLoader('Validating token...'));

  //         dispatch(validateActivateToken({ token }))
  //           .unwrap()
  //           .then((validationResponse) => {
  //             console.log('Token validation successful:', validationResponse);

  //             // If validation successful, proceed with existing OTP logic
  //             dispatch(showLoader('Please Wait...'));
  //             console.log('Please Wait');
  //             console.log(
  //               'decoded.email_id',
  //               decoded.email,
  //               'decoded.mobile_no',
  //               decoded.mobileNumber
  //             );

  //             return dispatch(
  //               sendOtp({
  //                 emailId: decoded.email,
  //                 mobileNo: decoded.mobileNumber,
  //                 token: token,
  //               })
  //             ).unwrap();
  //           })
  //           .then((res: any) => {
  //             console.log('OTP sent successfully', res);
  //             dispatch(hideLoader());
  //           })
  //           .catch((err: any) => {
  //             // Check if it's the "already setup" error
  //             const errorMessage = err?.data?.errorMessage;

  //             if (
  //               errorMessage ===
  //               'User already has completed the password and DSC setup'
  //             ) {
  //               console.log('User already completed setup');
  //               setShowAlreadySetupMessage(true);
  //               dispatch(hideLoader());
  //             } else {
  //               // Handle other errors (validation failed or OTP send failed)
  //               console.error('Token validation or OTP send failed', err);
  //               dispatch(hideLoader());
  //             }
  //           });
  //       } else {
  //         dispatch(hideLoader());
  //       }
  //     } catch (error) {
  //       console.error('Token decode failed', error);
  //       dispatch(hideLoader());
  //     }
  //   }
  // }, [dispatch]);
  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    setToken(token);

    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        console.log('Decoded token:', decoded);
        dispatch(setAuthToken(token));

        setEmailId(decoded?.email);
        setMobileNum(decoded?.mobileNumber);

        if (decoded?.email) {
          setEmailId(decoded.email);

          // Validate token separately (non-blocking)
          dispatch(validateActivateToken({ token }))
            .unwrap()
            .then((validationResponse: any) => {
              console.log('Token validation successful:', validationResponse);
            })
            .catch((validationErr: any) => {
              console.warn(
                'Token validation failed (non-blocking):',
                validationErr
              );
              // Log the validation failure but don't block the OTP flow
              if (validationErr?.status === 403) {
                console.warn(
                  'Token validation returned 403, but continuing with OTP flow'
                );
              }
            });

          // Send OTP regardless of token validation result
          dispatch(showLoader('Please Wait...'));
          console.log('Please Wait');
          console.log(
            'decoded.email_id',
            decoded.email,
            'decoded.mobile_no',
            decoded.mobileNumber
          );

          dispatch(
            sendOtp({
              emailId: decoded.email,
              mobileNo: decoded.mobileNumber,
              token: token,
            })
          )
            .unwrap()
            .then((res: any) => {
              console.log('OTP sent successfully', res);
              dispatch(hideLoader());
            })
            .catch((err: any) => {
              // Check if it's the "already setup" error
              const errorMessage = err?.data?.errorMessage;

              if (
                errorMessage ===
                'User already has completed the password and DSC setup'
              ) {
                console.log('User already completed setup');
                setShowAlreadySetupMessage(true);
                dispatch(hideLoader());
              } else {
                // Handle other errors (OTP send failed)
                console.error('OTP send failed', err);
                dispatch(hideLoader());
                // You might want to show an error message to the user here
                toast.error('Failed to send OTP. Please try again.');
              }
            });
        } else {
          dispatch(hideLoader());
        }
      } catch (error) {
        console.error('Token decode failed', error);
        dispatch(hideLoader());
        // Handle token decode failure
        toast.error('Invalid token. Please try again.');
      }
    }
  }, [dispatch]);

  useEffect(() => {
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
  }, []);

  const handleOtpChange = (
    index: number,
    value: string,
    type: 'mobile' | 'email'
  ) => {
    if (!/^\d*$/.test(value)) return;

    const otpArray = type === 'mobile' ? [...mobileOtp] : [...emailOtp];
    otpArray[index] = value;

    if (type === 'mobile') {
      setMobileOtp(otpArray);
      if (value && index < 5) {
        mobileOtpRefs.current[index + 1]?.focus();
      }
      if (!value && index > 0) {
        mobileOtpRefs.current[index - 1]?.focus();
      }
    } else {
      setEmailOtp(otpArray);
      if (value && index < 5) {
        emailOtpRefs.current[index + 1]?.focus();
      }
      if (!value && index > 0) {
        emailOtpRefs.current[index - 1]?.focus();
      }
    }
  };

  const resendOtp = async (type: 'EMAIL' | 'MOBILE') => {
    if (!otpIdentifier) {
      toast.error('Identifier not found');
      return;
    }

    // Check if resend limit reached
    const currentCount =
      type === 'MOBILE' ? mobileResendCount : emailResendCount;
    if (currentCount >= MAX_RESEND_ATTEMPTS) {
      console.log(
        `Maximum resend attempts (${MAX_RESEND_ATTEMPTS}) reached for ${type}`
      );
      return;
    }

    try {
      const res = await dispatch(
        resendOtpReq({
          identifier: otpIdentifier,
          type,
        })
      ).unwrap();

      // Update resend count and set new timer
      if (type === 'MOBILE') {
        const nextCount = mobileResendCount + 1;
        setMobileResendCount(nextCount);
        setMobileTimer(getResendTimer(nextCount));
      } else {
        const nextCount = emailResendCount + 1;
        setEmailResendCount(nextCount);
        setEmailTimer(getResendTimer(nextCount));
      }

      toast.success(res.message || 'OTP resent successfully');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to resend OTP';
      toast.error(message);
    }
  };

  const validateOtp = (otp: string[]) => {
    return otp.every((digit) => digit !== '');
  };

  const handleSubmit = async () => {
    const isMobileValid = validateOtp(mobileOtp);
    const isEmailValid = validateOtp(emailOtp);

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
      console.log('Enter ValidateOTPREQ');

      const result = await dispatch(
        validateOtpReq({
          identifier: otpIdentifier,
          mobileOtp: mobileOtpStr,
          emailOtp: emailOtpStr,
          signUpValidation: false,
        })
      ).unwrap();
      console.log('Enter ValidateOTPREQ2');
      toast.success(result?.data?.message || 'OTP verified successfully');
      navigate(
        `/re-set-new-password?token=${encodeURIComponent(token as string)}`
      );
    } catch (error: unknown) {
      console.error('OTP Validation Error:', error);

      const errorData = (error as ApiErrorResponse)?.data?.data;
      console.log(errorData?.data);

      const genericError =
        errorData?.errorMessage || 'OTP verification failed.';
      const details = errorData?.details || [];

      let mobileError = '';
      let emailError = '';

      details.forEach((detail) => {
        if (detail.field === 'mobileOtp') {
          mobileError = detail.issue;
          setMobileErrorMessage(mobileError || genericError);
          setIsMobileOtpValid(false);
        }
        if (detail.field === 'emailOtp') {
          emailError = detail.issue;
          setEmailErrorMessage(emailError || genericError);
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

  // const handleBack = () => {
  //   navigate(-1);
  // };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `0${minutes}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="password-setup-otp-container">
        <div className="password-setup-otp-card">
          {showAlreadySetupMessage ? (
            // Setup Already Complete Message
            <div className="setup-complete-message">
              <div className="setup-complete-icon">
                <svg
                  width="64"
                  height="64"
                  fill="none"
                  stroke="#10b981"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h2 className="setup-complete-title">Setup Already Complete</h2>
              <p className="setup-complete-text">
                User already has completed the password and DSC setup
              </p>
              <button
                onClick={() => navigate('/re-login')}
                className="setup-complete-button"
              >
                Go to Login
              </button>
            </div>
          ) : (
            // Original OTP Form Content
            <>
              <div className="header">
                {/* <button className="back-button" onClick={handleBack}>
            <BackArrowIcon
              className="back-icon"
              style={{ width: '72px', height: '72px' }}
            />
          </button> */}
                {/* <CKYCRRLogo className="logo" /> */}
              </div>

              <h2 style={{ marginRight: '250px', fontSize: '17px' }}>
                OTP Verification
              </h2>

              {/* Mobile OTP */}
              <div className="otp-section">
                <div className="otp-header">
                  <label htmlFor="mobile-otp" className="otp-label">
                    Mobile OTP <span className="required">*</span>
                  </label>
                  <div className="otp-timer">
                    <span>{formatTime(mobileTimer)}</span>
                    {mobileTimer === 0 && !isMobileResendDisabled && (
                      <button onClick={() => resendOtp('MOBILE')}>
                        Send again
                      </button>
                    )}
                    {mobileTimer === 0 && isMobileResendDisabled && <></>}
                  </div>
                </div>
                <div className="otp-input-group">
                  {mobileOtp.map((value, index) => (
                    <input
                      id="mobile-otp"
                      key={index}
                      type="text"
                      maxLength={1}
                      value={value}
                      ref={(el) => {
                        mobileOtpRefs.current[index] = el;
                      }}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value, 'mobile')
                      }
                      className={`otp-input ${!isMobileOtpValid && 'invalid'}`}
                    />
                  ))}
                </div>
                <div className="otp-info-row">
                  <span className="otp-info">
                    OTP Sent on {maskMobile(mobileNum)}
                  </span>
                  {!isMobileOtpValid && (
                    <span className="error-message">{mobileErrorMessage}</span>
                  )}
                </div>
              </div>

              {/* Email OTP */}
              <div className="otp-section">
                <div className="otp-header">
                  <label htmlFor="email-otp" className="otp-label">
                    Email OTP <span className="required">*</span>
                  </label>
                  <div className="otp-timer">
                    <span>{formatTime(emailTimer)}</span>
                    {emailTimer === 0 && !isEmailResendDisabled && (
                      <button onClick={() => resendOtp('EMAIL')}>
                        Send again
                      </button>
                    )}
                    {emailTimer === 0 && isEmailResendDisabled && <></>}
                  </div>
                </div>
                <div className="otp-input-group">
                  {emailOtp.map((value, index) => (
                    <input
                      id="email-otp"
                      key={index}
                      type="text"
                      maxLength={1}
                      value={value}
                      ref={(el) => {
                        emailOtpRefs.current[index] = el;
                      }}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value, 'email')
                      }
                      className={`otp-input ${!isEmailOtpValid && 'invalid'}`}
                    />
                  ))}
                </div>
                <div className="otp-info-row">
                  <span className="otp-info">
                    OTP Sent on {maskEmail(emailId)}
                  </span>
                  {!isEmailOtpValid && (
                    <span className="error-message">{emailErrorMessage}</span>
                  )}
                </div>
              </div>

              <button className="validate-button" onClick={handleSubmit}>
                Validate
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PasswordsSetupOtp;
