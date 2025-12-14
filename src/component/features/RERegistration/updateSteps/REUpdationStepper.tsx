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
} from '@mui/material';

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-alternativeLabel': {
    top: 11,
    left: 'calc(-50% + 24px)',
    right: 'calc(50% + 24px)',
  },
  '& .MuiStepConnector-line': {
    borderTopWidth: 2,
    borderColor: '#828282',
    borderRadius: '0px',
    borderStyle: 'solid',
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: '#52AE32',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: '#52AE32',
  },
  [theme.breakpoints.down('md')]: {
    '& .MuiStepConnector-line': {
      borderTopWidth: 2,
    },
    '&.MuiStepConnector-alternativeLabel': {
      top: 9,
      left: 'calc(-50% + 20px)',
      right: 'calc(50% + 20px)',
    },
  },
}));

const CustomStepIcon = styled('div')<{
  ownerState: { active: boolean; completed: boolean };
}>(({ ownerState }) => ({
  backgroundColor: '#fff',
  zIndex: 1,
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: ownerState.completed
    ? '4px solid #52AE32'
    : ownerState.active
      ? '4px solid #002CBA'
      : '4px solid #828282',
  boxSizing: 'border-box',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  '@media (max-width: 960px)': {
    width: 20,
    height: 20,
    border: ownerState.completed
      ? '3px solid #52AE32'
      : ownerState.active
        ? '3px solid #002CBA'
        : '3px solid #828282',
  },
}));

const StepIcon = ({ active, completed, onClick }: any) => (
  <CustomStepIcon ownerState={{ active, completed }} onClick={onClick}>
    {/* Empty circle - no number or checkmark */}
  </CustomStepIcon>
);

interface REUpdationStepperProps {
  STEPS: string[];
  currentStep: number;
  setCurrentStep: (index: number) => void;
  completedSteps: number[];
  setCompletedSteps: (steps: number[]) => void;
  isCurrentStepValid?: boolean;
}

const REUpdationStepper: React.FC<REUpdationStepperProps> = ({
  STEPS,
  completedSteps,
  currentStep,
  setCurrentStep,
  setCompletedSteps,
  isCurrentStepValid = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleStepClick = (index: number) => {
    // If clicking on the same step, do nothing
    if (index === currentStep) {
      return;
    }

    // Prevent ALL navigation if current step is invalid
    // User must fix validation errors and save before navigating anywhere
    if (!isCurrentStepValid) {
      console.log(
        `⚠️ Cannot navigate to step ${index + 1}. Please fix validation errors and save the current step first.`
      );
      return;
    }

    // const maxAllowedStep = Math.max(...completedSteps, 0);

    // If clicking on a previously completed (or current) step – allow and prune future completions
    // const isPreviewStep = index === STEPS.length - 1 && STEPS[STEPS.length - 1] === 'Form Preview';

    // if (isPreviewStep) {
    //   return; // Don't allow navigation to preview step from stepper
    // }
    if (index <= currentStep) {
      setCurrentStep(index);
      // setCompletedSteps(completedSteps.filter((step: number) => step <= index));
      return;
    }

    // Clicking exactly the next step after the furthest completed – allow forward move
    if (index === currentStep + 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(index);
      return;
    }
    return;
  };

  const currentStepData = STEPS[currentStep];

  // Desktop Stepper Component
  const DesktopStepper = () => (
    <Box sx={{ width: '100%', pt: 4, px: 0 }} fontFamily="Gilroy">
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          mt: 2,
          mx: 0,
          px: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          '.MuiStepIcon-root.Mui-completed': { color: '#52AE32' },
          '.MuiStepIcon-root.Mui-active': { color: '#002CBA' },
          '& .MuiStep-root': {
            flex: 1,
            px: 0,
            mx: 0,
          },
          '& .MuiStep-root:first-of-type': {
            paddingLeft: 0,
            marginLeft: 0,
          },
          '& .MuiStep-root:last-of-type': {
            paddingRight: 0,
            marginRight: 0,
          },
        }}
      >
        {STEPS.map((label, index) => {
          const isCompleted =
            completedSteps.includes(index) || index < currentStep;
          const isActive = currentStep === index;

          return (
            <Step key={label} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <StepIcon
                    active={isActive}
                    completed={isCompleted}
                    onClick={() => handleStepClick(index)}
                  />
                )}
                sx={{
                  '& .MuiStepLabel-labelContainer': {
                    width: '100%',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    width: '100%',
                    '&:hover': {
                      '& .step-label': {
                        color: '#000000',
                      },
                    },
                  }}
                  onClick={() => handleStepClick(index)}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '11px', sm: '13px' },
                      color: isCompleted
                        ? '#52AE32'
                        : isActive
                          ? '#002CBA'
                          : '#A0A0A0',
                      position: 'absolute',
                      top: { xs: -60, sm: -72 },
                      whiteSpace: 'nowrap',
                      fontFamily: 'Gilroy',
                      fontWeight: isCompleted || isActive ? 600 : 400,
                    }}
                  >
                    Step {index + 1} of {STEPS.length}
                  </Typography>
                  <Box sx={{ height: 5 }} />
                  <Typography
                    className="step-label"
                    sx={{
                      fontSize: { xs: '10px', sm: '12px' },
                      fontWeight: isCompleted || isActive ? 600 : 400,
                      color: '#000000',
                      mt: -1,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      fontFamily: 'Gilroy',
                      transition: 'color 0.3s ease',
                      width: '100%',
                      px: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
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

  // Mobile Stepper Component
  const MobileStepper = () => (
    <Box
      sx={{
        width: '100%',
        pt: 3,
        pb: 2,
        px: 2,
        fontFamily: 'Gilroy',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '12px', sm: '14px' },
            fontWeight: 600,
            color: '#002CBA',
            fontFamily: 'Gilroy',
          }}
        >
          Step {currentStep + 1} of {STEPS.length}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '11px', sm: '13px' },
            fontWeight: 500,
            color: '#666',
            fontFamily: 'Gilroy',
          }}
        >
          {currentStepData}
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box
        sx={{
          width: '100%',
          height: 6,
          backgroundColor: theme.palette.grey[200],
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            height: '100%',
            backgroundColor: '#52AE32',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      {/* Step dots */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mt: 2,
        }}
      >
        {STEPS.map((_, index) => {
          const isCompleted =
            completedSteps.includes(index) || index < currentStep;
          const isActive = currentStep === index;

          return (
            <Box
              key={index}
              onClick={() => handleStepClick(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isCompleted
                  ? '2px solid #52AE32'
                  : isActive
                    ? '2px solid #002CBA'
                    : '2px solid #828282',
                boxSizing: 'border-box',
                '&:hover': {
                  transform: 'scale(1.2)',
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );

  return isMobile ? <MobileStepper /> : <DesktopStepper />;
};

export default REUpdationStepper;
