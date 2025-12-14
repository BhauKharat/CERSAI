/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Grid } from '@mui/material';
import * as yup from 'yup';
import LabeledTextField from './../CommonComponent/LabeledTextField';
import LabeledDropDown from './../CommonComponent/LabeledDropDown';
import LabeledCheckbox from './../CommonComponent/LabeledCheckbox';
import FormActionButtons from './../CommonComponent/ClearAndSaveActions';
import {
  LabeledDate,
  LabeledTextFieldWithUpload,
  UploadButton,
  ReusableButton,
} from './../CommonComponent';
import LabeledTextFieldWithVerify from './../CommonComponent/LabeledTextFieldWithVerify';
import FormAccordion from './../CommonComponent/FormAccordion';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { DropdownOption } from './../types/formTypes';
import { CMS_URL } from 'Constant';
import { useModifiableFields } from 'hooks/useModifiableFields';
// Note: fetchDropdownOptions should be imported from the appropriate slice based on usage

// Helper function to get mobile validation rules based on conditional logic
const getMobileValidationRules = (
  field: FormField,
  isIndianCitizen: boolean,
  formValues: Record<string, any>
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

  // Find the matching conditional logic
  const logics = field.conditionalLogic || [];

  // Find the conditional logic entry (there should be one)
  const conditionalLogic = logics[0];

  if (!conditionalLogic?.when) {
    return null;
  }

  const when = conditionalLogic.when;
  const depVal = formValues[when.field];
  const operator = when.operator || 'equals';
  const values = Array.isArray(when.value) ? when.value : [when.value];

  // Check if the condition matches
  let conditionMatches = false;
  if (operator === 'equals' || operator === 'in') {
    // Handle country code matching - if condition expects "indian" but value is "+91", treat as match
    const normalizedDepVal = String(depVal ?? '').toLowerCase();
    const normalizedValues = values.map((v) => String(v).toLowerCase());

    const directMatch = normalizedValues.includes(normalizedDepVal);
    let countryCodeMatch = false;

    // Check if any condition expects "indian" and value is "+91" (or vice versa)
    if (
      normalizedDepVal === '+91' &&
      normalizedValues.some((v) => v.includes('indian'))
    ) {
      countryCodeMatch = true;
    }
    if (
      normalizedValues.includes('+91') &&
      normalizedDepVal.includes('indian')
    ) {
      countryCodeMatch = true;
    }

    conditionMatches = directMatch || countryCodeMatch;
  }

  // Get rules based on whether condition matches
  const rules = conditionMatches
    ? conditionalLogic.then?.validationRules
    : conditionalLogic.else?.validationRules;

  const result = {
    required: rules?.required,
    minLength: rules?.minLength,
    maxLength: rules?.maxLength,
    pattern: rules?.regx,
    placeholder: isIndianCitizen
      ? 'Enter 10-digit mobile number'
      : 'Enter mobile number (8-15 digits)',
    requiredMessage: rules?.requiredMessage,
    minLengthMessage: rules?.minLengthMessage,
    maxLengthMessage: rules?.maxLengthMessage,
    patternMessage: rules?.regxMessage,
  };

  return result;
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

// Generic interfaces for reusable component
export interface FormField {
  id: number;
  formType: string;
  fieldName: string;
  fieldLabel: string;
  fieldFileName?: string;
  fieldType:
    | 'textfield'
    | 'dropdown'
    | 'checkbox'
    | 'date'
    | 'textfield_with_image'
    | 'textfield_with_verify'
    | 'file';
  fieldPlaceholder: string;
  fieldOptions: Array<{ label: string; value: string }>;
  validationRules: {
    required?: boolean;
    requiredMessage?: string;
    maxLength?: string;
    maxLengthMessage?: string;
    minLength?: string;
    minLengthMessage?: string;
    regx?: string;
    regsMessage?: string;
    regxMessage?: string;
    imageFormat?: string[];
    imageRequired?: boolean;
    imageRequiredMessage?: string;
    size?: string;
    sizeMessage?: string;
    validationFile?: {
      imageFormat?: string[];
      imageRequired?: boolean;
      imageRequiredMessage?: string;
      size?: string;
      sizeMessage?: string;
    };
  } | null;
  fieldOrder: number;
  isRequired: boolean;
  isActive: boolean;
  fieldWidth: string;
  defaultValue: any;
  helpText: string | null;
  languageSlug: string;
  fieldGroup: string;
  conditionalLogic: Array<{
    when: {
      field: string;
      operator: string;
      value: string | null;
    };
    then?: {
      validationRules?: any;
      fieldAttributes?: {
        type: string;
        trigger: string;
        url: string;
        method: string;
        headers: Record<string, any>;
        urlData: string;
        payloadTemplate: Record<string, any>;
        responseMapping: {
          label: string;
          value: string;
        };
        description: string;
        autoPopulate: string[];
      };
    };
    else?: {
      validationRules?: any;
      fieldAttributes?: {
        type: string;
        trigger: string;
        url: string;
        method: string;
        headers: Record<string, any>;
        urlData: string;
        payloadTemplate: Record<string, any>;
        responseMapping: {
          label: string;
          value: string;
        };
        description: string;
        autoPopulate: string[];
      };
    };
  }> | null;
  cssClasses: string | null;
  fieldAttributes: {
    type?: string;
    trigger?: string;
    url?: string;
    method?: string;
    headers?: Record<string, any>;
    urlData?: string;
    payloadTemplate?: Record<string, any>;
    responseMapping?: {
      label: string;
      value: string;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormConfiguration {
  id: number;
  formType: string;
  formTitle: string;
  formSubtitle: string;
  formDescription: string;
  submitButtonText: string;
  successMessage: string;
  errorMessage: string;
  redirectUrl: string;
  formSettings: {
    formGroup: boolean;
    showProgress: boolean;
    enableCaptcha: boolean;
  };
  validationSettings: {
    validateOnBlur: boolean;
    showErrorsInline: boolean;
  };
  submissionSettings: {
    clearButton?: boolean;
    clearButtonText?: string;
    submitButton?: boolean;
    submitButtonText?: string;
    validateIsGroup?: boolean;
    validateButton?: boolean;
    validateButtonText?: string;
    emailNotification?: boolean;
    webhookUrl?: string;
  };
  isActive: boolean;
  languageSlug: string;
  formLayout: string;
  formTheme: string;
  allowMultipleSubmissions: boolean;
  requiresAuthentication: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: FormField[];
  };
}

export interface FormValues {
  [key: string]: string | boolean | File | null;
}

export interface FieldError {
  field: string;
  message: string;
}

// Props interface for the reusable component
interface TrackStatusDynamicExpandCollapseFormProps {
  // Data props
  groupedFields: GroupedFields;
  configuration: FormConfiguration | null;
  formValues: FormValues;

  // Additional props for dependent dropdown support
  dispatch?: any; // Redux dispatch function
  fields?: FormField[]; // Flattened fields array for dependent dropdown logic
  fetchDropdownOptionsAction?: any; // The specific fetchDropdownOptions action to use
  clearDependentFieldOptions?: any; // Action to clear dependent field options

  // Section validation props
  onValidateSection?: (sectionName: string, sectionIndex: number) => void;
  verifiedSections?: Set<string>;
  sectionDataHashes?: Record<string, string>;

  // Redux actions
  updateFormValue: (payload: {
    fieldName: string;
    value: string | File | null | boolean;
  }) => void;
  setFieldError: (payload: { field: string; message: string }) => void;
  clearFieldError: (field: string) => void;
  clearForm: () => void;
  copySectionValues?: (payload: {
    fromSection: string;
    toSection: string;
  }) => void;
  clearSectionValues?: (sectionPrefix: string) => void;

  // Validation
  validationSchema: yup.ObjectSchema<Record<string, unknown>> | null;
  validationErrors: Record<string, string>;
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;

  // Callbacks
  onSave?: (formData: Record<string, unknown>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onEdit?: () => void;

  // Special behaviors
  specialCheckboxHandlers?: {
    [fieldName: string]: (checked: boolean) => void;
  };

  // Custom field disabled logic
  getFieldDisabled?: (field: FormField) => boolean;

  // Clear key for resetting components
  clearKey: number;
  setClearKey: React.Dispatch<React.SetStateAction<number>>;

  setIsEditMode?: React.Dispatch<React.SetStateAction<boolean>>;

  setEditableGroup?: React.Dispatch<React.SetStateAction<string | null>>;

  // Document preview props
  existingDocuments?: Record<string, unknown>;
  documentFieldMapping?: Record<string, string>;

  // Loading state for form submission
  loading?: boolean;
}

const TrackStatusDynamicExpandCollapseForm: React.FC<
  TrackStatusDynamicExpandCollapseFormProps
> = ({
  groupedFields,
  configuration,
  formValues,
  dispatch,
  fields,
  fetchDropdownOptionsAction,
  clearDependentFieldOptions,
  onValidateSection,
  verifiedSections = new Set(),
  sectionDataHashes = {},
  updateFormValue,
  setFieldError,
  clearFieldError,
  clearForm,
  validationSchema,
  validationErrors,
  setValidationErrors,
  onEdit,
  onSave,
  onNext,
  onPrevious,
  specialCheckboxHandlers,
  getFieldDisabled,
  clearKey,
  setClearKey,
  setIsEditMode,
  setEditableGroup,
  existingDocuments,
  documentFieldMapping,
  loading = false,
}) => {
  // Get auth state for workflowId and userId
  const authState = useSelector((state: any) => state.auth);
  const workflowId = authState?.workflowId;
  const userId = authState?.userDetails?.userId;

  // State to track auto-populated fields and their original values
  // Fields are stored with admin prefix: "admin1_fieldName" or "admin2_fieldName"
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(
    new Set()
  );
  const [ckycVerifiedValue, setCkycVerifiedValue] = useState<
    Record<number, string>
  >({});
  const [citizenshipVerifiedValue, setCitizenshipVerifiedValue] = useState<
    Record<number, string>
  >({});
  // Track which admins had CKYC changed to show validation errors only on change
  const [ckycChangedAdmin, setCkycChangedAdmin] = useState<Set<number>>(
    new Set()
  );

  const { isModifiableField } = useModifiableFields();

  // Monitor CKYC and citizenship changes to reset auto-populated fields
  // useEffect(() => {
  //   const currentCkycValue = String(formValues['hoiCkycNo'] || '');
  //   const currentCitizenshipValue = String(formValues['citizenship'] || '');

  //   // If CKYC number changed from verified value, reset auto-populated fields
  //   if (ckycVerifiedValue && currentCkycValue !== ckycVerifiedValue) {
  //     console.log('🔄 CKYC number changed, resetting auto-populated fields');
  //     setAutoPopulatedFields(new Set());
  //     setCkycVerifiedValue('');
  //     setCitizenshipVerifiedValue('');
  //   }

  //   // If citizenship changed from verified value, reset auto-populated fields
  //   if (
  //     citizenshipVerifiedValue &&
  //     currentCitizenshipValue !== citizenshipVerifiedValue
  //   ) {
  //     console.log('🔄 Citizenship changed, resetting auto-populated fields');
  //     setAutoPopulatedFields(new Set());
  //     setCkycVerifiedValue('');
  //     setCitizenshipVerifiedValue('');
  //   }
  // }, [
  //   formValues,
  //   ckycVerifiedValue,
  //   citizenshipVerifiedValue,
  //   setCkycVerifiedValue,
  //   setCitizenshipVerifiedValue,
  //   setAutoPopulatedFields,
  // ]);

  const activeGroupName = useMemo(() => {
    if (
      formValues.iauCkycNumber1 ||
      formValues.iauFirstName1 ||
      formValues.iauCitizenship1
    ) {
      return 'admin_one';
    }
    if (
      formValues.iauCkycNumber2 ||
      formValues.iauFirstName2 ||
      formValues.iauCitizenship2
    ) {
      return 'admin_two';
    }
    return ''; // fallback
  }, [formValues]);

  useEffect(() => {
    const lowerGroup = (activeGroupName || '').toLowerCase(); // optional: pass current group name if available

    // --- Detect Admin One / Admin Two ---
    const isAdminOne =
      lowerGroup.includes('admin_one') ||
      lowerGroup.includes('admin1') ||
      lowerGroup.includes('admin-one') ||
      lowerGroup.includes('adminone');

    const isAdminTwo =
      lowerGroup.includes('admin_two') ||
      lowerGroup.includes('admin2') ||
      lowerGroup.includes('admin-two') ||
      lowerGroup.includes('admintwo');

    // --- Admin index ---
    const adminIndex = isAdminOne ? 1 : isAdminTwo ? 2 : 1;

    // --- Use dynamic field keys ---
    const ckycField = adminIndex === 1 ? 'iauCkycNumber1' : 'iauCkycNumber2';
    const citizenshipField =
      adminIndex === 1 ? 'iauCitizenship1' : 'iauCitizenship2';

    const currentCkycValue = String(formValues[ckycField] || '');
    const currentCitizenshipValue = String(formValues[citizenshipField] || '');

    // Helper function to reset admin's auto-populated fields
    const resetAdminFields = () => {
      const newAutoPopulated = new Set(autoPopulatedFields);
      newAutoPopulated.forEach((field) => {
        if (field.startsWith(`admin${adminIndex}_`)) {
          newAutoPopulated.delete(field);
        }
      });
      setAutoPopulatedFields(newAutoPopulated);
      setCkycVerifiedValue((prev) => ({ ...prev, [adminIndex]: '' }));
      setCitizenshipVerifiedValue((prev) => ({ ...prev, [adminIndex]: '' }));
    };

    // Check if this admin has verified CKYC fields
    const hasVerifiedCkyc = Array.from(autoPopulatedFields).some((field) =>
      field.startsWith(`admin${adminIndex}_`)
    );

    // --- Reset logic ---
    // Only reset auto-populated fields if CKYC number itself changes
    if (
      ckycVerifiedValue[adminIndex] &&
      currentCkycValue !== ckycVerifiedValue[adminIndex]
    ) {
      resetAdminFields();
    }

    // Note: We do NOT reset when citizenship changes. Auto-populated fields
    // should remain disabled even when switching Indian <-> Other <-> Indian
    // This allows the previously verified CKYC data to persist.
  }, [
    formValues,
    ckycVerifiedValue,
    citizenshipVerifiedValue,
    autoPopulatedFields,
    activeGroupName,
  ]);

  // Helper function to check if a field should be disabled
  // const isFieldAutoPopulated = useCallback(
  //   (fieldName: string) => {
  //     return autoPopulatedFields.has(fieldName);
  //   },
  //   [autoPopulatedFields]
  // );

  const isFieldAutoPopulated = useCallback(
    (fieldName: string, groupName?: string) => {
      const lowerGroup = (groupName || '').toLowerCase();

      // --- Determine admin index ---
      const isAdminOne = ['adminone', 'admin_one', 'admin1', 'admin-one'].some(
        (v) => lowerGroup.includes(v)
      );
      const isAdminTwo = ['admintwo', 'admin_two', 'admin2', 'admin-two'].some(
        (v) => lowerGroup.includes(v)
      );

      // Disable correspondence address fields when "Same as registered address" is checked
      // But exclude the checkbox itself (sameAsCorrespondenceAddress) from being disabled
      if (
        fieldName.includes('correspondence') &&
        fieldName !== 'sameAsCorrespondenceAddress'
      ) {
        if (
          formValues.sameAsCorrespondenceAddress === true ||
          formValues.sameAsCorrespondenceAddress === 'true'
        ) {
          return true;
        } else {
          return false;
        }
      }

      let adminIndex = 0;
      if (isAdminOne) adminIndex = 1;
      else if (isAdminTwo) adminIndex = 2;
      else return false; // not an admin field

      // --- Check if field is explicitly marked as auto-populated (for address fields) ---
      const adminPrefixedKey = `${groupName}_${fieldName}`;
      if (autoPopulatedFields.has(adminPrefixedKey)) {
        return true; // Field is auto-populated from office address selection
      }

      // --- Admin-specific citizenship ---
      const citizenshipField = `iauCitizenship${adminIndex}`;
      const rawCitizenship = String(formValues[citizenshipField] || '')
        .trim()
        .toLowerCase();
      const isIndianCitizen =
        adminIndex === 1
          ? ['indian', 'india', 'in', '+91'].some((v) =>
              rawCitizenship.includes(v)
            )
          : ['indian', 'india', 'in'].some((v) => rawCitizenship.includes(v)); // admin two can have different logic if needed

      // --- Admin-specific CKYC ---
      const ckycField = `iauCkycNumber${adminIndex}`;
      // Check if this specific admin's CKYC is verified using admin-prefixed key
      const adminPrefixedCkycKey = `admin${adminIndex}_${ckycField}`;
      const isCkycVerified = autoPopulatedFields.has(adminPrefixedCkycKey);

      const lowerField = fieldName.toLowerCase();

      // --- Name & Contact fields ---
      const nameFields = [
        `iautitle${adminIndex}`,
        `iaufirstname${adminIndex}`,
        `iaumiddlename${adminIndex}`,
        `iaulastname${adminIndex}`,
        `iaugender${adminIndex}`,
      ];
      const contactFields = [
        `iauemail${adminIndex}`,
        `iaucountrycode${adminIndex}`,
        `iaumobilenumber${adminIndex}`,
        `iaudesignation${adminIndex}`,
        `iaulandlinenumber${adminIndex}`,
        `iauofficeaddress${adminIndex}`,
        `iauproofofidentity${adminIndex}`,
        `iauproofofidentitynumber${adminIndex}`,
        `iaudateofauthorization${adminIndex}`,
        `iauauthorizationletter${adminIndex}`,
        `iaudob${adminIndex}`,
        `iauemploycode${adminIndex}`,
      ];

      const isNameField = nameFields.includes(lowerField);
      const isContactField = contactFields.includes(lowerField);
      const isCkycField = lowerField.includes('ckyc');
      const isCitizenshipField = lowerField.includes('citizen');

      // --- Admin-specific rules ---
      if (adminIndex === 1) {
        // Admin One
        if (isIndianCitizen && isCkycVerified) return isNameField; // lock only name fields
        if (isIndianCitizen && !isCkycVerified) {
          if (isCitizenshipField || isCkycField) return false;
          return true; // disable all other fields until CKYC is verified
        }
        if (!isIndianCitizen) return false; // all fields enabled when not Indian citizen
      }

      if (adminIndex === 2) {
        // Admin Two
        if (isIndianCitizen && isCkycVerified) return isNameField; // lock only name fields (same as Admin One)
        if (isIndianCitizen && !isCkycVerified) {
          if (isCitizenshipField || isCkycField) return false;
          return true; // disable all other fields until CKYC is verified
        }
        if (!isIndianCitizen) return false; // all fields enabled when not Indian citizen
      }

      return false;
    },
    [formValues, autoPopulatedFields]
  );

  // ===== VALIDATION FUNCTIONS =====
  // Validate individual field on change
  const validateField = useCallback(
    async (fieldName: string, value: string | boolean | null) => {
      if (!validationSchema) return;

      try {
        await validationSchema.validateAt(fieldName, { [fieldName]: value });
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          setValidationErrors((prev) => ({
            ...prev,
            [fieldName]: (error as yup.ValidationError).message,
          }));
        }
      }
    },
    [validationSchema, setValidationErrors]
  );

  // ===== UTILITY FUNCTIONS =====
  // Generate hash of section data to detect changes
  const generateSectionDataHash = useCallback(
    (sectionFields: FormField[]) => {
      const sectionData = sectionFields.reduce(
        (acc, field) => {
          const value = formValues[field.fieldName];
          acc[field.fieldName] = value instanceof File ? value.name : value;
          return acc;
        },
        {} as Record<string, any>
      );
      return JSON.stringify(sectionData);
    },
    [formValues]
  );

  // Check if section data has changed since verification
  const hasSectionDataChanged = useCallback(
    (sectionName: string, sectionFields: FormField[]) => {
      const currentHash = generateSectionDataHash(sectionFields);
      const originalHash = sectionDataHashes[sectionName];
      return originalHash && currentHash !== originalHash;
    },
    [generateSectionDataHash, sectionDataHashes]
  );

  // ===== EVENT HANDLERS =====
  // Handle form field changes - NO validation on typing
  // const handleFieldChange = useCallback(
  //   (fieldName: string, value: string | File | null) => {
  //     updateFormValue({ fieldName, value });

  //     // Always clear validation errors when user makes changes
  //     setValidationErrors((prev) => {
  //       const newErrors = { ...prev };
  //       delete newErrors[fieldName];

  //       // For textfield_with_image fields, clear related field errors
  //       // Check if this is a file field (ends with common patterns or is a fieldFileName)
  //       if (fieldName.endsWith('_file') || fieldName.includes('File')) {
  //         delete newErrors[fieldName];
  //         // Try to find and clear the main field error (remove common file suffixes)
  //         const mainFieldName = fieldName
  //           .replace(/_file$/i, '')
  //           .replace(/file$/i, '');
  //         delete newErrors[mainFieldName];
  //       } else {
  //         // If this is a main field, also clear potential file field errors
  //         // Try common file field patterns
  //         delete newErrors[`${fieldName}_file`];
  //         delete newErrors[`${fieldName}File`];
  //       }

  //       return newErrors;
  //     });
  //   },
  //   [updateFormValue, setValidationErrors]
  // );

  const handleFieldChange = useCallback(
    (
      fieldName: string,
      value: string | File | null,
      iauProofOfIdentityValue?: string
    ) => {
      const isFile = value instanceof File;

      // --- 0️⃣ Handle CKYC number field changes BEFORE updating form state ---
      if (
        /ckycnumber|ckycno/i.test(fieldName) &&
        typeof value === 'string' &&
        value.trim()
      ) {
        // Determine admin index from field name
        let adminIndex = 0;
        if (
          fieldName.includes('1') ||
          fieldName.toLowerCase().includes('admin1')
        ) {
          adminIndex = 1;
        } else if (
          fieldName.includes('2') ||
          fieldName.toLowerCase().includes('admin2')
        ) {
          adminIndex = 2;
        }

        if (adminIndex > 0) {
          // Determine citizenship dynamically for this admin
          const citizenshipField =
            adminIndex === 1 ? 'iauCitizenship1' : 'iauCitizenship2';
          const citizenshipValue = String(formValues[citizenshipField] || '')
            .trim()
            .toLowerCase();

          const isIndianCitizen = ['indian', 'india', 'in', '+91'].some((v) =>
            citizenshipValue.includes(v)
          );

          if (isIndianCitizen) {
            // Define dependent fields for this admin
            const dependentFields = [
              `iauTitle${adminIndex}`,
              `iauFirstName${adminIndex}`,
              `iauMiddleName${adminIndex}`,
              `iauLastName${adminIndex}`,
              `iauGender${adminIndex}`,
            ];

            // Clear their values in Redux immediately
            dependentFields.forEach((fieldName) => {
              dispatch(updateFormValue({ fieldName, value: '' }));
            });

            // Remove them from autoPopulatedFields so they become editable
            setAutoPopulatedFields((prev) => {
              const updated = new Set(prev);

              // Remove CKYC field itself
              const ckycField = `iauCkycNumber${adminIndex}`;
              updated.delete(ckycField);
              updated.delete(`admin${adminIndex}_${ckycField}`);

              // Remove dependent fields
              dependentFields.forEach((f) => {
                updated.delete(f);
                updated.delete(`admin${adminIndex}_${f}`);
              });
              return updated;
            });

            // Clear any existing validation errors for these fields
            // Don't set new errors until user attempts verification or submission
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              dependentFields.forEach((fieldName) => {
                delete newErrors[fieldName];
              });
              return newErrors;
            });

            // Mark this admin as having CKYC changed (to show validation errors)
            setCkycChangedAdmin((prev) => new Set([...prev, adminIndex]));

            // Reset verified values for this admin
            setCkycVerifiedValue((prev) => ({ ...prev, [adminIndex]: '' }));
            setCitizenshipVerifiedValue((prev) => ({
              ...prev,
              [adminIndex]: '',
            }));
          }
        }
      }

      // Update value in form state
      updateFormValue({ fieldName, value });

      // --- 1️⃣ Clear related validation errors ---
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];

        // Clear paired field errors (text <-> file)
        if (
          fieldName.endsWith('_file') ||
          fieldName.toLowerCase().includes('file')
        ) {
          const mainField = fieldName
            .replace(/_file$/i, '')
            .replace(/file$/i, '');
          delete newErrors[mainField];
        } else {
          delete newErrors[`${fieldName}_file`];
          delete newErrors[`${fieldName}File`];
        }

        return newErrors;
      });

      // --- 2️⃣ Run validation dynamically ---
      const fieldDef = fields?.find((f) => f.fieldName === fieldName);
      if (!fieldDef) {
        console.warn(`⚠️ Field definition not found for: ${fieldName}`);
        console.warn(
          `⚠️ Available fields:`,
          fields?.map((f) => f.fieldName)
        );
        return;
      }
      if (!fieldDef?.validationRules) {
        console.warn(`⚠️ No validation rules for: ${fieldName}`);
        return;
      }

      let rules = fieldDef.validationRules;
      const fileRules = rules?.validationFile;
      let errorMessage: string | null = null;

      // Check if this is a mobile number field with conditional logic
      const isMobileField = /(mobile|phone)/i.test(fieldName);

      if (isMobileField && fieldDef.conditionalLogic) {
        // Determine citizenship for mobile validation
        let citizenshipValue = '';

        // Determine which citizenship field to check based on admin index
        let adminIndex = 0;
        if (
          fieldName.includes('1') ||
          fieldName.toLowerCase().includes('admin1')
        ) {
          adminIndex = 1;
        } else if (
          fieldName.includes('2') ||
          fieldName.toLowerCase().includes('admin2')
        ) {
          adminIndex = 2;
        }

        const citizenshipField =
          adminIndex === 1
            ? 'iauCitizenship1'
            : adminIndex === 2
              ? 'iauCitizenship2'
              : 'citizenship';

        citizenshipValue = String(
          formValues[citizenshipField] || ''
        ).toLowerCase();
        const isIndianCitizen = ['indian', 'india', 'in', '+91'].some((v) =>
          citizenshipValue.includes(v)
        );

        // Get mobile validation rules from conditional logic
        const mobileRules = getMobileValidationRules(
          fieldDef,
          isIndianCitizen,
          formValues
        );

        // Override rules with mobile-specific rules from conditional logic
        if (mobileRules && mobileRules.pattern) {
          rules = {
            ...rules,
            regx: mobileRules.pattern,
            regxMessage: mobileRules.patternMessage,
            required: mobileRules.required,
            requiredMessage: mobileRules.requiredMessage,
            minLength: mobileRules.minLength,
            minLengthMessage: mobileRules.minLengthMessage,
            maxLength: mobileRules.maxLength,
            maxLengthMessage: mobileRules.maxLengthMessage,
          };
        }
      }

      // Document-type specific regex overrides (run before validation)
      let regx = rules?.regx;
      let regxMessage = rules?.regxMessage;
      if (
        fieldName === 'iauProofOfIdentityNumber1' ||
        fieldName === 'iauProofOfIdentityNumber2'
      ) {
        const iauProofOfIdentityKey =
          fieldName === 'iauProofOfIdentityNumber1'
            ? 'iauProofOfIdentity1'
            : 'iauProofOfIdentity2';
        let iauProofOfIdentity: string =
          iauProofOfIdentityValue ||
          (formValues[iauProofOfIdentityKey] as string);
        if (iauProofOfIdentity) {
          iauProofOfIdentity = iauProofOfIdentity.toUpperCase();
        }
        switch (iauProofOfIdentity) {
          case 'AADHAAR':
            regx = '^[0-9]{12}$';
            regxMessage = 'Aadhaar must be 12 digits';
            break;
          case 'DRIVING LICENSE':
            regx = '^[A-Z]{2}[ -]?[0-9]{2}[0-9A-Z]{11,13}$';
            regxMessage =
              'Invalid Driving License format (e.g., MH1420110062821)';
            break;
          case 'PAN CARD':
            regx = '^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$';
            regxMessage =
              'Invalid PAN format (4th character must be P, e.g., AAAPA1234A)';
            break;
          case 'PASSPORT':
            regx = '^[A-Z]{1}[0-9]{7}$';
            regxMessage = 'Invalid Passport number (e.g., A1234567)';
            break;
          case 'VOTER ID':
            regx = '^[A-Z]{3}[0-9]{7}$';
            regxMessage = 'Invalid Voter ID format (e.g., ABC1234567)';
            break;
          default:
            regx = '';
            regxMessage = '';
        }

        rules = { ...rules, regx, regxMessage };
      }

      console.log('regx', rules?.regx, rules?.regxMessage, rules);

      // ✅ Text validation (Employee Code, Mobile, etc.)
      if (typeof value === 'string') {
        if (rules?.required && !value.trim()) {
          errorMessage = rules.requiredMessage || 'This field is required';
        } else if (value.trim()) {
          // Check minLength constraint
          if (rules?.minLength) {
            const minLen = parseInt(rules.minLength);
            if (value.length < minLen) {
              errorMessage =
                rules.minLengthMessage ||
                `Minimum ${minLen} characters required`;
            }
          }

          // Check maxLength constraint
          if (!errorMessage && rules?.maxLength) {
            const maxLen = parseInt(rules.maxLength);
            if (value.length > maxLen) {
              errorMessage =
                rules.maxLengthMessage ||
                `Maximum ${maxLen} characters allowed`;
            }
          }

          // Check regex pattern
          if (!errorMessage && rules?.regx) {
            try {
              const regexPattern = new RegExp(rules.regx);
              const isValid = regexPattern.test(value);
              if (!isValid) {
                errorMessage = rules.regxMessage || 'Invalid format';
              }
            } catch (e) {
              console.error(
                `❌ Invalid regex pattern for ${fieldName}:`,
                rules.regx,
                e
              );
            }
          }
        }
      }

      // ✅ File validation (size, format)
      if (value instanceof File && fileRules) {
        const allowedFormats = fileRules.imageFormat || ['jpeg', 'png', 'jpg'];
        const maxSizeMb = parseFloat(fileRules.size?.replace('kb', '') || '1');
        const fileExt = value.name.split('.').pop()?.toLowerCase();

        if (!fileExt || !allowedFormats.includes(fileExt)) {
          errorMessage = `Only ${allowedFormats.join(', ')} formats allowed`;
        } else if (value.size > maxSizeMb * 1024) {
          errorMessage =
            fileRules.sizeMessage || `File must be ≤ ${fileRules.size}`;
        }
      }

      // --- 3️⃣ Apply validation error if needed ---
      if (errorMessage) {
        setFieldError({
          field: fieldName,
          message: errorMessage,
        });
        // Also set in validationErrors state for immediate display
        setValidationErrors(
          (prev: Record<string, string>): Record<string, string> => {
            return {
              ...prev,
              [fieldName]: errorMessage as string,
            };
          }
        );
      } else {
        clearFieldError(fieldName);
        // Also clear from validationErrors state
        setValidationErrors(
          (prev: Record<string, string>): Record<string, string> => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          }
        );
      }
    },
    [
      updateFormValue,
      setValidationErrors,
      setFieldError,
      clearFieldError,
      fields,
      formValues,
      dispatch,
    ]
  );

  // Handle basic field value changes (for non-file fields)
  const handleBasicFieldChange = useCallback(
    (fieldName: string, value: string | boolean) => {
      updateFormValue({ fieldName, value });
      validateField(fieldName, value);
    },
    [updateFormValue, validateField]
  );

  // Handle dropdown changes with dependent dropdown support
  const handleDropdownChange = useCallback(
    async (field: FormField, value: string) => {
      const selectedOption = field?.fieldOptions?.find((opt) => {
        console.log('opt', opt);
        return opt.value === value;
      });

      handleBasicFieldChange(field.fieldName, value);

      if (
        field.fieldName === 'iauProofOfIdentity1' ||
        field.fieldName === 'iauProofOfIdentity2'
      ) {
        const fname =
          field.fieldName === 'iauProofOfIdentity1'
            ? 'iauProofOfIdentityNumber1'
            : 'iauProofOfIdentityNumber2';
        const fvalue = formValues[fname];
        if (fvalue !== '' && fvalue !== undefined && fvalue !== null) {
          handleFieldChange(fname, fvalue as string, value);
        }
      }

      // Handle IAU office address autofill
      if (
        (field.fieldName === 'iauOfficeAddress1' ||
          field.fieldName === 'iauOfficeAddress2') &&
        value &&
        value.trim() !== ''
      ) {
        const trimmedValue = value.trim().toLowerCase();
        let sourcePrefix = '';

        if (trimmedValue.includes('register')) {
          sourcePrefix = 'register';
        } else if (trimmedValue.includes('correspondence')) {
          sourcePrefix = 'correspondence';
        } else {
          console.log(`🏢 No match found for value: "${value}"`);
        }

        const adminIndex = field.fieldName === 'iauOfficeAddress1' ? 1 : 2;
        const groupName = adminIndex === 1 ? 'adminone' : 'admintwo';

        // Clear previously auto-populated address fields for this admin
        const addressFieldsToReset = [
          `iauAddresLine${adminIndex === 1 ? 'One' : 'Two'}1`,
          `iauAddresLine${adminIndex === 1 ? 'One' : 'Two'}2`,
          `iauAddresLine${adminIndex === 1 ? 'One' : 'Two'}3`,
          `iauCity${adminIndex}`,
          `iauCountry${adminIndex}`,
          `iauState${adminIndex}`,
          `iauDistrict${adminIndex}`,
          `iauPincode${adminIndex}`,
          `iauPincodeOther${adminIndex}`,
        ];

        setAutoPopulatedFields((prev) => {
          const updated = new Set(prev);
          addressFieldsToReset.forEach((fieldName) => {
            updated.delete(`${groupName}_${fieldName}`);
          });
          return updated;
        });

        // Fetch address data from the addresses step via API
        if (sourcePrefix) {
          if (workflowId && userId) {
            // Fetch address details from API
            Secured.get(
              `/api/v1/registration/step-data?stepKey=addresses&workflowId=${workflowId}&userId=${userId}`
            )
              .then((response) => {
                const addressData = response.data?.data?.data?.step?.data;

                if (addressData) {
                  // Field mappings - only copy text fields, not dropdowns
                  const adminText = adminIndex === 1 ? 'One' : 'Two';
                  const textFieldMappings = [
                    {
                      source: `${sourcePrefix}Line1`,
                      target: `iauAddresLine${adminText}1`,
                    },
                    {
                      source: `${sourcePrefix}Line2`,
                      target: `iauAddresLine${adminText}2`,
                    },
                    {
                      source: `${sourcePrefix}Line3`,
                      target: `iauAddresLine${adminText}3`,
                    },
                    {
                      source: `${sourcePrefix}City`,
                      target: `iauCity${adminIndex}`,
                    },
                  ];

                  // Dropdown field mappings - copy values and trigger dependent dropdowns
                  const dropdownFieldMappings = [
                    {
                      source: `${sourcePrefix}Country`,
                      target: `iauCountry${adminIndex}`,
                    },
                    {
                      source: `${sourcePrefix}State`,
                      target: `iauState${adminIndex}`,
                    },
                    {
                      source: `${sourcePrefix}District`,
                      target: `iauDistrict${adminIndex}`,
                    },
                    {
                      source: `${sourcePrefix}Pincode`,
                      target: `iauPincode${adminIndex}`,
                    },
                    {
                      source: `${sourcePrefix}PincodeOther`,
                      target: `iauPincodeOther${adminIndex}`,
                    },
                  ];

                  // Copy text fields immediately
                  textFieldMappings.forEach(({ source, target }) => {
                    const sourceValue = addressData[source];
                    if (
                      sourceValue !== undefined &&
                      sourceValue !== null &&
                      sourceValue !== ''
                    ) {
                      if (dispatch && updateFormValue) {
                        dispatch(
                          updateFormValue({
                            fieldName: target,
                            value: String(sourceValue),
                          })
                        );

                        // Mark field as auto-populated to disable it
                        setAutoPopulatedFields((prev) => {
                          const updated = new Set(prev);
                          const groupName =
                            adminIndex === 1 ? 'adminone' : 'admintwo';
                          updated.add(`${groupName}_${target}`);
                          return updated;
                        });
                      }
                    } else {
                      console.log(
                        `⚠️ Source field ${source} not found or empty in addressData`
                      );
                    }
                  });

                  // Copy dropdown fields sequentially with delays to allow dependent dropdowns to load
                  const delay = 500;
                  dropdownFieldMappings.forEach(({ source, target }, index) => {
                    const sourceValue = addressData[source];
                    if (
                      sourceValue !== undefined &&
                      sourceValue !== null &&
                      sourceValue !== ''
                    ) {
                      setTimeout(
                        () => {
                          // Find the target field to trigger handleDropdownChange
                          const targetField = fields?.find(
                            (f: FormField) => f.fieldName === target
                          );
                          if (targetField) {
                            // Use handleBasicFieldChange to avoid recursive calls
                            handleBasicFieldChange(target, String(sourceValue));

                            // Mark dropdown field as auto-populated to disable it
                            setAutoPopulatedFields((prev) => {
                              const updated = new Set(prev);
                              const groupName =
                                adminIndex === 1 ? 'adminone' : 'admintwo';
                              updated.add(`${groupName}_${target}`);
                              return updated;
                            });
                          } else {
                            console.warn(
                              `⚠️ Target field not found: ${target}`
                            );
                          }
                        },
                        delay * (index + 1)
                      );
                    } else {
                      console.log(
                        `⚠️ Source field ${source} not found or empty in addressData`
                      );
                    }
                  });
                } else {
                  console.error(`🏢 Address data not found in response`);
                }
              })
              .catch((error) => {
                console.error(`🏢 Error fetching address data:`, error);
              });
          } else {
            console.error(`🏢 workflowId or userId not available`);
          }
        }
      }

      // If dispatch and fields are available, handle dependent dropdowns
      if (dispatch && fields) {
        console.log(`🔄 Dropdown changed: ${field.fieldName} = ${value}`);
        console.log(
          `🔍 Field has ${fields.length} total fields to check for dependencies`
        );

        // Special logging for IAU geographical fields
        if (
          field.fieldName.toLowerCase().includes('iau') &&
          (field.fieldName.toLowerCase().includes('country') ||
            field.fieldName.toLowerCase().includes('state') ||
            field.fieldName.toLowerCase().includes('district'))
        ) {
          console.log(`🌍 IAU Geographical field changed:`, {
            fieldName: field.fieldName,
            value,
            fieldAttributes: field.fieldAttributes,
            hasUrl: !!field.fieldAttributes?.url,
          });
        }

        // Find dependent fields that reference this field in their URL
        const dependentFields = fields.filter((f: FormField) => {
          const url = f.fieldAttributes?.url;
          if (!url) return false;

          // Check for exact field name match
          if (url.includes(`{${field.fieldName}}`)) {
            console.log(
              `✅ Found dependent field: ${f.fieldName} with URL: ${url}`
            );
            return true;
          }

          // Handle field name variations (e.g., registeDistrict vs registerDistrict)
          if (
            field.fieldName === 'registeDistrict' &&
            url.includes('{registerDistrict}')
          ) {
            console.log(
              `✅ Found dependent field (variation): ${f.fieldName} with URL: ${url}`
            );
            return true;
          }

          return false;
        });

        console.log(
          `🔗 Found ${dependentFields.length} dependent fields for ${field.fieldName}`
        );

        // Debug: Show all field URLs to check for dependencies
        if (
          field.fieldName.toLowerCase().includes('district') ||
          field.fieldName.toLowerCase().includes('state')
        ) {
          const allFieldUrls = fields
            .map((f) => ({ name: f.fieldName, url: f.fieldAttributes?.url }))
            .filter((f) => f.url);

          // Check what URLs reference this field
          const referencingFields = allFieldUrls.filter(
            (fieldUrl) =>
              fieldUrl.url && fieldUrl.url.includes(`{${field.fieldName}}`)
          );

          // Check for correspondence field relationships
          if (field.fieldName.includes('correspondence')) {
            const correspondenceFields = allFieldUrls.filter((f) =>
              f.name.includes('correspondence')
            );
          }
        }

        if (dependentFields.length > 0) {
          // Clear dependent field options and values first
          const dependentFieldIds = dependentFields.map((f) => f.id);
          if (clearDependentFieldOptions) {
            dispatch(
              clearDependentFieldOptions({
                parentFieldName: field.fieldName,
                dependentFieldIds,
              })
            );
          }

          // If a value is selected, fetch new options for dependent fields
          if (value && value.trim() !== '') {
            for (const dependentField of dependentFields) {
              const fieldAttributes = dependentField.fieldAttributes;
              if (fieldAttributes?.url) {
                // Find the selected option to get the correct value for URL
                const selectedOption = field.fieldOptions?.find((opt) => {
                  const option = opt as any; // Type assertion for dynamic properties
                  return opt.value === value || option.code === value;
                });

                // Determine the correct value to use in URL based on field configuration or option structure
                let urlValue = value; // Default to selected value

                if (selectedOption) {
                  const option = selectedOption as any; // Type assertion for dynamic properties
                  // For country fields, use the name instead of code for API calls
                  if (
                    field.fieldName.toLowerCase().includes('country') &&
                    option.name
                  ) {
                    urlValue = option.name;
                  }
                  // For state fields, use the label instead of value for API calls
                  else if (
                    field.fieldName.toLowerCase().includes('state') &&
                    option.label
                  ) {
                    urlValue = option.label;
                  }
                  // For district fields, use the label for API calls
                  else if (
                    field.fieldName.toLowerCase().includes('district') &&
                    option.label
                  ) {
                    urlValue = option.label;
                  }
                  // You can add more field-specific mappings here if needed
                  // else if (field.fieldName === 'someOtherField' && option.someProperty) {
                  //   urlValue = option.someProperty;
                  // }
                }

                // Handle field name variations in URL replacement
                let processedUrl = fieldAttributes.url;
                if (fieldAttributes.url.includes(`{${field.fieldName}}`)) {
                  processedUrl = fieldAttributes.url.replace(
                    `{${field.fieldName}}`,
                    urlValue
                  );
                } else if (
                  field.fieldName === 'registeDistrict' &&
                  fieldAttributes.url.includes('{registerDistrict}')
                ) {
                  processedUrl = fieldAttributes.url.replace(
                    '{registerDistrict}',
                    urlValue
                  );
                }

                // Use the address details specific action if available, otherwise fall back to generic
                const fetchAction =
                  fetchDropdownOptionsAction ||
                  (window as any).addressDetailsFetchAction; // Fallback for address details

                if (fetchAction) {
                  // Add CMS_URL prefix if the URL doesn't already include it
                  const fullUrl = processedUrl.startsWith('http')
                    ? processedUrl
                    : `${CMS_URL}${processedUrl}`;

                  console.log(`🌐 Full API URL: ${fullUrl}`);

                  dispatch(
                    fetchAction({
                      url: fullUrl,
                      method: fieldAttributes.method || 'GET',
                      fieldId: dependentField.id,
                      fieldName: dependentField.fieldName,
                      headers: fieldAttributes.headers || {},
                      payload: fieldAttributes.payloadTemplate || null,
                      responseMapping: fieldAttributes.responseMapping,
                    })
                  );
                }
              }
            }
          }
        }
      }
    },
    // eslint-disable-next-line
    [
      handleBasicFieldChange,
      dispatch,
      fields,
      fetchDropdownOptionsAction,
      clearDependentFieldOptions,
      updateFormValue,
      userId,
      workflowId,
    ]
  );

  // Handle checkbox changes
  const handleCheckboxChange = useCallback(
    (field: FormField, checked: boolean) => {
      // Check if there's a special handler for this checkbox
      if (specialCheckboxHandlers && specialCheckboxHandlers[field.fieldName]) {
        specialCheckboxHandlers[field.fieldName](checked);
      } else {
        // Default checkbox handling
        handleBasicFieldChange(field.fieldName, checked);
      }
    },
    [handleBasicFieldChange, specialCheckboxHandlers]
  );

  // Check if all mandatory fields in a section are filled
  const isSectionValid = useCallback(
    (sectionFields: FormField[]) => {
      return sectionFields.every((field) => {
        // Check if field has a validation error
        const hasValidationError = validationErrors[field.fieldName];
        if (hasValidationError) {
          return false; // Field has a validation error, section is invalid
        }
        // If field is not required, it's always valid
        if (!field.validationRules?.required) {
          return true;
        }

        // Check if required field has a value
        const fieldValue = formValues[field.fieldName];
        return (
          fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
        );
      });
    },
    [formValues, validationErrors]
  );

  // Helper function to check if a field has an existing document
  const hasExistingDocument = useCallback(
    (fieldName: string) => {
      if (!existingDocuments || !documentFieldMapping) return false;

      // Try multiple field name variations
      const possibleFieldNames = [
        fieldName,
        `${fieldName}_file`,
        fieldName.replace(/_file$/, ''),
      ];

      for (const name of possibleFieldNames) {
        const documentId = documentFieldMapping[name];
        if (documentId && existingDocuments[documentId]) {
          return true;
        }
      }
      return false;
    },
    [existingDocuments, documentFieldMapping]
  );

  // Helper function to check if a field has a valid attachment (new file or existing document)
  const hasValidAttachment = useCallback(
    (field: FormField, fieldValue: string | boolean | File | null) => {
      // Check for new file upload
      const hasNewFile =
        fieldValue instanceof File ||
        (typeof fieldValue === 'string' && fieldValue.trim() !== '');
      if (hasNewFile) {
        console.log(`✅ ${field.fieldName}: Has new file upload`);
        return true;
      }

      // Check for existing document from API
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      const hasExisting = hasExistingDocument(fileFieldName);
      if (hasExisting) {
        console.log(
          `✅ ${field.fieldName}: Has existing document (ID: ${documentFieldMapping?.[fileFieldName]})`
        );
      } else {
        console.log(`❌ ${field.fieldName}: No valid attachment found`);
      }
      return hasExisting;
    },
    [hasExistingDocument, documentFieldMapping]
  );

  // Function to prepare form data for submission (handles file vs document ID logic)
  const prepareFormDataForSubmission = useCallback(
    (formData: Record<string, unknown>) => {
      console.log('📤 Preparing form data for submission:', formData);
      const processedData: Record<string, unknown> = {};

      // Filter to only include fields from the current step
      const currentStepFieldNames = new Set<string>();

      if (fields) {
        fields.forEach((field) => {
          currentStepFieldNames.add(field.fieldName);

          // Also include file field names for textfield_with_image fields
          if (
            field.fieldType === 'textfield_with_image' &&
            field.fieldFileName
          ) {
            currentStepFieldNames.add(field.fieldFileName);
          }
          if (
            field.fieldType === 'file' ||
            field.fieldType === 'textfield_with_image'
          ) {
            currentStepFieldNames.add(`${field.fieldName}_file`);
          }
        });
      }

      console.log('🔍 Filtering form data for current step only:', {
        totalFormValues: Object.keys(formData).length,
        currentStepFields: currentStepFieldNames.size,
        currentStepFieldNames: Array.from(currentStepFieldNames),
      });

      Object.entries(formData).forEach(([fieldName, fieldValue]) => {
        // Only process fields that belong to the current step
        if (!currentStepFieldNames.has(fieldName)) {
          console.log(`⏭️ Skipping field not in current step: ${fieldName}`);
          return;
        }

        // Handle file fields
        if (fieldValue instanceof File) {
          // New file upload - send as File object
          console.log(`📎 ${fieldName}: Sending as new file upload`);
          processedData[fieldName] = fieldValue;
        } else if (hasExistingDocument(fieldName)) {
          // Existing document - send document ID instead of file
          const documentId = documentFieldMapping?.[fieldName];
          if (documentId) {
            const docIdFieldName = `${fieldName.replace(/_file$/, '')}_documentId`;
            console.log(
              `📄 ${fieldName}: Sending as document ID (${documentId}) in field ${docIdFieldName}`
            );
            processedData[docIdFieldName] = documentId;
          }
        } else {
          // Regular field - send as is
          processedData[fieldName] = fieldValue;
        }
      });

      console.log('📤 Final processed data for submission:', processedData);
      return processedData;
    },
    [fields, hasExistingDocument, documentFieldMapping]
  );

  // Handle form save with validation
  const handleSave = useCallback(async () => {
    if (!validationSchema) return;

    try {
      // Validate entire form
      await validationSchema.validate(formValues, { abortEarly: false });
      setValidationErrors({});

      // Prepare form data for submission (handles file vs document ID logic)
      const processedFormData = prepareFormDataForSubmission(formValues);

      if (onSave) {
        onSave(processedFormData);
      }
      // if (onNext) {
      //   onNext();
      // }
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  }, [
    validationSchema,
    formValues,
    onSave,
    setValidationErrors,
    prepareFormDataForSubmission,
  ]);

  // ===== FORM VALIDATION STATE =====
  // Check if all mandatory fields are filled and valid
  const isFormValid = useMemo(() => {
    // Get all required fields from all groups
    const requiredFields: string[] = [];

    Object.values(groupedFields).forEach((fieldGroup) => {
      fieldGroup.fields.forEach((field) => {
        const isRequired =
          field.validationRules?.required || field.isRequired || false;
        if (isRequired) {
          requiredFields.push(field.fieldName);
        }
      });
    });

    // Check if all required fields have values
    const allRequiredFieldsFilled = requiredFields.every((fieldName) => {
      const field = Object.values(groupedFields)
        .flatMap((group) => group.fields)
        .find((f) => f.fieldName === fieldName);
      const value = formValues[fieldName];

      // Special handling for file fields (file and textfield_with_image)
      if (
        field &&
        (field.fieldType === 'file' ||
          field.fieldType === 'textfield_with_image')
      ) {
        return hasValidAttachment(field, value);
      }

      // For checkbox fields, check boolean value; for others, check string value
      if (typeof value === 'boolean') {
        return value !== null && value !== undefined;
      }
      return value && value.toString().trim() !== '';
    });

    // Check if there are no validation errors for required fields
    const noValidationErrors = requiredFields.every((fieldName) => {
      return !validationErrors[fieldName];
    });

    return allRequiredFieldsFilled && noValidationErrors;
  }, [groupedFields, formValues, validationErrors, hasValidAttachment]);

  // Handle form clear
  const handleClear = useCallback(() => {
    clearForm();
    setClearKey((prev) => prev + 1);
    setValidationErrors({});
  }, [clearForm, setClearKey, setValidationErrors]);

  const handleEditClick = useCallback(
    (groupName: string) => {
      setEditableGroup?.(groupName);
      if (groupName) {
        setIsEditMode?.(true);
      } else {
        setIsEditMode?.(false);
      }
    },
    [setIsEditMode, setEditableGroup]
  );

  // ===== RENDER FUNCTIONS =====
  // Render individual field based on type
  const renderField = (field: FormField, groupName?: string) => {
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

    const isRequired =
      shouldForceCkyc ||
      field.validationRules?.required ||
      field.isRequired ||
      false;
    // const isDisabled =
    //   typeof getFieldDisabled === 'function'
    //     ? getFieldDisabled(field)
    //     : isFieldAutoPopulated(field.fieldName);
    const isDisabled = isFieldAutoPopulated(field.fieldName, groupName);
    const isModifiable = isModifiableField(field.fieldName);

    // Determine admin index from group name
    let adminIndex = 0;
    const lowerGroup = (groupName || '').toLowerCase();
    if (
      lowerGroup.includes('admin_one') ||
      lowerGroup.includes('admin1') ||
      lowerGroup.includes('admin-one') ||
      lowerGroup.includes('adminone')
    ) {
      adminIndex = 1;
    } else if (
      lowerGroup.includes('admin_two') ||
      lowerGroup.includes('admin2') ||
      lowerGroup.includes('admin-two') ||
      lowerGroup.includes('admintwo')
    ) {
      adminIndex = 2;
    }

    // Show validation error only if:
    // 1. Field has a validation error
    // 2. Field is NOT auto-populated (auto-populated fields are valid from CKYC)
    // 3. OR field is empty (cleared fields after CKYC change should show errors)
    const isAutoPopulated = isFieldAutoPopulated(field.fieldName, groupName);
    const fieldIsEmpty = !value || (typeof value === 'string' && !value.trim());

    // Check if this is a mobile field - always show errors for mobile fields
    const isMobileFieldCheck = /(mobile|phone)/i.test(field.fieldName);

    // Show error if:
    // - Field is not auto-populated, OR
    // - Field is empty (even if it was auto-populated before, it's been cleared now)
    // - OR it's a mobile field (always show errors for mobile)
    const shouldShowError =
      !isAutoPopulated || fieldIsEmpty || isMobileFieldCheck;
    const errorMessage = shouldShowError
      ? validationErrors[field.fieldName]
      : undefined;

    if (
      field.fieldName.includes('EmployCode') ||
      field.fieldName.includes('FirstName') ||
      field.fieldName.includes('Gender') ||
      field.fieldName.includes('Title')
    ) {
      console.log(`🎯 renderField for ${field.fieldName}:`, {
        adminIndex,
        isAutoPopulated,
        fieldIsEmpty,
        shouldShowError,
        errorMessage,
        validationErrorsForField: validationErrors[field.fieldName],
        value,
        groupName,
      });
    }

    // Check if this is a mobile number field
    const isMobileField = /(mobile|phone)/i.test(field.fieldName);

    // Get citizenship status for conditional validation
    let citizenshipValue = '';

    // Determine which citizenship field to use based on the mobile field name
    let targetCitizenshipField = '';
    console.log('🔍 Processing field:', field.fieldName);
    console.log('🔍 All available form values:', Object.keys(formValues));
    console.log('🔍 All form values:', formValues);
    console.log('🔍 Field name type:', typeof field.fieldName);
    console.log(
      '🔍 Does field name include iauMobileNumber1?',
      field.fieldName.includes('iauMobileNumber1')
    );
    console.log(
      '🔍 Does field name include iauMobileNumber2?',
      field.fieldName.includes('iauMobileNumber2')
    );
    console.log(
      '🔍 Does field name include mobile1?',
      field.fieldName.includes('mobile1')
    );
    console.log(
      '🔍 Does field name include mobile2?',
      field.fieldName.includes('mobile2')
    );
    console.log(
      '🔍 Does field name include mobile?',
      field.fieldName.includes('mobile')
    );
    console.log('🔍 Is mobile field?', isMobileField);
    console.log('📱 Mobile field validation - Current state:', {
      fieldName: field.fieldName,
      isMobileField,
      value,
      validationError: validationErrors[field.fieldName],
      shouldShowError,
    });

    // Try multiple patterns to match mobile field names
    if (
      field.fieldName.includes('iauMobileNumber1') ||
      field.fieldName.includes('mobile1')
    ) {
      targetCitizenshipField = 'iauCitizenship1';
      console.log('🔍 Using iauCitizenship1 for first admin mobile field');
    } else if (
      field.fieldName.includes('iauMobileNumber2') ||
      field.fieldName.includes('mobile2')
    ) {
      targetCitizenshipField = 'iauCitizenship2';
      console.log('🔍 Using iauCitizenship2 for second admin mobile field');
    } else if (
      field.fieldName.toLowerCase().includes('mobile') &&
      field.fieldName.toLowerCase().includes('2')
    ) {
      targetCitizenshipField = 'iauCitizenship2';
      console.log('🔍 Using iauCitizenship2 for mobile field containing "2"');
    } else if (
      field.fieldName.toLowerCase().includes('mobile') &&
      field.fieldName.toLowerCase().includes('1')
    ) {
      targetCitizenshipField = 'iauCitizenship1';
      console.log('🔍 Using iauCitizenship1 for mobile field containing "1"');
    } else {
      // For other mobile fields, try known field names in order
      const knownFields = [
        'iauCitizenship1',
        'iauCitizenship2',
        'iauCitizenship',
        'hoiCitizenship',
        'citizenship',
      ];
      for (const fieldName of knownFields) {
        if (formValues[fieldName]) {
          targetCitizenshipField = fieldName;
          break;
        }
      }
      console.log(
        '🔍 Using fallback citizenship field:',
        targetCitizenshipField
      );
    }

    // Get the citizenship value from the target field
    if (targetCitizenshipField && formValues[targetCitizenshipField]) {
      const value = formValues[targetCitizenshipField];
      citizenshipValue =
        typeof value === 'string'
          ? value.toLowerCase()
          : String(value).toLowerCase();
      console.log(
        `🔍 Found citizenship value "${citizenshipValue}" in field ${targetCitizenshipField}`
      );
    } else {
      console.log(
        `🔍 No citizenship value found in field ${targetCitizenshipField}`
      );
    }

    // If no specific field found, search for any field containing 'citizen'
    if (!citizenshipValue) {
      const citizenshipField = Object.keys(formValues).find((key) =>
        key.toLowerCase().includes('citizen')
      );
      if (citizenshipField && formValues[citizenshipField]) {
        const value = formValues[citizenshipField];
        citizenshipValue =
          typeof value === 'string'
            ? value.toLowerCase()
            : String(value).toLowerCase();
      }
    }

    // Enhanced Indian citizenship detection
    const isIndianCitizen =
      citizenshipValue === 'indian' ||
      citizenshipValue === 'india' ||
      citizenshipValue === 'in' ||
      citizenshipValue === '+91' ||
      citizenshipValue.includes('indian') ||
      citizenshipValue.includes('india') ||
      citizenshipValue.includes('+91');

    console.log(
      `🏳️ Citizenship detection for field ${field.fieldName}: value="${citizenshipValue}", isIndian=${isIndianCitizen}`
    );

    // Get mobile validation rules based on conditional logic
    const mobileRules = isMobileField
      ? getMobileValidationRules(field, isIndianCitizen, formValues)
      : null;

    console.log(`📱 Mobile rules for ${field.fieldName}:`, mobileRules);

    // Check if this is the pincode "other" field and if "other" is selected
    const isPincodeOtherField =
      field.fieldName === 'registerPincodeOther' ||
      field.fieldName === 'correspondencePincodeOther' ||
      field.fieldName === 'iauPincodeOther1' ||
      field.fieldName === 'iauPincodeOther2';

    let pincodeValue: string | boolean | File | null = '';
    if (field.fieldName === 'registerPincodeOther') {
      pincodeValue =
        formValues['register_pincode'] || formValues['registerPincode'];
    } else if (field.fieldName === 'correspondencePincodeOther') {
      pincodeValue =
        formValues['correspondence_pincode'] ||
        formValues['correspondencePincode'];
    } else if (field.fieldName === 'iauPincodeOther1') {
      pincodeValue = formValues['iauPincode1'];
    } else if (field.fieldName === 'iauPincodeOther2') {
      pincodeValue = formValues['iauPincode2'];
    }

    const isPincodeOtherSelected =
      isPincodeOtherField &&
      (pincodeValue?.toString().toLowerCase() === 'other' ||
        pincodeValue?.toString().toLowerCase() === 'others');

    // Get conditional validation rules for pincode "other" field
    const pincodeOtherRules = isPincodeOtherSelected
      ? getPincodeOtherValidationRules(field)
      : null;

    console.log(
      `📍 Pincode other rules for ${field.fieldName}:`,
      pincodeOtherRules
    );

    // Debug logging for IAU proof of identity fields
    if (
      field.fieldName?.toLowerCase().includes('proof') ||
      field.fieldName?.toLowerCase().includes('identity')
    ) {
      console.log(
        `🔍 Field: ${field.fieldName}, Type: ${field.fieldType}`,
        field
      );
    }

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

    // console.log('values:-----', value);
    switch (field.fieldType) {
      case 'textfield': {
        // Get appropriate placeholder and validation rules
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

        const finalErrorMessage =
          getErrorMessage(errorMessage) || field.helpText || undefined;

        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={fieldPlaceholder}
            required={
              isPincodeOtherSelected && pincodeOtherRules
                ? typeof pincodeOtherRules.required === 'boolean'
                  ? pincodeOtherRules.required
                  : pincodeOtherRules.required === 'true' ||
                    pincodeOtherRules.required === 'required'
                : isMobileField && mobileRules
                  ? typeof mobileRules.required === 'boolean'
                    ? mobileRules.required
                    : mobileRules.required === 'true' ||
                      mobileRules.required === 'required'
                  : isRequired
            }
            // disabled={isDisabled}
            // disabled={isFieldAutoPopulated(field.fieldName, groupName)}
            sx={fieldSx}
            disabled={
              !isModifiable || isFieldAutoPopulated(field.fieldName, groupName)
            }
            minLength={
              isPincodeOtherSelected && pincodeOtherRules?.minLength
                ? parseInt(pincodeOtherRules.minLength)
                : isMobileField && mobileRules?.minLength
                  ? parseInt(mobileRules.minLength)
                  : field.validationRules?.minLength
                    ? parseInt(field.validationRules.minLength)
                    : undefined
            }
            maxLength={
              isPincodeOtherSelected && pincodeOtherRules?.maxLength
                ? parseInt(pincodeOtherRules.maxLength)
                : isMobileField && mobileRules?.maxLength
                  ? parseInt(mobileRules.maxLength)
                  : field.validationRules?.maxLength
                    ? parseInt(field.validationRules.maxLength)
                    : undefined
            }
            pattern={
              isMobileField && mobileRules && mobileRules.pattern
                ? typeof mobileRules.pattern === 'string'
                  ? mobileRules.pattern
                  : undefined
                : undefined
            }
            error={!!errorMessage}
            helperText={finalErrorMessage}
            type={
              isMobileField
                ? 'tel'
                : field.fieldName.includes('website')
                  ? 'url'
                  : 'text'
            }
            isMobileNumber={isMobileField}
            inputMode={isMobileField ? 'numeric' : undefined}
          />
        );
      }

      case 'dropdown': {
        const options = field.fieldOptions || [];

        // Debug logging for dropdown options
        if (
          field.fieldName === 'registerState' ||
          field.fieldName === 'registeDistrict'
        ) {
          const disabledLog = isFieldAutoPopulated(field.fieldName, groupName);
          console.log(`🔍 ${field.fieldName} dropdown rendering:`, {
            fieldName: field.fieldName,
            fieldId: field.id,
            optionsCount: options.length,
            options: JSON.stringify(options.slice(0, 5), null, 2), // First 5 options
            currentValue: value,
            isDisabled: disabledLog,
          });

          // Also log what values will be used in MenuItem
          options.slice(0, 3).forEach((option: unknown, index: number) => {
            const menuItemValue =
              (option as any).code ||
              (option as any).name ||
              (option as any).value;
            console.log(`🔍 ${field.fieldName} option ${index}:`, {
              option,
              menuItemValue,
              hasCode: !!(option as any).code,
              hasName: !!(option as any).name,
              hasValue: !!(option as any).value,
            });
          });
        }

        // Map options and add "other" option for pincode fields only if options exist
        let dropdownOptions = options.map(
          (option: DropdownOption, index: number) => {
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
          }
        );

        // Add "other" option at the top for pincode fields only if options exist
        // Check if this is a pincode field and if it doesn't already have "other" option
        const isPincodeField =
          field.fieldName === 'register_pincode' ||
          field.fieldName === 'registerPincode' ||
          field.fieldName === 'correspondencePincode' ||
          field.fieldName === 'iauPincode1' ||
          field.fieldName === 'iauPincode2' ||
          (field.fieldName?.toLowerCase().includes('pincode') &&
            (field.fieldName?.toLowerCase().includes('register') ||
              field.fieldName?.toLowerCase().includes('correspondence') ||
              field.fieldName?.toLowerCase().includes('iau')));

        const hasOtherOption = dropdownOptions.some(
          (opt) => opt.value?.toString().toLowerCase() === 'other'
        );

        if (isPincodeField && options.length > 0 && !hasOtherOption) {
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

        return (
          <LabeledDropDown
            key={field.id}
            label={field.fieldLabel}
            value={(value as string) || ''}
            onChange={(selectedValue) => {
              console.log(`🎯 ${field.fieldName} onChange triggered:`, {
                selectedValue,
                type: typeof selectedValue,
                fieldName: field.fieldName,
                hasDispatch: !!dispatch,
                hasFields: !!fields,
              });
              handleDropdownChange(field, selectedValue as string);
            }}
            options={dropdownOptions}
            placeholder={
              field.fieldPlaceholder ||
              `Please select ${field.fieldLabel.toLowerCase()}`
            }
            required={isRequired}
            // disabled={isDisabled}
            // disabled={isFieldAutoPopulated(field.fieldName, groupName)}
            sx={fieldSx}
            disabled={
              !isModifiable || isFieldAutoPopulated(field.fieldName, groupName)
            }
            error={!!errorMessage}
            helperText={errorMessage || field.helpText || undefined}
          />
        );
      }

      case 'checkbox':
        return (
          <LabeledCheckbox
            key={field.id}
            label={field.fieldLabel}
            checked={
              value === '' || value === 'false' ? false : (value as boolean)
            }
            onChange={(checked) => handleCheckboxChange(field, checked)}
            required={isRequired}
            // disabled={isDisabled}
            // disabled={isFieldAutoPopulated(field.fieldName, groupName)}
            sx={fieldSx}
            disabled={
              !isModifiable || isFieldAutoPopulated(field.fieldName, groupName)
            }
          />
        );

      case 'date':
        return (
          <LabeledDate
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={(value as string) || null}
            onChange={(newVal) =>
              handleBasicFieldChange(field.fieldName, newVal || '')
            }
            required={field.validationRules?.required || false}
            error={!!errorMessage}
            helperText={errorMessage as string | undefined}
            // disabled={isDisabled}
            // disabled={isFieldAutoPopulated(field.fieldName, groupName)}
            sx={fieldSx}
            disabled={
              !isModifiable || isFieldAutoPopulated(field.fieldName, groupName)
            }
          />
        );

      case 'textfield_with_image': {
        // Get file field name from fieldFileName or fallback
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;

        // Get both text field error and file validation error
        const fileErrorMessage = validationErrors[fileFieldName];
        const combinedErrorMessage = errorMessage || fileErrorMessage;
        const hasError = !!combinedErrorMessage;

        // Use validationFile rules if available, otherwise fallback to main validation rules
        const fileValidationRules =
          field.validationRules?.validationFile || field.validationRules;

        // Get existing document for this field
        const getExistingDocument = () => {
          if (!existingDocuments || !documentFieldMapping) return undefined;

          // Try multiple field name variations
          const possibleFieldNames = [
            fileFieldName,
            field.fieldName,
            field.fieldFileName,
          ].filter(Boolean);

          for (const fieldName of possibleFieldNames) {
            if (fieldName) {
              const documentId = documentFieldMapping[fieldName];
              if (documentId && existingDocuments[documentId]) {
                const docData = existingDocuments[documentId] as any;
                return {
                  id: documentId,
                  fileName: docData.fileName || 'Document',
                  fileSize: docData.fileSize || 0,
                  mimeType: docData.mimeType || 'application/octet-stream',
                  dataUrl: docData.base64Content || docData.dataUrl || '',
                };
              }
            }
          }
          return undefined;
        };

        const existingDoc = getExistingDocument();

        console.log(
          `📤 Rendering textfield_with_image for ${field.fieldName}:`,
          {
            fileFieldName,
            value,
            existingDoc,
            hasError,
            combinedErrorMessage,
            disabled: isFieldAutoPopulated(field.fieldName, groupName),
          }
        );

        return (
          <LabeledTextFieldWithUpload
            key={`${field.id}-${clearKey}`}
            label={field.fieldLabel}
            value={value as string}
            onDelete={(doc: any) => {
              console.log(`🗑️ Delete clicked for ${fileFieldName}:`, doc);
              // Clear the file field
              handleFieldChange(fileFieldName, null);
              // If there's an existing document, remove it from existingDocuments
              if (doc && doc.id && existingDocuments) {
                console.log(
                  `🗑️ Removing existing document from state: ${doc.id}`
                );
                const updatedDocs = { ...existingDocuments };
                delete updatedDocs[doc.id];
                // Note: We would need to dispatch an action to update Redux state here
                // For now, this will clear the field value
                console.log(`🗑️ Updated documents:`, updatedDocs);
              }
            }}
            onChange={(e) => {
              console.log(
                `📝 Text field changed: ${field.fieldName} = ${e.target.value}`
              );
              handleFieldChange(field.fieldName, e.target.value);
            }}
            onUpload={(file) => {
              console.log(`📤 File uploaded for ${fileFieldName}:`, {
                file,
                fileName: file?.name,
                fileSize: file?.size,
                fileType: file?.type,
                isNull: file === null,
                isUndefined: file === undefined,
              });
              handleFieldChange(fileFieldName, file);
            }}
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
            error={hasError}
            helperText={combinedErrorMessage}
            accept={
              fileValidationRules?.imageFormat
                ?.map((format) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={
              fileValidationRules ||
              field?.conditionalLogic?.[0]?.then?.validationRules ||
              undefined
            }
            onValidationError={(error) => {
              if (error) {
                setFieldError({
                  field: fileFieldName,
                  message: error,
                });
              } else {
                clearFieldError(fileFieldName);
              }
            }}
            existingDocument={existingDoc}
            showExistingDocument={!!existingDoc}
            // disabled={isFieldAutoPopulated(field.fieldName, groupName)}
            sx={fieldSx}
            disabled={
              !isModifiable || isFieldAutoPopulated(field.fieldName, groupName)
            }
          />
        );
      }

      case 'textfield_with_verify':
        // Determine if this verify field is a CKYC field and whether it should be disabled
        return (() => {
          const isCkycField = /ckyc(number|no)/i.test(field.fieldName);
          let isIndianCitizen = true;
          if (isCkycField) {
            // Try to determine admin index by field name, else fallback search
            let adminIndex = 0;
            if (
              field.fieldName.includes('1') ||
              field.fieldName.toLowerCase().includes('admin1')
            ) {
              adminIndex = 1;
            } else if (
              field.fieldName.includes('2') ||
              field.fieldName.toLowerCase().includes('admin2')
            ) {
              adminIndex = 2;
            }

            let citizenshipField = '';
            if (adminIndex === 1) citizenshipField = 'iauCitizenship1';
            else if (adminIndex === 2) citizenshipField = 'iauCitizenship2';
            // Fallback: search common keys
            if (!citizenshipField) {
              const known = [
                'iauCitizenship1',
                'iauCitizenship2',
                'iauCitizenship',
                'citizenship',
              ];
              for (const k of known) {
                if (formValues[k]) {
                  citizenshipField = k;
                  break;
                }
              }
              if (!citizenshipField) {
                const anyKey = Object.keys(formValues).find((k) =>
                  k.toLowerCase().includes('citizen')
                );
                citizenshipField = anyKey || '';
              }
            }

            const val = citizenshipField ? formValues[citizenshipField] : '';
            const cLower = String(val || '')
              .trim()
              .toLowerCase();
            isIndianCitizen = cLower === 'indian' || cLower.includes('indian');
          }

          const disabledForCitizenship = isCkycField && !isIndianCitizen;

          return (
            <LabeledTextFieldWithVerify
              key={`${field.id}-${clearKey}`}
              label={field.fieldLabel}
              value={value as string}
              onChange={(e) =>
                handleFieldChange(field.fieldName, e.target.value)
              }
              placeholder={field.fieldPlaceholder}
              required={field.validationRules?.required || false}
              verifyIcon={Boolean(
                formValues[`${field.fieldName}_autoPopulated`] === 'true' ||
                  formValues[`${field.fieldName}_autoPopulated`] === true
              )}
              hasData={Boolean(
                formValues[`${field.fieldName}_autoPopulated`] === 'true' ||
                  formValues[`${field.fieldName}_autoPopulated`] === true
              )}
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
              error={!!errorMessage}
              helperText={errorMessage}
              externalVerifyUrl={
                field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
              }
              externalVerifyMethod={
                field?.conditionalLogic?.[0]?.then?.fieldAttributes?.method
              }
              // disabled={
              //   disabledForCitizenship ||
              //   isFieldAutoPopulated(field.fieldName, groupName)
              // }
              sx={fieldSx}
              disabled={disabledForCitizenship || !isModifiable}
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
                    const resp = await Secured.post(fa.url, payload, {
                      headers,
                    });
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
                const fa = matched?.then?.fieldAttributes as
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
                  console.log('matchedvalues', values, depVal, formValues);
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

                console.log('🔍 Field attributes found:', fa, matched);

                console.log(
                  '🎯 Before - Auto-population skipped:',
                  !data || !fa?.autoPopulate || !Array.isArray(fa.autoPopulate)
                );

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

                const lowerGroup = (field.fieldGroup || '').toLowerCase();
                const isAdminOne = [
                  'adminone',
                  'admin_one',
                  'admin1',
                  'admin-one',
                ].some((v) => lowerGroup.includes(v));
                const isAdminTwo = [
                  'admintwo',
                  'admin_two',
                  'admin2',
                  'admin-two',
                ].some((v) => lowerGroup.includes(v));

                const adminIndex = isAdminOne ? 1 : isAdminTwo ? 2 : 1;
                const ckycField = isAdminOne
                  ? 'iauCkycNumber1'
                  : 'iauCkycNumber2';
                const citizenshipField = isAdminOne
                  ? 'iauCitizenship1'
                  : 'iauCitizenship2';
                const prefix = 'iau';

                // --- Field mapping ---
                const fieldMapping: Record<string, string> = {
                  title: `${prefix}Title${adminIndex}`,
                  firstName: `${prefix}FirstName${adminIndex}`,
                  middleName: `${prefix}MiddleName${adminIndex}`,
                  lastName: `${prefix}LastName${adminIndex}`,
                  gender: `${prefix}Gender${adminIndex}`,
                  ckycNumber: `${prefix}CkycNumber${adminIndex}`,
                };

                console.log('🗺️ Field mapping:', fieldMapping);

                // Track populated fields and store verified values
                const populatedFields = new Set<string>();
                // const currentCkycValue = String(formValues['hoiCkycNo'] || '');
                // const currentCitizenshipValue = String(
                //   formValues['citizenship'] || ''
                // );
                const currentCkycValue = String(formValues[ckycField] || '');
                const currentCitizenshipValue = String(
                  formValues[citizenshipField] || ''
                );

                console.log('fAutoPopulate', fa.autoPopulate);

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
                      Object.prototype.hasOwnProperty.call(
                        result,
                        mappedField[0]
                      )
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

                  // Track this field as auto-populated with admin prefix
                  populatedFields.add(`admin${adminIndex}_${target}`);
                });
                // Add CKYC field with admin prefix
                populatedFields.add(`admin${adminIndex}_${ckycField}`);
                // Update state with populated fields and verified values
                // First, remove old auto-populated fields for this admin, then add new ones
                setAutoPopulatedFields((prev) => {
                  const newSet = new Set(prev);
                  // Remove old fields for this admin
                  newSet.forEach((field) => {
                    if (field.startsWith(`admin${adminIndex}_`)) {
                      newSet.delete(field);
                    }
                  });
                  // Add new fields
                  populatedFields.forEach((field) => newSet.add(field));
                  return newSet;
                });
                setCkycVerifiedValue((prev) => ({
                  ...prev,
                  [adminIndex]: currentCkycValue,
                }));
                setCitizenshipVerifiedValue((prev) => ({
                  ...prev,
                  [adminIndex]: currentCitizenshipValue,
                }));

                // Clear validation errors for auto-populated fields
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  populatedFields.forEach((field) => {
                    // Remove admin prefix to get actual field name
                    const actualFieldName = field.replace(
                      `admin${adminIndex}_`,
                      ''
                    );
                    delete newErrors[actualFieldName];
                  });
                  return newErrors;
                });
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

                const fa = matched.then?.fieldAttributes as
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
                    const resp = await Secured.post(fa.url, payload, {
                      headers,
                    });
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
        })();

      case 'file':
        return (
          <div>
            <UploadButton
              key={`${field.id}-${clearKey}`}
              label={field.fieldLabel}
              onUpload={(file) => handleFieldChange(field.fieldName, file)}
              required={field.validationRules?.required || false}
              accept={
                field.validationRules?.imageFormat
                  ?.map((format) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              // disabled={isFieldAutoPopulated(field.fieldName, groupName)}
              disabled={
                !isModifiable ||
                isFieldAutoPopulated(field.fieldName, groupName)
              }
              sx={fieldSx}
            />
            {errorMessage && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                {errorMessage}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Render fields in a group with proper grid layout
  const renderFieldGroup = (fields: FormField[]) => {
    const sortedFields = [...fields].sort(
      (a, b) => a.fieldOrder - b.fieldOrder
    );

    return (
      <Grid container spacing={2}>
        {sortedFields.map((field) => {
          // Hide pincode "other" field by default, show only when "other" is selected
          const isPincodeOtherField =
            field.fieldName === 'registerPincodeOther' ||
            field.fieldName === 'correspondencePincodeOther' ||
            field.fieldName === 'iauPincodeOther1' ||
            field.fieldName === 'iauPincodeOther2';

          if (isPincodeOtherField) {
            // Determine which pincode field to check based on the "other" field name
            let pincodeValue: string | boolean | File | null = '';
            if (field.fieldName === 'registerPincodeOther') {
              pincodeValue =
                formValues['register_pincode'] || formValues['registerPincode'];
            } else if (field.fieldName === 'correspondencePincodeOther') {
              pincodeValue = formValues['correspondencePincode'];
            } else if (field.fieldName === 'iauPincodeOther1') {
              pincodeValue = formValues['iauPincode1'];
            } else if (field.fieldName === 'iauPincodeOther2') {
              pincodeValue = formValues['iauPincode2'];
            } else {
              // For noRegisterPincodeOther (backward compatibility)
              pincodeValue =
                formValues['register_pincode'] || formValues['registerPincode'];
            }

            const isOtherSelected =
              pincodeValue?.toString().toLowerCase() === 'other' ||
              pincodeValue?.toString().toLowerCase() === 'others';

            if (!isOtherSelected) {
              return null;
            }
          }

          // Checkbox fields take full width (single row)
          // Other fields take 1/3 width (3 per row)
          const gridSize =
            field.fieldType === 'checkbox'
              ? { xs: 12 }
              : { xs: 12, sm: 6, md: 4 };

          return (
            <Grid size={gridSize} key={field.id}>
              {renderField(field)}
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render grouped fields as accordion sections
  const renderGroupedFields = () => {
    if (!configuration?.formSettings?.formGroup) {
      return null;
    }
    return Object.entries(groupedFields).map(([groupName, fields]) => {
      // const groupTitle =
      //   groupName === 'register_address'
      //     ? 'Registered Address'
      //     : groupName === 'correspondence_address'
      //       ? 'Correspondence Address'
      //       : groupName
      //           .replace(/_/g, ' ')
      //           .replace(/\b\w/g, (l) => l.toUpperCase());
      return (
        <FormAccordion
          key={groupName}
          title={
            fields?.label == 'Admin One'
              ? 'Institutional Admin User 1 Details'
              : fields?.label == 'Admin Two'
                ? 'Institutional Admin User 2 Details'
                : fields?.label
          }
          groupKey={groupName}
          defaultExpanded={true}
        >
          <Grid container spacing={2}>
            {[...fields.fields]
              .sort((a, b) => a.fieldOrder - b.fieldOrder)
              .map((field) => {
                // Hide pincode "other" field by default, show only when "other" is selected
                const isPincodeOtherField =
                  field.fieldName === 'registerPincodeOther' ||
                  field.fieldName === 'correspondencePincodeOther' ||
                  field.fieldName === 'iauPincodeOther1' ||
                  field.fieldName === 'iauPincodeOther2';

                if (isPincodeOtherField) {
                  // Determine which pincode field to check based on the "other" field name
                  let pincodeValue: string | boolean | File | null = '';
                  if (field.fieldName === 'registerPincodeOther') {
                    pincodeValue =
                      formValues['register_pincode'] ||
                      formValues['registerPincode'];
                  } else if (field.fieldName === 'correspondencePincodeOther') {
                    pincodeValue = formValues['correspondencePincode'];
                  } else if (field.fieldName === 'iauPincodeOther1') {
                    pincodeValue = formValues['iauPincode1'];
                  } else if (field.fieldName === 'iauPincodeOther2') {
                    pincodeValue = formValues['iauPincode2'];
                  } else {
                    // For noRegisterPincodeOther (backward compatibility)
                    pincodeValue =
                      formValues['register_pincode'] ||
                      formValues['registerPincode'];
                  }

                  const isOtherSelected =
                    pincodeValue?.toString().toLowerCase() === 'other' ||
                    pincodeValue?.toString().toLowerCase() === 'others';

                  if (!isOtherSelected) {
                    return null;
                  }
                }

                const gridSize =
                  field.fieldType === 'checkbox'
                    ? { xs: 12 }
                    : { xs: 12, sm: 6, md: 4 };
                return (
                  // <Grid size={gridSize} key={field.id}>
                  //   {renderField(field, groupName)}
                  // </Grid>
                  <>
                    {field.fieldLabel == 'Date of Authorization' ? (
                      <Grid size={gridSize} key={field.id}></Grid>
                    ) : (
                      ''
                    )}
                    <Grid size={gridSize} key={field.id}>
                      {renderField(field, groupName)}
                    </Grid>
                  </>
                );
              })}
          </Grid>
          {/* Add validation button for admin sections */}
          {onValidateSection &&
            groupName.includes('admin') &&
            (() => {
              const isValid = isSectionValid(fields.fields);
              const sectionMatch = groupName.match(/admin[_-]?(\d+)/i);
              let sectionIndex = sectionMatch ? sectionMatch[1] : '';
              // const MobileandEmailFields = fields.fields.map(data => data.fieldName)
              const MobileandEmailFields = fields.fields.map(
                (data) => data.fieldName
              );
              const hasModifiableContact = [
                'iauEmail1',
                'iauEmail2',
                'iauMobileNumber1',
                'iauMobileNumber2',
              ].some(
                (name) =>
                  MobileandEmailFields.includes(name) && isModifiableField(name)
              );
              // Check verification and data change status
              const isVerified = verifiedSections.has(groupName);
              const hasDataChanged = hasSectionDataChanged(
                groupName,
                fields.fields
              );
              if (groupName == 'adminone') {
                sectionIndex = '1';
              }
              if (groupName == 'admintwo') {
                sectionIndex = '2';
              }
              // Determine button state
              let buttonLabel = `Validate Admin ${sectionIndex}`;
              let backgroundColor = isValid ? '#002CBA' : '#999999';
              let hoverColor = isValid ? '#001a8a' : '#5a6268';
              let disabled = !isValid || !hasModifiableContact;

              if (isVerified && !hasDataChanged) {
                // Section is verified and no changes made
                buttonLabel = `✓ Admin ${sectionIndex} Verified`;
                backgroundColor = '#28a745'; // Green for verified
                hoverColor = '#218838';
                disabled = true; // Disable since already verified
              } else if (isVerified && hasDataChanged) {
                // Section was verified but data has changed
                buttonLabel = `Validate Admin ${sectionIndex}`;
                backgroundColor = '#ffc107'; // Yellow/orange for needs re-validation
                hoverColor = '#e0a800';
                disabled = !isValid || !hasModifiableContact;
              }

              return (
                <Box
                  sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
                >
                  <ReusableButton
                    label={buttonLabel}
                    backgroundColor={backgroundColor}
                    hoverColor={hoverColor}
                    disabled={disabled}
                    onClick={() => {
                      const sectionIndex =
                        groupName === 'adminone'
                          ? 1
                          : groupName === 'admintwo'
                            ? 2
                            : undefined;
                      if (!sectionIndex) return;
                      onValidateSection(groupName, sectionIndex);
                    }}
                  />
                </Box>
              );
            })()}
        </FormAccordion>
      );
    });
  };
  // ===== MAIN RENDER =====
  return (
    <Box sx={{ p: 5, fontFamily: 'Gilroy' }}>
      <Typography
        variant="h5"
        sx={{
          mt: 2,
          mb: 3,
          fontFamily: 'Gilroy',
          fontWeight: 600,
          color: '#333',
          textAlign: 'center',
        }}
      >
        {configuration?.formSubtitle || 'Dynamic Form'}
      </Typography>

      {/* Render grouped fields if form_group is true */}
      {configuration?.formSettings?.formGroup ? (
        renderGroupedFields()
      ) : (
        <Typography variant="body1" color="text.secondary">
          Form group is disabled. Please enable form_group in configuration.
        </Typography>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <FormActionButtons
          onClear={handleClear}
          onSave={handleSave}
          onPrevious={onPrevious}
          onValidate={
            onValidateSection
              ? () => onValidateSection('general', 1)
              : undefined
          }
          showSave={configuration?.submissionSettings?.submitButton}
          showClear={false}
          clearLabel={configuration?.submissionSettings?.clearButtonText}
          saveLabel={configuration?.submissionSettings?.submitButtonText}
          previousLabel="Previous"
          validateLabel="Validate"
          saveDisabled={!isFormValid}
          showPrevious={!!onPrevious}
          submissionSettings={{
            ...(configuration?.submissionSettings || {}),
            clearButton: false,
          }}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default TrackStatusDynamicExpandCollapseForm;
