import { SxProps, Theme } from '@mui/material';

export const dialogPaperStyles: SxProps<Theme> = {
  borderRadius: '8px',
  padding: '24px',
  maxWidth: '500px',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
};

export const dialogTitleStyles: SxProps<Theme> = {
  p: 0,
  mb: 3,
  position: 'relative',
};

export const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 0,
  top: 0,
  color: 'text.secondary',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
};

export const dialogContentStyles: SxProps<Theme> = {
  p: 0,
  mb: 3,
};

export const contentContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  mb: 0,
};

export const iconContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
};

export const errorIconStyles: SxProps<Theme> = {
  color: '#FF0707',
  height: '50px',
  width: '50px',
};

export const titleTextStyles: SxProps<Theme> = {
  textAlign: 'center',
  color: '#000000',
  mb: 3,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
};

export const remarkLabelStyles: SxProps<Theme> = {
  color: '#4E4B66',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  mb: 1,
};

export const requiredFieldStyles: SxProps<Theme> = {
  color: '#FF3B30',
};

export const helperTextStyles: SxProps<Theme> = {
  marginLeft: 0,
  color: '#FF3B30',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '12px',
};

export const textFieldStyles = (error: boolean): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    '& fieldset': {
      borderColor: error ? '#FF3B30' : '#D9D9D9',
    },
    '&:hover fieldset': {
      borderColor: error ? '#FF3B30' : '#B3B3B3',
    },
    '&.Mui-focused fieldset': {
      borderColor: error ? '#FF3B30' : '#002CBA',
    },
  },
});

export const characterCountStyles: SxProps<Theme> = {
  display: 'block',
  textAlign: 'right',
  color: '#6E6D7A',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '12px',
  mt: 0.5,
};

export const dialogActionsStyles: SxProps<Theme> = {
  p: 0,
  gap: 2,
  display: 'flex',
  width: '100%',
};

export const cancelButtonStyles: SxProps<Theme> = {
  color: '#002CBA',
  borderColor: '#002CBA',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  py: 1.5,
  '&:hover': {
    backgroundColor: '#F5F5F5',
    borderColor: '#B3B3B3',
  },
  '&.Mui-disabled': {
    borderColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};

export const confirmButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: '4px',
  py: 1.5,
  '&:hover': {
    backgroundColor: '#0020A3',
  },
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};
