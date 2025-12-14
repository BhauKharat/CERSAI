/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Typography,
  Box,
  styled,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { setCurrentStep } from '../../../../redux/slices/registerSlice/applicationSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const STEPS = [
  'Entity Profile',
  'Address Details',
  'Head of Institution Details',
  'Nodal Officer Details',
  'Institutional Admin User Details',
  'Form Preview',
];

const stepRoutes = [
  '/re/update-entity-details',
  '/re/update-address-details',
  '/re/update-institutional-details',
  '/re/update-nodal-officer-details',
  '/re/update-institutional-admin-details',
  '/re/update-preview-details',
];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-alternativeLabel': {
    top: 12,
  },
  '& .MuiStepConnector-line': {
    borderTopWidth: 2,
    borderColor: theme.palette.grey[300],
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: '#002CBA',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: '#52AE32',
  },
}));

const CustomStepIcon = styled('div')<{
  ownerState: { active: boolean; completed: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.completed
    ? '#52AE32'
    : ownerState.active
      ? '#002CBA'
      : theme.palette.grey[300],
  zIndex: 1,
  color: '#fff',
  width: 20, // Increased size for better visibility
  height: 20, // Increased size for better visibility
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '10px', // Adjusted font size
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StepIcon = ({ active, completed, onClick }: any) => (
  <CustomStepIcon ownerState={{ active, completed }} onClick={onClick}>
    {completed ? (
      <FiberManualRecordIcon fontSize="small" />
    ) : (
      <FiberManualRecordIcon fontSize="small" />
    )}{' '}
    {/* Empty string for completed steps */}
  </CustomStepIcon>
);
const ApplicationStepperUpdate: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { currentStep, completedSteps, totalSteps } = useSelector(
    (state: any) => state.application.stepperState
  );

  // Simple route sync - just update currentStep based on current route
  useEffect(() => {
    const currentRoute = location.pathname;
    const stepIndex = stepRoutes.indexOf(currentRoute);
    if (stepIndex !== -1 && stepIndex !== currentStep) {
      console.log('Syncing step with route:', currentRoute, 'Step:', stepIndex);
      dispatch(setCurrentStep(stepIndex));
    }
  }, [location.pathname, dispatch, currentStep]);

  const handleStepClick = (index: number) => {
    const maxAllowedStep = Math.max(...completedSteps, 0);
    console.log('Clicked Step Index:', index);
    console.log('Completed Steps:', completedSteps);
    console.log('Max Allowed Step:', maxAllowedStep);

    if (index <= maxAllowedStep || completedSteps.includes(index)) {
      console.log('Navigating to:', stepRoutes[index]);
      dispatch(setCurrentStep(index));
      navigate(stepRoutes[index]);
    } else {
      console.log('Navigation blocked.');
    }
  };

  const currentStepData = STEPS[currentStep] || STEPS[0];

  const DesktopStepper = () => (
    <Box sx={{ width: '110%', p: 4, fontFamily: 'Gilroy', ml: -10, mb: 2 }}>
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          mt: 2,
          mb: -8,
          flexWrap: 'wrap',
          '.MuiStepIcon-root.Mui-completed': { color: '#52AE32' },
          '.MuiStepIcon-root.Mui-active': { color: '#002CBA' },
        }}
      >
        {STEPS.map((label, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;

          const isFirstStep = index === 0;
          const isLastStep = index === STEPS.length - 1;

          return (
            <Step key={label} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <StepIcon
                    icon={index + 1}
                    active={isActive}
                    completed={isCompleted}
                    onClick={() => handleStepClick(index)}
                  />
                )}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '13px',
                      // Changed: Make completed steps green, active steps blue, others gray
                      color: isCompleted
                        ? '#52AE32'
                        : isActive
                          ? '#002CBA'
                          : '#A0A0A0',
                      position: 'absolute',
                      top: -72,
                      whiteSpace: 'nowrap',
                      fontFamily: 'Gilroy',

                      fontWeight: isCompleted ? 400 : 400, // Make completed steps bold
                    }}
                  >
                    {/* Step {index + 1} of {totalSteps} */}
                    Step {index + 1} of 6
                  </Typography>
                  <Box sx={{ height: 5 }} />
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#000' : '#999',
                      mt: -1,
                      maxWidth: 270,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      fontFamily: 'Gilroy',
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );

  // Mobile Stepper Component - Simple header style
  const MobileStepper = () => {
    const handleBackClick = () => {
      if (currentStep > 0) {
        const previousStep = currentStep - 1;
        dispatch(setCurrentStep(previousStep));
        navigate(stepRoutes[previousStep]);
      }
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: {
            xs: '12px 8px', // Reduced padding on mobile
            sm: '16px 20px',
          },
          backgroundColor: '#fff',
          fontFamily: 'Gilroy',
          minHeight: '48px', // Ensure consistent height
          flexWrap: 'nowrap',
          gap: {
            xs: '16px', // Increased gap on mobile for more space
            sm: '16px',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 0, // Allow shrinking
            flex: {
              xs: '1 1 auto', // Allow growing/shrinking on mobile
              sm: '0 0 auto',
            },
            overflow: 'hidden', // Prevent overflow
          }}
        >
          {currentStep > 0 && (
            <IconButton
              onClick={handleBackClick}
              sx={{
                p: {
                  xs: 0.25, // Smaller padding on mobile
                  sm: 0.5,
                },
                color: '#666',
                mr: {
                  xs: 0.5, // Reduced margin on mobile
                  sm: 1,
                },
                minWidth: 'auto', // Prevent button from being too wide
                flexShrink: 0, // Don't shrink the back button
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </IconButton>
          )}
          <Typography
            sx={{
              fontSize: {
                xs: '12px', // Smaller font on mobile
                sm: '14px',
              },
              fontWeight: 500,
              color: '#000',
              fontFamily: 'Gilroy',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', // Prevent text wrapping
              minWidth: 0, // Allow text to shrink
            }}
          >
            {currentStepData}
          </Typography>
        </Box>

        {/* Right side - Step counter */}
        <Typography
          sx={{
            fontSize: {
              xs: '9px', // Even smaller font on very small screens
              sm: '10px',
            },
            fontWeight: 600,
            color: '#002CBA',
            fontFamily: 'Gilroy',
            letterSpacing: '0.5px',
            backgroundColor: '#EFF3FF',
            borderRadius: {
              xs: '8px', // Smaller border radius
              sm: '10px',
            },
            padding: {
              xs: '2px 6px', // Reduced padding on mobile
              sm: '4px 12px',
            },
            flexShrink: 0, // Don't let the step counter shrink
            whiteSpace: 'nowrap', // Keep step counter on one line
          }}
        >
          STEP {currentStep + 1} / {totalSteps}
        </Typography>
      </Box>
    );
  };

  return isMobile ? <MobileStepper /> : <DesktopStepper />;
};

export default ApplicationStepperUpdate;
