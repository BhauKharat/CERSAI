/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { sendOtp } from './slice/sendOtpSlice';
import { validateOtp } from './slice/validateOtpSlice';
import { ValidateOtpRequest } from './types/validateOtpTypes';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  Button,
  Box,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

interface OTPVerificationModalProps {
  open: boolean;
  onClose: () => void;
  mobileNumber: string;
  email: string;
  onVerify: (mobileOtp: string, emailOtp: string) => Promise<boolean>;
  otpIdentifier?: string;
  isCkycVerification?: boolean;
  onCkycVerify?: () => void;
  countryCode?: string;
  showMobileOtp?: boolean; // Control whether to show mobile OTP field
  showEmailOtp?: boolean; // Control whether to show email OTP field
}

const OtpInput = styled(TextField)(({ theme }) => ({
  minWidth: '50px',
  maxWidth: '60px',
  margin: '0 6px',
  '& .MuiOutlinedInput-root': {
    height: '56px',
    borderRadius: '8px',
    '& input': {
      textAlign: 'center',
      padding: theme.spacing(1),
      fontSize: '18px',
      fontFamily: 'Gilroy, sans-serif',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& input': {
        color: '#1A1A1A',
        WebkitTextFillColor: '#1A1A1A',
      },
    },
  },
}));

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  open,
  onClose,
  mobileNumber,
  email,
  onVerify,
  otpIdentifier,
  isCkycVerification,
  onCkycVerify,
  countryCode = '+91',
  showMobileOtp = true, // Default to true for backward compatibility
  showEmailOtp = true, // Default to true for backward compatibility
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const sendOtpLoading = useSelector(
    (state: RootState) => state.sendOtp.loading
  );
  const sendOtpData = useSelector((state: RootState) => state.sendOtp.data);
  const validateOtpLoading = useSelector(
    (state: RootState) => state.validateOtp.loading
  );
  const dialogStyle = {
    '& .MuiDialog-paper': {
      backgroundColor: '#F8F9FD',
      borderRadius: '8px',
      padding: '10px',
      maxWidth: '470px',
      width: '100%',
    },
  };
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState<number>(120);
  const [emailTimer, setEmailTimer] = useState<number>(120);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const mobileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} sec`;
  };

  // Handle OTP input change
  const handleOtpChange = (
    value: string,
    index: number,
    type: 'mobile' | 'email',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const otpArray = type === 'mobile' ? [...mobileOtp] : [...emailOtp];
    otpArray[index] = value.slice(-1); // Only take the last character

    if (type === 'mobile') {
      setMobileOtp(otpArray);
    } else {
      setEmailOtp(otpArray);
    }

    // Move to next input
    if (value && index < 5) {
      const nextInput =
        type === 'mobile'
          ? mobileInputRefs.current[index + 1]
          : emailInputRefs.current[index + 1];
      nextInput?.focus();
    }

    // Move to previous input on backspace
    if (!value && index > 0) {
      const prevInput =
        type === 'mobile'
          ? mobileInputRefs.current[index - 1]
          : emailInputRefs.current[index - 1];
      prevInput?.focus();
    }
  };

  // Handle OTP paste
  const handlePaste = (e: React.ClipboardEvent, type: 'mobile' | 'email') => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const otpArray = pasteData.split('').slice(0, 6);
    if (type === 'mobile') {
      setMobileOtp(otpArray);
      // Only focus email if it's shown
      if (showEmailOtp) {
        emailInputRefs.current[0]?.focus();
      }
    } else {
      setEmailOtp(otpArray);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async (type: 'mobile' | 'email') => {
    try {
      // Prepare OTP request data - only include the field being resent
      const otpRequestData: {
        emailId?: string;
        mobileNo?: string;
        countryCode: string;
        requestType: string;
      } = {
        countryCode: countryCode,
        requestType: 'DIRECT',
      };

      // Only include the field being resent
      if (type === 'mobile' && showMobileOtp) {
        otpRequestData.mobileNo = mobileNumber;
      } else if (type === 'email' && showEmailOtp) {
        otpRequestData.emailId = email;
      }

      // Dispatch send OTP action
      const result = await dispatch(sendOtp(otpRequestData));

      if (sendOtp.fulfilled.match(result)) {
        // Success - reset timers and clear OTP fields
        if (type === 'mobile') {
          setMobileTimer(120);
          setMobileOtp(Array(6).fill(''));
          mobileInputRefs.current[0]?.focus();
        } else {
          setEmailTimer(120);
          setEmailOtp(Array(6).fill(''));
          emailInputRefs.current[0]?.focus();
        }
        console.log('OTP resent successfully');
      } else {
        console.error('Failed to resend OTP:', result.payload);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const mobileOtpStr = mobileOtp.join('');
    const emailOtpStr = emailOtp.join('');

    if (isCkycVerification) {
      if (mobileOtpStr.length !== 6) {
        setError('Please enter complete OTP');
        return;
      }
    } else {
      // Validate based on which OTP fields are shown
      if (showMobileOtp && mobileOtpStr.length !== 6) {
        setError('Please enter complete mobile OTP');
        return;
      }
      if (showEmailOtp && emailOtpStr.length !== 6) {
        setError('Please enter complete email OTP');
        return;
      }
      if (!showMobileOtp && !showEmailOtp) {
        setError('No OTP fields to validate');
        return;
      }
    }

    // Get OTP identifier from props or Redux state
    const identifier = otpIdentifier || sendOtpData?.otpIdentifier;

    if (!identifier) {
      setError('OTP identifier not found. Please resend OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare validate OTP request data
      // ALWAYS include both fields - use "-" if field wasn't changed or not entered
      // Explicitly ensure both fields are always present
      let mobileOtpValue = '-';
      let emailOtpValue = '-';

      if (showMobileOtp && mobileOtpStr.length === 6) {
        mobileOtpValue = mobileOtpStr;
      }

      if (showEmailOtp && emailOtpStr.length === 6) {
        emailOtpValue = emailOtpStr;
      }

      // Explicitly construct the request object to ensure both fields are always present
      const validateOtpRequest: ValidateOtpRequest = {
        identifier: identifier,
        mobileOtp: mobileOtpValue, // Always included, "-" if not shown/entered
        emailOtp: emailOtpValue, // Always included, "-" if not shown/entered
      };

      console.log(
        '🔐 OTP Validation Request:',
        JSON.stringify(validateOtpRequest, null, 2)
      );
      console.log('🔐 OTP Validation Request Details:', {
        showMobileOtp,
        showEmailOtp,
        mobileOtpLength: mobileOtpStr.length,
        emailOtpLength: emailOtpStr.length,
        mobileOtpValue,
        emailOtpValue,
        fullRequest: validateOtpRequest,
      });

      // Dispatch validate OTP action
      const result = await dispatch(validateOtp(validateOtpRequest));

      if (validateOtp.fulfilled.match(result)) {
        // Success - show confirmation
        setShowConfirmation(true);
        // Also call the original onVerify for backward compatibility
        if (isCkycVerification && onCkycVerify) {
          onCkycVerify();
        } else {
          await onVerify(mobileOtpStr, emailOtpStr);
        }
      } else {
        // Handle error
        const errorMessage = result.payload as string;
        setError(errorMessage || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
  };

  // Timer effect
  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  // Reset form when modal is opened
  useEffect(() => {
    if (open) {
      setMobileOtp(Array(6).fill(''));
      setEmailOtp(Array(6).fill(''));
      setMobileTimer(120);
      setEmailTimer(120);
      setError('');
      // Focus first visible input after a small delay to ensure it's rendered
      const timer = setTimeout(() => {
        if (showMobileOtp) {
          mobileInputRefs.current[0]?.focus();
        } else if (showEmailOtp) {
          emailInputRefs.current[0]?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, showMobileOtp, showEmailOtp]);

  // Check if required OTPs are complete based on which fields are shown
  const isFormValid = isCkycVerification
    ? mobileOtp.every((digit) => digit !== '')
    : (showMobileOtp ? mobileOtp.every((digit) => digit !== '') : true) &&
      (showEmailOtp ? emailOtp.every((digit) => digit !== '') : true);

  // Mask email and mobile
  const maskedEmail = email
    ? `${email[0]}****${email.substring(email.indexOf('@') - 1)}`
    : '';
  const maskedMobile = mobileNumber
    ? `${mobileNumber.slice(0, 2)}******${mobileNumber.slice(-2)}`
    : '';

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {}} // Prevent closing by setting empty function
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        sx={dialogStyle}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontFamily: 'Gilroy, sans-serif',
              ml: 1,
            }}
          >
            {isCkycVerification ? 'CKYC' : 'OTP'} Verification
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              position: 'absolute',
              right: '8px',
              top: '8px',
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Mobile OTP Section - Only show if showMobileOtp is true */}
            {showMobileOtp && (
              <Box mb={4}>
                <Box
                  display="flex"
                  alignItems="center"
                  mb={1}
                  width="100%"
                  position="relative"
                  minHeight="32px"
                >
                  <Box position="absolute" width="200px">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontFamily: 'Gilroy, sans-serif',
                        ml: 1,
                      }}
                    >
                      Mobile OTP
                      <span style={{ color: '#FF4D4F', marginLeft: 4 }}>*</span>
                    </Typography>
                  </Box>
                  {isCkycVerification ? (
                    <Box
                      position="absolute"
                      right="0"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666666',
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                        }}
                      >
                        {formatTime(mobileTimer)}
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleResendOtp('mobile')}
                        disabled={sendOtpLoading || mobileTimer > 0}
                        sx={{
                          color: '#002CBA !important',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: 'Gilroy, sans-serif',
                          fontSize: '14px',
                          p: 0,
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                          },
                          '&.Mui-disabled': { color: '#002CBA !important' },
                        }}
                      >
                        Resend OTP
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      position="absolute"
                      left="calc(50% + 140px)"
                      whiteSpace="nowrap"
                    >
                      {mobileTimer > 0 ? (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {formatTime(mobileTimer)}
                        </Typography>
                      ) : (
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => handleResendOtp('mobile')}
                          disabled={sendOtpLoading}
                          sx={{
                            color: '#002CBA',
                            textTransform: 'none',
                            fontWeight: 500,
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': { backgroundColor: 'transparent' },
                            '&:disabled': { color: '#757575' },
                          }}
                        >
                          {sendOtpLoading ? 'Sending...' : 'Resend OTP'}
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>

                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="8px"
                  mb={1}
                  width="100%"
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <OtpInput
                      key={`mobile-${index}`}
                      inputRef={(el) => (mobileInputRefs.current[index] = el)}
                      value={mobileOtp[index]}
                      onChange={(e) =>
                        handleOtpChange(e.target.value, index, 'mobile', e)
                      }
                      onPaste={(e) => handlePaste(e, 'mobile')}
                      disabled={mobileTimer === 0}
                      inputProps={{
                        maxLength: 1,
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Backspace' &&
                          !mobileOtp[index] &&
                          index > 0
                        ) {
                          mobileInputRefs.current[index - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </Box>
                {!isCkycVerification && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    ml={2}
                    mt={0.5}
                  >
                    OTP sent on {maskedMobile}
                  </Typography>
                )}
              </Box>
            )}

            {/* Email OTP Section - Only show if showEmailOtp is true and not CKYC verification */}
            {!isCkycVerification && showEmailOtp && (
              <Box mb={4}>
                <Box
                  display="flex"
                  alignItems="center"
                  mb={1}
                  width="100%"
                  position="relative"
                  minHeight="32px"
                >
                  <Box position="absolute" width="200px">
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontFamily: 'Gilroy, sans-serif',
                        ml: 1,
                      }}
                    >
                      Email OTP
                      <span style={{ color: '#FF4D4F', marginLeft: 4 }}>*</span>
                    </Typography>
                  </Box>
                  <Box
                    position="absolute"
                    left="calc(50% + 140px)"
                    whiteSpace="nowrap"
                  >
                    {emailTimer > 0 ? (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {formatTime(emailTimer)}
                      </Typography>
                    ) : (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleResendOtp('email')}
                        disabled={sendOtpLoading}
                        sx={{
                          color: '#002CBA',
                          textTransform: 'none',
                          fontWeight: 500,
                          p: 0,
                          minWidth: 'auto',
                          '&:hover': { backgroundColor: 'transparent' },
                          '&:disabled': { color: '#757575' },
                        }}
                      >
                        {sendOtpLoading ? 'Sending...' : 'Resend OTP'}
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="8px"
                  mb={1}
                  width="100%"
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <OtpInput
                      key={`email-${index}`}
                      inputRef={(el) => (emailInputRefs.current[index] = el)}
                      value={emailOtp[index]}
                      onChange={(e) =>
                        handleOtpChange(e.target.value, index, 'email', e)
                      }
                      onPaste={(e) => handlePaste(e, 'email')}
                      disabled={emailTimer === 0}
                      inputProps={{
                        maxLength: 1,
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && index === 5 && isFormValid) {
                          const form = (e.target as HTMLElement).closest(
                            'form'
                          );
                          if (form) {
                            const submitEvent = new Event('submit', {
                              cancelable: true,
                            });
                            form.dispatchEvent(submitEvent);
                          }
                        } else if (
                          e.key === 'Backspace' &&
                          !emailOtp[index] &&
                          index > 0
                        ) {
                          emailInputRefs.current[index - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  ml={2}
                  mt={0.5}
                >
                  OTP sent on {maskedEmail}
                </Typography>
              </Box>
            )}

            {/* Note for CKYC Verification */}
            {isCkycVerification && (
              <Box mb={3} ml={1}>
                <Typography
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontSize: '14px',
                    color: '#000000',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Note:</strong> Please enter the OTP sent to your email
                  ID / mobile number linked with your CKYC record.
                </Typography>
              </Box>
            )}

            {error && (
              <Box mb={2} textAlign="center">
                <Typography color="error" variant="caption">
                  {error}
                </Typography>
              </Box>
            )}

            <Box display="flex" justifyContent="center" width="100%" mt={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={!isFormValid || isSubmitting || validateOtpLoading}
                sx={
                  isCkycVerification
                    ? {
                        width: '250px',
                        py: 1.5,
                        backgroundColor: '#002CBA !important',
                        color: '#FFFFFF !important',
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        textTransform: 'none',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: '#001F8B',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#002CBA !important',
                          color: '#FFFFFF !important',
                        },
                      }
                    : {
                        width: '200px',
                        py: 1.5,
                        backgroundColor: isFormValid
                          ? '#002CBA'
                          : 'rgba(0, 0, 0, 0.12)',
                        color: isFormValid ? '#FFFFFF' : 'rgba(0, 0, 0, 0.26)',
                        '&:hover': {
                          backgroundColor: isFormValid
                            ? '#0024A3'
                            : 'rgba(0, 0, 0, 0.12)',
                        },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)',
                        },
                      }
                }
              >
                {isSubmitting || validateOtpLoading ? 'Verifying...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={showConfirmation}
        onClose={handleConfirmationClose}
        message={
          showMobileOtp && showEmailOtp
            ? 'Email and Mobile OTP Verified Successfully!'
            : showMobileOtp
              ? 'Mobile OTP Verified Successfully!'
              : showEmailOtp
                ? 'Email OTP Verified Successfully!'
                : 'OTP Verified Successfully!'
        }
        onConfirm={handleConfirmationClose}
      />
    </>
  );
};

export default OTPVerificationModal;
