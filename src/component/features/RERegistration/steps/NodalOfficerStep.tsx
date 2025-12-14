/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  Component,
  ErrorInfo,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from '@mui/material';
// import { Box, Alert, CircularProgress } from '@mui/material';
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
} from '../slice/stepDataSlice';
import {
  updateFormValue,
  // selectFormValues,
  // fetchDropdownOptions,
} from '../slice/formSlice';
import { FieldErrorProvider } from '../context/FieldErrorContext';
import { NodalOfficerSubmissionError } from '../types/nodalOfficerSubmissionTypes';
import { FormField } from '../types/formTypes';
import type { AppDispatch, RootState } from '../../../../redux/store';
// import { processGeographicalFields } from '../utils/geographicalDataUtils';
import { selectFormValues, fetchDropdownOptions } from '../slice/formSlice';
import { processGeographicalFields } from '../utils/geographicalDataUtils';

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
    console.error(
      'Nodal Officer Step Error Boundary caught an error:',
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          Something went wrong while rendering the Nodal Officer form. Please
          refresh the page.
          {this.state.error && (
            <details style={{ marginTop: '8px' }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: '12px', marginTop: '4px' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface NodalOfficerStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const NodalOfficerStep: React.FC<NodalOfficerStepProps> = ({
  onSave,
  onNext,
  url,
  onValidationChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Ref to track if step data has been fetched to prevent multiple calls
  const stepDataFetched = useRef(false);

  // State to track which fields are auto-populated and should be disabled
  // const [disabledFields, setDisabledFields] = React.useState<Set<string>>(
  //   new Set()
  // );

  // Get auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );

  // Get form fields for validation
  const formFields = useSelector(
    (state: RootState) => state.dynamicForm.fields
  );

  // Get submission state
  const isLoading = useSelector(selectNodalOfficerSubmissionLoading);
  const submissionError = useSelector(selectNodalOfficerSubmissionError);

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

  // Get form values for geographical processing
  const formValues = useSelector(selectFormValues);

  // Flatten fields for easier checking
  const flattenedFields = React.useMemo(() => {
    if (!dynamicFormFields || dynamicFormFields.length === 0) return [];
    return dynamicFormFields.flat();
  }, [dynamicFormFields]);

  // Handle form save with API submission
  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      console.log('Nodal Officer Step - Form data received:', formData);
      console.log('Nodal Officer form field names:', Object.keys(formData));
      console.log(
        'Nodal Officer form field values:',
        Object.entries(formData).map(([key, value]) => ({
          field: key,
          value: value instanceof File ? `File(${value.name})` : value,
          type: typeof value,
        }))
      );

      // Try multiple sources for workflowId and userId
      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      console.log('Nodal Officer auth state debug:', {
        authWorkflowId,
        userDetailsWorkflowId: userDetails?.workflowId,
        userDetailsUserId: userDetails?.userId,
        userDetailsId: userDetails?.id,
        finalWorkflowId: currentWorkflowId,
        finalUserId: userId,
        fullUserDetails: userDetails,
      });

      if (!currentWorkflowId || !userId) {
        console.error('Missing required data for nodal officer submission:', {
          workflowId: currentWorkflowId,
          userId,
          userDetails,
        });
        alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      console.log('Submitting nodal officer details with:', {
        workflowId: currentWorkflowId,
        userId,
        formDataKeys: Object.keys(formData),
      });

      try {
        // Reset previous submission state
        dispatch(resetSubmissionState());

        // Submit nodal officer details
        const result = await dispatch(
          submitNodalOfficer({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (formFields || []) as FormField[],
          })
        ).unwrap();

        console.log('✅ Nodal Officer submission successful:', result);

        // Call original onSave callback if provided
        if (onSave) {
          onSave(formData);
        }

        // Move to next step if provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Nodal Officer submission failed:', error);
        // Error is already handled by Redux slice
        // Additional safety: ensure error doesn't propagate as object
        if (error && typeof error === 'object') {
          console.error(
            'Nodal Officer error object details:',
            JSON.stringify(error, null, 2)
          );
        }
      }
    },
    [dispatch, userDetails, authWorkflowId, formFields, onSave, onNext]
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
        '✅ Nodal Officer form fields loaded, now fetching step data for nodalOfficer:',
        {
          stepKey: 'nodalOfficer',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: flattenedFields.length,
          usingTestValues: !currentWorkflowId || !userId,
        }
      );

      stepDataFetched.current = true; // Mark as fetched to prevent loops

      dispatch(
        fetchStepData({
          stepKey: 'nodalOfficer',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    } else {
      console.log(
        '⏳ Waiting for nodal officer form fields to load before fetching step data:',
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
        'Populating nodal officer form fields with step data:',
        stepData.data
      );

      // Populate each field from step data
      const fieldNameMap: Record<string, string> = {
        firstName: 'noFirstName',
        lastName: 'noLastName',
        middleName: 'noMiddleName',
        phoneNumber: 'noMobileNumber',
        title: 'noTitle',
        citizenship: 'noCitizenship',
        countryCode: 'noCountryCode',
        email: 'noEmail',
        gender: 'noGender',
        ckycNo: 'noCkycNumber',
        ckycNumber: 'noCkycNumber',
      };

      // Check if Office Address was previously saved
      const savedOfficeAddress = stepData.data['noOfficeAddress'];
      const officeAddressStr = savedOfficeAddress ? String(savedOfficeAddress) : '';
      const hasOfficeAddressSelection = officeAddressStr && 
        officeAddressStr !== '' && 
        officeAddressStr.toLowerCase() !== 'enter office address';

      console.log('🏢 Office Address check:', {
        savedOfficeAddress,
        hasOfficeAddressSelection,
      });

      // Define address-related fields (excluding the dropdown itself)
      const addressFields = [
        'noAddresLine1',
        'noAddresLine2', 
        'noAddresLine3',
        'noAddressLine1',
        'noAddressLine2',
        'noAddressLine3',
        'noRegisterCity',
        'noRegisterState',
        'noRegisterCountry',
        'noRegisterDistrict',
        'noRegisterPincode',
        'noRegisterPincodeOther',
        'noCity',
        'noState',
        'noCountry',
        'noDistrict',
        'noPincode',
        'noPincodeOther',
        'noDigipin',
        // Also check for fields without 'no' prefix that might come from API
        'addressLine1',
        'addressLine2',
        'addressLine3',
        'registerCity',
        'registerState',
        'registerCountry',
        'registerDistrict',
        'registerPincode',
        'registerPincodeOther',
        'city',
        'state',
        'country',
        'district',
        'pincode',
        'pincodeOther',
        'digipin',
      ];

      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          const targetFieldName = fieldNameMap[fieldName] || fieldName;
          
          // Skip address fields ONLY if there's NO saved Office Address selection
          // If user previously selected "Same as register" or "Same as correspondence", 
          // we should restore those address fields
          if (addressFields.includes(targetFieldName) && !hasOfficeAddressSelection) {
            console.log(
              `⏭️ Skipping address field (no Office Address selection): ${targetFieldName}`
            );
            return;
          }

          console.log(
            `Setting nodal officer field ${fieldName} = ${fieldValue}`
          );
          // Convert value to string for form compatibility
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          
          dispatch(
            updateFormValue({ fieldName: targetFieldName, value: stringValue })
          );

          // Mark this field as auto-populated to disable it in the UI
          // dispatch(
          //   updateFormValue({
          //     fieldName: `${targetFieldName}_autoPopulated`,
          //     value: 'true',
          //   })
          // );

          // If CKYC number is present, set a verified flag to drive UI disabling
          // if (targetFieldName === 'noCkycNumber') {
          dispatch(
            updateFormValue({
              fieldName: 'noCkycNumber_autoPopulated',
              value: 'true',
            })
          );
          // }
        }
      });

      // Map noRegister* values to register* equivalents for geo utilities
      const nrCountry = stepData.data['noRegisterCountry'];
      const nrState = stepData.data['noRegisterState'];
      const nrDistrict = stepData.data['noRegisterDistrict'];
      const nrPincode = stepData.data['noRegisterPincode'];
      if (nrCountry) {
        dispatch(
          updateFormValue({
            fieldName: 'registerCountry',
            value: String(nrCountry),
          })
        );
      }
      if (nrState) {
        dispatch(
          updateFormValue({
            fieldName: 'registerState',
            value: String(nrState),
          })
        );
      }
      if (nrDistrict) {
        dispatch(
          updateFormValue({
            fieldName: 'registerDistrict',
            value: String(nrDistrict),
          })
        );
      }
      if (nrPincode) {
        dispatch(
          updateFormValue({
            fieldName: 'registerPincode',
            value: String(nrPincode),
          })
        );
      }

      // Log documents if available
      if (stepDocuments && stepDocuments.length > 0) {
        console.log('Available nodal officer documents:', stepDocuments);
      }

      // Process geographical fields using common utility only when geo values exist
      const hasGeoValues = Boolean(
        nrCountry || nrState || nrDistrict || nrPincode
      );
      if (hasGeoValues) {
        processGeographicalFields(
          flattenedFields,
          stepData,
          formValues,
          dispatch,
          fetchDropdownOptions
        );
      } else {
        console.log(
          '⏭️ Skipping geo dropdown API calls for Nodal Officer - no country/state/district/pincode data found'
        );
      }
    }
  }, [dispatch, stepData, stepDocuments]);

  // Always set default value for Office Address dropdown to "Enter office address"
  // This allows users to choose to re-enter address even if they have saved data
  React.useEffect(() => {
    // Wait for fields to be loaded
    if (flattenedFields.length === 0) return;

    const officeAddressField = flattenedFields.find(
      (f) => f.fieldName === 'noOfficeAddress'
    );

    if (!officeAddressField) return;

    const currentValue = formValues['noOfficeAddress'];

    console.log('🔍 Checking Office Address default value...', {
      fieldsLoaded: true,
      currentValue,
      willSetDefault: !currentValue || currentValue === '',
    });

    // Always set to "Enter office address" if field is empty
    // This gives users the choice to re-enter address even if they have saved data
    if (!currentValue || currentValue === '') {
      console.log(
        '🏢 Setting default Office Address to "Enter office address"'
      );
      dispatch(
        updateFormValue({
          fieldName: 'noOfficeAddress',
          value: 'Enter office address',
        })
      );
    }
  }, [flattenedFields, formValues, dispatch]);

  // Monitor Office Address dropdown and manage disabled fields
  // React.useEffect(() => {
  //   const officeAddressValue = formValues['noOfficeAddress'];

  //   console.log('🔒 Checking if fields should be disabled...', {
  //     officeAddressValue,
  //   });

  //   // Define the fields that should be disabled when auto-populated
  //   const addressFields = [
  //     'noAddresLine1',
  //     'noAddresLine2',
  //     'noAddresLine3',
  //     'noRegisterCity',
  //     'noRegisterState',
  //     'noRegisterCountry',
  //     'noRegisterDistrict',
  //     'noRegisterPincode',
  //     'noRegisterPincodeOther',
  //   ];

  //   if (
  //     officeAddressValue === 'Same as register address' ||
  //     officeAddressValue === 'Same as correspondence address'
  //   ) {
  //     // Disable fields when auto-fill is selected - they will be populated
  //     console.log('🔒 Disabling auto-populated address fields');
  //     setDisabledFields(new Set(addressFields));
  //   } else if (officeAddressValue === 'Enter office address') {
  //     // Enable fields when "Enter office address" is selected
  //     console.log('🔓 Enabling address fields for manual entry');
  //     setDisabledFields(new Set());
  //   }
  // }, [formValues]);

  // Function to check if a field should be disabled
  // const getFieldDisabled = React.useCallback(
  //   (fieldName: string): boolean => {
  //     return disabledFields.has(fieldName);
  //   },
  //   [disabledFields]
  // );

  // Fetch documents when step documents are available
  React.useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      console.log(
        'Fetching documents for nodal officer step data:',
        stepDocuments
      );
      console.log('Current fetched documents:', fetchedDocuments);

      stepDocuments.forEach((doc) => {
        // Only fetch if not already fetched (handle undefined fetchedDocuments)
        if (!fetchedDocuments || !fetchedDocuments[doc.id]) {
          console.log(
            `🔄 Fetching nodal officer document: ${doc.id} (${doc.type})`
          );
          dispatch(fetchDocument(doc.id));
        } else {
          console.log(`✅ Nodal officer document already fetched: ${doc.id}`);
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
        // Try multiple possible field name variations for each document type
        // switch (doc.type) {
        //   case 'noRoardResoluation':
        //     mapping['noRoardResoluation'] = doc.id;
        //     mapping['noBoardResolution'] = doc.id; // Alternative field name
        //     break;
        //   case 'noEmployCode_file':
        //     mapping['noEmployCode_file'] = doc.id; // Original
        //     mapping['noEmployCode'] = doc.id; // Without _file suffix
        //     mapping['noEmployCodeFile'] = doc.id; // CamelCase version
        //     break;
        //   case 'noProofOfIdentityNumber_file':
        //     mapping['noProofOfIdentityNumber_file'] = doc.id; // Original
        //     mapping['noProofOfIdentityNumber'] = doc.id; // Without _file suffix
        //     mapping['noProofOfIdentityNumberFile'] = doc.id; // CamelCase version
        //     break;
        //   case 'noEmployCodeFile':
        //     mapping['noEmployCodeFile'] = doc.id; // Original
        //     mapping['noEmployCode_file'] = doc.id; // Snake_case version
        //     mapping['noEmployCode'] = doc.id; // Without File suffix
        //     break;
        //   default:
        // For any other document types, use the type as field name
        mapping[doc.fieldKey] = doc.id;
        // }
      });
    }

    console.log('📋 Nodal Officer document field mapping created:', mapping);
    console.log('📋 Nodal Officer step documents:', stepDocuments);
    // console.log('📋 Nodal Officer fetched documents:', fetchedDocuments);
    return mapping;
  }, [stepDocuments]);

  // Extract field errors if submission error is a field validation error
  const fieldErrors = useMemo(() => {
    console.log('🔍 NodalOfficer submissionError:', submissionError);
    console.log(
      '🔍 NodalOfficer submissionError type:',
      typeof submissionError
    );

    if (
      submissionError &&
      typeof submissionError === 'object' &&
      'type' in submissionError &&
      (submissionError as NodalOfficerSubmissionError).type ===
        'FIELD_VALIDATION_ERROR'
    ) {
      const fieldErrors =
        (submissionError as NodalOfficerSubmissionError).fieldErrors || {};
      console.log('🔍 NodalOfficer extracted fieldErrors:', fieldErrors);
      return fieldErrors;
    }
    console.log(
      '🔍 NodalOfficer no field errors extracted, returning empty object'
    );
    return {};
  }, [submissionError]);

  // Get general error message (non-field specific)
  const generalErrorMessage = useMemo(() => {
    if (!submissionError) return null;

    if (typeof submissionError === 'string') {
      return submissionError;
    }

    if (typeof submissionError === 'object' && 'message' in submissionError) {
      const errorObj = submissionError as NodalOfficerSubmissionError;
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

  // Show loading state during submission
  // if (isLoading) {
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
  //       <Box>Submitting nodal officer details...</Box>
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
          <DynamicForm
            onSave={handleSave}
            urlDynamic={url}
            existingDocuments={fetchedDocuments}
            documentFieldMapping={documentFieldMapping}
            loading={isLoading}
            hasStepData={
              !!(
                stepData &&
                stepData.data &&
                Object.keys(stepData.data).length > 0
              )
            }
            // getFieldDisabled={getFieldDisabled}
            onValidationChange={onValidationChange}
          />
        </FieldErrorProvider>
      </FormErrorBoundary>
    </>
  );
};

export default NodalOfficerStep;
