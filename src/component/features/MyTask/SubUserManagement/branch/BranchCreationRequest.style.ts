export const backButtonStyles = {
  fontFamily: 'Gilroy, sans-serif',
  color: '#000',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  mb: 2,
  ml: -1.5,
};

export const backButtonIconStyles = {
  mr: 1,
};

export const pageHeaderStyles = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '18px',
  fontWeight: 600,
  ml: 0,
};

export const formContainerStyles = {
  borderRadius: '8px',
  mt: 2,
  mr: 2,
};

export const sectionTitleStyles = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '18px',
  fontWeight: 600,
  mb: 2,
};

export const formRowStyles = {
  mt: 1,
};

export const formDividerStyles = {
  my: 3,
};

export const flexContainerStyles = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
  mb: 2,
};

export const flexItemStyles = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  flex: 1,
  minWidth: { md: 'calc(33.33% - 16px)' },
};

export const regionBoxStyles = {
  ...flexItemStyles,
  width: '350px',
  flex: 'none',
};

export const actionButtonsContainerStyles = {
  display: 'flex',
  justifyContent: 'flex-end',
  mt: 4,
};

export const labelStyles = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  mb: 1,
};

export const inputStyles = {
  '& .MuiInputBase-root': {
    height: '45px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
    },
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
  '&.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 14px',
  },
  '& .MuiSelect-select': {
    padding: '12px 14px',
  },
};
