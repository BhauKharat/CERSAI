/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { Alert, CircularProgress } from '@mui/material';
import * as Yup from 'yup';
import { StepContent } from './../DynamicForm.styles';
import { buildValidationSchema } from '../../../../utils/formValidation';
import { extractOTPFields } from './../utils/formFieldUtils';
import {
  LabeledTextField,
  LabeledDropDown,
  LabeledTextFieldWithUpload,
  LabeledDate,
  UploadButton,
} from './../CommonComponent';
import FormActionButtons from './../CommonComponent/ClearAndSaveActions';
import OTPVerificationModal from '../../../ui/Modal/OTPVerificationModal';
import { useFieldError } from './../context/FieldErrorContext';
import {
  fetchFormFields,
  fetchDropdownOptions,
  updateFormValue,
  clearForm,
  setStaticDropdownOptions,
  setFieldError,
  clearFieldError,
  clearAllErrors,
  selectFormFields,
  selectFormValues,
  selectFieldErrors,
  selectFormLoading,
  selectFormError,
  selectDropdownOptions,
  selectCurrentStepFields,
  selectFormConfiguration,
  updateFormValueWithoutvalidateField,
  updateFieldValidation,
} from './../slice/formSlice';
import { FormField, DropdownOption } from './../types/formTypes';
import {
  DynamicFormContainer,
  FormTitle,
  ThreeColumnGrid,
  FieldContainer,
  LoadingContainer,
  LoadingText,
  AlertContainer,
} from './../DynamicForm.styles';
import LabeledTextFieldWithVerify from './../CommonComponent/LabeledTextFieldWithVerify';
import { useAppDispatch } from '../../../admin-features/app/hooks';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { OTPSend } from '../../Authenticate/slice/authSlice';
import {
  selectStepDocuments,
  updateFetchedDocument,
  updateStepDocument,
} from './../slice/stepDataSlice';
import { useModifiableFields } from 'hooks/useModifiableFields';
import { validatePANForConstitution } from '../updateSteps/formValidation';

interface TrackStatusDynamicFormProps {
  onSave?: (formData: Record<string, unknown>) => void;
  urlDynamic?: string;
  existingDocuments?: Record<string, any>; // FetchedDocument from stepDataTypes
  documentFieldMapping?: Record<string, string>; // Maps field names to document IDs
  loading?: boolean; // External loading state to override internal loading
  hasStepData?: boolean; // Indicates if fetchStepData API returned data
}

