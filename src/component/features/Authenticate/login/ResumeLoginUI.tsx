import React from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as EyeIcon } from '../../../../assets/eye.svg';
import closeEye from '../../../../assets/closeEye.svg';
import CSRLogo from '../../../../assets/CSR-File.svg';
import { SVG_LOGIN_PATHS } from '../../../../constants/svgPaths';
import { Link } from 'react-router-dom';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

type Props = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: () => void;
  onNoExtensionFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoginClick: () => void;
  isLoginSuccess: boolean;
  uploadedFile: File | null;
  errorLogin?: string | null;
  remainingLoginAttempts?: number | null;
  verifyDscError?: string | null;
  reinitializeLoading?: boolean;
  fieldErrors?: { email?: string; password?: string };
  enableExtension?: boolean;
};

const ResumeLoginUI: React.FC<Props> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onFileChange,
  onNoExtensionFileChange,
  onLoginClick,
  isLoginSuccess,
  uploadedFile,
  errorLogin,
  remainingLoginAttempts,
  verifyDscError,
  reinitializeLoading,
  fieldErrors,
  enableExtension,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

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
  const passwordRules = getPasswordRules(password);

  return (
    <Box sx={{ maxWidth: '330px', mx: 'auto', mt: 4 }}>
      <form onSubmit={onSubmit} autoComplete="on" noValidate>
        {/* API error for login */}
        {errorLogin && !isLoginSuccess && (
          <Typography
            sx={{
              color: '#ff0707',
              fontSize: '13px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              textAlign: 'left',
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
        {verifyDscError && (
          <Typography
            sx={{
              color: '#ff0707',
              fontSize: '13px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              mt: 1,
            }}
          >
            {verifyDscError}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Email ID Field */}
          <Box>
            <Typography
              component="label"
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: '"Gilroy-SemiBold", sans-serif',
                color: '#1a1a1a',
                display: 'block',
                textAlign: 'left',
                mb: 1,
              }}
            >
              User ID
            </Typography>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              name="login_email"
              autoComplete="email"
              placeholder="Enter your User ID"
              error={Boolean(fieldErrors?.email)}
              helperText={fieldErrors?.email}
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
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#002CBA',
                  cursor: 'pointer',
                }}
              >
                <Link to="/re-forgot-user-id">Forgot User ID?</Link>
              </Typography>
            </Box>
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
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 'auto',
                            color: rule.isValid ? '#51AE32' : '#FF0808',
                            // flexShrink: 0,
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              name="login_password"
              autoComplete="current-password"
              placeholder="Enter your Password"
              error={Boolean(fieldErrors?.password)}
              helperText={fieldErrors?.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
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
              <Typography
                sx={{
                  fontSize: '12px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#002CBA',
                  cursor: 'pointer',
                }}
              >
                <Link to="/re-forgot-password">Forgot Password?</Link>
              </Typography>
            </Box>
          </Box>

          {/* Submit Button - only show if not submitted */}
          {!isLoginSuccess && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={email === '' || password === ''}
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
                    onClick={onFileChange}
                  >
                    Upload
                    {/* <input
                    type="file"
                    hidden
                    name="dscCertificate"
                    accept=".p12,.pfx,.cer,.crt"
                    onChange={onFileChange}
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
                      onChange={onNoExtensionFileChange}
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
                onClick={onLoginClick}
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
      <Typography
        variant="body2"
        sx={{
          fontFamily: "'Gilroy', sans-serif",
          letterSpacing: 0,
          textAlign: 'center',
          fontSize: '12px',
          color: '#1D1D1B',
          marginTop: '30px',
          fontWeight: '400',
        }}
        // className="register-link"
      >
        Not registered yet on CKYCRR? Click
        <Link
          to="/re-signup"
          style={{
            color: '#002CBA',
            textDecoration: 'none',
            fontWeight: '400',
            fontSize: '12px',
            marginLeft: '5px',
          }}
          // underline="hover"
        >
          Register Now
        </Link>
      </Typography>
    </Box>
  );
};

export default ResumeLoginUI;
