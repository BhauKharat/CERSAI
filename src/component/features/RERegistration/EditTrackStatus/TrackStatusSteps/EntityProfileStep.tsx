import React, { useCallback, Component, ErrorInfo } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from '@mui/material';
// import DynamicForm from '../../DynamicForm';
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
} from '../../slice/stepDataSlice';
import { updateFormValue } from '../../slice/formSlice';
import { RootState } from '../../../../../redux/store';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../../redux/store';
import { FieldErrorProvider } from '../../context/FieldErrorContext';
import { EntityProfileSubmissionError } from '../../types/entityProfileSubmissionTypes';
import TrackStatusDynamicForm from '../TrackStatusDynamicForm';

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

interface EntityProfileStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  url?: string;
}

const EntityProfileStep: React.FC<EntityProfileStepProps> = ({
  onSave,
  onNext,
  url,
}) => {
  const dispatch = useDispatch<AppDispatch>();

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
  const stepDocuments = useSelector(selectStepDocuments);
  const fetchedDocuments = useSelector(selectFetchedDocuments);

  // Add a ref to track if step data has been fetched
  const stepDataFetched = React.useRef(false);

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );

  // Get form fields for dynamic validation
  const formFields = useSelector(
    (state: RootState) => state.dynamicForm.fields
  );
  const formFieldsLoading = useSelector(
    (state: RootState) => state.dynamicForm.loading
  );
  const formFieldsError = useSelector(
    (state: RootState) => state.dynamicForm.error
  );

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      console.log('Entity Profile Step - Form data received:', formData);
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
        console.log(stepDocuments);
        const result = await dispatch(
          submitEntityProfile({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: formFields || [],
            stepDocuments: stepDocuments,
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

  // Fetch step data after form fields are loaded and rendered
  React.useEffect(() => {
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    // TEMPORARY: Use hardcoded values for testing if auth data is not available
    const testWorkflowId =
      currentWorkflowId || '19c166c7-aecd-4d0f-93cf-0ff9fa07caf7';
    const testUserId = userId || 'NO_6149';

    // console.log('🔍 Form fields state check:', {
    //   formFieldsLoading,
    //   formFieldsError,
    //   formFieldsCount: formFields?.length || 0,
    //   url,
    //   currentWorkflowId,
    //   userId,
    //   testWorkflowId,
    //   testUserId,
    //   // Debug auth state
    //   authState: {
    //     authWorkflowId,
    //     userDetails,
    //     userDetailsKeys: userDetails ? Object.keys(userDetails) : [],
    //     // Detailed userDetails breakdown
    //     userDetailsBreakdown: userDetails
    //       ? {
    //           id: userDetails.id,
    //           userId: userDetails.userId,
    //           workflowId: userDetails.workflowId,
    //           email: userDetails.email,
    //           role: userDetails.role,
    //         }
    //       : null,
    //   },
    // });

    // Only fetch step data if form fields are available (fields API has completed)
    // Use test values for now since auth data is not available
    // Add check to prevent multiple API calls
    if (
      testWorkflowId &&
      testUserId &&
      formFields &&
      formFields.length > 0 &&
      !formFieldsLoading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      // console.log(
      //   '✅ Form fields loaded, now fetching step data for entityDetails:',
      //   {
      //     stepKey: 'entityDetails',
      //     workflowId: testWorkflowId,
      //     userId: testUserId,
      //     formFieldsCount: formFields.length,
      //     usingTestValues: !currentWorkflowId || !userId,
      //   }
      // );

      stepDataFetched.current = true; // Mark as fetched to prevent loops

      dispatch(
        fetchStepData({
          stepKey: 'entityDetails',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    } else {
      // console.log(
      //   '⏳ Waiting for form fields to load before fetching step data:',
      //   {
      //     workflowId: currentWorkflowId,
      //     userId,
      //     testWorkflowId,
      //     testUserId,
      //     formFieldsAvailable: formFields?.length || 0,
      //     formFieldsLoading,
      //     formFieldsError,
      //     url,
      //   }
      // );
    }
  }, [
    dispatch,
    authWorkflowId,
    userDetails,
    formFields,
    formFieldsLoading,
    formFieldsError,
    url,
    stepDataLoading,
  ]);

  // Reset the fetch flag when component unmounts or key dependencies change
  React.useEffect(() => {
    return () => {
      stepDataFetched.current = false;
    };
  }, [authWorkflowId, userDetails?.userId]);

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

  // Show loading state during submission or step data fetching
  // if (submissionLoading || stepDataLoading) {
  //   return (
  //     <Box
  //       display="flex"
  //       flexDirection="column"
  //       alignItems="center"
  //       justifyContent="center"
  //       minHeight="200px"
  //       gap={2}
  //     >
  //       <CircularProgress size={40} />
  //       <Box>
  //         {stepDataLoading
  //           ? 'Loading form data...'
  //           : 'Submitting entity profile...'}
  //       </Box>
  //     </Box>
  //   );
  // }

  return (
    <>
      {/* Show general error if submission failed (not field-specific) */}
      {generalErrorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalErrorMessage}
        </Alert>
      )}

      {/* Dynamic Form with Field Error Context */}
      <FormErrorBoundary>
        <FieldErrorProvider fieldErrors={fieldErrors}>
          <TrackStatusDynamicForm
            onSave={handleSave}
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
          />
        </FieldErrorProvider>
      </FormErrorBoundary>
    </>
  );
};

export default EntityProfileStep;
