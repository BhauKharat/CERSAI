import { styled } from '@mui/material/styles';
import { Box, TextField, Select, Button, Typography } from '@mui/material';

// Shared label styling
export const StyledLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  color: '#333',
  marginBottom: theme.spacing(1),
  display: 'block',
  '&.required::after': {
    content: '" *"',
    color: '#d32f2f',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
    marginBottom: theme.spacing(0.75),
    fontWeight: '600',
  },
}));

// Shared text field styling
export const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(0.5),
    fontFamily: 'Gilroy',
    fontSize: '14px',
    minHeight: '48px',

    '& fieldset': {
      borderColor: '#E0E0E0',
    },

    '&:hover fieldset': {
      borderColor: '#B0B0B0',
    },

    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
      borderWidth: '1px',
    },

    // Disabled state styles
    '&.Mui-disabled': {
      backgroundColor: '#f5f5f5',

      '& .MuiInputBase-input': {
        color: '#333333 !important',
        WebkitTextFillColor: '#333333 !important',
        opacity: 1,
      },

      '& fieldset': {
        borderColor: '#E0E0E0 !important',
      },

      '&:hover fieldset': {
        borderColor: '#E0E0E0 !important', // Keep same color on hover
      },
    },

    // Mobile responsive
    [theme.breakpoints.down('sm')]: {
      minHeight: '44px',
      fontSize: '16px', // 16px prevents zoom on iOS
    },
  },

  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
    fontFamily: 'Gilroy',
    fontSize: '14px',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.25),
      fontSize: '16px', // 16px prevents zoom on iOS
    },
  },

  '& .MuiInputBase-input::placeholder': {
    color: '#999',
    opacity: 1,
  },
}));

// Shared select styling
export const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  borderRadius: theme.spacing(0.5),
  fontFamily: 'Gilroy',
  fontSize: '14px',
  minHeight: '48px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E0E0E0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#B0B0B0',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#002CBA',
    borderWidth: '1px',
    minHeight: '48px',
  },
  '& .MuiSelect-select': {
    padding: theme.spacing(1.5),
    fontFamily: 'Gilroy',
    fontSize: '14px',

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.25),
      fontSize: '16px', // 16px prevents zoom on iOS
    },
  },
  '&.Mui-disabled': {
    backgroundColor: '#f5f5f5',
    '& .MuiSelect-select': {
      color: '#333333 !important', // Force dark text color
      WebkitTextFillColor: '#333333 !important', // For Safari
      opacity: 1,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E0E0E0',
    },
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '44px',
    fontSize: '16px',
  },
}));

// Field with upload container
export const FieldWithUploadContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

// Upload button styling
export const StyledUploadButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: '8px', // Fixed position from top instead of 50%
  minWidth: '35px',
  height: '35px',
  padding: 0,
  borderRadius: theme.spacing(0.5),
  backgroundColor: '#002CBA',
  color: 'white',
  border: 'none',
  zIndex: 1,
  '&:hover': {
    backgroundColor: '#1565c0',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '32px',
    height: '32px',
    right: theme.spacing(0.5),
    top: '10px',
  },
}));

// File preview container
export const FilePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '40px',
  height: '40px',
  flexShrink: 0,
  marginLeft: '8px',
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
    marginLeft: '4px',
  },
}));

// File preview thumbnail
export const FilePreviewThumbnail = styled('img')(({ theme }) => ({
  width: '40x',
  height: '40px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
  objectFit: 'cover',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
  },
}));

// File preview fallback
export const FilePreviewFallback = styled(Box)(({ theme }) => ({
  width: '45px',
  height: '45px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#666',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    width: '48px',
    height: '48px',
    fontSize: '10px',
  },
}));

// Success icon
export const SuccessIcon = styled('img')(() => ({
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '16px',
  height: '16px',
  zIndex: 2,
}));

// Action buttons container
export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
  },
}));

// Clear button
export const ClearButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  border: '1px solid #002CBA',
  color: '#002CBA',
  '&:hover': {
    backgroundColor: '#f0f7ff',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(1.5, 2),
    fontSize: '14px',
  },
}));

// Save/Next button
export const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': {
    backgroundColor: '#001a8a',
  },
  '&:disabled': {
    backgroundColor: '#999999',
    color: 'white',
    cursor: 'not-allowed',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(1.5, 2),
    fontSize: '14px',
  },
}));

// File upload with preview container
export const FieldWithUploadAndPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    gap: '6px',
  },
}));

// Text field container for upload fields
export const TextFieldContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
