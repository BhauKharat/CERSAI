import { SxProps, Theme } from '@mui/material/styles';

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

// Section title styles
export const sectionTitleStyles: SxProps<Theme> = {
  fontWeight: 500,
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Form section styles
export const formSectionStyles: SxProps<Theme> = {
  mb: 4,
  marginTop: '20px',
};

// Form row styles
export const formRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mb: 2,
  width: '100%',
};

// Responsive form row with flexible items
export const responsiveFormRowStyles: SxProps<Theme> = {
  ...formRowStyles,
  alignItems: { xs: 'stretch', sm: 'flex-start' },
  '& > *': {
    minWidth: { xs: '100%', sm: 'auto' },
  },
};

// Form field styles
export const formFieldStyles: SxProps<Theme> = {
  width: { xs: '100%', sm: '350px' },
  maxWidth: { xs: '100%', sm: '350px' },
};

// Select styles
export const selectStyles: SxProps<Theme> = {
  backgroundColor: 'white',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D9D9D9',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#B3B3B3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#002CBA',
  },
  '&.Mui-disabled': {
    backgroundColor: '#F5F5F5',
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#F5F5F5',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
  },
  height: '45px',
  display: 'flex',
  alignItems: 'center',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

// Menu item text styles
export const menuItemTextStyles: SxProps<Theme> = {
  fontWeight: 500,
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Add button styles
export const addButtonStyles: SxProps<Theme> = {
  height: '45px',
  width: 100,
  textTransform: 'none',
  borderColor: '#002CBA',
  color: '#002CBA',
  '&:hover': {
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
    borderColor: '#0020A3',
  },
  '&.Mui-disabled': {
    borderColor: '#E0E0E0',
    color: '#9E9E9E',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

// Region list container styles
export const regionListContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
  maxWidth: { xs: '100%', sm: 300 },
};

// Region item styles
export const regionItemStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  py: 1.0,
  px: 2.5,
  border: '1px solid #D9D9D9',
  borderRadius: 1,
  backgroundColor: 'white',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

// Remove icon button styles
export const removeIconButtonStyles: SxProps<Theme> = {
  color: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: 'rgba(0, 0, 0, 0.8)',
  },
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
};

// Error text styles
export const errorTextStyles: SxProps<Theme> = {
  mt: 1,
  mb: 2,
};

// Disabled select styles
export const disabledSelectStyles: SxProps<Theme> = {
  '&.Mui-disabled': {
    backgroundColor: '#F5F5F5',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
  },
};

// Merged region list container styles
export const mergedRegionListContainerStyles: SxProps<Theme> = {
  mb: 4,
  mt: 2,
};

// Error message styles
export const errorMessageStyles: SxProps<Theme> = {
  mt: 1,
};

// Divider styles
export const dividerStyles: SxProps<Theme> = {
  my: 3,
};

// Section header styles
export const sectionHeaderStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  mb: 2,
};

// Required indicator styles
export const requiredIndicatorStyles: React.CSSProperties = {
  color: 'red',
};
