import { styled, Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export const FormContainer = styled(Box)`
  border-radius: 8px;
`;

export const backButtonStyles: SxProps<Theme> = {
  color: '#000000',
  textTransform: 'none',
  marginBottom: '24px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '16px',
  ml: '10px',
};

export const headerStyles: SxProps<Theme> = {
  marginBottom: '24px',
  fontWeight: 'bold',
  ml: '15px',
};

export const labelStyles: SxProps<Theme> = {
  marginBottom: '8px',
  color: '#5A5A5A',
  fontSize: '14px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
};

export const textFieldStyles: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    backgroundColor: '#F5F5F5',
    color: '#5A5A5A',
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
  flexWrap: 'wrap',
  ml: '15px',
  mr: '15px',
  '&:last-child': {
    marginBottom: 0,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
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
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
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
