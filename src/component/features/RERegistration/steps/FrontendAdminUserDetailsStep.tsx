/* eslint-disable */
import React, {
  useCallback,
  Component,
  ErrorInfo,
  useEffect,
  useRef,
  useMemo,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, CircularProgress } from '@mui/material';
import type { AppDispatch, RootState } from '../../../../redux/store';
import DynamicExpandCollapseForm from '../DynamicExpandCollapseForm';
import PageLoader from '../CommonComponent/PageLoader';
import {
  submitAdminUserDetails,
  selectAdminUserSubmissionLoading,
  selectAdminUserSubmissionError,
  resetSubmissionState,
} from '../slice/adminUserDetailsSubmissionSlice';
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
import { FieldErrorProvider } from '../context/FieldErrorContext';
import { AdminUserDetailsSubmissionError } from '../types/adminUserDetailsSubmissionTypes';
import { buildValidationSchema } from '../../../../utils/formValidation';
// Frontend configuration imports
import { useFrontendFormConfig } from '../frontendConfig/utils/useFrontendFormConfig';
import { adminUserDetailsConfig } from '../frontendConfig/configs/adminUserDetailsConfig';
import { FormField } from '../types/formTypes';
import { processGeographicalFields } from '../utils/geographicalDataUtils';
import {
  fetchAdminUserDropdownOptions,
  selectAdminUserDetailsDropdownOptions,
  setVerifiedSections,
  addVerifiedSection,
  updateSectionDataHash,
  selectAdminUserDetailsVerifiedSections,
  selectAdminUserDetailsSectionDataHashes,
} from '../slice/adminUserDetailsSlice';
import OTPVerificationModal from '../../../ui/Modal/OTPVerificationModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import { OTPSend } from '../../Authenticate/slice/authSlice';
import { Secured } from '../../../../utils/HelperFunctions/api';

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
    console.error('Admin User form rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Admin User form rendering error:{' '}
          {this.state.error?.message || 'Unknown error'}
          <br />
          Please refresh the page and try again.
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface FrontendAdminUserDetailsStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const FrontendAdminUserDetailsStep: React.FC<FrontendAdminUserDetailsStepProps> = ({
  onSave,
  onNext,
  onPrevious,
  onValidationChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Use frontend form configuration instead of API
  const {
    fields: frontendFields,
    configuration: frontendConfig,
    groupedFields: frontendGroupedFields,
    loading: configLoading,
    error: configError,
  } = useFrontendFormConfig(adminUserDetailsConfig);

  // Redux selectors
  const submissionLoading = useSelector(selectAdminUserSubmissionLoading);
  const submissionError = useSelector(selectAdminUserSubmissionError);

  // Clear submission errors on component mount
  React.useEffect(() => {
    console.log('🧹 Clearing Admin User submission errors on component mount');
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
  // Add a ref to track if geographical fields have been processed
  const geoFieldsProcessed = React.useRef(false);

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );

  // Get form fields and values from Redux (now populated from frontend config)
  const formFields = useSelector(
    (state: RootState) => state.dynamicForm.fields
  );
  const formValues = useSelector(
    (state: RootState) => state.dynamicForm.formValues
  );

  // Get dynamically fetched dropdown options from Redux
  const reduxDropdownOptions = useSelector(selectAdminUserDetailsDropdownOptions);

  // Get verified sections and data hashes from Redux
  const reduxVerifiedSections = useSelector(selectAdminUserDetailsVerifiedSections);
  const reduxSectionDataHashes = useSelector(selectAdminUserDetailsSectionDataHashes);

  // Convert Redux array to Set for compatibility
  const verifiedSections = useMemo(
    () => new Set<string>(reduxVerifiedSections),
    [reduxVerifiedSections]
  );
  const sectionDataHashes = useMemo(
    () => reduxSectionDataHashes,
    [reduxSectionDataHashes]
  );

  // Local state for validation
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [clearKey, setClearKey] = useState<number>(0);

  // OTP verification state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [, setOtpSendLoading] = useState(false);
  const [currentValidatingSection, setCurrentValidatingSection] = useState<{
    sectionName: string;
    sectionIndex: number;
  } | null>(null);
  const [pendingOtpData, setPendingOtpData] = useState<string>('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Base fields from config (stable, doesn't change with dropdown options)
  // Used for geographical field processing to avoid infinite loops
  const baseFields = useMemo(() => {
    let fields: any[] = [];
    if (frontendGroupedFields) {
      fields = Object.values(frontendGroupedFields).flatMap(
        (group) => group.fields
      );
    } else if (frontendFields) {
      fields = frontendFields;
    }
    // Map fields to ensure compatibility but WITHOUT merging dropdown options
    return fields.map((field) => ({
      ...field,
      fieldPlaceholder: field.fieldPlaceholder || '',
      fieldOptions: (field.fieldOptions || []).map((opt: any) => ({
        label: opt.name || opt.label || opt.code || '',
        value: opt.code || opt.value || opt.name || '',
      })),
      validationRules: field.validationRules || null,
      isRequired: field.isRequired ?? false,
      defaultValue: field.defaultValue ?? null,
      helpText: field.helpText ?? null,
      fieldGroup: field.fieldGroup || '',
      conditionalLogic: field.conditionalLogic || null,
      cssClasses: field.cssClasses || null,
      fieldAttributes: field.fieldAttributes || null,
      createdAt: field.createdAt || '',
      updatedAt: field.updatedAt || '',
    }));
  }, [frontendGroupedFields, frontendFields]);

  // Flatten grouped fields for validation and dependent dropdown support
  // This merges in dropdown options from Redux for rendering
  const flattenedFields = useMemo(() => {
    // Merge in any dropdown options fetched from Redux (for dependent dropdowns)
    return baseFields.map((field) => {
      // Check if there are fetched options for this field in Redux
      const fetchedOptions = reduxDropdownOptions?.[field.id];
      
      // Use fetched options if available, otherwise use config options
      if (fetchedOptions && fetchedOptions.length > 0) {
        return {
          ...field,
          fieldOptions: fetchedOptions.map((opt: any) => ({
            label: opt.name || opt.label || opt.code || '',
            value: opt.code || opt.value || opt.name || '',
          })),
        };
      }
      
      return field;
    });
  }, [baseFields, reduxDropdownOptions]);

  // Create merged grouped fields with fetched dropdown options
  const mergedGroupedFields = useMemo(() => {
    if (!frontendGroupedFields) return undefined;
    
    const merged: Record<string, { label: string; fields: any[] }> = {};
    
    Object.entries(frontendGroupedFields).forEach(([groupKey, group]) => {
      merged[groupKey] = {
        label: group.label,
        fields: group.fields.map((field: any) => {
          // Check if there are fetched options for this field in Redux
          const fetchedOptions = reduxDropdownOptions?.[field.id];
          
          // Use fetched options if available, otherwise use config options
          let fieldOptions = field.fieldOptions || [];
          if (fetchedOptions && fetchedOptions.length > 0) {
            fieldOptions = fetchedOptions;
          }
          
          return {
            ...field,
            fieldPlaceholder: field.fieldPlaceholder || '',
            fieldOptions: fieldOptions.map((opt: any) => ({
              label: opt.name || opt.label || opt.code || '',
              value: opt.code || opt.value || opt.name || '',
            })),
          };
        }),
      };
    });
    
    return merged;
  }, [frontendGroupedFields, reduxDropdownOptions]);

  // Create validation schema from fields
  const validationSchema = useMemo(() => {
    if (!flattenedFields || flattenedFields.length === 0) {
      return null;
    }
    return buildValidationSchema(flattenedFields as FormField[]);
  }, [flattenedFields]);

  // State for storing fetched address data for office address population
  const [addressData, setAddressData] = useState<Record<string, any> | null>(null);
  const addressDataFetched = useRef(false);

  // Fetch address data for office address population
  const fetchAddressData = useCallback(async () => {
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;
    
    const testWorkflowId = currentWorkflowId || '19c166c7-aecd-4d0f-93cf-0ff9fa07caf7';
    const testUserId = userId || 'NO_6149';

    if (addressDataFetched.current && addressData) {
      return addressData;
    }

    try {
      console.log('🏠 Fetching address data for admin office address population...');
      // Use Secured.get which automatically adds authorization token
      const response = await Secured.get(
        `/api/v1/registration/step-data?stepKey=addresses&workflowId=${testWorkflowId}&userId=${testUserId}`
      );

      if (response?.data) {
        // API response structure: response.data.data.data.step.data
        const fetchedAddressData = response?.data?.data?.data?.step?.data || {};
        console.log('📍 Fetched address data for admin:', fetchedAddressData);
        setAddressData(fetchedAddressData);
        addressDataFetched.current = true;
        return fetchedAddressData;
      } else {
        console.error('Failed to fetch address data');
        return null;
      }
    } catch (error) {
      console.error('Error fetching address data:', error);
      return null;
    }
  }, [authWorkflowId, userDetails, addressData]);

  // Populate admin office address fields based on selected option
  const populateAdminOfficeAddress = useCallback(async (adminNumber: 1 | 2, selectedOption: string) => {
    console.log(`🏢 Admin ${adminNumber} Office Address selected:`, selectedOption);
    
    let fetchedData = addressData;
    if (!fetchedData) {
      fetchedData = await fetchAddressData();
    }

    if (!fetchedData) {
      console.warn('⚠️ No address data available to populate admin office address');
      return;
    }

    // Define source prefix based on selected option
    let sourcePrefix: string;
    if (selectedOption === 'Same as registered address') {
      sourcePrefix = 'register';
    } else if (selectedOption === 'Same as correspondence address') {
      sourcePrefix = 'correspondence';
    } else {
      return;
    }

    // Define target prefix for address line fields based on admin number
    const addressLinePrefix = adminNumber === 1 ? 'iauAddressLineOne' : 'iauAddressLineTwo';
    const suffix = adminNumber.toString();

    console.log(`📋 Populating Admin ${adminNumber} office address from ${sourcePrefix} address...`);
    console.log('📋 Available data keys:', Object.keys(fetchedData));
    
    // All address fields are now text fields - set them immediately
    if (fetchedData) {
      const data = fetchedData;
      
      // All field mappings (all are text fields now)
      const fieldMappings = [
        { source: `${sourcePrefix}Line1`, target: `${addressLinePrefix}1` },
        { source: `${sourcePrefix}Line2`, target: `${addressLinePrefix}2` },
        { source: `${sourcePrefix}Line3`, target: `${addressLinePrefix}3` },
        { source: `${sourcePrefix}Country`, target: `iauCountry${suffix}` },
        { source: `${sourcePrefix}State`, target: `iauState${suffix}` },
        { source: `${sourcePrefix}District`, target: `iauDistrict${suffix}` },
        { source: `${sourcePrefix}City`, target: `iauCity${suffix}` },
        { source: `${sourcePrefix}Pincode`, target: `iauPincode${suffix}` },
        { source: `${sourcePrefix}Digipin`, target: `iauDigipin${suffix}` },
      ];

      fieldMappings.forEach(({ source, target }) => {
        const value = data[source];
        if (value !== null && value !== undefined && value !== '') {
          console.log(`  ✅ Setting ${target} = ${value}`);
          dispatch(updateFormValue({ fieldName: target, value: String(value) }));
        } else {
          console.log(`  ⚠️ No value for ${source} -> ${target}`);
        }
      });
    }
  }, [addressData, fetchAddressData, dispatch]);

  // Special dropdown handlers for office address
  const specialDropdownHandlers = useMemo(() => ({
    iauOfficeAddress1: (value: string) => {
      populateAdminOfficeAddress(1, value);
    },
    iauOfficeAddress2: (value: string) => {
      populateAdminOfficeAddress(2, value);
    },
  }), [populateAdminOfficeAddress]);

  // Set frontend config fields in Redux when loaded
  React.useEffect(() => {
    if (
      (frontendGroupedFields || frontendFields) &&
      !configLoading &&
      frontendConfig
    ) {
      console.log(
        '✅ Setting frontend Admin User config fields in Redux:',
        flattenedFields.length
      );
      dispatch(
        setFieldsFromConfig({
          fields: flattenedFields as FormField[],
          configuration: frontendConfig as any,
        })
      );
    }
  }, [frontendGroupedFields, frontendFields, frontendConfig, configLoading, dispatch, flattenedFields]);

  // Ensure fields are set before rendering DynamicExpandCollapseForm
  const fieldsReady = React.useMemo(() => {
    return (
      (frontendGroupedFields || frontendFields) &&
      !configLoading &&
      formFields &&
      formFields.length > 0
    );
  }, [frontendGroupedFields, frontendFields, configLoading, formFields]);

  // Check if all admin sections are OTP verified (defined before handleSave)
  const areAllAdminSectionsVerified = useCallback(() => {
    if (!mergedGroupedFields) return false;

    // Get all admin section names (admin1, admin2, etc.)
    const adminSectionNames = Object.keys(mergedGroupedFields).filter((sectionName) =>
      sectionName.toLowerCase().includes('admin')
    );

    // Check if all admin sections are verified
    return adminSectionNames.every((sectionName) =>
      verifiedSections.has(sectionName)
    );
  }, [mergedGroupedFields, verifiedSections]);

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      console.log('Admin User Details Step - Form data received:', formData);

      // Check if all admin sections are OTP verified
      if (!areAllAdminSectionsVerified()) {
        console.warn('Save blocked: Not all admin sections are OTP verified');
        return;
      }

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
          submitAdminUserDetails({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (flattenedFields || []) as FormField[],
          })
        ).unwrap();

        console.log('✅ Admin User details submission successful:', result);

        if (onSave) {
          onSave(formData);
        }

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Admin User details submission failed:', error);
      }
    },
    [
      dispatch,
      userDetails,
      authWorkflowId,
      flattenedFields,
      onSave,
      onNext,
      areAllAdminSectionsVerified,
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
      (frontendGroupedFields || frontendFields) &&
      !configLoading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      console.log(
        '✅ Frontend Admin User form fields loaded, now fetching step data for admin users:',
        {
          stepKey: 'institutionalAdminUser',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: flattenedFields.length,
        }
      );

      stepDataFetched.current = true;
      dispatch(
        fetchStepData({
          stepKey: 'institutionalAdminUser',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    }
  }, [
    dispatch,
    authWorkflowId,
    userDetails,
    frontendGroupedFields,
    frontendFields,
    configLoading,
    stepDataLoading,
    flattenedFields,
  ]);

  // Reset the fetch flag when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearStepData());
      stepDataFetched.current = false;
      geoFieldsProcessed.current = false;
    };
  }, [dispatch, authWorkflowId, userDetails?.userId]);

  // Populate form fields when step data is loaded
  React.useEffect(() => {
    if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
      console.log('Populating Admin User form fields with step data:', stepData.data);

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

  // Fetch documents when step documents are available
  React.useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      console.log('Fetching documents for Admin User step data:', stepDocuments);
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

  // Process geographical fields separately (only once when step data is loaded)
  // Use a ref to prevent infinite loops from repeated API calls
  // Use baseFields (stable) instead of flattenedFields (changes with dropdown options)
  React.useEffect(() => {
    if (
      stepData &&
      stepData.data &&
      Object.keys(stepData.data).length > 0 &&
      baseFields &&
      baseFields.length > 0 &&
      !geoFieldsProcessed.current
    ) {
      console.log('🌍 Processing geographical fields for Admin User Details (one-time)');
      geoFieldsProcessed.current = true;
      
      // Process geographical fields using common utility
      // Use stepData.data as the values source to avoid dependency on formValues
      processGeographicalFields(
        baseFields,
        stepData,
        stepData.data as Record<string, unknown>, // Use stepData instead of formValues
        dispatch,
        fetchAdminUserDropdownOptions
      );
    }
  }, [dispatch, stepData, baseFields]);

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

  // NOTE:
  // Previously, admin sections were auto-marked as "verified" when CKYC
  // data was auto-populated. This caused the "Verified" label and the
  // Save & Submit button to become enabled without completing OTP
  // verification via the "Validate Admin" actions.
  //
  // Requirement:
  // - "Verified" label should appear only after successful OTP
  //   verification (Validate Admin 1 / 2).
  // - Save & Submit should be enabled only after both admins are
  //   successfully validated via OTP.
  //
  // To meet this requirement, we no longer auto-mark sections as
  // verified based on CKYC data here. Verification state is now
  // driven exclusively by the OTP flow (handleOtpSuccess), which
  // dispatches addVerifiedSection/updateSectionDataHash.

  // OTP Modal Handlers
  const handleOtpSuccess = () => {
    if (currentValidatingSection && mergedGroupedFields) {
      const { sectionName, sectionIndex } = currentValidatingSection;

      // Mark section as verified - persist to Redux
      dispatch(addVerifiedSection(sectionName));

      // Store current section data hash for change detection
      // Only hash OTP-sensitive fields (email, mobile, country code) so that
      // changes to other fields (CKYC auto-population, address, etc.) don't
      // trigger "data changed" state
      const sectionGroup = mergedGroupedFields[sectionName];
      if (sectionGroup) {
        // Map section names to their OTP-sensitive fields
        const otpSensitiveFieldsMap: Record<string, string[]> = {
          adminone: ['iauEmail1', 'iauMobileNumber1', 'iauCountryCode1'],
          admintwo: ['iauEmail2', 'iauMobileNumber2', 'iauCountryCode2'],
        };

        // Get the OTP-sensitive fields for this section
        const otpFields =
          otpSensitiveFieldsMap[sectionName] ??
          otpSensitiveFieldsMap[`admin${sectionIndex === 1 ? 'one' : 'two'}`] ??
          [];

        // Build hash using only OTP-sensitive fields
        const sectionData = otpFields.reduce(
          (acc: Record<string, string | boolean | null>, fieldName: string) => {
            const value = formValues[fieldName];
            // Type cast to handle the unknown type from formValues
            if (value instanceof File) {
              acc[fieldName] = value.name;
            } else if (
              typeof value === 'string' ||
              typeof value === 'boolean' ||
              value === null
            ) {
              acc[fieldName] = value;
            } else {
              acc[fieldName] = value ? String(value) : null;
            }
            return acc;
          },
          {} as Record<string, string | boolean | null>
        );
        const dataHash = JSON.stringify(sectionData);
        dispatch(
          updateSectionDataHash({ section: sectionName, hash: dataHash })
        );
      }

      // Close OTP modal
      setOtpModalOpen(false);

      // Show success modal
      setSuccessModalOpen(true);

      console.log(
        `✅ Section ${sectionName} (Admin ${sectionIndex}) verified with OTP`
      );
    }
  };

  const handleOtpClose = () => {
    setOtpModalOpen(false);
    setCurrentValidatingSection(null);
    setPendingOtpData('');
  };

  // Success Modal Handler
  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    setCurrentValidatingSection(null);
    setPendingOtpData('');
  };

  // Handle section validation
  const handleValidateSection = async (
    sectionName: string,
    sectionIndex: number
  ) => {
    console.log(`Validating section: ${sectionName}, Admin ${sectionIndex}`);

    if (!validationSchema || !mergedGroupedFields) {
      console.warn('Validation schema or grouped fields not available');
      return;
    }
    let email = '',
      mobile = '',
      countryCode = '';
    // Get fields for this specific section
    const sectionGroup = mergedGroupedFields[sectionName];
    const sectionFields = sectionGroup?.fields || [];

    // Clear existing validation errors for this section
    const currentErrors = Object.entries(validationErrors);
    const filteredErrors: Record<string, string> = {};

    currentErrors.forEach(([field, message]) => {
      if (!field.startsWith(sectionName)) {
        filteredErrors[field] = message;
      }
    });

    setValidationErrors(filteredErrors);

    // Validate each field in the section
    const sectionErrors: Record<string, string> = {};

    sectionFields.forEach((field: any) => {
      const fieldValue = formValues[field.fieldName];
      // Check if field is required and empty
      if (
        field.validationRules?.required &&
        (!fieldValue || fieldValue === '')
      ) {
        sectionErrors[field.fieldName] =
          field.validationRules.requiredMessage ||
          `${field.fieldLabel} is required`;
      }

      if (field.fieldName.toLowerCase().includes('email')) {
        email = fieldValue as string;
      }
      if (field.fieldName.toLowerCase().includes('mobile')) {
        mobile = fieldValue as string;
      }
      if (field.fieldName.toLowerCase().includes('countrycode')) {
        countryCode = fieldValue as string;
      }
      // Additional validation based on field name (for email fields)
      if (fieldValue && field.fieldName.toLowerCase().includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue as string)) {
          sectionErrors[field.fieldName] =
            `${field.fieldLabel} must be a valid email`;
        }
      }

      // Check regex validation if provided
      if (fieldValue && field.validationRules?.regx) {
        const regex = new RegExp(field.validationRules.regx);
        if (!regex.test(fieldValue as string)) {
          sectionErrors[field.fieldName] =
            field.validationRules.regxMessage ||
            `${field.fieldLabel} format is invalid`;
        }
      }
    });

    // Update validation errors
    if (Object.keys(sectionErrors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...sectionErrors }));
      console.log(`Admin ${sectionIndex} validation failed:`, sectionErrors);
    } else {
      console.log(`Admin ${sectionIndex} validation passed successfully!`);

      // Open OTP modal for verification
      setCurrentValidatingSection({ sectionName, sectionIndex });

      // Create OTP data
      const otpData = {
        requestType: 'DIRECT',
        emailId: email,
        mobileNo: mobile,
        countryCode: countryCode,
        workflowId: authWorkflowId as string,
        ckycNo:
          formValues[`iauCitizenship${sectionIndex}`] === 'Indian'
            ? (formValues[`iauCkycNumber${sectionIndex}`] as string)
            : undefined,
        stepKey: 'institutionalAdminUser' as string,
        name: formValues[`iauFirstName${sectionIndex}`] as string,
      };

      console.log('otpData====', otpData);

      // Show loading state
      setOtpSendLoading(true);

      try {
        const result = await dispatch(OTPSend(otpData));
        console.log('result=====', result);

        if (OTPSend.fulfilled.match(result)) {
          console.log('OTP sent successfully!', result);
          setPendingOtpData(result?.payload?.data?.otpIdentifier);
          setOtpModalOpen(true);
          console.log(
            `Opening OTP modal for Admin ${sectionIndex} verification`
          );
        } else {
          // Handle OTP send failure
          let fieldName = '';
          if (result?.payload?.field === 'ckyc') {
            fieldName = 'iauCkycNumber';
          } else if (result?.payload?.field === 'mobile') {
            fieldName = 'iauMobileNumber';
          } else if (result?.payload?.field === 'email') {
            fieldName = 'iauEmail';
          } else {
            return;
          }

          setValidationErrors({
            ...validationErrors,
            [`${fieldName}${sectionIndex}`]: result.payload?.message ?? '',
          });
          console.error('OTP send failed:', result);
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
      } finally {
        // Hide loading state
        setOtpSendLoading(false);
      }
    }
  };

  // Extract field errors if submission error is a field validation error
  const fieldErrors = React.useMemo(() => {
    if (
      submissionError &&
      typeof submissionError === 'object' &&
      'type' in submissionError &&
      (submissionError as AdminUserDetailsSubmissionError).type ===
        'FIELD_VALIDATION_ERROR'
    ) {
      return (
        (submissionError as AdminUserDetailsSubmissionError).fieldErrors || {}
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
      const errorObj = submissionError as AdminUserDetailsSubmissionError;
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

  if (!frontendGroupedFields || Object.keys(frontendGroupedFields).length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No form fields available. Please check the configuration.
      </Alert>
    );
  }

  return (
    <>
      {/* Page-level loader for form submission */}
      <PageLoader open={submissionLoading} message="Submitting form, please wait..." />

      <FormErrorBoundary>
        <FieldErrorProvider fieldErrors={fieldErrors}>
          {generalErrorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalErrorMessage}
            </Alert>
          )}
          <DynamicExpandCollapseForm
            groupedFields={mergedGroupedFields as any}
            configuration={frontendConfig as any}
            formValues={formValues as Record<string, string | boolean | File | null>}
            stepData={stepData}
            dispatch={dispatch}
            fields={flattenedFields}
            fetchDropdownOptionsAction={fetchAdminUserDropdownOptions}
            clearDependentFieldOptions={() => {}}
            onValidateSection={handleValidateSection}
            verifiedSections={verifiedSections}
            sectionDataHashes={sectionDataHashes}
            existingDocuments={fetchedDocuments}
            documentFieldMapping={documentFieldMapping}
            updateFormValue={(payload) => {
              // Convert boolean to string for formSlice compatibility
              const value = typeof payload.value === 'boolean' 
                ? payload.value.toString() 
                : payload.value;
              dispatch(updateFormValue({ ...payload, value: value as string | File | null }));
            }}
            setFieldError={() => {}}
            clearFieldError={() => {}}
            clearForm={() => {}}
            copySectionValues={() => {}}
            clearSectionValues={() => {}}
            validationSchema={validationSchema}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            onSave={handleSave}
            onNext={onNext}
            onPrevious={onPrevious}
            clearKey={clearKey}
            setClearKey={setClearKey}
            loading={submissionLoading}
            onValidationChange={onValidationChange}
            specialDropdownHandlers={specialDropdownHandlers}
          />
        </FieldErrorProvider>
      </FormErrorBoundary>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        open={otpModalOpen}
        data={pendingOtpData}
        onClose={handleOtpClose}
        onSuccess={handleOtpSuccess}
        maskedMobile={
          currentValidatingSection
            ? (() => {
                const value =
                  formValues[
                    `iauMobileNumber${
                      currentValidatingSection.sectionName === 'adminone'
                        ? '1'
                        : '2'
                    }`
                  ];
                return typeof value === 'string' ? value : '';
              })()
            : ''
        }
        maskedEmail={
          currentValidatingSection
            ? (() => {
                const value =
                  formValues[
                    `iauEmail${
                      currentValidatingSection.sectionName === 'adminone'
                        ? '1'
                        : '2'
                    }`
                  ];
                return typeof value === 'string' ? value : '';
              })()
            : ''
        }
      />

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onClose={handleSuccessModalClose}
        title="Verification Successful"
        message={`Admin ${currentValidatingSection?.sectionIndex || ''} has been verified successfully!`}
      />
    </>
  );
};

export default FrontendAdminUserDetailsStep;

