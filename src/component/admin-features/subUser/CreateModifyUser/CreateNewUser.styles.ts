import { styled } from '@mui/material/styles';
import {
  FormControl,
  Paper,
  Box,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  Container,
  Button,
  Alert,
} from '@mui/material';

// Custom FormRow component to replace Grid
// export const FormRow = styled('div')(({ theme }) => ({
//   display: 'flex',
//   flexWrap: 'wrap',
//   gap: theme.spacing(3),
//   marginBottom: theme.spacing(3),
//   '& > div': {
//     flex: '1 1 300px',
//     minWidth: '250px',
//   },
//   [theme.breakpoints.down('sm')]: {
//     '& > div': {
//       flex: '1 1 100%',
//     },
//   },
// }));
export const FormRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),

  // xs: <600px → 1 column
  gridTemplateColumns: '1fr',

  // sm & md: 600–1199px → 2 columns (covers 768 and 1024)
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  // lg & xl: ≥1200px → 3 columns (covers 1440, 2560)
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

// Styled FormControl
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 250,
  marginRight: theme.spacing(2),
  '& .MuiInputLabel-asterisk': {
    color: 'red',
  },
  '& .MuiFormLabel-asterisk': {
    color: 'red',
  },
}));

// Main container styles
export const MainContainer = styled(Container)({
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  padding: '16px',
});

// Back button styles
export const BackButton = styled(Button)({
  marginBottom: '16px',
  textTransform: 'none',
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(26, 26, 26, 0.04)',
  },
});

// Page title styles
export const PageTitle = styled(Typography)({
  marginBottom: '16px',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
});

// Content wrapper
export const ContentWrapper = styled(Box)({
  marginLeft: '8px',
  marginRight: '16px',
});

// Collapsible section styles
export const CollapsiblePaper = styled(Paper)({
  marginBottom: '24px',
  borderRadius: '4px',
  overflow: 'hidden',
  border: '1px solid #E0E0E0',
});

export const CollapsibleHeader = styled(Box)({
  height: '55px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  backgroundColor: '#FAFAFA',
  cursor: 'pointer',
  borderBottom: '1px solid #E0E0E0',
  '&:hover': {
    backgroundColor: '#F5F5F5',
  },
});

export const CollapsibleTitle = styled(Typography)({
  fontWeight: 600,
  color: '#24222B',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
});

export const ExpandIcon = styled(IconButton)({
  transition: 'transform 0.2s',
  '&.expanded': {
    transform: 'rotate(0deg)',
  },
  '&.collapsed': {
    transform: 'rotate(-90deg)',
  },
});

export const CollapsibleContent = styled(Box)({
  padding: '24px',
});

// Form field labels
export const FieldLabel = styled(Typography)({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  color: '#24222B',
  marginBottom: '8px',
  display: 'block',
});

// Select field styles
export const StyledSelect = styled(Select)({
  '& .MuiSelect-select': {
    paddingTop: '8px',
    paddingBottom: '8px',
    minHeight: 'auto',
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E0E0E0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#BDBDBD',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
  },
});

// MenuItem styles
export const StyledMenuItem = styled(MenuItem)({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  color: '#000',
});

// Text field styles
export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '45px',
    '& input': {
      fontFamily: 'Gilroy, sans-serif',
      fontSize: '14px',
      padding: '12px 14px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E0E0E0',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
    },
  },
});

// File upload styles
export const FileUploadBox = styled(Box)({
  border: '2px dashed #E0E0E0',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: '#BDBDBD',
  },
  '&.dragover': {
    borderColor: '#1976d2',
    backgroundColor: '#f3f8ff',
  },
});

export const FileUploadText = styled(Typography)({
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  color: '#666',
  marginTop: '8px',
});

export const UploadedFileChip = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#E3F2FD',
  borderRadius: '16px',
  padding: '4px 12px',
  marginTop: '8px',
  fontSize: '12px',
  fontFamily: 'Gilroy, sans-serif',
});

// Submit button styles
export const SubmitButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: 'white',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  textTransform: 'none',
  padding: '12px 32px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
  '&:disabled': {
    backgroundColor: '#E0E0E0',
    color: '#9E9E9E',
  },
});

// Error alert styles
export const ErrorAlert = styled(Alert)({
  marginBottom: '16px',
  marginTop: '16px',
});

// Loading indicator styles
export const LoadingMenuItem = styled(MenuItem)({
  '&.Mui-disabled': {
    opacity: 1,
  },
});

// Custom arrow icon styles
export const customArrowIconStyles = {
  color: '#000',
  fontSize: '20px',
  marginRight: '8px',
};

// Empty state typography
export const emptyStateStyles = {
  color: 'rgba(0, 0, 0, 0.6)',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Gender select placeholder styles
export const genderPlaceholderStyles = {
  color: 'rgba(0, 0, 0, 0.6)',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
};

// Proof of identity placeholder styles
export const proofPlaceholderStyles = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  color: 'rgba(0, 0, 0, 0.6)',
};
