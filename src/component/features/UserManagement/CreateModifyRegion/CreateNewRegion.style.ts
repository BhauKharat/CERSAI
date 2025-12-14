import { SxProps, Theme } from '@mui/material';

export const containerStyles: SxProps<Theme> = {
  mt: 0,
  mb: 4,
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  p: { xs: 2, sm: 3 },
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
  color: 'rgba(0, 0, 0, 1)',
  fontWeight: 600,
  fontSize: '18px',
  fontFamily: 'Gilroy, sans-serif',
  lineHeight: '26px',
  marginTop: '15px',
};

export const formContainerStyles: SxProps<Theme> = {
  maxWidth: '100%',
  width: '100%',
  backgroundColor: 'transparent',
  mt: 3,
};

export const formFieldContainerStyles: SxProps<Theme> = {
  mb: 3,
};

export const labelStyles: SxProps<Theme> = {
  mb: 1,
  color: '#1A1A1A',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

export const inputStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '4px',
    height: '48px',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
      fontWeight: 500,
      fontFamily: 'Gilroy, sans-serif',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
    '& .MuiInputBase-input': {
      height: '48px',
      padding: '0 14px',
      fontWeight: 500,
      fontFamily: 'Gilroy, sans-serif',
      display: 'flex',
      alignItems: 'center',
      '&::placeholder': {
        color: '#999999',
        opacity: 1,
        fontWeight: 500,
        fontFamily: 'Gilroy, sans-serif',
      },
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
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 3 },
  mt: 2,
  mb: 3,
  width: '100%',
  '& > *': {
    width: { xs: '100%', md: 'auto' },
  },
};

export const addressFieldStyles: SxProps<Theme> = {
  flex: { xs: '0 0 auto', md: 1 },
  width: '350px',
  minWidth: { xs: '350px', md: '200px' },
};

export const regionFieldStyles: SxProps<Theme> = {
  width: { xs: '100%', md: '350px' },
  minWidth: { xs: '100%', md: '350px' },
  maxWidth: { xs: '100%', md: '350px' },
};

export const requiredField: React.CSSProperties = {
  color: 'red',
};

export const selectStyles: SxProps<Theme> = {
  '&.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
  },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  backgroundColor: 'white',
  borderRadius: '6px',
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
    color: '#1A1A1A',
    fontWeight: 500,
    fontFamily: 'Gilroy, sans-serif',
  },
  '& .MuiSelect-placeholder': {
    color: '#999999',
    fontWeight: 500,
    fontFamily: 'Gilroy, sans-serif',
  },
  height: '45px',
};

export const addressSectionContainer: SxProps<Theme> = {
  width: '100%',
};

export const addressSectionTitle: SxProps<Theme> = {
  mb: 3,
  mt: 4,
};

export const formRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 3 },
  mb: 3,
  width: '100%',
  '& > *': {
    width: { xs: '100%', md: 'auto' },
  },
};

export const backButtonIconStyles: SxProps<Theme> = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
};

export const formDividerStyles: SxProps<Theme> = {
  my: 3,
  borderColor: '#E0E0E0',
};

export const formActionsContainer: SxProps<Theme> = {
  display: 'flex',
  justifyContent: { xs: 'center', sm: 'flex-end' },
  mt: 4,
  pt: 3,
  borderTop: '1px solid #E0E0E0',
};

export const submitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  fontSize: '16px',
  minWidth: { xs: '100%', sm: '150px' },
  padding: '12px 24px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: '#0022A3',
  },
  '&:disabled': {
    backgroundColor: '#F0F0F0',
    color: '#A0A0A0',
  },
};

// Modify mode button container
export const modifyButtonsContainer: SxProps<Theme> = {
  display: 'flex',
  justifyContent: { xs: 'center', sm: 'flex-end' },
  gap: 2,
  mt: 4,
  pt: 3,
  borderTop: '1px solid #E0E0E0',
  flexDirection: { xs: 'column', sm: 'row' },
};

// De-activate button styles
export const deactivateButtonStyles: SxProps<Theme> = {
  backgroundColor: 'transparent',
  color: '#002CBA',
  border: '1px solid #002CBA',
  textTransform: 'none',
  fontSize: '16px',
  minWidth: { xs: '100%', sm: '150px' },
  padding: '12px 24px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
};

// Merge button styles
export const mergeButtonStyles: SxProps<Theme> = {
  backgroundColor: 'transparent',
  color: '#002CBA',
  border: '1px solid #002CBA',
  textTransform: 'none',
  fontSize: '16px',
  minWidth: { xs: '100%', sm: '150px' },
  padding: '12px 24px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
};

// Modify button styles
export const modifyButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  fontSize: '16px',
  minWidth: { xs: '100%', sm: '150px' },
  padding: '12px 24px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: '#0022A3',
  },
  '&:disabled': {
    backgroundColor: '#F0F0F0',
    color: '#A0A0A0',
  },
};
