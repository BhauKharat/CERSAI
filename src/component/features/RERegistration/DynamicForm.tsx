/* eslint-disable */
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
import { StepContent } from './DynamicForm.styles';
import { buildValidationSchema } from '../../../utils/formValidation';
import { extractOTPFields } from './utils/formFieldUtils';
import {
  LabeledTextField,
  LabeledDropDown,
  LabeledTextFieldWithUpload,
  LabeledDate,
  UploadButton,
} from './CommonComponent';
import FormActionButtons from './CommonComponent/ClearAndSaveActions';
import OTPVerificationModal from '../../ui/Modal/OTPVerificationModal';
import SuccessModal from '../../ui/Modal/SuccessModal';
import { useFieldError } from './context/FieldErrorContext';
import {
  fetchFormFields,
  fetchDropdownOptions,
  updateFormValue,
  updateFormValueWithoutvalidateField,
  clearForm,
  setStaticDropdownOptions,
  setFieldError,
  clearFieldError,
  clearAllErrors,
  updateFieldValidation,
  selectFormFields,
  selectFormValues,
  selectFieldErrors,
  selectFormLoading,
  selectFormError,
  selectDropdownOptions,
  selectCurrentStepFields,
  selectFormConfiguration,
} from './slice/formSlice';
import { FormField, DropdownOption } from './types/formTypes';
import {
  DynamicFormContainer,
  FormTitle,
  ThreeColumnGrid,
  FieldContainer,
  LoadingContainer,
  LoadingText,
  AlertContainer,
} from './DynamicForm.styles';
import LabeledTextFieldWithVerify from './CommonComponent/LabeledTextFieldWithVerify';
import { useAppDispatch } from '../../admin-features/app/hooks';
import { Secured } from '../../../utils/HelperFunctions/api';
import { OTPSend } from '../Authenticate/slice/authSlice';
import {
  clearStepData,
  selectStepDocuments,
  updateFetchedDocument,
  updateStepDocument,
  deleteDocument,
} from './slice/stepDataSlice';
import { useAadhaarMasking } from './hooks/useAadhaarMasking';

// Helper function to get mobile validation rules based on conditional logic
const getMobileValidationRules = (
  field: FormField,
  // isIndianCitizen: boolean

  isIndianCountryCode: boolean
) => {
  // Check if field has conditional logic
  if (!field.conditionalLogic?.[0]) {
    return {
      required: field.validationRules?.required,
      minLength: field.validationRules?.minLength,
      maxLength: field.validationRules?.maxLength,
      pattern: field.validationRules?.regx,
      placeholder: field.fieldPlaceholder || 'Enter mobile number',
      requiredMessage: field.validationRules?.requiredMessage,
      minLengthMessage: field.validationRules?.minLengthMessage,
      maxLengthMessage: field.validationRules?.maxLengthMessage,
      patternMessage: field.validationRules?.regxMessage,
    };
  }

  // Get rules based on country code
  const rules = isIndianCountryCode
    ? field.conditionalLogic[0].then?.validationRules
    : field.conditionalLogic[0].else?.validationRules;

  return {
    required: rules?.required,
    minLength: rules?.minLength,
    maxLength: rules?.maxLength,
    pattern: rules?.regx,
    placeholder: isIndianCountryCode
      ? 'Enter 10-digit mobile number'
      : 'Enter mobile number (8-15 digits)',
    requiredMessage: rules?.requiredMessage,
    minLengthMessage: rules?.minLengthMessage,
    maxLengthMessage: rules?.maxLengthMessage,
    patternMessage: rules?.regxMessage,
  };
};

// Helper function to get validation rules for pincode "other" field based on conditional logic
const getPincodeOtherValidationRules = (field: FormField) => {
  // Check if field has conditional logic
  if (!field.conditionalLogic?.[0]) {
    return field.validationRules;
  }

  // Get rules from conditional logic "then" clause
  const conditionalRules = field.conditionalLogic[0].then?.validationRules;
  return conditionalRules || field.validationRules;
};

