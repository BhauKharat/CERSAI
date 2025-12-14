/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  LabeledCheckbox,
  LabeledDate,
  LabeledDropDown,
  LabeledTextField,
  LabeledTextFieldWithUpload,
  UploadButton,
} from '../../../../component/features/RERegistration/CommonComponent';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';

import LabeledTextFieldWithVerify from '../../../../component/features/RERegistration/CommonComponent/LabeledTextFieldWithVerify';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import { DropdownOption, FormField } from './types/formTypesUpdate';
import { Box, Alert } from '@mui/material';
import { useFieldError } from '../context/FieldErrorContext';
import axios from 'axios';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import FormAccordion from 'component/features/RERegistration/CommonComponent/FormAccordion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  selectStepDataLoading,
  fetchDocument,
} from './slice/updateStepDataSlice';
import LabeledDropDownUpdate from './CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from './CommonComponnet/LabledTextFieldUpdate';
import LabeledTextFieldWithUploadUpdate from './CommonComponnet/LableledTextFieldWithUploadUpdate';
import { buildValidationSchema } from './formValidation';
import * as Yup from 'yup';
import {
  fetchDropdownData,
  selectDropdownOptions,
  selectDropdownLoading,
  selectDropdownData,
  fetchFormFieldsAddress,
  fetchStepDataAddress,
  selectGroupedFields,
  selectDocuments,
  submitUpdatedAddressDetails,
  clearDropdownData,
} from './slice/updateAddressDetailsSlice';
import UpdateFormAccordion from './UpdateFormAccordion';
export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: FormField[];
  };
}
interface DocumentData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
}
interface StepProps {
  onSaveAndNext: () => void;
}
interface FormData {
  [key: string]: string | File | null | number | boolean | object;
}

