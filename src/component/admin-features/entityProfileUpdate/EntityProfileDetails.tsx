/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  AccordionDetails,
  CircularProgress,
  Alert,
  Modal,
  Snackbar,
  Grid,
  Tooltip,
  Accordion,
  AccordionSummary,
  styled,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import SuccessModal from '../../ui/Modal/SuccessModal';
import RejectConfirmationModal from '../../common/modals/RejectConfirmationModal';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchEntityProfileWorkflowDetails,
  approveEntityProfileUpdate,
  rejectEntityProfileUpdate,
  resetEntityProfileActionState,
  clearEntityProfileWorkflowDetails,
} from '../request-details/slices/entityProfileApprovalSlice';
import { fetchFields } from '../request-details/slices/applicationPreviewSlice';
import AdminBreadcrumbUpdateProfile from '../myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import { useSelector } from 'react-redux';
import VerifiedIcon from '../../ui/Input/VerifiedIcon';
import { Secured } from '../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../Constant';

// Styled components matching RequestDetails.tsx
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: 'none',
  border: '1px solid #E6EBFF',
  borderRadius: '8px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
    marginBottom: theme.spacing(3),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  padding: '0 16px',
  minHeight: '48px !important',
  backgroundColor: '#E6EBFF',
  borderRadius: '8px 8px 0 0',
  '& .MuiAccordionSummary-content': {
    margin: '12px 0 !important',
    fontWeight: 600,
  },
});

// Styles object
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 2,
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
  },
  backButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
  backButton: {
    color: 'black',
    textTransform: 'none',
    fontSize: '14px',
    fontFamily: 'Gilroy',
  },
  signedDocBanner: {
    width: '100%',
    height: '50px',
    backgroundColor: '#F8F9FD',
    border: '1px solid #E6EBFF',
    borderRadius: '4px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
  },
  viewSignedDocLink: {
    color: '#002CBA',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: 'Gilroy',
  },
  sectionTitle: {
    fontFamily: 'Gilroy',
    fontWeight: 700,
    fontSize: '18px',
    color: '#1A1A1A',
    mb: 0,
    mt: -2,
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    mt: 0,
    pt: 0,
  },
  rejectButton: {
    backgroundColor: '#fff',
    border: '1px solid #002CBA',
    color: '#002CBA',
    textTransform: 'none',
    px: 4,
    py: 1,
    borderRadius: '4px',
    fontFamily: 'Gilroy',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      border: '1px solid #002CBA',
    },
  },
  approveButton: {
    backgroundColor: '#002CBA',
    color: '#fff',
    textTransform: 'none',
    px: 4,
    py: 1,
    borderRadius: '4px',
    fontFamily: 'Gilroy',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: 'rgba(0, 44, 186, 0.9)',
    },
  },
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    textAlign: 'center',
  },
};

export const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;

interface DocumentFile {
  id: string;
  documentType?: string;
  type?: string;
  fieldKey?: string;
  fileName?: string;
  fileSize?: number;
  base64Content?: string;
}

