import { SxProps, Theme } from '@mui/material';

export const styles = {
  container: { px: 3 },

  searchContainer: {
    display: 'block',
    alignItems: 'center',
    gap: 2,
    mt: 2,
  },
  searchLabel: {
    fontWeight: 'bold',
    fontFamily: 'Gilroy',
    color: '#333',
    mb: 1,
  },
  searchField: {
    flex: 1,
    minWidth: 330,
    width: 330,
    height: 48,
    marginRight: 3,
    gap: '16px',
    opacity: 1,
    '& .MuiOutlinedInput-root': {
      height: 48,
    },
  } as SxProps<Theme>,
  searchButton: {
    width: 148,
    height: 48,
    borderRadius: '4px',
    gap: '8px',
    opacity: 1,
    padding: '4px 32px',
    backgroundColor: '#002CBA',
    '&:hover': {
      backgroundColor: '#0020A8',
    },
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: 'Gilroy',
  } as SxProps<Theme>,
  tableContainer: {
    my: 3,
  },

  table: {
    fontFamily: 'Gilroy',
  },
  tableHead: {
    backgroundColor: '#e6ebff',
  },
  tableHeadCell: {
    fontFamily: 'Gilroy-SemiBold,sans-serif',
    fontSize: '16px',
    fontWeight: '600',
    position: 'relative',
    textAlign: 'center',
  },
  tableHeadCellLast: {
    fontWeight: 'bold',
  },
  tableRow: {
    '&:last-child td': { borderBottom: 0 },
    position: 'relative',
  },
  tableCell: {
    fontFamily: 'Gilroy-Medium,sans-serif',
    fontSize: '16px',
    fontWeight: '500',
    position: 'relative',
    marginLeft: '12px',
  },

  verticalSeparator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '60%',
    width: '1px',
    backgroundColor: '#e0e0e0',
  } as SxProps<Theme>,

  backButtonContainer: {
    display: 'flex',
    justifyContent: {
      xs: 'flex-start',
      sm: 'flex-start',
    },
    width: '100%',
    mt: { xs: 2, sm: 0 },
  },
  backButton: {
    color: 'black',
    fontSize: { xs: '14px', sm: '16px' },
    my: 2,
    marginLeft: { md: '-8px' },
  },
  dialogBox: {
    width: 600,
    // height: auto,
    borderRadius: '4px',
    background: '#F8F9FD',
    padding: '8px',
    gap: '12px',
    opacity: 1,
    boxShadow: `
      0px 11px 23px 0px #0000000F,
      0px 42px 42px 0px #0000000D,
      0px 95px 57px 0px #00000008,
      0px 169px 67px 0px #00000003,
      0px 263px 74px 0px #00000000
    `,
  },
  dialogTitle: {
    width: 369,
    height: 62,
    color: '#000000',
    display: 'flex',

    marginLeft: 14,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'Gilroy-SemiBold, sans-serif',
    fontWeight: 600,
    fontSize: '18px',
    lineHeight: '26px',
    letterSpacing: '0%',

    opacity: 1,
  },

  btnsbmt: {
    width: '219.5px',
    height: '48px',
    opacity: 1,

    borderRadius: '4px',
    borderWidth: '1px',
    padding: '8px 47px',
    backgroundColor: '#002CBA',
  },
  btncnl: {
    width: '219.5px',
    height: '48px',
    opacity: 1,

    borderRadius: '4px',
    borderWidth: '1px',
    borderColor: '#002CBA',
    padding: '8px 47px',
    color: '#002CBA',
  },

  dialogueTitleFee: {
    fontFamily: 'Gilroy-SemiBold,sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    marginTop: '8px',
  },

  inputStyles: {
    fontFamily: 'Gilroy-Medium,sans-serif',
    fontSize: '15px',
    height: '48px',
    fontWeight: 500,
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white',
      '& fieldset': {
        borderColor: '#D9D9D9',
        fontSize: '15px',
        fontFamily: 'Gilroy-Medium,sans-serif',
      },
      '&:hover fieldset': {
        borderColor: '#B3B3B3',
        fontSize: '15px',
        fontFamily: 'Gilroy-Medium,sans-serif',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#002CBA',
        fontSize: '15px',
        fontFamily: 'Gilroy-Medium,sans-serif',
      },
      '& .MuiInputBase-input': {
        height: '48px !important',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
        fontFamily: 'Gilroy-Medium,sans-serif',
      },
      // Add disabled state
      '&.Mui-disabled': {
        backgroundColor: '#f5f5f5',
        '& fieldset': {
          borderColor: '#D9D9D9',
        },
      },
    },
  } as SxProps<Theme>,

  selectStyles: {
    fontFamily: 'Gilroy-Medium,sans-serif',
    fontSize: '15px',
    fontWeight: 400,
    backgroundColor: 'white',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#B3B3B3',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#002CBA',
    },
    '& .MuiSelect-select': {
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
    },
    '&.Mui-disabled': {
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        borderColor: '#D9D9D9',
      },
    },
    height: '48px',
  } as SxProps<Theme>,
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
};
