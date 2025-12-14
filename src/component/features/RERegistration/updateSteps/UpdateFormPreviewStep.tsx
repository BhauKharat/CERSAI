/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, memo } from 'react';
import { LabeledCheckbox } from '../../../../component/features/RERegistration/CommonComponent';
import LabeledTextFieldWithUploadUpdate from './CommonComponnet/LableledTextFieldWithUploadUpdate';
import LabeledDateUpdate from './CommonComponnet/LabeledDateUpdate';
import UploadButtonUpdate from './CommonComponnet/UploadButtonUpdate';
import LabeledTextFieldWithVerifyUpdate from './CommonComponnet/LabeledTextFieldWithVerifyUpdate';
import LabeledDropDownUpdate from './CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from './CommonComponnet/LabledTextFieldUpdate';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import { FormField } from './types/formTypesUpdate';
import { Box, Alert, Typography } from '@mui/material';
import { useEffect, useState, useCallback, useMemo } from 'react';
import UpdateFormAccordion from './UpdateFormAccordion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../redux/store';
import {
  fetchWorkflowData,
  fetchFormPreviewFields,
  fetchPreviewDocument,
  fetchDropdownDataPreview,
  selectWorkflowData,
  selectGroupedFields,
  selectPreviewFields,
  selectPreviewDocuments,
  selectFetchedPreviewDocuments,
  selectFormPreviewLoading,
  selectPreviewDropdownData,
  selectPreviewConfiguration,
  clearFormPreview,
} from './slice/formPreviewSlice';
import {
  generateUpdatePdf,
  fetchGeneratedUpdatePdf,
  eSignUpdate,
  fetchSignedUpdatePdf,
  clearPdfDocument,
  submitUpdateProfile,
  resetPdfGenerationUpdate,
  selectPdfUpdateGenerationLoading,
  selectPdfUpdateGenerationError,
  selectPdfUpdateDocumentId,
  selectPdfUpdateDocument,
  selectPdfUpdateDocumentLoading,
  selectESignUpdateLoading,
  selectSignedUpdateDocumentId,
  selectSignedUpdateDocument,
  selectUpdateAckNo,
  selectUpdateAcknowledgementNo,
  selectSubmissionLoading,
  selectSubmissionError,
  selectSubmissionSuccess,
} from './slice/pdfGenerationUpdateSlice';
import FormActionButtonsUpdate from './CommonComponnet/ClearAndSaveActionsUpdate';
import PdfPreviewModalUpdate from './CommonComponnet/PdfPreviewModalUpdate';

import UpdateSuccessModal from './CommonComponnet/UpdateSuccessModel';
export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: FormField[];
  };
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

interface UpdateFormPreviewStepProps {
  onPrevious?: () => void;
  onEdit?: (stepIndex: number) => void;
  formData?: Record<string, Record<string, unknown>>;
}

// Memoized Image Field Component - won't re-render when dropdown data changes
const MemoizedImageField = memo<{
  field: FormField;
  fieldValue: string;
  existingDoc: DocumentData | undefined;
}>(
  ({ field, fieldValue, existingDoc }) => {
    const fileValidationRules =
      field.validationRules?.validationFile || field.validationRules;

    // Create stable key including document ID to prevent re-rendering
    const componentKey = existingDoc
      ? `${field.id}-${existingDoc.id}`
      : `${field.id}-no-doc`;

    return (
      <LabeledTextFieldWithUploadUpdate
        key={componentKey}
        label={field.fieldLabel}
        value={fieldValue}
        onChange={() => {}}
        onUpload={() => {}}
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
        error={undefined}
        helperText={undefined}
        accept={
          fileValidationRules?.imageFormat
            ?.map((format: any) => `.${format}`)
            .join(',') || '.jpg,.jpeg,.png'
        }
        validationRules={fileValidationRules || undefined}
        onValidationError={() => {}}
        disabled={true}
        existingDocument={existingDoc}
        showExistingDocument={!!existingDoc}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.fieldValue === nextProps.fieldValue &&
      prevProps.existingDoc?.id === nextProps.existingDoc?.id &&
      prevProps.existingDoc?.dataUrl === nextProps.existingDoc?.dataUrl
    );
  }
);

MemoizedImageField.displayName = 'MemoizedImageField';

