// import React, { useState } from "react";
// import "./ForgotUserID.css";
// import { ReactComponent as CKYCRRLogo } from "../../../assets/ckycrr_sign_up_logo.svg";
// import { ReactComponent as BackArrowIcon } from "../../../assets/back_arrow.svg";
// import { ReactComponent as RefreshIcon } from "../../../assets/refresh.svg";  // Replace with your SVG path
// import { ReactComponent as ListenIcon } from "../../../assets/sound.svg";    // Replace with your SVG path
// import SuccessModal from "./UserVerifiedSuccessfully";

// const ForgotUserID: React.FC = () => {
//     const [emailOrMobile, setEmailOrMobile] = useState<string>('');
//     const [captchaText, setCaptchaText] = useState<string>('');
//     const [captchaImage, setCaptchaImage] = useState<string>(generateCaptcha());
//     const [errorMessage, setErrorMessage] = useState<string>('');
//     const [isCaptchaValid, setIsCaptchaValid] = useState<boolean>(true);
//     const [showSuccessModal, setShowSuccessModal] = useState(false);

//     // Generate Captcha
//     function generateCaptcha() {
//         return Math.random().toString(36).substring(2, 7);
//     }

//     // Refresh Captcha
//     const handleRefreshCaptcha = () => {
//         setCaptchaImage(generateCaptcha());
//         setCaptchaText('');
//     };

//     // Listen to Captcha
//     const handleListenCaptcha = () => {
//         const utterance = new SpeechSynthesisUtterance(captchaImage);
//         utterance.rate = 0.9;
//         utterance.pitch = 1;
//         utterance.volume = 1;
//         speechSynthesis.speak(utterance);
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'emailOrMobile' | 'captcha') => {
//         if (type === 'emailOrMobile') setEmailOrMobile(e.target.value);
//         else setCaptchaText(e.target.value);
//     };

//     const handleSubmit = () => {
//         if (emailOrMobile.trim() === '' || captchaText.trim() === '') {
//             setErrorMessage('All fields are required');
//             setIsCaptchaValid(false);
//             return;
//         }

//         if (captchaText !== captchaImage) {
//             setErrorMessage('Captcha does not match');
//             setIsCaptchaValid(false);
//             return;
//         }

//         setErrorMessage('');
//         setIsCaptchaValid(true);
//         setShowSuccessModal(true);
//         //alert(`Validated: ${emailOrMobile}`);
//     };

//     const handleBack = () => {
//         console.log("Back button clicked");
//     };

//     return (
//         <div className="forgot-user-container">
//             <div className="forgot-user-card">
//                 <div className="header">
//                     <button className="back-button" onClick={handleBack}>
//                         <BackArrowIcon className="back-icon" style={{ width: "70px", height: "70px" }} />
//                     </button>
//                     <CKYCRRLogo className="logo" />
//                 </div>

//                 <h2>Forgot User ID?</h2>
//                 <p className="info-text">No worries, we will help you recover it.</p>

//                 <div className="input-group">
//                     <label>Email / Mobile Number</label>
//                     <input
//                         type="text"
//                         placeholder="Enter email / mobile number here"
//                         value={emailOrMobile}
//                         onChange={(e) => handleInputChange(e, 'emailOrMobile')}
//                     />
//                 </div>

//                          <div className="input-group">
//     <label>Captcha</label>
//     <div className="captcha-section">
//         <div className="captcha-image">{captchaImage}</div>
//         <button className="captcha-button" onClick={handleRefreshCaptcha}>
//             <RefreshIcon />
//         </button>
//         <button className="captcha-button" onClick={handleListenCaptcha}>
//             <ListenIcon />
//         </button>
//     </div>
//     <label>Enter Captcha</label>
//     <input
//         type="text"
//         className="input-field"
//         placeholder="Enter Captcha"
//         value={captchaText}
//         onChange={(e) => handleInputChange(e, 'captcha')}
//     />
// </div>

//                 {errorMessage && <p className="error-message">{errorMessage}</p>}

//                 <button className="submit-button" onClick={handleSubmit} disabled={!emailOrMobile || !captchaText}>
//                     Validate
//                 </button>
//             </div>

//             <SuccessModal
//                 isOpen={showSuccessModal}
//                 onClose={() => setShowSuccessModal(false)} onOkay={function (): void {
//                     throw new Error('Function not implemented.');
//                 } } title={function (): void {
//                     throw new Error('Function not implemented.');
//                 } }      />
//         </div>
//     );
// };

// export default ForgotUserID;

/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import './ForgotUserID.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  clearForgotuserIdError,
  forgotUserId,
  verifyUser,
  sendForgotUserId,
  clearVerifyUserError,
  clearSendForgotUserIdError,
} from '../slice/authSlice';
import { toast } from 'react-toastify';
import SuccessModal from './UserVerifiedSuccessfully';
import { ReactComponent as CKYCRRLogo } from '../../../../assets/ckycrr_sign_up_logo.svg';
import { ReactComponent as BackArrowIcon } from '../../../../assets/back_arrow.svg';
import { ReactComponent as RefreshIcon } from '../../../../assets/refresh.svg';
import { ReactComponent as ListenIcon } from '../../../../assets/sound.svg';
import signupbg from '../../../../assets/sign_up_bg.svg';
import { getIdentifierType } from '../../../../utils/validation';
import { showLoader, hideLoader } from '../slice/loaderSlice';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordInputField from '../../../../component/ui/Input/forgotPasswordInputField';
import {
  Box,
  Button,
  Typography,
  Link,
  FormLabel,
  CSSProperties,
} from '@mui/material';

const fiCode = [
  { code: '001', name: 'ABC' },
  { code: '002', name: 'DEF' },
  { code: '003', name: 'GHI' },
];

const ForgotUserID: React.FC = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [fiCode, setFICode] = useState('');
  const [emailMobileError, setEmailMobileError] = useState('');
  const [fiCodeError, setFiCodeError] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [isEmailMobileValid, setIsEmailMobileValid] = useState(false);
  const [isUserVerificationStep, setIsUserVerificationStep] = useState(true);
  const [canProceedToValidate, setCanProceedToValidate] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaImage, setCaptchaImage] = useState(generateCaptcha());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [captchaCharStyles, setCaptchaCharStyles] = useState<CSSProperties[]>(
    []
  );
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    loading,
    forgotUserIderror,
    verifyUserLoading,
    verifyUserError,
    isUserVerified,
    sendForgotUserIdLoading,
    sendForgotUserIdError,
    forgotUserIdResponse,
  } = useSelector((state: RootState) => state.auth);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
  };

  const validateRegex = (captcha: string) => {
    const regex = /^[a-z0-9]{5}$/;
    return regex.test(captcha);
  };

  function generateCaptcha() {
    return Math.random().toString(36).substring(2, 7);
  }
  const handleEmailOrMobileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setEmailOrMobile(value);

    // Reset verification states when email changes
    setCanProceedToValidate(false);
    dispatch(clearVerifyUserError());

    if (value.trim() === '') {
      setEmailMobileError('Email ID is required');
      setIsEmailMobileValid(false);
    } else if (!validateEmail(value) && !validateMobile(value)) {
      setEmailMobileError('Enter a valid Email ID');
      setIsEmailMobileValid(false);
    } else {
      setEmailMobileError('');
      setIsEmailMobileValid(true);
      // Automatically verify user when valid email is entered
      handleVerifyUser(value);
    }
  };

  // Step 1: Verify if user exists
  const handleVerifyUser = async (email: string) => {
    try {
      const result = await dispatch(verifyUser({ userId: email }));
      if (verifyUser.fulfilled.match(result)) {
        if (result.payload.success) {
          setCanProceedToValidate(true);
          setEmailMobileError('');
        } else {
          setCanProceedToValidate(false);
          setEmailMobileError(
            'Email does not exist. Enter valid Email/ Mobile Number'
          );
        }
      }
    } catch (error) {
      setCanProceedToValidate(false);
      setEmailMobileError(
        'Email does not exist. Enter valid Email/ Mobile Number'
      );
    }
  };
  const handleFICode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFICode(value);

    if (value.trim() === '') {
      setFiCodeError('FI Code is required');
    } else {
      setFiCodeError('');
    }
  };
  const handleRefreshCaptcha = () => {
    setCaptchaImage(generateCaptcha());
    setCaptchaText('');
  };

  const handleListenCaptcha = () => {
    const utterance = new SpeechSynthesisUtterance(captchaImage);
    speechSynthesis.speak(utterance);
  };

  const handleCaptchaText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaptchaText(value);
    console.log('captchaImage', captchaImage);
    setCaptchaError('');
  };

  useEffect(() => {
    dispatch(clearForgotuserIdError());
  }, [dispatch]);
  useEffect(() => {
    const newStyles = captchaImage.split('').map((char, index) => ({
      display: 'inline-block',
      transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (Math.random() * 10 + 5)}deg) translateY(${(index % 2 === 0 ? 1 : -1) * 2}px)`,
      margin: '0 2px',
    }));
    setCaptchaCharStyles(newStyles);
  }, [captchaImage]);
  const handleBack = () => {
    navigate(-1);
  };
  console.log('captchaText', captchaText);
  // Step 2: Send forgot userId request (only called after user verification)
  const handleSubmit = async () => {
    if (fiCode.trim() === '') {
      setFiCodeError('FI Code is required');
      return;
    }
    if (captchaText.trim() === '') {
      setCaptchaError('Captcha is required');
      handleRefreshCaptcha(); // Refresh captcha on validation failure
      return;
    } else if (!validateRegex(captchaText)) {
      setCaptchaError(
        'The CAPTCHA verification failed. Please enter the new CAPTCHA to proceed.'
      );
      handleRefreshCaptcha(); // Refresh captcha on validation failure
      return;
    }
    if (!emailOrMobile.trim() || !captchaText.trim() || !fiCode.trim()) {
      toast.error('All fields are required');
      handleRefreshCaptcha(); // Refresh captcha on validation failure
      return;
    }

    if (captchaText !== captchaImage) {
      setCaptchaError('Captcha does not match');
      handleRefreshCaptcha(); // Refresh captcha on validation failure
      return;
    }

    if (!canProceedToValidate) {
      toast.error('Please verify your email address first');
      return;
    }

    dispatch(showLoader('Sending User ID...'));
    try {
      const result = await dispatch(
        sendForgotUserId({ email: emailOrMobile, fiCode })
      );
      if (sendForgotUserId.fulfilled.match(result)) {
        console.log('Forgot UserId sent successfully:', result.payload);
        // Close modal and redirect to login page
        setShowSuccessModal(true);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send User ID';
      toast.error(errorMessage);
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <Box
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      sx={{
        minHeight: '100vh',
        background: `url(${signupbg}) no-repeat 50%/cover`,
        padding: '15px',
      }}
      // className="forgot-user-container"
    >
      <Box
        sx={{
          background: 'white',
          padding: '40px 72px',
          borderRadius: '12px',
          width: '520px',
          maxWidth: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px',
          textAlign: 'center',
          '@media (max-width:768px)': {
            padding: '40px 20px',
          },
        }}
        // className="forgot-user-card"
      >
        <Box
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          position={'relative'}
          // className="header"
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleBack}
            sx={{
              position: 'absolute',
              left: 0,
              padding: '0',
              background: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none', // shadow on hover
              },
            }}
          >
            <BackArrowIcon
              className="back-icon"
              style={{ width: '70px', height: '70px' }}
            />
          </Button>
          {/* <button className="back-button" onClick={handleBack}>
            <BackArrowIcon
              className="back-icon"
              style={{ width: '70px', height: '70px' }}
            />
          </button> */}
          <CKYCRRLogo className="logo" />
        </Box>

        {/* <h2>Forgot User ID?</h2> */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'inherit',
            // fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#000000',
          }}
        >
          Forgot User ID?
        </Typography>
        {/* <p className="info-text">No worries, we will help you recover it.</p> */}
        {/* <Typography
          // variant="subtitle1"
          sx={{
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '400',
            marginTop: '5px',
            color: '#000',
          }}
        >
          No worries, we will help you recover it.
        </Typography> */}
        {/* {forgotUserIderror && (
          <p className="error">
            <CancelOutlinedIcon fontSize="small" /> {forgotUserIderror}
          </p>
        )} */}
        <Box sx={{ textAlign: 'left', marginBottom: '15px' }}>
          <ForgotPasswordInputField
            label="Email"
            type="text"
            name="enterOrMobile"
            placeholder="Enter your Email ID"
            value={emailOrMobile}
            onChange={handleEmailOrMobileChange}
            error={emailMobileError}
            width={'100%'}
          />
        </Box>

        {/* <div className="input-group">
          <label htmlFor="email-mobile">Email / Mobile Number</label>
          <input
            id="email-mobile"
            type="text"
            placeholder="Enter email / mobile number"
            value={emailOrMobile}
            onChange={handleEmailOrMobileChange}
          />
          {emailMobileError && (
            <p className="error-message">{emailMobileError}</p>
          )}
        </div> */}

        <Box sx={{ textAlign: 'left', marginBottom: '15px' }}>
          <ForgotPasswordInputField
            label="FI Code"
            type="text"
            name="ficode"
            placeholder="Enter FI Code"
            value={fiCode}
            onChange={handleFICode}
            error={fiCodeError}
            required={true}
          />
        </Box>

        {/* <div className="input-group">
          <label htmlFor="email-mobile">FI Code</label>
          <input
            id="email-mobile"
            type="text"
            placeholder="Enter email / mobile number"
            value={emailOrMobile}
            onChange={handleEmailOrMobileChange}
          />
          <select>
            <option value="">Enter email / mobile no here</option>
            <option>ABC</option>
            <option>DEF</option>
            <option>GHI</option>
          </select>
          {emailMobileError && (
            <p className="error-message">{emailMobileError}</p>
          )}
        </div> */}

        <Box sx={{ textAlign: 'left', marginBottom: '15px' }}>
          <FormLabel
            htmlFor="captcha-label"
            sx={{
              color: '#000',
              display: 'block',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: '400',
              textAlign: 'left',
              marginBottom: '5px',
            }}
          >
            Captcha
          </FormLabel>
          {/* <label htmlFor="captcha-label">Captcha</label> */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              marginBottom: '15px',
            }}
            // className="captcha-section"
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                fontWeight: 'bold',
                fontSize: '22px',
                letterSpacing: '4px',
                borderRadius: '8px',
                height: '45px' /* Match button height */,
                padding: '0 15px',
                border: '1px solid #ddd',
                flex: 1 /* Takes remaining space */,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minWidth: 0 /* Allows flex item to shrink */,
                color: '#333',
                userSelect: 'none' /* Prevent text selection */,
                fontFamily: 'Courier New, monospace',
                fontStyle: 'italic',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                transform: 'skewX(-5deg)',
                '& > *': {
                  display: 'inline-block',
                  transform: 'rotate(-2deg) skewY(2deg)',
                },
              }}
              className="captcha-image"
            >
              {captchaImage.split('').map((char, index) => (
                <span key={index} style={captchaCharStyles[index]}>
                  {char}
                </span>
              ))}
            </Box>
            <Button
              variant="contained"
              // color="primary"
              onClick={handleListenCaptcha}
              sx={{
                border: '1px solid #ddd',
                padding: '10px',
                background: 'none',
                boxShadow: 'none',
                minWidth: 0,
                cursor: 'pointer',
                width: '45px' /* Fixed width for icons */,
                height: '45px' /* Fixed height for icons */,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: '0' /* Prevent buttons from shrinking */,
                justifyContent: 'center',
                '&:hover': {
                  background: '#f0f0f0',
                  boxShadow: 'none', // shadow on hover
                },
              }}
            >
              <ListenIcon />
            </Button>
            {/* <button className="captcha-button" onClick={handleListenCaptcha}>
              <ListenIcon />
            </button> */}
            <Button
              variant="contained"
              // color="primary"
              onClick={handleRefreshCaptcha}
              sx={{
                border: '1px solid #ddd',
                padding: '10px',
                background: 'none',
                boxShadow: 'none',
                minWidth: 0,
                fontFamily: 'inherit',
                cursor: 'pointer',
                width: '45px' /* Fixed width for icons */,
                height: '45px' /* Fixed height for icons */,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: '0' /* Prevent buttons from shrinking */,
                justifyContent: 'center',
                '&:hover': {
                  background: '#f0f0f0',
                  boxShadow: 'none', // shadow on hover
                },
              }}
            >
              <RefreshIcon />
            </Button>
            {/* <button className="captcha-button" onClick={handleRefreshCaptcha}>
              <RefreshIcon />
            </button> */}
          </Box>
          <ForgotPasswordInputField
            label="Enter Captcha"
            type="text"
            name="enterCaptcha"
            placeholder="Enter captch from image"
            value={captchaText}
            onChange={handleCaptchaText}
            error={captchaError}
            // width={'80%'}
          />
          {/* <label htmlFor="captcha-enter">Enter Captcha</label>
          <input
            id="captcha-enter"
            type="text"
            className="input-field"
            placeholder="Enter Captcha"
            value={captchaText}
            onChange={(e) => setCaptchaText(e.target.value)}
          /> */}
        </Box>

        {/* <div className="input-group">
          <label htmlFor="captcha-label">Captcha</label>
          <div className="captcha-section">
            <div className="captcha-image">{captchaImage}</div>
            <button className="captcha-button" onClick={handleRefreshCaptcha}>
              <RefreshIcon />
            </button>
            <button className="captcha-button" onClick={handleListenCaptcha}>
              <ListenIcon />
            </button>
          </div>
          <label htmlFor="captcha-enter">Enter Captcha</label>
          <input
            id="captcha-enter"
            type="text"
            className="input-field"
            placeholder="Enter Captcha"
            value={captchaText}
            onChange={(e) => setCaptchaText(e.target.value)}
          />
        </div> */}
        {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}
        <Button
          onClick={handleSubmit}
          disabled={
            sendForgotUserIdLoading ||
            verifyUserLoading ||
            !canProceedToValidate ||
            !captchaText
          }
          sx={{
            backgroundColor: '#002cba',
            color: 'white',
            padding: '12px 20px',
            fontFamily: 'inherit',
            fontWeight: 'normal',
            fontSize: '16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            height: '45px',
            maxWidth: '150px',
            width: '100%',
            marginTop: '15px',
            textTransform: 'none',
            lineHeight: 'inherit',
            transition: 'background 0.3s',
            '&:hover': {
              backgroundColor: '#002cba !important',
              // boxShadow: 'none', // shadow on hover
            },
            '&.Mui-disabled': {
              pointerEvents: 'auto',
              backgroundColor: '#cccccc', // custom disabled background
              color: '#fff', // custom disabled text color
              cursor: 'not-allowed',
            },
          }}
        >
          {sendForgotUserIdLoading
            ? 'Sending...'
            : verifyUserLoading
              ? 'Verifying...'
              : 'Validate'}
        </Button>

        {/* Display API Error Message below Validate button */}
        {apiErrorMessage && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Gilroy', sans-serif",
              color: 'red',
              fontSize: '12px',
              marginTop: '10px',
              textAlign: 'center',
              fontWeight: 'normal',
            }}
          >
            {apiErrorMessage}
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{
            fontFamily: "'Gilroy', sans-serif",
            letterSpacing: 0,
            textAlign: 'center',
            fontSize: '12px',
            color: '#1D1D1B',
            marginTop: '15px',
            fontWeight: '400',
          }}
          // className="register-link"
        >
          Not registered yet on CKYCRR? Click
          <Link
            href="re-signup"
            sx={{
              color: '#002CBA',
              textDecoration: 'none',
              fontWeight: '400',
              fontSize: '12px',
              marginLeft: '5px',
            }}
            underline="hover"
          >
            Register Now
          </Link>
        </Typography>

        {/* <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading || !isEmailMobileValid || !captchaText}
          {loading ? 'Validating...' : 'Validate'}
          >
        </button> */}
      </Box>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/login');
        }}
        onOkay={() => {
          setShowSuccessModal(false);
          navigate('/login');
        }}
        title={() =>
          forgotUserIdResponse?.message ||
          'User ID has been sent to your registered email and mobile'
        }
      />
    </Box>
  );
};

export default ForgotUserID;
