import styled from '@emotion/styled';
import { Box, SxProps, Theme } from '@mui/material';

export const FormContainer = styled(Box)`
  background-color: #f9f9f9;
`;

export const backButtonStyles: SxProps<Theme> = {
  color: '#000',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '16px',
  fontFamily: 'Gilroy, sans-serif',
  marginBottom: '15px',
  ml: '10px',
};

export const headerStyles: SxProps<Theme> = {
  marginBottom: '24px',
  fontWeight: 600,
  fontSize: '18px',
  fontFamily: 'Gilroy, sans-serif',
  ml: '15px',
};

export const labelStyles: SxProps<Theme> = {
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
  fontFamily: 'Gilroy, sans-serif',
};

export const textFieldStyles: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    height: '48px',
  },
  '& .Mui-disabled': {
    backgroundColor: '#F0F0F0',
  },
};

export const formRowStyles: SxProps<Theme> = {
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  ml: '15px',
  mr: '15px',
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
  gap: 16px;
  margin-top: 24px;
`;

export const actionButtonStyles: SxProps<Theme> = {
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 24px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
};
