import { SxProps, Theme } from '@mui/material';
// import { BranchStatus } from './BranchTab';

export const tableRowStyles: SxProps<Theme> = {
  '&:hover': { backgroundColor: '#E4F6FF' },
};

export const cellStyles: SxProps<Theme> = {
  p: '16px',
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  color: 'rgba(0, 44, 186, 1)',
};

export const statusIndicatorStyles: SxProps<Theme> = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 118, 0, 1)',
  mr: 1,
};

export const statusTextStyles = (
  status: 'Approved' | 'Pending Approval'
): SxProps<Theme> => ({
  color: status === 'Approved' ? '#52AE32' : 'rgba(255, 118, 0, 1)',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
});

export const actionCellStyles: SxProps<Theme> = {
  p: '8px',
  textAlign: 'center',
};

export const backButtonContainerStyles: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex',
  alignItems: 'center',
  mt: -1,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
});

export const backButtonStyles: SxProps<Theme> = {
  color: '#1A1A1A',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  },
};
