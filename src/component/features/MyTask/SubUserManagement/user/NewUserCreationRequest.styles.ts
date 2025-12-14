import styled from '@emotion/styled';
import { Box, SxProps, Theme } from '@mui/material';

export const FormContainer = styled(Box)`
  background-color: #ffffff;
  min-height: 100vh;
`;

export const backButtonStyles: SxProps<Theme> = {
  color: '#000',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '16px',
  fontFamily: 'Gilroy, sans-serif',
  marginBottom: '15px',
  marginLeft: '8px',
};

export const headerStyles: SxProps<Theme> = {
  marginBottom: '24px',
  fontWeight: 600,
  fontSize: '18px',
  fontFamily: 'Gilroy, sans-serif',
  marginLeft: '16px',
};

export const accordionStyles: SxProps<Theme> = {
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  marginBottom: '16px',
  marginLeft: '10px',
  marginRight: '10px',
  '.MuiAccordionSummary-root': {
    backgroundColor: '#E6EBFF',
    borderRadius: '8px',
    color: '#24222B',
    fontWeight: 500,
    fontFamily: 'Gilroy, sans-serif',
  },
  '.MuiAccordionDetails-root': {
    padding: '24px',
    fontFamily: 'Gilroy, sans-serif',
  },
};

export const labelStyles: SxProps<Theme> = {
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  fontFamily: 'Gilroy, sans-serif',
};

export const highlightedLabelStyles: SxProps<Theme> = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  fontFamily: 'Gilroy, sans-serif',
  backgroundColor: '#FFD952',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'block',
  width: '100%',
};

export const textFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    height: '48px',
    '& fieldset': {
      borderColor: '#D9D9D9',
    },
    '&:hover fieldset': {
      borderColor: '#B3B3B3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#002CBA',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& fieldset': {
        borderColor: '#D1D1D1',
      },
    },
  },
};

export const formRowStyles: SxProps<Theme> = {
  display: 'flex',
  gap: '24px',
  ml: '10px',
  marginBottom: '24px',
  flexWrap: 'wrap',
  '&:last-child': {
    marginBottom: 0,
  },
};

export const formFieldStyles: SxProps<Theme> = {
  flex: '1 1 calc(33.333% - 16px)',
  minWidth: '250px',
};

export const ActionButtonsContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  margin-left: 10px;
  margin-right: 10px;
`;

export const actionButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 24px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
};
