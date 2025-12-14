import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Component,
  // ErrorInfo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from '@mui/material';
// import { Alert, Box, CircularProgress } from '@mui/material';
import type { AppDispatch, RootState } from '../../../../../redux/store';
// import DynamicExpandCollapseForm from '../../DynamicExpandCollapseForm';
import {
  buildValidationSchema,
  FormField as ValidationFormField,
} from '../../../../../utils/formValidation';
import {
  fetchAdminUserDetailsFields,
  fetchAdminUserDropdownOptions,
  updateFormValue,
  setFieldError,
  clearFieldError,
  clearForm,
  copySectionValues,
  clearSectionValues,
  selectAdminUserDetailsGroupedFields,
  selectAdminUserDetailsConfiguration,
  selectAdminUserDetailsFormValues,
  // selectAdminUserDetailsLoading,
  selectAdminUserDetailsError,
} from '../../slice/adminUserDetailsSlice';
import type { AdminUserFormField } from '../../types/adminUserDetailsTypes';
import {
  submitAdminUserDetails,
  selectAdminUserSubmissionLoading,
  selectAdminUserSubmissionError,
  resetSubmissionState,
} from '../../slice/adminUserDetailsSubmissionSlice';
import {
  fetchStepData,
  fetchDocument,
  selectStepDataLoading,
  selectStepData,
  selectStepDocuments,
  selectFetchedDocuments,
  clearStepData,
} from '../../slice/stepDataSlice';
import { FieldErrorProvider } from '../../context/FieldErrorContext';
import { AdminUserDetailsSubmissionError } from '../../types/adminUserDetailsSubmissionTypes';
import { FormField } from '../../types/formTypes';
import OTPVerificationModal from '../../../../ui/Modal/OTPVerificationModal';
import { OTPSend } from '../../../Authenticate/slice/authSlice';
import TrackStatusDynamicExpandCollapseForm from '../TrackStatusDynamicExpandCollapseForm';
import { processGeographicalFields } from '../../utils/geographicalDataUtils';
import { useModifiableFields } from 'hooks/useModifiableFields';

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

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Admin user details form rendering error:{' '}
          {this.state.error?.message || 'Unknown error'}
          <br />
          Please refresh the page and try again.
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Type adapter function to convert AdminUserFormField to ValidationFormField
const convertToValidationFormField = (
  field: AdminUserFormField
): ValidationFormField => {
  return {
    id: field.id,
    fieldName: field.fieldName,
    fieldType: field.fieldType,
    fieldLabel: field.fieldLabel,
    validationRules: field.validationRules,
    conditionalLogic:
      field.conditionalLogic?.map((logic) => ({
        when: {
          field: logic.when.field,
          operator: logic.when.operator,
          value: logic.when.value
            ? Array.isArray(logic.when.value)
              ? logic.when.value
              : [logic.when.value]
            : null,
        },
        then: logic.then
          ? { validationRules: logic.then.validationRules }
          : undefined,
        fieldAttributes: logic.fieldAttributes,
      })) || null,
  };
};

interface AdminUserDetailsStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  url?: string;
}

