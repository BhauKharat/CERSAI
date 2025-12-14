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
export const FormRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  marginBottom: '24px',
  width: '100%',
  '& > div': {
    width: '100%',
    minWidth: 0, // Prevent overflow
    display: 'flex',
    flexDirection: 'column',
  },
  // Remove margins from FormControl components when inside FormRow
  '& > div .MuiFormControl-root': {
    marginRight: '0 !important',
    marginBottom: 0,
    width: '100%',
  },
  // Ensure Box components don't interfere
  '& > div > div[class*="MuiBox"]': {
    width: '100%',
  },
  // Ensure consistent field heights and disabled styling
  '& > div .MuiOutlinedInput-root': {
    height: '45px',
    backgroundColor: 'white',
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
      '& input, & .MuiSelect-select': {
        color: '#1A1A1A',
        WebkitTextFillColor: '#1A1A1A',
      },
    },
  },
  // Disabled styling for Select components
  '& > div .MuiSelect-root.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
    '& .MuiSelect-select': {
      color: '#1A1A1A',
      WebkitTextFillColor: '#1A1A1A',
    },
  },
  // Ensure labels have consistent spacing
  '& > div label, & > div .MuiTypography-root[component="label"]': {
    marginBottom: '8px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
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
  marginTop: '10px',
  // Global styling for all TextField and Select components to match create-new-region
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '& fieldset, & .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
    '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#B3B3B3',
    },
    '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#002CBA',
    },
    // Disabled styling - higher specificity
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6 !important',
      '& fieldset, & .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D1D1D1 !important',
      },
      '& input, & .MuiSelect-select': {
        color: '#1A1A1A !important',
        WebkitTextFillColor: '#1A1A1A !important',
      },
    },
  },
  '& .MuiSelect-root': {
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
    // Disabled styling - higher specificity
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6 !important',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D1D1D1 !important',
      },
      '& .MuiSelect-select': {
        color: '#1A1A1A !important',
        WebkitTextFillColor: '#1A1A1A !important',
        backgroundColor: '#F6F6F6 !important',
      },
    },
  },
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
  backgroundColor: 'white',
  borderRadius: '4px',
  height: '45px',
  '& .MuiSelect-select': {
    paddingTop: '8px',
    paddingBottom: '8px',
    minHeight: 'auto',
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    color: '#1A1A1A',
    fontWeight: 500,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D9D9D9',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#B3B3B3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#002CBA',
  },
  '&.Mui-disabled': {
    backgroundColor: '#F6F6F6',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D1D1D1',
    },
    '& .MuiSelect-select': {
      color: '#1A1A1A',
      WebkitTextFillColor: '#1A1A1A',
    },
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
    backgroundColor: 'white',
    '& input': {
      fontFamily: 'Gilroy, sans-serif',
      fontSize: '14px',
      padding: '12px 14px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D9D9D9',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#B3B3B3',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#002CBA',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F6F6F6',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D1D1D1',
      },
      '& input': {
        color: '#1A1A1A',
        WebkitTextFillColor: '#1A1A1A',
      },
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

export const VerifiedTypo = styled(Typography)({
  color: 'rgba(82, 174, 50, 1)',
  fontSize: '12px',
  fontWeight: 600,
  marginRight: '10px',
});
