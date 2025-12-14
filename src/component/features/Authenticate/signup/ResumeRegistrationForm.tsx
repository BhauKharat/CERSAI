import React from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ReactComponent as EyeIcon } from '../../../../assets/eye.svg';
import closeEye from '../../../../assets/closeEye.svg';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CSRLogo from '../../../../assets/CSR-File.svg';
import { SVG_LOGIN_PATHS } from '../../../../constants/svgPaths';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { useNavigate } from 'react-router-dom';
import {
  // clearForgotuserIdError,
  loginUser,
  // resetAuth,
  verifyDsc,
  clearLoginError,
  clearDscMessage,
  reinitializeApplication,
  clearReinitializeError,
  clearverifyDscerror,
  fetchAdminUserDetails,
  clearAdminUserDetailsError,
} from '../slice/authSlice';
import { showLoader, hideLoader } from '../slice/loaderSlice';
import Swal from 'sweetalert2';
// import { userRoleConstants } from 'Constant';

interface WindowWithSignerDigital extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SignerDigital?: any;
}

declare let window: WindowWithSignerDigital;

const ResumeRegistrationForm: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = React.useState<string>('');
  const [registrationData, setRegistrationData] = React.useState({
    email: '',
    password: '',
  });
  const [isLoginSuccess, setIsLoginSuccess] = React.useState(false);
  const [enableExtension, setEnableExtension] = React.useState(false);
  const hasExecutedRef = React.useRef(false);
  const [isSignerDigitalLoaded, setIsSignerDigitalLoaded] =
    React.useState(false);
  const {
    dscVerificationMessage,
    reinitializeLoading,
    reinitializeDataResponse,
    reinitializeError,
    userDetails,
    loginUserId,
    workflowId,
    // groupMembership,
    // workflowId,
    groupMembership,
    errorLogin,
    remainingLoginAttempts,
    verifyDscerror,
    adminUserDetailsLoading,
    adminUserDetailsError,
    adminUserDetails,
  } = useSelector((state: RootState) => state.auth);

  // Console log userDetails workflowId
  console.log('userDetails workflowId:', workflowId);
  console.log('userDetails userId:', userDetails?.userId);

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

  const passwordRules = getPasswordRules(registrationData.password);

  // Check if all password rules are valid (for future use in validation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isPasswordValid = passwordRules.every((rule) => rule.isValid);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginSuccess(false);
    dispatch(clearverifyDscerror());
    setError('');
    try {
      console.log('registrationData', registrationData);
      await validationSchema.validate(registrationData, { abortEarly: false });
      setFieldErrors({});
      // Dispatch login

      dispatch(showLoader('Please Wait...'));
      const resultAction = await dispatch(
        loginUser({
          userId: registrationData.email,
          password: registrationData.password,
        })
      );
      if (loginUser.fulfilled.match(resultAction)) {
        setIsLoginSuccess(true);
        sessionStorage.setItem('fromLogin', 'true');
      }
      dispatch(hideLoader());
    } catch (err) {
      console.error('registrationData', registrationData);
      if (err instanceof Yup.ValidationError) {
        const nextErrors: { email?: string; password?: string } = {};
        err.inner.forEach((issue) => {
          if (issue.path && !nextErrors[issue.path as 'email' | 'password']) {
            nextErrors[issue.path as 'email' | 'password'] = issue.message;
          }
        });
        setFieldErrors(nextErrors);
      } else {
        dispatch(hideLoader());
      }
    }
  };

  const handleFileUploadWithoutExtension = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    console.log('file====', file);
    if (file) {
      setUploadedFile(file);
      // Clear any previous errors when a new file is uploaded
      setError('');
      dispatch(clearverifyDscerror());
      console.log('DSC Document selected.');
    }
  };

  const handleFileUpload = async () => {
    // const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignerDigitalLoaded) {
      return;
    }

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
        console.log('strCert.CRT====', strCert?.Cert);
        console.log(
          'strCert.SelCertSubject---',
          strCert?.SelCertSubject?.split(',')[0]
        );
        // setDscCertificate(strCert);
        // setDscSelected(true);
        setUploadedFile(strCert?.Cert);
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

  const handleRegistrationLogin = async () => {
    // Validate DSC present
    setError('');
    dispatch(clearverifyDscerror());
    if (!uploadedFile) return;
    dispatch(showLoader('Verifying DSC...'));
    try {
      if (enableExtension) {
        // const reader = new FileReader();
        // reader.onloadend = async () => {
        try {
          const base64String = uploadedFile?.toString();
          console.log('base64String====', base64String);
          // const base64String = (reader.result as string).split(',')[1];
          const resultAction = await dispatch(
            verifyDsc({
              dscCertificate: base64String,
              userId: registrationData.email,
              password: registrationData.password,
            })
          );

          // Check if the action was rejected
          if (verifyDsc.rejected.match(resultAction)) {
            // Hide loader
            dispatch(hideLoader());

            // Clear all Redux state
            dispatch(clearLoginError());
            dispatch(clearReinitializeError());
            dispatch(clearverifyDscerror());
            dispatch(clearAdminUserDetailsError());

            // Show error message
            const errorMessage =
              resultAction.payload || 'DSC verification failed';
            setError(errorMessage);

            // Clear uploaded file
            setUploadedFile(null);
            setIsLoginSuccess(false);
            console.log('🚀 DSC Verification Failed:', errorMessage);
            // Reset the execution flag to allow retry
            hasExecutedRef.current = false;
            return;
          }

          // Success case - redirect is handled in the effect
          console.log('🚀 DSC Verification Successful');
        } catch (fileError) {
          console.error('🚀 File processing error:', fileError);
          dispatch(hideLoader());
          setError('Failed to process the DSC file. Please try again.');
          // Reset the execution flag to allow retry
          hasExecutedRef.current = false;
        }
        // };
        // reader.readAsDataURL(uploadedFile);
      } else {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            // const base64String = uploadedFile?.toString();
            // console.log('base64String====', base64String);
            const base64String = (reader.result as string).split(',')[1];
            const resultAction = await dispatch(
              verifyDsc({
                dscCertificate: base64String,
                userId: registrationData.email,
                password: registrationData.password,
              })
            );

            // Check if the action was rejected
            if (verifyDsc.rejected.match(resultAction)) {
              // Hide loader
              dispatch(hideLoader());

              // Clear all Redux state
              dispatch(clearLoginError());
              dispatch(clearReinitializeError());
              dispatch(clearverifyDscerror());
              dispatch(clearAdminUserDetailsError());

              // Show error message
              const errorMessage =
                resultAction.payload || 'DSC verification failed';
              setError(errorMessage);

              // Clear uploaded file
              setUploadedFile(null);
              setIsLoginSuccess(false);
              console.log('🚀 DSC Verification Failed:', errorMessage);
              // Reset the execution flag to allow retry
              hasExecutedRef.current = false;
              return;
            }

            // Success case - redirect is handled in the effect
            console.log('🚀 DSC Verification Successful');
          } catch (fileError) {
            console.error('🚀 File processing error:', fileError);
            dispatch(hideLoader());
            setError('Failed to process the DSC file. Please try again.');
            // Reset the execution flag to allow retry
            hasExecutedRef.current = false;
          }
        };
        reader.readAsDataURL(uploadedFile);
      }
    } catch (error) {
      console.error('🚀 DSC verification error:', error);
      dispatch(hideLoader());
      // Clear all Redux state
      dispatch(clearLoginError());
      dispatch(clearReinitializeError());
      dispatch(clearverifyDscerror());
      dispatch(clearAdminUserDetailsError());
      setError('An unexpected error occurred. Please try again.');
      // Reset the execution flag to allow retry
      hasExecutedRef.current = false;
    }
  };

  React.useEffect(() => {
    dispatch(clearLoginError());
    dispatch(clearReinitializeError());
    dispatch(clearverifyDscerror());
    dispatch(clearAdminUserDetailsError());
    setError(''); // Clear local error state on component mount
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
  }, [dispatch]);

  // After DSC verify success, fetch admin user details and then trigger reinitialize
  React.useEffect(() => {
    console.log('groupMembership====', groupMembership);
    dispatch(clearverifyDscerror());
    dispatch(hideLoader());
    setIsLoginSuccess(false);
    setUploadedFile(null);
    // dispatch(clearLoginError());
    // dispatch(clearReinitializeError());
    // dispatch(clearverifyDscerror());
    // dispatch(clearAdminUserDetailsError());
    // Check if user has Admin_User role - if so, show error and return
    // if (groupMembership && groupMembership.includes('Admin_User')) {
    //   setUploadedFile(null);
    //   if (groupMembership === undefined) {
    //     setError('');
    //     dispatch(hideLoader());
    //     return;
    //   }
    //   if (groupMembership.includes('Admin_User')) {
    //     setError(
    //       'User is not valid. Admin users cannot access this registration portal.'
    //     );
    //     dispatch(hideLoader());
    //     return;
    //   }
    // }

    if (dscVerificationMessage && loginUserId && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      dispatch(clearDscMessage());
      dispatch(showLoader('Fetching user details...'));
      console.log('loginUserId', loginUserId);

      // First fetch admin user details
      dispatch(fetchAdminUserDetails({ userId: loginUserId }))
        .then(() => {
          // Then trigger reinitialize
          dispatch(showLoader('Initializing application...'));
          dispatch(reinitializeApplication());
        })
        .catch((error) => {
          console.error('Failed to fetch admin user details:', error);
          // Still proceed with reinitialize even if admin details fail
          dispatch(showLoader('Initializing application...'));
          dispatch(reinitializeApplication());
        });
    }
  }, [dscVerificationMessage, loginUserId, groupMembership, dispatch]);

  // Handle reinitialize success/error and navigate accordingly
  // React.useEffect(() => {
  //   // setError('');
  //   if (reinitializeDataResponse) {
  //     // stop loader and route based on response
  //     dispatch(hideLoader());

  //     // Check if response indicates success and navigate to entity-profile
  //     if (reinitializeDataResponse.success === true) {
  //       console.log('Reinitialize successful, navigating to /entity-profile');
  //       if (
  //         reinitializeDataResponse?.data?.currentStep === 'RE_entity_profile'
  //       ) {
  //         navigate('/entity-profile');
  //       } else if (
  //         reinitializeDataResponse?.data?.currentStep === 'RE_addressDetails'
  //       ) {
  //         navigate('/address-details');
  //       } else if (reinitializeDataResponse?.data?.currentStep === 'RE_hoi') {
  //         navigate('/head-of-institution');
  //       } else if (reinitializeDataResponse?.data?.currentStep === 'RE_nodal') {
  //         navigate('/nodal-officer');
  //       } else if (reinitializeDataResponse?.data?.currentStep === 'RE_iau') {
  //         navigate('/admin-user-details');
  //       } else if (
  //         reinitializeDataResponse?.data?.currentStep === 'RE_formPreview' ||
  //         reinitializeDataResponse?.data?.currentStep === 'application_esign'
  //       ) {
  //         navigate('/form-preview');
  //       } else if (
  //         reinitializeDataResponse?.data?.currentStep === 'RE_trackStatus' ||
  //         reinitializeDataResponse?.data?.currentStep === 'application_esign'
  //       ) {
  //         navigate('/track-status');
  //       } else if (
  //         reinitializeDataResponse?.data?.currentStep === 'approvalWorkflow'
  //       ) {
  //         navigate('/track-status');
  //       } else {
  //         navigate('/entity-profile');
  //       }
  //     } else if (userDetails?.approved === true) {
  //       navigate('/form-preview');
  //     } else {
  //       navigate('/re-signup');
  //     }
  //   } else if (reinitializeError) {
  //     console.log('reinitializeError', reinitializeError);
  //     setIsLoginSuccess(false);
  //     dispatch(hideLoader());
  //     dispatch(clearLoginError());
  //     dispatch(clearReinitializeError());
  //     dispatch(clearverifyDscerror());
  //     dispatch(clearAdminUserDetailsError());
  //     setError('An unexpected error occurred. Please try again.');
  //     // Reset the execution flag to allow retry
  //     hasExecutedRef.current = false;
  //   } else {
  //     console.log('Error');
  //     setIsLoginSuccess(false);
  //     dispatch(hideLoader());
  //     dispatch(clearLoginError());
  //     dispatch(clearReinitializeError());
  //     dispatch(clearverifyDscerror());
  //     dispatch(clearAdminUserDetailsError());
  //     // Reset the execution flag to allow retry
  //     hasExecutedRef.current = false;
  //   }
  // }, [
  //   reinitializeDataResponse,
  //   reinitializeError,
  //   navigate,
  //   dispatch,
  //   userDetails,
  //   adminUserDetails,
  //   adminUserDetailsLoading,
  //   adminUserDetailsError,
  // ]);
  React.useEffect(() => {
    if (!reinitializeDataResponse && !reinitializeError) return;

    // stop loader and route based on response
    dispatch(hideLoader());

    // Helper: narrow unknown to a plain record
    const isRecord = (x: unknown): x is Record<string, unknown> =>
      x != null && typeof x === 'object' && !Array.isArray(x);

    if (reinitializeDataResponse?.success === true) {
      const data = reinitializeDataResponse.data;

      // --- Check for non-empty modifiableFields ---
      const mfUnknown = data?.payload?.modifiableFields as unknown;

      const hasModifiable =
        isRecord(mfUnknown) &&
        Object.keys(mfUnknown).length > 0 &&
        // Optional: at least one key has a meaningful (non-empty) value
        Object.values(mfUnknown).some((v) =>
          Array.isArray(v) ? v.length > 0 : !!v
        );

      // If modifiable, always go to Track Status
      if (hasModifiable) {
        navigate('/track-status');
        return;
      }

      // --- Otherwise follow the desired route by currentStep ---
      const step = data?.currentStep;

      switch (step) {
        case 'RE_entity_profile':
        case 'RE_entityProfile': // tolerate both spellings
          navigate('/entity-profile');
          break;

        case 'RE_addressDetails':
          navigate('/address-details');
          break;

        case 'RE_hoi':
          navigate('/head-of-institution');
          break;

        case 'RE_nodal':
          navigate('/nodal-officer');
          break;

        case 'RE_iau':
          navigate('/admin-user-details');
          break;

        case 'RE_formPreview':
        case 'application_esign':
          // Only go to form preview when NOT in modifiable mode
          navigate('/form-preview');
          break;

        case 'RE_trackStatus':
        case 'approvalWorkflow':
          navigate('/track-status');
          break;

        default:
          navigate('/entity-profile');
          break;
      }
    } else if (userDetails?.approved === true) {
      navigate('/form-preview');
    } else if (reinitializeError) {
      console.log('reinitializeError', reinitializeError);
      setIsLoginSuccess(false);
      dispatch(clearLoginError());
      dispatch(clearReinitializeError());
      dispatch(clearverifyDscerror());
      dispatch(clearAdminUserDetailsError());
      setError('An unexpected error occurred. Please try again.');
      // Reset the execution flag to allow retry
      hasExecutedRef.current = false;
    } else {
      console.log('Error');
      setIsLoginSuccess(false);
      dispatch(clearLoginError());
      dispatch(clearReinitializeError());
      dispatch(clearverifyDscerror());
      dispatch(clearAdminUserDetailsError());
      // Reset the execution flag to allow retry
      hasExecutedRef.current = false;
    }
  }, [
    reinitializeDataResponse,
    reinitializeError,
    navigate,
    dispatch,
    userDetails,
    adminUserDetails,
    adminUserDetailsLoading,
    adminUserDetailsError,
  ]);

  // Clear reinitialize errors on mount
  React.useEffect(() => {
    dispatch(clearReinitializeError());
  }, [dispatch]);

  return (
    <Box sx={{ maxWidth: '330px', mx: 'auto', mt: 4 }}>
      <form onSubmit={handleRegistrationSubmit}>
        {/* API error for login */}
        {errorLogin && !isLoginSuccess && (
          <Typography
            sx={{
              color: '#ff0707',
              fontSize: '13px',
              fontFamily: '"Gilroy-Medium", sans-serif',
            }}
          >
            {errorLogin}
          </Typography>
        )}
        {errorLogin && remainingLoginAttempts !== null && !isLoginSuccess && (
          <Typography
            sx={{
              color: '#ff0707',
              fontSize: '12px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              textAlign: 'left',
              mt: 0.5,
            }}
          >
            Remaining attempts: {remainingLoginAttempts}
          </Typography>
        )}
        {/* API error for DSC verification */}
        {(verifyDscerror || error) && (
          <Typography
            sx={{
              color: '#ff0707',
              fontSize: '13px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              mt: 1,
            }}
          >
            {error || verifyDscerror}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* User ID Field */}
          <Box>
            <Typography
              component="label"
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: '"Gilroy-SemiBold", sans-serif',
                color: '#1a1a1a',
                display: 'block',
                mb: 1,
              }}
            >
              Email ID
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter Email ID"
              value={registrationData.email}
              onChange={(e) => {
                setRegistrationData({
                  ...registrationData,
                  email: e.target.value,
                });
                if (isLoginSuccess) {
                  setIsLoginSuccess(false);
                  setUploadedFile(null);
                }
                if (fieldErrors.email)
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={Boolean(fieldErrors.email)}
              autoComplete="off"
              helperText={fieldErrors.email}
              sx={{
                height: '48px',
                '& .MuiInputBase-root': {
                  height: '48px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#000',
                },
                '& .MuiInputBase-input': {
                  padding: '12px',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d1d1',
                  },
                  '&:hover fieldset': {
                    borderColor: '#d1d1d1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#d1d1d1',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'white',
                    '& .MuiInputBase-input': {
                      color: '#000',
                      WebkitTextFillColor: '#000',
                    },
                  },
                },
              }}
            />
            {/* <Link
              href="./re-forgot-user-id"
              sx={{
                display: 'block',
                textAlign: 'right',
                fontSize: '12px',
                color: '#2a63ff',
                marginTop: '5px',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              // className="link"
            >
              Forgot User ID?
            </Link> */}
          </Box>

          {/* Password Field */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                component="label"
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Gilroy-SemiBold", sans-serif',
                  color: '#1a1a1a',
                }}
              >
                Password
              </Typography>
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
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#666',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#002CBA',
                    },
                  }}
                >
                  <ErrorOutlineIcon sx={{ fontSize: '20px' }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '0px',
                    right: '-340px',
                    marginBottom: '8px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    minWidth: '320px',
                    opacity: 0,
                    visibility: 'hidden',
                    transform: 'translateY(10px)',
                    transition: 'all 0.3s ease',
                    '@media (max-width:768px)': {
                      top: 'auto !important',
                      bottom: '100% !important',
                      left: '50% !important',
                      transform: 'translateX(-105%) translateY(70%) !important',
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
                      fontFamily: '"Gilroy-SemiBold", sans-serif',
                      letterSpacing: 0,
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: '12px',
                    }}
                  >
                    Password must meet the following criteria:
                  </Typography>
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
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'auto',
                            color: rule.isValid ? '#51AE32' : '#FF0808',
                            flexShrink: 0,
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
                              fontFamily: '"Gilroy-Medium", sans-serif',
                              padding: '0',
                              fontSize: '13px',
                              lineHeight: '1.4',
                              color: rule.isValid ? '#51AE32' : '#FF0808',
                              fontWeight: 'normal',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Box>
            <TextField
              fullWidth
              placeholder="Enter Password"
              type={showPassword ? 'text' : 'password'}
              value={registrationData.password}
              onChange={(e) => {
                setRegistrationData({
                  ...registrationData,
                  password: e.target.value,
                });
                if (isLoginSuccess) {
                  setIsLoginSuccess(false);
                  setUploadedFile(null);
                }
                if (fieldErrors.password)
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={Boolean(fieldErrors.password)}
              autoComplete="off"
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      // sx={{ color: '#000' }}
                      sx={{
                        position: 'absolute',
                        right: '12px',
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '20px',
                        padding: 0,
                        marginRight: 0,
                      }}
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
                ),
              }}
              sx={{
                height: '48px',
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
                '& .MuiInputBase-root': {
                  height: '48px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontFamily: showPassword
                    ? '"Gilroy-Medium", sans-serif'
                    : '"Poppins", sans-serif',
                  color: '#000',
                },
                '& .MuiInputBase-input': {
                  padding: '12px',
                  lineHeight: 'normal',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d1d1',
                  },
                  '&:hover fieldset': {
                    borderColor: '#002CBA',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#002CBA',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Link
                href="./re/re-forgot-password"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  fontSize: '12px',
                  color: '#2a63ff',
                  // marginTop: '5px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
                // className="link"
              >
                Forgot Password?
              </Link>
            </Box>
          </Box>

          {/* Submit Button - only show if not submitted */}
          {!isLoginSuccess && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  registrationData.email === '' ||
                  registrationData.password === ''
                }
                sx={{
                  backgroundColor: '#002CBA',
                  color: 'white',
                  textTransform: 'none',
                  width: '224px',
                  height: '48px',
                  fontSize: '16px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#001a8a',
                  },
                }}
              >
                Submit
              </Button>
            </Box>
          )}

          {/* Upload DSC Section - only show after login success */}
          {isLoginSuccess && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 0.5,
                  mb: 1,
                }}
              >
                <Typography
                  component="label"
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Gilroy-SemiBold", sans-serif',
                    color: '#000',
                  }}
                >
                  Upload DSC
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"Gilroy-SemiBold", sans-serif',
                    color: '#ff0707',
                  }}
                >
                  *
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Upload Button */}
                {enableExtension ? (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d={SVG_LOGIN_PATHS.p33e028f0} fill="#002CBA" />
                      </svg>
                    }
                    sx={{
                      borderColor: '#002CBA',
                      color: '#002CBA',
                      textTransform: 'none',
                      height: '48px',
                      fontSize: '16px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      borderRadius: '4px',
                      flex: 1,
                      '&:hover': {
                        borderColor: '#002CBA',
                        backgroundColor: 'rgba(0, 44, 186, 0.04)',
                      },
                    }}
                    onClick={handleFileUpload}
                  >
                    Upload
                    {/* <input
                    type="file"
                    hidden
                    name="dscCertificate"
                    accept=".p12,.pfx,.cer,.crt"
                    onChange={handleFileUpload}
                  /> */}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d={SVG_LOGIN_PATHS.p33e028f0} fill="#002CBA" />
                      </svg>
                    }
                    sx={{
                      borderColor: '#002CBA',
                      color: '#002CBA',
                      textTransform: 'none',
                      height: '48px',
                      fontSize: '16px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      borderRadius: '4px',
                      flex: 1,
                      '&:hover': {
                        borderColor: '#002CBA',
                        backgroundColor: 'rgba(0, 44, 186, 0.04)',
                      },
                    }}
                  >
                    Upload
                    <input
                      type="file"
                      hidden
                      name="dscCertificate"
                      accept=".p12,.pfx,.cer,.crt"
                      onChange={handleFileUploadWithoutExtension}
                    />
                  </Button>
                )}

                {/* Certificate Preview */}
                {uploadedFile && (
                  <Box
                    sx={{
                      width: '56px',
                      height: '56px',
                      position: 'relative',
                      borderRadius: '4px',
                      border: '1px solid #d1d1d1',
                      overflow: 'hidden',
                      backgroundImage: `url(${CSRLogo})`,
                      backgroundSize: '169.31% 100%',
                      backgroundPosition: '0 0',
                      backgroundRepeat: 'round',
                    }}
                  >
                    {/* Green checkmark overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '3.43px',
                        left: '31.71px',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* White circle background */}
                      <Box
                        sx={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          position: 'absolute',
                        }}
                      />
                      {/* Green checkmark */}
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        style={{ position: 'relative', zIndex: 1 }}
                      >
                        <path d={SVG_LOGIN_PATHS.p1132ba00} fill="#54B749" />
                      </svg>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Login Button - only show after submit */}
          {isLoginSuccess && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                onClick={handleRegistrationLogin}
                variant="contained"
                sx={{
                  backgroundColor: '#002CBA',
                  color: 'white',
                  textTransform: 'none',
                  width: '224px',
                  height: '48px',
                  fontSize: '16px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#001a8a',
                  },
                }}
                disabled={reinitializeLoading || !uploadedFile}
              >
                {reinitializeLoading ? 'Initializing...' : 'Login'}
              </Button>
            </Box>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default ResumeRegistrationForm;