import { styled } from '@mui/material/styles';
import {
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// Styled Components using Material-UI's styled API
export const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3, 0, 3),
  backgroundColor: '#f8f9fa',
  minHeight: '100vh',
  fontFamily: 'Gilroy, sans-serif',
}));
export const StyledContainer2 = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3, 0, 3),
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  fontFamily: 'Gilroy, sans-serif',
}));
export const StyledFormContainer = styled(Paper)(() => ({
  background: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  marginBottom: '20px',
}));

export const StyledAccordion = styled(Accordion)(() => ({
  border: 'none',
  boxShadow: 'none',
  marginBottom: 0,
  '&:before': {
    display: 'none',
  },
  backgroundColor: 'transparent',
}));

export const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: '#E6EBFF',
  borderBottom: '1px solid #e1e5e9',
  padding: theme.spacing(2, 3),
  minHeight: '60px',
  height: '60px',
  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
}));

export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#ffffff',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
}));

export const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginLeft: '-8px',
  marginRight: '-8px',
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    marginRight: 0,
  },
}));

export const FormFieldContainer = styled(Box)<{
  width?: 'full' | 'half' | 'third' | 'quarter';
}>(({ theme, width }) => ({
  paddingLeft: '8px',
  paddingRight: '8px',
  ...(width === 'full' && { flex: '0 0 100%', maxWidth: '100%' }),
  ...(width === 'half' && { flex: '1 1 calc(50% - 12px)' }),
  ...(width === 'third' && { flex: '1 1 calc(33.333% - 16px)' }),
  ...(width === 'quarter' && { flex: '1 1 calc(25% - 18px)' }),
  ...(!width && {
    flex: '0 0 33.333%',
    maxWidth: '33.333%',
  }),

  display: 'flex',
  flexDirection: 'column',

  [theme.breakpoints.down('md')]: {
    flex: '0 0 100%',
    maxWidth: '100%',
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export const FileUploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed #bdc3c7',
  borderRadius: '8px',
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#fafbfc',
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(2),
  '&:hover': {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
}));

export const UploadedFileItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#e8f4fd',
  border: '1px solid #3498db',
  borderRadius: '6px',
  padding: theme.spacing(1, 1.5),
  marginTop: theme.spacing(1),
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  borderTop: '1px solid #e1e5e9',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
}));

// Common styling objects
export const fieldSx = {
  '& .MuiInputLabel-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    color: '#000000',
  },
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy, sans-serif',
    borderRadius: '4px',
    height: '48px',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3498db',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2980b9',
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    color: '#000000',
    height: '45px',
    padding: '0 14px',
  },
  '& .MuiSelect-select': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    color: '#000000',
    height: '45px',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
  },
};

export const disabledFieldSx = {
  ...fieldSx,
  '& .MuiInputBase-input::placeholder': {
    color: '#000000',
    opacity: 1,
  },
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: '#f5f5f5',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E0E0E0',
    },
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: '#333333',
    WebkitTextFillColor: '#333333',
    opacity: 1,
  },
};

export const sectionTitleSx = {
  color: '#000000',
  fontWeight: 600,
  fontSize: '18px',
  fontFamily: 'Gilroy, sans-serif',
};

export const subsectionTitleSx = {
  color: '#000000',
  fontWeight: 600,
  fontSize: '16px',
  marginBottom: 2,
  fontFamily: 'Gilroy, sans-serif',
};

export const pageTitleSx = {
  color: '#1a1a1a',
  fontWeight: 600,
  fontSize: '20px',

  marginBottom: 3,
  fontFamily: 'Gilroy, sans-serif',
};

export const checkboxContainerSx = {
  margin: '24px 0',
  padding: 2,
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e1e5e9',
};

export const checkboxSx = {
  color: '#3498db',
  '&.Mui-checked': {
    color: '#2980b9',
  },
};

export const checkboxLabelSx = {
  '& .MuiFormControlLabel-label': {
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    color: '#2c3e50',
  },
};

export const uploadButtonSx = {
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
  borderColor: '#3498db',
  color: '#3498db',
  '&:hover': {
    backgroundColor: '#3498db',
    color: '#ffffff',
  },
};

export const uploadedFileTextSx = {
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '13px',
  color: '#2c3e50',
  flex: 1,
  textAlign: 'left',
};

export const deleteButtonSx = {
  color: '#e74c3c',
  padding: '4px',
  '&:hover': {
    backgroundColor: '#ffeaea',
  },
};

export const dividerSx = {
  margin: '24px 0',
  backgroundColor: '#e1e5e9',
};

export const uploadHelpTextSx = {
  marginTop: 1,
  color: '#7f8c8d',
};
