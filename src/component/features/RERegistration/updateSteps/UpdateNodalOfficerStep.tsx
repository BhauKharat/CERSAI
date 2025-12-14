/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import LabeledDateUpdate from './CommonComponnet/LabeledDateUpdate';
import UploadButtonUpdate from './CommonComponnet/UploadButtonUpdate';
import {
  fetchStepDataNodal,
  fetchFormFieldsNodal,
  selectNodalStepDataLoading,
  fetchDropdownDataNodal,
  selectNodalDropdownData,
  fetchRegistrationAddresses,
  selectRegistrationAddresses,
} from './slice/updateNodalOfficerSlice';
import { fetchDocument, deleteDocument } from './slice/updateStepDataSlice';
import LabeledTextFieldWithVerifyUpdate from './CommonComponnet/LabeledTextFieldWithVerifyUpdate';
import OTPModalUpdateEntity from './CommonComponnet/OtpModalUpdateEntity';
import SuccessModalUpdate from './CommonComponnet/SuccessModalUpdate';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import { buildValidationSchema, validateAllFields } from './formValidation';
import {
  validateField,
  getProofOfIdentityValidation,
} from '../slice/formSlice';
import {
  ValidationUtils,
  maxLengthByIdType,
} from '../../../../utils/validationUtils';
import * as Yup from 'yup';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';
import { OTPSend } from '../../Authenticate/slice/authSlice';

import { FormField } from './types/formTypesUpdate';
import { Box, Alert } from '@mui/material';

// Helper function to get mobile validation rules based on conditional logic and country code
const getMobileValidationRules = (
  field: FormField,
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
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
  useRef,
} from 'react';
import UpdateFormAccordion from './UpdateFormAccordion';
import { useFieldError } from '../context/FieldErrorContext';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import LabeledDropDownUpdate from './CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from './CommonComponnet/LabledTextFieldUpdate';
import LabeledTextFieldWithUploadUpdate from './CommonComponnet/LableledTextFieldWithUploadUpdate';
import { submitUpdatedNodalOfficerDetails } from './slice/updateNodalOfficerSubmissionSlice';

interface StepProps {
  onSaveAndNext: () => void;
}

interface FormData {
  [key: string]: string | File | null | number | boolean | object;
}

interface DropDownOption {
  code: string;
  status?: string;
  name: string;
  isocode?: string;
}
interface DropDownHoi {
  code: string;
  status: string;
  name: string;
}

interface DocumentData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
}

