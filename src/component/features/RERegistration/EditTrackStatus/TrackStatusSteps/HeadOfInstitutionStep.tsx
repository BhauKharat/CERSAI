import React, { useCallback, Component, ErrorInfo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from '@mui/material';
// import { Box, Alert, CircularProgress } from '@mui/material';
// import DynamicForm from '../../DynamicForm';
import {
  submitHeadOfInstitution,
  selectHOISubmissionLoading,
  selectHOISubmissionError,
  resetSubmissionState,
} from '../../slice/headOfInstitutionSubmissionSlice';
import {
  fetchStepData,
  fetchDocument,
  selectStepDataLoading,
  selectStepData,
  selectStepDocuments,
  selectFetchedDocuments,
} from '../../slice/stepDataSlice';
import { updateFormValue } from '../../slice/formSlice';
import { FieldErrorProvider } from '../../context/FieldErrorContext';
import { HeadOfInstitutionSubmissionError } from '../../types/headOfInstitutionSubmissionTypes';
import { FormField } from '../../types/formTypes';
import type { AppDispatch, RootState } from '../../../../../redux/store';
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
    console.error('HOI form rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Head of Institution form rendering error:{' '}
          {this.state.error?.message || 'Unknown error'}
          <br />
          Please refresh the page and try again.
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface HeadOfInstitutionStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  url?: string;
}

const HeadOfInstitutionStep: React.FC<HeadOfInstitutionStepProps> = ({
  onSave,
  onNext,
  url,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Ref to track if step data has been fetched to prevent multiple calls
  const stepDataFetched = useRef(false);

  // Redux selectors for submission
  const submissionLoading = useSelector(selectHOISubmissionLoading);
  const submissionError = useSelector(selectHOISubmissionError);

  // Clear submission errors on component mount to prevent old errors from showing
  React.useEffect(() => {
    console.log('🧹 Clearing HOI submission errors on component mount');
    dispatch(resetSubmissionState());
  }, [dispatch]);

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );

  // Get form fields for dynamic validation
  const formFields = useSelector(
    (state: RootState) => state.dynamicForm.fields
  );

  // Get step data state
  const stepDataLoading = useSelector(selectStepDataLoading);
  const stepData = useSelector(selectStepData);
  const stepDocuments = useSelector(selectStepDocuments);
  const fetchedDocuments = useSelector(selectFetchedDocuments);

  // Get form state for checking if fields are loaded
  const {
    fields: dynamicFormFields,
    loading,
    error,
  } = useSelector((state: RootState) => state.dynamicForm);

  // Flatten fields for easier checking
  const flattenedFields = React.useMemo(() => {
    if (!dynamicFormFields || dynamicFormFields.length === 0) return [];
    return dynamicFormFields.flat();
  }, [dynamicFormFields]);

  // Handle form save with API submission
  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      console.log('Head of Institution Step - Form data received:', formData);
      console.log('HOI form field names:', Object.keys(formData));
      console.log(
        'HOI form field values:',
        Object.entries(formData).map(([key, value]) => ({
          field: key,
          value: value instanceof File ? `File(${value.name})` : value,
          type: typeof value,
        }))
      );

      // Filter to only include fields that are defined in the HOI form configuration
      const hoiFormData: Record<string, unknown> = {};
      const hoiFieldNames = new Set<string>();

      // Get all field names from the HOI form configuration
      if (flattenedFields && flattenedFields.length > 0) {
        flattenedFields.forEach((field) => {
          hoiFieldNames.add(field.fieldName);
          // Also add file field variants
          if (
            field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image'
          ) {
            hoiFieldNames.add(`${field.fieldName}_file`);
          }
        });
      }

      // Filter form data to only include configured HOI fields
      Object.entries(formData).forEach(([key, value]) => {
        if (hoiFieldNames.has(key)) {
          hoiFormData[key] = value;
        }
      });

      console.log('🔍 HOI configured field names:', Array.from(hoiFieldNames));
      console.log('🔍 Filtered HOI form data:', hoiFormData);
      console.log(
        '🔍 HOI field count - Original:',
        Object.keys(formData).length,
        'Configured:',
        hoiFieldNames.size,
        'Filtered:',
        Object.keys(hoiFormData).length
      );

      // Try multiple sources for workflowId and userId
      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      console.log('HOI auth state debug:', {
        authWorkflowId,
        userDetailsWorkflowId: userDetails?.workflowId,
        userDetailsUserId: userDetails?.userId,
        userDetailsId: userDetails?.id,
        finalWorkflowId: currentWorkflowId,
        finalUserId: userId,
        fullUserDetails: userDetails,
      });

      if (!currentWorkflowId || !userId) {
        console.error('Missing required data for HOI submission:', {
          workflowId: currentWorkflowId,
          userId,
          userDetails,
        });
        // alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      console.log('Submitting head of institution details with:', {
        workflowId: currentWorkflowId,
        userId,
        formDataKeys: Object.keys(formData),
      });

      try {
        // Reset previous submission state
        dispatch(resetSubmissionState());

        // Submit head of institution details
        const result = await dispatch(
          submitHeadOfInstitution({
            formValues: hoiFormData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (formFields || []) as FormField[],
          })
        ).unwrap();

        console.log('✅ Head of Institution submission successful:', result);

        // Call original onSave callback if provided
        if (onSave) {
          onSave(formData);
        }

        // Move to next step if provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Head of Institution submission failed:', error);
        // Error is already handled by Redux slice
        // Additional safety: ensure error doesn't propagate as object
        if (error && typeof error === 'object') {
          console.error(
            'HOI error object details:',
            JSON.stringify(error, null, 2)
          );
        }
      }
    },
    [
      flattenedFields,
      authWorkflowId,
      userDetails,
      dispatch,
      formFields,
      onSave,
      onNext,
    ]
  );

  // Fetch step data when form fields are loaded
  React.useEffect(() => {
    // Get auth values with fallbacks for testing
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    // Use test values if no auth data available (for development)
    const testWorkflowId =
      currentWorkflowId || 'c7b063f7-86b4-46a1-aeaa-e2aebab55747';
    const testUserId = userId || 'NO_5842';

    // Only fetch if form fields are loaded and we haven't fetched yet
    if (
      flattenedFields.length > 0 &&
      !loading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      console.log(
        '✅ Head of Institution form fields loaded, now fetching step data for hoi:',
        {
          stepKey: 'hoi',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: flattenedFields.length,
          usingTestValues: !currentWorkflowId || !userId,
        }
      );

      stepDataFetched.current = true; // Mark as fetched to prevent loops

      dispatch(
        fetchStepData({
          stepKey: 'hoi',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    } else {
      console.log(
        '⏳ Waiting for HOI form fields to load before fetching step data:',
        {
          workflowId: currentWorkflowId,
          userId,
          testWorkflowId,
          testUserId,
          flattenedFieldsAvailable: flattenedFields?.length || 0,
          loading,
          error,
        }
      );
    }
  }, [
    dispatch,
    authWorkflowId,
    userDetails,
    flattenedFields,
    loading,
    error,
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
      console.log(
        'Populating head of institution form fields with step data:',
        stepData.data
      );

      // Populate each field from step data
      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          console.log(`Setting HOI field ${fieldName} = ${fieldValue}`);
          // Convert value to string for form compatibility
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          dispatch(updateFormValue({ fieldName, value: stringValue }));
        }
      });

      // Log documents if available
      if (stepDocuments && stepDocuments.length > 0) {
        console.log('Available HOI documents:', stepDocuments);
      }
    }
  }, [dispatch, stepData, stepDocuments]);

  // Fetch documents when step documents are available (HOI documents only)
  React.useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      // Filter to only fetch HOI-related documents
      const hoiDocuments = stepDocuments.filter(
        (doc) =>
          doc.type.startsWith('hoi') ||
          doc.type.startsWith('HOI') ||
          ['boardResolution', 'identityProof', 'employeeCode'].includes(
            doc.type
          )
      );

      console.log('🔍 All documents available:', stepDocuments.length);
      console.log('🔍 HOI documents to fetch:', hoiDocuments.length);
      console.log(
        '🔍 HOI document types to fetch:',
        hoiDocuments.map((doc) => doc.type)
      );

      hoiDocuments.forEach((doc) => {
        // Only fetch if not already fetched (handle undefined fetchedDocuments)
        if (!fetchedDocuments || !fetchedDocuments[doc.id]) {
          console.log(`🔄 Fetching HOI document: ${doc.id} (${doc.type})`);
          dispatch(fetchDocument(doc.id));
        } else {
          console.log(`✅ HOI document already fetched: ${doc.id}`);
        }
      });
    }
  }, [dispatch, stepDocuments, fetchedDocuments]);

  // Create a mapping of document types to field names for the form (HOI documents only)
  const documentFieldMapping = React.useMemo(() => {
    const mapping: Record<string, string> = {};

    // Filter to only include HOI-related documents
    const hoiDocuments =
      stepDocuments?.filter(
        (doc) =>
          doc.type.startsWith('hoi') ||
          doc.type.startsWith('HOI') ||
          // Add specific HOI document types if they don't follow the naming convention
          ['boardResolution', 'identityProof', 'employeeCode'].includes(
            doc.type
          )
      ) || [];

    console.log('🔍 All step documents:', stepDocuments?.length || 0);
    console.log('🔍 Filtered HOI documents:', hoiDocuments.length);
    console.log(
      '🔍 HOI document types:',
      hoiDocuments.map((doc) => doc.type)
    );

    if (hoiDocuments.length > 0) {
      hoiDocuments.forEach((doc) => {
        // Map document types to their corresponding field names
        switch (doc.type) {
          case 'hoiProofOfIdentityNumber_file':
            mapping['hoiProofOfIdentityNumber_file'] = doc.id;
            break;
          case 'hoiEmployCode_file':
            mapping['hoiEmployCode_file'] = doc.id;
            break;
          case 'hoiEmployCodeFile':
            mapping['hoiEmployCodeFile'] = doc.id;
            break;
          case 'hoiBoardResolution':
            mapping['hoiBoardResolution'] = doc.id;
            break;
          default:
            // For any other HOI document types, use the type as field name
            if (doc.type.startsWith('hoi') || doc.type.startsWith('HOI')) {
              mapping[doc.fieldKey] = doc.id;
            }
        }
      });
    }

    console.log('📋 HOI document field mapping created:', mapping);
    return mapping;
  }, [stepDocuments]);

  // Extract field errors if submission error is a field validation error
  const fieldErrors = React.useMemo(() => {
    if (
      submissionError &&
      typeof submissionError === 'object' &&
      'type' in submissionError &&
      (submissionError as HeadOfInstitutionSubmissionError).type ===
        'FIELD_VALIDATION_ERROR'
    ) {
      return (
        (submissionError as HeadOfInstitutionSubmissionError).fieldErrors || {}
      );
    }
    return {};
  }, [submissionError]);

  // Get general error message (non-field specific)
  const generalErrorMessage = React.useMemo(() => {
    if (!submissionError) return null;

    if (typeof submissionError === 'string') {
      return submissionError;
    }

    if (typeof submissionError === 'object' && 'message' in submissionError) {
      const errorObj = submissionError as HeadOfInstitutionSubmissionError;
      // Only show general message for non-field validation errors
      if (errorObj.type !== 'FIELD_VALIDATION_ERROR') {
        return errorObj.message;
      }
    }

    return null;
  }, [submissionError]);

  // Filter fetchedDocuments to only include HOI documents
  const filteredHoiDocuments = React.useMemo(() => {
    if (!fetchedDocuments) return {};

    const hoiDocumentIds =
      stepDocuments
        ?.filter(
          (doc) =>
            doc.type.startsWith('hoi') ||
            doc.type.startsWith('HOI') ||
            ['boardResolution', 'identityProof', 'employeeCode'].includes(
              doc.type
            )
        )
        .map((doc) => doc.id) || [];

    const filteredDocs: Record<string, unknown> = {};
    hoiDocumentIds.forEach((docId) => {
      if (fetchedDocuments[docId]) {
        filteredDocs[docId] = fetchedDocuments[docId];
      }
    });

    console.log(
      '🔍 Filtered HOI fetched documents:',
      Object.keys(filteredDocs).length
    );
    return filteredDocs;
  }, [fetchedDocuments, stepDocuments]);

  // Show loading state during submission
  // if (submissionLoading) {
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
  //       <Box>Submitting head of institution details...</Box>
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
            existingDocuments={filteredHoiDocuments}
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

export default HeadOfInstitutionStep;
