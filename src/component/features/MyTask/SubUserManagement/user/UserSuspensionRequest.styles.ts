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

export const formRowStyles: SxProps<Theme> = (theme) => ({
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  ml: '15px',
  mr: '15px',
  flexWrap: 'wrap',
  '&:last-child': {
    marginBottom: 0,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
    ml: 0,
    mr: 0,
  },
});

export const formFieldStyles =
  (columns: number): SxProps<Theme> =>
  (theme) => ({
    flex: `1 1 calc(${100 / columns}% - 16px)`,
    minWidth: '250px',
    [theme.breakpoints.down('md')]: {
      flex: `1 1 calc(50% - 12px)`,
    },
    [theme.breakpoints.down('sm')]: {
      flex: '1 1 100%',
      minWidth: 'auto',
    },
  });

export const remarkTextFieldStyles: SxProps<Theme> = {
  ...textFieldStyles,
  mb: '20px',
  '& .MuiInputBase-root': {
    height: 'auto',
  },
};

export const remarkContainerStyles: SxProps<Theme> = {
  width: '100%',
  position: 'relative',
};

export const characterCountStyles: SxProps<Theme> = {
  position: 'absolute',
  bottom: '-5px',
  right: '10px',
  color: 'text.secondary',
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
