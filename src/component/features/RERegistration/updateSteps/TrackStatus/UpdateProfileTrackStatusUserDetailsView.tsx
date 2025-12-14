/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, memo } from 'react';
import { LabeledCheckbox } from '../../CommonComponent';
import LabeledTextFieldWithUploadUpdate from '../CommonComponnet/LableledTextFieldWithUploadUpdate';
import LabeledDateUpdate from '../CommonComponnet/LabeledDateUpdate';
import UploadButtonUpdate from '../CommonComponnet/UploadButtonUpdate';
import LabeledTextFieldWithVerifyUpdate from '../CommonComponnet/LabeledTextFieldWithVerifyUpdate';
import LabeledDropDownUpdate from '../CommonComponnet/LabledDropDownUpdate';
import LabeledTextFieldUpdate from '../CommonComponnet/LabledTextFieldUpdate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FieldContainer, ThreeColumnGrid } from '../../DynamicForm.styles';
import { FormField } from '../types/formTypesUpdate';
import image1 from '../../../../../assets/icons/Simplification.png';
import {
  Box,
  Alert,
  Grid,
  Typography,
  Button,
  Modal,
  IconButton,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useCallback, useMemo } from 'react';
import UpdateFormAccordion from '../UpdateFormAccordion';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../../redux/store';
import {
  fetchWorkflowData,
  selectWorkflowData,
  selectPreviewDocuments,
  selectFetchedPreviewDocuments,
  fetchDropdownDataPreview,
  selectPreviewDropdownData,
  fetchUserDetailsFormPreviewFields,
  fetchPreviewDocument,
} from '../slice/trackStatus_userDetailsformPreviewSlice';
import {
  selectGroupedFields,
  selectPreviewFields,
  selectFormPreviewLoading,
  selectPreviewConfiguration,
} from '../slice/trackStatus_userDetailsformPreviewSlice';
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
} from '../slice/pdfGenerationUpdateSlice';

import { styles } from './NewRequest.style';
import AdminBreadcrumbUpdateProfile from '../../../../admin-features/myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
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

interface UpdateProfileTrackStatusViewProps {
  onPrevious?: () => void;

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

    // Debug logging
    console.log('🔍 MemoizedImageField Debug:', {
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      hasExistingDoc: !!existingDoc,
      existingDocId: existingDoc?.id,
      existingDocFileName: existingDoc?.fileName,
      existingDocDataUrl: existingDoc?.dataUrl ? 'Present' : 'Missing',
    });

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
        trackStatusShow={true}
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

const UpdateProfileTrackStatusUserDetailsView: React.FC<
  UpdateProfileTrackStatusViewProps
> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();

  // Get workflowId from Redux state
  const reduxWorkflowId = useSelector(
    (state: { updateWorkflow: { workflowId: string | null } }) =>
      state.updateWorkflow.workflowId
  );
  const formatSubmittedOn = (dateStr?: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
  };
  // Use workflowId from URL params or fallback to Redux state
  const updateWorkflowId = workflowId || reduxWorkflowId;

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

  // State for document viewer modal
  const [viewDocument, setViewDocument] = useState<{
    open: boolean;
    base64Content?: string;
    fileName?: string;
    fileType?: string;
    loading?: boolean;
  }>({ open: false });

  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Use ref to track fetched documents without causing re-renders
  const fetchedDocumentIdsRef = useRef<Set<string>>(new Set());

  // Use ref to track fetched dropdown fields to prevent unnecessary API calls
  const fetchedDropdownFieldsRef = useRef<Set<string>>(new Set());

