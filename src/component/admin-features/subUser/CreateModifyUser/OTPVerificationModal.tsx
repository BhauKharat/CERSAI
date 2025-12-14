import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
// import { sendOtp } from './slice/sendOtpSlice';
import { validateOtpHandle, resendOtpReq } from './slice/validateOtpSlice';
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
  otpType?: 'both' | 'mobile' | 'email';
}

const OtpInput = styled(TextField)(({ theme }) => ({
  minWidth: '40px',
  maxWidth: '50px',
  margin: '0 4px',
  '& .MuiOutlinedInput-root': {
    height: '48px',
    '& input': {
      textAlign: 'center',
      padding: theme.spacing(1),
      fontSize: '18px',
      fontFamily: 'Gilroy, sans-serif',
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
  otpType = 'both',
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
  const [mobileTimer, setMobileTimer] = useState<number>(30);
  const [emailTimer, setEmailTimer] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [mobileResendAttempts, setMobileResendAttempts] = useState<number>(0);
  const [emailResendAttempts, setEmailResendAttempts] = useState<number>(0);

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
      emailInputRefs.current[0]?.focus();
    } else {
      setEmailOtp(otpArray);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async (type: string) => {
    try {
      const identifier = otpIdentifier || sendOtpData?.otpIdentifier;
      if (!identifier) {
        console.error('OTP identifier not found');
        return;
      }

      // Dispatch resend OTP action with payload matching ResendOtpPayload interface
      const result = await dispatch(
        resendOtpReq({
          otpIdentifier: identifier,
          type: type.toLocaleLowerCase() === 'mobile' ? 'mobile' : 'email',
        })
      );

      if (resendOtpReq.fulfilled.match(result)) {
        // Success - reset timers and clear OTP fields
        if (type === 'mobile') {
          // Escalating cooldowns per resend
          const next = mobileResendAttempts + 1;
          setMobileResendAttempts(next);
          if (next === 1) setMobileTimer(30);
          else if (next === 2) setMobileTimer(60);
          else setMobileTimer(90);

          setMobileOtp(Array(6).fill(''));
          mobileInputRefs.current[0]?.focus();
        } else {
          // Escalating cooldowns per resend
          const next = emailResendAttempts + 1;
          setEmailResendAttempts(next);
          if (next === 1) setEmailTimer(30);
          else if (next === 2) setEmailTimer(60);
          else setEmailTimer(90);

          setEmailOtp(Array(6).fill(''));
          emailInputRefs.current[0]?.focus();
        }
        // Clear any previous errors
        setError('');
      } else {
        // Handle error
        const errorMessage = result.payload as string;
        setError(errorMessage || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const mobileOtpStr = mobileOtp.join('');
    const emailOtpStr = emailOtp.join('');

    const isMobileComplete =
      otpType === 'email' ||
      (mobileOtpStr.length === 6 && /^\d+$/.test(mobileOtpStr));
    const isEmailComplete =
      otpType === 'mobile' ||
      (emailOtpStr.length === 6 && /^\d+$/.test(emailOtpStr));

    if (!isMobileComplete || !isEmailComplete) {
      setError('Please enter complete OTP for both mobile and email');
      return;
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
      // Always send both fields, use "-" for unused OTP
      const validateOtpRequest = {
        identifier: identifier,
        // signUpValidation: false,
        mobileOtp:
          otpType !== 'email' && mobileOtpStr && mobileOtpStr.trim() !== ''
            ? mobileOtpStr
            : '-',
        emailOtp:
          otpType !== 'mobile' && emailOtpStr && emailOtpStr.trim() !== ''
            ? emailOtpStr
            : '-',
      };

      // Dispatch validate OTP action
      const result = await dispatch(validateOtpHandle(validateOtpRequest));

      if (validateOtpHandle.fulfilled.match(result)) {
        // Success - show confirmation
        setShowConfirmation(true);
        // Also call the original onVerify for backward compatibility
        await onVerify(mobileOtpStr, emailOtpStr);
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
      setMobileResendAttempts(0);
      setEmailResendAttempts(0);
      setMobileTimer(30);
      setEmailTimer(30);
      setError('');
      // Focus first input after a small delay to ensure it's rendered
      const timer = setTimeout(() => {
        if (otpType !== 'email') {
          mobileInputRefs.current[0]?.focus();
        } else {
          emailInputRefs.current[0]?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, otpType]);

  // Check if both OTPs are complete
  const isFormValid =
    (otpType === 'email' || mobileOtp.every((digit) => digit !== '')) &&
    (otpType === 'mobile' || emailOtp.every((digit) => digit !== ''));

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
            OTP Verification
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
            {/* Mobile/Email OTP Section */}
            {(otpType === 'both' || otpType === 'mobile') && (
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
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  ml={2}
                  mt={0.5}
                >
                  OTP sent on {maskedMobile}
                </Typography>
              </Box>
            )}

            {/* Email OTP Section */}
            {(otpType === 'both' || otpType === 'email') && (
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
                        {sendOtpLoading ? 'Sending...' : 'Resend'}
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
                sx={{
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
                }}
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
          otpType === 'both'
            ? 'Email & Mobile OTP verified successfully'
            : otpType === 'email'
              ? 'Email OTP verified successfully'
              : 'Mobile OTP verified successfully'
        }
        onConfirm={handleConfirmationClose}
      />
    </>
  );
};

export default OTPVerificationModal;
