/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  LabeledCheckbox,
  UploadButton,
} from '../../../../component/features/RERegistration/CommonComponent';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';

import LabeledTextFieldWithVerifyUpdate from './CommonComponnet/LabeledTextFieldWithVerifyUpdate';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import { FormField } from './types/formTypesUpdate';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useFieldError } from '../context/FieldErrorContext';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import UpdateFormAccordion from './UpdateFormAccordion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  selectStepDataLoading,
  fetchDocument,
  deleteDocument,
} from './slice/updateStepDataSlice';
import LabeledDropDownUpdate from './CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from './CommonComponnet/LabledTextFieldUpdate';
import LabeledTextFieldWithUploadUpdate from './CommonComponnet/LableledTextFieldWithUploadUpdate';
import { buildValidationSchema, validateAllFields } from './formValidation';
import * as Yup from 'yup';
import {
  fetchDropdownDataAdminUser,
  selectDropdownOptions,
  selectDropdownLoading,
  selectDropdownData,
  fetchFormFieldsAdminUser,
  fetchStepDataAdminUser,
  selectGroupedFields,
  selectStepData,
  selectConfiguration,
  selectDocuments,
} from './slice/updateAdminUserDetailsSlice';
import {
  fetchRegistrationAddresses,
  selectRegistrationAddresses,
} from './slice/updateNodalOfficerSlice';
import { submitUpdatedAdminUserDetails } from './slice/updateAdminUserDetailsSubmissionSlice';
import LabeledDateUpdate from './CommonComponnet/LabeledDateUpdate';
import OTPModalUpdateEntity from './CommonComponnet/OtpModalUpdateEntity';
import SuccessModalUpdate from './CommonComponnet/SuccessModalUpdate';
import { OTPSend } from '../../Authenticate/slice/authSlice';
import { fork } from 'child_process';
import { ActionButton } from './CommonComponnet/CommonComp.styles';
import {
  validateField,
  getProofOfIdentityValidation,
} from '../slice/formSlice';

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

// Field name mapping from Search API to Form Fields
// Handles mismatches between backend search API response and form field names
const searchApiToFormFieldMapping: Record<string, string> = {
  // Admin 1 Address Fields
  iauAddressLineOne31: 'iauAddressLineOne3',
  // Admin 2 Address Fields
  iauAddressLineTwo31: 'iauAddressLineTwo3',
  // Add more mappings here as needed for other mismatched fields
};

// Function to normalize field names from search API to form field names
const normalizeFieldName = (fieldName: string): string => {
  return searchApiToFormFieldMapping[fieldName] || fieldName;
};

// Function to normalize all keys in step data object
const normalizeStepData = (data: Record<string, any>): Record<string, any> => {
  const normalizedData: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    const normalizedKey = normalizeFieldName(key);
    normalizedData[normalizedKey] = value;
  });

  return normalizedData;
};

