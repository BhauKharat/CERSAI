import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export interface CKYCVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerificationSuccess: (data?: unknown) => void;
  // Optional API hooks
  onOpenSendOtp?: () => Promise<void> | void; // called when modal opens
  onSubmitOtp?: (otp: string) => Promise<boolean | unknown> | boolean | unknown; // may return data
  onResendOtp?: () => Promise<boolean | void> | boolean | void; // called when user resends OTP
  is400Error?: boolean;
}

const ckycValidationSchema = Yup.object({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^[0-9]{6}$/, 'OTP must be exactly 6 digits'),
});

// CKYC Verification Modal Component
function CKYCVerificationModal({
  open,
  onClose,
  onVerificationSuccess,
  onOpenSendOtp,
  onSubmitOtp,
  onResendOtp,
  is400Error,
}: CKYCVerificationModalProps) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  // Countdown until next resend is allowed
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedDigits, setVerifiedDigits] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  // Resend control
  const [resendAttempts, setResendAttempts] = useState(0); // successful resend attempts
  const [resendOTPAttempts, setResendOTPAttempts] = useState(0); // successful resend attempts
  const [lockUntil, setLockUntil] = useState<number | null>(null); // epoch seconds; when not null and in the future, resend blocked

  const otpRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const modalFormik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: ckycValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setOtpError(false);

      try {
        let ok = true;
        let responseData: unknown = undefined;
        if (onSubmitOtp) {
          const res = await onSubmitOtp(values.otp);
          if (typeof res === 'boolean') {
            ok = res;
          } else {
            ok = !!res;
            responseData = res;
          }
        } else {
          // Fallback simulated check
          await new Promise((resolve) => setTimeout(resolve, 1200));
          ok = values.otp === '123456';
        }
        if (!ok) {
          setOtpError(true);
          setIsSubmitting(false);
          return;
        }

        // Directly close modal and notify parent on success (no verified animation)
        setOtpError(false);
        onVerificationSuccess(responseData);
        onClose();
      } catch (error) {
        console.error('CKYC OTP verification error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    const otp = otpValues.join('');
    if (modalFormik.values.otp !== otp) {
      modalFormik.setFieldValue('otp', otp, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValues]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Keep latest onOpenSendOtp in a ref so we can depend only on `open`
  const onOpenSendOtpRef =
    React.useRef<CKYCVerificationModalProps['onOpenSendOtp']>(undefined);
  React.useEffect(() => {
    onOpenSendOtpRef.current = onOpenSendOtp;
  }, [onOpenSendOtp]);

  React.useEffect(() => {
    if (open) {
      // Reset modal state on open
      setTimeLeft(30);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError(false);
      setIsVerified(false);
      setVerifiedDigits([false, false, false, false, false, false]);
      setResendAttempts(0);
      setLockUntil(null);
      // fire off send OTP if provided
      const fn = onOpenSendOtpRef.current;
      if (fn) {
        Promise.resolve(fn()).catch((e) =>
          console.error('CKYC send OTP error:', e)
        );
      }
    }
  }, [open]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    setOtpError(false);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleResendOTP = async () => {
    // If locked, do nothing
    const now = Math.floor(Date.now() / 1000);
    if (lockUntil && now < lockUntil) return;

    // Enforce max 3 retries; after that, lock for 2 hours
    if (resendAttempts >= 3) {
      return;
    }
    // Reuse same API to send OTP again
    try {
      if (onResendOtp) {
        const res = await onResendOtp();

        setTimeLeft(30);
        const nextAttempt = resendOTPAttempts + 1;
        setResendOTPAttempts(nextAttempt);
        if (nextAttempt === 1) {
          setTimeLeft(60); // second send -> 1 min
        } else if (nextAttempt >= 2) {
          setTimeLeft(90); // third send -> 1 min 30 sec
        }
        if (res === true) {
          setTimeLeft(0);
          return;
        }
        // If API indicates failure, we still reset UI but don't increment attempts
        if (res === false) return;
      } else if (onOpenSendOtpRef.current) {
        await Promise.resolve(onOpenSendOtpRef.current());
      }
    } catch (e) {
      console.error('CKYC resend OTP error:', e);
      // Still allow user to try again when timer allows
    }

    // Reset OTP inputs and visuals
    setOtpValues(['', '', '', '', '', '']);
    setOtpError(false);
    setIsVerified(false);
    setVerifiedDigits([false, false, false, false, false, false]);
    otpRefs[0].current?.focus();

    // Determine next cooldown
    const nextAttempt = resendAttempts + 1;
    setResendAttempts(nextAttempt);
    if (nextAttempt === 1) {
      setTimeLeft(60); // second send -> 1 min
    } else if (nextAttempt === 2) {
      setTimeLeft(90); // third send -> 1 min 30 sec
    } else if (nextAttempt >= 3) {
      // lock for 2 hours (7200 seconds)
      const unlockAt = now + 7200;
      setLockUntil(unlockAt);
      // Show countdown to unlock
      setTimeLeft(unlockAt - now);
    }
  };

  const isLocked = React.useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return !!(lockUntil && now < lockUntil);
  }, [lockUntil]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')} hrs`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')} sec`;
  };

  return (
    <Modal
      open={open}
      onClose={() => {}} // Disable closing on backdrop click
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(45, 43, 39, 0.3)',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={modalFormik.handleSubmit}
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow:
            '0px 263px 74px 0px rgba(0,0,0,0), 0px 169px 67px 0px rgba(0,0,0,0.01), 0px 95px 57px 0px rgba(0,0,0,0.03), 0px 42px 42px 0px rgba(0,0,0,0.05), 0px 11px 23px 0px rgba(0,0,0,0.06)',
          p: 4,
          maxWidth: '450px',

          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Header with Close Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: '"Gilroy-SemiBold", sans-serif',
              color: '#000',
              flex: 1,
            }}
          >
            CKYC Verification
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              ml: 2,
              color: '#000',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M16.0672 15.1828C16.1253 15.2409 16.1713 15.3098 16.2027 15.3857C16.2342 15.4616 16.2503 15.5429 16.2503 15.625C16.2503 15.7071 16.2342 15.7884 16.2027 15.8643C16.1713 15.9402 16.1253 16.0091 16.0672 16.0672C16.0091 16.1253 15.9402 16.1713 15.8643 16.2027C15.7884 16.2342 15.7071 16.2503 15.625 16.2503C15.5429 16.2503 15.4616 16.2342 15.3857 16.2027C15.3098 16.1713 15.2409 16.1253 15.1828 16.0672L10 10.8836L4.81719 16.0672C4.69991 16.1845 4.54085 16.2503 4.375 16.2503C4.20915 16.2503 4.05009 16.1845 3.93281 16.0672C3.81554 15.9499 3.74965 15.7909 3.74965 15.625C3.74965 15.4591 3.81554 15.3001 3.93281 15.1828L9.11641 10L3.93281 4.81719C3.81554 4.69991 3.74965 4.54085 3.74965 4.375C3.74965 4.20915 3.81554 4.05009 3.93281 3.93281C4.05009 3.81554 4.20915 3.74965 4.375 3.74965C4.54085 3.74965 4.69991 3.81554 4.81719 3.93281L10 9.11641L15.1828 3.93281C15.3001 3.81554 15.4591 3.74965 15.625 3.74965C15.7909 3.74965 15.9499 3.81554 16.0672 3.93281C16.1845 4.05009 16.2503 4.20915 16.2503 4.375C16.2503 4.54085 16.1845 4.69991 16.0672 4.81719L10.8836 10L16.0672 15.1828Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        </Box>

        {/* OTP Section */}
        <Box sx={{ mb: 4 }}>
          {/* OTP Label and Timer */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography
              component="label"
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: '"Gilroy-Medium", sans-serif',
                color: '#000',
              }}
            >
              Mobile/Email OTP
              <Typography component="span" sx={{ color: '#ff0707', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#000',
                }}
              >
                {isLocked
                  ? `Locked: ${formatTime(timeLeft)}`
                  : formatTime(timeLeft)}
              </Typography>
              <Button
                variant="text"
                onClick={handleResendOTP}
                disabled={timeLeft > 0 || isLocked || is400Error}
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Gilroy-SemiBold", sans-serif',
                  color: '#002CBA',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                  '&.Mui-disabled': { color: '#999' },
                }}
              >
                Resend OTP
              </Button>
            </Box>
            {isLocked && (
              <Typography
                sx={{
                  fontSize: '12px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#ff0707',
                  mt: 1,
                }}
              >
                You have reached the maximum number of resend attempts. Please
                try again after 2 hours.
              </Typography>
            )}
          </Box>

          {/* OTP Input Boxes */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              justifyContent: 'flex-start',

              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            {otpValues.map((value, index) => (
              <Box key={index} sx={{ position: 'relative' }}>
                <TextField
                  inputRef={otpRefs[index]}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isVerified}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: 'center',
                      fontSize: '18px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      padding: '12px 8px',
                      color: verifiedDigits[index] ? '#52ae32' : '#000',
                    },
                  }}
                  sx={{
                    width: '50px',
                    height: '50px',
                    '& .MuiOutlinedInput-root': {
                      height: '50px',
                      backgroundColor: verifiedDigits[index]
                        ? '#f0f8f0'
                        : 'white',
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: verifiedDigits[index]
                          ? '#52ae32'
                          : otpError
                            ? '#ff0707'
                            : '#999999',
                        borderWidth: verifiedDigits[index] ? '2px' : '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: verifiedDigits[index]
                          ? '#52ae32'
                          : otpError
                            ? '#ff0707'
                            : '#002CBA',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: verifiedDigits[index]
                          ? '#52ae32'
                          : otpError
                            ? '#ff0707'
                            : '#002CBA',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: verifiedDigits[index]
                          ? '#f0f8f0'
                          : 'white',
                        '& .MuiInputBase-input': {
                          color: verifiedDigits[index] ? '#52ae32' : '#000',
                          WebkitTextFillColor: verifiedDigits[index]
                            ? '#52ae32'
                            : '#000',
                        },
                      },
                    },
                  }}
                />
                {/* Verified Icon Overlay */}
                {verifiedDigits[index] && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="#52ae32" />
                      <path
                        d="M3.5 6L5.25 7.75L8.5 4.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Error Message */}
          {otpError && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#ff0707',
                }}
              >
                Invalid OTP
              </Typography>
            </Box>
          )}

          {/* Note */}
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: '"Gilroy-Regular", sans-serif',
              color: '#646464',
              lineHeight: 1.5,
              textAlign: 'left',
            }}
          >
            <Typography
              component="span"
              sx={{ fontWeight: 600, color: '#000' }}
            >
              Note:
            </Typography>{' '}
            Please enter the OTP sent to your email ID / mobile number linked
            with your CKYC record.
          </Typography>
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting || otpValues.join('').length !== 6 || isVerified
            }
            sx={{
              backgroundColor: isVerified ? '#52ae32' : '#002CBA',
              color: 'white',
              textTransform: 'none',
              minWidth: '180px',
              height: '48px',
              fontSize: '16px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: isVerified ? '#52ae32' : '#001a8a',
              },
              '&.Mui-disabled': {
                backgroundColor: isVerified
                  ? '#52ae32'
                  : 'rgba(128,128,128,0.55)',
                color: 'white',
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isVerified ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="white" />
                  <path
                    d="M5 8L7 10L11 6"
                    stroke="#52ae32"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Verified
              </Box>
            ) : (
              'Submit'
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default CKYCVerificationModal;
