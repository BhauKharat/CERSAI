import React, { useCallback, Component, ErrorInfo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, CircularProgress } from '@mui/material';
import PageLoader from '../../CommonComponent/PageLoader';
import {
  submitEntityProfile,
  selectSubmissionLoading,
  selectSubmissionError,
  resetSubmissionState,
} from '../../slice/entityProfileSubmissionSlice';
import {
  fetchStepData,
  fetchDocument,
  selectStepDataLoading,
  selectStepData,
  selectStepDocuments,
  selectFetchedDocuments,
  clearStepData,
} from '../../slice/stepDataSlice';
import { updateFormValue, setFieldsFromConfig } from '../../slice/formSlice';
import { RootState } from '../../../../../redux/store';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../../redux/store';
import { FieldErrorProvider } from '../../context/FieldErrorContext';
import { EntityProfileSubmissionError } from '../../types/entityProfileSubmissionTypes';
// Frontend configuration imports
import { useFrontendFormConfig } from '../../frontendConfig/utils/useFrontendFormConfig';
import { entityProfileConfig } from '../../frontendConfig/configs/entityProfileConfig';
import { FormField } from '../../types/formTypes';
import FrontendDynamicForm from '../FrontendDynamicForm';

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
    console.error('Form rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Form rendering error: {this.state.error?.message || 'Unknown error'}
          <br />
          Please refresh the page and try again.
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface FrontendEntityProfileStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const FrontendEntityProfileStep: React.FC<FrontendEntityProfileStepProps> = ({
  onSave,
  onNext,
  onPrevious,
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
  } = useFrontendFormConfig(entityProfileConfig);

  // Redux selectors
  const submissionLoading = useSelector(selectSubmissionLoading);
  const submissionError = useSelector(selectSubmissionError);

  // Clear submission errors on component mount to prevent old errors from showing
  React.useEffect(() => {
    console.log(
      '🧹 Clearing Entity Profile submission errors on component mount'
    );
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

  // Set frontend config fields in Redux when loaded (do this immediately, before DynamicForm renders)
  React.useEffect(() => {
    if (
      frontendFields &&
      frontendFields.length > 0 &&
      !configLoading &&
      frontendConfig
    ) {
      console.log(
        '✅ Setting frontend config fields in Redux:',
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
      // Create a copy of formData to modify
      const processedData = { ...formData };
      const constitution = String(processedData.constitution || '');
      const isSoleProprietorship = constitution === 'Sole Proprietorship';

      if (!isSoleProprietorship) {
        delete processedData.proprietorName;
      }

      console.log('Entity Profile Step - Form data received:', processedData);
      console.log('Form field names:', Object.keys(formData));
      console.log(
        'Form field values:',
        Object.entries(formData).map(([key, value]) => ({
          field: key,
          value: value instanceof File ? `File(${value.name})` : value,
          type: typeof value,
        }))
      );

      // Try multiple sources for workflowId and userId
      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      console.log('Auth state debug:', {
        authWorkflowId,
        userDetailsWorkflowId: userDetails?.workflowId,
        userDetailsUserId: userDetails?.userId,
        userDetailsId: userDetails?.id,
        finalWorkflowId: currentWorkflowId,
        finalUserId: userId,
        fullUserDetails: userDetails,
      });

      if (!currentWorkflowId || !userId) {
        console.error('Missing required data:', {
          workflowId: currentWorkflowId,
          userId,
          userDetails,
        });
        alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      console.log('Submitting entity profile with:', {
        workflowId: currentWorkflowId,
        userId,
        formDataKeys: Object.keys(formData),
      });

      try {
        // Reset previous submission state
        dispatch(resetSubmissionState());

        // Submit entity profile
        console.log('📤 Submitting with stepDocuments:', stepDocuments);
        console.log(
          '📤 stepDocuments details:',
          (stepDocuments || []).map((d) => ({
            id: d.id,
            fieldKey: d.fieldKey,
            type: d.type,
          }))
        );
        const result = await dispatch(
          submitEntityProfile({
            formValues: processedData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: formFields || [],
            stepDocuments: stepDocuments || [],
          })
        ).unwrap();

        console.log('✅ Entity profile submission successful:', result);

        // Call original onSave callback if provided
        if (onSave) {
          onSave(formData);
        }

        // Move to next step if provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Entity profile submission failed:', error);
        // Error is already handled by Redux slice
        // Additional safety: ensure error doesn't propagate as object
        if (error && typeof error === 'object') {
          console.error(
            'Error object details:',
            JSON.stringify(error, null, 2)
          );
        }
      }
    },
    [
      dispatch,
      userDetails,
      authWorkflowId,
      formFields,
      stepDocuments,
      onSave,
      onNext,
    ]
  );

  // Fetch step data after frontend form fields are loaded
  React.useEffect(() => {
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    // TEMPORARY: Use hardcoded values for testing if auth data is not available
    const testWorkflowId =
      currentWorkflowId || '19c166c7-aecd-4d0f-93cf-0ff9fa07caf7';
    const testUserId = userId || 'NO_6149';

    // Only fetch step data if frontend form fields are available and loaded
    // No need to wait for API call - frontend config is available immediately
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
        '✅ Frontend form fields loaded, now fetching step data for entityDetails:',
        {
          stepKey: 'entityDetails',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: frontendFields.length,
          usingTestValues: !currentWorkflowId || !userId,
        }
      );

      stepDataFetched.current = true; // Mark as fetched to prevent loops

      dispatch(
        fetchStepData({
          stepKey: 'entityDetails',
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

  // Reset the fetch flag when component unmounts or key dependencies change
  React.useEffect(() => {
    return () => {
      // console.log("🧹 Clearing step data on unmount");
      dispatch(clearStepData());
      stepDataFetched.current = false;
    };
  }, [dispatch, authWorkflowId, userDetails?.userId]);

  // Populate form fields when step data is loaded
  React.useEffect(() => {
    if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
      console.log('Populating form fields with step data:', stepData.data);

      // Populate each field from step data
      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          console.log(`Setting field ${fieldName} = ${fieldValue}`);
          // Convert value to string for form compatibility
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          dispatch(updateFormValue({ fieldName, value: stringValue }));
        }
      });

      // Log documents if available
      if (stepDocuments && stepDocuments.length > 0) {
        console.log('Available documents:', stepDocuments);
      }
    }
  }, [dispatch, stepData, stepDocuments]);

  // Fetch documents when step documents are available
  React.useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      console.log('Fetching documents for step data:', stepDocuments);
      console.log('Current fetched documents:', fetchedDocuments);

      stepDocuments.forEach((doc) => {
        // Only fetch if not already fetched (handle undefined fetchedDocuments)
        if (!fetchedDocuments || !fetchedDocuments[doc.id]) {
          console.log(`🔄 Fetching document: ${doc.id} (${doc.type})`);
          dispatch(fetchDocument(doc.id));
        } else {
          console.log(`✅ Document already fetched: ${doc.id}`);
        }
      });
    }
  }, [dispatch, stepDocuments, fetchedDocuments]);

  // Create a mapping of document types to field names for the form
  const documentFieldMapping = React.useMemo(() => {
    const mapping: Record<string, string> = {};

    if (stepDocuments && stepDocuments.length > 0) {
      stepDocuments.forEach((doc) => {
        // Map document types to their corresponding field names
        // switch (doc.type) {
        //   case 'cinFile':
        //     mapping['cinFile'] = doc.id;
        //     break;
        //   case 'panFile':
        //     mapping['panFile'] = doc.id;
        //     break;
        //   case 'addressProof':
        //     mapping['addressProof'] = doc.id;
        //     break;
        //   case 'other':
        //     mapping['other'] = doc.id;
        //     break;
        //   default:
        //     // For any other document types, use the type as field name
        //     mapping[doc.type] = doc.id;
        // }
        mapping[doc.fieldKey] = doc.id;
      });
    }

    // console.log('📋 Document field mapping created:', mapping);
    // console.log('📋 Step documents:', stepDocuments);
    // console.log('📋 Fetched documents:', fetchedDocuments);
    return mapping;
  }, [stepDocuments]);

  // Extract and map field errors if submission error is a field validation error
  const fieldErrors = React.useMemo(() => {
    if (
      submissionError &&
      typeof submissionError === 'object' &&
      'type' in submissionError &&
      (submissionError as EntityProfileSubmissionError).type ===
        'FIELD_VALIDATION_ERROR'
    ) {
      const rawFieldErrors =
        (submissionError as EntityProfileSubmissionError).fieldErrors || {};
      const mappedFieldErrors: Record<string, string> = {};

      // Map API field errors to actual form field names
      Object.entries(rawFieldErrors).forEach(([fieldName, errorMessage]) => {
        // Check if this field has a corresponding file field in the form configuration
        const field = formFields?.find((f) => f.fieldName === fieldName);

        if (
          field &&
          (field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image')
        ) {
          // For file fields, map to the file field name
          if (field.fieldType === 'textfield_with_image') {
            const fileFieldName =
              field.fieldFileName || `${field.fieldName}_file`;
            mappedFieldErrors[fileFieldName] = errorMessage;
            console.log(
              `📋 Mapped field error: ${fieldName} -> ${fileFieldName}: ${errorMessage}`
            );
          } else {
            // For regular file fields, use the field name as-is
            mappedFieldErrors[fieldName] = errorMessage;
            console.log(`📋 Direct field error: ${fieldName}: ${errorMessage}`);
          }
        } else {
          // For non-file fields, use the field name as-is
          mappedFieldErrors[fieldName] = errorMessage;
          console.log(`📋 Regular field error: ${fieldName}: ${errorMessage}`);
        }
      });

      console.log('📋 Final mapped field errors:', mappedFieldErrors);
      return mappedFieldErrors;
    }
    return {};
  }, [submissionError, formFields]);

  // Get general error message (non-field specific)
  const generalErrorMessage = React.useMemo(() => {
    if (!submissionError) return null;

    if (typeof submissionError === 'string') {
      return submissionError;
    }

    if (typeof submissionError === 'object' && 'message' in submissionError) {
      const errorObj = submissionError as EntityProfileSubmissionError;
      // Only show general message for non-field validation errors
      if (errorObj.type !== 'FIELD_VALIDATION_ERROR') {
        return errorObj.message;
      }
    }

    return null;
  }, [submissionError]);

  useEffect(() => {
    if (generalErrorMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [generalErrorMessage]);

  // Show error if frontend config failed to load (shouldn't happen, but safety check)
  if (configError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading form configuration: {configError}
        <br />
        Please refresh the page and try again.
      </Alert>
    );
  }

  // Show error if no fields loaded (shouldn't happen, but safety check)
  if (!frontendFields || frontendFields.length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No form fields available. Please check the configuration.
      </Alert>
    );
  }

  // Wait for fields to be set in Redux before rendering DynamicForm
  if (!fieldsReady) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <CircularProgress size={40} />
        <div>Loading form fields...</div>
      </div>
    );
  }

  return (
    <>
      {/* Page-level loader for form submission */}
      <PageLoader open={submissionLoading} message="Submitting form, please wait..." />

      {/* Show general error if submission failed (not field-specific) */}
      {generalErrorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalErrorMessage}
        </Alert>
      )}

      {/* Dynamic Form with Field Error Context */}
      <FormErrorBoundary>
        <FieldErrorProvider fieldErrors={fieldErrors}>
          <FrontendDynamicForm
            onSave={handleSave}
            onPrevious={onPrevious}
            urlDynamic={url}
            existingDocuments={fetchedDocuments}
            documentFieldMapping={documentFieldMapping}
            loading={submissionLoading}
            hasStepData={
              !!(
                stepData &&
                stepData.data &&
                Object.keys(stepData.data).length > 0
              )
            }
            useFrontendConfig={true}
            onValidationChange={onValidationChange}
          />
        </FieldErrorProvider>
      </FormErrorBoundary>
    </>
  );
};

export default FrontendEntityProfileStep;
