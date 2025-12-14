import { SxProps, Theme } from '@mui/material';

// Dialog paper styles
export const dialogPaperStyles: SxProps<Theme> = {
  borderRadius: 0,
  padding: '24px',
  maxWidth: '480px',
  backgroundColor: '#F8F9FD',
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
  color: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'transparent',
  },
};

// Dialog content styles
export const dialogContentStyles: SxProps<Theme> = {
  p: 0,
  mb: 2,
};

// Content container styles
export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  mb: 3,
};

// Error message container styles
export const errorMessageContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
};

// Error icon styles
export const errorIconStyles: SxProps<Theme> = {
  fontSize: '48px',
  color: '#FF3B30',
  // border: '2px solid #FF3B30',
  // borderRadius: '50%',
  // padding: '8px',
};

// Title container styles
export const titleContainerStyles: SxProps<Theme> = {
  textAlign: 'center',
  mb: 3,
  mt: 2,
  maxWidth: '300px',
  mx: 'auto',
};

// Title text styles
export const titleTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy-Medium, Arial, sans-serif',
  fontSize: '20px',
  fontWeight: 600,
  color: '#000000',
  lineHeight: '1.4',
  textAlign: 'center',
  mb: 3,
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

// Helper text styles
export const helperTextStyles: SxProps<Theme> = {
  marginLeft: 0,
  color: '#FF3B30',
  fontFamily: 'Gilroy-Medium, Arial, sans-serif',
  fontSize: '12px',
};

// Select styles
export const getSelectStyles = (hasError: boolean): SxProps<Theme> => ({
  mb: 2,
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy-Medium, Arial, sans-serif',
    fontSize: '14px',
    height: '40px',
    '& .MuiSelect-select': {
      padding: '8px 12px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
    },
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

// Textarea styles
export const getTextareaStyles = (hasError: boolean): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy-Medium, Arial, sans-serif',
    fontSize: '14px',
    minHeight: '40px',
    '& textarea': {
      lineHeight: '1.5',
    },
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
  mt: 0,
  '& .MuiButton-root': {
    transition: 'all 0.2s ease-in-out',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    '&:active': {
      transform: 'translateY(1px)',
    },
  },
};

// Cancel button styles
export const cancelButtonStyles: SxProps<Theme> = {
  color: '#0052CC',
  borderColor: '#0052CC',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  py: 1.5,
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: '#F5F8FF',
    borderColor: '#B3CDFF',
  },
  '&:focus': {
    borderColor: '#0052CC',
    boxShadow: '0 0 0 2px rgba(0, 82, 204, 0.2)',
  },
  '&.Mui-disabled': {
    borderColor: '#F0F0F0',
    color: '#BDBDBD',
    backgroundColor: '#FAFAFA',
  },
};

// Submit button styles
export const submitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: '#FFFFFF',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  textTransform: 'none',
  px: 4,
  py: 1.5,
  '&:hover': {
    backgroundColor: '#001F8B',
  },
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
    boxShadow: 'none',
  },
};

// Placeholder text styles
export const placeholderTextStyles = {
  color: '#B3B3B3',
};
