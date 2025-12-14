import React, { useState, useEffect, useRef, FC } from 'react';
import {
  // Modal as MuiModal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme, // Uncommented: Access MUI theme
  useMediaQuery,
  DialogContent, // Uncommented: Check if screen is mobile size
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  StyledModal,
  CloseButton,
  OtpInputContainer,
  OtpInputField,
} from './Modal.styles';

// Define the props interface for the OTPModal component
export interface OTPModalProps {
  open: boolean; // Controls the visibility of the modal
  onClose: () => void; // Callback function to close the modal
  onVerify: (otp: string) => Promise<boolean>; // Callback to verify the OTP, returns true if valid
  onResend: () => Promise<boolean>; // Callback to resend OTP, returns true if successful
  email: string; // User's email to display
  mobile: string; // User's mobile number to display
  countryCode: string | undefined;
}

const OTPModal: FC<OTPModalProps> = ({
  open,
  onClose,
  onVerify,
  onResend,
  countryCode,
  email,
  mobile,
}) => {
  const [otp, setOtp] = useState<string>(''); // State to store the combined OTP string
  const [error, setError] = useState<string>(''); // State to store error messages
  const [loading, setLoading] = useState<boolean>(false); // State for verification loading indicator
  const [resendLoading, setResendLoading] = useState<boolean>(false); // State for resend loading indicator
  const [timeLeft, setTimeLeft] = useState<number>(120); // Timer for OTP expiry (2 minutes)
  const [resendSuccess, setResendSuccess] = useState<boolean>(false); // State for resend success message
  const theme = useTheme(); // Access MUI theme - UNCOMMENTED
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen is mobile size - UNCOMMENTED

  // useRef to store references to each OTP input field for focus management
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Effect hook for the OTP timer
  useEffect(() => {
    // When the modal is closed, reset timer and other states
    if (!open) {
      setTimeLeft(120);
      setOtp(''); // Clear OTP when modal closes
      setError(''); // Clear error when modal closes
      setResendSuccess(false); // Clear resend success message
      return;
    }

    // If timer reaches 0, stop
    if (timeLeft === 0) return;

    // Set up a timeout to decrement the timer every second
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // Cleanup function to clear the timer when component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [timeLeft, open]); // Re-run effect when timeLeft or open state changes

  // Effect hook to focus on the first OTP input when the modal opens
  useEffect(() => {
    if (open && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [open]); // Re-run effect when open state changes

  // Handler for changes in individual OTP input fields
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number // Index of the current input field (0-5)
  ) => {
    const value = e.target.value;

    // Handle pasting: if multiple digits are pasted into one field
    if (value.length > 1) {
      const pastedValue = value.replace(/\D/g, ''); // Remove non-digits
      if (pastedValue.length > 0) {
        const newOtpArray = otp.split(''); // Convert current OTP string to array
        // Fill subsequent inputs with pasted digits
        for (let i = 0; i < pastedValue.length && index + i < 6; i++) {
          newOtpArray[index + i] = pastedValue[i];
          // Move focus to the next input field if available
          if (otpInputRefs.current[index + i + 1]) {
            otpInputRefs.current[index + i + 1]?.focus();
          }
        }
        setOtp(newOtpArray.join('')); // Update OTP state
      }
      return; // Exit after handling paste
    }

    // Handle single digit input or clearing
    if (value === '' || /^\d$/.test(value)) {
      // Allow empty string or a single digit
      const newOtpArray = otp.split(''); // Convert current OTP string to array
      newOtpArray[index] = value; // Update the digit at the current index
      const newOtp = newOtpArray.join(''); // Join back to string
      setOtp(newOtp); // Update OTP state
      setError(''); // Clear any previous error message

      // Move focus to the next input if a digit is entered and it's not the last input
      if (value !== '' && index < 5 && otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handler for keydown events (e.g., Backspace) in OTP input fields
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // If backspace is pressed on an empty field, move focus to the previous field and clear its content
        otpInputRefs.current[index - 1]?.focus();
        const newOtpArray = otp.split('');
        newOtpArray[index - 1] = '';
        setOtp(newOtpArray.join(''));
      } else if (otp[index] !== '') {
        // If backspace is pressed on a non-empty field, just clear the current field
        const newOtpArray = otp.split('');
        newOtpArray[index] = '';
        setOtp(newOtpArray.join(''));
      }
    }
  };

  // Handler for OTP verification
  const handleVerify = async () => {
    // Client-side validation: Check if OTP is exactly 6 digits
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true); // Show loading indicator
    try {
      // Call the provided onVerify function (this is where the actual OTP validation happens, e.g., API call)
      const isValid = await onVerify(otp);
      if (!isValid) {
        setError('Invalid OTP, Please Try again.'); // Set error if OTP is invalid
      } else {
        onClose(); // Close modal on successful verification
      }
    } catch (err) {
      setError('An error occurred. Please try again.' + err); // Catch and display any errors
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Handler for resending OTP
  const handleResend = async () => {
    setResendLoading(true); // Show resend loading indicator
    setResendSuccess(false); // Hide previous success message
    try {
      const success = await onResend(); // Call the provided onResend function
      if (success) {
        setResendSuccess(true); // Show success message
        setTimeLeft(120); // Reset timer
        setOtp(''); // Clear OTP input
        setError(''); // Clear any errors

        // Hide success message after 3 seconds
        setTimeout(() => {
          setResendSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.' + err); // Catch and display any errors
    } finally {
      setResendLoading(false); // Hide resend loading indicator
    }
  };

  // Helper function to format time for display (MM:SSsec)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}sec`;
  };

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBackdropClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  return (
    <StyledModal
      open={open}
      onClose={handleBackdropClick}
      fullScreen={fullScreen}
      disableEscapeKeyDown
      aria-labelledby="otp-modal-title"
      aria-describedby="otp-modal-description"
      PaperProps={{
        sx: {
          borderRadius: '4px',
          background: '#F8F9FD',
          boxShadow: '0 11px 23px 0 rgba(0, 0, 0, 0.06)',
          height: 'auto',
        },
      }}
    >
      <CloseButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
        }}
      >
        <CloseIcon />
      </CloseButton>
      <DialogContent onClick={handleClose}>
        {/* Header section with title and close button */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            id="otp-modal-title"
            variant="h6"
            component="h2"
            fontWeight="bold"
          >
            OTP Verification
          </Typography>
          {/* <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton> */}
        </Box>

        {/* "Mobile/Email OTP*" Label */}
        <Typography variant="subtitle2" fontWeight="medium" mb={1}>
          Mobile/Email OTP
        </Typography>

        {/* Container for individual OTP input fields */}
        <OtpInputContainer>
          {Array.from({ length: 6 }).map((_, index) => (
            <OtpInputField
              key={index}
              variant="outlined"
              value={otp[index] || ''} // Display the digit from the OTP string or empty
              onChange={(e) => handleOtpChange(e, index)} // Handle input change
              onKeyDown={(e) => handleKeyDown(e, index)} // Handle keydown events (e.g., backspace)
              inputProps={{
                maxLength: 1, // Allow only one character per input
                inputMode: 'numeric', // Suggest numeric keyboard on mobile
                pattern: '[0-9]', // HTML5 pattern for validation
                style: { textAlign: 'center', backgroundColor: 'white' }, // Center text within input
              }}
              inputRef={(el) => (otpInputRefs.current[index] = el)} // Assign ref to input element
              // autoFocus={index === 0 && open} // Auto-focus the first input when modal opens
              error={!!error} // Apply error styling to all fields if an error exists
            />
          ))}
        </OtpInputContainer>

        {/* Timer and Resend OTP button section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1} // Adjusted margin to accommodate error message below
        >
          <Typography
            variant="caption"
            color={timeLeft < 60 ? 'error' : 'text.secondary'} // Change color to error when time is low
            sx={{ fontSize: '0.875rem' }} // Font size to match screenshot
          >
            {formatTime(timeLeft)}
          </Typography>
          <Button
            onClick={handleResend}
            disabled={timeLeft > 0 || resendLoading} // Disable if timer is running or resend is loading
            size="small"
            color="primary"
            sx={{ fontWeight: 'bold' }} // Bold font weight for button text
          >
            {resendLoading ? <CircularProgress size={20} /> : 'Resend'}
          </Button>
        </Box>

        {/* OTP sent information and error message */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            // Example usage of isMobile: adjust font size on mobile
            sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
          >
            OTP Sent on {countryCode} {mobile} and {email}
          </Typography>
          {error && (
            <Typography variant="body2" color="error" sx={{ ml: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {/* Display resend success message if present */}
        {resendSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            OTP has been resent successfully!
          </Alert>
        )}

        {/* Verify & Proceed / Submit button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleVerify}
          disabled={otp.length !== 6 || loading} // Disable if OTP is not 6 digits or loading
          sx={{
            py: 1.5,
            fontWeight: 'medium',
            backgroundColor: '#1976d2', // Custom background color to match screenshot
            '&:hover': {
              backgroundColor: '#1565c0', // Darker color on hover
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Submit' // Button text
          )}
        </Button>
      </DialogContent>
    </StyledModal>
  );
};

export default OTPModal;
