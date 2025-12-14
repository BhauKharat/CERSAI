import { SxProps, Theme } from '@mui/material';

// Container styles
export const containerStyles: SxProps<Theme> = {
  mt: 2,
  mb: 4,
  backgroundColor: '#FFFFFF',
  px: { xs: 1, sm: 1, md: 2 },
};
export const paperStyles: SxProps<Theme> = {
  p: { xs: 1, sm: 1, md: 2 },
  mb: { xs: 1, sm: 1, md: 2 },
  backgroundColor: 'transparent',
};

export const tableRowStyles: SxProps<Theme> = {
  cursor: 'pointer',
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
export const searchContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 2 },
  alignItems: { xs: 'stretch', md: 'flex-end' },
  justifyContent: 'space-between',
  width: '100%',
};

// Search and filter row styles
export const searchFilterRowStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 2 },
  flex: 1,
  alignItems: { xs: 'stretch', sm: 'flex-end' },
};

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
export const tableContainerStyles: SxProps<Theme> = {
  mb: 4,
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid rgba(224, 224, 224, 1)',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c1c1c1',
    borderRadius: '4px',
  },
};

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
  borderBottom: '1px solid transparent',
  '& + .MuiTableBody-root .MuiTableRow-root:first-of-type:hover .MuiTableCell-root':
    {
      borderTop: '1px solid #E4F6FF',
    },
};

export const tableCellStyles: SxProps<Theme> = {
  p: { xs: '8px 4px', sm: '12px 8px', md: '12px 16px' },
  color: '#000000',
  textAlign: 'center',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: { xs: '12px', sm: '13px', md: '14px' },
  whiteSpace: 'nowrap',
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
    fontWeight: 600,
    fontSize: '14px',
  },
};

export const cellStyles: SxProps<Theme> = {
  p: { xs: '8px 4px', sm: '12px 8px', md: '16px' },
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: { xs: '12px', sm: '13px', md: '14px' },
  whiteSpace: 'nowrap',
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
  backgroundColor: '#52AE32',
  mr: 1,
};

export const statusTextStyles = (
  status: 'Approved' | 'Rejected' | 'Approval Pending'
): SxProps<Theme> => ({
  color: status === 'Approved' ? '#52AE32' : 'rgba(0, 0, 0, 0.6)',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
});

// Pagination styles
export const paginationContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'space-between',
  alignItems: { xs: 'center', sm: 'center' },
  gap: { xs: 2, sm: 0 },
  mt: 2,
  p: { xs: 1, sm: 2 },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
};

export const paginationTextStyles: SxProps<Theme> = {
  color: '#666',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const paginationButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 0.5, sm: 1 },
  flexWrap: 'wrap',
  justifyContent: 'center',
};

export const paginationButtonStyles = (disabled: boolean): SxProps<Theme> => ({
  minWidth: 'auto',
  p: { xs: '2px 6px', sm: '4px 8px' },
  color: disabled ? '#ccc' : '#1A1A1A',
  borderColor: '#E0E0E0',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#1A1A1A',
    backgroundColor: 'transparent',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: { xs: '12px', sm: '14px' },
});

export const pageButtonStyles = (active: boolean): SxProps<Theme> => ({
  minWidth: { xs: '28px', sm: '32px' },
  minHeight: { xs: '28px', sm: '32px' },
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
  fontSize: { xs: '12px', sm: '14px' },
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
export const searchInputContainerStyles: SxProps<Theme> = {
  width: { xs: '100%', sm: '300px', md: '400px' },
  minWidth: { xs: 'auto', sm: '250px' },
};

export const searchLabelStyles: SxProps<Theme> = {
  mb: 0.5,
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const searchInputWrapperStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 1, sm: 1 },
  alignItems: { xs: 'stretch', sm: 'center' },
};

// Status filter styles
export const statusFilterContainerStyles: SxProps<Theme> = {
  minWidth: { xs: 'auto', sm: 150 },
  width: { xs: '100%', sm: 'auto' },
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
  alignSelf: { xs: 'stretch', md: 'flex-end' },
  mb: 0.1,
  width: { xs: '100%', md: 'auto' },
});

// Table column styles
export const tableColumnStyles = {
  col1: { width: '10%', minWidth: '60px' },
  col2: { width: '18%', minWidth: '100px' },
  col3: { width: '18%', minWidth: '100px' },
  col4: { width: '27%', minWidth: '100px' },
  col5: { width: '27%', minWidth: '60px' },
};

export const emptyRowStyles = (emptyRows: number): React.CSSProperties => ({
  height: 53 * emptyRows,
});

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

// Header styles
export const headerContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  mb: { xs: 1, sm: 2 },
  px: { xs: 0, sm: 0 },
};

export const backButtonStyles: SxProps<Theme> = {
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: { xs: '13px', sm: '14px' },
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  p: { xs: '6px 8px', sm: '8px 12px' },
};
