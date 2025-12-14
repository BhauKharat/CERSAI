/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SxProps, Theme } from '@mui/material';
export const containerStyles: SxProps<Theme> = {
  mt: -3,
  mb: 4,
  backgroundColor: '#F8F9FD',
  minHeight: '100vh',
  p: 3,
};

export const backButtonStyles: SxProps<Theme> = {
  mb: 1,
  textTransform: 'none',
  color: '#1A1A1A',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
};

export const paperStyles: SxProps<Theme> = {
  p: 1,
  mb: 2,
  backgroundColor: 'transparent',
};

export const titleStyles: SxProps<Theme> = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: 'Gilroy-SemiBold, sans-serif',
  marginLeft: '10px',
};

export const formContainerStyles: SxProps<Theme> = {
  maxWidth: { xs: '100%', sm: '400px' },
  width: '100%',
};

export const formFieldContainerStyles: SxProps<Theme> = {
  mb: 0,
};

export const labelStyles: SxProps<Theme> = {
  mb: 1,
  color: '#1A1A1A',
  fontWeight: 400,
  fontFamily: 'Gilroy-SemiBold, sans-serif',
  fontSize: '14px',
};

export const inputStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy-Medium',
  fontSize: '15px',
  height: '48px',
  fontWeight: 500,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: '#D9D9D9',
      fontSize: '15px',
      fontFamily: 'Gilroy-Medium',
    },
    '&:hover fieldset': {
      borderColor: '#B3B3B3',
      fontSize: '15px',
      fontFamily: 'Gilroy-Medium',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
      fontSize: '15px',
      fontFamily: 'Gilroy-Medium',
    },
    '& .MuiInputBase-input': {
      height: '48px !important',
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '15px',
      fontFamily: 'Gilroy-Medium',
    },
    // Add disabled state
    '&.Mui-disabled': {
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: '#D9D9D9',
      },
    },
  },
};
// -------------sk-------------------
export const inputStyles2: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  marginTop: '-6px',
  fontSize: '14px',
  fontWeight: 500,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: '#D9D9D9',
      fontSize: '14px',
      fontFamily: 'Gilroy, sans-serif',
    },
    '&:hover fieldset': {
      borderColor: '#B3B3B3',
      fontSize: '14px',
      fontFamily: 'Gilroy, sans-serif',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
      fontSize: '14px',
      fontFamily: 'Gilroy, sans-serif',
    },
    '& .MuiInputBase-input': {
      height: '18px',
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontFamily: 'Gilroy, sans-serif',
    },
  },
};

export const sectionTitleStyles: SxProps<Theme> = {
  mb: 1,
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
};

export const addressRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mt: 2,
  mb: 2,
  width: '100%',
  '& > *': {
    width: { xs: '100%', sm: 'auto' },
  },
};

export const addressFieldStyles: SxProps<Theme> = {
  flex: { xs: '0 0 auto', sm: 1 },
  width: '100%',
};

export const requiredField: React.CSSProperties = {
  color: 'red',
};

export const selectStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy-Medium',
  fontSize: '15px',
  fontWeight: 400,
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
  '& .MuiSelect-select': {
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
  },
  '&.Mui-disabled': {
    backgroundColor: '#f5f5f5',
    '& fieldset': {
      borderColor: '#D9D9D9',
    },
  },
  height: '48px',
};
export const selectStyles2: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
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
  '& .MuiSelect-select': {
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
  },
  height: '85px',
};

export const addressSectionContainer: SxProps<Theme> = {
  width: '100%',
};

export const addressSectionTitle: SxProps<Theme> = {
  mb: 1,
  mt: 3,
};

export const formRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: 2,
  mb: 2,
  width: '100%',
  '& > *': {
    width: { xs: '100%', sm: 'auto' },
  },
};

export const backButtonIconStyles: SxProps<Theme> = {
  color: '#1A1A1A',
};

export const formDividerStyles: SxProps<Theme> = {
  my: 3,
  borderColor: '#E0E0E0',
};

export const formActionsContainer: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 2,
  mt: 5,
};

export const approveButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  fontSize: '16px',
  minWidth: '120px',
  padding: '8px 24px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  '&:hover': {
    backgroundColor: '#0022A3',
  },
  '&:disabled': {
    backgroundColor: '#F0F0F0',
    color: '#A0A0A0',
  },
};

export const rejectButtonStyles: SxProps<Theme> = {
  borderColor: '#002CBA',
  color: '#002CBA',
  textTransform: 'none',
  fontSize: '16px',
  minWidth: '120px',
  padding: '8px 24px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  '&:hover': {
    borderColor: '#0022A3',
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
};

export const newInputStyle: SxProps<Theme> = {
  fontFamily: 'Gilroy-Medium, sans-serif',
  fontWeight: 700,
};
export const trackTitle: SxProps<Theme> = {
  m: 2,
  color: '#1A1A1A',
  fontWeight: 600,
  fontFamily: 'Gilroy-Bold, sans-serif',
  fontSize: '24px',
  textAlign: 'center',
};
