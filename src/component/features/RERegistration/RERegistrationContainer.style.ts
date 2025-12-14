import { styled } from '@mui/material/styles';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  Button,
  Stepper,
  Container,
} from '@mui/material';

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

// Header section
export const HeaderSection = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  marginBottom: theme.spacing(2),
}));

export const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 2),
  minHeight: '60px',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
    minHeight: '50px',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    minHeight: '48px',
    flexWrap: 'nowrap', // Prevent wrapping
  },
}));

export const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const LogoIcon = styled(Box)(() => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: '#4caf50',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 'bold',
}));

export const LogoText = styled(Typography)(({ theme }) => ({
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'Gilroy',
  color: '#333',
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
  },
}));

export const HeaderButton = styled(Button)(() => ({
  color: '#666',
  fontFamily: 'Gilroy',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
}));

// Registration title section
export const RegistrationSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#F6F8FF',
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
  borderRadius: 0,
}));

// Full width registration section for header
export const FullWidthRegistrationSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#F6F8FF',
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(2),
  width: 'calc(100% + 62px)', // Extend beyond card padding
  marginLeft: '-40px', // Pull back to touch left edge
  marginRight: '-40px', // Pull back to touch right edge
  position: 'relative',
  borderRadius: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    width: 'calc(100% + 64px)',
  },
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100% + 48px)',
  },
}));

export const RegistrationTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
  fontFamily: 'Gilroy',
  color: '#002CBA',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '18px',
  },
}));

// Stepper styles
export const StepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const StepCounterRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 0,
  marginBottom: theme.spacing(2),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

export const StepCounter = styled(Typography)<{ isActive?: boolean }>(
  ({ theme, isActive }) => ({
    fontSize: '12px',
    fontFamily: 'Gilroy',
    color: isActive ? '#002CBA' : '#999',
    textAlign: 'center',
    flex: 1,
    fontWeight: isActive ? '600' : '400',
    [theme.breakpoints.down('sm')]: {
      fontSize: '10px',
    },
  })
);

export const CustomStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiStep-root': {
    padding: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  '& .MuiStepLabel-root': {
    padding: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  '& .MuiStepLabel-iconContainer': {
    paddingRight: 0,
    marginBottom: theme.spacing(1),
  },
  '& .MuiStepLabel-label': {
    fontSize: '12px',
    fontFamily: 'Gilroy',
    color: '#666',
    textAlign: 'center',
    '&.Mui-active': {
      color: '#000000',
      fontWeight: '600',
    },
    '&.Mui-completed': {
      color: '#666',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '10px',
    },
  },
  '& .MuiStepIcon-root': {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '3px solid #e0e0e0',
    backgroundColor: 'transparent',
    color: 'transparent',
    '&.Mui-active': {
      border: '3px solid #002CBA',
      backgroundColor: 'white',
    },
    '&.Mui-completed': {
      border: '3px solid #002CBA',
      backgroundColor: 'transparent',
    },
    '& .MuiStepIcon-text': {
      display: 'none',
    },
    '& svg': {
      display: 'none',
    },
  },
  '& .MuiStepConnector-root': {
    top: '10px',
    left: 'calc(-50% + 10px)',
    right: 'calc(50% + 10px)',
  },
  '& .MuiStepConnector-line': {
    borderTopWidth: '2px',
    borderColor: '#e0e0e0',
  },
}));

export const StepLabelText = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  fontFamily: 'Gilroy',
  textAlign: 'center',
  marginTop: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '10px',
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

export const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
  fontFamily: 'Gilroy',
  color: '#333',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '18px',
  },
}));

// Form grid
export const FormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

export const FormRow = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingLeft: 'calc(1/15 * 100%)',
  paddingRight: 'calc(1/15 * 100%)',
}));

// Form fields
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'white',
    fontFamily: 'Gilroy',
    border: '0px solid #E0E0E0',
    '&:hover': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      borderColor: '#1976d2',
    },
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#BDBDBD',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none',
  },
  '& .MuiOutlinedInput-input': {
    fontFamily: 'Gilroy',
    fontSize: '14px',
    color: '#666',
    '&::placeholder': {
      color: '#999',
      opacity: 1,
    },
  },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
  backgroundColor: 'white',
  fontFamily: 'Gilroy',
  border: '0px solid #E0E0E0',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E0E0E0',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#BDBDBD',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
  },
  '& .MuiSelect-select': {
    fontFamily: 'Gilroy',
    fontSize: '14px',
    color: '#666',
  },
  '& .MuiSelect-icon': {
    color: '#666',
    fontSize: '20px',
  },
  '& .MuiSvgIcon-root': {
    color: '#666',
    fontSize: '20px',
  },
}));

