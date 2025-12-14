/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { LabeledDate } from '../../../../component/features/RERegistration/CommonComponent';
import {
  fetchStepData,
  fetchFormFields,
  selectStepDataLoading,
  fetchDocument,
  deleteDocument,
} from './slice/updateStepDataSlice';
import LabeledTextFieldWithVerify from '../../../../component/features/RERegistration/CommonComponent/LabeledTextFieldWithVerify';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import { buildValidationSchema, validateSingleField } from './formValidation';
import * as Yup from 'yup';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';

import { FormField } from './types/formTypesUpdate';
import { Box, useTheme, useMediaQuery, Alert } from '@mui/material';
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  memo,
  useRef,
} from 'react';
import { useFieldError } from '../context/FieldErrorContext';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import LabeledDropDownUpdate from './CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from './CommonComponnet/LabledTextFieldUpdate';
import LabeledTextFieldWithUploadUpdate from './CommonComponnet/LableledTextFieldWithUploadUpdate';
import { submitUpdatedEntityProfile } from './slice/updateEntityProfileSlice';
import UpdateFormAccordion from './UpdateFormAccordion';
import UploadButtonUpdate from './CommonComponnet/UploadButtonUpdate';
import { validateField } from '../slice/formSlice';
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

interface InstitutionTypeOption {
  regulator: string;
  types: DropDownHoi[];
}
interface DocumentData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
}

