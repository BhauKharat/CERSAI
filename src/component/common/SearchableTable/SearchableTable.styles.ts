import { SxProps, Theme } from '@mui/material/styles';

export const paperStyles: SxProps<Theme> = {
  marginBottom: '10px',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: 'transparent',
};

export const searchContainerStyles: SxProps<Theme> = {
  display: 'flex',
  maxWidth: '700px',
  flexDirection: 'column',
  gap: '16px',
};

export const searchFilterRowStyles: SxProps<Theme> = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
};

export const searchInputContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

export const searchLabelStyles: SxProps<Theme> = {
  marginBottom: '8px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const searchInputWrapperStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const textFieldStyles: SxProps<Theme> = {
  flexGrow: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
    },
  },
};

export const buttonStyles = (
  variant: 'contained' | 'outlined'
): SxProps<Theme> => ({
  padding: '8px 16px',
  textTransform: 'none',
  borderRadius: '4px',
  height: '40px',
  width: '150px',
  fontSize: '14px',
  fontWeight: 500,
  fontFamily: 'Gilroy, sans-serif',
  ...(variant === 'contained' && {
    backgroundColor: '#002CBA',
    '&:hover': {
      backgroundColor: '#00239e',
    },
  }),
});

export const containerStyles: SxProps<Theme> = {
  borderRadius: '8px',
  backgroundColor: 'transparent',
};

export const tableContainerStyles: SxProps<Theme> = {
  borderRadius: '8px',
  backgroundColor: '#FFFFFF',
  borderBottom: 'none',
  border: '1px solid rgba(224, 224, 224, 1)',
};

export const tableColumnStyles = (): {
  [key: string]: React.CSSProperties;
} => ({
  srNo: { width: '5%' },
  regionName: { width: '25%' },
  regionCode: { width: '20%' },
  status: { width: '20%' },
  activity: { width: '20%' },
  action: { width: '10%' },
});

export const tableHeadRowStyles: SxProps<Theme> = {
  backgroundColor: '#E6EBFF',
  height: '56px',
  '&:hover': {
    backgroundColor: '#E6EBFF',
  },
};

export const tableCellStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 700,
  fontSize: '14px',
  color: '#000000',
  textAlign: 'center',
  borderBottom: 'none',
  padding: '14px 16px',
};

export const sortableHeaderCellStyles: SxProps<Theme> = {
  ...tableCellStyles,
  cursor: 'pointer',
  userSelect: 'none',
};

export const sortContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontWeight: 800,
};

export const sortIconContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    height: '16px',
    width: '16px',
    color: '#000000',
    marginLeft: '4px',
  },
};

export const tableBodyStyles: SxProps<Theme> = {
  '& .MuiTableRow-root:last-child .MuiTableCell-root': {
    borderBottom: 'none',
  },
  '& .MuiTableCell-root': {
    position: 'relative',
    '&:not(:last-child)::after': {
      content: '""',
      position: 'absolute',
      top: '8px',
      bottom: '8px',
      right: 0,
      width: '1px',
      backgroundColor: 'rgba(224, 224, 224, 1)',
    },
  },
};

export const tableRowStyles: SxProps<Theme> = {
  height: '56px',
  '&:hover': {
    backgroundColor: '#E4F6FF',
  },
};

export const cellStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  fontWeight: 600,
  color: 'rgba(0, 44, 186, 1)',
  textAlign: 'center',
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  padding: '16px',
};

export const statusIndicatorStyles: SxProps<Theme> = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 118, 0, 1)',
  marginRight: '8px',
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
  ...cellStyles,
  padding: '0',
};

export const emptyRowStyles = (emptyRows: number) => ({
  height: 52 * emptyRows,
});

export const paginationContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
};

export const paginationTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  ml: 2,
  color: '#666',
};

export const paginationButtonContainerStyles: SxProps<Theme> = {
  display: 'flex',
  gap: '8px',
};

export const paginationButtonStyles = (disabled: boolean): SxProps<Theme> => ({
  minWidth: 'auto',
  padding: '6px 12px',
  color: disabled ? '#ccc' : '#1A1A1A',
  borderColor: '#E0E0E0',
  textTransform: 'none',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 400,
  '&:hover': {
    borderColor: '#1A1A1A',
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
  borderRadius: '4px',
});

export const pageButtonStyles = (isActive: boolean): SxProps<Theme> => ({
  minWidth: '32px',
  minHeight: '32px',
  padding: '0',
  borderRadius: '4px',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 400,
  ...(isActive && {
    backgroundColor: '#002CBA',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#001f8e',
    },
  }),
  ...(!isActive && {
    borderColor: '#E0E0E0',
    color: '#1A1A1A',
    '&:hover': {
      borderColor: '#1A1A1A',
      backgroundColor: 'rgba(0, 44, 186, 0.04)',
    },
  }),
});
