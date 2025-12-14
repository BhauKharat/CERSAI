/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import {
  clearForgotuserIdError,
  loginUser,
  resetAuth,
  verifyDsc,
  clearLoginError,
} from '../../redux/slices/registerSlice/authSlice';
import { clearDscMessage } from '../../redux/slices/registerSlice/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { showLoader, hideLoader } from '../../redux/slices/loader/loaderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { userRoleConstants } from 'Constant';
import ResumeLoginUI from '../features/Authenticate/login/ResumeLoginUI';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

interface WindowWithSignerDigital extends Window {
  SignerDigital?: any;
}

declare let window: WindowWithSignerDigital;

const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSignerDigitalLoaded, setIsSignerDigitalLoaded] = useState(false);
  const [enableExtension, setEnableExtension] = React.useState(false);

  const [dscFile, setDscFile] = useState<File | null>(null);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  const {
    errorLogin,
    // authToken,
    success,
    dscVerificationMessage,
    reinitializeLoading,
    userDetails,
    groupMembership,
    verifyDscerror,
    authToken,
  } = useSelector((state: RootState) => state.auth);

  // const isLoggedIn = !!authToken;
  const isLoggedIn = !!success;
  console.log(isLoggedIn, 'isLoogedIn');
  console.log(isLoginSuccess, 'isLoginSuccess');

  const [errorMessage, setErrorMessage] = useState('');

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password cannot exceed 16 characters')
      .required('Password is required'),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // Yup validation
    try {
      await validationSchema.validate(
        { email, password },
        { abortEarly: false }
      );
      setFieldErrors({});
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const next: { email?: string; password?: string } = {};
        err.inner.forEach((issue) => {
          if (issue.path && !next[issue.path as 'email' | 'password']) {
            next[issue.path as 'email' | 'password'] = issue.message;
          }
        });
        setFieldErrors(next);
        return;
      }
    }
    setIsLoginSuccess(false); // ✅ Mark login as successful
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
    dispatch(clearLoginError());
    let attempts = 0;
    const maxAttempts = 50;

    const timer = setInterval(() => {
      if ((window as any).SignerDigital) {
        setIsSignerDigitalLoaded(true);
        setEnableExtension(true);
        clearInterval(timer);
      }

      if (++attempts > maxAttempts) {
        clearInterval(timer);
        console.warn('SignerDigital not detected');
      }
    }, 100);

    return () => clearInterval(timer);
  }, [dispatch]);

  // If already authenticated, redirect away from login based on role/group
  useEffect(() => {
    if (authToken) {
      if (
        groupMembership?.includes(userRoleConstants.Nodal_Officer) &&
        userDetails?.approved === true
      ) {
        navigate('/re/dashboard');
      } else if (
        groupMembership?.includes(userRoleConstants.Institutional_Admin_User) ||
        groupMembership?.includes(
          userRoleConstants.Institutional_Branch_User
        ) ||
        groupMembership?.includes(
          userRoleConstants.Institutional_Regional_Admin
        ) ||
        groupMembership?.includes(
          userRoleConstants.Institutional_Regional_User
        ) ||
        groupMembership?.includes(userRoleConstants.Institutional_User)
      ) {
        navigate('/re/dashboard');
      } else if (userDetails?.role === 'cersai') {
        navigate('/ckycrr-admin/dashboard');
      }
    }
  }, [
    authToken,
    groupMembership,
    userDetails?.approved,
    userDetails?.role,
    navigate,
  ]);

  // Handle DSC verification success and trigger reinitialize
  useEffect(() => {
    // setErrorMessage('');
    if (dscVerificationMessage) {
      console.log('DSC Verified!');
      dispatch(clearDscMessage());
      if (
        groupMembership?.includes(userRoleConstants.Nodal_Officer) &&
        userDetails?.approved === true
      ) {
        navigate('/re/dashboard');
      } else if (
        groupMembership?.includes(userRoleConstants.Institutional_Admin_User) ||
        groupMembership?.includes(
          userRoleConstants.Institutional_Branch_User
        ) ||
        groupMembership?.includes(
          userRoleConstants.Institutional_Regional_Admin
        ) ||
        groupMembership?.includes(
          userRoleConstants.Institutional_Regional_User
        ) ||
        groupMembership?.includes(userRoleConstants.Institutional_User)
      ) {
        navigate('/re/dashboard');
        return;
      } else if (userDetails?.role === 'cersai') {
        navigate('/ckycrr-admin/dashboard');
      } else {
        setErrorMessage('User is not verified');
        setIsLoginSuccess(false);
        dispatch(resetAuth());
        navigate('/login');
      }

      // if (
      //   userDetails?.is_initialization_complete === false ||
      //   userDetails?.approved === false
      // ) {
      //   // toast.error('Not valid user');
      //   setErrorMessage('User is not verified');
      //   setIsLoginSuccess(false);
      //   dispatch(resetAuth());
      //   navigate('/login');
      //   return;
      // }
      if (
        userDetails?.role === 'registrationEntity' &&
        groupMembership?.includes(userRoleConstants.Nodal_Officer)
      ) {
        if (userDetails?.approved === true) {
          navigate('/re/dashboard');
        }
        // dispatch(showLoader('Initializing application...'));
        // dispatch(reinitializeApplication());
      } else {
        if (userDetails?.role === 'cersai') {
          navigate('/ckycrr-admin/dashboard');
        } else {
          navigate('/re/dashboard');
        }
      }
    } else {
      // setErrorMessage('User is not verified');
      // setIsLoginSuccess(false);
      dispatch(hideLoader());
      if (userDetails?.role === 'cersai') {
        navigate('/ckycrr-admin/dashboard');
      }
    }
  }, [
    dscVerificationMessage,
    dispatch,
    userDetails?.role,
    navigate,
    groupMembership,
    userDetails?.is_initialization_complete,
    userDetails,
    setErrorMessage,
  ]);

  // useEffect(() => {
  //   if (reinitializeData) {
  //     dispatch(hideLoader());
  //     if (
  //       reinitializeData?.pendingSections.length == 0 &&
  //       reinitializeData?.approvalStatus === 'APPROVED'
  //     ) {
  //       if (userDetails?.role === 'cersai') {
  //         navigate('/ckycrr-admin/dashboard');
  //       } else {
  //         navigate('/re/dashboard');
  //       }

  //       // navigate('/re/kyc/search');
  //     } else {
  //       if (userDetails?.role === 'cersai') {
  //         navigate('/ckycrr-admin/dashboard');
  //       }
  //     }
  //   }
  // }, [reinitializeData, navigate, dispatch, userDetails]);

  // useEffect(() => {
  //   console.log('reinitializeError---', reinitializeError);
  //   if (reinitializeError) {
  //     dispatch(hideLoader());
  //   }
  // }, [reinitializeError, dispatch]);

  // useEffect(() => {
  //   // Clear any existing errors when component mounts
  //   dispatch(clearReinitializeError()); // You'll need to create this action
  // }, [dispatch]);

  const handleFileUploadWithoutExtension = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log('handleFileUploadWithoutExtension====', e);
    const file = e.target.files?.[0];
    if (file) {
      setDscFile(file);
      // Clear any previous errors when a new file is uploaded
      // setError('');
      // dispatch(clearverifyDscerror());
      console.log('DSC Document selected.');
    }
  };

  const handleFileChange = async () => {
    console.log('handleFileChange====');
    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignerDigitalLoaded) {
      // setIsModalOpen(true);
      return;
    }
    setErrorMessage('');
    // const file = e.target.files?.[0];
    // if (file) {
    //   setDscFile(file);
    //   console.log('DSC Document selected.');
    // }
    try {
      if (!window.SignerDigital) {
        console.warn('SignerDigital not available');
        return;
      }
      const certificate = await window.SignerDigital.getSelectedCertificate(
        '',
        true,
        128
      );
      if (certificate) {
        const strCert = JSON.parse(certificate);
        const expiryDate = new Date(strCert?.ExpDate);
        // const expiryDate = new Date("2023-06-22T13:37:00+05:30");
        // const currentDate = new Date("2026-06-23T13:37:00+05:30");
        const currentDate = new Date();

        if (expiryDate < currentDate) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Certificate',
            text: 'Your Digital Signature Certificate has expired. To continue using the application, please contact the Helpdesk/CERSAI Admin to receive an activation link for setting up new DSC.',
            confirmButtonText: 'Ok',
            customClass: {
              container: 'my-swal',
            },
          });
          return;
        }
        console.log('strCert', strCert);
        console.log(
          'strCert.SelCertSubject---',
          strCert?.SelCertSubject?.split(',')[0]
        );
        // setDscCertificate(strCert);
        // setDscSelected(true);
        setDscFile(strCert?.Cert);
      }
    } catch (error) {
      // alert("Please Insert and select Your DSC Certificate");
      Swal.fire({
        icon: 'error',
        title: 'Unable to Authenticate.',
        text: 'Authentication failed due to a possible browser interference.Please disable and enable the extensions and try again.',
        confirmButtonText: 'Ok',
        customClass: {
          container: 'my-swal',
        },
      });
      console.error('Error detecting smartcard readers:', error);
    }
  };

  const handleValidate = async () => {
    setErrorMessage('');
    if (!dscFile) {
      console.log('Please upload DSC document first.');
      return;
    }

    dispatch(showLoader('Verifying DSC...'));
    if (enableExtension) {
      // setDscFile(null);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          console.log('FileReader finished reading');

          const base64String = dscFile.toString();
          // const base64String = (reader.result as string).split(',')[1];
          console.log('Base64 starts with:', base64String);
          // const base64String = (reader.result as string).split(',')[1];
          const result = await dispatch(
            verifyDsc({
              dscCertificate: base64String,
              username: email,
              password,
            })
          );
          console.log('Result in handleValidate in loginForm:', result);
          if (verifyDsc.fulfilled.match(result)) {
            console.log('DSC verification successful');
          } else {
            // setErrorMessage('User is not verified');
          }
        };
        reader.readAsDataURL(dscFile);
      } catch (err) {
        console.log(err);
        dispatch(hideLoader());
      }
    } else {
      setDscFile(null);
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          console.log('FileReader finished reading');

          const base64String = (reader.result as string).split(',')[1];
          console.log('Base64 starts with:', base64String?.slice(0, 30));
          // const base64String = (reader.result as string).split(',')[1];
          const result = await dispatch(
            verifyDsc({
              dscCertificate: base64String,
              username: email,
              password,
            })
          );
          console.log('Result in handleValidate in loginForm:', result);
          if (verifyDsc.fulfilled.match(result)) {
            console.log('DSC verification successful');
          } else {
            // setErrorMessage('User is not verified');
          }
        };
        reader.readAsDataURL(dscFile);
      } catch (err) {
        console.log(err);
        dispatch(hideLoader());
      }
    }
  };

  return (
    <ResumeLoginUI
      email={email}
      password={password}
      onEmailChange={(value) => {
        setEmail(value);
        if (isLoginSuccess) {
          setIsLoginSuccess(false);
          setDscFile(null);
        }
        if (fieldErrors.email) {
          setFieldErrors((prev) => ({ ...prev, email: undefined }));
        }
      }}
      onPasswordChange={(value) => {
        setPassword(value);
        if (fieldErrors.password) {
          setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }
      }}
      onSubmit={handleLogin}
      onFileChange={handleFileChange}
      onNoExtensionFileChange={handleFileUploadWithoutExtension}
      onLoginClick={handleValidate}
      isLoginSuccess={isLoginSuccess}
      uploadedFile={dscFile}
      errorLogin={errorLogin || (errorMessage ? `${errorMessage}` : null)}
      verifyDscError={verifyDscerror || undefined}
      reinitializeLoading={reinitializeLoading}
      fieldErrors={fieldErrors}
    />
  );
};

export default LoginForm;
