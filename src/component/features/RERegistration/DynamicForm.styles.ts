import { styled } from '@mui/material/styles';
import { Box, Typography, Stepper } from '@mui/material';

// Main container for the dynamic form
export const DynamicFormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

// Form title styling
export const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: '600',
  fontFamily: 'Gilroy',
  color: '#333',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '20px',
    marginBottom: theme.spacing(2),
  },
}));

// Step container
export const StepContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(2),
    '& .step-circle': {
      width: '10px !important',
      height: '10px !important',
    },
    '& .step-counter': {
      fontSize: '10px !important',
    },
    '& .step-label': {
      fontSize: '11px !important',
      maxWidth: '80px !important',
    },
    '& .connecting-line': {
      top: '30px !important',
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& > div': {
      flexDirection: 'column !important',
      gap: theme.spacing(1),
      alignItems: 'flex-start !important',
    },
    '& .connecting-line': {
      display: 'none !important',
    },
    '& > div > div': {
      width: '100% !important',
      flex: 'none !important',
      alignItems: 'flex-start !important',
      textAlign: 'left !important',
    },
  },
}));

// Custom stepper styling
export const CustomStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root': {
    '& .MuiStepLabel-label': {
      fontFamily: 'Gilroy',
      fontSize: '14px',
      fontWeight: '500',
      '&.Mui-active': {
        color: '#002CBA',
        fontWeight: '600',
      },
      '&.Mui-completed': {
        color: '#4CAF50',
        fontWeight: '600',
      },
    },
  },
  '& .MuiStepIcon-root': {
    '&.Mui-active': {
      color: '#002CBA',
    },
    '&.Mui-completed': {
      color: '#4CAF50',
    },
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(3),
    '& .MuiStepLabel-label': {
      fontSize: '12px',
    },
  },
}));

// Step content container
export const StepContent = styled(Box)(({ theme }) => ({
  minHeight: '400px',
  padding: theme.spacing(2, 0),
  [theme.breakpoints.down('md')]: {
    minHeight: '300px',
    padding: theme.spacing(1, 0),
  },
}));

// Fields grid container
export const FieldsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
}));

// Individual field container
export const FieldContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minHeight: '80px',
}));

// Error message styling
export const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: '#d32f2f',
  fontSize: '12px',
  fontFamily: 'Gilroy',
  marginTop: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
}));

// Loading container
export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

// Loading text
export const LoadingText = styled(Typography)(() => ({
  fontSize: '16px',
  fontFamily: 'Gilroy',
  color: '#666',
  textAlign: 'center',
}));

// Form actions container
export const FormActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2, 0),
  borderTop: '1px solid #e0e0e0',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
}));

// Step indicator
export const StepIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1),
}));

// Step indicator text
export const StepIndicatorText = styled(Typography)(() => ({
  fontSize: '14px',
  fontFamily: 'Gilroy',
  color: '#666',
  fontWeight: '500',
}));

// Progress bar container
export const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
}));

// Progress bar
export const ProgressBar = styled(Box)<{ progress: number }>(
  ({ progress }) => ({
    width: '100%',
    height: '4px',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: `${progress}%`,
      backgroundColor: '#002CBA',
      borderRadius: '2px',
      transition: 'width 0.3s ease-in-out',
    },
  })
);

// Form section title
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: '600',
  fontFamily: 'Gilroy',
  color: '#333',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '16px',
    marginBottom: theme.spacing(1.5),
  },
}));

// Alert container for errors
export const AlertContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiAlert-root': {
    fontFamily: 'Gilroy',
    fontSize: '14px',
  },
}));

// Field wrapper for consistent spacing
export const FieldWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

// Responsive grid for 3 columns
export const ThreeColumnGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

// Stepper container
export const StepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: '30px',
  padding: '0',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    marginBottom: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '15px',
  },
}));

// Stepper inner container
export const StepperInnerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  padding: '0 40px',
  [theme.breakpoints.down('md')]: {
    padding: '0 20px',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    padding: '0 20px',
    gap: theme.spacing(2),
    alignItems: 'stretch',
  },
}));

// Connecting line (individual segments between circles)
export const ConnectingLine = styled(Box)(({ theme }) => ({
  flex: 1,
  height: '2px',
  backgroundColor: '#DDDDDD',
  alignSelf: 'center',
  margin: '0 -48px', // Overlap with circle edges
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    margin: '0 -40px', // Adjust for smaller circles
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide horizontal line in column layout
  },
}));

// Step item container
export const StepItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: 2,
  padding: '10px 0',
  [theme.breakpoints.down('md')]: {
    padding: '8px 0',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(1),
    width: '100%',
    gap: theme.spacing(1.5),
    borderLeft: '3px solid transparent',
    '&:first-of-type': {
      borderLeftColor: '#002CBA',
    },
  },
}));

// Step counter text
export const StepCounterText = styled(Box)<{ isActive: boolean }>(
  ({ isActive, theme }) => ({
    fontSize: '13px',
    color: isActive ? '#002CBA' : '#CCCCCC',
    fontFamily: 'Gilroy',
    fontWeight: '500',
    marginBottom: '8px',
    [theme.breakpoints.down('md')]: {
      fontSize: '11px',
      marginBottom: '6px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '12px',
      marginBottom: '0',
      order: 1,
    },
  })
);

// Step circle
export const StepCircle = styled(Box)<{ isActive: boolean }>(
  ({ isActive, theme }) => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: `3px solid ${isActive ? '#002CBA' : '#CCCCCC'}`,
    marginBottom: '8px',
    position: 'relative',
    zIndex: 3,
    [theme.breakpoints.down('md')]: {
      width: '20px',
      height: '20px',
      border: `2px solid ${isActive ? '#002CBA' : '#CCCCCC'}`,
      marginBottom: '6px',
    },
    [theme.breakpoints.down('sm')]: {
      width: '20px',
      height: '20px',
      border: `2px solid ${isActive ? '#002CBA' : '#CCCCCC'}`,
      marginBottom: '0',
      order: 2,
      flexShrink: 0,
    },
  })
);

// Step label text
export const StepLabelText = styled(Box)<{ isActive: boolean }>(
  ({ isActive, theme }) => ({
    fontSize: '14px',
    color: isActive ? '#002CBA' : '#CCCCCC',
    fontFamily: 'Gilroy',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: '1.2',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('md')]: {
      fontSize: '12px',
      maxWidth: '80px',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '14px',
      textAlign: 'left',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      lineHeight: '1.3',
      order: 3,
      flex: 1,
      fontWeight: isActive ? '600' : '500',
    },
  })
);
