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
import { toast } from 'react-toastify';
import { AppDispatch } from '../../../../redux/store';
import { useDispatch } from 'react-redux';
import {
  fetchCkycDetails,
  getCkycVerifiedRequest,
} from '../../../../redux/slices/signupSlice';

interface OTPModalProps {
  otpIdentifier: string | undefined;
  isOpen: boolean;
  ckycNumber: string | number;
  onClose: () => void;
  setShowSuccessModal: (value: boolean) => void;
  updateOtpIdentifier: (otpIdentifier: string) => void;
  updateData: (data: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    emailAddress: string;
    mobileNo: string;
    gender: string;
  }) => void;
  onError?: () => void;
}

const CkycUpdateVerifyModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  setShowSuccessModal,
  ckycNumber,
  otpIdentifier,
  updateOtpIdentifier,
  updateData,
  onError,
}) => {
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
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      // Reset all OTP related states
      setMobileOtp(Array(6).fill(''));
      setIsMobileOtpValid(true);
      setMobileErrorMessage('');
      setMobileResendCount(0);
      setIsSubmitting(false);

      // Start timer
      startTimer(getResendTimer(0));

      // Focus first input
      setTimeout(() => {
        const firstInput = mobileOtpRefs.current[0];
        if (firstInput) firstInput.focus();
      }, 100);
    } else {
      // Clear timers when modal closes
      clearTimers();
    }

    return () => clearTimers();
  }, [isOpen]);

  const handleResendOtp = async () => {
    const resultAction = await dispatch(fetchCkycDetails(`${ckycNumber}`));
    setMobileOtp(Array(6).fill(''));

    if (fetchCkycDetails.fulfilled.match(resultAction)) {
      toast.success('OTP resent successfully');
      updateOtpIdentifier(resultAction.payload.otp_identifier);
      const nextCount = mobileResendCount + 1;
      setMobileResendCount(nextCount);
      startTimer(getResendTimer(nextCount));
      setIsMobileOtpValid(true);
      setMobileErrorMessage('');
    } else {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Failed to resend OTP');
    }
  };

  const validateOtp = (otp: string[]) => otp.every((digit) => digit !== '');

  const handleSubmit = async () => {
    const isMobileValid = validateOtp(mobileOtp);

    setIsMobileOtpValid(isMobileValid);

    if (!isMobileValid) {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Please enter valid OTPs.');
      return;
    } else {
      setMobileErrorMessage('');
    }

    if (!otpIdentifier) {
      setIsMobileOtpValid(false);
      setMobileErrorMessage('Identifier not found.');
      return;
    }

    const mobileOtpStr = mobileOtp.join('');
    setIsSubmitting(true);

    try {
      const response = await getCkycVerifiedRequest({
        identifier: otpIdentifier,
        otp: mobileOtpStr,
      });
      console.log(response, 'payload data');
      toast.success('OTP verified successfully');
      setShowSuccessModal(true);
      updateData(response.data);
      onClose();
    } catch (error: unknown) {
      setMobileOtp(Array(6).fill(''));
      console.log(error);
      setIsMobileOtpValid(false);
      setMobileErrorMessage('OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }

    setTimeout(() => {
      onClose();
      onError?.();
    }, 1000);
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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          //borderRadius: 2,
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
        <Typography variant="h6" component="h4" fontWeight="600">
          CKYC Verification
        </Typography>
        <IconButton
          onClick={onClose}
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
        {/* Mobile OTP Section */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="body1" fontWeight="600" sx={{ mt: 0.9 }}>
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
                    marginLeft: '20px',
                  },
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
                  width: { xs: '65px', sm: '30px', md: '65px' }, // 30px for sm, 65px for others
                  height: { xs: '65px', sm: '30px', md: '65px' }, // 30px for sm, 65px for others
                  '& .MuiOutlinedInput-root': {
                    height: { xs: '65px', sm: '30px', md: '65px' }, // Match the height
                    '& input': {
                      textAlign: 'center',
                      padding: {
                        xs: '12px 8px',
                        sm: '6px 4px',
                        md: '12px 8px',
                      }, // Adjust padding for sm
                      fontSize: { xs: '18px', sm: '14px', md: '18px' }, // Adjust font size for sm
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
        {/* <Typography variant="h6">
          <Typography
            component="span"
            sx={{ fontWeight: 'bold', display: 'inline' }}
          >
            Note:
          </Typography>{' '}
          Please Enter OTP sent to your email ID / mobile number linked with
          your ckyc record
        </Typography> */}

        <Typography variant="body1" fontWeight="500" sx={{ mt: 0.9 }}>
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
          }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CkycUpdateVerifyModal;
