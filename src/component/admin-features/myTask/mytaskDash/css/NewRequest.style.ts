import { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  filtersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  backButtonContainer: {
    display: 'flex',
    justifyContent: {
      xs: 'flex-end', // right on mobile
      sm: 'flex-end', // align right from tablet upwards
    },
    width: '100%', // Add this
    mt: { xs: 2, sm: 0 },
  },

  backButton: {
    color: 'black',
    fontSize: { xs: '14px', sm: '16px' },
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
  },

  firstRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 2,
    flexWrap: 'wrap',
    minHeight: '100px',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      minHeight: 'auto',
    },
  },
  inputBox: {
    width: 180,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    height: 'auto',
    '@media (max-width: 1200px)': {
      width: 160,
    },
    '@media (max-width: 900px)': {
      width: '100%',
    },
  },

  statusLabel: {
    color: '#1A1A1A',
    fontSize: '14px',
    mb: 0.5,
    fontFamily: 'Gilroy-SemiBold, sans-serif',
    fontWeight: 400,
    letterSpacing: 0.5,
    lineHeight: '100%',
    height: 'auto',
  },

  datePickerInput: {
    width: '100%',
    '& .MuiInputBase-root': {
      height: 40,
      padding: '8px 12px',
    },
    '& .MuiInputBase-input': {
      height: '100%',
      boxSizing: 'border-box',
      padding: '0 !important',
    },
  },

  searchButton: {
    backgroundColor: 'rgba(0, 44, 186, 1)',
    height: 48,
    width: 148,
    textTransform: 'none',
    fontSize: 16,
    color: '#fff',
    '&:hover': { backgroundColor: 'rgba(0, 44, 186, 0.9)' },
    '@media (max-width: 600px)': { width: '100%' },
  },

  clearButton: {
    backgroundColor: '#fff',
    border: '1px solid rgba(0, 44, 186, 1)',
    height: 48,
    width: 148,
    textTransform: 'none',
    fontSize: 16,
    color: 'rgba(0, 44, 186, 1)',
    '&:hover': { backgroundColor: '#f5f5f5' },
    '@media (max-width: 600px)': { width: '100%' },
  },

  reportingEntityRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    '@media (max-width: 600px)': {
      justifyContent: 'stretch',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },

  reportingEntityTextField: {
    width: 220,
    height: 48,
    '& .MuiOutlinedInput-root': { height: 48 },
    '& .MuiInputBase-input': { height: '100%', boxSizing: 'border-box' },
    '@media (max-width: 1200px)': { width: 200 },
    '@media (max-width: 600px)': { width: '100%' },
  },

  tableHeadRow: {
    backgroundColor: 'rgb(230, 235, 255)',
    margin: 0,
    padding: 0,
  },

  tableCell: {
    fontFamily: 'Gilroy-SemiBold, sans-serif',
    fontWeight: 600,
    textAlign: 'center',
    fontStyle: 'normal',
    fontSize: '16px',
    lineHeight: '100%',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
    color: '#1A1A1A',
    '@media (max-width: 900px)': {
      fontSize: '14px',
    },
    '@media (max-width: 600px)': {
      fontSize: '12px',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
    },
  },

  tableCellBlue: {
    color: '#002CBA',
    fontFamily: 'Gilroy-SemiBold, sans-serif',
    fontWeight: 400,
    textAlign: 'center',
    fontSize: '15px',
    '@media (max-width: 900px)': {
      fontSize: '13px',
    },
    '@media (max-width: 600px)': {
      fontSize: '12px',
    },
  },

  statusBox: {
    display: 'flex',
    flexDirection: 'row',
    gap: '5px',
    justifyContent: 'center',
    alignItems: 'center',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      gap: '2px',
      alignItems: 'flex-start',
    },
  },

  tableFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 2,
    gap: 2,
    flexWrap: 'wrap',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      textAlign: 'center',
      gap: 1.5,
    },
  },

  paginationItem: {
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 1,
    p: 0,
    mx: 3,
    '&.Mui-selected.Mui-disabled': {
      backgroundColor: 'rgba(0, 44, 186, 1)',
      color: 'white',
    },
    '@media (max-width: 600px)': {
      mx: 1,
      fontSize: '12px',
    },
  },

  paginationNextPrevButton: {
    color: '#000000',
    borderColor: 'gray',
    height: '38px',
    width: '116px',
    px: '12px',
    mx: 0.5,
    textTransform: 'none',
    gap: '8px',
    borderRadius: '4px',
    borderWidth: '1px',
    opacity: 1,
    fontFamily: 'Gilroy-Medium',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '@media (max-width: 900px)': {
      width: '100px',
      fontSize: '13px',
      px: '8px',
    },
    '@media (max-width: 600px)': {
      width: '100px',
      height: '38px',
      mx: 0.5,
      mt: 1,
      fontSize: '13px',
    },
  },

  responsiveTableContainer: {
    width: '100%',
    overflowX: 'auto',
    '@media (max-width: 600px)': {
      maxWidth: '100%',
      '& table': {
        minWidth: '650px',
      },
    },
  },

  rreportingEntityRowTrackstatus: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    flexWrap: 'wrap', // allows wrapping naturally
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8,
    },
  },

  radioBtn: {
    position: 'relative',
    left: 20,
  },
};
