/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Component,
  ErrorInfo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from '@mui/material';
// import { Box, Alert, CircularProgress } from '@mui/material';
import type { AppDispatch, RootState } from '../../../../redux/store';
import DynamicExpandCollapseForm from '../DynamicExpandCollapseForm';
import { buildValidationSchema } from '../../../../utils/formValidation';
import {
  fetchAddressDetailsFields,
  fetchDependentDropdownOptions,
  updateFormValue,
  setFieldError,
  clearFieldError,
  clearForm,
  copySectionValues,
  clearSectionValues,
  copyAddressFields,
  copyRegisterToCorrespondenceFields,
  clearDependentFieldOptions,
  selectAddressDetailsGroupedFields,
  selectAddressDetailsConfiguration,
  selectAddressDetailsFormValues,
  selectAddressDetailsLoading,
  selectAddressDetailsError,
  updateFormValueObject,
  updateFieldOptions,
} from '../slice/addressDetailsSlice';
import {
  submitAddressDetails,
  selectAddressSubmissionLoading,
  selectAddressSubmissionError,
  resetSubmissionState,
} from '../slice/addressDetailsSubmissionSlice';
import {
  fetchStepData,
  fetchDocument,
  selectStepDataLoading,
  selectStepData,
  selectStepDocuments,
  selectFetchedDocuments,
} from '../slice/stepDataSlice';
import { FieldErrorProvider } from '../context/FieldErrorContext';
import { AddressDetailsSubmissionError } from '../types/addressDetailsSubmissionTypes';
import { FormField } from '../types/formTypes';
import { processGeographicalFields } from '../utils/geographicalDataUtils';
// import { CMS_URL } from 'Constant';

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
    console.error('Address form rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Address form rendering error:{' '}
          {this.state.error?.message || 'Unknown error'}
          <br />
          Please refresh the page and try again.
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface AddressDetailsStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const AddressDetailsStep: React.FC<AddressDetailsStepProps> = ({
  onSave,
  onNext,
  onValidationChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for form fields
  const groupedFields = useSelector((state: RootState) =>
    selectAddressDetailsGroupedFields(state)
  );
  const configuration = useSelector((state: RootState) =>
    selectAddressDetailsConfiguration(state)
  );
  const formValues = useSelector((state: RootState) =>
    selectAddressDetailsFormValues(state)
  );
  const loading = useSelector((state: RootState) =>
    selectAddressDetailsLoading(state)
  );
  const error = useSelector((state: RootState) =>
    selectAddressDetailsError(state)
  );

  // Redux selectors for submission
  const submissionLoading = useSelector(selectAddressSubmissionLoading);
  const submissionError = useSelector(selectAddressSubmissionError);

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

  // Create validation schema from fields
  const validationSchema = useMemo(() => {
    if (!groupedFields || Object.keys(groupedFields).length === 0) {
      return null;
    }

    // Flatten all fields from all groups
    const allFields = Object.values(groupedFields).flatMap(
      (group) => group.fields
    );
    return buildValidationSchema(allFields);
  }, [groupedFields]);

  // Create flattened fields array for dependent dropdown support
  const flattenedFields = useMemo(() => {
    if (!groupedFields) return [];
    return Object.values(groupedFields).flatMap((group) => group.fields);
  }, [groupedFields]);

  // Fetch address details fields on component mount
  useEffect(() => {
    fetchAddressDetailsFieldsData();
  }, [dispatch]);

  const fetchAddressDetailsFieldsData = async () => {
    const res = await dispatch(fetchAddressDetailsFields());
    if (fetchAddressDetailsFields.fulfilled.match(res)) {
      dispatch(
        updateFormValue({ fieldName: 'registerCountry', value: 'India' })
      );
      dispatch(
        updateFormValue({ fieldName: 'correspondenceCountry', value: 'India' })
      );
    }
  };

  // Auto-trigger precise field mapping when fields are loaded and checkbox is checked
  useEffect(() => {
    const isCheckboxChecked =
      formValues['correspondence_same_as_registered'] === true;
    const hasFields = flattenedFields && flattenedFields.length > 0;
    const hasFormValues = Object.keys(formValues).length > 0;

    if (isCheckboxChecked && hasFields && hasFormValues) {
      console.log('🔄 Auto-triggering precise field mapping after field load');
      dispatch(copyRegisterToCorrespondenceFields());
    }
  }, [flattenedFields, formValues, dispatch]);

  // Debug logging for state changes
  // useEffect(() => {
  //   console.log('📊 AddressDetailsStep state:', {
  //     loading,
  //     error,
  //     hasGroupedFields:
  //       !!groupedFields && Object.keys(groupedFields).length > 0,
  //     hasConfiguration: !!configuration,
  //     groupedFieldsKeys: groupedFields ? Object.keys(groupedFields) : [],
  //   });
  // }, [loading, error, groupedFields, configuration]);

  // Fetch step data when form fields are available
  React.useEffect(() => {
    // Try multiple sources for workflowId and userId
    const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    // Fallback test values (same as EntityProfileStep)
    const testWorkflowId = currentWorkflowId;
    const testUserId = userId;

    // console.log('Address step data fetch check:', {
    //   currentWorkflowId,
    //   userId,
    //   testWorkflowId,
    //   testUserId,
    //   flattenedFieldsCount: flattenedFields?.length || 0,
    //   loading,
    //   stepDataFetched: stepDataFetched.current,
    //   stepDataLoading,
    // });

    // Only fetch step data if form fields are available (fields API has completed)
    // Add check to prevent multiple API calls
    if (
      testWorkflowId &&
      testUserId &&
      flattenedFields &&
      flattenedFields.length > 0 &&
      !loading &&
      !stepDataFetched.current &&
      !stepDataLoading
    ) {
      // console.log(
      //   '✅ Address form fields loaded, now fetching step data for addresses:',
      //   {
      //     stepKey: 'addresses',
      //     workflowId: testWorkflowId,
      //     userId: testUserId,
      //     formFieldsCount: flattenedFields.length,
      //     usingTestValues: !currentWorkflowId || !userId,
      //   }
      // );

      stepDataFetched.current = true; // Mark as fetched to prevent loops

      dispatch(
        fetchStepData({
          stepKey: 'addresses',
          workflowId: testWorkflowId,
          userId: testUserId,
        })
      );
      // formValues = undefined;
      console.log('formValues=====', formValues);
    } else {
      // console.log(
      //   '⏳ Waiting for address form fields to load before fetching step data:',
      //   {
      //     workflowId: currentWorkflowId,
      //     userId,
      //     testWorkflowId,
      //     testUserId,
      //     flattenedFieldsAvailable: flattenedFields?.length || 0,
      //     loading,
      //     error,
      //   }
      // );
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
    console.log('📋 AddressDetailsStep - Step data effect triggered:', {
      hasStepData: !!stepData,
      stepDataKeys: stepData?.data ? Object.keys(stepData.data) : [],
      stepDataLength: stepData?.data ? Object.keys(stepData.data).length : 0,
      currentFormValuesCount: Object.keys(formValues).length,
      existingFormValues: Object.keys(formValues).filter(
        (key) =>
          formValues[key] !== null &&
          formValues[key] !== undefined &&
          formValues[key] !== ''
      ),
      stepDataStructure: stepData,
      formValuesStructure: formValues,
    });

    if (stepData && stepData.data && Object.keys(stepData.data).length > 0) {
      console.log(
        '✅ Populating address form fields with step data:',
        stepData.data
      );

      // Populate each field from step data
      Object.entries(stepData.data).forEach(([fieldName, fieldValue]) => {
        if (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== ''
        ) {
          console.log(`📝 Setting address field ${fieldName} = ${fieldValue}`);
          // Convert value to string for form compatibility
          const stringValue =
            typeof fieldValue === 'string' ? fieldValue : String(fieldValue);
          dispatch(updateFormValue({ fieldName, value: stringValue }));
        }
      });

      // Process geographical fields using common utility
      processGeographicalFields(
        flattenedFields,
        stepData,
        formValues,
        dispatch,
        fetchDependentDropdownOptions
      );
    } else if (
      stepData &&
      (!stepData.data || Object.keys(stepData.data).length === 0)
    ) {
      console.log(
        '⚠️ AddressDetailsStep - API returned empty data (step: {}), checking existing form values:',
        {
          apiResponse: stepData,
          currentFormValues: formValues,
          allNonEmptyValues: Object.entries(formValues).filter(
            ([, value]) => value !== null && value !== undefined && value !== ''
          ),
          totalFormValuesCount: Object.keys(formValues).length,
        }
      );

      // If API returned no data but we have existing ADDRESS form values, preserve them
      // Define address-specific field patterns to avoid preserving other step data
      const addressFieldPatterns = [
        'address',
        'pincode',
        'pin',
        'state',
        'district',
        'country',
        'correspondence',
        'register',
        'current',
        'permanent',
        'city',
        'locality',
        'street',
        'building',
        'area',
        'location',
      ];

      // Filter formValues to only include address-related fields
      const addressFormValues = Object.entries(formValues).filter(
        ([fieldName]) =>
          addressFieldPatterns.some((pattern) =>
            fieldName.toLowerCase().includes(pattern.toLowerCase())
          )
      );

      const hasExistingAddressValues = addressFormValues.some(
        ([, value]) => value !== null && value !== undefined && value !== ''
      );

      console.log('Address field filtering:', {
        allFormValues: formValues,
        addressFormValues: Object.fromEntries(addressFormValues),
        hasExistingAddressValues,
        addressFieldCount: addressFormValues.length,
      });

      if (hasExistingAddressValues) {
        console.log(
          '✅ Preserving existing form values (no API data to overwrite)'
        );
        // Process geographical fields even with existing data to ensure dropdowns work
        // Create safe stepData object with empty data to prevent undefined errors
        const safeStepData = { ...stepData, data: {} };
        processGeographicalFields(
          flattenedFields,
          safeStepData,
          formValues,
          dispatch,
          fetchDependentDropdownOptions
        );
      } else {
        console.log('ℹ️ No API data and no existing form values - clean slate');
        // Still process geographical fields to ensure dropdowns work
        // const safeStepData = { ...stepData, data: {} };
        // processGeographicalFields(
        //   flattenedFields,
        //   safeStepData,
        //   formValues,
        //   dispatch,
        //   fetchDependentDropdownOptions
        // );
      }
    } else if (!stepData) {
      console.log(
        '🔄 AddressDetailsStep - No step data yet, waiting for API response...'
      );
    }

    // Log documents if available
    if (stepDocuments && stepDocuments.length > 0) {
      console.log('📄 Available address documents:', stepDocuments);
    }
  }, [stepData, stepDocuments]);

  // Fetch documents when step documents are available
  React.useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0) {
      console.log('Fetching documents for address step data:', stepDocuments);
      console.log('Current fetched documents:', fetchedDocuments);

      stepDocuments.forEach((doc) => {
        // Only fetch if not already fetched (handle undefined fetchedDocuments)
        if (!fetchedDocuments || !fetchedDocuments[doc.id]) {
          console.log(`🔄 Fetching address document: ${doc.id} (${doc.type})`);
          dispatch(fetchDocument(doc.id));
        } else {
          console.log(`✅ Address document already fetched: ${doc.id}`);
        }
      });
    }
  }, [dispatch, stepDocuments, fetchedDocuments]);

  // Handle form save with API submission
  const handleSave = useCallback(
    async (formData: Record<string, unknown>) => {
      // console.log('Address Details Step - Form data received:', formData);
      // console.log('Address form field names:', Object.keys(formData));
      // console.log(
      //   'Address form field values:',
      //   Object.entries(formData).map(([key, value]) => ({
      //     field: key,
      //     value: value instanceof File ? `File(${value.name})` : value,
      //     type: typeof value,
      //   }))
      // );

      // Try multiple sources for workflowId and userId
      const currentWorkflowId = authWorkflowId || userDetails?.workflowId;
      const userId = userDetails?.userId || userDetails?.id;

      // console.log('Address auth state debug:', {
      //   authWorkflowId,
      //   userDetailsWorkflowId: userDetails?.workflowId,
      //   userDetailsUserId: userDetails?.userId,
      //   userDetailsId: userDetails?.id,
      //   finalWorkflowId: currentWorkflowId,
      //   finalUserId: userId,
      //   fullUserDetails: userDetails,
      // });

      if (!currentWorkflowId || !userId) {
        console.error('Missing required data for address submission:', {
          workflowId: currentWorkflowId,
          userId,
          userDetails,
        });
        alert('Missing workflow ID or user ID. Please try logging in again.');
        return;
      }

      // console.log('Submitting address details with:', {
      //   workflowId: currentWorkflowId,
      //   userId,
      //   formDataKeys: Object.keys(formData),
      // });

      try {
        // Reset previous submission state
        dispatch(resetSubmissionState());

        // Submit address details
        const result = await dispatch(
          submitAddressDetails({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (flattenedFields || []) as FormField[],
          })
        ).unwrap();

        console.log('✅ Address details submission successful:', result);

        // Call original onSave callback if provided
        if (onSave) {
          onSave(formData);
        }

        // Move to next step if provided
        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Address details submission failed:', error);
        // Error is already handled by Redux slice
        // Additional safety: ensure error doesn't propagate as object
        if (error && typeof error === 'object') {
          console.error(
            'Address error object details:',
            JSON.stringify(error, null, 2)
          );
        }
      }
    },
    [dispatch, userDetails, authWorkflowId, flattenedFields, onSave, onNext]
  );

  // Special checkbox handlers for "same as registered address" functionality
  const specialCheckboxHandlers = {
    correspondence_same_as_registered: (checked: boolean) => {
      console.log(
        '🔄 Correspondence same as registered checkbox clicked:',
        checked
      );
      console.log('📋 Current form values:', formValues);

      dispatch(
        updateFormValue({
          fieldName: 'correspondence_same_as_registered',
          value: checked,
        })
      );

      if (checked) {
        console.log('✅ Copying registered address to correspondence address');

        // Try multiple copying strategies
        // 1. Copy using section prefixes
        dispatch(
          copySectionValues({
            fromSection: 'register_address',
            toSection: 'correspondence_address',
          })
        );

        dispatch(
          copySectionValues({
            fromSection: 'registered_address',
            toSection: 'correspondence_address',
          })
        );

        // 2. Smart copy using field patterns
        dispatch(
          copyAddressFields({
            fromGroup: 'register',
            toGroup: 'correspondence',
          })
        );

        dispatch(
          copyAddressFields({
            fromGroup: 'registered',
            toGroup: 'correspondence',
          })
        );

        // 3. Precise field mapping based on actual field structure
        dispatch(copyRegisterToCorrespondenceFields());
      } else {
        console.log('🗑️ Clearing correspondence address values');
        // Clear correspondence address values
        dispatch(clearSectionValues('correspondence_address'));
      }
    },
  };

  const updateFieldsSameAsRegisteredAddress = (
    checked: string | boolean | File | null
  ) => {
    const dependentFields = [
      'correspondenceCountry',
      'correspondenceState',
      'correspondenceDistrict',
      'correspondencePincode',
    ];
    const conditionalLogic = groupedFields.correspondenceaddress.fields.find(
      (x) => x.fieldName === 'sameAsCorrespondenceAddress'
    )?.conditionalLogic;
    if (conditionalLogic && conditionalLogic?.length > 0) {
      console.log(conditionalLogic[0].then);
      const { autoFillFields, selectedFields } = conditionalLogic[0].then;
      if (!autoFillFields || !selectedFields) return;
      if (checked) {
        try {
          autoFillFields.forEach((correspondenceField, index) => {
            const registerField = selectedFields[index];
            // Check both fields exist in formValues
            dispatch(
              updateFormValue({
                fieldName: correspondenceField,
                value: formValues[registerField],
              })
            );
            if (dependentFields.includes(correspondenceField)) {
              const field = groupedFields.correspondenceaddress.fields.find(
                (field) =>
                  field.fieldAttributes?.urldata === correspondenceField
              );
              if (field?.fieldAttributes) {
                const url = field.fieldAttributes?.url ?? '';
                const updatedUrl = url.replace(
                  `{${field.fieldAttributes?.urldata}}`,
                  formValues[registerField] !== null &&
                    formValues[registerField] !== undefined
                    ? String(formValues[registerField])
                    : ''
                );
                dispatch(
                  fetchDependentDropdownOptions({
                    // url: `${CMS_URL}${updatedUrl}`,
                    url: updatedUrl,
                    method: field.fieldAttributes.method || 'GET',
                    fieldId: field.id,
                    fieldName: field.fieldName ?? '',
                    headers: {},
                    payload: field.fieldAttributes.payloadTemplate || null,
                    responseMapping: field.fieldAttributes.responseMapping,
                  })
                );
              }
            }
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[correspondenceField];
              return newErrors;
            });
          });
        } catch {
          autoFillFields.forEach((correspondenceField) => {
            dispatch(
              updateFormValue({
                fieldName: correspondenceField,
                value: '',
              })
            );
          });
        }
      } else {
        autoFillFields.forEach((correspondenceField) => {
          dispatch(
            updateFormValue({
              fieldName: correspondenceField,
              value: '',
            })
          );
        });
      }
    }
  };

  // Custom field disabled logic
  const getFieldDisabled = (field: { fieldGroup?: string }) => {
    // Disable correspondence address fields if "same as registered" is checked
    if (field.fieldGroup === 'correspondence_address') {
      return formValues['correspondence_same_as_registered'] === true;
    }
    return false;
  };

  // Extract field errors if submission error is a field validation error (must be before conditional returns)
  const fieldErrors = React.useMemo(() => {
    if (
      submissionError &&
      typeof submissionError === 'object' &&
      'type' in submissionError &&
      (submissionError as AddressDetailsSubmissionError).type ===
        'FIELD_VALIDATION_ERROR'
    ) {
      return (
        (submissionError as AddressDetailsSubmissionError).fieldErrors || {}
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
      const errorObj = submissionError as AddressDetailsSubmissionError;
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

  // Show loading state during submission, form data fetching, or step data fetching
  // if (submissionLoading || loading || stepDataLoading) {
  //   return (
  //     <Box
  //       sx={{
  //         display: 'flex',
  //         justifyContent: 'space-between',
  //         alignItems: 'center',
  //         mb: { xs: 1, sm: 1.5, md: 2 },
  //         flexWrap: 'wrap',
  //         gap: 1,
  //       }}
  //     >
  //       <CircularProgress size={40} />
  //       <Box>
  //         {loading
  //           ? 'Loading address details form...'
  //           : stepDataLoading
  //             ? 'Loading saved address data...'
  //             : 'Submitting address details...'}
  //       </Box>
  //     </Box>
  //   );
  // }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading address details: {error}
      </Alert>
    );
  }

  // Don't render if no configuration is loaded
  if (
    !configuration ||
    !groupedFields ||
    Object.keys(groupedFields).length === 0
  ) {
    return null;
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
          <DynamicExpandCollapseForm
            groupedFields={groupedFields}
            configuration={configuration}
            formValues={formValues}
            dispatch={dispatch}
            fields={flattenedFields}
            fetchDropdownOptionsAction={fetchDependentDropdownOptions}
            clearDependentFieldOptions={clearDependentFieldOptions}
            updateFormValue={(payload) => {
              dispatch(updateFormValue(payload));
              if (
                payload.fieldName === 'registerState' ||
                payload.fieldName === 'correspondenceState'
              ) {
                const key =
                  payload.fieldName === 'correspondenceState'
                    ? 'correspondence'
                    : 'register';
                const countryValue = formValues[`${key}Country`]
                  ?.toString()
                  .toLocaleLowerCase();
                if (countryValue === 'india' || countryValue === 'indian') {
                  const updateObject = { ...formValues };
                  updateObject[`${key}Pincode`] = '';
                  updateObject[`${key}District`] = '';
                  updateObject[`${key}State`] = payload.value;

                  dispatch(updateFormValueObject(updateObject));
                  const pincodeField = flattenedFields.find(
                    (x) => x.fieldName === `${key}Pincode`
                  );
                  if (pincodeField) {
                    dispatch(
                      updateFieldOptions({
                        fieldId: pincodeField.id,
                        options: [],
                      })
                    );
                  }
                }
              }
              if (
                /^correspondence/i.test(payload.fieldName) &&
                payload.fieldName !== 'sameAsCorrespondenceAddress'
              ) {
                dispatch(
                  updateFormValue({
                    fieldName: 'sameAsCorrespondenceAddress',
                    value: false,
                  })
                );
              }

              if (payload.fieldName === 'sameAsCorrespondenceAddress') {
                updateFieldsSameAsRegisteredAddress(payload.value);
              }
            }}
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
            specialCheckboxHandlers={specialCheckboxHandlers}
            getFieldDisabled={getFieldDisabled}
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

export default AddressDetailsStep;
