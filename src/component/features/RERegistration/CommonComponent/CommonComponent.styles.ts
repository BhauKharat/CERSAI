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
}));

// Shared text field styling
export const StyledTextField = styled(TextField)(({ theme }) => ({
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
      minHeight: '48px',
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
    fontFamily: 'Gilroy',
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#999',
    opacity: 1,
  },
}));

// Shared select styling
export const StyledSelect = styled(Select)(({ theme }) => ({
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
  },
}));

// Field with upload container
export const FieldWithUploadContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
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
export const FilePreviewContainer = styled(Box)(() => ({
  position: 'relative',
  width: '40px',
  height: '40px',
  flexShrink: 0,
  marginLeft: '8px',
}));

// File preview thumbnail
export const FilePreviewThumbnail = styled('img')(() => ({
  width: '40px',
  height: '40px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
  objectFit: 'cover',
  cursor: 'pointer',
}));

// File preview fallback
export const FilePreviewFallback = styled(Box)(() => ({
  width: '40px',
  height: '40px',
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
  justifyContent: 'right',
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
export const FieldWithUploadAndPreview = styled(Box)(() => ({
  display: 'flex',
  // alignItems: 'center',
  gap: '8px',
  width: '100%',
}));

// Text field container for upload fields
export const TextFieldContainer = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
}));

// Styled Upload Box - similar to StyledTextField</ for file uploads
export const StyledUploadBox = styled(Box)(({ theme }) => ({
  border: '1px solid #E0E0E0',
  borderRadius: theme.spacing(0.5),
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  minHeight: '48px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  fontFamily: 'Gilroy',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#f8f9ff',
    borderColor: '#B0B0B0',
  },
  '&.disabled': {
    cursor: 'not-allowed',
    backgroundColor: '#f5f5f5',
    borderColor: '#E0E0E0',
  },
  '& img': {
    width: '20px',
    height: '20px',
  },
  '& .upload-text': {
    fontSize: '14px',
    color: '#002CBA',
    fontWeight: '500',
    fontFamily: 'Gilroy',
  },
}));