interface DynamicFormProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onPrevious?: () => void; // Callback to navigate to previous step
  urlDynamic?: string;
  existingDocuments?: Record<string, any>; // FetchedDocument from stepDataTypes
  documentFieldMapping?: Record<string, string>; // Maps field names to document IDs
  loading?: boolean; // External loading state to override internal loading
  hasStepData?: boolean; // Indicates if fetchStepData API returned data
  prefilledDisablesValidate?: boolean; // If true, when hasStepData, keep Validate disabled until contact change
  onValidationChange?: (isValid: boolean) => void; // Callback to notify parent of validation state changes
  useFrontendConfig?: boolean; // If true, skip API fetch for form fields (fields already set from frontend config)
  specialDropdownHandlers?: Record<string, (value: string) => void>; // Custom handlers for special dropdown fields
  // getFieldDisabled?: (fieldName: string) => boolean; // Function to determine if a field should be disabled
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  onSave,
  onPrevious,
  urlDynamic = '',
  existingDocuments = {},
  documentFieldMapping = {},
  loading: externalLoading,
  hasStepData = false,
  prefilledDisablesValidate = false,
  onValidationChange,
  useFrontendConfig = false, // Default to false for backward compatibility
  specialDropdownHandlers = {}, // Default to empty object
  // getFieldDisabled,
}) => {
  const dispatch = useAppDispatch();
  const pinCodeOtherRef = useRef<HTMLInputElement>(null);

  // Redux selectors
  const fields = useSelector(selectFormFields);
  const formValues = useSelector(selectFormValues);
  const stepDocuments = useSelector(selectStepDocuments);
  const fieldErrors = useSelector(selectFieldErrors);
  const loading = useSelector(selectFormLoading);
  const error = useSelector(selectFormError);
  const dropdownOptions = useSelector(selectDropdownOptions);

  // Get auth state for API calls
  const authState = useSelector((state: any) => state.auth);
  const workflowId =
    authState?.workflowId || authState?.userDetails?.workflowId;
  const userId = authState?.userDetails?.userId || authState?.userDetails?.id;

  // State to track auto-populated fields and their original values
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(
    new Set()
  );
  const [ckycVerifiedValue, setCkycVerifiedValue] = useState<string>('');
  const [citizenshipVerifiedValue, setCitizenshipVerifiedValue] =
    useState<string>('');
  const [disableValidateButton, setDisableValidateButton] = useState<
    boolean | undefined
  >();

  // Use Aadhaar masking hook for smart masking functionality
  const {
    getDisplayValue,
    handleAadhaarFocus,
    handleAadhaarBlur,
    handleAadhaarChange,
  } = useAadhaarMasking();

  // Helper function to clear field value and associated documents
  const clearFieldAndDocuments = useCallback(
    (fieldName: string) => {
      console.log(`🧹 Clearing field and documents for: ${fieldName}`);
      console.log(
        `📋 Current formValues for ${fieldName}:`,
        formValues[fieldName]
      );

      // Clear the field value
      dispatch(updateFormValue({ fieldName, value: '' }));
      dispatch(clearFieldError(fieldName));

      // Find and remove associated documents
      // Check for both the field name and common file field variations
      const possibleFileFieldNames = [
        fieldName,
        `${fieldName}File`,
        `${fieldName}_file`,
        `${fieldName}Proof`,
      ];

      // Also clear the file field values in formValues
      possibleFileFieldNames.forEach((fileFieldName) => {
        console.log(
          `🗑️ Clearing file field: ${fileFieldName}, current value:`,
          formValues[fileFieldName]
        );
        dispatch(updateFormValue({ fieldName: fileFieldName, value: '' }));
      });

      // Filter out documents associated with this field
      const documentsToRemove: string[] = [];
      possibleFileFieldNames.forEach((fileFieldName) => {
        // Check in documentFieldMapping
        const documentId = documentFieldMapping[fileFieldName];
        if (documentId) {
          documentsToRemove.push(documentId);
          console.log(
            `📄 Found document in mapping: ${fileFieldName} -> ${documentId}`
          );
        }

        // Also check stepDocuments by fieldKey (with safety check)
        if (stepDocuments && Array.isArray(stepDocuments)) {
          stepDocuments.forEach((doc) => {
            if (doc.fieldKey === fileFieldName || doc.fieldKey === fieldName) {
              documentsToRemove.push(doc.id);
              console.log(
                `📄 Found document in stepDocuments: ${doc.fieldKey} -> ${doc.id}`
              );
            }
          });
        }
      });

      // Remove duplicates
      const uniqueDocumentsToRemove = [...new Set(documentsToRemove)];

      if (uniqueDocumentsToRemove.length > 0) {
        console.log(
          `🗑️ Removing ${uniqueDocumentsToRemove.length} documents:`,
          uniqueDocumentsToRemove
        );
        console.log(
          `📋 Current stepDocuments before removal:`,
          stepDocuments && Array.isArray(stepDocuments)
            ? stepDocuments.map((d) => ({ id: d.id, fieldKey: d.fieldKey }))
            : []
        );

        // Remove from stepDocuments (with safety check)
        const updatedStepDocuments =
          stepDocuments && Array.isArray(stepDocuments)
            ? stepDocuments.filter(
              (doc) => !uniqueDocumentsToRemove.includes(doc.id)
            )
            : [];
        console.log(
          `📋 Updated stepDocuments after removal:`,
          updatedStepDocuments.map((d) => ({ id: d.id, fieldKey: d.fieldKey }))
        );
        dispatch(updateStepDocument(updatedStepDocuments));

        // Remove from existingDocuments
        const updatedExistingDocuments = { ...existingDocuments };
        uniqueDocumentsToRemove.forEach((docId) => {
          delete updatedExistingDocuments[docId];
        });
        console.log(
          `📋 Updated existingDocuments keys:`,
          Object.keys(updatedExistingDocuments)
        );
        dispatch(updateFetchedDocument(updatedExistingDocuments));

        console.log(
          `✅ Documents cleared. Remaining stepDocuments:`,
          updatedStepDocuments.length
        );
        console.log(
          `✅ Dispatched updateStepDocument with:`,
          updatedStepDocuments
        );
      } else {
        console.log(`⚠️ No documents found to remove for field: ${fieldName}`);
        console.log(
          `📋 Checked possibleFileFieldNames:`,
          possibleFileFieldNames
        );
        console.log(`📋 Current documentFieldMapping:`, documentFieldMapping);
        console.log(
          `📋 Current stepDocuments:`,
          stepDocuments && Array.isArray(stepDocuments)
            ? stepDocuments.map((d) => ({ id: d.id, fieldKey: d.fieldKey }))
            : []
        );
      }
    },
    [
      dispatch,
      documentFieldMapping,
      stepDocuments,
      existingDocuments,
      formValues,
    ]
  );

  // Monitor CKYC and citizenship changes to reset auto-populated fields
  useEffect(() => {
    const currentCkycValue = String(formValues['hoiCkycNo'] || '');
    const currentCitizenshipValue = String(formValues['hoiCitizenship'] || '');

    // If CKYC number changed from verified value, reset auto-populated fields
    if (ckycVerifiedValue && currentCkycValue !== ckycVerifiedValue) {
      setAutoPopulatedFields(new Set());
      setCkycVerifiedValue('');
      setCitizenshipVerifiedValue('');
    }

    // If citizenship changed from verified value, reset auto-populated fields
    if (
      citizenshipVerifiedValue &&
      currentCitizenshipValue !== citizenshipVerifiedValue
    ) {
      setAutoPopulatedFields(new Set());
      setCkycVerifiedValue('');
      setCitizenshipVerifiedValue('');
    }
  }, [
    formValues,
    ckycVerifiedValue,
    citizenshipVerifiedValue,
    setCkycVerifiedValue,
    setCitizenshipVerifiedValue,
    setAutoPopulatedFields,
  ]);

  // Restore disabled state when page loads with step data (after refresh)
  useEffect(() => {
    if (hasStepData && autoPopulatedFields.size === 0) {
      // Check if HOI page and if CKYC-related fields are populated
      const isHoiPage = location.pathname.includes('head-of-institution');

      if (isHoiPage) {
        const hoiCkycNo = formValues['hoiCkycNo'];
        const hoiCitizenship = formValues['hoiCitizenship'];
        const hoiFirstName = formValues['hoiFirstName'];
        const hoiLastName = formValues['hoiLastName'];
        const hoiGender = formValues['hoiGender'];

        // Only restore verified state if CKYC verification was actually completed previously
        // Check: CKYC number exists, citizenship is Indian, AND multiple auto-populated fields exist
        // This prevents false positives when user just typed CKYC without verifying
        const hasMultipleAutoPopulatedFields =
          hoiFirstName && (hoiLastName || hoiGender);

        if (
          hoiCkycNo &&
          hoiCitizenship === 'Indian' &&
          hasMultipleAutoPopulatedFields
        ) {
          const fieldsToDisable = new Set<string>();
          fieldsToDisable.add('hoiCkycNo');
          fieldsToDisable.add('hoiCitizenship');

          // Add other fields that were auto-populated
          const autoPopulatedFieldNames = [
            'hoiTitle',
            'hoiFirstName',
            'hoiMiddleName',
            'hoiLastName',
            'hoiGender',
          ];

          autoPopulatedFieldNames.forEach((fieldName) => {
            if (formValues[fieldName]) {
              fieldsToDisable.add(fieldName);
            }
          });

          setAutoPopulatedFields(fieldsToDisable);
          setCkycVerifiedValue(String(hoiCkycNo));
          setCitizenshipVerifiedValue(String(hoiCitizenship));
        }
      }

      // Check if Nodal Officer page and if CKYC-related fields are populated
      const isNodalOfficerPage = location.pathname.includes('nodal-officer');
      if (isNodalOfficerPage) {
        const noCkycNo = formValues['noCkycNo'];
        const noCitizenship = formValues['noCitizenship'];
        const noFirstName = formValues['noFirstName'];
        const noLastName = formValues['noLastName'];
        const noGender = formValues['noGender'];

        // Only restore verified state if CKYC verification was actually completed previously
        // Check: CKYC number exists, citizenship is Indian, AND multiple auto-populated fields exist
        // This prevents false positives when user just typed CKYC without verifying
        const hasMultipleAutoPopulatedFields =
          noFirstName && (noLastName || noGender);

        if (
          noCkycNo &&
          noCitizenship === 'Indian' &&
          hasMultipleAutoPopulatedFields
        ) {
          const fieldsToDisable = new Set<string>();
          fieldsToDisable.add('noCkycNo');
          fieldsToDisable.add('noCitizenship');

          // Add other fields that were auto-populated
          const autoPopulatedFieldNames = [
            'noTitle',
            'noFirstName',
            'noMiddleName',
            'noLastName',
            'noGender',
          ];

          autoPopulatedFieldNames.forEach((fieldName) => {
            if (formValues[fieldName]) {
              fieldsToDisable.add(fieldName);
            }
          });

          setAutoPopulatedFields(fieldsToDisable);
          setCkycVerifiedValue(String(noCkycNo));
          setCitizenshipVerifiedValue(String(noCitizenship));
        }
      }
    }
  }, [hasStepData, formValues, autoPopulatedFields.size, location.pathname]);

  React.useEffect(() => {
    let disabled;
    // Scenario 1: No step data found (first time)

    if (!hasStepData) {
      // Enable save & next only after OTP validation
      disabled =
        !isFormValid ||
        (configuration?.submissionSettings?.validateButton && !isOTPValidated);

      setDisableValidateButton(disabled ? true : undefined);
    }

    // Scenario 2: Step data found (returning user)
    // For specific steps (e.g., HOI), keep Validate disabled (button greyed) and allow Save if form is valid
    if (prefilledDisablesValidate) {
      disabled = true; // disable validate button
    } else {
      // default behavior: enable validate if form not valid
      disabled = !isFormValid;
    }

    setDisableValidateButton(disabled);
  }, [hasStepData, prefilledDisablesValidate]);

  // Helper function to check if a field should be disabled
  // const isFieldAutoPopulated = useCallback(
  //   (fieldName: string) => {
  //     return autoPopulatedFields.has(fieldName);
  //   },
  //   [autoPopulatedFields]
  // );

  const isFieldAutoPopulated = useCallback(
    (fieldName: string) => {
      // Check if getFieldDisabled function is provided and returns true
      // if (getFieldDisabled && getFieldDisabled(fieldName)) {
      //   return true;
      // }

      // Determine context by route
      const isNodalOfficerPage = location.pathname.includes('nodal-officer');
      const isHoiPage = location.pathname.includes('head-of-institution');

      // Determine which citizenship field to read
      let citizenshipValue = '';
      if (isHoiPage) {
        citizenshipValue = String(formValues['hoiCitizenship'] || '');
      } else if (isNodalOfficerPage) {
        citizenshipValue = String(formValues['noCitizenship'] || '');
      } else {
        citizenshipValue = String(formValues['citizenship'] || '');
      }

      // Compute
      const isIndianCitizen =
        String(citizenshipValue || '')
          .trim()
          .toLowerCase() === 'indian';

      const isNodalOfficerField = fieldName.startsWith('no');

      // Early return for auto-populated fields
      const isInAutoPopulated = autoPopulatedFields.has(fieldName);

      if (isInAutoPopulated) {
        return true;
      }

      // Constitution-based field disabling logic (Entity Profile)
      const constitutionValue = String(formValues['constitution'] || '');

      // LLPIN field: Enable only when Constitution is "Limited Liability Partnership"
      if (fieldName === 'llpin') {
        return constitutionValue !== 'Limited Liability Partnership';
      }

      // Proprietor Name field: Enable only when Constitution is "Sole Proprietorship"
      if (fieldName === 'proprietorName') {
        return constitutionValue !== 'Sole Proprietorship';
      }

      // CIN field: Enable only when Constitution is Private Limited (D), Public Limited (E), or Section 8 Companies (M)
      if (fieldName === 'cin') {
        const cinRequiredConstitutions = [
          'Private Limited Company',
          'Public Limited Company',
          'Section 8 Companies (Companies Act, 2013)',
          'D',
          'E',
          'M',
        ];
        return !cinRequiredConstitutions.includes(constitutionValue);
      }

      // Define base field groups
      let baseNameFields = [];
      if (isNodalOfficerPage) {
        baseNameFields = [
          'title',
          'firstName',
          'middleName',
          'lastName',
          'citizenship',
          'noCitizenship',
          'ckycNumber',
          'ckycNo',
          'noCkycNumber',
          'noCkycNo',
          'hoiCkycNumber',
          'hoiCkycNo',
          'email',
          'noEmail',
          'mobileNumber',
          'noMobileNumber',
          'countryCode',
          'noCountryCode',
          'noGender',
        ];
        const addresArray = [
          'noAddressLine1',
          'noAddressLine2',
          'noAddressLine3',
          'noRegisterCity',
          'noRegisterState',
          'noRegisterCountry',
          'noRegisterDistrict',
          'noRegisterPincode',
          'noRegisterPincodeOther',
          'noRegisterDigipin',
        ];

        // if (
        //   formValues.noOfficeAddress !== '' &&
        //   formValues.noOfficeAddress !== 'Enter office address' &&
        //   formValues.noOfficeAddress !== null &&
        //   formValues.noOfficeAddress !== undefined
        // ) {
        // }
        baseNameFields = [...baseNameFields, ...addresArray];
      } else {
        baseNameFields = [
          'title',
          'firstName',
          'middleName',
          'lastName',
          'gender',
        ];
      }

      const prefixes = isNodalOfficerField ? ['no'] : ['hoi'];
      const withPrefixes = (fields: string[]) =>
        fields.flatMap((f) => [
          f,
          ...prefixes.map((p) => `${p}${f[0].toUpperCase()}${f.slice(1)}`),
        ]);

      const allNameFields = withPrefixes(baseNameFields);
      if (isNodalOfficerPage) {
        if (allNameFields.includes(fieldName)) return true;
      } else {
        if (allNameFields.includes(fieldName)) return isIndianCitizen;
      }

      // Treat any CKYC-like field (case-insensitive) as CKYC for citizenship rule
      // Do NOT apply this rule on Nodal Officer pages; disabling there is controlled by step-data flags only
      if (!isNodalOfficerPage) {
        const lowerFieldName = fieldName.toLowerCase();
        if (
          lowerFieldName.includes('ckyc') ||
          [
            'ckycno',
            'ckycnumber',
            'nockycno',
            'nockycnumber',
            'hoickycno',
          ].includes(lowerFieldName)
        ) {
          return !isIndianCitizen;
        }
      }

      return false;
    },
    [autoPopulatedFields, formValues, location.pathname]
  );

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

      // Evaluate each conditional logic rule
      for (const logic of field.conditionalLogic) {
        const when = logic.when;
        if (!when?.field) continue;

        let dependentValue = formValues[when.field];

        // If the dependent value is a label/name, try to convert it to code using field options
        if (dependentValue && typeof dependentValue === 'string') {
          // Find the field definition for the dependent field
          const dependentField = fields.find((f) => f.fieldName === when.field);

          // If field has options (dropdown), try to map label/name to code
          if (
            dependentField?.fieldOptions &&
            Array.isArray(dependentField.fieldOptions)
          ) {
            const matchingOption = dependentField.fieldOptions.find(
              (opt: any) => {
                // Check if the current value matches the option's name, label, or text
                const optionName = opt.name || opt.label || opt.text;
                return optionName === dependentValue;
              }
            );

            // If we found a matching option with a code, use the code for comparison
            if (matchingOption && matchingOption.code) {
              dependentValue = matchingOption.code;
            }
          }
        }

        const operator = when.operator || 'equals';
        const expectedValues = Array.isArray(when.value)
          ? when.value
          : [when.value];

        let conditionMatched = false;
        switch (operator) {
          case 'in':
          case 'equals':
            conditionMatched = expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
            break;
          case 'not_in':
          case 'not_equals':
            conditionMatched = !expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
            break;
          default:
            conditionMatched = false;
        }

        // SPECIAL CASE: Proprietor Name uses ONLY conditional validationRules
        if (field.fieldName === 'proprietorName') {
          if (conditionMatched && logic.then?.validationRules) {
            return { ...logic.then.validationRules };
          }
          if (!conditionMatched && logic.else?.validationRules) {
            return { ...logic.else.validationRules };
          }
        }

        // If condition matched, use 'then' rules; otherwise use 'else' rules
        if (conditionMatched && logic.then?.validationRules) {
          const mergedRules = {
            ...field.validationRules,
            ...logic.then.validationRules,
          };
          // If required is set to false, also set imageRequired to false for file fields
          if (
            mergedRules.required === false ||
            String(mergedRules.required) === 'false'
          ) {
            // Set imageRequired to false in validationFile (create if doesn't exist)
            mergedRules.validationFile = {
              ...(mergedRules.validationFile || {}),
              imageRequired: false,
            };
            // Also set imageRequired at the top level for backward compatibility
            mergedRules.imageRequired = false;
          }
          return mergedRules;
        } else if (!conditionMatched && logic.else?.validationRules) {
          const mergedRules = {
            ...field.validationRules,
            ...logic.else.validationRules,
          };
          // If required is set to false, also set imageRequired to false for file fields
          if (
            mergedRules.required === false ||
            String(mergedRules.required) === 'false'
          ) {
            // Set imageRequired to false in validationFile (create if doesn't exist)
            mergedRules.validationFile = {
              ...(mergedRules.validationFile || {}),
              imageRequired: false,
            };
            // Also set imageRequired at the top level for backward compatibility
            mergedRules.imageRequired = false;
          }
          return mergedRules;
        } else if (
          !conditionMatched &&
          !logic.else?.validationRules &&
          logic.then?.validationRules
        ) {
          // IMPORTANT: If condition doesn't match and there's no else clause,
          // but there IS a then clause that sets required=true, we should make the field optional
          // This handles cases where conditional logic only specifies when field is required,
          // but doesn't explicitly say it's optional otherwise
          if (
            logic.then.validationRules.required === true ||
            String(logic.then.validationRules.required) === 'true'
          ) {
            const optionalRules = {
              ...field.validationRules,
              required: false,
              imageRequired: false,
              validationFile: {
                ...(field.validationRules?.validationFile || {}),
                imageRequired: false,
              },
            };
            return optionalRules;
          }
        }
      }

      return field.validationRules;
    },
    [formValues, fields]
  );

  // Build validation schema when fields or form values change
  useEffect(() => {
    if (fields.length > 0) {
      // Create fields with evaluated conditional logic
      const fieldsWithConditionalLogic = fields.map((field) => {
        const evaluatedRules = evaluateConditionalLogic(field);

        return {
          ...field,
          validationRules: evaluatedRules,
        };
      });

      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    }
  }, [fields, formValues, validationSchemaBuilder, evaluateConditionalLogic]);

  // Fetch form fields on component mount (skip if using frontend config)
  useEffect(() => {
    // Skip API fetch if frontend config is being used (fields already set via setFieldsFromConfig)
    if (useFrontendConfig) {
      console.log('⏭️ Skipping API fetch - using frontend configuration');
      return;
    }

    // Only fetch from API if not using frontend config
    if (urlDynamic) {
      dispatch(fetchFormFields({ url: urlDynamic }));
    }
  }, [dispatch, urlDynamic, useFrontendConfig]);

  // Clear any existing field errors on component mount to prevent old errors from showing
  useEffect(() => {
    dispatch(clearAllErrors());
    setValidationErrors({});
  }, [dispatch]);

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
      dispatch(updateFormValue({ fieldName, value }));

      // Clear validation errors when user makes changes
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });

      // Special handling for Office Address dropdown - Fetch from address details API
      if (
        fieldName === 'noOfficeAddress' ||
        fieldName === 'officeAddress' ||
        (fieldName?.toLowerCase().includes('office') &&
          fieldName?.toLowerCase().includes('address') &&
          !fieldName?.toLowerCase().includes('line'))
      ) {
        // Skip auto-population if "Enter office address" is selected
        if (
          value &&
          value.trim() !== '' &&
          value.toLowerCase() !== 'enter office address'
        ) {
          // Determine source prefix based on selection
          let sourcePrefix = '';
          if (value.toLowerCase().includes('register'))
            sourcePrefix = 'register';
          else if (value.toLowerCase().includes('correspondence'))
            sourcePrefix = 'correspondence';

          if (!sourcePrefix) return;

          const addressFields = [
            'Line1',
            'Line2',
            'Line3',
            'City',
            'State',
            'Country',
            'District',
            'Pincode',
            'PincodeOther',
            'Digipin',
          ];

          const getFieldNames = (field: string) => [
            `noAddress${field}`,
            `noRegister${field}`,
            `no${field}`,
          ];

          // ──────────────────────────────────────
          // 1️⃣ COPY FROM FORM IF AVAILABLE
          // ──────────────────────────────────────
          let filledFromForm = false;

          for (const field of addressFields) {
            const source = `no${sourcePrefix}${field}`;
            const possibleTargets = getFieldNames(field);
            const target = possibleTargets.find((n) =>
              fields.some((f) => f.fieldName === n)
            );
            if (!target) continue;

            const sourceValue = formValues[source];
            if (sourceValue !== '' && sourceValue != null) {
              console.log(`📝 Form copy: ${source} → ${target}:`, sourceValue);
              handleFieldChange(target, String(sourceValue));
              filledFromForm = true;
            }
          }

          if (filledFromForm) return; // ✔ no API required

          // ──────────────────────────────────────
          // 2️⃣ FALLBACK — FETCH FROM API
          // ──────────────────────────────────────
          if (!workflowId || !userId) return;

          Secured.get(
            `/api/v1/registration/step-data?stepKey=addresses&workflowId=${workflowId}&userId=${userId}`
          )
            .then((res) => {
              // safe resolver — works even if backend changes wrapping
              const addressData = res?.data?.data?.data?.step?.data || {};

              console.log('📬 addressData:', addressData);

              for (const field of addressFields) {
                const apiKey = `${sourcePrefix}${field}`;
                const possibleTargets = getFieldNames(field);
                const target = possibleTargets.find((n) =>
                  fields.some((f) => f.fieldName === n)
                );
                if (!target) continue;

                const apiHasKey = Object.prototype.hasOwnProperty.call(
                  addressData,
                  apiKey
                );

                // 🔥 THIS FIX — clear if API did not return the key
                const valueToSet = apiHasKey
                  ? addressData[apiKey] == null
                    ? ''
                    : String(addressData[apiKey])
                  : '';

                console.log(
                  apiHasKey
                    ? `🌐 API -> ${apiKey} → ${target}: "${valueToSet}"`
                    : `⚠️ API missing → clearing ${target} = ""`
                );

                handleFieldChange(target, valueToSet);
              }
            })
            .catch((e) => console.error('API error', e));
        } else if (
          value &&
          value.toLowerCase() === 'enter office address'
        ) {
          // Clear address fields when "Enter office address" is selected
          console.log('🧹 Clearing address fields for manual entry');
          const addressFields = [
            'Line1',
            'Line2',
            'Line3',
            'City',
            'State',
            'Country',
            'District',
            'Pincode',
            'PincodeOther',
            'Digipin',
          ];

          const getFieldNames = (field: string) => [
            `noAddress${field}`,
            `noRegister${field}`,
            `no${field}`,
          ];

          for (const field of addressFields) {
            const possibleTargets = getFieldNames(field);
            const target = possibleTargets.find((n) =>
              fields.some((f) => f.fieldName === n)
            );
            if (target) {
              handleFieldChange(target, '');
            }
          }
        }
      }
      if (fieldName === 'hoiCitizenship') {
        const hoiCkycNoFieldIndex = fields.findIndex(
          (f: FormField) => f.fieldName === 'hoiCkycNo'
        );

        if (hoiCkycNoFieldIndex !== -1) {
          // clone fields to avoid direct mutation
          const updatedFields = [...fields];

          // update the GSTIN field
          updatedFields[hoiCkycNoFieldIndex] = {
            ...updatedFields[hoiCkycNoFieldIndex],
            validationRules: {
              required: value === 'Indian',
            },
          };
          dispatch(clearFieldError('hoiCkycNo'));
          // dispatch the updated GSTIN field
          dispatch(updateFieldValidation(updatedFields[hoiCkycNoFieldIndex]));
        }
        const hoiFieldsToClear = [
          'hoiCkycNo',
          'hoiTitle',
          'hoiFirstName',
          'hoiMiddleName',
          'hoiLastName',
          'hoiGender',
          'hoiDesignation',
          'hoiEmail',
          'hoiCountryCode',
          'hoiMobile',
          'hoiLandline',
        ];

        hoiFieldsToClear.forEach((f) =>
          dispatch(updateFormValue({ fieldName: f, value: '' }))
        );
        setAutoPopulatedFields(new Set());
        setCkycVerifiedValue('');
        setCitizenshipVerifiedValue('');
        dispatch(clearAllErrors());
      }

      // Special handling for PIN Code dropdown
      if (
        fieldName === 'register_pincode' ||
        fieldName === 'noRegisterPincode' ||
        (fieldName?.toLowerCase().includes('pincode') &&
          fieldName?.toLowerCase().includes('register'))
      ) {
        if (
          value.toLowerCase() === 'others' ||
          value.toLowerCase() === 'other'
        ) {
          // Clear previous value
          dispatch(
            updateFormValue({ fieldName: 'noRegisterPincodeOther', value: '' })
          );

          // Scroll into view & focus after render
          setTimeout(() => {
            pinCodeOtherRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            pinCodeOtherRef.current?.focus();
          }, 100);
        } else {
          // Clear "Other" field if a standard option is selected
          dispatch(
            updateFormValue({ fieldName: 'noRegisterPincodeOther', value: '' })
          );
        }
      }

      // Existing special handling for regulator field
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

      if (fieldName === 'constitution') {
        const llpinFieldIndex = fields.findIndex(
          (f: FormField) => f.fieldName === 'llpin'
        );
        //LLPIN
        const updatedFields = [...fields];
        updatedFields[llpinFieldIndex] = {
          ...updatedFields[llpinFieldIndex],
          validationRules: {
            required: value === 'Limited Liability Partnership',
            minLength:
              value === 'Limited Liability Partnership' ? '7' : undefined,
            maxLength:
              value === 'Limited Liability Partnership' ? '7' : undefined,
            regx:
              value === 'Limited Liability Partnership'
                ? '^[A-Za-z0-9]{7}$'
                : undefined,
            regxMessage:
              value === 'Limited Liability Partnership'
                ? 'LLPIN must be exactly 7 alphanumeric characters'
                : undefined,
          },
        };
        dispatch(clearFieldError('llpin'));
        dispatch(updateFieldValidation(updatedFields[llpinFieldIndex]));

        // Clear LLPIN value and documents if constitution is not Limited Liability Partnership
        if (value !== 'Limited Liability Partnership') {
          clearFieldAndDocuments('llpin');
        }

        // CIN field handling
        const cinFieldIndex = fields.findIndex(
          (f: FormField) => f.fieldName === 'cin'
        );
        if (cinFieldIndex !== -1) {
          const cinRequiredConstitutions = [
            'Private Limited Company',
            'Public Limited Company',
            'Section 8 Companies (Companies Act, 2013)',
            'D',
            'E',
            'M',
          ];
          const isCinRequired = cinRequiredConstitutions.includes(value);

          updatedFields[cinFieldIndex] = {
            ...updatedFields[cinFieldIndex],
            validationRules: {
              required: isCinRequired,
              minLength: isCinRequired ? '21' : undefined,
              maxLength: isCinRequired ? '21' : undefined,
              regx: isCinRequired
                ? '^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$'
                : undefined,
              regxMessage: isCinRequired
                ? 'Invalid CIN format (e.g., L12345MH2020PLC987654)'
                : undefined,
            },
          };
          dispatch(clearFieldError('cin'));
          dispatch(updateFieldValidation(updatedFields[cinFieldIndex]));

          // Clear CIN value and documents if constitution doesn't require it
          if (!isCinRequired) {
            clearFieldAndDocuments('cin');
          }
        }

        if (
          formValues['pan'] !== '' &&
          formValues['pan'] !== null &&
          formValues['pan'] !== undefined
        ) {
          dispatch(
            updateFormValue({
              fieldName: 'pan',
              value: formValues['pan'] as string,
            })
          );
        }
        // sole proprietership
        const proprietorNameFieldIndex = fields.findIndex(
          (f: FormField) => f.fieldName === 'proprietorName'
        );
        updatedFields[proprietorNameFieldIndex] = {
          ...updatedFields[proprietorNameFieldIndex],
          validationRules: {
            required: value === 'Sole Proprietorship',
            maxLength: '50',
          },
        };
        dispatch(clearFieldError('proprietorName'));
        dispatch(
          updateFieldValidation(updatedFields[proprietorNameFieldIndex])
        );

        // Clear proprietorName value and documents if constitution is not Sole Proprietorship
        if (value !== 'Sole Proprietorship') {
          clearFieldAndDocuments('proprietorName');
        } else {
          // Preserve existing value if it's Sole Proprietorship
          dispatch(
            updateFormValue({
              fieldName: 'proprietorName',
              value: formValues['proprietorName'] as string,
            })
          );
        }
      }

      if (fieldName === 'noProofOfIdentity') {
        // Clear the Proof of Identity Number field when proof type changes
        dispatch(
          updateFormValue({
            fieldName: 'noProofOfIdentityNumber',
            value: '',
          })
        );
        // Clear any existing errors for the number field
        dispatch(clearFieldError('noProofOfIdentityNumber'));
      }

      // Find the field to check for dependent dropdowns
      const field = fields.find((f: FormField) => f.fieldName === fieldName);
      if (!field) return;

      const dependentFields = fields.filter((f: FormField) => {
        const url = f.fieldAttributes?.url;
        if (!url) return false;
        if (url.includes(`{${fieldName}}`)) return true;
        if (
          fieldName === 'registeDistrict' &&
          url.includes('{registerDistrict}')
        )
          return true;
        return false;
      });

      if (dependentFields.length > 0) {
        for (const dependentField of dependentFields) {
          if (dependentField.fieldAttributes?.url) {
            const {
              url: baseUrl,
              method = 'GET',
              headers = {},
              payloadTemplate,
            } = dependentField.fieldAttributes;

            const selectedOption = field.fieldOptions?.find((opt) => {
              const option = opt as any;
              return (
                opt.value === value ||
                option.code === value ||
                option.label === value
              );
            });

            let urlValue = value;
            if (selectedOption) {
              const option = selectedOption as any;
              if (fieldName.toLowerCase().includes('country') && option.name)
                urlValue = option.name;
              else if (
                fieldName.toLowerCase().includes('state') &&
                option.label
              )
                urlValue = option.label;
              else if (
                fieldName.toLowerCase().includes('district') &&
                option.label
              )
                urlValue = option.label;
            }

            let processedUrl = baseUrl;
            if (baseUrl.includes(`{${fieldName}}`)) {
              processedUrl = baseUrl.replace(`{${fieldName}}`, urlValue);
            } else if (
              fieldName === 'registeDistrict' &&
              baseUrl.includes('{registerDistrict}')
            ) {
              processedUrl = baseUrl.replace('{registerDistrict}', urlValue);
            }

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

      // Call special dropdown handlers if defined for this field
      if (specialDropdownHandlers && specialDropdownHandlers[fieldName]) {
        console.log(`🔄 Calling special handler for ${fieldName} with value: ${value}`);
        specialDropdownHandlers[fieldName](value);
      }
    },
    [dispatch, fields, getFilteredInstitutionTypeOptions, setValidationErrors, specialDropdownHandlers]
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

  // Handle form field changes - NO validation on typing
  const handleFieldChange = useCallback(
    (fieldName: string, value: string | File | null) => {
      // Force uppercase for PAN and GSTIN fields
      if (
        typeof value === 'string' &&
        (fieldName.toLowerCase().includes('pan') ||
          fieldName.toLowerCase().includes('gstin'))
      ) {
        value = value.toUpperCase();
      }
      // Special handling for fields with regex validation - validate immediately
      if (
        (fieldName === 'noRegisterPincodeOther' ||
          fieldName === 'llpin' ||
          fieldName === 'cin' ||
          fieldName === 'gstin') &&
        typeof value === 'string' &&
        value
      ) {
        const targetField = fields.find(
          (f: FormField) => f.fieldName === fieldName
        );

        // For fields with conditional logic, evaluate the conditions first
        let validationRules = targetField?.validationRules;

        if (
          targetField?.conditionalLogic &&
          targetField.conditionalLogic.length > 0
        ) {
          const condition = targetField.conditionalLogic[0];
          const whenFieldValue = formValues[condition.when.field];
          const conditionMet =
            condition.when.operator === 'not_equals'
              ? whenFieldValue !== condition.when.value
              : whenFieldValue === condition.when.value;

          validationRules = conditionMet
            ? condition.then?.validationRules
            : condition.else?.validationRules;
        }

        if (validationRules?.regx) {
          const regex = new RegExp(validationRules.regx);
          if (!regex.test(value)) {
            // Set error immediately if pattern doesn't match
            dispatch(
              setFieldError({
                field: fieldName,
                message: validationRules.regxMessage || 'Invalid format',
              })
            );
          } else {
            // Clear error if pattern matches
            dispatch(clearFieldError(fieldName));
          }
        }
      }

      // Special handling for LLPIN field - validate 7-digit alphanumeric when Constitution is LLP
      if (fieldName === 'llpin' && typeof value === 'string' && value) {
        const constitutionValue = formValues['constitution'] as string;

        if (constitutionValue === 'Limited Liability Partnership') {
          // LLPIN should be exactly 7 characters, alphanumeric only
          const llpinRegex = /^[A-Za-z0-9]{7}$/;

          if (!llpinRegex.test(value)) {
            // Set error immediately if pattern doesn't match
            dispatch(
              setFieldError({
                field: fieldName,
                message: 'LLPIN must be exactly 7 alphanumeric characters',
              })
            );
          } else {
            // Clear error if pattern matches
            dispatch(clearFieldError(fieldName));
          }
        }
      }

      // Special handling for CIN field - validate 21-character format when Constitution requires CIN
      if (fieldName === 'cin' && typeof value === 'string' && value) {
        const constitutionValue = formValues['constitution'] as string;
        const cinRequiredConstitutions = [
          'Private Limited Company',
          'Public Limited Company',
          'Section 8 Companies (Companies Act, 2013)',
          'D',
          'E',
          'M',
        ];

        if (cinRequiredConstitutions.includes(constitutionValue)) {
          // CIN format: L12345MH2020PLC987654 (21 characters)
          const cinRegex = /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

          if (!cinRegex.test(value)) {
            // Set error immediately if pattern doesn't match
            dispatch(
              setFieldError({
                field: fieldName,
                message: 'Invalid CIN format (e.g., L12345MH2020PLC987654)',
              })
            );
          } else {
            // Clear error if pattern matches
            dispatch(clearFieldError(fieldName));
          }
        }
      }

      // Special handling for Proof of Identity Number field - validate based on selected proof type
      if (
        fieldName === 'noProofOfIdentityNumber' &&
        typeof value === 'string' &&
        value
      ) {
        const proofType = String(
          formValues['noProofOfIdentity'] || ''
        ).toUpperCase();
        let regex: RegExp | null = null;
        let errorMessage = '';

        switch (proofType) {
          case 'AADHAAR':
            regex = /^[0-9]{4}$/;
            errorMessage = 'Enter last 4 digits of Aadhar ';
            break;
          case 'DRIVING LICENSE':
            regex = /^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$/;
            errorMessage =
              'Invalid Driving License format (e.g., MH1420110062821)';
            break;
          case 'PAN CARD':
            regex = /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/;
            errorMessage =
              'Invalid PAN format (4th character must be P, e.g., AAAPA1234A)';
            break;
          case 'PASSPORT':
            regex = /^[A-Z]{1}[0-9]{7}$/;
            errorMessage = 'Invalid Passport number (e.g., A1234567)';
            break;
          case 'VOTER ID':
            regex = /^[A-Z]{3}[0-9]{7}$/;
            errorMessage = 'Invalid Voter ID format (e.g., ABC1234567)';
            break;
          default:
            break;
        }

        if (regex && !regex.test(value)) {
          dispatch(
            setFieldError({
              field: fieldName,
              message: errorMessage,
            })
          );
        } else if (regex) {
          dispatch(clearFieldError(fieldName));
        }
      }

      // Special handling for Date of Birth field - validate minimum age of 18 years
      const fieldConfig = fields.find(
        (f: FormField) => f.fieldName === fieldName
      );
      const isDOBField =
        fieldConfig?.fieldLabel &&
        (/\b(dob|date of birth)\b/i.test(fieldConfig.fieldLabel) ||
          /birth.*date|date.*birth/i.test(fieldConfig.fieldLabel));

      if (
        isDOBField &&
        typeof value === 'string' &&
        value &&
        value.length === 10
      ) {
        // Only validate if we have a complete date (YYYY-MM-DD format)
        const birthDate = new Date(value);

        // Check if date is valid
        if (!isNaN(birthDate.getTime())) {
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          // Calculate exact age
          const exactAge =
            monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

          const currentError = fieldErrors.find(
            (error) => error.field === fieldName
          );

          if (exactAge < 18) {
            // Only set error if it's not already set with the same message
            if (currentError?.message !== 'Age must be at least 18 years') {
              dispatch(
                setFieldError({
                  field: fieldName,
                  message: 'Age must be at least 18 years',
                })
              );
            }
          } else {
            // Only clear error if there is one
            if (currentError) {
              dispatch(clearFieldError(fieldName));
            }
          }
        }
      } else if (
        isDOBField &&
        (!value || (typeof value === 'string' && value.length < 10))
      ) {
        // Clear error if field is empty or incomplete and error exists
        const existingError = fieldErrors.find(
          (error) => error.field === fieldName
        );
        if (existingError) {
          dispatch(clearFieldError(fieldName));
        }
      }

      // 1️⃣ Always update the value in Redux
      dispatch(updateFormValue({ fieldName, value }));

      // 2️⃣ Enable validate button for contact fields
      if (/mobile|email/i.test(fieldName)) {
        setDisableValidateButton(false);
      }

      // 3️⃣ Handle CKYC Number changes — enable dependent fields for Indian citizens
      if (/ckycnumber|ckycno/i.test(fieldName)) {
        const isNodalOfficerPage = location.pathname.includes('nodal-officer');
        const isHoiPage = location.pathname.includes('head-of-institution');

        // Determine citizenship dynamically
        const citizenshipValue = String(
          formValues[
          isHoiPage
            ? 'hoiCitizenship'
            : isNodalOfficerPage
              ? 'noCitizenship'
              : 'citizenship'
          ] || ''
        )
          .trim()
          .toLowerCase();

        const isIndianCitizen = citizenshipValue === 'indian';

        if (isIndianCitizen) {
          const prefix = isNodalOfficerPage ? 'no' : 'hoi';

          const dependentFields = [
            `${prefix}Title`,
            `${prefix}FirstName`,
            `${prefix}MiddleName`,
            `${prefix}LastName`,
            `${prefix}Gender`,
          ];

          // 3a️⃣ Clear their values in Redux
          dependentFields.forEach((f) =>
            dispatch(
              updateFormValueWithoutvalidateField({ fieldName: f, value: '' })
            )
          );

          // 3b️⃣ Remove them from autoPopulatedFields so they become editable
          setAutoPopulatedFields((prev) => {
            const updated = new Set(prev);
            dependentFields.forEach((f) => updated.delete(f));
            return updated;
          });
        }
      }

      // 4️⃣ Always clear validation errors when user makes changes
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

      if (
        fieldName === 'proprietorName' &&
        typeof value === 'string' &&
        value
      ) {
        const targetField: any = fields.find(
          (f: FormField) => f.fieldName === fieldName
        );

        const validationRules = evaluateConditionalLogic(targetField);

        if (validationRules?.regx) {
          const regex = new RegExp(validationRules.regx);
          if (!regex.test(value)) {
            dispatch(
              setFieldError({
                field: fieldName,
                message: validationRules.regxMessage || 'Invalid format',
              })
            );
          } else {
            // Clear error if pattern matches
            dispatch(clearFieldError(fieldName));
          }
        }
      }

      // // Also clear Redux field errors
      // dispatch(clearFieldError(fieldName));
      // if (fieldName.endsWith('_file')) {
      //   dispatch(clearFieldError(fieldName));
      // }
      // const mainFieldName = fieldName.replace('_file', '');
      // dispatch(clearFieldError(mainFieldName));

      // 5️⃣ Inline validation for mobile/phone fields and GSTIN
      if (typeof value === 'string') {
        const isMobileField = /(mobile|phone)/i.test(fieldName);

        // GSTIN validation using local state (after error clearing)
        if (fieldName === 'gstin' && value) {
          const targetField = fields.find(
            (f: FormField) => f.fieldName === fieldName
          );

          // For fields with conditional logic, evaluate the conditions first
          let validationRules = targetField?.validationRules;

          if (
            targetField?.conditionalLogic &&
            targetField.conditionalLogic.length > 0
          ) {
            const condition = targetField.conditionalLogic[0];
            const whenFieldValue = formValues[condition.when.field];
            const conditionMet =
              condition.when.operator === 'not_equals'
                ? whenFieldValue !== condition.when.value
                : whenFieldValue === condition.when.value;

            validationRules = conditionMet
              ? condition.then?.validationRules
              : condition.else?.validationRules;
          }

          if (validationRules?.regx) {
            const regex = new RegExp(validationRules.regx);
            if (!regex.test(value)) {
              // Set error using local state so it persists after clearing
              setValidationErrors((prev) => ({
                ...prev,
                [fieldName]: validationRules?.regxMessage || 'Invalid format',
              }));
              return; // Exit early to prevent further processing
            }
          }
        }

        if (isMobileField) {
          // Find field definition
          const fieldDef = fields.find(
            (f: FormField) => f.fieldName === fieldName
          );

          if (fieldDef) {
            // Determine country code for mobile validation
            const countryCodeField = fieldName.includes('hoi')
              ? 'hoiCountryCode'
              : fieldName.includes('no')
                ? 'noCountryCode'
                : 'countryCode';

            const countryCodeValue = String(
              formValues[countryCodeField] || ''
            ).toLowerCase();
            const isIndianCountryCode = ['+91', '91', 'india'].some((v) =>
              countryCodeValue.includes(v)
            );

            // Use the helper function to get correct rules based on country code
            const mobileRules = getMobileValidationRules(
              fieldDef,
              isIndianCountryCode
            );

            // Validate minLength for mobile fields
            if (mobileRules && value.trim()) {
              let errorMessage: string | null = null;

              if (mobileRules.minLength) {
                const minLen = parseInt(String(mobileRules.minLength));
                const digitsOnly = value.replace(/\D/g, '');
                const lengthToCheck = digitsOnly.length;

                if (lengthToCheck < minLen) {
                  errorMessage =
                    mobileRules.minLengthMessage ||
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

        // Email validation - removed inline validation, will be handled by Yup on form submit/validate
        // This prevents stale validation errors from persisting when clicking Validate button
      }
    },
    [dispatch, formValues, location.pathname, fields]
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

  const [clearKey, setClearKey] = useState(0);
  const processedFields = useRef(new Set<number>());

  const handleClear = useCallback(() => {
    // Preserve only fields that were auto-populated from step data (backend)
    // NOT fields that were populated via CKYC verification
    const fieldsToPreserve: Record<string, unknown> = {};

    // Only preserve fields that have the _autoPopulated marker from step data
    // These are truly uneditable fields from backend
    const stepDataMarkers = [
      'noCkycNumber_autoPopulated',
      'hoiCkycNo_autoPopulated',
    ];

    stepDataMarkers.forEach((marker) => {
      if (formValues[marker]) {
        fieldsToPreserve[marker] = formValues[marker];

        // Determine which fields to preserve based on the marker
        if (marker === 'noCkycNumber_autoPopulated') {
          // Preserve Nodal Officer fields from step data
          const noFieldsFromStepData = [
            'noCkycNumber',
            'noTitle',
            'noFirstName',
            'noMiddleName',
            'noLastName',
            'noGender',
            'noCitizenship',
            'noEmail',
            'noMobileNumber',
            'noCountryCode',
          ];

          noFieldsFromStepData.forEach((fieldName) => {
            if (formValues[fieldName] !== undefined) {
              fieldsToPreserve[fieldName] = formValues[fieldName];
            }
          });
        } else if (marker === 'hoiCkycNo_autoPopulated') {
          // Preserve HOI fields from step data
          const hoiFieldsFromStepData = [
            'hoiCkycNo',
            'hoiTitle',
            'hoiFirstName',
            'hoiMiddleName',
            'hoiLastName',
            'hoiGender',
            'hoiCitizenship',
          ];

          hoiFieldsFromStepData.forEach((fieldName) => {
            if (formValues[fieldName] !== undefined) {
              fieldsToPreserve[fieldName] = formValues[fieldName];
            }
          });
        }
      }
    });

    console.log(
      '🧹 Clear button: Preserving step data fields only:',
      fieldsToPreserve
    );

    // Clear all form data
    dispatch(clearForm());
    dispatch(clearStepData());
    setValidationErrors({});
    setClearKey((prev) => prev + 1);
    dispatch(updateStepDocument([]));
    dispatch(updateFetchedDocument({}));
    processedFields.current.clear();
    // Reset OTP validation when form is cleared
    setIsOTPValidated(false);

    // Clear the autoPopulatedFields Set (fields from CKYC verification should be cleared)
    // But we need to rebuild it with step data fields
    const stepDataFieldsSet = new Set<string>();
    Object.keys(fieldsToPreserve).forEach((fieldName) => {
      if (!fieldName.endsWith('_autoPopulated')) {
        stepDataFieldsSet.add(fieldName);
      }
    });

    setAutoPopulatedFields(stepDataFieldsSet);
    setCkycVerifiedValue('');
    setCitizenshipVerifiedValue('');

    // Restore only step data fields
    Object.entries(fieldsToPreserve).forEach(([fieldName, value]) => {
      dispatch(updateFormValue({ fieldName, value: String(value) }));
    });

    console.log(
      '✅ Clear button: Step data fields restored, CKYC verification fields cleared'
    );
  }, [dispatch, formValues]);

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
            break;
          }
        }
      }

      const hasDocument = !!(documentId && existingDocuments[documentId]);

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
        console.log(
          `✅ hasValidAttachment: New file found for ${field.fieldName}`,
          fileValue
        );
        return true;
      }

      // Check for existing document from API
      // Determine the correct field name to check
      let fieldNameToCheck = field.fieldName;

      if (field.fieldType === 'textfield_with_image') {
        // For textfield_with_image, use the file field name
        fieldNameToCheck = field.fieldFileName || `${field.fieldName}_file`;
      } else if (field.fieldType === 'file') {
        // For regular file fields, also check with _file suffix
        // Try both the field name and field name with _file suffix
        const hasExistingDirect = hasExistingDocument(field.fieldName);
        const hasExistingWithSuffix = hasExistingDocument(
          `${field.fieldName}_file`
        );

        if (hasExistingDirect || hasExistingWithSuffix) {
          console.log(
            `✅ hasValidAttachment: Existing document found for ${field.fieldName}`
          );
          return true;
        }

        console.log(
          `❌ hasValidAttachment: No file found for ${field.fieldName}`
        );
        return false;
      }

      const hasExisting = hasExistingDocument(fieldNameToCheck);
      if (hasExisting) {
        console.log(
          `✅ hasValidAttachment: Existing document found for ${fieldNameToCheck}`
        );
        return true;
      }

      console.log(
        `❌ hasValidAttachment: No file found for ${fieldNameToCheck}`
      );
      return false;
    },
    [hasExistingDocument]
  );

  // Check if all mandatory fields are filled and files are attached
  const isFormValid = useMemo(() => {
    if (!currentStepFields.length) return false;

    const validationResults = currentStepFields.map((field) => {
      // Skip validation for disabled fields
      const isDisabled = isFieldAutoPopulated(field.fieldName);
      if (isDisabled) return true; // Disabled fields are always valid (not validated)

      const value = formValues[field.fieldName];
      // Evaluate conditional logic to get the correct validation rules
      const rules = evaluateConditionalLogic(field);

      // Check if field is required
      const isRequired =
        rules?.required === true || String(rules?.required) === 'true';

      if (!isRequired) return true; // Non-required fields are always valid

      // Check based on field type
      switch (field.fieldType) {
        case 'textfield':
        case 'dropdown':
          return value && String(value).trim() !== '';

        case 'textfield_with_image': {
          const textValue = value;
          const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
          const fileValue = formValues[fileFieldName];

          const hasText =
            textValue && String(textValue).trim() !== '';

          const effectiveRules = evaluateConditionalLogic(field);
          const fileRules = effectiveRules?.validationFile;

          const hasFile = hasValidAttachment(field, fileValue);

          if (
            hasText &&
            fileRules?.imageRequired === true &&
            !hasFile
          ) {
            dispatch(
              setFieldError({
                field: fileFieldName,
                message:
                  fileRules.imageRequiredMessage || 'Document is required',
              })
            );
            return false;
          }

          if (hasText && hasFile) {
            dispatch(clearFieldError(fileFieldName));
          }
          return fileRules?.imageRequired ? hasText && hasFile : true;
        }


        case 'file': {
          // For regular file fields, the file is stored directly in field.fieldName
          // (not with _file suffix like textfield_with_image)
          const fileValue = value; // Use the value from formValues[field.fieldName]

          const isValid = hasValidAttachment(field, fileValue);
          console.log(`📋 File validation for ${field.fieldName}:`, {
            fieldName: field.fieldName,
            fileValue,
            isValid,
            isRequired,
          });
          return isValid;
        }

        default:
          return value && String(value).trim() !== '';
      }
    });

    const allValid = validationResults.every((result) => result);

    console.log('🔍 Form validation summary:', {
      totalFields: currentStepFields.length,
      validationResults,
      allValid,
      formValues,
    });

    return allValid;
  }, [
    currentStepFields,
    formValues,
    hasValidAttachment,
    existingDocuments,
    documentFieldMapping,
    evaluateConditionalLogic,
    isFieldAutoPopulated,
  ]);

  // Notify parent component when validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);

  // Helper function to prepare form data for submission
  const prepareFormDataForSubmission = useCallback(
    (rawFormData: Record<string, unknown>) => {
      const processedData: Record<string, unknown> = {};

      console.log('📦 Preparing form data for submission...');
      console.log('📝 Raw form data:', rawFormData);

      // Get current step fields that were fetched with the current URL
      // Filter fields to only include those loaded from the current step's URL
      const currentStepFieldsOnly = fields.filter((field) =>
        // Only include fields that are currently being rendered
        currentStepFields.some((currentField) => currentField.id === field.id)
      );

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
          console.log(`⏭️ Skipping ${fieldName}: not in current step`);
          return;
        }

        // Check if field is disabled - skip disabled fields from submission
        // const isDisabled = isFieldAutoPopulated(field.fieldName);
        // if (isDisabled) {
        //   // Skip disabled fields entirely - don't send them in the request
        //   console.log(`🚫 Skipping ${fieldName}: field is disabled`);
        //   return;
        // }

        // For file fields, also check if the base field is disabled
        if (fieldName.endsWith('_file')) {
          const baseFieldName = fieldName.replace('_file', '');
          const isBaseFieldDisabled = isFieldAutoPopulated(baseFieldName);
          if (isBaseFieldDisabled) {
            // Skip file fields whose base field is disabled
            console.log(
              `🚫 Skipping ${fieldName}: base field ${baseFieldName} is disabled`
            );
            return;
          }
        }

        // Handle file fields specially
        if (
          (field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image') &&
          fieldName.endsWith('_file')
        ) {
          // Check if user uploaded a new file
          if (fieldValue instanceof File) {
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
                  break;
                }
              }
            }

            if (documentId && existingDocuments[documentId]) {
              // Send the document ID with the original file field name
              // This tells the backend to use the existing document for this field
              processedData[fieldName] = documentId;

              // Also include metadata about the document type for backend reference
              const documentType = Object.keys(documentFieldMapping).find(
                (key) => documentFieldMapping[key] === documentId
              );
              if (documentType) {
                processedData[`${baseFieldName}_documentType`] = documentType;
              }
            } else if (documentId && !existingDocuments[documentId]) {
              // Document was deleted by user - send empty string to indicate deletion
              processedData[fieldName] = '';
            } else {
              // No document ID found in mapping - field never had a document
              // For optional fields, send empty string to ensure field is cleared on backend
              processedData[fieldName] = '';
            }
          } else {
            // Other file value types (string URL, etc.)
            processedData[fieldName] = fieldValue;
          }
        } else {
          // Regular field, include as-is
          processedData[fieldName] = fieldValue;
          console.log(`✅ Including ${fieldName}:`, fieldValue);
        }
      });

      console.log('📤 Final processed data to submit:', processedData);
      console.log(
        '📊 Total fields in submission:',
        Object.keys(processedData).length
      );

      return processedData;
    },
    [
      fields,
      currentStepFields,
      documentFieldMapping,
      existingDocuments,
      isFieldAutoPopulated,
    ]
  );

  const handleSave = useCallback(async () => {
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

    if (
      customValidationPassed &&
      yupValidationPassed &&
      !hasFieldErrors &&
      onSave
    ) {
      // Prepare form data with proper handling of existing documents vs new files
      const processedFormData = prepareFormDataForSubmission(formValues);
      onSave(processedFormData);
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

  // Success Modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState({
    title: '',
    message: '',
  });

  const openOTPModal = useCallback(
    async (data: any) => {
      console.log(formValues);
      const otpData = {
        requestType: 'DIRECT',
        emailId: formValues.hoiEmail as string,
        mobileNo: formValues.hoiMobile as string,
        countryCode: formValues.hoiCountryCode as string,
        workflowId: workflowId,
        ckycNo:
          formValues.hoiCitizenship === 'Indian'
            ? (formValues.hoiCkycNo as string)
            : undefined,
        stepKey: 'hoi',
        name: formValues.hoiFirstName as string,
      };
      const result = await dispatch(OTPSend(otpData));
      if (OTPSend.fulfilled.match(result)) {
        setOtpData({
          emailId: data?.email,
          mobileNo: data?.mobile,
          countryCode: data?.countryCode,
          otpIdentifier: result?.payload?.data?.otpIdentifier,
        });
      } else {
        let fieldName = '';
        if (result?.payload?.field === 'ckyc') {
          fieldName = 'hoiCkycNumber';
        } else if (result?.payload?.field === 'mobile') {
          fieldName = 'hoiMobile';
        } else if (result?.payload?.field === 'email') {
          fieldName = 'hoiEmail';
        } else {
          return;
        }

        setValidationErrors({
          ...validationErrors,
          [`${fieldName}`]: result.payload?.message ?? '',
        });
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
    // Simple validation - check if form is valid
    const isValid = await validateAllFields();
    if (isValid) {
      // Create mock OTP data for validation using utility function
      const otpData = extractOTPFields(formValues);

      // Resolve country code from current form values if not already present
      const resolvedCountryCode =
        // otpData.countryCode ||
        formValues.countryCode ||
        formValues.noCountryCode ||
        formValues.hoiCountryCode ||
        '+91';

      openOTPModal({
        ...otpData,
        countryCode: resolvedCountryCode,
      });
    }
  }, [validateAllFields, formValues, openOTPModal]);

  const handleOTPSuccess = useCallback(() => {
    setDisableValidateButton(true);
    setIsOTPValidated(true);
    closeOTPModal();

    // Show success modal
    setSuccessMessage({
      title: 'Email and Mobile OTP',
      message: 'Verified Successfully.',
    });
    setIsSuccessModalOpen(true);
  }, [
    isOTPValidated,
    isFormValid,
    configuration?.submissionSettings?.validateButton,
    closeOTPModal,
  ]);

  const handleOTPClose = useCallback(() => {
    closeOTPModal();
  }, [closeOTPModal]);

  // Auto-validate form on page load if validate button is enabled and form has data
  useEffect(() => {
    const shouldAutoValidate =
      configuration?.submissionSettings?.validateButton && // Validate button is enabled
      !isOTPValidated && // Not already validated
      isFormValid && // Form is valid (mandatory fields filled)
      Object.keys(formValues).length > 0 && // Form has data
      currentStepFields.length > 0; // Fields are loaded

    if (shouldAutoValidate) {
      // Check if form has meaningful data (not just empty values)
      const hasValidData = Object.values(formValues).some((value) => {
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
      });

      if (hasValidData) {
        // Set OTP as validated directly without opening OTP modal
        setIsOTPValidated(true);
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
            // Don't fetch dependent dropdown options on initial load
            // They will be fetched when parent field changes
            processedFields.current.add(field.id);
            return;
          }
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

  // Update validation rules for pincode other field when "other" is selected
  useEffect(() => {
    const pincodeValue =
      formValues['register_pincode'] || formValues['noRegisterPincode'];
    const isPincodeOther =
      pincodeValue?.toString().toLowerCase() === 'other' ||
      pincodeValue?.toString().toLowerCase() === 'others';

    const pincodeOtherField = fields.find(
      (f: FormField) => f.fieldName === 'noRegisterPincodeOther'
    );

    if (pincodeOtherField && isPincodeOther) {
      // Get conditional validation rules
      const conditionalRules =
        pincodeOtherField.conditionalLogic?.[0]?.then?.validationRules;

      // Only update if rules are different (prevent infinite loop)
      const currentRules = pincodeOtherField.validationRules;
      const rulesAreDifferent =
        JSON.stringify(currentRules) !== JSON.stringify(conditionalRules);

      if (conditionalRules && rulesAreDifferent) {
        // Update the field with new validation rules
        dispatch(
          updateFieldValidation({
            ...pincodeOtherField,
            validationRules: conditionalRules,
          })
        );
      }
    } else if (pincodeOtherField && !isPincodeOther) {
      // Reset to original validation rules when "other" is not selected
      // Only reset if current rules are not null (prevent infinite loop)
      if (pincodeOtherField.validationRules !== null) {
        dispatch(
          updateFieldValidation({
            ...pincodeOtherField,
            validationRules: null,
          })
        );
      }
    }
  }, [
    formValues['register_pincode'],
    formValues['noRegisterPincode'],
    fields,
    dispatch,
  ]);

  // Render individual field based on type
  const renderField = (field: FormField) => {
    // Get current field value
    const value = formValues[field.fieldName] || '';

    // Evaluate conditional logic to get the correct validation rules
    const evaluatedValidationRules = evaluateConditionalLogic(field);

    // Get field errors from multiple sources
    const reduxFieldError = fieldErrors.find(
      (error) => error.field === field.fieldName
    )?.message;
    const validationError = validationErrors[field.fieldName];
    const apiFieldError = getFieldError(field.fieldName);

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
    } else if (field.fieldType === 'file') {
      // For regular file fields, check API errors for the field name
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      const reduxFileFieldError = fieldErrors.find(
        (error) => error.field === fileFieldName
      )?.message;
      apiFileError = getFieldError(field.fieldName) || '';
      fileError = reduxFileFieldError || validationError || apiFileError || '';
    }

    // Priority: validation errors > API errors > Redux errors
    const rawError =
      validationError || apiFieldError || reduxFieldError || fileError;
    const displayError = rawError
      ? typeof rawError === 'string'
        ? rawError
        : JSON.stringify(rawError)
      : undefined;
    const options = Array.isArray(dropdownOptions[field.id])
      ? dropdownOptions[field.id]
      : [];

    // Check if this is a mobile number field
    const isMobileField = /(mobile|phone)/i.test(field.fieldName);

    // Get citizenship status for conditional validation
    // First try specific known fields, then search dynamically
    let citizenshipValue = '';

    // Try known field names first
    const knownFields = [
      'iauCitizenship1',
      'iauCitizenship',
      'hoiCitizenship',
      'citizenship',
    ];
    for (const fieldName of knownFields) {
      if (formValues[fieldName]) {
        const value = formValues[fieldName];
        if (typeof value === 'string') {
          citizenshipValue = value.toLowerCase();
        } else if (typeof value === 'boolean') {
          citizenshipValue = value.toString().toLowerCase();
        } else if (value instanceof File) {
          citizenshipValue = value.name.toLowerCase();
        } else {
          citizenshipValue = String(value).toLowerCase();
        }
        break;
      }
    }

    // If not found, search for any field containing 'citizen'
    if (!citizenshipValue) {
      const citizenshipField = Object.keys(formValues).find((key) =>
        key.toLowerCase().includes('citizen')
      );
      if (citizenshipField && formValues[citizenshipField]) {
        const value = formValues[citizenshipField];
        if (typeof value === 'string') {
          citizenshipValue = value.toLowerCase();
        } else if (typeof value === 'boolean') {
          citizenshipValue = value.toString().toLowerCase();
        } else if (value instanceof File) {
          citizenshipValue = value.name.toLowerCase();
        } else {
          citizenshipValue = String(value).toLowerCase();
        }
      }
    }

    // const isIndianCitizen = citizenshipValue === 'indian';

    // Determine country code for mobile validation based on field context
    const countryCodeField = field.fieldName.includes('hoi')
      ? 'hoiCountryCode'
      : field.fieldName.includes('no')
        ? 'noCountryCode'
        : 'countryCode';

    const countryCodeValue = String(
      formValues[countryCodeField] || ''
    ).toLowerCase();
    const isIndianCountryCode = ['+91', '91', 'india'].some((v) =>
      countryCodeValue.includes(v)
    );

    // Get mobile validation rules based on conditional logic and country code
    const mobileRules = isMobileField
      ? getMobileValidationRules(field, isIndianCountryCode)
      : null;

    // Determine if current field is the main register pincode text field
    const isRegisterPincodeField = field.fieldName === 'noRegisterPincode';

    // Determine whether the register country is India for this form
    const registerCountryValue = String(
      formValues['noRegisterCountry'] || ''
    ).toLowerCase();

    const isRegisterCountryIndia = ['india', 'indian', 'in', '+91'].some((v) =>
      registerCountryValue.includes(v)
    );

    // Check if this is the pincode "other" field and if "other" is selected
    const isPincodeOtherField = field.fieldName === 'noRegisterPincodeOther';
    const pincodeValue =
      formValues['register_pincode'] || formValues['noRegisterPincode'];
    const isPincodeOtherSelected =
      isPincodeOtherField &&
      (pincodeValue?.toString().toLowerCase() === 'other' ||
        pincodeValue?.toString().toLowerCase() === 'others');

    // Check if this is the Proof of Identity Number field and get restrictions based on proof type
    const isProofOfIdentityNumberField =
      field.fieldName === 'noProofOfIdentityNumber';
    // ||
    // field.fieldName === 'pan';
    const proofOfIdentityType = String(
      formValues['noProofOfIdentity'] || ''
    ).toUpperCase();
    let proofMaxLength: number | undefined;
    let proofInputType: 'text' | 'tel' = 'text';
    let proofInputMode: 'text' | 'numeric' | undefined;

    if (isProofOfIdentityNumberField) {
      switch (proofOfIdentityType) {
        case 'AADHAAR':
          proofMaxLength = 4;
          proofInputMode = 'numeric';
          break;
        case 'DRIVING LICENSE':
          proofMaxLength = 15;
          proofInputType = 'text';
          break;
        case 'PAN CARD':
          proofMaxLength = 10;
          proofInputType = 'text';
          break;
        case 'PASSPORT':
          proofMaxLength = 8;
          proofInputType = 'text';
          break;
        case 'VOTER ID':
          proofMaxLength = 10;
          proofInputType = 'text';
          break;
        default:
          proofMaxLength = undefined;
          proofInputType = 'text';
      }
    }

    // Get conditional validation rules for pincode "other" field
    const pincodeOtherRules = isPincodeOtherSelected
      ? getPincodeOtherValidationRules(field)
      : null;

    switch (field.fieldType) {
      case 'textfield': {
        // Get appropriate placeholder
        const fieldPlaceholder =
          isMobileField && mobileRules
            ? mobileRules.placeholder
            : field.fieldPlaceholder || '';

        // Get error message based on validation rules
        const getErrorMessage = (error: string | undefined) => {
          if (!error) return undefined;

          // Handle pincode other field error messages
          if (isPincodeOtherSelected && pincodeOtherRules) {
            if (
              error.includes('required') &&
              pincodeOtherRules.requiredMessage
            ) {
              return pincodeOtherRules.requiredMessage;
            }
            if (
              error.includes('minLength') &&
              pincodeOtherRules.minLengthMessage
            ) {
              return pincodeOtherRules.minLengthMessage;
            }
            if (
              error.includes('maxLength') &&
              pincodeOtherRules.maxLengthMessage
            ) {
              return pincodeOtherRules.maxLengthMessage;
            }
            if (error.includes('pattern') && pincodeOtherRules.regxMessage) {
              return pincodeOtherRules.regxMessage;
            }
          }

          // Handle mobile field error messages
          if (isMobileField && mobileRules) {
            if (error.includes('required') && mobileRules.requiredMessage) {
              return mobileRules.requiredMessage;
            }
            if (error.includes('minLength') && mobileRules.minLengthMessage) {
              return mobileRules.minLengthMessage;
            }
            if (error.includes('maxLength') && mobileRules.maxLengthMessage) {
              return mobileRules.maxLengthMessage;
            }
            if (error.includes('pattern') && mobileRules.patternMessage) {
              return mobileRules.patternMessage;
            }
          }

          return error;
        };

        let validationRules = field.validationRules;
        if (
          [
            'noRegisterPincode',
            'noRegisterDistrict',
            'noRegisterState',
            'noRegisterCity',
          ].includes(field.fieldName)
        ) {
          if (field.conditionalLogic && field.conditionalLogic.length > 0) {
            if (
              formValues[field.conditionalLogic[0].when.field] ===
              field.conditionalLogic[0].when.value
            ) {
              validationRules =
                field.conditionalLogic[0].then?.validationRules ?? null;
            } else {
              validationRules =
                field.conditionalLogic[0].else?.validationRules ?? null;
            }
          }
        }

        const errorMessage = getErrorMessage(displayError);

        // Determine required field status
        let isRequired =
          isMobileField && mobileRules
            ? typeof mobileRules.required === 'boolean'
              ? mobileRules.required
              : mobileRules.required === 'true' ||
              mobileRules.required === 'required'
            : validationRules?.required || false;

        // Override required status for pincode "other" field if conditional rules apply
        if (isPincodeOtherSelected && pincodeOtherRules) {
          isRequired =
            typeof pincodeOtherRules.required === 'boolean'
              ? pincodeOtherRules.required
              : pincodeOtherRules.required === 'true' ||
              pincodeOtherRules.required === 'required';
        }

        // Compute pattern for validation
        const patternValue =
          isPincodeOtherSelected && pincodeOtherRules?.regx
            ? typeof pincodeOtherRules.regx === 'string'
              ? pincodeOtherRules.regx
              : undefined
            : isMobileField && mobileRules && mobileRules.pattern
              ? typeof mobileRules.pattern === 'string'
                ? mobileRules.pattern
                : undefined
              : undefined;

        // Apply Aadhaar masking if this is Proof of Identity Number field and type is AADHAAR
        // Only mask when field is not focused (to allow user to see what they're typing)
        const shouldMaskAadhaar =
          isProofOfIdentityNumberField && proofOfIdentityType === 'AADHAAR';
        const displayValue = getDisplayValue(
          value as string,
          shouldMaskAadhaar
        );

        return (
          <LabeledTextField
            key={field.id}
            ref={
              field.fieldName === 'noRegisterPincodeOther'
                ? pinCodeOtherRef
                : null
            }
            label={field.fieldLabel}
            value={displayValue}
            onChange={(e) => {
              // For Aadhaar, store only digits (unmasked)
              if (shouldMaskAadhaar) {
                handleAadhaarChange(e, handleFieldChange, field.fieldName);
              } else if (
                field.fieldName === 'pan' ||
                field.fieldName === 'gstin' ||
                (isProofOfIdentityNumberField &&
                  proofOfIdentityType === 'PAN CARD')
              ) {
                // Auto-capitalize PAN and GSTIN input
                handleFieldChange(
                  field.fieldName,
                  e.target.value.toUpperCase()
                );
              } else if (isRegisterPincodeField) {
                // For main register pincode text field, enforce numeric-only
                let val = e.target.value.replace(/\D/g, '');

                // If country is India, cap at 6 digits
                if (isRegisterCountryIndia && val.length > 6) {
                  val = val.slice(0, 6);
                }

                handleFieldChange(field.fieldName, val);
              } else {
                handleFieldChange(field.fieldName, e.target.value);
              }
            }}
            onFocus={() => {
              if (shouldMaskAadhaar) {
                handleAadhaarFocus();
              }
            }}
            onBlur={() => {
              if (shouldMaskAadhaar) {
                handleAadhaarBlur();
              }
            }}
            fieldName={field.fieldName}
            placeholder={fieldPlaceholder}
            required={isRequired}
            minLength={
              isRegisterPincodeField && isRegisterCountryIndia
                ? 6
                : isMobileField && mobileRules?.minLength
                  ? parseInt(mobileRules.minLength)
                  : isPincodeOtherSelected && pincodeOtherRules?.minLength
                    ? parseInt(pincodeOtherRules.minLength)
                    : field.validationRules?.minLength
                      ? parseInt(field.validationRules.minLength)
                      : undefined
            }
            maxLength={
              isRegisterPincodeField && isRegisterCountryIndia
                ? 6
                : isMobileField && mobileRules?.maxLength
                  ? parseInt(mobileRules.maxLength)
                  : isPincodeOtherSelected && pincodeOtherRules?.maxLength
                    ? parseInt(pincodeOtherRules.maxLength)
                    : isProofOfIdentityNumberField && proofMaxLength
                      ? proofMaxLength
                      : field.validationRules?.maxLength
                        ? parseInt(field.validationRules.maxLength)
                        : undefined
            }
            pattern={isRegisterPincodeField ? '^[0-9]*$' : patternValue}
            error={!!errorMessage}
            helperText={errorMessage}
            type={
              isMobileField || isPincodeOtherField
                ? 'tel'
                : isProofOfIdentityNumberField
                  ? proofInputType
                  : field.fieldName.includes('website')
                    ? 'url'
                    : 'text'
            }
            disabled={isFieldAutoPopulated(field.fieldName)}
            isMobileNumber={isMobileField}
            inputMode={
              isMobileField || isPincodeOtherField
                ? 'numeric'
                : isProofOfIdentityNumberField && proofInputMode
                  ? proofInputMode
                  : undefined
            }
          />
        );
      }

      case 'dropdown': {
        const isLoadingOptions =
          field.fieldAttributes?.url && !options.length && !loading;
        // console.log('🔍 Dropdown Debug:', {
        //   fieldName: field.fieldName,
        //   currentValue: value,
        //   options: options,
        //   displayError: displayError,
        // });

        // Add "other" option for pincode fields
        let dropdownOptions: Array<{
          label: string;
          value: string;
          regulator: string;
          types: Array<{ code: string; name: string; status: string }>;
          code: string;
          name: string;
        }> = options.map((option: DropdownOption, index: number) => {
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
            regulator: (optionWithExtras.regulator as string) || '',
            types:
              (optionWithExtras.types as Array<{
                code: string;
                name: string;
                status: string;
              }>) || [],
            code: (optionWithExtras.code as string) || '',
            name: (optionWithExtras.name as string) || '',
          };
        });

        // Add "other" option at the top for pincode fields only if options exist
        if (
          (field.fieldName === 'register_pincode' ||
            field.fieldName === 'noRegisterPincode' ||
            (field.fieldName?.toLowerCase().includes('pincode') &&
              field.fieldName?.toLowerCase().includes('register'))) &&
          dropdownOptions.length > 0
        ) {
          dropdownOptions = [
            {
              label: 'Other',
              value: 'other',
              regulator: '',
              types: [],
              code: '',
              name: '',
            },
            ...dropdownOptions,
          ];
        }

        const isDisabled = isFieldAutoPopulated(field.fieldName);

        return (
          <LabeledDropDown
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={(value as string) || ''}
            onChange={(selectedValue) => {
              handleDropdownChange(field.fieldName, selectedValue as string);
            }}
            options={dropdownOptions}
            placeholder={
              isLoadingOptions
                ? 'Loading options...'
                : field.fieldPlaceholder || `Select ${field.fieldLabel}`
            }
            required={field.validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            fieldName={field.fieldName}
            disabled={isDisabled}
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
            required={field.validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            disabled={isFieldAutoPopulated(field.fieldName)}
          />
        );

      case 'textfield_with_image': {
        // Get file field name from fieldFileName or fallback
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;

        // Check if field is disabled
        const isFieldDisabled = isFieldAutoPopulated(field.fieldName);

        // Get existing document for this field - but only if field is NOT disabled
        const documentId = documentFieldMapping[fileFieldName];
        const existingDoc =
          !isFieldDisabled && documentId
            ? existingDocuments[documentId]
            : undefined;

        // Debug logging for Constitution-dependent fields
        if (['cin', 'llpin', 'proprietorName'].includes(field.fieldName)) {
          console.log(`🔍 Rendering ${field.fieldName}:`, {
            isDisabled: isFieldDisabled,
            value: value,
            fileFieldName,
            documentId,
            hasExistingDoc: !!existingDoc,
            formValue: formValues[field.fieldName],
            fileValue: formValues[fileFieldName],
          });
        }

        // Use validationFile rules if available, otherwise fallback to main validation rules
        const fileValidationRules =
          evaluatedValidationRules?.validationFile || evaluatedValidationRules;

        // Apply Aadhaar masking for textfield_with_image if this is Proof of Identity Number field and type is AADHAAR
        // Only mask when field is not focused (to allow user to see what they're typing)
        const shouldMaskAadhaarWithImage =
          isProofOfIdentityNumberField && proofOfIdentityType === 'AADHAAR';
        const displayValueWithImage = getDisplayValue(
          value as string,
          shouldMaskAadhaarWithImage
        );

        return (
          <LabeledTextFieldWithUpload
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={displayValueWithImage}
            onDelete={(e) => {
              console.log(
                '🗑️ Delete button clicked for textfield_with_image field:',
                field.fieldName,
                'existingDoc:',
                e
              );

              if (e !== undefined) {
                // Delete document from server via API
                console.log('🗑️ Calling deleteDocument API for:', e.id);
                dispatch(deleteDocument(e.id));
              }

              // Clear the file field value for both existing and newly uploaded files
              dispatch(
                updateFormValue({ fieldName: fileFieldName, value: '' })
              );

              console.log('✅ Cleared form value:', fileFieldName);
            }}
            onChange={(e) => {
              // For Aadhaar, store only digits (unmasked)
              if (shouldMaskAadhaarWithImage) {
                handleAadhaarChange(e, handleFieldChange, field.fieldName);
              } else if (
                field.fieldName === 'pan' ||
                field.fieldName === 'gstin' ||
                (isProofOfIdentityNumberField &&
                  proofOfIdentityType === 'PAN CARD')
              ) {
                // Auto-capitalize PAN and GSTIN input
                handleFieldChange(
                  field.fieldName,
                  e.target.value.toUpperCase()
                );
              } else {
                handleFieldChange(field.fieldName, e.target.value);
              }
            }}
            onUpload={(file) => {
              handleFieldChange(fileFieldName, file);
            }}
            placeholder={field.fieldPlaceholder}
            required={evaluatedValidationRules?.required || false}
            minLength={
              evaluatedValidationRules?.minLength
                ? parseInt(evaluatedValidationRules.minLength)
                : undefined
            }
            maxLength={
              isProofOfIdentityNumberField && proofMaxLength
                ? proofMaxLength
                : evaluatedValidationRules?.maxLength
                  ? parseInt(evaluatedValidationRules.maxLength)
                  : undefined
            }
            type={
              isProofOfIdentityNumberField
                ? proofInputType
                : field.fieldName.includes('website')
                  ? 'url'
                  : 'text'
            }
            inputMode={
              isProofOfIdentityNumberField && proofInputMode
                ? proofInputMode
                : undefined
            }
            onFocus={() => {
              if (shouldMaskAadhaarWithImage) {
                handleAadhaarFocus();
              }
            }}
            onBlur={() => {
              if (shouldMaskAadhaarWithImage) {
                handleAadhaarBlur();
              }
            }}
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
            disabled={isFieldDisabled}
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
            required={field.validationRules?.required || false}
            hasData={autoPopulatedFields.has(field.fieldName)}
            verifyIcon={(() => {
              const isNodalOfficerPage =
                location.pathname.includes('nodal-officer');
              const lowerName = String(field.fieldName || '').toLowerCase();
              const isCkycField = lowerName.includes('ckyc');
              return isNodalOfficerPage && isCkycField ? true : false;
            })()}
            disabled={isFieldAutoPopulated(field.fieldName)}
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
              // const fa = matched?.fieldAttributes as
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

              if (
                !data ||
                !fa?.autoPopulate ||
                !Array.isArray(fa.autoPopulate)
              ) {
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
                } else {
                  result = responseData;
                }
              }

              // Create field mapping from API response to form fields
              // const fieldMapping: Record<string, string> = {
              //   // API response field -> Form field mapping
              //   title: 'hoiTitle',
              //   firstName: 'hoiFirstName',
              //   lastName: 'hoiLastName',
              //   middleName: 'hoiMiddleName',
              //   ckycNo: 'hoiCkycNo',
              //   // Add more mappings as needed
              // };

              const isNodalOfficerPage =
                location.pathname.includes('nodal-officer');

              const prefix = isNodalOfficerPage ? 'no' : 'hoi';

              const fieldMapping: Record<string, string> = {
                title: `${prefix}Title`,
                firstName: `${prefix}FirstName`,
                lastName: `${prefix}LastName`,
                middleName: `${prefix}MiddleName`,
                gender: `${prefix}Gender`,
                ckycNo: `${prefix}CkycNo`,
              };

              // Track populated fields and store verified values
              const populatedFields = new Set<string>();
              const currentCkycValue = String(formValues['hoiCkycNo'] || '');
              const currentCitizenshipValue = String(
                formValues['hoiCitizenship'] || ''
              );

              // Add CKYC number and citizenship fields to populated fields to disable them after verification
              populatedFields.add('hoiCkycNo');
              populatedFields.add('hoiCitizenship');

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
                  } else {
                    return; // Skip this field if not found
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

              // Also check and populate gender field if present in API response
              const genderFieldName = `${prefix}Gender`;
              if (result && result.gender) {
                dispatch(
                  updateFormValue({
                    fieldName: genderFieldName,
                    value: String(result.gender || ''),
                  })
                );
                populatedFields.add(genderFieldName);
              }

              // Force add gender field to populated fields if it was populated (even if not in autoPopulate array)
              if (formValues[genderFieldName] || result?.gender) {
                populatedFields.add(genderFieldName);
              }

              // Update state with populated fields and verified values
              setAutoPopulatedFields(populatedFields);
              setCkycVerifiedValue(currentCkycValue);
              setCitizenshipVerifiedValue(currentCitizenshipValue);
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

              // const fa = matched.fieldAttributes as
              const fa = matched?.fieldAttributes as
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
          />
        );

      case 'file': {
        // Check if field is disabled
        const isFileFieldDisabled = isFieldAutoPopulated(field.fieldName);

        // Get existing document for this field - but only if field is NOT disabled
        const fileDocumentId = documentFieldMapping[field.fieldName];
        const existingFileDoc =
          !isFileFieldDisabled && fileDocumentId
            ? existingDocuments[fileDocumentId]
            : undefined;

        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;

        const fileValidationRules =
          field.validationRules?.validationFile || field.validationRules;

        return (
          <div>
            <UploadButton
              key={`${field.id}-${clearKey}`}
              label={field.fieldLabel}
              onUpload={(file) => handleFieldChange(field.fieldName, file)}
              required={field.validationRules?.required || false}
              error={!!displayError}
              helperText={displayError}
              onDelete={(e: any) => {
                console.log(
                  '🗑️ File delete triggered for:',
                  field.fieldName,
                  'existingDoc:',
                  e
                );

                if (e !== undefined) {
                  // Delete document from server via API
                  console.log('🗑️ Calling deleteDocument API for:', e.id);
                  dispatch(deleteDocument(e.id));
                }

                // Clear the file field value (stored in field.fieldName for regular file fields)
                dispatch(
                  updateFormValue({ fieldName: field.fieldName, value: '' })
                );

                console.log('✅ Cleared form value:', field.fieldName);
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
              disabled={isFileFieldDisabled}
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
            // Hide noRegisterPincodeOther field by default, show only when "other" is selected
            if (field.fieldName === 'noRegisterPincodeOther') {
              const pincodeValue =
                formValues['register_pincode'] ||
                formValues['noRegisterPincode'];
              const isOtherSelected =
                pincodeValue?.toString().toLowerCase() === 'other' ||
                pincodeValue?.toString().toLowerCase() === 'others';

              if (!isOtherSelected) {
                return null;
              }
            }

            // For fields with conditional logic, include dependent field value in key to force re-render
            const fieldKey =
              field.conditionalLogic && field.conditionalLogic.length > 0
                ? `${field.id}-${field.conditionalLogic
                  .map((logic: any) => formValues[logic.when?.field] || '')
                  .join('-')}`
                : field.id;

            return (
              <FieldContainer key={fieldKey}>
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
        onPrevious={onPrevious}
        onValidate={handleValidate}
        validateLabel={configuration?.submissionSettings?.validateButtonText}
        showValidate={configuration?.submissionSettings?.validateButton}
        showSave={configuration?.submissionSettings?.submitButton}
        showClear={configuration?.submissionSettings?.clearButton}
        showPrevious={!!onPrevious}
        clearLabel={configuration?.submissionSettings?.clearButtonText}
        saveLabel={configuration?.submissionSettings?.submitButtonText}
        previousLabel="Previous"
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

            return disabled;
          }

          // Scenario 2: Step data found (returning user)
          // Enable both buttons if form is valid
          const disabled = !isFormValid;

          return disabled;
        })()}
        validateDisabled={disableValidateButton}
        clearDisabled={false}
        sx={{ margin: 0, padding: 0 }}
        submissionSettings={configuration?.submissionSettings}
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

      {/* Success Modal */}
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successMessage.title}
        message={successMessage.message}
        okText="OK"
        messageType="success"
      />
    </DynamicFormContainer>
  );
};

export default DynamicForm;
