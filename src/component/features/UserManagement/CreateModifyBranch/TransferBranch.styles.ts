import { SxProps, Theme } from '@mui/material';

// Container styles
export const containerStyles: SxProps<Theme> = {
  mt: 0,
  mb: 4,
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  p: 2,
};

// Back button styles
export const backButtonStyles: SxProps<Theme> = {
  mb: 2,
  textTransform: 'none',
  color: '#1A1A1A',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
};

// Paper styles
export const paperStyles: SxProps<Theme> = {
  p: 1,
  mb: 2,
  backgroundColor: 'transparent',
};

// Title styles
export const titleStyles: SxProps<Theme> = {
  mb: 2,
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
};

// Section styles
export const sectionStyles: SxProps<Theme> = {
  mb: 4,
};

// Section title styles
export const sectionTitleStyles: SxProps<Theme> = {
  mb: 1,
  color: '#4E4B66',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

// Form row styles
export const formRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mb: 2,
  mt: 2,
  width: '100%',
};

// Form field styles
export const formFieldStyles: SxProps<Theme> = {
  flex: 1,
  width: '100%',
  maxWidth: { xs: '100%', sm: 300 },
  '&.MuiFormControl-root': {
    width: '100%',
  },
};

// Select styles
export const selectStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D9D9D9',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#B3B3B3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#002CBA',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  height: '45px',
  width: '100%',
};

// Disabled select styles
export const disabledSelectStyles: SxProps<Theme> = {
  ...selectStyles,
  height: '45px',
  backgroundColor: '#F6F6F6',
  width: '100%',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D9D9D9',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#B3B3B3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#002CBA',
  },
};

// Menu item text styles
export const menuItemTextStyles: SxProps<Theme> = {
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Disabled menu item text styles
export const disabledMenuItemTextStyles: SxProps<Theme> = {
  color: '#1A1A1A80',
};

// Text field styles
export const getTextFieldStyles = (hasError: boolean): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    height: '48px',
    '& fieldset': {
      borderColor: hasError ? '#FF3B30' : '#D9D9D9',
      borderRadius: '4px',
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#FF3B30' : '#B3B3B3',
    },
    '&.Mui-focused fieldset': {
      borderColor: hasError ? '#FF3B30' : '#002CBA',
    },
    backgroundColor: '#F6F6F6',
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    maxHeight: '45px',
  },
  '& .MuiSelect-icon': {
    color: '#4E4B66',
  },
});

// Divider styles
export const dividerStyles: SxProps<Theme> = {
  my: 3,
};

// Debug info styles
export const debugInfoStyles: SxProps<Theme> = {
  p: 2,
  backgroundColor: '#f5f5f5',
  borderRadius: 1,
  mb: 2,
  display: 'none',
};

// Submit button container styles
export const submitButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  mt: 4,
};

// Submit button styles
export const submitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  borderRadius: '4px',
  padding: '8px 24px',
  minWidth: '120px',
  '&:hover': {
    backgroundColor: '#0020A3',
  },
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  fontWeight: 500,
  position: 'relative',
  '& .MuiButton-startIcon': {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
};

// Required indicator styles
export const requiredIndicatorStyles = {
  color: '#FF3B30',
  marginLeft: '4px',
};

// Form grid container styles
export const formGridContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  flexWrap: 'wrap',
  gap: { xs: 3, md: 4 },
  mb: 4,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
};

export const formFieldContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  gap: '20px',
  width: '100%',
  '& > *': {
    flex: '0 0 calc(50% - 10px)',
    maxWidth: '350px',
  },
};

// Form field label styles
export const formFieldLabelStyles: SxProps<Theme> = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  mb: 1,
  fontFamily: 'Gilroy, sans-serif',
};

// Existing region code select styles
export const existingRegionCodeSelectStyles: SxProps<Theme> = {
  height: '48px',
  borderRadius: '4px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E0E0E0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#BDBDBD',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976D2',
  },
  fontSize: '14px',
  fontFamily: 'Gilroy, sans-serif',
  '& .MuiSelect-select': {
    color: '#666',
  },
};

// Existing region name select styles (disabled)
export const existingRegionNameSelectStyles: SxProps<Theme> = {
  height: '42px',
  borderRadius: '4px',
  '& .MuiOutlinedInput-root': {
    height: '42px',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976D2',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  '& .MuiSelect-select': {
    height: '45px',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
  },
};

// Existing region code select styles with error handling
export const getExistingRegionCodeSelectStyles = (
  hasError: boolean
): SxProps<Theme> => ({
  height: '42px',
  '& .MuiOutlinedInput-root': {
    height: '42px',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    backgroundColor: '#F6F6F6',
    '& fieldset': {
      borderColor: hasError ? '#D32F2F' : '#D1D1D1',
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#D32F2F' : '#D1D1D1',
    },
    '&:hover': {
      backgroundColor: '#F6F6F6',
    },
    '&.Mui-focused fieldset': {
      borderColor: hasError ? '#D32F2F' : '#D1D1D1',
    },
    '&.Mui-focused': {
      backgroundColor: '#F6F6F6',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      cursor: 'not-allowed',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  '& .MuiSelect-select': {
    height: '42px',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      WebkitTextFillColor: '#666',
      cursor: 'not-allowed',
    },
  },
  '&.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    cursor: 'not-allowed',
  },
});

// New region code select styles with error handling
export const getNewRegionCodeSelectStyles = (
  hasError: boolean
): SxProps<Theme> => ({
  height: '42px',
  '& .MuiOutlinedInput-root': {
    height: '42px',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      borderColor: hasError ? '#D32F2F' : '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#D32F2F' : '#BDBDBD',
    },
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
    '&.Mui-focused fieldset': {
      borderColor: hasError ? '#D32F2F' : '#1976D2',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  '& .MuiSelect-select': {
    height: '42px',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
    },
  },
});

// New region name text field styles
export const newRegionNameTextFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: '42px',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    backgroundColor: '#F6F6F6',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976D2',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
    '& .MuiInputBase-input': {
      height: '42px',
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
    },
  },
};

// Menu item typography styles
export const menuItemTypographyStyles: SxProps<Theme> = {
  fontSize: '14px',
};

// Placeholder menu item styles
export const placeholderMenuItemStyles: SxProps<Theme> = {
  color: '#666',
  fontSize: '14px',
};

// Submit button container updated styles
export const newSubmitButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  mt: 4,
};

// Updated submit button styles
export const newSubmitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#0022A3',
    boxShadow: 'none',
  },
  '&:disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};
