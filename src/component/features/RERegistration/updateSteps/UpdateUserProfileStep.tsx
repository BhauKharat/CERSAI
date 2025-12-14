/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import LabeledDateUpdate from './CommonComponnet/LabeledDateUpdate';
import UploadButtonUpdate from './CommonComponnet/UploadButtonUpdate';
import LabeledTextFieldWithVerifyUpdate from './CommonComponnet/LabeledTextFieldWithVerifyUpdate';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import {
  buildValidationSchema,
  validateAllFields,
} from './formValidationusrprofile';
import * as Yup from 'yup';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';
import { FormField } from './types/formTypesUpdate';
import { Box, Alert, Typography } from '@mui/material';
import BreadcrumbUpdateProfile from '../../MyTask/UpdateEntityProfile-prevo/BreadcrumbUpdateProfile';

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
import {
  fetchStepDataUserProfile,
  fetchFormFieldsUserProfile,
  selectUserProfileStepDataLoading,
  fetchDropdownDataUserProfile,
  selectUserProfileDropdownData,
  submitUserProfileUpdate,
  fetchUserProfilePdf,
  eSignUserProfile,
  fetchSignedUserProfilePdf,
  selectUserProfileWorkflowId,
  selectUserProfilePdfDocumentId,
  selectUserProfilePdfDocument,
  selectUserProfilePdfDocumentLoading,
  selectUserProfileESignLoading,
  selectUserProfileSignedDocumentId,
  selectUserProfileSignedDocument,
  selectUserProfileAcknowledgementNo,
  clearPdfDocumentUserProfile,
  finalSubmitUserProfile,
  selectUserProfileFinalSubmitLoading,
  deleteDocumentUserProfile,
  updateFieldValueUserProfile,
} from './slice/updateUserProfileSlice';
import { fetchDocument } from './slice/updateStepDataSlice';
import OTPModalUpdateEntity from './CommonComponnet/OtpModalUpdateEntity';
import { OTPSend } from '../../Authenticate/slice/authSlice';
import PdfPreviewModalUpdate from './CommonComponnet/PdfPreviewModalUpdate';
import SuccessModalUpdateuser from './CommonComponnet/SuccessModalUpdate';
import ErrorModal from '../../UserManagement/ErrorModal/ErrorModal';
import { USER_ROLES } from '../../../../utils/enumUtils';
import { validateField } from '../slice/formSlice';
import { FormField as FormSliceField } from '../types/formTypes';
import {
  ValidationUtils,
  maxLengthByIdType,
} from '../../../../utils/validationUtils';

interface FormData {
  [key: string]: string | File | null | number | boolean | object;
}

