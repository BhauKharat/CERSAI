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
      xs: 'center', // center on mobile
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
    gap: 2,
    flexWrap: 'wrap',
    width: '100%',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },

  inputBox: {
    minWidth: 150,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    '@media (max-width: 900px)': {
      flex: '1 1 100%',
    },
  },

  statusLabel: {
    color: '#1A1A1A',
    fontSize: 14,
    mb: 0.5,
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: 600,
    lineHeight: '100%',
  },

  datePickerInput: {
    width: '100%',
    '& .MuiInputBase-root': { height: 48 },
    '& .MuiInputBase-input': { height: '100%', boxSizing: 'border-box' },
  },

  searchButton: {
    backgroundColor: 'rgba(0, 44, 186, 1)',
    height: 48,
    textTransform: 'none',
    fontSize: 18,
    color: '#fff',
    '&:hover': { backgroundColor: 'rgba(0, 44, 186, 0.9)' },
    '@media (max-width: 600px)': { width: '100%' },
  },

  clearButton: {
    backgroundColor: '#fff',
    border: '1px solid rgba(0, 44, 186, 1)',
    height: 48,
    textTransform: 'none',
    fontSize: 18,
    color: 'rgba(0, 44, 186, 1)',
    '&:hover': { backgroundColor: '#f5f5f5' },
    '@media (max-width: 600px)': { width: '100%' },
  },

  reportingEntityRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    mt: 1,
    mr: -1,
    '@media (max-width: 600px)': {
      justifyContent: 'stretch',
      flexDirection: 'column',
      alignItems: 'stretch',
      mr: -1,
    },
  },

  reportingEntityTextField: {
    width: 250,
    '& .MuiOutlinedInput-root': { height: 48 },
    '& .MuiInputBase-input': { height: '100%', boxSizing: 'border-box' },
    '@media (max-width: 600px)': { width: '100%' },
  },

  tableHeadRow: {
    backgroundColor: 'rgb(230, 235, 255)',
    margin: 0,
    padding: 0,
  },

  tableCell: {
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: 600,
    fontSize: '16px',
    whiteSpace: 'nowrap',
    padding: '12px 16px',
    '@media (max-width: 900px)': {
      fontSize: '14px',
      padding: '10px 12px',
    },
    '@media (max-width: 600px)': {
      fontSize: '12px',
      padding: '8px 10px',
    },
  },

  tableCellBlue: {
    color: '#002CBA',
    fontFamily: 'Gilroy-SemiBold, sans-serif',
    fontWeight: 400,
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
    height: '32px',
    width: '116px',
    px: '12px',
    mx: 1,
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
    '@media (max-width: 900px)': {
      width: '90px',
      fontSize: '13px',
      px: '8px',
    },
    '@media (max-width: 600px)': {
      width: '100%',
      mx: 0,
      mt: 1,
      fontSize: '13px',
      justifyContent: 'center',
    },
  },

  responsiveTableContainer: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    borderRadius: 2,
    boxShadow: 'none',
    '@media (max-width: 900px)': {
      '& table': {
        minWidth: '700px', // ensure columns don’t squeeze too much
      },
    },
    '@media (max-width: 600px)': {
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
    display: 'flex',
    alignItems: 'flex-end',
    minWidth: 'auto',
    mb: 0.5,
    '& .MuiFormControlLabel-root': {
      margin: 0,
    },
  },
};
