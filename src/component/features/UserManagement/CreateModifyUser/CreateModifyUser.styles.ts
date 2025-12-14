import { SxProps, Theme } from '@mui/material/styles';

export const containerStyles: SxProps<Theme> = {
  mt: 4,
  mb: 4,
  backgroundColor: '#F8F9FD',
  px: { xs: 1, sm: 2, md: 3 },
};

export const searchFilterContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 0 },
  width: '100%',
};

export const searchBoxStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  flex: 1,
  flexDirection: { xs: 'column', sm: 'row' },
  width: { xs: '100%', md: 'auto' },
};

export const searchFieldStyles: SxProps<Theme> = {
  width: { xs: '100%', sm: '300px', md: '400px' },
};

export const searchLabelStyles: SxProps<Theme> = {
  mb: 0.5,
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const searchInputContainerStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
};

export const textFieldStyles = (hasError = false): SxProps<Theme> => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    '& input': {
      fontFamily: 'Gilroy, sans-serif',
      fontSize: '14px',
      fontWeight: 400,
    },
  },
  ...(hasError && {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#FF3B30',
      },
    },
  }),
});

export const searchButtonStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': {
    backgroundColor: '#001f8e',
  },
  textTransform: 'none',
  px: 3,
  height: '40px',
};

export const statusFilterStyles: SxProps<Theme> = {
  minWidth: { xs: '100%', sm: 150 },
  width: { xs: '100%', sm: 'auto' },
};

export const selectStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 400,
};

export const menuItemStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 400,
};

export const createButtonStyles: SxProps<Theme> = {
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': {
    backgroundColor: '#001f8e',
  },
  textTransform: 'none',
  px: 3,
  height: '40px',
  alignSelf: { xs: 'stretch', md: 'flex-end' },
  mb: 0.1,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  width: { xs: '100%', md: 'auto' },
};

export const clearButtonStyles: SxProps<Theme> = {
  background: '#fff',
  color: '#002CBA',
  border: '1px solid #002CBA',
  textTransform: 'none',
  px: 3,
  height: '40px',
  alignSelf: { xs: 'stretch', md: 'flex-end' },
  mb: 0.1,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  width: { xs: '100%', md: 'auto' },
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
};

export const tableContainerStyles: SxProps<Theme> = {
  mb: 4,
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  overflowX: { xs: 'auto', md: 'hidden' },
  mx: 0, // Remove any margin that might cause misalignment
};

export const tableHeadRowStyles: SxProps<Theme> = {
  backgroundColor: '#E6EBFF',
  '& .MuiTableCell-head': {
    backgroundColor: '#E6EBFF',
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#E6EBFF',
  },
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const tableCellStyles: SxProps<Theme> = {
  padding: { xs: '8px', sm: '12px', md: '16px' },
  color: '#333',
  lineHeight: '1.2',
  textAlign: 'center',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 700,
  fontSize: { xs: '12px', sm: '13px', md: '14px' },
  whiteSpace: 'nowrap',
};

export const tableBodyStyles: SxProps<Theme> = {
  '& .MuiTableCell-root': {
    textAlign: 'center',
    '&:not(:last-child)': {
      borderRight: '8px solid transparent',
      backgroundClip: 'padding-box',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        right: '-4px',
        top: '8px',
        bottom: '8px',
        width: '1px',
        backgroundColor: 'rgba(224, 224, 224, 0.5)',
      },
    },
  },
};

export const tableRowStyles: SxProps<Theme> = {
  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
};

export const bodyCellStyles: SxProps<Theme> = {
  padding: { xs: '8px', sm: '12px', md: '16px' },
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 400,
  fontSize: { xs: '12px', sm: '13px', md: '14px' },
  whiteSpace: 'nowrap',
};

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
  marginRight: 1,
};

export const statusTextStyles = (status: string): SxProps<Theme> => ({
  color:
    status === 'Approved'
      ? '#52AE32' // Green
      : status === 'Approval Pending'
        ? '#FF9800' // Orange
        : status === 'Rejected'
          ? '#F44336' // Red
          : 'rgba(0, 0, 0, 0.6)', // Default gray
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
});

export const actionButtonStyles: SxProps<Theme> = {
  color: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

export const paginationContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mt: 2,
  p: 2,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 400,
  fontSize: '14px',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 2, sm: 0 },
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
  gap: 1,
};

export const paginationButtonStyles = (disabled = false): SxProps<Theme> => ({
  minWidth: 'auto',
  p: '4px 8px',
  color: disabled ? '#ccc' : '#1A1A1A',
  borderColor: '#E0E0E0',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#1A1A1A',
    backgroundColor: 'transparent',
  },
});

export const pageButtonStyles = (isActive: boolean): SxProps<Theme> => ({
  minWidth: '32px',
  minHeight: '32px',
  p: 0,
  color: isActive ? '#fff' : '#1A1A1A',
  backgroundColor: isActive ? '#002CBA' : 'transparent',
  borderColor: '#E0E0E0',
  '&:hover': {
    backgroundColor: isActive ? '#1A1A1A' : '#f5f5f5',
    borderColor: isActive ? '#1A1A1A' : '#E0E0E0',
  },
});

export const menuItemTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const backButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  mb: 3,
};

export const backButtonStyles: SxProps<Theme> = {
  mr: 1,
  p: 0,
  fontSize: '14px',
  color: '#1A1A1A',
};

export const backTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
};

export const paperStyles: SxProps<Theme> = {
  p: 0,
  mb: { xs: 1, sm: 2, md: 3 },
  backgroundColor: 'transparent',
  mx: 0,
};

export const tableHeaderActionCellStyles: SxProps<Theme> = {
  ...tableCellStyles,
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
};

export const actionTableCellStyles: SxProps<Theme> = {
  padding: '8px',
};

export const sortableHeaderStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
};

export const sortIconStyles: SxProps<Theme> = {
  fontSize: { xs: '14px', md: '16px' },
  color: '#666',
};

export const mobileTableWrapperStyles: SxProps<Theme> = {
  minWidth: '600px', // Ensures table doesn't get too cramped on mobile
};