// Memoized field renderer to prevent unnecessary re-renders
interface FieldRendererProps {
  field: FormField;
  value: string | File | null | number | boolean | object;
  validationError?: string;
  validationErrors?: Record<string, string>; // Add full validation errors object
  existingDocument?: DocumentData;
  evaluatedValidationRules?: any;
  onTextChange: (fieldName: string, value: string) => void;
  onDropdownChange: (fieldName: string, value: string | number) => void;
  onDateChange: (fieldName: string, value: string | null) => void;
  onFileUpload: (fieldName: string | undefined, file: File | null) => void;
  onGenericChange: (
    fieldName: string,
    value: string | ChangeEvent<HTMLInputElement>
  ) => void;
  getFieldError: (fieldName: string) => string | undefined;
  getDocumentData: (fieldName: string) => DocumentData | undefined;
  checkIfFileExists: (fieldName: string) => boolean;
  getDocumentId: (fieldName: string) => string;
  onDeleteDocument: (documentId: string) => void;
  isAddMode: boolean;
  isCkycVerified: boolean;
  formData: FormData;
  onCkycVerified: (field: FormField, data: any) => void;
  onCkycVerificationRequired: (required: boolean) => void;
  dropdownData: any;
  allFormFields: FormField[];
  autoPopulatedFields: Set<string>;
}
const FieldRenderer = memo<FieldRendererProps>(
  ({
    field,
    value,
    validationError,
    validationErrors,
    existingDocument,
    evaluatedValidationRules,
    onTextChange,
    onDropdownChange,
    onDateChange,
    onFileUpload,
    onGenericChange,
    getFieldError,
    getDocumentData,
    checkIfFileExists,
    getDocumentId,
    onDeleteDocument,
    isAddMode,
    isCkycVerified,
    formData,
    onCkycVerified,
    onCkycVerificationRequired,
    dropdownData,
    allFormFields,
    autoPopulatedFields,
  }) => {
    // Detect any field that represents an “Other” input specifically for Pin Code.

    // Works for camelCase (noRegisterPincodeOther), snake_case (no_register_pincode_other) or any mix.

    const fieldNameLower = field.fieldName.toLowerCase();

    const isPincodeOtherField =
      fieldNameLower.includes('pincode') && fieldNameLower.includes('other');

    if (isPincodeOtherField) {
      // Extract the prefix to find the corresponding main pincode field

      let mainPincodeFieldName = '';

      // Generic derivation: strip the word “Other” (and trailing underscores) to get the corresponding main pincode field key.

      // Examples:

      //   noRegisterPincodeOther   -> noRegisterPincode

      //   no_register_pincode_other -> no_register_pincode

      //   registerPincodeOther     -> registerPincode

      // This avoids hard-coding every possible prefix.

      mainPincodeFieldName = field.fieldName

        .replace(/_?other$/i, '') // remove suffix _other / Other

        .replace(/other$/i, '') // remove plain Other at end

        .replace(/_+$/g, ''); // clean trailing underscores

      const mainPincodeValue = formData[mainPincodeFieldName];

      const shouldShowOtherField = String(mainPincodeValue || '')
        .toLowerCase()
        .includes('other');
    }
    const apiFieldError = getFieldError(field.fieldName);

    // Check if field should be disabled based on mode and CKYC verification
    const isFieldAutoDisabled = (): boolean => {
      const fieldName = field.fieldName;
      // Case-insensitive comparison for Indian citizenship
      const isIndianCitizen =
        String(formData['noCitizenship'] ?? '').toLowerCase() === 'indian';
      const hasCitizenshipValue = !!formData['noCitizenship'];

      // Check if this field is an address field
      const fieldNameLower = fieldName.toLowerCase();
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
        return true;
      }

      // Special handling for CKYC field
      if (fieldName === 'noCkycNumber') {
        if (!isAddMode) {
          return true;
        }
        // In add mode: CKYC field is enabled when citizenship is empty OR "Indian"
        // Disabled ONLY if citizenship is selected AND not "Indian"
        const citizenship = formData['noCitizenship'];
        const isDisabled = !!(citizenship && citizenship !== 'Indian');

        return isDisabled;
      }

      // Citizenship field is always enabled in add mode
      if (fieldName === 'noCitizenship') {
        if (isAddMode) {
          return false;
        }

        return true;
      }

      // If NOT in add mode (viewing existing data), all fields are disabled
      if (!isAddMode) {
        return true;
      }

      // In Add Mode - check if citizenship is selected
      if (!hasCitizenshipValue) {
        // No citizenship selected: disable all fields except citizenship and CKYC

        return true;
      }

      // Citizenship is selected - check if it's Indian
      if (isIndianCitizen) {
        // First, check if this field was auto-populated from CKYC verification
        // Auto-populated fields should remain disabled regardless of current verification status
        const isAutoPopulatedField = autoPopulatedFields.has(fieldName);

        if (isAutoPopulatedField) {
          return true;
        }

        // For non-auto-populated fields, check if CKYC is verified
        if (!isCkycVerified) {
          return true;
        }

        // CKYC verified and field is not auto-populated: enable the field

        return false;
      }

      // Non-Indian citizenship: all fields enabled (except CKYC which is handled above)

      return false;
    };

    const shouldDisableField = isFieldAutoDisabled();

    // Use evaluated validation rules
    const validationRules = evaluatedValidationRules || field.validationRules;

    let fileError = '';
    let apiFileError = '';
    let documentId = '';
    let fileExistsForField = false;

    if (field.fieldType === 'textfield_with_image') {
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      documentId = getDocumentId(fileFieldName);
      fileExistsForField = checkIfFileExists(fileFieldName);

      // Get file-specific validation error from validationErrors object
      const fileValidationError = validationErrors?.[fileFieldName] || '';
      apiFileError = getFieldError(fileFieldName) || '';
      fileError = fileValidationError || apiFileError || '';
    } else if (field.fieldType === 'file') {
      documentId = getDocumentId(field.fieldName);
      fileExistsForField = checkIfFileExists(field.fieldName);
      apiFileError = getFieldError(field.fieldName) || '';
      fileError = validationError || apiFileError || '';
    }

    // For textfield_with_image, show text field error on text input
    // File error will be handled separately within the component
    const textError = validationError || apiFieldError;
    let displayError = textError
      ? typeof textError === 'string'
        ? textError
        : JSON.stringify(textError)
      : undefined;

    // For file fields, use the combined error
    if (field.fieldType === 'file') {
      const rawError = validationError || apiFieldError || fileError;
      displayError = rawError
        ? typeof rawError === 'string'
          ? rawError
          : JSON.stringify(rawError)
        : undefined;
    }

    // Check if field is a mobile field
    const isMobileField = /(mobile|phone)/i.test(field.fieldName);

    // Determine country code for mobile validation based on field context
    const countryCodeField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('countrycode')
    );
    const countryCodeValue = countryCodeField
      ? String(formData[countryCodeField] || '').toLowerCase()
      : '';
    const isIndianCountryCode = ['+91', '91', 'india'].some((v) =>
      countryCodeValue.includes(v)
    );

    // Get mobile validation rules based on conditional logic and country code
    const mobileRules = isMobileField
      ? getMobileValidationRules(field, isIndianCountryCode)
      : null;

    // Check if Country is India for address field conditional validation
    const registerCountryValue = String(
      formData['noRegisterCountry'] || ''
    ).toUpperCase();
    const isIndiaCountry = registerCountryValue === 'INDIA';

    // Get conditional validation rules based on country selection
    const getConditionalValidationRules = () => {
      // Fields that have conditional validation based on country
      const conditionalFields = [
        'noRegisterState',
        'noRegisterDistrict',
        'noRegisterCity',
        'noRegisterPincode',
      ];

      if (
        conditionalFields.includes(field.fieldName) &&
        field.conditionalLogic
      ) {
        const condition = field.conditionalLogic[0];
        if (condition) {
          if (isIndiaCountry && condition.then?.validationRules) {
            return condition.then.validationRules;
          } else if (!isIndiaCountry && condition.else?.validationRules) {
            return condition.else.validationRules;
          }
        }
      }
      return validationRules;
    };

    // Get the effective validation rules (conditional or default)
    const effectiveValidationRules = getConditionalValidationRules();

    switch (field.fieldType) {
      case 'textfield': {
        // Get appropriate placeholder - use mobile rules placeholder for mobile fields
        const fieldPlaceholder =
          isMobileField && mobileRules
            ? mobileRules.placeholder
            : field.fieldPlaceholder || '';

        // Enable instant validation for designation, email and mobile fields
        const isDesignationField = field.fieldName
          .toLowerCase()
          .includes('designation');
        const isEmailField = field.fieldName.toLowerCase().includes('email');
        const isMobileNumberField = field.fieldName
          .toLowerCase()
          .includes('mobile');
        const enableInstantValidation =
          isDesignationField || isEmailField || isMobileNumberField;

        // Use effective validation rules (handles conditional validation for address fields)
        const activeRules = effectiveValidationRules;

        // Check if this is Proof of Identity Number field
        const isProofOfIdentityNumberField =
          field.fieldName === 'noProofOfIdentityNumber' ||
          field.fieldName.toLowerCase().includes('proofofidentitynumber');

        // Find the corresponding proof of identity field name
        // Remove "Number" but keep any trailing digits
        // E.g., "noProofOfIdentityNumber2" -> "noProofOfIdentity2"
        const proofFieldName = field.fieldName.replace(/Number(\d*)$/, '$1');
        const proofType = String(
          formData[proofFieldName] || formData['noProofOfIdentity'] || ''
        ).toUpperCase();

        // Use centralized validation function for POI fields
        const proofValidation = isProofOfIdentityNumberField
          ? getProofOfIdentityValidation(proofType)
          : null;

        const proofMaxLength = proofValidation?.maxLength;
        const proofMinLength = proofValidation?.minLength;
        const proofRegx = proofValidation?.regx;
        const proofRegxMessage = proofValidation?.regxMessage;
        const proofMinLengthMessage = proofValidation?.minLengthMessage;
        const proofMaxLengthMessage = proofValidation?.maxLengthMessage;
        const proofInputType: 'text' | 'tel' =
          proofType === 'AADHAAR' ||
          proofType === 'AADHAR CARD' ||
          proofType === 'AADHAAR CARD'
            ? 'tel'
            : 'text';

        // Determine input type based on field name
        const inputType = field.fieldName.includes('email')
          ? 'email'
          : isProofOfIdentityNumberField && proofInputType === 'tel'
            ? 'tel'
            : 'text';

        // Generate a unique key that includes proof type for re-rendering
        const fieldKey = isProofOfIdentityNumberField
          ? `${field.id}-${proofType}`
          : field.id;

        // Dynamic label for POI Number field based on selected proof type
        const getDynamicLabel = () => {
          if (!isProofOfIdentityNumberField || !proofType) {
            return field.fieldLabel;
          }
          // Format the proof type for display (e.g., "DRIVING LICENSE" -> "Driving License")
          const formattedProofType = proofType
            .split(/[_\s]+/)
            .map(
              (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');
          return `Proof of Identity ${formattedProofType}`;
        };

        return (
          <LabeledTextFieldUpdate
            key={fieldKey}
            label={getDynamicLabel()}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            placeholder={fieldPlaceholder}
            required={activeRules?.required || false}
            minLength={
              isProofOfIdentityNumberField && proofMinLength
                ? proofMinLength
                : isMobileField && mobileRules?.minLength
                  ? parseInt(mobileRules.minLength)
                  : activeRules?.minLength
                    ? parseInt(activeRules.minLength)
                    : undefined
            }
            maxLength={
              isProofOfIdentityNumberField && proofMaxLength
                ? proofMaxLength
                : isMobileField && mobileRules?.maxLength
                  ? parseInt(mobileRules.maxLength)
                  : activeRules?.maxLength
                    ? parseInt(activeRules.maxLength)
                    : undefined
            }
            regx={
              isProofOfIdentityNumberField
                ? proofRegx
                : isMobileField && mobileRules?.pattern
                  ? mobileRules.pattern
                  : activeRules?.regx
            }
            requiredMessage={
              isMobileField && mobileRules?.requiredMessage
                ? mobileRules.requiredMessage
                : activeRules?.requiredMessage
            }
            regxMessage={
              isProofOfIdentityNumberField
                ? proofRegxMessage
                : isMobileField && mobileRules?.patternMessage
                  ? mobileRules.patternMessage
                  : activeRules?.regxMessage
            }
            minLengthMessage={
              isProofOfIdentityNumberField
                ? proofMinLengthMessage
                : isMobileField && mobileRules?.minLengthMessage
                  ? mobileRules.minLengthMessage
                  : activeRules?.minLengthMessage
            }
            maxLengthMessage={
              isProofOfIdentityNumberField
                ? proofMaxLengthMessage
                : isMobileField && mobileRules?.maxLengthMessage
                  ? mobileRules.maxLengthMessage
                  : activeRules?.maxLengthMessage
            }
            instantValidation={enableInstantValidation}
            disabled={shouldDisableField}
            error={!!displayError}
            helperText={displayError}
            type={inputType}
          />
        );
      }

      case 'dropdown': {
        let options: { label: string; value: string }[] = [];

        // Special formatting for Country Code dropdown
        const isCountryCodeField = field.fieldName === 'noCountryCode';

        // Check if this is an external API dropdown with dynamic options
        if (field.fieldAttributes?.type === 'external_api') {
          // Get options from Redux dropdown data if available
          const dynamicOptions = dropdownData[field.fieldName]?.options || [];
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
                value:
                  option.value ||
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
              value:
                option.value ||
                option.code ||
                option.isocode ||
                `option_${index}`,
            })) || [];
        }
        const isPincodeField =
          field.fieldName.toLowerCase().includes('pincode') &&
          !field.fieldName.toLowerCase().includes('other');

        if (isPincodeField) {
          // Check if "Other" option already exists

          const hasOtherOption = options.some(
            (opt) =>
              String(opt.value).toLowerCase() === 'other' ||
              String(opt.label).toLowerCase() === 'other'
          );

          if (!hasOtherOption) {
            options = [...options, { label: 'Other', value: 'Other' }];
          }
        }

        // Use effective validation rules for conditional required state
        const activeDropdownRules = effectiveValidationRules;

        return (
          <LabeledDropDownUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onDropdownChange(field.fieldName, newValue)}
            options={options}
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={activeDropdownRules?.required || false}
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

        // For Board Resolution fields, only allow past dates (not today)
        const isBoardResolutionField =
          (field.fieldLabel?.toLowerCase().includes('board') &&
            field.fieldLabel?.toLowerCase().includes('resolution')) ||
          field.fieldName.toLowerCase().includes('boardresolution') ||
          field.fieldName.toLowerCase().includes('boardresoluation'); // Handle typo in fieldName

        let minDateValue: string | undefined;
        let maxDateValue: string | undefined;

        const today = new Date();

        if (isDobField) {
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
        } else if (isBoardResolutionField) {
          // Max date: yesterday (only past dates allowed, not today)
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          maxDateValue = yesterday.toLocaleDateString('en-CA'); // → YYYY-MM-DD
        }

        return (
          <LabeledDateUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onDateChange(field.fieldName, newValue)}
            fieldName={field.fieldName}
            required={validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            disabled={shouldDisableField}
            minDate={minDateValue}
            maxDate={maxDateValue}
          />
        );
      }

      case 'textfield_with_verify': {
        // Case-insensitive comparison for Indian citizenship
        const isIndianCitizen =
          String(formData['noCitizenship'] ?? '').toLowerCase() === 'indian';
        const isCkycField = field.fieldName === 'noCkycNumber';
        const shouldDisableVerify = isCkycField && !isIndianCitizen;

        return (
          <LabeledTextFieldWithVerifyUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            placeholder={field.fieldPlaceholder}
            required={validationRules?.required || false}
            minLength={
              validationRules?.minLength
                ? parseInt(validationRules.minLength)
                : undefined
            }
            maxLength={
              validationRules?.maxLength
                ? parseInt(validationRules.maxLength)
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
            isPreVerified={isIndianCitizen && isCkycVerified && !!value}
            showVerifyOnlyAfterChange={false}
            onVerificationRequired={onCkycVerificationRequired}
            onSubmitOtp={async (otp: string) => {
              return true;
            }}
            onOtpVerified={(data: any) => {
              // Call the parent callback to handle state updates
              onCkycVerified(field, data);
            }}
            onVerify={async () => {
              return true;
            }}
          />
        );
      }

      case 'textfield_with_image': {
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        const existingDoc = getDocumentData(fileFieldName);

        const fileValidationRules =
          validationRules?.validationFile || validationRules;
        // Show file error if no text error exists
        const errorToShow = displayError || fileError;

        // Check if this is Proof of Identity Number field
        const isProofOfIdentityNumberField =
          field.fieldName === 'noProofOfIdentityNumber' ||
          field.fieldName.toLowerCase().includes('proofofidentitynumber');

        // Find the corresponding proof of identity field name
        // Remove "Number" but keep any trailing digits
        // E.g., "iauProofOfIdentityNumber2" -> "iauProofOfIdentity2"
        const proofFieldName = field.fieldName.replace(/Number(\d*)$/, '$1');
        const proofType = String(
          formData[proofFieldName] || formData['noProofOfIdentity'] || ''
        ).toUpperCase();

        // Use centralized validation function for POI fields
        const proofValidation = isProofOfIdentityNumberField
          ? getProofOfIdentityValidation(proofType)
          : null;

        const proofMaxLength = proofValidation?.maxLength;
        const proofMinLength = proofValidation?.minLength;
        const proofRegx = proofValidation?.regx;
        const proofRegxMessage = proofValidation?.regxMessage;
        const proofMinLengthMessage = proofValidation?.minLengthMessage;
        const proofMaxLengthMessage = proofValidation?.maxLengthMessage;

        const fieldKey = isProofOfIdentityNumberField
          ? `${field.id}-${proofType}`
          : field.id;

        // Dynamic label for POI Number field based on selected proof type
        const getDynamicLabel = () => {
          if (!isProofOfIdentityNumberField || !proofType) {
            return field.fieldLabel;
          }
          // Format the proof type for display (e.g., "DRIVING LICENSE" -> "Driving License")
          const formattedProofType = proofType
            .split(/[_\s]+/)
            .map(
              (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');
          return `Proof of Identity ${formattedProofType}`;
        };

        return (
          <LabeledTextFieldWithUploadUpdate
            key={fieldKey}
            label={getDynamicLabel()}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            onUpload={(file) => onFileUpload(field.fieldFileName, file)}
            placeholder={field.fieldPlaceholder}
            required={validationRules?.required || false}
            minLength={
              isProofOfIdentityNumberField && proofMinLength
                ? proofMinLength
                : validationRules?.minLength
                  ? parseInt(validationRules.minLength)
                  : undefined
            }
            maxLength={
              isProofOfIdentityNumberField && proofMaxLength
                ? proofMaxLength
                : validationRules?.maxLength
                  ? parseInt(validationRules.maxLength)
                  : undefined
            }
            regx={
              isProofOfIdentityNumberField ? proofRegx : validationRules?.regx
            }
            regxMessage={
              isProofOfIdentityNumberField
                ? proofRegxMessage
                : validationRules?.regxMessage
            }
            minLengthMessage={
              isProofOfIdentityNumberField
                ? proofMinLengthMessage
                : validationRules?.minLengthMessage
            }
            maxLengthMessage={
              isProofOfIdentityNumberField
                ? proofMaxLengthMessage
                : validationRules?.maxLengthMessage
            }
            error={!!errorToShow}
            helperText={errorToShow}
            accept={
              fileValidationRules?.imageFormat
                ?.map((format: any) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={fileValidationRules || undefined}
            onValidationError={(error) => {
              console.log('File validation error:', error);
            }}
            disabled={shouldDisableField}
            existingDocument={existingDoc}
            showExistingDocument={!!existingDoc}
            trackStatusShow={false}
            onDelete={
              existingDoc ? () => onDeleteDocument(existingDoc.id) : undefined
            }
          />
        );
      }

      case 'file': {
        const fileFieldName = field.fieldName || `${field.fieldName}_file`;
        const existingDoc = getDocumentData(fileFieldName);
        const fileValidationRules =
          validationRules?.validationFile || validationRules;
        return (
          <div>
            <UploadButtonUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              onUpload={(file) => onFileUpload(field.fieldName, file)}
              required={validationRules?.required || false}
              accept={
                fileValidationRules?.imageFormat
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              existingDocument={existingDoc}
              showExistingDocument={!!existingDoc}
              disabled={shouldDisableField}
              validationRules={validationRules}
              onValidationError={(error) => {}}
              onDelete={
                existingDoc ? () => onDeleteDocument(existingDoc.id) : undefined
              }
            />
            {value && typeof value !== 'string' && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                Selected: {(value as File).name}
              </div>
            )}
            {displayError && (
              <div
                style={{ marginTop: '8px', fontSize: '12px', color: '#d32f2f' }}
              >
                {displayError}
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
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these specific props change
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.value === nextProps.value &&
      prevProps.validationError === nextProps.validationError &&
      prevProps.validationErrors === nextProps.validationErrors &&
      prevProps.existingDocument === nextProps.existingDocument &&
      prevProps.evaluatedValidationRules ===
        nextProps.evaluatedValidationRules &&
      prevProps.isAddMode === nextProps.isAddMode &&
      prevProps.isCkycVerified === nextProps.isCkycVerified &&
      prevProps.formData['noCitizenship'] ===
        nextProps.formData['noCitizenship'] &&
      // Check for proof of identity change to update maxLength dynamically
      prevProps.formData['noProofOfIdentity'] ===
        nextProps.formData['noProofOfIdentity'] &&
      // Check for pincode fields dynamically
      Object.keys(prevProps.formData)
        .filter((k) => k.toLowerCase().includes('pincode'))
        .every((k) => prevProps.formData[k] === nextProps.formData[k]) &&
      // Check for office address field dynamically
      Object.keys(prevProps.formData)
        .filter((k) => k.toLowerCase().includes('officeaddress'))
        .every((k) => prevProps.formData[k] === nextProps.formData[k]) &&
      prevProps.dropdownData === nextProps.dropdownData &&
      prevProps.allFormFields === nextProps.allFormFields &&
      prevProps.autoPopulatedFields === nextProps.autoPopulatedFields
    );
  }
);

FieldRenderer.displayName = 'FieldRenderer';

const UpdateNodalOfficerStep: React.FC<StepProps> = ({ onSaveAndNext }) => {
  const [nodalFormFields, setNodalFormFields] = useState<FormField[]>([]);
  const [configuration, setConfiguration] = useState<any>();
  const { getFieldError } = useFieldError();
  const [existingDocuments, setExistingDocuments] = useState<
    Record<string, string>
  >({});
  const [existingDocumentData, setExistingDocumentData] = useState<
    Record<string, DocumentData>
  >({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isCkycVerified, setIsCkycVerified] = useState(false);
  const [isCkycVerificationRequired, setIsCkycVerificationRequired] =
    useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(
    new Set()
  );

  // Use ref to track fetched documents to prevent re-fetching (same as UpdateEntityProfileStep)
  const fetchedDocumentIdsRef = useRef<Set<string>>(new Set());

  // Track original mobile/email values and changes
  const [originalMobile, setOriginalMobile] = useState<string>('');
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [isMobileChanged, setIsMobileChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isOtpValidated, setIsOtpValidated] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');

  // Success modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successTitle, setSuccessTitle] = useState<string>('');

  // Redux selectors
  const stepData = useSelector(
    (state: any) => state.updateNodalOfficer.stepData
  );
  const stepDocuments = useSelector(
    (state: any) => state.updateNodalOfficer.documents
  );
  // Use shared updateStepData for fetched documents (same as UpdateAdminUserDetailsStep)
  const fetchedDocuments = useSelector(
    (state: any) => state.updateStepData.fetchedDocuments
  );
  const fields = useSelector((state: any) => state.updateNodalOfficer.fields);
  const config = useSelector(
    (state: any) => state.updateNodalOfficer.configuration
  );
  const loading = useSelector(selectNodalStepDataLoading);
  const dropdownData = useSelector(selectNodalDropdownData);
  const registrationAddresses = useSelector(selectRegistrationAddresses);

  // Get workflowId from updateWorkflow slice
  const workflowId = useSelector(
    (state: RootState) => state.updateWorkflow.workflowId
  );

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  // Get groupMembership from auth state
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership
  );

  // Determine if user can add a new Nodal Officer based on their role
  // Nodal_Officer: CANNOT add new Nodal Officer
  // Institutional_Admin_User with IAU_1 or IAU_2: CAN add new Nodal Officer
  const canAddNodalOfficer = useMemo(() => {
    const userGroup = groupMembership?.[0] || '';
    const userType = userDetails?.role || '';

    // Only IAU_1 or IAU_2 can add new Nodal Officer
    if (
      userGroup === 'Institutional_Admin_User' &&
      (userType === 'IAU_1' || userType === 'IAU_2')
    ) {
      return true;
    }

    // All other cases (including Nodal_Officer): cannot add

    return false;
  }, [groupMembership, userDetails?.role]);

  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({});
  const formDataRef = useRef<FormData>(formData);
  const previousCascadingValuesRef = useRef<Record<string, any>>({});
  const previousCitizenshipRef = useRef<string | undefined>(undefined);

  // Keep ref in sync with formData
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [validationSchema, setValidationSchema] = useState<Yup.ObjectSchema<
    Record<string, unknown>
  > | null>(null);
  const validationSchemaBuilder = useMemo(() => buildValidationSchema, []);

  useEffect(() => {
    const userId = userDetails?.userId || 'NO_0000';

    dispatch(
      fetchStepDataNodal({
        stepKey: 'nodalOfficer',
        userId: userId,
      })
    );

    dispatch(fetchFormFieldsNodal());

    // Fetch registration addresses for "Same as" dropdown functionality
    dispatch(fetchRegistrationAddresses({ userId }));
  }, [dispatch, userDetails?.userId]);

  useEffect(() => {
    if (fields && fields.length > 0 && !loading) {
      setNodalFormFields(fields);
      setIsDataLoaded(true);
    }
  }, [fields, loading]);

  useEffect(() => {
    if (config && !loading) {
      setConfiguration(config);
    }
  }, [config, loading]);

  // Build validation schema when form fields are loaded
  useEffect(() => {
    if (nodalFormFields && nodalFormFields.length > 0) {
      const schema = validationSchemaBuilder(nodalFormFields);
      setValidationSchema(schema);
    }
  }, [nodalFormFields, validationSchemaBuilder]);

  useEffect(() => {
    if (
      stepData &&
      Object.keys(stepData).length > 0 &&
      !loading &&
      isDataLoaded &&
      !isAddMode
    ) {
      const initialFormData: FormData = {};

      Object.entries(stepData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          initialFormData[key] = value;
        }
      });

      setFormData(initialFormData);
    }
  }, [stepData, loading, isDataLoaded, isAddMode]);

  // Store original mobile/email values when data loads
  useEffect(() => {
    if (
      stepData &&
      Object.keys(stepData).length > 0 &&
      !loading &&
      isDataLoaded &&
      !isAddMode
    ) {
      // Find mobile and email fields dynamically
      const mobileField = Object.keys(stepData).find((key) =>
        key.toLowerCase().includes('mobile')
      );
      const emailField = Object.keys(stepData).find(
        (key) =>
          key.toLowerCase().includes('email') &&
          !key.toLowerCase().includes('mobile')
      );

      const mobile = mobileField ? (stepData[mobileField] as string) : '';
      const email = emailField ? (stepData[emailField] as string) : '';

      if (mobile) {
        setOriginalMobile(mobile);
      }
      if (email) {
        setOriginalEmail(email);
      }
    }
  }, [stepData, loading, isDataLoaded, isAddMode]);

  // Auto-verify CKYC if citizenship is Indian and CKYC number exists
  useEffect(() => {
    if (
      stepData &&
      Object.keys(stepData).length > 0 &&
      !loading &&
      isDataLoaded &&
      !isAddMode
    ) {
      const citizenship = stepData['noCitizenship'];
      const ckycNumber = stepData['noCkycNumber'];

      // Check if citizenship is Indian and CKYC number exists
      const isIndian = String(citizenship ?? '').toLowerCase() === 'indian';
      const hasCkycNumber = !!ckycNumber && String(ckycNumber).trim() !== '';

      if (isIndian && hasCkycNumber) {
        setIsCkycVerified(true);

        // Find the CKYC field to get its autoPopulate configuration
        const ckycFormField = nodalFormFields.find(
          (f) => f.fieldName === 'noCkycNumber'
        );

        const autoPopulateFields =
          ckycFormField?.conditionalLogic?.[0]?.then?.fieldAttributes
            ?.autoPopulate || [];

        // Track ALL fields from autoPopulate config for disabling
        const ckycAutopopulatedFields = new Set<string>();
        autoPopulateFields.forEach((fieldName: string) => {
          // Add all fields from autoPopulate config, regardless of whether they have values
          // This ensures fields like middleName are disabled even if they're empty
          ckycAutopopulatedFields.add(fieldName);
        });

        setAutoPopulatedFields(ckycAutopopulatedFields);
      }
    }
  }, [stepData, loading, isDataLoaded, isAddMode, nodalFormFields]);

  // Helper function to find field by name
  const findFieldByName = useCallback(
    (fieldName: string): FormField | null => {
      const field = nodalFormFields.find((f) => f.fieldName === fieldName);
      return field || null;
    },
    [nodalFormFields]
  );

  // Evaluate conditional logic based on formData
  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return field.validationRules;
      }
      let rules = { ...field.validationRules };
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

        // For citizenship field, do case-insensitive comparison
        const isCitizenshipField = when.field === 'noCitizenship';

        switch (operator) {
          case 'in':
          case 'equals':
            if (isCitizenshipField) {
              conditionMatches = expectedValues
                .map((v) => String(v).toLowerCase())
                .includes(String(dependentValue ?? '').toLowerCase());
            } else {
              conditionMatches = expectedValues
                .map(String)
                .includes(String(dependentValue ?? ''));
            }
            break;
          case 'not_in':
          case 'not_equals':
            if (isCitizenshipField) {
              conditionMatches = !expectedValues
                .map((v) => String(v).toLowerCase())
                .includes(String(dependentValue ?? '').toLowerCase());
            } else {
              conditionMatches = !expectedValues
                .map(String)
                .includes(String(dependentValue ?? ''));
            }
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
        }

        // If condition matches, use "then" rules
        if (conditionMatches && logic.then?.validationRules) {
          rules = {
            ...rules,
            ...logic.then.validationRules,
          };
          continue;
        }

        // Initialize rules with the field's base validation rules
        if (!conditionMatches && logic.else?.validationRules) {
          rules = {
            ...rules,
            ...logic.else.validationRules,
          };
          continue;
        }
      }

      return rules;
    },
    [formData]
  );

  useEffect(() => {
    if (nodalFormFields.length > 0 && !loading) {
      const fieldsWithConditionalLogic = nodalFormFields.map((field) => ({
        ...field,
        validationRules: evaluateConditionalLogic(field),
      }));

      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    }
  }, [
    nodalFormFields,
    validationSchemaBuilder,
    evaluateConditionalLogic,
    loading,
  ]);

  // Reset auto-populated fields and CKYC when citizenship changes (single Nodal Officer)
  useEffect(() => {
    const citizenship = formData['noCitizenship'] as string;
    const previousCitizenship = previousCitizenshipRef.current;

    // Only proceed if citizenship has actually changed
    if (!citizenship || citizenship === previousCitizenship) {
      // Update ref and exit
      previousCitizenshipRef.current = citizenship;
      return;
    }

    // Case-insensitive comparison for Indian citizenship
    const isIndianCitizen =
      String(citizenship ?? '').toLowerCase() === 'indian';

    const currentAutoPopulatedFields = autoPopulatedFields || new Set<string>();

    if (!isIndianCitizen) {
      // Citizenship changed to non-Indian
      if (
        currentAutoPopulatedFields.size > 0 ||
        previousCitizenship === 'Indian'
      ) {
        setFormData((prev) => {
          const clearedData = { ...prev };

          // Clear all auto-populated fields
          currentAutoPopulatedFields.forEach((fieldName) => {
            clearedData[fieldName] = '';
          });

          // Also clear CKYC number
          clearedData['noCkycNumber'] = '';

          return clearedData;
        });
      }

      // Reset tracking and CKYC status
      setAutoPopulatedFields(new Set());
      setIsCkycVerified(false);
    } else {
      // Citizenship changed to Indian
      // Only clear fields and reset CKYC if this is a user-initiated change (previousCitizenship was set)
      // Not on initial data load (when previousCitizenship is undefined/null)
      if (previousCitizenship) {
        if (currentAutoPopulatedFields.size > 0) {
          setFormData((prev) => {
            const clearedData = { ...prev };

            // Clear values for auto-populated fields but keep them tracked
            currentAutoPopulatedFields.forEach((fieldName) => {
              clearedData[fieldName] = '';
            });

            return clearedData;
          });
        }

        // Reset CKYC verification status only on user-initiated citizenship change
        // Not on initial data load
        setIsCkycVerified(false);
      }
    }

    // Update previous citizenship value
    previousCitizenshipRef.current = citizenship;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData['noCitizenship'], autoPopulatedFields]);

  // Monitor CKYC verification status changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCkycVerified]);

  // Monitor form data changes to track autopopulation

  // Dynamic cascading dropdown logic - only fetch when cascading field values actually change
  useEffect(() => {
    if (!isDataLoaded || nodalFormFields.length === 0) return;

    // Extract current cascading field values
    const currentCascadingValues: Record<string, any> = {};
    nodalFormFields.forEach((field) => {
      const fieldNameLower = field.fieldName.toLowerCase();
      if (
        fieldNameLower.includes('country') ||
        fieldNameLower.includes('state') ||
        fieldNameLower.includes('district')
      ) {
        currentCascadingValues[field.fieldName] = formData[field.fieldName];
      }
    });

    // Check if any cascading field value has actually changed
    let hasChanged = false;
    for (const fieldName in currentCascadingValues) {
      if (
        previousCascadingValuesRef.current[fieldName] !==
        currentCascadingValues[fieldName]
      ) {
        hasChanged = true;
        break;
      }
    }

    // Only proceed if cascading fields have changed
    if (
      !hasChanged &&
      Object.keys(previousCascadingValuesRef.current).length > 0
    ) {
      return;
    }

    // Update the ref with current values
    previousCascadingValuesRef.current = currentCascadingValues;

    const cascadingFields: Array<{
      field: FormField;
      keyword: string;
      dependsOn: string | null;
    }> = [];

    nodalFormFields.forEach((field) => {
      if (
        field.fieldType !== 'dropdown' ||
        field.fieldAttributes?.type !== 'external_api'
      ) {
        return;
      }

      const fieldNameLower = field.fieldName.toLowerCase();

      if (fieldNameLower.includes('state')) {
        const dependsOnField = nodalFormFields.find(
          (f) =>
            f.fieldName.toLowerCase().includes('country') &&
            field.fieldName.toLowerCase().replace('state', 'country') ===
              f.fieldName.toLowerCase()
        );
        cascadingFields.push({
          field,
          keyword: 'state',
          dependsOn: dependsOnField?.fieldName || null,
        });
      } else if (fieldNameLower.includes('district')) {
        const dependsOnField = nodalFormFields.find(
          (f) =>
            f.fieldName.toLowerCase().includes('state') &&
            field.fieldName.toLowerCase().replace('district', 'state') ===
              f.fieldName.toLowerCase()
        );
        cascadingFields.push({
          field,
          keyword: 'district',
          dependsOn: dependsOnField?.fieldName || null,
        });
      } else if (
        fieldNameLower.includes('pincode') ||
        fieldNameLower.includes('pin')
      ) {
        const dependsOnField = nodalFormFields.find(
          (f) =>
            f.fieldName.toLowerCase().includes('district') &&
            (field.fieldName.toLowerCase().replace('pincode', 'district') ===
              f.fieldName.toLowerCase() ||
              field.fieldName.toLowerCase().replace('pin', 'district') ===
                f.fieldName.toLowerCase())
        );
        cascadingFields.push({
          field,
          keyword: 'pincode',
          dependsOn: dependsOnField?.fieldName || null,
        });
      }
    });

    cascadingFields.forEach(({ field, dependsOn }) => {
      if (!dependsOn || !field.fieldAttributes) return;

      const dependencyValue = formData[dependsOn];
      if (dependencyValue) {
        dispatch(
          fetchDropdownDataNodal({
            fieldName: field.fieldName,
            fieldAttributes: field.fieldAttributes,
            formData: formData,
          })
        );
      }
    });
  }, [formData, isDataLoaded, nodalFormFields, dispatch]);

  // Fetch documents when stepDocuments are available (same pattern as UpdateEntityProfileStep)
  useEffect(() => {
    if (Array.isArray(stepDocuments) && stepDocuments.length > 0 && !loading) {
      const documentsMap: Record<string, string> = {};

      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id) {
          documentsMap[doc.fieldKey] = doc.id;

          // Only fetch if not already fetched
          if (!fetchedDocumentIdsRef.current.has(doc.id)) {
            fetchedDocumentIdsRef.current.add(doc.id);

            dispatch(fetchDocument(doc.id));
          }
        }
      });

      setExistingDocuments(documentsMap);
    }
  }, [stepDocuments, loading, dispatch]);
  useEffect(() => {
    if (nodalFormFields.length > 0) {
      const pincodeFields = nodalFormFields.filter((f) =>
        f.fieldName.toLowerCase().includes('pincode')
      );
    }
  }, [nodalFormFields]);

  // Memoize document data to prevent unnecessary re-renders and image blinking (same as UpdateEntityProfileStep)
  const memoizedDocumentData = useMemo(() => {
    if (
      !Array.isArray(stepDocuments) ||
      stepDocuments.length === 0 ||
      !fetchedDocuments
    ) {
      return {};
    }

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

    return documentDataMap;
  }, [stepDocuments, fetchedDocuments]);

  // Only update state when memoized data actually changes (same as UpdateEntityProfileStep)
  useEffect(() => {
    if (Object.keys(memoizedDocumentData).length > 0) {
      setExistingDocumentData((prevData) => {
        // Check if data has actually changed to prevent unnecessary updates
        const hasChanged = Object.keys(memoizedDocumentData).some(
          (key) =>
            !prevData[key] ||
            prevData[key].dataUrl !== memoizedDocumentData[key].dataUrl
        );

        if (hasChanged) {
          return memoizedDocumentData;
        }

        return prevData;
      });
    }
  }, [memoizedDocumentData]);

  // Memoize individual document data to prevent image blinking (same as UpdateEntityProfileStep)
  const getDocumentData = useCallback(
    (fieldName: string): DocumentData | undefined => {
      return existingDocumentData[fieldName];
    },
    [existingDocumentData]
  );

  // Create a stable reference map for existingDocuments per field to prevent re-renders (same as UpdateEntityProfileStep)
  const stableDocumentRefs = useMemo(() => {
    const refs: Record<string, DocumentData> = {};
    Object.keys(existingDocumentData).forEach((key) => {
      refs[key] = existingDocumentData[key];
    });
    return refs;
  }, [existingDocumentData]);

  const handleTextChange = useCallback(
    (fieldName: string, value: string) => {
      let newValue = value;

      // Check if this is Proof of Identity Number field
      const isProofOfIdentityNumberField =
        fieldName === 'noProofOfIdentityNumber' ||
        fieldName.toLowerCase().includes('proofofidentitynumber');

      if (isProofOfIdentityNumberField) {
        // Find the corresponding proof of identity field name
        // Remove "Number" but keep any trailing digits
        // E.g., "noProofOfIdentityNumber2" -> "noProofOfIdentity2"
        const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
        const proofType = String(
          formDataRef.current[proofFieldName] ||
            formDataRef.current['noProofOfIdentity'] ||
            ''
        ).toUpperCase();

        console.log(`🔍 [TextChange] Proof of Identity Number field:`, {
          fieldName,
          proofFieldName,
          proofType,
          originalValue: value,
          valueLength: value.length,
        });

        // Apply validation based on proof type
        if (
          proofType === 'PAN CARD' ||
          proofType === 'PAN_CARD' ||
          proofType === 'PAN'
        ) {
          // PAN: uppercase, max 10 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.PAN_CARD);
        } else if (
          proofType === 'AADHAAR' ||
          proofType === 'AADHAR CARD' ||
          proofType === 'AADHAAR CARD'
        ) {
          // AADHAAR: only numeric, max 4 digits (last 4 of Aadhaar)
          newValue = newValue
            .replace(/\D/g, '')
            .slice(0, maxLengthByIdType.AADHAAR);
        } else if (
          proofType === 'VOTER ID' ||
          proofType === 'VOTER_ID' ||
          proofType === 'VOTERID'
        ) {
          // Voter ID: uppercase, max 10 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.VOTER_ID);
        } else if (
          proofType === 'DRIVING LICENSE' ||
          proofType === 'DRIVING_LICENSE' ||
          proofType === 'DRIVING LICENCE' ||
          proofType === 'DL'
        ) {
          // Driving License: uppercase, alphanumeric, max 18 characters
          newValue = newValue
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '')
            .slice(0, maxLengthByIdType.DRIVING_LICENSE);
        } else if (proofType === 'PASSPORT') {
          // Passport: uppercase, alphanumeric, max 9 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.PASSPORT);
        } else {
          // Default: just uppercase
          newValue = newValue.toUpperCase();
        }
      }

      const updatedFormData = {
        ...formDataRef.current,
        [fieldName]: newValue,
      };

      setFormData(updatedFormData);

      // Real-time validation: validate the field as user types
      const field = nodalFormFields.find((f) => f.fieldName === fieldName);
      if (field && newValue) {
        let error: string | null = null;

        // Special validation for Proof of Identity Number using ValidationUtils
        if (isProofOfIdentityNumberField) {
          const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
          const proofType = String(
            updatedFormData[proofFieldName] ||
              updatedFormData['noProofOfIdentity'] ||
              ''
          ).toUpperCase();

          console.log('🔍 [TextChange] Validation - Proof Type:', {
            proofType,
            newValue,
            fieldName,
          });

          // Check length first, then pattern validation
          switch (proofType) {
            case 'AADHAAR':
            case 'AADHAR CARD':
            case 'AADHAAR_CARD':
              // Aadhaar: 4 digits
              if (newValue.length !== maxLengthByIdType.AADHAAR) {
                error = 'Enter last 4 digits of Aadhar';
              } else if (!ValidationUtils.isValidAadhaar(newValue)) {
                error = 'Enter last 4 digits of Aadhar';
              }
              break;
            case 'PAN':
            case 'PAN CARD':
            case 'PAN_CARD':
              // PAN: exactly 10 characters
              if (newValue.length !== maxLengthByIdType.PAN_CARD) {
                error = 'PAN must be exactly 10 characters';
              } else if (!ValidationUtils.isValidPAN(newValue)) {
                error = 'Please enter valid PAN number (e.g., ABCPE1234F)';
              }
              break;
            case 'DRIVING LICENSE':
            case 'DRIVING_LICENSE':
            case 'DL':
              // Driving License: 15-18 characters
              if (
                newValue.length < 15 ||
                newValue.length > maxLengthByIdType.DRIVING_LICENSE
              ) {
                error = 'Driving License must be 15-18 characters';
              } else if (!ValidationUtils.isValidDrivingLicense(newValue)) {
                error =
                  'Invalid Driving License format (e.g., MH1420110062821)';
              }
              break;
            case 'PASSPORT':
              // Passport: exactly 8 characters
              if (newValue.length !== maxLengthByIdType.PASSPORT) {
                error = 'Passport must be exactly 8 characters';
              } else if (!ValidationUtils.isValidPassport(newValue)) {
                error = 'Please enter valid Passport number (e.g., A1234567)';
              }
              break;
            case 'VOTER ID':
            case 'VOTERID':
            case 'VOTER_ID':
              // Voter ID: exactly 10 characters
              if (newValue.length !== maxLengthByIdType.VOTER_ID) {
                error = 'Voter ID must be exactly 10 characters';
              } else if (!ValidationUtils.isValidVoterId(newValue)) {
                error = 'Please enter valid Voter ID (e.g., ABC1234567)';
              }
              break;
            default:
              // Default validation using formSlice
              error = validateField(field as any, newValue, updatedFormData);
          }
        } else {
          // Validate the field using formSlice validateField function
          error = validateField(field as any, newValue, updatedFormData);
        }

        if (error) {
          // Set error immediately
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: error as string,
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
        // Clear validation error if field is empty
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Track mobile/email changes
      if (fieldName.toLowerCase().includes('mobile')) {
        const hasChanged = newValue !== originalMobile;

        setIsMobileChanged(hasChanged);
        if (hasChanged) {
          setIsOtpValidated(false);
        }
      } else if (fieldName.toLowerCase().includes('email')) {
        const hasChanged = newValue !== originalEmail;

        setIsEmailChanged(hasChanged);
        if (hasChanged) {
          setIsOtpValidated(false);
        }
      }
    },
    [nodalFormFields, originalMobile, originalEmail]
  );

  const handleFileUpload = useCallback(
    (fieldName: string | undefined, file: File | null) => {
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
    },
    []
  );

  const handleDeleteDocument = useCallback(
    (documentId: string) => {
      if (documentId) {
        dispatch(deleteDocument(documentId));
      }
    },
    [dispatch]
  );

  const handleDropdownChange = useCallback(
    (fieldName: string, value: string | number) => {
      setFormData((prev) => {
        const updates: FormData = {
          ...prev,
          [fieldName]: value,
        };
        const fieldNameLower = fieldName.toLowerCase();
        const valueStr = String(value).toLowerCase();

        // Handle "Same as" dropdown for office address
        if (fieldNameLower.includes('officeaddress') && registrationAddresses) {
          // Find address fields dynamically by checking field name patterns
          // Exclude landline fields when searching for address line fields
          // Match patterns like: noAddresLine1, noAddressLine1, noLineOne, etc.
          const line1Field = nodalFormFields.find((f) => {
            const fNameLower = f.fieldName.toLowerCase();
            return (
              (fNameLower.includes('line1') ||
                fNameLower.includes('addresline1') ||
                fNameLower.includes('addressline1') ||
                fNameLower.includes('lineone')) && // Handle LineOne format
              !fNameLower.includes('landline')
            );
          });
          const line2Field = nodalFormFields.find((f) => {
            const fNameLower = f.fieldName.toLowerCase();
            return (
              (fNameLower.includes('line2') ||
                fNameLower.includes('addresline2') ||
                fNameLower.includes('addressline2') ||
                fNameLower.includes('linetwo')) && // Handle LineTwo format
              !fNameLower.includes('landline')
            );
          });
          const line3Field = nodalFormFields.find((f) => {
            const fNameLower = f.fieldName.toLowerCase();
            return (
              (fNameLower.includes('line3') ||
                fNameLower.includes('addresline3') ||
                fNameLower.includes('addressline3') ||
                fNameLower.includes('linethree')) && // Handle LineThree format
              !fNameLower.includes('landline')
            );
          });
          const countryField = nodalFormFields.find(
            (f) =>
              f.fieldName.toLowerCase().includes('country') &&
              !f.fieldName.toLowerCase().includes('countrycode')
          );
          const stateField = nodalFormFields.find((f) =>
            f.fieldName.toLowerCase().includes('state')
          );
          const districtField = nodalFormFields.find((f) =>
            f.fieldName.toLowerCase().includes('district')
          );
          const cityField = nodalFormFields.find((f) =>
            f.fieldName.toLowerCase().includes('city')
          );
          const pincodeField = nodalFormFields.find(
            (f) =>
              f.fieldName.toLowerCase().includes('pincode') &&
              !f.fieldName.toLowerCase().includes('other')
          );
          const pincodeOtherField = nodalFormFields.find(
            (f) =>
              f.fieldName.toLowerCase().includes('pincode') &&
              f.fieldName.toLowerCase().includes('other')
          );
          const digipinField = nodalFormFields.find((f) =>
            f.fieldName.toLowerCase().includes('digipin')
          );

          if (
            valueStr.includes('same as register') ||
            valueStr.includes('same as registered')
          ) {
            // Copy register address fields to nodal officer address fields

            if (line1Field)
              updates[line1Field.fieldName] =
                registrationAddresses.registerLine1 || '';
            if (line2Field)
              updates[line2Field.fieldName] =
                registrationAddresses.registerLine2 || '';
            if (line3Field)
              updates[line3Field.fieldName] =
                registrationAddresses.registerLine3 || '';
            if (countryField)
              updates[countryField.fieldName] =
                registrationAddresses.registerCountry || '';
            if (stateField)
              updates[stateField.fieldName] =
                registrationAddresses.registerState || '';
            if (districtField)
              updates[districtField.fieldName] =
                registrationAddresses.registerDistrict || '';
            if (cityField)
              updates[cityField.fieldName] =
                registrationAddresses.registerCity || '';
            if (pincodeField)
              updates[pincodeField.fieldName] =
                registrationAddresses.registerPincode || '';
            if (pincodeOtherField)
              updates[pincodeOtherField.fieldName] =
                registrationAddresses.registerPincodeOther || '';
            if (digipinField)
              updates[digipinField.fieldName] =
                registrationAddresses.registerDigipin || '';

            // Fetch cascading dropdown data for state, district, pincode
            if (
              registrationAddresses.registerCountry &&
              stateField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataNodal({
                  fieldName: stateField.fieldName,
                  fieldAttributes: stateField.fieldAttributes,
                  formData: {
                    ...prev,
                    [countryField?.fieldName || '']:
                      registrationAddresses.registerCountry,
                  },
                })
              );
            }
            if (
              registrationAddresses.registerState &&
              districtField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataNodal({
                  fieldName: districtField.fieldName,
                  fieldAttributes: districtField.fieldAttributes,
                  formData: {
                    ...prev,
                    [stateField?.fieldName || '']:
                      registrationAddresses.registerState,
                  },
                })
              );
            }
            if (
              registrationAddresses.registerDistrict &&
              pincodeField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataNodal({
                  fieldName: pincodeField.fieldName,
                  fieldAttributes: pincodeField.fieldAttributes,
                  formData: {
                    ...prev,
                    [districtField?.fieldName || '']:
                      registrationAddresses.registerDistrict,
                  },
                })
              );
            }
          } else if (valueStr.includes('same as correspondence')) {
            // Copy correspondence address fields to nodal officer address fields

            if (line1Field)
              updates[line1Field.fieldName] =
                registrationAddresses.correspondenceLine1 || '';
            if (line2Field)
              updates[line2Field.fieldName] =
                registrationAddresses.correspondenceLine2 || '';
            if (line3Field)
              updates[line3Field.fieldName] =
                registrationAddresses.correspondenceLine3 || '';
            if (countryField)
              updates[countryField.fieldName] =
                registrationAddresses.correspondenceCountry || '';
            if (stateField)
              updates[stateField.fieldName] =
                registrationAddresses.correspondenceState || '';
            if (districtField)
              updates[districtField.fieldName] =
                registrationAddresses.correspondenceDistrict || '';
            if (cityField)
              updates[cityField.fieldName] =
                registrationAddresses.correspondenceCity || '';
            if (pincodeField)
              updates[pincodeField.fieldName] =
                registrationAddresses.correspondencePincode || '';
            if (pincodeOtherField)
              updates[pincodeOtherField.fieldName] =
                registrationAddresses.correspondencePincodeOther || '';
            if (digipinField)
              updates[digipinField.fieldName] =
                registrationAddresses.correspondenceDigipin || '';

            // Fetch cascading dropdown data for state, district, pincode
            if (
              registrationAddresses.correspondenceCountry &&
              stateField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataNodal({
                  fieldName: stateField.fieldName,
                  fieldAttributes: stateField.fieldAttributes,
                  formData: {
                    ...prev,
                    [countryField?.fieldName || '']:
                      registrationAddresses.correspondenceCountry,
                  },
                })
              );
            }
            if (
              registrationAddresses.correspondenceState &&
              districtField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataNodal({
                  fieldName: districtField.fieldName,
                  fieldAttributes: districtField.fieldAttributes,
                  formData: {
                    ...prev,
                    [stateField?.fieldName || '']:
                      registrationAddresses.correspondenceState,
                  },
                })
              );
            }
            if (
              registrationAddresses.correspondenceDistrict &&
              pincodeField?.fieldAttributes?.type === 'external_api'
            ) {
              dispatch(
                fetchDropdownDataNodal({
                  fieldName: pincodeField.fieldName,
                  fieldAttributes: pincodeField.fieldAttributes,
                  formData: {
                    ...prev,
                    [districtField?.fieldName || '']:
                      registrationAddresses.correspondenceDistrict,
                  },
                })
              );
            }
          }
        }

        if (
          fieldNameLower.includes('pincode') &&
          !fieldNameLower.includes('other')
        ) {
          // If selecting "Other", keep the value but don't clear other fields

          // If selecting a regular pincode, clear the pincode other field

          if (!String(value).toLowerCase().includes('other')) {
            // Clear the corresponding pincode other field

            const pincodeOtherFieldName = `${fieldName}Other`;

            updates[pincodeOtherFieldName] = '';
          }
        }

        if (
          fieldNameLower.includes('country') &&
          fieldName !== 'noOfficeAddress'
        ) {
          nodalFormFields.forEach((field) => {
            const fNameLower = field.fieldName.toLowerCase();
            const prefix = fieldName.toLowerCase().replace('country', '');

            if (
              (fNameLower.includes('state') ||
                fNameLower.includes('district') ||
                fNameLower.includes('pincode')) &&
              fNameLower.startsWith(prefix)
            ) {
              updates[field.fieldName] = '';
            }
          });
        }

        if (fieldNameLower.includes('state')) {
          nodalFormFields.forEach((field) => {
            const fNameLower = field.fieldName.toLowerCase();
            const prefix = fieldName.toLowerCase().replace('state', '');

            if (
              (fNameLower.includes('district') ||
                fNameLower.includes('pincode')) &&
              fNameLower.startsWith(prefix)
            ) {
              updates[field.fieldName] = '';
            }
          });
        }

        if (fieldNameLower.includes('district')) {
          nodalFormFields.forEach((field) => {
            const fNameLower = field.fieldName.toLowerCase();
            const prefix = fieldName.toLowerCase().replace('district', '');

            if (
              fNameLower.includes('pincode') &&
              fNameLower.startsWith(prefix)
            ) {
              updates[field.fieldName] = '';
            }
          });
        }

        // When Proof of Identity dropdown changes, clear the Proof of Identity Number field and file
        // because maxLength and format requirements differ between ID types
        if (
          fieldNameLower.includes('proofofidentity') &&
          !fieldNameLower.includes('number')
        ) {
          const proofNumberFieldName = 'noProofOfIdentityNumber';
          // File field can be either format depending on API field configuration
          const proofFileFieldName1 = 'noProofOfIdentityNumberFile';
          const proofFileFieldName2 = 'noProofOfIdentityNumber_file';

          // Clear the proof number field and file when proof type changes
          updates[proofNumberFieldName] = '';
          updates[proofFileFieldName1] = null;
          updates[proofFileFieldName2] = null;

          // Clear any validation errors for the proof number and file fields
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[proofNumberFieldName];
            delete newErrors[proofFileFieldName1];
            delete newErrors[proofFileFieldName2];
            return newErrors;
          });

          // Clear the existing document data for the POI file
          setExistingDocumentData((prevData) => {
            const newData = { ...prevData };
            delete newData[proofFileFieldName1];
            delete newData[proofFileFieldName2];
            return newData;
          });
        }

        return updates;
      });
    },
    [nodalFormFields, registrationAddresses, dispatch]
  );

  const handleDateChange = useCallback(
    (fieldName: string, value: string | null) => {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [fieldName]: value,
        };

        // Real-time validation for date fields
        const field = nodalFormFields.find((f) => f.fieldName === fieldName);
        if (field && value) {
          // Validate the date field
          const error = validateField(field as any, value, updatedData);

          if (error) {
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: error,
            }));
          } else {
            // Additional validation for DOB: check age is between 18 and 100
            if (
              fieldName.toLowerCase().includes('dob') ||
              fieldName.toLowerCase().includes('dateofbirth')
            ) {
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
              // For non-DOB date fields, check if maxDate validation is required
              const fieldValidationRules = field.validationRules as any;
              const hasMaxDateValidation =
                fieldValidationRules?.maxDate === 'true' ||
                fieldValidationRules?.maxDate === true;

              if (hasMaxDateValidation) {
                const dateValue = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateValue > today) {
                  // Clear the date field if future date is entered
                  updatedData[fieldName] = null;
                  setValidationErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[fieldName];
                    return newErrors;
                  });
                } else {
                  setValidationErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[fieldName];
                    return newErrors;
                  });
                }
              } else {
                setValidationErrors((prevErrors) => {
                  const newErrors = { ...prevErrors };
                  delete newErrors[fieldName];
                  return newErrors;
                });
              }
            }
          }
        } else {
          // Clear validation error if field is empty
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
          });
        }

        return updatedData;
      });
    },
    [nodalFormFields]
  );

  const handleCkycVerified = useCallback(
    (field: FormField, data: any) => {
      // Extract response data
      const responseData = data?.data?.data || data?.data || data;

      if (!responseData || typeof responseData !== 'object') {
        console.error('❌ Invalid response data format');
        return;
      }

      // Map API response keys to form fields
      const mappedData: Record<string, any> = {};

      // Helper function to normalize field names for comparison (remove prefix, convert to lowercase)
      const normalizeFieldName = (fieldName: string): string => {
        // Remove common prefixes and convert to lowercase
        return fieldName
          .replace(/^(no|ho|re)/i, '') // Remove no/ho/re prefixes
          .toLowerCase();
      };

      // Iterate through API response data
      Object.entries(responseData).forEach(([apiKey, apiValue]) => {
        const normalizedApiKey = normalizeFieldName(apiKey);

        // Find matching form field
        const matchingField = nodalFormFields.find((formField) => {
          const normalizedFormFieldName = normalizeFieldName(
            formField.fieldName
          );
          const matches = normalizedFormFieldName === normalizedApiKey;

          return matches;
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
      const autoPopulateFields =
        field?.conditionalLogic?.[0]?.then?.fieldAttributes?.autoPopulate || [];

      // Update form data with mapped values
      setFormData((prev) => {
        const updated = {
          ...prev,
          ...mappedData,
        };

        return updated;
      });

      // Track ALL fields from autoPopulate config, not just those with values
      // This ensures fields like middleName are disabled even if they're empty
      const autoPopulatedFieldNames = new Set<string>();
      autoPopulateFields.forEach((fieldName: string) => {
        autoPopulatedFieldNames.add(fieldName);
      });

      setAutoPopulatedFields(autoPopulatedFieldNames);

      // Mark CKYC as verified
      setIsCkycVerified(true);
      setIsCkycVerificationRequired(false);
    },
    [nodalFormFields]
  );

  const handleCkycVerificationRequired = useCallback((required: boolean) => {
    setIsCkycVerificationRequired(required);
  }, []);

  const handleValidate = async () => {
    const validationResult = await validateAllFields(
      nodalFormFields,
      formData,
      validationSchema,
      existingDocuments
    );

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    setValidationErrors({});
    setGeneralError('');

    // Find mobile and email fields dynamically
    const mobileField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('mobile')
    );
    const emailField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );
    const countryCodeField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('countrycode')
    );

    // In Add Mode: validate if mobile/email have values
    // In Update Mode: validate if mobile or email has changed
    const shouldValidate = isAddMode
      ? (mobileField && formData[mobileField]) ||
        (emailField && formData[emailField])
      : isMobileChanged || isEmailChanged;

    if (shouldValidate) {
      // Send OTP to mobile/email
      const otpData = {
        requestType: 'DIRECT',
        emailId: (emailField ? formData[emailField] : '') as string,
        mobileNo: (mobileField ? formData[mobileField] : '') as string,
        countryCode: (countryCodeField
          ? formData[countryCodeField]
          : '') as string,
        workflowId: workflowId || '',
        ckycNo: (formData['noCkycNumber'] || '') as string,
        stepKey: 'nodalOfficer',
      };
      try {
        const result = await dispatch(OTPSend(otpData));
        if (OTPSend.fulfilled.match(result)) {
          setOtpIdentifier(result?.payload?.data?.otpIdentifier);
          setIsOtpModalOpen(true);
          setGeneralError(''); // Clear any previous errors
        } else if (OTPSend.rejected.match(result)) {
          // Handle rejected OTP send
          const errorPayload = result.payload as any;

          // The errorPayload is directly {field: "email", message: "..."} from authSlice
          if (errorPayload?.field && errorPayload?.message) {
            const newValidationErrors: Record<string, string> = {};

            if (errorPayload.field === 'email' && emailField) {
              // Map 'email' error to the actual email field name
              newValidationErrors[emailField] = errorPayload.message;
            } else if (
              (errorPayload.field === 'mobile' ||
                errorPayload.field === 'mobileNo') &&
              mobileField
            ) {
              // Map 'mobile' error to the actual mobile field name
              newValidationErrors[mobileField] = errorPayload.message;
            }

            if (Object.keys(newValidationErrors).length > 0) {
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                ...newValidationErrors,
              }));
            } else {
              // Field not mapped, show as general error
              setGeneralError(errorPayload.message);
            }
          } else {
            // Fallback to general error message
            const errorMessage =
              errorPayload?.message ||
              (typeof errorPayload === 'string'
                ? errorPayload
                : 'Something Went Wrong');
            setGeneralError(errorMessage);
          }

          console.error('❌ OTP send failed:', errorPayload);
        }
      } catch (error) {
        console.error('❌ Error sending OTP:', error);
        setGeneralError(
          'An error occurred while sending OTP. Please try again.'
        );
      }
    }
  };

  const handleClear = () => {
    // Find mobile and email fields dynamically
    const mobileField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('mobile')
    );
    const emailField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );

    if (isAddMode) {
      // In Add Mode: Clear the mobile/email values
      setFormData((prev) => ({
        ...prev,
        ...(mobileField && { [mobileField]: '' }),
        ...(emailField && { [emailField]: '' }),
      }));
    } else {
      // In Update Mode: Reset form to original values
      setFormData((prev) => ({
        ...prev,
        ...(mobileField && { [mobileField]: originalMobile }),
        ...(emailField && { [emailField]: originalEmail }),
      }));
    }

    setIsMobileChanged(false);
    setIsEmailChanged(false);
    setIsOtpValidated(false);
  };

  const handleOtpSubmit = (mobileOtp: string, emailOtp: string) => {
    // Mark as validated and close modal
    setIsOtpValidated(true);
    setIsOtpModalOpen(false);

    // Find mobile and email fields dynamically
    const mobileField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('mobile') &&
        !key.toLowerCase().includes('countrycode')
    );
    const emailField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );

    // Store change flags before resetting them (for success message)
    const wasMobileChanged = isMobileChanged;
    const wasEmailChanged = isEmailChanged;

    // Update original values to current values (only in Update Mode)
    if (!isAddMode) {
      if (isMobileChanged && mobileField) {
        setOriginalMobile(formData[mobileField] as string);
        setIsMobileChanged(false);
      }
      if (isEmailChanged && emailField) {
        setOriginalEmail(formData[emailField] as string);
        setIsEmailChanged(false);
      }
    } else {
      // In Add Mode: Just clear the change flags
      setIsMobileChanged(false);
      setIsEmailChanged(false);
    }

    // Show success modal
    let message = '';
    if (
      wasMobileChanged &&
      wasEmailChanged &&
      mobileField &&
      formData[mobileField] &&
      emailField &&
      formData[emailField]
    ) {
      message = 'Mobile & Email OTP Verified Successfully';
    } else if (wasEmailChanged && emailField && formData[emailField]) {
      message = 'Email OTP Verified Successfully';
    } else if (mobileField && formData[mobileField]) {
      message = 'Mobile OTP Verified Successfully';
    } else {
      message = 'OTP Verified Successfully';
    }

    setSuccessTitle('');
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  const handleGenericChange = useCallback(
    (fieldName: string, value: string | ChangeEvent<HTMLInputElement>) => {
      let newValue = typeof value === 'string' ? value : value.target.value;

      // Restrict to numbers only for mobile and CKYC fields
      if (
        fieldName.toLowerCase().includes('mobile') ||
        fieldName.toLowerCase().includes('ckyc')
      ) {
        // Remove all non-numeric characters
        newValue = newValue.replace(/\D/g, '');
      }

      // Check if this is Proof of Identity Number field
      const isProofOfIdentityNumberField =
        fieldName === 'noProofOfIdentityNumber' ||
        fieldName.toLowerCase().includes('proofofidentitynumber');

      if (isProofOfIdentityNumberField) {
        // Find the corresponding proof of identity field name
        // Remove "Number" but keep any trailing digits
        // E.g., "noProofOfIdentityNumber2" -> "noProofOfIdentity2"
        const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
        const proofType = String(
          formDataRef.current[proofFieldName] ||
            formDataRef.current['noProofOfIdentity'] ||
            ''
        ).toUpperCase();

        console.log(`🔍 [GenericChange] Proof of Identity Number field:`, {
          fieldName,
          proofFieldName,
          proofType,
          originalValue: newValue,
          valueLength: newValue.length,
        });

        // Apply validation based on proof type
        if (
          proofType === 'PAN CARD' ||
          proofType === 'PAN_CARD' ||
          proofType === 'PAN'
        ) {
          // PAN: uppercase, max 10 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.PAN_CARD);
        } else if (
          proofType === 'AADHAAR' ||
          proofType === 'AADHAR CARD' ||
          proofType === 'AADHAAR CARD'
        ) {
          // AADHAAR: only numeric, max 4 digits (last 4 of Aadhaar)
          newValue = newValue
            .replace(/\D/g, '')
            .slice(0, maxLengthByIdType.AADHAAR);
        } else if (
          proofType === 'VOTER ID' ||
          proofType === 'VOTER_ID' ||
          proofType === 'VOTERID'
        ) {
          // Voter ID: uppercase, max 10 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.VOTER_ID);
        } else if (
          proofType === 'DRIVING LICENSE' ||
          proofType === 'DRIVING_LICENSE' ||
          proofType === 'DRIVING LICENCE' ||
          proofType === 'DL'
        ) {
          // Driving License: uppercase, alphanumeric, max 18 characters
          newValue = newValue
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '')
            .slice(0, maxLengthByIdType.DRIVING_LICENSE);
        } else if (proofType === 'PASSPORT') {
          // Passport: uppercase, alphanumeric, max 9 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.PASSPORT);
        } else {
          // Default: just uppercase
          newValue = newValue.toUpperCase();
        }
      }

      const updatedFormData = {
        ...formDataRef.current,
        [fieldName]: newValue,
      };

      setFormData(updatedFormData);

      // Real-time validation: validate the field as user types
      const field = nodalFormFields.find((f) => f.fieldName === fieldName);
      if (field && newValue) {
        let error: string | null = null;

        // Special validation for Proof of Identity Number using ValidationUtils
        if (isProofOfIdentityNumberField) {
          const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
          const proofType = String(
            updatedFormData[proofFieldName] ||
              updatedFormData['noProofOfIdentity'] ||
              ''
          ).toUpperCase();

          console.log('🔍 Validation - Proof Type:', {
            proofType,
            newValue,
            fieldName,
          });

          // Check length first, then pattern validation
          switch (proofType) {
            case 'AADHAAR':
            case 'AADHAR CARD':
            case 'AADHAAR_CARD':
              // Aadhaar: 4 digits
              if (newValue.length !== maxLengthByIdType.AADHAAR) {
                error = 'Enter last 4 digits of Aadhar';
              } else if (!ValidationUtils.isValidAadhaar(newValue)) {
                error = 'Enter last 4 digits of Aadhar';
              }
              break;
            case 'PAN':
            case 'PAN CARD':
            case 'PAN_CARD':
              // PAN: exactly 10 characters
              if (newValue.length !== maxLengthByIdType.PAN_CARD) {
                error = 'PAN must be exactly 10 characters';
              } else if (!ValidationUtils.isValidPAN(newValue)) {
                error = 'Please enter valid PAN number (e.g., ABCPE1234F)';
              }
              break;
            case 'DRIVING LICENSE':
            case 'DRIVING_LICENSE':
            case 'DL':
              // Driving License: 15-18 characters
              if (
                newValue.length < 15 ||
                newValue.length > maxLengthByIdType.DRIVING_LICENSE
              ) {
                error = 'Driving License must be 15-18 characters';
              } else if (!ValidationUtils.isValidDrivingLicense(newValue)) {
                error =
                  'Invalid Driving License format (e.g., MH1420110062821)';
              }
              break;
            case 'PASSPORT':
              // Passport: exactly 8 characters
              if (newValue.length !== maxLengthByIdType.PASSPORT) {
                error = 'Passport must be exactly 8 characters';
              } else if (!ValidationUtils.isValidPassport(newValue)) {
                error = 'Please enter valid Passport number (e.g., A1234567)';
              }
              break;
            case 'VOTER ID':
            case 'VOTERID':
            case 'VOTER_ID':
              // Voter ID: exactly 10 characters
              if (newValue.length !== maxLengthByIdType.VOTER_ID) {
                error = 'Voter ID must be exactly 10 characters';
              } else if (!ValidationUtils.isValidVoterId(newValue)) {
                error = 'Please enter valid Voter ID (e.g., ABC1234567)';
              }
              break;
            default:
              // Default validation using formSlice
              error = validateField(field as any, newValue, updatedFormData);
          }
        } else {
          // Validate the field using formSlice validateField function
          error = validateField(field as any, newValue, updatedFormData);
        }

        if (error) {
          // Set error immediately
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName]: error as string,
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
        // Clear validation error if field is empty
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Track mobile/email changes
      if (fieldName.toLowerCase().includes('mobile')) {
        const hasChanged = newValue !== originalMobile;
        setIsMobileChanged(hasChanged);
        if (hasChanged) {
          setIsOtpValidated(false);
        }
      } else if (fieldName.toLowerCase().includes('email')) {
        const hasChanged = newValue !== originalEmail;

        setIsEmailChanged(hasChanged);
        if (hasChanged) {
          setIsOtpValidated(false);
        }
      }
    },
    [originalMobile, originalEmail, nodalFormFields]
  );

  const checkIfFileExists = useCallback(
    (fieldName: string): boolean => {
      const exists = !!existingDocuments[fieldName];
      return exists;
    },
    [existingDocuments]
  );

  const getDocumentId = useCallback(
    (fieldName: string): string => {
      return existingDocuments[fieldName] || '';
    },
    [existingDocuments]
  );

  const handleAddNodal = () => {
    setIsAddMode(true);
    setFormData({});
    setValidationErrors({});
    setIsCkycVerified(false);
    setAutoPopulatedFields(new Set());

    // Reset OTP validation states
    setOriginalMobile('');
    setOriginalEmail('');
    setIsMobileChanged(false);
    setIsEmailChanged(false);
    setIsOtpValidated(false);
    setIsOtpModalOpen(false);
    setOtpIdentifier('');

    // Clear existing documents
    setExistingDocuments({});
    setExistingDocumentData({});
  };

  const handleSave = async () => {
    // If not in add mode (user didn't click "Add New Nodal Officer"), skip API and go to next step
    if (!isAddMode) {
      onSaveAndNext();
      return;
    }

    // In add mode - validate and submit
    let yupValidationPassed = true;

    try {
      if (validationSchema) {
        await validationSchema.validate(formData, { abortEarly: false });
        setValidationErrors({});

        const testWorkflowId = 'cac2daeb-fa59-41d9-8159-d617634c7d98';
        const userId = userDetails?.userId || 'NO_0000';

        const formValues: Record<
          string,
          string | File | number | boolean | object | null
        > = { ...formData };
        const result = await dispatch(
          submitUpdatedNodalOfficerDetails({
            formValues,
            userId: userId,
          })
        ).unwrap();

        onSaveAndNext();
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            const field = nodalFormFields.find(
              (f) =>
                f.fieldName === err.path ||
                f.fieldFileName === err.path ||
                `${f.fieldName}_file` === err.path
            );

            // Handle textfield_with_image separately for text vs file errors
            if (field && field.fieldType === 'textfield_with_image') {
              const fileFieldName =
                field.fieldFileName || `${field.fieldName}_file`;

              // If error is for the text field (e.g., "noPan" not "noPanFile")
              if (err.path === field.fieldName) {
                // Always show text field errors (e.g., PAN number required)
                errors[err.path] = err.message;
              }
              // If error is for the file field (e.g., "noPanFile")
              else if (err.path === fileFieldName) {
                // Only skip file validation if file already exists
                if (checkIfFileExists(fileFieldName)) {
                  return;
                }
                // Show file error if no existing file
                errors[err.path] = err.message;
              }
            }
            // Handle file type
            else if (field && field.fieldType === 'file') {
              if (checkIfFileExists(field.fieldName)) {
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
        setValidationErrors(errors);

        yupValidationPassed = Object.keys(errors).length === 0;
      } else {
        yupValidationPassed = false;

        console.log('🔍 Caught error in UpdateNodalOfficerStep:', error);
        console.log(
          '🔍 Error has fieldErrors?',
          error && typeof error === 'object' && 'fieldErrors' in error
        );
        console.log('🔍 fieldErrors value:', (error as any)?.fieldErrors);

        // Handle API field validation errors
        if (error && typeof error === 'object' && 'fieldErrors' in error) {
          const apiFieldErrors = (error as any).fieldErrors || {};
          console.log('✅ Found fieldErrors:', apiFieldErrors);

          const mappedFieldErrors: Record<string, string> = {};

          // Map API field errors to actual form field names
          Object.entries(apiFieldErrors).forEach(
            ([fieldName, errorMessage]) => {
              console.log(
                `📝 Processing field error: ${fieldName} = ${errorMessage}`
              );

              // Check if this field has a corresponding file field in the form configuration
              const field = nodalFormFields.find(
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
                  console.log(`  → Mapped to file field: ${fileFieldName}`);
                } else {
                  // For regular file fields, use the field name as-is
                  mappedFieldErrors[fieldName] = errorMessage as string;
                  console.log(`  → Mapped to file field (as-is): ${fieldName}`);
                }
              } else {
                // For non-file fields, use the field name as-is
                mappedFieldErrors[fieldName] = errorMessage as string;
                console.log(`  → Mapped to text field: ${fieldName}`);
              }
            }
          );

          console.log('📋 Final mapped field errors:', mappedFieldErrors);
          setValidationErrors(mappedFieldErrors);
        } else if (error && typeof error === 'object' && 'message' in error) {
          // Show general error message
          const errorMessage = (error as any).message || 'Submission failed';
          console.log('❌ Showing general error:', errorMessage);
          setGeneralError(errorMessage);
        } else {
          console.log('⚠️ Unknown error format:', error);
        }
      }
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}
      >
        <div>Loading Nodal Officer form data...</div>
      </Box>
    );
  }

  // Helper to get dynamic field values
  const getMobileValue = () => {
    const mobileField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('mobile')
    );
    return mobileField ? formData[mobileField] : '';
  };

  const getEmailValue = () => {
    const emailField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );
    return emailField ? formData[emailField] : '';
  };

  const getCountryCodeValue = () => {
    const countryCodeField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('countrycode')
    );
    return countryCodeField ? formData[countryCodeField] : '';
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
      <UpdateFormAccordion
        key={'nodal_officer'}
        title={'Nodal Officer Details'}
        groupKey={'nodal_officer'}
        defaultExpanded={true}
        showAddButton={!isAddMode && canAddNodalOfficer}
        addButtonLabel="Add New Nodal Officer"
        onAddNew={handleAddNodal}
        isAddMode={isAddMode}
      >
        <ThreeColumnGrid>
          {nodalFormFields

            .filter((field: FormField) => {
              // Filter out pincode Other fields that should be hidden

              const fieldNameLower = field.fieldName.toLowerCase();

              const isPincodeOtherField =
                fieldNameLower.includes('pincode') &&
                fieldNameLower.includes('other');

              if (isPincodeOtherField) {
                // Extract the main pincode field name

                const mainPincodeFieldName = field.fieldName

                  .replace(/_?other$/i, '')

                  .replace(/other$/i, '')

                  .replace(/_+$/g, '');

                const mainPincodeValue = formData[mainPincodeFieldName];

                const shouldShowOtherField = String(mainPincodeValue || '')
                  .toLowerCase()
                  .includes('other');

                return shouldShowOtherField;
              }

              // Include all non-pincode-other fields

              return true;
            })

            .map((field: FormField) => {
              const evaluatedRules = evaluateConditionalLogic(field);
              const fieldValue = formData[field.fieldName] || '';

              // For textfield_with_image, combine text and file validation errors (same as UpdateEntityProfileStep)
              let fieldError = validationErrors[field.fieldName];
              if (field.fieldType === 'textfield_with_image') {
                const fileFieldName =
                  field.fieldFileName || `${field.fieldName}_file`;
                const fileError = validationErrors[fileFieldName];
                // Show text field error first, then file error
                fieldError = fieldError || fileError;
              }

              return (
                <FieldContainer key={field.id}>
                  <FieldRenderer
                    field={field}
                    value={fieldValue}
                    validationError={fieldError}
                    validationErrors={validationErrors}
                    existingDocument={getDocumentData(
                      field.fieldFileName || field.fieldName
                    )}
                    evaluatedValidationRules={evaluatedRules}
                    onTextChange={handleTextChange}
                    onDropdownChange={handleDropdownChange}
                    onDateChange={handleDateChange}
                    onFileUpload={handleFileUpload}
                    onGenericChange={handleGenericChange}
                    getFieldError={getFieldError}
                    getDocumentData={getDocumentData}
                    checkIfFileExists={checkIfFileExists}
                    getDocumentId={getDocumentId}
                    onDeleteDocument={handleDeleteDocument}
                    isAddMode={isAddMode}
                    isCkycVerified={isCkycVerified}
                    formData={formData}
                    onCkycVerified={handleCkycVerified}
                    onCkycVerificationRequired={handleCkycVerificationRequired}
                    dropdownData={dropdownData}
                    allFormFields={nodalFormFields}
                    autoPopulatedFields={autoPopulatedFields}
                  />
                </FieldContainer>
              );
            })}
        </ThreeColumnGrid>
      </UpdateFormAccordion>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <FormActionButtonsUpdate
          // onClear={handleClear}
          onSave={handleSave}
          onValidate={handleValidate}
          validateLabel={configuration?.submissionSettings?.validateButtonText}
          showValidate={isAddMode}
          showSave={configuration?.submissionSettings?.submitButton}
          // showClear={isAddMode ? false : configuration?.submissionSettings?.clearButton}
          clearLabel={configuration?.submissionSettings?.clearButtonText}
          saveLabel={configuration?.submissionSettings?.submitButtonText}
          loading={false}
          saveDisabled={
            isAddMode
              ? // Add Mode: Disable save if mobile/email not validated OR (Indian citizenship AND CKYC not verified)
                (!isOtpValidated && !!(getMobileValue() || getEmailValue())) ||
                isCkycVerificationRequired ||
                (String(formData['noCitizenship'] ?? '').toLowerCase() ===
                  'indian' &&
                  !isCkycVerified)
              : // Update Mode: Disable save if mobile/email changed but not validated OR CKYC verification required
                ((isMobileChanged || isEmailChanged) && !isOtpValidated) ||
                isCkycVerificationRequired
          }
          validateDisabled={
            isAddMode
              ? // Add Mode: Disable validate if no mobile/email values OR already validated
                (!getMobileValue() && !getEmailValue()) || isOtpValidated
              : // Update Mode: Disable validate if no changes OR already validated
                !(isMobileChanged || isEmailChanged) || isOtpValidated
          }
          clearDisabled={
            isAddMode
              ? // Add Mode: Disable clear if no mobile/email values entered
                !getMobileValue() && !getEmailValue()
              : // Update Mode: Disable clear if no changes
                !(isMobileChanged || isEmailChanged)
          }
          sx={{ margin: 0, padding: 0 }}
          submissionSettings={configuration?.submissionSettings}
        />
      </Box>

      {/* OTP Modal for Mobile/Email Validation */}
      <OTPModalUpdateEntity
        data={otpIdentifier}
        mobileChange={isMobileChanged}
        emailChange={isEmailChanged}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onOtpSubmit={handleOtpSubmit}
        countryCode={getCountryCodeValue() as string}
        email={getEmailValue() as string}
        mobile={getMobileValue() as string}
      />

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

export default UpdateNodalOfficerStep;
