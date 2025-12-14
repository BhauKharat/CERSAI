import { SxProps, Theme } from '@mui/material';

export const containerStyles: SxProps<Theme> = {
  mt: -3,
  mb: 4,
  backgroundColor: '#FFFFFF',
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
  mb: 2,
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
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
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

export const inputStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
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
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
    '& .MuiInputBase-input': {
      height: '45px',
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
  '&.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
  },
  '& .MuiSelect-select': {
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
  },
  height: '45px',
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
