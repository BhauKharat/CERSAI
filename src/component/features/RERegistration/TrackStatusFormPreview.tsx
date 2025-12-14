/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { AppDispatch } from '../../../redux/store';
import {
  fetchTrackStatusFields,
  selectTrackStatusLoading,
  selectTrackStatusError,
  selectTrackStatusConfiguration,
  selectTrackStatusGroupedFields,
  selectTrackStatusFormValues,
  selectWorkflowData,
} from './slice/trackStatusFormSlice';
import {
  fetchWorkflowData,
  fetchWorkflowDocument,
  selectWorkflowLoading,
  selectWorkflowError,
  selectWorkflowPayload,
  selectWorkflowDocuments,
  selectWorkflowFetchedDocuments,
  selectModifiableFields,
} from './slice/workflowSlice';
import { WorkflowDocument } from './types/workflowTypes';
import {
  // generateRegistrationPdf,
  fetchGeneratedPdf,
  fetchSignedPdf,
  // clearPdfDocument,
  // eSignRegistration,
  selectPdfGenerationLoading,
  // selectPdfGenerationError,
  selectPdfDocumentId,
  selectPdfDocument,
  selectPdfDocumentLoading,
  // selectESignLoading,
  selectSignedDocumentId,
  selectSignedDocument,
} from './slice/pdfGenerationSlice';
import { RootState } from '../../../redux/store';
import { resetAuth } from '../Authenticate/slice/authSlice';
import { resetForm } from './slice/formSlice';
import { clearConfiguration } from './slice/registrationConfigSlice';
// import { FormField } from './types/formPreviewTypes';
import LabeledTextField from './CommonComponent/LabeledTextField';
import LabeledCheckbox from './CommonComponent/LabeledCheckbox';
import {
  LabeledDate,
  LabeledTextFieldWithUpload,
  ReusableButton,
} from './CommonComponent';
import FormAccordion from './CommonComponent/FormAccordion';
import LabeledTextFieldWithVerify from './CommonComponent/LabeledTextFieldWithVerify';
// import PdfPreviewModal from './CommonComponent/PdfPreviewModal';
// import DocumentViewerTrackStatus from './CommonComponent/DocumentViewer';
import UploadButtonWithIcon from './CommonComponent/UploadButtonWithIcon';
import { TrackStatusFormField } from './types/trackStatusFormTypes';
import { useModifiableFields } from 'hooks/useModifiableFields';

interface TrackStatusStepProps {
  onSave?: (formData: Record<string, unknown>) => void;
  onPrevious?: () => void;
  onEdit?: (stepIndex: number) => void;
  formData?: Record<string, unknown>;
}

interface CountryFieldOption {
  code?: string;
  name?: string;
  isocode?: string;
}

// We'll use modifiableFields from the Redux store instead of hardcoded values

