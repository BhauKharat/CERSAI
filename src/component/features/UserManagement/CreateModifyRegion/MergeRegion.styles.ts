import { SxProps, Theme } from '@mui/material/styles';

export const containerStyles: SxProps<Theme> = {
  mt: 0,
  mb: 4,
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  p: { xs: 2, sm: 3 },
};

export const backButtonStyles: SxProps<Theme> = {
  mb: 2,
  textTransform: 'none',
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

export const backButtonIconStyles: SxProps<Theme> = {
  fontSize: '18px',
};

export const paperStyles: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
  mb: 2,
  backgroundColor: 'transparent',
};

export const titleStyles: SxProps<Theme> = {
  mb: { xs: 2, sm: 3 },
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '16px', sm: '18px' },
  fontWeight: 600,
};

export const formStyles: SxProps<Theme> = {
  width: '100%',
};

export const retainedSectionStyles: SxProps<Theme> = {
  mb: { xs: 3, sm: 4 },
};

export const retainedRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 2 },
  mb: 2,
};

export const fieldLabelStyles: SxProps<Theme> = {
  mb: 1,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '13px', sm: '14px' },
  fontWeight: 600,
  color: '#1A1A1A',
};

export const selectStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#002CBA',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#B3B3B3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D9D9D9',
  },
  '&.Mui-disabled': {
    backgroundColor: '#F5F5F5',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Gilroy, sans-serif',
    fontSize: { xs: '13px', sm: '14px' },
    fontWeight: 400,
    borderColor: '#002CBA',
  },
  height: { xs: '40px', sm: '45px' },
  backgroundColor: 'white',
};

export const formControlStyles: SxProps<Theme> = {
  width: '100%',
};

export const regionSectionStyles: SxProps<Theme> = {
  marginTop: { xs: '20px', sm: '20px' },
  mb: { xs: 3, sm: 4 },
};

export const regionLabelStyles: SxProps<Theme> = {
  mb: 1,
  color: '#1A1A1A',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

export const requiredAsteriskStyles: SxProps<Theme> = {
  color: '#FF0000',
  ml: 0.5,
};

export const regionInputRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 2 },
  mb: 2,
  alignItems: { xs: 'stretch', sm: 'flex-end' },
};

export const searchSelectStyles: SxProps<Theme> = {
  ...selectStyles,
  '&.Mui-disabled': {
    backgroundColor: '#F5F5F5',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
  },
};

export const addButtonStyles: SxProps<Theme> = {
  height: { xs: '40px', sm: '45px' },
  width: { xs: '100%', sm: '100px' },
  textTransform: 'none',
  backgroundColor: '#F8F9FD',
  borderColor: '#002CBA',
  color: '#002CBA',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '13px', sm: '14px' },
  fontWeight: 500,
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#F1F3F9',
    borderColor: '#4B5563',
  },
  '&.Mui-disabled': {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};

export const searchBoxStyles: SxProps<Theme> = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'white',
  border: '1px solid #D9D9D9',
  borderTop: 'none',
  borderRadius: '0 0 4px 4px',
  maxHeight: { xs: '150px', sm: '200px' },
  overflowY: 'auto',
  zIndex: 1000,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
};

export const searchInputStyles: SxProps<Theme> = {
  width: '100%',
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
      backgroundColor: '#F5F5F5',
      '& fieldset': {
        borderColor: '#D9D9D9',
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

export const searchOptionStyles: SxProps<Theme> = {
  p: { xs: 1, sm: 1.5 },
  cursor: 'pointer',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '13px', sm: '14px' },
  borderBottom: '1px solid #F0F0F0',
  '&:hover': {
    backgroundColor: 'white',
  },
  '&:last-child': {
    borderBottom: 'none',
  },
};

export const selectedOptionStyles: SxProps<Theme> = {
  ...searchOptionStyles,
  backgroundColor: 'white',
  color: '#002CBA',
};

export const regionListStyles: SxProps<Theme> = {
  mb: 4,
  mt: 2,
};

export const regionItemStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  py: 1.5,
  px: 2,
  border: '1px solid #D9D9D9',
  borderRadius: '4px',
  backgroundColor: 'white',
  mb: 1,
  width: { xs: '100%', sm: '300px' },
  maxWidth: '100%',
};

export const regionItemTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '13px', sm: '14px' },
  fontWeight: 400,
  color: '#1A1A1A',
  wordBreak: 'break-word',
};

export const removeButtonStyles: SxProps<Theme> = {
  color: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: 'rgba(0, 0, 0, 0.8)',
  },
};

export const dividerStyles: SxProps<Theme> = {
  my: { xs: 2, sm: 3 },
  borderColor: '#E0E0E0',
};

export const submitButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: { xs: 'center', sm: 'flex-end' },
  mt: { xs: 3, sm: 4 },
};

export const submitButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  borderRadius: '4px',
  padding: { xs: '12px 24px', sm: '12px 32px' },
  minWidth: { xs: '200px', sm: '180px' },
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: '300px', sm: 'none' },
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#0020A3',
  },
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};

export const errorTextStyles: SxProps<Theme> = {
  color: '#FF0000',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '11px', sm: '12px' },
  mt: 1,
  mb: 2,
};

export const menuItemStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: { xs: '13px', sm: '14px' },
  fontWeight: 400,
  py: { xs: 0.5, sm: 1 },
};

export const placeholderTextStyles: SxProps<Theme> = {
  ...menuItemStyles,
  color: 'rgba(0, 0, 0, 0.6)',
};
