/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
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
import { Check } from '@mui/icons-material';

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
  width: 20,
  height: 20,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

// Mobile stepper styles

const StepIcon = ({ icon, active, completed, onClick }: any) => (
  <CustomStepIcon ownerState={{ active, completed }} onClick={onClick}>
    {completed ? <Check fontSize="small" /> : icon}
  </CustomStepIcon>
);

const KYCCreationStepper = ({
  STEPS,
  completedSteps,
  currentStep,
  setCurrentStep,
}: {
  STEPS: string[];
  currentStep: number;
  setCurrentStep: (index: number) => void;
  completedSteps: number[];
  setCompletedSteps: (steps: number[]) => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleStepClick = (index: number) => {
    const maxAllowedStep = Math.max(...completedSteps, 0);

    if (completedSteps.includes(index)) {
      setCurrentStep(index);
      return;
    }
    if (index === maxAllowedStep + 1 && completedSteps.includes(index - 1)) {
      setCurrentStep(index);
      return;
    }
    console.log('Navigation blocked.');
  };

  const currentStepData = STEPS[currentStep];

  // Desktop Stepper Component
  const DesktopStepper = () => (
    <Box sx={{ width: '100%', pt: 4 }} fontFamily="Gilroy">
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          mt: 2,
          flexWrap: 'wrap',
          '.MuiStepIcon-root.Mui-completed': { color: '#52AE32' },
          '.MuiStepIcon-root.Mui-active': { color: '#002CBA' },
        }}
      >
        {STEPS.map((label, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index;

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
                      color: isActive ? '#002CBA' : '#A0A0A0',
                      position: 'absolute',
                      top: -72,
                      whiteSpace: 'nowrap',
                      fontFamily: 'Gilroy',
                    }}
                  >
                    Step {index + 1} of {STEPS.length}
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
        // const previousStep = currentStep - 1;
      }
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          fontFamily: 'Gilroy',
        }}
      >
        {/* Left side - Back arrow and current step name */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentStep > 0 && (
            <IconButton
              onClick={handleBackClick}
              sx={{
                mr: 1,
                p: 0.5,
                color: '#666',
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
              fontSize: '18px',
              // fontWeight: 500,
              color: '#000',
              fontFamily: 'Gilroy',
            }}
          >
            {currentStepData}
          </Typography>
        </Box>

        {/* Right side - Step counter */}
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#002CBA',
            fontFamily: 'Gilroy',
            letterSpacing: '0.5px',
            backgroundColor: '#EFF3FF',
            borderRadius: '2px',
          }}
        >
          STEP {currentStep + 1} / {STEPS.length}
        </Typography>
      </Box>
    );
  };

  return isMobile ? <MobileStepper /> : <DesktopStepper />;
};

export default KYCCreationStepper;