const TrackStatusFormPreview: React.FC<TrackStatusStepProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux selectors for form preview (CMS fields)
  const formPreviewLoading = useSelector(selectTrackStatusLoading);
  const formPreviewError = useSelector(selectTrackStatusError);
  const configuration = useSelector(selectTrackStatusConfiguration);
  const groupedFields = useSelector(selectTrackStatusGroupedFields);
  const formValues = useSelector(selectTrackStatusFormValues);

  // Redux selectors for workflow data (API data)
  const workflowLoading = useSelector(selectWorkflowLoading);
  const workflowError = useSelector(selectWorkflowError);
  const workflowPayload = useSelector(selectWorkflowPayload);
  const workflowDocuments = useSelector(selectWorkflowDocuments);
  const fetchedDocuments = useSelector(selectWorkflowFetchedDocuments);
  const workflowEntireData = useSelector(selectWorkflowData);

  const statusApprover1 = (
    workflowPayload as {
      approvalWorkflow?: { approvals?: Array<{ action?: string }> };
    } | null
  )?.approvalWorkflow?.approvals?.[0]?.action;

  const SubmittedForm = workflowEntireData?.status;

  const statusApprover2 = (
    workflowPayload as {
      approvalWorkflow?: { approvals?: Array<{ action?: string }> };
    } | null
  )?.approvalWorkflow?.approvals?.[1]?.action;

  const IsDataModified = workflowPayload?.modifiableFields ? true : false;

  // PDF generation selectors
  const pdfGenerationLoading = useSelector(selectPdfGenerationLoading);
  // const pdfGenerationError = useSelector(selectPdfGenerationError);
  const pdfDocumentId = useSelector(selectPdfDocumentId);
  const pdfDocument = useSelector(selectPdfDocument);
  const pdfDocumentLoading = useSelector(selectPdfDocumentLoading);

  // eSign selectors
  // const eSignLoading = useSelector(selectESignLoading);
  const signedDocumentId = useSelector(selectSignedDocumentId);
  const signedDocument = useSelector(selectSignedDocument);

  // Auth selectors
  const authWorkflowId = useSelector(
    (state: RootState) => state.auth.workflowId
  );
  const userDetails = useSelector((state: RootState) => state.auth.userDetails);

  // Combined loading and error states
  const loading = formPreviewLoading || workflowLoading;
  const error = formPreviewError || workflowError;

  const { isModifiableField } = useModifiableFields();

  // Modal state
  // const [pdfModalOpen, setPdfModalOpen] = React.useState(false);

  // Fetch form preview data and workflow data on component mount
  useEffect(() => {
    // Fetch CMS form fields for preview structure
    dispatch(fetchTrackStatusFields());

    // Fetch workflow data for actual values
    const workflowId = authWorkflowId || userDetails?.workflowId;
    const userId = userDetails?.userId || userDetails?.id;

    if (workflowId && userId) {
      dispatch(fetchWorkflowData({ workflowId, userId }));
    } else {
      console.warn('⚠️ Missing workflowId or userId for workflow data fetch');
    }
  }, [dispatch, authWorkflowId, userDetails]);

  // Fetch documents when workflow documents are available
  useEffect(() => {
    if (workflowDocuments && workflowDocuments.length > 0) {
      workflowDocuments.forEach((doc: WorkflowDocument) => {
        // Only fetch if not already fetched
        if (!fetchedDocuments[doc.id]) {
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
      dispatch(fetchGeneratedPdf(pdfDocumentId));
    }
  }, [pdfDocumentId, pdfDocument, pdfDocumentLoading, dispatch]);

  // Fetch signed document when signed document ID is available
  useEffect(() => {
    if (signedDocumentId && !signedDocument && !pdfDocumentLoading) {
      dispatch(fetchSignedPdf(signedDocumentId));
    }
  }, [signedDocumentId, signedDocument, pdfDocumentLoading, dispatch]);

  const handleSubmit = async () => {
    try {
      // Clear all Redux state
      dispatch(resetAuth()); // Clear authentication state
      dispatch(resetForm()); // Clear form state
      dispatch(clearConfiguration()); // Clear registration configuration

      // Clear any local storage or session storage
      localStorage.clear();
      sessionStorage.clear();

      // Navigate to login screen
      navigate('/re-signup?tab=1'); // tab=0 for login tab
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still navigate even if there's an error
      navigate('/re-signup?tab=1');
    }
  };

  const handleEditStatus = () => {
    try {
      // Navigate to login screen
      navigate('/modify-entity-profile'); // tab=0 for login tab
    } catch (error) {
      // Still navigate even if there's an error
      navigate('/modify-entity-profile');
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

      // Create comprehensive field name variations
      const variations = [
        fieldName,
        `${fieldName}_file`,
        `${fieldName}File`,
        fieldName.replace(/([A-Z])/g, '_$1').toLowerCase(),
        fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
        // Add prefix variations (nod, hoi, iau)
        `nod${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`,
        `hoi${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`,
        `iau${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`,
        // Add prefix variations with File suffix
        `nod${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}File`,
        `hoi${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}File`,
        `iau${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}File`,
        // Add prefix variations with _file suffix
        `nod${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}_file`,
        `hoi${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}_file`,
        `iau${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}_file`,
        // Handle numeric suffixes (e.g., iauProofOfIdentityNumber1 -> iauProofOfIdentityNumber1File)
        ...(fieldName.match(/\d+$/)
          ? [`${fieldName}File`, `${fieldName}_file`]
          : []),
        // Handle underscore variations in field names (e.g., iauProofOfIdentityNumber1 -> iauProofOf_identityNumber1File)
        fieldName
          .replace(/([A-Z][a-z]+)([A-Z])/g, '$1_$2')
          .replace(/File$/, '') + 'File',
        fieldName
          .replace(/([A-Z][a-z]+)([A-Z])/g, '$1_$2')
          .replace(/File$/, '') + '_file',
        // For ProofOfIdentity specifically: iauProofOfIdentityNumber1 -> iauProofOf_identityNumber1File
        ...(fieldName.includes('ProofOfIdentity')
          ? [
              fieldName.replace('ProofOfIdentity', 'ProofOf_identity') + 'File',
              fieldName.replace('ProofOfIdentity', 'ProofOf_identity') +
                '_file',
            ]
          : []),
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
    if (!workflowPayload) return '';

    // Search through all sections of the workflow payload
    for (const sectionKey of Object.keys(workflowPayload)) {
      const section =
        workflowPayload[sectionKey as keyof typeof workflowPayload];
      if (section && typeof section === 'object' && fieldName in section) {
        return (section as Record<string, unknown>)[fieldName] || '';
      }
    }

    return '';
  };

  // Form state for editable fields
  const [localFormValues, setLocalFormValues] = useState<
    Record<string, unknown>
  >({});

  // Initialize form values when workflow data is loaded
  useEffect(() => {
    if (workflowPayload) {
      const initialValues: Record<string, unknown> = {};

      // Flatten the workflow payload into a single object
      Object.values(workflowPayload).forEach((section) => {
        if (section && typeof section === 'object') {
          Object.entries(section as Record<string, unknown>).forEach(
            ([key, value]) => {
              initialValues[key] = value;
            }
          );
        }
      });

      setLocalFormValues(initialValues);
    }
  }, [workflowPayload]);

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: unknown) => {
    setLocalFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // put this small helper near the component or above renderPreviewField
  const pick = <T, K extends keyof T>(
    obj: T | undefined,
    key: K
  ): T[K] | undefined => (obj ? obj[key] : undefined);

  const resolveValue = (
    fieldName: string,
    getFieldValue: (n: string) => unknown,
    localFormValues: Record<string, unknown>
  ): string | boolean | null => {
    // 1) existing sources
    const direct =
      (getFieldValue(fieldName) as unknown) ??
      (localFormValues[fieldName] as unknown);

    if (direct !== undefined && direct !== null && direct !== '') {
      return direct as string;
    }

    // 2) address-specific fallbacks
    const addr = workflowPayload?.addresses ?? {};

    // Canonical map of common variants -> actual API keys
    const addressAliases: Record<string, unknown> = {
      // generic
      addressLine1:
        pick(addr, 'registerLine1') ?? pick(addr, 'correspondenceLine1'),
      // register address
      registerAddressLine1: pick(addr, 'registerLine1'),
      register_line1: pick(addr, 'registerLine1'),
      registerLine1: pick(addr, 'registerLine1'),
      // correspondence address
      correspondenceAddressLine1: pick(addr, 'correspondenceLine1'),
      correspondence_line1: pick(addr, 'correspondenceLine1'),
      correspondenceLine1: pick(addr, 'correspondenceLine1'),
      // nodal officer (API has a typo: noAddresLine1)
      noAddressLine1:
        pick(addr, 'noAddressLine1') ?? pick(addr, 'noAddresLine1'),
      noAddresLine1: pick(addr, 'noAddresLine1'),
    };

    const aliasHit = addressAliases[fieldName];
    if (aliasHit !== undefined && aliasHit !== null && aliasHit !== '') {
      return aliasHit as string;
    }

    return ''; // default empty for preview
  };

  // Render individual field with modifiable fields enabled and editable
  const renderPreviewField = (field: TrackStatusFormField) => {
    const value =
      getFieldValue(field.fieldName) || localFormValues[field.fieldName] || '';
    const citizenshipKeys = [
      'hoiCitizenship',
      'noCitizenship',
      'iauCitizenship1',
      'iauCitizenship2',
    ];

    const hasIndianCitizenship = citizenshipKeys.some((key) => {
      const localVal = localFormValues[key] as string;
      const apiVal = getFieldValue(key) as string;
      const value = (localVal || apiVal || '').toString().trim().toLowerCase();
      return value === 'indian';
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

    // Check constitution value for conditional required fields
    const constitutionValue =
      (localFormValues['constitution'] as string) ||
      (getFieldValue('constitution') as string) ||
      '';
    const isSoleProprietorship = constitutionValue === 'Sole Proprietorship';
    const isLLP = constitutionValue === 'Limited Liability Partnership';
    const cinRequiredConstitutions = [
      'Private Limited Company',
      'Public Limited Company',
      'Section 8 Companies (Companies Act, 2013)',
      'D',
      'E',
      'M',
    ];
    const isCinRequired = cinRequiredConstitutions.includes(constitutionValue);

    // Determine if field is required based on conditional logic
    let isRequired = false;
    if (field.fieldName === 'proprietorName') {
      // Proprietor Name: only required when Constitution is "Sole Proprietorship"
      isRequired = isSoleProprietorship;
    } else if (field.fieldName === 'llpin') {
      // LLPIN: only required when Constitution is "Limited Liability Partnership"
      isRequired = isLLP;
    } else if (field.fieldName === 'cin') {
      // CIN: only required when Constitution matches specific company types
      isRequired = isCinRequired;
    } else if (
      field.fieldName === 'noRegisterPincodeOther' ||
      field.fieldName === 'registerPincodeOther' ||
      field.fieldName === 'correspondencePincodeOther' ||
      field.fieldName === 'iauPincodeOther1' ||
      field.fieldName === 'iauPincodeOther2'
    ) {
      // Pincode Other fields: only required when "Other" or "Others" is selected
      let pincodeValue = '';
      if (field.fieldName === 'noRegisterPincodeOther') {
        pincodeValue =
          (formValues['noRegisterPincode'] as string) ||
          (getFieldValue('noRegisterPincode') as string) ||
          '';
      } else if (field.fieldName === 'registerPincodeOther') {
        pincodeValue =
          (formValues['register_pincode'] as string) ||
          (formValues['registerPincode'] as string) ||
          (getFieldValue('registerPincode') as string) ||
          '';
      } else if (field.fieldName === 'correspondencePincodeOther') {
        pincodeValue =
          (formValues['correspondencePincode'] as string) ||
          (getFieldValue('correspondencePincode') as string) ||
          '';
      } else if (field.fieldName === 'iauPincodeOther1') {
        pincodeValue =
          (formValues['iauPincode1'] as string) ||
          (getFieldValue('iauPincode1') as string) ||
          '';
      } else if (field.fieldName === 'iauPincodeOther2') {
        pincodeValue =
          (formValues['iauPincode2'] as string) ||
          (getFieldValue('iauPincode2') as string) ||
          '';
      }

      const isOtherSelected =
        pincodeValue?.toString().toLowerCase() === 'other' ||
        pincodeValue?.toString().toLowerCase() === 'others';

      // Only mark as required if "Other" or "Others" is selected
      isRequired = isOtherSelected;
    } else {
      // All other fields: use default validation logic
      isRequired =
        shouldForceCkyc ||
        field.validationRules?.required ||
        field.isRequired ||
        false;
    }
    const isModifiable =
      isModifiableField(field.fieldName) && SubmittedForm !== 'SUBMITTED';
    // console.log(field.fieldLabel,localFormValues[field.fieldName],"field");

    // Common field styles
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

    switch (field.fieldType) {
      case 'textfield':
        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            value={
              (localFormValues[field.fieldName] as string) ||
              '' ||
              (resolveValue(
                field.fieldName,
                getFieldValue,
                localFormValues
              ) as string)
            }
            onChange={(e) => {
              handleFieldChange(field.fieldName, e.target.value);
            }}
            fieldName={field.fieldName}
            placeholder={field.fieldPlaceholder || ''}
            required={isRequired}
            disabled={true} // Enable if modifiable
            error={false}
            helperText={field.helpText || undefined}
            sx={fieldSx}
          />
        );

      case 'dropdown': {
        const rawValue =
          (localFormValues[field.fieldName] as string) ||
          (getFieldValue(field.fieldName) as string) ||
          '';

        let displayValue = rawValue;
        if (
          field.fieldName.toLowerCase().includes('countrycode') &&
          field.fieldOptions?.length
        ) {
          const match = field.fieldOptions.find((opt) => {
            const option = opt as CountryFieldOption;
            return option?.code === rawValue || option?.isocode === rawValue;
          }) as CountryFieldOption | undefined;

          if (match?.name) {
            displayValue = `${match.name}(${match.code})`;
          }
        }
        // For preview, display the workflow value directly as a text field
        // instead of searching through dropdown options
        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            //  value={(localFormValues[field.fieldName] as string) || ''}
            value={displayValue}
            onChange={(e) => {
              handleFieldChange(field.fieldName, e.target.value);
            }}
            fieldName={field.fieldName}
            placeholder={field.fieldPlaceholder || ''}
            required={isRequired}
            disabled={true} // Enable if modifiable
            error={false}
            helperText={field.helpText || undefined}
            sx={fieldSx}
          />
        );
      }

      case 'checkbox': {
        return (
          <LabeledCheckbox
            key={field.id}
            label={field.fieldLabel}
            checked={Boolean(value === true || value === 'true' || value === 1)}
            onChange={() => {}}
            required={isRequired}
            disabled={true}
          />
        );
      }

      case 'date':
        return (
          <LabeledDate
            key={field.id}
            label={field.fieldLabel}
            value={(localFormValues[field.fieldName] as string) || null}
            onChange={(date) => {
              handleFieldChange(field.fieldName, date);
            }}
            required={isRequired}
            error={false}
            helperText={undefined}
            disabled={true} // Enable if modifiable
            sx={fieldSx}
          />
        );

      case 'textfield_with_image': {
        const fieldDocument = getFieldDocument(field.fieldName);
        return (
          <LabeledTextFieldWithUpload
            key={field.id}
            label={field.fieldLabel}
            value={(localFormValues[field.fieldName] as string) || ''}
            onChange={(e) => {
              handleFieldChange(field.fieldName, e.target.value);
            }}
            onUpload={(file) => {
              return Promise.resolve('file-url');
            }}
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
        );
      }

      case 'textfield_with_verify':
        return (
          <LabeledTextFieldWithVerify
            key={field.id}
            label={field.fieldLabel}
            value={(localFormValues[field.fieldName] as string) || ''}
            onChange={(e) => {
              handleFieldChange(field.fieldName, e.target.value);
            }}
            placeholder={field.fieldPlaceholder || ''}
            required={isRequired}
            error={false}
            helperText={undefined}
            disabled={true} // Enable if modifiable
            onOpenSendOtp={async () => {
              return true;
            }}
            onVerify={(value) => {
              console.log(`Verified ${field.fieldLabel}:`, value);
            }}
            sx={fieldSx}
            verifyIcon={true}
          />
        );

      case 'file': {
        const fieldDocument = getFieldDocument(field.fieldName);

        return (
          <UploadButtonWithIcon
            key={field.id}
            label={field.fieldLabel}
            onUpload={(file) => {
              // Handle file upload (disabled in preview mode)
              console.log('File upload attempt in preview mode:', file);
            }}
            disabled={true} // Always disabled in preview mode
            required={isRequired}
            existingDocument={fieldDocument}
            showExistingDocument={!!fieldDocument}
            sx={fieldSx}
            error={false}
            helperText={undefined}
          />
        );
      }

      default:
        return null;
    }
  };

  // Render preview section (accordion)
  const renderPreviewSection = (
    groupName: string,
    groupData: { label: string; fields: TrackStatusFormField[] }
  ) => {
    const sortedFields = [...groupData.fields].sort(
      (a, b) => a.fieldOrder - b.fieldOrder
    );

    // Check if any field in this section is modifiable
    const hasModifiableField = sortedFields.some((field) =>
      isModifiableField(field.fieldName)
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
                  : groupData.label
        }
        groupKey={groupName}
        defaultExpanded={true}
        showEdit={true}
        isModifiable={hasModifiableField}
        // onEdit={() => onEdit?.(getStepIndex(groupName))}
      >
        <Grid container spacing={2}>
          {sortedFields.map((field) => {
            const shouldHideField = () => {
              if (field.fieldName.toLowerCase().includes('pincodeother')) {
                // Determine the corresponding pincode field name
                const pincodeFieldName = field.fieldName.replace(
                  /PincodeOther/i,
                  'Pincode'
                );
                // Get the value of the pincode dropdown
                const pincodeValue =
                  (localFormValues[pincodeFieldName] as string) ||
                  (getFieldValue(pincodeFieldName) as string) ||
                  '';

                // Hide the PincodeOther field unless Pincode is "Other" or "Others"
                const isOther =
                  pincodeValue.toLowerCase() === 'other' ||
                  pincodeValue.toLowerCase() === 'others';

                return !isOther; // Hide if NOT "Other"
              }

              return false; // Don't hide other fields
            };

            // Skip rendering if field should be hidden
            if (shouldHideField()) {
              return null;
            }
            // Checkbox fields take full width (single row), other fields are 3 per row
            const gridSize =
              field.fieldType === 'checkbox'
                ? { xs: 12 } // Full width for checkboxes
                : { xs: 12, sm: 6, md: 4 }; // Third width for other fields

            return (
              <Grid size={gridSize} key={field.id}>
                {renderPreviewField(field)}
              </Grid>
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
          onClick={() => dispatch(fetchTrackStatusFields())}
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
          renderPreviewSection(groupName, groupData)
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
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
        {/* <ReusableButton
          label="Back to Home"
          onClick={handleSubmit}
          size="large"
          loading={pdfGenerationLoading}
          disabled={pdfGenerationLoading}
        /> */}
        {(statusApprover1 === 'APPROVED' &&
          statusApprover2 !== 'REQUEST_FOR_MODIFICATION') ||
        (statusApprover1 === 'APPROVED' && statusApprover2 === 'APPROVED') ||
        !IsDataModified ||
        SubmittedForm === 'SUBMITTED' ? null : (
          <ReusableButton
            label="Edit"
            onClick={handleEditStatus}
            size="large"
            loading={pdfGenerationLoading}
            disabled={pdfGenerationLoading}
          />
        )}
      </Box>
    </Box>
  );
};

export default TrackStatusFormPreview;
