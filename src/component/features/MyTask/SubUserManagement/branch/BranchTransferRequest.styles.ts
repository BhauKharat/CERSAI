import { SxProps, Theme } from '@mui/material';

export const containerStyles: SxProps<Theme> = (theme) => ({
  minHeight: '100vh',
  background: '#FFFFFF',
  padding: theme.spacing(0, 4, 3, 4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 2, 2, 2),
  },
});

export const backButtonStyles: SxProps<Theme> = {
  color: '#222',
  fontWeight: 500,
  fontSize: 16,
  textTransform: 'none',
  fontFamily: 'Gilroy, sans-serif',
  marginBottom: 2,
};

export const headerStyles: SxProps<Theme> = (theme) => ({
  fontSize: 18,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  marginBottom: 3,
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
  },
});

export const formContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  ml: 2,
  [theme.breakpoints.down('sm')]: {
    ml: 0,
  },
});

export const formRowStyles: SxProps<Theme> = (theme) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(0, 3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3, 0),
  },
});

export const labelStyles: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
  marginBottom: 1,
  fontFamily: 'Gilroy, sans-serif',
};

export const readOnlyTextFieldStyles: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    backgroundColor: '#FAFAFA',
    height: '48px',
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
    fontFamily: 'Gilroy, sans-serif',
  },
};

export const actionsContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 4,
  gap: 2,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    '& .MuiButton-root': {
      width: '100%',
      margin: 0,
    },
  },
});

export const sectionHeaderStyles: SxProps<Theme> = (theme) => ({
  mt: 4,
  mb: 2,
  fontSize: 16,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
    mt: 3,
    mb: 1.5,
  },
});

export const labelStylesUpdated: SxProps<Theme> = (theme) => ({
  fontWeight: 500,
  fontSize: 14,
  fontFamily: 'Gilroy, sans-serif',
  mb: 1,
  [theme.breakpoints.down('sm')]: {
    fontSize: 13,
    mb: 0.5,
  },
});

export const textFieldStyles: SxProps<Theme> = (theme) => ({
  '& .MuiInputBase-root': {
    '&.Mui-disabled': {
      backgroundColor: '#F5F5F5',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F5F5F5',
      '& fieldset': {
        borderColor: '#D9D9D9',
      },
    },
  },
  '&.Mui-disabled': {
    backgroundColor: '#F5F5F5',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
  },
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '10px 14px',
  },
  marginTop: '4px',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    fontSize: 14,
  },
});
