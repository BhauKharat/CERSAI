import { SxProps, Theme } from '@mui/material';

// Dialog paper styles
export const dialogPaperStyles: SxProps<Theme> = {
  borderRadius: '0px',
  padding: '24px',
  maxWidth: '500px',
};

// Dialog title styles
export const dialogTitleStyles: SxProps<Theme> = {
  p: 0,
  mb: 3,
  position: 'relative',
};

// Close button styles
export const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 0,
  top: 0,
  color: 'text.secondary',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
};

// Dialog content styles
export const dialogContentStyles: SxProps<Theme> = {
  p: 0,
  mb: 3,
};

// Content container styles
export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  mb: 0,
};

// Icon container styles
export const iconContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
};

// Error icon styles
export const errorIconStyles: SxProps<Theme> = {
  color: '#FF0707',
  height: '50px',
  width: '50px',
};

// Title text styles
export const titleTextStyles: SxProps<Theme> = {
  textAlign: 'center',
  color: '#000000',
  mb: 3,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
};

// Input container styles
export const inputContainerStyles: SxProps<Theme> = {
  width: '100%',
  mb: 2,
};

// Input label styles
export const inputLabelStyles: SxProps<Theme> = {
  color: '#4E4B66',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  mb: 1,
};

// Required indicator styles
export const requiredIndicatorStyles = {
  color: '#FF3B30',
};

// Text field styles
export const getTextFieldStyles = (hasError: boolean): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy-Medium, Arial, sans-serif',
    fontSize: '14px',
    '& fieldset': {
      borderColor: hasError ? '#FF3B30' : '#D9D9D9',
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#FF3B30' : '#B3B3B3',
    },
    '&.Mui-focused fieldset': {
      borderColor: hasError ? '#FF3B30' : '#002CBA',
    },
  },
});

// Helper text styles
export const helperTextStyles: SxProps<Theme> = {
  marginLeft: 0,
  color: '#FF3B30',
  fontFamily: 'Gilroy-Medium, Arial, sans-serif',
  fontSize: '12px',
};

// Character counter styles
export const charCounterStyles: SxProps<Theme> = {
  display: 'block',
  textAlign: 'right',
  color: '#6E6D7A',
  fontFamily: 'Gilroy-Medium, Arial, sans-serif',
  fontSize: '12px',
  mt: 0.5,
};

// Dialog actions styles
export const dialogActionsStyles: SxProps<Theme> = {
  p: 0,
  gap: 2,
  display: 'flex',
  width: '100%',
};

// Cancel button styles
export const cancelButtonStyles: SxProps<Theme> = {
  flex: 1,
  textTransform: 'none',
  color: '#4E4B66',
  backgroundColor: '#F6F6F6',
  '&:hover': {
    backgroundColor: '#E0E0E0',
  },
  height: '40px',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
};

// Deactivate button styles
export const deactivateButtonStyles: SxProps<Theme> = {
  flex: 1,
  textTransform: 'none',
  color: 'white',
  backgroundColor: '#002CBA',
  '&:hover': {
    backgroundColor: '#001F8E',
  },
  height: '40px',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};
