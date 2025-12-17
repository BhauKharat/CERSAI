import React, { useCallback, Component, ErrorInfo, useEffect, useRef, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, CircularProgress } from '@mui/material';
import DynamicForm from '../DynamicForm';
import PageLoader from '../CommonComponent/PageLoader';
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
import { API_URL_REINITILIZE } from '../../../../Constant';

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
  onPrevious?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const FrontendNodalOfficerStep: React.FC<FrontendNodalOfficerStepProps> = ({
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
          stepKey: 'nodalOfficer',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: frontendFields.length,
        }
      );

      stepDataFetched.current = true;
      dispatch(
        fetchStepData({
          stepKey: 'nodalOfficer',
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

  // Field name mapping from API response to frontend config field names
  // API returns fields without "no" prefix, but frontend config uses "no" prefix
  const apiToFrontendFieldMap: Record<string, string> = {
    // Personal fields - API uses no prefix, frontend uses "no" prefix
    citizenship: 'noCitizenship',
    ckycNumber: 'noCkycNumber',
    title: 'noTitle',
    firstName: 'noFirstName',
    middleName: 'noMiddleName',
    lastName: 'noLastName',
    gender: 'noGender',
    dob: 'noDob',
    designation: 'noDesignation',
    employCode: 'noEmployCode',
    email: 'noEmail',
    countryCode: 'noCountryCode',
    phoneNumber: 'noMobileNumber',
    mobileNumber: 'noMobileNumber',
    landline: 'noLandline',
    // Office Address
    officeAddress: 'noOfficeAddress',
    noOfficeAddress: 'noOfficeAddress',
    // Address fields - these already have "no" prefix in API
    noAddressLine1: 'noAddressLine1',
    noAddressLine2: 'noAddressLine2',
    noAddressLine3: 'noAddressLine3',
    noRegisterCountry: 'noRegisterCountry',
    noRegisterState: 'noRegisterState',
    noRegisterDistrict: 'noRegisterDistrict',
    noRegisterCity: 'noRegisterCity',
    noRegisterPincode: 'noRegisterPincode',
    noRegisterPincodeOther: 'noRegisterPincodeOther',
    noRegisterDigipin: 'noRegisterDigipin',
    // Proof of Identity fields
    proofOfIdentity: 'noProofOfIdentity',
    noProofOfIdentity: 'noProofOfIdentity',
    proofOfIdentityNumber: 'noProofOfIdentityNumber',
    noProofOfIdentityNumber: 'noProofOfIdentityNumber',
    // Board Resolution fields
    boardResoluationDate: 'noBoardResoluationDate',
    noBoardResoluationDate: 'noBoardResoluationDate',
    boardResoluation: 'noBoardResoluation',
    noBoardResoluation: 'noBoardResoluation',
  };

  // State for storing fetched address data
  const [addressData, setAddressData] = useState<Record<string, any> | null>(null);
  const addressDataFetched = useRef(false);

  // Fetch address data for office address population
  const fetchAddressData = useCallback(async () => {
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;
    
    const testWorkflowId = currentWorkflowId || '19c166c7-aecd-4d0f-93cf-0ff9fa07caf7';
    const testUserId = userId || 'NO_6149';

    if (addressDataFetched.current) {
      return addressData;
    }

    try {
      console.log('🏠 Fetching address data for office address population...');
      const response = await fetch(
        `${API_URL_REINITILIZE}/api/v1/registration/step-data?stepKey=addresses&workflowId=${testWorkflowId}&userId=${testUserId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const fetchedAddressData = result?.data?.data?.step?.data || {};
        console.log('📍 Fetched address data:', fetchedAddressData);
        setAddressData(fetchedAddressData);
        addressDataFetched.current = true;
        return fetchedAddressData;
      } else {
        console.error('Failed to fetch address data:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching address data:', error);
      return null;
    }
  }, [authWorkflowId, userDetails, addressData]);

  // Populate office address fields based on selected option
  const populateOfficeAddress = useCallback(async (selectedOption: string) => {
    console.log('🏢 Office Address selected:', selectedOption);
    
    let fetchedData = addressData;
    if (!fetchedData) {
      fetchedData = await fetchAddressData();
    }

    if (!fetchedData) {
      console.warn('⚠️ No address data available to populate office address');
      return;
    }

    // Define field mapping based on selected option
    let sourcePrefix: string;
    if (selectedOption === 'Same as registered address') {
      sourcePrefix = 'register';
    } else if (selectedOption === 'Same as correspondence address') {
      sourcePrefix = 'correspondence';
    } else {
      return;
    }

    // Map source address fields to nodal officer address fields
    const fieldMappings: Record<string, string> = {
      [`${sourcePrefix}Line1`]: 'noAddressLine1',
      [`${sourcePrefix}Line2`]: 'noAddressLine2',
      [`${sourcePrefix}Line3`]: 'noAddressLine3',
      [`${sourcePrefix}Country`]: 'noRegisterCountry',
      [`${sourcePrefix}State`]: 'noRegisterState',
      [`${sourcePrefix}District`]: 'noRegisterDistrict',
      [`${sourcePrefix}City`]: 'noRegisterCity',
      [`${sourcePrefix}Pincode`]: 'noRegisterPincode',
      [`${sourcePrefix}Digipin`]: 'noRegisterDigipin',
    };

    console.log(`📋 Populating office address from ${sourcePrefix} address...`);
    
    // Populate the fields (with null check for fetchedData)
    if (fetchedData) {
      // Assign to a const to help TypeScript narrow the type inside the callback
      const data = fetchedData;
      Object.entries(fieldMappings).forEach(([sourceField, targetField]) => {
        const value = data[sourceField];
        if (value !== null && value !== undefined && value !== '') {
          console.log(`  Setting ${targetField} = ${value}`);
          dispatch(updateFormValue({ fieldName: targetField, value: String(value) }));
        }
      });
    }
  }, [addressData, fetchAddressData, dispatch]);

  // Special dropdown handlers for office address
  const specialDropdownHandlers = useMemo(() => ({
    noOfficeAddress: (value: string) => {
      populateOfficeAddress(value);
    },
  }), [populateOfficeAddress]);

  // Populate form fields when step data is loaded
  React.useEffect(() => {
    if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
      console.log('Populating Nodal Officer form fields with step data:', stepData.data);

      Object.entries(stepData.data).forEach(([apiFieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          // Map API field name to frontend field name
          const frontendFieldName = apiToFrontendFieldMap[apiFieldName] || apiFieldName;
          
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          
          console.log(`Mapping field: ${apiFieldName} -> ${frontendFieldName} = ${stringValue}`);
          dispatch(updateFormValue({ fieldName: frontendFieldName, value: stringValue }));
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
    <>
      {/* Page-level loader for form submission */}
      <PageLoader open={submissionLoading as boolean} message="Submitting form, please wait..." />

      <FormErrorBoundary>
        <FieldErrorProvider>
          <DynamicForm
            onSave={handleSave}
            onPrevious={onPrevious}
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
            specialDropdownHandlers={specialDropdownHandlers}
          />
        </FieldErrorProvider>
      </FormErrorBoundary>
    </>
  );
};

export default FrontendNodalOfficerStep;

