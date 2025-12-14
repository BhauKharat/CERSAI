import React, { useCallback, Component, ErrorInfo, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Alert, CircularProgress } from '@mui/material';
import DynamicForm from '../DynamicForm';
import {
  submitNodalOfficer,
  selectNodalOfficerSubmissionLoading,
  selectNodalOfficerSubmissionError,
  resetSubmissionState,
} from '../slice/nodalOfficerSubmissionSlice';
import {
  fetchStepData,
  fetchDocument,
  selectStepDataLoading,
  selectStepData,
  selectStepDocuments,
  selectFetchedDocuments,
  clearStepData,
} from '../slice/stepDataSlice';
import { updateFormValue, setFieldsFromConfig } from '../slice/formSlice';
import { RootState } from '../../../../redux/store';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../redux/store';
import { FieldErrorProvider } from '../context/FieldErrorContext';
// Frontend configuration imports
import { useFrontendFormConfig } from '../frontendConfig/utils/useFrontendFormConfig';
import { nodalOfficerConfig } from '../frontendConfig/configs/nodalOfficerConfig';
import { FormField } from '../types/formTypes';

// Simple Error Boundary for catching render errors
class FormErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Nodal Officer form rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Nodal Officer form rendering error:{' '}
          {this.state.error?.message || 'Unknown error'}
          <br />
          Please refresh the page and try again.
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface FrontendNodalOfficerStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const FrontendNodalOfficerStep: React.FC<FrontendNodalOfficerStepProps> = ({
  onSave,
  onNext,
  url,
  onValidationChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Use frontend form configuration instead of API
  const {
    fields: frontendFields,
    configuration: frontendConfig,
    loading: configLoading,
    error: configError,
  } = useFrontendFormConfig(nodalOfficerConfig);

  // Redux selectors
  const submissionLoading = useSelector(selectNodalOfficerSubmissionLoading);
  const submissionError = useSelector(selectNodalOfficerSubmissionError);

  // Clear submission errors on component mount
  React.useEffect(() => {
    console.log('🧹 Clearing Nodal Officer submission errors on component mount');
    dispatch(resetSubmissionState());
  }, [dispatch]);

  // Step data selectors
  const stepDataLoading = useSelector(selectStepDataLoading);
  const stepData = useSelector(selectStepData);
  const stepDocumentsFromStore = useSelector(selectStepDocuments);
  const stepDocuments = React.useMemo(
    () => stepDocumentsFromStore || [],
    [stepDocumentsFromStore]
  );
  const fetchedDocuments = useSelector(selectFetchedDocuments);

  // Add a ref to track if step data has been fetched
  const stepDataFetched = React.useRef(false);

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );

  // Get form fields from Redux (now populated from frontend config)
  const formFields = useSelector(
    (state: RootState) => state.dynamicForm.fields
  );

  // Set frontend config fields in Redux when loaded
  React.useEffect(() => {
    if (
      frontendFields &&
      frontendFields.length > 0 &&
      !configLoading &&
      frontendConfig
    ) {
      console.log(
        '✅ Setting frontend Nodal Officer config fields in Redux:',
        frontendFields.length
      );
      dispatch(
        setFieldsFromConfig({
          fields: frontendFields as FormField[],
          configuration: frontendConfig as any,
        })
      );
    }
  }, [frontendFields, frontendConfig, configLoading, dispatch]);

  // Ensure fields are set before rendering DynamicForm
  const fieldsReady = React.useMemo(() => {
    return (
      frontendFields &&
      frontendFields.length > 0 &&
      !configLoading &&
      formFields &&
      formFields.length > 0
    );
  }, [frontendFields, configLoading, formFields]);

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      console.log('Nodal Officer Step - Form data received:', formData);

      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      if (!currentWorkflowId || !userId) {
        console.error('Missing required data:', {
          workflowId: currentWorkflowId,
          userId,
        });
        alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      try {
        dispatch(resetSubmissionState());

        const result = await dispatch(
          submitNodalOfficer({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: formFields || [],
          })
        ).unwrap();

        console.log('✅ Nodal Officer submission successful:', result);

        if (onSave) {
          onSave(formData);
        }

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Nodal Officer submission failed:', error);
      }
    },
    [
      dispatch,
      userDetails,
      authWorkflowId,
      formFields,
      onSave,
      onNext,
    ]
  );

  // Fetch step data after frontend form fields are loaded
  React.useEffect(() => {
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    const testWorkflowId =
      currentWorkflowId || '19c166c7-aecd-4d0f-93cf-0ff9fa07caf7';
    const testUserId = userId || 'NO_6149';

    if (
      testWorkflowId &&
      testUserId &&
      frontendFields &&
      frontendFields.length > 0 &&
      !configLoading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      console.log(
        '✅ Frontend Nodal Officer form fields loaded, now fetching step data for nodal:',
        {
          stepKey: 'nodal',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: frontendFields.length,
        }
      );

      stepDataFetched.current = true;
      dispatch(
        fetchStepData({
          stepKey: 'nodal',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    }
  }, [
    dispatch,
    authWorkflowId,
    userDetails,
    frontendFields,
    configLoading,
    stepDataLoading,
  ]);

  // Reset the fetch flag when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearStepData());
      stepDataFetched.current = false;
    };
  }, [dispatch, authWorkflowId, userDetails?.userId]);

  // Populate form fields when step data is loaded
  React.useEffect(() => {
    if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
      console.log('Populating Nodal Officer form fields with step data:', stepData.data);

      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          dispatch(updateFormValue({ fieldName, value: stringValue }));
        }
      });
    }
  }, [dispatch, stepData]);

  // Document field mapping
  const documentFieldMapping = React.useMemo(() => {
    const mapping: Record<string, string> = {};
    if (stepDocuments && stepDocuments.length > 0) {
      stepDocuments.forEach((doc) => {
        mapping[doc.fieldKey] = doc.id;
      });
    }
    return mapping;
  }, [stepDocuments]);

  // Show loading state
  if (configLoading || !fieldsReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  // Show error if config failed to load
  if (configError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading form configuration: {configError}
        <br />
        Please refresh the page and try again.
      </Alert>
    );
  }

  if (!frontendFields || frontendFields.length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No form fields available. Please check the configuration.
      </Alert>
    );
  }

  return (
    <FormErrorBoundary>
      <FieldErrorProvider>
        <DynamicForm
          onSave={handleSave}
          urlDynamic={url || 'nodal_officer'}
          existingDocuments={fetchedDocuments}
          documentFieldMapping={documentFieldMapping}
          loading={submissionLoading as boolean}
          hasStepData={
            !!(
              stepData &&
              stepData.data &&
              Object.keys(stepData.data).length > 0
            )
          }
          onValidationChange={onValidationChange}
          useFrontendConfig={true}
        />
      </FieldErrorProvider>
    </FormErrorBoundary>
  );
};

export default FrontendNodalOfficerStep;

