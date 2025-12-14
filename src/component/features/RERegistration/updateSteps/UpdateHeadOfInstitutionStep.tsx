/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  LabeledDate,
  UploadButton,
  LabeledCheckbox,
} from '../../../../component/features/RERegistration/CommonComponent';
import {
  fetchStepDataHoi,
  fetchFormFieldsHoi,
  selectHoiStepDataLoading,
  fetchDocumentHoi,
  fetchDropdownDataHoi,
  selectHoiDropdownOptions,
  selectHoiDropdownLoading,
  selectHoiDropdownData,
} from './slice/updateHeadOfInstitutionSlice';
import LabeledTextFieldWithVerifyUpdate from './CommonComponnet/LabeledTextFieldWithVerifyUpdate';
import OTPModalUpdateEntity from './CommonComponnet/OtpModalUpdateEntity';
import SuccessModalUpdate from './CommonComponnet/SuccessModalUpdate';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import {
  buildValidationSchema,
  validateAllFields,
  validateSingleField,
  validatePANForConstitution,
} from './formValidation';
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
import FormAccordion from 'component/features/RERegistration/CommonComponent/FormAccordion';
import { useFieldError } from '../context/FieldErrorContext';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import LabeledDropDownUpdate from './CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from './CommonComponnet/LabledTextFieldUpdate';
import LabeledTextFieldWithUploadUpdate from './CommonComponnet/LableledTextFieldWithUploadUpdate';
import { submitUpdatedHoiDetails } from './slice/updateHeadOfInstitutionSubmissionSlice';
import UpdateFormAccordion from './UpdateFormAccordion';

interface StepProps {
  onSaveAndNext: () => void;
}

