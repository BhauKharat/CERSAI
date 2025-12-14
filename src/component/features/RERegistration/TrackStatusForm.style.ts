import { styled } from '@mui/material/styles';
import { Paper, Container } from '@mui/material';

// Main container
export const MainContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: `${theme.spacing(4)} ${theme.spacing(10)}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    padding: `${theme.spacing(3)} ${theme.spacing(6)}`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  },
}));

// Form container
export const FormContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1300px',
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));
