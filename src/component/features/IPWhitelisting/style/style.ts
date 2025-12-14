/* eslint-disable prettier/prettier */
import { SxProps, Theme } from '@mui/material';
 
export const styles: Record<string, SxProps<Theme>> = {
  flex: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  flexRight: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
  flexLeft: {
    display: 'flex',
    justifyContent: 'start',
    width: '100%',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  Typography: {
    color: 'black',
    fontWeight: '500',
    fontSize: '16px',
    textTransform: 'none',
  },
  note: {
    color: 'black',
    fontWeight: '500',
    fontSize: '14px',
    textTransform: 'none',
  },
  pageTitle: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '20px',
    fontWeight: 600,
  },
  pageSubTitle: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
  },
 
  // Table Styles
  tableContainer: {
    boxShadow: 'none',
    marginTop: '20px',
  },
  table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },
  tableHeadRow: {
    height: '50px',
    backgroundColor: '#E6EBFF !important',
  },
  tableHeadCell: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
    color: '#000000',
    backgroundColor: '#E6EBFF',
    padding: '10px ',
    textAlign: 'center !important',
  },
  tableCell: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
    color: '#000000',
    textAlign: 'center !important',
  },
  tableCellBlue: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
  },
  tableRow: {},
 
  // Pagination Styles
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '50px',
    padding: '0 16px',
  },
  paginationText: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    color: '#666666',
  },
  pagination: {
    '& .MuiPaginationItem-root': {
      fontFamily: 'Gilroy, sans-serif',
      fontSize: '14px',
      margin: '0 4px',
    },
    '& .MuiPaginationItem-page': {
      color: '#333333',
      '&.Mui-selected': {
        backgroundColor: '#002CBA',
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#0020A3',
        },
      },
    },
  },
  paginationNextPrevButton: {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px !important',
    fontWeight: 500,
    color: '#000000',
    border: '1px solid #D1D1D1',
    borderRadius: '4px',
    height: '38px',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#002CBA',
      color: '#FFFFFF',
      border: 'none',
    },
  },
 
  // Search Input Styles
  searchInput: {
    width: '300px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontFamily: 'Gilroy, sans-serif',
      '& fieldset': {
        borderColor: '#E0E0E0',
      },
      '&:hover fieldset': {
        borderColor: '#002CBA',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#002CBA',
        borderWidth: '1px',
      },
    },
  },
};
 
 