const UpdateAddressDetailsStep: React.FC<StepProps> = ({ onSaveAndNext }) => {
  const [userProfileFormFields, setUserProfileFormFields] = useState<
    FormField[]
  >([]);
  const [configuration, setConfiguration] = useState<any>();
  const { getFieldError } = useFieldError();
  const [existingDocuments, setExistingDocuments] = useState<
    Record<string, string>
  >({});
  const [existingDocumentData, setExistingDocumentData] = useState<
    Record<string, DocumentData>
  >({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    sameAsCorrespondenceAddress: false, // Initialize checkbox with default value
  });
  const stepData = useSelector(
    (state: any) => state.updateAddressDetailsSlice.stepData
  );
  const fields = useSelector(
    (state: any) => state.updateAddressDetailsSlice.groupedFields
  );
  const config = useSelector(
    (state: any) => state.updateAddressDetailsSlice.configuration
  );
  const loading = useSelector(selectStepDataLoading);
  const [groupedFields, setGroupedFields] = useState<GroupedFields>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [generalError, setGeneralError] = useState<string>('');

  // Add these selectors
  const dropdownData = useSelector(selectDropdownData);
  const stepDocuments = useSelector(
    (state: any) => state.updateAddressDetailsSlice.documents
  );
  const fetchedDocuments = useSelector(
    (state: any) => state.updateStepData.fetchedDocuments
  );
  const [validationSchema, setValidationSchema] = useState<Yup.ObjectSchema<
    Record<string, unknown>
  > | null>(null);
  const validationSchemaBuilder = useMemo(() => buildValidationSchema, []);
  const isSyncingRef = useRef(false);
  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      let rules = field.validationRules || {};

      if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
        // Check each conditional logic rule
        for (const logic of field.conditionalLogic) {
          const when = logic.when;
          if (!when?.field) continue;

          const dependentValue = formData[when.field];
          const operator = when.operator || 'equals';
          const expectedValues = Array.isArray(when.value)
            ? when.value
            : [when.value];

          let conditionMatches = false;

          switch (operator) {
            case 'in':
            case 'equal': // Backend sends "equal" (without 's')
            case 'equals':
            case 'is': {
              // Normalize country values - handle India vs IN vs IND
              const normalizedExpected = expectedValues.map((v) =>
                String(v).toLowerCase()
              );
              const normalizedDependent = String(
                dependentValue ?? ''
              ).toLowerCase();

              // Special handling for country fields - normalize "India", "IN", "IND"
              const isCountryField = when.field
                .toLowerCase()
                .includes('country');
              const indiaValues = ['india', 'in', 'ind'];

              if (isCountryField) {
                // If expected value is "india" and dependent is any of india/in/ind, match
                const expectsIndia = normalizedExpected.some((v) =>
                  indiaValues.includes(v)
                );
                const isIndiaSelected =
                  indiaValues.includes(normalizedDependent);

                if (expectsIndia && isIndiaSelected) {
                  conditionMatches = true;
                } else if (expectsIndia && !isIndiaSelected) {
                  conditionMatches = false;
                } else {
                  conditionMatches =
                    normalizedExpected.includes(normalizedDependent);
                }
              } else {
                conditionMatches =
                  normalizedExpected.includes(normalizedDependent);
              }
              break;
            }
            case 'not_in':
            case 'not_equal': // Backend may send "not_equal" (without 's')
            case 'not_equals':
            case 'is_not':
              conditionMatches = !expectedValues
                .map((v) => String(v).toLowerCase())
                .includes(String(dependentValue ?? '').toLowerCase());
              break;
            case 'is_not_empty':
              conditionMatches =
                dependentValue !== null &&
                dependentValue !== undefined &&
                dependentValue !== '';
              break;
            case 'is_empty':
              conditionMatches = !dependentValue || dependentValue === '';
              break;
            default:
              conditionMatches = false;
          }

          // If condition matches, use "then" rules
          if (conditionMatches && logic.then?.validationRules) {
            rules = {
              ...rules,
              ...logic.then.validationRules,
            };
            break;
          }

          // If condition doesn't match and "else" exists, use "else" rules
          if (!conditionMatches && logic.else?.validationRules) {
            rules = {
              ...(field.validationRules || {}),
              ...logic.else.validationRules,
            };
            break;
          }
        }
      }

      // Force mandatory for specific address fields
      const isAddressField = [
        'Country',
        'State',
        'District',
        'City',
        'Pincode',
      ].some(
        (suffix) =>
          field.fieldName.endsWith(suffix) && !field.fieldName.includes('Other')
      );
      // Determine if field belongs to Register or Correspondence group
      let groupPrefix = '';
      const fieldNameLower = field.fieldName.toLowerCase().trim();

      if (fieldNameLower.startsWith('register')) {
        groupPrefix = 'register';
      } else if (fieldNameLower.startsWith('correspondence')) {
        groupPrefix = 'correspondence';
      }

      // Check if Country is India
      const countryValue = formData[`${groupPrefix}Country`];
      const isIndia =
        countryValue &&
        ['india', 'in', 'ind'].includes(
          String(countryValue).toLowerCase().trim()
        );

      // Fields that are conditional on Country being India
      const isConditionalField = ['state', 'district', 'city', 'pincode'].some(
        (suffix) =>
          fieldNameLower.endsWith(suffix) &&
          !fieldNameLower.includes('other') &&
          !fieldNameLower.includes('digipin')
      );

      if (isConditionalField) {
        if (isIndia) {
          // Required if India - preserve backend's requiredMessage if available
          rules = {
            ...rules,
            required: true,
            // Only set requiredMessage if not already provided by conditionalLogic
            requiredMessage:
              rules.requiredMessage || `${field.fieldLabel} is required`,
          };
        } else {
          // Not required if NOT India
          // Preserve regex and length constraints from backend's else block (for pincode validation)
          // Only set required to false, keep other validation rules intact
          rules = {
            ...rules,
            required: false,
            requiredMessage: undefined,
            // Keep regx, regxMessage, minLength, maxLength from backend's else block
            // These are needed for validating non-India pincodes (alphanumeric, max 50 chars)
          };
        }
      }

      // Logic for main Pincode fields when "other" or "others" is selected
      // When "other" is selected, skip length/regex validation on the main pincode field
      // The actual pincode validation will be applied to the PincodeOther field
      if (
        field.fieldName.match(/Pincode$/i) &&
        !field.fieldName.includes('Other')
      ) {
        const currentPincodeValue = formData[field.fieldName];
        const pincodeValueLower = String(
          currentPincodeValue || ''
        ).toLowerCase();
        const isOtherSelected =
          pincodeValueLower === 'other' || pincodeValueLower === 'others';

        if (isOtherSelected) {
          // When "Other" is selected, remove length/regex validation from main pincode field
          // The validation will be applied to the PincodeOther field instead
          return {
            ...rules,
            required: rules.required, // Keep required as-is
            minLength: undefined,
            minLengthMessage: undefined,
            maxLength: undefined,
            maxLengthMessage: undefined,
            regx: undefined,
            regxMessage: undefined,
          };
        }
      }

      // Logic for "Other Pincode" fields - uses conditionalLogic from backend
      // The conditionalLogic already defines validation rules for when "other" is selected
      // This section is handled by the conditionalLogic evaluation above (lines 124-185)
      // No hardcoded rules needed here - the backend provides all validation rules

      // Relax validation for Address Line fields to allow common characters
      const isAddressLineField = ['Line1', 'Line2', 'Line3'].some((suffix) =>
        field.fieldName.endsWith(suffix)
      );

      // if (isAddressLineField) {
      //   // Remove regex validation entirely for address lines as requested
      //   // Explicitly set regx to undefined to satisfy TypeScript interface
      //   return {
      //     ...rules,
      //     regx: undefined,
      //     regxMessage: undefined,
      //   };
      // }

      // Digipin validation rules now come from backend's field.validationRules
      // No hardcoded rules needed - the backend provides all validation rules

      return rules;
    },
    [formData]
  );

  // Function to check if field should be visible based on conditional logic
  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return true; // No conditional logic means always visible
      }

      const matchedLogic = field.conditionalLogic.find((logic: any) => {
        const when = logic.when;
        if (!when?.field) return false;

        const dependentValue = formData[when.field];
        const operator = when.operator || 'equals';
        const expectedValues = Array.isArray(when.value)
          ? when.value
          : [when.value];

        switch (operator) {
          case 'in':
          case 'equal': // Backend sends "equal" (without 's')
          case 'equals':
          case 'is':
            return expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
          case 'not_in':
          case 'not_equal': // Backend may send "not_equal" (without 's')
          case 'not_equals':
          case 'is_not':
            return !expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
          case 'is_not_empty':
            return (
              dependentValue !== null &&
              dependentValue !== undefined &&
              dependentValue !== ''
            );
          case 'is_empty':
            return !dependentValue || dependentValue === '';
          default:
            return false;
        }
      });

      // If there's a matched condition, field is visible. Otherwise, it's hidden
      return !!matchedLogic;
    },
    [formData]
  );

  // Add this function to extract all fields from groupedFields
  const extractAllFieldsFromGroupedFields = useCallback((): FormField[] => {
    if (!groupedFields || Object.keys(groupedFields).length === 0) {
      return [];
    }

    const allFields: FormField[] = [];

    Object.values(groupedFields).forEach((group) => {
      if (group && group.fields && Array.isArray(group.fields)) {
        allFields.push(...group.fields);
      }
    });

    return allFields;
  }, [groupedFields]);
  useEffect(() => {
    const allFields = extractAllFieldsFromGroupedFields();

    if (allFields.length > 0 && !loading) {
      const fieldsWithConditionalLogic = allFields.map((field) => {
        const rules = evaluateConditionalLogic(field);
        return {
          ...field,
          validationRules: rules,
        };
      });

      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    }
  }, [
    groupedFields,
    validationSchemaBuilder,
    evaluateConditionalLogic,
    loading,
    extractAllFieldsFromGroupedFields,
    formData,
  ]);
  const dispatch = useDispatch<AppDispatch>();

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  // Get workflowId from updateWorkflow slice (automatically updated after entity profile submission)
  const updateWorkflowId = useSelector(
    (state: RootState) => state.updateWorkflow.workflowId
  );
  const currentUpdateStep = useSelector(
    (state: RootState) => state.updateWorkflow.currentStep
  );

  useEffect(() => {
    const userId = userDetails?.userId || 'NO_0000';

    dispatch(
      fetchStepDataAddress({
        stepKey: 'addresses',
        userId: userId,
      })
    );

    dispatch(fetchFormFieldsAddress());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (fields && !loading) {
      setGroupedFields(fields);
      setIsDataLoaded(true);
    }
  }, [fields, loading]);

  useEffect(() => {
    if (config && !loading) {
      setConfiguration(config);
    }
  }, [config, loading]);

  // Helper function to compare addresses and determine if they are the same
  const areAddressesSame = useCallback((data: Record<string, any>): boolean => {
    const fieldsToCompare = [
      'Line1',
      'Line2',
      'Line3',
      'Country',
      'State',
      'District',
      'City',
      'Pincode',
      'PincodeOther',
      'Digipin',
    ];

    for (const field of fieldsToCompare) {
      const registerValue = String(data[`register${field}`] || '').trim();
      const correspondenceValue = String(
        data[`correspondence${field}`] || ''
      ).trim();

      // If both are empty, continue
      if (!registerValue && !correspondenceValue) continue;

      // If values are different, addresses are not the same
      if (registerValue !== correspondenceValue) {
        return false;
      }
    }

    return true;
  }, []);

  useEffect(() => {
    if (
      stepData &&
      Object.keys(stepData).length > 0 &&
      !loading &&
      isDataLoaded
    ) {
      const initialFormData: FormData = {};

      Object.entries(stepData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle pincode fields that might be objects
          if (
            (key === 'registerPincode' || key === 'correspondencePincode') &&
            typeof value === 'object' &&
            value !== null &&
            'pincode' in value
          ) {
            initialFormData[key] = (value as any).pincode;
          } else {
            initialFormData[key] = value;
          }
        }
      });

      // Ensure City fields are always initialized (even if empty) so Yup can validate them
      const cityFields = ['registerCity', 'correspondenceCity'];
      cityFields.forEach((field) => {
        if (!(field in initialFormData)) {
          initialFormData[field] = '';
        }
      });

      // Dynamically determine checkbox state by comparing actual address values
      // Don't rely on the stored sameAsCorrespondenceAddress value from API
      const addressesAreSame = areAddressesSame(initialFormData);
      initialFormData['sameAsCorrespondenceAddress'] = addressesAreSame;

      setFormData(initialFormData);
    }
  }, [stepData, loading, isDataLoaded, areAddressesSame]);

  // Fetch documents when stepDocuments is available
  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0 && !loading) {
      const documentsMap: Record<string, string> = {};

      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id) {
          documentsMap[doc.fieldKey] = doc.id;
          // Dispatch fetch for each document
          dispatch(fetchDocument(doc.id));
        }
      });

      setExistingDocuments(documentsMap);
    }
  }, [stepDocuments, loading, dispatch]);

  // Update existingDocumentData when fetchedDocuments changes
  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0 && fetchedDocuments) {
      const documentDataMap: Record<string, DocumentData> = {};

      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id && fetchedDocuments[doc.id]) {
          const docData = fetchedDocuments[doc.id];
          documentDataMap[doc.fieldKey] = {
            id: doc.id,
            fileName: docData.fileName || `document_${doc.fieldKey}`,
            fileSize: docData.fileSize || 0,
            mimeType: docData.mimeType || 'application/octet-stream',
            dataUrl: docData.dataUrl || '',
          };
        }
      });

      // Only update if we have document data
      if (Object.keys(documentDataMap).length > 0) {
        setExistingDocumentData(documentDataMap);
      }
    }
  }, [fetchedDocuments, stepDocuments]);

  // Helper function to find field by name
  const findFieldByName = useCallback(
    (fieldName: string): FormField | null => {
      for (const group of Object.values(groupedFields)) {
        const field = group.fields?.find((f) => f.fieldName === fieldName);
        if (field) return field;
      }
      return null;
    },
    [groupedFields]
  );

  // Effect to handle cascading dropdowns for Register Address
  useEffect(() => {
    if (!formData.registerCountry || !isDataLoaded) return;

    const stateField = findFieldByName('registerState');
    if (stateField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'registerState',
          fieldAttributes: stateField.fieldAttributes,
          formData: formData,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.registerCountry, isDataLoaded, findFieldByName, dispatch]);

  useEffect(() => {
    if (!formData.registerState || !isDataLoaded) return;

    const districtField = findFieldByName('registerDistrict');
    if (districtField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'registerDistrict',
          fieldAttributes: districtField.fieldAttributes,
          formData: formData,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.registerState, isDataLoaded, findFieldByName, dispatch]);

  useEffect(() => {
    if (!formData.registerDistrict || !isDataLoaded) return;

    // Fetch City options based on District
    const cityField = findFieldByName('registerCity');
    if (cityField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'registerCity',
          fieldAttributes: cityField.fieldAttributes,
          formData: formData,
        })
      );
    }

    // Fetch Pincode options based on District
    const pincodeField = findFieldByName('registerPincode');
    if (pincodeField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'registerPincode',
          fieldAttributes: pincodeField.fieldAttributes,
          formData: formData,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.registerDistrict, isDataLoaded, findFieldByName, dispatch]);

  useEffect(() => {
    if (!formData.correspondenceCountry || !isDataLoaded) return;

    const stateField = findFieldByName('correspondenceState');
    if (stateField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'correspondenceState',
          fieldAttributes: stateField.fieldAttributes,
          formData: formData,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.correspondenceCountry, isDataLoaded, findFieldByName, dispatch]);

  useEffect(() => {
    if (!formData.correspondenceState || !isDataLoaded) return;

    const districtField = findFieldByName('correspondenceDistrict');
    if (districtField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'correspondenceDistrict',
          fieldAttributes: districtField.fieldAttributes,
          formData: formData,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.correspondenceState, isDataLoaded, findFieldByName, dispatch]);

  useEffect(() => {
    if (!formData.correspondenceDistrict || !isDataLoaded) return;

    // Fetch City options based on District
    const cityField = findFieldByName('correspondenceCity');
    if (cityField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'correspondenceCity',
          fieldAttributes: cityField.fieldAttributes,
          formData: formData,
        })
      );
    }

    // Fetch Pincode options based on District
    const pincodeField = findFieldByName('correspondencePincode');
    if (pincodeField?.fieldAttributes?.type === 'external_api') {
      dispatch(
        fetchDropdownData({
          fieldName: 'correspondencePincode',
          fieldAttributes: pincodeField.fieldAttributes,
          formData: formData,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.correspondenceDistrict,
    isDataLoaded,
    findFieldByName,
    dispatch,
  ]);

  // Auto-sync register address to correspondence address when checkbox is checked
  useEffect(() => {
    if (formData.sameAsCorrespondenceAddress && !isSyncingRef.current) {
      isSyncingRef.current = true;
      setFormData((prev) => {
        // Only update if values are different
        if (
          prev.correspondenceLine1 === prev.registerLine1 &&
          prev.correspondenceLine2 === prev.registerLine2 &&
          prev.correspondenceLine3 === prev.registerLine3 &&
          prev.correspondenceCountry === prev.registerCountry &&
          prev.correspondenceState === prev.registerState &&
          prev.correspondenceDistrict === prev.registerDistrict &&
          prev.correspondenceCity === prev.registerCity &&
          prev.correspondencePincode === prev.registerPincode &&
          prev.correspondencePincodeOther === prev.registerPincodeOther &&
          prev.correspondenceDigipin === prev.registerDigipin
        ) {
          return prev;
        }
        return {
          ...prev,
          correspondenceLine1: prev.registerLine1 || '',
          correspondenceLine2: prev.registerLine2 || '',
          correspondenceLine3: prev.registerLine3 || '',
          correspondenceCountry: prev.registerCountry || '',
          correspondenceState: prev.registerState || '',
          correspondenceDistrict: prev.registerDistrict || '',
          correspondenceCity: prev.registerCity || '',
          correspondencePincode: prev.registerPincode || '',
          correspondencePincodeOther: prev.registerPincodeOther || '',
          correspondenceDigipin: prev.registerDigipin || '',
        };
      });
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [
    formData.sameAsCorrespondenceAddress,
    formData.registerLine1,
    formData.registerLine2,
    formData.registerLine3,
    formData.registerCountry,
    formData.registerState,
    formData.registerDistrict,
    formData.registerCity,
    formData.registerPincode,
    formData.registerPincodeOther,
    formData.registerDigipin,
  ]);

  // Sync correspondence field errors with register field errors when "Same as Registered Address" checkbox is checked
  // Field mapping: register field -> correspondence field
  const fieldMappings = useMemo(
    () => [
      {
        register: 'registerPincodeOther',
        correspondence: 'correspondencePincodeOther',
      },
      { register: 'registerPincode', correspondence: 'correspondencePincode' },
      { register: 'registerState', correspondence: 'correspondenceState' },
      {
        register: 'registerDistrict',
        correspondence: 'correspondenceDistrict',
      },
      { register: 'registerCity', correspondence: 'correspondenceCity' },
      { register: 'registerLine1', correspondence: 'correspondenceLine1' },
      { register: 'registerLine2', correspondence: 'correspondenceLine2' },
      { register: 'registerLine3', correspondence: 'correspondenceLine3' },
      { register: 'registerCountry', correspondence: 'correspondenceCountry' },
      { register: 'registerDigipin', correspondence: 'correspondenceDigipin' },
    ],
    []
  );

  // Get register field errors to track changes
  const registerFieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    fieldMappings.forEach(({ register }) => {
      if (validationErrors[register]) {
        errors[register] = validationErrors[register];
      }
    });
    return JSON.stringify(errors);
  }, [validationErrors, fieldMappings]);

  useEffect(() => {
    const isSameAsRegistered =
      formData.sameAsCorrespondenceAddress === true ||
      formData.sameAsCorrespondenceAddress === 'true';

    if (isSameAsRegistered) {
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        let hasChanges = false;

        // Sync errors: if register field has error, show same on correspondence; if not, clear correspondence error
        fieldMappings.forEach(({ register, correspondence }) => {
          if (prevErrors[register]) {
            // Copy register error to correspondence field
            if (newErrors[correspondence] !== prevErrors[register]) {
              newErrors[correspondence] = prevErrors[register];
              hasChanges = true;
            }
          } else {
            // Clear correspondence error if register has no error
            if (newErrors[correspondence]) {
              delete newErrors[correspondence];
              hasChanges = true;
            }
          }
        });

        // Only return new object if there are actual changes to prevent infinite loop
        return hasChanges ? newErrors : prevErrors;
      });
    }
  }, [
    formData.sameAsCorrespondenceAddress,
    registerFieldErrors,
    fieldMappings,
  ]);

  const handleSave = async () => {
    let yupValidationPassed = true;

    // Clear any previous general error
    setGeneralError('');

    // Dynamic validation for required fields that may be rendered as text fields (when country is not India)
    const dynamicErrors: Record<string, string> = {};
    const isSameAsRegistered =
      formData.sameAsCorrespondenceAddress === true ||
      formData.sameAsCorrespondenceAddress === 'true';

    // Get all fields from groupedFields
    const allFields: FormField[] = [];
    Object.values(groupedFields).forEach((group) => {
      if (group.fields && Array.isArray(group.fields)) {
        allFields.push(...group.fields);
      }
    });

    // Check fields that are address-dependent (State, District, City, Pincode)
    // These fields become text fields when country is not India and need manual validation
    const addressDependentSuffixes = ['State', 'District', 'City', 'Pincode'];

    allFields.forEach((field) => {
      const isAddressDependentField = addressDependentSuffixes.some(
        (suffix) =>
          field.fieldName.endsWith(suffix) && !field.fieldName.includes('Other')
      );

      if (isAddressDependentField) {
        // Determine the prefix (register, correspondence, etc.)
        const prefix = field.fieldName.startsWith('register')
          ? 'register'
          : field.fieldName.startsWith('correspondence')
            ? 'correspondence'
            : '';

        if (prefix) {
          // Skip correspondence fields if "Same as registered" is checked
          if (prefix === 'correspondence' && isSameAsRegistered) {
            return;
          }

          // Get evaluated validation rules for this field
          const evaluatedRules = evaluateConditionalLogic(field);
          const isRequired =
            evaluatedRules?.required === true ||
            String(evaluatedRules?.required) === 'true';

          // Validate if field is required (based on conditional logic from backend)
          if (isRequired) {
            const fieldValue = formData[field.fieldName];
            if (!fieldValue || String(fieldValue).trim() === '') {
              // Use requiredMessage from backend if available, otherwise fallback
              dynamicErrors[field.fieldName] =
                evaluatedRules?.requiredMessage ||
                `${field.fieldLabel} is required`;
            }
          }
        }
      }
    });

    // If dynamic validation fails, show errors and don't proceed
    if (Object.keys(dynamicErrors).length > 0) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        ...dynamicErrors,
      }));
      return;
    }

    // Validate "Others" pincode - check if entered pincode exists in system configuration
    // As per SRS: "Others" should not be allowed if State, District & Pincode combination exists
    // Dynamically find all PincodeOther fields from the form fields
    const pincodeOtherFields = allFields
      .filter((field) =>
        field.fieldName?.toLowerCase().includes('pincodeother')
      )
      .map((field) => field.fieldName);
    const othersPincodeErrors: Record<string, string> = {};

    for (const pincodeOtherField of pincodeOtherFields) {
      const mainPincodeField = pincodeOtherField.replace(/Other$/i, '');
      const mainPincodeValue = String(
        formData[mainPincodeField] || ''
      ).toLowerCase();

      // Only validate if "Other" is selected in the main pincode dropdown
      if (mainPincodeValue === 'other' || mainPincodeValue === 'others') {
        const enteredPincode = String(formData[pincodeOtherField] || '');

        // Skip correspondence field validation if "Same as registered" is checked
        if (
          pincodeOtherField.toLowerCase().includes('correspondence') &&
          isSameAsRegistered
        ) {
          continue;
        }

        if (enteredPincode) {
          const othersPincodeValidation = validateOthersPincode(
            pincodeOtherField,
            enteredPincode
          );
          if (!othersPincodeValidation.isValid) {
            othersPincodeErrors[pincodeOtherField] =
              othersPincodeValidation.errorMessage;
          }
        }
      }
    }

    // If "Others" pincode validation fails, show errors and don't proceed
    if (Object.keys(othersPincodeErrors).length > 0) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        ...othersPincodeErrors,
      }));
      return;
    }

    try {
      if (validationSchema) {
        await validationSchema.validate(formData, { abortEarly: false });
        setValidationErrors({});

        // Get userId from auth state
        const userId = userDetails?.userId || userDetails?.id;

        if (!userId) {
          alert('Missing user ID. Please try logging in again.');
          return;
        }

        // Create the formValues object with all the data
        const formValues: Record<
          string,
          string | File | number | boolean | object | null
        > = { ...formData };

        const result = await dispatch(
          submitUpdatedAddressDetails({
            formValues,
            userId,
          })
        ).unwrap();

        onSaveAndNext();
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            const field = userProfileFormFields.find(
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

              if (checkIfFileExists(fieldNameToCheck)) {
                return;
              }
            }

            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
        yupValidationPassed = Object.keys(errors).length === 0;
      } else {
        yupValidationPassed = false;

        // Handle API field validation errors (like UpdateEntityProfileStep)
        if (error && typeof error === 'object') {
          let apiFieldErrors: Record<string, string> = {};

          // Handle "fieldErrors" object format
          if ('fieldErrors' in error) {
            apiFieldErrors = (error as any).fieldErrors || {};
          }
          // Handle "errors" array format (as seen in user response)
          else if ('errors' in error && Array.isArray((error as any).errors)) {
            (error as any).errors.forEach((err: any) => {
              if (err.field && err.message) {
                apiFieldErrors[err.field] = err.message;
              }
            });
          }

          const mappedFieldErrors: Record<string, string> = {};

          // Map API field errors to actual form field names
          Object.entries(apiFieldErrors).forEach(
            ([fieldName, errorMessage]) => {
              // Removed suppression for address lines to show backend errors

              // Flatten groupedFields to find the field definition
              const allFields: FormField[] = [];
              Object.values(groupedFields).forEach((group) => {
                if (group.fields && Array.isArray(group.fields)) {
                  allFields.push(...group.fields);
                }
              });

              // Check if this field has a corresponding file field in the form configuration
              const field = allFields.find((f) => f.fieldName === fieldName);

              if (
                field &&
                (field.fieldType === 'file' ||
                  field.fieldType === 'textfield_with_image')
              ) {
                // For file fields, map to the file field name
                if (field.fieldType === 'textfield_with_image') {
                  const fileFieldName =
                    field.fieldFileName || `${field.fieldName}_file`;
                  mappedFieldErrors[fileFieldName] = errorMessage as string;
                } else {
                  // For regular file fields, use the field name as-is
                  mappedFieldErrors[fieldName] = errorMessage as string;
                }
              } else {
                // For non-file fields, use the field name as-is
                mappedFieldErrors[fieldName] = errorMessage as string;
              }
            }
          );

          // If we found field errors, set them
          if (Object.keys(mappedFieldErrors).length > 0) {
            setValidationErrors(mappedFieldErrors);
          }
          // If no field errors but we have a general message, show it
          else if ('message' in error) {
            const errorMessage = (error as any).message || 'Submission failed';
            setGeneralError(errorMessage);
          }
        }
      }
    }
  };

  const handleTextChange = (fieldName: string, value: string) => {
    // Auto-uppercase for Digipin fields
    if (fieldName.toLowerCase().includes('digipin')) {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleFileUpload = (
    fieldName: string | undefined,
    file: File | null
  ) => {
    if (fieldName !== undefined) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleDropdownChange = (fieldName: string, value: string | number) => {
    setFormData((prev) => {
      const updates: FormData = {
        ...prev,
        [fieldName]: value,
      };

      // Check if the selected value is a "Same as..." option
      const valueStr = String(value).toLowerCase();

      if (
        valueStr.includes('same as register') ||
        valueStr.includes('same as registered')
      ) {
        // Copy register address fields
        // Determine which address group this field belongs to
        const fieldNameLower = fieldName.toLowerCase();
        let targetPrefix = '';

        if (fieldNameLower.includes('correspondence')) {
          targetPrefix = 'correspondence';
        } else if (fieldNameLower.includes('permanent')) {
          targetPrefix = 'permanent';
        } else if (fieldNameLower.includes('current')) {
          targetPrefix = 'current';
        }

        if (targetPrefix) {
          updates[`${targetPrefix}Line1`] = prev.registerLine1 || '';
          updates[`${targetPrefix}Line2`] = prev.registerLine2 || '';
          updates[`${targetPrefix}Line3`] = prev.registerLine3 || '';
          updates[`${targetPrefix}Country`] = prev.registerCountry || '';
          updates[`${targetPrefix}State`] = prev.registerState || '';
          updates[`${targetPrefix}District`] = prev.registerDistrict || '';
          updates[`${targetPrefix}City`] = prev.registerCity || '';
          updates[`${targetPrefix}Pincode`] = prev.registerPincode || '';
          updates[`${targetPrefix}PincodeOther`] =
            prev.registerPincodeOther || '';
          updates[`${targetPrefix}Digipin`] = prev.registerDigipin || '';

          // Fetch cascading dropdown data
          if (prev.registerCountry) {
            const stateField = findFieldByName(`${targetPrefix}State`);
            if (stateField?.fieldAttributes?.type === 'external_api') {
              dispatch(
                fetchDropdownData({
                  fieldName: `${targetPrefix}State`,
                  fieldAttributes: stateField.fieldAttributes,
                  formData: {
                    ...prev,
                    [`${targetPrefix}Country`]: prev.registerCountry,
                  },
                })
              );
            }
          }
          if (prev.registerState) {
            const districtField = findFieldByName(`${targetPrefix}District`);
            if (districtField?.fieldAttributes?.type === 'external_api') {
              dispatch(
                fetchDropdownData({
                  fieldName: `${targetPrefix}District`,
                  fieldAttributes: districtField.fieldAttributes,
                  formData: {
                    ...prev,
                    [`${targetPrefix}State`]: prev.registerState,
                  },
                })
              );
            }
          }
          if (prev.registerDistrict) {
            const pincodeField = findFieldByName(`${targetPrefix}Pincode`);
            if (pincodeField?.fieldAttributes?.type === 'external_api') {
              dispatch(
                fetchDropdownData({
                  fieldName: `${targetPrefix}Pincode`,
                  fieldAttributes: pincodeField.fieldAttributes,
                  formData: {
                    ...prev,
                    [`${targetPrefix}District`]: prev.registerDistrict,
                  },
                })
              );
            }
          }
        }
      } else if (valueStr.includes('same as correspondence')) {
        // Copy correspondence address fields
        const fieldNameLower = fieldName.toLowerCase();
        let targetPrefix = '';

        if (fieldNameLower.includes('register')) {
          targetPrefix = 'register';
        } else if (fieldNameLower.includes('permanent')) {
          targetPrefix = 'permanent';
        } else if (fieldNameLower.includes('current')) {
          targetPrefix = 'current';
        }

        if (targetPrefix) {
          updates[`${targetPrefix}Line1`] = prev.correspondenceLine1 || '';
          updates[`${targetPrefix}Line2`] = prev.correspondenceLine2 || '';
          updates[`${targetPrefix}Line3`] = prev.correspondenceLine3 || '';
          updates[`${targetPrefix}Country`] = prev.correspondenceCountry || '';
          updates[`${targetPrefix}State`] = prev.correspondenceState || '';
          updates[`${targetPrefix}District`] =
            prev.correspondenceDistrict || '';
          updates[`${targetPrefix}City`] = prev.correspondenceCity || '';
          updates[`${targetPrefix}Pincode`] = prev.correspondencePincode || '';
          updates[`${targetPrefix}PincodeOther`] =
            prev.correspondencePincodeOther || '';
          updates[`${targetPrefix}Digipin`] = prev.correspondenceDigipin || '';

          // Fetch cascading dropdown data
          if (prev.correspondenceCountry) {
            const stateField = findFieldByName(`${targetPrefix}State`);
            if (stateField?.fieldAttributes?.type === 'external_api') {
              dispatch(
                fetchDropdownData({
                  fieldName: `${targetPrefix}State`,
                  fieldAttributes: stateField.fieldAttributes,
                  formData: {
                    ...prev,
                    [`${targetPrefix}Country`]: prev.correspondenceCountry,
                  },
                })
              );
            }
          }
          if (prev.correspondenceState) {
            const districtField = findFieldByName(`${targetPrefix}District`);
            if (districtField?.fieldAttributes?.type === 'external_api') {
              dispatch(
                fetchDropdownData({
                  fieldName: `${targetPrefix}District`,
                  fieldAttributes: districtField.fieldAttributes,
                  formData: {
                    ...prev,
                    [`${targetPrefix}State`]: prev.correspondenceState,
                  },
                })
              );
            }
          }
          if (prev.correspondenceDistrict) {
            const pincodeField = findFieldByName(`${targetPrefix}Pincode`);
            if (pincodeField?.fieldAttributes?.type === 'external_api') {
              dispatch(
                fetchDropdownData({
                  fieldName: `${targetPrefix}Pincode`,
                  fieldAttributes: pincodeField.fieldAttributes,
                  formData: {
                    ...prev,
                    [`${targetPrefix}District`]: prev.correspondenceDistrict,
                  },
                })
              );
            }
          }
        }
      }

      // Handle cascading dropdown clearing (only clear values, dispatch happens outside)
      if (fieldName === 'registerCountry') {
        updates.registerState = '';
        updates.registerDistrict = '';
        updates.registerCity = '';
        updates.registerPincode = '';
        updates.registerPincodeOther = '';
        updates.registerDigipin = '';
      } else if (fieldName === 'registerState') {
        updates.registerDistrict = '';
        updates.registerCity = '';
        updates.registerPincode = '';
        updates.registerPincodeOther = '';
        updates.registerDigipin = '';
      } else if (fieldName === 'registerDistrict') {
        updates.registerCity = '';
        updates.registerPincode = '';
        updates.registerPincodeOther = '';
        updates.registerDigipin = '';
      } else if (fieldName === 'correspondenceCountry') {
        updates.correspondenceState = '';
        updates.correspondenceDistrict = '';
        updates.correspondenceCity = '';
        updates.correspondencePincode = '';
        updates.correspondencePincodeOther = '';
        updates.correspondenceDigipin = '';
      } else if (fieldName === 'correspondenceState') {
        updates.correspondenceDistrict = '';
        updates.correspondenceCity = '';
        updates.correspondencePincode = '';
        updates.correspondencePincodeOther = '';
        updates.correspondenceDigipin = '';
      } else if (fieldName === 'correspondenceDistrict') {
        updates.correspondenceCity = '';
        updates.correspondencePincode = '';
        updates.correspondencePincodeOther = '';
        updates.correspondenceDigipin = '';
      }

      return updates;
    });

    // Clear dropdown options and validation errors AFTER setFormData (outside the callback)
    if (fieldName === 'registerCountry') {
      dispatch(clearDropdownData('registerState'));
      dispatch(clearDropdownData('registerDistrict'));
      dispatch(clearDropdownData('registerCity'));
      dispatch(clearDropdownData('registerPincode'));
      // Clear validation errors for child fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['registerState'];
        delete newErrors['registerDistrict'];
        delete newErrors['registerCity'];
        delete newErrors['registerPincode'];
        return newErrors;
      });
    } else if (fieldName === 'registerState') {
      dispatch(clearDropdownData('registerDistrict'));
      dispatch(clearDropdownData('registerCity'));
      dispatch(clearDropdownData('registerPincode'));
      // Clear validation errors for child fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['registerDistrict'];
        delete newErrors['registerCity'];
        delete newErrors['registerPincode'];
        return newErrors;
      });
    } else if (fieldName === 'registerDistrict') {
      dispatch(clearDropdownData('registerCity'));
      dispatch(clearDropdownData('registerPincode'));
      // Clear validation errors for child fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['registerCity'];
        delete newErrors['registerPincode'];
        return newErrors;
      });
    } else if (fieldName === 'correspondenceCountry') {
      dispatch(clearDropdownData('correspondenceState'));
      dispatch(clearDropdownData('correspondenceDistrict'));
      dispatch(clearDropdownData('correspondenceCity'));
      dispatch(clearDropdownData('correspondencePincode'));
      // Clear validation errors for child fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['correspondenceState'];
        delete newErrors['correspondenceDistrict'];
        delete newErrors['correspondenceCity'];
        delete newErrors['correspondencePincode'];
        return newErrors;
      });
    } else if (fieldName === 'correspondenceState') {
      dispatch(clearDropdownData('correspondenceDistrict'));
      dispatch(clearDropdownData('correspondenceCity'));
      dispatch(clearDropdownData('correspondencePincode'));
      // Clear validation errors for child fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['correspondenceDistrict'];
        delete newErrors['correspondenceCity'];
        delete newErrors['correspondencePincode'];
        return newErrors;
      });
    } else if (fieldName === 'correspondenceDistrict') {
      dispatch(clearDropdownData('correspondenceCity'));
      dispatch(clearDropdownData('correspondencePincode'));
      // Clear validation errors for child fields
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['correspondenceCity'];
        delete newErrors['correspondencePincode'];
        return newErrors;
      });
    }

    // Handle PincodeOther field when Pincode dropdown changes
    if (
      fieldName === 'registerPincode' ||
      fieldName === 'correspondencePincode'
    ) {
      const valueStr = String(value).toLowerCase();
      const isOtherSelected = valueStr === 'other' || valueStr === 'others';
      const pincodeOtherField =
        fieldName === 'registerPincode'
          ? 'registerPincodeOther'
          : 'correspondencePincodeOther';

      if (!isOtherSelected) {
        // Clear the corresponding PincodeOther field when non-Other is selected
        // This ensures the old "Other" value doesn't persist when user re-selects "Other"
        setFormData((prev) => ({
          ...prev,
          [pincodeOtherField]: '',
        }));
      }

      // Always clear validation error for PincodeOther field when Pincode dropdown changes
      // This prevents showing errors immediately when "Other" is newly selected
      // The error should only show after user starts typing in the PincodeOther field
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[pincodeOtherField];
        return newErrors;
      });
    }

    // Clear validation error for this field when value is filled
    if (value && String(value).trim() !== '') {
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (newErrors[fieldName]) {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }
  };

  const handleDateChange = (fieldName: string, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCheckboxChange = (fieldName: string, checked: boolean) => {
    // Single setFormData call to avoid double renders
    setFormData((prev) => {
      const updates: FormData = {
        ...prev,
        [fieldName]: checked,
      };

      // Handle "Same as Correspondence Address" checkbox
      // Field name pattern: contains 'sameAs' and 'correspondence' (case-insensitive)
      const isSameAsCorrespondenceCheckbox =
        fieldName.toLowerCase().includes('sameas') &&
        fieldName.toLowerCase().includes('correspondence');

      if (isSameAsCorrespondenceCheckbox) {
        if (checked) {
          // When checked: Copy register address fields to correspondence address fields
          // Dynamically find all register address fields and copy to correspondence
          Object.keys(prev).forEach((key) => {
            if (key.toLowerCase().startsWith('register')) {
              // Get the suffix (e.g., "Line1", "Country", "State", etc.)
              const suffix = key.replace(/^register/i, '');
              const correspondenceKey = `correspondence${suffix}`;
              updates[correspondenceKey] = prev[key] || '';
            }
          });

          // Explicitly copy PincodeOther to ensure it's handled correctly
          // This handles the case where user selected "Other" in pincode dropdown
          updates.correspondencePincode = prev.registerPincode || '';
          updates.correspondencePincodeOther = prev.registerPincodeOther || '';
        } else {
          // When unchecked: Clear all correspondence address fields
          // Dynamically find all correspondence fields and clear them
          Object.keys(prev).forEach((key) => {
            if (
              key.toLowerCase().startsWith('correspondence') &&
              !key.toLowerCase().includes('sameas')
            ) {
              updates[key] = '';
            }
          });
        }
      }

      return updates;
    });

    // Fetch dropdown data if needed (after state is set)
    // Only fetch when checkbox is checked
    const isSameAsCorrespondenceCheckbox =
      fieldName.toLowerCase().includes('sameas') &&
      fieldName.toLowerCase().includes('correspondence');

    if (checked && isSameAsCorrespondenceCheckbox) {
      setTimeout(() => {
        if (formData.registerCountry) {
          const stateField = findFieldByName('correspondenceState');
          if (stateField?.fieldAttributes?.type === 'external_api') {
            dispatch(
              fetchDropdownData({
                fieldName: 'correspondenceState',
                fieldAttributes: stateField.fieldAttributes,
                formData: {
                  ...formData,
                  correspondenceCountry: formData.registerCountry,
                },
              })
            );
          }
        }

        if (formData.registerState) {
          const districtField = findFieldByName('correspondenceDistrict');
          if (districtField?.fieldAttributes?.type === 'external_api') {
            dispatch(
              fetchDropdownData({
                fieldName: 'correspondenceDistrict',
                fieldAttributes: districtField.fieldAttributes,
                formData: {
                  ...formData,
                  correspondenceState: formData.registerState,
                },
              })
            );
          }
        }

        if (formData.registerDistrict) {
          // Fetch City options based on District
          const cityField = findFieldByName('correspondenceCity');
          if (cityField?.fieldAttributes?.type === 'external_api') {
            dispatch(
              fetchDropdownData({
                fieldName: 'correspondenceCity',
                fieldAttributes: cityField.fieldAttributes,
                formData: {
                  ...formData,
                  correspondenceDistrict: formData.registerDistrict,
                },
              })
            );
          }

          // Fetch Pincode options based on District
          const pincodeField = findFieldByName('correspondencePincode');
          if (pincodeField?.fieldAttributes?.type === 'external_api') {
            dispatch(
              fetchDropdownData({
                fieldName: 'correspondencePincode',
                fieldAttributes: pincodeField.fieldAttributes,
                formData: {
                  ...formData,
                  correspondenceDistrict: formData.registerDistrict,
                },
              })
            );
          }
        }
      }, 0);
    }
  };

  const handleGenericChange = (
    fieldName: string,
    value: string | ChangeEvent<HTMLInputElement>
  ) => {
    let newValue = typeof value === 'string' ? value : value.target.value;

    // Enforce numeric only for Pincode fields ONLY when country is India
    // For non-India countries, allow alphanumeric (as per backend's else block validation)
    if (fieldName.toLowerCase().includes('pincode')) {
      // Determine the country field based on the pincode field prefix
      const prefix = fieldName.toLowerCase().startsWith('register')
        ? 'register'
        : fieldName.toLowerCase().startsWith('correspondence')
          ? 'correspondence'
          : '';

      const countryValue = prefix ? formData[`${prefix}Country`] : '';
      const isIndia =
        countryValue &&
        ['india', 'in', 'ind'].includes(
          String(countryValue).toLowerCase().trim()
        );

      if (isIndia) {
        // India: numeric only, 6 digits max
        newValue = newValue.replace(/\D/g, '');
        if (newValue.length > 6) {
          newValue = newValue.slice(0, 6);
        }
      } else if (countryValue) {
        // Non-India: alphanumeric only, 50 characters max (as per backend)
        newValue = newValue.replace(/[^A-Za-z0-9]/g, '');
        if (newValue.length > 50) {
          newValue = newValue.slice(0, 50);
        }
      }
    }

    if (fieldName.toLowerCase().includes('digipin')) {
      newValue = newValue.toUpperCase(); // convert to uppercase
    }

    handleTextChange(fieldName, newValue);

    // Clear validation error for this field when value is filled
    if (newValue && String(newValue).trim() !== '') {
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (newErrors[fieldName]) {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    }

    // Validate immediately while typing
    validateSingleField(fieldName, newValue);

    // When register address field is corrected, also clear corresponding address field error if "Same as" is checked
    if (
      formData.sameAsCorrespondenceAddress &&
      fieldName.toLowerCase().includes('register')
    ) {
      const correspondenceFieldName = fieldName.replace(
        /^register/i,
        'correspondence'
      );
      // Clear error for the corresponding field
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (newErrors[correspondenceFieldName]) {
          delete newErrors[correspondenceFieldName];
        }
        return newErrors;
      });
    }
  };

  // Validation function to check if "Others" pincode matches an existing configured pincode
  // As per SRS: If the combination of State, District & Pincode entered by RE user matches
  // with combination configured in the system, "Others" option should not be allowed
  const validateOthersPincode = useCallback(
    (
      pincodeOtherFieldName: string,
      enteredPincode: string
    ): { isValid: boolean; errorMessage: string } => {
      if (!enteredPincode || enteredPincode.trim() === '') {
        return { isValid: true, errorMessage: '' };
      }

      // Determine the main pincode field name (e.g., registerPincode or correspondencePincode)
      const mainPincodeFieldName = pincodeOtherFieldName.replace(/Other$/i, '');
      const prefix = pincodeOtherFieldName.toLowerCase().startsWith('register')
        ? 'register'
        : 'correspondence';

      // Get the dropdown options for the main pincode field
      const pincodeOptions = dropdownData[mainPincodeFieldName]?.options || [];

      // Check if the entered pincode exists in the configured options
      const matchingPincode = pincodeOptions.find(
        (option: { label: string; value: string }) =>
          String(option.value).toLowerCase() === enteredPincode.toLowerCase() ||
          String(option.label).toLowerCase() === enteredPincode.toLowerCase()
      );

      if (matchingPincode) {
        // Pincode exists in configured options - "Others" should not be allowed
        return {
          isValid: false,
          errorMessage: 'Please select entered Pincode from Pincode dropdown.',
        };
      }

      return { isValid: true, errorMessage: '' };
    },
    [dropdownData]
  );

  const validateSingleField = (fieldName: string, value: string) => {
    // Check if "Same as Registered Address" is checked
    const isSameAsRegistered =
      formData.sameAsCorrespondenceAddress === true ||
      formData.sameAsCorrespondenceAddress === 'true';

    // Skip validation for correspondence fields when "Same as registered" is checked
    if (
      isSameAsRegistered &&
      fieldName.toLowerCase().includes('correspondence') &&
      fieldName !== 'sameAsCorrespondenceAddress'
    ) {
      // Clear any existing error for this field
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      });
      return;
    }

    // Flatten groupedFields to get all fields
    const allFields: FormField[] = [];
    Object.values(groupedFields).forEach((group) => {
      if (group.fields && Array.isArray(group.fields)) {
        allFields.push(...group.fields);
      }
    });

    // Validate the field
    const field = allFields.find((f: FormField) => f.fieldName === fieldName);
    if (field) {
      // Get evaluated validation rules for this field
      const evaluatedRules = evaluateConditionalLogic(field);

      let errorMessage = '';

      // Check required
      if (evaluatedRules?.required && !value) {
        errorMessage =
          evaluatedRules.requiredMessage || `${field.fieldLabel} is required`;
      }
      // Check regex pattern first - prioritize regex for more specific error messages
      // (e.g., "PIN code must be exactly 6 digits" instead of "Min length is 6")
      else if (evaluatedRules?.regx && value) {
        try {
          const regex = new RegExp(evaluatedRules.regx);
          if (!regex.test(value)) {
            // Check for both regxMessage and regsMessage (backend typo)
            errorMessage =
              evaluatedRules.regxMessage ||
              evaluatedRules.regsMessage ||
              `${field.fieldLabel} format is invalid`;
          }
        } catch {
          // Invalid regex, skip validation
        }
      }
      // Check minLength (only if no regex or regex passed)
      else if (
        evaluatedRules?.minLength &&
        value.length < parseInt(evaluatedRules.minLength)
      ) {
        errorMessage =
          evaluatedRules.minLengthMessage ||
          `Minimum ${evaluatedRules.minLength} characters required`;
      }
      // Check maxLength
      else if (
        evaluatedRules?.maxLength &&
        value.length > parseInt(evaluatedRules.maxLength)
      ) {
        errorMessage =
          evaluatedRules.maxLengthMessage ||
          `Maximum ${evaluatedRules.maxLength} characters allowed`;
      }

      // Additional validation for PincodeOther fields - check if entered pincode exists in system
      if (
        !errorMessage &&
        fieldName.toLowerCase().includes('pincodeother') &&
        value
      ) {
        const othersPincodeValidation = validateOthersPincode(fieldName, value);
        if (!othersPincodeValidation.isValid) {
          errorMessage = othersPincodeValidation.errorMessage;
        }
      }

      if (errorMessage) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: errorMessage,
        }));
      } else {
        // Clear error if validation passes
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (fieldName: string, value: string) => {
    // Skip blur validation if value is already present and non-empty
    // Only validate on blur when the field is empty (for required field check)
    if (value && String(value).trim() !== '') {
      // For PincodeOther fields, keep the error if it's "already exists" error
      // This persists the error until user changes the value
      if (fieldName.toLowerCase().includes('pincodeother')) {
        // Re-validate to keep the error persistent
        validateSingleField(fieldName, value);
        return;
      }
      // For other fields, clear error if value exists
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (newErrors[fieldName]) {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
      return;
    }
    // Only validate on blur when field is empty
    validateSingleField(fieldName, value);
  };

  const checkIfFileExists = (fieldName: string): boolean => {
    const exists = !!existingDocuments[fieldName];
    return exists;
  };
  const getDocumentData = (fieldName: string): DocumentData | undefined => {
    return existingDocumentData[fieldName];
  };

  const getDocumentId = (fieldName: string): string => {
    return existingDocuments[fieldName] || '';
  };

  // Helper function to check if a correspondence field should be disabled
  // Correspondence fields are disabled when "Same as registered address" checkbox is checked
  // The checkbox itself (sameAsCorrespondenceAddress) should NOT be disabled
  const isCorrespondenceFieldDisabled = (fieldName: string): boolean => {
    if (
      fieldName.toLowerCase().includes('correspondence') &&
      fieldName !== 'sameAsCorrespondenceAddress'
    ) {
      return (
        formData.sameAsCorrespondenceAddress === true ||
        formData.sameAsCorrespondenceAddress === 'true'
      );
    }
    return false;
  };

  const renderField = (field: FormField) => {
    if (field.fieldName.toLowerCase().includes('pincodeother')) {
      // pincode disable start - determine visibility based on main pincode value
      const fieldNameLower = field.fieldName.toLowerCase();
      const mainPincodeFieldName = fieldNameLower.startsWith('register')
        ? 'registerPincode'
        : fieldNameLower.startsWith('correspondence')
          ? 'correspondencePincode'
          : field.fieldName.includes('register')
            ? 'registerPincode'
            : 'correspondencePincode';

      const mainPincodeValue = formData[mainPincodeFieldName];

      // Handle potential object values (API might return {pincode: 'other'})
      let valueStr = '';
      if (mainPincodeValue) {
        if (typeof mainPincodeValue === 'object') {
          valueStr = String(
            (mainPincodeValue as any).pincode ||
              (mainPincodeValue as any).value ||
              ''
          );
        } else {
          valueStr = String(mainPincodeValue);
        }
      }

      const pincodeValueLower = valueStr.toLowerCase();

      // Only show if main pincode field has "other" or "others" value
      if (pincodeValueLower !== 'other' && pincodeValueLower !== 'others') {
        return null; // Don't render this field
      }
    } // pincode disable end
    const value = formData[field.fieldName] || '';

    // Evaluate conditional logic to get the actual validation rules for this field
    const evaluatedValidationRules = evaluateConditionalLogic(field);

    const validationError = validationErrors[field.fieldName];
    const apiFieldError = getFieldError(field.fieldName);

    let fileError = '';
    let apiFileError = '';

    let documentId = '';
    let fileExistsForField = false;

    if (field.fieldType === 'textfield_with_image') {
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      documentId = getDocumentId(fileFieldName);
      fileExistsForField = checkIfFileExists(fileFieldName);

      const fileValidationError = validationErrors[fileFieldName];
      apiFileError = getFieldError(fileFieldName) || '';
      fileError = fileValidationError || apiFileError || '';
    } else if (field.fieldType === 'file') {
      documentId = getDocumentId(field.fieldName);
      fileExistsForField = checkIfFileExists(field.fieldName);
      apiFileError = getFieldError(field.fieldName) || '';
      fileError = validationError || apiFileError || '';
    }
    const rawError = validationError || apiFieldError || fileError;
    const displayError = rawError
      ? typeof rawError === 'string'
        ? rawError
        : JSON.stringify(rawError)
      : undefined;

    switch (field.fieldType) {
      case 'textfield': {
        // Determine input type based on field name
        const isPincodeOtherField =
          field.fieldName.includes('PincodeOther') ||
          field.fieldName.includes('pincodeOther');
        const inputType = field.fieldName.includes('website')
          ? 'url'
          : isPincodeOtherField
            ? 'tel'
            : 'text';

        // Generate a unique key for pincodeOther fields that includes the dependent field value
        // This ensures the component re-renders with the correct required state
        const fieldKey = isPincodeOtherField
          ? `${field.id}-${evaluatedValidationRules?.required || false}`
          : field.id;

        return (
          <LabeledTextFieldUpdate
            key={fieldKey}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleGenericChange(field.fieldName, newValue)
            }
            placeholder={
              isPincodeOtherField
                ? 'Enter 6-digit Pincode'
                : field.fieldPlaceholder || ''
            }
            required={evaluatedValidationRules?.required || false}
            requiredMessage={evaluatedValidationRules?.requiredMessage}
            minLength={
              evaluatedValidationRules?.minLength
                ? parseInt(evaluatedValidationRules.minLength)
                : undefined
            }
            minLengthMessage={evaluatedValidationRules?.minLengthMessage}
            maxLength={
              evaluatedValidationRules?.maxLength
                ? parseInt(evaluatedValidationRules.maxLength)
                : undefined
            }
            maxLengthMessage={evaluatedValidationRules?.maxLengthMessage}
            regx={evaluatedValidationRules?.regx}
            regxMessage={
              evaluatedValidationRules?.regxMessage ||
              evaluatedValidationRules?.regsMessage
            }
            disabled={isCorrespondenceFieldDisabled(field.fieldName)}
            error={!!displayError}
            helperText={displayError}
            type={inputType}
            onBlur={() =>
              handleBlur(
                field.fieldName,
                String(formData[field.fieldName] || '')
              )
            }
          />
        );
      }

      case 'dropdown': {
        // Check if we should render as text field based on Country selection
        const isAddressDependentField = [
          'State',
          'District',
          'City',
          'Pincode',
        ].some(
          (suffix) =>
            field.fieldName.endsWith(suffix) &&
            !field.fieldName.includes('Other')
        );

        if (isAddressDependentField) {
          const prefix = field.fieldName.startsWith('register')
            ? 'register'
            : field.fieldName.startsWith('correspondence')
              ? 'correspondence'
              : field.fieldName.startsWith('permanent')
                ? 'permanent'
                : field.fieldName.startsWith('current')
                  ? 'current'
                  : '';

          if (prefix) {
            const countryValue = formData[`${prefix}Country`];
            // If country is selected and is NOT India, render as text field
            // Check for "India", "IN", "IND" to be safe
            const isIndia =
              countryValue &&
              ['india', 'in', 'ind'].includes(
                String(countryValue).toLowerCase()
              );

            if (countryValue && !isIndia) {
              // Generate unique key that includes validation rules to force re-render
              const textFieldKey = `${field.id}-text-${evaluatedValidationRules?.required || false}-${evaluatedValidationRules?.requiredMessage || 'default'}`;

              return (
                <LabeledTextFieldUpdate
                  key={field.id}
                  label={field.fieldLabel}
                  value={value as string}
                  onChange={(newValue) =>
                    handleGenericChange(field.fieldName, newValue)
                  }
                  placeholder={
                    field.fieldPlaceholder
                      ? field.fieldPlaceholder.replace(/^Select\s+/i, 'Enter ')
                      : `Enter ${field.fieldLabel}`
                  }
                  required={evaluatedValidationRules?.required || false}
                  requiredMessage={evaluatedValidationRules?.requiredMessage}
                  minLength={
                    evaluatedValidationRules?.minLength
                      ? parseInt(evaluatedValidationRules.minLength)
                      : undefined
                  }
                  minLengthMessage={evaluatedValidationRules?.minLengthMessage}
                  maxLength={
                    evaluatedValidationRules?.maxLength
                      ? parseInt(evaluatedValidationRules.maxLength)
                      : undefined
                  }
                  maxLengthMessage={evaluatedValidationRules?.maxLengthMessage}
                  regx={evaluatedValidationRules?.regx}
                  regxMessage={
                    evaluatedValidationRules?.regxMessage ||
                    evaluatedValidationRules?.regsMessage
                  }
                  disabled={isCorrespondenceFieldDisabled(field.fieldName)}
                  error={!!displayError}
                  helperText={displayError}
                  type="text"
                />
              );
            }
          }
        }

        let options: { label: string; value: string }[] = [];
        let staticOptions: { label: string; value: string }[] = [];

        // Handle static fieldOptions first - support both {value, label} and {code, name} formats
        if (field.fieldOptions && Array.isArray(field.fieldOptions)) {
          staticOptions = field.fieldOptions.map((option: any) => {
            if (typeof option === 'object') {
              return {
                label: option.label || option.name || String(option),
                value:
                  option.value ||
                  option.code ||
                  option.isocode ||
                  String(option),
              };
            } else {
              return {
                label: String(option),
                value: String(option),
              };
            }
          });
        }

        // Check if this field has external API data
        if (field.fieldAttributes?.type === 'external_api') {
          const dynamicOptions = dropdownData[field.fieldName]?.options || [];
          const isLoading = dropdownData[field.fieldName]?.loading || false;

          // Only show loading if the field has a value or if we're actually loading data
          // Don't show loading for cleared/empty fields
          // if (isLoading && value) {
          //   return <div>Loading {field.fieldLabel}...</div>;
          // }

          // Combine dynamic options with static options (e.g., " Other" for pincode)
          options = [...dynamicOptions, ...staticOptions];
        } else {
          // Use only static options
          options = staticOptions;
        }

        // ✅ Always include "Other" for pincode dropdowns
        if (field.fieldName.toLowerCase().includes('pincode')) {
          const hasSelectOther = options.some(
            (opt) =>
              String(opt.value).toLowerCase() === 'other' ||
              String(opt.value).toLowerCase() === 'others'
          );
          if (!hasSelectOther) {
            options.push({ label: 'Other', value: 'other' });
          }
        }

        // Generate a unique key for dropdowns that includes required state and requiredMessage
        // This forces re-render when validation rules change based on country selection
        const dropdownKey = field.fieldName.toLowerCase().includes('pincode')
          ? `${field.id}-${evaluatedValidationRules?.required || false}`
          : `${field.id}`;

        return (
          <LabeledDropDownUpdate
            key={dropdownKey}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleDropdownChange(field.fieldName, newValue)
            }
            options={options}
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={evaluatedValidationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            fieldName={field.fieldName}
            disabled={isCorrespondenceFieldDisabled(field.fieldName)}
          />
        );
      }
      case 'date':
        return (
          <LabeledDate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => handleDateChange(field.fieldName, newValue)}
            required={evaluatedValidationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            disabled={isCorrespondenceFieldDisabled(field.fieldName)}
          />
        );
      case 'checkbox':
        return (
          <LabeledCheckbox
            key={field.id}
            label={field.fieldLabel}
            checked={!!formData[field.fieldName]}
            onChange={(checked) =>
              handleCheckboxChange(field.fieldName, checked)
            }
            required={evaluatedValidationRules?.required}
            disabled={isCorrespondenceFieldDisabled(field.fieldName)}
          />
        );
      case 'textfield_with_image': {
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        const existingDocument = getDocumentData(fileFieldName);
        const fileValidationRules =
          evaluatedValidationRules?.validationFile || evaluatedValidationRules;
        return (
          <LabeledTextFieldWithUploadUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleGenericChange(field.fieldName, newValue)
            }
            onUpload={(file) => handleFileUpload(field.fieldFileName, file)}
            placeholder={field.fieldPlaceholder}
            required={evaluatedValidationRules?.required || false}
            minLength={
              evaluatedValidationRules?.minLength
                ? parseInt(evaluatedValidationRules.minLength)
                : undefined
            }
            maxLength={
              evaluatedValidationRules?.maxLength
                ? parseInt(evaluatedValidationRules.maxLength)
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
            onValidationError={() => {}}
            disabled={
              field.fieldName === 'cin' ||
              field.fieldName === 'llpin' ||
              field.fieldFileName === 'cinFile' ||
              isCorrespondenceFieldDisabled(field.fieldName)
            }
            existingDocument={existingDocument}
            showExistingDocument={!!existingDocument}
            trackStatusShow={field.fieldFileName === 'cinFile'}
          />
        );
      }

      case 'textfield_with_verify':
        return (
          <LabeledTextFieldWithVerify
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleGenericChange(field.fieldName, newValue)
            }
            placeholder={field.fieldPlaceholder}
            required={field.validationRules?.required || false}
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
            externalVerifyUrl={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
            }
            onOpenSendOtp={async () => {}}
            onSubmitOtp={async () => {
              return true;
            }}
            onOtpVerified={() => {}}
            onVerify={async () => {
              return true;
            }}
          />
        );

      case 'file': {
        const fileFieldName = field.fieldName || `${field.fieldName}_file`;
        const existingDocument = getDocumentData(fileFieldName);
        return (
          <div>
            <UploadButton
              key={`${field.id}`}
              label={field.fieldLabel}
              onUpload={(file) => handleFileUpload(field.fieldName, file)}
              required={field.validationRules?.required || false}
              accept={
                (
                  field.validationRules?.validationFile?.imageFormat ||
                  field.validationRules?.imageFormat
                )
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              existingDocument={existingDocument}
              showExistingDocument={!!existingDocument}
            />
            {value && typeof value !== 'string' && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                Selected: {(value as File).name}
              </div>
            )}
          </div>
        );
      }

      default:
        console.warn(
          `⚠️ Unhandled field type: ${field.fieldType} for field: ${field.fieldName}`
        );
        return null;
    }
  };

  const renderFieldGroup = (fields: FormField[]) => {
    const sortedFields = [...fields].sort(
      (a, b) => a.fieldOrder - b.fieldOrder
    );

    return (
      <ThreeColumnGrid>
        {sortedFields.map((field) => {
          // Check if field should be visible based on conditional logic
          // if (!isFieldVisible(field)) {
          //   return null;
          // }
          if (field.fieldName.toLowerCase().includes('pincodeother')) {
            // Determine the main pincode field based on prefix
            const fieldNameLower = field.fieldName.toLowerCase();
            const mainPincodeFieldName = fieldNameLower.startsWith('register')
              ? 'registerPincode'
              : fieldNameLower.startsWith('correspondence')
                ? 'correspondencePincode'
                : field.fieldName.includes('register')
                  ? 'registerPincode'
                  : 'correspondencePincode';

            const mainPincodeValue = formData[mainPincodeFieldName];

            // Handle potential object values (API might return {pincode: 'other'})
            let valueStr = '';
            if (mainPincodeValue) {
              if (typeof mainPincodeValue === 'object') {
                valueStr = String(
                  (mainPincodeValue as any).pincode ||
                    (mainPincodeValue as any).value ||
                    ''
                );
              } else {
                valueStr = String(mainPincodeValue);
              }
            }

            const pincodeValueLower = valueStr.toLowerCase();

            // Hide the field entirely (and let the grid re-flow) unless "other" or "others" is chosen
            if (
              pincodeValueLower !== 'other' &&
              pincodeValueLower !== 'others'
            ) {
              return null; // No placeholder – allows next fields (e.g., Digipin) to shift left
            }
          }

          if (field.fieldType === 'checkbox') {
            return (
              <FieldContainer
                key={field.id}
                style={{
                  gridColumn: '1 / -1',
                  width: '100%',
                  minHeight: '5px',
                }}
              >
                {renderField(field)}
              </FieldContainer>
            );
          }
          return (
            <FieldContainer key={field.id}>{renderField(field)}</FieldContainer>
          );
        })}
      </ThreeColumnGrid>
    );
  };

  const renderGroupedFields = () => {
    if (Object.entries(groupedFields).length == 0) {
      return null;
    }
    return Object.entries(groupedFields).map(([groupName, fields]) => {
      // Transform "Register Address" to "Registered Address"
      const displayLabel =
        fields?.label === 'Register Address'
          ? 'Registered Address'
          : fields?.label;
      return (
        <UpdateFormAccordion
          key={groupName}
          title={displayLabel}
          groupKey={groupName}
          defaultExpanded={true}
        >
          {renderFieldGroup(fields.fields)}
        </UpdateFormAccordion>
      );
    });
  };

  return (
    <Box>
      {generalError && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            fontFamily: 'Gilroy',
          }}
          onClose={() => setGeneralError('')}
        >
          {generalError}
        </Alert>
      )}
      {Object.entries(groupedFields).length > 0 ? (
        <Box>{renderGroupedFields()}</Box>
      ) : (
        <ThreeColumnGrid>
          {userProfileFormFields.map((field: FormField) => (
            <FieldContainer key={field.id}>{renderField(field)}</FieldContainer>
          ))}
        </ThreeColumnGrid>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <FormActionButtonsUpdate
          onSave={handleSave}
          showSave={configuration?.submissionSettings?.submitButton}
          saveLabel={configuration?.submissionSettings?.submitButtonText}
          loading={false}
          saveDisabled={false}
          validateDisabled={true}
          clearDisabled={false}
          sx={{ margin: 0, padding: 0 }}
          submissionSettings={configuration?.submissionSettings}
        />
      </Box>
    </Box>
  );
};

export default UpdateAddressDetailsStep;
