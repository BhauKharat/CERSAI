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
  ml: 2,
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
    ml: 0,
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
  gridTemplateColumns: 'repeat(2, 350px)',
  gap: theme.spacing(0, 5),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3, 0),
  },
});

export const singleItemRowStyles: SxProps<Theme> = (theme) => ({
  width: '350px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
});

export const labelStyles: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
  marginBottom: 1,
  fontFamily: 'Gilroy, sans-serif',
};

export const sectionTitleStyles: SxProps<Theme> = {
  fontSize: 16,
  fontWeight: 600,
  color: '#333',
  marginBottom: 2,
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

export const inputStyles: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    height: '48px',
    fontFamily: 'Gilroy, sans-serif',
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
    },
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  '&.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
  },
  '& .MuiSelect-select': {
    padding: '12.5px 14px',
  },
};

export const mergingBranchesContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '350px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
});

export const actionsContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: 4,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: 2,
    '& .MuiButton-root': {
      width: '100%',
      margin: 0,
    },
  },
});
