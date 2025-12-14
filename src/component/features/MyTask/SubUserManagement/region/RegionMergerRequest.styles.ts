import { SxProps, Theme } from '@mui/material';

export const containerStyles: SxProps<Theme> = (theme) => ({
  minHeight: '100vh',
  background: '#FFFFFF',
  padding: theme.spacing(2),
});

export const backButtonStyles: SxProps<Theme> = (theme) => ({
  mb: 2,
  color: '#222',
  fontWeight: 500,
  fontSize: 16,
  textTransform: 'none',
  fontFamily: 'Gilroy, sans-serif',
  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
    mb: 1,
  },
});

export const headerStyles: SxProps<Theme> = (theme) => ({
  mb: 3,
  ml: 0,
  fontSize: 16,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
    mb: 2,
    ml: 0,
  },
});

export const retainedRowStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  gap: 2,
  mb: 3,
  alignItems: 'flex-start',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    mb: 1,
    gap: 2,
  },
});

export const mergingFieldBoxStyles: SxProps<Theme> = (theme) => ({
  [theme.breakpoints.down('sm')]: {
    mb: 5, // maximum vertical margin between fields in mobile
  },
});

export const retainedLabelStyles: SxProps<Theme> = (theme) => ({
  fontWeight: 500,
  fontSize: 14,
  fontFamily: 'Gilroy, sans-serif',
  mb: 1,
  [theme.breakpoints.down('sm')]: {
    fontSize: 13,
    mb: 0.5,
  },
});

export const retainedTextFieldStyles: SxProps<Theme> = (theme) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '10px 14px',
  },
  marginTop: '4px', // Add small margin between label and input
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    fontSize: 14,
  },
});

export const mergingHeaderStyles: SxProps<Theme> = (theme) => ({
  mt: 0,
  mb: 2,
  fontSize: 16,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
    mt: 0,
    mb: 1.5,
  },
});

export const mergingFieldsContainer: SxProps<Theme> = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  mb: 2,
  [theme.breakpoints.down('sm')]: {
    gap: 1,
    mb: 1.5,
  },
});

export const mergingTextFieldStyles: SxProps<Theme> = (theme) => ({
  width: 350,
  maxWidth: '100%',
  height: 15,
  '& .MuiInputBase-input': { height: 15 },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
});
