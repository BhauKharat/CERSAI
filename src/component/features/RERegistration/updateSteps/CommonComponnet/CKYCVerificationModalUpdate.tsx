/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
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
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface CKYCVerificationModalUpdateProps {
  open: boolean;
  onClose: () => void;
  onVerificationSuccess: (data?: unknown) => void;
  onOpenSendOtp?: () => Promise<void>;
  onSubmitOtp?: (otp: string) => Promise<unknown>;
  onResendOtp?: () => Promise<void>;
}

const CKYCVerificationModalUpdate: React.FC<
  CKYCVerificationModalUpdateProps
> = ({ open, onClose, onVerificationSuccess, onSubmitOtp, onResendOtp }) => {
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(''));
  const [mobileTimer, setMobileTimer] = useState(0);
  const [mobileResendCount, setMobileResendCount] = useState(0);
  const [isMobileOtpValid, setIsMobileOtpValid] = useState<boolean>(true);
  const [mobileErrorMessage, setMobileErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>(
    Array(6).fill(null)
  );
  const mobileIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Reset modal state when it opens
  useEffect(() => {
    if (open) {
      // Reset all OTP related states
      setMobileOtp(Array(6).fill(''));
      setIsMobileOtpValid(true);
      setMobileErrorMessage('');
      setMobileResendCount(0);
      setIsSubmitting(false);

      // Start timer
      startTimer(getResendTimer(0));

      setTimeout(() => {
        const firstInput = mobileOtpRefs.current[0];
        if (firstInput) firstInput.focus();
      }, 100);
    } else {
      clearTimers();
    }

    return () => clearTimers();
  }, [open]);

  const handleResendOtp = async () => {
    if (onResendOtp) {
      try {
        await onResendOtp();
        setMobileOtp(Array(6).fill(''));
        const nextCount = mobileResendCount + 1;
        setMobileResendCount(nextCount);
        startTimer(getResendTimer(nextCount));
        setIsMobileOtpValid(true);
        setMobileErrorMessage('');
      } catch {
        setIsMobileOtpValid(false);
        setMobileErrorMessage('Failed to resend OTP');
      }
    }
  };

  const validateOtp = (otp: string[]) => otp.every((digit) => digit !== '');

  const handleSubmit = async () => {
    const isMobileValid = validateOtp(mobileOtp);

    setIsMobileOtpValid(isMobileValid);

    if (!isMobileValid) {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Please enter valid OTP.');
      return;
    } else {
      setMobileErrorMessage('');
    }

    const mobileOtpStr = mobileOtp.join('');
    setIsSubmitting(true);

    try {
      if (onSubmitOtp) {
        const response = await onSubmitOtp(mobileOtpStr);
        onVerificationSuccess(response);
      } else {
        onVerificationSuccess();
      }
    } catch (error: any) {
      setMobileOtp(Array(6).fill(''));
      setIsMobileOtpValid(false);
      setMobileErrorMessage(
        error?.message || 'OTP verification failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (sec: number) => {
    const minutes = String(Math.floor(sec / 60)).padStart(2, '0');
    const seconds = String(sec % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setIsMobileOtpValid(true);
    setMobileErrorMessage('');
    const value = e.target.value;
    const otpArray = [...mobileOtp];

    if (/^\d?$/.test(value)) {
      otpArray[index] = value;
      setMobileOtp(otpArray);

      if (value && index < otpArray.length - 1) {
        const nextInput = mobileOtpRefs.current[index + 1];
        if (nextInput) nextInput.focus();
      }
    }

    if (value === '' && index > 0) {
      const prevInput = mobileOtpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const getResendTimer = (count: number): number => {
    if (count === 0) return 30;
    if (count === 1) return 60;
    return 90;
  };

  const clearTimers = () => {
    if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
  };

  const startTimer = (duration: number) => {
    clearInterval(mobileIntervalRef.current!);
    setMobileTimer(duration);
    mobileIntervalRef.current = setInterval(() => {
      setMobileTimer((prev) => {
        if (prev <= 1) {
          clearInterval(mobileIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !mobileOtp[index] && index > 0) {
      const prevInput = mobileOtpRefs.current[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  const handleClose = () => {
    clearTimers();
    onClose();
  };

  return (
    <Dialog
      open={open}
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
          variant="h6"
          component="h4"
          sx={{
            fontWeight: '600',
            fontSize: '18px',
            fontFamily: "'Gilroy-SemiBold', sans-serif",
          }}
        >
          CKYC Verification
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
          padding: '30px 24px 20px',
          '&.MuiDialogContent-root': {
            paddingLeft: '40px',
            paddingRight: '40px',
          },
        }}
      >
        {/* Mobile/Email OTP Section */}
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
              Mobile/Email OTP
              <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                *
              </Typography>
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                {formatTime(mobileTimer)}
              </Typography>
              {mobileTimer === 0 && (
                <Button
                  onClick={handleResendOtp}
                  variant="text"
                  size="small"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    minWidth: 'auto',
                    padding: '2px 8px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.dark',
                    },
                  }}
                >
                  Send again
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
            {mobileOtp.map((digit, idx) => (
              <TextField
                key={idx}
                inputRef={(el) => {
                  mobileOtpRefs.current[idx] = el;
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
                  'aria-label': `OTP digit ${idx + 1}`,
                }}
                value={digit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleOtpChange(e, idx)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e, idx)
                }
                error={!isMobileOtpValid}
                sx={{
                  width: { xs: '60px', sm: '30px', md: '65px' },
                  height: { xs: '60px', sm: '30px', md: '65px' },
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': {
                    height: { xs: '65px', sm: '30px', md: '65px' },
                    '& input': {
                      textAlign: 'center',
                      padding: {
                        xs: '12px 8px',
                        sm: '6px 4px',
                        md: '12px 8px',
                      },
                      fontSize: { xs: '18px', sm: '14px', md: '18px' },
                    },
                  },
                }}
              />
            ))}
          </Stack>

          {!isMobileOtpValid && mobileErrorMessage && (
            <Typography variant="body2" color="error" sx={{ mt: 1, ml: 1 }}>
              {mobileErrorMessage}
            </Typography>
          )}
        </Box>

        <Typography
          variant="body1"
          sx={{
            mt: 0.9,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <Typography
            component="span"
            sx={{ fontWeight: 'bold', display: 'inline' }}
          >
            Note:
          </Typography>{' '}
          Please Enter OTP sent to your email ID / mobile number linked with
          your CKYC record
        </Typography>
      </DialogContent>

      <DialogActions sx={{ padding: '20px 24px', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          style={{ textTransform: 'none' }}
          disabled={isSubmitting}
          sx={{
            backgroundColor: '#0044cc',
            minWidth: '200px',
            height: '45px',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#0033aa',
            },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Submit'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CKYCVerificationModalUpdate;