interface DropDownOption {
  code: string;
  status?: string;
  name: string;
  isocode?: string;
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
  validationErrors?: Record<string, string>;
  existingDocument?: DocumentData;
  evaluatedValidationRules?: any;
  onTextChange: (fieldName: string, value: string) => void;
  onDropdownChange: (fieldName: string, value: string | number) => void;
  onDateChange: (fieldName: string, value: string | null) => void;
  onFileUpload: (fieldName: string | undefined, file: File | null) => void;
  onDeleteDocument: (fieldName: string, documentId: string) => void;
  onGenericChange: (
    fieldName: string,
    value: string | ChangeEvent<HTMLInputElement>
  ) => void;
  onFieldBlur: (fieldName: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
  getDocumentData: (fieldName: string) => DocumentData | undefined;
  checkIfFileExists: (fieldName: string) => boolean;
  getDocumentId: (fieldName: string) => string;
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
    onDeleteDocument,
    onGenericChange,
    onFieldBlur,
    getFieldError,
    getDocumentData,
    checkIfFileExists,
    getDocumentId,
    isAddMode,
    isCkycVerified,
    formData,
    onCkycVerified,
    onCkycVerificationRequired,
    dropdownData,
    allFormFields,
    autoPopulatedFields,
  }) => {
    // Conditional rendering for pincodeOther fields
    if (
      field.fieldName.includes('PincodeOther') ||
      field.fieldName.includes('pincodeOther')
    ) {
      // Generic approach: remove 'Other' from field name to get main pincode field name
      // e.g., 'iauPincodeOther1' -> 'iauPincode1'
      // e.g., 'registerPincodeOther' -> 'registerPincode'
      const mainPincodeFieldName = field.fieldName
        .replace(/Other/i, '')
        .replace(/other/i, '');

      const mainPincodeValue = formData[mainPincodeFieldName];

      // Only show if main pincode field has "other" value
      if (String(mainPincodeValue).toLowerCase() !== 'other') {
        return null; // Don't render this field
      }
    }

    const apiFieldError = getFieldError(field.fieldName);

    // Helper function to find citizenship value from formData
    const getCitizenshipValue = (): string => {
      const citizenshipKey = Object.keys(formData).find((key) =>
        key.toLowerCase().includes('citizenship')
      );
      return citizenshipKey ? String(formData[citizenshipKey] ?? '') : '';
    };

    // Helper function to check if field is citizenship field
    const isCitizenshipField = (fieldName: string): boolean => {
      return fieldName.toLowerCase().includes('citizenship');
    };

    // Helper function to check if field is CKYC number field
    const isCkycNumberField = (fieldName: string): boolean => {
      return fieldName.toLowerCase().includes('ckycnumber');
    };

    // Check if field should be disabled.
    const isFieldAutoDisabled = (): boolean => {
      const fieldName = field.fieldName;
      const fieldNameLower = fieldName.toLowerCase();

      // Citizenship field is always disabled (cannot be changed)
      if (fieldNameLower.includes('citizenship')) {
        return true;
      }

      // CKYC Number field is always disabled (cannot be changed)
      if (fieldNameLower.includes('ckycnumber')) {
        return true;
      }

      // Auto-populated fields from CKYC should remain disabled
      if (autoPopulatedFields.has(fieldName)) {
        return true;
      }

      // Disable address-related fields
      // Check for address fields (includes "address" or "addres" for typos)
      if (
        fieldNameLower.includes('address') ||
        fieldNameLower.includes('addres')
      ) {
        return true;
      }

      // Check for city fields
      if (fieldNameLower.includes('city')) {
        return true;
      }

      // Check for pincode/pin fields
      if (
        fieldNameLower.includes('pincode') ||
        fieldNameLower.includes('pin')
      ) {
        return true;
      }

      // Check for state fields
      if (fieldNameLower.includes('state')) {
        return true;
      }

      // Check for country fields
      if (fieldNameLower.includes('country')) {
        return true;
      }

      // Check for district fields
      if (fieldNameLower.includes('district')) {
        return true;
      }

      // Disable board resolution upload fields
      // NOTE: When disabled, the field will SHOW existing uploaded images
      // but will NOT allow uploading new documents (upload button is hidden)
      if (
        fieldNameLower.includes('boardresolution') ||
        fieldNameLower.includes('board_resolution') ||
        fieldNameLower.includes('resolution')
      ) {
        return true;
      }

      // All other fields are enabled
      return false;
    };

    const shouldDisableField = isFieldAutoDisabled();

    // Debug log for file fields
    if (
      (field.fieldType === 'file' ||
        field.fieldType === 'textfield_with_image') &&
      field.fieldName.toLowerCase().includes('boardresoluation')
    ) {
      console.log(
        `📄 Resolution field detected: ${field.fieldName}, disabled=${shouldDisableField}, type=${field.fieldType}`
      );
    }

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

      const fileValidationError = validationErrors?.[fileFieldName] || '';
      apiFileError = getFieldError(fileFieldName) || '';
      fileError = fileValidationError || apiFileError || '';
    } else if (field.fieldType === 'file') {
      documentId = getDocumentId(field.fieldName);
      fileExistsForField = checkIfFileExists(field.fieldName);
      apiFileError = getFieldError(field.fieldName) || '';
      fileError = validationError || apiFileError || '';
    }

    const textError = validationError || apiFieldError;
    let displayError = textError
      ? typeof textError === 'string'
        ? textError
        : JSON.stringify(textError)
      : undefined;

    if (field.fieldType === 'file') {
      const rawError = validationError || apiFieldError || fileError;
      displayError = rawError
        ? typeof rawError === 'string'
          ? rawError
          : JSON.stringify(rawError)
        : undefined;
    }

    switch (field.fieldType) {
      case 'textfield': {
        // Determine if this is a pincodeOther field (same logic as UpdateAddressDetailsStep)
        const isPincodeOtherField =
          field.fieldName.includes('PincodeOther') ||
          field.fieldName.includes('pincodeOther');

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

        let proofMaxLength: number | undefined;
        let proofMinLength: number | undefined;
        let proofInputType: 'text' | 'tel' = 'text';

        if (isProofOfIdentityNumberField) {
          switch (proofType) {
            case 'AADHAAR':
              proofMaxLength = maxLengthByIdType.AADHAAR; // 4
              proofMinLength = maxLengthByIdType.AADHAAR;
              proofInputType = 'tel';
              break;
            case 'DRIVING LICENSE':
            case 'DRIVING_LICENSE':
            case 'DRIVING LICENCE':
            case 'DL':
              proofMaxLength = maxLengthByIdType.DRIVING_LICENSE; // 18
              proofMinLength = 15; // Driving License: 15-18 characters
              break;
            case 'PAN CARD':
            case 'PAN_CARD':
              proofMaxLength = maxLengthByIdType.PAN_CARD; // 10
              proofMinLength = maxLengthByIdType.PAN_CARD;
              break;
            case 'PASSPORT':
              proofMaxLength = maxLengthByIdType.PASSPORT; // 9
              proofMinLength = maxLengthByIdType.PASSPORT;
              break;
            case 'VOTER ID':
            case 'VOTER_ID':
              proofMaxLength = maxLengthByIdType.VOTER_ID; // 10
              proofMinLength = maxLengthByIdType.VOTER_ID;
              break;
          }
        }

        // Determine input type based on field name
        const inputType = field.fieldName.includes('email')
          ? 'email'
          : isPincodeOtherField
            ? 'tel'
            : isProofOfIdentityNumberField && proofInputType === 'tel'
              ? 'tel'
              : 'text';

        // Generate a unique key that includes proof type for re-rendering
        const fieldKey = isPincodeOtherField
          ? `${field.id}-${evaluatedValidationRules?.required || false}`
          : isProofOfIdentityNumberField
            ? `${field.id}-${proofType}`
            : field.id;

        return (
          <LabeledTextFieldUpdate
            key={fieldKey}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            onBlur={() => onFieldBlur(field.fieldName)}
            placeholder={
              isPincodeOtherField
                ? 'Enter 6-digit Pincode'
                : field.fieldPlaceholder || ''
            }
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
              isProofOfIdentityNumberField ? undefined : validationRules?.regx
            }
            disabled={shouldDisableField}
            error={!!displayError}
            helperText={displayError}
            type={inputType}
          />
        );
      }

      case 'dropdown': {
        let options: { label: string; value: string }[] = [];

        const isCountryCodeField = field.fieldName === 'noCountryCode';
        const isPincodeField =
          field.fieldName.toLowerCase().includes('pincode') &&
          !field.fieldName.toLowerCase().includes('other');

        if (field.fieldAttributes?.type === 'external_api') {
          const dynamicOptions = dropdownData[field.fieldName]?.options || [];
          if (dynamicOptions && dynamicOptions.length > 0) {
            options = dynamicOptions;
          } else {
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

        // Add "Other" option to pincode dropdowns if not already present
        if (isPincodeField && options.length > 0) {
          const hasOther = options.some(
            (opt) => String(opt.value).toLowerCase() === 'other'
          );
          if (!hasOther) {
            // Create new array to avoid mutating Redux state
            options = [...options, { label: 'Other', value: 'other' }];
          }
        }

        return (
          <LabeledDropDownUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onDropdownChange(field.fieldName, newValue)}
            options={options}
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            fieldName={field.fieldName}
            disabled={shouldDisableField}
          />
        );
      }

      case 'date': {
        const isDobField =
          field.fieldName.toLowerCase().includes('dob') ||
          field.fieldName.toLowerCase().includes('dateofbirth') ||
          field.fieldName.toLowerCase().includes('birthdate');

        let minDateStr: string | undefined;
        let maxDateStr: string | undefined;

        if (isDobField) {
          const today = new Date();

          // Exact current date - 18 years
          const maxDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
          );

          // Exact current date - 100 years
          const minDate = new Date(
            today.getFullYear() - 100,
            today.getMonth(),
            today.getDate()
          );

          // Fix timezone issue by formatting to YYYY-MM-DD safely
          maxDateStr = maxDate.toLocaleDateString('en-CA'); // → 2025-12-02
          minDateStr = minDate.toLocaleDateString('en-CA'); // → 1925-12-02
        }

        return (
          <LabeledDateUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onDateChange(field.fieldName, newValue)}
            onBlur={() => onFieldBlur(field.fieldName)}
            fieldName={field.fieldName}
            required={validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            disabled={shouldDisableField}
            minDate={minDateStr}
            maxDate={maxDateStr}
          />
        );
      }

      case 'textfield_with_verify': {
        const citizenshipValue = getCitizenshipValue().toLowerCase();
        const isIndianCitizen = citizenshipValue === 'indian';
        const isCkycField = isCkycNumberField(field.fieldName);
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
            onOpenSendOtp={async () => {
              console.log('📤 Sending OTP for User Profile CKYC verification');
            }}
            onSubmitOtp={async (otp: string) => {
              console.log('📥 Submitting OTP for User Profile:', otp);
              return true;
            }}
            onOtpVerified={(data: any) => {
              console.log(
                '✅ OTP verified for User Profile CKYC, calling onCkycVerified with data:',
                data
              );
              onCkycVerified(field, data);
            }}
            onVerify={async () => {
              console.log(
                '🔐 Verifying User Profile CKYC field:',
                field.fieldName
              );
              return true;
            }}
          />
        );
      }

      case 'textfield_with_image': {
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        // Use the existingDocument prop passed from parent instead of calling getDocumentData
        // This prevents creating new object references on every render
        const existingDoc = existingDocument;
        const fileValidationRules =
          validationRules?.validationFile || validationRules;
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

        let proofMaxLength: number | undefined;
        let proofMinLength: number | undefined;

        if (isProofOfIdentityNumberField) {
          switch (proofType) {
            case 'AADHAAR':
              proofMaxLength = maxLengthByIdType.AADHAAR; // 4
              proofMinLength = maxLengthByIdType.AADHAAR;
              break;
            case 'DRIVING LICENSE':
            case 'DRIVING_LICENSE':
            case 'DRIVING LICENCE':
            case 'DL':
              proofMaxLength = maxLengthByIdType.DRIVING_LICENSE; // 18
              proofMinLength = 15; // Driving License: 15-18 characters
              break;
            case 'PAN CARD':
            case 'PAN_CARD':
              proofMaxLength = maxLengthByIdType.PAN_CARD; // 10
              proofMinLength = maxLengthByIdType.PAN_CARD;
              break;
            case 'PASSPORT':
              proofMaxLength = maxLengthByIdType.PASSPORT; // 9
              proofMinLength = maxLengthByIdType.PASSPORT;
              break;
            case 'VOTER ID':
            case 'VOTER_ID':
              proofMaxLength = maxLengthByIdType.VOTER_ID; // 10
              proofMinLength = maxLengthByIdType.VOTER_ID;
              break;
          }
        }

        const fieldKey = isProofOfIdentityNumberField
          ? `${field.id}-${proofType}`
          : field.id;

        return (
          <LabeledTextFieldWithUploadUpdate
            key={fieldKey}
            label={field.fieldLabel}
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
              isProofOfIdentityNumberField ? undefined : validationRules?.regx
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
            onDeleteDocument={
              existingDoc
                ? () =>
                    onDeleteDocument(field.fieldFileName || '', existingDoc.id)
                : undefined
            }
          />
        );
      }

      case 'file': {
        const fileFieldName = field.fieldName || `${field.fieldName}_file`;
        // Use the existingDocument prop passed from parent instead of calling getDocumentData
        // This prevents creating new object references on every render
        const existingDoc = existingDocument;
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
              onDeleteDocument={
                existingDoc
                  ? () =>
                      onDeleteDocument(field.fieldName || '', existingDoc.id)
                  : undefined
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
    // Deep comparison for existingDocument to prevent image blinking
    const existingDocEqual =
      prevProps.existingDocument === nextProps.existingDocument ||
      (prevProps.existingDocument?.id === nextProps.existingDocument?.id &&
        prevProps.existingDocument?.dataUrl ===
          nextProps.existingDocument?.dataUrl);

    // Only check citizenship field from formData to avoid unnecessary re-renders
    const prevCitizenshipKey = Object.keys(prevProps.formData).find((key) =>
      key.toLowerCase().includes('citizenship')
    );
    const nextCitizenshipKey = Object.keys(nextProps.formData).find((key) =>
      key.toLowerCase().includes('citizenship')
    );
    const citizenshipEqual =
      prevCitizenshipKey && nextCitizenshipKey
        ? prevProps.formData[prevCitizenshipKey] ===
          nextProps.formData[nextCitizenshipKey]
        : true;

    // For file fields, we don't need to re-render just because other form fields changed
    const isFileField =
      prevProps.field.fieldType === 'file' ||
      prevProps.field.fieldType === 'textfield_with_image';

    // For dropdowns, check if the dropdown data for THIS specific field changed
    const isDropdownField = prevProps.field.fieldType === 'dropdown';
    let dropdownDataEqual = prevProps.dropdownData === nextProps.dropdownData;

    // If dropdown data object reference changed, check if THIS field's data actually changed
    if (!dropdownDataEqual && (isFileField || isDropdownField)) {
      const prevFieldDropdownData =
        prevProps.dropdownData?.[prevProps.field.fieldName];
      const nextFieldDropdownData =
        nextProps.dropdownData?.[nextProps.field.fieldName];

      if (isFileField) {
        // File fields don't use dropdownData at all, so always consider it equal
        dropdownDataEqual = true;
      } else if (isDropdownField) {
        // For dropdown fields, only compare their specific dropdown data
        dropdownDataEqual =
          prevFieldDropdownData === nextFieldDropdownData ||
          JSON.stringify(prevFieldDropdownData) ===
            JSON.stringify(nextFieldDropdownData);
      }
    }

    // Deep comparison for validation rules using JSON stringification
    const validationRulesEqual =
      prevProps.evaluatedValidationRules ===
        nextProps.evaluatedValidationRules ||
      JSON.stringify(prevProps.evaluatedValidationRules) ===
        JSON.stringify(nextProps.evaluatedValidationRules);

    // For file fields, only check validation errors for the file field itself
    let validationErrorsEqual =
      prevProps.validationErrors === nextProps.validationErrors;
    if (
      isFileField &&
      prevProps.validationErrors !== nextProps.validationErrors
    ) {
      const fileFieldName =
        prevProps.field.fieldFileName || prevProps.field.fieldName;
      validationErrorsEqual =
        prevProps.validationErrors?.[fileFieldName] ===
          nextProps.validationErrors?.[fileFieldName] &&
        prevProps.validationErrors?.[prevProps.field.fieldName] ===
          nextProps.validationErrors?.[nextProps.field.fieldName];
    }

    // File fields don't use allFormFields, so skip comparison
    const allFormFieldsEqual = isFileField
      ? true
      : prevProps.allFormFields === nextProps.allFormFields;

    // File fields don't use autoPopulatedFields (only CKYC verify fields do), so skip comparison
    const autoPopulatedFieldsEqual = isFileField
      ? true
      : prevProps.autoPopulatedFields === nextProps.autoPopulatedFields;

    const shouldUpdate = !(
      prevProps.field.id === nextProps.field.id &&
      prevProps.value === nextProps.value &&
      prevProps.validationError === nextProps.validationError &&
      validationErrorsEqual &&
      existingDocEqual &&
      validationRulesEqual &&
      prevProps.isAddMode === nextProps.isAddMode &&
      prevProps.isCkycVerified === nextProps.isCkycVerified &&
      citizenshipEqual &&
      dropdownDataEqual &&
      allFormFieldsEqual &&
      autoPopulatedFieldsEqual &&
      // For file fields, skip formData comparison to prevent image blinking
      (isFileField ? true : prevProps.formData === nextProps.formData)
    );

    // Log re-render causes for file fields (debugging)
    if (shouldUpdate && isFileField) {
      console.log(
        `🔄 FieldRenderer re-rendering for ${prevProps.field.fieldName}:`,
        {
          fieldIdChanged: prevProps.field.id !== nextProps.field.id,
          valueChanged: prevProps.value !== nextProps.value,
          validationErrorChanged:
            prevProps.validationError !== nextProps.validationError,
          validationErrorsChanged: !validationErrorsEqual,
          existingDocChanged: !existingDocEqual,
          existingDocPrev: prevProps.existingDocument?.id,
          existingDocNext: nextProps.existingDocument?.id,
          validationRulesChanged: !validationRulesEqual,
          dropdownDataChanged: !dropdownDataEqual,
          citizenshipChanged: !citizenshipEqual,
          allFormFieldsChanged: !allFormFieldsEqual,
          autoPopulatedFieldsChanged: !autoPopulatedFieldsEqual,
        }
      );
    }

    return !shouldUpdate;
  }
);

FieldRenderer.displayName = 'FieldRenderer';

// Helper function to convert FormField to FormSliceField
const convertToFormSliceField = (field: FormField): FormSliceField => {
  return {
    ...field,
    fieldGroup: field.fieldGroup ?? undefined,
  } as FormSliceField;
};

const UpdateUserProfileStep: React.FC = () => {
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
  const [isCkycVerified, setIsCkycVerified] = useState(false);
  const [isCkycVerificationRequired, setIsCkycVerificationRequired] =
    useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(
    new Set()
  );
  const [generalError, setGeneralError] = useState<string>('');

  // Store current form type based on groupMembership
  const [currentFormType, setCurrentFormType] = useState<string>('RE_nodal');

  // OTP validation states
  const [originalMobile, setOriginalMobile] = useState<string>('');
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [isMobileChanged, setIsMobileChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isOtpValidated, setIsOtpValidated] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState<string>('');

  // Success modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Error modal states
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState<string>('');
  const [errorModalTitle, setErrorModalTitle] = useState<string>('');
  const [successTitle, setSuccessTitle] = useState<string>('');

  // Use ref to track fetched documents to prevent re-fetching
  const fetchedDocumentIdsRef = useRef<Set<string>>(new Set());
  const previousCascadingValuesRef = useRef<Record<string, any>>({});

  // //////////////////////////////////////// NEW CODE

  const previousCitizenshipRef = useRef<string | null>(null);

  // Redux selectors
  const stepData = useSelector(
    (state: any) => state.updateUserProfile.stepData
  );
  const stepDocuments = useSelector(
    (state: any) => state.updateUserProfile.documents
  );
  const fetchedDocuments = useSelector(
    (state: any) => state.updateStepData.fetchedDocuments
  );
  const fields = useSelector((state: any) => state.updateUserProfile.fields);
  const config = useSelector(
    (state: any) => state.updateUserProfile.configuration
  );
  const loading = useSelector(selectUserProfileStepDataLoading);
  const dropdownData = useSelector(selectUserProfileDropdownData);

  // PDF and e-sign selectors
  const workflowId = useSelector(selectUserProfileWorkflowId);
  const pdfDocumentId = useSelector(selectUserProfilePdfDocumentId);
  const pdfDocument = useSelector(selectUserProfilePdfDocument);
  const pdfDocumentLoading = useSelector(selectUserProfilePdfDocumentLoading);
  const eSignLoading = useSelector(selectUserProfileESignLoading);
  const signedDocumentId = useSelector(selectUserProfileSignedDocumentId);
  const signedDocument = useSelector(selectUserProfileSignedDocument);
  const acknowledgementNo = useSelector(selectUserProfileAcknowledgementNo);
  const finalSubmitLoading = useSelector(selectUserProfileFinalSubmitLoading);

  // Get user details and groupMembership from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership
  );

  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({});
  const formDataRef = useRef<FormData>(formData);
  const isUserEditingRef = useRef(false); // Track if user is actively editing

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

  // PDF modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfFetchInitiated, setPdfFetchInitiated] = useState<string | null>(
    null
  );
  const [signedPdfFetchInitiated, setSignedPdfFetchInitiated] = useState<
    string | null
  >(null);

  // Fetch form fields and user data on mount
  useEffect(() => {
    const userId = userDetails?.userId || 'NO_0000';

    // Determine form type and userTypes based on groupMembership
    let formType: 'nodal' | 'iau' = 'nodal';
    let userTypes: string[] = ['NO'];
    let dataKey = 'nodalOfficer';
    let submissionFormType = 'RE_nodal';
    let iauGroup: 'adminone' | 'admintwo' | null = null;

    if (groupMembership && Array.isArray(groupMembership)) {
      // Check if user is Institutional Admin User
      if (
        groupMembership.some(
          (group) =>
            group.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER) ||
            group.includes('/Institutional_Admin_User')
        )
      ) {
        formType = 'iau';
        dataKey = 'institutionalAdminUser';
        submissionFormType = 'RE_iau';

        // Determine IAU type (IAU_1 or IAU_2) from userDetails or role
        // Check if there's a role or userType field that indicates IAU_1 or IAU_2
        const userRole = userDetails?.role;

        // You can also check groupMembership for specific IAU type
        const isIAU1 = groupMembership.some(
          (group) =>
            group.includes('IAU_1') ||
            group.toLowerCase().includes('admin_one') ||
            group.toLowerCase().includes('adminone')
        );
        const isIAU2 = groupMembership.some(
          (group) =>
            group.includes('IAU_2') ||
            group.toLowerCase().includes('admin_two') ||
            group.toLowerCase().includes('admintwo')
        );

        // Check userRole first, then fallback to groupMembership
        if (userRole === 'IAU_2' || isIAU2) {
          userTypes = ['IAU_2'];
          iauGroup = 'admintwo';
        } else if (userRole === 'IAU_1' || isIAU1) {
          userTypes = ['IAU_1'];
          iauGroup = 'adminone';
        } else {
          // Default to IAU_1
          userTypes = ['IAU_1'];
          iauGroup = 'adminone';
        }
      }
      // Check if user is Nodal Officer (default)
      else if (
        groupMembership.some(
          (group) =>
            group.includes('Nodal_officer') || group.includes('/Nodal_officer')
        )
      ) {
        formType = 'nodal';
        userTypes = ['NO'];
        dataKey = 'nodalOfficer';
        submissionFormType = 'RE_nodal';
      }
    }

    console.log('🔍 User Profile Form Type:', {
      formType,
      userTypes,
      dataKey,
      submissionFormType,
      iauGroup,
      groupMembership,
      userRole: userDetails?.role,
    });

    // Store the submission form type for use in handleSave
    setCurrentFormType(submissionFormType);

    // Fetch form fields with dynamic form type and IAU group
    dispatch(fetchFormFieldsUserProfile({ formType, iauGroup }));

    // Fetch user profile data with dynamic userTypes and dataKey
    dispatch(fetchStepDataUserProfile({ userId, userTypes, dataKey }));
  }, [dispatch, userDetails?.userId, userDetails?.role, groupMembership]);

  // Set form fields when loaded
  useEffect(() => {
    if (fields && fields.length > 0 && !loading) {
      setUserProfileFormFields(fields);
      setIsDataLoaded(true);
    }
  }, [fields, loading]);

  // Set configuration when loaded
  useEffect(() => {
    if (config && !loading) {
      setConfiguration(config);
    }
  }, [config, loading]);

  // Load step data into form
  useEffect(() => {
    // Don't reload data if user is actively editing
    if (isUserEditingRef.current) {
      console.log('⏸️ Skipping data reload - user is editing');
      return;
    }

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
          console.log(`  Setting ${key} = ${value}`);
          initialFormData[key] = value;
        }
      });

      setFormData(initialFormData);

      // Set original mobile and email values for change detection
      // Prioritize 'mobilenumber' field over 'mobile' field
      const mobileField =
        Object.keys(initialFormData).find(
          (key) =>
            key.toLowerCase().includes('mobilenumber') &&
            !key.toLowerCase().includes('countrycode')
        ) ||
        Object.keys(initialFormData).find(
          (key) =>
            key.toLowerCase().includes('mobile') &&
            !key.toLowerCase().includes('countrycode')
        );
      const emailField = Object.keys(initialFormData).find(
        (key) =>
          key.toLowerCase().includes('email') &&
          !key.toLowerCase().includes('mobile')
      );

      if (mobileField && initialFormData[mobileField]) {
        setOriginalMobile(initialFormData[mobileField] as string);
      }
      if (emailField && initialFormData[emailField]) {
        setOriginalEmail(initialFormData[emailField] as string);
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
      // Dynamically find citizenship and ckycNumber fields
      const citizenshipKey = Object.keys(stepData).find((key) =>
        key.toLowerCase().includes('citizenship')
      );
      const ckycNumberKey = Object.keys(stepData).find((key) =>
        key.toLowerCase().includes('ckycnumber')
      );

      const citizenship = citizenshipKey ? stepData[citizenshipKey] : null;
      const ckycNumber = ckycNumberKey ? stepData[ckycNumberKey] : null;

      const isIndian = String(citizenship ?? '').toLowerCase() === 'indian';
      const hasCkycNumber = !!ckycNumber && String(ckycNumber).trim() !== '';

      if (isIndian && hasCkycNumber) {
        setIsCkycVerified(true);

        const ckycFormField = userProfileFormFields.find((f) =>
          f.fieldName.toLowerCase().includes('ckycnumber')
        );

        const autoPopulateFields =
          ckycFormField?.conditionalLogic?.[0]?.then?.fieldAttributes
            ?.autoPopulate || [];

        const ckycAutopopulatedFields = new Set<string>();
        autoPopulateFields.forEach((fieldName: string) => {
          ckycAutopopulatedFields.add(fieldName);
        });

        setAutoPopulatedFields(ckycAutopopulatedFields);
      }
    }
  }, [stepData, loading, isDataLoaded, isAddMode, userProfileFormFields]);

  // //////////////////////////////////////// NEW CODE

  // Reset auto-populated fields and CKYC status when citizenship changes
  useEffect(() => {
    // Find citizenship field in formData
    const citizenshipKey = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('citizenship')
    );
    const citizenship = citizenshipKey
      ? String(formData[citizenshipKey] || '')
      : '';

    const previous = previousCitizenshipRef.current;
    // Only run when citizenship actually changes
    if (citizenship && citizenship !== previous) {
      const isIndian = citizenship.toLowerCase() === 'indian';

      if (!isIndian) {
        // Clear any auto-populated field values so they become editable
        if (autoPopulatedFields && autoPopulatedFields.size > 0) {
          setFormData((prev) => {
            const copy = { ...prev } as FormData;
            autoPopulatedFields.forEach((fieldName) => {
              copy[fieldName] = '';
            });

            // Also clear CKYC number if present
            const ckycKey = Object.keys(copy).find((k) =>
              k.toLowerCase().includes('ckycnumber')
            );
            if (ckycKey) copy[ckycKey] = '';

            return copy;
          });
        }

        // Remove tracked auto-populated fields and reset CKYC verification
        setAutoPopulatedFields(new Set());
        setIsCkycVerified(false);
      } else {
        // If changing back to Indian, reset CKYC verified flag (requires re-verify)
        setIsCkycVerified(false);
      }

      previousCitizenshipRef.current = citizenship;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Fetch documents when stepDocuments are available
  useEffect(() => {
    if (Array.isArray(stepDocuments) && stepDocuments.length > 0 && !loading) {
      const documentsMap: Record<string, string> = {};

      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id) {
          documentsMap[doc.fieldKey] = doc.id;
          console.log(
            `📄 Mapping document: fieldKey="${doc.fieldKey}" -> id="${doc.id}"`
          );

          if (!fetchedDocumentIdsRef.current.has(doc.id)) {
            fetchedDocumentIdsRef.current.add(doc.id);
            console.log(`🔄 Fetching document with id: ${doc.id}`);
            dispatch(fetchDocument(doc.id));
          }
        }
      });

      console.log('📋 Final documents map:', documentsMap);
      setExistingDocuments(documentsMap);
    }
  }, [stepDocuments, loading, dispatch]);

  // Memoize document data to prevent unnecessary re-renders
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

  // Only update state when memoized data actually changes
  useEffect(() => {
    if (Object.keys(memoizedDocumentData).length > 0) {
      setExistingDocumentData((prevData) => {
        // If prevData is empty, just set the new data
        if (Object.keys(prevData).length === 0) {
          console.log('📄 Initial document data load for User Profile');
          return memoizedDocumentData;
        }

        // Check if number of documents changed
        const prevKeys = Object.keys(prevData);
        const newKeys = Object.keys(memoizedDocumentData);

        if (prevKeys.length !== newKeys.length) {
          console.log('📄 Document count changed, updating...', {
            prevCount: prevKeys.length,
            newCount: newKeys.length,
          });
          return memoizedDocumentData;
        }

        // Check if any document data actually changed
        const hasChanged = newKeys.some((key) => {
          if (!prevData[key]) return true;

          const prev = prevData[key];
          const current = memoizedDocumentData[key];

          // Deep comparison of document properties
          return (
            prev.id !== current.id ||
            prev.fileName !== current.fileName ||
            prev.fileSize !== current.fileSize ||
            prev.mimeType !== current.mimeType ||
            prev.dataUrl !== current.dataUrl
          );
        });

        if (hasChanged) {
          console.log(
            '📄 Document data changed for User Profile:',
            memoizedDocumentData
          );
          return memoizedDocumentData;
        }

        // No changes detected, return previous data to prevent re-render
        console.log('📄 No document changes detected, skipping update');
        return prevData;
      });
    }
  }, [memoizedDocumentData]);

  // Dynamic cascading dropdown logic
  useEffect(() => {
    if (!isDataLoaded || userProfileFormFields.length === 0) return;

    const currentCascadingValues: Record<string, any> = {};
    userProfileFormFields.forEach((field) => {
      const fieldNameLower = field.fieldName.toLowerCase();
      if (
        fieldNameLower.includes('country') ||
        fieldNameLower.includes('state') ||
        fieldNameLower.includes('district')
      ) {
        currentCascadingValues[field.fieldName] = formData[field.fieldName];
      }
    });

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

    if (
      !hasChanged &&
      Object.keys(previousCascadingValuesRef.current).length > 0
    ) {
      return;
    }

    previousCascadingValuesRef.current = currentCascadingValues;

    const cascadingFields: Array<{
      field: FormField;
      keyword: string;
      dependsOn: string | null;
    }> = [];

    userProfileFormFields.forEach((field) => {
      if (
        field.fieldType !== 'dropdown' ||
        field.fieldAttributes?.type !== 'external_api'
      ) {
        return;
      }

      const fieldNameLower = field.fieldName.toLowerCase();

      if (fieldNameLower.includes('state')) {
        const dependsOnField = userProfileFormFields.find(
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
        const dependsOnField = userProfileFormFields.find(
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
        const dependsOnField = userProfileFormFields.find(
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
        console.log(
          `🔄 Fetching dropdown data for ${field.fieldName} because ${dependsOn} changed to ${dependencyValue}`
        );

        dispatch(
          fetchDropdownDataUserProfile({
            fieldName: field.fieldName,
            fieldAttributes: field.fieldAttributes,
            formData: formData,
          })
        );
      }
    });
  }, [formData, isDataLoaded, userProfileFormFields, dispatch]);

  // Helper function to find field by name
  const findFieldByName = useCallback(
    (fieldName: string): FormField | null => {
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      return field || null;
    },
    [userProfileFormFields]
  );

  // Evaluate conditional logic based on formData
  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      // If field has no conditionalLogic, return existing validationRules (could be null)
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

        const isCitizenshipField = when.field
          .toLowerCase()
          .includes('citizenship');

        switch (operator) {
          case 'in':
          case 'equals':
          case 'equal': // Added support for 'equal' operator
            if (isCitizenshipField) {
              const dependentValueLower = String(
                dependentValue ?? ''
              ).toLowerCase();
              const expectedValuesLower = expectedValues.map((v: any) =>
                String(v).toLowerCase()
              );
              conditionMatches =
                expectedValuesLower.includes(dependentValueLower);
            } else {
              conditionMatches = expectedValues
                .map(String)
                .includes(String(dependentValue ?? ''));
            }
            break;
          case 'not_in':
          case 'not_equals':
            if (isCitizenshipField) {
              const dependentValueLower = String(
                dependentValue ?? ''
              ).toLowerCase();
              const expectedValuesLower = expectedValues.map((v: any) =>
                String(v).toLowerCase()
              );
              conditionMatches =
                !expectedValuesLower.includes(dependentValueLower);
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
          default:
            conditionMatches = false;
        }

        // If condition matches and 'then' has validationRules
        if (conditionMatches && logic.then?.validationRules) {
          // If field has no validationRules, use only the conditional validationRules
          // Otherwise, merge them
          return field.validationRules
            ? { ...field.validationRules, ...logic.then.validationRules }
            : logic.then.validationRules;
        }

        // If condition doesn't match and 'else' has validationRules
        if (!conditionMatches && logic.else?.validationRules) {
          // If field has no validationRules, use only the conditional validationRules
          // Otherwise, merge them
          return field.validationRules
            ? { ...field.validationRules, ...logic.else.validationRules }
            : logic.else.validationRules;
        }
      }

      return field.validationRules;
    },
    [formData]
  );

  // Memoize evaluated fields to prevent creating new objects on every render
  // CRITICAL OPTIMIZATION: Only recalculate when fields that affect conditional logic change
  // This prevents image blinking by avoiding unnecessary re-renders of file/image fields
  // when other form fields change (e.g., typing in text fields, changing dropdowns)
  const evaluatedFields = useMemo(() => {
    if (userProfileFormFields.length === 0 || loading) return [];

    // Extract only the formData values that might affect conditional logic
    // Dynamically find citizenship field
    const citizenshipKey = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('citizenship')
    );
    const citizenshipValue = citizenshipKey ? formData[citizenshipKey] : null;

    return userProfileFormFields.map((field) => {
      let validationRules = field.validationRules;

      // Only evaluate conditional logic if the field has it
      if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
        for (const logic of field.conditionalLogic) {
          const when = logic.when;
          if (!when?.field) continue;

          const dependentValue = formData[when.field];
          const operator = when.operator || 'equals';
          const expectedValues = Array.isArray(when.value)
            ? when.value
            : [when.value];

          let conditionMatches = false;
          const isCitizenshipField = when.field
            .toLowerCase()
            .includes('citizenship');

          switch (operator) {
            case 'in':
            case 'equals':
            case 'equal': // Added support for 'equal' operator
              if (isCitizenshipField) {
                const dependentValueLower = String(
                  dependentValue ?? ''
                ).toLowerCase();
                const expectedValuesLower = expectedValues.map((v: any) =>
                  String(v).toLowerCase()
                );
                conditionMatches =
                  expectedValuesLower.includes(dependentValueLower);
              } else {
                conditionMatches = expectedValues
                  .map(String)
                  .includes(String(dependentValue ?? ''));
              }
              break;
            case 'not_in':
            case 'not_equals':
              if (isCitizenshipField) {
                const dependentValueLower = String(
                  dependentValue ?? ''
                ).toLowerCase();
                const expectedValuesLower = expectedValues.map((v: any) =>
                  String(v).toLowerCase()
                );
                conditionMatches =
                  !expectedValuesLower.includes(dependentValueLower);
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
            default:
              conditionMatches = false;
          }

          // If condition matches and 'then' has validationRules
          if (conditionMatches && logic.then?.validationRules) {
            // If field has no validationRules, use only the conditional validationRules
            // Otherwise, merge them
            validationRules = field.validationRules
              ? { ...field.validationRules, ...logic.then.validationRules }
              : logic.then.validationRules;
            break;
          }

          // If condition doesn't match and 'else' has validationRules
          if (!conditionMatches && logic.else?.validationRules) {
            // If field has no validationRules, use only the conditional validationRules
            // Otherwise, merge them
            validationRules = field.validationRules
              ? { ...field.validationRules, ...logic.else.validationRules }
              : logic.else.validationRules;
            break;
          }
        }
      }

      return {
        ...field,
        evaluatedValidationRules: validationRules,
      };
    });
  }, [
    userProfileFormFields,
    loading,
    formData,
    Object.keys(formData).find((k) => k.toLowerCase().includes('citizenship')),
  ]);

  useEffect(() => {
    if (evaluatedFields.length > 0 && !loading) {
      const fieldsWithConditionalLogic = evaluatedFields
        .map((field) => ({
          ...field,
          validationRules: field.evaluatedValidationRules,
        }))
        // Skip Digipin validation - remove validation rules for Digipin field
        .map((field) => {
          if (
            field.fieldName &&
            field.fieldName.toLowerCase().includes('digipin')
          ) {
            return {
              ...field,
              validationRules: null, // Remove validation rules for Digipin
            };
          }
          return field;
        });

      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    }
  }, [evaluatedFields, validationSchemaBuilder, loading]);

  const handleTextChange = useCallback(
    (fieldName: string, value: string) => {
      let processedValue = value;

      // Auto-capitalize PAN and GSTIN input
      const isPanOrGstinField =
        fieldName.toLowerCase().includes('pan') ||
        fieldName.toLowerCase().includes('gstin');

      if (isPanOrGstinField) {
        processedValue = value.toUpperCase();
      }

      // Check if this is Proof of Identity Number field
      const isProofOfIdentityNumberField =
        fieldName === 'noProofOfIdentityNumber' ||
        fieldName.toLowerCase().includes('proofofidentitynumber');

      // Check if this is Employee Code field
      const isEmployeeCodeField =
        fieldName === 'noEmployCode' ||
        fieldName.toLowerCase().includes('employcode') ||
        fieldName.toLowerCase().includes('employeecode');

      // Check if this is Authorization Letter field
      const isAuthorizationLetterField =
        fieldName.toLowerCase().includes('authorizationletter') &&
        !fieldName.toLowerCase().includes('file');

      if (isProofOfIdentityNumberField) {
        // Find the corresponding proof of identity field name
        // Remove "Number" but keep any trailing digits
        // E.g., "iauProofOfIdentityNumber2" -> "iauProofOfIdentity2"
        const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
        const proofType = String(
          formDataRef.current[proofFieldName] ||
            formDataRef.current['noProofOfIdentity'] ||
            ''
        ).toUpperCase();

        console.log(`🔍 Proof of Identity Number field detected:`, {
          fieldName,
          proofFieldName,
          proofType,
          originalValue: value,
          valueLength: value.length,
        });

        // Apply validation based on proof type
        if (proofType === 'PAN CARD' || proofType === 'PAN_CARD') {
          // PAN: uppercase, max 10 characters
          processedValue = value
            .toUpperCase()
            .slice(0, maxLengthByIdType.PAN_CARD);
        } else if (proofType === 'AADHAAR') {
          // AADHAAR: only numeric, max 4 digits (last 4 of Aadhaar)
          processedValue = value
            .replace(/\D/g, '')
            .slice(0, maxLengthByIdType.AADHAAR);
          console.log(`✂️ AADHAAR processed:`, {
            original: value,
            processed: processedValue,
            maxLength: maxLengthByIdType.AADHAAR,
          });
        } else if (proofType === 'VOTER ID' || proofType === 'VOTER_ID') {
          // Voter ID: uppercase, max 10 characters
          processedValue = value
            .toUpperCase()
            .slice(0, maxLengthByIdType.VOTER_ID);
        } else if (
          proofType === 'DRIVING LICENSE' ||
          proofType === 'DRIVING_LICENSE'
        ) {
          // Driving License: uppercase, alphanumeric, max 18 characters
          processedValue = value
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '')
            .slice(0, maxLengthByIdType.DRIVING_LICENSE);
        } else if (proofType === 'PASSPORT') {
          // Passport: uppercase, alphanumeric, max 9 characters
          processedValue = value
            .toUpperCase()
            .slice(0, maxLengthByIdType.PASSPORT);
        } else {
          // Default: just uppercase
          processedValue = value.toUpperCase();
        }
      }

      const updatedFormData = {
        ...formDataRef.current,
        [fieldName]: processedValue,
      };

      // Clear file if Proof of Identity Number, Employee Code, or Authorization Letter changes
      // if (
      //   isProofOfIdentityNumberField ||
      //   isEmployeeCodeField ||
      //   isAuthorizationLetterField
      // ) {
      //   // Find the field to get the correct file field name
      //   const field = userProfileFormFields.find(
      //     (f) => f.fieldName === fieldName
      //   );

      //   if (field && field.fieldType === 'textfield_with_image') {
      //     const fileFieldName = field.fieldFileName || `${fieldName}File`;
      //     updatedFormData[fileFieldName] = null;

      //     const fieldType = isEmployeeCodeField
      //       ? 'employee code'
      //       : isAuthorizationLetterField
      //         ? 'authorization letter'
      //         : 'POI number';

      //     console.log(
      //       `🗑️ Clearing file because ${fieldType} changed: ${fileFieldName}`
      //     );

      //     // Clear from existing documents (both ID and data)
      //     setExistingDocuments((prevDocs) => {
      //       const newDocs = { ...prevDocs };
      //       delete newDocs[fileFieldName];
      //       return newDocs;
      //     });

      //     setExistingDocumentData((prevData) => {
      //       const newData = { ...prevData };
      //       delete newData[fileFieldName];
      //       return newData;
      //     });
      //   }

      //   // Don't clear file validation error here - let the validation below handle it
      //   // This way, if file is required, the error will show after clearing
      // }

      // Update ref immediately so handleValidate can access latest values
      // (avoids stale closure when user types and immediately clicks Validate)
      formDataRef.current = updatedFormData;
      setFormData(updatedFormData);
      if (!isAddMode) {
        const originalValue = stepData?.[fieldName] || '';
        const hasChanged = String(processedValue) !== String(originalValue);

        if (hasChanged) {
          setChangedFields((prev) => {
            if (!prev.includes(fieldName)) {
              return [...prev, fieldName];
            }
            return prev;
          });
          setChangedFieldsData((prev) => ({
            ...prev,
            [fieldName]: processedValue,
          }));
        } else {
          // Remove from changed fields if value is back to original
          setChangedFields((prev) =>
            prev.filter((field) => field !== fieldName)
          );
          setChangedFieldsData((prev) => {
            const newData = { ...prev };
            delete newData[fieldName];
            return newData;
          });
        }
      }
      // Validate field using validateField from formSlice
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      if (field) {
        const formSliceField = convertToFormSliceField(field);

        setValidationErrors((prev) => {
          const newErrors = { ...prev };

          // For textfield_with_image, validate text and file separately
          if (field.fieldType === 'textfield_with_image') {
            const fileFieldName = field.fieldFileName || `${fieldName}_file`;
            const fileValue = updatedFormData[fileFieldName];

            // Validate text field only (ignore file validation for text)
            const textValidationRules = field.validationRules
              ? { ...field.validationRules, validationFile: undefined }
              : null;
            const textFieldForValidation = {
              ...formSliceField,
              validationRules: textValidationRules,
            };

            const textError = validateField(
              textFieldForValidation,
              processedValue,
              updatedFormData
            );

            // Debug logging for proof of identity
            if (fieldName === 'noProofOfIdentityNumber') {
              console.log('🔍 Proof of Identity Number validation:', {
                fieldName,
                processedValue,
                textError,
                fieldType: field.fieldType,
                fileFieldName: field.fieldFileName,
                formDataKeys: Object.keys(updatedFormData),
                fileValue: updatedFormData[field.fieldFileName || ''],
              });
            }

            if (textError) {
              newErrors[fieldName] = textError;
            } else {
              delete newErrors[fieldName];
            }

            // Validate file field separately
            const fileError = validateField(
              formSliceField,
              fileValue as string | File | null,
              updatedFormData
            );

            // Only show file error if file is not null (we didn't just clear it)
            if (fileError && fileValue !== null) {
              newErrors[fileFieldName] = fileError;
            } else {
              delete newErrors[fileFieldName];
            }
          } else {
            // For other field types, validate normally
            const textError = validateField(
              formSliceField,
              processedValue,
              updatedFormData
            );

            if (textError) {
              newErrors[fieldName] = textError;
            } else {
              delete newErrors[fieldName];
            }
          }

          return newErrors;
        });
      }
    },
    [userProfileFormFields]
  );

  const handleFileUpload = useCallback(
    (fieldName: string | undefined, file: File | null) => {
      if (fieldName !== undefined) {
        const updatedFormData = {
          ...formDataRef.current,
          [fieldName]: file,
        };

        setFormData(updatedFormData);
        // Track changed field for files
        if (!isAddMode && file) {
          setChangedFields((prev) => {
            if (!prev.includes(fieldName)) {
              return [...prev, fieldName];
            }
            return prev;
          });
          setChangedFieldsData((prev) => ({
            ...prev,
            [fieldName]: file,
          }));
        } else if (!isAddMode && !file) {
          // If file is cleared, remove from changed fields
          setChangedFields((prev) =>
            prev.filter((field) => field !== fieldName)
          );
          setChangedFieldsData((prev) => {
            const newData = { ...prev };
            delete newData[fieldName];
            return newData;
          });
        }

        // Find the field configuration for this file field
        // For textfield_with_image, fieldName will be the fieldFileName (e.g., 'noProofOfIdentityFile')
        // We need to find the parent field that has this fieldFileName
        const field = userProfileFormFields.find(
          (f) => f.fieldFileName === fieldName || f.fieldName === fieldName
        );

        if (field) {
          const formSliceField = convertToFormSliceField(field);
          const fileError = validateField(
            formSliceField,
            file,
            updatedFormData
          );

          // Debug logging for proof of identity file
          if (
            field.fieldName === 'noProofOfIdentityNumber' ||
            fieldName?.includes('ProofOfIdentity')
          ) {
            console.log('📁 File upload validation:', {
              fieldName,
              fileFieldName: field.fieldFileName,
              fileName: file?.name,
              fileError,
              fieldType: field.fieldType,
              textFieldName: field.fieldName,
              textValue: updatedFormData[field.fieldName],
              formDataKeys: Object.keys(updatedFormData),
            });
          }

          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            if (fileError) {
              newErrors[fieldName] = fileError;
            } else {
              delete newErrors[fieldName];
            }

            // For textfield_with_image, also validate the text field
            if (field.fieldType === 'textfield_with_image') {
              const textValue = updatedFormData[field.fieldName];
              const textError = validateField(
                formSliceField,
                textValue as string | File | null,
                updatedFormData
              );
              if (textError) {
                newErrors[field.fieldName] = textError;
              } else {
                delete newErrors[field.fieldName];
              }
            }

            return newErrors;
          });
        } else {
          // Field not found, just clear error
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      }
    },
    [userProfileFormFields]
  );
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [changedFieldsData, setChangedFieldsData] = useState<
    Record<string, any>
  >({});
  // Handle document deletion
  const handleDeleteDocument = useCallback(
    async (fieldName: string, documentId: string) => {
      try {
        console.log(
          `🗑️ Deleting document for field: ${fieldName}, ID: ${documentId}`
        );

        // Dispatch the delete action
        await dispatch(deleteDocumentUserProfile(documentId)).unwrap();

        console.log(`✅ Document deleted successfully for field: ${fieldName}`);

        // Clear the file from form data
        setFormData((prev) => ({
          ...prev,
          [fieldName]: null,
        }));

        // Clear any validation errors for this field
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        if (!isAddMode) {
          // When a file is deleted, mark the field as changed
          setChangedFields((prev) => {
            if (!prev.includes(fieldName)) {
              return [...prev, fieldName];
            }
            return prev;
          });
          setChangedFieldsData((prev) => ({
            ...prev,
            [fieldName]: null, // Set to null to indicate deletion
          }));
        }

        // Show success message (optional)
        // You can add a toast notification here if needed
      } catch (error: any) {
        console.error(
          `❌ Failed to delete document for field: ${fieldName}`,
          error
        );
        // Show error message to user (optional)
        // You can add a toast notification here if needed
      }
    },
    [dispatch]
  );

  const handleDropdownChange = useCallback(
    (fieldName: string, value: string | number) => {
      console.log(`🔽 Dropdown changed: ${fieldName} = ${value}`);
      if (!isAddMode) {
        const originalValue = stepData?.[fieldName] || '';
        if (String(value) !== String(originalValue)) {
          setChangedFields((prev) => {
            if (!prev.includes(fieldName)) {
              return [...prev, fieldName];
            }
            return prev;
          });
          setChangedFieldsData((prev) => ({
            ...prev,
            [fieldName]: value,
          }));
        } else {
          setChangedFields((prev) =>
            prev.filter((field) => field !== fieldName)
          );
          setChangedFieldsData((prev) => {
            const newData = { ...prev };
            delete newData[fieldName];
            return newData;
          });
        }
      }

      // Set flag to prevent useEffect from reloading data
      isUserEditingRef.current = true;

      // Check if this is a "Proof of Identity" dropdown field
      const fieldNameLower = fieldName.toLowerCase();
      const isProofOfIdentityField =
        fieldNameLower.includes('proofofidentity') &&
        !fieldNameLower.includes('number') &&
        !fieldNameLower.includes('file');

      console.log(
        `🔍 Field: ${fieldName}, fieldNameLower: ${fieldNameLower}, isProofOfIdentity: ${isProofOfIdentityField}`
      );

      // Prepare all updates
      const updates: { fieldName: string; value: any }[] = [
        { fieldName: fieldName, value: value },
      ];

      // If proof of identity changed, also clear the number and file
      if (isProofOfIdentityField) {
        // Simply insert "Number" before any trailing digits
        // E.g., "iauProofOfIdentity2" -> "iauProofOfIdentityNumber2"
        //       "noProofOfIdentity" -> "noProofOfIdentityNumber"
        const numberFieldName = fieldName.replace(/(\d*)$/, 'Number$1');

        // Find the number field to get the correct file field name
        const numberField = userProfileFormFields.find(
          (f) => f.fieldName === numberFieldName
        );

        console.log(
          `🗑️ Clearing proof of identity number: ${numberFieldName} (from ${fieldName})`
        );

        // Add number field clear to updates
        updates.push({ fieldName: numberFieldName, value: '' });

        // Clear the file if it's a textfield_with_image field
        if (numberField && numberField.fieldType === 'textfield_with_image') {
          const fileFieldName =
            numberField.fieldFileName || `${numberFieldName}File`;

          console.log(`🗑️ Also clearing file: ${fileFieldName}`);

          // Add file clear to updates
          updates.push({ fieldName: fileFieldName, value: null });

          // Clear from existing documents (both ID and data)
          setExistingDocuments((prevDocs) => {
            const newDocs = { ...prevDocs };
            delete newDocs[fileFieldName];
            return newDocs;
          });

          setExistingDocumentData((prevData) => {
            const newData = { ...prevData };
            delete newData[fileFieldName];
            return newData;
          });

          // Clear validation errors for both fields
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[numberFieldName];
            delete newErrors[fileFieldName];
            return newErrors;
          });
        } else {
          // Just clear the number field error
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[numberFieldName];
            return newErrors;
          });
        }
      }

      // Apply all updates to local state
      setFormData((prev) => {
        const updatedData = { ...prev };
        updates.forEach((update) => {
          updatedData[update.fieldName] = update.value;
        });
        return updatedData;
      });

      // Update formDataRef as well
      const updatedFormDataRef = { ...formDataRef.current };
      updates.forEach((update) => {
        updatedFormDataRef[update.fieldName] = update.value;
      });
      formDataRef.current = updatedFormDataRef;

      // Dispatch all updates to Redux
      updates.forEach((update) => {
        dispatch(
          updateFieldValueUserProfile({
            fieldName: update.fieldName,
            value: update.value,
          })
        );
      });

      // Clear the editing flag after Redux updates have propagated
      setTimeout(() => {
        isUserEditingRef.current = false;
        console.log('✅ Editing complete - data reload re-enabled');
      }, 100);
    },
    [userProfileFormFields, dispatch]
  );

  const handleDateChange = useCallback(
    (fieldName: string, value: string | null) => {
      const updatedFormData = {
        ...formDataRef.current,
        [fieldName]: value,
      };

      setFormData(updatedFormData);
      if (!isAddMode) {
        const originalValue = stepData?.[fieldName] || '';
        const currentValue = value || '';

        // Compare date values properly
        const hasChanged = String(currentValue) !== String(originalValue);

        console.log('📅 Date field changed:', {
          fieldName,
          originalValue,
          currentValue,
          hasChanged,
        });

        if (hasChanged) {
          setChangedFields((prev) => {
            if (!prev.includes(fieldName)) {
              return [...prev, fieldName];
            }
            return prev;
          });
          setChangedFieldsData((prev) => ({
            ...prev,
            [fieldName]: value,
          }));
        } else {
          // Remove from changed fields if value is back to original
          setChangedFields((prev) =>
            prev.filter((field) => field !== fieldName)
          );
          setChangedFieldsData((prev) => {
            const newData = { ...prev };
            delete newData[fieldName];
            return newData;
          });
        }
      }

      // Check if this is a DOB field and validate age
      const isDobField =
        fieldName.toLowerCase().includes('dob') ||
        fieldName.toLowerCase().includes('dateofbirth') ||
        fieldName.toLowerCase().includes('birthdate');

      if (isDobField && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();
        const dayDiff = today.getDate() - selectedDate.getDate();

        // Adjust age if birthday hasn't occurred this year yet
        const actualAge =
          monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

        // Validate age (18-100 years)
        let ageError: string | null = null;
        if (actualAge < 18) {
          ageError = 'Age must be at least 18 years';
        } else if (actualAge > 100) {
          ageError = 'Age must not exceed 100 years';
        }

        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          if (ageError) {
            newErrors[fieldName] = ageError;
          } else {
            delete newErrors[fieldName];
          }
          return newErrors;
        });
      } else {
        // For non-DOB fields, clear any existing errors
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    },
    []
  );

  // Field-level validation on blur
  const handleFieldBlur = useCallback(
    async (fieldName: string) => {
      if (!validationSchema) return;

      // Find the field configuration
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      if (!field) return;

      try {
        // Get current form data
        const currentFormData = formDataRef.current;

        // Validate just this field (text only, not file)
        await validationSchema.validateAt(fieldName, currentFormData);

        // If validation passes, clear any error for this field
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } catch (error: unknown) {
        // If validation fails, set the error for this field
        if (error instanceof Yup.ValidationError) {
          const validationError = error as Yup.ValidationError;
          setValidationErrors((prev) => ({
            ...prev,
            [fieldName]: validationError.message,
          }));
        } else {
          // Handle unexpected errors
          console.error('Unexpected validation error:', error);
        }
      }
    },
    [validationSchema, userProfileFormFields]
  );

  const handleCkycVerified = useCallback(
    (field: FormField, data: any) => {
      console.log('🎉 CKYC OTP verified for User Profile:', field.fieldName);
      const responseData = data?.data?.data || data?.data || data;

      if (!responseData || typeof responseData !== 'object') {
        console.error('❌ Invalid response data format');
        return;
      }

      const mappedData: Record<string, any> = {};

      const normalizeFieldName = (fieldName: string): string => {
        return fieldName.replace(/^(no|ho|re)/i, '').toLowerCase();
      };

      Object.entries(responseData).forEach(([apiKey, apiValue]) => {
        const normalizedApiKey = normalizeFieldName(apiKey);

        const matchingField = userProfileFormFields.find((formField) => {
          const normalizedFormFieldName = normalizeFieldName(
            formField.fieldName
          );
          return normalizedFormFieldName === normalizedApiKey;
        });

        if (matchingField) {
          mappedData[matchingField.fieldName] = apiValue || '';
        }
      });

      const autoPopulateFields =
        field?.conditionalLogic?.[0]?.then?.fieldAttributes?.autoPopulate || [];

      setFormData((prev) => ({
        ...prev,
        ...mappedData,
      }));

      const autoPopulatedFieldNames = new Set<string>();
      autoPopulateFields.forEach((fieldName: string) => {
        autoPopulatedFieldNames.add(fieldName);
      });

      setAutoPopulatedFields(autoPopulatedFieldNames);
      setIsCkycVerified(true);
      setIsCkycVerificationRequired(false);
    },
    [userProfileFormFields]
  );

  const handleCkycVerificationRequired = useCallback((required: boolean) => {
    setIsCkycVerificationRequired(required);
  }, []);

  const handleGenericChange = useCallback(
    (fieldName: string, value: string | ChangeEvent<HTMLInputElement>) => {
      let newValue = typeof value === 'string' ? value : value.target.value;

      // Numeric-only fields (mobile, ckyc)
      if (
        fieldName.toLowerCase().includes('mobile') ||
        fieldName.toLowerCase().includes('ckyc')
      ) {
        newValue = newValue.replace(/\D/g, '');
      }

      // Auto-capitalize PAN and GSTIN input
      const isPanOrGstinField =
        fieldName.toLowerCase().includes('pan') ||
        fieldName.toLowerCase().includes('gstin');

      if (isPanOrGstinField) {
        newValue = newValue.toUpperCase();
      }

      // Check if this is Proof of Identity Number field
      const isProofOfIdentityNumberField =
        fieldName === 'noProofOfIdentityNumber' ||
        fieldName.toLowerCase().includes('proofofidentitynumber');

      // Check if this is Employee Code field
      const isEmployeeCodeField =
        fieldName === 'noEmployCode' ||
        fieldName.toLowerCase().includes('employcode') ||
        fieldName.toLowerCase().includes('employeecode');

      // Check if this is Authorization Letter field
      const isAuthorizationLetterField =
        fieldName.toLowerCase().includes('authorizationletter') &&
        !fieldName.toLowerCase().includes('file');

      if (isProofOfIdentityNumberField) {
        // Find the corresponding proof of identity field name
        // Remove "Number" but keep any trailing digits
        // E.g., "iauProofOfIdentityNumber2" -> "iauProofOfIdentity2"
        const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
        const proofType = String(
          formDataRef.current[proofFieldName] ||
            formDataRef.current['noProofOfIdentity'] ||
            ''
        ).toUpperCase();

        console.log(`🔍 [GenericChange] Proof of Identity Number field:`, {
          fieldName,
          proofFieldName,
          proofTypeFromData: formDataRef.current[proofFieldName],
          proofType,
          originalValue: newValue,
          valueLength: newValue.length,
          formDataKeys: Object.keys(formDataRef.current).filter((k) =>
            k.toLowerCase().includes('proof')
          ),
        });

        // Apply validation based on proof type
        if (proofType === 'PAN CARD' || proofType === 'PAN_CARD') {
          // PAN: uppercase, max 10 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.PAN_CARD);
          console.log(
            `✂️ PAN processed: "${newValue}" (max: ${maxLengthByIdType.PAN_CARD})`
          );
        } else if (proofType === 'AADHAAR') {
          // AADHAAR: only numeric, max 4 digits (last 4 of Aadhaar)
          newValue = newValue
            .replace(/\D/g, '')
            .slice(0, maxLengthByIdType.AADHAAR);
          console.log(
            `✂️ AADHAAR processed: "${newValue}" (max: ${maxLengthByIdType.AADHAAR})`
          );
        } else if (proofType === 'VOTER ID' || proofType === 'VOTER_ID') {
          // Voter ID: uppercase, max 10 characters
          newValue = newValue
            .toUpperCase()
            .slice(0, maxLengthByIdType.VOTER_ID);
        } else if (
          proofType === 'DRIVING LICENSE' ||
          proofType === 'DRIVING_LICENSE'
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

      // Clear file if Proof of Identity Number, Employee Code, or Authorization Letter changes
      // if (
      //   isProofOfIdentityNumberField ||
      //   isEmployeeCodeField ||
      //   isAuthorizationLetterField
      // ) {
      //   // Find the field to get the correct file field name
      //   const field = userProfileFormFields.find(
      //     (f) => f.fieldName === fieldName
      //   );

      //   if (field && field.fieldType === 'textfield_with_image') {
      //     const fileFieldName = field.fieldFileName || `${fieldName}File`;
      //     updatedFormData[fileFieldName] = null;

      //     const fieldType = isEmployeeCodeField
      //       ? 'employee code'
      //       : isAuthorizationLetterField
      //         ? 'authorization letter'
      //         : 'POI number';

      //     console.log(
      //       `🗑️ [GenericChange] Clearing file because ${fieldType} changed: ${fileFieldName}`
      //     );

      //     // Clear from existing documents (both ID and data)
      //     setExistingDocuments((prevDocs) => {
      //       const newDocs = { ...prevDocs };
      //       delete newDocs[fileFieldName];
      //       return newDocs;
      //     });

      //     setExistingDocumentData((prevData) => {
      //       const newData = { ...prevData };
      //       delete newData[fileFieldName];
      //       return newData;
      //     });
      //   }

      //   // Don't clear file validation error here - let the validation below handle it
      //   // This way, if file is required, the error will show after clearing
      // }

      // Update ref immediately so handleValidate can access latest values
      // (avoids stale closure when user types and immediately clicks Validate)
      formDataRef.current = updatedFormData;
      setFormData(updatedFormData);

      // Real-time validation for Proof of Identity Number
      if (isProofOfIdentityNumberField && newValue) {
        const field = userProfileFormFields.find(
          (f) => f.fieldName === fieldName
        );
        if (field) {
          let error: string | null = null;

          // Get proof type from form data
          const proofFieldName = fieldName.replace(/Number(\d*)$/, '$1');
          const proofType = String(
            updatedFormData[proofFieldName] ||
              updatedFormData['noProofOfIdentity'] ||
              ''
          ).toUpperCase();

          // Validate based on proof type
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
            case 'DRIVING LICENCE':
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
          }

          if (error) {
            // Set error immediately
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: error as string,
            }));
            // Return early to skip the generic validation below
            return;
          } else {
            // Clear error if validation passes
            setValidationErrors((prevErrors) => {
              const newErrors = { ...prevErrors };
              delete newErrors[fieldName];
              return newErrors;
            });
            // Return early to skip the generic validation below
            return;
          }
        }
      }

      // Validate field using validateField from formSlice
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      if (field) {
        const formSliceField = convertToFormSliceField(field);

        setValidationErrors((prev) => {
          const newErrors = { ...prev };

          // For textfield_with_image, validate text and file separately
          if (field.fieldType === 'textfield_with_image') {
            const fileFieldName = field.fieldFileName || `${fieldName}_file`;
            const fileValue = updatedFormData[fileFieldName];

            // Validate text field only (ignore file validation for text)
            const textValidationRules = field.validationRules
              ? { ...field.validationRules, validationFile: undefined }
              : null;
            const textFieldForValidation = {
              ...formSliceField,
              validationRules: textValidationRules,
            };

            const textError = validateField(
              textFieldForValidation,
              newValue,
              updatedFormData
            );

            console.log(`📝 Text validation for ${fieldName}:`, {
              value: newValue,
              textError,
              validationRules: textValidationRules,
            });

            if (textError) {
              newErrors[fieldName] = textError;
            } else {
              delete newErrors[fieldName];
            }

            // Validate file field separately
            const fileError = validateField(
              formSliceField,
              fileValue as string | File | null,
              updatedFormData
            );

            // Check if file exists in updatedFormData (not old existingDocuments)
            // This prevents showing errors when we just cleared the file
            const hasFileInFormData = !!(fileValue && fileValue !== null);
            const hasExistingDoc = !!existingDocuments[fileFieldName];

            console.log(`📎 File validation for ${fileFieldName}:`, {
              fileValue,
              fileError,
              existingDoc: existingDocuments[fileFieldName],
              hasFileInFormData,
              hasExistingDoc,
              shouldSkipError: fileValue === null && hasExistingDoc,
            });

            // Show file error only when:
            // 1. Validation reports an error,
            // 2. There is **no** already-uploaded document for this field, and
            // 3. The user has not selected a new file in this session.
            if (
              fileError &&
              !hasExistingDoc &&
              (fileValue === null || fileValue === undefined)
            ) {
              newErrors[fileFieldName] = fileError;
            } else {
              delete newErrors[fileFieldName];
            }
          } else {
            // For other field types, validate normally
            const textError = validateField(
              formSliceField,
              newValue,
              updatedFormData
            );

            if (textError) {
              newErrors[fieldName] = textError;
            } else {
              delete newErrors[fieldName];
            }
          }

          return newErrors;
        });
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Track mobile/email changes for OTP validation
      if (
        fieldName.toLowerCase().includes('mobile') &&
        !fieldName.toLowerCase().includes('countrycode')
      ) {
        const hasChanged = newValue !== originalMobile;
        console.log('📱 Mobile field changed:', {
          fieldName,
          newValue,
          originalMobile,
          hasChanged,
        });
        setIsMobileChanged(hasChanged);
        if (hasChanged) {
          setIsOtpValidated(false);
        }
      } else if (fieldName.toLowerCase().includes('email')) {
        const hasChanged = newValue !== originalEmail;
        console.log('📧 Email field changed:', {
          fieldName,
          newValue,
          originalEmail,
          hasChanged,
        });
        setIsEmailChanged(hasChanged);
        if (hasChanged) {
          setIsOtpValidated(false);
        }
      }
      if (!isAddMode) {
        const originalValue = stepData?.[fieldName] || '';
        if (String(newValue) !== String(originalValue)) {
          // Add to changed fields if not already present
          setChangedFields((prev) => {
            if (!prev.includes(fieldName)) {
              return [...prev, fieldName];
            }
            return prev;
          });

          // Store the changed value
          setChangedFieldsData((prev) => ({
            ...prev,
            [fieldName]: newValue,
          }));
        } else {
          // Remove from changed fields if value is back to original
          setChangedFields((prev) =>
            prev.filter((field) => field !== fieldName)
          );
          setChangedFieldsData((prev) => {
            const newData = { ...prev };
            delete newData[fieldName];
            return newData;
          });
        }
      }
    },
    [stepData, isAddMode, originalMobile, originalEmail, userProfileFormFields]
  );

  const checkIfFileExists = useCallback(
    (fieldName: string): boolean => {
      return !!existingDocuments[fieldName];
    },
    [existingDocuments]
  );

  const getDocumentId = useCallback(
    (fieldName: string): string => {
      return existingDocuments[fieldName] || '';
    },
    [existingDocuments]
  );

  const getDocumentData = useCallback(
    (fieldName: string): DocumentData | undefined => {
      return existingDocumentData[fieldName];
    },
    [existingDocumentData]
  );

  // Helper functions to get mobile, email, and country code values
  const getMobileValue = useCallback(() => {
    // Prioritize 'mobilenumber' field over 'mobile' field
    const mobileField =
      Object.keys(formData).find(
        (key) =>
          key.toLowerCase().includes('mobilenumber') &&
          !key.toLowerCase().includes('countrycode')
      ) ||
      Object.keys(formData).find(
        (key) =>
          key.toLowerCase().includes('mobile') &&
          !key.toLowerCase().includes('countrycode')
      );
    return mobileField ? formData[mobileField] : '';
  }, [formData]);

  const getEmailValue = useCallback(() => {
    const emailField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );
    return emailField ? formData[emailField] : '';
  }, [formData]);

  const getCountryCodeValue = useCallback(() => {
    const countryCodeField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('countrycode')
    );
    return countryCodeField ? formData[countryCodeField] : '';
  }, [formData]);

  const handleValidate = async () => {
    const validationResult = await validateAllFields(
      userProfileFormFields,
      formData,
      validationSchema,
      existingDocuments
    );

    if (!validationResult.isValid) {
      console.log('❌ Validation failed with errors:', validationResult.errors);
      setValidationErrors(validationResult.errors);
      return;
    }
    console.log('✅ Validation passed');
    setValidationErrors({});
    setGeneralError('');

    // Find mobile and email fields dynamically
    // Use formDataRef.current to ensure we get the latest values
    // (avoids stale closure issues when user types and immediately clicks Validate)
    const currentFormData = formDataRef.current;

    // Prioritize 'mobilenumber' field over 'mobile' field
    // (form has both noMobile and noMobileNumber - we need the editable noMobileNumber)
    const mobileField =
      Object.keys(currentFormData).find(
        (key) =>
          key.toLowerCase().includes('mobilenumber') &&
          !key.toLowerCase().includes('countrycode')
      ) ||
      Object.keys(currentFormData).find(
        (key) =>
          key.toLowerCase().includes('mobile') &&
          !key.toLowerCase().includes('countrycode')
      );
    const emailField = Object.keys(currentFormData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );
    const countryCodeField = Object.keys(currentFormData).find((key) =>
      key.toLowerCase().includes('countrycode')
    );

    // In Add Mode: validate if mobile/email have values
    // In Update Mode: validate if mobile or email has changed
    const shouldValidate = isAddMode
      ? (mobileField && currentFormData[mobileField]) ||
        (emailField && currentFormData[emailField])
      : isMobileChanged || isEmailChanged;

    if (shouldValidate) {
      // Build OTP payload conditionally based on what changed
      // Only include fields that have actually changed
      const otpData: {
        requestType: string;
        emailId?: string;
        mobileNo?: string;
        countryCode?: string;
      } = {
        requestType: 'DIRECT',
      };

      // In Add Mode: include both if they have values
      // In Update Mode: only include changed fields
      if (isAddMode) {
        // Add Mode: include fields that have values
        if (emailField && currentFormData[emailField]) {
          otpData.emailId = currentFormData[emailField] as string;
        }
        if (mobileField && currentFormData[mobileField]) {
          otpData.mobileNo = currentFormData[mobileField] as string;
          otpData.countryCode = (
            countryCodeField ? currentFormData[countryCodeField] : ''
          ) as string;
        }
      } else {
        // Update Mode: only include changed fields
        if (isEmailChanged && emailField) {
          otpData.emailId = currentFormData[emailField] as string;
        }
        if (isMobileChanged && mobileField) {
          otpData.mobileNo = currentFormData[mobileField] as string;
          otpData.countryCode = (
            countryCodeField ? currentFormData[countryCodeField] : ''
          ) as string;
        }
      }

      console.log('📤 Sending OTP to:', otpData);

      try {
        const result = await dispatch(OTPSend(otpData));
        if (OTPSend.fulfilled.match(result)) {
          console.log('✅ OTP sent successfully!', result);
          setOtpIdentifier(result?.payload?.data?.otpIdentifier);
          setIsOtpModalOpen(true);
          setGeneralError(''); // Clear any previous errors
        } else if (OTPSend.rejected.match(result)) {
          // Handle rejected OTP send
          const errorPayload = result.payload as any;
          const errorMessage =
            errorPayload?.error?.message ||
            errorPayload?.message ||
            'Something Went Wrong';

          setGeneralError(errorMessage);
          console.error('❌ OTP send failed:', errorPayload);
        }
      } catch (error) {
        console.error('❌ Error sending OTP:', error);
        setGeneralError(
          'An error occurred while sending OTP. Please try again.'
        );
      }
    } else {
      console.log('ℹ️  No mobile/email changes detected, skipping OTP');
      setGeneralError(
        'No mobile or email changes detected. Please modify mobile or email to validate.'
      );
    }
  };

  const handleOtpSubmit = (mobileOtp: string, emailOtp: string) => {
    // Mark as validated and close OTP modal
    setIsOtpValidated(true);
    setIsOtpModalOpen(false);

    // Find mobile and email fields dynamically
    // Prioritize 'mobilenumber' field over 'mobile' field
    const mobileField =
      Object.keys(formData).find(
        (key) =>
          key.toLowerCase().includes('mobilenumber') &&
          !key.toLowerCase().includes('countrycode')
      ) ||
      Object.keys(formData).find(
        (key) =>
          key.toLowerCase().includes('mobile') &&
          !key.toLowerCase().includes('countrycode')
      );
    const emailField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('email') &&
        !key.toLowerCase().includes('mobile')
    );

    // Update original values after successful validation
    if (mobileField && formData[mobileField]) {
      setOriginalMobile(formData[mobileField] as string);
      setIsMobileChanged(false);
    }
    if (emailField && formData[emailField]) {
      setOriginalEmail(formData[emailField] as string);
      setIsEmailChanged(false);
    }

    console.log('✅ OTP validated successfully', {
      mobileOtp,
      emailOtp,
      newMobile: mobileField ? formData[mobileField] : null,
      newEmail: emailField ? formData[emailField] : null,
    });

    // Show success modal with dynamic message
    let message = '';
    if (
      mobileField &&
      formData[mobileField] &&
      emailField &&
      formData[emailField]
    ) {
      // message += 'Mobile OTP Verified Successfully';
      message += 'OTP Verified Successfully';
    } else if (mobileField && formData[mobileField]) {
      message += 'OTP Verified Successfully';
      // message += 'Email OTP Verified Successfully';
    } else if (emailField && formData[emailField]) {
      message += 'OTP Verified Successfully';
    }

    setSuccessTitle('');
    setSuccessMessage(message);
    setIsSuccessModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (validationSchema) {
        const validationResult = await validateAllFields(
          userProfileFormFields,
          formData,
          validationSchema,
          existingDocuments
        );

        if (!validationResult.isValid) {
          console.log(
            '❌ Validation failed with errors:',
            validationResult.errors
          );
          setValidationErrors(validationResult.errors);
          setGeneralError('Please fix all validation errors before saving.');
          return;
        }

        console.log('✅ Validation passed successfully');
        setValidationErrors({});
        setGeneralError('');

        // Get userId from auth state
        const userId = userDetails?.userId || userDetails?.id;

        if (!userId) {
          console.error('❌ Missing userId:', { userDetails });
          setGeneralError('Missing user ID. Please try logging in again.');
          return;
        }

        console.log('📋 User ID found:', userId);

        // Get acknowledgementNo from stepData or generate one
        const acknowledgementNo =
          (stepData as any)?.acknowledgementNo || `ACK${Date.now()}`;

        console.log('📋 Acknowledgement No:', acknowledgementNo);

        // Create the formValues object with all the data
        const formValues: Record<
          string,
          string | File | number | boolean | object | null
        > = { ...formData };

        // Skip Digipin field - remove it from submission to avoid backend validation errors
        Object.keys(formValues).forEach((key) => {
          if (key.toLowerCase().includes('digipin')) {
            delete formValues[key];
            console.log(`🔄 Skipped Digipin field: ${key}`);
          }
        });
        const filteredChangedFields = changedFields.filter((fieldName) => {
          const originalValue = stepData?.[fieldName];
          const currentValue = formData[fieldName];

          // For files, check if a new file was uploaded
          const field = userProfileFormFields.find(
            (f) => f.fieldName === fieldName || f.fieldFileName === fieldName
          );

          if (
            field?.fieldType === 'file' ||
            field?.fieldType === 'textfield_with_image'
          ) {
            // For file fields, check if file exists in changedFieldsData
            return !!changedFieldsData[fieldName];
          }

          return String(currentValue) !== String(originalValue);
        });

        // Call /api/v1/update-user-profile to initiate workflow and generate PDF
        console.log(
          '📋 Calling /api/v1/update-user-profile to initiate workflow'
        );

        const result = await dispatch(
          submitUserProfileUpdate({
            formValues,
            userId,
            acknowledgementNo,
            formType: currentFormType,
            changedFields: filteredChangedFields,
            changedFieldsData,
          })
        ).unwrap();

        console.log('✅ User Profile workflow initiated:', {
          ...result,
          changedFieldsSubmitted: filteredChangedFields,
        });

        // Clear changed fields after successful submission
        setChangedFields([]);
        setChangedFieldsData({});

        // Clear any previous errors
        setGeneralError('');

        // Store workflow information and fetch PDF
        if (result.data && result.data.pdfDocumentId) {
          console.log('📦 Workflow information:', {
            workflowId: result.data.workflowId,
            workflowType: result.data.workflowType,
            status: result.data.status,
            acknowledgementNo: result.data.acknowledgementNo,
            pdfDocumentId: result.data.pdfDocumentId,
          });

          // Reset fetch flags
          setPdfFetchInitiated(null);
          setSignedPdfFetchInitiated(null);

          // Clear any existing PDF document
          dispatch(clearPdfDocumentUserProfile());

          // Open PDF preview modal
          setPdfModalOpen(true);

          // Fetch the generated PDF document
          setPdfFetchInitiated(result.data.pdfDocumentId);
          await dispatch(
            fetchUserProfilePdf(result.data.pdfDocumentId)
          ).unwrap();
        } else {
          setGeneralError(
            'User profile updated successfully, but PDF generation failed.'
          );
        }
      } else {
        console.error('❌ Validation schema is null or undefined');
        setGeneralError(
          'Validation schema not loaded. Please refresh the page.'
        );
      }
    } catch (error: any) {
      console.error('❌ Error caught in handleSave:', error);
      console.log('🔍 Full error object:', JSON.stringify(error, null, 2));

      if (error instanceof Yup.ValidationError) {
        console.log('❌ Yup Validation Error detected');
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
        setGeneralError('Please fix all validation errors before saving.');
      } else {
        // Check if this is a workflow already submitted error
        // The error might be nested in multiple ways: error.error, error.data.error, or just error
        const errorData =
          error?.error || error?.data?.error || error?.data || error;

        const errorErrors = errorData?.errors || [];

        // Check for workflow error (Application Already Submitted)
        const workflowError = errorErrors.find(
          (err: any) => err?.field === 'workflow'
        );

        if (workflowError && workflowError.message) {
          // Show error modal with workflow message
          const fullMessage = workflowError.message;
          // Extract the main message before the ID part
          const mainMessage = fullMessage.split('. ID:')[0];
          const detailMessage = fullMessage.includes('. ID:')
            ? fullMessage.split('. ID:')[1].trim()
            : fullMessage; // Show full message if no ID part

          setErrorModalTitle(mainMessage);
          setErrorModalMessage(detailMessage);
          setIsErrorModalOpen(true);
        } else if (
          errorData?.type === 'ERROR_FORM_VALIDATIONS' &&
          errorData?.code === 'ERR_RE_CMS_003' &&
          errorErrors.length > 0
        ) {
          // Handle the specific error format from your API

          const firstError = errorErrors[0];
          const fullMessage = firstError.message || 'An error occurred';
          const mainMessage = fullMessage.split('. ID:')[0];
          const detailMessage = fullMessage.includes('. ID:')
            ? fullMessage.split('. ID:')[1].trim()
            : fullMessage;

          setErrorModalTitle(mainMessage);
          setErrorModalMessage(detailMessage);
          setIsErrorModalOpen(true);
        } else if (
          error &&
          typeof error === 'object' &&
          'fieldErrors' in error
        ) {
          // Handle API field validation errors
          const apiFieldErrors = (error as any).fieldErrors || {};
          console.error('❌ API field validation errors:', apiFieldErrors);
          setValidationErrors(apiFieldErrors);
          setGeneralError(
            (error as any).message || 'Form validation failed on server.'
          );
        } else {
          const errorMessage =
            (error as any)?.message ||
            errorData?.message ||
            'An error occurred while saving user profile. Please try again.';
          setGeneralError(errorMessage);
          console.error('❌ General error:', errorMessage);
        }
      }
    }
  };

  // Fetch signed PDF when signedDocumentId is available
  useEffect(() => {
    if (
      signedDocumentId &&
      !signedDocument &&
      !pdfDocumentLoading &&
      signedPdfFetchInitiated !== signedDocumentId
    ) {
      setSignedPdfFetchInitiated(signedDocumentId);
      dispatch(fetchSignedUserProfilePdf(signedDocumentId));
    }
  }, [
    signedDocumentId,
    signedDocument,
    pdfDocumentLoading,
    signedPdfFetchInitiated,
    dispatch,
  ]);

  // eSign handler
  const handleESign = async (place: string, date: string) => {
    if (!workflowId || !userDetails?.userId) {
      setGeneralError('Missing workflow ID or user ID. Please try again.');
      return;
    }

    try {
      console.log('📝 Signing user profile with:', { workflowId, place, date });

      // Call eSign API
      await dispatch(
        eSignUserProfile({
          workflowId,
          userId: userDetails.userId,
          declaration: true,
          declarationPlace: place,
          declarationDate: date,
        })
      ).unwrap();

      console.log('✅ User profile e-signed successfully');
      // Modal will automatically update to show signed document
      // when signedDocumentId is set and signedDocument is fetched
    } catch (error: any) {
      console.error('❌ eSign failed:', error);
      setGeneralError(
        error?.message || 'Failed to sign document. Please try again.'
      );
    }
  };

  const handleModalClose = () => {
    setPdfModalOpen(false);
  };

  const handleBackToHome = async () => {
    // Final submission after e-sign
    if (!workflowId || !userDetails?.userId) {
      setGeneralError('Missing workflow ID or user ID. Please try again.');
      return;
    }

    try {
      console.log('📤 Final submit user profile with:', {
        workflowId,
        userId: userDetails.userId,
        formData,
      });

      await dispatch(
        finalSubmitUserProfile({
          workflowId,
          userId: userDetails.userId,
          formData, // Pass the form data for submission
        })
      ).unwrap();

      console.log(
        '✅ User profile update completed successfully. Acknowledgement No:',
        acknowledgementNo
      );

      // Show success message
      setSuccessTitle('Success');
      setSuccessMessage('User profile update request submitted for approval');
      setIsSuccessModalOpen(true);

      // Close PDF modal
      setPdfModalOpen(false);
    } catch (error: any) {
      console.error('❌ Final submit failed:', error);
      setGeneralError(
        error?.message || 'Failed to submit user profile. Please try again.'
      );
    }
  };

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
        <div>Loading User Profile form data...</div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#fefefeff', minHeight: '100vh' }}>
      <BreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'Update Profile', href: '/re/dashboard' },
          { label: 'User Profile' },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          mt: 3,
          ml: 0.5,
        }}
      >
        <Typography
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: '0.9rem',
              sm: '1.05rem',
              md: '1.15rem',
              lg: '1.25rem',
              xl: '1.35rem',
            },
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          User Profile
        </Typography>
      </Box>
      {generalError && (
        <Alert
          severity={generalError.includes('success') ? 'success' : 'warning'}
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
        key={'user_profile'}
        title={'User Profile '}
        groupKey={'user_profile'}
        defaultExpanded={true}
        showAddButton={false}
      >
        <ThreeColumnGrid>
          {evaluatedFields.map((field: any) => {
            const fieldValue = formData[field.fieldName] || '';

            let fieldError = validationErrors[field.fieldName];
            if (field.fieldType === 'textfield_with_image') {
              const fileFieldName =
                field.fieldFileName || `${field.fieldName}_file`;
              const fileError = validationErrors[fileFieldName];
              fieldError = fieldError || fileError;
            }

            // Get the correct document key based on field type
            // For textfield_with_image, use fieldFileName
            // For file, use fieldName
            let documentKey = field.fieldName;
            if (field.fieldType === 'textfield_with_image') {
              documentKey = field.fieldFileName || `${field.fieldName}_file`;
            }

            const existingDocument = existingDocumentData[documentKey];

            // Check visibility for pincodeOther fields BEFORE rendering FieldContainer
            if (
              field.fieldName.includes('PincodeOther') ||
              field.fieldName.includes('pincodeOther')
            ) {
              const mainPincodeFieldName = field.fieldName
                .replace(/Other/i, '')
                .replace(/other/i, '');
              const mainPincodeValue = formData[mainPincodeFieldName];

              // Hide the field entirely (and let the grid re-flow) unless "other" is chosen
              if (String(mainPincodeValue).toLowerCase() !== 'other') {
                return null; // No placeholder – allows next fields to shift left
              }
            }

            return (
              <FieldContainer key={field.id}>
                <FieldRenderer
                  field={field}
                  value={fieldValue}
                  validationError={fieldError}
                  validationErrors={validationErrors}
                  existingDocument={existingDocument}
                  evaluatedValidationRules={field.evaluatedValidationRules}
                  onTextChange={handleTextChange}
                  onDropdownChange={handleDropdownChange}
                  onDateChange={handleDateChange}
                  onFileUpload={handleFileUpload}
                  onDeleteDocument={handleDeleteDocument}
                  onGenericChange={handleGenericChange}
                  onFieldBlur={handleFieldBlur}
                  getFieldError={getFieldError}
                  getDocumentData={getDocumentData}
                  checkIfFileExists={checkIfFileExists}
                  getDocumentId={getDocumentId}
                  isAddMode={isAddMode}
                  isCkycVerified={isCkycVerified}
                  formData={formData}
                  onCkycVerified={handleCkycVerified}
                  onCkycVerificationRequired={handleCkycVerificationRequired}
                  dropdownData={dropdownData}
                  allFormFields={userProfileFormFields}
                  autoPopulatedFields={autoPopulatedFields}
                />
              </FieldContainer>
            );
          })}
        </ThreeColumnGrid>
      </UpdateFormAccordion>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <FormActionButtonsUpdate
          onSave={handleSave}
          onValidate={handleValidate}
          validateLabel={
            configuration?.submissionSettings?.validateButtonText || 'Validate'
          }
          showValidate={true}
          showSave={configuration?.submissionSettings?.submitButton !== false}
          saveLabel={
            configuration?.submissionSettings?.submitButtonText ||
            'Save Profile'
          }
          loading={false}
          saveDisabled={
            // Disable save if mobile/email changed but not validated OR CKYC verification required
            ((isMobileChanged || isEmailChanged) && !isOtpValidated) ||
            isCkycVerificationRequired
          }
          validateDisabled={
            // Disable validate if no mobile/email values OR already validated OR no changes
            (!getMobileValue() && !getEmailValue()) ||
            isOtpValidated ||
            (!isMobileChanged && !isEmailChanged)
          }
          clearDisabled={
            isAddMode
              ? !Object.keys(formData).some(
                  (key) =>
                    formData[key] !== null &&
                    formData[key] !== undefined &&
                    formData[key] !== ''
                )
              : false
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
        mobile={getMobileValue() as string}
        email={getEmailValue() as string}
      />

      {/* PDF Preview Modal */}
      {pdfModalOpen && (
        <PdfPreviewModalUpdate
          open={pdfModalOpen}
          onClose={handleModalClose}
          pdfDocument={signedDocument || pdfDocument}
          loading={pdfDocumentLoading || eSignLoading || finalSubmitLoading}
          error={generalError || null}
          onESign={handleESign}
          onBackToHome={handleBackToHome}
          isSignedDocument={!!signedDocument}
          submissionLoading={finalSubmitLoading}
        />
      )}

      {/* Success Modal for OTP Verification */}
      <SuccessModalUpdateuser
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successTitle}
        message={successMessage}
        onOkay={() => setIsSuccessModalOpen(false)}
      />

      {/* Error Modal for Workflow Errors */}
      <ErrorModal
        open={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorModalTitle}
        primaryMessage={errorModalMessage}
        buttonText="Okay"
      />
    </Box>
  );
};

export default UpdateUserProfileStep;