interface FieldRendererProps {
  field: FormField;
  value: string | File | null | number | boolean | object;
  validationError?: string;
  existingDocument?: DocumentData;
  institutionTypeOptions?: DropDownHoi[];
  isReadOnly?: boolean;
  isTouched?: boolean;
  formData?: FormData;
  onTextChange: (fieldName: string, value: string) => void;
  onDropdownChange: (fieldName: string, value: string | number) => void;
  onDateChange: (fieldName: string, value: string | null) => void;
  onFileUpload: (fieldName: string | undefined, file: File | null) => void;
  onGenericChange: (
    fieldName: string,
    value: string | ChangeEvent<HTMLInputElement>
  ) => void;
  onBlur: (fieldName: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
  getDocumentData: (fieldName: string) => DocumentData | undefined;
  checkIfFileExists: (fieldName: string) => boolean;

  getDocumentId: (fieldName: string) => string;
  onDeleteDocument: (documentId: string) => void;
}

const FieldRenderer = memo<FieldRendererProps>(
  ({
    field,
    value,
    validationError,
    existingDocument,
    institutionTypeOptions,
    isReadOnly = false,
    isTouched = false,
    formData,
    onTextChange,
    onDropdownChange,
    onDateChange,
    onFileUpload,
    onGenericChange,
    onBlur,
    getFieldError,
    getDocumentData,
    checkIfFileExists,
    getDocumentId,
    onDeleteDocument,
  }) => {
    const apiFieldError = getFieldError(field.fieldName);

    let fileError = '';
    let apiFileError = '';
    let documentId = '';
    let fileExistsForField = false;
    let textFieldError = '';

    if (field.fieldType === 'textfield_with_image') {
      const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
      documentId = getDocumentId(fileFieldName);
      fileExistsForField = checkIfFileExists(fileFieldName);

      textFieldError = validationError || '';

      apiFileError = getFieldError(fileFieldName) || '';

      fileError = textFieldError || apiFileError || '';
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

    // Helper function to evaluate if field should be enabled based on conditionalLogic
    const evaluateFieldEnabled = (fieldConfig: FormField): boolean => {
      if (
        !fieldConfig.conditionalLogic ||
        !Array.isArray(fieldConfig.conditionalLogic)
      ) {
        return true; // No conditional logic, field is enabled by default
      }

      for (const logic of fieldConfig.conditionalLogic) {
        const when = logic.when;
        if (!when?.field) continue;

        const dependentValue = (formData?.[when.field] as string) || '';
        const operator = when.operator || 'equals';
        const expectedValues = Array.isArray(when.value)
          ? when.value.map(String)
          : [String(when.value)];

        let conditionMatches = false;

        switch (operator) {
          case 'in':
          case 'equals':
            conditionMatches = expectedValues.includes(dependentValue);
            break;
          case 'not_in':
          case 'not_equals':
            conditionMatches = !expectedValues.includes(dependentValue);
            break;
          case 'is_not_empty':
            conditionMatches = dependentValue !== '';
            break;
          case 'is_empty':
            conditionMatches = dependentValue === '';
            break;
          default:
            conditionMatches = false;
        }

        // If condition matches, check "then" for visibility/enabled state
        if (conditionMatches && logic.then) {
          // Field is enabled when condition matches
          return true;
        } else if (!conditionMatches && logic.else) {
          // Field is disabled when condition doesn't match
          return false;
        }
      }

      return true; // Default to enabled
    };

    // Helper function to evaluate if field is required based on conditionalLogic
    const evaluateFieldRequired = (fieldConfig: FormField): boolean => {
      if (
        !fieldConfig.conditionalLogic ||
        !Array.isArray(fieldConfig.conditionalLogic)
      ) {
        return fieldConfig.validationRules?.required || false;
      }

      for (const logic of fieldConfig.conditionalLogic) {
        const when = logic.when;
        if (!when?.field) continue;

        const dependentValue = (formData?.[when.field] as string) || '';
        const operator = when.operator || 'equals';
        const expectedValues = Array.isArray(when.value)
          ? when.value.map(String)
          : [String(when.value)];

        let conditionMatches = false;

        switch (operator) {
          case 'in':
          case 'equals':
            conditionMatches = expectedValues.includes(dependentValue);
            break;
          case 'not_in':
          case 'not_equals':
            conditionMatches = !expectedValues.includes(dependentValue);
            break;
          case 'is_not_empty':
            conditionMatches = dependentValue !== '';
            break;
          case 'is_empty':
            conditionMatches = dependentValue === '';
            break;
          default:
            conditionMatches = false;
        }

        // Check for required in then/else validation rules
        if (
          conditionMatches &&
          logic.then?.validationRules?.required !== undefined
        ) {
          return logic.then.validationRules.required;
        } else if (
          !conditionMatches &&
          logic.else?.validationRules?.required !== undefined
        ) {
          return logic.else.validationRules.required;
        }
      }

      return fieldConfig.validationRules?.required || false;
    };

    // Use dynamic evaluation based on conditionalLogic
    const actualRequired = evaluateFieldRequired(field);
    const isFieldEnabled = evaluateFieldEnabled(field);
    const dynamicDisabled = isReadOnly || !isFieldEnabled;

    switch (field.fieldType) {
      case 'textfield':
        return (
          <LabeledTextFieldUpdate
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            onBlur={() => onBlur(field.fieldName)}
            placeholder={field.fieldPlaceholder || ''}
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
            regx={field.validationRules?.regx}
            disabled={dynamicDisabled}
            error={!!displayError}
            helperText={displayError}
            type={field.fieldName.includes('website') ? 'url' : 'text'}
          />
        );

      case 'dropdown': {
        let options: { label: string; value: string }[] = [];

        if (field.fieldName === 'institutionType' && institutionTypeOptions) {
          options = institutionTypeOptions.map((option) => ({
            label: option.name,
            value: option.code,
          }));
        } else {
          options =
            field.fieldOptions?.map((option: DropDownHoi, index: number) => ({
              label: option.name || `Option ${index + 1}`,
              value: option.code || `option_${index}`,
            })) || [];
        }

        return (
          <LabeledDropDownUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onDropdownChange(field.fieldName, newValue)}
            onBlur={() => onBlur(field.fieldName)}
            options={options}
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={actualRequired}
            error={!!displayError}
            helperText={displayError}
            fieldName={field.fieldName}
            disabled={
              isReadOnly ||
              field.fieldName === 'institutionType' ||
              field.fieldName === 'regulator' ||
              field.fieldName.toLowerCase().includes('constitution')
            }
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
            required={field.validationRules?.required || false}
            error={!!displayError}
            helperText={displayError}
            disabled={isReadOnly}
          />
        );

      case 'textfield_with_image': {
        const fileFieldName = field.fieldFileName || `${field.fieldName}_file`;
        const existingDoc = getDocumentData(fileFieldName);
        const fileValidationRules =
          field.validationRules?.validationFile || field.validationRules;

        // Dynamic maxLength for PAN field (10 characters)
        let dynamicMaxLength = field.validationRules?.maxLength
          ? parseInt(field.validationRules.maxLength)
          : undefined;

        const isPanField = field.fieldName.toLowerCase().includes('pan');
        if (isPanField) {
          dynamicMaxLength = 10;
        }

        return (
          <LabeledTextFieldWithUploadUpdate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
            onBlur={() => onBlur(field.fieldName)}
            onUpload={(file) => onFileUpload(field.fieldFileName, file)}
            placeholder={field.fieldPlaceholder}
            required={field.validationRules?.required || false}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={dynamicMaxLength}
            regx={field.validationRules?.regx}
            error={!!displayError}
            helperText={displayError}
            accept={
              fileValidationRules?.imageFormat
                ?.map((format: any) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={fileValidationRules || undefined}
            onValidationError={(error) => {}}
            disabled={
              isReadOnly ||
              field.fieldName === 'cin' ||
              field.fieldName === 'llpin' ||
              field.fieldFileName === 'cinFile'
            }
            textFieldDisabled={isPanField}
            existingDocument={existingDoc}
            showExistingDocument={!!existingDoc}
            trackStatusShow={field.fieldFileName === 'cinFile'}
            onDelete={
              existingDoc ? () => onDeleteDocument(existingDoc.id) : undefined
            }
          />
        );
      }

      case 'textfield_with_verify':
        return (
          <LabeledTextFieldWithVerify
            key={`${field.id}`}
            label={field.fieldLabel}
            value={value as string}
            onChange={(newValue) => onGenericChange(field.fieldName, newValue)}
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
            disabled={isReadOnly}
            externalVerifyUrl={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
            }
            onOpenSendOtp={async () => {}}
            onSubmitOtp={async (otp: string) => {
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
        const existingDoc = getDocumentData(fileFieldName);
        return (
          <div>
            <UploadButtonUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              onUpload={(file) => onFileUpload(field.fieldName, file)}
              required={actualRequired}
              accept={
                (
                  field.validationRules?.validationFile?.imageFormat ||
                  field.validationRules?.imageFormat
                )
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
              existingDocument={existingDoc}
              showExistingDocument={!!existingDoc}
              disabled={isReadOnly}
              onDelete={
                existingDoc ? () => onDeleteDocument(existingDoc.id) : undefined
              }
              validationRules={field.validationRules || undefined}
              onValidationError={(error) => {}}
            />
            {/* {value && typeof value !== 'string' && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                Selected: {(value as File).name}
              </div>
            )} */}
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
    // Important: We need to check if value is a File object (newly uploaded) vs string
    const valueChanged = (() => {
      // If either is a File object, they're different (new upload)
      if (prevProps.value instanceof File || nextProps.value instanceof File) {
        return prevProps.value !== nextProps.value;
      }
      // For strings and other types, use normal comparison
      return prevProps.value !== nextProps.value;
    })();

    // Check if validation rules have changed (for conditional logic like LLPIN requiring based on constitution)
    const validationRulesChanged =
      prevProps.field.validationRules?.required !==
      nextProps.field.validationRules?.required;

    return (
      prevProps.field.id === nextProps.field.id &&
      !valueChanged &&
      !validationRulesChanged &&
      prevProps.validationError === nextProps.validationError &&
      prevProps.existingDocument === nextProps.existingDocument &&
      prevProps.institutionTypeOptions === nextProps.institutionTypeOptions &&
      prevProps.isReadOnly === nextProps.isReadOnly &&
      prevProps.isTouched === nextProps.isTouched
    );
  }
);

FieldRenderer.displayName = 'FieldRenderer';

const UpdateEntityProfileStep: React.FC<StepProps> = ({ onSaveAndNext }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  // Use ref to track fetched documents to prevent re-fetching
  const fetchedDocumentIdsRef = useRef<Set<string>>(new Set());

  // Track if initial data has been loaded to prevent clearing institutionType on first load
  const initialDataLoadedRef = useRef<boolean>(false);

  // Redux selectors
  const stepData = useSelector((state: any) => state.updateStepData.stepData);
  const stepDocuments = useSelector(
    (state: any) => state.updateStepData.documents
  );
  const fetchedDocuments = useSelector(
    (state: any) => state.updateStepData.fetchedDocuments
  );
  const fields = useSelector((state: any) => state.updateStepData.fields);
  const config = useSelector(
    (state: any) => state.updateStepData.configuration
  );
  const loading = useSelector(selectStepDataLoading);

  const dispatch = useDispatch<AppDispatch>();

  // Get user details from auth state
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  // Get groupMembership from auth state
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership
  );

  // Determine if form should be read-only based on user role
  // If groupMembership[0] is "Institutional_Admin_User" AND userType is "IAU_1" or "IAU_2"
  // then form should be read-only (no editing, no API call)
  const isReadOnly = useMemo(() => {
    const userGroup = groupMembership?.[0] || '';
    const userType = userDetails?.role || '';

    // If user is Institutional_Admin_User with IAU_1 or IAU_2 userType, make form read-only
    if (
      userGroup === 'Institutional_Admin_User' &&
      (userType === 'IAU_1' || userType === 'IAU_2')
    ) {
      return true;
    }

    // Nodal_Officer and other roles can edit
    return false;
  }, [groupMembership, userDetails?.role]);

  // Get workflowId from updateWorkflow slice
  // This is automatically updated when any update step is submitted
  const updateWorkflowId = useSelector(
    (state: RootState) => state.updateWorkflow.workflowId
  );
  const currentUpdateStep = useSelector(
    (state: RootState) => state.updateWorkflow.currentStep
  );

  const [formData, setFormData] = useState<FormData>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [generalError, setGeneralError] = useState<string>('');
  const [validationSchema, setValidationSchema] = useState<Yup.ObjectSchema<
    Record<string, unknown>
  > | null>(null);
  const validationSchemaBuilder = useMemo(() => buildValidationSchema, []);

  useEffect(() => {
    const userId = userDetails?.userId || 'NO_0000';

    dispatch(
      fetchStepData({
        stepKey: 'entityDetails',
        userId: userId,
      })
    );

    dispatch(fetchFormFields({ url: 'entity_profile' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Track when fields are loaded (independent of shared loading state)
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [stepDataLoaded, setStepDataLoaded] = useState(false);

  useEffect(() => {
    // Set fields when they become available (don't depend on shared loading state)
    if (fields && fields.length > 0) {
      setUserProfileFormFields(fields);
      setFieldsLoaded(true);
      setIsDataLoaded(true);
    }
  }, [fields]);

  useEffect(() => {
    if (config) {
      setConfiguration(config);
    }
  }, [config]);

  // Track when stepData is loaded
  useEffect(() => {
    if (stepData?.data && Object.keys(stepData.data).length > 0) {
      setStepDataLoaded(true);
    }
  }, [stepData]);

  // Helper function to convert dropdown name/label to code
  const convertNameToCode = useCallback(
    (fieldName: string, value: string): string => {
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      if (!field?.fieldOptions) return value;

      // For institutionType, search within nested regulator types
      if (fieldName === 'institutionType') {
        const institutionOptions =
          field.fieldOptions as InstitutionTypeOption[];
        for (const regulatorOption of institutionOptions) {
          const matchingType = regulatorOption.types?.find(
            (type) => type.name === value || type.code === value
          );
          if (matchingType) {
            return matchingType.code;
          }
        }
        return value;
      }

      // For other dropdowns (like constitution), search in fieldOptions
      const matchingOption = (field.fieldOptions as DropDownHoi[])?.find(
        (option) => option.name === value || option.code === value
      );

      return matchingOption?.code || value;
    },
    [userProfileFormFields]
  );

  // Set formData only when BOTH fields and stepData are loaded
  // This ensures we have the institutionType options before setting the value
  useEffect(() => {
    if (
      stepData?.data &&
      Object.keys(stepData.data).length > 0 &&
      fieldsLoaded &&
      stepDataLoaded &&
      !initialDataLoadedRef.current &&
      userProfileFormFields.length > 0
    ) {
      const initialFormData: FormData = {};

      Object.entries(stepData.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Convert dropdown name values to codes for specific fields
          // Note: regulator uses name directly, not code
          if (
            (key === 'constitution' || key === 'institutionType') &&
            typeof value === 'string'
          ) {
            initialFormData[key] = convertNameToCode(key, value);
          } else {
            initialFormData[key] = value;
          }
        }
      });

      setFormData(initialFormData);
      // Mark initial data as loaded after setting formData
      // This prevents the validation useEffect from clearing institutionType
      initialDataLoadedRef.current = true;
    }
  }, [
    stepData,
    fieldsLoaded,
    stepDataLoaded,
    userProfileFormFields,
    convertNameToCode,
  ]);

  useEffect(() => {
    if (stepDocuments && stepDocuments.length > 0 && !loading) {
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

  const getInstitutionTypeOptions = useCallback(() => {
    const selectedRegulator = formData.regulator as string;
    if (!selectedRegulator) return [];

    const institutionTypeField = userProfileFormFields.find(
      (field) => field.fieldName === 'institutionType'
    );

    if (!institutionTypeField?.fieldOptions) return [];

    const institutionOptions =
      institutionTypeField.fieldOptions as InstitutionTypeOption[];
    const selectedRegulatorOption = institutionOptions.find(
      (option) => option.regulator === selectedRegulator
    );

    return selectedRegulatorOption?.types || [];
  }, [formData.regulator, userProfileFormFields]);

  // Track previous regulator value to detect user changes vs initial load
  const previousRegulatorRef = useRef<string | null>(null);

  useEffect(() => {
    // Only run validation if:
    // 1. Initial data has been loaded (prevents clearing on first load)
    // 2. Both regulator and institutionType exist in formData
    // 3. Form fields have been loaded (userProfileFormFields is populated)
    // 4. The user has actually changed the regulator (not initial load)
    if (!initialDataLoadedRef.current) {
      // Initial data not yet loaded, skip validation
      return;
    }

    if (formData.regulator && userProfileFormFields.length > 0) {
      const institutionTypeField = userProfileFormFields.find(
        (field) => field.fieldName === 'institutionType'
      );

      // Only validate if we have the institutionType field with options
      if (
        !institutionTypeField?.fieldOptions ||
        institutionTypeField.fieldOptions.length === 0
      ) {
        // Form fields not fully loaded yet, skip validation
        return;
      }

      const currentRegulator = formData.regulator as string;

      // Only clear institutionType if user changed the regulator (not on initial load)
      if (
        previousRegulatorRef.current !== null &&
        previousRegulatorRef.current !== currentRegulator
      ) {
        const institutionOptions = getInstitutionTypeOptions();
        const currentInstitutionType = formData.institutionType as string;

        if (currentInstitutionType) {
          const isValidInstitutionType = institutionOptions.some(
            (option) => option.code === currentInstitutionType
          );

          if (!isValidInstitutionType) {
            setFormData((prev) => ({
              ...prev,
              institutionType: '',
            }));
          }
        }
      }

      // Update previous regulator ref
      previousRegulatorRef.current = currentRegulator;
    }
    // eslint-disable-next-line
  }, [formData.regulator, getInstitutionTypeOptions, userProfileFormFields]);

  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      if (!field.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return field.validationRules;
      }
      const rules = { ...field.validationRules };
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
          return {
            ...(field.validationRules || {}),
            ...logic.then.validationRules,
          };
        }

        if (!conditionMatches && logic.else?.validationRules) {
          return {
            ...(field.validationRules || {}),
            ...logic.else.validationRules,
          };
        }
      }

      return field.validationRules || {};
    },
    [formData]
  );

  useEffect(() => {
    if (userProfileFormFields.length > 0 && !loading) {
      // Pass original fields to schema builder - it will handle conditional logic using Yup.when()
      // This allows dynamic validation based on form values at validation time
      const schema = validationSchemaBuilder(userProfileFormFields);
      setValidationSchema(schema);
    }
  }, [userProfileFormFields, validationSchemaBuilder, loading]);

  // Ref to store stable document references
  const stableDocumentRefsCache = useRef<Record<string, DocumentData>>({});

  // Memoize document data to prevent unnecessary re-renders and image blinking
  const memoizedDocumentData = useMemo(() => {
    if (!stepDocuments || stepDocuments.length === 0 || !fetchedDocuments) {
      return {};
    }

    const documentDataMap: Record<string, DocumentData> = {};

    stepDocuments.forEach((doc: any) => {
      if (doc.fieldKey && doc.id && fetchedDocuments[doc.id]) {
        const docData = fetchedDocuments[doc.id];

        // Create new document data object
        const newDocData = {
          id: doc.id,
          fileName: docData.fileName || `document_${doc.fieldKey}`,
          fileSize: docData.fileSize || 0,
          mimeType: docData.mimeType || 'application/octet-stream',
          dataUrl: docData.dataUrl || '',
        };

        // Check if we have a cached version with the same content
        const cachedDoc = stableDocumentRefsCache.current[doc.fieldKey];
        if (
          cachedDoc &&
          cachedDoc.id === newDocData.id &&
          cachedDoc.fileName === newDocData.fileName &&
          cachedDoc.fileSize === newDocData.fileSize &&
          cachedDoc.mimeType === newDocData.mimeType &&
          cachedDoc.dataUrl === newDocData.dataUrl
        ) {
          // Reuse the cached reference to prevent image blinking
          documentDataMap[doc.fieldKey] = cachedDoc;
        } else {
          // Store new reference in cache
          stableDocumentRefsCache.current[doc.fieldKey] = newDocData;
          documentDataMap[doc.fieldKey] = newDocData;
        }
      }
    });

    // Clean up cache for documents that no longer exist
    Object.keys(stableDocumentRefsCache.current).forEach((fieldKey) => {
      if (!documentDataMap[fieldKey]) {
        delete stableDocumentRefsCache.current[fieldKey];
      }
    });

    return documentDataMap;
  }, [stepDocuments, fetchedDocuments]);

  // Only update state when memoized data actually changes
  useEffect(() => {
    if (Object.keys(memoizedDocumentData).length > 0) {
      setExistingDocumentData((prevData) => {
        // Check if data has actually changed to prevent unnecessary updates
        const hasChanged = Object.keys(memoizedDocumentData).some(
          (key) =>
            !prevData[key] ||
            prevData[key].id !== memoizedDocumentData[key].id ||
            prevData[key].dataUrl !== memoizedDocumentData[key].dataUrl
        );

        return hasChanged ? memoizedDocumentData : prevData;
      });
    }
  }, [memoizedDocumentData]);

  // Helper function to check if a field should be enabled based on its conditionalLogic
  const isFieldEnabledByConditionalLogic = useCallback(
    (fieldName: string): boolean => {
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      if (!field?.conditionalLogic || !Array.isArray(field.conditionalLogic)) {
        return true; // No conditional logic, field is enabled by default
      }

      for (const logic of field.conditionalLogic) {
        const when = logic.when;
        if (!when?.field) continue;

        const dependentValue = (formData[when.field] as string) || '';
        const operator = when.operator || 'equals';
        const expectedValues = Array.isArray(when.value)
          ? when.value.map(String)
          : [String(when.value)];

        let conditionMatches = false;

        switch (operator) {
          case 'in':
          case 'equals':
            conditionMatches = expectedValues.includes(dependentValue);
            break;
          case 'not_in':
          case 'not_equals':
            conditionMatches = !expectedValues.includes(dependentValue);
            break;
          case 'is_not_empty':
            conditionMatches = dependentValue !== '';
            break;
          case 'is_empty':
            conditionMatches = dependentValue === '';
            break;
          default:
            conditionMatches = false;
        }

        // If condition matches, field is enabled (then block)
        if (conditionMatches && logic.then) {
          return true;
        } else if (!conditionMatches && logic.else) {
          // Field is disabled (else block)
          return false;
        }
      }

      return true; // Default to enabled
    },
    [userProfileFormFields, formData]
  );

  // Clear fields that are disabled based on conditionalLogic
  useEffect(() => {
    const fieldsToCheck = ['cin', 'llpin', 'proprietorName'];

    fieldsToCheck.forEach((fieldName) => {
      const isEnabled = isFieldEnabledByConditionalLogic(fieldName);
      if (!isEnabled && formData[fieldName]) {
        setFormData((prev) => ({ ...prev, [fieldName]: '' }));
        setValidationErrors((prev) => {
          const err = { ...prev };
          delete err[fieldName];
          return err;
        });
      }
    });
  }, [formData.constitution, isFieldEnabledByConditionalLogic]);

  // Memoize individual document data to prevent image blinking
  const getDocumentData = useCallback(
    (fieldName: string): DocumentData | undefined => {
      return existingDocumentData[fieldName];
    },
    [existingDocumentData]
  );

  // Create a stable reference map for existingDocuments per field to prevent re-renders
  const stableDocumentRefs = useMemo(() => {
    const refs: Record<string, DocumentData> = {};
    Object.keys(existingDocumentData).forEach((key) => {
      refs[key] = existingDocumentData[key];
    });
    return refs;
  }, [existingDocumentData]);

  const handleTextChange = useCallback((fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

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

  const handleDropdownChange = useCallback(
    (fieldName: string, value: string | number) => {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [fieldName]: value,
        };

        // Clear validation error for the current field
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        });

        return updatedData;
      });
    },
    []
  );

  const handleDateChange = useCallback(
    (fieldName: string, value: string | null) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    },
    []
  );

  const handleGenericChange = useCallback(
    (fieldName: string, value: string | ChangeEvent<HTMLInputElement>) => {
      let newValue = typeof value === 'string' ? value : value.target.value;

      // Force uppercase for PAN and GSTIN fields
      if (
        fieldName.toLowerCase().includes('pan') ||
        fieldName.toLowerCase().includes('gstin')
      ) {
        newValue = newValue.toUpperCase();
      }

      // Enforce maxLength for PAN field (10 characters)
      if (fieldName.toLowerCase() === 'pan' && newValue.length > 10) {
        newValue = newValue.slice(0, 10);
      }

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
        const field = userProfileFormFields.find(
          (f) => f.fieldName === fieldName
        );

        // Get evaluated validation rules (handles conditional logic like GSTIN)
        const evaluatedRules = field
          ? evaluateConditionalLogic(field)
          : undefined;

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
            updatedData
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
            setValidationErrors((prevErrors) => ({
              ...prevErrors,
              [fieldName]: `${field?.fieldLabel} is required`,
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
    },
    [userProfileFormFields, touchedFields, evaluateConditionalLogic]
  );

  const handleBlur = useCallback(
    (fieldName: string) => {
      // Mark field as touched
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // Validate required field on blur
      const field = userProfileFormFields.find(
        (f) => f.fieldName === fieldName
      );
      const value = formData[fieldName];

      // Get evaluated validation rules (handles conditional logic like GSTIN)
      const evaluatedRules = field
        ? evaluateConditionalLogic(field)
        : undefined;

      if (evaluatedRules?.required && (!value || value === '')) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldName]: `${field?.fieldLabel} is required`,
        }));
      }
    },
    [userProfileFormFields, formData, evaluateConditionalLogic]
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

  // Memoize institution type options to avoid recalculating on every render
  const institutionTypeOptions = useMemo(
    () => getInstitutionTypeOptions(),
    [getInstitutionTypeOptions]
  );

  // Memoize fields with evaluated conditional logic for rendering
  const fieldsWithEvaluatedRules = useMemo(() => {
    return userProfileFormFields.map((field) => ({
      ...field,
      validationRules: evaluateConditionalLogic(field),
    }));
  }, [userProfileFormFields, evaluateConditionalLogic, formData.constitution]);

  const handleDeleteDocument = useCallback(
    (documentId: string) => {
      if (documentId) {
        dispatch(deleteDocument(documentId));
      }
    },
    [dispatch]
  );

  const handleSave = async () => {
    // If user is IAU_1 or IAU_2 (read-only mode), skip validation and API call
    // Just navigate to next step
    if (isReadOnly) {
      onSaveAndNext();
      return;
    }

    // Mark all fields as touched when submitting
    const allTouched: Record<string, boolean> = {};
    userProfileFormFields.forEach((field) => {
      allTouched[field.fieldName] = true;
    });
    setTouchedFields(allTouched);

    let yupValidationPassed = true;

    // Clear any previous general error
    setGeneralError('');

    try {
      if (validationSchema) {
        await validationSchema.validate(formData, { abortEarly: false });
        setValidationErrors({});

        // Get userId from auth state
        const userId = userDetails?.userId || userDetails?.id;

        if (!userId) {
          console.error('❌ Missing userId:', { userDetails });
          alert('Missing user ID. Please try logging in again.');
          return;
        }

        // Create the formValues object with all the data
        const formValues: Record<
          string,
          string | File | number | boolean | object | null
        > = { ...formData };

        const isSoleProprietorship =
          formValues.constitution === 'Sole Proprietorship';
        if (!isSoleProprietorship && formValues.proprietorName) {
          delete formValues.proprietorName;
        }

        // Call the API - it will handle FormData conversion
        // Only send metadata with non-empty values and newly uploaded files
        const result = await dispatch(
          submitUpdatedEntityProfile({
            formValues,
            userId,
          })
        ).unwrap();

        onSaveAndNext();
      } else {
        console.error('❌ Validation schema is null or undefined');
      }
    } catch (error) {
      console.error('❌ Error caught in handleSave:', error);

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

            if (field && field.fieldType === 'textfield_with_image') {
              const fileFieldName =
                field.fieldFileName || `${field.fieldName}_file`;

              // If error is for the text field (e.g., "pan" not "panFile")
              if (err.path === field.fieldName) {
                // Always show text field errors (PAN number required)
                errors[err.path] = err.message;
              }
              // If error is for the file field (e.g., "panFile")
              else if (err.path === fileFieldName) {
                // Only skip file validation if file already exists
                if (checkIfFileExists(fileFieldName)) {
                  return;
                }
                // Show file error if no existing file
                errors[err.path] = err.message;
              }
            } else if (field && field.fieldType === 'file') {
              if (checkIfFileExists(field.fieldName)) {
                return;
              }
              errors[err.path] = err.message;
            } else {
              errors[err.path] = err.message;
            }
          }
        });
        setValidationErrors(errors);
        yupValidationPassed = Object.keys(errors).length === 0;

        // If all validation errors were filtered out (e.g., files exist), call the API
        if (yupValidationPassed) {
          try {
            // Get userId from auth state
            const userId = userDetails?.userId || userDetails?.id;

            if (!userId) {
              console.error('❌ Missing userId:', { userDetails });
              alert('Missing user ID. Please try logging in again.');
              return;
            }

            // Create the formValues object with all the data
            const formValues: Record<
              string,
              string | File | number | boolean | object | null
            > = { ...formData };

            const isSoleProprietorship =
              formValues.constitution === 'Sole Proprietorship';
            if (!isSoleProprietorship && formValues.proprietorName) {
              delete formValues.proprietorName;
            }

            // Call the API - it will handle FormData conversion
            const result = await dispatch(
              submitUpdatedEntityProfile({
                formValues,
                userId,
              })
            ).unwrap();

            onSaveAndNext();
          } catch (apiError) {
            console.error('❌ API call failed:', apiError);

            // Handle API errors
            if (
              apiError &&
              typeof apiError === 'object' &&
              'fieldErrors' in apiError
            ) {
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

              setValidationErrors(mappedFieldErrors);
            } else if (
              apiError &&
              typeof apiError === 'object' &&
              'message' in apiError
            ) {
              const errorMessage =
                (apiError as any).message || 'Submission failed';
              setGeneralError(errorMessage);
            }
          }
        }
      } else {
        yupValidationPassed = false;

        // Handle API field validation errors (like EntityProfileStep)
        if (error && typeof error === 'object' && 'fieldErrors' in error) {
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

          setValidationErrors(mappedFieldErrors);
        } else if (error && typeof error === 'object' && 'message' in error) {
          // Show general error message
          const errorMessage = (error as any).message || 'Submission failed';
          setGeneralError(errorMessage);
        } else {
          // Catch-all for unexpected errors
          console.error('❌ Unexpected error type:', typeof error, error);
          setGeneralError('An unexpected error occurred during submission');
        }
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: isMobile ? 2 : isTablet ? 2.5 : 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: isMobile ? '150px' : '200px',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <div
          style={{
            fontSize: isMobile ? '14px' : '16px',
            fontFamily: 'Gilroy',
            color: '#666',
          }}
        >
          Loading form data...
        </div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1400px',
        // mx: 'auto',
        px: isMobile ? 1 : isTablet ? 2 : 0,
        py: isMobile ? 1.5 : 0,
      }}
    >
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
        key={'entity_profile'}
        title={'Entity Profile'}
        groupKey={'entity_profile'}
        defaultExpanded={true}
      >
        <ThreeColumnGrid>
          {fieldsWithEvaluatedRules.map((field: FormField) => {
            // For textfield_with_image, combine text and file validation errors
            let fieldError = validationErrors[field.fieldName];
            if (field.fieldType === 'textfield_with_image') {
              const fileFieldName =
                field.fieldFileName || `${field.fieldName}_file`;
              const fileError = validationErrors[fileFieldName];
              // Show text field error first, then file error
              fieldError = fieldError || fileError;
            }

            // Get stable document reference to prevent image blinking
            const documentKey = field.fieldFileName || field.fieldName;
            const existingDoc = stableDocumentRefs[documentKey];

            return (
              <FieldContainer key={field.id}>
                <FieldRenderer
                  field={field}
                  value={formData[field.fieldName] || ''}
                  validationError={fieldError}
                  existingDocument={existingDoc}
                  institutionTypeOptions={
                    field.fieldName === 'institutionType'
                      ? institutionTypeOptions
                      : undefined
                  }
                  isReadOnly={isReadOnly}
                  isTouched={!!touchedFields[field.fieldName]}
                  formData={formData}
                  onTextChange={handleTextChange}
                  onDropdownChange={handleDropdownChange}
                  onDateChange={handleDateChange}
                  onFileUpload={handleFileUpload}
                  onGenericChange={handleGenericChange}
                  onBlur={handleBlur}
                  getFieldError={getFieldError}
                  getDocumentData={getDocumentData}
                  checkIfFileExists={checkIfFileExists}
                  getDocumentId={getDocumentId}
                  onDeleteDocument={handleDeleteDocument}
                />
              </FieldContainer>
            );
          })}
        </ThreeColumnGrid>
      </UpdateFormAccordion>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-end',
          mt: isMobile ? 2 : isTablet ? 2.5 : 3,
          mb: isMobile ? 2 : 0,
          px: isMobile ? 1 : 0,
        }}
      >
        <FormActionButtonsUpdate
          onSave={handleSave}
          validateLabel={configuration?.submissionSettings?.validateButtonText}
          showSave={configuration?.submissionSettings?.submitButton}
          saveLabel={configuration?.submissionSettings?.submitButtonText}
          loading={false}
          saveDisabled={false}
          validateDisabled={true}
          clearDisabled={false}
          sx={{
            margin: 0,
            padding: 0,
            width: isMobile ? '100%' : 'auto',
            '& button': {
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? '100%' : isTablet ? '120px' : '140px',
              fontSize: isMobile ? '14px' : '16px',
              py: isMobile ? 1.5 : 1.25,
            },
          }}
          submissionSettings={configuration?.submissionSettings}
        />
      </Box>
    </Box>
  );
};

export default UpdateEntityProfileStep;
