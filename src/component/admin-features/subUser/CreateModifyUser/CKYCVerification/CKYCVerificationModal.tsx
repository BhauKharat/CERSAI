import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CKYCVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  ckycNumber: string;
}

const CKYCVerificationModal: React.FC<CKYCVerificationModalProps> = ({
  open,
  onClose,
  onVerify,
  ckycNumber,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (open && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [open, timer]);

  // Reset timer when modal opens
  useEffect(() => {
    if (open) {
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
    }
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}sec`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const digits = pastedData.split('').filter((char) => /^\d$/.test(char));

    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOTP = async () => {
    // TODO: Implement resend OTP API call
    console.log('Resending OTP for CKYC:', ckycNumber);
    setTimer(300);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerify(otpString);
      onClose();
    } catch (error) {
      console.error('OTP verification failed:', error);
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          padding: '24px',
        },
      }}
    >
      <DialogContent sx={{ padding: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 700,
              fontSize: '24px',
              color: '#000000',
            }}
          >
            CKYC Verification
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#000000',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* OTP Label and Timer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              color: '#000000',
              '&:after': {
                content: '"*"',
                color: '#FF0000',
                marginLeft: '4px',
              },
            }}
          >
            Mobile/Email OTP
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontSize: '14px',
                color: '#666666',
              }}
            >
              {formatTime(timer)}
            </Typography>
            <Button
              onClick={handleResendOTP}
              disabled={timer > 0}
              sx={{
                fontFamily: 'Gilroy, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                color: '#002CBA',
                textTransform: 'none',
                padding: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
                '&.Mui-disabled': {
                  color: '#CCCCCC',
                },
              }}
            >
              Resend OTP
            </Button>
          </Box>
        </Box>

        {/* OTP Input Boxes */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            justifyContent: 'center',
          }}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                },
              }}
              sx={{
                width: '64px',
                '& .MuiOutlinedInput-root': {
                  height: '64px',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#D0D5DD',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#002CBA',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#002CBA',
                    borderWidth: '2px',
                  },
                },
              }}
            />
          ))}
        </Box>

        {/* Note */}
        <Typography
          sx={{
            fontFamily: 'Gilroy, sans-serif',
            fontSize: '14px',
            color: '#666666',
            mb: 4,
            lineHeight: 1.5,
          }}
        >
          <strong>Note:</strong> Please enter the OTP sent to your email ID /
          mobile number linked with your CKYC record.
        </Typography>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={otp.join('').length !== 6 || isSubmitting}
            sx={{
              backgroundColor: '#002CBA',
              color: '#FFFFFF',
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              px: 8,
              py: 1.5,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#001F8B',
              },
              '&.Mui-disabled': {
                backgroundColor: '#E0E0E0',
                color: '#9E9E9E',
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CKYCVerificationModal;