const EntityProfileDetails: React.FC = () => {
  const { workFlowId } = useParams<{
    id: string;
    workFlowId: string;
    userId: string;
  }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state for entity profile approval
  const {
    workflowDetails,
    detailsLoading,
    detailsError,
    actionLoading,
    actionSuccess,
    actionMessage,
    actionError,
  } = useAppSelector((state: any) => state.entityProfileApproval || {});

  // Redux state for dynamic form fields
  const groupedFields = useSelector(
    (state: any) => state.applicationDetails?.data?.groupedFields || {}
  );

  // Local state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalType, setSuccessModalType] = useState<
    'success' | 'reject'
  >('success');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Document state
  const [documentsWithContent, setDocumentsWithContent] = useState<
    DocumentFile[]
  >([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [documentFileTypes, setDocumentFileTypes] = useState<
    Record<string, 'pdf' | 'image'>
  >({});

  // Document viewer state
  const [viewDocument, setViewDocument] = useState<{
    open: boolean;
    documentId?: string;
    base64Content?: string;
    fileName: string;
    fileType?: 'pdf' | 'image';
    loading?: boolean;
  }>({ open: false, fileName: '', loading: false });

  // Get payload data from workflow (response API)
  const payload = useMemo(() => {
    return workflowDetails?.payload || {};
  }, [workflowDetails]);

  // Get documents from workflow
  const documents = useMemo(() => {
    return workflowDetails?.documents || [];
  }, [workflowDetails]);

  // Get updatedFields array from payload (flat array of field names)
  const updatedFields = useMemo(() => {
    return payload?.updatedFields || workflowDetails?.updatedFields || [];
  }, [payload, workflowDetails]);

  // Check if a field is in the updatedFields array
  const isFieldUpdated = (fieldKey: string): boolean => {
    if (!Array.isArray(updatedFields) || updatedFields.length === 0) {
      return false;
    }
    return updatedFields.includes(fieldKey);
  };

  // Check if any field in a section has been updated (for accordion header highlighting)
  const isSectionUpdated = (
    sectionFields: { key?: string; label: string }[]
  ): boolean => {
    if (!Array.isArray(updatedFields) || updatedFields.length === 0) {
      return false;
    }
    return sectionFields.some((field) => {
      const fieldKey = field.key || field.label;
      return updatedFields.includes(fieldKey);
    });
  };

  // Fetch workflow details and form fields on mount
  useEffect(() => {
    if (workFlowId) {
      dispatch(
        fetchEntityProfileWorkflowDetails({
          workflowId: workFlowId,
        })
      );
    }
    // Fetch dynamic form fields (same API as RequestDetails)
    dispatch(fetchFields());

    return () => {
      dispatch(clearEntityProfileWorkflowDetails());
      dispatch(resetEntityProfileActionState());
    };
  }, [dispatch, workFlowId]);

  // Handle action success
  useEffect(() => {
    if (actionSuccess && actionMessage) {
      setSuccessMessage(actionMessage);
      if (actionMessage.toLowerCase().includes('reject')) {
        setSuccessModalType('reject');
      } else {
        setSuccessModalType('success');
      }
      setIsSuccessModalOpen(true);
      setIsRejectModalOpen(false);
    }
  }, [actionSuccess, actionMessage]);

  // Handle action error
  useEffect(() => {
    if (actionError) {
      setSnackbar({
        open: true,
        message: actionError,
        severity: 'error',
      });
    }
  }, [actionError]);

  // Fetch document when modal opens with documentId
  useEffect(() => {
    if (
      viewDocument.open &&
      viewDocument.documentId &&
      !viewDocument.base64Content
    ) {
      setViewDocument((prev) => ({ ...prev, loading: true }));

      Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${viewDocument.documentId}`,
        { responseType: 'blob' }
      )
        .then(async (response: any) => {
          const blob = response.data;
          const contentType = response.headers['content-type'] || '';

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            const fileType = contentType.includes('pdf') ? 'pdf' : 'image';

            setViewDocument((prev) => ({
              ...prev,
              base64Content: base64,
              fileType,
              loading: false,
            }));

            if (viewDocument.documentId) {
              setDocumentFileTypes((prev) => ({
                ...prev,
                [viewDocument.documentId!]: fileType,
              }));
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          setViewDocument((prev) => ({ ...prev, loading: false }));
          setSnackbar({
            open: true,
            message: 'Failed to load document',
            severity: 'error',
          });
        });
    }
  }, [viewDocument.open, viewDocument.documentId, viewDocument.base64Content]);

  // Fetch document content when documents are available
  useEffect(() => {
    const fetchDocumentContent = async () => {
      const documentObj = workflowDetails?.document || payload?.document;
      const documentsArray = payload?.documents || workflowDetails?.documents;

      let docsToFetch: any[] = [];

      if (
        documentObj &&
        typeof documentObj === 'object' &&
        !Array.isArray(documentObj)
      ) {
        docsToFetch = Object.entries(documentObj)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              return { id: value, type: key, documentType: key, fieldKey: key };
            } else if (typeof value === 'object' && value !== null) {
              const valueObj = value as any;
              return {
                ...valueObj,
                fieldKey: valueObj.fieldKey || key,
                type: valueObj.fieldKey || key,
                documentType: valueObj.fieldKey || key,
              };
            }
            return null;
          })
          .filter(Boolean);
      } else if (Array.isArray(documentsArray) && documentsArray.length > 0) {
        docsToFetch = documentsArray;
      }

      if (!docsToFetch || docsToFetch.length === 0) return;

      setLoadingDocuments(true);
      const documentsWithBase64: DocumentFile[] = [];

      try {
        await Promise.all(
          docsToFetch.map(async (doc: any) => {
            try {
              const response = await Secured.get(
                `${API_ENDPOINTS.fetch_document}?id=${doc.id}`,
                { responseType: 'blob' }
              );

              const blob = response.data;
              const base64Content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  const base64 = result.split(',')[1];
                  resolve(base64);
                };
                reader.readAsDataURL(blob);
              });

              documentsWithBase64.push({
                ...doc,
                base64Content,
                fileSize: blob.size,
                fileName: doc.fieldKey || doc.type || 'document',
                fieldKey: doc.fieldKey || doc.type,
                type: doc.fieldKey || doc.type,
                documentType: doc.fieldKey || doc.type,
              });
            } catch {
              // Error handled silently
            }
          })
        );

        setDocumentsWithContent(documentsWithBase64);
      } catch {
        // Error handled silently
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocumentContent();
  }, [
    workflowDetails?.document,
    payload?.document,
    payload?.documents,
    workflowDetails?.documents,
  ]);

  // Helper function to get nested value from object
  const getNestedValue = (obj: any, path: string) => {
    if (!path) return undefined;
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  // Helper function to convert dropdown code to display name
  const getDropdownLabel = (value: any, fieldOptions: any[]) => {
    if (!fieldOptions || fieldOptions.length === 0) return value;
    const option = fieldOptions.find(
      (opt) => opt.code === value || opt.name === value
    );
    return option ? option.name : value;
  };

  // Render value for a field (similar to RequestDetails.tsx)
  const renderValue = (field: any) => {
    const dataPath = field.dataPath || field.valuePath || field.fieldPath;

    if (dataPath && payload) {
      let actualValue = getNestedValue(payload, dataPath);

      if (
        actualValue !== undefined &&
        actualValue !== null &&
        actualValue !== ''
      ) {
        if (
          field.fieldType === 'file' ||
          field.fieldType === 'upload' ||
          field.fieldType === 'document' ||
          field.fieldType === 'image'
        ) {
          return null;
        }

        if (
          field.fieldOptions &&
          field.fieldOptions.length > 0 &&
          (field.fieldType === 'select' || field.fieldType === 'dropdown')
        ) {
          actualValue = getDropdownLabel(actualValue, field.fieldOptions);
        }

        return actualValue;
      }
    }

    if (payload) {
      const findValueByFieldName = (obj: any, fieldName: string): any => {
        if (!obj || typeof obj !== 'object') return undefined;
        if (obj[fieldName] !== undefined) return obj[fieldName];

        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findValueByFieldName(obj[key], fieldName);
            if (found !== undefined) return found;
          }
        }
        return undefined;
      };

      let value = findValueByFieldName(payload, field.fieldName);

      if (value !== undefined && value !== null && value !== '') {
        if (
          field.fieldType === 'file' ||
          field.fieldType === 'upload' ||
          field.fieldType === 'document' ||
          field.fieldType === 'image'
        ) {
          return null;
        }

        if (
          field.fieldOptions &&
          field.fieldOptions.length > 0 &&
          (field.fieldType === 'select' || field.fieldType === 'dropdown')
        ) {
          value = getDropdownLabel(value, field.fieldOptions);
        }

        return value;
      }
    }

    if (
      field.fieldType === 'file' ||
      field.fieldType === 'upload' ||
      field.fieldType === 'document' ||
      field.fieldType === 'image'
    ) {
      return null;
    }

    return 'Not provided';
  };

  // Get dynamic fields for a section (similar to RequestDetails.tsx)
  const getDynamicFields = (key: string) => {
    const fields = groupedFields?.[key]?.fields || [];
    return fields.map((field: any) => {
      const isRequired =
        field.validationRules?.required === true ||
        field.validationRules?.required === 'true';

      return {
        key: field.fieldName,
        label: field.fieldLabel,
        value: renderValue(field),
        fieldType: field.fieldType,
        fieldOptions: field.fieldOptions,
        required: isRequired,
        documentType: field.documentType,
        documentKey: field.documentKey,
        ...field,
      };
    });
  };

  // Get display title for a section
  const getDisplayTitle = (groupedFieldKey: string): string => {
    const section = groupedFields?.[groupedFieldKey];

    if (section?.sectionTitle) {
      return section.sectionTitle;
    }

    const groupFieldLabelMap: Record<string, string> = {
      reEntityprofile: 'Entity Profile',
      reentityprofile: 'Entity Profile',
      registeraddress: 'Register Address',
      registerAddress: 'Register Address',
      correspondenceaddress: 'Correspondence Address',
      correspondenceAddress: 'Correspondence Address',
      reHoi: 'Head of Institution Details',
      rehoi: 'Head of Institution Details',
      reNodal: 'Nodal Officer Details',
      renodal: 'Nodal Officer Details',
      adminone: 'Institutional Admin User 1 Details',
      adminOne: 'Institutional Admin User 1 Details',
      admintwo: 'Institutional Admin User 2 Details',
      adminTwo: 'Institutional Admin User 2 Details',
      entityProfile: 'Entity Profile',
      entityprofile: 'Entity Profile',
      headOfInstitution: 'Head of Institution Details',
      headofinstitution: 'Head of Institution Details',
      nodalOfficer: 'Nodal Officer Details',
      nodalofficer: 'Nodal Officer Details',
    };

    const mappedLabel = groupFieldLabelMap[groupedFieldKey];
    if (mappedLabel) return mappedLabel;

    const keyLower = groupedFieldKey.toLowerCase();
    const foundKey = Object.keys(groupFieldLabelMap).find(
      (k) => k.toLowerCase() === keyLower
    );
    if (foundKey) return groupFieldLabelMap[foundKey];

    return groupedFieldKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper functions for field type detection
  const isDateField = (fieldKey: string, fieldLabel: string): boolean => {
    const dateFieldKeys = [
      'dob',
      'dateofbirth',
      'dateofauthorization',
      'boardresolutiondate',
      'noDob',
      'noDateOfBirth',
      'noBoardResoluationDate',
      'iauDob1',
      'iauDateOfAuthorization1',
      'iauDob2',
      'iauDateOfAuthorization2',
    ];
    const fieldKeyLower = fieldKey.toLowerCase();
    const fieldLabelLower = fieldLabel.toLowerCase();

    return (
      dateFieldKeys.some((key) => fieldKeyLower.includes(key.toLowerCase())) ||
      fieldLabelLower.includes('date') ||
      fieldLabelLower.includes('dob')
    );
  };

  const isDropdownField = (fieldType: string): boolean => {
    return (
      fieldType === 'dropdown' ||
      fieldType === 'select' ||
      fieldType === 'dropdown-select'
    );
  };

  const isCheckboxField = (fieldKey: string, fieldLabel: string): boolean => {
    const checkboxFieldKeys = [
      'sameasregisteredaddress',
      'sameascorrespondenceaddress',
      'noSameAsRegisteredAddress',
      'adminOneSameAsRegisteredAddress',
      'adminTwoSameAsRegisteredAddress',
    ];
    const fieldKeyLower = fieldKey.toLowerCase();
    const fieldLabelLower = fieldLabel.toLowerCase();

    return (
      checkboxFieldKeys.some((key) =>
        fieldKeyLower.includes(key.toLowerCase())
      ) || fieldLabelLower.includes('same as')
    );
  };

  // Helper function to check if field is a CKYC number field and if it's verified
  const isCkycFieldVerified = (fieldKey: string, fieldValue: any): boolean => {
    const ckycFields = [
      'hoiCkycNumber',
      'hoiCkycNo',
      'noCkycNumber',
      'iauCkycNumber1',
      'iauCkycNumber2',
      'adminOneCkycNumber',
      'adminTwoCkycNumber',
    ];

    if (ckycFields.includes(fieldKey)) {
      return (
        fieldValue && typeof fieldValue === 'string' && fieldValue.length === 14
      );
    }

    return false;
  };

  // RenderDocumentFile component (similar to RequestDetails.tsx)
  function RenderDocumentFile({
    keyName,
    documentArray,
    fieldMetadata,
  }: {
    keyName: string;
    documentArray: any;
    fieldMetadata?: any;
  }) {
    let docType = fieldMetadata?.documentType || fieldMetadata?.documentKey;

    if (!docType) {
      docType = keyName;
    }

    let match: any = null;

    if (Array.isArray(documentArray)) {
      const matchingStrategies = [
        (item: any) =>
          item.fieldKey === docType ||
          item.type === docType ||
          item.documentType === docType,
        (item: any) =>
          item.fieldKey === `${keyName}File` ||
          item.type === `${keyName}File` ||
          item.documentType === `${keyName}File`,
        (item: any) => {
          const docTypeWithoutFile = docType.replace(/File$/, '');
          return (
            item.fieldKey === docTypeWithoutFile ||
            item.type === docTypeWithoutFile ||
            item.documentType === docTypeWithoutFile
          );
        },
        (item: any) => {
          const docTypeLower = docType.toLowerCase();
          return (
            item.fieldKey?.toLowerCase() === docTypeLower ||
            item.type?.toLowerCase() === docTypeLower ||
            item.documentType?.toLowerCase() === docTypeLower
          );
        },
        (item: any) => {
          const keyLower = keyName.toLowerCase();
          return (
            item.fieldKey?.toLowerCase().includes(keyLower) ||
            item.type?.toLowerCase().includes(keyLower) ||
            item.documentType?.toLowerCase().includes(keyLower)
          );
        },
      ];

      for (const strategy of matchingStrategies) {
        match = documentArray.find(strategy);
        if (match) break;
      }
    } else if (documentArray && typeof documentArray === 'object') {
      let docContent = documentArray[docType];

      if (!docContent) {
        const typeWithoutFile = docType.replace(/File$/, '');
        docContent = documentArray[typeWithoutFile];
        if (!docContent) docContent = documentArray[keyName];
        if (!docContent) docContent = documentArray[keyName + 'File'];
        if (!docContent) {
          const docTypeLower = docType.toLowerCase();
          const foundKey = Object.keys(documentArray).find(
            (key) => key.toLowerCase() === docTypeLower
          );
          if (foundKey) docContent = documentArray[foundKey];
        }
      }

      if (docContent) {
        if (typeof docContent === 'string') {
          match = { id: docType, base64Content: docContent, fileName: docType };
        } else if (typeof docContent === 'object') {
          match = {
            id: docContent.id || docType,
            base64Content:
              docContent.base64Content || docContent.content || docContent,
            fileName: docContent.fileName || docType,
            ...docContent,
          };
        }
      }
    }

    if (match) {
      if (match.base64Content || match.id) {
        const initialFileType: 'pdf' | 'image' = 'image';

        return (
          <Box sx={{ display: 'flex', height: '100%', alignSelf: 'center' }}>
            <Box
              component="button"
              type="button"
              aria-label={`View ${keyName} document`}
              style={{
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (match.id) {
                  setViewDocument({
                    open: true,
                    documentId: match.id,
                    fileName: match.fileName || keyName,
                    fileType: initialFileType,
                  });
                } else if (match.base64Content) {
                  setViewDocument({
                    open: true,
                    base64Content: match.base64Content,
                    fileName: match.fileName || keyName,
                    fileType: initialFileType,
                  });
                }
              }}
            >
              {(() => {
                const detectedType = match.id
                  ? documentFileTypes[match.id]
                  : undefined;
                const actualFileType = detectedType || initialFileType;

                if (actualFileType === 'pdf') {
                  return (
                    <Box
                      sx={{
                        height: 54,
                        width: 54,
                        border: '1px solid #D1D1D1',
                        borderRadius: '4px',
                        backgroundColor: '#F5F5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Click to view PDF"
                    >
                      <PictureAsPdfIcon
                        sx={{ fontSize: 32, color: '#d32f2f' }}
                      />
                    </Box>
                  );
                }

                if (match.base64Content) {
                  return (
                    <img
                      src={`data:image/jpeg;base64,${match.base64Content}`}
                      alt={`${keyName} document`}
                      title="Click to view document"
                      style={{
                        height: 54,
                        width: 54,
                        border: '1px solid #D1D1D1',
                        borderRadius: '4px',
                        objectFit: 'contain',
                        display: 'block',
                        backgroundColor: '#f9f9f9',
                      }}
                    />
                  );
                }

                return (
                  <Box
                    sx={{
                      height: 54,
                      width: 54,
                      border: '1px solid #D1D1D1',
                      borderRadius: '4px',
                      backgroundColor: '#F5F5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Click to view image"
                  >
                    <ImageIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                  </Box>
                );
              })()}
            </Box>
          </Box>
        );
      } else if (loadingDocuments) {
        return (
          <Box sx={{ display: 'flex', height: '100%', alignSelf: 'center' }}>
            <Box
              sx={{
                height: 54,
                width: 54,
                border: '1px solid #D1D1D1',
                borderRadius: '4px',
                backgroundColor: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Loading document..."
            >
              <Typography variant="caption" sx={{ fontSize: '18px' }}>
                ⏳
              </Typography>
            </Box>
          </Box>
        );
      }
    }

    return null;
  }

  // Render section (similar to RequestDetails.tsx but WITHOUT checkboxes)
  const renderSection = (
    title: string,
    fields: {
      label: string;
      value: any;
      key?: string;
      fieldType?: string;
      fieldOptions?: any[];
      required?: boolean;
    }[],
    groupedFieldKey?: string
  ) => {
    const validFields = fields.filter((field) => {
      if (
        field.fieldType === 'file' ||
        field.fieldType === 'upload' ||
        field.fieldType === 'document' ||
        field.fieldType === 'image'
      ) {
        return true;
      }
      return field.value;
    });

    // Check if any field in this section has been updated
    const sectionHasUpdates = isSectionUpdated(fields);

    return (
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${groupedFieldKey}-content`}
          id={`${groupedFieldKey}-header`}
          sx={{
            backgroundColor: sectionHasUpdates ? '#FFD952' : '#E6EBFF',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontFamily: 'Gilroy, sans-serif',
            }}
          >
            {title}
          </Typography>
        </StyledAccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Grid container>
            {validFields.map((field, index) => {
              const fieldKey = field.key || field.label;
              const isCheckbox = isCheckboxField(fieldKey, field.label);

              // Render checkbox fields differently
              if (isCheckbox) {
                return (
                  <Grid
                    size={{ xs: 12 }}
                    key={index}
                    sx={{ px: 2, py: 1.5, backgroundColor: '#fff' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'black',
                          fontWeight: '400',
                          fontSize: '14px',
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Box
                        sx={{
                          borderStyle: 'solid',
                          borderWidth: 2,
                          borderColor: '#E7E7E7',
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                    </Box>
                  </Grid>
                );
              }

              return (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{ p: 2, backgroundColor: '#fff' }}
                >
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'Gilroy, sans-serif',
                        color: 'black',
                        fontWeight: '600',
                        // Highlight updated fields with yellow background
                        backgroundColor: isFieldUpdated(fieldKey)
                          ? '#FFD952'
                          : undefined,
                        padding: isFieldUpdated(fieldKey)
                          ? '4px 8px'
                          : undefined,
                        borderRadius: isFieldUpdated(fieldKey)
                          ? '4px'
                          : undefined,
                        display: 'inline-block',
                        width: 'fit-content',
                      }}
                    >
                      {field.label}{' '}
                      {field.required && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {!(
                        field.key === 'addressProof' ||
                        field.key === 'other' ||
                        field.key === 'noBoardResoluation' ||
                        field.key === 'noBoardResolution'
                      ) && (
                        <Box
                          sx={{
                            display: 'flex',
                            flex: 1,
                            backgroundColor: '#F6F6F6',
                            padding: 2,
                            borderRadius: 1,
                            borderColor: '#D1D1D1',
                            borderStyle: 'solid',
                            borderWidth: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                          }}
                        >
                          <Tooltip title={field.value} placement="top" arrow>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'black',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                flex: 1,
                              }}
                            >
                              {field.value || '-'}
                            </Typography>
                          </Tooltip>
                          {isDateField(field.key || '', field.label) && (
                            <CalendarTodayIcon
                              sx={{ color: '#666', fontSize: '20px', ml: 1 }}
                            />
                          )}
                          {field.fieldType &&
                            isDropdownField(field.fieldType) && (
                              <KeyboardArrowDownIcon
                                sx={{ color: '#666', fontSize: '20px', ml: 1 }}
                              />
                            )}
                          {isCkycFieldVerified(
                            field.key || '',
                            field.value
                          ) && (
                            <Box sx={{ ml: 1 }}>
                              <VerifiedIcon showText={true} size={19} />
                            </Box>
                          )}
                        </Box>
                      )}
                      {field.key &&
                        !(
                          field.key === 'noProofOfIdentity' ||
                          field.key === 'iauProofOfIdentity1' ||
                          field.key === 'iauProofOfIdentity2' ||
                          field.fieldType === 'select' ||
                          field.fieldType === 'dropdown' ||
                          field.fieldType === 'dropdown-select'
                        ) &&
                        (() => {
                          let docSource = null;

                          if (documentsWithContent.length > 0) {
                            docSource = documentsWithContent;
                          } else if (workflowDetails?.document) {
                            docSource = workflowDetails.document;
                          } else if (payload?.document) {
                            docSource = payload.document;
                          } else if (payload?.documents) {
                            docSource = payload.documents;
                          } else if (workflowDetails?.documents) {
                            docSource = workflowDetails.documents;
                          }

                          return (
                            <RenderDocumentFile
                              keyName={field.key}
                              documentArray={docSource}
                              fieldMetadata={field}
                            />
                          );
                        })()}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    );
  };

  // Handle approve
  const handleApprove = () => {
    if (!workFlowId) return;

    dispatch(
      approveEntityProfileUpdate({
        workflowId: workFlowId,
        remark: 'Approved',
      })
    );
  };

  // Handle reject
  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const confirmReject = (remark: string) => {
    if (!workFlowId) return;

    dispatch(
      rejectEntityProfileUpdate({
        workflowId: workFlowId,
        reason: remark,
      })
    );
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate('/ckycrr-admin/my-task/update-profile/entity-profile');
  };

  // Loading state
  if (detailsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (detailsError) {
    return (
      <Box sx={styles.container}>
        <Alert severity="error">
          <Typography>Failed to load details: {detailsError}</Typography>
          <Button
            onClick={() =>
              dispatch(
                fetchEntityProfileWorkflowDetails({
                  workflowId: workFlowId!,
                })
              )
            }
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  const workflowStatus = workflowDetails?.status;
  const canTakeAction =
    workflowStatus === 'SUBMITTED' || workflowStatus === 'APPROVED_BY_CA1';

  return (
    <Box sx={styles.container}>
      {/* Back Button */}
      <Box sx={styles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black', fontSize: 18 }} />}
          onClick={() => navigate(-1)}
          sx={styles.backButton}
        >
          Back
        </Button>
      </Box>

      {/* Breadcrumb */}
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          {
            label: 'Update Profile',
            href: '/ckycrr-admin/my-task/update-profile',
          },
          {
            label: 'Entity Profile',
            href: '/ckycrr-admin/my-task/update-profile/entity-profile',
          },
          { label: 'Reporting Entity Details' },
        ]}
      />

      {/* View Signed Document Link */}
      <Box sx={styles.signedDocBanner}>
        <Typography
          sx={styles.viewSignedDocLink}
          onClick={() => {
            const signedDoc = documents?.find(
              (d: any) =>
                d?.fieldKey?.toLowerCase().includes('signed') &&
                d?.fieldKey?.toLowerCase().includes('pdf')
            );
            if (signedDoc) {
              setViewDocument({
                open: true,
                documentId: signedDoc.id,
                fileName: 'Signed Document',
                loading: true,
              });
            } else {
              setSnackbar({
                open: true,
                message: 'Signed document not available',
                severity: 'info',
              });
            }
          }}
        >
          View Signed Document
        </Typography>
      </Box>

      {/* Entity Details Section Title */}
      <Typography sx={styles.sectionTitle}>Report Entity Details</Typography>

      {/* Dynamic Sections from groupedFields */}
      <Box>
        {Object.keys(groupedFields).map((key) => {
          const sectionLabel = getDisplayTitle(key);
          return (
            <React.Fragment key={key}>
              {renderSection(sectionLabel, getDynamicFields(key), key)}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Action Buttons */}
      {canTakeAction && (
        <Box sx={styles.actionButtons}>
          <Button
            variant="outlined"
            onClick={handleReject}
            sx={styles.rejectButton}
            disabled={actionLoading}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            onClick={handleApprove}
            sx={styles.approveButton}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Approve'
            )}
          </Button>
        </Box>
      )}

      {/* Reject Modal */}
      <RejectConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={confirmReject}
        title="Reject Update Entity Profile"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        remarkMaxLength={500}
        cancelLabel="Cancel"
        submitLabel="Submit"
      />

      {/* Success/Reject Result Modal */}
      <SuccessModal
        open={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        messageType={successModalType}
        title={
          successMessage ||
          (successModalType === 'reject'
            ? 'Update Entity Profile Request Rejected'
            : 'Entity profile submitted for Level 2 approval')
        }
        okText="Okay"
        onOk={handleSuccessModalClose}
      />

      {/* Document Viewer Modal */}
      <Modal
        open={viewDocument.open}
        onClose={() => setViewDocument({ open: false, fileName: '' })}
        aria-labelledby="document-viewer-modal"
        aria-describedby="document-viewer-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: viewDocument.fileType === 'pdf' ? '80vw' : 'auto',
            minWidth: viewDocument.fileName === 'pdf' ? '600px' : 'auto',
            maxWidth: viewDocument.fileName === 'pdf' ? '95vw' : '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #E0E0E0',
            }}
          >
            <Typography variant="h6" component="h2">
              {viewDocument.fileName}
            </Typography>
            <IconButton
              onClick={() =>
                setViewDocument({
                  open: false,
                  documentId: undefined,
                  base64Content: undefined,
                  fileName: '',
                  fileType: undefined,
                  loading: false,
                })
              }
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: 'calc(90vh - 80px)',
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
                  minHeight: '400px',
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
                    maxHeight: 'calc(90vh - 120px)',
                    objectFit: 'contain',
                  }}
                />
              )
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                }}
              >
                <Typography color="text.secondary">
                  No document to display
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>

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

export default EntityProfileDetails;
