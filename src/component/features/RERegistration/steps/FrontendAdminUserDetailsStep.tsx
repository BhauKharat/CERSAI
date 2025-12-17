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
} from '../slice/adminUserDetailsSlice';

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

  // Local state for validation
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [clearKey, setClearKey] = useState<number>(0);

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

  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      console.log('Admin User Details Step - Form data received:', formData);

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
          stepKey: 'admin_users',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: flattenedFields.length,
        }
      );

      stepDataFetched.current = true;
      dispatch(
        fetchStepData({
          stepKey: 'admin_users',
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
            dispatch={dispatch}
            fields={flattenedFields}
            fetchDropdownOptionsAction={fetchAdminUserDropdownOptions}
            clearDependentFieldOptions={() => {}}
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
          />
        </FieldErrorProvider>
      </FormErrorBoundary>
    </>
  );
};

export default FrontendAdminUserDetailsStep;