const AdminUserDetailsStep: React.FC<AdminUserDetailsStepProps> = ({
  onSave,
  onNext,
  onPrevious,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for form fields
  const groupedFields = useSelector((state: RootState) =>
    selectAdminUserDetailsGroupedFields(state)
  );
  const configuration = useSelector((state: RootState) =>
    selectAdminUserDetailsConfiguration(state)
  );
  const formValues = useSelector((state: RootState) =>
    selectAdminUserDetailsFormValues(state)
  );
  // const loading = useSelector((state: RootState) =>
  //   selectAdminUserDetailsLoading(state)
  // );
  const error = useSelector((state: RootState) =>
    selectAdminUserDetailsError(state)
  );

  // Redux selectors for submission
  const submissionLoading = useSelector(selectAdminUserSubmissionLoading);
  const submissionError = useSelector(selectAdminUserSubmissionError);

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

  // Local state for validation
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [clearKey, setClearKey] = useState<number>(0);

  // OTP verification state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [, setOtpSendLoading] = useState(false);
  const [, setMobileState] = useState('');
  const [, setCountryCodeState] = useState('');
  const [, setEmailState] = useState('');
  const [currentValidatingSection, setCurrentValidatingSection] = useState<{
    sectionName: string;
    sectionIndex: number;
  } | null>(null);
  const [verifiedSections, setVerifiedSections] = useState<Set<string>>(
    new Set()
  );
  const [sectionDataHashes, setSectionDataHashes] = useState<
    Record<string, string>
  >({});
  const [pendingOtpData, setPendingOtpData] = useState<string>('');
  const { isModifiableField } = useModifiableFields();
  // Local loading state for form submission
  const [, setIsSubmitting] = useState(false);

  // Create validation schema from fields
  const validationSchema = useMemo(() => {
    if (!groupedFields || Object.keys(groupedFields).length === 0) {
      return null;
    }

    // Flatten all fields from all groups and convert to ValidationFormField
    const allFields = Object.values(groupedFields).flatMap(
      (group) => group.fields
    );
    const convertedFields = allFields.map(convertToValidationFormField);
    return buildValidationSchema(convertedFields);
  }, [groupedFields]);

  // Create flattened fields array for dependent dropdown support
  const flattenedFields = useMemo(() => {
    if (!groupedFields) return [];
    return Object.values(groupedFields).flatMap((group) => group.fields);
  }, [groupedFields]);

  // Fetch admin user details fields on component mount
  useEffect(() => {
    dispatch(fetchAdminUserDetailsFields());
  }, [dispatch]);

  // Clear cached documents on component mount to force re-fetch with new base64 format (one-time only)
  useEffect(() => {
    console.log(
      '🔄 Clearing cached documents to force re-fetch with base64 format'
    );
    dispatch(clearStepData());
    // Reset the fetch flag after clearing data
    stepDataFetched.current = false;
  }, [dispatch]);

  // Fetch step data when form fields are available
  React.useEffect(() => {
    // Try multiple sources for workflowId and userId
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    // Fallback test values (same as other steps)
    const testWorkflowId = currentWorkflowId;
    const testUserId = userId;

    // Debug logging for step data fetching conditions
    console.log('🔍 Step data fetch conditions:', {
      testWorkflowId: !!testWorkflowId,
      testWorkflowIdValue: testWorkflowId,
      testUserId: !!testUserId,
      testUserIdValue: testUserId,
      flattenedFieldsLength: flattenedFields?.length || 0,
      stepDataFetched: stepDataFetched.current,
      stepDataLoading,
      authWorkflowId,
      userDetails,
      allConditionsMet: !!(
        testWorkflowId &&
        testUserId &&
        flattenedFields &&
        flattenedFields.length > 0 &&
        !stepDataFetched.current &&
        !stepDataLoading
      ),
    });

    // Only fetch step data if form fields are available (fields API has completed)
    // Add check to prevent multiple API calls
    if (
      testWorkflowId &&
      testUserId &&
      flattenedFields &&
      flattenedFields.length > 0 &&
      // !loading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      console.log('✅ Fetching step data for Admin User Details');
      stepDataFetched.current = true; // Mark as fetched to prevent loops

      dispatch(
        fetchStepData({
          stepKey: 'institutionalAdminUser',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
    } else {
      console.log('❌ Step data fetch conditions not met');
      console.log('❌ Failed conditions:', {
        hasWorkflowId: !!testWorkflowId,
        hasUserId: !!testUserId,
        hasFields: !!(flattenedFields && flattenedFields.length > 0),
        notAlreadyFetched: !stepDataFetched.current,
        notCurrentlyLoading: !stepDataLoading,
      });
    }
  }, [
    dispatch,
    authWorkflowId,
    userDetails,
    flattenedFields,

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
        'Populating admin user details form fields with step data:',
        stepData.data
      );

      // Populate each field from step data
      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          console.log(`Setting admin field ${fieldName} = ${fieldValue}`);
          // Convert value to string for form compatibility
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          dispatch(updateFormValue({ fieldName, value: stringValue }));
        }
      });

      // Log documents if available
      if (stepDocuments && stepDocuments.length > 0) {
        console.log('Available admin user documents:', stepDocuments);
      }
    }
  }, [dispatch, stepData, stepDocuments]);

  // Process geographical fields for IAU addresses when data is loaded
  React.useEffect(() => {
    console.log('🔍 Geographical fields effect triggered:', {
      flattenedFieldsLength: flattenedFields.length,
      hasStepData: !!stepData,
      hasFormValues: !!formValues,
      formValuesLength: formValues ? Object.keys(formValues).length : 0,
      iauCountry1: formValues?.['iauCountry1'],
      iauCountry2: formValues?.['iauCountry2'],
      iauGender1: formValues?.['iauGender1'],
    });

    // Only process if we have fields, stepData, and form values with IAU geographical data
    if (
      flattenedFields.length > 0 &&
      stepData &&
      formValues &&
      Object.keys(formValues).length > 0
    ) {
      const hasIAUGeographicalData =
        formValues['iauCountry1'] ||
        formValues['iauCountry2'] ||
        formValues['iauState1'] ||
        formValues['iauState2'] ||
        formValues['iauDistrict1'] ||
        formValues['iauDistrict2'] ||
        formValues['iauGender1'];

      console.log('🔍 IAU Geographical data check:', {
        hasIAUGeographicalData,
        iauCountry1: formValues['iauCountry1'],
        iauState1: formValues['iauState1'],
        iauDistrict1: formValues['iauDistrict1'],
      });

      if (hasIAUGeographicalData) {
        console.log('🌍 Processing IAU geographical fields on page load');
        processGeographicalFields(
          flattenedFields,
          stepData,
          formValues,
          dispatch,
          fetchAdminUserDropdownOptions
        );
      } else {
        console.log('⚠️ No IAU geographical data found');
      }
    } else {
      console.log(
        '⚠️ Prerequisites not met for processing geographical fields'
      );
    }
    // Only run once when fields and formValues are first populated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flattenedFields.length, stepData, Object.keys(formValues).length]);

  // Fetch all documents when step documents are available (No filtering - use all documents from API)
  React.useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      console.log('🔍 All documents available:', stepDocuments.length);
      console.log(
        '🔍 Document types:',
        stepDocuments.map((doc) => doc.type)
      );

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

  // Create a simple mapping of document types to document IDs
  const documentFieldMapping = React.useMemo(() => {
    const mapping: Record<string, string> = {};

    if (!stepDocuments) return mapping;

    console.log('🔍 All step documents:', stepDocuments.length);
    console.log(
      '🔍 Document types for mapping:',
      stepDocuments.map((doc) => doc.type)
    );

    // Simple mapping: document type -> document ID
    stepDocuments.forEach((doc) => {
      mapping[doc.fieldKey] = doc.id;

      // Add common variations for better field matching
      const camelCase = doc.type.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      const snake_case = doc.type.replace(/([A-Z])/g, '_$1').toLowerCase();

      mapping[camelCase] = doc.id;
      mapping[snake_case] = doc.id;
      mapping[`${doc.type}_file`] = doc.id;
      mapping[`${doc.type}File`] = doc.id;
    });

    console.log('📋 Simple document field mapping created:', mapping);
    return mapping;
  }, [stepDocuments]);

  // Use all fetched documents (no filtering needed)
  const allFetchedDocuments = React.useMemo(() => {
    if (!fetchedDocuments || !stepDocuments) return {};

    // Get all document IDs from step documents
    const stepDocumentIds = stepDocuments.map(
      (doc: { id: string; type: string }) => doc.id
    );

    const filteredDocs: Record<string, unknown> = {};
    stepDocumentIds.forEach((docId: string) => {
      if (fetchedDocuments[docId]) {
        filteredDocs[docId] = fetchedDocuments[docId];
      }
    });

    console.log('🔍 All fetched documents:', Object.keys(filteredDocs).length);
    return filteredDocs;
  }, [fetchedDocuments, stepDocuments]);

  // OTP Modal Handlers
  const handleOtpSuccess = () => {
    if (currentValidatingSection && groupedFields) {
      const { sectionName, sectionIndex } = currentValidatingSection;

      // Mark section as verified
      setVerifiedSections((prev) => new Set([...prev, sectionName]));

      // Store current section data hash for change detection
      const sectionGroup = groupedFields[sectionName];
      if (sectionGroup) {
        const sectionData = sectionGroup.fields.reduce(
          (acc, field) => {
            const value = formValues[field.fieldName];
            acc[field.fieldName] = value instanceof File ? value.name : value;
            return acc;
          },
          {} as Record<string, string | boolean | null>
        );
        const dataHash = JSON.stringify(sectionData);
        setSectionDataHashes((prev) => ({ ...prev, [sectionName]: dataHash }));
      }

      // Close modal and reset state
      setOtpModalOpen(false);
      setCurrentValidatingSection(null);
      setPendingOtpData('');

      // alert(`Admin ${sectionIndex} verified successfully with OTP!`);
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

  // Check if all admin sections are OTP verified
  const areAllAdminSectionsVerified = useCallback(() => {
    if (!groupedFields) return false;
    const contactNames = [
      'iauEmail1',
      'iauEmail2',
      'iauMobileNumber1',
      'iauMobileNumber2',
    ];
    // Get all admin section names (admin1, admin2, etc.)
    const adminSectionNames = Object.keys(groupedFields).filter((sectionName) =>
      sectionName.toLowerCase().includes('admin')
    );

    if (adminSectionNames.length === 0) return false;

    // Sections that actually contain a modifiable contact field
    const sectionsNeedingVerify = adminSectionNames.filter((sectionName) => {
      const fields = groupedFields[sectionName]?.fields || [];
      return contactNames.some(
        (name) =>
          fields.some((f) => f.fieldName === name) && isModifiableField(name)
      );
    });

    // If no sections have modifiable contacts, don’t block
    if (sectionsNeedingVerify.length === 0) return true;

    // Require verification only for those sections
    return sectionsNeedingVerify.every((sectionName) =>
      verifiedSections.has(sectionName)
    );
    //   return adminSectionNames.every((sectionName) =>
    //   verifiedSections.has(sectionName)
    // );
  }, [groupedFields, verifiedSections, isModifiableField]);

  // Handle form save with API submission
  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      // Check if all admin sections are OTP verified
      if (!areAllAdminSectionsVerified()) {
        // alert('Please verify all admin sections with OTP before saving.');
        console.log('Save blocked: Not all admin sections are OTP verified');
        return;
      }

      // Try multiple sources for workflowId and userId
      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      if (!currentWorkflowId || !userId) {
        console.error(
          'Missing required data for admin user details submission:',
          {
            workflowId: currentWorkflowId,
            userId,
            userDetails,
          }
        );
        alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      try {
        // Set loading state
        setIsSubmitting(true);

        // Reset previous submission state
        dispatch(resetSubmissionState());

        // Submit admin user details
        const result = await dispatch(
          submitAdminUserDetails({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (flattenedFields || []) as FormField[],
          })
        );

        if (submitAdminUserDetails.fulfilled.match(result)) {
          console.log(
            '✅ Admin user details submission successful:',
            result.payload
          );

          // Reset loading state on success
          setIsSubmitting(false);

          // Call original onSave callback if provided
          if (onSave) {
            onSave(formData);
          }

          // Move to next step if provided
          if (onNext) {
            onNext();
          }
        } else {
          // Handle structured error response - matching your API response format
          const errorResponse = result.payload as {
            error?: {
              status?: number;
              code?: string;
              type?: string;
              message?: string;
              errors?: Array<{ field: string; message: string }>;
            };
            type?: string;
            errors?: Array<{ field: string; message: string }>;
            message?: string;
          };

          // Extract error from nested structure or direct structure
          const error = errorResponse.error || errorResponse;

          console.error('Admin user details submission failed:', error);

          // Reset loading state on error
          setIsSubmitting(false);

          if (error?.type === 'ERROR_FORM_VALIDATION' && error.errors) {
            // Handle field-specific validation errors
            console.log('error:----', error?.errors);
            error.errors.forEach((fieldError) => {
              dispatch(
                setFieldError({
                  field: fieldError.field,
                  message: fieldError.message,
                })
              );
            });
            console.log('📋 Field validation errors set:', error.errors);
            console.log('🚫 Form submission blocked - validation errors found');
          } else {
            // Handle general errors
            const errorMessage =
              error?.message ||
              'Failed to submit admin user details. Please try again.';
            console.error('General submission error:', errorMessage);
            // You can add a toast notification here if needed
          }
        }
      } catch (error) {
        console.error(
          'Unexpected error during admin user details submission:',
          error
        );
        // Reset loading state on unexpected error
        setIsSubmitting(false);
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

  // Handle section validation
  const handleValidateSection = async (
    sectionName: string,
    sectionIndex: number
  ) => {
    console.log(`Validating section: ${sectionName}, Admin ${sectionIndex}`);

    if (!validationSchema || !groupedFields) {
      console.warn('Validation schema or grouped fields not available');
      return;
    }
    let email = '',
      mobile = '',
      countryCode = '';
    // Get fields for this specific section
    const sectionGroup = groupedFields[sectionName];
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

    sectionFields.forEach((field) => {
      const fieldValue = formValues[field.fieldName];
      // console.log('fieldValue===', fieldValue);
      // console.log('field.fieldName===', field.fieldName);
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
        setEmailState(fieldValue as string);
        email = fieldValue as string;
      }
      if (field.fieldName.toLowerCase().includes('mobile')) {
        setMobileState(fieldValue as string);
        mobile = fieldValue as string;
      }
      if (field.fieldName.toLowerCase().includes('countrycode')) {
        setCountryCodeState(fieldValue as string);
        countryCode = fieldValue as string;
      }
      // Additional validation based on field name (for email fields)
      if (fieldValue && field.fieldName.toLowerCase().includes('email')) {
        // setEmailState(field.fieldName);
        // console.log('EmialData:----', field.fieldName.toLowerCase().includes('email'))
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
    // const result = await dispatch(OTPSend({ userId: userID }));
    // console.log('result=====', result);
    // if (forgotPassword.fulfilled.match(result)) {
    //   console.log('OTP sent successfully!', result);
    //   setOtpSentResponse({
    //     mobile: result?.payload?.data?.mobile ?? null,
    //     email: result?.payload?.data?.email ?? userID,
    //   });
    //   setIsModalOpen(true);
    // }

    // Update validation errors
    if (Object.keys(sectionErrors).length > 0) {
      setValidationErrors((prev) => ({ ...prev, ...sectionErrors }));
      console.log(`Admin ${sectionIndex} validation failed:`, sectionErrors);

      // Show error message
      // alert(
      //   `Admin ${sectionIndex} validation failed. Please check the highlighted fields.`
      // );
    } else {
      console.log(`Admin ${sectionIndex} validation passed successfully!`);

      // Check if section is already verified
      // if (verifiedSections.has(sectionName)) {
      //   alert(`Admin ${sectionIndex} is already verified with OTP!`);
      //   return;
      // }

      // Open OTP modal for verification
      setCurrentValidatingSection({ sectionName, sectionIndex });

      // Get admin email/mobile for OTP (you may need to adjust this based on your form structure)
      // const adminEmail =
      //   formValues[`${sectionName}_email`] ||
      //   formValues[`admin${sectionIndex}_email`] ||
      //   '';
      // const adminMobile =
      //   formValues[`${sectionName}_mobile`] ||
      //   formValues[`admin${sectionIndex}_mobile`] ||
      //   '';

      // Create OTP data string (adjust format as needed by your OTP service)
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
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        // alert(`Error sending OTP for Admin ${sectionIndex}. Please try again.`);
      } finally {
        // Hide loading state
        setOtpSendLoading(false);
      }
    }
  };

  // Special checkbox handlers for copying admin 1 data to admin 2
  const specialCheckboxHandlers = {
    copy_admin1_to_admin2: (checked: boolean) => {
      dispatch(
        updateFormValue({ fieldName: 'copy_admin1_to_admin2', value: checked })
      );

      if (checked) {
        // Copy admin 1 values to admin 2
        dispatch(
          copySectionValues({
            fromSection: 'admin1',
            toSection: 'admin2',
          })
        );
      } else {
        // Clear admin 2 values
        dispatch(clearSectionValues('admin2'));
      }
    },
  };

  // Custom field disabled logic
  const getFieldDisabled = (field: { fieldGroup?: string }) => {
    // Disable admin 2 fields if "copy admin 1 to admin 2" is checked
    if (field.fieldGroup === 'admin2') {
      return formValues['copy_admin1_to_admin2'] === true;
    }
    return false;
  };

  // Extract field errors if submission error is a field validation error (must be before conditional returns)
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
      // Only show general message for non-field validation errors
      if (errorObj.type !== 'FIELD_VALIDATION_ERROR') {
        return errorObj.message;
      }
    }

    return null;
  }, [submissionError]);

  // Show loading state during form submission
  // if (isSubmitting) {
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
  //       <Box>Submitting admin user details...</Box>
  //     </Box>
  //   );
  // }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading admin user details: {error}
      </Alert>
    );
  }

  // Don't render if no configuration is loaded
  if (
    !configuration ||
    !groupedFields ||
    Object.keys(groupedFields).length === 0
  ) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No admin user details form configuration found.
      </Alert>
    );
  }

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
          <TrackStatusDynamicExpandCollapseForm
            groupedFields={groupedFields}
            configuration={configuration}
            formValues={formValues}
            dispatch={dispatch}
            fields={flattenedFields}
            fetchDropdownOptionsAction={fetchAdminUserDropdownOptions}
            onValidateSection={handleValidateSection}
            verifiedSections={verifiedSections}
            sectionDataHashes={sectionDataHashes}
            updateFormValue={(payload) => dispatch(updateFormValue(payload))}
            setFieldError={(payload) => dispatch(setFieldError(payload))}
            clearFieldError={(field) => dispatch(clearFieldError(field))}
            clearForm={() => dispatch(clearForm())}
            copySectionValues={(payload) =>
              dispatch(copySectionValues(payload))
            }
            clearSectionValues={(sectionPrefix) =>
              dispatch(clearSectionValues(sectionPrefix))
            }
            validationSchema={validationSchema}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            onSave={handleSave}
            onNext={onNext}
            onPrevious={onPrevious}
            specialCheckboxHandlers={specialCheckboxHandlers}
            getFieldDisabled={getFieldDisabled}
            clearKey={clearKey}
            setClearKey={setClearKey}
            existingDocuments={allFetchedDocuments}
            documentFieldMapping={documentFieldMapping}
            loading={submissionLoading}
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
                // const value =
                //   formValues[
                //     `iauMobileNumbmer${
                //       currentValidatingSection.sectionName === 'adminone'
                //         ? '1'
                //         : '2'
                //     }`
                //   ];
                const data =
                  currentValidatingSection.sectionName === 'adminone'
                    ? formValues?.iauMobileNumber1
                    : formValues?.iauMobileNumber2;
                return String(data);
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
        maskedCountryCode={
          currentValidatingSection
            ? (() => {
                const value =
                  formValues[
                    `iauCountryCode${
                      currentValidatingSection.sectionName === 'adminone'
                        ? '1'
                        : '2'
                    }`
                  ];
                return typeof value === 'string' ? value : '';
              })()
            : ''
        }
        reSendOtpObject={
          !currentValidatingSection
            ? undefined
            : {
                requestType: 'DIRECT',
                emailId: formValues[
                  `iauEmail${
                    currentValidatingSection.sectionName === 'adminone'
                      ? '1'
                      : '2'
                  }`
                ] as string,
                mobileNo: formValues[
                  `iauMobileNumber${currentValidatingSection.sectionName === 'adminone' ? '1' : '2'}`
                ] as string,
                countryCode: formValues[
                  `iauCountryCode${
                    currentValidatingSection.sectionName === 'adminone'
                      ? '1'
                      : '2'
                  }`
                ] as string,
                workflowId: authWorkflowId as string,
                ckycNo:
                  formValues[
                    `iauCitizenship${currentValidatingSection.sectionName === 'adminone' ? '1' : '2'}`
                  ] === 'Indian'
                    ? (formValues[
                        `iauCkycNumber${currentValidatingSection.sectionName === 'adminone' ? '1' : '2'}`
                      ] as string)
                    : undefined,
                stepKey: 'institutionalAdminUser' as string,
                name: formValues[
                  `iauFirstName${currentValidatingSection.sectionName === 'adminone' ? '1' : '2'}`
                ] as string,
              }
        }
      />
    </>
  );
};

export default AdminUserDetailsStep;