const TrackStatusDynamicForm: React.FC<TrackStatusDynamicFormProps> = ({
  onSave,
  urlDynamic = '',
  existingDocuments = {},
  documentFieldMapping = {},
  loading: externalLoading,
  hasStepData = false,
}) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const fields = useSelector(selectFormFields);
  const formValues = useSelector(selectFormValues);
  const stepDocuments = useSelector(selectStepDocuments);
  const fieldErrors = useSelector(selectFieldErrors);
  const loading = useSelector(selectFormLoading);
  const error = useSelector(selectFormError);
  const dropdownOptions = useSelector(selectDropdownOptions);
  const { isModifiableField } = useModifiableFields();

  // State to track auto-populated fields and their original values
  // const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(
  //   new Set()
  // );
  const authState = useSelector((state: any) => state.auth);
  const workflowId =
    authState?.workflowId || authState?.userDetails?.workflowId;
  const [ckycVerifiedValue, setCkycVerifiedValue] = useState<string>('');
  const [citizenshipVerifiedValue, setCitizenshipVerifiedValue] =
    useState<string>('');
  const [disableValidateButton, setDisableValidateButton] = useState<
    boolean | undefined
  >();

  // Monitor CKYC and citizenship changes to reset auto-populated fields
  useEffect(() => {
    const currentCkycValue = String(formValues['hoiCkycNo'] || '');
    const currentCitizenshipValue = String(formValues['citizenship'] || '');

    // If CKYC number changed from verified value, reset auto-populated fields
    if (ckycVerifiedValue && currentCkycValue !== ckycVerifiedValue) {
      console.log(
        '🔄 CKYC number changed from verified value, enabling fields for editing'
      );
      console.log(
        'Previous verified CKYC:',
        ckycVerifiedValue,
        '→ Current CKYC:',
        currentCkycValue
      );
      // setAutoPopulatedFields(new Set());
      setCkycVerifiedValue('');
      setCitizenshipVerifiedValue('');
      console.log('Fields like mobile and email are now enabled for editing');
    }

    // If citizenship changed from verified value, reset auto-populated fields
    if (
      citizenshipVerifiedValue &&
      currentCitizenshipValue !== citizenshipVerifiedValue
    ) {
      console.log(
        '🔄 Citizenship changed from verified value, enabling fields for editing'
      );
      console.log(
        'Previous verified citizenship:',
        citizenshipVerifiedValue,
        '→ Current citizenship:',
        currentCitizenshipValue
      );
      // setAutoPopulatedFields(new Set());
      setCkycVerifiedValue('');
      setCitizenshipVerifiedValue('');
      console.log('Fields like mobile and email are now enabled for editing');
    }
  }, [
    formValues,
    ckycVerifiedValue,
    citizenshipVerifiedValue,
    setCkycVerifiedValue,
    setCitizenshipVerifiedValue,
    // setAutoPopulatedFields,
  ]);

  React.useEffect(() => {
    let disabled;
    // Scenario 1: No step data found (first time)

    if (!hasStepData) {
      // Enable save & next only after OTP validation
      disabled =
        !isFormValid ||
        (configuration?.submissionSettings?.validateButton && !isOTPValidated);

      console.log('🔍 Save button state (no step data):', {
        hasStepData,
        isFormValid,
        isOTPValidated,
        validateButtonRequired:
          configuration?.submissionSettings?.validateButton,
        disabled,
      });
      // setDisableValidateButton(disabled);
      setDisableValidateButton(
        disabled === undefined ? undefined : Boolean(disabled)
      );
    }

    // Scenario 2: Step data found (returning user)
    // Enable both buttons if form is valid
    disabled = !isFormValid;

    console.log('🔍 Save button state (has step data):', {
      hasStepData,
      isFormValid,
      disabled,
    });

    setDisableValidateButton(disabled);
  }, [hasStepData]);

  // Helper function to check if a field should be disabled
  // const isFieldAutoPopulated = useCallback(
  //   (fieldName: string) => {
  //     return autoPopulatedFields.has(fieldName);
  //   },
  //   [autoPopulatedFields]
  // );

  // Helper: compute citizenship + disable logic
  //   const getCitizenshipValue = () => String(formValues?.['hoiCitizenship'] ?? '');
  //   console.log(formValues?.['hoiCitizenship'],"cuuy");

  //   const isCitizenshipIndian = /^(indian)$/i.test(getCitizenshipValue());

  //   // If Indian → disable all except 'hoiCkycNo'. Otherwise use your existing auto-populate rule.
  //   const shouldDisableField = (fieldName: string, fieldFormType?: string) => {
  //       // ✅ Only apply rules for RE_hoi (trim to be safe)
  //   if ((fieldFormType ?? '').trim() !== 'RE_hoi') return false;

  //     if (fieldName === 'hoiCitizenship') return false;
  //     if (isCitizenshipIndian) return fieldName !== 'hoiCkycNo' && fieldName !== 'hoiCitizenship';
  //     console.log(fieldName,"field");

  //     return fieldName === 'hoiCkycNo';
  //   };

  // Field error context from API validation errors
  const { getFieldError } = useFieldError();
  const currentStepFields = useSelector(selectCurrentStepFields);
  const configuration = useSelector(selectFormConfiguration);

  // Local validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [validationSchema, setValidationSchema] = useState<Yup.ObjectSchema<
    Record<string, unknown>
  > | null>(null);

  // Use the reusable validation schema builder
  const validationSchemaBuilder = useMemo(() => buildValidationSchema, []);

  // Helper function to evaluate conditional logic
  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return field.validationRules;
      }

      // Find matching conditional logic
      const matchedLogic = field.conditionalLogic.find((logic: any) => {
        const when = logic.when;
        if (!when?.field) return false;

        const dependentValue = formValues[when.field];
        const operator = when.operator || 'equals';
        const expectedValues = Array.isArray(when.value)
          ? when.value
          : [when.value];

        switch (operator) {
          case 'in':
          case 'equals':
            return expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
          case 'not_in':
          case 'not_equals':
            return !expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
          default:
            return false;
        }
      });

      // If conditional logic matches, merge the conditional validation rules
      if (matchedLogic?.then?.validationRules) {
        return {
          ...field.validationRules,
          ...matchedLogic.then.validationRules,
        };
      }

      return field.validationRules;
    },
    [formValues]
  );

  // Build validation schema when fields or form values change
  useEffect(() => {
    if (fields.length > 0) {
      // Create fields with evaluated conditional logic
      const fieldsWithConditionalLogic = fields.map((field) => ({
        ...field,
        validationRules: evaluateConditionalLogic(field),
      }));

      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    }
  }, [fields, formValues, validationSchemaBuilder, evaluateConditionalLogic]);

  // Fetch form fields on component mount
  useEffect(() => {
    dispatch(fetchFormFields({ url: urlDynamic }));
  }, [dispatch, urlDynamic]);

  // Clear any existing field errors on component mount to prevent old errors from showing
  useEffect(() => {
    console.log('🧹 Clearing field errors on component mount');
    dispatch(clearAllErrors());
    setValidationErrors({});
  }, [dispatch]);

  // Log existing documents for debugging
  useEffect(() => {
    console.log('🔍 TrackStatusDynamicForm document debug:', {
      existingDocuments,
      documentFieldMapping,
      hasDocuments: Object.keys(existingDocuments).length > 0,
      hasMappings: Object.keys(documentFieldMapping).length > 0,
    });
  }, [existingDocuments, documentFieldMapping]);

  // Helper function to filter institutionType options based on regulator
  const getFilteredInstitutionTypeOptions = useCallback(
    (institutionTypeField: FormField, regulatorValue: string) => {
      if (
        !institutionTypeField.fieldOptions ||
        !Array.isArray(institutionTypeField.fieldOptions)
      ) {
        return [];
      }

      // Find the regulator group that matches the selected regulator
      const regulatorGroup = institutionTypeField.fieldOptions.find(
        (group: any) => group.regulator === regulatorValue
      );

      if (!regulatorGroup || !regulatorGroup.types) {
        return [];
      }

      // Convert the types array to dropdown options format
      return regulatorGroup.types.map((type: any) => ({
        label: type.name || type.label || String(type),
        value: type.code || type.value || String(type),
      }));
    },
    []
  );

  // Handle dropdown field changes and fetch dependent options
  const handleDropdownChange = useCallback(
    async (fieldName: string, value: string) => {
      console.log('🔄 handleDropdownChange called:', { fieldName, value });
      dispatch(updateFormValue({ fieldName, value }));

      // Clear validation errors when user makes changes
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        console.log('Cleared validation error for:', fieldName);
        return newErrors;
      });

      // Special handling for regulator field - update institutionType options
      if (fieldName === 'regulator') {
        const institutionTypeField = fields.find(
          (f: FormField) => f.fieldName === 'institutionType'
        );
        if (institutionTypeField) {
          const filteredOptions = getFilteredInstitutionTypeOptions(
            institutionTypeField,
            value
          );
          dispatch(
            setStaticDropdownOptions({
              fieldId: institutionTypeField.id,
              options: filteredOptions,
            })
          );

          const gstinFieldIndex = fields.findIndex(
            (f: FormField) => f.fieldName === 'gstin'
          );
          if (gstinFieldIndex !== -1) {
            // clone fields to avoid direct mutation
            const updatedFields = [...fields];

            // update the GSTIN field
            updatedFields[gstinFieldIndex] = {
              ...updatedFields[gstinFieldIndex],
              validationRules: {
                required: !(value === 'IFSCA'),
              },
            };
            dispatch(clearFieldError('gstin'));

            // dispatch the updated GSTIN field
            dispatch(updateFieldValidation(updatedFields[gstinFieldIndex]));
          }

          // Clear the institutionType value when regulator changes
          dispatch(
            updateFormValueWithoutvalidateField({
              fieldName: 'institutionType',
              value: '',
            })
          );
        }
      }

      // Special handling for constitution - toggle CIN requirement based on company type
      if (fieldName === 'constitution') {
        const cinFieldIndex = fields.findIndex(
          (f: FormField) => f.fieldName === 'cin'
        );

        if (cinFieldIndex !== -1) {
          const constitutionField = fields.find(
            (f: FormField) => f.fieldName === 'constitution'
          );
          const selectedOption = constitutionField?.fieldOptions?.find(
            (opt: DropdownOption | any) =>
              opt.value === value || opt.label === value
          );
          const cinMandatoryConstitutions = [
            'Private Limited Company',
            'Public Limited Company',
            'Section 8 Companies (Companies Act, 2013)',
          ];
          const selectedLabel =
            (selectedOption as any)?.label ||
            (selectedOption as any)?.value ||
            value;
          const shouldRequireCin = cinMandatoryConstitutions.some(
            (item) =>
              String(item).toLowerCase() === String(selectedLabel).toLowerCase()
          );
          const updatedFields = [...fields];
          updatedFields[cinFieldIndex] = {
            ...updatedFields[cinFieldIndex],
            validationRules: {
              ...(updatedFields[cinFieldIndex].validationRules || {}),
              required: shouldRequireCin,
            },
          };
          dispatch(clearFieldError('cin'));
          dispatch(updateFieldValidation(updatedFields[cinFieldIndex]));
        }

        // Re-validate PAN against new Constitution
        const panValue = formValues['pan'];
        if (panValue && typeof panValue === 'string' && panValue.trim()) {
          const panError = validatePANForConstitution(panValue, value);

          if (panError) {
            setValidationErrors((prev) => ({
              ...prev,
              pan: panError,
            }));
          } else {
            // Clear PAN error if it's now valid for the new constitution
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.pan;
              return newErrors;
            });
            dispatch(clearFieldError('pan'));
          }
        }
      }

      // Find the field to check for dependent dropdowns
      const field = fields.find((f: FormField) => f.fieldName === fieldName);
      if (!field) return;

      console.log(`🔄 Dropdown changed: ${fieldName} = ${value}`);

      // Find dependent fields that reference this field in their URL
      const dependentFields = fields.filter((f: FormField) => {
        const url = f.fieldAttributes?.url;
        if (!url) return false;

        // Check for exact field name match
        if (url.includes(`{${fieldName}}`)) {
          return true;
        }

        // Handle field name variations (e.g., registeDistrict vs registerDistrict)
        if (
          fieldName === 'registeDistrict' &&
          url.includes('{registerDistrict}')
        ) {
          console.log(
            `🔧 Found field name mismatch: ${fieldName} -> registerDistrict`
          );
          return true;
        }

        return false;
      });

      console.log(
        `🔗 Found ${dependentFields.length} dependent fields for ${fieldName}:`,
        dependentFields.map((f) => f.fieldName)
      );

      // Debug: Show all field URLs to check for dependencies
      if (
        fieldName.toLowerCase().includes('district') ||
        fieldName.toLowerCase().includes('state')
      ) {
        const allFieldUrls = fields
          .map((f) => ({ name: f.fieldName, url: f.fieldAttributes?.url }))
          .filter((f) => f.url);
        console.log(
          `🔍 All field URLs for ${fieldName} dependency check:`,
          allFieldUrls
        );

        // Check what URLs reference this field
        const referencingFields = allFieldUrls.filter(
          (fieldUrl) => fieldUrl.url && fieldUrl.url.includes(`{${fieldName}}`)
        );
        console.log(
          `🔍 Fields that reference ${fieldName}:`,
          referencingFields
        );
      }

      // Fetch options for dependent fields
      if (dependentFields.length > 0) {
        for (const dependentField of dependentFields) {
          if (dependentField.fieldAttributes?.url) {
            const {
              url: baseUrl,
              method = 'GET',
              headers = {},
              payloadTemplate,
            } = dependentField.fieldAttributes;

            console.log(
              `📡 Fetching options for dependent field: ${dependentField.fieldName}`
            );
            console.log(`🔧 URL Template: ${baseUrl}`);
            console.log(`🔧 Selected Value: ${value}`);

            // Find the selected option to get the correct value for URL
            const selectedOption = field.fieldOptions?.find((opt) => {
              const option = opt as any; // Type assertion for dynamic properties
              return (
                opt.value === value ||
                option.code === value ||
                option.label === value
              );
            });
            console.log(`🔧 Found selected option:`, selectedOption);

            // Determine the correct value to use in URL based on field configuration or option structure
            let urlValue = value; // Default to selected value

            if (selectedOption) {
              const option = selectedOption as any; // Type assertion for dynamic properties
              // For country fields, use the name instead of code for API calls
              if (fieldName.toLowerCase().includes('country') && option.name) {
                urlValue = option.name;
                console.log(`🔧 Using country name for URL: ${urlValue}`);
              }
              // For state fields, use the label instead of value for API calls
              else if (
                fieldName.toLowerCase().includes('state') &&
                option.label
              ) {
                urlValue = option.label;
                console.log(`🔧 Using state label for URL: ${urlValue}`);
              }
              // For district fields, use the label for API calls
              else if (
                fieldName.toLowerCase().includes('district') &&
                option.label
              ) {
                urlValue = option.label;
                console.log(`🔧 Using district label for URL: ${urlValue}`);
              }
            }

            // Handle field name variations in URL replacement
            let processedUrl = baseUrl;
            if (baseUrl.includes(`{${fieldName}}`)) {
              processedUrl = baseUrl.replace(`{${fieldName}}`, urlValue);
            } else if (
              fieldName === 'registeDistrict' &&
              baseUrl.includes('{registerDistrict}')
            ) {
              processedUrl = baseUrl.replace('{registerDistrict}', urlValue);
              console.log(
                `🔧 Using field name mapping: registeDistrict -> registerDistrict`
              );
            }
            console.log(`🔧 Processed URL: ${processedUrl}`);

            dispatch(
              fetchDropdownOptions({
                url: processedUrl,
                method,
                fieldId: dependentField.id,
                headers,
                payload: payloadTemplate,
              })
            );
          }
        }
      }
    },
    [dispatch, fields, getFilteredInstitutionTypeOptions, setValidationErrors]
  );

  // Validate all fields
  const validateAllFields = useCallback(async () => {
    if (!validationSchema) return true;

    // Clear all existing errors before validation
    setValidationErrors({});
    dispatch(clearAllErrors());

    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setValidationErrors({});

      // Also check if there are any existing field errors
      const hasFieldErrors = fieldErrors.length > 0;
      if (hasFieldErrors) {
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  }, [validationSchema, formValues, fieldErrors, dispatch]);

  // Ref to store current validation schema and form values to avoid re-renders
  const validationSchemaRef = useRef(validationSchema);
  const formValuesRef = useRef(formValues);

  useEffect(() => {
    validationSchemaRef.current = validationSchema;
    formValuesRef.current = formValues;
  }, [validationSchema, formValues]);

  useEffect(() => {
    const contactNames = ['hoiMobile', 'hoiEmail'];
    const fieldNames = fields?.map((f) => f.fieldName) || [];

    const hasModifiableContact = contactNames.some(
      (name) => fieldNames.includes(name) && isModifiableField(name)
    );

    // If the condition you mentioned is met, force-enable the validate button
    if (!hasModifiableContact) {
      setDisableValidateButton(true);
    }
  }, [fields, isModifiableField, disableValidateButton]);

  const handleFieldChange = useCallback(
    (fieldName: string, value: string | File | null) => {
      dispatch(updateFormValue({ fieldName, value }));
      if (/mobile|email/i.test(fieldName)) {
        console.log('Field name includes mobile or email');
        setDisableValidateButton(false);
      }

      // Clear validation errors when user types
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        if (fieldName.endsWith('_file')) {
          delete newErrors[fieldName];
        }
        const mainFieldName = fieldName.replace('_file', '');
        delete newErrors[mainFieldName];
        return newErrors;
      });

      // Also clear Redux field errors
      dispatch(clearFieldError(fieldName));
      if (fieldName.endsWith('_file')) {
        dispatch(clearFieldError(fieldName));
      }
      const mainFieldName = fieldName.replace('_file', '');
      dispatch(clearFieldError(mainFieldName));

      // --- Inline validation for mobile/phone fields only ---
      if (typeof value === 'string') {
        const isMobileField = /(mobile|phone)/i.test(fieldName);

        if (isMobileField) {
          // Find field definition
          const fieldDef = fields.find(
            (f: FormField) => f.fieldName === fieldName
          );

          if (fieldDef) {
            let rules = fieldDef.validationRules;

            if (!rules && fieldDef.conditionalLogic) {
              const matchedLogic = fieldDef.conditionalLogic.find(
                (logic: any) => {
                  const when = logic.when;
                  if (!when?.field) return false;
                  const depVal = formValues[when.field];
                  const operator = when.operator || 'equals';
                  const values = Array.isArray(when.value)
                    ? when.value
                    : [when.value];
                  if (operator === 'equals' || operator === 'in') {
                    return values.map(String).includes(String(depVal ?? ''));
                  }
                  return false;
                }
              );

              if (matchedLogic?.then?.validationRules) {
                rules = matchedLogic.then.validationRules;
              } else if (matchedLogic?.else?.validationRules) {
                rules = matchedLogic.else.validationRules;
              }
            }

            // Validate minLength for mobile fields
            if (rules && value.trim()) {
              let errorMessage: string | null = null;

              if (rules.minLength) {
                const minLen = parseInt(String(rules.minLength));
                const digitsOnly = value.replace(/\D/g, '');
                const lengthToCheck = digitsOnly.length;

                if (lengthToCheck < minLen) {
                  errorMessage =
                    rules.minLengthMessage ||
                    `Please enter a valid mobile number (minimum ${minLen} digits)`;
                }
              }

              if (errorMessage) {
                setValidationErrors((prev) => ({
                  ...prev,
                  [fieldName]: errorMessage as string,
                }));
                return;
              }
            }
          }
        }

        // PAN validation based on Constitution
        if (fieldName.toLowerCase() === 'pan' && value.trim()) {
          const constitution = formValues['constitution'] as string;

          if (constitution) {
            const panError = validatePANForConstitution(value, constitution);

            if (panError) {
              setValidationErrors((prev) => ({
                ...prev,
                [fieldName]: panError,
              }));
              return;
            }
          }
        }

        // Email validation - removed inline validation, will be handled by Yup on form submit/validate
        // This prevents stale validation errors from persisting when clicking Validate button
      }

      // Run async Yup validation for non-file fields
      if (
        validationSchemaRef.current &&
        !(value instanceof File) &&
        typeof value === 'string'
      ) {
        (async () => {
          try {
            const currentFormValues = {
              ...formValuesRef.current,
              [fieldName]: value,
            };

            await validationSchemaRef.current!.validateAt(
              fieldName,
              currentFormValues
            );

            dispatch(clearFieldError(fieldName));
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          } catch (err) {
            if (err instanceof Yup.ValidationError) {
              const validationError = err as Yup.ValidationError;
              setValidationErrors((prev) => ({
                ...prev,
                [fieldName]: validationError.message,
              }));
            }
          }
        })();
      }
    },
    [dispatch, fields, formValues]
  );

  // Clear all validation errors on component unmount or page refresh
  useEffect(() => {
    return () => {
      setValidationErrors({});
    };
  }, []);

  // Clear validation errors when form values are reset
  useEffect(() => {
    const hasAnyValue = Object.values(formValues).some(
      (value) =>
        value && (typeof value === 'string' ? value.trim() !== '' : true)
    );

    if (!hasAnyValue) {
      setValidationErrors({});
    }
  }, [formValues]);

  // Clear field values when constitution changes and they're no longer applicable
  useEffect(() => {
    const constitution = formValues['constitution'];
    if (!constitution) return;

    const constitutionStr = String(constitution);
    // Get the constitution label to ensure proper comparison (dropdown stores code, we need label)
    const constitutionLabel = getConstitutionLabel(constitutionStr);
    const isSoleProprietorship = constitutionLabel === 'Sole Proprietorship';
    const isLLP = constitutionLabel === 'Limited Liability Partnership';
    const cinRequiredConstitutions = [
      'Private Limited Company',
      'Public Limited Company',
      'Section 8 Companies (Companies Act, 2013)',
      'D',
      'E',
      'M',
    ];
    const isCinRequired = cinRequiredConstitutions.includes(constitutionLabel);

    // Clear proprietorName if constitution is NOT Sole Proprietorship
    if (!isSoleProprietorship && formValues['proprietorName']) {
      dispatch(
        updateFormValue({
          fieldName: 'proprietorName',
          value: '',
        })
      );
      dispatch(clearFieldError('proprietorName'));
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['proprietorName'];
        return newErrors;
      });
    }

    // Clear CIN if constitution is NOT one of the required types
    if (!isCinRequired && formValues['cin']) {
      dispatch(
        updateFormValue({
          fieldName: 'cin',
          value: '',
        })
      );
      dispatch(clearFieldError('cin'));
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['cin'];
        return newErrors;
      });
    }

    // Clear LLPIN if constitution is NOT Limited Liability Partnership
    if (!isLLP && formValues['llpin']) {
      dispatch(
        updateFormValue({
          fieldName: 'llpin',
          value: '',
        })
      );
      dispatch(clearFieldError('llpin'));
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors['llpin'];
        return newErrors;
      });
    }
  }, [formValues['constitution'], dispatch, fields]);

  const [clearKey, setClearKey] = useState(0);
  const processedFields = useRef(new Set<number>());

  const handleClear = useCallback(() => {
    dispatch(clearForm());
    setValidationErrors({});
    setClearKey((prev) => prev + 1);
    dispatch(updateStepDocument([]));
    dispatch(updateFetchedDocument({}));
    processedFields.current.clear();
    // Reset OTP validation when form is cleared
    setIsOTPValidated(false);
  }, [dispatch]);

  // Helper function to check if a field has an existing document
  const hasExistingDocument = useCallback(
    (fieldName: string): boolean => {
      // Try multiple mapping strategies to find the document ID (same as in prepareFormDataForSubmission)
      let documentId: string | null = null;

      // Strategy 1: Direct field name match
      documentId = documentFieldMapping[fieldName];

      // Strategy 2: Try common field name variations if direct match fails
      if (!documentId) {
        // For file fields, try the base field name (remove _file suffix)
        const baseFieldName = fieldName.replace('_file', '');

        const variations = [
          baseFieldName,
          `${baseFieldName}File`,
          fieldName, // Keep original as fallback
        ];

        for (const variation of variations) {
          if (variation && documentFieldMapping[variation]) {
            documentId = documentFieldMapping[variation];
            console.log(
              `📋 Found existing document for validation using variation "${variation}":`,
              documentId
            );
            break;
          }
        }
      }

      const hasDocument = !!(documentId && existingDocuments[documentId]);

      if (hasDocument) {
        console.log(
          `✅ Validation: Field ${fieldName} has existing document ID:`,
          documentId
        );
      } else {
        console.log(
          `❌ Validation: Field ${fieldName} has no existing document`
        );
        console.log('Available mappings:', documentFieldMapping);
        console.log('Available documents:', Object.keys(existingDocuments));
      }

      return hasDocument;
    },
    [documentFieldMapping, existingDocuments]
  );

  // Helper function to check if a value represents a valid attachment (new file or existing document)
  const hasValidAttachment = useCallback(
    (field: FormField, fileValue: unknown): boolean => {
      // Check for new file upload
      const hasNewFile =
        fileValue &&
        ((typeof fileValue === 'string' && fileValue.trim() !== '') ||
          fileValue instanceof File ||
          (Array.isArray(fileValue) && fileValue.length > 0));

      if (hasNewFile) {
        console.log(`✅ Field ${field.fieldName} has new file:`, fileValue);
        return true;
      }

      // Check for existing document from API
      // For textfield_with_image, we need to check using the file field name
      let fieldNameToCheck = field.fieldName;
      if (field.fieldType === 'textfield_with_image') {
        fieldNameToCheck = field.fieldFileName || `${field.fieldName}_file`;
      }

      const hasExisting = hasExistingDocument(fieldNameToCheck);
      if (hasExisting) {
        console.log(
          `✅ Field ${field.fieldName} (checking ${fieldNameToCheck}) has existing document from API`
        );
        return true;
      }

      console.log(
        `❌ Field ${field.fieldName} (checking ${fieldNameToCheck}) has no valid attachment`
      );
      return false;
    },
    [hasExistingDocument]
  );

  // Check if all mandatory fields are filled and files are attached
  const isFormValid = useMemo(() => {
    if (!currentStepFields.length) return false;

    const validationResults = currentStepFields.map((field) => {
      const value = formValues[field.fieldName];
      // const rules =
      //   field.validationRules ||
      //   field?.conditionalLogic?.[0]?.then?.validationRules;
      const rules = evaluateConditionalLogic(field) || field.validationRules;

      // Check if field is required
      const isRequired =
        rules?.required === true || String(rules?.required) === 'true';

      if (!isRequired) return true; // Non-required fields are always valid

      if (!isModifiableField(field.fieldName)) {
        return true;
      }

      // Check based on field type
      switch (field.fieldType) {
        case 'textfield':
        case 'dropdown':
          return value && String(value).trim() !== '';

        case 'file':
        case 'textfield_with_image': {
          // For textfield_with_image, check the file field using fieldFileName
          let fileValue = value;
          if (field.fieldType === 'textfield_with_image') {
            const fileFieldName =
              field.fieldFileName || `${field.fieldName}_file`;
            fileValue = formValues[fileFieldName];
          }

          // Enhanced validation: check for both new files and existing documents
          return hasValidAttachment(field, fileValue);
        }

        default:
          return value && String(value).trim() !== '';
      }
    });

    const allValid = validationResults.every((result) => result);
    console.log('🔍 Form validation results:', {
      totalFields: currentStepFields.length,
      validationResults,
      allValid,
      existingDocuments: Object.keys(existingDocuments).length,
      documentFieldMapping: Object.keys(documentFieldMapping).length,
    });

    return allValid;
  }, [
    currentStepFields,
    formValues,
    hasValidAttachment,
    existingDocuments,
    documentFieldMapping,
  ]);

  // Helper function to prepare form data for submission
  const prepareFormDataForSubmission = useCallback(
    (rawFormData: Record<string, unknown>) => {
      const processedData: Record<string, unknown> = {};

      // Get current step fields that were fetched with the current URL
      // Filter fields to only include those loaded from the current step's URL
      const currentStepFieldsOnly = fields.filter((field) =>
        // Only include fields that are currently being rendered
        currentStepFields.some((currentField) => currentField.id === field.id)
      );

      console.log('🔍 Filtering form data for current step only:', {
        totalFormValues: Object.keys(rawFormData).length,
        currentStepFields: currentStepFieldsOnly.length,
        allFields: fields.length,
      });

      Object.entries(rawFormData).forEach(([fieldName, fieldValue]) => {
        // Find the field configuration in current step fields only
        const field = currentStepFieldsOnly.find(
          (f) =>
            f.fieldName === fieldName ||
            (f.fieldType === 'textfield_with_image' &&
              (f.fieldFileName === fieldName ||
                `${f.fieldName}_file` === fieldName))
        );

        if (!field) {
          // Field not in current step, skip it
          console.log(`⏭️ Skipping field not in current step: ${fieldName}`);
          return;
        }

        // Handle file fields specially
        if (
          (field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image') &&
          fieldName.endsWith('_file')
        ) {
          // Check if user uploaded a new file
          if (fieldValue instanceof File) {
            console.log(
              `📤 New file upload for ${fieldName}:`,
              fieldValue.name
            );
            processedData[fieldName] = fieldValue;
          } else if (
            !fieldValue ||
            (typeof fieldValue === 'string' && fieldValue.trim() === '')
          ) {
            // No new file uploaded, check for existing document
            const baseFieldName = fieldName.replace('_file', '');

            // Try multiple mapping strategies to find the document ID
            let documentId: string | null = null;

            // Strategy 1: Direct field name match
            documentId = documentFieldMapping[baseFieldName];

            // Strategy 2: Try common field name variations
            if (!documentId) {
              const variations = [
                baseFieldName,
                `${baseFieldName}File`,
                field.fieldName, // Original field name from form config
                field.fieldFileName, // Specific file field name if available
              ];

              for (const variation of variations) {
                if (variation && documentFieldMapping[variation]) {
                  documentId = documentFieldMapping[variation];
                  console.log(
                    `📋 Found document ID using variation "${variation}":`,
                    documentId
                  );
                  break;
                }
              }
            }

            if (documentId && existingDocuments[documentId]) {
              console.log(
                `📋 Using existing document ID for ${fieldName}:`,
                documentId
              );

              // Send the document ID with the original file field name
              // This tells the backend to use the existing document for this field
              processedData[fieldName] = documentId;

              // Also include metadata about the document type for backend reference
              const documentType = Object.keys(documentFieldMapping).find(
                (key) => documentFieldMapping[key] === documentId
              );
              if (documentType) {
                processedData[`${baseFieldName}_documentType`] = documentType;
                console.log(
                  `📋 Including document type ${documentType} for field ${fieldName}`
                );
              }

              console.log(`📋 Final submission data for ${fieldName}:`, {
                documentId,
                documentType,
              });
            } else {
              console.log(`⚠️ No file or existing document for ${fieldName}`);
              console.log('Available document mappings:', documentFieldMapping);
              console.log(
                'Available existing documents:',
                Object.keys(existingDocuments)
              );
            }
          } else {
            // Other file value types (string URL, etc.)
            processedData[fieldName] = fieldValue;
          }
        } else {
          // Regular field, include as-is
          processedData[fieldName] = fieldValue;
        }
      });

      // Extract document-related entries for detailed logging
      const documentIdEntries = Object.entries(processedData).filter(([k]) =>
        k.endsWith('_documentId')
      );
      const documentTypeEntries = Object.entries(processedData).filter(([k]) =>
        k.endsWith('_documentType')
      );

      // Also find file fields that contain document IDs (UUID strings)
      const fileFieldsWithDocumentIds = Object.entries(processedData).filter(
        ([k, v]) =>
          k.endsWith('_file') &&
          typeof v === 'string' &&
          v.length === 36 && // UUID length
          v.includes('-') // UUID format
      );

      console.log('🔄 Form data processing:', {
        original: Object.keys(rawFormData).length,
        processed: Object.keys(processedData).length,
        newFiles: Object.entries(processedData).filter(
          ([, v]) => v instanceof File
        ).length,
        documentIds: documentIdEntries.length,
        documentTypes: documentTypeEntries.length,
        fileFieldsWithDocIds: fileFieldsWithDocumentIds.length,
      });

      // Log detailed document information
      if (documentIdEntries.length > 0) {
        console.log(
          '📋 Document IDs included in submission:',
          documentIdEntries
        );
      }
      if (documentTypeEntries.length > 0) {
        console.log(
          '📋 Document types included in submission:',
          documentTypeEntries
        );
      }
      if (fileFieldsWithDocumentIds.length > 0) {
        console.log(
          '📋 File fields with document IDs:',
          fileFieldsWithDocumentIds
        );
      }

      return processedData;
    },
    [fields, currentStepFields, documentFieldMapping, existingDocuments]
  );

  const handleSave = useCallback(async () => {
    console.log('🔄 handleSave called - starting validation');

    // Use our custom validation logic that considers existing documents
    // instead of Yup schema which doesn't know about existing documents
    const customValidationPassed = isFormValid;

    // Also run Yup validation for field-level validation (but don't block on file requirements)
    let yupValidationPassed = true;
    try {
      if (validationSchema) {
        await validationSchema.validate(formValues, { abortEarly: false });
        setValidationErrors({});
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            // Skip Yup file validation errors if we have existing documents
            // BUT still allow backend validation errors to be shown
            const field = currentStepFields.find(
              (f) =>
                f.fieldName === err.path ||
                f.fieldFileName === err.path ||
                `${f.fieldName}_file` === err.path
            );

            if (
              field &&
              (field.fieldType === 'file' ||
                field.fieldType === 'textfield_with_image')
            ) {
              const fieldNameToCheck =
                field.fieldType === 'textfield_with_image'
                  ? field.fieldFileName || `${field.fieldName}_file`
                  : field.fieldName;

              if (hasExistingDocument(fieldNameToCheck)) {
                console.log(
                  `⏭️ Skipping Yup file validation error for ${err.path} - has existing document`
                );
                console.log(
                  `ℹ️ Backend validation errors for ${err.path} will still be shown via getFieldError`
                );
                return; // Skip this Yup validation error
              }
            }

            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
        yupValidationPassed = Object.keys(errors).length === 0;
      } else {
        yupValidationPassed = false;
      }
    }

    // Also check if there are any field errors (like file size errors)
    const hasFieldErrors = fieldErrors.length > 0;

    console.log('🔍 Validation results:', {
      customValidationPassed,
      yupValidationPassed,
      hasFieldErrors,
      canProceed:
        customValidationPassed && yupValidationPassed && !hasFieldErrors,
    });

    if (
      customValidationPassed &&
      yupValidationPassed &&
      !hasFieldErrors &&
      onSave
    ) {
      console.log(
        '✅ All validations passed - proceeding with form submission'
      );
      // Prepare form data with proper handling of existing documents vs new files
      const processedFormData = prepareFormDataForSubmission(formValues);
      onSave(processedFormData);
    } else {
      console.log('❌ Validation failed - cannot submit form');
    }
  }, [
    onSave,
    formValues,
    isFormValid,
    validationSchema,
    fieldErrors,
    currentStepFields,
    hasExistingDocument,
    prepareFormDataForSubmission,
  ]);

  // OTP Verification state
  const [isOTPModalOpen, setIsOTPModalOpen] = React.useState(false);
  const [otpData, setOtpData] = React.useState<any>(null);
  const [isOTPValidated, setIsOTPValidated] = React.useState(false);

  const openOTPModal = useCallback(
    async (data: any) => {
      console.log('openOTPModal - Opening OTP modal', data);
      const otpData = {
        requestType: 'DIRECT',
        emailId: data?.email,
        mobileNo: data?.mobile,
        countryCode: data?.countryCode,
        workflowId: workflowId,
        ckycNo:
          formValues.hoiCitizenship === 'Indian'
            ? (formValues.hoiCkycNo as string)
            : undefined,
        stepKey: 'hoi',
        name: formValues.hoiFirstName as string,
      };
      console.log('openOTPModal - otpData', otpData);
      const result = await dispatch(OTPSend(otpData));
      if (OTPSend.fulfilled.match(result)) {
        console.log('OTP sent successfully!', result);
        setOtpData({
          emailId: data?.email,
          mobileNo: data?.mobile,
          countryCode: data?.countryCode,
          otpIdentifier: result?.payload?.data?.otpIdentifier,
        });
        // setOtpModalOpen(true);
        // console.log(`Opening OTP modal for Admin ${sectionIndex} verification`);
      } else {
        // Handle OTP send failure
        // alert(
        //   `Failed to send OTP for Admin ${sectionIndex}. Please try again.`
        // );
        console.error('OTP send failed:', result);
      }
      // setOtpData(data);
      setIsOTPModalOpen(true);
    },
    [formValues]
  );

  const closeOTPModal = useCallback(() => {
    setIsOTPModalOpen(false);
    setOtpData(null);
  }, []);

  const handleValidate = useCallback(async () => {
    console.log('handleValidate - Starting form validation');

    // Simple validation - check if form is valid
    const isValid = await validateAllFields();
    console.log('formValues=====', isValid);
    if (isValid) {
      // Create mock OTP data for validation using utility function
      const otpData = extractOTPFields(formValues);
      openOTPModal(otpData);
    }
  }, [validateAllFields, formValues, openOTPModal]);

  const handleOTPSuccess = useCallback(() => {
    console.log('🎉 OTP verification successful - handleOTPSuccess called');
    console.log('🔍 Current state before setting OTP validated:', {
      isOTPValidated,
      isFormValid,
    });
    setDisableValidateButton(true);
    setIsOTPValidated(true);
    closeOTPModal();

    // Don't auto-submit form - let user click Save & Next button
    console.log('✅ OTP validated - Save & Next button should now be enabled');

    // Use setTimeout to log state after React updates
    setTimeout(() => {
      console.log('🔍 Button state after OTP success (delayed check):', {
        isFormValid,
        isOTPValidated: true, // This should be the new value
        validateButtonRequired:
          configuration?.submissionSettings?.validateButton,
      });
    }, 100);
  }, [
    isOTPValidated,
    isFormValid,
    configuration?.submissionSettings?.validateButton,
    closeOTPModal,
  ]);

  const handleOTPClose = useCallback(() => {
    console.log('OTP modal closed');
    closeOTPModal();
  }, [closeOTPModal]);

  // Monitor OTP validation state changes
  useEffect(() => {
    console.log('🔄 isOTPValidated state changed:', {
      isOTPValidated,
      timestamp: new Date().toISOString(),
    });
  }, [isOTPValidated]);

  // Auto-validate form on page load if validate button is enabled and form has data
  useEffect(() => {
    const shouldAutoValidate =
      configuration?.submissionSettings?.validateButton && // Validate button is enabled
      !isOTPValidated && // Not already validated
      isFormValid && // Form is valid (mandatory fields filled)
      Object.keys(formValues).length > 0 && // Form has data
      currentStepFields.length > 0; // Fields are loaded

    if (shouldAutoValidate) {
      console.log('🔄 Auto-validating form on page load:', {
        validateButtonEnabled:
          configuration?.submissionSettings?.validateButton,
        isFormValid,
        isOTPValidated,
        formValuesCount: Object.keys(formValues).length,
        fieldsCount: currentStepFields.length,
      });

      // Check if form has meaningful data (not just empty values)
      const hasValidData = Object.values(formValues).some((value) => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      });

      if (hasValidData) {
        console.log(
          '✅ Form has valid data, auto-enabling save button without OTP...'
        );
        // Set OTP as validated directly without opening OTP modal
        setIsOTPValidated(true);
        console.log(
          '🔓 Auto-validated: Validate button disabled, Save&Next enabled'
        );
      } else {
        console.log('⏭️ Form data is empty, skipping auto-validation');
      }
    }
  }, [
    configuration?.submissionSettings?.validateButton,
    isOTPValidated,
    isFormValid,
    formValues,
    currentStepFields,
    handleValidate,
  ]);

  // Reset OTP validation when form values change (after validation)
  // useEffect(() => {
  //   if (isOTPValidated && configuration?.submissionSettings?.validateButton) {
  //     // Reset OTP validation if form values change after validation
  //     console.log('⚠️ Resetting OTP validation due to form values change');
  //     setIsOTPValidated(true);
  //   }
  // }, [
  //   formValues,
  //   isOTPValidated,
  //   configuration?.submissionSettings?.validateButton,
  // ]);

  // Fetch dropdown options for all dropdown fields
  useEffect(() => {
    currentStepFields.forEach((field) => {
      if (
        field.fieldType === 'dropdown' &&
        !processedFields.current.has(field.id)
      ) {
        if (field.fieldAttributes?.url) {
          const {
            url,
            method = 'GET',
            headers = {},
            payloadTemplate,
          } = field.fieldAttributes;

          // Check if this is a dependent dropdown (has placeholders in URL)
          const hasPlaceholders = url.includes('{') && url.includes('}');

          if (hasPlaceholders) {
            console.log(
              `🚫 Skipping dependent dropdown on initial load: ${field.fieldName} (URL: ${url})`
            );
            // Don't fetch dependent dropdown options on initial load
            // They will be fetched when parent field changes
            processedFields.current.add(field.id);
            return;
          }

          console.log(
            `📡 Fetching initial dropdown options for: ${field.fieldName} (URL: ${url})`
          );
          dispatch(
            fetchDropdownOptions({
              url,
              method,
              fieldId: field.id,
              headers,
              payload: payloadTemplate,
            })
          );

          processedFields.current.add(field.id);
        } else if (
          field.fieldOptions &&
          Array.isArray(field.fieldOptions) &&
          field.fieldOptions.length > 0
        ) {
          // Handle dropdown fields with static options from fieldOptions

          // Special handling for institutionType field - don't set options initially
          // as they depend on regulator selection
          if (field.fieldName === 'institutionType') {
            // Don't set options initially for institutionType
            // Options will be set when regulator is selected
            processedFields.current.add(field.id);
            return;
          }

          // Store static options in Redux state for other fields
          const staticOptions = field.fieldOptions.map(
            (option: Record<string, unknown> | string | number) => ({
              label:
                typeof option === 'object' && option !== null
                  ? (option.label as string) ||
                    (option.name as string) ||
                    (option.text as string) ||
                    String(option)
                  : String(option),
              value:
                typeof option === 'object' && option !== null
                  ? (option.value as string) ||
                    (option.id as string) ||
                    (option.code as string) ||
                    String(option)
                  : String(option),
            })
          );

          // Dispatch action to set static options
          dispatch(
            setStaticDropdownOptions({
              fieldId: field.id,
              options: staticOptions,
            })
          );

          processedFields.current.add(field.id);
        }
      }
    });
  }, [currentStepFields, dispatch]);

  // Initialize institutionType options if regulator is already selected
  useEffect(() => {
    const regulatorValue = formValues.regulator;
    if (regulatorValue) {
      const institutionTypeField = fields.find(
        (f: FormField) => f.fieldName === 'institutionType'
      );
      if (institutionTypeField && !dropdownOptions[institutionTypeField.id]) {
        const filteredOptions = getFilteredInstitutionTypeOptions(
          institutionTypeField,
          regulatorValue as string
        );
        dispatch(
          setStaticDropdownOptions({
            fieldId: institutionTypeField.id,
            options: filteredOptions,
          })
        );
      }
    }
  }, [
    fields,
    formValues.regulator,
    dropdownOptions,
    dispatch,
    getFilteredInstitutionTypeOptions,
  ]);

  // Ensure GSTIN required flag is set correctly on initial load and when regulator changes
  useEffect(() => {
    const gstinFieldIndex = fields.findIndex(
      (f: FormField) => f.fieldName === 'gstin'
    );
    if (gstinFieldIndex === -1) return;

    const regulatorValue = formValues.regulator;
    const isRequired = regulatorValue ? regulatorValue !== 'IFSCA' : false;

    const currentField = fields[gstinFieldIndex];
    const currentRequired =
      currentField.validationRules?.required === true ||
      String(currentField.validationRules?.required) === 'true';

    if (currentRequired === isRequired) return;

    const updatedField = {
      ...currentField,
      validationRules: {
        ...(currentField.validationRules || {}),
        required: isRequired,
      },
    };

    dispatch(updateFieldValidation(updatedField));
    if (!isRequired) {
      dispatch(clearFieldError('gstin'));
    }
  }, [fields, formValues.regulator, dispatch]);

  // const modifiableFields = useSelector(selectModifiableFields);

  // Check if a field is modifiable
  // const isModifiableField = (fieldName: string): boolean => {
  //   const isModifiable = Object.values(modifiableFields).some((fields) => {
  //     if (Array.isArray(fields)) {
  //       const found = fields.includes(fieldName);
  //       return found;
  //     }
  //     return false;
  //   });

  //   return isModifiable;
  // };

  // Helper function to get constitution label from the stored value
  const getConstitutionLabel = useCallback(
    (constitutionValue: string): string => {
      if (!constitutionValue) return '';

      const constitutionField = fields.find(
        (f: FormField) => f.fieldName === 'constitution'
      );

      if (!constitutionField?.fieldOptions) return constitutionValue;

      const selectedOption = constitutionField.fieldOptions.find(
        (opt: DropdownOption | any) =>
          opt.value === constitutionValue ||
          opt.label === constitutionValue ||
          opt.code === constitutionValue
      );

      // Return label if found, otherwise return the original value
      return (
        (selectedOption as any)?.label ||
        (selectedOption as any)?.name ||
        (selectedOption as any)?.value ||
        constitutionValue
      );
    },
    [fields]
  );

  // Render individual field based on type
  const renderField = (field: FormField) => {
    // Get current field value
    const value = formValues[field.fieldName] || '';

    const citizenshipKeys = [
      'hoiCitizenship',
      'noCitizenship',
      'iauCitizenship1',
      'iauCitizenship2',
    ];

    const hasIndianCitizenship = citizenshipKeys.some((key) => {
      const formVal = formValues[key];
      const normalized = (formVal ?? '').toString().trim().toLowerCase();
      return normalized === 'indian';
    });

    const lowerFieldName = field.fieldName.toLowerCase();
    const ckycKeys = [
      'hoickycno',
      'nockycnumber',
      'iauckycnumber1',
      'iauckycnumber2',
    ];
    const shouldForceCkyc =
      ckycKeys.some((key) => lowerFieldName.includes(key)) &&
      hasIndianCitizenship;

    // Get field errors from multiple sources
    const reduxFieldError = fieldErrors.find(
      (error) => error.field === field.fieldName
    )?.message;
    const validationError = validationErrors[field.fieldName];
    const apiFieldError = getFieldError(field.fieldName);
    const isModifiable = isModifiableField(field.fieldName);

    // For file upload fields, also check for file field errors
    let fileError = '';
    let apiFileError = '';
    if (field.fieldType === 'textfield_with_image') {
      // textfield_with_image stores file using fieldFileName
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      const reduxFileFieldError = fieldErrors.find(
        (error) => error.field === fileFieldName
      )?.message;
      const fileValidationError = validationErrors[fileFieldName];
      apiFileError = getFieldError(fileFieldName) || '';
      fileError =
        fileValidationError || reduxFileFieldError || apiFileError || '';

      console.log(`📋 File field error check for ${fileFieldName}:`, {
        fileValidationError,
        reduxFileFieldError,
        apiFileError,
        finalFileError: fileError,
      });
    } else if (field.fieldType === 'file') {
      // For regular file fields, check API errors for the field name
      apiFileError = getFieldError(field.fieldName) || '';
      fileError = validationError || apiFileError || '';
    }

    // Priority: validation errors > API errors > Redux errors
    const rawError =
      validationError || apiFieldError || reduxFieldError || fileError;
    const displayError = rawError
      ? typeof rawError === 'string'
        ? rawError
        : JSON.stringify(rawError)
      : undefined;

    // Debug logging for mobile/phone fields
    if (/(mobile|phone)/i.test(field.fieldName)) {
      console.log(`📱 Mobile/Phone field render - ${field.fieldName}:`, {
        value,
        valueLength: (value as string).length,
        validationError,
        reduxFieldError,
        apiFieldError,
        rawError,
        displayError,
        allValidationErrors: validationErrors,
      });
    }

    if (displayError) {
      console.log(
        `📋 Displaying error for field ${field.fieldName}:`,
        displayError
      );
      console.log(`🔍 Error source breakdown for ${field.fieldName}:`, {
        validationError,
        reduxFieldError,
        apiFieldError,
        fileError,
        finalDisplayError: displayError,
      });
    }
    const options = Array.isArray(dropdownOptions[field.id])
      ? dropdownOptions[field.id]
      : [];

    // debugging CKYC change behavior)
    if (
      isModifiable &&
      ['hoiMobile', 'hoiEmail', 'hoiFirstName', 'hoiLastName'].includes(
        field.fieldName
      )
    ) {
      console.log(`Field ${field.fieldName} is modifiable and can be edited`);
    }

    // Check constitution value for conditional required fields
    const constitutionValue = (formValues['constitution'] as string) || '';
    // Get the constitution label to ensure proper comparison (dropdown stores code, we need label)
    const constitutionLabel = getConstitutionLabel(constitutionValue);
    const isSoleProprietorship = constitutionLabel === 'Sole Proprietorship';
    const isLLP = constitutionLabel === 'Limited Liability Partnership';
    const cinRequiredConstitutions = [
      'Private Limited Company',
      'Public Limited Company',
      'Section 8 Companies (Companies Act, 2013)',
      'D',
      'E',
      'M',
    ];
    const isCinRequired = cinRequiredConstitutions.includes(constitutionLabel);

    // Determine actual required state (override for constitution-dependent fields)
    let actualRequired =
      shouldForceCkyc ||
      field.validationRules?.required ||
      field.isRequired ||
      false;
    if (field.fieldName === 'proprietorName') {
      // Proprietor Name: only required when Constitution is "Sole Proprietorship"
      actualRequired = isSoleProprietorship;
    } else if (field.fieldName === 'llpin') {
      // LLPIN: only required when Constitution is "Limited Liability Partnership"
      actualRequired = isLLP;
    } else if (field.fieldName === 'cin') {
      // CIN: only required when Constitution matches specific company types
      actualRequired = isCinRequired;
    } else if (['hoiMobile'].includes(field.fieldName)) {
      // Mobile number fields: always required for Head of Institution, Nodal Officer, and IAU
      actualRequired = true;
    } else if (
      [
        'noRegisterPincode',
        'noRegisterDistrict',
        'noRegisterState',
        'noRegisterCity',
      ].includes(field.fieldName)
    ) {
      // Pincode fields: always required for Nodal Officer
      actualRequired = true;
    }

    // Determine actual disabled state (override for constitution-dependent fields)
    let dynamicDisabled = !isModifiable;
    if (field.fieldName === 'proprietorName') {
      // Proprietor Name: disabled when Constitution is NOT "Sole Proprietorship"
      dynamicDisabled = !isSoleProprietorship || !isModifiable;
    } else if (field.fieldName === 'cin') {
      // CIN: disabled when Constitution is NOT one of the required types
      dynamicDisabled = !isCinRequired || !isModifiable;
    } else if (field.fieldName === 'llpin') {
      // LLPIN: disabled when Constitution is NOT "Limited Liability Partnership"
      dynamicDisabled = !isLLP || !isModifiable;
    }

    // Common field styles
    const fieldSx = {
      '& .MuiFormLabel-root, & .MuiFormControlLabel-label': {
        backgroundColor: isModifiable ? '#FFD952' : 'transparent',
        padding: '0 4px',
        borderRadius: '4px',
        marginLeft: field.fieldType === 'checkbox' ? '-4px' : '0',
        '&.Mui-focused': {
          backgroundColor: isModifiable ? '#FFD952' : 'transparent',
        },
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: isModifiable ? '#FFD952' : undefined,
      },
    };

    switch (field.fieldType) {
      case 'textfield':
        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            fieldName={field.fieldName}
            placeholder={field.fieldPlaceholder || ''}
            required={actualRequired}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={
              field.validationRules?.maxLength ||
              field?.conditionalLogic?.[0]?.then?.validationRules?.maxLength
                ? parseInt(
                    String(
                      field?.validationRules?.maxLength ||
                        field?.conditionalLogic?.[0]?.then?.validationRules
                          ?.maxLength
                    )
                  )
                : undefined
            }
            error={!!displayError}
            helperText={displayError}
            type={
              field.fieldName.includes('website')
                ? 'url'
                : /(mobile|phone)/i.test(field.fieldName)
                  ? 'tel'
                  : 'text'
            }
            inputMode={
              /(mobile|phone)/i.test(field.fieldName) ? 'numeric' : undefined
            }
            isMobileNumber={/(mobile|phone)/i.test(field.fieldName)}
            // disabled={shouldDisableField(field.fieldName, field.formType) || !isModifiable}
            disabled={dynamicDisabled}
            sx={fieldSx}
          />
        );

      case 'dropdown': {
        const isLoadingOptions =
          field.fieldAttributes?.url && !options.length && !loading;
        // console.log('🔍 Dropdown Debug:', {
        //   fieldName: field.fieldName,
        //   currentValue: value,
        //   options: options,
        //   displayError: displayError,
        // });
        return (
          <LabeledDropDown
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={(value as string) || ''}
            onChange={(selectedValue) => {
              // console.log(`🎯 ${field.fieldName} onChange triggered:`, {
              //   selectedValue,
              //   type: typeof selectedValue,
              //   fieldName: field.fieldName,
              //   hasDispatch: !!dispatch,
              //   hasFields: !!fields,
              // });
              handleDropdownChange(field.fieldName, selectedValue as string);
            }}
            options={options.map((option: DropdownOption, index: number) => {
              const optionWithExtras = option as DropdownOption &
                Record<string, unknown>;
              return {
                label:
                  option?.label ||
                  (optionWithExtras.name as string) ||
                  (optionWithExtras.text as string) ||
                  `Option ${index + 1}`,
                value:
                  option?.value ||
                  String(
                    optionWithExtras.id ||
                      optionWithExtras.code ||
                      `option_${index}`
                  ),
                // Pass through regulator and types for nested structure
                regulator: optionWithExtras.regulator as string,
                types: optionWithExtras.types as Array<{
                  code: string;
                  name: string;
                  status: string;
                }>,
                code: optionWithExtras.code as string,
                name: optionWithExtras.name as string,
              };
            })}
            placeholder={
              isLoadingOptions
                ? 'Loading options...'
                : field.fieldPlaceholder || `Select ${field.fieldLabel}`
            }
            required={actualRequired}
            error={!!displayError}
            helperText={displayError}
            fieldName={field.fieldName}
            disabled={dynamicDisabled}
            sx={fieldSx}
          />
        );
      }

      case 'date':
        return (
          <LabeledDate
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={(value as string) || null}
            onChange={(newVal) =>
              handleFieldChange(field.fieldName, newVal || '')
            }
            required={actualRequired}
            error={!!displayError}
            helperText={displayError}
            disabled={dynamicDisabled}
            sx={fieldSx}
          />
        );

      case 'textfield_with_image': {
        // Get file field name from fieldFileName or fallback
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;

        // Get existing document for this field
        const documentId = documentFieldMapping[fileFieldName];
        const existingDoc = documentId
          ? existingDocuments[documentId]
          : undefined;

        console.log(
          `📄 Rendering textfield_with_image for ${field.fieldName}:`,
          {
            fieldName: field.fieldName,
            fileFieldName,
            documentId,
            existingDoc,
            hasExistingDoc: !!existingDoc,
          }
        );

        // Use validationFile rules if available, otherwise fallback to main validation rules
        const fileValidationRules =
          field.validationRules?.validationFile || field.validationRules;

        return (
          <LabeledTextFieldWithUpload
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={value as string}
            onDelete={(e) => {
              if (e !== undefined) {
                dispatch(
                  updateStepDocument([
                    ...stepDocuments.filter((x) => x.id !== e.id),
                  ])
                );
                const updatedFetchedDocs = { ...existingDocuments }; // create a shallow copy
                delete updatedFetchedDocs[e.id]; // safe delete on copy
                dispatch(updateFetchedDocument(updatedFetchedDocs)); // update Redux state
              }
            }}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            onUpload={(file) => {
              handleFieldChange(fileFieldName, file);
            }}
            placeholder={field.fieldPlaceholder}
            required={actualRequired}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={
              field.validationRules?.maxLength
                ? parseInt(field.validationRules.maxLength)
                : undefined
            }
            error={!!displayError}
            helperText={displayError}
            accept={
              fileValidationRules?.imageFormat
                ?.map((format: any) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={fileValidationRules || undefined}
            onValidationError={(error) => {
              if (error) {
                dispatch(
                  setFieldError({
                    field: fileFieldName,
                    message: error,
                  })
                );
              } else {
                dispatch(clearFieldError(fileFieldName));
              }
            }}
            // New props for existing document display
            existingDocument={existingDoc}
            showExistingDocument={!!existingDoc}
            disabled={dynamicDisabled}
            sx={fieldSx}
          />
        );
      }

      case 'textfield_with_verify':
        return (
          <LabeledTextFieldWithVerify
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.fieldPlaceholder}
            required={actualRequired}
            hasData={hasStepData}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={
              field.validationRules?.maxLength ||
              field?.conditionalLogic?.[0]?.then?.validationRules?.maxLength
                ? parseInt(
                    String(
                      field?.validationRules?.maxLength ||
                        field?.conditionalLogic?.[0]?.then?.validationRules
                          ?.maxLength
                    )
                  )
                : undefined
            }
            error={!!displayError}
            helperText={displayError}
            externalVerifyUrl={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
            }
            externalVerifyMethod={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.method
            }
            onOpenSendOtp={async () => {
              // console.log('field=====', field);
              // Try to locate a matching conditional block to get API details
              const logics = field.conditionalLogic || [];
              const matched = logics.find((cl: any) => {
                const when = cl.when;
                if (!when?.field) return false;
                const depVal = formValues[when.field];
                const operator = when.operator || 'equals';
                const values = Array.isArray(when.value)
                  ? when.value
                  : [when.value];
                if (operator === 'equals') {
                  return values.map(String).includes(String(depVal ?? ''));
                }
                return false;
              });
              const fa = matched?.then?.fieldAttributes as
                | {
                    url?: string;
                    method?: string;
                    headers?: Record<string, string>;
                    urlData?: string;
                    payloadTemplate?: Record<string, unknown>;
                  }
                | undefined;
              if (!fa?.url) return;

              const method = (fa.method || 'GET').toUpperCase();
              const headers = fa.headers || {};
              const currentValue = String(formValues[field.fieldName] ?? '');

              try {
                // console.log('methid:-===', method);
                if (method === 'GET') {
                  // Build URL by appending CKYC number in the path (API requires path param)
                  const base = String(fa.url);
                  const url = base.endsWith('/')
                    ? `${base}${currentValue}`
                    : `${base}/${currentValue}`;
                  const resp = await Secured.get(url, { headers });
                  type ApiResp = {
                    success?: boolean;
                    type?: string;
                    errors?: { errorMessage?: string }[];
                    message?: string;
                    data?: unknown;
                  };
                  const raw = resp?.data as unknown as {
                    data?: unknown;
                  } & ApiResp;
                  const data = (raw?.data as ApiResp) || (raw as ApiResp);
                  if (data?.success === true) {
                    // Allow modal to open
                    return true;
                  }
                  if (
                    data?.success === false &&
                    data?.type === 'ERROR_FORM_VALIDATIONS'
                  ) {
                    const msg =
                      data?.errors?.[0]?.errorMessage || 'Validation error';
                    dispatch(
                      setFieldError({
                        field: field.fieldName,
                        message: msg,
                      })
                    );
                    // Prevent modal open
                    return false;
                  }
                  return false;
                } else {
                  const payload = {
                    ...(fa.payloadTemplate || {}),
                    [(fa.urlData as string) || 'ckycNo']: currentValue,
                  } as Record<string, unknown>;
                  const resp = await Secured.post(fa.url, payload, { headers });
                  type ApiResp = {
                    success?: boolean;
                    type?: string;
                    errors?: { errorMessage?: string }[];
                    message?: string;
                    data?: unknown;
                  };
                  const raw = resp?.data as unknown as {
                    data?: unknown;
                  } & ApiResp;
                  const data = (raw?.data as ApiResp) || (raw as ApiResp);
                  if (data?.success === true) {
                    return true;
                  }
                  if (
                    data?.success === false &&
                    data?.type === 'ERROR_FORM_VALIDATIONS'
                  ) {
                    const msg =
                      data?.errors?.[0]?.errorMessage || 'Validation error';
                    dispatch(
                      setFieldError({
                        field: field.fieldName,
                        message: msg,
                      })
                    );
                    return false;
                  }
                  return false;
                }
              } catch (err: unknown) {
                const resp = err as { response?: { data?: any } };
                const data = resp?.response?.data;
                const msg =
                  data?.errors?.[0]?.errorMessage ||
                  data?.message ||
                  'Validation error';
                dispatch(
                  setFieldError({
                    field: field.fieldName,
                    message: msg,
                  })
                );
                return false;
              }
            }}
            onSubmitOtp={async (otp: string) => {
              // Verify OTP and return response data so modal can pass to onOtpVerified
              const logics = field.conditionalLogic || [];
              const matched = logics.find((cl: any) => {
                const when = cl.when;
                if (!when?.field) return false;
                const depVal = formValues[when.field];
                const operator = when.operator || 'equals';
                const values = Array.isArray(when.value)
                  ? when.value
                  : [when.value];
                if (operator === 'equals') {
                  return values.map(String).includes(String(depVal ?? ''));
                }
                return false;
              });
              const fa = matched?.fieldAttributes as
                | {
                    url?: string;
                    method?: string;
                    headers?: Record<string, string>;
                    urlData?: string;
                    payloadTemplate?: Record<string, unknown>;
                  }
                | undefined;
              if (!fa?.url) return false;

              const method = (fa.method || 'GET').toUpperCase();
              const headers = fa.headers || {};
              const currentValue = String(formValues[field.fieldName] ?? '');
              if (method === 'GET') {
                const paramKey = fa.urlData || 'value';
                const url = new URL(fa.url);
                url.searchParams.set(paramKey, currentValue);
                url.searchParams.set('otp', otp);
                const resp = await Secured.get(url.toString(), { headers });
                return resp?.data ?? true;
              }
              const payload = {
                ...(fa.payloadTemplate || {}),
                value: currentValue,
                otp,
              };
              const resp = await Secured.post(fa.url, payload, { headers });
              return resp?.data ?? true;
            }}
            onOtpVerified={(data?: unknown) => {
              console.log(
                '🎯 CKYC OTP Verified - Auto-population starting:',
                data
              );

              // If API returned data, auto-populate if mapping present
              const logics = field.conditionalLogic || [];
              const matched = logics.find((cl) => {
                const when = cl.when;
                if (!when?.field) return false;
                const depVal = formValues[when.field];
                const operator = when.operator || 'equals';
                const values = Array.isArray(when.value)
                  ? when.value
                  : [when.value];
                if (operator === 'equals') {
                  return values.map(String).includes(String(depVal ?? ''));
                }
                return false;
              });

              const fa = matched?.then?.fieldAttributes as
                | {
                    autoPopulate?: string[];
                    responseMapping?: { label?: string; value?: string };
                  }
                | undefined;

              console.log('🔍 Field attributes found:', fa);

              if (
                !data ||
                !fa?.autoPopulate ||
                !Array.isArray(fa.autoPopulate)
              ) {
                console.log('❌ Auto-population skipped:', {
                  hasData: !!data,
                  hasAutoPopulate: !!fa?.autoPopulate,
                  isArray: Array.isArray(fa?.autoPopulate),
                });
                return;
              }

              // Handle nested response data structure
              let result: Record<string, unknown> = {};

              if (typeof data === 'object' && data !== null) {
                const responseData = data as Record<string, unknown>;

                // Check if data is nested (e.g., { data: { actualData } })
                if (
                  responseData.data &&
                  typeof responseData.data === 'object'
                ) {
                  result = responseData.data as Record<string, unknown>;
                  console.log('📦 Using nested data structure:', result);
                } else {
                  result = responseData;
                  console.log('📦 Using direct data structure:', result);
                }
              }

              console.log('🔄 Auto-populating fields:', {
                fieldsToPopulate: fa.autoPopulate,
                availableData: Object.keys(result),
                responseData: result,
              });

              // Create field mapping from API response to form fields
              const fieldMapping: Record<string, string> = {
                // API response field -> Form field mapping
                title: 'hoiTitle',
                firstName: 'hoiFirstName',
                lastName: 'hoiLastName',
                middleName: 'hoiMiddleName',
                ckycNo: 'hoiCkycNo',
                // Add more mappings as needed
              };

              console.log('🗺️ Field mapping:', fieldMapping);

              // Track populated fields and store verified values
              const populatedFields = new Set<string>();
              const currentCkycValue = String(formValues['hoiCkycNo'] || '');
              const currentCitizenshipValue = String(
                formValues['citizenship'] || ''
              );

              // Auto-populate each field specified in the autoPopulate array
              fa.autoPopulate.forEach((target: string) => {
                let sourceField = target;
                let value: unknown;

                // First, try direct field name match
                if (
                  result &&
                  Object.prototype.hasOwnProperty.call(result, target)
                ) {
                  value = result[target];
                  console.log(
                    `✅ Direct match - Auto-populating field: ${target} = ${value}`
                  );
                } else {
                  // Try to find mapped field name
                  const mappedField = Object.entries(fieldMapping).find(
                    ([, formField]) => formField === target
                  );

                  if (
                    mappedField &&
                    result &&
                    Object.prototype.hasOwnProperty.call(result, mappedField[0])
                  ) {
                    sourceField = mappedField[0];
                    value = result[sourceField];
                    console.log(
                      `✅ Mapped field - Auto-populating ${target} from API field ${sourceField} = ${value}`
                    );
                  } else {
                    console.log(
                      `❌ Field ${target} not found in response data. Available fields:`,
                      Object.keys(result)
                    );
                    return;
                  }
                }

                // Update form value
                dispatch(
                  updateFormValue({
                    fieldName: target,
                    value: String(value || ''),
                  })
                );

                // Track this field as auto-populated
                populatedFields.add(target);
              });

              // Update state with populated fields and verified values
              // setAutoPopulatedFields(populatedFields);
              setCkycVerifiedValue(currentCkycValue);
              setCitizenshipVerifiedValue(currentCitizenshipValue);

              console.log(
                '🔒 Auto-populated fields locked:',
                Array.from(populatedFields)
              );
            }}
            onVerify={async (currentValue: string) => {
              // Find matching conditional logic (if any)
              const logics = field.conditionalLogic || [];
              const matched = logics.find((cl) => {
                const when = cl.when;
                if (!when?.field) return false;
                const depVal = formValues[when.field];
                const operator = when.operator || 'equals';
                const values = Array.isArray(when.value)
                  ? when.value
                  : [when.value];
                if (operator === 'equals') {
                  return values.map(String).includes(String(depVal ?? ''));
                }
                return false;
              });

              if (!matched) return;

              const fa = matched.fieldAttributes as
                | {
                    url?: string;
                    method?: string;
                    headers?: Record<string, string>;
                    urlData?: string;
                    payloadTemplate?: Record<string, unknown>;
                    autoPopulate?: string[];
                  }
                | undefined;

              if (!fa?.url) return;

              try {
                const method = (fa.method || 'GET').toUpperCase();
                const headers = fa.headers || {};

                if (method === 'GET') {
                  const paramKey = fa.urlData || 'value';
                  const url = new URL(fa.url);
                  url.searchParams.set(paramKey, String(currentValue ?? ''));
                  const resp = await Secured.get(url.toString(), { headers });
                  const data = resp?.data || {};

                  // Auto-populate fields if defined
                  if (Array.isArray(fa.autoPopulate)) {
                    fa.autoPopulate.forEach((target) => {
                      if (
                        data &&
                        Object.prototype.hasOwnProperty.call(data, target)
                      ) {
                        dispatch(
                          updateFormValue({
                            fieldName: target,
                            value: data[target] as string,
                          })
                        );
                      }
                    });
                  }
                } else {
                  // POST fallback if needed
                  const payload = { ...(fa.payloadTemplate || {}) };
                  const resp = await Secured.post(fa.url, payload, { headers });
                  const data = resp?.data || {};
                  if (Array.isArray(fa.autoPopulate)) {
                    fa.autoPopulate.forEach((target) => {
                      if (
                        data &&
                        Object.prototype.hasOwnProperty.call(data, target)
                      ) {
                        dispatch(
                          updateFormValue({
                            fieldName: target,
                            value: data[target] as string,
                          })
                        );
                      }
                    });
                  }
                }
              } catch {
                dispatch(
                  setFieldError({
                    field: field.fieldName,
                    message:
                      'Verification failed. Please check the value and try again.',
                  })
                );
              }
            }}
            disabled={dynamicDisabled}
            sx={fieldSx}
          />
        );

      case 'file': {
        // Get existing document for this field
        const fileDocumentId = documentFieldMapping[field.fieldName];
        const existingFileDoc = fileDocumentId
          ? existingDocuments[fileDocumentId]
          : undefined;

        console.log(`📁 Rendering file field for ${field.fieldName}:`, {
          fieldName: field.fieldName,
          fileDocumentId,
          existingFileDoc,
          hasExistingDoc: !!existingFileDoc,
        });

        return (
          <div>
            <UploadButton
              key={`${field.id}-${clearKey}`}
              label={field.fieldLabel}
              onUpload={(file) => handleFieldChange(field.fieldName, file)}
              required={actualRequired}
              onDelete={(e) => {
                if (e !== undefined) {
                  dispatch(
                    updateStepDocument([
                      ...stepDocuments.filter((x) => x.id !== e.id),
                    ])
                  );
                  const updatedFetchedDocs = { ...existingDocuments }; // create a shallow copy
                  delete updatedFetchedDocs[e.id]; // safe delete on copy
                  dispatch(updateFetchedDocument(updatedFetchedDocs)); // update Redux state
                }
              }}
              accept={
                (
                  field.validationRules?.validationFile?.imageFormat ||
                  field.validationRules?.imageFormat
                )
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              // New props for existing document display
              existingDocument={existingFileDoc}
              showExistingDocument={!!existingFileDoc}
              sx={fieldSx}
              disabled={dynamicDisabled}
            />
            {displayError && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                {displayError}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <DynamicFormContainer>
        <LoadingContainer>
          <CircularProgress size={40} />
          <LoadingText>Loading form fields...</LoadingText>
        </LoadingContainer>
      </DynamicFormContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <DynamicFormContainer>
        <AlertContainer>
          <Alert severity="error">{error}</Alert>
        </AlertContainer>
      </DynamicFormContainer>
    );
  }

  // No fields state
  if (fields.length === 0) {
    return (
      <DynamicFormContainer>
        <AlertContainer>
          <Alert severity="info">No form fields available.</Alert>
        </AlertContainer>
      </DynamicFormContainer>
    );
  }

  return (
    <DynamicFormContainer>
      {/* Form Title */}
      <FormTitle>{configuration?.formSubtitle || ''}</FormTitle>

      {/* All Fields Content */}
      <StepContent>
        <ThreeColumnGrid>
          {currentStepFields.map((field: FormField) => {
            // Hide pincode "other" field by default, show only when "other" is selected
            const isPincodeOtherField =
              field.fieldName === 'noRegisterPincodeOther' ||
              field.fieldName === 'registerPincodeOther' ||
              field.fieldName === 'correspondencePincodeOther' ||
              field.fieldName === 'iauPincodeOther1' ||
              field.fieldName === 'iauPincodeOther2';

            if (isPincodeOtherField) {
              // Determine which pincode field to check based on the "other" field name
              let pincodeValue: any = '';
              if (field.fieldName === 'noRegisterPincodeOther') {
                pincodeValue = formValues['noRegisterPincode'];
              } else if (field.fieldName === 'registerPincodeOther') {
                pincodeValue =
                  formValues['register_pincode'] ||
                  formValues['registerPincode'];
              } else if (field.fieldName === 'correspondencePincodeOther') {
                pincodeValue = formValues['correspondencePincode'];
              } else if (field.fieldName === 'iauPincodeOther1') {
                pincodeValue = formValues['iauPincode1'];
              } else if (field.fieldName === 'iauPincodeOther2') {
                pincodeValue = formValues['iauPincode2'];
              }

              const isOtherSelected =
                pincodeValue?.toString().toLowerCase() === 'other' ||
                pincodeValue?.toString().toLowerCase() === 'others';

              if (!isOtherSelected) {
                return null; // Hide the field
              }
            }

            return (
              <FieldContainer key={field.id}>
                {renderField(field)}
              </FieldContainer>
            );
          })}
        </ThreeColumnGrid>
      </StepContent>

      {/* Form Actions */}
      <FormActionButtons
        onClear={handleClear}
        onSave={handleSave}
        onValidate={handleValidate}
        validateLabel={configuration?.submissionSettings?.validateButtonText}
        showValidate={configuration?.submissionSettings?.validateButton}
        showSave={configuration?.submissionSettings?.submitButton}
        showClear={false}
        clearLabel={configuration?.submissionSettings?.clearButtonText}
        saveLabel={configuration?.submissionSettings?.submitButtonText}
        loading={externalLoading !== undefined ? externalLoading : loading}
        saveDisabled={(() => {
          if (
            configuration?.submissionSettings?.validateButton &&
            !disableValidateButton
          ) {
            return true;
          }
          // Scenario 1: No step data found (first time)
          if (!hasStepData) {
            // Enable save & next only after OTP validation
            const disabled =
              !isFormValid ||
              (configuration?.submissionSettings?.validateButton &&
                !isOTPValidated);

            console.log('🔍 Save button state (no step data):', {
              hasStepData,
              isFormValid,
              isOTPValidated,
              validateButtonRequired:
                configuration?.submissionSettings?.validateButton,
              disabled,
            });

            return disabled;
          }

          // Scenario 2: Step data found (returning user)
          // Enable both buttons if form is valid
          const disabled = !isFormValid;

          console.log('🔍 Save button state (has step data):', {
            hasStepData,
            isFormValid,
            disabled,
          });

          return disabled;
        })()}
        validateDisabled={disableValidateButton}
        clearDisabled={false}
        sx={{ margin: 0, padding: 0 }}
        submissionSettings={{
          ...(configuration?.submissionSettings || {}),
          clearButton: false,
        }}
      />

      {/* OTP Verification Modal */}
      {otpData && (
        <OTPVerificationModal
          open={isOTPModalOpen}
          data={otpData?.otpIdentifier}
          onClose={handleOTPClose}
          onSuccess={handleOTPSuccess}
          maskedMobile={otpData?.mobileNo}
          maskedEmail={otpData?.emailId}
          maskedCountryCode={otpData?.countryCode || '+91'}
          reSendOtpObject={{
            requestType: 'DIRECT',
            emailId: otpData?.emailId,
            mobileNo: otpData?.mobileNo,
            countryCode: otpData?.countryCode,
            workflowId: workflowId,
            ckycNo:
              formValues.hoiCitizenship === 'Indian'
                ? (formValues.hoiCkycNo as string)
                : undefined,
            stepKey: 'hoi',
            name: formValues.hoiFirstName as string,
          }}
        />
      )}
    </DynamicFormContainer>
  );
};

export default TrackStatusDynamicForm;
