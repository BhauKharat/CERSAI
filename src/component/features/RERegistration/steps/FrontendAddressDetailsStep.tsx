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
  clearStepData,
} from '../slice/stepDataSlice';
import { updateFormValue, setFieldsFromConfig } from '../slice/formSlice';
import { FieldErrorProvider } from '../context/FieldErrorContext';
import { AddressDetailsSubmissionError } from '../types/addressDetailsSubmissionTypes';
import { buildValidationSchema } from '../../../../utils/formValidation';
// Frontend configuration imports
import { useFrontendFormConfig } from '../frontendConfig/utils/useFrontendFormConfig';
import { addressDetailsConfig } from '../frontendConfig/configs/addressDetailsConfig';
import { FormField } from '../types/formTypes';
import { processGeographicalFields, replaceUrlParameters } from '../utils/geographicalDataUtils';
import {
  fetchDependentDropdownOptions,
  clearDependentFieldOptions,
  selectAddressDetailsDropdownOptions,
} from '../slice/addressDetailsSlice';
import { CMS_URL } from '../../../../Constant';

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

interface FrontendAddressDetailsStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  url?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const FrontendAddressDetailsStep: React.FC<FrontendAddressDetailsStepProps> = ({
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
  } = useFrontendFormConfig(addressDetailsConfig);

  // Redux selectors
  const submissionLoading = useSelector(selectAddressSubmissionLoading);
  const submissionError = useSelector(selectAddressSubmissionError);

  // Clear submission errors on component mount
  React.useEffect(() => {
    console.log('🧹 Clearing Address submission errors on component mount');
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
  const reduxDropdownOptions = useSelector(selectAddressDetailsDropdownOptions);

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
        '✅ Setting frontend Address config fields in Redux:',
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
      console.log('Address Details Step - Form data received:', formData);

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
          submitAddressDetails({
            formValues: formData as Record<string, string | File | null>,
            workflowId: currentWorkflowId,
            userId,
            formFields: (flattenedFields || []) as FormField[],
          })
        ).unwrap();

        console.log('✅ Address details submission successful:', result);

        if (onSave) {
          onSave(formData);
        }

        if (onNext) {
          onNext();
        }
      } catch (error) {
        console.error('Address details submission failed:', error);
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
        '✅ Frontend Address form fields loaded, now fetching step data for addresses:',
        {
          stepKey: 'addresses',
          workflowId: testWorkflowId,
          userId: testUserId,
          formFieldsCount: flattenedFields.length,
        }
      );

      stepDataFetched.current = true;
      dispatch(
        fetchStepData({
          stepKey: 'addresses',
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

  // Reset the fetch flags when component unmounts
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
      console.log('Populating Address form fields with step data:', stepData.data);

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
      console.log('🌍 Processing geographical fields for Address Details (one-time)');
      geoFieldsProcessed.current = true;
      
      // Process geographical fields using common utility
      // Use stepData.data as the values source to avoid dependency on formValues
      processGeographicalFields(
        baseFields,
        stepData,
        stepData.data as Record<string, unknown>, // Use stepData instead of formValues
        dispatch,
        fetchDependentDropdownOptions
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

  // Special checkbox handlers for "same as registered address" functionality
  const specialCheckboxHandlers = {
    sameAsCorrespondenceAddress: (checked: boolean) => {
      console.log(
        '🔄 Correspondence same as registered checkbox clicked:',
        checked
      );

      dispatch(
        updateFormValue({
          fieldName: 'sameAsCorrespondenceAddress',
          value: checked ? 'true' : 'false',
        })
      );

      const correspondenceFields = [
        'correspondenceLine1',
        'correspondenceLine2',
        'correspondenceLine3',
        'correspondenceCountry',
        'correspondenceState',
        'correspondenceDistrict',
        'correspondenceCity',
        'correspondencePincode',
        'correspondencePincodeOther',
        'correspondenceDigipin',
      ];

      if (checked) {
        // Copy registered address fields to correspondence address
        const registeredFields = [
          'registerLine1',
          'registerLine2',
          'registerLine3',
          'registerCountry',
          'registerState',
          'registerDistrict',
          'registerCity',
          'registerPincode',
          'registerPincodeOther',
          'registerDigipin',
        ];

        // First, copy non-dropdown fields (text fields)
        const textFieldMappings = [
          { from: 'registerLine1', to: 'correspondenceLine1' },
          { from: 'registerLine2', to: 'correspondenceLine2' },
          { from: 'registerLine3', to: 'correspondenceLine3' },
          { from: 'registerCity', to: 'correspondenceCity' },
          { from: 'registerDigipin', to: 'correspondenceDigipin' },
          { from: 'registerPincodeOther', to: 'correspondencePincodeOther' },
        ];

        textFieldMappings.forEach(({ from, to }) => {
          const value = formValues[from];
          if (value !== null && value !== undefined && value !== '') {
            dispatch(
              updateFormValue({
                fieldName: to,
                value: String(value),
              })
            );
          }
        });

        // Copy country first
        const registerCountry = formValues['registerCountry'];
        if (registerCountry !== null && registerCountry !== undefined && registerCountry !== '') {
          dispatch(
            updateFormValue({
              fieldName: 'correspondenceCountry',
              value: String(registerCountry),
            })
          );
        }

        // Copy state and then fetch dependent options
        const registerState = formValues['registerState'];
        const registerDistrict = formValues['registerDistrict'];
        const registerPincode = formValues['registerPincode'];
        
        if (registerState !== null && registerState !== undefined && registerState !== '') {
          // Copy state first
          dispatch(
            updateFormValue({
              fieldName: 'correspondenceState',
              value: String(registerState),
            })
          );

          // Find correspondence district and pincode fields to fetch their options
          const correspondenceDistrictField = baseFields.find(
            (f) => f.fieldName === 'correspondenceDistrict'
          );
          const correspondencePincodeField = baseFields.find(
            (f) => f.fieldName === 'correspondencePincode'
          );

          // Create updated form values with copied state for URL processing
          const updatedFormValues = {
            ...formValues,
            correspondenceState: registerState,
            correspondenceCountry: registerCountry || formValues['correspondenceCountry'],
          };

          // Fetch district options if field has URL
          if (correspondenceDistrictField?.fieldAttributes?.url) {
            const processedUrl = replaceUrlParameters(
              correspondenceDistrictField.fieldAttributes.url,
              updatedFormValues
            );

            if (!processedUrl.includes('{')) {
              const fullUrl = processedUrl.startsWith('http')
                ? processedUrl
                : `${CMS_URL}${processedUrl}`;

              dispatch(
                fetchDependentDropdownOptions({
                  url: fullUrl,
                  fieldId: correspondenceDistrictField.id,
                  fieldName: 'correspondenceDistrict',
                  responseMapping:
                    correspondenceDistrictField.fieldAttributes.responseMapping || {
                      label: 'label',
                      value: 'value',
                    },
                })
              ).then(() => {
                // After district options are fetched, copy district and fetch pincode options
                if (
                  registerDistrict !== null &&
                  registerDistrict !== undefined &&
                  registerDistrict !== ''
                ) {
                  dispatch(
                    updateFormValue({
                      fieldName: 'correspondenceDistrict',
                      value: String(registerDistrict),
                    })
                  );

                  // Fetch pincode options
                  if (correspondencePincodeField?.fieldAttributes?.url) {
                    const updatedFormValuesForPincode = {
                      ...updatedFormValues,
                      correspondenceDistrict: registerDistrict,
                    };

                    const processedPincodeUrl = replaceUrlParameters(
                      correspondencePincodeField.fieldAttributes.url,
                      updatedFormValuesForPincode
                    );

                    if (!processedPincodeUrl.includes('{')) {
                      const fullPincodeUrl = processedPincodeUrl.startsWith('http')
                        ? processedPincodeUrl
                        : `${CMS_URL}${processedPincodeUrl}`;

                      dispatch(
                        fetchDependentDropdownOptions({
                          url: fullPincodeUrl,
                          fieldId: correspondencePincodeField.id,
                          fieldName: 'correspondencePincode',
                          responseMapping:
                            correspondencePincodeField.fieldAttributes.responseMapping || {
                              label: 'label',
                              value: 'value',
                            },
                        })
                      ).then(() => {
                        // Finally, copy pincode after options are fetched
                        if (
                          registerPincode !== null &&
                          registerPincode !== undefined &&
                          registerPincode !== ''
                        ) {
                          dispatch(
                            updateFormValue({
                              fieldName: 'correspondencePincode',
                              value: String(registerPincode),
                            })
                          );
                        }
                      }).catch(() => {
                        // If fetching fails, still try to copy the value
                        if (
                          registerPincode !== null &&
                          registerPincode !== undefined &&
                          registerPincode !== ''
                        ) {
                          dispatch(
                            updateFormValue({
                              fieldName: 'correspondencePincode',
                              value: String(registerPincode),
                            })
                          );
                        }
                      });
                    } else {
                      // If URL processing fails, just copy the value
                      if (
                        registerPincode !== null &&
                        registerPincode !== undefined &&
                        registerPincode !== ''
                      ) {
                        dispatch(
                          updateFormValue({
                            fieldName: 'correspondencePincode',
                            value: String(registerPincode),
                          })
                        );
                      }
                    }
                  } else {
                    // If no URL for pincode, just copy the value
                    if (
                      registerPincode !== null &&
                      registerPincode !== undefined &&
                      registerPincode !== ''
                    ) {
                      dispatch(
                        updateFormValue({
                          fieldName: 'correspondencePincode',
                          value: String(registerPincode),
                        })
                      );
                    }
                  }
                }
              }).catch(() => {
                // If fetching district options fails, still try to copy the values
                if (
                  registerDistrict !== null &&
                  registerDistrict !== undefined &&
                  registerDistrict !== ''
                ) {
                  dispatch(
                    updateFormValue({
                      fieldName: 'correspondenceDistrict',
                      value: String(registerDistrict),
                    })
                  );
                }
                if (
                  registerPincode !== null &&
                  registerPincode !== undefined &&
                  registerPincode !== ''
                ) {
                  dispatch(
                    updateFormValue({
                      fieldName: 'correspondencePincode',
                      value: String(registerPincode),
                    })
                  );
                }
              });
            } else {
              // If URL processing fails, still copy the values
              if (
                registerDistrict !== null &&
                registerDistrict !== undefined &&
                registerDistrict !== ''
              ) {
                dispatch(
                  updateFormValue({
                    fieldName: 'correspondenceDistrict',
                    value: String(registerDistrict),
                  })
                );
              }
              if (
                registerPincode !== null &&
                registerPincode !== undefined &&
                registerPincode !== ''
              ) {
                dispatch(
                  updateFormValue({
                    fieldName: 'correspondencePincode',
                    value: String(registerPincode),
                  })
                );
              }
            }
          } else {
            // If no URL for district field, just copy values directly
            if (
              registerDistrict !== null &&
              registerDistrict !== undefined &&
              registerDistrict !== ''
            ) {
              dispatch(
                updateFormValue({
                  fieldName: 'correspondenceDistrict',
                  value: String(registerDistrict),
                })
              );
            }

            if (
              registerPincode !== null &&
              registerPincode !== undefined &&
              registerPincode !== ''
            ) {
              dispatch(
                updateFormValue({
                  fieldName: 'correspondencePincode',
                  value: String(registerPincode),
                })
              );
            }
          }
        } else {
          // If no state, just copy remaining dropdown values directly
          if (
            registerDistrict !== null &&
            registerDistrict !== undefined &&
            registerDistrict !== ''
          ) {
            dispatch(
              updateFormValue({
                fieldName: 'correspondenceDistrict',
                value: String(registerDistrict),
              })
            );
          }

          if (
            registerPincode !== null &&
            registerPincode !== undefined &&
            registerPincode !== ''
          ) {
            dispatch(
              updateFormValue({
                fieldName: 'correspondencePincode',
                value: String(registerPincode),
              })
            );
          }
        }
      } else {
        // Clear/reset all correspondence address fields when unchecked
        console.log('🧹 Clearing correspondence address fields');
        correspondenceFields.forEach((corrField) => {
          dispatch(
            updateFormValue({
              fieldName: corrField,
              value: '',
            })
          );
        });
      }
    },
  };

  // Custom field disabled logic
  const getFieldDisabled = (field: { fieldGroup?: string }) => {
    // Disable correspondence address fields if "same as registered" is checked
    if (field.fieldGroup === 'correspondenceAddress') {
      return formValues['sameAsCorrespondenceAddress'] === true;
    }
    return false;
  };

  // Extract field errors if submission error is a field validation error
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
            fetchDropdownOptionsAction={fetchDependentDropdownOptions}
            clearDependentFieldOptions={clearDependentFieldOptions}
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

export default FrontendAddressDetailsStep;

