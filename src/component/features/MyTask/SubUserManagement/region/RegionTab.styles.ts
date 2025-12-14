import { SxProps, Theme } from '@mui/material';

// Container styles
export const containerStyles: SxProps<Theme> = {
  mb: 4,
  backgroundColor: '#F8F9FD',
};
export const paperStyles: SxProps<Theme> = {
  p: 2,
  mb: 2,
  backgroundColor: 'transparent',
};

export const tableRowStyles: SxProps<Theme> = {
  '&:hover': {
    backgroundColor: '#E4F6FF',
    '& .MuiTableCell-root:not(:last-child)': {
      borderRight: '8px solid #E4F6FF',
    },
  },
};

export const actionButtonStyles: SxProps<Theme> = {
  color: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

// Search and filter styles
export const searchContainerStyles: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});

// Search and filter row styles
export const searchFilterRowStyles: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-end',
  },
});

export const textFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    '& input': {
      fontFamily: 'Gilroy, sans-serif',
      fontSize: '14px',
      fontWeight: 400,
    },
  },
};

export const buttonStyles = (
  variant: 'contained' | 'outlined' = 'contained'
): SxProps<Theme> => ({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  backgroundColor: variant === 'contained' ? '#002CBA' : 'transparent',
  color: variant === 'contained' ? 'white' : '#1A1A1A',
  '&:hover': {
    backgroundColor: variant === 'contained' ? '#001f8e' : 'transparent',
  },
  textTransform: 'none',
  px: 3,
  height: '40px',
  ...(variant === 'outlined' && { borderColor: '#E0E0E0' }),
});

// Table styles
export const tableContainerStyles: SxProps<Theme> = (theme: Theme) => ({
  mb: 4,
  backgroundColor: 'white',
  borderRadius: '8px',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    height: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
  },
  [theme.breakpoints.down('sm')]: {
    border: '1px solid rgba(224, 224, 224, 1)',
    borderRadius: '4px',
  },
});

export const tableHeadRowStyles: SxProps<Theme> = {
  backgroundColor: '#E6EBFF',
  '& .MuiTableCell-head': {
    backgroundColor: 'transparent',
    borderBottom: 'none',
  },
  '&:hover': { backgroundColor: '#E6EBFF' },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const tableCellStyles: SxProps<Theme> = {
  p: '14px 16px',
  color: '#333',
  textAlign: 'center',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 700,
  fontSize: '14px',
};

export const tableBodyStyles: SxProps<Theme> = {
  '& .MuiTableCell-root:not(:last-child)': {
    borderRight: '8px solid transparent',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-4px',
      top: 0,
      bottom: 0,
      width: '1px',
      backgroundColor: 'rgba(224, 224, 224, 1)',
    },
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 400,
    fontSize: '14px',
  },
};

export const cellStyles: SxProps<Theme> = {
  p: '16px',
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  color: 'rgba(0, 44, 186, 1)',
};

// Status styles
export const statusContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
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

// Pagination styles
export const paginationContainerStyles: SxProps<Theme> = (theme: Theme) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  justifyContent: 'space-between',
  alignItems: 'center',
  mt: 2,
  p: 2,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    gap: 0,
  },
});

export const paginationTextStyles: SxProps<Theme> = {
  color: '#666',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const paginationButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const paginationButtonStyles = (disabled: boolean): SxProps<Theme> => ({
  minWidth: 'auto',
  p: '4px 8px',
  color: disabled ? '#ccc' : '#1A1A1A',
  borderColor: '#E0E0E0',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#1A1A1A',
    backgroundColor: 'transparent',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
});

export const pageButtonStyles = (active: boolean): SxProps<Theme> => ({
  minWidth: '32px',
  minHeight: '32px',
  p: 0,
  color: active ? '#fff' : '#1A1A1A',
  backgroundColor: active ? '#002CBA' : 'transparent',
  borderColor: '#E0E0E0',
  '&:hover': {
    backgroundColor: active ? '#1A1A1A' : '#f5f5f5',
    borderColor: active ? '#1A1A1A' : '#E0E0E0',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
});

// Menu styles
export const menuStyles: SxProps<Theme> = {
  '& .MuiPaper-root': {
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    minWidth: '200px',
  },
};

export const menuItemStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  color: '#1A1A1A',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

export const actionMenuItemStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  color: '#1A1A1A',
  fontSize: '16px',
};

// Search input styles
export const searchInputContainerStyles: SxProps<Theme> = (theme: Theme) => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: '400px',
  },
});

export const searchLabelStyles: SxProps<Theme> = {
  mb: 0.5,
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const searchInputWrapperStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
};

// Status filter styles
export const statusFilterContainerStyles: SxProps<Theme> = {
  minWidth: 150,
};

export const statusFilterLabelStyles: SxProps<Theme> = {
  mb: 0.5,
  color: '#1A1A1A',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Action cell styles
export const actionCellStyles: SxProps<Theme> = {
  p: '8px',
  textAlign: 'center',
};

// Button styles
export const createNewButtonStyles = (
  variant: 'contained' | 'outlined' = 'contained'
): SxProps<Theme> => ({
  ...buttonStyles(variant),
  height: '40px',
  alignSelf: 'flex-end',
  mb: 0.1,
});

// Table column styles
export const tableColumnStyles = (theme: Theme) => ({
  col1: {
    width: '7%',
    [theme.breakpoints.up('sm')]: { width: '5%' },
  },
  col2: {
    width: '20%',
    [theme.breakpoints.up('sm')]: { width: '15%' },
  },
  col3: {
    width: '20%',
    [theme.breakpoints.up('sm')]: { width: '10%' },
  },
  col4: {
    width: '25%',
    [theme.breakpoints.up('sm')]: { width: '15%' },
  },
  col5: {
    width: '30%',
    [theme.breakpoints.up('sm')]: { width: '10%' },
  },
  col6: {
    width: '25%',
    [theme.breakpoints.up('sm')]: { width: '17%' },
  },
});

export const emptyRowStyles = (emptyRows: number): React.CSSProperties => ({
  height: 53 * emptyRows,
});

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

// Select styles
export const selectStyles: SxProps<Theme> = {
  '& .MuiSelect-select': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    color: '#1A1A1A',
    padding: '8.5px 14px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D0D5DD',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D0D5DD',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D0D5DD',
    borderWidth: '1px',
  },
};
