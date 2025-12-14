/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { AppDispatch } from '../../../../redux/store';
import {
  fetchFormPreviewData,
  selectFormPreviewLoading,
  selectFormPreviewError,
  selectFormPreviewConfiguration,
  selectFormPreviewGroupedFields,
  selectFormPreviewFormValues,
} from '../slice/formPreviewSlice';
import {
  fetchWorkflowData,
  fetchWorkflowDocument,
  selectWorkflowLoading,
  selectWorkflowError,
  selectWorkflowPayload,
  selectWorkflowDocuments,
  selectWorkflowFetchedDocuments,
  selectWorkflowAcknowledgementNo,
  selectModifiableFields,
} from '../slice/workflowSlice';
import { WorkflowDocument } from '../types/workflowTypes';
import {
  generateRegistrationPdf,
  fetchGeneratedPdf,
  fetchSignedPdf,
  clearPdfDocument,
  eSignRegistration,
  selectPdfGenerationLoading,
  selectPdfGenerationError,
  selectPdfDocumentId,
  selectPdfDocument,
  selectPdfDocumentLoading,
  selectESignLoading,
  selectSignedDocumentId,
  selectSignedDocument,
  selectAckNo,
} from '../slice/pdfGenerationSlice';
import { RootState } from '../../../../redux/store';
import { FormField } from '../types/formPreviewTypes';
import LabeledTextField from '../CommonComponent/LabeledTextField';
import LabeledCheckbox from '../CommonComponent/LabeledCheckbox';
import {
  LabeledDate,
  LabeledTextFieldWithUpload,
  ReusableButton,
} from '../CommonComponent';
import FormAccordion from '../CommonComponent/FormAccordion';
import PdfPreviewModal from '../CommonComponent/PdfPreviewModal';
import DocumentViewerTrackStatus from '../CommonComponent/DocumentViewer';
import LabeledTextFieldWithVerify from '../CommonComponent/LabeledTextFieldWithVerify';
// import UploadButtonWithIcon from '../CommonComponent/UploadButtonWithIcon';

interface FormPreviewStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onPrevious?: () => void;
  onEdit?: (stepIndex: number) => void;
  formData?: Record<string, unknown>;
  onFinalSubmit?: (ackNo: string) => void;
}

