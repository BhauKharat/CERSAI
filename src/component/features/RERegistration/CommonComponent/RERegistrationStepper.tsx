/* eslint-disable */
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
import { Check } from '@mui/icons-material';

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-alternativeLabel': {
    top: 12,
  },
  '& .MuiStepConnector-line': {
    borderTopWidth: 3,
    borderColor: theme.palette.grey[300],
    borderRadius: '2px',
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
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: ownerState.completed
    ? '2px solid #52AE32'
    : ownerState.active
      ? '2px solid #002CBA'
      : `2px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  [theme.breakpoints.down('md')]: {
    width: 20,
    height: 20,
    fontSize: '11px',
  },
}));
// Mobile stepper styles

const StepIcon = ({ icon, active, completed, onClick }: any) => (
  <CustomStepIcon ownerState={{ active, completed }} onClick={onClick}>
    {completed ? <Check fontSize="small" /> : icon}
  </CustomStepIcon>
);

type RERegistrationStepperProps = {
  STEPS: string[];
  currentStep: number;
  setCurrentStep: (index: number) => void;
  completedSteps: number[];
  setCompletedSteps: (steps: number[]) => void;
  storageKey?: string;
  isCurrentStepValid?: boolean;
};

const RERegistrationStepper: React.FC<RERegistrationStepperProps> = ({
  STEPS,
  completedSteps,
  currentStep,
  setCurrentStep,
  setCompletedSteps,
  storageKey,
  isCurrentStepValid = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // ======== PERSISTENCE (MINIMAL) ========
  const KEY =
    storageKey ??
    `stepper:${typeof window !== 'undefined' ? window.location.pathname : 'default'}`;

  const hydratedRef = React.useRef(false);

  // 1) Hydrate once on mount
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        currentStep?: number;
        completedSteps?: number[];
      };

      const maxIdx = STEPS.length - 1;

      if (Array.isArray(parsed?.completedSteps)) {
        const safeCompleted = parsed.completedSteps.filter(
          (i) => Number.isInteger(i) && i >= 0 && i <= maxIdx
        );
        setCompletedSteps(safeCompleted);
      }
      if (Number.isInteger(parsed?.currentStep)) {
        const safeStep = Math.max(
          0,
          Math.min(parsed!.currentStep as number, maxIdx)
        );
        setCurrentStep(safeStep);
      }
    } catch {
      /* no-op */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Persist on change (this won’t fight navigation)
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ currentStep, completedSteps })
      );
    } catch {
      /* no-op */
    }
  }, [KEY, currentStep, completedSteps]);

  const handleStepClick = (index: number) => {
    // If clicking on the same step, do nothing
    if (index === currentStep) return;

    // Allow navigation to any step so users can fill data in any order
    setCurrentStep(index);
  };

  const currentStepData = STEPS[currentStep];

  // Desktop Stepper Component
  const DesktopStepper = () => (
    <Box
      sx={{ width: '100%', pt: 4, px: { xs: 2, sm: 4 } }}
      fontFamily="Gilroy"
    >
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          mt: 2,
          flexWrap: 'wrap',
          '.MuiStepIcon-root.Mui-completed': { color: '#52AE32' },
          '.MuiStepIcon-root.Mui-active': { color: '#002CBA' },
          '& .MuiStep-root': {
            px: { xs: 0.5, sm: 1 },
          },
        }}
      >
        {STEPS.map((label, index) => {
          const isActive = currentStep === index;

          const isCompleted = completedSteps.includes(index) && !isActive;

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
                    cursor: 'pointer',
                    '&:hover': {
                      '& .step-label': {
                        color: isCompleted || isActive ? '#000' : '#666',
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
                      color: isCompleted
                        ? '#52AE32'
                        : isActive
                          ? '#000'
                          : '#999',
                      mt: -1,
                      maxWidth: { xs: 80, sm: 120, md: 270 },
                      textAlign: 'center',
                      lineHeight: 1.2,
                      fontFamily: 'Gilroy',
                      transition: 'color 0.3s ease',
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

  // Mobile Stepper Component - Enhanced with step indicators
  const MobileStepper = () => {
    const handleBackClick = () => {
      if (currentStep > 0) {
        const previousStep = currentStep - 1;
        setCurrentStep(previousStep);
      }
    };

    return (
      <Box sx={{ width: '100%', fontFamily: 'Gilroy' }}>
        {/* Header with back button and step counter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {/* Left side - Back arrow and current step name */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
                fontSize: '16px',
                fontWeight: 500,
                color: '#000',
                fontFamily: 'Gilroy',
                flex: 1,
                textAlign: currentStep > 0 ? 'left' : 'center',
              }}
            >
              {currentStepData}
            </Typography>
          </Box>

          {/* Right side - Step counter */}
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#002CBA',
              fontFamily: 'Gilroy',
              letterSpacing: '0.5px',
              backgroundColor: '#EFF3FF',
              borderRadius: '12px',
              px: 2,
              py: 0.5,
            }}
          >
            STEP {currentStep + 1} / {STEPS.length}
          </Typography>
        </Box>

        {/* Progress indicator */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 2,
            backgroundColor: '#fff',
            overflowX: 'auto',
            gap: 5,
          }}
        >
          {STEPS.map((label, index) => {
            const isActive = currentStep === index;

            const isCompleted = completedSteps.includes(index) && !isActive;

            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 'fit-content',
                }}
              >
                <Box
                  onClick={() => handleStepClick(index)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: '96px',
                  }}
                >
                  <CustomStepIcon
                    ownerState={{ active: isActive, completed: isCompleted }}
                    sx={{ mb: 0.5 }}
                  >
                    {isCompleted ? <Check fontSize="small" /> : index + 1}
                  </CustomStepIcon>
                  <Typography
                    sx={{
                      fontSize: '9px',
                      color: isCompleted
                        ? '#52AE32'
                        : isActive
                          ? '#002CBA'
                          : '#999',
                      textAlign: 'center',
                      fontFamily: 'Gilroy',
                      fontWeight: isCompleted || isActive ? 600 : 400,
                      lineHeight: 1.2,
                      maxWidth: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label.length > 12 ? `${label.substring(0, 8)}...` : label}
                  </Typography>
                </Box>
                {index < STEPS.length - 1 && (
                  <Box
                    sx={{
                      width: '20px',
                      height: '2px',
                      backgroundColor: isCompleted ? '#52AE32' : '#e0e0e0',
                      mx: 0.5,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return isMobile ? <MobileStepper /> : <DesktopStepper />;
};

export default RERegistrationStepper;