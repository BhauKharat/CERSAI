/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from 'react';
import './SetNewPassword.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  setupPasswordAndDSC,
  resetPassSetupState,
  resetPassSetupError,
} from '../types/passSetupSlice';
import {
  setAuthToken,
  validateActivateToken,
} from '../slice/passSetupOtpSlice';
import { showLoader, hideLoader } from '../slice/loaderSlice';
import { RootState } from '../../../../redux/store';
import { AppDispatch } from '../../../../redux/store';
import { ReactComponent as CKYCRRLogo } from '../../../../assets/ckycrr_sign_up_logo.svg';
import { ReactComponent as EyeIcon } from '../../../../assets/eye.svg';
import PasswordSavedModal from '../passwordSetup/PasswordSavedModal';
import thumbnailpassword from '../../../../assets/thumbnail.png';
// Import Material-UI icons for the tooltip (you may need to install @mui/icons-material if not already installed)
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { jwtDecode } from 'jwt-decode';
import closeEye from '../../../../assets/closeEye.svg';
import UploadIconButton from '../../../../assets/UploadIconButton.svg';
import signupbg from '../../../../assets/sign_up_bg.svg';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  InputAdornment,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PasswordInputWithAsterisks from './PasswordInputWithAsterisks';
import { resetRegitsration } from '../../../../redux/slices/registerSlice/registrationSlice';
import { resetAuth } from '../../../../redux/slices/registerSlice/authSlice';
import Swal from 'sweetalert2';

interface TokenPayload {
  email: string;
  mobileNumber: string;
}

interface WindowWithSignerDigital extends Window {
  SignerDigital?: any;
}

declare let window: WindowWithSignerDigital;

const SetNewPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.passSetup
  );

  // const { tokenValidationError } = useSelector(
  //   (state: RootState) => state.passSetupOtp
  // );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dscCertificateBase64, setDscCertificateBase64] = useState<string>('');
  const [isDscUploaded, setIsDscUploaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Removed: Re-Enter Password field no longer has visibility toggle
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailId, setEmailId] = useState('');
  const [, setMobileNum] = useState('');
  const [showTokenError, setShowTokenError] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [enableExtension, setEnableExtension] = useState(false);
  const [isSignerDigitalLoaded, setIsSignerDigitalLoaded] = useState(false);

  const effectRan = useRef(false);

  // Password validation rules
  const getPasswordRules = (password: string) => {
    const isLengthValid = password.length >= 8 && password.length <= 16;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*_\-+=]/.test(password);
    const hasNoSpaces = !/\s/.test(password);

    return [
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
  };

  const passwordRules = getPasswordRules(newPassword);

  // Check if all password rules are valid
  const isPasswordValid = passwordRules.every((rule) => rule.isValid);

  useEffect(() => {
    dispatch(resetAuth());
    dispatch(resetRegitsration());
    if (success) setIsModalOpen(true);
    if (error) setErrorMessage(error);

    let attempts = 0;
    const maxAttempts = 50;

    const timer = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, [success, error, dispatch]);

  // Handle token validation errors
  // useEffect(() => {
  //   if (tokenValidationError && showTokenError) {
  //     toast.error(tokenValidationError);
  //   }
  // }, [tokenValidationError, showTokenError]);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    console.log('token', token);

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
            .then((validationResponse) => {
              console.log('Token validation successful:', validationResponse);
              setShowTokenError(false);
            })
            .catch((validationErr: any) => {
              console.log(
                'Token validation failed (non-blocking):',
                validationErr
              );
              setTokenError(validationErr);
              setShowTokenError(true);

              // Differentiate between token types based on error message or status
              const errorMessage =
                validationErr?.data?.errorMessage ||
                validationErr?.message ||
                '';
              const errorStatus = validationErr?.status;

              if (
                errorMessage.toLowerCase().includes('expired') ||
                errorMessage.toLowerCase().includes('expire')
              ) {
                setIsTokenExpired(true);
                setIsTokenInvalid(false);
              } else if (
                errorStatus === 403 ||
                errorMessage.toLowerCase().includes('invalid') ||
                errorMessage.toLowerCase().includes('unauthorized')
              ) {
                setIsTokenInvalid(true);
                setIsTokenExpired(false);
              } else {
                // Default to invalid for other errors
                setIsTokenInvalid(false);
                setIsTokenExpired(false);
              }

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
          dispatch(hideLoader());
          // dispatch(
          //   sendOtp({
          //     emailId: decoded.email,
          //     mobileNo: decoded.mobileNumber,
          //     token: token,
          //   })
          // )
          //   .unwrap()
          //   .then((res: any) => {
          //     console.log('OTP sent successfully', res);
          //     dispatch(hideLoader());
          //   })
          //   .catch((err: any) => {
          //     // Check if it's the "already setup" error
          //     const errorMessage = err?.data?.errorMessage;

          //     if (
          //       errorMessage ===
          //       'User already has completed the password and DSC setup'
          //     ) {
          //       console.log('User already completed setup');
          //       setShowAlreadySetupMessage(true);
          //       dispatch(hideLoader());
          //     } else {
          //       // Handle other errors (OTP send failed)
          //       console.error('OTP send failed', err);
          //       dispatch(hideLoader());
          //       // You might want to show an error message to the user here
          //       toast.error('Failed to send OTP. Please try again.');
          //     }
          //   });
        } else {
          dispatch(hideLoader());
        }
      } catch (error) {
        console.error('Token decode failed', error);
        dispatch(hideLoader());
        // Handle token decode failure
        // toast.error('Invalid token. Please try again.');
      }
    }
  }, [dispatch]);

  const closeModal = () => {
    setIsModalOpen(false);
    dispatch(resetPassSetupState());
    // Redirect to login if needed
  };

  const handleSubmit = () => {
    if (!isFormValid || !isDscUploaded) {
      setErrorMessage('Please fill in all fields and upload a valid DSC.');
      return;
    }

    dispatch(
      setupPasswordAndDSC({
        password: newPassword,
        // dscAction: 'STORE',
        userId: emailId,
        dscCertificateFile: dscCertificateBase64,
      })
    );
  };

  const handleDscUploadWithoutSinglr = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(resetPassSetupError());
    setErrorMessage('');
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validExtensions = ['.cer', '.crt'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      toast.error('Invalid file type. Please upload a .cer or .crt file.', {
        position: 'top-right',
        autoClose: 5000,
      });
      event.target.value = ''; // Reset file input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB. Please upload a smaller file.', {
        position: 'top-right',
        autoClose: 5000,
      });
      event.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      toast.error('Failed to read the file. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      event.target.value = ''; // Reset file input
    };

    reader.onloadend = () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        if (!base64) {
          // toast.error('Invalid file content. Please select a valid DSC file.', {
          //   position: 'top-right',
          //   autoClose: 5000,
          // });
          event.target.value = ''; // Reset file input
          return;
        }
        setDscCertificateBase64(base64);
        setIsDscUploaded(true);
        // toast.success('DSC file uploaded successfully!', {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      } catch {
        // toast.error('Error processing the file. Please try again.', {
        //   position: 'top-right',
        //   autoClose: 5000,
        // });
        event.target.value = ''; // Reset file input
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDscUpload = async () => {
    dispatch(resetPassSetupError());
    setErrorMessage('');
    if (!isSignerDigitalLoaded) {
      // setIsModalOpen(true);
      return;
    }
    // const file = event.target.files?.[0];

    // if (!file) return;

    // // Validate file type
    // const validExtensions = ['.cer', '.crt'];
    // const fileName = file.name.toLowerCase();
    // const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

    // if (!isValidType) {
    //   toast.error('Invalid file type. Please upload a .cer or .crt file.', {
    //     position: 'top-right',
    //     autoClose: 5000,
    //   });
    //   event.target.value = ''; // Reset file input
    //   return;
    // }

    // // Validate file size (max 5MB)
    // const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    // if (file.size > maxSize) {
    //   toast.error('File size exceeds 5MB. Please upload a smaller file.', {
    //     position: 'top-right',
    //     autoClose: 5000,
    //   });
    //   event.target.value = ''; // Reset file input
    //   return;
    // }
    let fileData = '';
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
        fileData = strCert?.Cert;
        // fileData = strCert?.SelCertSubject?.split(',')[0];
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

    const reader = new FileReader();

    reader.onerror = () => {
      toast.error('Failed to read the file. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      // event.target.value = ''; // Reset file input
    };

    reader.onloadend = () => {
      try {
        const base64 = fileData;
        // const base64 = (reader.result as string).split(',')[1];
        if (!base64) {
          // toast.error('Invalid file content. Please select a valid DSC file.', {
          //   position: 'top-right',
          //   autoClose: 5000,
          // });
          // event.target.value = ''; // Reset file input
          return;
        }
        setDscCertificateBase64(base64);
        setIsDscUploaded(true);
        // toast.success('DSC file uploaded successfully!', {
        //   position: 'top-right',
        //   autoClose: 3000,
        // });
      } catch {
        // toast.error('Error processing the file. Please try again.', {
        //   position: 'top-right',
        //   autoClose: 5000,
        // });
        // event.target.value = ''; // Reset file input
      }
    };

    // reader.readAsDataURL(file);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  // const toggleConfirmPasswordVisibility = () =>
  //   setShowConfirmPassword(!showConfirmPassword); // Removed: Re-Enter Password field no longer has visibility toggle

  useEffect(() => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('');
      setIsFormValid(false);
      return;
    }

    // Use the comprehensive password validation instead of just length check
    if (!isPasswordValid) {
      setErrorMessage('Password does not meet the required criteria.');
      setIsFormValid(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsFormValid(false);
      return;
    }

    if (!isDscUploaded) {
      setErrorMessage('');
      setIsFormValid(false);
      return;
    }

    setErrorMessage('');
    setIsFormValid(true);
  }, [newPassword, confirmPassword, isDscUploaded, isPasswordValid]);

  return (
    <>
      <Box
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        sx={{
          minHeight: '100vh',
          background: `url(${signupbg}) 50%/cover no-repeat`,
          padding: '15px' /* Added padding for better mobile view */,
          overflow: 'hidden',
        }}
        // className="set-password-container"
      >
        <Box
          sx={{
            background: 'white',
            padding: '25px 30px',
            borderRadius: '12px',
            width: '400px',
            maxWidth: '90%' /* Make card responsive */,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            marginBottom: '50px',
          }}
          // className="set-password-card"
        >
          {/* <div className="header">
            <button className="back-button" onClick={handleBack}>
              <BackArrowIcon
                className="back-icon"
                style={{ width: '70px', height: '70px' }}
              />
            </button>
            <CKYCRRLogo className="logo" />
          </div> */}
          <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            position={'relative'}
          >
            <CKYCRRLogo className="logo" />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'inherit',
              fontSize: '22px',
              fontWeight: '600',
              color: '#333333',
              textAlign: 'center',
              // marginTop: '20px',
              marginBottom: '20px',
            }}
          >
            Set Password
          </Typography>
          {/* <p className="password-info">
            Your new password should be different from previously used.
          </p> */}

          {/* Invalid token specific message */}
          {showTokenError && isTokenInvalid && (
            <Box
              sx={{
                backgroundColor: '#ffebee',
                border: '2px solid #f44336',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'inherit',
                  color: '#d32f2f',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                🚫 Invalid Token
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'inherit',
                  color: '#d32f2f',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                The password reset link is invalid or has been tampered with.
              </Typography>
            </Box>
          )}

          {/* Expired token specific message */}
          {showTokenError && (
            <Box
              sx={{
                backgroundColor: '#fff3e0',
                border: '2px solid #ff9800',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'inherit',
                  color: '#e65100',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                ⏰ Token Expired
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'inherit',
                  color: '#e65100',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                {tokenError || 'Your password reset link has expired.'}
              </Typography>
            </Box>
          )}

          {errorMessage && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'inherit',
                color: 'red',
                fontSize: '14px',
                marginBottom: '10px',
                textAlign: 'left',
              }}
              color="error"
            >
              {errorMessage}
            </Typography>
          )}

          {/* Only show form elements if token is valid or expired (not invalid) */}
          {(!showTokenError || (showTokenError && isTokenExpired)) && (
            <>
              <Box mb={'15px'}>
                <Box
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  sx={{
                    marginBottom: '8px',
                  }}
                >
                  <InputLabel
                    sx={{
                      // fontFamily: 'Gilroy-SemiBold',
                      textAlign: 'start' /* right align the link */,
                      display: 'block',
                      fontSize: '14px',
                      color: '#333',
                      fontWeight: 600,
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      marginBottom: '8px',
                      // width: width,
                      paddingLeft: '0',
                    }}
                  >
                    Password <span style={{ color: 'red' }}>*</span>
                    {/* {label} {required && <span style={{ color: 'red' }}>*</span>} */}
                  </InputLabel>

                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      cursor: 'pointer',
                      '&:hover .tooltip-box': {
                        opacity: 1,
                        visibility: 'visible',
                        transform: 'translateY(0)',
                        top: '-60px',
                      },
                    }}
                    // className="tooltip-icon"
                  >
                    <Box
                      display={'flex'}
                      alignItems={'center'}
                      mr={1}
                      sx={{
                        color: '#666',
                        transition: 'color 0.2s ease',
                        '&:hover': {
                          color: '#002CBA', // change to red on hover
                        },
                      }}
                      // className="info-icon"
                    >
                      <ErrorOutlineIcon style={{ fontSize: '20px' }} />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        /* bottom: 100%; */
                        /* right: 0px; */
                        right: '-340px',
                        top: '0px',
                        marginBottom: '8px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: '1000',
                        minWidth: '320px',
                        opacity: 0,
                        visibility: 'hidden',
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        '@media (max-width:768px)': {
                          top: 'auto !important',
                          bottom: '100% !important',
                          left: '50% !important',
                          right: 'auto !important',
                          transform:
                            'translateX(-105%) translateY(70%) !important',
                          minWidth: '280px !important',
                          maxWidth: '90vw !important',
                          marginBottom: '8px !important',
                        },
                      }}
                      className="tooltip-box"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'inherit',
                          letterSpacing: 0,
                          fontWeight: 'bold',
                          color: 'text.primary',
                          mb: '12px',
                        }}
                      >
                        Password must meet the following criteria:
                      </Typography>
                      {/* <strong>Password must meet the following criteria:</strong> */}
                      <List sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {passwordRules.map((rule, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              color: rule.isValid ? '#51AE32' : '#FF0808',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 0',
                              marginBottom: '1rem',

                              // color: rule.isValid ? '#51AE32' : '#FF0808',
                              // display: 'flex',
                              // gap: 1, // 8px gap
                              // paddingY: 0.5, // optional vertical spacing
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 'auto',
                                color: rule.isValid ? '#51AE32' : '#FF0808',
                                flexShrink: 0,
                                // width: '16px',
                                // height: '16px',
                              }}
                            >
                              {rule.isValid ? (
                                <CheckCircleOutlineRoundedIcon
                                  sx={{
                                    fontSize: 'inherit',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              ) : (
                                <CancelOutlinedIcon
                                  sx={{
                                    fontSize: 'inherit',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={rule.label}
                              sx={{
                                '&.MuiListItemText-root': {
                                  margin: 0,
                                },
                              }}
                              primaryTypographyProps={{
                                sx: {
                                  fontFamily: 'inherit',
                                  padding: '0',
                                  fontSize: '13px',
                                  lineHeight: '1.4',
                                  color: rule.isValid ? '#51AE32' : '#FF0808',
                                  fontWeight: 'normal', // bold/medium
                                  // fontSize: '13px', // body2 size
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      {/* <ul className="tooltip-list">
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
                  </ul> */}
                    </Box>
                  </Box>
                </Box>

                <PasswordInputWithAsterisks
                  id="new-password"
                  fullWidth
                  variant="outlined"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(value) => setNewPassword(value)}
                  showPassword={showPassword}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        sx={{
                          position: 'absolute',
                          right: '12px',
                          cursor: 'pointer',
                          color: '#666',
                          fontSize: '20px',
                          padding: 0,
                          marginRight: 0,
                        }}
                        onClick={togglePasswordVisibility}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            togglePasswordVisibility();
                          }
                        }}
                        edge="end"
                      >
                        {showPassword ? (
                          <EyeIcon />
                        ) : (
                          <img
                            src={closeEye}
                            alt="Show password"
                            className="w-5 h-5"
                          />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    width: '330px',
                    maxWidth: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                      borderRadius: '4px',
                      outline: 'none',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      '& fieldset': {
                        borderWidth: '1px',
                        borderColor: '#ddd',
                      },
                      '&:hover fieldset': {
                        borderWidth: '1px',
                        borderColor: `${error ? 'red' : '#ddd'}`,
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '1px',
                        borderColor: `${error ? 'red' : '#002CBA'}`,
                        transition: 'border-color 0.3s',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: "'Gilroy', sans-serif",
                      padding: '12px',
                      fontSize: '14px',
                      color: '#222',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      fontFamily: "'Gilroy', sans-serif",
                      fontSize: '14px',
                      color: '#222',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      fontFamily: "'Gilroy', sans-serif",
                      fontSize: '12px',
                      color: 'red',
                      marginTop: '5px',
                      marginLeft: '0',
                    },
                  }}
                />
              </Box>

              {/* <div className="input-group">
            <div className="input-label-container">
              <label htmlFor="new-password">New Password</label>
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
            <div className="password-input">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="eye-icon"
                onClick={togglePasswordVisibility}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    togglePasswordVisibility();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeIcon />
                ) : (
                  <img src={closeEye} alt="Show password" className="w-5 h-5" />
                )}
              </span>
            </div>
          </div> */}

              <Box mb={'15px'}>
                <Box
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                  sx={{
                    marginBottom: '8px',
                    marginTop: '24px',
                  }}
                >
                  <InputLabel
                    sx={{
                      // fontFamily: 'Gilroy-SemiBold',
                      textAlign: 'start' /* right align the link */,
                      display: 'block',
                      fontSize: '14px',
                      color: '#333',
                      fontWeight: 600,
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      marginBottom: '8px',
                      // width: width,
                      paddingLeft: '0',
                    }}
                  >
                    Re-enter Password <span style={{ color: 'red' }}>*</span>
                    {/* {label} {required && <span style={{ color: 'red' }}>*</span>} */}
                  </InputLabel>

                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      cursor: 'pointer',
                      '&:hover .tooltip-box': {
                        opacity: 1,
                        visibility: 'visible',
                        transform: 'translateY(0)',
                        top: '-60px',
                      },
                    }}
                    // className="tooltip-icon"
                  >
                    <Box
                      display={'flex'}
                      alignItems={'center'}
                      mr={1}
                      sx={{
                        color: '#666',
                        transition: 'color 0.2s ease',
                        '&:hover': {
                          color: '#002CBA', // change to red on hover
                        },
                      }}
                      // className="info-icon"
                    >
                      <ErrorOutlineIcon style={{ fontSize: '20px' }} />
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        /* bottom: 100%; */
                        /* right: 0px; */
                        right: '-340px',
                        top: '0px',
                        marginBottom: '8px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: '1000',
                        minWidth: '320px',
                        opacity: 0,
                        visibility: 'hidden',
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                        '@media (max-width:768px)': {
                          top: 'auto !important',
                          bottom: '100% !important',
                          left: '50% !important',
                          right: 'auto !important',
                          transform:
                            'translateX(-105%) translateY(70%) !important',
                          minWidth: '280px !important',
                          maxWidth: '90vw !important',
                          marginBottom: '8px !important',
                        },
                      }}
                      className="tooltip-box"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'inherit',
                          letterSpacing: 0,
                          fontWeight: 'bold',
                          color: 'text.primary',
                          mb: '12px',
                        }}
                      >
                        Password must meet the following criteria:
                      </Typography>
                      {/* <strong>Password must meet the following criteria:</strong> */}
                      <List sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {passwordRules.map((rule, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              color: rule.isValid ? '#51AE32' : '#FF0808',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 0',
                              marginBottom: '1rem',
                              // color: rule.isValid ? '#51AE32' : '#FF0808',
                              // display: 'flex',
                              // gap: 1, // 8px gap
                              // paddingY: 0.5, // optional vertical spacing
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 'auto',
                                color: rule.isValid ? '#51AE32' : '#FF0808',
                                flexShrink: 0,
                                // width: '16px',
                                // height: '16px',
                              }}
                            >
                              {rule.isValid ? (
                                <CheckCircleOutlineRoundedIcon
                                  sx={{
                                    fontSize: 'inherit',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              ) : (
                                <CancelOutlinedIcon
                                  sx={{
                                    fontSize: 'inherit',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={rule.label}
                              sx={{
                                '&.MuiListItemText-root': {
                                  margin: 0,
                                },
                              }}
                              primaryTypographyProps={{
                                sx: {
                                  fontFamily: 'inherit',
                                  padding: '0',
                                  fontSize: '13px',
                                  lineHeight: '1.4',
                                  color: rule.isValid ? '#51AE32' : '#FF0808',
                                  fontWeight: 'normal', // bold/medium
                                  // fontSize: '13px', // body2 size
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </Box>

                <PasswordInputWithAsterisks
                  id="re-newpassword"
                  fullWidth
                  variant="outlined"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(value) => setConfirmPassword(value)}
                  showPassword={false}
                  onPaste={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  sx={{
                    width: '330px',
                    maxWidth: '100%',
                    '& input::-ms-reveal, & input::-ms-clear': {
                      display: 'none',
                    },
                    '& input::-webkit-credentials-auto-fill-button': {
                      visibility: 'hidden',
                      display: 'none !important',
                      pointerEvents: 'none',
                      position: 'absolute',
                      right: 0,
                    },
                    '& input::-webkit-textfield-decoration-container': {
                      display: 'none !important',
                    },
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                      borderRadius: '4px',
                      outline: 'none',
                      fontSize: '14px',
                      transition: 'border-color 0.3s',
                      '& fieldset': {
                        borderWidth: '1px',
                        borderColor: '#ddd',
                      },
                      '&:hover fieldset': {
                        borderWidth: '1px',
                        borderColor: `${error ? 'red' : '#ddd'}`,
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '1px',
                        borderColor: `${error ? 'red' : '#002CBA'}`,
                        transition: 'border-color 0.3s',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: "'Gilroy', sans-serif",
                      padding: '12px',
                      fontSize: '14px',
                      color: '#222',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      fontFamily: "'Gilroy', sans-serif",
                      fontSize: '14px',
                      color: '#222',
                    },
                    '& .MuiFormHelperText-root.Mui-error': {
                      fontFamily: "'Gilroy', sans-serif",
                      fontSize: '12px',
                      color: 'red',
                      marginTop: '5px',
                      marginLeft: '0',
                    },
                  }}
                />
              </Box>

              {/* <div className="input-group">
            <div className="input-label-container">
              <label htmlFor="re-newpassword">Re-Enter New Password</label>
              <div className="tooltip-icon">
                <span className="info-icon">
                  <ErrorOutlineIcon />
                </span>
                <div className="tooltip-box">
                  <strong>Password must meet the following criteria:</strong>
                  <ul className="tooltip-list">
                    {confirmPasswordRules.map((rule, index) => (
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
            <div className="password-input">
              <input
                id="re-newpassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="eye-icon"
                onClick={toggleConfirmPasswordVisibility}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleConfirmPasswordVisibility();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <EyeIcon />
                ) : (
                  <img src={closeEye} alt="Show password" className="w-5 h-5" />
                )}
              </span>
            </div>
          </div> */}
              <InputLabel
                sx={{
                  // fontFamily: 'Gilroy-SemiBold',
                  textAlign: 'start' /* right align the link */,
                  display: 'block',
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: 600,
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  marginTop: '24px',
                  marginBottom: '8px',
                  // width: width,
                  paddingLeft: '0',
                }}
              >
                Upload DSC <span style={{ color: 'red' }}>*</span>{' '}
              </InputLabel>

              {isDscUploaded ? (
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  sx={{
                    gap: '16px',
                    marginTop: '24px',
                    flexWrap: 'none',
                  }}
                  // className={`dsc-upload-wrapper ${isDscUploaded ? 'uploaded' : ''}`}
                >
                  {enableExtension ? (
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        border: '1px solid #002cba',
                        color: '#002cba',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#f5f8ff',
                        flexShrink: 0,
                        minWidth: '280px',
                      }}
                      startIcon={
                        <img
                          src={UploadIconButton}
                          alt="Upload"
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                        />
                      } // or replace with <img src={UploadIconButton} alt="Upload" width={24} height={24} />
                      onClick={handleDscUpload}
                    >
                      Upload
                      {/* <input
                      hidden
                      accept=".cer,.crt"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleDscUpload}
                    /> */}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        border: '1px solid #002cba',
                        color: '#002cba',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#f5f8ff',
                        flexShrink: 0,
                        minWidth: '280px',
                      }}
                      startIcon={
                        <img
                          src={UploadIconButton}
                          alt="Upload"
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                        />
                      } // or replace with <img src={UploadIconButton} alt="Upload" width={24} height={24} />
                      // onClick={handleDscUpload}
                    >
                      Upload
                      <input
                        hidden
                        accept=".cer,.crt"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleDscUploadWithoutSinglr}
                      />
                    </Button>
                  )}

                  {isDscUploaded && (
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: '50px',
                          height: '50px',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                        }}
                        // className="dsc-preview"
                      >
                        <Box
                          component="img"
                          src={thumbnailpassword}
                          alt="thumbnail"
                          sx={{ width: 40, height: 40, borderRadius: 1 }}
                        />
                        {/* <CheckIcon color="success" /> */}
                        {/* <img src={thumbnailpassword} alt="thumbnail" /> */}
                        <span className="checkmark">&#10003;</span>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <>
                  {enableExtension ? (
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        border: '1px solid #002cba',
                        color: '#002cba',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#f5f8ff',
                        flexShrink: 0,
                        minWidth: '280px',
                      }}
                      startIcon={
                        <img
                          src={UploadIconButton}
                          alt="Upload"
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                        />
                      } // or replace with <img src={UploadIconButton} alt="Upload" width={24} height={24} />
                      onClick={handleDscUpload}
                    >
                      Upload
                      {/* <input
                      hidden
                      accept=".cer,.crt"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleDscUpload}
                    /> */}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        border: '1px solid #002cba',
                        color: '#002cba',
                        padding: '12px 24px',
                        borderRadius: '5px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#f5f8ff',
                        flexShrink: 0,
                        minWidth: '280px',
                      }}
                      startIcon={
                        <img
                          src={UploadIconButton}
                          alt="Upload"
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                          }}
                        />
                      } // or replace with <img src={UploadIconButton} alt="Upload" width={24} height={24} />
                      // onClick={handleDscUpload}
                    >
                      Upload
                      <input
                        hidden
                        accept=".cer,.crt"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleDscUploadWithoutSinglr}
                      />
                    </Button>
                  )}
                  {/* <label htmlFor="dscUpload" className="upload-button">
                <DscIcon
                  style={{
                    width: 22,
                    height: 22,
                    stroke: '#002CBA',
                    fill: 'none',
                  }}
                />
                {isDscUploaded ? 'Upload DSC' : 'Upload DSC'}
              </label>
              <input
                id="dscUpload"
                type="file"
                accept=".cer,.crt"
                style={{ display: 'none' }}
                onChange={handleDscUpload}
              /> */}
                </>
              )}

              {/* {isDscUploaded ? (
            <div
              className={`dsc-upload-wrapper ${isDscUploaded ? 'uploaded' : ''}`}
            >
              <label htmlFor="dscUpload" className="upload-button-new">
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
              </label>

              <input
                id="dscUpload"
                type="file"
                accept=".cer,.crt"
                style={{ display: 'none' }}
                onChange={handleDscUpload}
              />

              {isDscUploaded && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div className="dsc-preview">
                    <img src={thumbnailpassword} alt="thumbnail" />
                    <span className="checkmark">&#10003;</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <label htmlFor="dscUpload" className="upload-button">
                <DscIcon
                  style={{
                    width: 22,
                    height: 22,
                    stroke: '#002CBA',
                    fill: 'none',
                  }}
                />
                {isDscUploaded ? 'Upload DSC' : 'Upload DSC'}
              </label>
              <input
                id="dscUpload"
                type="file"
                accept=".cer,.crt"
                style={{ display: 'none' }}
                onChange={handleDscUpload}
              />
            </>
          )} */}

              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  top: '15px',
                  alignItems: 'center',
                  backgroundColor: '#002cba',
                  color: 'white',
                  padding: '12px',
                  textTransform: 'inherit',
                  fontFamily: "'Gilroy', sans-serif",
                  fontWeight: 'normal',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  height: '45px',
                  width: '200px',
                  maxWidth: '100%',
                  margin: '20px auto',
                  // textTransform: 'none',
                  // lineHeight: 'inherit',
                  transition: 'background 0.3s',
                  // '&:hover': {
                  //   backgroundColor: '#002cba',
                  //   // boxShadow: 'none', // shadow on hover
                  // },
                  '&.Mui-disabled': {
                    pointerEvents: 'auto',
                    backgroundColor: '#b3b3b3', // custom disabled background
                    color: '#fff', // custom disabled text color
                    cursor: 'not-allowed',
                  },
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </>
          )}

          {/* <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button> */}

          {/* <Typography
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
            Click Register Now to register on CKYCRR.{' '}
            <Link
              href="re-signup"
              sx={{
                color: '#002CBA',
                textDecoration: 'none',
                fontWeight: '400',
                fontSize: '12px',
              }}
              underline="hover"
            >
              Register Now
            </Link>
          </Typography> */}

          {/* <p className="register-link">
            Click Register Now to register on CKYCRR.{' '}
            <a href="re-login">Register Now</a>
          </p> */}
        </Box>

        <PasswordSavedModal
          isOpen={isModalOpen}
          onClose={closeModal}
          redirectURL={'/re-signup?tab=1'}
        />
      </Box>
    </>
  );
};

export default SetNewPassword;