const FormPreviewStep: React.FC<FormPreviewStepProps> = ({
  onSave,
  onEdit,
  onFinalSubmit,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for form preview (CMS fields)
  const formPreviewLoading = useSelector(selectFormPreviewLoading);
  const formPreviewError = useSelector(selectFormPreviewError);
  const configuration = useSelector(selectFormPreviewConfiguration);
  const groupedFields = useSelector(selectFormPreviewGroupedFields);
  const formValues = useSelector(selectFormPreviewFormValues);

  // Redux selectors for workflow data (API data)
  const workflowLoading = useSelector(selectWorkflowLoading);
  const workflowError = useSelector(selectWorkflowError);
  const workflowPayload = useSelector(selectWorkflowPayload);
  const workflowDocuments = useSelector(selectWorkflowDocuments);
  const fetchedDocuments = useSelector(selectWorkflowFetchedDocuments);
  const workflowAcknowledgementNo = useSelector(
    selectWorkflowAcknowledgementNo
  );
  const acknowledgementNoorkflow = useSelector(selectAckNo);

  // PDF generation selectors
  const pdfGenerationLoading = useSelector(selectPdfGenerationLoading);
  const pdfGenerationError = useSelector(selectPdfGenerationError);
  const pdfDocumentId = useSelector(selectPdfDocumentId);
  const pdfDocument = useSelector(selectPdfDocument);
  const pdfDocumentLoading = useSelector(selectPdfDocumentLoading);

  // eSign selectors
  const eSignLoading = useSelector(selectESignLoading);
  const signedDocumentId = useSelector(selectSignedDocumentId);
  const signedDocument = useSelector(selectSignedDocument);
  // ackNo is now handled directly from eSign API response, not from Redux state
  // const ackNo = useSelector(selectAckNo);

  // Auth selectors
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  // Combined loading and error states
  const loading = formPreviewLoading || workflowLoading;
  const error = formPreviewError || workflowError;

  // Modal state
  const [pdfModalOpen, setPdfModalOpen] = React.useState(false);

  // State to track if final submission has been initiated to prevent continuous calls
  const [finalSubmissionInitiated, setFinalSubmissionInitiated] =
    React.useState(false);

  // Fetch form preview data and workflow data on component mount
  useEffect(() => {
    // Fetch CMS form fields for preview structure
    dispatch(fetchFormPreviewData());

    // Fetch workflow data for actual values
    const workflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    if (workflowId && userId) {
      console.log('🔄 Fetching workflow data for FormPreviewStep:', {
        workflowId,
        userId,
      });
      dispatch(fetchWorkflowData({ workflowId, userId }));
    } else {
      console.warn('⚠️ Missing workflowId or userId for workflow data fetch');
    }
  }, [dispatch, authWorkflowId, userDetails]);

  // Fetch documents when workflow documents are available
  useEffect(() => {
    if (workflowDocuments && workflowDocuments.length > 0) {
      console.log(
        '🔄 Fetching workflow documents for preview:',
        workflowDocuments
      );

      workflowDocuments.forEach((doc) => {
        // Only fetch if not already fetched
        if (!fetchedDocuments[doc.id]) {
          console.log(`🔄 Fetching workflow document: ${doc.id} (${doc.type})`);
          dispatch(fetchWorkflowDocument(doc.id));
        } else {
          console.log(`✅ Workflow document already fetched: ${doc.id}`);
        }
      });
    }
  }, [workflowDocuments]);

  // Fetch PDF document when PDF ID is available
  useEffect(() => {
    if (pdfDocumentId && !pdfDocument && !pdfDocumentLoading) {
      console.log('🔄 Fetching generated PDF document:', pdfDocumentId);
      dispatch(fetchGeneratedPdf(pdfDocumentId));
    }
  }, [pdfDocumentId, pdfDocument, pdfDocumentLoading, dispatch]);

  // Fetch signed document when signed document ID is available
  useEffect(() => {
    if (signedDocumentId && !signedDocument && !pdfDocumentLoading) {
      console.log('🔄 Fetching signed PDF document:', signedDocumentId);
      dispatch(fetchSignedPdf(signedDocumentId));
    }
  }, [signedDocumentId, signedDocument, pdfDocumentLoading, dispatch]);

  // Check if acknowledgementNo already exists from fetchWorkflowData
  // useEffect(() => {
  //   if (
  //     workflowAcknowledgementNo &&
  //     onFinalSubmit &&
  //     !finalSubmissionInitiated
  //   ) {
  //     console.log(
  //       '✅ Found existing acknowledgementNo from fetchWorkflowData:',
  //       workflowAcknowledgementNo
  //     );
  //     console.log(
  //       '🔄 Calling onFinalSubmit with existing acknowledgementNo...'
  //     );
  //     setFinalSubmissionInitiated(true);
  //     setPdfModalOpen(false);
  //     onFinalSubmit(workflowAcknowledgementNo);
  //   }
  // }, [workflowAcknowledgementNo, onFinalSubmit, finalSubmissionInitiated]);

  // // Cleanup effect to reset state on unmount
  // useEffect(() => {
  //   return () => {
  //     // Reset final submission state on component unmount
  //     setFinalSubmissionInitiated(false);
  //   };
  // }, []);

  const modifiableFields = useSelector(selectModifiableFields);

  // Check if a field is modifiable
  const isModifiableField = (fieldName: string): boolean => {
    const isModifiable = Object.values(modifiableFields).some((fields) => {
      if (Array.isArray(fields)) {
        const found = fields.includes(fieldName);
        return found;
      }
      return false;
    });

    return isModifiable;
  };
  const handleSubmit = async () => {
    console.log(
      '🔄 Form Preview Step - Starting PDF generation process:',
      formValues
    );

    // Get workflow and user IDs
    const workflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    if (!workflowId || !userId) {
      console.error('❌ Missing workflowId or userId for PDF generation');
      return;
    }

    try {
      // Clear any existing PDF document and show loader immediately
      dispatch(clearPdfDocument());

      console.log('🔄 Generating registration PDF...', { workflowId, userId });

      // Generate PDF (this will trigger loading state in Redux)
      await dispatch(generateRegistrationPdf({ workflowId, userId })).unwrap();

      console.log('✅ PDF generated successfully, opening modal...');

      // Open PDF preview modal
      setPdfModalOpen(true);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
    }
  };

  const handleESign = async (place: string, date: string) => {
    console.log('🔄 eSign initiated:', { place, date });

    // Get workflow and user IDs
    const workflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    if (!workflowId || !userId) {
      console.error('❌ Missing workflowId or userId for eSign');
      return;
    }

    try {
      // Call eSign API
      console.log('🔄 Calling eSign API...', {
        workflowId,
        userId,
        place,
        date,
      });
      const eSignResponse = await dispatch(
        eSignRegistration({
          workflowId,
          userId,
          declaration: true,
          declarationPlace: place,
          declarationDate: date,
        })
      ).unwrap();

      console.log('✅ eSign API call successful');

      // The modal will automatically update to show signed document
      // when signedDocumentId is set and signedDocument is fetched
      console.log('🔄 eSign successful, signedDocumentId will be set by Redux');

      // Call onFinalSubmit only if no existing acknowledgementNo and eSign response has ackNo
      if (
        onFinalSubmit &&
        !workflowAcknowledgementNo &&
        !finalSubmissionInitiated &&
        eSignResponse?.data?.ackNo
      ) {
        const responseAckNo = eSignResponse.data.ackNo;
        console.log(
          '🔄 Calling onFinalSubmit after successful eSign with ackNo:',
          responseAckNo
        );
        setFinalSubmissionInitiated(true);
        // setPdfModalOpen(false);
        // onFinalSubmit(responseAckNo);
      } else if (workflowAcknowledgementNo) {
        console.log(
          'ℹ️ Existing acknowledgementNo found, skipping onFinalSubmit from eSign response'
        );
      } else if (finalSubmissionInitiated) {
        console.log(
          'ℹ️ Final submission already initiated, skipping onFinalSubmit from eSign response'
        );
      }
    } catch (error) {
      console.error('❌ Error during eSign:', error);
    }
  };

  const handleModalClose = () => {
    setPdfModalOpen(false);
    // Reset final submission state when modal is closed manually
    setFinalSubmissionInitiated(false);
  };

  const handleBackToHome = () => {
    console.log(
      '🔄 Navigating back to homeacknowledgementNoorkflow===',
      acknowledgementNoorkflow
    );
    console.log('🔄 Navigating back to home', workflowAcknowledgementNo);
    console.log('🔄 onSave', onSave);
    console.log('🔄 onFinalSubmit', onFinalSubmit);
    setPdfModalOpen(false);

    // Call the original onSave callback with completion status
    if (onSave) {
      onSave({
        ...formValues,
        registrationCompleted: true,
        signedDocumentId: signedDocumentId,
        acknowledgementNo: workflowAcknowledgementNo,
      });
    }

    const acknowledgementNumber =
      workflowAcknowledgementNo || acknowledgementNoorkflow;
    if (onFinalSubmit && acknowledgementNumber) {
      onFinalSubmit(acknowledgementNumber);
    }
  };

  // Get document for a field based on field name
  const getFieldDocument = (
    fieldName: string
  ):
    | {
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        dataUrl: string;
      }
    | undefined => {
    if (!workflowDocuments || workflowDocuments.length === 0) return undefined;

    // Find document that matches the field name
    const document = workflowDocuments.find((doc: WorkflowDocument) => {
      // Try exact match first
      if (doc.fieldKey === fieldName) return true;

      // Try with common variations
      const variations = [
        fieldName,
        `${fieldName}_file`,
        `${fieldName}File`,
        fieldName.replace(/([A-Z])/g, '_$1').toLowerCase(),
        fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      ];

      return variations.some(
        (variation) =>
          doc.fieldKey === variation ||
          doc.fieldKey.toLowerCase() === variation.toLowerCase()
      );
    });

    if (document && fetchedDocuments[document.id]) {
      const fetchedDoc = fetchedDocuments[document.id];
      // Return only the properties expected by the component interface
      return {
        id: fetchedDoc.id,
        fileName: fetchedDoc.fileName,
        fileSize: fetchedDoc.fileSize,
        mimeType: fetchedDoc.mimeType,
        dataUrl: fetchedDoc.dataUrl,
      };
    }

    return undefined;
  };

  // Get field value from workflow payload based on field name
  const getFieldValue = (fieldName: string) => {
    if (!workflowPayload) {
      console.log(`⚠️ No workflowPayload for field: ${fieldName}`);
      return '';
    }

    // Helper function to convert space-separated names to camelCase
    const toCamelCase = (str: string): string => {
      return str
        .toLowerCase()
        .split(' ')
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
    };

    // Convert field name with spaces to camelCase first
    const camelCaseFieldName = fieldName.includes(' ')
      ? toCamelCase(fieldName)
      : fieldName;

    // Create field name variations to try
    const fieldVariations = [
      fieldName,
      camelCaseFieldName,
      // Remove "Address" from field name (e.g., correspondenceAddressLine1 -> correspondenceLine1)
      fieldName.replace('Address', ''),
      camelCaseFieldName.replace('Address', ''),
      // Remove "address" (lowercase)
      fieldName.replace('address', ''),
      camelCaseFieldName.replace('address', ''),
      // Add "Address" if not present (e.g., correspondenceLine1 -> correspondenceAddressLine1)
      fieldName.includes('Line') && !fieldName.includes('Address')
        ? fieldName.replace('Line', 'AddressLine')
        : null,
      // Replace registerAddress with register (e.g., registerAddressLine1 -> registerLine1)
      fieldName.replace('registerAddress', 'register'),
      camelCaseFieldName.replace('registerAddress', 'register'),
      // Replace correspondenceAddress with correspondence
      fieldName.replace('correspondenceAddress', 'correspondence'),
      camelCaseFieldName.replace('correspondenceAddress', 'correspondence'),
      // For "addressLine" fields, try "registerLine" (e.g., addressLine1 -> registerLine1)
      fieldName.startsWith('address') && fieldName.includes('Line')
        ? fieldName.replace('address', 'register')
        : null,
      camelCaseFieldName.startsWith('address') &&
      camelCaseFieldName.includes('Line')
        ? camelCaseFieldName.replace('address', 'register')
        : null,
      // Remove "Number" suffix (e.g., hoiMobileNumber -> hoiMobile, mobileNumber -> mobile)
      fieldName.endsWith('Number') ? fieldName.replace(/Number$/, '') : null,
      camelCaseFieldName.endsWith('Number')
        ? camelCaseFieldName.replace(/Number$/, '')
        : null,
      // Fix "Numbmer" typo to "Number" (iauMobileNumbmer1 -> iauMobileNumber1)
      fieldName.includes('Numbmer')
        ? fieldName.replace(/Numbmer/g, 'Number')
        : null,
      camelCaseFieldName.includes('Numbmer')
        ? camelCaseFieldName.replace(/Numbmer/g, 'Number')
        : null,
      // Also try removing "Number" suffix after fixing typo (hoiMobileNumber -> hoiMobile)
      fieldName.includes('Numbmer')
        ? fieldName.replace(/Numbmer/g, '').replace(/Number$/, '')
        : null,
      camelCaseFieldName.includes('Numbmer')
        ? camelCaseFieldName.replace(/Numbmer/g, '').replace(/Number$/, '')
        : null,
      // Fix "Nobile" typo to "Mobile" (noNobileNumber -> noMobileNumber)
      fieldName.includes('Nobile')
        ? fieldName.replace('Nobile', 'Mobile')
        : null,
      camelCaseFieldName.includes('Nobile')
        ? camelCaseFieldName.replace('Nobile', 'Mobile')
        : null,
      // Try adding "hoi" prefix for HOI fields (e.g., mobileNumber -> hoiMobile, mobile -> hoiMobile)
      !camelCaseFieldName.startsWith('hoi') &&
      !camelCaseFieldName.startsWith('iau') &&
      !camelCaseFieldName.startsWith('nod')
        ? 'hoi' +
          camelCaseFieldName.charAt(0).toUpperCase() +
          camelCaseFieldName.slice(1).replace(/Number$/, '')
        : null,
      // Try adding "iau" prefix for IAU fields
      !camelCaseFieldName.startsWith('hoi') &&
      !camelCaseFieldName.startsWith('iau') &&
      !camelCaseFieldName.startsWith('nod')
        ? 'iau' +
          camelCaseFieldName.charAt(0).toUpperCase() +
          camelCaseFieldName.slice(1).replace(/Number$/, '')
        : null,
      // Try adding "nod" prefix for Nodal Officer fields
      !camelCaseFieldName.startsWith('hoi') &&
      !camelCaseFieldName.startsWith('iau') &&
      !camelCaseFieldName.startsWith('nod')
        ? 'nod' +
          camelCaseFieldName.charAt(0).toUpperCase() +
          camelCaseFieldName.slice(1).replace(/Number$/, '')
        : null,
      // Try camelCase to underscore variations
      fieldName.replace(/([A-Z])/g, '_$1').toLowerCase(),
      camelCaseFieldName.replace(/([A-Z])/g, '_$1').toLowerCase(),
      // Try removing underscores
      fieldName.replace(/_/g, ''),
      camelCaseFieldName.replace(/_/g, ''),
    ].filter((v, i, arr) => v && arr.indexOf(v) === i) as string[]; // Remove duplicates

    // Search through all sections of the workflow payload
    for (const sectionKey of Object.keys(workflowPayload)) {
      const section =
        workflowPayload[sectionKey as keyof typeof workflowPayload];
      if (section && typeof section === 'object') {
        // Try all field name variations
        for (const variation of fieldVariations) {
          if (variation in section) {
            const value = (section as Record<string, unknown>)[variation] || '';
            return value;
          }
        }
      }
    }

    // If not found in workflow payload, check formValues directly with variations
    if (formValues) {
      for (const variation of fieldVariations) {
        if (variation in formValues) {
          const value = formValues[variation];
          return value;
        }
      }
    }

    return '';
  };

  // Render individual field in read-only mode using the same components as DynamicExpandCollapseForm
  const renderPreviewField = (field: FormField) => {
    // Get value from workflow payload first, then formValues
    let value = getFieldValue(field.fieldName);

    // If still empty, try formValues directly as final fallback
    if (!value && formValues) {
      value = formValues[field.fieldName] || '';
    }

    console.log(`🔍 Rendering field ${field.fieldName}:`, {
      fieldLabel: field.fieldLabel,
      value,
      hasValue: !!value,
    });

    // Check if this is the pincode "other" field
    const isPincodeOtherField =
      field.fieldName === 'registerPincodeOther' ||
      field.fieldName === 'correspondencePincodeOther' ||
      field.fieldName === 'iauPincodeOther1' ||
      field.fieldName === 'iauPincodeOther2';

    // Get the corresponding pincode value to check if "Other" is selected
    let pincodeValue = '';
    if (field.fieldName === 'registerPincodeOther') {
      pincodeValue = (getFieldValue('register_pincode') ||
        getFieldValue('registerPincode')) as string;
    } else if (field.fieldName === 'correspondencePincodeOther') {
      pincodeValue = (getFieldValue('correspondence_pincode') ||
        getFieldValue('correspondencePincode')) as string;
    } else if (field.fieldName === 'iauPincodeOther1') {
      pincodeValue = getFieldValue('iauPincode1') as string;
    } else if (field.fieldName === 'iauPincodeOther2') {
      pincodeValue = getFieldValue('iauPincode2') as string;
    }

    const isPincodeOtherSelected =
      isPincodeOtherField &&
      (pincodeValue?.toString().toLowerCase() === 'other' ||
        pincodeValue?.toString().toLowerCase() === 'others');

    // Hide "Pincode (others)" fields if they have no value
    if (isPincodeOtherField && (!value || value === '')) {
      console.log(`🚫 Hiding empty pincode other field: ${field.fieldName}`);
      return null;
    }

    // Get regulator and constitution values for conditional validation
    const regulatorValue = getFieldValue('regulator') as string;
    const constitutionValue = getFieldValue('constitution') as string;

    // Determine if field is required - special handling for GSTIN, Pincode Other, Regulator License, and LLPIN
    let isRequired =
      field.validationRules?.required || field.isRequired || false;

    // GSTIN conditional logic based on regulator
    if (field.fieldName === 'gstin') {
      // GSTIN is required when regulator exists and is NOT IFSCA
      isRequired = regulatorValue ? regulatorValue !== 'IFSCA' : false;
    }

    // Pincode Other field conditional logic
    if (isPincodeOtherField && isPincodeOtherSelected) {
      // Make pincode other field required when "Other" is selected
      isRequired = true;
    }

    // Regulator License/Certificate is always mandatory
    if (field.fieldName === 'regulatorLicenseNumber') {
      isRequired = true;
    }

    // LLPIN conditional logic based on constitution
    if (field.fieldName === 'llpin') {
      // LLPIN is required when constitution is "Limited Liability Partnership"
      isRequired = constitutionValue === 'Limited Liability Partnership';
    }

    // CIN conditional logic based on constitution
    if (field.fieldName === 'cin') {
      // CIN is required for specific constitution types
      const cinRequiredConstitutions = [
        'Private Limited Company',
        'Public Limited Company',
        'Public Sector Banks',
        'Section 8 Companies (Companies Act, 2013)',
      ];
      isRequired = cinRequiredConstitutions.includes(constitutionValue);
    }
    const isModifiable = isModifiableField(field.fieldName);
    // Common field styles
    const fieldSx = {
      '& .MuiFormLabel-root, & .MuiFormControlLabel-label': {
        backgroundColor: isModifiable ? '#FF8C00' : 'transparent',
        padding: '0 4px',
        borderRadius: '4px',
        marginLeft: field.fieldType === 'checkbox' ? '-4px' : '0',
        '&.Mui-focused': {
          backgroundColor: isModifiable ? '#FF8C00' : 'transparent',
        },
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: isModifiable ? '#FF8C00' : undefined,
      },
    };
    switch (field.fieldType) {
      case 'textfield':
        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={() => {}} // No-op for preview
            placeholder={field.fieldPlaceholder || ''}
            required={isRequired}
            disabled={true} // Always disabled in preview
            error={false}
            helperText={field.helpText || undefined}
          />
        );

      case 'dropdown': {
        // For preview, display the workflow value directly as a text field
        // instead of searching through dropdown options
        let safeValue = value;
        if (field.fieldName.includes('CountryCode')) {
          // Find the country name from field options based on the code
          const countryOption = field.fieldOptions?.find(
            (option) => option.code === value
          );
          if (countryOption && countryOption.name) {
            safeValue = `${countryOption.name} (${value})`;
          } else {
            safeValue = `(${value})`;
          }
        }
        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            value={safeValue as string}
            onChange={() => {}} // No-op for preview
            placeholder={field.fieldPlaceholder || ''}
            required={isRequired}
            disabled={true} // Always disabled in preview
            error={false}
            helperText={field.helpText || undefined}
          />
        );
      }

      case 'checkbox': {
        // Handle both boolean and string values ("true"/"false")
        let isChecked = false;
        if (typeof value === 'boolean') {
          isChecked = value;
        } else if (typeof value === 'string') {
          isChecked = value.toLowerCase() === 'true';
        }
        return (
          <LabeledCheckbox
            key={field.id}
            label={field.fieldLabel}
            checked={isChecked}
            onChange={() => {}} // No-op for preview
            required={isRequired}
            disabled={true} // Always disabled in preview
          />
        );
      }

      case 'date':
        return (
          <LabeledDate
            key={field.id}
            label={field.fieldLabel}
            value={(value as string) || null}
            onChange={() => {}} // No-op for preview
            required={isRequired}
            error={false}
            helperText={undefined}
            disabled={true} // Always disabled in preview
          />
        );

      case 'textfield_with_image': {
        const fieldDocument = getFieldDocument(field.fieldName);
        return (
          <LabeledTextFieldWithUpload
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={() => {}}
            onUpload={() => {}}
            disabled={true}
            existingDocument={fieldDocument}
            showExistingDocument={!!fieldDocument}
            sx={fieldSx}
            placeholder={field.fieldPlaceholder || ''}
            required={isRequired}
            error={false}
            helperText={undefined}
            trackStatusShow={true}
          />
          // <LabeledTextFieldWithUpload
          //   key={field.id}
          //   label={field.fieldLabel}
          //   value={value as string}
          //   onChange={() => {}} // No-op for preview
          //   onUpload={() => {}} // No-op for preview
          //   placeholder={field.fieldPlaceholder || ''}
          //   required={isRequired}
          //   error={false}
          //   helperText={undefined}
          //   accept={
          //     (
          //       field.validationRules?.validationFile?.imageFormat ||
          //       field.validationRules?.imageFormat
          //     )
          //       ?.map((format) => `.${format}`)
          //       .join(',') || '.jpg,.jpeg,.png'
          //   }
          //   validationRules={field.validationRules || undefined}
          //   onValidationError={() => {}} // No-op for preview
          //   disabled={true} // Always disabled in preview
          //   existingDocument={fieldDocument}
          //   showExistingDocument={!!fieldDocument}
          // />
        );
      }

      case 'textfield_with_verify':
        return (
          <LabeledTextFieldWithVerify
            key={field.id}
            label={field.fieldLabel}
            value={value as string}
            onChange={() => {}} // No-op for preview
            placeholder={field.fieldPlaceholder || ''}
            required={
              typeof value === 'string' && value.length === 14
                ? true
                : isRequired
            }
            error={false}
            helperText={undefined}
            disabled={true} // Always disabled in preview
            onOpenSendOtp={async () => false} // No-op for preview
            onSubmitOtp={async () => false} // No-op for preview
            onOtpVerified={() => {}} // No-op for preview
            onVerify={async () => {}} // No-op for preview
            verifyIcon={true}
          />
        );

      case 'file': {
        const fieldDocument = getFieldDocument(field.fieldName);
        if (!fieldDocument) return null;

        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 'medium',
                backgroundColor: isModifiableField(field.fieldName)
                  ? '#FF8C00'
                  : 'transparent',
                p: 0,
                borderRadius: 1,
                display: 'inline-block',
              }}
            >
              {field.fieldLabel}
              {isRequired && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <DocumentViewerTrackStatus document={fieldDocument} />
          </Box>
        );
      }

      default:
        return null;
    }
  };

  // Helper function to get step index for edit navigation
  const getStepIndex = (groupName: string) => {
    console.log(groupName);

    // Get all group names from the API data and create dynamic mapping
    const groupNames = Object.keys(groupedFields);
    const name = groupName.toLowerCase();
    if (name.includes('entity') || name.includes('profile')) {
      return 0; // Entity Profile step
    } else if (name.includes('address')) {
      return 1; // Address Details step (both registered and correspondence)
    } else if (
      name.includes('hoi') ||
      name.includes('head') ||
      name.includes('institution')
    ) {
      return 2; // Head of Institution step
    } else if (name.includes('nodal') || name.includes('officer')) {
      return 3; // Nodal Officer step
    } else if (name.includes('admin') || name.includes('user')) {
      return 4; // Admin User Details step (both admin_user_1 and admin_user_2)
    }

    // Fallback: try to find index based on group order in the API response
    const groupIndex = groupNames.indexOf(groupName);
    return groupIndex >= 0 ? Math.min(groupIndex, 4) : 0;
  };

  // Render preview section (accordion)
  const renderPreviewSection = (
    groupName: string,
    groupData: { label: string; fields: FormField[] }
  ) => {
    const sortedFields = [...groupData.fields].sort(
      (a, b) => a.fieldOrder - b.fieldOrder
    );

    return (
      <FormAccordion
        key={groupName}
        title={
          groupData.label === 'Admin One'
            ? 'Institutional Admin User 1 Details'
            : groupData.label === 'Admin Two'
              ? 'Institutional Admin User 2 Details'
              : groupData.label == 'Nodal'
                ? 'Nodal Officer Details'
                : groupData.label == 'Hoi'
                  ? 'Head of Institution Details'
                  : groupData.label == 'Address Details'
                    ? 'Registered Address'
                    : groupData.label
        }
        groupKey={groupName}
        defaultExpanded={true}
        showEdit={true}
        onEdit={() => {
          console.log('');
          onEdit?.(getStepIndex(groupName));
        }}
      >
        <Grid container spacing={2}>
          {sortedFields.map((field) => {
            // Check if field should be rendered (handles pincode other fields)
            const fieldContent = renderPreviewField(field);

            // Skip rendering Grid wrapper if field content is null
            if (!fieldContent) {
              return null;
            }

            // Checkbox fields take full width (single row), other fields are 3 per row
            const gridSize =
              field.fieldType === 'checkbox'
                ? { xs: 12 } // Full width for checkboxes
                : { xs: 12, sm: 6, md: 4 }; // Third width for other fields

            return (
              <>
                {field.fieldLabel == 'Date of Authorization' ? (
                  <Grid size={gridSize} key={field.id}></Grid>
                ) : (
                  ''
                )}
                <Grid size={gridSize} key={field.id}>
                  {fieldContent}
                </Grid>
              </>
            );
          })}
        </Grid>
      </FormAccordion>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          p: 5,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2, fontFamily: 'Gilroy' }}>
          Loading form preview data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography sx={{ fontFamily: 'Gilroy' }}>{error}</Typography>
        </Alert>
        <Button
          variant="outlined"
          onClick={() => dispatch(fetchFormPreviewData())}
          sx={{ fontFamily: 'Gilroy' }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // No data state
  if (!configuration) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography sx={{ fontFamily: 'Gilroy' }}>
            No form configuration found.
          </Typography>
        </Alert>
      </Box>
    );
  }

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
        {configuration.formSubtitle ?? ''}
      </Typography>
      {/* Render form sections based on configuration */}
      {configuration.formSettings?.formGroup ? (
        // Render grouped fields
        Object.entries(groupedFields).map(([groupName, groupData]) =>
          renderPreviewSection(
            groupName,
            groupData as { label: string; fields: FormField[] }
          )
        )
      ) : (
        // Render non-grouped fields (fallback)
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography sx={{ fontFamily: 'Gilroy' }}>
            Form grouping is disabled. Individual field preview not implemented
            for this configuration.
          </Typography>
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <ReusableButton
          label="Submit"
          onClick={handleSubmit}
          size="large"
          loading={pdfGenerationLoading}
          disabled={pdfGenerationLoading}
        />
      </Box>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        open={pdfModalOpen}
        onClose={handleModalClose}
        pdfDocument={signedDocument || pdfDocument}
        loading={pdfDocumentLoading || eSignLoading}
        error={pdfGenerationError}
        onESign={handleESign}
        onBackToHome={handleBackToHome}
        isSignedDocument={!!signedDocument}
      />
    </Box>
  );
};

export default FormPreviewStep;