interface FormData {
  [key: string]: string | File | null | number | boolean | object;
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
  onCheckboxChange: (fieldName: string, checked: boolean) => void;
  getFieldError: (fieldName: string) => string | undefined;
  getDocumentData: (fieldName: string) => DocumentData | undefined;
  checkIfFileExists: (fieldName: string) => boolean;
  getDocumentId: (fieldName: string) => string;
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
    existingDocument,
    evaluatedValidationRules,
    onTextChange,
    onDropdownChange,
    onDateChange,
    onFileUpload,
    onGenericChange,
    onCheckboxChange,
    getFieldError,
    getDocumentData,
    checkIfFileExists,
    getDocumentId,
    isCkycVerified,
    formData,
    onCkycVerified,
    onCkycVerificationRequired,
    dropdownData,
    allFormFields,
    autoPopulatedFields,
  }) => {
    const apiFieldError = getFieldError(field.fieldName);

    // Check if field should be disabled based on CKYC verification
    const isFieldAutoDisabled = () => {
      // Find citizenship field dynamically (fieldName includes 'citizenship')
      const citizenshipField = Object.keys(formData).find((key) =>
        key.toLowerCase().includes('citizenship')
      );
      const citizenshipValue = citizenshipField
        ? formData[citizenshipField]
        : null;
      const isIndianCitizen = !!(
        citizenshipField && citizenshipValue === 'Indian'
      );

      // Only disable fields that were actually auto-populated from CKYC verification
      const isAutoPopulatedField = autoPopulatedFields.has(field.fieldName);

      // Debug logging for every field

      return isAutoPopulatedField && isIndianCitizen;
    };

    const shouldDisableField = isFieldAutoDisabled();

    const validationRules = evaluatedValidationRules || field.validationRules;

    let fileError = '';
    let apiFileError = '';
    let documentId = '';
    let fileExistsForField = false;

    if (field.fieldType === 'textfield_with_image') {
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      documentId = getDocumentId(fileFieldName);
      fileExistsForField = checkIfFileExists(fileFieldName);

      const fileValidationError = validationError;
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

        return (
          <LabeledTextFieldUpdate
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            placeholder={fieldPlaceholder}
            required={validationRules?.required || false}
            minLength={
              isMobileField && mobileRules?.minLength
                ? parseInt(mobileRules.minLength)
                : validationRules?.minLength
                  ? parseInt(validationRules.minLength)
                  : undefined
            }
            maxLength={
              isMobileField && mobileRules?.maxLength
                ? parseInt(mobileRules.maxLength)
                : validationRules?.maxLength
                  ? parseInt(validationRules.maxLength)
                  : undefined
            }
            regx={
              isMobileField && mobileRules?.pattern
                ? mobileRules.pattern
                : validationRules?.regx
            }
            requiredMessage={
              isMobileField && mobileRules?.requiredMessage
                ? mobileRules.requiredMessage
                : validationRules?.requiredMessage
            }
            regxMessage={
              isMobileField && mobileRules?.patternMessage
                ? mobileRules.patternMessage
                : validationRules?.regxMessage
            }
            minLengthMessage={
              isMobileField && mobileRules?.minLengthMessage
                ? mobileRules.minLengthMessage
                : validationRules?.minLengthMessage
            }
            maxLengthMessage={
              isMobileField && mobileRules?.maxLengthMessage
                ? mobileRules.maxLengthMessage
                : validationRules?.maxLengthMessage
            }
            instantValidation={enableInstantValidation}
            disabled={shouldDisableField}
            error={!!displayError}
            helperText={displayError}
            type={field.fieldName.includes('email') ? 'email' : 'text'}
          />
        );
      }

      case 'dropdown': {
        let options: { label: string; value: string }[] = [];

        // Special formatting for Country Code dropdown
        const isCountryCodeField = field.fieldName === 'hoiCountryCode';

        // Check if this is a citizenship or country field (use name as value)
        const isCitizenshipOrCountryField =
          field.fieldLabel?.toLowerCase().includes('citizenship') ||
          field.fieldLabel?.toLowerCase().includes('country');

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
                    : option.name || `Option ${index + 1}`,
                value:
                  isCitizenshipOrCountryField && !isCountryCodeField
                    ? option.name ||
                      option.code ||
                      option.isocode ||
                      `option_${index}`
                    : option.code || option.isocode || `option_${index}`,
              })) || [];
          }
        } else {
          // Static dropdown - use fieldOptions
          options =
            field.fieldOptions?.map((option: any, index: number) => ({
              label:
                isCountryCodeField && option.name && option.code
                  ? `${option.name} (${option.code})`
                  : option.name || `Option ${index + 1}`,
              value:
                isCitizenshipOrCountryField && !isCountryCodeField
                  ? option.name ||
                    option.code ||
                    option.isocode ||
                    `option_${index}`
                  : option.code || option.isocode || `option_${index}`,
            })) || [];
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

      case 'date':
        return (
          <LabeledDate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onDateChange(field.fieldName, newValue)}
            required={validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
          />
        );

      case 'checkbox':
        return (
          <LabeledCheckbox
            key={field.id}
            label={field.fieldLabel}
            checked={!!value}
            onChange={(checked) => onCheckboxChange(field.fieldName, checked)}
            required={validationRules?.required}
            disabled={false}
          />
        );

      case 'textfield_with_verify': {
        // Find citizenship field dynamically (fieldName includes 'citizenship')
        const citizenshipField = Object.keys(formData).find((key) =>
          key.toLowerCase().includes('citizenship')
        );
        const isIndianCitizen = !!(
          citizenshipField && formData[citizenshipField] === 'Indian'
        );
        const isCkycField = field.fieldName.toLowerCase().includes('ckyc');

        // Check if CKYC value has changed from initial
        const isCkycChanged =
          isCkycField && value !== autoPopulatedFields.size > 0 ? value : '';

        // Disable CKYC field if citizenship is not Indian
        const shouldDisableCkycField = isCkycField && !isIndianCitizen;

        // Get minLength from validationRules (dynamic from backend)
        const minLengthRequired = validationRules?.minLength
          ? parseInt(validationRules.minLength)
          : 0;

        // For verify button:
        // - Hide button completely if NOT Indian citizen (verifyDisabled will hide it)
        // - Show button but disable if Indian AND length < minLength
        const shouldDisableVerify = isCkycField && !isIndianCitizen;

        // Separate flag for length-based disabling (used in component)
        const isLengthInsufficient =
          (value as string).length < minLengthRequired;

        // Show as pre-verified if:
        // - Has initial value AND citizenship is Indian AND value hasn't changed
        // - OR if CKYC was verified through OTP
        const hasInitialCkycAndIndian =
          isCkycField && !!value && isIndianCitizen;
        const isPreVerified = !!(hasInitialCkycAndIndian && isCkycVerified);

        if (isCkycField) {
          const citizenshipField = Object.keys(formData).find((key) =>
            key.toLowerCase().includes('citizenship')
          );
        }

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
            verifyDisabled={shouldDisableVerify}
            disabled={shouldDisableCkycField}
            isPreVerified={isPreVerified}
            showVerifyOnlyAfterChange={false}
            // Force button to always be visible by setting this to false
            // The button will be disabled via verifyDisabled prop instead
            onVerificationRequired={onCkycVerificationRequired}
            onOtpVerified={(data) => {
              // Call the handler to auto-populate fields
              onCkycVerified(field, data);
            }}
            onOpenSendOtp={async () => {}}
            onSubmitOtp={async (otp: string) => {
              return true;
            }}
            onVerify={async () => {
              return true;
            }}
            // Add this prop to force button visibility
            verifyButtonText="Verify"
          />
        );
      }

      case 'textfield_with_image': {
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        const existingDoc = getDocumentData(fileFieldName);
        const fileValidationRules =
          validationRules?.validationFile || validationRules;
        return (
          <LabeledTextFieldWithUploadUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            onUpload={(file) => onFileUpload(field.fieldFileName, file)}
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
            regx={validationRules?.regx}
            error={!!displayError}
            helperText={displayError}
            accept={
              fileValidationRules?.imageFormat
                ?.map((format: any) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={fileValidationRules || undefined}
            onValidationError={(error) => {}}
            disabled={shouldDisableField}
            existingDocument={existingDoc}
            showExistingDocument={!!existingDoc}
            trackStatusShow={false}
          />
        );
      }

      case 'file': {
        const fileFieldName = field.fieldName || `${field.fieldName}_file`;
        const existingDoc = getDocumentData(fileFieldName);
        return (
          <div>
            <UploadButton
              key={`${field.id}`}
              label={field.fieldLabel}
              onUpload={(file) => onFileUpload(field.fieldName, file)}
              required={validationRules?.required || false}
              accept={
                (
                  validationRules?.validationFile?.imageFormat ||
                  validationRules?.imageFormat
                )
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              existingDocument={existingDoc}
              showExistingDocument={!!existingDoc}
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
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render if these specific props change
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.value === nextProps.value &&
      prevProps.validationError === nextProps.validationError &&
      prevProps.existingDocument === nextProps.existingDocument &&
      prevProps.evaluatedValidationRules ===
        nextProps.evaluatedValidationRules &&
      prevProps.isCkycVerified === nextProps.isCkycVerified &&
      // Compare citizenship fields dynamically
      (() => {
        const prevCitizenshipField = Object.keys(prevProps.formData).find(
          (key) => key.toLowerCase().includes('citizenship')
        );
        const nextCitizenshipField = Object.keys(nextProps.formData).find(
          (key) => key.toLowerCase().includes('citizenship')
        );
        // Return true if both are undefined or if values match
        if (!prevCitizenshipField && !nextCitizenshipField) return true;
        if (!prevCitizenshipField || !nextCitizenshipField) return false;
        return (
          prevProps.formData[prevCitizenshipField] ===
          nextProps.formData[nextCitizenshipField]
        );
      })() &&
      prevProps.dropdownData === nextProps.dropdownData &&
      prevProps.allFormFields === nextProps.allFormFields &&
      prevProps.autoPopulatedFields === nextProps.autoPopulatedFields
    );
  }
);

FieldRenderer.displayName = 'FieldRenderer';

const UpdateHeadOfInstitutionStep: React.FC<StepProps> = ({
  onSaveAndNext,
}) => {
  const [hoiFormFields, setHoiFormFields] = useState<FormField[]>([]);
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
  const [autoPopulatedFields, setAutoPopulatedFields] = useState<Set<string>>(
    new Set()
  );
  const [initialCkycValue, setInitialCkycValue] = useState<string>('');

  // Track original mobile/email values and changes
  const [originalMobile, setOriginalMobile] = useState<string>('');
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [isMobileChanged, setIsMobileChanged] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isOtpValidated, setIsOtpValidated] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState<string>('');
  // Track what to show in OTP modal (set right before opening to ensure correct values)
  const [showMobileOtpInModal, setShowMobileOtpInModal] = useState(false);
  const [showEmailOtpInModal, setShowEmailOtpInModal] = useState(false);

  // Success modal states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [successTitle, setSuccessTitle] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');

  // Redux selectors
  const stepData = useSelector(
    (state: any) => state.updateHeadOfInstitution.stepData
  );
  const stepDocuments = useSelector(
    (state: any) => state.updateHeadOfInstitution.documents
  );
  const fetchedDocuments = useSelector(
    (state: any) => state.updateHeadOfInstitution.fetchedDocuments
  );
  const fields = useSelector(
    (state: any) => state.updateHeadOfInstitution.fields
  );
  const config = useSelector(
    (state: any) => state.updateHeadOfInstitution.configuration
  );
  const loading = useSelector(selectHoiStepDataLoading);
  const dropdownData = useSelector(selectHoiDropdownData);

  // Get workflowId from updateWorkflow slice
  const workflowId = useSelector(
    (state: RootState) => state.updateWorkflow.workflowId
  );

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [validationSchema, setValidationSchema] = useState<Yup.ObjectSchema<
    Record<string, unknown>
  > | null>(null);
  const validationSchemaBuilder = useMemo(() => buildValidationSchema, []);

  useEffect(() => {
    const userId = userDetails?.userId || userDetails?.id || 'NO_0000';

    // Only fetch if we have a valid userId, or if we want to attempt with NO_0000 anyway (though likely useless)
    // Better to fetch always but ensure re-fetch when userId changes
    dispatch(
      fetchStepDataHoi({
        stepKey: 'hoi',
        userId: userId,
      })
    );

    dispatch(fetchFormFieldsHoi());
  }, [dispatch, userDetails]);

  useEffect(() => {
    if (fields && fields.length > 0 && !loading) {
      setHoiFormFields(fields);
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
      isDataLoaded
    ) {
      const initialFormData: FormData = {};

      Object.entries(stepData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          initialFormData[key] = value;
        }
      });

      setFormData(initialFormData);

      // Store original mobile and email values (find fields dynamically)
      const mobileField = Object.keys(initialFormData).find((key) =>
        key.toLowerCase().includes('mobile')
      );
      const emailField = Object.keys(initialFormData).find((key) =>
        key.toLowerCase().includes('email')
      );

      setOriginalMobile(
        mobileField ? (initialFormData[mobileField] as string) || '' : ''
      );
      setOriginalEmail(
        emailField ? (initialFormData[emailField] as string) || '' : ''
      );

      // Store initial CKYC value and check if it should be auto-verified
      const ckycField = Object.keys(initialFormData).find((key) =>
        key.toLowerCase().includes('ckyc')
      );
      const citizenshipField = Object.keys(initialFormData).find((key) =>
        key.toLowerCase().includes('citizenship')
      );

      const ckycValue = ckycField
        ? (initialFormData[ckycField] as string) || ''
        : '';
      const citizenship = citizenshipField
        ? (initialFormData[citizenshipField] as string) || ''
        : '';
      setInitialCkycValue(ckycValue);

      // If CKYC number has initial value AND citizenship is Indian, mark as verified
      if (ckycValue && citizenship === 'Indian') {
        setIsCkycVerified(true);

        // Find the CKYC field to get its autoPopulate configuration (fieldName includes 'ckyc')
        const ckycFormField = hoiFormFields.find((f) =>
          f.fieldName.toLowerCase().includes('ckyc')
        );

        const autoPopulateFields =
          ckycFormField?.conditionalLogic?.[0]?.then?.fieldAttributes
            ?.autoPopulate || [];

        // Only mark the fields specified in autoPopulate array as disabled
        const ckycAutopopulatedFields = new Set<string>();

        autoPopulateFields.forEach((fieldName: string) => {
          // Add all fields from autoPopulate config, regardless of whether they have values
          // This ensures fields like middleName are disabled even if they're empty
          ckycAutopopulatedFields.add(fieldName);
        });

        setAutoPopulatedFields(ckycAutopopulatedFields);
      }
    }
  }, [stepData, loading, isDataLoaded, hoiFormFields]);

  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0 && !loading) {
      const documentsMap: Record<string, string> = {};

      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id) {
          documentsMap[doc.fieldKey] = doc.id;
        }
      });

      setExistingDocuments(documentsMap);
    }
  }, [stepDocuments, loading]);

  // Helper function to find field by name
  const findFieldByName = useCallback(
    (fieldName: string): FormField | null => {
      const field = hoiFormFields.find((f) => f.fieldName === fieldName);
      return field || null;
    },
    [hoiFormFields]
  );

  // Evaluate conditional logic based on formData
  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        // Log for citizenship field
        if (field.fieldName?.toLowerCase().includes('citizenship')) {
          console.log(
            `🔍 ${field.fieldName} - No conditional logic, using default validationRules:`,
            field.validationRules
          );
        }
        return field.validationRules;
      }

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
          case 'equals':
            conditionMatches = expectedValues
              .map(String)
              .includes(String(dependentValue ?? ''));
            break;
          case 'not_in':
          case 'not_equals':
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

        // If condition matches, use "then" rules
        if (conditionMatches && logic.then?.validationRules) {
          const mergedRules = {
            ...field.validationRules,
            ...logic.then.validationRules,
          };
          // Log for citizenship field
          if (field.fieldName?.toLowerCase().includes('citizenship')) {
            console.log(
              `🔍 ${field.fieldName} - Condition matched (${operator}), merged validationRules:`,
              mergedRules
            );
          }
          return mergedRules;
        }

        // If condition doesn't match and "else" exists, use "else" rules
        if (!conditionMatches && logic.else?.validationRules) {
          const mergedRules = {
            ...field.validationRules,
            ...logic.else.validationRules,
          };
          // Log for citizenship field
          if (field.fieldName?.toLowerCase().includes('citizenship')) {
            console.log(
              `🔍 ${field.fieldName} - Condition NOT matched (${operator}), using else validationRules:`,
              mergedRules
            );
          }
          return mergedRules;
        }
      }

      // Log for citizenship field
      if (field.fieldName?.toLowerCase().includes('citizenship')) {
        console.log(
          `🔍 ${field.fieldName} - No conditions matched, using default validationRules:`,
          field.validationRules
        );
      }
      return field.validationRules;
    },
    [formData]
  );

  useEffect(() => {
    if (hoiFormFields.length > 0 && !loading) {
      const fieldsWithConditionalLogic = hoiFormFields.map((field) => ({
        ...field,
        validationRules: evaluateConditionalLogic(field),
      }));

      const schema = validationSchemaBuilder(fieldsWithConditionalLogic);
      setValidationSchema(schema);
    }
  }, [
    hoiFormFields,
    validationSchemaBuilder,
    evaluateConditionalLogic,
    loading,
  ]);

  const prevCitizenshipRef = useRef<string | undefined>(undefined);

  // Reset CKYC verification when citizenship changes
  useEffect(() => {
    // Find citizenship field dynamically (fieldName includes 'citizenship')
    const citizenshipField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('citizenship')
    );
    const citizenship = citizenshipField ? formData[citizenshipField] : null;

    if (citizenship) {
      const currentCitizenshipStr = String(citizenship);
      const prevCitizenshipStr = prevCitizenshipRef.current;

      // Update ref for next time
      prevCitizenshipRef.current = currentCitizenshipStr;

      const fieldsToClean = [
        'title',
        'firstName',
        'middleName',
        'lastName',
        'gender',
      ];

      // Check if we have data in the fields we're about to clean
      const hasData = fieldsToClean.some((fieldName) => {
        const actualFieldName = Object.keys(formData).find(
          (key) =>
            key.toLowerCase() === fieldName.toLowerCase() ||
            key.toLowerCase().includes(fieldName.toLowerCase())
        );
        return actualFieldName && formData[actualFieldName];
      });

      // If it's the first load (prev is undefined) AND (we have data OR CKYC is verified),
      // assume it's API data and skip clearing
      if (!prevCitizenshipStr && (hasData || isCkycVerified)) {
        console.log('✅ Skipping field clear on initial load');
        return;
      }

      // Only clear if the citizenship actually CHANGED (and it's not the first load check above)
      // or if it's a user interaction clearing the form
      if (prevCitizenshipStr && prevCitizenshipStr !== currentCitizenshipStr) {
        console.log('🧹 Citizenship changed, clearing dependent fields');
        setIsCkycVerified(false);
        setAutoPopulatedFields(new Set());

        // Clear CKYC number and auto-populated fields when citizenship changes
        const fieldsToKeep = { ...formData };

        // Find and delete CKYC field dynamically
        const ckycFieldName = Object.keys(formData).find((key) =>
          key.toLowerCase().includes('ckyc')
        );
        if (ckycFieldName) {
          delete fieldsToKeep[ckycFieldName];
        }

        // Clear auto-populated fields
        fieldsToClean.forEach((fieldName) => {
          // Find the field dynamically (case-insensitive)
          const actualFieldName = Object.keys(formData).find(
            (key) =>
              key.toLowerCase() === fieldName.toLowerCase() ||
              key.toLowerCase().includes(fieldName.toLowerCase())
          );
          if (actualFieldName) {
            fieldsToKeep[actualFieldName] = '';
          }
        });

        setFormData(fieldsToKeep);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData[
      Object.keys(formData).find((key) =>
        key.toLowerCase().includes('citizenship')
      ) || ''
    ],
  ]);

  // Dynamic cascading dropdown logic
  // This effect handles all cascading dropdowns dynamically based on field name keywords
  useEffect(() => {
    if (!isDataLoaded || hoiFormFields.length === 0) return;

    // Find all fields that might need cascading dropdown logic
    const cascadingFields: Array<{
      field: FormField;
      keyword: string;
      dependsOn: string | null;
    }> = [];

    hoiFormFields.forEach((field) => {
      if (
        field.fieldType !== 'dropdown' ||
        field.fieldAttributes?.type !== 'external_api'
      ) {
        return;
      }

      const fieldNameLower = field.fieldName.toLowerCase();

      // Detect field type by keyword
      if (fieldNameLower.includes('state')) {
        // State fields depend on country fields
        const dependsOnField = hoiFormFields.find(
          (f) =>
            f.fieldName.toLowerCase().includes('country') &&
            // Try to match prefix (e.g., hoiCountry -> hoiState)
            field.fieldName.toLowerCase().replace('state', 'country') ===
              f.fieldName.toLowerCase()
        );
        cascadingFields.push({
          field,
          keyword: 'state',
          dependsOn: dependsOnField?.fieldName || null,
        });
      } else if (fieldNameLower.includes('district')) {
        // District fields depend on state fields
        const dependsOnField = hoiFormFields.find(
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
        // Pincode fields depend on district fields
        const dependsOnField = hoiFormFields.find(
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

    // Trigger API calls for fields whose dependencies are satisfied
    cascadingFields.forEach(({ field, dependsOn }) => {
      if (!dependsOn || !field.fieldAttributes) return; // No dependency found or no field attributes

      const dependencyValue = formData[dependsOn];
      if (dependencyValue) {
        dispatch(
          fetchDropdownDataHoi({
            fieldName: field.fieldName,
            fieldAttributes: field.fieldAttributes,
            formData: formData,
          })
        );
      }
    });
  }, [formData, isDataLoaded, hoiFormFields, findFieldByName, dispatch]);

  // First useEffect: Dispatch fetchDocumentHoi for each document when stepDocuments is available
  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0 && !loading) {
      const documentsMap: Record<string, string> = {};

      stepDocuments.forEach((doc: any) => {
        if (doc.fieldKey && doc.id) {
          documentsMap[doc.fieldKey] = doc.id;
          // Dispatch fetch for each document
          dispatch(fetchDocumentHoi(doc.id));
        }
      });

      setExistingDocuments(documentsMap);
    }
  }, [stepDocuments, loading, dispatch]);

  // Second useEffect: Update existingDocumentData when fetchedDocuments changes
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

  const getDocumentData = useCallback(
    (fieldName: string): DocumentData | undefined => {
      return existingDocumentData[fieldName];
    },
    [existingDocumentData]
  );

  const handleTextChange = useCallback((fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleFileUpload = useCallback(
    (fieldName: string | undefined, file: File | null) => {
      if (fieldName !== undefined) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: file,
        }));
      }
    },
    []
  );

  const handleDropdownChange = useCallback(
    (fieldName: string, value: string | number) => {
      setFormData((prev) => {
        const updates: FormData = {
          ...prev,
          [fieldName]: value,
        };

        // Clear dependent fields when a cascading dropdown changes
        const fieldNameLower = fieldName.toLowerCase();

        // If Constitution is changed, re-validate PAN field
        if (fieldNameLower === 'constitution') {
          const panField = Object.keys(updates).find(
            (key) =>
              key.toLowerCase() === 'pan' ||
              key.toLowerCase().endsWith('pan') ||
              key.toLowerCase().includes('hoipan')
          );
          if (panField && updates[panField]) {
            const panError = validatePANForConstitution(
              updates[panField] as string,
              value as string
            );
            if (panError) {
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                [panField]: panError,
              }));
            } else {
              setValidationErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[panField];
                return newErrors;
              });
            }
          }
        }

        // Clear validation error for the current field
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });

        // If country changes, clear state, district, and pincode
        if (fieldNameLower.includes('country')) {
          // Find and clear related state, district, pincode fields
          hoiFormFields.forEach((field) => {
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

        // If state changes, clear district and pincode
        if (fieldNameLower.includes('state')) {
          hoiFormFields.forEach((field) => {
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

        // If district changes, clear pincode
        if (fieldNameLower.includes('district')) {
          hoiFormFields.forEach((field) => {
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

        return updates;
      });
    },
    [hoiFormFields]
  );

  const handleDateChange = useCallback(
    (fieldName: string, value: string | null) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (fieldName: string, checked: boolean) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: checked,
      }));
    },
    []
  );

  const handleCkycVerificationRequired = useCallback((required: boolean) => {
    setIsCkycVerificationRequired(required);
  }, []);

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
          .replace(/^(hoi|no|re)/i, '') // Remove hoi/no/re prefixes
          .toLowerCase();
      };

      // Iterate through API response data
      Object.entries(responseData).forEach(([apiKey, apiValue]) => {
        const normalizedApiKey = normalizeFieldName(apiKey);

        // Find matching form field
        const matchingField = hoiFormFields.find((formField) => {
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
    [hoiFormFields]
  );

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

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [fieldName]: newValue,
        };

        // Real-time PAN validation based on Constitution (for HOI step)
        const fieldNameLower = fieldName.toLowerCase();
        if (
          fieldNameLower === 'pan' ||
          fieldNameLower.endsWith('pan') ||
          fieldNameLower.includes('hoipan')
        ) {
          // Find constitution field in form data
          const constitutionField = Object.keys(updatedData).find(
            (key) => key.toLowerCase() === 'constitution'
          );
          const constitution = constitutionField
            ? (updatedData[constitutionField] as string)
            : '';
          const panError = validatePANForConstitution(newValue, constitution);
          if (panError) {
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: panError,
            }));
          } else {
            setValidationErrors((prevErrors) => {
              const newErrors = { ...prevErrors };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        } else {
          // Clear validation error for other fields
          setValidationErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[fieldName];
            return newErrors;
          });
        }

        return updatedData;
      });

      // Check if CKYC number has changed from initial value (fieldName includes 'ckyc')
      if (fieldName.toLowerCase().includes('ckyc')) {
        const hasChanged = newValue !== initialCkycValue;

        if (hasChanged && initialCkycValue) {
          // CKYC value was changed from initial - reset verification

          setIsCkycVerified(false);
          setAutoPopulatedFields(new Set());
        }
      }

      // Check if mobile or email has changed (fieldName includes 'mobile' or 'email')
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
    [originalMobile, originalEmail, initialCkycValue]
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

  const handleSave = async () => {
    // Check if CKYC verification is required but not completed
    if (isCkycVerificationRequired) {
      console.error('❌ Cannot save: CKYC verification required');
      // Find CKYC field name dynamically
      const ckycFieldName = Object.keys(formData).find((key) =>
        key.toLowerCase().includes('ckyc')
      );
      if (ckycFieldName) {
        setValidationErrors({
          [ckycFieldName]: 'Please verify the CKYC number before saving',
        });
      }
      return;
    }

    let yupValidationPassed = true;

    try {
      if (validationSchema) {
        await validationSchema.validate(formData, { abortEarly: false });
        setValidationErrors({});

        // Prepare the data exactly as needed for the API
        const userId = userDetails?.userId || 'NO_0000';

        // Create the formValues object with all the data
        const formValues: Record<
          string,
          string | File | number | boolean | object | null
        > = { ...formData };

        // Call the API - it will handle FormData conversion
        const result = await dispatch(
          submitUpdatedHoiDetails({
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
            const field = hoiFormFields.find(
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

        if (error && typeof error === 'object' && 'fieldErrors' in error) {
          setValidationErrors((error as any).fieldErrors || {});
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
        <div>Loading HOI form data...</div>
      </Box>
    );
  }
  const handleValidate = async () => {
    const validationResult = await validateAllFields(
      hoiFormFields,
      formData,
      validationSchema
    );

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }
    setValidationErrors({});
    setGeneralError('');

    // Find mobile and email fields dynamically
    const emailField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('email')
    );
    const mobileField = Object.keys(formData).find(
      (key) =>
        key.toLowerCase().includes('mobile') &&
        !key.toLowerCase().includes('countrycode')
    );

    // Recalculate changed states to ensure they are current
    const currentMobileValue = mobileField
      ? (formData[mobileField] as string)
      : '';
    const currentEmailValue = emailField
      ? (formData[emailField] as string)
      : '';

    const actualMobileChanged = currentMobileValue !== originalMobile;
    const actualEmailChanged = currentEmailValue !== originalEmail;

    // Update states to match actual values
    if (actualMobileChanged !== isMobileChanged) {
      setIsMobileChanged(actualMobileChanged);
    }
    if (actualEmailChanged !== isEmailChanged) {
      setIsEmailChanged(actualEmailChanged);
    }

    // Show OTP modal if mobile or email has changed
    if (actualMobileChanged || actualEmailChanged) {
      const countryCodeField = Object.keys(formData).find((key) =>
        key.toLowerCase().includes('countrycode')
      );

      // Find CKYC field dynamically
      const ckycField = Object.keys(formData).find((key) =>
        key.toLowerCase().includes('ckyc')
      );

      const otpData = {
        requestType: 'DIRECT',
        emailId: emailField ? (formData[emailField] as string) : '',
        mobileNo: mobileField ? (formData[mobileField] as string) : '',
        countryCode: countryCodeField
          ? (formData[countryCodeField] as string)
          : '',
        workflowId: workflowId || '',
        ckycNo: ckycField ? (formData[ckycField] as string) || '' : '',
        stepKey: 'hoi',
      };
      try {
        const result = await dispatch(OTPSend(otpData));
        if (OTPSend.fulfilled.match(result)) {
          setOtpIdentifier(result?.payload?.data?.otpIdentifier);
          // Set which OTP sections to show in modal before opening
          setShowMobileOtpInModal(actualMobileChanged);
          setShowEmailOtpInModal(actualEmailChanged);
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
    // Reset form to original values (find fields dynamically)
    const mobileField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('mobile')
    );
    const emailField = Object.keys(formData).find((key) =>
      key.toLowerCase().includes('email')
    );

    setFormData((prev) => ({
      ...prev,
      ...(mobileField && { [mobileField]: originalMobile }),
      ...(emailField && { [emailField]: originalEmail }),
    }));
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

    // Update original values to current values (find fields dynamically)
    if (isMobileChanged && mobileField) {
      setOriginalMobile(formData[mobileField] as string);
      setIsMobileChanged(false);
    }
    if (isEmailChanged && emailField) {
      setOriginalEmail(formData[emailField] as string);
      setIsEmailChanged(false);
    }

    // Show success modal
    let message = '';
    if (
      isMobileChanged &&
      isEmailChanged &&
      mobileField &&
      formData[mobileField] &&
      emailField &&
      formData[emailField]
    ) {
      message = 'Mobile & Email OTP Verified Successfully';
    } else if (isEmailChanged && emailField && formData[emailField]) {
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
        key={'head_of_institution'}
        title={'Head of Institution Details'}
        groupKey={'head_of_institution'}
        defaultExpanded={true}
      >
        <ThreeColumnGrid>
          {hoiFormFields.map((field: FormField) => {
            // Evaluate conditional logic for this field to get the correct validation rules
            const evaluatedRules = evaluateConditionalLogic(field);
            const fieldValue = formData[field.fieldName] || '';

            return (
              <FieldContainer key={field.id}>
                <FieldRenderer
                  field={field}
                  value={fieldValue}
                  validationError={validationErrors[field.fieldName]}
                  existingDocument={getDocumentData(
                    field.fieldFileName || field.fieldName
                  )}
                  evaluatedValidationRules={evaluatedRules}
                  onTextChange={handleTextChange}
                  onDropdownChange={handleDropdownChange}
                  onDateChange={handleDateChange}
                  onFileUpload={handleFileUpload}
                  onGenericChange={handleGenericChange}
                  onCheckboxChange={handleCheckboxChange}
                  getFieldError={getFieldError}
                  getDocumentData={getDocumentData}
                  checkIfFileExists={checkIfFileExists}
                  getDocumentId={getDocumentId}
                  isCkycVerified={isCkycVerified}
                  formData={formData}
                  onCkycVerified={handleCkycVerified}
                  onCkycVerificationRequired={handleCkycVerificationRequired}
                  dropdownData={dropdownData}
                  allFormFields={hoiFormFields}
                  autoPopulatedFields={autoPopulatedFields}
                />
              </FieldContainer>
            );
          })}
        </ThreeColumnGrid>
      </UpdateFormAccordion>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <FormActionButtonsUpdate
          onClear={handleClear}
          onSave={handleSave}
          onValidate={handleValidate}
          validateLabel={configuration?.submissionSettings?.validateButtonText}
          showValidate={configuration?.submissionSettings?.validateButton}
          showSave={configuration?.submissionSettings?.submitButton}
          showClear={configuration?.submissionSettings?.clearButton}
          clearLabel={configuration?.submissionSettings?.clearButtonText}
          saveLabel={configuration?.submissionSettings?.submitButtonText}
          loading={false}
          saveDisabled={
            ((isMobileChanged || isEmailChanged) && !isOtpValidated) ||
            isCkycVerificationRequired
          }
          validateDisabled={
            !(isMobileChanged || isEmailChanged) || isOtpValidated
          }
          clearDisabled={!(isMobileChanged || isEmailChanged)}
          sx={{ margin: 0, padding: 0 }}
          submissionSettings={configuration?.submissionSettings}
        />
      </Box>

      {/* OTP Modal for Mobile/Email Validation */}
      <OTPModalUpdateEntity
        data={otpIdentifier}
        mobileChange={showMobileOtpInModal}
        emailChange={showEmailOtpInModal}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onOtpSubmit={handleOtpSubmit}
        countryCode={(() => {
          const field = Object.keys(formData).find((key) =>
            key.toLowerCase().includes('countrycode')
          );
          return field ? (formData[field] as string) : '';
        })()}
        email={(() => {
          const field = Object.keys(formData).find((key) =>
            key.toLowerCase().includes('email')
          );
          return field ? (formData[field] as string) : '';
        })()}
        mobile={(() => {
          const field = Object.keys(formData).find((key) =>
            key.toLowerCase().includes('mobile')
          );
          return field ? (formData[field] as string) : '';
        })()}
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

export default UpdateHeadOfInstitutionStep;
