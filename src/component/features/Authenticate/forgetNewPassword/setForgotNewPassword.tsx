/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import '../setupPassword/SetNewPassword.css';
import { ReactComponent as CKYCRRLogo } from '../../../../assets/ckycrr_sign_up_logo.svg';
import { ReactComponent as BackArrowIcon } from '../../../../assets/back_arrow.svg';
import { ReactComponent as EyeIcon } from '../../../../assets/eye.svg';
// import { ReactComponent as EyeOffIcon } from '../../../../assets/eye_off.svg';
import PasswordSavedModal from '../passwordSetup/PasswordSavedModal';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import signupbg from '../../../../assets/sign_up_bg.svg';
import { AppDispatch, RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setNewPasswordWithDsc } from '../slice/authSlice';
import { toast } from 'react-toastify';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import UploadIconButton from '../../../../assets/UploadIconButton.svg';
import thumbnailpassword from '../../../../assets/thumbnail.png';

import closeEye from '../../../../assets/closeEye.svg';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { useParams } from 'react-router-dom';
const SetForgotNewPassword: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  // Decode the base64 encoded userId if it's encoded
  const decodedUserId = userId ?? null;

  console.log('URL userId:', userId);
  console.log('Decoded userId:', decodedUserId);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dscFile, setDscFile] = useState<File | null>(null);
  const [isDscUploaded, setIsDscUploaded] = useState(false);
  const [dscCertificateBase64, setDscCertificateBase64] = useState<string>('');

  const [previewData, setPreviewData] = useState<string | null>(null);

  const { loading, success, error } = useSelector(
    (state: RootState) => state.passSetup
  );
  const handleDscUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage('');
    setApiErrorMessage('');
    const file = event.target.files?.[0];
    if (!file) return;

    setDscFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setDscCertificateBase64(base64);
      setIsDscUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const dispatch = useDispatch<AppDispatch>();
  const forgotUserId = useSelector(
    (state: RootState) => state.auth.forgotPasswordUserId
  );
  const [passwordRules, setPasswordRules] = useState([
    { label: 'At least 8–16 characters.', isValid: false },
    { label: 'At least one uppercase letter (A–Z)', isValid: false },
    { label: 'At least one lowercase letter (a–z)', isValid: false },
    { label: 'At least one numeric digit (0–9)', isValid: false },
    { label: 'At least one special character (!@#$%^&*_-+=)', isValid: false },
    { label: 'No spaces allowed', isValid: false },
  ]);
  const validatePassword = (password: string) => {
    const isLengthValid = password.length >= 8 && password.length <= 16;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*_\-+=]/.test(password);
    const hasNoSpaces = !/\s/.test(password);

    const updatedRules = [
      { label: 'At least 8–16 characters.', isValid: isLengthValid },
      { label: 'At least one uppercase letter (A–Z)', isValid: hasUppercase },
      { label: 'At least one lowercase letter (a–z)', isValid: hasLowercase },
      { label: 'At least one numeric digit (0–9)', isValid: hasNumber },
      {
        label: 'At least one special character (!@#$%^&*_-+=)',
        isValid: hasSpecialChar,
      },
      { label: 'No spaces allowed', isValid: hasNoSpaces },
    ];

    // Update the rules state
    setPasswordRules(updatedRules);
  };

  const handlePasswordChange = (e: { target: { value: string } }) => {
    const password = e.target.value;
    setNewPassword(password); // Store password in state
    validatePassword(password); // Validate the password
  };

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Add your redirect to login logic here
  };

  const handleSubmit = async () => {
    if (!dscFile) {
      toast.error('Please upload a DSC file.');
      return;
    }
    if (!decodedUserId && !userId) {
      toast.error('User ID not found. Please go back and re-enter email.');
      return;
    }

    if (isFormValid) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];

        dispatch(showLoader('Please Wait...')); // 🟢 Show loader
        setApiErrorMessage(''); // Clear previous errors

        try {
          await dispatch(
            setNewPasswordWithDsc({
              newPassword: newPassword,
              dscCertificateBase64: dscCertificateBase64,
              email: decodedUserId || userId || '',
            })
          ).unwrap();

          toast.success('Password reset completed successfully');
          setIsModalOpen(true);
          setApiErrorMessage(''); // Clear error on success
        } catch (err: unknown) {
          // The error from Redux thunk is returned as a string directly
          const errorMsg =
            typeof err === 'string' ? err : 'Failed to reset password';

          console.log('errorMsg__', errorMsg);

          setApiErrorMessage(errorMsg); // Display error below submit button
          toast.error(errorMsg);
        } finally {
          dispatch(hideLoader()); // 🔴 Hide loader
        }
      };

      reader.readAsDataURL(dscFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDscFile(file);

      // Create object URL for preview (works for any file)
      const objectUrl = URL.createObjectURL(file);
      setPreviewData(objectUrl);

      toast.success('File uploaded. Click Submit.');
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Validate passwords using useEffect to avoid re-renders
  useEffect(() => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('');
      setIsFormValid(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsFormValid(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setErrorMessage('Password must be 8-16 characters.');
      setIsFormValid(false);
      return;
    }

    setErrorMessage('');
    setIsFormValid(true);
  }, [newPassword, confirmPassword]);

  return (
    <Box
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      sx={{
        minHeight: '100vh',
        background: `url(${signupbg}) center/cover no-repeat`,
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
          // className="header"
        >
          <CKYCRRLogo className="logo" />
        </Box>
        {/* <h2>Set New Password</h2> */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'inherit',
            fontSize: '22px',
            fontWeight: '600',
            color: '#333333',
            textAlign: 'center',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          Set New Password
        </Typography>

        <Box mb={'15px'}>
          {apiErrorMessage && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Gilroy', sans-serif",
                color: 'red',
                fontSize: '12px',
                marginTop: '10px',
                marginBottom: '10px',
                textAlign: 'left',
                fontWeight: 'normal',
              }}
            >
              {apiErrorMessage}
            </Typography>
          )}
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
                fontFamily: 'inherit',
                textAlign: 'start' /* right align the link */,
                display: 'block',
                fontSize: '14px',
                color: '#333',
                fontWeight: 'normal',
                marginBottom: '8px',
                // width: width,
                paddingLeft: '0',
              }}
            >
              Password
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
                sx={{
                  color: '#666',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: '#002CBA', // change to red on hover
                  },
                }}
                // className="info-icon"
              >
                <ErrorOutlineIcon />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  /* bottom: 100%; */
                  /* right: 0px; */
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

          <TextField
            id="new-password"
            fullWidth
            variant="outlined"
            // label="New Password"
            placeholder="Enter new password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handlePasswordChange}
            inputProps={{
              maxLength: 16,
            }}
            InputProps={{
              endAdornment: (
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
                    {/* {showPassword ? <VisibilityOff /> : <Visibility />} */}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              // root TextField level adjustments
              // '&.MuiFormControl-root': {
              //   width: width,
              // },
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
                // border: '1px solid #ddd',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px',
                // fontWeight: '400',
                transition: 'border-color 0.3s',
                // normal border
                '& fieldset': {
                  borderColor: '#ddd',
                },
                // on hover remove border
                '&:hover fieldset': {
                  borderColor: `${error ? 'red' : '#ddd'}`,
                },
                // on focus (if you want)
                '&.Mui-focused fieldset': {
                  border: '1px solid',
                  borderColor: `${error ? 'red' : '#002CBA'}`,
                  transition: 'border-color 0.3s',
                },
              },
              // inner input padding/font to match screenshot
              '& .MuiInputBase-input': {
                fontFamily: "'Gilroy', sans-serif",
                padding: '14px 16px',
                fontSize: '14px',
                // fontWeight: '400',
                color: '#222',
              },
              '& .MuiInputBase-input::placeholder': {
                fontFamily: "'Gilroy', sans-serif", // placeholder font
                fontSize: '14px',
                // padding: '14px 16px',
                // fontStyle: 'italic',
                color: '#222',
                // opacity: 1, // ensure placeholder is fully visible
              },
              '& .MuiFormHelperText-root.Mui-error': {
                fontFamily: "'Gilroy', sans-serif",
                fontSize: '12px',
                color: 'red',
                marginTop: '5px',
                marginLeft: '0',
                // paddingLeft: '9%',
              },
              //   '& .MuiFormHelperText-root': {
              //     fontSize: '12px',
              //     color: 'red',
              //     marginTop: '5px',
              //     // paddingLeft: '9%',
              //   },
            }}
          />
        </Box>

        {/* <div className="input-group">
          <div style={{ display: 'flex', gap: '220px' }}>
            <label htmlFor="set-newPassword">New Password</label>
            <div
              className="tooltip-icon"
              style={{ marginTop: '8px', marginLeft: '60px' }}
            >
              <span className="info-icon">
                <ErrorOutlineIcon />
              </span>
              <div
                className="tooltip-box"
                style={{ marginTop: '130px', height: '185px' }}
              >
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
                        marginBottom: '9px', // Adjust the spacing between rows here
                      }}
                    >
                      {rule.isValid ? (
                        <CheckCircleOutlineRoundedIcon
                          fontSize="small"
                          style={{ color: '#51AE32' }}
                        />
                      ) : (
                        <CancelOutlinedIcon
                          fontSize="small"
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
              id="set-newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={handlePasswordChange}
            />
            <span
              className="eye-icon"
              onClick={togglePasswordVisibility}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  togglePasswordVisibility();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
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
            }}
          >
            <InputLabel
              sx={{
                fontFamily: 'inherit',
                textAlign: 'start' /* right align the link */,
                display: 'block',
                fontSize: '14px',
                color: '#333',
                fontWeight: 'normal',
                marginBottom: '8px',
                // width: width,
                paddingLeft: '0',
              }}
            >
              Re-enter Password
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
                sx={{
                  color: '#666',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: '#002CBA', // change to red on hover
                  },
                }}
                // className="info-icon"
              >
                <ErrorOutlineIcon />
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  /* bottom: 100%; */
                  /* right: 0px; */
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

          <TextField
            id="re-newpassword"
            fullWidth
            variant="outlined"
            // label="New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            inputProps={{
              maxLength: 16,
            }}
            InputProps={{
              endAdornment: (
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
                    onClick={toggleConfirmPasswordVisibility}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleConfirmPasswordVisibility();
                      }
                    }}
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon />
                    ) : (
                      <img
                        src={closeEye}
                        alt="Show password"
                        className="w-5 h-5"
                      />
                    )}
                    {/* {showPassword ? <VisibilityOff /> : <Visibility />} */}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              // root TextField level adjustments
              // '&.MuiFormControl-root': {
              //   width: width,
              // },
              '& .MuiOutlinedInput-root': {
                // border: '1px solid #ddd',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '14px',
                // fontWeight: '400',
                transition: 'border-color 0.3s',
                // normal border
                '& fieldset': {
                  borderColor: '#ddd',
                },
                // on hover remove border
                '&:hover fieldset': {
                  borderColor: `${error ? 'red' : '#ddd'}`,
                },
                // on focus (if you want)
                '&.Mui-focused fieldset': {
                  border: '1px solid',
                  borderColor: `${error ? 'red' : '#002CBA'}`,
                  transition: 'border-color 0.3s',
                },
              },
              // inner input padding/font to match screenshot
              '& .MuiInputBase-input': {
                fontFamily: "'Gilroy', sans-serif",
                padding: '14px 16px',
                fontSize: '14px',
                // fontWeight: '400',
                color: '#222',
              },
              '& .MuiInputBase-input::placeholder': {
                fontFamily: "'Gilroy', sans-serif", // placeholder font
                fontSize: '14px',
                // padding: '14px 16px',
                // fontStyle: 'italic',
                color: '#222',
                // opacity: 1, // ensure placeholder is fully visible
              },
              '& .MuiFormHelperText-root.Mui-error': {
                fontFamily: "'Gilroy', sans-serif",
                fontSize: '12px',
                color: 'red',
                marginTop: '5px',
                marginLeft: '0',
                // paddingLeft: '9%',
              },
              //   '& .MuiFormHelperText-root': {
              //     fontSize: '12px',
              //     color: 'red',
              //     marginTop: '5px',
              //     // paddingLeft: '9%',
              //   },
            }}
          />
        </Box>

        {/* <div className="input-group">
          <div style={{ display: 'flex', gap: '220px' }}>
            <label htmlFor="re-enternewpassword">Re-Enter New Password</label>
            <div className="tooltip-icon" style={{ marginTop: '22px' }}>
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
                        marginBottom: '9px',
                      }}
                    >
                      {rule.isValid ? (
                        <CheckCircleOutlineRoundedIcon
                          fontSize="small"
                          style={{ color: '#51AE32' }}
                        />
                      ) : (
                        <CancelOutlinedIcon
                          fontSize="small"
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
              id="re-enternewpassword"
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
                  togglePasswordVisibility();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </span>
          </div>
        </div> */}

        {/* {errorMessage && <p className="error-message">{errorMessage}</p>} */}
        {errorMessage && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'inherit',
              color: 'red',
              fontSize: '14px',
              marginBottom: '10px',
              textAlign: 'center',
            }}
            color="error"
          >
            {errorMessage}
          </Typography>
        )}
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
            <Button
              variant="contained"
              component="label"
              sx={{
                border: '1px solid #002cba',
                color: '#002cba',
                padding: '12px 24px',
                borderRadius: '12px',
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
                  style={{ width: 24, height: 24, objectFit: 'contain' }}
                />
              } // or replace with <img src={UploadIconButton} alt="Upload" width={24} height={24} />
            >
              Upload DSC
              <input
                hidden
                accept=".cer,.crt"
                type="file"
                style={{ display: 'none' }}
                onChange={handleDscUpload}
              />
            </Button>

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
            <Button
              variant="contained"
              component="label"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f9ff',
                border: '1px solid #002cba',
                borderRadius: '10px',
                color: '#002cba',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '16px',
                gap: '8px',
                margin: '20px auto',
                maxWidth: '100%',
                padding: '12px 20px',
                textAlign: 'center',
                transition: 'background .3s, color .3s',
                boxShadow: 'none',
                letterSpacing: 0,
                textTransform: 'capitalize',
                lineHeight: 0,
                '&:hover': {
                  backgroundColor: '#e0e8ff',
                  boxShadow: 'none',
                },
                '& .MuiButton-startIcon': {
                  margin: 0, // spacing between icon and text
                },
              }}
              startIcon={
                <FileUploadOutlinedIcon
                  sx={{
                    width: 22,
                    height: 22,
                  }}
                />
              } // or replace with <img src={UploadIconButton} alt="Upload" width={24} height={24} />
            >
              Upload
              <input
                id="dscUpload"
                accept=".cer,.crt"
                type="file"
                style={{ display: 'none' }}
                onChange={handleDscUpload}
              />
            </Button>
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
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || !dscFile}
          sx={{
            display: 'flex',
            justifyContent: 'center',
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
            margin: '10px auto',
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
          {'Submit'}
        </Button>
      </Box>
      <PasswordSavedModal
        isOpen={isModalOpen}
        onClose={closeModal}
        redirectURL={'/re-signup?tab=1'}
      />
    </Box>
  );
};

export default SetForgotNewPassword;