const UpdateAdminUserDetailsStep: React.FC<StepProps> = ({ onSaveAndNext }) => {
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
  const [formData, setFormData] = useState<FormData>({});

  // Dynamic admin state management
  const [adminNumbers, setAdminNumbers] = useState<string[]>([]);
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<
    Record<string, Set<string>>
  >({});
  const [isCkycVerified, setIsCkycVerified] = useState<Record<string, boolean>>(
    {}
  );
  const [isAddMode, setIsAddMode] = useState<Record<string, boolean>>({});
  // Track address fields that are auto-filled from "Same as" selection
  const [sameAsAddressFields, setSameAsAddressFields] = useState<
    Record<string, Set<string>>
  >({});

  // OTP validation states - dynamic
  const [originalMobile, setOriginalMobile] = useState<Record<string, string>>(
    {}
  );
  const [originalEmail, setOriginalEmail] = useState<Record<string, string>>(
    {}
  );
  const [isMobileChanged, setIsMobileChanged] = useState<
    Record<string, boolean>
  >({});
  const [isEmailChanged, setIsEmailChanged] = useState<Record<string, boolean>>(
    {}
  );
  const [isOtpValidated, setIsOtpValidated] = useState<Record<string, boolean>>(
    {}
  );
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<Record<string, boolean>>(
    {}
  );
  const [otpIdentifier, setOtpIdentifier] = useState<Record<string, string>>(
    {}
  );
  const [generalError, setGeneralError] = useState<string>('');

  // Success modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successTitle, setSuccessTitle] = useState<string>('');

  const stepData = useSelector(selectStepData);
  const stepDocuments = useSelector(selectDocuments);
  const fetchedDocuments = useSelector(
    (state: any) => state.updateStepData.fetchedDocuments
  );
  const fields = useSelector(selectGroupedFields);
  const config = useSelector(selectConfiguration);
  const loading = useSelector(selectStepDataLoading);
  const [groupedFields, setGroupedFields] = useState<GroupedFields>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  // Track whether the Validate button should be disabled for each admin.
  // true = disabled, false = enabled
  const [validateButtonDisabled, setValidateButtonDisabled] = useState<
    Record<string, boolean>
  >({});

  // Track previous citizenship values to detect changes
  const previousCitizenshipRef = useRef<Record<string, string>>({});

  const dropdownData = useSelector(selectDropdownData);
  const registrationAddresses = useSelector(selectRegistrationAddresses);

  // Get workflowId from updateWorkflow slice
  const workflowId = useSelector(
    (state: RootState) => state.updateWorkflow.workflowId
  );

  const [validationSchema, setValidationSchema] = useState<Yup.ObjectSchema<
    Record<string, unknown>
  > | null>(null);
  const validationSchemaBuilder = useMemo(() => buildValidationSchema, []);

  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      const fieldNameLower = field.fieldName.toLowerCase();

      // Special handling for Proof of Identity Number fields
      // The conditionalLogic references generic field names (e.g., iauProofOfIdentity)
      // but actual fields have admin suffixes (e.g., iauProofOfIdentity1)
      if (fieldNameLower.includes('proofofidentitynumber')) {
        // Extract admin number from field name (e.g., iauProofOfIdentityNumber1 -> 1)
        const adminMatch = field.fieldName.match(/(\d+)$/);
        const adminNum = adminMatch ? adminMatch[1] : '';

        // Get the corresponding proof type field value
        const proofTypeFieldName = `iauProofOfIdentity${adminNum}`;
        const proofType = String(
          formData[proofTypeFieldName] || ''
        ).toUpperCase();

        // Get validation rules dynamically from formSlice.ts
        const proofValidation = getProofOfIdentityValidation(proofType);

        // Build validation rules object from the centralized constant
        const proofTypeValidationRules = proofValidation
          ? {
              required: true,
              minLength: String(proofValidation.minLength),
              maxLength: String(proofValidation.maxLength),
              minLengthMessage: proofValidation.minLengthMessage,
              maxLengthMessage: proofValidation.maxLengthMessage,
              regx: proofValidation.regx,
              regxMessage: proofValidation.regxMessage,
              requiredMessage: proofValidation.minLengthMessage,
            }
          : null;

        // Check if we have validation rules from conditionalLogic in the field
        if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
          for (const logic of field.conditionalLogic) {
            const when = logic.when;
            if (!when?.field) continue;

            // Handle field name with admin suffix
            let dependentFieldName = when.field;
            // If the when.field doesn't have an admin number, append it
            if (adminNum && !dependentFieldName.match(/\d+$/)) {
              dependentFieldName = `${when.field}${adminNum}`;
            }

            const dependentValue = formData[dependentFieldName];
            const operator = when.operator || 'equals';
            const expectedValues = Array.isArray(when.value)
              ? when.value
              : [when.value];

            let conditionMatches = false;

            switch (operator) {
              case 'in':
              case 'equals':
              case 'equal':
              case 'is':
                conditionMatches = expectedValues
                  .map((v) => String(v).toUpperCase())
                  .includes(String(dependentValue ?? '').toUpperCase());
                break;
              case 'not_in':
              case 'not_equals':
              case 'not_equal':
              case 'is_not':
                conditionMatches = !expectedValues
                  .map((v) => String(v).toUpperCase())
                  .includes(String(dependentValue ?? '').toUpperCase());
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

            if (conditionMatches && logic.then?.validationRules) {
              // Merge with proof type specific validation rules to ensure custom error messages
              return {
                ...field.validationRules,
                ...logic.then.validationRules,
                ...(proofTypeValidationRules || {}), // Override with our custom messages
              };
            }

            if (!conditionMatches && logic.else?.validationRules) {
              // Merge with proof type specific validation rules to ensure custom error messages
              return {
                ...field.validationRules,
                ...logic.else.validationRules,
                ...(proofTypeValidationRules || {}), // Override with our custom messages
              };
            }
          }
        }

        // If no conditional logic matched, use proof type based validation rules
        if (proofTypeValidationRules) {
          return {
            ...field.validationRules,
            ...proofTypeValidationRules,
          };
        }

        // If no proof type selected, return base validation rules with generic required message
        return {
          ...field.validationRules,
          required: true,
          requiredMessage: 'Proof of Identity Number is required',
        };
      }

      // Standard conditional logic evaluation for other fields
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return field.validationRules;
      }

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
          case 'equals':
          case 'equal':
          case 'is':
            conditionMatches = expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
            break;
          case 'not_in':
          case 'not_equals':
          case 'not_equal':
          case 'is_not':
            conditionMatches = !expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
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

        if (conditionMatches && logic.then?.validationRules) {
          return {
            ...field.validationRules,
            ...logic.then.validationRules,
          };
        }

        if (!conditionMatches && logic.else?.validationRules) {
          return {
            ...field.validationRules,
            ...logic.else.validationRules,
          };
        }
      }

      return field.validationRules;
    },
    [formData]
  );

  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return true;
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
          case 'equals':
          case 'equal':
          case 'is':
            return expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
          case 'not_in':
          case 'not_equals':
          case 'not_equal':
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

      return !!matchedLogic;
    },
    [formData]
  );

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
      const fieldsWithConditionalLogic = allFields.map((field) => ({
        ...field,
        validationRules: evaluateConditionalLogic(field),
      }));
      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    } else {
      console.warn('⚠️  Cannot build validation schema:', {
        allFieldsLength: allFields.length,
        loading,
      });
    }
  }, [
    groupedFields,
    validationSchemaBuilder,
    evaluateConditionalLogic,
    loading,
    extractAllFieldsFromGroupedFields,
  ]);

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  // Get groupMembership from auth state
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership
  );

  // Determine which admin sections the user can add/edit based on their role
  // Nodal_Officer: Can add both Admin 1 and Admin 2
  // IAU_1: Can only add Admin 2 (Admin 1 is read-only - they ARE admin 1)
  // IAU_2: Can only add Admin 1 (Admin 2 is read-only - they ARE admin 2)
  const canAddAdmin = useCallback(
    (adminNum: string): boolean => {
      const userGroup = groupMembership?.[0] || '';
      const userType = userDetails?.role || '';

      // Nodal_Officer can add any admin
      if (userGroup === 'Nodal_Officer') {
        return true;
      }

      // Institutional_Admin_User with IAU_1 can only add Admin 2
      if (userGroup === 'Institutional_Admin_User' && userType === 'IAU_1') {
        return adminNum === '2';
      }

      // Institutional_Admin_User with IAU_2 can only add Admin 1
      if (userGroup === 'Institutional_Admin_User' && userType === 'IAU_2') {
        return adminNum === '1';
      }

      // Default: allow adding
      return true;
    },
    [groupMembership, userDetails?.role]
  );

  // Determine if admin section should be read-only based on user role
  // IAU_1 cannot edit Admin 1 fields (they are Admin 1)
  // IAU_2 cannot edit Admin 2 fields (they are Admin 2)
  const isAdminReadOnly = useCallback(
    (adminNum: string): boolean => {
      const userGroup = groupMembership?.[0] || '';
      const userType = userDetails?.role || '';

      // Nodal_Officer can edit all admins
      if (userGroup === 'Nodal_Officer') {
        return false;
      }

      // IAU_1 cannot edit Admin 1 (their own details)
      if (userGroup === 'Institutional_Admin_User' && userType === 'IAU_1') {
        return adminNum === '1';
      }

      // IAU_2 cannot edit Admin 2 (their own details)
      if (userGroup === 'Institutional_Admin_User' && userType === 'IAU_2') {
        return adminNum === '2';
      }

      // Default: not read-only
      return false;
    },
    [groupMembership, userDetails?.role]
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const userId = userDetails?.userId || 'NO_0000';

    dispatch(
      fetchStepDataAdminUser({
        stepKey: 'institutionalAdminUser',
        userId: userId,
      })
    );

    dispatch(fetchFormFieldsAdminUser());

    // Fetch registration addresses for "Same as" dropdown functionality
    dispatch(fetchRegistrationAddresses({ userId }));
  }, [dispatch, userDetails?.userId]);

  // Extract admin numbers dynamically from grouped fields
  useEffect(() => {
    if (fields && !loading) {
      setGroupedFields(fields);

      // Extract admin numbers from field names
      const adminNums = new Set<string>();
      Object.values(fields).forEach((group: any) => {
        if (group.fields && Array.isArray(group.fields)) {
          group.fields.forEach((field: FormField) => {
            // Match fields ending with numbers (e.g., iauEmail1, iauEmail2, etc.)
            const match = field.fieldName.match(/(\d+)$/);
            if (match) {
              // Add the full number match (e.g., '21' from iauAddressLine21)
              adminNums.add(match[1]);
              // Also add just the last digit as admin number (e.g., '1' from iauAddressLine21)
              const lastDigit = match[1].slice(-1);
              adminNums.add(lastDigit);
            }
          });
        }
      });

      // Sort admin numbers by length (shorter first) to ensure single digits are checked before double digits
      // Also filter to only include reasonable admin numbers (1-9)
      const sortedAdminNums = Array.from(adminNums)
        .filter(
          (num) => num.length === 1 && parseInt(num) >= 1 && parseInt(num) <= 9
        )
        .sort((a, b) => parseInt(a) - parseInt(b));

      setAdminNumbers(sortedAdminNums);

      // Initialize states for each admin
      const initialAddModes: Record<string, boolean> = {};
      const initialCkycVerified: Record<string, boolean> = {};
      const initialAutoPopulated: Record<string, Set<string>> = {};
      const initialOtpStates: Record<string, boolean> = {};
      const initialOtpIdentifiers: Record<string, string> = {};
      const initialOriginalValues: Record<string, string> = {};

      const initialSameAsFields: Record<string, Set<string>> = {};

      sortedAdminNums.forEach((num) => {
        initialAddModes[num] = false;
        initialCkycVerified[num] = false;
        initialAutoPopulated[num] = new Set();
        initialOtpStates[num] = false;
        initialOtpIdentifiers[num] = '';
        initialOriginalValues[num] = '';
        initialSameAsFields[num] = new Set();
      });

      setIsAddMode(initialAddModes);
      setIsCkycVerified(initialCkycVerified);
      setAutoPopulatedFields(initialAutoPopulated);
      setSameAsAddressFields(initialSameAsFields);
      setIsOtpValidated(initialOtpStates);
      setIsOtpModalOpen(initialOtpStates);
      setIsMobileChanged(initialOtpStates);
      setIsEmailChanged(initialOtpStates);
      setOtpIdentifier(initialOtpIdentifiers);
      setOriginalMobile(initialOriginalValues);
      setOriginalEmail(initialOriginalValues);

      setIsDataLoaded(true);
    }
  }, [fields, loading]);

  useEffect(() => {
    if (config && !loading) {
      setConfiguration(config);
    }
  }, [config, loading]);

  useEffect(() => {
    if (
      stepData &&
      Object.keys(stepData).length > 0 &&
      !loading &&
      isDataLoaded &&
      adminNumbers.length > 0 &&
      !Object.values(isAddMode).some((mode) => mode) // No admin in add mode
    ) {
      // Normalize field names from search API to match form field names
      const normalizedStepData = normalizeStepData(stepData);
      const initialFormData: FormData = {};

      Object.entries(normalizedStepData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          initialFormData[key] = value;
        }
      });

      // Initialize previous citizenship values to prevent clearing on first load
      adminNumbers.forEach((adminNum) => {
        const citizenshipKey = `iauCitizenship${adminNum}`;
        const citizenship = initialFormData[citizenshipKey] as string;
        if (citizenship) {
          previousCitizenshipRef.current[adminNum] = citizenship;
        }
      });

      setFormData(initialFormData);
    }
  }, [stepData, loading, isDataLoaded, adminNumbers, isAddMode]);

  // Auto-verify CKYC if citizenship is Indian and CKYC number exists on initial load
  useEffect(() => {
    if (
      stepData &&
      Object.keys(stepData).length > 0 &&
      !loading &&
      isDataLoaded &&
      adminNumbers.length > 0 &&
      !Object.values(isAddMode).some((mode) => mode) // No admin in add mode
    ) {
      // Normalize field names from search API to match form field names
      const normalizedStepData = normalizeStepData(stepData);
      const newCkycVerified = { ...isCkycVerified };
      const newAutoPopulatedFields = { ...autoPopulatedFields };

      adminNumbers.forEach((adminNum) => {
        const citizenshipKey = `iauCitizenship${adminNum}`;
        const ckycNumberKey = `iauCkycNumber${adminNum}`;

        const citizenship = (normalizedStepData as any)[citizenshipKey];
        const ckycNumber = (normalizedStepData as any)[ckycNumberKey];
        const isIndian = String(citizenship ?? '').toLowerCase() === 'indian';
        const hasCkycNumber = !!ckycNumber && String(ckycNumber).trim() !== '';

        if (isIndian && hasCkycNumber) {
          newCkycVerified[adminNum] = true;

          // Find the CKYC field for this admin to get its autoPopulate configuration
          const adminFormFields = extractAllFieldsFromGroupedFields().filter(
            (field) => field.fieldName.endsWith(adminNum)
          );
          const ckycFormField = adminFormFields.find((f) =>
            f.fieldName.toLowerCase().includes('ckyc')
          );

          const autoPopulateFieldsList =
            ckycFormField?.conditionalLogic?.[0]?.then?.fieldAttributes
              ?.autoPopulate || [];
          // Track ALL fields from autoPopulate config for disabling
          const ckycAutopopulatedFields = new Set<string>();
          autoPopulateFieldsList.forEach((fieldName: string) => {
            // Add all fields from autoPopulate config, regardless of whether they have values
            // This ensures fields like middleName are disabled even if they're empty
            ckycAutopopulatedFields.add(fieldName);
          });

          newAutoPopulatedFields[adminNum] = ckycAutopopulatedFields;
        }
      });

      setIsCkycVerified(newCkycVerified);
      setAutoPopulatedFields(newAutoPopulatedFields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepData, loading, isDataLoaded, adminNumbers, isAddMode]);

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

  // Helper function to check if a key belongs to a specific admin (for clearing and validation)
  const keyBelongsToAdmin = useCallback(
    (key: string, adminNum: string): boolean => {
      // Field naming conventions from API:
      // Admin 1: iauCitizenship1, iauFirstName1, iauAddressLineOne1, iauAddressLineOne2, iauAddressLineOne3
      // Admin 2: iauCitizenship2, iauFirstName2, iauAddressLineTwo1, iauAddressLineTwo2, iauAddressLineTwo3
      // File fields: iauEmployCode1File, iauProofOfIdentityNumber1File

      const keyLower = key.toLowerCase();

      // Map admin numbers to their text representation in field names
      const adminTextMap: Record<string, string> = {
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
      };

      const adminText = adminTextMap[adminNum];

      // First, check for admin indicator in field name (One/Two pattern)
      // e.g., "iauAddressLineOne2" contains "One" - belongs to Admin 1
      // e.g., "iauAddressLineTwo1" contains "Two" - belongs to Admin 2
      if (adminText) {
        // Check if this field contains the admin indicator word
        if (
          keyLower.includes(`line${adminText}`) ||
          keyLower.includes(`admin${adminText}`)
        ) {
          return true;
        }

        // Check if field contains a DIFFERENT admin indicator (if so, it doesn't belong to this admin)
        for (const [num, text] of Object.entries(adminTextMap)) {
          if (
            num !== adminNum &&
            (keyLower.includes(`line${text}`) ||
              keyLower.includes(`admin${text}`))
          ) {
            return false;
          }
        }
      }

      // Check for file field patterns like "iauEmployCode1File" or "iauProofOfIdentityNumber1File"
      // These end with {adminNum}File or {adminNum}_file
      const fileFieldMatch = key.match(/(\d+)(?:File|_file)$/i);
      if (fileFieldMatch) {
        const extractedNum = fileFieldMatch[1];
        return extractedNum === adminNum;
      }

      // For fields without admin text indicator, check if field ends with admin number
      // e.g., iauCitizenship1, iauEmail1, iauFirstName1 for Admin 1
      // e.g., iauCitizenship2, iauEmail2, iauFirstName2 for Admin 2
      // Note: This is safe only for fields that don't have LineOne/LineTwo pattern
      if (key.endsWith(adminNum)) {
        return true;
      }

      return false;
    },
    []
  );

  // NEW FUNCTION TO SOLVE BUTTON DISBALE ISSUE

  // Compute per-admin validate button disabled state using full-schema validation
  useEffect(() => {
    if (!isDataLoaded || adminNumbers.length === 0) return;

    let mounted = true;

    const computeDisabled = async () => {
      const newDisabled: Record<string, boolean> = {};

      for (const adminNum of adminNumbers) {
        // Default to disabled
        newDisabled[adminNum] = true;

        // Only care about admins in add mode (validate button shown only then)
        if (!isAddMode[adminNum]) {
          newDisabled[adminNum] = true;
          continue;
        }

        try {
          const allFields = extractAllFieldsFromGroupedFields();
          const adminFields = allFields.filter((f) =>
            keyBelongsToAdmin(f.fieldName, adminNum)
          );

          // Build admin-specific form data
          const adminFormData: Record<string, unknown> = {};
          Object.keys(formData).forEach((key) => {
            if (keyBelongsToAdmin(key, adminNum)) {
              adminFormData[key] = formData[key];
            }
          });

          // Collect existing documents for this admin
          const adminDocuments: Record<string, string> = {};
          if (existingDocuments) {
            Object.keys(existingDocuments).forEach((key) => {
              if (keyBelongsToAdmin(key, adminNum)) {
                adminDocuments[key] = existingDocuments[key];
              }
            });
          }

          // Mark existing files so validation will skip file requirement when appropriate
          Object.keys(adminDocuments).forEach((fileFieldKey) => {
            if (!adminFormData[fileFieldKey] && adminDocuments[fileFieldKey]) {
              adminFormData[fileFieldKey] = 'EXISTING_FILE';
            }
          });

          // Handle file fields and uploaded files
          adminFields.forEach((field) => {
            if (
              field.fieldType === 'file' ||
              field.fieldType === 'textfield_with_image'
            ) {
              const fileFieldName =
                field.fieldType === 'textfield_with_image'
                  ? field.fieldFileName || `${field.fieldName}_file`
                  : field.fieldName;

              if (
                existingDocuments &&
                existingDocuments[fileFieldName] &&
                !adminFormData[fileFieldName]
              ) {
                adminFormData[fileFieldName] = 'EXISTING_FILE';
              }

              const uploadedFile = formData[fileFieldName];
              if (uploadedFile instanceof File) {
                adminFormData[fileFieldName] = uploadedFile;
              }
            }
          });

          // Adjust CKYC conditional rules (same logic as handleValidateAdmin)
          const citizenshipKey = `iauCitizenship${adminNum}`;
          const citizenship = adminFormData[citizenshipKey] as string;
          const isIndian = String(citizenship ?? '').toLowerCase() === 'indian';

          const modifiedAdminFields = adminFields.map((field) => {
            const isCkycField = field.fieldName.toLowerCase().includes('ckyc');
            if (isCkycField && !isIndian) {
              return {
                ...field,
                validationRules: {
                  ...field.validationRules,
                  required: false,
                },
              };
            }
            return field;
          });

          const adminValidationSchema =
            validationSchemaBuilder(modifiedAdminFields);

          const validationResult = await validateAllFields(
            modifiedAdminFields,
            adminFormData,
            adminValidationSchema,
            adminDocuments
          );

          newDisabled[adminNum] = !validationResult.isValid;
        } catch (err) {
          // On error, keep button disabled for safety
          newDisabled[adminNum] = true;
        }
      }

      if (mounted) setValidateButtonDisabled(newDisabled);
    };

    computeDisabled();

    return () => {
      mounted = false;
    };
    // Intentionally include the sources that affect admin validation
  }, [
    formData,
    existingDocuments,
    adminNumbers,
    isAddMode,
    isDataLoaded,
    extractAllFieldsFromGroupedFields,
    keyBelongsToAdmin,
    validationSchemaBuilder,
  ]);

  // Generic handler for Add New Institution Admin (works for any admin number)
  const handleAddAdmin = useCallback(
    (adminNum: string) => {
      setIsAddMode((prev) => ({ ...prev, [adminNum]: true }));

      // Map from word to number for group name matching
      const adminNumMap: Record<string, string> = {
        one: '1',
        two: '2',
        three: '3',
        four: '4',
        five: '5',
      };

      // Get all form field names that belong to this admin from groupedFields
      // Use GROUP NAME to determine admin ownership (e.g., "adminone" -> admin 1)
      const adminFieldNames = new Set<string>();
      Object.entries(groupedFields).forEach(
        ([groupName, group]: [string, any]) => {
          const groupNameLower = groupName.toLowerCase();

          // Check if this group belongs to the target admin
          let groupAdminNum: string | null = null;
          for (const [word, num] of Object.entries(adminNumMap)) {
            if (groupNameLower.includes(`admin${word}`)) {
              groupAdminNum = num;
              break;
            }
          }

          // Also check for numeric patterns like "admin1", "admin2"
          if (!groupAdminNum) {
            const numMatch = groupNameLower.match(/admin(\d+)/);
            if (numMatch) {
              groupAdminNum = numMatch[1];
            }
          }

          // If this group belongs to the target admin, collect all its field names
          if (
            groupAdminNum === adminNum &&
            group.fields &&
            Array.isArray(group.fields)
          ) {
            group.fields.forEach((field: FormField) => {
              adminFieldNames.add(field.fieldName);
              // Also add file field names for textfield_with_image and file types
              if (field.fieldFileName) {
                adminFieldNames.add(field.fieldFileName);
              }
              // Add default file field name pattern
              if (
                field.fieldType === 'textfield_with_image' ||
                field.fieldType === 'file'
              ) {
                adminFieldNames.add(`${field.fieldName}_file`);
              }
            });
          }
        }
      );

      // Clear all fields for this admin
      setFormData((prev) => {
        const clearedData = { ...prev };
        Object.keys(clearedData).forEach((key) => {
          // Clear if key matches pattern OR if it's a known field for this admin
          if (keyBelongsToAdmin(key, adminNum) || adminFieldNames.has(key)) {
            delete clearedData[key];
          }
        });
        return clearedData;
      });

      // Clear documents for this admin
      setExistingDocuments((prev) => {
        const clearedDocs = { ...prev };
        Object.keys(clearedDocs).forEach((key) => {
          if (keyBelongsToAdmin(key, adminNum) || adminFieldNames.has(key)) {
            delete clearedDocs[key];
          }
        });
        return clearedDocs;
      });

      setExistingDocumentData((prev) => {
        const clearedDocData = { ...prev };
        Object.keys(clearedDocData).forEach((key) => {
          if (keyBelongsToAdmin(key, adminNum) || adminFieldNames.has(key)) {
            delete clearedDocData[key];
          }
        });
        return clearedDocData;
      });

      setValidationErrors({});
      setIsCkycVerified((prev) => ({ ...prev, [adminNum]: false }));
      setAutoPopulatedFields((prev) => ({ ...prev, [adminNum]: new Set() }));
      setSameAsAddressFields((prev) => ({ ...prev, [adminNum]: new Set() }));

      // Reset OTP validation states for this admin
      setOriginalMobile((prev) => ({ ...prev, [adminNum]: '' }));
      setOriginalEmail((prev) => ({ ...prev, [adminNum]: '' }));
      setIsOtpValidated((prev) => ({ ...prev, [adminNum]: false }));
      setIsOtpModalOpen((prev) => ({ ...prev, [adminNum]: false }));
      setOtpIdentifier((prev) => ({ ...prev, [adminNum]: '' }));
      setIsMobileChanged((prev) => ({ ...prev, [adminNum]: false }));
      setIsEmailChanged((prev) => ({ ...prev, [adminNum]: false }));

      // Reset previous citizenship tracking for this admin
      delete previousCitizenshipRef.current[adminNum];
    },
    [keyBelongsToAdmin, groupedFields]
  );

  // Generic helper functions to get field values dynamically
  const getMobileValue = useCallback(
    (adminNum: string) => {
      const mobileField = Object.keys(formData).find(
        (key) => key.toLowerCase().includes('mobile') && key.endsWith(adminNum)
      );
      return mobileField ? formData[mobileField] : '';
    },
    [formData]
  );

  const getEmailValue = useCallback(
    (adminNum: string) => {
      const emailField = Object.keys(formData).find(
        (key) =>
          key.toLowerCase().includes('email') &&
          !key.toLowerCase().includes('mobile') &&
          key.endsWith(adminNum)
      );
      return emailField ? formData[emailField] : '';
    },
    [formData]
  );

  const getCountryCodeValue = useCallback(
    (adminNum: string) => {
      const countryCodeField = Object.keys(formData).find(
        (key) =>
          key.toLowerCase().includes('countrycode') && key.endsWith(adminNum)
      );
      return countryCodeField ? formData[countryCodeField] : '';
    },
    [formData]
  );

  // Generic validate handler (works for any admin number)
  const handleValidateAdmin = useCallback(
    async (adminNum: string) => {
      // Check if mobile number is filled (mandatory)
      const mobileValue = getMobileValue(adminNum);
      if (!mobileValue) {
        setGeneralError('Mobile number is required for validation.');
        return;
      }

      const shouldValidate = isAddMode[adminNum]
        ? getMobileValue(adminNum) || getEmailValue(adminNum)
        : isMobileChanged[adminNum] || isEmailChanged[adminNum];

      if (shouldValidate) {
        // Validate form fields before sending OTP (similar to UpdateNodalOfficerStep)
        const allFields = extractAllFieldsFromGroupedFields();
        const adminFields = allFields.filter((field) =>
          keyBelongsToAdmin(field.fieldName, adminNum)
        );

        // Filter formData to only include fields for this specific admin
        const adminFormData: Record<string, unknown> = {};
        Object.keys(formData).forEach((key) => {
          if (keyBelongsToAdmin(key, adminNum)) {
            adminFormData[key] = formData[key];
          }
        });

        // Filter existingDocuments to only include documents for this admin
        const adminDocuments: Record<string, string> = {};
        if (existingDocuments) {
          Object.keys(existingDocuments).forEach((key) => {
            if (keyBelongsToAdmin(key, adminNum)) {
              adminDocuments[key] = existingDocuments[key];
            }
          });
        }

        // Mark existing files in adminFormData so validation passes
        // This is similar to how the submit handler marks existing files
        Object.keys(adminDocuments).forEach((fileFieldKey) => {
          if (!adminFormData[fileFieldKey] && adminDocuments[fileFieldKey]) {
            adminFormData[fileFieldKey] = 'EXISTING_FILE';
          }
        });

        // Also check for file fields that might have different naming patterns
        adminFields.forEach((field) => {
          if (
            field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image'
          ) {
            const fileFieldName =
              field.fieldType === 'textfield_with_image'
                ? field.fieldFileName || `${field.fieldName}_file`
                : field.fieldName;

            // Check if file exists in existingDocuments (pre-existing from server)
            if (
              existingDocuments[fileFieldName] &&
              !adminFormData[fileFieldName]
            ) {
              adminFormData[fileFieldName] = 'EXISTING_FILE';
            }

            // Check if a newly uploaded file exists in formData (File object)
            // This handles the case when user uploads a new file in Add Mode
            const uploadedFile = formData[fileFieldName];
            if (uploadedFile instanceof File) {
              adminFormData[fileFieldName] = uploadedFile;
            }
          }
        });

        // Check citizenship and modify CKYC validation accordingly
        const citizenshipKey = `iauCitizenship${adminNum}`;
        const citizenship = adminFormData[citizenshipKey] as string;
        const isIndian = String(citizenship ?? '').toLowerCase() === 'indian';

        // Modify admin fields to handle conditional CKYC validation
        const modifiedAdminFields = adminFields.map((field) => {
          const isCkycField = field.fieldName.toLowerCase().includes('ckyc');

          if (isCkycField && !isIndian) {
            // If citizenship is NOT Indian, make CKYC optional
            return {
              ...field,
              validationRules: {
                ...field.validationRules,
                required: false,
              },
            };
          }

          return field;
        });

        // Build validation schema ONLY for this specific admin's fields
        const adminValidationSchema =
          validationSchemaBuilder(modifiedAdminFields);

        const validationResult = await validateAllFields(
          modifiedAdminFields,
          adminFormData,
          adminValidationSchema, // Use admin-specific schema instead of global schema
          adminDocuments
        );

        if (!validationResult.isValid) {
          setValidationErrors(validationResult.errors);
          setGeneralError('Please fix validation errors before proceeding.');
          return;
        }

        setValidationErrors({});
        setGeneralError('');

        // Get CKYC number for this admin
        const ckycNumberFieldName = `iauCkycNumber${adminNum}`;
        const ckycNo = (formData[ckycNumberFieldName] || '') as string;

        // Find mobile, email, and country code fields directly from formData
        // to avoid stale closure issues with helper functions
        const mobileField = Object.keys(formData).find(
          (key) =>
            key.toLowerCase().includes('mobile') && key.endsWith(adminNum)
        );
        const emailField = Object.keys(formData).find(
          (key) =>
            key.toLowerCase().includes('email') &&
            !key.toLowerCase().includes('mobile') &&
            key.endsWith(adminNum)
        );
        const countryCodeField = Object.keys(formData).find(
          (key) =>
            key.toLowerCase().includes('countrycode') && key.endsWith(adminNum)
        );

        const otpData = {
          requestType: 'DIRECT',
          emailId: (emailField ? formData[emailField] : '') as string,
          mobileNo: (mobileField ? formData[mobileField] : '') as string,
          countryCode: (countryCodeField
            ? formData[countryCodeField]
            : '') as string,
          workflowId: workflowId || '',
          ckycNo: ckycNo,
          stepKey: `institutionalAdminUser${adminNum}`,
        };

        try {
          const result = await dispatch(OTPSend(otpData));
          if (OTPSend.fulfilled.match(result)) {
            setOtpIdentifier((prev) => ({
              ...prev,
              [adminNum]: result?.payload?.data?.otpIdentifier,
            }));
            setIsOtpModalOpen((prev) => ({ ...prev, [adminNum]: true }));
            setGeneralError(''); // Clear any previous errors
          } else if (OTPSend.rejected.match(result)) {
            // Handle rejected OTP send
            const errorPayload = result.payload as any;

            // Find the field names for this admin
            const emailFieldName = Object.keys(formData).find(
              (key) =>
                key.toLowerCase().includes('email') &&
                !key.toLowerCase().includes('mobile') &&
                key.endsWith(adminNum)
            );
            const mobileFieldName = Object.keys(formData).find(
              (key) =>
                key.toLowerCase().includes('mobile') && key.endsWith(adminNum)
            );

            // Check if error response has errors array with field-specific errors
            const fieldErrors = errorPayload?.error?.errors;
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              // Handle field-specific errors from the errors array
              setValidationErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                fieldErrors.forEach(
                  (err: { field?: string; message?: string }) => {
                    const fieldName = err.field?.toLowerCase();
                    const errorMsg = err.message || 'This field has an error';

                    if (fieldName === 'email' && emailFieldName) {
                      newErrors[emailFieldName] = errorMsg;
                    } else if (
                      (fieldName === 'mobile' ||
                        fieldName === 'mobileno' ||
                        fieldName === 'mobileNo') &&
                      mobileFieldName
                    ) {
                      newErrors[mobileFieldName] = errorMsg;
                    }
                  }
                );
                return newErrors;
              });
            } else {
              // Fallback: Check error message for email/mobile keywords
              const errorMessage =
                errorPayload?.error?.message ||
                errorPayload?.message ||
                'Something Went Wrong';

              const errorLower = errorMessage.toLowerCase();
              const isEmailError = errorLower.includes('email');
              const isMobileError = errorLower.includes('mobile');

              if (isEmailError || isMobileError) {
                setValidationErrors((prevErrors) => {
                  const newErrors = { ...prevErrors };
                  if (isEmailError && emailFieldName) {
                    newErrors[emailFieldName] = errorMessage;
                  }
                  if (isMobileError && mobileFieldName) {
                    newErrors[mobileFieldName] = errorMessage;
                  }
                  return newErrors;
                });
              } else {
                // For other errors, show as general error
                setGeneralError(errorMessage);
              }
            }

            console.error(
              `❌ OTP Send failed for Admin ${adminNum}:`,
              errorPayload
            );
          }
        } catch (error) {
          console.error(`❌ Error sending OTP for Admin ${adminNum}:`, error);
          setGeneralError(
            'An error occurred while sending OTP. Please try again.'
          );
        }
      }
    },
    [
      isAddMode,
      isMobileChanged,
      isEmailChanged,
      dispatch,
      extractAllFieldsFromGroupedFields,
      keyBelongsToAdmin,
      formData,
      validationSchemaBuilder,
      existingDocuments,
      workflowId,
    ]
  );

  // Generic clear handler (works for any admin number)
  const handleClearAdmin = useCallback(
    (adminNum: string) => {
      if (isAddMode[adminNum]) {
        // Clear all fields for this admin
        setFormData((prev) => {
          const clearedData = { ...prev };
          Object.keys(clearedData).forEach((key) => {
            if (keyBelongsToAdmin(key, adminNum)) {
              delete clearedData[key];
            }
          });
          return clearedData;
        });

        // Clear documents for this admin
        setExistingDocuments((prev) => {
          const clearedDocs = { ...prev };
          Object.keys(clearedDocs).forEach((key) => {
            if (keyBelongsToAdmin(key, adminNum)) {
              delete clearedDocs[key];
            }
          });
          return clearedDocs;
        });

        setExistingDocumentData((prev) => {
          const clearedDocData = { ...prev };
          Object.keys(clearedDocData).forEach((key) => {
            if (keyBelongsToAdmin(key, adminNum)) {
              delete clearedDocData[key];
            }
          });
          return clearedDocData;
        });

        setValidationErrors({});
        setIsCkycVerified((prev) => ({ ...prev, [adminNum]: false }));
        setAutoPopulatedFields((prev) => ({ ...prev, [adminNum]: new Set() }));
        setSameAsAddressFields((prev) => ({ ...prev, [adminNum]: new Set() }));
        setIsOtpValidated((prev) => ({ ...prev, [adminNum]: false }));
        setIsMobileChanged((prev) => ({ ...prev, [adminNum]: false }));
        setIsEmailChanged((prev) => ({ ...prev, [adminNum]: false }));

        // Reset previous citizenship tracking for this admin
        delete previousCitizenshipRef.current[adminNum];
      }
    },
    [isAddMode, keyBelongsToAdmin]
  );

  // Generic OTP submit handler (works for any admin number)
  const handleOtpSubmitAdmin = useCallback(
    (adminNum: string) => (mobileOtp: string, emailOtp: string) => {
      setIsOtpModalOpen((prev) => ({ ...prev, [adminNum]: false }));
      setIsOtpValidated((prev) => ({ ...prev, [adminNum]: true }));

      // Store change flags before resetting them (for success message)
      const wasMobileChanged = isMobileChanged[adminNum];
      const wasEmailChanged = isEmailChanged[adminNum];

      // Get current mobile and email values
      const currentMobile = getMobileValue(adminNum) as string;
      const currentEmail = getEmailValue(adminNum) as string;

      // Store original values for update mode comparison
      if (!isAddMode[adminNum]) {
        if (isMobileChanged[adminNum]) {
          setOriginalMobile((prev) => ({
            ...prev,
            [adminNum]: currentMobile,
          }));
        }
        if (isEmailChanged[adminNum]) {
          setOriginalEmail((prev) => ({
            ...prev,
            [adminNum]: currentEmail,
          }));
        }
      }

      setIsMobileChanged((prev) => ({ ...prev, [adminNum]: false }));
      setIsEmailChanged((prev) => ({ ...prev, [adminNum]: false }));

      // Show success modal
      let message = '';
      if (
        wasMobileChanged &&
        wasEmailChanged &&
        currentMobile &&
        currentEmail
      ) {
        message = 'Mobile & Email OTP Verified Successfully';
      } else if (wasEmailChanged && currentEmail) {
        message = 'Email OTP Verified Successfully';
      } else if (currentMobile) {
        message = 'Mobile OTP Verified Successfully';
      } else {
        message = 'OTP Verified Successfully';
      }

      setSuccessTitle('');
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isAddMode,
      formData,
      getMobileValue,
      getEmailValue,
      isMobileChanged,
      isEmailChanged,
    ]
  );

  // Helper function to check if a field belongs to a specific admin
  const fieldBelongsToAdmin = useCallback(
    (fieldName: string, adminNum: string): boolean => {
      // Use the same logic as keyBelongsToAdmin for consistency
      // Field naming conventions from API:
      // Admin 1: iauCitizenship1, iauFirstName1, iauAddressLineOne1, iauAddressLineOne2, iauAddressLineOne3
      // Admin 2: iauCitizenship2, iauFirstName2, iauAddressLineTwo1, iauAddressLineTwo2, iauAddressLineTwo3

      const fieldNameLower = fieldName.toLowerCase();

      // Map admin numbers to their text representation in field names
      const adminTextMap: Record<string, string> = {
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
      };

      const adminText = adminTextMap[adminNum];

      // First, check for admin indicator in field name (One/Two pattern)
      if (adminText) {
        // Check if this field contains the admin indicator word
        if (
          fieldNameLower.includes(`line${adminText}`) ||
          fieldNameLower.includes(`admin${adminText}`)
        ) {
          return true;
        }

        // Check if field contains a DIFFERENT admin indicator (if so, it doesn't belong to this admin)
        for (const [num, text] of Object.entries(adminTextMap)) {
          if (
            num !== adminNum &&
            (fieldNameLower.includes(`line${text}`) ||
              fieldNameLower.includes(`admin${text}`))
          ) {
            return false;
          }
        }
      }

      // Check for file field patterns
      const fileFieldMatch = fieldName.match(/(\d+)(?:File|_file)$/i);
      if (fileFieldMatch) {
        const extractedNum = fileFieldMatch[1];
        return extractedNum === adminNum;
      }

      // For fields without admin text indicator, check if field ends with admin number
      if (fieldName.endsWith(adminNum)) {
        return true;
      }

      return false;
    },
    []
  );

  // Get all form fields for a specific admin
  const getAdminFormFields = useCallback(
    (adminNum: string) => {
      return extractAllFieldsFromGroupedFields().filter((field) =>
        fieldBelongsToAdmin(field.fieldName, adminNum)
      );
    },
    [extractAllFieldsFromGroupedFields, fieldBelongsToAdmin]
  );

  const areAllRequiredFieldsFilled = useCallback(
    (adminNum: string): boolean => {
      const adminFields = getAdminFormFields(adminNum);

      // Get all visible and required fields for this admin
      const requiredFields = adminFields.filter((field) => {
        // Check if field is visible
        if (!isFieldVisible(field)) {
          return false;
        }

        // Get evaluated validation rules (considering conditional logic)
        const evaluatedRules = evaluateConditionalLogic(field);

        // Return true if field is required
        return evaluatedRules?.required === true;
      });

      // Check if all required fields have values
      const allFieldsFilled = requiredFields.every((field) => {
        const value = formData[field.fieldName];

        // Check if value is not empty
        const hasValue =
          value !== null &&
          value !== undefined &&
          value !== '' &&
          (typeof value !== 'string' || value.trim() !== '');

        return hasValue;
      });

      return allFieldsFilled;
    },
    [getAdminFormFields, isFieldVisible, evaluateConditionalLogic, formData]
  );

  // Generic CKYC verification handler (works for any admin number)
  const handleCkycVerified = useCallback(
    (adminNum: string) => (field: FormField, data: any) => {
      const responseData = data?.data?.data || data?.data || data;
      if (!responseData || typeof responseData !== 'object') {
        console.error('❌ Invalid response data format');
        return;
      }

      const mappedData: Record<string, any> = {};

      const normalizeFieldName = (fieldName: string): string => {
        return fieldName
          .replace(/^(iau|no|ho|re)/i, '')
          .replace(new RegExp(`${adminNum}$`), '')
          .toLowerCase();
      };

      const adminFormFields = getAdminFormFields(adminNum);

      Object.entries(responseData).forEach(([apiKey, apiValue]) => {
        const normalizedApiKey = normalizeFieldName(apiKey);
        const matchingField = adminFormFields.find((formField) => {
          const normalizedFormFieldName = normalizeFieldName(
            formField.fieldName
          );
          return normalizedFormFieldName === normalizedApiKey;
        });

        if (matchingField) {
          let valueToStore = apiValue || '';

          // For dropdown fields, convert name to code if necessary
          if (
            matchingField.fieldType === 'dropdown' &&
            matchingField.fieldOptions &&
            apiValue
          ) {
            const matchingOption = matchingField.fieldOptions.find(
              (option: any) =>
                option.name?.toLowerCase() === String(apiValue).toLowerCase() ||
                option.code?.toLowerCase() === String(apiValue).toLowerCase()
            );
            if (matchingOption) {
              // Use code for the dropdown value
              valueToStore = matchingOption.code || apiValue;
            }
          }

          // Store value even if it's empty - this ensures the field is tracked
          mappedData[matchingField.fieldName] = valueToStore;
        }
      });
      // Get the autoPopulate configuration from the CKYC field
      const ckycField = adminFormFields.find((f) =>
        f.fieldName.toLowerCase().includes('ckyc')
      );
      const autoPopulateFields =
        ckycField?.conditionalLogic?.[0]?.then?.fieldAttributes?.autoPopulate ||
        [];
      // Track ALL fields from autoPopulate config, not just those with values
      // This ensures fields like middleName are disabled even if they're empty
      const autoPopulatedFieldNames = new Set<string>();
      autoPopulateFields.forEach((fieldName: string) => {
        autoPopulatedFieldNames.add(fieldName);
      });

      setAutoPopulatedFields((prev) => ({
        ...prev,
        [adminNum]: autoPopulatedFieldNames,
      }));
      setFormData((prev) => ({ ...prev, ...mappedData }));
      setIsCkycVerified((prev) => ({ ...prev, [adminNum]: true }));
    },
    [getAdminFormFields]
  );

  // All handlers are now fully dynamic and work with any admin number

  // Reset auto-populated fields when citizenship changes - dynamic for all admins
  useEffect(() => {
    adminNumbers.forEach((adminNum) => {
      const citizenshipKey = `iauCitizenship${adminNum}`;
      const ckycNumberKey = `iauCkycNumber${adminNum}`;
      const citizenship = formData[citizenshipKey] as string;
      const previousCitizenship = previousCitizenshipRef.current[adminNum];

      // Only proceed if citizenship has actually changed
      if (citizenship && citizenship !== previousCitizenship) {
        // Get the list of autopopulated fields for this admin
        const currentAutoPopulatedFields =
          autoPopulatedFields[adminNum] || new Set();

        // When citizenship changes to non-Indian
        if (citizenship !== 'Indian') {
          // Clear autopopulated field values
          if (
            currentAutoPopulatedFields.size > 0 ||
            previousCitizenship === 'Indian'
          ) {
            setFormData((prev) => {
              const clearedData = { ...prev };
              currentAutoPopulatedFields.forEach((fieldName) => {
                clearedData[fieldName] = '';
              });
              // Also clear CKYC number
              clearedData[ckycNumberKey] = '';
              return clearedData;
            });
          }

          // Reset autopopulated fields tracking
          setAutoPopulatedFields((prev) => ({
            ...prev,
            [adminNum]: new Set(),
          }));
          setIsCkycVerified((prev) => ({ ...prev, [adminNum]: false }));
        }
        // When citizenship changes to Indian
        else if (citizenship === 'Indian') {
          // Clear autopopulated field values but keep them tracked as autopopulated
          // so they remain disabled until CKYC verification
          if (currentAutoPopulatedFields.size > 0 || previousCitizenship) {
            setFormData((prev) => {
              const clearedData = { ...prev };
              currentAutoPopulatedFields.forEach((fieldName) => {
                clearedData[fieldName] = '';
              });
              return clearedData;
            });
          }

          // Reset CKYC verification status but keep autopopulated fields tracked
          setIsCkycVerified((prev) => ({ ...prev, [adminNum]: false }));
        }

        // Update the previous citizenship value
        previousCitizenshipRef.current[adminNum] = citizenship;
      }
    });
  }, [formData, adminNumbers, autoPopulatedFields]);

  // Dynamic cascading dropdown effects for all admins
  // Using JSON.stringify to create stable dependency for dynamic form data fields
  const cascadingFieldValues = useMemo(() => {
    return adminNumbers.flatMap((num) => [
      formData[`iauCountry${num}`],
      formData[`iauState${num}`],
      formData[`iauDistrict${num}`],
    ]);
  }, [adminNumbers, formData]);

  useEffect(() => {
    if (!isDataLoaded || adminNumbers.length === 0) return;

    adminNumbers.forEach((adminNum) => {
      const cascadingFields = [
        { parent: `iauCountry${adminNum}`, child: `iauState${adminNum}` },
        { parent: `iauState${adminNum}`, child: `iauDistrict${adminNum}` },
        { parent: `iauDistrict${adminNum}`, child: `iauPincode${adminNum}` },
      ];

      cascadingFields.forEach(({ parent, child }) => {
        const parentValue = formData[parent];
        if (parentValue) {
          const childField = findFieldByName(child);
          if (childField?.fieldAttributes?.type === 'external_api') {
            dispatch(
              fetchDropdownDataAdminUser({
                fieldName: child,
                fieldAttributes: childField.fieldAttributes,
                formData: formData,
              })
            );
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(cascadingFieldValues),
    isDataLoaded,
    adminNumbers,
    findFieldByName,
    dispatch,
  ]);

  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0 && !loading) {
      const documentsMap: Record<string, string> = {};
      const documentDataMap: Record<string, DocumentData> = {};
      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id) {
          documentsMap[doc.fieldKey] = doc.id;
          // Use shared fetchDocument from updateStepDataSlice
          dispatch(fetchDocument(doc.id));
          if (fetchedDocuments && fetchedDocuments[doc.id]) {
            const docData = fetchedDocuments[doc.id];
            documentDataMap[doc.fieldKey] = {
              id: doc.id,
              fileName: docData.fileName || `document_${doc.fieldKey}`,
              fileSize: docData.fileSize || 0,
              mimeType: docData.mimeType || 'application/octet-stream',
              dataUrl: docData.dataUrl || '',
            };
          }
        }
      });
      setExistingDocuments(documentsMap);
      setExistingDocumentData(documentDataMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepDocuments, loading, dispatch]);

  // Update existingDocumentData when fetchedDocuments change
  useEffect(() => {
    if (fetchedDocuments && Object.keys(existingDocuments).length > 0) {
      const documentDataMap: Record<string, DocumentData> = {};
      Object.entries(existingDocuments).forEach(([type, id]) => {
        if (fetchedDocuments[id]) {
          const docData = fetchedDocuments[id];
          documentDataMap[type] = {
            id: id,
            fileName: docData.fileName || `document_${type}`,
            fileSize: docData.fileSize || 0,
            mimeType: docData.mimeType || 'application/octet-stream',
            dataUrl: docData.dataUrl || '',
          };
        }
      });
      setExistingDocumentData(documentDataMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedDocuments, existingDocuments]);

  const handleSave = async () => {
    // Mark all fields as touched when submitting
    const allFields = extractAllFieldsFromGroupedFields();
    const allTouched: Record<string, boolean> = {};
    allFields.forEach((field) => {
      allTouched[field.fieldName] = true;
    });
    setTouchedFields(allTouched);

    let yupValidationPassed = true;

    // Check if no new admin users are being added
    const anyAdminInAddMode = adminNumbers.some((num) => isAddMode[num]);

    if (!anyAdminInAddMode) {
      onSaveAndNext();
      return;
    }

    // Helper function to check if admin has data
    const hasAdminData = (adminNumber: string) => {
      return Object.keys(formData).some(
        (key) =>
          key.endsWith(adminNumber) &&
          formData[key] !== '' &&
          formData[key] !== null &&
          formData[key] !== undefined
      );
    };

    // Determine which admins should be validated
    // Only validate admins that are in add mode
    const shouldValidateAdmin: Record<string, boolean> = {};
    adminNumbers.forEach((num) => {
      shouldValidateAdmin[num] = isAddMode[num] || false;
    });

    // Prepare formData with existing files marked so validation passes
    const formDataWithExistingFiles = { ...formData };

    // For admins not in add mode, mark all their fields as having existing data
    adminNumbers.forEach((adminNum) => {
      if (!isAddMode[adminNum]) {
        // Add existing file markers for this admin
        Object.keys(existingDocuments).forEach((fieldKey) => {
          const isAdminFile =
            fieldKey.endsWith(adminNum) ||
            fieldKey.includes(`${adminNum}File`) ||
            fieldKey.includes(`${adminNum}_file`);

          if (isAdminFile) {
            if (!formDataWithExistingFiles[fieldKey]) {
              // Add a marker (string) to indicate file exists
              formDataWithExistingFiles[fieldKey] = 'EXISTING_FILE';
            }
          }
        });
      }
    });
    try {
      if (validationSchema) {
        await validationSchema.validate(formDataWithExistingFiles, {
          abortEarly: false,
        });
        setValidationErrors({});
        // Get userId from auth state
        const userId = userDetails?.userId || userDetails?.id;

        if (!userId) {
          console.error('Missing userId:', { userDetails });
          alert('Missing user ID. Please try logging in again.');
          return;
        }

        // Create the formValues object with all the data
        // Remove EXISTING_FILE markers - they were only for validation
        const formValues: Record<
          string,
          string | File | number | boolean | object | null
        > = {};

        Object.entries(formDataWithExistingFiles).forEach(([key, value]) => {
          // Only include actual data, not the EXISTING_FILE markers
          if (value !== 'EXISTING_FILE') {
            formValues[key] = value;
          }
        });
        const result = await dispatch(
          submitUpdatedAdminUserDetails({
            formValues,
            userId,
          })
        ).unwrap();

        onSaveAndNext();
      } else {
        console.error('❌ ========== NO VALIDATION SCHEMA ==========');
        console.error('❌ Validation schema is null or undefined');
        console.error('   This means form fields were not loaded properly');
      }
    } catch (error) {
      console.error('❌ ========== ERROR OCCURRED ==========');
      console.error(
        '❌ Error type:',
        error instanceof Yup.ValidationError
          ? 'Validation Error'
          : 'API/Other Error'
      );
      console.error('❌ Error details:', error);

      if (error instanceof Yup.ValidationError) {
        console.error('📋 Yup Validation Errors:');
        console.error('   Total errors:', error.inner.length);
        error.inner.forEach((err, index) => {
          console.error(
            `   ${index + 1}. Field: ${err.path}, Message: ${err.message}`
          );
        });

        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            // Check which admin this field belongs to
            let shouldSkipValidation = false;
            adminNumbers.forEach((adminNum) => {
              const isAdminField =
                err.path!.endsWith(adminNum) ||
                err.path!.includes(`${adminNum}File`);

              // Only skip validation if admin has no data and is not in add mode
              if (isAdminField && !shouldValidateAdmin[adminNum]) {
                shouldSkipValidation = true;
              }
            });

            if (shouldSkipValidation) {
              return;
            }

            const field = userProfileFormFields.find(
              (f) =>
                f.fieldName === err.path ||
                f.fieldFileName === err.path ||
                `${f.fieldName}_file` === err.path
            );

            // Handle textfield_with_image separately for text vs file errors
            if (field && field.fieldType === 'textfield_with_image') {
              const fileFieldName =
                field.fieldFileName || `${field.fieldName}_file`;

              // If error is for the text field (e.g., "iauPan1" not "iauPan1File")
              if (err.path === field.fieldName) {
                // Always show text field errors (e.g., PAN number required)
                errors[err.path] = err.message;
              }
              // If error is for the file field (e.g., "iauPan1File")
              else if (err.path === fileFieldName) {
                // Skip file validation if:
                // 1. File already exists OR
                // 2. Admin is not in add mode (has initial data with existing files)
                let shouldSkipFileValidation = false;
                adminNumbers.forEach((adminNum) => {
                  const isAdminFile =
                    fileFieldName.endsWith(`${adminNum}File`) ||
                    fileFieldName.includes(`${adminNum}_file`);
                  const hasExistingFile = checkIfFileExists(fileFieldName);
                  const isNotInAddMode = isAdminFile && !isAddMode[adminNum];

                  if (hasExistingFile || isNotInAddMode) {
                    shouldSkipFileValidation = true;
                  }
                });

                if (shouldSkipFileValidation) {
                  return;
                }
                // Show file error if no existing file and in add mode
                errors[err.path] = err.message;
              }
            }
            // Handle file type
            else if (field && field.fieldType === 'file') {
              // Skip file validation if:
              // 1. File already exists OR
              // 2. Admin is not in add mode (has initial data with existing files)
              let shouldSkipFileValidation = false;
              adminNumbers.forEach((adminNum) => {
                const isAdminFile =
                  field.fieldName.endsWith(adminNum) ||
                  field.fieldName.includes(`${adminNum}File`);
                const hasExistingFile = checkIfFileExists(field.fieldName);
                const isNotInAddMode = isAdminFile && !isAddMode[adminNum];

                if (hasExistingFile || isNotInAddMode) {
                  shouldSkipFileValidation = true;
                }
              });

              if (shouldSkipFileValidation) {
                return;
              }
              errors[err.path] = err.message;
            }
            // Handle all other field types
            else {
              errors[err.path] = err.message;
            }
          }
        });

        console.error('📝 Final validation errors to display:', errors);
        console.error('   Error count:', Object.keys(errors).length);

        setValidationErrors(errors);
        yupValidationPassed = Object.keys(errors).length === 0;

        // If after filtering, there are no actual errors, proceed with submission
        if (yupValidationPassed) {
          // Get userId from auth state
          const userId = userDetails?.userId || userDetails?.id;

          if (!userId) {
            console.error('Missing userId:', { userDetails });
            alert('Missing user ID. Please try logging in again.');
            return;
          }

          // Create the formValues object with all the data
          // Remove EXISTING_FILE markers - they were only for validation
          const formValues: Record<
            string,
            string | File | number | boolean | object | null
          > = {};

          Object.entries(formDataWithExistingFiles).forEach(([key, value]) => {
            // Only include actual data, not the EXISTING_FILE markers
            if (value !== 'EXISTING_FILE') {
              formValues[key] = value;
            }
          });
          try {
            const result = await dispatch(
              submitUpdatedAdminUserDetails({
                formValues,
                userId,
              })
            ).unwrap();
            onSaveAndNext();
          } catch (apiError) {
            console.error('❌ API Submission Error:', apiError);
            // Handle API errors
            if (
              apiError &&
              typeof apiError === 'object' &&
              'fieldErrors' in apiError
            ) {
              console.error(
                '📋 API Field Errors:',
                (apiError as any).fieldErrors
              );
              const apiFieldErrors = (apiError as any).fieldErrors || {};
              const mappedFieldErrors: Record<string, string> = {};

              Object.entries(apiFieldErrors).forEach(
                ([fieldName, errorMessage]) => {
                  const field = userProfileFormFields.find(
                    (f) => f.fieldName === fieldName
                  );

                  if (
                    field &&
                    (field.fieldType === 'file' ||
                      field.fieldType === 'textfield_with_image')
                  ) {
                    if (field.fieldType === 'textfield_with_image') {
                      const fileFieldName =
                        field.fieldFileName || `${field.fieldName}_file`;
                      mappedFieldErrors[fileFieldName] = errorMessage as string;
                    } else {
                      mappedFieldErrors[fieldName] = errorMessage as string;
                    }
                  } else {
                    mappedFieldErrors[fieldName] = errorMessage as string;
                  }
                }
              );

              console.error('📝 Mapped API field errors:', mappedFieldErrors);
              setValidationErrors(mappedFieldErrors);
            } else if (
              apiError &&
              typeof apiError === 'object' &&
              'message' in apiError
            ) {
              const errorMessage =
                (apiError as any).message || 'Submission failed';
              console.error('❌ General API error message:', errorMessage);
              alert(errorMessage);
            }
          }
        }
      } else {
        console.error('❌ API Submission Error');
        yupValidationPassed = false;

        // Handle API field validation errors
        if (error && typeof error === 'object' && 'fieldErrors' in error) {
          console.error('📋 API Field Errors:', (error as any).fieldErrors);
          const apiFieldErrors = (error as any).fieldErrors || {};
          const mappedFieldErrors: Record<string, string> = {};

          // Map API field errors to actual form field names
          Object.entries(apiFieldErrors).forEach(
            ([fieldName, errorMessage]) => {
              // Check if this field has a corresponding file field in the form configuration
              const field = userProfileFormFields.find(
                (f) => f.fieldName === fieldName
              );

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

          console.error('📝 Mapped field errors:', mappedFieldErrors);
          setValidationErrors(mappedFieldErrors);
        } else if (error && typeof error === 'object' && 'message' in error) {
          // Show general error message
          const errorMessage = (error as any).message || 'Submission failed';
          console.error('❌ General error message:', errorMessage);
        }
      }
    }
  };

  const handleTextChange = (fieldName: string, value: string) => {
    let newValue = value;
    const fieldNameLower = fieldName.toLowerCase();

    // Handle Proof of Identity Number field - filter based on selected proof type
    if (fieldNameLower.includes('proofofidentitynumber')) {
      // Extract admin number from field name (e.g., iauProofOfIdentityNumber1 -> 1)
      const adminMatch = fieldName.match(/(\d+)$/);
      const adminNum = adminMatch ? adminMatch[1] : '1';

      // Get the corresponding proof type field value
      const proofTypeFieldName = `iauProofOfIdentity${adminNum}`;
      const proofTypeRaw = String(
        formData[proofTypeFieldName] || ''
      ).toUpperCase();

      // Get validation rules dynamically from formSlice.ts
      const proofValidation = getProofOfIdentityValidation(proofTypeRaw);

      // Use maxLength from centralized validation rules
      const maxLength = proofValidation?.maxLength || 20;

      // Determine if it's AADHAAR type (numeric only) - check normalized type
      const normalizedType = proofTypeRaw.replace(/[\s_]/g, '').toUpperCase();
      const isAadhaar = normalizedType === 'AADHAAR';

      // Filter input based on proof type
      if (isAadhaar) {
        // For AADHAAR, only allow numeric input (last 4 digits)
        newValue = newValue.replace(/\D/g, '').slice(0, maxLength);
      } else {
        // For all other types, allow alphanumeric and convert to uppercase
        newValue = newValue
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, maxLength);
      }
    }

    // Get field and evaluated rules for validation
    const allFields = extractAllFieldsFromGroupedFields();
    const field = allFields.find((f) => f.fieldName === fieldName);
    const evaluatedRules = field ? evaluateConditionalLogic(field) : undefined;

    // Mark field as touched when user starts typing
    if (!touchedFields[fieldName]) {
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [fieldName]: newValue,
      };

      // Real-time validation: validate the field as user types
      if (field && newValue) {
        // Validate the field using formSlice validateField function
        // Use field with evaluated rules for proper validation
        const fieldWithEvaluatedRules = {
          ...field,
          validationRules: evaluatedRules,
        };
        const error = validateField(
          fieldWithEvaluatedRules as any,
          newValue,
          updatedData as any
        );

        if (error) {
          // Set error immediately
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: error,
          }));
        } else {
          // Clear error if validation passes
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      } else {
        // Field is empty - show required error if field is required
        // Since user is actively typing (and we just marked as touched), show error
        if (evaluatedRules?.required) {
          const requiredMessage =
            evaluatedRules?.requiredMessage ||
            `${field?.fieldLabel || fieldName} is required`;
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: requiredMessage,
          }));
        } else {
          // Clear validation error if field is not required
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      }

      return updatedData;
    });
  };

  const handleBlur = (fieldName: string) => {
    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    // Validate required field on blur
    const allFields = extractAllFieldsFromGroupedFields();
    const field = allFields.find((f) => f.fieldName === fieldName);
    const value = formData[fieldName];

    // Get evaluated validation rules (handles conditional logic)
    const evaluatedRules = field ? evaluateConditionalLogic(field) : undefined;

    if (evaluatedRules?.required && (!value || value === '')) {
      const requiredMessage =
        evaluatedRules?.requiredMessage ||
        `${field?.fieldLabel || fieldName} is required`;
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: requiredMessage,
      }));
    }
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
      // Clear validation errors for this file field
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleDeleteDocument = useCallback(
    (documentId: string) => {
      if (documentId) {
        dispatch(deleteDocument(documentId));
      }
    },
    [dispatch]
  );

  const handleDropdownChange = (fieldName: string, value: string | number) => {
    setFormData((prev) => {
      const updates: FormData = {
        ...prev,
        [fieldName]: value,
      };

      const valueStr = String(value).toLowerCase();

      // Handle "Same as" dropdown for office address - check for each admin
      adminNumbers.forEach((adminNum) => {
        // Check if the changed field is an office address field for this admin
        const isOfficeAddressField =
          fieldName.toLowerCase().includes('officeaddress') &&
          fieldBelongsToAdmin(fieldName, adminNum);

        if (isOfficeAddressField) {
          // Get all form fields from groupedFields
          const allFields = extractAllFieldsFromGroupedFields().filter((f) =>
            fieldBelongsToAdmin(f.fieldName, adminNum)
          );

          // Find address fields dynamically by checking field name patterns
          // Field naming convention: iauAddressLine{AdminIndicator:One|Two}{LineNumber:1|2|3}
          // Admin 1: iauAddressLineOne1 (L1), iauAddressLineOne2 (L2), iauAddressLineOne3 (L3)
          // Admin 2: iauAddressLineTwo1 (L1), iauAddressLineTwo2 (L2), iauAddressLineTwo3 (L3)
          // Determine admin indicator for this admin
          const adminIndicator = adminNum === '1' ? 'one' : 'two';

          const line1Field = allFields.find((f) => {
            const fNameLower = f.fieldName.toLowerCase();
            const notLandline = !fNameLower.includes('landline');
            // Match pattern: ends with "1" and contains admin indicator OR generic line1 patterns
            const hasLine1 =
              (fNameLower.includes(`line${adminIndicator}`) &&
                fNameLower.endsWith('1')) ||
              fNameLower.includes('addresline1') ||
              fNameLower.includes('addressline1');
            return hasLine1 && notLandline;
          });
          const line2Field = allFields.find((f) => {
            const fNameLower = f.fieldName.toLowerCase();
            // Match pattern: ends with "2" and contains admin indicator OR generic line2 patterns
            // Note: "linetwo" pattern is for ADMIN 2, not LINE 2!
            const hasLine2 =
              (fNameLower.includes(`line${adminIndicator}`) &&
                fNameLower.endsWith('2')) ||
              fNameLower.includes('addresline2') ||
              fNameLower.includes('addressline2');
            return hasLine2;
          });
          const line3Field = allFields.find((f) => {
            const fNameLower = f.fieldName.toLowerCase();
            // Match pattern: ends with "3" (or "31"/"32" for admin-specific) and contains admin indicator
            // OR generic line3 patterns
            const hasLine3 =
              (fNameLower.includes(`line${adminIndicator}`) &&
                (fNameLower.endsWith('3') ||
                  fNameLower.endsWith(`3${adminNum}`))) ||
              fNameLower.includes('addresline3') ||
              fNameLower.includes('addressline3');
            return hasLine3;
          });

          const countryField = allFields.find(
            (f) =>
              f.fieldName.toLowerCase().includes('country') &&
              !f.fieldName.toLowerCase().includes('countrycode')
          );
          const stateField = allFields.find((f) =>
            f.fieldName.toLowerCase().includes('state')
          );
          const districtField = allFields.find((f) =>
            f.fieldName.toLowerCase().includes('district')
          );
          const cityField = allFields.find((f) =>
            f.fieldName.toLowerCase().includes('city')
          );

          const pincodeField = allFields.find(
            (f) =>
              f.fieldName.toLowerCase().includes('pincode') &&
              !f.fieldName.toLowerCase().includes('other')
          );
          const pincodeOtherField = allFields.find(
            (f) =>
              f.fieldName.toLowerCase().includes('pincode') &&
              f.fieldName.toLowerCase().includes('other')
          );
          const digipinField = allFields.find((f) =>
            f.fieldName.toLowerCase().includes('digipin')
          );

          if (
            valueStr.includes('same as register') ||
            valueStr.includes('same as registered')
          ) {
            // Copy register address fields to admin user address fields
            // Track which fields are being auto-populated from "Same as"
            const sameAsFieldNames = new Set<string>();

            // Helper function to get fallback value from formData (institutionalAdminUser response)
            // Field naming convention: iauAddressLine{AdminIndicator}{LineNumber}
            // Admin 1 uses "One": iauAddressLineOne1 (Line1), iauAddressLineOne2 (Line2), iauAddressLineOne31 (Line3)
            // Admin 2 uses "Two": iauAddressLineTwo1 (Line1), iauAddressLineTwo2 (Line2), iauAddressLineTwo32 (Line3)
            const getFallbackValue = (
              fieldType: string,
              adminNumber: string
            ): string => {
              // Determine admin indicator based on admin number
              const adminIndicator = adminNumber === '1' ? 'One' : 'Two';

              const fallbackKeys: Record<string, string[]> = {
                line1: [
                  `iauAddressLine${adminIndicator}1`,
                  `iauAddresLine1${adminNumber}`,
                  `iauAddressLine1${adminNumber}`,
                ],
                line2: [
                  `iauAddressLine${adminIndicator}2`,
                  `iauAddresLine2${adminNumber}`,
                  `iauAddressLine2${adminNumber}`,
                ],
                line3: [
                  `iauAddressLine${adminIndicator}3${adminNumber}`,
                  `iauAddressLineOne3${adminNumber}`,
                  `iauAddressLineTwo3${adminNumber}`,
                  `iauAddresLine3${adminNumber}`,
                  `iauAddressLine3${adminNumber}`,
                ],
                country: [`iauCountry${adminNumber}`],
                state: [`iauState${adminNumber}`],
                district: [`iauDistrict${adminNumber}`],
                city: [`iauCity${adminNumber}`],
                pincode: [`iauPincode${adminNumber}`],
                pincodeOther: [`iauPincodeOther${adminNumber}`],
                digipin: [`iauDigipin${adminNumber}`],
              };

              const keys = fallbackKeys[fieldType] || [];
              for (const key of keys) {
                const value = prev[key];
                if (value && String(value).trim() !== '') {
                  return String(value);
                }
              }
              return '';
            };

            // Use registrationAddresses (Response 1) as primary, fallback to formData (Response 2)
            if (line1Field) {
              updates[line1Field.fieldName] =
                registrationAddresses?.registerLine1 ||
                getFallbackValue('line1', adminNum) ||
                '';
              sameAsFieldNames.add(line1Field.fieldName);
            }
            if (line2Field) {
              updates[line2Field.fieldName] =
                registrationAddresses?.registerLine2 ||
                getFallbackValue('line2', adminNum) ||
                '';
              sameAsFieldNames.add(line2Field.fieldName);
            }
            if (line3Field) {
              updates[line3Field.fieldName] =
                registrationAddresses?.registerLine3 ||
                getFallbackValue('line3', adminNum) ||
                '';
              sameAsFieldNames.add(line3Field.fieldName);
            }
            if (countryField) {
              updates[countryField.fieldName] =
                registrationAddresses?.registerCountry ||
                getFallbackValue('country', adminNum) ||
                '';
              sameAsFieldNames.add(countryField.fieldName);
            }
            if (stateField) {
              updates[stateField.fieldName] =
                registrationAddresses?.registerState ||
                getFallbackValue('state', adminNum) ||
                '';
              sameAsFieldNames.add(stateField.fieldName);
            }
            if (districtField) {
              updates[districtField.fieldName] =
                registrationAddresses?.registerDistrict ||
                getFallbackValue('district', adminNum) ||
                '';
              sameAsFieldNames.add(districtField.fieldName);
            }
            if (cityField) {
              updates[cityField.fieldName] =
                registrationAddresses?.registerCity ||
                getFallbackValue('city', adminNum) ||
                '';
              sameAsFieldNames.add(cityField.fieldName);
            }
            if (pincodeField) {
              updates[pincodeField.fieldName] =
                registrationAddresses?.registerPincode ||
                getFallbackValue('pincode', adminNum) ||
                '';
              sameAsFieldNames.add(pincodeField.fieldName);
            }
            if (pincodeOtherField) {
              updates[pincodeOtherField.fieldName] =
                registrationAddresses?.registerPincodeOther ||
                getFallbackValue('pincodeOther', adminNum) ||
                '';
              sameAsFieldNames.add(pincodeOtherField.fieldName);
            }
            if (digipinField) {
              updates[digipinField.fieldName] =
                registrationAddresses?.registerDigipin ||
                getFallbackValue('digipin', adminNum) ||
                '';
              sameAsFieldNames.add(digipinField.fieldName);
            }

            // Update sameAsAddressFields state to disable these fields
            setSameAsAddressFields((prevState) => ({
              ...prevState,
              [adminNum]: sameAsFieldNames,
            }));

            // Determine effective values for cascading dropdown data fetch
            const effectiveCountry =
              registrationAddresses?.registerCountry ||
              getFallbackValue('country', adminNum);
            const effectiveState =
              registrationAddresses?.registerState ||
              getFallbackValue('state', adminNum);
            const effectiveDistrict =
              registrationAddresses?.registerDistrict ||
              getFallbackValue('district', adminNum);

            // Fetch cascading dropdown data
            if (
              effectiveCountry &&
              stateField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataAdminUser({
                  fieldName: stateField.fieldName,
                  fieldAttributes: stateField.fieldAttributes,
                  formData: {
                    ...prev,
                    [countryField?.fieldName || '']: effectiveCountry,
                  },
                })
              );
            }
            if (
              effectiveState &&
              districtField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataAdminUser({
                  fieldName: districtField.fieldName,
                  fieldAttributes: districtField.fieldAttributes,
                  formData: {
                    ...prev,
                    [stateField?.fieldName || '']: effectiveState,
                  },
                })
              );
            }
            if (
              effectiveDistrict &&
              pincodeField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataAdminUser({
                  fieldName: pincodeField.fieldName,
                  fieldAttributes: pincodeField.fieldAttributes,
                  formData: {
                    ...prev,
                    [districtField?.fieldName || '']: effectiveDistrict,
                  },
                })
              );
            }
          } else if (valueStr.includes('same as correspondence')) {
            // Track which fields are being auto-populated from "Same as"
            const sameAsFieldNames = new Set<string>();

            // Helper function to get fallback value from formData (institutionalAdminUser response)
            // Field naming convention: iauAddressLine{AdminIndicator}{LineNumber}
            // Admin 1 uses "One": iauAddressLineOne1 (Line1), iauAddressLineOne2 (Line2), iauAddressLineOne31 (Line3)
            // Admin 2 uses "Two": iauAddressLineTwo1 (Line1), iauAddressLineTwo2 (Line2), iauAddressLineTwo32 (Line3)
            const getFallbackValueCorrespondence = (
              fieldType: string,
              adminNumber: string
            ): string => {
              // Determine admin indicator based on admin number
              const adminIndicator = adminNumber === '1' ? 'One' : 'Two';

              const fallbackKeys: Record<string, string[]> = {
                line1: [
                  `iauAddressLine${adminIndicator}1`,
                  `iauAddresLine1${adminNumber}`,
                  `iauAddressLine1${adminNumber}`,
                ],
                line2: [
                  `iauAddressLine${adminIndicator}2`,
                  `iauAddresLine2${adminNumber}`,
                  `iauAddressLine2${adminNumber}`,
                ],
                line3: [
                  `iauAddressLine${adminIndicator}3${adminNumber}`,
                  `iauAddressLineOne3${adminNumber}`,
                  `iauAddressLineTwo3${adminNumber}`,
                  `iauAddresLine3${adminNumber}`,
                  `iauAddressLine3${adminNumber}`,
                ],
                country: [`iauCountry${adminNumber}`],
                state: [`iauState${adminNumber}`],
                district: [`iauDistrict${adminNumber}`],
                city: [`iauCity${adminNumber}`],
                pincode: [`iauPincode${adminNumber}`],
                pincodeOther: [`iauPincodeOther${adminNumber}`],
                digipin: [`iauDigipin${adminNumber}`],
              };

              const keys = fallbackKeys[fieldType] || [];
              for (const key of keys) {
                const value = prev[key];
                if (value && String(value).trim() !== '') {
                  return String(value);
                }
              }
              return '';
            };

            // Use registrationAddresses (Response 1) as primary, fallback to formData (Response 2)
            if (line1Field) {
              updates[line1Field.fieldName] =
                registrationAddresses?.correspondenceLine1 ||
                getFallbackValueCorrespondence('line1', adminNum) ||
                '';
              sameAsFieldNames.add(line1Field.fieldName);
            }
            if (line2Field) {
              updates[line2Field.fieldName] =
                registrationAddresses?.correspondenceLine2 ||
                getFallbackValueCorrespondence('line2', adminNum) ||
                '';
              sameAsFieldNames.add(line2Field.fieldName);
            }
            if (line3Field) {
              updates[line3Field.fieldName] =
                registrationAddresses?.correspondenceLine3 ||
                getFallbackValueCorrespondence('line3', adminNum) ||
                '';
              sameAsFieldNames.add(line3Field.fieldName);
            }
            if (countryField) {
              updates[countryField.fieldName] =
                registrationAddresses?.correspondenceCountry ||
                getFallbackValueCorrespondence('country', adminNum) ||
                '';
              sameAsFieldNames.add(countryField.fieldName);
            }
            if (stateField) {
              updates[stateField.fieldName] =
                registrationAddresses?.correspondenceState ||
                getFallbackValueCorrespondence('state', adminNum) ||
                '';
              sameAsFieldNames.add(stateField.fieldName);
            }
            if (districtField) {
              updates[districtField.fieldName] =
                registrationAddresses?.correspondenceDistrict ||
                getFallbackValueCorrespondence('district', adminNum) ||
                '';
              sameAsFieldNames.add(districtField.fieldName);
            }
            if (cityField) {
              updates[cityField.fieldName] =
                registrationAddresses?.correspondenceCity ||
                getFallbackValueCorrespondence('city', adminNum) ||
                '';
              sameAsFieldNames.add(cityField.fieldName);
            }
            if (pincodeField) {
              updates[pincodeField.fieldName] =
                registrationAddresses?.correspondencePincode ||
                getFallbackValueCorrespondence('pincode', adminNum) ||
                '';
              sameAsFieldNames.add(pincodeField.fieldName);
            }
            if (pincodeOtherField) {
              updates[pincodeOtherField.fieldName] =
                registrationAddresses?.correspondencePincodeOther ||
                getFallbackValueCorrespondence('pincodeOther', adminNum) ||
                '';
              sameAsFieldNames.add(pincodeOtherField.fieldName);
            }
            if (digipinField) {
              updates[digipinField.fieldName] =
                registrationAddresses?.correspondenceDigipin ||
                getFallbackValueCorrespondence('digipin', adminNum) ||
                '';
              sameAsFieldNames.add(digipinField.fieldName);
            }

            // Update sameAsAddressFields state to disable these fields
            setSameAsAddressFields((prevState) => ({
              ...prevState,
              [adminNum]: sameAsFieldNames,
            }));

            // Determine effective values for cascading dropdown data fetch
            const effectiveCountryCorr =
              registrationAddresses?.correspondenceCountry ||
              getFallbackValueCorrespondence('country', adminNum);
            const effectiveStateCorr =
              registrationAddresses?.correspondenceState ||
              getFallbackValueCorrespondence('state', adminNum);
            const effectiveDistrictCorr =
              registrationAddresses?.correspondenceDistrict ||
              getFallbackValueCorrespondence('district', adminNum);

            // Fetch cascading dropdown data
            if (
              effectiveCountryCorr &&
              stateField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataAdminUser({
                  fieldName: stateField.fieldName,
                  fieldAttributes: stateField.fieldAttributes,
                  formData: {
                    ...prev,
                    [countryField?.fieldName || '']: effectiveCountryCorr,
                  },
                })
              );
            }
            if (
              effectiveStateCorr &&
              districtField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataAdminUser({
                  fieldName: districtField.fieldName,
                  fieldAttributes: districtField.fieldAttributes,
                  formData: {
                    ...prev,
                    [stateField?.fieldName || '']: effectiveStateCorr,
                  },
                })
              );
            }
            if (
              effectiveDistrictCorr &&
              pincodeField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataAdminUser({
                  fieldName: pincodeField.fieldName,
                  fieldAttributes: pincodeField.fieldAttributes,
                  formData: {
                    ...prev,
                    [districtField?.fieldName || '']: effectiveDistrictCorr,
                  },
                })
              );
            }
          } else {
            // Clear sameAsAddressFields when a different option is selected
            setSameAsAddressFields((prevState) => ({
              ...prevState,
              [adminNum]: new Set(),
            }));
          }
        }
      });

      // Handle cascading dropdown clearing dynamically for all admins
      const fieldNameLower = fieldName.toLowerCase();
      adminNumbers.forEach((adminNum) => {
        // Check if this field belongs to this admin
        if (!fieldBelongsToAdmin(fieldName, adminNum)) return;

        // Get all fields for this admin to find dependent fields dynamically
        const adminFields = extractAllFieldsFromGroupedFields().filter((f) =>
          fieldBelongsToAdmin(f.fieldName, adminNum)
        );

        if (
          fieldNameLower.includes('country') &&
          !fieldNameLower.includes('countrycode')
        ) {
          // Clear state, district, pincode fields
          adminFields.forEach((field) => {
            const fNameLower = field.fieldName.toLowerCase();
            if (
              fNameLower.includes('state') ||
              fNameLower.includes('district') ||
              fNameLower.includes('pincode')
            ) {
              updates[field.fieldName] = '';
            }
          });
        } else if (fieldNameLower.includes('state')) {
          // Clear district, pincode fields
          adminFields.forEach((field) => {
            const fNameLower = field.fieldName.toLowerCase();
            if (
              fNameLower.includes('district') ||
              fNameLower.includes('pincode')
            ) {
              updates[field.fieldName] = '';
            }
          });
        } else if (fieldNameLower.includes('district')) {
          // Clear pincode fields
          adminFields.forEach((field) => {
            const fNameLower = field.fieldName.toLowerCase();
            if (fNameLower.includes('pincode')) {
              updates[field.fieldName] = '';
            }
          });
        }
      });

      // Pincode dropdown logic (same as UpdateNodalOfficerStep):
      // when a non-"Other" pincode is selected, clear the corresponding "PincodeOther" field
      if (
        fieldNameLower.includes('pincode') &&
        !fieldNameLower.includes('other') &&
        !String(value).toLowerCase().includes('other')
      ) {
        const pincodeOtherFieldName = `${fieldName}Other`;
        updates[pincodeOtherFieldName] = '';
      }

      // When Proof of Identity dropdown changes, clear the Proof of Identity Number field and file
      // because maxLength and format requirements differ between ID types
      if (
        fieldNameLower.includes('proofofidentity') &&
        !fieldNameLower.includes('number')
      ) {
        // Extract admin number from field name (e.g., iauProofOfIdentity1 -> 1)
        const adminMatch = fieldName.match(/(\d+)$/);
        const adminNum = adminMatch ? adminMatch[1] : '';

        const proofNumberFieldName = `iauProofOfIdentityNumber${adminNum}`;

        // Find the POI number field to get its fieldFileName dynamically
        const poiNumberField = userProfileFormFields.find(
          (f) => f.fieldName === proofNumberFieldName
        );
        const proofFileFieldName =
          poiNumberField?.fieldFileName || `${proofNumberFieldName}File`;

        // Clear the proof number field and file when proof type changes
        updates[proofNumberFieldName] = '';
        updates[proofFileFieldName] = null;

        // Clear any validation errors for the proof number and file fields
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[proofNumberFieldName];
          delete newErrors[proofFileFieldName];
          return newErrors;
        });

        // Clear the document from existingDocuments state
        setExistingDocuments((prev) => {
          const newDocs = { ...prev };
          delete newDocs[proofFileFieldName];
          return newDocs;
        });

        // Clear the document data from existingDocumentData state
        setExistingDocumentData((prev) => {
          const newDocData = { ...prev };
          delete newDocData[proofFileFieldName];
          return newDocData;
        });
      }

      return updates;
    });

    // Mark field as touched when dropdown is changed
    if (!touchedFields[fieldName]) {
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    }

    // Validate dropdown selection
    const allFields = extractAllFieldsFromGroupedFields();
    const field = allFields.find((f) => f.fieldName === fieldName);
    const evaluatedRules = field ? evaluateConditionalLogic(field) : undefined;

    if (!value || value === '') {
      // Field is empty - show required error if field is required
      if (evaluatedRules?.required) {
        const requiredMessage =
          evaluatedRules?.requiredMessage ||
          `${field?.fieldLabel || fieldName} is required`;
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: requiredMessage,
        }));
      }
    } else {
      // Clear validation error when a value is selected
      setValidationErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleDateChange = (fieldName: string, value: string | null) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [fieldName]: value,
      };

      // Real-time validation for date fields
      if (value) {
        // Check if this is a DOB field
        const isDobField =
          fieldName.toLowerCase().includes('dob') ||
          fieldName.toLowerCase().includes('dateofbirth');

        if (isDobField) {
          const dateValue = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Calculate age
          let age = today.getFullYear() - dateValue.getFullYear();
          const monthDiff = today.getMonth() - dateValue.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < dateValue.getDate())
          ) {
            age--;
          }

          if (dateValue > today) {
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: 'Date of Birth cannot be in the future',
            }));
          } else if (age < 18) {
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: 'Age must be at least 18 years',
            }));
          } else if (age > 100) {
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: 'Age cannot exceed 100 years',
            }));
          } else {
            setValidationErrors((prevErrors) => {
              const newErrors = { ...prevErrors };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        } else {
          // Clear validation error for non-DOB date fields
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      } else {
        // Field is empty - check if required
        const allFields = extractAllFieldsFromGroupedFields();
        const field = allFields.find((f) => f.fieldName === fieldName);
        const evaluatedRules = field
          ? evaluateConditionalLogic(field)
          : undefined;

        if (evaluatedRules?.required) {
          const requiredMessage =
            evaluatedRules?.requiredMessage ||
            `${field?.fieldLabel || fieldName} is required`;
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: requiredMessage,
          }));
        } else {
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      }

      return updatedData;
    });

    // Mark field as touched
    if (!touchedFields[fieldName]) {
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    }
  };

  const handleCheckboxChange = (fieldName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: checked,
    }));
  };

  const handleGenericChange = (
    fieldName: string,
    value: string | ChangeEvent<HTMLInputElement>
  ) => {
    let newValue = typeof value === 'string' ? value : value.target.value;

    // Restrict to numbers only for CKYC and mobile fields
    if (
      fieldName.toLowerCase().includes('mobile') ||
      fieldName.toLowerCase().includes('ckyc')
    ) {
      // Remove all non-numeric characters
      newValue = newValue.replace(/\D/g, '');
    }

    // Force uppercase for identity proof fields
    if (fieldName.toLowerCase().includes('proofofidentitynumber')) {
      newValue = newValue.toUpperCase();
    }

    // When proof type dropdown changes, clear the corresponding proof number field, file and their errors
    const fieldNameLower = fieldName.toLowerCase();
    if (
      fieldNameLower.includes('proofofidentity') &&
      !fieldNameLower.includes('number')
    ) {
      // Extract admin number from field name (e.g., iauProofOfIdentity1 -> 1)
      const adminMatch = fieldName.match(/(\d+)$/);
      const adminNum = adminMatch ? adminMatch[1] : '';
      const proofNumberFieldName = `iauProofOfIdentityNumber${adminNum}`;

      // Find the POI number field to get its fieldFileName dynamically
      const poiNumberField = userProfileFormFields.find(
        (f) => f.fieldName === proofNumberFieldName
      );
      const proofFileFieldName =
        poiNumberField?.fieldFileName || `${proofNumberFieldName}File`;

      // Clear the proof number field value and file
      setFormData((prev) => ({
        ...prev,
        [proofNumberFieldName]: '',
        [proofFileFieldName]: null,
      }));

      // Clear validation error for proof number and file fields
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[proofNumberFieldName];
        delete newErrors[proofFileFieldName];
        return newErrors;
      });

      // Mark proof number and file fields as not touched so they don't show error immediately
      setTouchedFields((prev) => ({
        ...prev,
        [proofNumberFieldName]: false,
        [proofFileFieldName]: false,
      }));

      // Clear the document from existingDocuments state
      setExistingDocuments((prev) => {
        const newDocs = { ...prev };
        delete newDocs[proofFileFieldName];
        return newDocs;
      });

      // Clear the document data from existingDocumentData state
      setExistingDocumentData((prev) => {
        const newDocData = { ...prev };
        delete newDocData[proofFileFieldName];
        return newDocData;
      });
    }

    handleTextChange(fieldName, newValue);

    // Note: Real-time validation is now handled inside handleTextChange
    // Don't clear errors here as handleTextChange manages validation errors

    // Track mobile/email changes dynamically for all admins
    adminNumbers.forEach((adminNum) => {
      if (
        fieldName.toLowerCase().includes('mobile') &&
        fieldName.endsWith(adminNum)
      ) {
        const hasChanged = newValue !== (originalMobile[adminNum] || '');

        setIsMobileChanged((prev) => ({ ...prev, [adminNum]: hasChanged }));
        if (hasChanged) {
          setIsOtpValidated((prev) => ({ ...prev, [adminNum]: false }));
        }
      } else if (
        fieldName.toLowerCase().includes('email') &&
        fieldName.endsWith(adminNum)
      ) {
        const hasChanged = newValue !== (originalEmail[adminNum] || '');

        setIsEmailChanged((prev) => ({ ...prev, [adminNum]: hasChanged }));
        if (hasChanged) {
          setIsOtpValidated((prev) => ({ ...prev, [adminNum]: false }));
        }
      }
    });
  };

  // Memoize document helper functions to prevent re-renders
  const checkIfFileExists = useCallback(
    (fieldName: string): boolean => {
      const exists = !!existingDocuments[fieldName];
      return exists;
    },
    [existingDocuments]
  );

  const getDocumentData = useCallback(
    (fieldName: string): DocumentData | undefined => {
      return existingDocumentData[fieldName];
    },
    [existingDocumentData]
  );

  const getDocumentId = useCallback(
    (fieldName: string): string => {
      return existingDocuments[fieldName] || '';
    },
    [existingDocuments]
  );

  const renderField = (field: FormField) => {
    const value = formData[field.fieldName] || '';

    const evaluatedValidationRules = evaluateConditionalLogic(field);

    const validationError = validationErrors[field.fieldName];
    const apiFieldError = getFieldError(field.fieldName);

    let fileError = '';
    let apiFileError = '';

    let documentId = '';
    let fileExistsForField = false;

    // Determine if this field is auto-populated and should be disabled
    let adminNumForField: string | null = null;

    // Extract admin number from field name
    // Field names can be like: iauEmail1, iau1AddresLine2, iauCitizenship1
    // We need to find the admin number which appears after 'iau' prefix

    // First, try to match pattern like 'iau1' at the start (e.g., iau1AddresLine2)
    const iauPrefixMatch = field.fieldName.match(/^iau(\d+)/i);
    if (iauPrefixMatch) {
      const extractedNum = iauPrefixMatch[1];
      // Check if this admin number exists in our list
      if (adminNumbers.includes(extractedNum)) {
        adminNumForField = extractedNum;
      } else {
        // Maybe it's a single digit from a longer number
        const lastDigit = extractedNum.slice(-1);
        if (adminNumbers.includes(lastDigit)) {
          adminNumForField = lastDigit;
        }
      }
    }

    // If not found with prefix pattern, try matching at the end (e.g., iauEmail1)
    if (!adminNumForField) {
      const sortedAdminNumbersDesc = [...adminNumbers].sort(
        (a, b) => b.length - a.length || parseInt(b) - parseInt(a)
      );
      for (const num of sortedAdminNumbersDesc) {
        if (field.fieldName.endsWith(num)) {
          adminNumForField = num;
          break;
        }
      }
    }
    const isAutoPopulated =
      adminNumForField &&
      autoPopulatedFields[adminNumForField]?.has(field.fieldName);

    // Check if this field is auto-filled from "Same as" address selection
    const isSameAsAddressField =
      adminNumForField &&
      sameAsAddressFields[adminNumForField]?.has(field.fieldName);

    let shouldDisableField = false;

    // Check if this admin section is read-only based on user role
    // IAU_1 cannot edit Admin 1, IAU_2 cannot edit Admin 2
    if (adminNumForField && isAdminReadOnly(adminNumForField)) {
      shouldDisableField = true;
    }

    // Check if this field is an address field - always disable address fields
    const fieldNameLower = field.fieldName.toLowerCase();
    const isAddressLineField =
      (fieldNameLower.includes('line1') ||
        fieldNameLower.includes('line2') ||
        fieldNameLower.includes('line3') ||
        fieldNameLower.includes('addresline') ||
        fieldNameLower.includes('addressline')) &&
      !fieldNameLower.includes('landline');
    const isAddressField =
      isAddressLineField ||
      (fieldNameLower.includes('country') &&
        !fieldNameLower.includes('countrycode')) ||
      fieldNameLower.includes('state') ||
      fieldNameLower.includes('district') ||
      fieldNameLower.includes('city') ||
      fieldNameLower.includes('pincode') ||
      fieldNameLower.includes('digipin');

    // Always disable address fields (regardless of "Same as" selection)
    // Address fields are populated from "Same as registered/correspondence address" dropdown
    if (isAddressField) {
      shouldDisableField = true;
    }

    // Skip other checks if already disabled by read-only mode
    if (!shouldDisableField) {
      // Auto-populated fields should always be disabled (fields populated by CKYC verification)
      if (isAutoPopulated) {
        shouldDisableField = true;
      }
      // Check if this field belongs to an admin in add mode
      else if (adminNumForField && isAddMode[adminNumForField]) {
        const citizenshipKey = `iauCitizenship${adminNumForField}`;
        const ckycNumberKey = `iauCkycNumber${adminNumForField}`;
        const citizenship = formData[citizenshipKey];

        // Normalize citizenship for comparison (case-insensitive)
        const citizenshipLower = String(citizenship || '').toLowerCase();
        const isIndianCitizen = citizenshipLower === 'indian';

        // Always enable Citizenship
        if (field.fieldName === citizenshipKey) {
          shouldDisableField = false;
        }
        // CKYC Number: Enable if citizenship is empty OR "Indian"
        // Disable ONLY if citizenship is selected AND not "Indian"
        else if (field.fieldName === ckycNumberKey) {
          shouldDisableField = !!(citizenship && !isIndianCitizen);
        }
        // For all other fields
        else {
          if (isIndianCitizen) {
            shouldDisableField = !(isCkycVerified[adminNumForField] || false);
          }
          // If citizenship is not "Indian" but is selected, enable all fields
          else if (citizenship && !isIndianCitizen) {
            shouldDisableField = false;
          }
          // If citizenship is not selected yet, disable all fields
          else {
            shouldDisableField = true;
          }
        }
      }
      // Initially (before clicking "Add New Institution Admin") or in view/edit mode
      // All fields are disabled - viewing existing data
      else {
        shouldDisableField = adminNumForField
          ? !(isAddMode[adminNumForField] || false)
          : false;
      }
    }

    // Debug logging for final disable decision on address fields
    const fieldNameLowerDebug = field.fieldName.toLowerCase();
    const isAddressFieldDebug =
      (fieldNameLowerDebug.includes('line') &&
        !fieldNameLowerDebug.includes('landline')) ||
      (fieldNameLowerDebug.includes('country') &&
        !fieldNameLowerDebug.includes('countrycode')) ||
      fieldNameLowerDebug.includes('state') ||
      fieldNameLowerDebug.includes('district') ||
      fieldNameLowerDebug.includes('city') ||
      fieldNameLowerDebug.includes('pincode');

    if (isAddressFieldDebug) {
      const citizenshipKey = adminNumForField
        ? `iauCitizenship${adminNumForField}`
        : '';
      const citizenshipDebug = adminNumForField
        ? formData[citizenshipKey]
        : undefined;
      const citizenshipLowerDebug = String(
        citizenshipDebug || ''
      ).toLowerCase();
      const isIndianDebug = citizenshipLowerDebug === 'indian';
    }

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

    // Check if this is a "required" type error - only show if field is touched
    // Required errors typically say "required", "Please select...", "Select your...", "Select "
    // But NOT "Enter..." as those are usually format hints (like "Enter last 4 digits of Aadhar")
    const isRequiredError =
      rawError &&
      typeof rawError === 'string' &&
      (rawError.toLowerCase().includes('required') ||
        rawError.toLowerCase().startsWith('please select') ||
        rawError.toLowerCase().startsWith('select your') ||
        rawError.toLowerCase().startsWith('select '));

    const isTouched = touchedFields[field.fieldName];

    // Don't show required error if field has a value (field was auto-populated)
    const hasValue = value !== '' && value !== null && value !== undefined;

    // Don't show required error if:
    // 1. Field hasn't been touched yet, OR
    // 2. Field has a value (was auto-populated or pre-filled)
    const shouldShowError =
      rawError &&
      (isTouched || !isRequiredError) &&
      !(isRequiredError && hasValue);

    const displayError = shouldShowError
      ? typeof rawError === 'string'
        ? rawError
        : JSON.stringify(rawError)
      : undefined;

    // PincodeOther visibility: only show manual pincode field when main pincode is "Other"
    // Note: fieldNameLower is already defined above for address field check
    const isPincodeOtherField =
      fieldNameLower.includes('pincode') && fieldNameLower.includes('other');

    if (isPincodeOtherField) {
      const match = field.fieldName.match(/^(.*)_?Other(\d+)$/i);
      const mainPincodeFieldName = match
        ? `${match[1]}${match[2]}`
        : field.fieldName.replace(/Other/i, '');

      const mainPincodeValue = formData[mainPincodeFieldName];
      const shouldShowOtherField = String(mainPincodeValue || '')
        .toLowerCase()
        .includes('other');

      if (!shouldShowOtherField) {
        return null;
      }
    }

    switch (field.fieldType) {
      case 'textfield': {
        // Add default placeholder for mobile and email fields if not provided
        const fieldNameLowerCase = field.fieldName.toLowerCase();
        const isMobileField = fieldNameLowerCase.includes('mobile');
        const isEmailField = fieldNameLowerCase.includes('email');

        let defaultPlaceholder = field.fieldPlaceholder || '';
        if (!defaultPlaceholder) {
          if (isMobileField) {
            defaultPlaceholder = 'Enter mobile number';
          } else if (isEmailField) {
            defaultPlaceholder = 'Enter email address';
          }
        }

        return (
          <LabeledTextFieldUpdate
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleGenericChange(field.fieldName, newValue)
            }
            onBlur={() => handleBlur(field.fieldName)}
            placeholder={defaultPlaceholder}
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
            regx={evaluatedValidationRules?.regx}
            disabled={shouldDisableField}
            error={!!displayError}
            helperText={displayError}
            type={field.fieldName.includes('website') ? 'url' : 'text'}
          />
        );
      }

      case 'dropdown': {
        let options: { label: string; value: string }[] = [];

        // Special formatting for Country Code dropdown
        const isCountryCodeField = field.fieldName
          .toLowerCase()
          .includes('countrycode');

        // Check if this is a Country dropdown (not CountryCode) - use name for value
        // because conditional logic checks for country name like "India"
        const isCountryField =
          field.fieldName.toLowerCase().includes('country') &&
          !isCountryCodeField;

        // Check if this is an external API dropdown with dynamic options
        if (field.fieldAttributes?.type === 'external_api') {
          // Get options from Redux dropdown data if available
          const dynamicOptions = dropdownData[field.fieldName]?.options || [];
          const isLoading = dropdownData[field.fieldName]?.loading || false;

          if (isLoading) {
            return <div>Loading {field.fieldLabel}...</div>;
          }

          if (dynamicOptions && dynamicOptions.length > 0) {
            options = dynamicOptions;
          } else {
            // Fallback to static options if dynamic ones aren't loaded yet
            options =
              field.fieldOptions?.map((option: any, index: number) => ({
                label:
                  isCountryCodeField && option.name && option.code
                    ? `${option.name} (${option.code})`
                    : option.label || option.name || `Option ${index + 1}`,
                value: isCountryField
                  ? option.name ||
                    option.value ||
                    option.code ||
                    `option_${index}`
                  : option.value ||
                    option.code ||
                    option.isocode ||
                    `option_${index}`,
              })) || [];
          }
        } else {
          // Static dropdown - use fieldOptions, support both {value, label} and {code, name} formats
          options =
            field.fieldOptions?.map((option: any, index: number) => ({
              label:
                isCountryCodeField && option.name && option.code
                  ? `${option.name} (${option.code})`
                  : option.label || option.name || `Option ${index + 1}`,
              value: isCountryField
                ? option.name ||
                  option.value ||
                  option.code ||
                  `option_${index}`
                : option.value ||
                  option.code ||
                  option.isocode ||
                  `option_${index}`,
            })) || [];
        }

        // --- Pincode-specific logic (same as UpdateNodalOfficerStep) ---
        const isPincodeField =
          field.fieldName.toLowerCase().includes('pincode') &&
          !field.fieldName.toLowerCase().includes('other');

        if (isPincodeField) {
          // Ensure "Other" option exists for pincode dropdowns
          const hasOtherOption = options.some(
            (opt) =>
              String(opt.value).toLowerCase() === 'other' ||
              String(opt.label).toLowerCase() === 'other'
          );

          if (!hasOtherOption) {
            options = [...options, { label: 'Other', value: 'Other' }];
          }
        }

        return (
          <LabeledDropDownUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleDropdownChange(field.fieldName, newValue)
            }
            onBlur={() => handleBlur(field.fieldName)}
            options={options}
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={evaluatedValidationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            fieldName={field.fieldName}
            disabled={shouldDisableField}
          />
        );
      }

      case 'date': {
        // For DOB fields, calculate min/max dates for age 18-100
        const isDobField =
          field.fieldName.toLowerCase().includes('dob') ||
          field.fieldName.toLowerCase().includes('dateofbirth');

        let minDateValue: string | undefined;
        let maxDateValue: string | undefined;

        if (isDobField) {
          const today = new Date();
          // Max date: 18 years ago (minimum age 18)
          const maxDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
          );
          // Min date: 100 years ago (maximum age 100)
          const minDate = new Date(
            today.getFullYear() - 100,
            today.getMonth(),
            today.getDate()
          );

          // Fix timezone issue by formatting to YYYY-MM-DD safely
          maxDateValue = maxDate.toLocaleDateString('en-CA'); // → YYYY-MM-DD
          minDateValue = minDate.toLocaleDateString('en-CA'); // → YYYY-MM-DD
        }

        return (
          <LabeledDateUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => handleDateChange(field.fieldName, newValue)}
            onBlur={() => handleBlur(field.fieldName)}
            fieldName={field.fieldName}
            required={evaluatedValidationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            disabled={shouldDisableField}
            minDate={minDateValue}
            maxDate={maxDateValue}
          />
        );
      }

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
            disabled={false}
          />
        );

      case 'textfield_with_image': {
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        const existingDocument = getDocumentData(fileFieldName);
        const fileValidationRules =
          evaluatedValidationRules?.validationFile || evaluatedValidationRules;

        // Check if this is a Proof of Identity Number field
        const isProofOfIdentityNumberField = fieldNameLower.includes(
          'proofofidentitynumber'
        );

        // Get proof type for POI Number fields to include in key
        let proofTypeForKey = '';
        if (isProofOfIdentityNumberField) {
          const adminMatch = field.fieldName.match(/(\d+)$/);
          const adminNum = adminMatch ? adminMatch[1] : '';
          const proofTypeFieldName = `iauProofOfIdentity${adminNum}`;
          proofTypeForKey = String(
            formData[proofTypeFieldName] || ''
          ).toUpperCase();
        }

        // Force re-render when mode changes, document state changes, or POI type changes
        const addModeKey = adminNumbers
          .map((num) => `${isAddMode[num] ? 'add' : 'edit'}${num}`)
          .join('-');
        // Include proofType in key for POI Number fields to force re-render when POI type changes
        const componentKey = isProofOfIdentityNumberField
          ? `${field.id}-${addModeKey}-${proofTypeForKey}-${existingDocument?.id || 'no-doc'}`
          : `${field.id}-${addModeKey}-${existingDocument?.id || 'no-doc'}`;

        // Dynamic maxLength and minLength for Proof of Identity Number based on selected proof type
        let dynamicMaxLength = evaluatedValidationRules?.maxLength
          ? parseInt(evaluatedValidationRules.maxLength)
          : undefined;
        let dynamicMinLength = evaluatedValidationRules?.minLength
          ? parseInt(evaluatedValidationRules.minLength)
          : undefined;

        // Check if this is a Proof of Identity Number field for any admin
        // Note: fieldNameLower is already defined above
        let dynamicRegxMessage: string | undefined;
        let dynamicMinLengthMessage: string | undefined;
        let dynamicMaxLengthMessage: string | undefined;
        let dynamicRegx: string | undefined;

        // Dynamic label for POI Number field based on selected proof type
        let dynamicLabel = field.fieldLabel;

        if (isProofOfIdentityNumberField) {
          // Extract admin number from field name (e.g., iauProofOfIdentityNumber1 -> 1)
          const adminMatch = field.fieldName.match(/(\d+)$/);
          const adminNum = adminMatch ? adminMatch[1] : '';

          // Get the corresponding proof type field value
          const proofTypeFieldName = `iauProofOfIdentity${adminNum}`;
          const proofTypeRaw = String(
            formData[proofTypeFieldName] || ''
          ).toUpperCase();

          // Get validation rules dynamically from formSlice.ts
          const proofValidation = getProofOfIdentityValidation(proofTypeRaw);

          if (proofValidation) {
            dynamicMaxLength = proofValidation.maxLength;
            dynamicMinLength = proofValidation.minLength;
            dynamicRegx = proofValidation.regx;
            dynamicRegxMessage = proofValidation.regxMessage;
            dynamicMinLengthMessage = proofValidation.minLengthMessage;
            dynamicMaxLengthMessage = proofValidation.maxLengthMessage;
          } else {
            dynamicMaxLength = evaluatedValidationRules?.maxLength
              ? parseInt(evaluatedValidationRules.maxLength)
              : undefined;
            dynamicMinLength = evaluatedValidationRules?.minLength
              ? parseInt(evaluatedValidationRules.minLength)
              : undefined;
            dynamicRegx = evaluatedValidationRules?.regx;
            dynamicRegxMessage = evaluatedValidationRules?.regxMessage;
            dynamicMinLengthMessage =
              evaluatedValidationRules?.minLengthMessage;
            dynamicMaxLengthMessage =
              evaluatedValidationRules?.maxLengthMessage;
          }

          // Set dynamic label based on proof type
          if (proofTypeRaw) {
            const formattedProofType = proofTypeRaw
              .split(/[_\s]+/)
              .map(
                (word: string) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ');
            dynamicLabel = `Proof of Identity ${formattedProofType}`;
          }
        }

        return (
          <LabeledTextFieldWithUploadUpdate
            key={componentKey}
            label={dynamicLabel}
            value={value as string}
            onChange={(newValue) =>
              handleGenericChange(field.fieldName, newValue)
            }
            onBlur={() => handleBlur(field.fieldName)}
            onUpload={(file) => handleFileUpload(field.fieldFileName, file)}
            placeholder={field.fieldPlaceholder}
            required={evaluatedValidationRules?.required || false}
            minLength={dynamicMinLength}
            maxLength={dynamicMaxLength}
            minLengthMessage={dynamicMinLengthMessage}
            maxLengthMessage={dynamicMaxLengthMessage}
            regx={dynamicRegx || evaluatedValidationRules?.regx}
            regxMessage={
              dynamicRegxMessage || evaluatedValidationRules?.regxMessage
            }
            error={!!displayError}
            helperText={displayError}
            accept={
              fileValidationRules?.imageFormat
                ?.map((format: any) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={fileValidationRules || undefined}
            disabled={shouldDisableField}
            existingDocument={existingDocument}
            showExistingDocument={!!existingDocument}
            trackStatusShow={false}
            onDelete={
              existingDocument
                ? () => handleDeleteDocument(existingDocument.id)
                : undefined
            }
          />
        );
      }

      case 'textfield_with_verify': {
        // Determine which admin this field belongs to
        const fieldAdminNum = adminNumForField;

        if (!fieldAdminNum) {
          console.warn(
            'Could not determine admin number for field:',
            field.fieldName
          );
          return null;
        }

        const citizenshipKey = `iauCitizenship${fieldAdminNum}`;
        const citizenship = formData[citizenshipKey];
        const isIndianCitizen =
          String(citizenship ?? '').toLowerCase() === 'indian';
        const isVerified = isCkycVerified[fieldAdminNum] || false;
        const ckycNumberKey = `iauCkycNumber${fieldAdminNum}`;
        const isCkycField = field.fieldName === ckycNumberKey;

        // Disable verify button if citizenship is not Indian
        const shouldDisableVerify = isCkycField && !isIndianCitizen;

        // Add default placeholder for mobile and email fields if not provided
        const fieldNameLowerCase = field.fieldName.toLowerCase();
        const isMobileField = fieldNameLowerCase.includes('mobile');
        const isEmailField = fieldNameLowerCase.includes('email');

        let defaultPlaceholder = field.fieldPlaceholder;
        if (!defaultPlaceholder) {
          if (isMobileField) {
            defaultPlaceholder = 'Enter mobile number';
          } else if (isEmailField) {
            defaultPlaceholder = 'Enter email address';
          }
        }

        return (
          <LabeledTextFieldWithVerifyUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) =>
              handleGenericChange(field.fieldName, newValue)
            }
            placeholder={defaultPlaceholder}
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
            externalVerifyUrl={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
            }
            externalVerifyMethod={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.method
            }
            disabled={shouldDisableField}
            verifyDisabled={shouldDisableVerify}
            isPreVerified={isIndianCitizen && isVerified && !!value}
            showVerifyOnlyAfterChange={false}
            onSubmitOtp={async (otp: string) => {
              return true;
            }}
            onOtpVerified={(data: any) => {
              handleCkycVerified(fieldAdminNum)(field, data);
            }}
            onVerify={async () => {
              return true;
            }}
          />
        );
      }

      case 'file': {
        const fileFieldName = field.fieldName || `${field.fieldName}_file`;
        const existingDocument = getDocumentData(fileFieldName);
        // Force re-render only when mode changes or document state changes
        const addModeKey = adminNumbers
          .map((num) => `${isAddMode[num] ? 'add' : 'edit'}${num}`)
          .join('-');
        const componentKey = `${field.id}-${addModeKey}-${existingDocument?.id || 'no-doc'}`;
        return (
          <div>
            <UploadButton
              key={componentKey}
              label={field.fieldLabel}
              onUpload={(file) => handleFileUpload(field.fieldName, file)}
              required={evaluatedValidationRules?.required || false}
              accept={
                (
                  evaluatedValidationRules?.validationFile?.imageFormat ||
                  evaluatedValidationRules?.imageFormat
                )
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              existingDocument={existingDocument}
              showExistingDocument={!!existingDocument}
              onDelete={
                existingDocument
                  ? () => handleDeleteDocument(existingDocument.id)
                  : undefined
              }
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

    // Filter out pincodeOther fields that should be hidden
    const filteredFields = sortedFields.filter((field: FormField) => {
      const fieldNameLower = field.fieldName.toLowerCase();

      const isPincodeOtherField =
        fieldNameLower.includes('pincode') && fieldNameLower.includes('other');

      if (isPincodeOtherField) {
        // Extract main pincode field name using same logic as renderField
        // Pattern: iauPincodeOther1 -> iauPincode1
        const match = field.fieldName.match(/^(.*)_?Other(\d+)$/i);
        const mainPincodeFieldName = match
          ? `${match[1]}${match[2]}`
          : field.fieldName.replace(/Other/i, '');

        const mainPincodeValue = formData[mainPincodeFieldName];

        const shouldShowOtherField = String(mainPincodeValue || '')
          .toLowerCase()
          .includes('other');

        return shouldShowOtherField;
      }

      return true;
    });

    return (
      <ThreeColumnGrid>
        {filteredFields.map((field) => {
          if (field.fieldType === 'checkbox') {
            return (
              <FieldContainer
                key={field.id}
                style={{
                  gridColumn: '1 / -1',
                  width: '100%',
                  minHeight: '59px',
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
    if (Object.entries(groupedFields).length === 0) {
      return null;
    }
    return Object.entries(groupedFields).map(
      ([groupName, fields], groupIndex) => {
        // Extract admin number from group name dynamically
        // e.g., "adminone" -> "1", "admintwo" -> "2", "adminthree" -> "3", etc.
        const adminNumMap: Record<string, string> = {
          one: '1',
          two: '2',
          three: '3',
          four: '4',
          five: '5',
        };

        let adminNum: string | null = null;
        const groupNameLower = groupName.toLowerCase();

        // Try to extract admin number
        for (const [word, num] of Object.entries(adminNumMap)) {
          if (groupNameLower.includes(`admin${word}`)) {
            adminNum = num;
            break;
          }
        }

        // Get validate button config based on admin index
        const adminIndex = adminNum ? parseInt(adminNum) - 1 : -1;
        const validateButtonConfig =
          adminIndex >= 0
            ? configuration?.submissionSettings?.validateGroupButtons?.[
                adminIndex
              ]
            : undefined;

        const isAdminGroup = adminNum !== null;
        const currentIsAddMode = adminNum
          ? isAddMode[adminNum] || false
          : false;

        // Store adminNum in a const for type narrowing
        const adminNumber = adminNum;

        return (
          <UpdateFormAccordion
            key={groupName}
            title={fields?.label}
            groupKey={groupName}
            defaultExpanded={true}
            showAddButton={
              isAdminGroup &&
              !currentIsAddMode &&
              adminNumber !== null &&
              canAddAdmin(adminNumber)
            }
            addButtonLabel={
              adminNumber
                ? `Add New Institution Admin`
                : 'Add New Institution Admin'
            }
            onAddNew={
              adminNumber ? () => handleAddAdmin(adminNumber) : undefined
            }
            isAddMode={currentIsAddMode}
          >
            {renderFieldGroup(fields.fields)}

            {/* Validate button inside accordion when in add mode */}
            {isAdminGroup &&
              currentIsAddMode &&
              adminNumber &&
              validateButtonConfig &&
              validateButtonConfig.validateButton && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
                >
                  <ActionButton
                    onClick={() => handleValidateAdmin(adminNumber)}
                    disabled={
                      (validateButtonDisabled[adminNumber] ?? true) ||
                      !getMobileValue(adminNumber) ||
                      isOtpValidated[adminNumber]
                    }
                  >
                    {validateButtonConfig.validateButtonText}
                  </ActionButton>
                </Box>
              )}
          </UpdateFormAccordion>
        );
      }
    );
  };

  if (loading || !isDataLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          width: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Box>Loading Admin User Details...</Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
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
          saveDisabled={adminNumbers.some((adminNum) => {
            const mobileField = Object.keys(formData).find(
              (key) =>
                key.toLowerCase().includes('mobile') && key.endsWith(adminNum)
            );
            const emailField = Object.keys(formData).find(
              (key) =>
                key.toLowerCase().includes('email') &&
                !key.toLowerCase().includes('mobile') &&
                key.endsWith(adminNum)
            );
            const citizenshipField = `iauCitizenship${adminNum}`;

            // Add mode validations for this admin
            if (isAddMode[adminNum]) {
              const hasContactInfo = !!(
                formData[mobileField || ''] || formData[emailField || '']
              );
              const isIndian =
                String(formData[citizenshipField] ?? '').toLowerCase() ===
                'indian';

              // In Add Mode, require OTP validation if contact info exists
              // AND require CKYC verification if citizenship is Indian
              // Both conditions must be satisfied for the admin to be considered validated
              const otpNotValidated =
                !isOtpValidated[adminNum] && hasContactInfo;
              const ckycNotVerified = isIndian && !isCkycVerified[adminNum];

              // Disable Save if OTP not validated OR CKYC not verified (for Indian)
              return otpNotValidated || ckycNotVerified;
            }

            // Update mode validations for this admin
            return (
              !isAddMode[adminNum] &&
              (isMobileChanged[adminNum] || isEmailChanged[adminNum]) &&
              !isOtpValidated[adminNum]
            );
          })}
          validateDisabled={true}
          clearDisabled={false}
          sx={{ margin: 0, padding: 0 }}
          submissionSettings={configuration?.submissionSettings}
        />
      </Box>

      {/* Dynamic OTP Modals for all admins */}
      {adminNumbers.map((adminNum) => (
        <OTPModalUpdateEntity
          key={`otp-modal-${adminNum}`}
          data={otpIdentifier[adminNum] || ''}
          mobileChange={isMobileChanged[adminNum] || false}
          emailChange={isEmailChanged[adminNum] || false}
          isOpen={isOtpModalOpen[adminNum] || false}
          onClose={() =>
            setIsOtpModalOpen((prev) => ({ ...prev, [adminNum]: false }))
          }
          onOtpSubmit={handleOtpSubmitAdmin(adminNum)}
          countryCode={getCountryCodeValue(adminNum) as string}
          email={getEmailValue(adminNum) as string}
          mobile={getMobileValue(adminNum) as string}
        />
      ))}

      {/* Success Modal for OTP Verification */}
      <SuccessModalUpdate
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successTitle}
        message={successMessage}
        onOkay={() => setIsSuccessModalOpen(false)}
      />
    </Box>
  );
};

export default UpdateAdminUserDetailsStep;
