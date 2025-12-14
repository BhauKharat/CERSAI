import {
  styled,
  Dialog,
  IconButton,
  Box,
  TextField,
  Button,
} from '@mui/material';

// Styled component for the modal container, centering it on the screen
export const StyledModal = styled(Dialog)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm').toString()]: {
    width: '100%', // Adjust width for smaller screens
    padding: theme.spacing(2),
  },
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  top: 16,
  color: theme.palette.grey[500],
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

// Styled component for the container holding the individual OTP input fields
export const OtpInputContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px', // Space between each OTP digit input box
  marginBottom: '24px', // Margin below the OTP inputs
});

// Styled component for each individual OTP input field
export const OtpInputField = styled(TextField)(({ theme }) => ({
  // Calculate width for each input to distribute evenly within the container, accounting for gaps
  width: 'calc(100% / 6 - 8px * 5 / 6)',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius, // Apply rounded corners
    '& fieldset': {
      borderColor: theme.palette.divider, // Default border color
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main, // Border color on hover
    },
    // Apply red border when there's an error
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main, // Red border for error state
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main, // Border color when focused
      borderWidth: '2px', // Thicker border when focused
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5), // Padding inside the input
    textAlign: 'center', // Center the digit
    fontSize: '1.25rem', // Larger font size for digits
    fontWeight: 'bold', // Bold font weight for digits
  },
}));

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '4px',
    background: '#F8F9FD',
    boxShadow: '0 11px 23px 0 rgba(0, 0, 0, 0.06)',
    padding: theme.spacing(4),
    textAlign: 'center',
    maxWidth: '680px',
    width: 'calc(100% - 32px)',
    margin: '16px',
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(5),
      margin: '24px',
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(6),
    },
  },
  '& .MuiDialog-container': {
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      marginTop: '20vh',
    },
  },
}));

export const SuccessIcon = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  margin: '0 auto 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  [theme.breakpoints.down('sm')]: {
    width: '64px',
    height: '64px',
    marginBottom: '20px',
  },
  [theme.breakpoints.up('md')]: {
    width: '88px',
    height: '88px',
    marginBottom: '28px',
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  background: '#002CBA',
  display: 'flex',
  width: '200px',
  height: '48px',
  padding: '8px 24px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  margin: '32px auto 0',
  textTransform: 'none',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 500,
  '&:hover': {
    background: '#0021A0',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '100%',
    height: '44px',
    marginTop: '24px',
    fontSize: '0.9375rem',
  },
  [theme.breakpoints.up('md')]: {
    width: '220px',
    height: '52px',
    marginTop: '36px',
    fontSize: '1.0625rem',
  },
}));

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