// Memoized File Field Component
const MemoizedFileField = memo<{
  field: FormField;
  existingDoc: DocumentData | undefined;
}>(
  ({ field, existingDoc }) => {
    const componentKey = existingDoc
      ? `${field.id}-${existingDoc.id}`
      : `${field.id}-no-doc`;

    return (
      <div key={componentKey}>
        <UploadButtonUpdate
          label={field.fieldLabel}
          onUpload={() => {}}
          required={field.validationRules?.required || false}
          accept={
            (
              field.validationRules?.validationFile?.imageFormat ||
              field.validationRules?.imageFormat
            )
              ?.map((format: any) => `.${format}`)
              .join(',') || '.jpg,.jpeg,.png,.pdf'
          }
          disabled={true}
          existingDocument={existingDoc}
          showExistingDocument={!!existingDoc}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.existingDoc?.id === nextProps.existingDoc?.id &&
      prevProps.existingDoc?.dataUrl === nextProps.existingDoc?.dataUrl
    );
  }
);

MemoizedFileField.displayName = 'MemoizedFileField';

const UpdateFormPreviewStep: React.FC<UpdateFormPreviewStepProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Get workflowId from updateWorkflow slice
  const updateWorkflowId = useSelector(
    (state: { updateWorkflow: { workflowId: string | null } }) =>
      state.updateWorkflow.workflowId
  );

  // Redux selectors
  const workflowData = useSelector(selectWorkflowData);
  const groupedFields = useSelector(selectGroupedFields);
  const previewFields = useSelector(selectPreviewFields);
  const workflowDocuments = useSelector(selectPreviewDocuments);
  const fetchedDocuments = useSelector(selectFetchedPreviewDocuments);
  const loading = useSelector(selectFormPreviewLoading);
  const dropdownData = useSelector(selectPreviewDropdownData);
  const configuration = useSelector(selectPreviewConfiguration);

  // PDF generation selectors
  const pdfGenerationLoading = useSelector(selectPdfUpdateGenerationLoading);
  const pdfGenerationError = useSelector(selectPdfUpdateGenerationError);
  const pdfDocumentId = useSelector(selectPdfUpdateDocumentId);
  const pdfDocument = useSelector(selectPdfUpdateDocument);
  const pdfDocumentLoading = useSelector(selectPdfUpdateDocumentLoading);
  const eSignLoading = useSelector(selectESignUpdateLoading);
  const signedDocumentId = useSelector(selectSignedUpdateDocumentId);
  const signedDocument = useSelector(selectSignedUpdateDocument);
  const acknowledgementNo = useSelector(selectUpdateAcknowledgementNo);
  const ackNo = useSelector(selectUpdateAckNo);
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership || []
  );
  const submissionLoading = useSelector(selectSubmissionLoading);
  const submissionError = useSelector(selectSubmissionError);
  const submissionSuccess = useSelector(selectSubmissionSuccess);

  // Local state
  const [submissionErrorMessage, setSubmissionErrorMessage] =
    useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [existingDocumentData, setExistingDocumentData] = useState<
    Record<string, DocumentData>
  >({});
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfFetchInitiated, setPdfFetchInitiated] = useState<string | null>(
    null
  );
  const [signedPdfFetchInitiated, setSignedPdfFetchInitiated] = useState<
    string | null
  >(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState<string>('');

  // Use ref to track fetched documents without causing re-renders
  const fetchedDocumentIdsRef = useRef<Set<string>>(new Set());

  // Use ref to track fetched dropdown fields to prevent unnecessary API calls
  const fetchedDropdownFieldsRef = useRef<Set<string>>(new Set());

  // Fetch workflow data and form fields on mount
  useEffect(() => {
    // Only fetch if we have a workflowId from previous step submissions
    if (updateWorkflowId) {
      const userId = userDetails?.userId || 'NO_0000';

      // Clear previous preview state to ensure fresh data is fetched
      // This fixes the issue where deleted documents still show until page reload
      dispatch(clearFormPreview());

      // Reset the refs to allow re-fetching documents
      fetchedDocumentIdsRef.current.clear();
      fetchedDropdownFieldsRef.current.clear();

      dispatch(
        fetchWorkflowData({
          workflowId: updateWorkflowId,
          userId: userId,
        })
      );

      dispatch(fetchFormPreviewFields());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, updateWorkflowId]);

  // Fetch documents when workflow data is available
  useEffect(() => {
    if (workflowDocuments && workflowDocuments.length > 0) {
      workflowDocuments.forEach((doc: any) => {
        // Only fetch if not already fetched or in progress
        if (
          doc.id &&
          !fetchedDocumentIdsRef.current.has(doc.id) &&
          !fetchedDocuments[doc.id]
        ) {
          fetchedDocumentIdsRef.current.add(doc.id);
          dispatch(fetchPreviewDocument(doc.id));
        }
      });
    }
  }, [workflowDocuments, dispatch, fetchedDocuments]);

  // Populate form data from workflow payload
  useEffect(() => {
    if (workflowData?.payload && Object.keys(workflowData.payload).length > 0) {
      setFormData(workflowData.payload);
    }
  }, [workflowData]);

  const memoizedDocumentData = useMemo(() => {
    if (
      !workflowDocuments ||
      workflowDocuments.length === 0 ||
      !fetchedDocuments
    ) {
      return {};
    }

    const documentDataMap: Record<string, DocumentData> = {};

    workflowDocuments.forEach((doc: any) => {
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
  }, [workflowDocuments, fetchedDocuments]);

  // Update state only when memoized data actually changes
  useEffect(() => {
    if (Object.keys(memoizedDocumentData).length > 0) {
      setExistingDocumentData((prev) => {
        // Only update if there are actual changes
        const prevKeys = Object.keys(prev).sort().join(',');
        const newKeys = Object.keys(memoizedDocumentData).sort().join(',');

        // If keys are different, update
        if (prevKeys !== newKeys) {
          return memoizedDocumentData;
        }

        // Keys are the same, check if any dataUrl or id changed
        const hasChanges = Object.keys(memoizedDocumentData).some((key) => {
          const prevDoc = prev[key];
          const newDoc = memoizedDocumentData[key];
          return (
            !prevDoc ||
            prevDoc.id !== newDoc.id ||
            prevDoc.dataUrl !== newDoc.dataUrl ||
            prevDoc.fileName !== newDoc.fileName
          );
        });

        if (!hasChanges) {
          // No changes detected, return previous state to prevent re-render
          return prev;
        }

        return memoizedDocumentData;
      });
    }
  }, [memoizedDocumentData]);

  // Helper function to get institution type options based on selected regulator
  const getInstitutionTypeOptions = useCallback(() => {
    const selectedRegulator = formData.regulator as string;
    if (!selectedRegulator) return [];

    // Get all fields from grouped fields
    const allFields: FormField[] = [];
    Object.values(groupedFields).forEach((group) => {
      if (group.fields) {
        allFields.push(...group.fields);
      }
    });

    const institutionTypeField = allFields.find(
      (field) => field.fieldName === 'institutionType'
    );

    if (!institutionTypeField?.fieldOptions) return [];

    const institutionOptions =
      institutionTypeField.fieldOptions as InstitutionTypeOption[];
    const selectedRegulatorOption = institutionOptions.find(
      (option) => option.regulator === selectedRegulator
    );

    return selectedRegulatorOption?.types || [];
  }, [formData.regulator, groupedFields]);

  // Memoize institution type options to avoid recalculating on every render
  const institutionTypeOptions = useMemo(
    () => getInstitutionTypeOptions(),
    [getInstitutionTypeOptions]
  );

  // Fetch PDF document when PDF ID is available
  useEffect(() => {
    if (
      pdfDocumentId &&
      !pdfDocument &&
      !pdfDocumentLoading &&
      pdfFetchInitiated !== pdfDocumentId
    ) {
      setPdfFetchInitiated(pdfDocumentId);
      dispatch(fetchGeneratedUpdatePdf(pdfDocumentId));
    }
  }, [
    pdfDocumentId,
    pdfDocument,
    pdfDocumentLoading,
    pdfFetchInitiated,
    dispatch,
  ]);

  // Fetch signed document when signed document ID is available
  useEffect(() => {
    if (
      signedDocumentId &&
      !signedDocument &&
      !pdfDocumentLoading &&
      signedPdfFetchInitiated !== signedDocumentId
    ) {
      setSignedPdfFetchInitiated(signedDocumentId);
      dispatch(fetchSignedUpdatePdf(signedDocumentId));
    }
  }, [
    signedDocumentId,
    signedDocument,
    pdfDocumentLoading,
    signedPdfFetchInitiated,
    dispatch,
  ]);

  // Handle submission error
  useEffect(() => {
    if (submissionError) {
      const errorMessage = submissionError?.message || 'Submission failed';
      setSubmissionErrorMessage(errorMessage);
    }
  }, [submissionError]);

  // Submit handler - generates PDF and opens modal
  const handleSubmit = async () => {
    const workflowId = updateWorkflowId;
    const userId = userDetails?.userId; // TODO: Get from auth state

    if (!workflowId || !userId) {
      alert('Please complete a previous step before generating PDF');
      return;
    }

    try {
      // Reset fetch flags
      setPdfFetchInitiated(null);
      setSignedPdfFetchInitiated(null);

      // Clear any existing PDF document and show loader immediately
      dispatch(clearPdfDocument());

      // Generate PDF
      const generateResult = await dispatch(
        generateUpdatePdf({ workflowId, userId })
      ).unwrap();

      // Open PDF preview modal
      setPdfModalOpen(true);

      // Immediately fetch the generated PDF document
      if (generateResult.data.id) {
        setPdfFetchInitiated(generateResult.data.id);
        await dispatch(
          fetchGeneratedUpdatePdf(generateResult.data.id)
        ).unwrap();
      }
    } catch {
      // Error handling
    }
  };

  // eSign handler
  const handleESign = async (place: string, date: string) => {
    const workflowId = updateWorkflowId;
    const userId = userDetails?.userId; // TODO: Get from auth state

    if (!workflowId || !userId) {
      alert('Please complete a previous step before signing');
      return;
    }

    try {
      // Call eSign API
      await dispatch(
        eSignUpdate({
          workflowId,
          userId,
          declaration: true,
          declarationPlace: place,
          declarationDate: date,
        })
      ).unwrap();

      // Modal will automatically update to show signed document
      // when signedDocumentId is set and signedDocument is fetched
    } catch {
      // Error handling
    }
  };

  const handleModalClose = () => {
    setPdfModalOpen(false);
  };

  const handleBackToHome = async () => {
    const finalAckNo = acknowledgementNo || ackNo;

    if (!finalAckNo || !updateWorkflowId) {
      console.error('Missing acknowledgement number or workflow ID');
      navigate('/');
      return;
    }

    const userId = userDetails?.userId || 'NO_0000';

    try {
      // Call submission API
      console.log('📤 Submitting update profile on Submit button click:', {
        workflowId: updateWorkflowId,
        userId,
        acknowledgementNo: finalAckNo,
      });

      const result = await dispatch(
        submitUpdateProfile({
          workflowId: updateWorkflowId,
          userId,
          acknowledgementNo: finalAckNo,
        })
      ).unwrap();

      console.log('✅ Submission successful, clearing state and showing modal');

      const apiMessage =
        (result && (result.message || result.data?.message)) ||
        'Entity profile update request submitted for approval';

      setSuccessModalMessage(apiMessage);
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('❌ Submission failed:', error);

      const errorMessage =
        (error && (error.message || error?.data?.message)) ||
        'Submission failed. Please try again.';

      setSuccessModalMessage(errorMessage);
      setSuccessModalOpen(true);
    }
  };

  // Fetch dropdown data for cascading fields (state, district, pincode)
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;
    if (!groupedFields || Object.keys(groupedFields).length === 0) return;

    // Get all fields from grouped fields
    const allFields: FormField[] = [];
    Object.values(groupedFields).forEach((group) => {
      if (group.fields) {
        allFields.push(...group.fields);
      }
    });

    if (allFields.length === 0) return;

    // Find cascading dropdown fields
    const cascadingFields: Array<{
      field: FormField;
      keyword: string;
      dependsOn: string | null;
    }> = [];

    allFields.forEach((field) => {
      if (
        field.fieldType !== 'dropdown' ||
        field.fieldAttributes?.type !== 'external_api'
      ) {
        return;
      }

      const fieldNameLower = field.fieldName.toLowerCase();

      if (fieldNameLower.includes('state')) {
        const dependsOnField = allFields.find(
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
        const dependsOnField = allFields.find(
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
        const dependsOnField = allFields.find(
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

    // Fetch dropdown data for fields that have dependencies satisfied
    cascadingFields.forEach(({ field, dependsOn }) => {
      if (!dependsOn || !field.fieldAttributes) return;

      const dependencyValue = formData[dependsOn];
      if (dependencyValue) {
        // Create a unique key for this field with its dependency value
        const fetchKey = `${field.fieldName}-${dependencyValue}`;

        // Only fetch if not already fetched for this specific dependency value
        if (!fetchedDropdownFieldsRef.current.has(fetchKey)) {
          fetchedDropdownFieldsRef.current.add(fetchKey);

          dispatch(
            fetchDropdownDataPreview({
              fieldName: field.fieldName,
              fieldAttributes: field.fieldAttributes,
              formData: formData,
            })
          );
        }
      }
    });
  }, [formData, groupedFields, dispatch]);

  // Memoize document lookup to prevent unnecessary recalculations
  const getDocumentForField = useCallback(
    (field: FormField): DocumentData | undefined => {
      const documentKey = field.fieldFileName || field.fieldName;
      let existingDoc = existingDocumentData[documentKey];

      // If not found, try alternative keys
      if (!existingDoc) {
        // Try just the field name without prefix
        existingDoc = existingDocumentData[field.fieldName];

        // Try with common prefixes removed
        if (!existingDoc && field.fieldName) {
          const alternativeKeys = [
            field.fieldName.replace('register', ''),
            field.fieldName.replace('correspondence', ''),
            field.fieldName.replace(/^(register|correspondence)/, ''),
          ];

          for (const altKey of alternativeKeys) {
            if (existingDocumentData[altKey]) {
              existingDoc = existingDocumentData[altKey];
              break;
            }
          }
        }
      }

      return existingDoc;
    },
    [existingDocumentData]
  );

  const renderField = useCallback(
    (field: FormField) => {
      if (
        field.fieldName.includes('PincodeOther') ||
        field.fieldName.includes('pincodeOther')
      ) {
        const mainPincodeFieldName = field.fieldName.includes('register')
          ? 'registerPincode'
          : 'correspondencePincode';
        const mainPincodeValue = formData[mainPincodeFieldName];

        // Only show if main pincode field has "other" or "others" value
        const pincodeValueLower = String(mainPincodeValue).toLowerCase();
        if (pincodeValueLower !== 'other' && pincodeValueLower !== 'others') {
          return null; // Don't render this field
        }
      }
      // Get the field value - try exact match first
      let fieldValue = formData[field.fieldName];

      // Special mapping for address line fields only
      // Other fields like registerCountry, correspondenceState, etc. should match directly
      if (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === ''
      ) {
        const fieldName = field.fieldName;

        // Map register address line fields: addressLine1 → registerLine1
        if (fieldName === 'addressLine1') {
          fieldValue = formData['registerLine1'];
        } else if (fieldName === 'addressLine2') {
          fieldValue = formData['registerLine2'];
        } else if (fieldName === 'addressLine3') {
          fieldValue = formData['registerLine3'];
        }
        // Map correspondence address line fields: correspondenceAddressLine1 → correspondenceLine1
        else if (fieldName === 'correspondenceAddressLine1') {
          fieldValue = formData['correspondenceLine1'];
        } else if (fieldName === 'correspondenceAddressLine2') {
          fieldValue = formData['correspondenceLine2'];
        } else if (fieldName === 'correspondenceAddressLine3') {
          fieldValue = formData['correspondenceLine3'];
        }
      }

      // Fallback to '-' for null/undefined/empty values
      fieldValue = fieldValue || '-';

      // Get document using memoized lookup
      const existingDoc = getDocumentForField(field);

      switch (field.fieldType) {
        case 'textfield':
          return (
            <LabeledTextFieldUpdate
              key={field.id}
              label={field.fieldLabel}
              value={fieldValue}
              onChange={() => {}}
              placeholder={field.fieldPlaceholder || ''}
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
              error={undefined}
              helperText={''}
              type={field.fieldName.includes('website') ? 'url' : 'text'}
              disabled={true}
            />
          );

        case 'dropdown': {
          let options: { label: string; value: string }[] = [];

          // Special formatting for Country Code dropdown
          const isCountryCodeField = field.fieldName
            .toLowerCase()
            .includes('countrycode');

          // Special handling for institutionType - filter by regulator
          if (field.fieldName === 'institutionType' && institutionTypeOptions) {
            options = institutionTypeOptions.map((option) => ({
              label: option.name,
              value: option.code,
            }));
          }
          // Check if this is an external API dropdown with dynamic options
          else if (field.fieldAttributes?.type === 'external_api') {
            // Get options from Redux dropdown data if available
            const dynamicOptions = dropdownData[field.fieldName]?.options || [];
            if (dynamicOptions && dynamicOptions.length > 0) {
              options = dynamicOptions;
            } else {
              // Fallback to static options if dynamic ones aren't loaded yet
              options =
                field.fieldOptions?.map((option: any, index: number) => {
                  // For country code fields: value = code, label = name (code)
                  if (isCountryCodeField) {
                    return {
                      label:
                        option.name && option.code
                          ? `${option.name} (${option.code})`
                          : option.label ||
                            option.name ||
                            `Option ${index + 1}`,
                      value: option.code || option.value || `option_${index}`,
                    };
                  }

                  // For other dropdowns
                  return {
                    label: option.label || option.name || `Option ${index + 1}`,
                    value:
                      option.value ||
                      option.code ||
                      option.isocode ||
                      `option_${index}`,
                  };
                }) || [];
            }
          } else {
            // Static dropdown - use fieldOptions
            options = (field.fieldOptions || []).map(
              (option: any, index: number) => {
                // For country code fields: value = code, label = name (code)
                if (isCountryCodeField) {
                  return {
                    label:
                      option.name && option.code
                        ? `${option.name} (${option.code})`
                        : option.label || option.name || `Option ${index + 1}`,
                    value: option.code || option.value || `option_${index}`,
                  };
                }

                // For other dropdowns
                return {
                  label: option?.name || option?.label || `Option ${index + 1}`,
                  value: option?.code || option?.value || `option_${index}`,
                };
              }
            );
          }

          // For country code fields, we need to find and display the label with format: name (code)
          let displayValue = fieldValue;
          if (isCountryCodeField && fieldValue && field.fieldOptions) {
            const matchingOption = field.fieldOptions.find(
              (opt: any) => opt.code === fieldValue || opt.value === fieldValue
            );
            if (matchingOption && matchingOption.name && matchingOption.code) {
              displayValue = `${matchingOption.name} (${matchingOption.code})`;
            }
          }

          // If no fieldOptions available but there's a value, add it as a static option
          if (fieldValue && options.length === 0) {
            // For country code, try to find the matching option from fieldOptions
            if (isCountryCodeField && field.fieldOptions) {
              const matchingOption = field.fieldOptions.find(
                (opt: any) =>
                  opt.code === fieldValue || opt.value === fieldValue
              );
              if (matchingOption) {
                options = [
                  {
                    label: `${matchingOption.name} (${matchingOption.code})`,
                    value: matchingOption.code || matchingOption.value,
                  },
                ];
              } else {
                options = [
                  {
                    label: fieldValue,
                    value: fieldValue,
                  },
                ];
              }
            } else {
              options = [
                {
                  label: fieldValue,
                  value: fieldValue,
                },
              ];
            }
          }
          // If options exist but don't include the current value, add it
          else if (
            fieldValue &&
            !options.some((opt) => opt.value === fieldValue)
          ) {
            // For country code, try to find the matching option from fieldOptions
            let newOption;
            if (isCountryCodeField && field.fieldOptions) {
              const matchingOption = field.fieldOptions.find(
                (opt: any) =>
                  opt.code === fieldValue || opt.value === fieldValue
              );
              if (matchingOption) {
                newOption = {
                  label: `${matchingOption.name} (${matchingOption.code})`,
                  value: matchingOption.code || matchingOption.value,
                };
              } else {
                newOption = {
                  label: fieldValue,
                  value: fieldValue,
                };
              }
            } else {
              newOption = {
                label: fieldValue,
                value: fieldValue,
              };
            }

            options = [...options, newOption];
          }

          return (
            <LabeledDropDownUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              value={isCountryCodeField ? displayValue : fieldValue}
              onChange={() => {}}
              options={options}
              placeholder={
                field.fieldPlaceholder || `Select ${field.fieldLabel}`
              }
              required={field.validationRules?.required || false}
              error={undefined}
              helperText={undefined}
              disabled={true}
            />
          );
        }
        case 'checkbox':
          return (
            <LabeledCheckbox
              key={field.id}
              label={field.fieldLabel}
              checked={!!fieldValue}
              onChange={() => {}}
              required={field.validationRules?.required}
              disabled={true}
              checkboxSx={{
                boxShadow: 'none',
                backgroundColor: 'transparent',
              }}
            />
          );
        case 'date':
          return (
            <LabeledDateUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              value={fieldValue}
              onChange={() => {}}
              required={field.validationRules?.required || false}
              error={undefined}
              helperText={undefined}
              disabled={true}
            />
          );

        case 'textfield_with_image':
          return (
            <MemoizedImageField
              field={field}
              fieldValue={fieldValue}
              existingDoc={existingDoc}
            />
          );

        case 'textfield_with_verify': {
          // Determine if this is a CKYC field and check corresponding citizenship
          const fieldName = field.fieldName;
          let isIndianCitizen = false;
          const hasCkycValue = fieldValue && fieldValue !== '-';

          // Check citizenship based on CKYC field type
          if (fieldName === 'noCkycNumber') {
            // Nodal Officer CKYC
            const citizenship = formData['noCitizenship'];
            isIndianCitizen =
              String(citizenship ?? '').toLowerCase() === 'indian';
          } else if (fieldName === 'hoiCkycNo') {
            // Head of Institution CKYC
            const citizenship = formData['hoiCitizenship'];
            isIndianCitizen =
              String(citizenship ?? '').toLowerCase() === 'indian';
          } else if (fieldName === 'iauCkycNumber1') {
            // Admin User 1 CKYC
            const citizenship = formData['iauCitizenship1'];
            isIndianCitizen =
              String(citizenship ?? '').toLowerCase() === 'indian';
          } else if (fieldName === 'iauCkycNumber2') {
            // Admin User 2 CKYC
            const citizenship = formData['iauCitizenship2'];
            isIndianCitizen =
              String(citizenship ?? '').toLowerCase() === 'indian';
          }

          // Show verified icon only if citizenship is Indian and CKYC has value
          const shouldShowVerified = isIndianCitizen && hasCkycValue;
          // Hide verify button if citizenship is not Indian
          const shouldHideVerifyButton = !isIndianCitizen;

          return (
            <LabeledTextFieldWithVerifyUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              value={fieldValue}
              onChange={() => {}}
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
              error={undefined}
              helperText={undefined}
              verifyButtonText="Verified"
              externalVerifyUrl={
                field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
              }
              onOpenSendOtp={async () => {}}
              onSubmitOtp={async () => {}}
              onOtpVerified={() => {}}
              onVerify={async () => {}}
              disabled={true}
              isPreVerified={shouldShowVerified}
              verifyDisabled={shouldHideVerifyButton}
            />
          );
        }

        case 'file':
          return <MemoizedFileField field={field} existingDoc={existingDoc} />;

        default:
          return null;
      }
    },
    [formData, getDocumentForField, institutionTypeOptions, dropdownData]
  );

  const renderFieldGroup = useCallback(
    (fields: FormField[]) => {
      const sortedFields = [...fields].sort(
        (a, b) => a.fieldOrder - b.fieldOrder
      );

      return (
        <ThreeColumnGrid>
          {sortedFields.map((field) => {
            const renderedField = renderField(field);

            if (!renderedField) {
              return null;
            }
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
                  {renderedField}
                </FieldContainer>
              );
            }
            return (
              <FieldContainer key={field.id}>{renderedField}</FieldContainer>
            );
          })}
        </ThreeColumnGrid>
      );
    },
    [renderField]
  );

  const onEditClick = useCallback(
    (groupKey: string) => {
      // Navigate to appropriate update step based on group
      // Using replace: true so browser back button goes to previous step, not back to FormPreview
      switch (groupKey) {
        case 'reEntityprofile':
          navigate('/re/update-entity-profile-step', { replace: true });
          break;
        case 'reAddressdetails':
          navigate('/re/update-address-step', { replace: true });
          break;
        case 'reCorrespondenceaddress':
          navigate('/re/update-address-step', { replace: true });
          break;
        case 'reHoi':
          navigate('/re/update-hoi-step', { replace: true });
          break;
        case 'reNodal':
          navigate('/re/update-nodal-officer-step', { replace: true });
          break;
        case 'reAdminone':
          navigate('/re/update-admin-user-step', { replace: true });
          break;
        case 'reAdmintwo':
          navigate('/re/update-admin-user-step', { replace: true });
          break;
        default:
          break;
      }
    },
    [navigate]
  );

  const renderGroupedFields = useCallback(() => {
    // Check if user is Nodal Officer
    const isNodalOfficer = groupMembership.some(
      (group) => group.replace(/^\//, '') === 'Nodal_Officer'
    );
    const userType = userDetails?.role;
    const isIAU1 = userType === 'IAU_1';
    const isIAU2 = userType === 'IAU_2';

    return Object.entries(groupedFields).map(([groupName, fields]) => {
      // Hide Edit button based on user role and section
      let shouldShowEditButton = true;

      // Hide Edit for reNodal section if user is Nodal Officer
      if (groupName === 'reNodal' && isNodalOfficer) {
        shouldShowEditButton = false;
      }
      // Hide Edit for reAdminone section if user is IAU_1
      if (groupName === 'reAdminone' && isIAU1) {
        shouldShowEditButton = false;
      }
      // Hide Edit for reAdmintwo section if user is IAU_2
      if (groupName === 'reAdmintwo' && isIAU2) {
        shouldShowEditButton = false;
      }

      return (
        <UpdateFormAccordion
          key={groupName}
          title={fields?.label}
          groupKey={groupName}
          defaultExpanded={true}
          showAddButton={shouldShowEditButton}
          addButtonLabel="Edit"
          onAddNew={() => onEditClick(groupName)}
        >
          {renderFieldGroup(fields.fields)}
        </UpdateFormAccordion>
      );
    });
  }, [
    groupedFields,
    onEditClick,
    renderFieldGroup,
    groupMembership,
    userDetails?.role,
  ]);

  // Wait for both loading to complete AND formData to be populated
  // This fixes the issue where Verified icon doesn't show on first render
  // because formData is empty when the component first renders after loading completes
  const isFormDataLoaded = Object.keys(formData).length > 0;

  if (loading || (workflowData?.payload && !isFormDataLoaded)) {
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
        <div>Loading form preview...</div>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Heading */}
      <Box sx={{ mt: 2 }}>
        <Typography
          sx={{
            m: 2,
            color: '#1A1A1A',
            fontWeight: 600,
            fontFamily: 'Gilroy-Bold, sans-serif',
            fontSize: '24px',
            textAlign: 'center',
          }}
        >
          Form Preview
        </Typography>
      </Box>
      {/* Error Alert */}
      {submissionErrorMessage && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            fontFamily: 'Gilroy',
          }}
          onClose={() => setSubmissionErrorMessage('')}
        >
          {submissionErrorMessage}
        </Alert>
      )}

      {groupedFields && Object.keys(groupedFields).length > 0 ? (
        <Box>{renderGroupedFields()}</Box>
      ) : previewFields && previewFields.length > 0 ? (
        <ThreeColumnGrid>
          {previewFields.map((field: FormField) => (
            <FieldContainer key={field.id}>{renderField(field)}</FieldContainer>
          ))}
        </ThreeColumnGrid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <div>No form fields available</div>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <FormActionButtonsUpdate
          onSave={handleSubmit}
          saveLabel={
            configuration?.submissionSettings?.submitButtonText || 'Submit'
          }
          showSave={configuration?.submissionSettings?.submitButton !== false}
          // loading={pdfGenerationLoading}
          //saveDisabled={pdfGenerationLoading}
          sx={{ margin: 0, padding: 0 }}
          submissionSettings={configuration?.submissionSettings}
        />
      </Box>

      {/* PDF Preview Modal */}
      {pdfModalOpen && (
        <PdfPreviewModalUpdate
          open={pdfModalOpen}
          onClose={handleModalClose}
          pdfDocument={signedDocument || pdfDocument}
          loading={pdfDocumentLoading || eSignLoading}
          error={pdfGenerationError}
          onESign={handleESign}
          onBackToHome={handleBackToHome}
          isSignedDocument={!!signedDocument}
          submissionLoading={submissionLoading}
        />
      )}

      <UpdateSuccessModal
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          setPdfModalOpen(false);
          dispatch(resetPdfGenerationUpdate());
          navigate('/re/dashboard');
        }}
        title={submissionSuccess ? successModalMessage : 'Submission Status'}
        message={!submissionSuccess ? successModalMessage : ''}
        okText="OK"
        messageType={submissionSuccess ? 'success' : 'error'}
        onOk={() => {
          setSuccessModalOpen(false);
          setPdfModalOpen(false);
          dispatch(resetPdfGenerationUpdate());
          navigate('/re/dashboard');
        }}
      />
    </Box>
  );
};

export default UpdateFormPreviewStep;
