/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../redux/store';
import { CircularProgress, Box, Alert, Typography } from '@mui/material';
import REUpdationStepper from './updateSteps/REUpdationStepper';
import UpdateEntityProfileStep from './updateSteps/UpdateEntityProfileStep';
import UpdateAddressDetailsStep from './updateSteps/UpdateAddressDetailsStep';
import UpdateHeadOfInstitutionStep from './updateSteps/UpdateHeadOfInstitutionStep';
import UpdateNodalOfficerStep from './updateSteps/UpdateNodalOfficerStep';
import UpdateAdminUserDetailsStep from './updateSteps/UpdateAdminUserDetailsStep';
import UpdateFormPreviewStep from './updateSteps/UpdateFormPreviewStep';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BreadcrumbUpdateProfile from '../MyTask/UpdateEntityProfile-prevo/BreadcrumbUpdateProfile';
import {
  fetchUpdateConfig,
  selectUpdateSteps,
  selectUpdateConfigLoading,
  selectUpdateConfigError,
} from './updateSteps/slice/updateStepperSlice';

const DEFAULT_STEPS = [
  'Entity Profile',
  'Address Details',
  'Head of Institution',
  'Nodal Officer',
  'Admin User Details',
  'Form Preview',
];

const DEFAULT_STEP_URLS = [
  'update-entity-profile-step',
  'update-address-step',
  'update-hoi-step',
  'update-nodal-officer-step',
  'update-admin-user-step',
  'update-form-preview-step',
];

const getStepUrlFromFormType = (formType: string): string => {
  const urlMap: Record<string, string> = {
    RE_entity_profile: 'update-entity-profile-step',
    RE_addressDetails: 'update-address-step',
    RE_hoi: 'update-hoi-step',
    RE_nodal: 'update-nodal-officer-step',
    RE_iau: 'update-admin-user-step',
    RE_formPreview: 'update-form-preview-step',
  };
  return urlMap[formType] || formType.toLowerCase().replace(/_/g, '-');
};

const REUpdationContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const steps = useSelector(selectUpdateSteps);
  const loading = useSelector(selectUpdateConfigLoading);
  const error = useSelector(selectUpdateConfigError);

  // Memoize STEPS and STEP_URLS to prevent unnecessary re-renders
  const STEPS = useMemo(
    () =>
      steps.length > 0
        ? steps.map((step: any) => step.formname)
        : DEFAULT_STEPS,
    [steps]
  );

  const STEP_URLS = useMemo(
    () =>
      steps.length > 0
        ? steps.map((step: any) => getStepUrlFromFormType(step.formtype))
        : DEFAULT_STEP_URLS,
    [steps]
  );

  const currentPath = location.pathname.split('/').pop();
  const step = STEP_URLS.includes(currentPath || '') ? currentPath : null;

  // Update currentStep based on URL path changes
  const stepIndexFromUrl = useMemo(() => {
    if (step && STEP_URLS.includes(step)) {
      return STEP_URLS.indexOf(step);
    }
    return null;
  }, [step, STEP_URLS]);

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData] = useState<Record<string, Record<string, unknown>>>({
    entityProfile: {},
    addressDetails: {},
    headOfInstitution: {},
    nodalOfficer: {},
    adminUserDetails: {},
  });

  useEffect(() => {
    dispatch(fetchUpdateConfig());

    return () => {
      // dispatch(clearConfiguration());
    };
  }, [dispatch]);

  // Sync currentStep with URL path - this ensures stepper updates when navigating via Edit button
  useEffect(() => {
    if (STEP_URLS.length === 0) return;

    if (stepIndexFromUrl !== null) {
      // Only update if the step index is different to avoid unnecessary re-renders
      if (currentStep !== stepIndexFromUrl) {
        setCurrentStep(stepIndexFromUrl);
        // Reset completedSteps when navigating backwards (e.g., via Edit button)
        // Only keep steps that are before the new current step
        setCompletedSteps((prevCompletedSteps) =>
          prevCompletedSteps.filter((step) => step < stepIndexFromUrl)
        );
      }
    } else if (!step) {
      // No valid step in URL, redirect to first step
      setCurrentStep(0);
      setCompletedSteps([]); // Reset completed steps when going to first step
      navigate(`/re/${STEP_URLS[0]}`, { replace: true });
    }
  }, [stepIndexFromUrl, step, navigate, STEP_URLS, currentStep]);

  const updateCurrentStepNumber = (newStep: number) => {
    // Scroll to top of the page immediately
    window.scrollTo(0, 0);

    setCurrentStep(newStep);
    navigate(`/re/${STEP_URLS[newStep]}`);

    // Clear transition state after navigation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  const handleSaveAndNext = () => {
    if (currentStep === null || isTransitioning) return;

    if (currentStep + 1 < STEPS.length) {
      const newCompletedSteps = [...completedSteps, currentStep];
      const newCurrentStep = currentStep + 1;

      setCompletedSteps(newCompletedSteps);

      // Set transition state to prevent flickering
      setIsTransitioning(true);

      // Scroll to top immediately
      window.scrollTo(0, 0);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        updateCurrentStepNumber(newCurrentStep);
      }, 50);
    }
  };

  const handlePrevious = () => {
    if (currentStep === null || isTransitioning) return;

    if (currentStep > 0) {
      // Set transition state
      setIsTransitioning(true);

      // Scroll to top immediately
      window.scrollTo(0, 0);

      setTimeout(() => {
        updateCurrentStepNumber(currentStep - 1);
      }, 50);
    }
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const renderCurrentStep = () => {
    if (currentStep === null || steps.length === 0) return null;

    // Show loading during transition to prevent flickering of old data
    if (isTransitioning) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            width: '100%',
          }}
        >
          <CircularProgress size={40} />
        </Box>
      );
    }

    const currentStepConfig = steps[currentStep];
    if (!currentStepConfig) return null;

    // Map form types to components - use key prop to force remount on step change
    switch (currentStepConfig.formtype) {
      case 'RE_entity_profile':
        return (
          <UpdateEntityProfileStep
            key={`entity-profile-${currentStep}`}
            onSaveAndNext={handleSaveAndNext}
          />
        );
      case 'RE_addressDetails':
        return (
          <UpdateAddressDetailsStep
            key={`address-details-${currentStep}`}
            onSaveAndNext={handleSaveAndNext}
          />
        );
      case 'RE_hoi':
        return (
          <UpdateHeadOfInstitutionStep
            key={`hoi-${currentStep}`}
            onSaveAndNext={handleSaveAndNext}
          />
        );
      case 'RE_nodal':
        return (
          <UpdateNodalOfficerStep
            key={`nodal-officer-${currentStep}`}
            onSaveAndNext={handleSaveAndNext}
          />
        );
      case 'RE_iau':
        return (
          <UpdateAdminUserDetailsStep
            key={`admin-user-${currentStep}`}
            onSaveAndNext={handleSaveAndNext}
          />
        );
      case 'RE_formPreview':
        return (
          <UpdateFormPreviewStep
            key={`form-preview-${currentStep}`}
            onPrevious={handlePrevious}
            onEdit={handleEditStep}
            formData={formData}
          />
        );
      default:
        return (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Unknown step type: {currentStepConfig.formtype}
          </Alert>
        );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          backgroundColor: '#fefefeff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Box sx={{ fontSize: '18px' }}>Loading update configuration...</Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 4,
          backgroundColor: '#fefefeff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          Failed to load update configuration: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#fefefeff', minHeight: '100vh' }}>
      {/* Flexible Back Button - adapts to current page */}

      {currentStep !== null && currentStep > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            height: '32px', // Fixed height to prevent layout shift
            mb: 2,
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              // Navigate to previous step instead of browser history
              if (currentStep > 0) {
                navigate(`/re/${STEP_URLS[currentStep - 1]}`, {
                  replace: true,
                });
              }
            }}
          >
            <ArrowBackIcon sx={{ mr: 1, fontSize: '18px' }} />
            <Typography
              sx={{
                fontFamily: 'Gilroy',
                fontWeight: 400,
                fontSize: '0.875rem',
                lineHeight: 1,
              }}
            >
              Back
            </Typography>
          </Box>
        </Box>
      )}

      <BreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'Update Profile', href: '/re/dashboard' },
          { label: 'Entity Profile' },
        ]}
      />

      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          mt: 3,
          ml: 0.5,
        }}
      >
        <Typography
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: '0.9rem',
              sm: '1.05rem',
              md: '1.15rem',
              lg: '1.25rem',
              xl: '1.35rem',
            },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Entity Profile
        </Typography>
      </Box>

      <Box sx={{ paddingBottom: 3, paddingTop: 2 }}>
        {currentStep !== null && STEPS.length > 0 && (
          <REUpdationStepper
            STEPS={STEPS}
            completedSteps={completedSteps}
            currentStep={currentStep}
            setCompletedSteps={setCompletedSteps}
            setCurrentStep={updateCurrentStepNumber}
          />
        )}
      </Box>

      {currentStep !== null && renderCurrentStep()}
    </Box>
  );
};

export default REUpdationContainer;
