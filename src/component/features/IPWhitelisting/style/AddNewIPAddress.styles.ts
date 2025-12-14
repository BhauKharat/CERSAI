import { styled } from '@mui/material/styles';
import { Box, Paper, Button, FormControl } from '@mui/material';
import { CheckCircleOutline as CheckCircleIcon } from '@mui/icons-material';

// Styled Components for Layout
export const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#FFFFFF',
  fontFamily: 'Gilroy, sans-serif',
}));

export const FormWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  // borderRadius: '8px',
}));

export const FormGrid = styled(Box)({
  display: 'flex',
  gap: '20px',
});

// Styled Components for Form Elements
export const ActionButton = styled(Button)({
  backgroundColor: '#002CBA',
  width: '238px',
  height: '48px',
  color: 'white',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 28px',
  fontFamily: 'Gilroy, sans-serif',
  '&:hover': {
    backgroundColor: '#001a8c',
  },
});

export const FieldWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledFormControl = styled(FormControl)({
  width: '100%',
});

// Styled Components for Success Modal
export const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
  padding: theme.spacing(3, 3, 4),
  textAlign: 'center',
  outline: 'none',
}));

export const SuccessIcon = styled(CheckCircleIcon)({
  color: '#4CAF50', // A standard green color for success
  fontSize: '48px',
  marginBottom: '16px',
});
