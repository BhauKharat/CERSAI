import { SxProps, Theme } from '@mui/material/styles';

// Container styles
export const containerStyles: SxProps<Theme> = {
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  p: 2,
};

// Paper styles
export const paperStyles: SxProps<Theme> = {
  p: 1,
  mb: 2,
  backgroundColor: 'transparent',
  marginTop: '10px',
};

// Form container styles
export const formContainerStyles: SxProps<Theme> = {
  maxWidth: '400px',
  width: '100%',
  '@media (max-width: 600px)': {
    maxWidth: '100%',
  },
};

// Address section container styles
export const addressSectionStyles: SxProps<Theme> = {
  mb: 2,
  mt: 4,
};

// Back button styles
export const backButtonStyles: SxProps<Theme> = {
  mb: 1,
  textTransform: 'none',
  color: '#1A1A1A',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
};

// Title styles
export const titleStyles: SxProps<Theme> = {
  mb: 2,
  color: '#1A1A1A',
  fontSize: '16px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
};

// Section title styles
export const sectionTitleStyles: SxProps<Theme> = {
  mb: 1,
  color: '#1A1A1A',
  fontSize: '16px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
};

// Form field container styles
export const formFieldContainerStyles: SxProps<Theme> = {
  mb: 2,
};

// Label styles
export const labelStyles: SxProps<Theme> = {
  mb: 1,
  color: '#1A1A1A',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Required indicator styles
export const requiredIndicatorStyles: React.CSSProperties = {
  color: 'red',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

// Text field styles
export const textFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: '#D9D9D9',
    },
    '&:hover fieldset': {
      borderColor: '#B3B3B3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    height: '45px',
  },
};

// Select styles
export const selectStyles: SxProps<Theme> = {
  backgroundColor: 'white',
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
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 400,
  height: '45px',
};

// Divider styles
export const dividerStyles: SxProps<Theme> = {
  my: 3,
  borderColor: '#E0E0E0',
};

// Submit button container styles
export const submitButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  mt: 3,
};

// Submit button styles
export const submitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  fontSize: '16px',
  width: '150px',
  height: '48px',
  '&:hover': {
    backgroundColor: '#0022A3',
  },
  '&:disabled': {
    backgroundColor: '#F0F0F0',
    color: '#A0A0A0',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
};

// Deactivate button styles
export const deactivateButtonStyles: SxProps<Theme> = {
  borderColor: '#002CBA',
  color: '#002CBA',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '4px',
  width: '150px',
  height: '48px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#002CBA',
    color: 'white',
  },
  fontFamily: 'Gilroy, sans-serif',
};

// Transfer button styles
export const transferButtonStyles: SxProps<Theme> = {
  borderColor: '#002CBA',
  color: '#002CBA',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '4px',
  width: '150px',
  height: '48px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#002CBA',
    color: 'white',
  },
  fontFamily: 'Gilroy, sans-serif',
};

// Merge button styles
export const mergeButtonStyles: SxProps<Theme> = {
  borderColor: '#002CBA',
  color: '#002CBA',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '4px',
  width: '150px',
  height: '48px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#002CBA',
    color: 'white',
  },
  fontFamily: 'Gilroy, sans-serif',
};

// Modify button styles
export const modifyButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '4px',
  width: '150px',
  height: '48px',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#0020A3',
  },
  fontFamily: 'Gilroy, sans-serif',
};

// Address row styles
export const addressRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 2,
  mb: 2,
  width: '100%',
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    gap: 1,
    '& > *': {
      width: '100%',
      mb: 1,
    },
  },
};

// Address field styles
export const addressFieldStyles: SxProps<Theme> = {
  flex: 1,
  minWidth: '200px',
  '@media (max-width: 600px)': {
    width: '100%',
    minWidth: '100%',
    flex: '0 0 100%',
  },
};
