/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
// import ArrowUpwardSharpIcon from '@mui/icons-material/ArrowUpwardSharp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  clearForgotuserIdError,
  loginUser,
  verifyDsc,
  reinitializeApplication,
  clearReinitializeError,
  clearverifyDscerror,
  // resetAuth,
  clearLoginError,
} from '../../redux/slices/registerSlice/authSlice';
import { clearDscMessage } from '../../redux/slices/registerSlice/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { showLoader, hideLoader } from '../../redux/slices/loader/loaderSlice';
import { useDispatch, useSelector } from 'react-redux';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import thumbnail from '../../assets/thumbnail.png';
// import { toast } from 'react-toastify';
import closeEye from 'assets/closeEye.svg';
import UploadIconButton from 'assets/UploadIconButton.svg';

interface ExtendedFile extends File {
  base64?: string;
}

const RELoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState('');
  // const [loginMessage] = useState('');

  const [dscFile, setDscFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [isValidPreview, setIsValidPreview] = useState<boolean | null>(null);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  const {
    loading,
    errorLogin,
    // authToken,
    success,
    dscVerificationMessage,
    reinitializeLoading,
    reinitializeError,
    reinitializeData,
    verifyDscerror,
    userDetails,
  } = useSelector((state: RootState) => state.auth);

  // const isLoggedIn = !!authToken;
  const isLoggedIn = !!success;
  console.log(isLoggedIn, 'isLoogedIn');
  console.log(isLoginSuccess, 'isLoginSuccess');

  const isLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*_\-+=]/.test(password);
  const hasNoSpaces = !/\s/.test(password);

  const passwordRules = [
    {
      label: 'At least 8–16 characters.',
      isValid: isLengthValid,
    },
    {
      label: 'At least one uppercase letter (A–Z)',
      isValid: hasUppercase,
    },
    {
      label: 'At least one lowercase letter (a–z)',
      isValid: hasLowercase,
    },
    {
      label: 'At least one numeric digit (0–9)',
      isValid: hasNumber,
    },
    {
      label: 'At least one special character (!@#$%^&*_-+=)',
      isValid: hasSpecialChar,
    },
    {
      label: 'No spaces allowed',
      isValid: hasNoSpaces,
    },
  ];
  const isPasswordValid = passwordRules.every((rule) => rule.isValid);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDscFile(null);
    setIsLoginSuccess(false);
    try {
      dispatch(showLoader('Please Wait...'));
      const resultAction = await dispatch(
        loginUser({ username: email, password })
      );
      if (loginUser.fulfilled.match(resultAction)) {
        setIsLoginSuccess(true); // ✅ Mark login as successful

        sessionStorage.setItem('fromLogin', 'true');
      }
    } catch (error) {
      console.error(error, 'Error');
      dispatch(hideLoader());
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    dispatch(clearForgotuserIdError());
  }, [dispatch]);

  // Handle DSC verification success and trigger reinitialize
  useEffect(() => {
    if (dscVerificationMessage) {
      console.log('DSC Verified!');
      dispatch(clearDscMessage());
      if (userDetails?.approved === true) {
        //   dispatch(hideLoader());
        //   setIsLoginSuccess(false);
        //   setLoginMessage('User is verify please login');
        //   // toast.error('User is fully verify, please login');
        //   dispatch(resetAuth());
        //   navigate('/re-login');
        //   setDscFile(null);
        navigate('/re-form-preview');
      }

      // Automatically call reinitialize after DSC verification success
      dispatch(showLoader('Initializing application...'));
      dispatch(reinitializeApplication());
    }
  }, [
    dscVerificationMessage,
    dispatch,
    userDetails?.role,
    navigate,
    userDetails?.approved,
  ]);

  // Handle reinitialize success/error
  useEffect(() => {
    console.log('reinitializeData UserEffect====', reinitializeData);
    if (reinitializeData) {
      setIsLoginSuccess(false);
      dispatch(hideLoader());
      if (userDetails?.approved === true) {
        // setIsLoginSuccess(false);
        // toast.error('User is fully verify, please login');
        // navigate('/re-login');
        // dispatch(resetAuth());
        // setDscFile(null);
        navigate('/re-form-preview');
        // return;
      }
      // if (
      //   reinitializeData?.pendingSections.length == 0 &&
      //   reinitializeData?.approvalStatus === 'APPROVED'
      // ) {
      //   // if (userDetails?.role === 'cersai') {
      //   //   navigate('/ckycrr-admin/dashboard');
      //   // } else {
      //   //   navigate('/re/dashboard');
      //   // }
      //   // navigate('/re/kyc/search');
      //   dispatch(resetAuth());
      //   setIsLoginSuccess(false);
      //   setLoginMessage('User is verify please login');
      //   setDscFile(null);
      // } else {
      navigate('/re-register');
      // }
    } else {
      setIsLoginSuccess(false);
      setDscFile(null);
    }
  }, [reinitializeData, navigate, dispatch, userDetails]);

  useEffect(() => {
    console.log('reinitializeError---', reinitializeError);
    if (reinitializeError) {
      dispatch(hideLoader());
    }
  }, [reinitializeError, dispatch]);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearReinitializeError()); // You'll need to create this action
    dispatch(clearverifyDscerror());
    dispatch(clearLoginError());
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDscFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPreviewData(reader.result as string);
        (file as ExtendedFile).base64 = base64String;

        // Show green tick immediately after successful upload
        setIsValidPreview(true);
      };
      reader.readAsDataURL(file);

      console.log('DSC Document uploaded. Click Validate.');
    }
  };

  const handleValidate = async () => {
    if (!dscFile) {
      console.log('Please upload DSC document first.');
      return;
    }

    dispatch(showLoader('Verifying DSC...'));

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        console.log('FileReader finished reading');

        const base64String = (reader.result as string).split(',')[1];
        console.log('Base64 starts with:', base64String?.slice(0, 30));
        // const base64String = (reader.result as string).split(',')[1];
        const result = await dispatch(
          verifyDsc({ dscCertificate: base64String, username: email, password })
        );
        console.log('Result in handleValidate in loginForm:', result);
        if (verifyDsc.fulfilled.match(result)) {
          console.log('DSC verification successful');
          // Keep the green tick since validation passed
          setIsValidPreview(true);
          setIsLoginSuccess(false);
        } else {
          // Show red cross if validation fails
          setIsValidPreview(false);
          setIsLoginSuccess(false);
        }
      };
      reader.readAsDataURL(dscFile);
    } catch (err) {
      // Show red cross if validation fails
      setIsValidPreview(false);
      console.log(err);
      dispatch(hideLoader());
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <form className="login-form " onSubmit={handleLogin}>
      {errorLogin && (
        <p className="error">
          <CancelOutlinedIcon /> {errorLogin}
        </p>
      )}
      {/* {loginMessage !== '' && (
        <p className="error">
          <CancelOutlinedIcon /> {loginMessage}
        </p>
      )} */}
      {reinitializeError && (
        <p className="error">
          <CancelOutlinedIcon /> Initialization Error: {reinitializeError}
        </p>
      )}
      {verifyDscerror && (
        <p className="error">
          <CancelOutlinedIcon /> {verifyDscerror}
        </p>
      )}

      <div className="form-grou">
        <label htmlFor="email-id">User ID</label> <br />
        <input
          id="email-id"
          type="email"
          value={email}
          className="border border-gray-300 rounded w-full p-2"
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);

            const isFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isLengthValid = value.length <= 255;
            const isValid = isFormatValid && isLengthValid;
            setIsEmailValid(isValid || value === '');
            setEmailError(
              !value
                ? ''
                : !isLengthValid
                  ? 'Email cannot exceed 255 characters'
                  : !isFormatValid
                    ? 'Email is not valid'
                    : ''
            );
          }}
          placeholder="Enter Email ID"
          style={{
            fontFamily: 'Gilroy',
            border: !isEmailValid && email ? '1px solid red' : '',
            outline: 'none',
          }}
          required
          disabled={isLoginSuccess}
        />
        {/* <input
          type="email"
          value={email}
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);
 
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            setIsEmailValid(isValid || value === '');
            setEmailError(!isValid && value ? 'Email is not valid' : '');
          }}
          placeholder="Enter Email ID"
          style={{
            fontFamily: 'Gilroy',
            border: !isEmailValid && email ? '1px solid red' : '',
            outline: 'none'
          }}
          required
          disabled={isLoginSuccess}
        /> */}
        {emailError && (
          <div
            style={{
              color: 'red',
              fontSize: '13px',
              marginTop: '4px',
              textAlign: 'left',
            }}
          >
            {emailError}
          </div>
        )}
        <Link to="/re-forgot-user-id" className="link">
          Forgot User ID?
        </Link>
      </div>

      <div className="form-">
        <div className="password-label-container">
          <span className="password-text">Password</span>
          <div className="tooltip-icon">
            <span className="info-icon">
              <ErrorOutlineIcon />
            </span>
            <div className="tooltip-box">
              <strong>Password must meet the following criteria:</strong>
              <ul className="tooltip-list">
                {passwordRules.map((rule, index) => (
                  <li
                    key={index}
                    style={{
                      color: rule.isValid ? '#51AE32' : '#FF0808',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {rule.isValid ? (
                      <CheckCircleOutlineRoundedIcon
                        fontSize="small"
                        className="check-icon"
                        style={{ color: '#51AE32' }}
                      />
                    ) : (
                      <CancelOutlinedIcon
                        fontSize="small"
                        className="check-icon"
                        style={{ color: '#FF0808' }}
                      />
                    )}
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="password-wrapper">
          <input
            className="border border-gray-300 rounded w-full p-2"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            style={{ fontFamily: 'Gilroy' }}
            maxLength={16}
            required
            disabled={isLoginSuccess}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <VisibilityOutlinedIcon /> // open eye
            ) : (
              <img src={closeEye} alt="Show password" className="w-5 h-5" /> // closed eye
            )}
          </button>
        </div>

        <Link to="/re-forgot-password" className="link">
          Forgot Password?
        </Link>
      </div>

      {!isLoginSuccess && (
        <button
          type="submit"
          className="login-btn"
          disabled={
            loading ||
            reinitializeLoading ||
            isLoginSuccess ||
            !email.trim() ||
            !password.trim() ||
            !isEmailValid ||
            !isPasswordValid
          }
          style={{
            backgroundColor:
              loading ||
              reinitializeLoading ||
              isLoginSuccess ||
              !email.trim() ||
              !password.trim() ||
              !isEmailValid ||
              !isPasswordValid
                ? '#CCCCCC'
                : '',
            color:
              loading ||
              reinitializeLoading ||
              isLoginSuccess ||
              !email.trim() ||
              !password.trim() ||
              !isEmailValid ||
              !isPasswordValid
                ? '#FFFFFF'
                : '',
            cursor:
              loading ||
              reinitializeLoading ||
              isLoginSuccess ||
              !email.trim() ||
              !password.trim() ||
              !isEmailValid ||
              !isPasswordValid
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      )}

      {isLoginSuccess && (
        <React.Fragment>
          <span>
            Upload DSC <span style={{ color: 'red' }}>*</span>
          </span>
          <div
            className="upload-section"
            style={{ display: 'column', alignItems: 'center', gap: '5px' }}
          >
            <label className="upload-btn">
              <img
                src={UploadIconButton} // path to your PNG
                alt="Upload"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                }}
              />
              Upload DSC
              <input
                type="file"
                accept=".crt"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={!isLoginSuccess}
              />
            </label>

            {dscFile && previewData && (
              <div
                className="preview-box"
                style={{ border: '1px solid #ccc', overflow: 'hidden' }}
              >
                <img
                  src={thumbnail}
                  alt="Preview"
                  className="preview-image"
                  style={{
                    height: '40px',
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
                {isValidPreview !== null && (
                  <div
                    className={`status-icon ${isValidPreview ? 'tick' : 'cross'}`}
                  >
                    {isValidPreview ? (
                      <CheckCircleIcon style={{ fontSize: '18px' }} />
                    ) : (
                      <CheckCircleIcon style={{ fontSize: '18px' }} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type={'button'}
            className="login-btn"
            onClick={isLoginSuccess ? handleValidate : undefined}
            disabled={reinitializeLoading || !isLoginSuccess || !dscFile}
            style={{
              backgroundColor:
                reinitializeLoading || !isLoginSuccess || !dscFile
                  ? '#CCCCCC'
                  : '',
              color:
                reinitializeLoading || !isLoginSuccess || !dscFile
                  ? '#FFFFFF'
                  : '',
              cursor:
                reinitializeLoading || !isLoginSuccess || !dscFile
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {reinitializeLoading ? 'Initializing...' : 'Login'}
          </button>
        </React.Fragment>
      )}

      <p
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#1D1D1B',
          marginTop: '20px',
          fontFamily: 'Gilroy',
        }}
      >
        Not registered yet on CKYCRR?{' '}
        <Link
          to="/re-register"
          style={{
            color: '#002CBA',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Click Register Now
        </Link>
      </p>
    </form>
  );
};

export default RELoginForm;
