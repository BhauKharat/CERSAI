import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import { CircularProgress, Box, Alert } from '@mui/material';
import { resetAuth } from '../Authenticate/slice/authSlice';
import { resetForm } from './slice/formSlice';
import { clearConfiguration } from './slice/registrationConfigSlice';
import { API_ENDPOINTS } from '../../../Constant';
import { postFormData } from '../../../utils/HelperFunctions/api/index';
import SuccessModal from '../../ui/Modal/SuccessModal';
import SignUpBg from '../../../assets/sign_up_bg.svg';
import { RegistrationHeader, Footer } from './CommonComponent';
import { MainContainer, FormContainer } from './RERegistrationContainer.style';
import RERegistrationStepper from './CommonComponent/RERegistrationStepper';
import {
  EntityProfileStep,
  AddressDetailsStep,
  HeadOfInstitutionStep,
  // NodalOfficerStep,
  AdminUserDetailsStep,
  FormPreviewStep,
  NodalOfficerStep,
  FrontendNodalOfficerStep,
  FrontendHeadOfInstitutionStep,
} from './steps';
import {
  initializeConfiguration,
  selectRegistrationSteps,
  selectRegistrationConfigLoading,
  selectRegistrationConfigError,
  // selectIsMultiStepEnabled,
} from './slice/registrationConfigSlice';
import type { AppDispatch } from '../../../redux/store';
import { getCompletedStepsFromData } from './utils/stepCompletionUtils';
import { selectAckNo } from './slice/pdfGenerationSlice';
import FrontendEntityProfileStep from './steps/FrontendEntityProfileStep';
import FrontendAddressDetailsStep from './steps/FrontendAddressDetailsStep';
import FrontendAdminUserDetailsStep from './steps/FrontendAdminUserDetailsStep';
// import { MultiStepForm } from './types/registrationConfigTypes';

// Default fallback configuration
const DEFAULT_STEPS = [
  'Entity Profile',
  'Address Details',
  'Head of Institution',
  'Nodal Officer',
  'Admin User Details',
  'Form Preview',
];

const DEFAULT_STEP_URLS = [
  'entity-profile',
  'address-details',
  'head-of-institution',
  'nodal-officer',
  'admin-user-details',
  'form-preview',
];

// Helper function to convert form type to URL
const getStepUrlFromFormType = (formType: string): string => {
  const urlMap: Record<string, string> = {
    RE_entity_profile: 'entity-profile',
    RE_addressDetails: 'address-details',
    RE_hoi: 'head-of-institution',
    RE_nodal: 'nodal-officer',
    RE_iau: 'admin-user-details',
    RE_formPreview: 'form-preview',
  };
  return urlMap[formType] || formType.toLowerCase().replace(/_/g, '-');
};

const RERegistrationContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const steps = useSelector(selectRegistrationSteps);
  const loading = useSelector(selectRegistrationConfigLoading);
  const error = useSelector(selectRegistrationConfigError);
  const configuration = useSelector(
    (state: RootState) => state.registrationConfig.configuration
  );
  const acknowledgementNoorkflow = useSelector(selectAckNo);

  // const isMultiStepEnabled = useSelector(selectIsMultiStepEnabled);

  // Auth selectors for final submission
  const { workflowId, userDetails, reinitializeDataResponse } = useSelector(
    (state: RootState) => state.auth
  );

  // Generate dynamic step data
  const STEPS =
    steps.length > 0 ? steps.map((step) => step.formname) : DEFAULT_STEPS;
  const STEP_URLS =
    steps.length > 0
      ? steps.map((step) => getStepUrlFromFormType(step.formtype))
      : DEFAULT_STEP_URLS;

  // Helper function to determine completed steps based on current step
  const getCompletedStepsFromReinitialize = useCallback((): number[] => {
    if (
      !reinitializeDataResponse?.data?.currentStep ||
      !configuration?.formSettings?.multistepforms
    ) {
      return [];
    }

    const currentStepName = reinitializeDataResponse.data.currentStep;
    const multistepforms = configuration.formSettings.multistepforms;

    // Special handling for track status and form preview pages
    // Use data-based completion instead of position-based completion
    if (
      currentStepName === 'RE_trackStatus' ||
      currentStepName === 'RE_formPreview' ||
      currentStepName === 'application_esign'
    ) {
      return getCompletedStepsFromData(reinitializeDataResponse?.data?.payload);
    }

    // For regular steps, use position-based completion
    const completedIndices: number[] = [];

    // Find the current step index by matching formname
    let currentStepIndex = -1;
    multistepforms.forEach((form, index) => {
      if (form.formtype === currentStepName) {
        currentStepIndex = index;
      }
    });

    // If current step found, mark all previous steps as completed
    if (currentStepIndex > 0) {
      for (let i = 0; i < currentStepIndex; i++) {
        completedIndices.push(i);
      }
    }

    return completedIndices;
  }, [reinitializeDataResponse, configuration]);

  // Extract step from current path
  const currentPath = location.pathname.split('/').pop();
  const step = STEP_URLS.includes(currentPath || '') ? currentPath : null;

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState<boolean>(true);
  const [formData, setFormData] = useState<
    Record<string, Record<string, unknown>>
  >({
    entityProfile: {},
    addressDetails: {},
    headOfInstitution: {},
    nodalOfficer: {},
    adminUserDetails: {},
  });

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Initialize configuration from frontend config on component mount
  useEffect(() => {
    dispatch(initializeConfiguration());
  }, [dispatch]);

  // Initialize completed steps from reinitialize response and localStorage
  useEffect(() => {
    if (
      reinitializeDataResponse?.data?.currentStep &&
      configuration?.formSettings?.multistepforms
    ) {
      const completedStepsFromLogin = getCompletedStepsFromReinitialize();

      // Also check localStorage for completed steps
      const storageKey = `reflow:${userDetails?.userId ?? 'anon'}:${workflowId ?? 'default'}`;
      let completedStepsFromStorage: number[] = [];

      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            currentStep?: number;
            completedSteps?: number[];
          };
          if (Array.isArray(parsed?.completedSteps)) {
            completedStepsFromStorage = parsed.completedSteps;
          }
        }
      } catch (e) {
        console.warn('Failed to parse localStorage completed steps:', e);
      }

      // Merge both sources and remove duplicates
      const mergedSteps = Array.from(
        new Set([...completedStepsFromLogin, ...completedStepsFromStorage])
      ).sort((a, b) => a - b);

      if (mergedSteps.length > 0) {
        console.log(
          '🟢 Setting completed steps (merged from login + localStorage):',
          mergedSteps
        );
        setCompletedSteps(mergedSteps);
      }
    }
  }, [
    reinitializeDataResponse,
    configuration,
    getCompletedStepsFromReinitialize,
    userDetails?.userId,
    workflowId,
  ]);

  // Sync URL with current step
  useEffect(() => {
    if (STEP_URLS.length === 0) return; // Wait for configuration to load

    if (step) {
      const stepIndex = STEP_URLS.indexOf(step);

      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
      }
    } else {
      // If no step in URL, redirect to first step and set step to 0
      setCurrentStep(0);
      navigate(`/${STEP_URLS[0]}`, { replace: true });
    }
  }, [step, navigate, location.pathname, STEP_URLS, formData.entityProfile]);

  // Update URL when step changes
  const updateCurrentStep = (newStep: number) => {
    setCurrentStep(newStep);
    navigate(`/${STEP_URLS[newStep]}`);
  };

  const handleStepSave = (stepData: Record<string, unknown>) => {
    if (currentStep === null) return;

    const stepKeys = [
      'entityProfile',
      'addressDetails',
      'headOfInstitution',
      'nodalOfficer',
      'adminUserDetails',
    ];
    const currentStepKey = stepKeys[currentStep];

    setFormData((prev) => {
      const newData = {
        ...prev,
        [currentStepKey]: stepData,
      };

      // If this is entity profile being saved, navigate to address details
      if (currentStepKey === 'entityProfile') {
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate(`/${STEP_URLS[1]}`, { replace: true });
        }, 0);
      }

      return newData;
    });

    console.log('Step saved:', { step: currentStepKey, data: stepData });

    // Only call handleNext if not on entity profile step
    if (currentStepKey !== 'entityProfile') {
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentStep === null) return;

    if (currentStep + 1 < STEPS.length) {
      const newCompletedSteps = [...completedSteps, currentStep];
      const newCurrentStep = currentStep + 1;

      // Update both states and URL together
      setCompletedSteps(newCompletedSteps);
      updateCurrentStep(newCurrentStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep === null) return;

    if (currentStep > 0) {
      updateCurrentStep(currentStep - 1);
    }
  };

  // Remove duplicate handleStepClick - RERegistrationStepper handles this logic

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    navigate(`/${STEP_URLS[stepIndex]}`);
  };

  //  remove only registration-related step keys
  const ClearRegistrationStepData = () => {
    try {
      const prefixes = ['reflow:'];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to clear registration data:', e);
    }
  };

  const handleFinalSubmit = async (ackNo: string) => {
    try {
      console.log('Final form submission started with ackNo:', ackNo);

      // Get current timestamp for submittedAt
      const submittedAt = new Date().toISOString();

      // Get userId from userDetails (could be userId or id)
      const userId = userDetails?.userId || userDetails?.id;

      if (!userId || !workflowId) {
        console.error('Missing required data:', { userId, workflowId });
        alert('Missing user or workflow information. Please try again.');
        return;
      }

      // Prepare metadata according to API specification
      const metadata = {
        submittedBy: userId,
        submittedAt: submittedAt,
      };

      console.log('Submitting final registration with:', {
        metadata,
        workflowId,
        userId,
      });

      // Call the final submission API
      const response = await postFormData(
        API_ENDPOINTS.submit_final_registration,
        {},
        {
          additionalFields: {
            metadata: JSON.stringify(metadata),
            workflowId: workflowId,
            userId: userId,
            acknowledgementNo: ackNo,
          },
          cleanMetadata: false,
          metadataKey: 'metadata',
        }
      );

      console.log('Final submission response:', response);

      // Extract acknowledgement number from response
      // Assuming the API returns acknowledgement number in response.data.acknowledgementNumber
      // const ackNumber = response?.data?.acknowledgementNumber || 'IN56768345';
      ClearRegistrationStepData();
      // setAcknowledgementNumber(ackNumber);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Final submission error:', error);
      setShowErrorModal(true);
      // alert('Failed to submit application. Please try again.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    // Clear all Redux state except address details to preserve user progress
    dispatch(resetAuth()); // Clear authentication state
    dispatch(resetForm()); // Clear form state (entity profile, etc.)
    dispatch(clearConfiguration()); // Clear registration configuration
    ClearRegistrationStepData();
    // Note: NOT clearing addressDetails Redux state to preserve user's address data
    console.log(
      '🔄 Logout: Preserving address details data for user convenience'
    );

    // Clear any local storage or session storage if needed
    localStorage.clear();
    sessionStorage.clear();

    // Navigate to re-signup with registration tab active
    navigate('/re-signup?tab=1');
  };

  // Home/Back handler
  const handleHome = () => {
    // Navigate back or to home - you can customize this behavior
    navigate(-1); // Go back to previous page
  };

  // Success modal handlers
  const handleSuccessModalClose = () => {
    // Logout user after closing success modal
    handleLogout();
  };

  // Error modal handlers
  const handleErrorModalClose = () => {
    // Logout user after closing success modal
    // handleLogout();
    setShowErrorModal(false);
    return;
  };

  const renderCurrentStep = () => {
    if (currentStep === null || steps.length === 0) return null;

    const currentStepConfig = steps[currentStep];
    if (!currentStepConfig) return null;

    // Map form types to components
    switch (currentStepConfig.formtype) {
      case 'RE_entity_profile':
        // return (
        //   <EntityProfileStep
        //     onSave={handleStepSave}
        //     onNext={handleNext}
        //     url={'entity_profile'}
        //     onValidationChange={setIsCurrentStepValid}
        //   />
        // );
        return (
          <FrontendEntityProfileStep
            onSave={handleStepSave}
            onNext={handleNext}
            url={'entity_profile'}
            onValidationChange={setIsCurrentStepValid}
          />
        );
      case 'RE_addressDetails':
        // return (
        //   <AddressDetailsStep
        //     onSave={handleStepSave}
        //     onNext={handleNext}
        //     url={'address_details'}
        //     onValidationChange={setIsCurrentStepValid}
        //   />
        // );
        return (
          <FrontendAddressDetailsStep
            onSave={handleStepSave}
            onNext={handleNext}
            url={'address_details'}
            onValidationChange={setIsCurrentStepValid}
          />
        );
      case 'RE_hoi':
        // return (
        //   <HeadOfInstitutionStep
        //     onSave={handleStepSave}
        //     onNext={handleNext}
        //     url={'head_of_institution'}
        //     onValidationChange={setIsCurrentStepValid}
        //   />
        // );
        return (
          <FrontendHeadOfInstitutionStep
            onSave={handleStepSave}
            onNext={handleNext}
            url={'head_of_institution'}
            onValidationChange={setIsCurrentStepValid}
          />
        );
      case 'RE_nodal':
        // return (
        //   <NodalOfficerStep
        //     onSave={handleStepSave}
        //     onNext={handleNext}
        //     url={'nodal_officer'}
        //     onValidationChange={setIsCurrentStepValid}
        //   />
        // );
        return (
          <FrontendNodalOfficerStep
            onSave={handleStepSave}
            onNext={handleNext}
            url={'nodal_officer'}
            onValidationChange={setIsCurrentStepValid}
          />
        );
      case 'RE_iau':
        // return (
        //   <AdminUserDetailsStep
        //     onSave={handleStepSave}
        //     onNext={handleNext}
        //     url={'admin_user_details'}
        //     onValidationChange={setIsCurrentStepValid}
        //   />
        // );
        return (
          <FrontendAdminUserDetailsStep
            onSave={handleStepSave}
            onNext={handleNext}
            url={'admin_user_details'}
            onValidationChange={setIsCurrentStepValid}
          />
        );
      case 'RE_formPreview':
        return (
          <FormPreviewStep
            onFinalSubmit={handleFinalSubmit}
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

  // Show loading state
  if (loading) {
    return (
      <MainContainer
        maxWidth={false}
        sx={{
          backgroundImage: `url(${SignUpBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Gilroy',
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
          <Box sx={{ color: 'white', fontSize: '18px' }}>
            Loading registration configuration...
          </Box>
        </Box>
      </MainContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainContainer
        maxWidth={false}
        sx={{
          backgroundImage: `url(${SignUpBg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Gilroy',
        }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
          Failed to load registration configuration: {error}
        </Alert>
      </MainContainer>
    );
  }

  return (
    <MainContainer
      maxWidth={false}
      sx={{
        backgroundImage: `url(${SignUpBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Gilroy',
      }}
    >
      <FormContainer
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
          fontFamily: 'Gilroy',
        }}
      >
        <RegistrationHeader
          onLogoutClick={handleLogout}
          onHomeClick={handleHome}
        />

        {currentStep !== null && STEPS.length > 0 && (
          <RERegistrationStepper
            STEPS={STEPS}
            completedSteps={completedSteps}
            currentStep={currentStep}
            setCompletedSteps={setCompletedSteps}
            setCurrentStep={updateCurrentStep}
            storageKey={`reflow:${userDetails?.userId ?? 'anon'}:${workflowId ?? 'default'}`}
            isCurrentStepValid={isCurrentStepValid}
          />
        )}

        {/* Render Current Step */}
        {currentStep !== null && renderCurrentStep()}
      </FormContainer>

      <Footer />

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        messageType="success"
        onClose={handleSuccessModalClose}
        title="Registration Submitted Successfully!"
        message={`You have successfully submitted your RE Registration Application. Your acknowledgement number is ${acknowledgementNoorkflow}. You can track the status of your application through your login.`}
        okText="Close"
        onOk={handleSuccessModalClose}
      />

      {/* Error Modal */}
      <SuccessModal
        open={showErrorModal}
        messageType="error"
        onClose={handleErrorModalClose}
        title="Registration Failed!"
        message={`Error in submitting your RE Registration Application. Please try again.`}
        okText="Close"
        onOk={handleErrorModalClose}
      />
    </MainContainer>
  );
};

export default RERegistrationContainer;
