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
  marginBottom: 4,
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
    marginBottom: 3,
  },
});

export const labelStyles: SxProps<Theme> = {
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
  marginBottom: 1,
};

export const formContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 350px)',
  gap: theme.spacing(3, 5),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
});

export const readOnlyTextFieldStyles: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
};

export const remarkTextFieldStyles: SxProps<Theme> = {
  gridColumn: '1 / -1',
  '& .MuiFormHelperText-root': {
    textAlign: 'right',
  },
};

export const infoNoteStyles: SxProps<Theme> = (theme) => ({
  marginTop: 2,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  borderRadius: 1,
  fontSize: 14,
  color: theme.palette.text.secondary,

  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: 3,
    fontSize: 13,
  },
});

export const viewDetailsLinkStyles: SxProps<Theme> = {
  marginLeft: 0.5,
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
  textDecoration: 'none',
  color: '#002CBA',
};

export const approveButton: SxProps<Theme> = {
  backgroundColor: '#006F43',
  '&:hover': {
    backgroundColor: '#005936',
  },
};

export const rejectButton: SxProps<Theme> = {
  color: '#C40000',
  borderColor: '#C40000',
  '&:hover': {
    backgroundColor: 'rgba(196, 0, 0, 0.04)',
    borderColor: '#A00000',
  },
};

export const actionsContainerStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 2,
  marginTop: 4,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    marginTop: 3,
    '& .MuiButton-root': {
      width: '100%',
    },
  },
});

export const modalHeader: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '18px',
  padding: '20px 24px 10px',
};

export const modalContent: SxProps<Theme> = {
  padding: '0 24px',
};

export const modalBodyText: SxProps<Theme> = {
  fontSize: '14px',
  marginBottom: 2,
};

export const modalActions: SxProps<Theme> = {
  padding: '20px 24px',
  gap: 1,
};
