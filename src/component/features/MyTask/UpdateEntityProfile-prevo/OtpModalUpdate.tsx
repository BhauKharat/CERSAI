import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { validateOtp } from '../../../../redux/slices/registerSlice/authSlice';
import { RootState, AppDispatch } from '../../../../redux/store';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import { resendOtpReq } from '../../../../component/ui/Modal/slice/otpModalSlice';

interface OTPModalProps {
  mobileChange: boolean;
  emailChange: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOtpSubmit: (mobileOtp: string, emailOtp: string) => void;
  countryCode: string | undefined;
  email: string | undefined;
  mobile: string | undefined;
}

const OTPModalUpdate: React.FC<OTPModalProps> = ({
  emailChange,
  mobileChange,
  isOpen,
  onClose,
  onOtpSubmit,
  countryCode,
  email,
  mobile,
}) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(30);
  const [emailTimer, setEmailTimer] = useState(30);
  const [mobileResendCount, setMobileResendCount] = useState(0);
  const [emailResendCount, setEmailResendCount] = useState(0);
  const [isMobileOtpValid, setIsMobileOtpValid] = useState(true);
  const [isEmailOtpValid, setIsEmailOtpValid] = useState(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [resendError, setResendError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const dispatch = useDispatch<AppDispatch>();
  const identifier = useSelector(
    (state: RootState) => state.passSetupOtp.otpIdentifier
  );

  // Constants for resend limits
  const MAX_RESEND_ATTEMPTS = 2;

  // Determine what to show based on props
  const showMobileOnly = mobileChange && !emailChange;
  const showEmailOnly = emailChange && !mobileChange;
  const showBoth = mobileChange && emailChange;

  // Check if OTPs are complete based on what's being shown
  const isMobileOtpComplete = mobileOtp.every((digit) => digit !== '');
  const isEmailOtpComplete = emailOtp.every((digit) => digit !== '');

  const isSubmitEnabled = showBoth
    ? isMobileOtpComplete && isEmailOtpComplete
    : showMobileOnly
      ? isMobileOtpComplete
      : showEmailOnly
        ? isEmailOtpComplete
        : false;

  // Check if resend limit reached
  const isMobileResendDisabled = mobileResendCount >= MAX_RESEND_ATTEMPTS;
  const isEmailResendDisabled = emailResendCount >= MAX_RESEND_ATTEMPTS;

  // Countdown timers
  useEffect(() => {
    if (!isOpen) return;

    const intervals: NodeJS.Timeout[] = [];

    if (showMobileOnly || showBoth) {
      const mobileInterval = setInterval(() => {
        setMobileTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      intervals.push(mobileInterval);
    }

    if (showEmailOnly || showBoth) {
      const emailInterval = setInterval(() => {
        setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      intervals.push(emailInterval);
    }

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isOpen, showMobileOnly, showEmailOnly, showBoth]);

  const formatTime = (sec: number) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
  };

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: 'mobile' | 'email'
  ) => {
    const value = e.target.value;
    const otpArray = type === 'mobile' ? [...mobileOtp] : [...emailOtp];

    if (/^\d?$/.test(value)) {
      otpArray[index] = value;
      if (type === 'mobile') {
        setMobileOtp(otpArray);
        setIsMobileOtpValid(true);
        setMobileErrorMessage('');
      } else {
        setEmailOtp(otpArray);
        setIsEmailOtpValid(true);
        setEmailErrorMessage('');
      }

      if (value && index < otpArray.length - 1) {
        const nextInput =
          type === 'mobile'
            ? mobileOtpRefs.current[index + 1]
            : emailOtpRefs.current[index + 1];
        if (nextInput) nextInput.focus();
      }
    }

    if (value === '' && index > 0) {
      const prevInput =
        type === 'mobile'
          ? mobileOtpRefs.current[index - 1]
          : emailOtpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    type: 'mobile' | 'email'
  ) => {
    if (
      e.key === 'Backspace' &&
      !(type === 'mobile' ? mobileOtp[index] : emailOtp[index]) &&
      index > 0
    ) {
      const prevInput =
        type === 'mobile'
          ? mobileOtpRefs.current[index - 1]
          : emailOtpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const handleResend = async (type: 'EMAIL' | 'MOBILE') => {
    const currentIdentifier = identifier;
    if (!currentIdentifier) {
      console.error('Identifier not found');
      return;
    }

    const currentCount =
      type === 'MOBILE' ? mobileResendCount : emailResendCount;
    if (currentCount >= MAX_RESEND_ATTEMPTS) {
      return;
    }

    try {
      await dispatch(
        resendOtpReq({
          identifier: currentIdentifier,
          type,
        })
      ).unwrap();

      if (type === 'MOBILE') {
        const nextCount = mobileResendCount + 1;
        setMobileResendCount(nextCount);
        setMobileTimer(getResendTimer(nextCount));
      } else {
        const nextCount = emailResendCount + 1;
        setEmailResendCount(nextCount);
        setEmailTimer(getResendTimer(nextCount));
      }
      setResendError('');
      console.log(`${type.toUpperCase()} OTP resent successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to resend OTP';
      setResendError(errorMessage);
      console.error(errorMessage);
    }
  };

  const validateisOtp = (otp: string[]) => {
    return otp.every((digit) => digit !== '');
  };

  const handleSubmit = async () => {
    let isMobileValid = true;
    let isEmailValid = true;

    if (showMobileOnly || showBoth) {
      isMobileValid = validateisOtp(mobileOtp);
      setIsMobileOtpValid(isMobileValid);
      setMobileErrorMessage(
        isMobileValid ? '' : 'Invalid OTP, Please Try again.'
      );
    }

    if (showEmailOnly || showBoth) {
      isEmailValid = validateisOtp(emailOtp);
      setIsEmailOtpValid(isEmailValid);
      setEmailErrorMessage(
        isEmailValid ? '' : 'Invalid OTP, Please Try again.'
      );
    }

    const isValid =
      (showBoth && isMobileValid && isEmailValid) ||
      (showMobileOnly && isMobileValid) ||
      (showEmailOnly && isEmailValid);

    if (isValid) {
      const mobileOtpStr = mobileOtp.join('');
      const emailOtpStr = emailOtp.join('');

      setIsSubmitting(true);
      try {
        dispatch(showLoader('Please Wait...'));
        const resultAction = await dispatch(
          validateOtp({
            identifier: identifier || '',
            mobileOtp: showMobileOnly || showBoth ? mobileOtpStr : '000000',
            emailOtp: showEmailOnly || showBoth ? emailOtpStr : '000000',
            signUpValidation: false,
          })
        );

        if (validateOtp.fulfilled.match(resultAction)) {
          onOtpSubmit(mobileOtpStr, emailOtpStr);
        } else {
          console.log(
            'OTP validation failed: ' + (resultAction.payload as string)
          );
        }
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        dispatch(hideLoader());
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setMobileOtp(Array(6).fill(''));
    setEmailOtp(Array(6).fill(''));
    setResendError('');
    setIsSubmitting(false);
    onClose();
  };
  const maskEmail = (email: string): string => {
    if (!email.includes('@')) return email;
    const [user, domain] = email.split('@');

    if (user.length <= 3) {
      // For very short usernames, show first char + XXX
      return `${user[0]}****@${domain}`;
    } else if (user.length <= 6) {
      // For medium usernames, show first 2 chars + XXX + last char
      return `${user.slice(0, 2)}****${user.slice(-1)}@${domain}`;
    } else {
      // For long usernames, show first 3 chars + XXX + last 2 chars
      return `${user.slice(0, 3)}****${user.slice(-2)}@${domain}`;
    }
  };

  const maskMobile = (mobile: string): string => {
    if (mobile.length < 6) return mobile;
    return mobile.slice(0, 0) + '****' + mobile.slice(-4);
  };
  const renderOtpSection = (type: 'mobile' | 'email') => {
    const isMobile = type === 'mobile';
    const otp = isMobile ? mobileOtp : emailOtp;
    const timer = isMobile ? mobileTimer : emailTimer;
    const isOtpValid = isMobile ? isMobileOtpValid : isEmailOtpValid;
    const errorMessage = isMobile ? mobileErrorMessage : emailErrorMessage;
    const isResendDisabled = isMobile
      ? isMobileResendDisabled
      : isEmailResendDisabled;
    const otpRefs = isMobile ? mobileOtpRefs : emailOtpRefs;
    const contactInfo = isMobile
      ? `${countryCode} ${maskMobile(mobile || '')}`
      : maskEmail(email || '');

    return (
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography
            variant="body1"
            sx={{
              mt: 0.9,
              fontSize: '16px',
              fontFamily: "'Gilroy-SemiBold', sans-serif",
              fontWeight: 600,
            }}
          >
            {isMobile ? 'Mobile OTP' : 'Email OTP'}
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
              *
            </Typography>
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {formatTime(timer)} Sec
            </Typography>
            {timer === 0 && !isResendDisabled && (
              <Button
                onClick={() => handleResend(isMobile ? 'MOBILE' : 'EMAIL')}
                variant="text"
                size="small"
                style={{ transform: 'none' }}
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  minWidth: 'auto',
                  padding: '2px 8px',
                  transform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.dark',
                  },
                }}
              >
                Resend OTP
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1, md: 1, lg: 3, xl: 4 }}
          justifyContent="center"
          sx={{ mb: 1 }}
        >
          {otp.map((digit, idx) => (
            <TextField
              key={idx}
              inputRef={(el) => {
                otpRefs.current[idx] = el;
              }}
              type="text"
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: '18px',
                  padding: '12px 8px',
                },
                inputMode: 'numeric',
                pattern: '[0-9]*',
                'aria-label': `${isMobile ? 'Mobile' : 'Email'} OTP digit ${idx + 1}`,
              }}
              value={digit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOtpChange(e, idx, type)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                handleKeyDown(e, idx, type)
              }
              error={!isOtpValid}
              sx={{
                width: { xs: '60px', sm: '30px', md: '65px' },
                height: { xs: '60px', sm: '30px', md: '65px' },
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  height: { xs: '65px', sm: '30px', md: '65px' },
                  '& input': {
                    textAlign: 'center',
                    padding: { xs: '12px 8px', sm: '6px 4px', md: '12px 8px' }, // Adjust padding for sm
                    fontSize: { xs: '18px', sm: '14px', md: '18px' }, // Adjust font size for sm
                  },
                },
              }}
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mt: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            OTP Sent on {contactInfo}
          </Typography>
          {!isOtpValid && errorMessage && (
            <Typography variant="body2" color="error">
              {errorMessage}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 0,
          minWidth: { xs: '300px', sm: '480px' },
          maxWidth: '600px',
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '35px 35px 10px',
        }}
      >
        <Typography
          //variant="h6"
          //component="h2"
          sx={{
            fontWeight: '500',
            fontSize: '18px',
            marginLeft: '5px',
            fontFamily: "'Gilroy-SemiBold', sans-serif",
          }}
        >
          OTP Verification
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: '30px 24px 20px', // This provides left/right padding (24px)
          '&.MuiDialogContent-root': {
            paddingLeft: '40px',
            paddingRight: '40px',
          },
        }}
      >
        {/* Conditional rendering based on props */}
        {showMobileOnly && renderOtpSection('mobile')}
        {showEmailOnly && renderOtpSection('email')}
        {showBoth && (
          <>
            {renderOtpSection('mobile')}
            {renderOtpSection('email')}
          </>
        )}

        {resendError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {resendError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: '20px 24px', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          style={{ textTransform: 'none' }}
          disabled={!isSubmitEnabled || isSubmitting}
          sx={{
            minWidth: '200px',
            height: '45px',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: '#0044cc',
            borderRadius: 1,
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OTPModalUpdate;
