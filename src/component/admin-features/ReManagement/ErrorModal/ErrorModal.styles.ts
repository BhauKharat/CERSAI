import { SxProps, Theme } from '@mui/material';

export const dialogStyles: SxProps<Theme> = {
  '& .MuiDialog-paper': {
    borderRadius: '0px',
    padding: '24px',
    textAlign: 'center',
    width: '450px',
    maxWidth: 'calc(100% - 32px)',
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    fontSize: '16px',
  },
};

export const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 8,
  top: 8,
  color: (theme) => theme.palette.grey[500],
};

export const dialogTitleStyles: SxProps<Theme> = {
  p: 0,
  mb: 2,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '16px',
};

export const iconContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
};

export const errorIconStyles: SxProps<Theme> = {
  color: '#D32F2F',
  fontSize: 60,
  mt: 2,
};

export const dialogContentStyles: SxProps<Theme> = {
  p: 0,
  mb: 3,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '16px',
};

export const messageTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '18px',
  mb: 1,
};

export const dialogActionsStyles: SxProps<Theme> = {
  justifyContent: 'center',
  p: 0,
};

export const buttonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  minWidth: '180px',
  padding: '8px 24px',
  '&:hover': {
    backgroundColor: '#0022A3',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '16px',
};
