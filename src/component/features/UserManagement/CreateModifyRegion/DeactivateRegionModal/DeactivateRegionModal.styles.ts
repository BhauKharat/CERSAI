import { SxProps, Theme } from '@mui/material';

export const dialogPaperStyles: SxProps<Theme> = {
  borderRadius: '0px',
  maxWidth: '600px',
  width: '100%',
  position: 'relative',
  pt: 3,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
};

export const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 8,
  top: 8,
  color: 'text.secondary',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

export const noteTextStyles: SxProps<Theme> = {
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: 1.2,
  marginTop: '5px',
};

export const sectionTitleStyles: SxProps<Theme> = {
  mb: 2,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: 1.2,
};

export const tableContainerStyles: SxProps<Theme> = {
  boxShadow: 'none',
  background: 'transparent',
  '& .MuiTable-root': {
    minWidth: '100%',
  },
};

export const tableStyles: SxProps<Theme> = {
  '& .MuiTableRow-root:first-of-type th': {
    borderTop: 'none',
  },
  '& .MuiTableRow-root:last-child td': {
    borderBottom: 'none',
  },
  '& .MuiTableCell-root': {
    padding: '12px 16px',
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    color: '#1A1A1A',
    borderBottom: '1px solid #E0E0E0',
    position: 'relative',
    '&:not(:last-child)::after': {
      content: '""',
      position: 'absolute',
      top: '8px',
      right: 0,
      height: 'calc(100% - 16px)',
      width: '1px',
      backgroundColor: '#E0E0E0',
    },
    '&:last-child': {
      paddingRight: '16px',
    },
    '&:first-of-type': {
      paddingLeft: '16px',
    },
  },
  '& .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: '#F5F7FF',
      '&:last-child td': {
        borderBottom: '1px solid #E0E0E0',
      },
    },
    '&:last-child': {
      '& td': {
        borderBottom: 'none',
        '&:first-of-type': {
          borderBottomLeftRadius: '4px',
        },
        '&:last-child': {
          borderBottomRightRadius: '4px',
        },
      },
    },
  },
};

export const tableHeaderStyles: SxProps<Theme> = {
  backgroundColor: '#E8EBFB',
  '& th': {
    padding: '12px 16px',
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 600,
    fontSize: '14px',
    color: '#000000',
    border: 'none',
    height: '48px',
    '&:first-of-type': {
      borderTopLeftRadius: '4px',
      paddingLeft: '16px',
    },
    '&:last-child': {
      borderTopRightRadius: '4px',
      paddingRight: '16px',
    },
  },
};

export const warningIconContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

export const warningIconStyles: SxProps<Theme> = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '2px solid #FF0000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FF0000',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
  mb: 1,
};

export const warningTextStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1A1A1A',
  textAlign: 'center',
  maxWidth: '400px',
  mx: 'auto',
  marginTop: '20px',
};

export const remarkLabelStyles: SxProps<Theme> = {
  mb: 1,
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '16px',
};

export const dialogActionsStyles: SxProps<Theme> = {
  p: 2,
  gap: 2,
  '& > *': { flex: 1 },
};

export const cancelButtonStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  color: '#002CBA',
  borderColor: '#002CBA',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#002CBA',
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
};

export const submitButtonStyles: SxProps<Theme> = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  backgroundColor: '#002CBA',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#001F8C',
  },
  '&.Mui-disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
};

export const requiredFieldStyles = {
  color: '#F5222D',
} as const;

export const dialogContentStyles: SxProps<Theme> = {
  padding: '10 20px',
};

export const paddingBoxStyles: SxProps<Theme> = {
  p: 3,
  pb: 0,
};

export const sectionContentStyles: SxProps<Theme> = {
  p: 3,
};

export const tableRowStyles: SxProps<Theme> = {
  '&:last-child td': {
    borderBottom: 'none',
  },
};

export const captionTextStyles: SxProps<Theme> = {
  mt: 0.5,
};

export const warningSectionStyles: SxProps<Theme> = {
  p: 3,
};