  // Fetch workflow data and form fields on mount
  useEffect(() => {
    // Only fetch if we have a workflowId from previous step submissions
    if (updateWorkflowId) {
      const userId = userDetails?.userId || 'NO_0000';

      dispatch(
        fetchWorkflowData({
          workflowId: updateWorkflowId,
          userId: userId,
        })
      );

      dispatch(fetchUserDetailsFormPreviewFields());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, updateWorkflowId]);

  // Fetch documents when workflow data is available
  useEffect(() => {
    if (workflowDocuments && workflowDocuments.length > 0) {
      console.log('📄 Fetching documents:', {
        totalDocuments: workflowDocuments.length,
        documents: workflowDocuments.map((d: any) => ({
          fieldKey: d.fieldKey,
          id: d.id,
          type: d.type,
        })),
      });

      workflowDocuments.forEach((doc: any) => {
        // Only fetch if not already fetched or in progress
        if (
          doc.id &&
          !fetchedDocumentIdsRef.current.has(doc.id) &&
          !fetchedDocuments[doc.id]
        ) {
          fetchedDocumentIdsRef.current.add(doc.id);
          // Use the correct action to fetch preview documents
          dispatch(fetchPreviewDocument(doc.id));
        } else {
          console.log(
            '⏭️ Skipping document (already fetched or in progress):',
            {
              fieldKey: doc.fieldKey,
              id: doc.id,
              alreadyFetched: fetchedDocumentIdsRef.current.has(doc.id),
              inStore: !!fetchedDocuments[doc.id],
            }
          );
        }
      });
    }
  }, [workflowDocuments, dispatch, fetchedDocuments]);

  // Populate form data from workflow payload
  useEffect(() => {
    if (
      workflowData?.payload?.profile_update_initiated?.updateData &&
      Object.keys(workflowData.payload.profile_update_initiated.updateData)
        .length > 0
    ) {
      setFormData(workflowData.payload.profile_update_initiated.updateData);
    }
  }, [workflowData]);

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day}/${month}/${year} ${formattedHours}:${minutes}${ampm}`;
  };

  const memoizedDocumentData = useMemo(() => {
    if (
      !workflowDocuments ||
      workflowDocuments.length === 0 ||
      !fetchedDocuments
    ) {
      console.log('📄 No documents to map:', {
        workflowDocuments: workflowDocuments?.length || 0,
        fetchedDocuments: Object.keys(fetchedDocuments || {}).length,
      });
      return {};
    }

    const documentDataMap: Record<string, DocumentData> = {};

    console.log('📄 Mapping documents:', {
      workflowDocumentsCount: workflowDocuments.length,
      fetchedDocumentsCount: Object.keys(fetchedDocuments).length,
    });

    workflowDocuments.forEach((doc: any) => {
      console.log('📄 Processing document:', {
        fieldKey: doc.fieldKey,
        id: doc.id,
        type: doc.type,
        isFetched: !!fetchedDocuments[doc.id],
      });

      if (doc.fieldKey && doc.id && fetchedDocuments[doc.id]) {
        const docData = fetchedDocuments[doc.id];
        documentDataMap[doc.fieldKey] = {
          id: doc.id,
          fileName: docData.fileName || `document_${doc.fieldKey}`,
          fileSize: docData.fileSize || 0,
          mimeType: docData.mimeType || 'application/octet-stream',
          dataUrl: docData.dataUrl || '',
        };
        console.log('✅ Mapped document:', doc.fieldKey, '→', doc.id);
      }
    });

    console.log('📄 Final document map keys:', Object.keys(documentDataMap));
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

  // eSign handler
  const handleESign = async (place: string, date: string) => {
    const workflowId = updateWorkflowId;
    const userId = 'NO_6149'; // TODO: Get from auth state

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

  // Helper function to evaluate conditional logic
  const evaluateConditionalLogic = useCallback(
    (field: FormField) => {
      if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
        return {
          validationRules: field.validationRules,
          fieldAttributes: field.fieldAttributes,
        };
      }

      // Find the first matching condition
      for (const condition of field.conditionalLogic) {
        const { when, then, else: elseBlock } = condition;
        const fieldValue = formData[when.field];

        // Debug logging
        console.log('🔍 Evaluating Conditional Logic:', {
          fieldName: field.fieldName,
          conditionField: when.field,
          conditionOperator: when.operator,
          expectedValue: when.value,
          actualValue: fieldValue,
        });

        let conditionMet = false;

        // Handle array of expected values
        const expectedValues = Array.isArray(when.value)
          ? when.value
          : [when.value];

        // Check if this is a citizenship field for case-insensitive comparison
        const isCitizenshipField = when.field
          ?.toLowerCase()
          .includes('citizenship');

        switch (when.operator) {
          case 'in':
          case 'equals':
          case 'equal': // Added support for 'equal' operator
            if (isCitizenshipField) {
              const fieldValueLower = String(fieldValue ?? '').toLowerCase();
              const expectedValuesLower = expectedValues.map((v: any) =>
                String(v).toLowerCase()
              );
              conditionMet = expectedValuesLower.includes(fieldValueLower);
            } else {
              conditionMet = expectedValues
                .map(String)
                .includes(String(fieldValue ?? ''));
            }
            break;

          case 'not_in':
          case 'not_equals':
            if (isCitizenshipField) {
              const fieldValueLower = String(fieldValue ?? '').toLowerCase();
              const expectedValuesLower = expectedValues.map((v: any) =>
                String(v).toLowerCase()
              );
              conditionMet = !expectedValuesLower.includes(fieldValueLower);
            } else {
              conditionMet = !expectedValues
                .map(String)
                .includes(String(fieldValue ?? ''));
            }
            break;

          case 'is_not_empty':
            conditionMet =
              fieldValue !== null &&
              fieldValue !== undefined &&
              fieldValue !== '';
            break;

          case 'is_empty':
            conditionMet = !fieldValue || fieldValue === '';
            break;

          case 'contains':
            conditionMet = String(fieldValue || '').includes(
              String(when.value)
            );
            break;

          case 'greater_than':
            conditionMet = Number(fieldValue) > Number(when.value);
            break;

          case 'less_than':
            conditionMet = Number(fieldValue) < Number(when.value);
            break;

          default:
            conditionMet = false;
        }

        // If condition matches and 'then' block exists
        if (conditionMet && then) {
          // Merge base rules with conditional rules
          return {
            validationRules: field.validationRules
              ? { ...field.validationRules, ...then.validationRules }
              : then.validationRules || field.validationRules,
            fieldAttributes: then.fieldAttributes || field.fieldAttributes,
          };
        }

        // If condition doesn't match and 'else' block exists
        if (!conditionMet && elseBlock) {
          console.log('📋 Applying ELSE rules:', {
            validationRules: elseBlock.validationRules,
            fieldAttributes: elseBlock.fieldAttributes,
          });

          // Merge base rules with else rules
          return {
            validationRules: field.validationRules
              ? { ...field.validationRules, ...elseBlock.validationRules }
              : elseBlock.validationRules || field.validationRules,
            fieldAttributes: elseBlock.fieldAttributes || field.fieldAttributes,
          };
        }
      }

      // No conditions met, return original rules
      return {
        validationRules: field.validationRules,
        fieldAttributes: field.fieldAttributes,
      };
    },
    [formData]
  );

  // Memoize document lookup to prevent unnecessary recalculations
  const getDocumentForField = useCallback(
    (field: FormField): DocumentData | undefined => {
      // Comprehensive map of field names to their corresponding document field names
      const documentFieldMapping: Record<string, string> = {
        // Proof of Identity mappings
        noProofOfIdentityNumber: 'noProofOfIdentityNumberFile',
        noProofOfIdentity: 'noProofOfIdentityNumberFile',
        noIdentityNumber: 'noProofOfIdentityNumberFile',
        iauProofOfIdentityNumber1: 'iauProofOfIdentityNumber1File',
        iauProofOfIdentityNumber2: 'iauProofOfIdentityNumber2File',

        // Employee Code mappings
        noEmployCode: 'noEmployCodeFile',
        noEmployeeCode: 'noEmployCodeFile',
        iauEmployCode1: 'iauEmployCode1File',
        iauEmployCode2: 'iauEmployCode2File',

        // Board Resolution mappings
        noBoardResolution: 'noBoardResoluation',
        noBoardResoluation: 'noBoardResoluation',

        // Authorization Letter mappings
        iauAuthorizationLetter1: 'iauAuthorizationLetter1File',
        iauAuthorizationLetter2: 'iauAuthorizationLetter2File',

        // Other document mappings
        addressProof: 'addressProof',
        other: 'other',
        cinFile: 'cinFile',
        llpinFile: 'llpinFile',
        regulatorLicenseNumber: 'regulatorLicenseNumberFile',

        // Application PDFs
        registration_application_pdf: 'registration_application_pdf.pdf',
        updation_application_pdf: 'updation_application_pdf.pdf',
      };

      console.log('🔎 Looking up document for field:', {
        fieldName: field.fieldName,
        fieldFileName: field.fieldFileName,
        fieldType: field.fieldType,
        mappedName: documentFieldMapping[field.fieldName],
        availableDocKeys: Object.keys(existingDocumentData),
      });

      // First try exact match with fieldFileName (if exists)
      if (field.fieldFileName && existingDocumentData[field.fieldFileName]) {
        console.log(
          '✅ Found document via fieldFileName:',
          field.fieldFileName
        );
        return existingDocumentData[field.fieldFileName];
      }

      // Then try the mapped document field name
      const mappedFieldName = documentFieldMapping[field.fieldName];
      if (mappedFieldName && existingDocumentData[mappedFieldName]) {
        console.log('✅ Found document via mapping:', mappedFieldName);
        return existingDocumentData[mappedFieldName];
      }

      // Try direct field name match
      if (existingDocumentData[field.fieldName]) {
        console.log('✅ Found document via fieldName:', field.fieldName);
        return existingDocumentData[field.fieldName];
      }

      // For textfield_with_image fields, try appending "File" suffix
      if (field.fieldType === 'textfield_with_image') {
        const fileFieldName = `${field.fieldName}File`;
        if (existingDocumentData[fileFieldName]) {
          console.log('✅ Found document via File suffix:', fileFieldName);
          return existingDocumentData[fileFieldName];
        }
      }

      // Try case-insensitive partial matching
      const fieldNameLower = field.fieldName.toLowerCase();
      const matchingKey = Object.keys(existingDocumentData).find((key) => {
        const keyLower = key.toLowerCase();
        // Check if the key contains the field name or vice versa
        return (
          keyLower.includes(fieldNameLower) || fieldNameLower.includes(keyLower)
        );
      });

      if (matchingKey) {
        console.log('✅ Found document via partial match:', matchingKey);
        return existingDocumentData[matchingKey];
      }

      // Try with common prefixes removed
      const alternativeKeys = [
        field.fieldName.replace(/^(no|iau|ho|re)/, ''),
        field.fieldName.replace('register', ''),
        field.fieldName.replace('correspondence', ''),
      ].filter(Boolean);

      for (const altKey of alternativeKeys) {
        if (existingDocumentData[altKey]) {
          console.log('✅ Found document via alternative key:', altKey);
          return existingDocumentData[altKey];
        }
        // Try with File suffix
        const altKeyFile = `${altKey}File`;
        if (existingDocumentData[altKeyFile]) {
          console.log(
            '✅ Found document via alternative key + File:',
            altKeyFile
          );
          return existingDocumentData[altKeyFile];
        }
      }

      return undefined;
    },
    [existingDocumentData]
  );

  const renderField = useCallback(
    (field: FormField) => {
      // Conditional rendering for pincodeOther fields
      // Hide the field unless the main pincode field has "other" value
      if (
        field.fieldName.includes('PincodeOther') ||
        field.fieldName.includes('pincodeOther')
      ) {
        // Generic approach: remove 'Other' from field name to get main pincode field name
        // e.g., 'registerPincodeOther' -> 'registerPincode'
        // e.g., 'correspondencePincodeOther' -> 'correspondencePincode'
        const mainPincodeFieldName = field.fieldName
          .replace(/Other/i, '')
          .replace(/other/i, '');

        const mainPincodeValue = formData[mainPincodeFieldName];

        console.log('🔍 PincodeOther Visibility Check:', {
          fieldName: field.fieldName,
          mainPincodeFieldName,
          mainPincodeValue,
          shouldShow:
            String(mainPincodeValue).toLowerCase() === 'other' ||
            String(mainPincodeValue).toLowerCase() === 'others',
        });

        // Only show if main pincode field has "other" or "others" value
        const mainValue = String(mainPincodeValue).toLowerCase();
        if (mainValue !== 'other' && mainValue !== 'others') {
          return null; // Don't render this field
        }
      }

      // Evaluate conditional logic to get the correct validation rules and attributes
      const { validationRules, fieldAttributes } =
        evaluateConditionalLogic(field);

      // Check if field is required (after conditional logic evaluation)
      // Handle both boolean and string "true"/"false" values
      const isRequired =
        validationRules?.required === true ||
        String(validationRules?.required).toLowerCase() === 'true';

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

      // Fallback to empty string
      fieldValue = fieldValue || '';

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
              required={isRequired}
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
          else if (fieldAttributes?.type === 'external_api') {
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
              required={isRequired}
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
              required={isRequired}
              disabled={true}
            />
          );
        case 'date':
          return (
            <LabeledDateUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              value={fieldValue}
              onChange={() => {}}
              required={isRequired}
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

        case 'textfield_with_verify':
          return (
            <LabeledTextFieldWithVerifyUpdate
              key={`${field.id}`}
              label={field.fieldLabel}
              value={fieldValue}
              onChange={() => {}}
              placeholder={field.fieldPlaceholder}
              required={isRequired}
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
              error={undefined}
              helperText={undefined}
              externalVerifyUrl={fieldAttributes?.url}
              onOpenSendOtp={async () => {}}
              onSubmitOtp={async () => {}}
              onOtpVerified={() => {}}
              onVerify={async () => {}}
              disabled={true}
              isPreVerified={!!fieldValue}
            />
          );

        case 'file':
          return <MemoizedFileField field={field} existingDoc={existingDoc} />;

        default:
          return null;
      }
    },
    [
      formData,
      getDocumentForField,
      institutionTypeOptions,
      dropdownData,
      evaluateConditionalLogic,
    ]
  );

  const renderFieldGroup = useCallback(
    (fields: FormField[]) => {
      const sortedFields = [...fields].sort(
        (a, b) => a.fieldOrder - b.fieldOrder
      );

      return (
        <ThreeColumnGrid>
          {sortedFields.map((field) => {
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
              <FieldContainer key={field.id}>
                {renderField(field)}
              </FieldContainer>
            );
          })}
        </ThreeColumnGrid>
      );
    },
    [renderField]
  );

  const renderGroupedFields = useCallback(() => {
    // Get the role from userDetails
    const role = userDetails?.role || '';

    // Extract the number from role (e.g., "IAU_1" -> "1", "IAU_2" -> "2")
    const roleMatch = role.match(/_(\d+)$/);
    const roleNumber = roleMatch ? roleMatch[1] : null;

    console.log('🔍 Role-based accordion filtering:', {
      role,
      roleNumber,
      totalAccordions: Object.keys(groupedFields).length,
    });

    return Object.entries(groupedFields)
      .filter(([groupName, fields], index) => {
        // If role ends with _1, show only first accordion (index 0)
        if (roleNumber === '1') {
          const shouldShow = index === 0;
          console.log(
            `📋 Accordion ${index} (${groupName}):`,
            shouldShow ? 'SHOW' : 'HIDE',
            '(role _1)'
          );
          return shouldShow;
        }

        // If role ends with _2, show only second accordion (index 1)
        if (roleNumber === '2') {
          const shouldShow = index === 1;
          console.log(
            `📋 Accordion ${index} (${groupName}):`,
            shouldShow ? 'SHOW' : 'HIDE',
            '(role _2)'
          );
          return shouldShow;
        }

        // If no role number match, show all accordions
        console.log(
          `📋 Accordion ${index} (${groupName}): SHOW (no role filter)`
        );
        return true;
      })
      .map(([groupName, fields]) => {
        // Override label to "User Profile" instead of showing the original label
        const displayTitle = 'User Profile';

        return (
          <UpdateFormAccordion
            key={groupName}
            title={displayTitle}
            groupKey={groupName}
            defaultExpanded={true}
            showAddButton={true}
          >
            {renderFieldGroup(fields.fields)}
          </UpdateFormAccordion>
        );
      });
  }, [groupedFields, renderFieldGroup, userDetails]);

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
        <div>Loading form preview...</div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingBottom: '16px',
      }}
    >
      <Box sx={styles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
          sx={styles.backButton}
          style={{ textTransform: 'none' }}
        >
          Back
        </Button>
      </Box>
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'Update Profile', href: '/' },
          {
            label: 'Track Status',
            href: '/re/update-trackstatus',
          },
          {
            label: 'RE Details',
          },
        ]}
      />

      <Box
        sx={{
          padding: 2,
          width: '100%',
          backgroundColor: '#F8F9FD',
          borderRadius: 2,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: '#E6EBFF',
          marginY: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            textDecorationLine: 'underline',
            color: '#002CBA',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          onClick={async () => {
            // Find the signed update PDF in documents
            const documents = workflowDocuments;

            let signedDoc = null;

            if (Array.isArray(documents)) {
              signedDoc = documents.find(
                (doc: any) =>
                  doc.fieldKey === 'updation_signed_application_pdf.pdf' ||
                  doc.fieldKey === 'updation_signed_application_pdf' ||
                  doc.type === 'updation_signed_application_pdf' ||
                  doc.fieldKey?.includes('updation_signed') ||
                  doc.type?.includes('updation_signed')
              );
            }

            if (signedDoc && signedDoc.id) {
              try {
                setViewDocument({
                  open: true,
                  loading: true,
                });

                // Fetch the document from the API using the ID
                const API_BASE_URL =
                  process.env.REACT_APP_API_BASE_URL ||
                  'https://dev.ckycindia.dev';
                const BASE_ENV = process.env.REACT_APP_BACKEND_ENV || 're/api';
                const response = await fetch(
                  `${API_BASE_URL}/${BASE_ENV}/v1/registration/fetch-document?id=${signedDoc.id}`
                );

                if (!response.ok) {
                  throw new Error('Failed to fetch document');
                }

                const blob = await response.blob();
                const reader = new FileReader();

                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  // Remove the data:application/pdf;base64, prefix
                  const base64Content = base64String.split(',')[1];

                  setViewDocument({
                    open: true,
                    base64Content: base64Content,
                    fileName: 'Signed Update Profile Application',
                    fileType: 'pdf',
                    loading: false,
                  });
                };

                reader.readAsDataURL(blob);
              } catch (error) {
                console.error('Error fetching document:', error);
                setViewDocument({ open: false });
                setSnackbar({
                  open: true,
                  message: 'Failed to load signed document',
                  severity: 'error',
                });
              }
            } else {
              console.error('Signed document not found or missing ID');
              setSnackbar({
                open: true,
                message: 'Signed document not found',
                severity: 'error',
              });
            }
          }}
        >
          View Signed Document
        </Typography>
      </Box>
      {/* Status Alert Box */}
      <Box
        sx={{
          padding: '12px 16px',
          width: '100%',
          backgroundColor: '#FFFFB9',
          borderRadius: '4px',

          marginY: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* Status Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            marginBottom: 1,
          }}
        >
          {/* Warning Icon Circle */}
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#FFC107',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              <img src={image1} alt="icon" />
            </Typography>
          </Box>

          {/* Status Text */}
          <Typography
            sx={{
              color: '#020202',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {workflowData?.status === 'IN_PROGRESS' ||
            workflowData?.status === 'SUBMITTED'
              ? 'Approval Pending'
              : workflowData?.status || 'Approval Pending'}
          </Typography>
        </Box>

        {/* Submitted Info */}
        <Box sx={{ paddingLeft: '10px' }}>
          <Typography
            sx={{
              color: '#7B7B7B',
              fontSize: '12px',
              fontWeight: 400,
            }}
          >
            Submitted on
          </Typography>
          <Typography
            sx={{
              color: '#020202',
              fontWeight: 600,
              fontSize: '14px',
              marginTop: '2px',
            }}
          >
            {formatSubmittedOn(
              workflowData?.submittedOn ||
                workflowData?.payload?.submission?.submittedAt
            )}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ padding: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Gilroy',
            fontWeight: 600,
            fontSize: '18px',
            color: '#1A1A1A',
          }}
        >
          User Details
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

      {/* Document Viewer Modal */}
      <Modal
        open={viewDocument.open}
        onClose={() => {
          setViewDocument({
            open: false,
            base64Content: undefined,
            fileName: undefined,
            fileType: undefined,
            loading: false,
          });
        }}
        aria-labelledby="document-viewer-modal"
        aria-describedby="modal-to-view-document"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1200px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              {viewDocument.fileName}
            </Typography>
            <IconButton
              onClick={() =>
                setViewDocument({
                  open: false,
                  base64Content: undefined,
                  fileName: undefined,
                  fileType: undefined,
                  loading: false,
                })
              }
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            {viewDocument.loading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px',
                  gap: 2,
                }}
              >
                <CircularProgress />
                <Typography>Loading document...</Typography>
              </Box>
            ) : viewDocument.base64Content ? (
              viewDocument.fileType === 'pdf' ? (
                <iframe
                  src={`data:application/pdf;base64,${viewDocument.base64Content}`}
                  title={viewDocument.fileName}
                  style={{
                    width: '100%',
                    height: 'calc(90vh - 120px)',
                    border: 'none',
                  }}
                />
              ) : (
                <img
                  src={`data:image/jpeg;base64,${viewDocument.base64Content}`}
                  alt={viewDocument.fileName}
                  style={{
                    maxWidth: '100%',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              )
            ) : (
              <Typography>No document to display</Typography>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateProfileTrackStatusUserDetailsView;
