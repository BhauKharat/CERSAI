/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
// import './ForgotPassword.css';
import { ReactComponent as CKYCRRLogo } from '../../../../assets/ckycrr_sign_up_logo.svg';
import { ReactComponent as BackArrowIcon } from '../../../../assets/back_arrow.svg';
import signupbg from '../../../../assets/sign_up_bg.svg';
import SuccessModal from './OtpSentModal';
import ForgotPassOtp from './ForgotPassOtp';
import { useNavigate } from 'react-router-dom';
import { clearForgotPasswordError, forgotPassword } from '../slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';
import { showLoader, hideLoader } from '../slice/loaderSlice';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ForgotPasswordInputField from '../../../../component/ui/Input/forgotPasswordInputField';
import { Box, Typography, Link, Button } from '@mui/material';
import OTPVerificationModal from '../../../ui/Modal/OTPVerificationModal';

interface ApiError {
  data?: {
    errorMessage?: string;
  };
  error?: {
    status?: number;
    code?: string;
    type?: string;
    message?: string;
  };
}

interface OtpSentResponse {
  mobile: string | null;
  email: string | null;
}

const ForgotPassword: React.FC<{ reg?: boolean }> = ({ reg }) => {
  const [userID, setUserID] = useState('');
  const [inputError, setInputError] = useState('');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [isForgotPassOtpOpen, setIsForgotPassOtpOpen] = useState(false);
  const [optSentResponse, setOtpSentResponse] =
    useState<OtpSentResponse | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const { forgotPassworderror, otpIdentifier } = useSelector(
    (state: RootState) => state.auth
  );

  const handleBack = () => {
    navigate(-1); // go back to previous page
  };
  const handleUserIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserID(value);

    // TODO: Uncomment email validation when required
    if (value.trim() === '') {
      setInputError(''); // Clear error if empty
    } else if (!validateEmail(value)) {
      setInputError(`${reg ? 'Email Id' : 'User ID'} format is not valid`);
    } else {
      setInputError('');
    }

    // Temporary: Accept any text for testing
    setInputError('');
  };
  const handleSendOtp = async () => {
    if (userID.trim() === '') {
      toast.error(`Please enter your ${reg ? 'Email Id' : 'User ID'}`);
      return;
    }

    setInputError('');
    dispatch(showLoader('Please Wait...'));
    setApiErrorMessage(''); // Clear previous errors

    const result = await dispatch(forgotPassword({ userId: userID }));
    dispatch(hideLoader());
    if (forgotPassword.fulfilled.match(result)) {
      setOtpSentResponse({
        mobile: result.payload?.data?.maskedMobile ?? null,
        email: userID, //result.payload?.data?.maskedEmail
      });
      setIsModalOpen(true);
    } else if (forgotPassword.rejected.match(result)) {
      const errorCode = result?.payload || result?.error?.message;
      const errorMessage = result?.payload || result?.error?.message;

      if (
        errorCode === 'ERR_RE_IN_001' ||
        errorMessage?.includes('User not found')
      ) {
        setInputError(
          `User does not exists. Enter a valid ${reg ? 'Email Id' : 'User ID'}.`
        );
      } else {
        setInputError(errorMessage || 'Failed to send OTP. Please try again.');
      }
    }
  };

  useEffect(() => {
    dispatch(clearForgotPasswordError());
  }, [dispatch]);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsForgotPassOtpOpen(true); // Show OTP input
  };

  const handleCloseForgotPassOtp = () => {
    setIsForgotPassOtpOpen(false);
  };

  const handleOtpSubmit = () => {
    setIsForgotPassOtpOpen(false);
    navigate(`/re-set-forget-new-password/${userID}`);
  };

  return (
    <Box
      // className="forgot-pass-container"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      sx={{
        height: '100vh',
        background: `url(${signupbg}) no-repeat 50%/cover`,
      }}
    >
      <Box
        // className="forgot-pass-card"
        sx={{
          backgroundColor: '#fff',
          padding: '32px 24px',
          borderRadius: '16px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          textAlign: 'center',
          position: 'relative',
          backdropFilter: 'blur(15px)',
          marginBottom: '180px',
        }}
      >
        <Box
          // className="forgot-pass-header"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          position={'relative'}
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
              // className="back-icon"
              style={{ width: '70px', height: '70px' }}
            />
          </Button>
          {/* <button className="forgot-pass-back-btn" onClick={handleBack}>
            <BackArrowIcon
              className="back-icon"
              style={{ width: '70px', height: '70px' }}
            />
          </button> */}
          <CKYCRRLogo
            // className="forgot-pass-logo"
            style={{ width: '150px', margin: '0 auto' }}
          />
        </Box>

        {/* <h2 className="forgot-pass-heading">Forgot Password?</h2> */}
        <Typography
          // variant="body2"
          sx={{
            fontFamily: 'inherit',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#000000',
          }}
        >
          Forgot Password?
        </Typography>
        {/* <p className="forgot-pass-info">
          No worries, We will send you reset instructions
        </p> */}

        {/* {forgotPassworderror && (
          <Box
            display={'flex'}
            justifyContent={'flex-start'}
            sx={{
              paddingLeft: '80px'
            }}
          >
            <Typography
              display={'flex'}
              alignItems={'center'}
              sx={{
                backgroundColor: '#FFDFDF',
                color: '#FF0808',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '400',
                width: '300px',
              }}
            >
              <CancelOutlinedIcon fontSize="small" /> {forgotPassworderror}
            </Typography>
          </Box>
        )} */}
        <Box
          // className="forgot-pass-input-group"
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          sx={{
            marginBottom: '16px',
          }}
        >
          <ForgotPasswordInputField
            label={reg ? 'Email Id' : 'User ID'}
            type="text"
            name="userId"
            placeholder={reg ? 'Enter Email Id' : 'Enter User ID'}
            value={userID}
            onChange={handleUserIDChange}
            error={inputError}
            width={'80%'}
          />
          {/* <label htmlFor="user-id" className="forgot-pass-label">
            User ID
          </label>
          <input
            id="user-id"
            type="text"
            className={`forgot-pass-input ${inputError ? 'input-error' : ''}`}
            placeholder="Enter User ID"
            value={userID}
            onChange={handleUserIDChange}
          />
          {inputError && (
            <Box
              // sx={{
              //   color: 'red',
              //   fontSize: '12px',
              //   marginTop: '5px',
              //   paddingLeft: '9%',
              // }}
              className="error-message"
            >
              {inputError}
            </Box>
          )} */}
          <Link
            href="re-forgot-user-id"
            underline="none"
            sx={{
              width: '80%' /* same width as input */,
              fontSize: '12px',
              color: '#002CBA',
              textDecoration: 'none',
              marginTop: '8px',
              textAlign: 'right' /* right align the link */,
              display: 'block',
              cursor: 'pointer',
            }}
          >
            {reg ? null : 'Forgot User ID?'}
          </Link>
          {/* <a href="/re-forgot-user-id" className="forgot-pass-link">
            Forgot User ID?
          </a> */}
        </Box>

        {/* <button
          className="forgot-pass-otp-btn"
          onClick={handleSendOtp}
          disabled={!userID.trim() || !!inputError || loading}
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button> */}
        <Button
          onClick={handleSendOtp}
          disabled={!userID.trim() || !!inputError || loading}
          sx={{
            padding: '12px',
            marginTop: '10px',
            background: '#002CBA',
            color: '#fff',
            width: '50%',
            fontSize: '16px',
            fontWeight: '400',
            boxShadow: 'none',
            borderRadius: '8px',
            textTransform: 'none',
            lineHeight: 'inherit',
            fontFamily: "'Gilroy', sans-serif",
            transition: 'background-color 0.3s',
            '&:hover': {
              boxShadow: 'none', // shadow on hover
            },
            '&.Mui-disabled': {
              backgroundColor: '#ddd', // custom disabled background
              color: '#fff', // custom disabled text color
              cursor: 'not-allowed',
            },
          }}
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </Button>

        {/* Display API Error Message below Send OTP button */}
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
      </Box>

      <SuccessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOkay={handleCloseModal}
        title={() => <span>OTP Sent</span>}
      />

      <ForgotPassOtp
        isOpen={isForgotPassOtpOpen}
        onClose={handleCloseForgotPassOtp}
        onOtpSubmit={handleOtpSubmit}
        data={{
          email: optSentResponse?.email ?? null,
          mobile: optSentResponse?.mobile ?? null,
        }}
      />

      <OTPVerificationModal
        open={isForgotPassOtpOpen}
        data={otpIdentifier ?? ''}
        onClose={handleCloseForgotPassOtp}
        onSuccess={handleOtpSubmit}
        maskedMobile={optSentResponse?.mobile ?? ''}
        maskedEmail={optSentResponse?.email ?? ''}
        otpType="both"
        forceAdminEndpoint={true}
        // maskedCountryCode={formik.values.countryCode as string}
      />
    </Box>
  );
};

export default ForgotPassword;
