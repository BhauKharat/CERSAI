import { SxProps, Theme } from '@mui/material';

// Dialog paper styles
export const dialogPaperStyles: SxProps<Theme> = {
  borderRadius: '4px',
  padding: '32px',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  position: 'relative',
};

// Dialog title styles
export const dialogTitleStyles: SxProps<Theme> = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  padding: 0,
  minHeight: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
};

// Close button styles
export const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 0,
  top: 0,
  color: '#666666',
  padding: '4px',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#333333',
  },
};

// Error icon styles
export const errorIconStyles: SxProps<Theme> = {
  fontSize: '48px',
  color: '#FF3B30',
  mb: 0,
  borderRadius: '50%',
  padding: '8px',
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// Dialog content styles
export const dialogContentStyles: SxProps<Theme> = {
  p: 0,
  mb: 0,
  padding: 0,
  '&.MuiDialogContent-root': {
    paddingTop: 0,
  },
};

// Content container styles
export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

// Error message container styles
export const errorMessageContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
};

// Title text styles
export const titleTextStyles: SxProps<Theme> = {
  textAlign: 'center',
  color: '#1A1A1A',
  mb: 2,
  fontFamily: 'Gilroy,  sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  lineHeight: 1.4,
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
  fontWeight: 600,
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

// Date picker styles
export const getDatePickerStyles = (hasError: boolean): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy-Medium, Arial, sans-serif',
    fontSize: '14px',
    height: '40px',
    padding: '0',
    '& .MuiInputBase-input': {
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
  padding: 0,
  gap: 2,
  display: 'flex',
  width: '100%',
  mt: 2,
  '& .MuiButton-root': {
    flex: 1,
    height: '48px',
    fontSize: '16px',
    fontWeight: 500,
    textTransform: 'none',
    borderRadius: '4',
    transition: 'all 0.2s ease-in-out',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  },
};

// Cancel button styles
export const cancelButtonStyles: SxProps<Theme> = {
  color: '#002CBA',
  borderColor: '#002CBA',
  backgroundColor: 'transparent',
  fontFamily: 'Gilroy, sans-serif',
  '&:hover': {
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    borderColor: '#002CBA',
  },
  '&.Mui-disabled': {
    borderColor: '#D1D5DB',
    color: '#9CA3AF',
    backgroundColor: 'transparent',
  },
};

// Submit button styles
export const submitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  fontFamily: 'Gilroy, sans-serif',
  border: 'none',
  py: 0,
  '&:hover': {
    backgroundColor: '#002CBA',
  },
  '&.Mui-disabled': {
    backgroundColor: '#D1D5DB',
    color: '#9CA3AF',
  },
  boxShadow: 'none',
};