// Field label
export const FieldLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontFamily: 'Gilroy',
  color: '#333',
  fontWeight: '500',
  marginBottom: theme.spacing(1),
  display: 'block',
  '&.required::after': {
    content: '" *"',
    color: '#d32f2f',
  },
}));

// Upload sections
export const UploadSection = styled(Box)(() => ({
  paddingLeft: 'calc(1/15 * 100%)',
  paddingRight: 'calc(1/15 * 100%)',
}));

export const UploadBox = styled(Box)(({ theme }) => ({
  border: '1px solid #002CBA',
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(1.5, 2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'white',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  '&:hover': {
    backgroundColor: '#f0f7ff',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

export const UploadText = styled(Typography)(({ theme }) => ({
  color: '#002CBA',
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  width: '100%',
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  },
}));

export const UploadLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  color: '#333',
  marginBottom: theme.spacing(1),
  '&.required::after': {
    content: '" *"',
    color: '#d32f2f',
  },
}));

// File thumbnail components
export const FileThumbnail = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(0.5),
  backgroundColor: '#f9f9f9',
  marginTop: theme.spacing(1),
}));

export const FileUploadWithPreview = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
}));

export const FilePreviewContainer = styled(Box)(() => ({
  position: 'relative',
  width: '40px',
  height: '40px',
  flexShrink: 0,
}));

export const FilePreviewThumbnail = styled('img')(() => ({
  width: '40px',
  height: '40px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
  objectFit: 'cover',
  cursor: 'pointer',
}));

export const FilePreviewFallback = styled(Box)(() => ({
  width: '40px',
  height: '40px',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#666',
  cursor: 'pointer',
}));

export const SuccessIcon = styled('img')(() => ({
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '16px',
  height: '16px',
  zIndex: 2,
}));

export const FieldWithUploadAndPreview = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
}));

export const TextFieldContainer = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
}));

export const FileIcon = styled(Box)(() => ({
  width: '32px',
  height: '32px',
  minWidth: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#e8f4fd',
  borderRadius: '4px',
  fontSize: '16px',
}));

export const FileInfo = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
}));

export const FileName = styled(Typography)(() => ({
  fontSize: '12px',
  fontFamily: 'Gilroy',
  color: '#333',
  fontWeight: '500',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const FileSize = styled(Typography)(() => ({
  fontSize: '10px',
  fontFamily: 'Gilroy',
  color: '#666',
}));

export const RemoveFileButton = styled(Button)(() => ({
  minWidth: '24px',
  width: '24px',
  height: '24px',
  padding: 0,
  borderRadius: '50%',
  backgroundColor: '#ff4444',
  color: 'white',
  fontSize: '12px',
  '&:hover': {
    backgroundColor: '#cc0000',
  },
}));

// Action buttons
export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  paddingLeft: 'calc(1/15 * 100%)',
  paddingRight: 'calc(1/15 * 100%)',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

export const ClearButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  border: '1px solid #002CBA',
  color: '#002CBA',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(1.5, 2),
    fontSize: '14px',
  },
}));

export const SaveButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  backgroundColor: '#666',
  color: 'white',
  '&:hover': {
    backgroundColor: '#555',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(1.5, 2),
    fontSize: '14px',
  },
}));

// Field with upload button
export const FieldWithUpload = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  '& .MuiTextField-root': {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      paddingRight: theme.spacing(6),
    },
  },
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: '50%',
  transform: 'translateY(-50%)',
  minWidth: '35px',
  height: '35px',
  padding: 0,
  borderRadius: theme.spacing(0.5),
  backgroundColor: '#002CBA',
  color: 'white',
  border: 'none',
  zIndex: 1,
  '&:hover': {
    backgroundColor: '#1565c0',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '32px',
    height: '32px',
    right: theme.spacing(0.5),
    '& img': {
      width: '14px',
      height: '14px',
    },
  },
}));

// Copyright footer
export const CopyrightText = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  fontFamily: 'Gilroy',
  color: '#999',
  textAlign: 'center',
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    fontSize: '10px',
  },
}));
