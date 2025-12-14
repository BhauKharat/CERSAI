/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchFields } from './slices/applicationPreviewSlice';
import { updateApplicationStatus } from './slices/applicationActionSlice';
import { showLoader, hideLoader } from '../../loader/slices/loaderSlice';
import { Secured } from '../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../Constant';
export const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;
// MUI Components
import {
  Button,
  Card,
  Grid,
  Typography,
  Modal,
  TextField,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  styled,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// Assets & Styles
import reqForModificationImage from '../../../assets/reqformodifiction.png';
import FilePreview from '../DocPreview/FilePreview';
import RejectRequestSucessModal from './RejectRequestSucessModal';
import { useSelector } from 'react-redux';
import { mockWorkflowData } from './mockWorkflowData';
import { fetchApplicationDetailsAdmincms } from './slices/applicationDetailsAdminSlice';
import AdminBreadcrumbUpdateProfile from '../myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import { styles } from '../myTask/mytaskDash/css/NewRequest.style';
import { requestDetailsStyles } from './RequestDetails.style';
import VerifiedIcon from '../../ui/Input/VerifiedIcon';
// Custom styled components for Antd's Collapse functionality
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
  '& .MuiAccordionSummary-content': {
    margin: '12px 0 !important',
    fontWeight: 600,
  },
});

interface FieldValidation {
  [key: string]: boolean;
}

// Dynamic type - no hardcoded section names needed
type SelectedFieldsState = Record<string, string[]>;

interface DocumentFile {
  id: string;
  documentType?: string; // For backward compatibility
  type?: string; // From API response
  fieldKey?: string;
  fileName?: string;
  fileSize?: number;
  base64Content?: string;
}

interface IEntityRequest {
  entityName: string;
  requestFields: string[];
}

// Use the imported ApplicationActionRequest type from applicationActionTypes
// and extend it with the additional fields needed for modification

const ApplicationDetailsView: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [userDetailData, setUserDetailData] = useState<any>();
  const [documentsWithContent, setDocumentsWithContent] = useState<
    DocumentFile[]
  >([]);
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [validationRules, setValidationRules] = useState<Record<string, any>>(
    {}
  );
  const {
    loading: actionLoading,
    success: actionSuccess,
    error: actionError,
  } = useAppSelector(
    (state: any) =>
      state.applicationAction || { loading: false, success: false, error: null }
  );

  const [requestedModifiedFields] = useState<IEntityRequest[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const [viewDocument, setViewDocument] = useState<{
    open: boolean;
    documentId?: string;
    base64Content?: string;
    fileName: string;
    fileType?: 'pdf' | 'image';
    loading?: boolean;
  }>({ open: false, fileName: '', loading: false });

  // Store detected file types for document IDs (so we don't have to fetch repeatedly)
  const [documentFileTypes, setDocumentFileTypes] = useState<
    Record<string, 'pdf' | 'image'>
  >({});

  // Helper function to detect if base64 content is a PDF
  function isPDFContent(base64: string): boolean {
    try {
      // PDF files start with %PDF- which is "JVBERi0" in base64
      return base64.startsWith('JVBER') || base64.startsWith('%PDF');
    } catch {
      return false;
    }
  }

  // Detect file types for all documents when they're loaded
  useEffect(() => {
    const detectDocumentTypes = async () => {
      // Use documentsWithContent if available
      const documents = documentsWithContent;
      if (!documents || !Array.isArray(documents) || documents.length === 0)
        return;

      // Only detect for documents we haven't checked yet
      const uncheckedDocs = documents.filter(
        (doc: any) => doc.id && !documentFileTypes[doc.id]
      );

      if (uncheckedDocs.length === 0) return;

      // Fetch documents to detect MIME type
      const detectionPromises = uncheckedDocs.map(async (doc: any) => {
        try {
          const response = await Secured.get(
            `${API_ENDPOINTS.fetch_document}?id=${doc.id}`,
            { responseType: 'blob' }
          );
          const contentType = response.headers['content-type'] || '';
          const fileType: 'pdf' | 'image' = contentType.includes('pdf')
            ? 'pdf'
            : 'image';

          return { id: doc.id, fileType };
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.all(detectionPromises);

      // Update state with all detected types
      const newTypes: Record<string, 'pdf' | 'image'> = {};
      results.forEach((result) => {
        if (result) {
          newTypes[result.id] = result.fileType;
        }
      });

      if (Object.keys(newTypes).length > 0) {
        setDocumentFileTypes((prev) => ({ ...prev, ...newTypes }));
      }
    };

    detectDocumentTypes();
  }, [documentsWithContent, documentFileTypes]);

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
        {
          responseType: 'blob',
        }
      )
        .then(async (response: any) => {
          const blob = response.data;
          const contentType = response.headers['content-type'] || '';

          // Convert blob to base64
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

            // Store the detected file type for this document ID
            if (viewDocument.documentId) {
              setDocumentFileTypes((prev) => ({
                ...prev,
                [viewDocument.documentId!]: fileType,
              }));
            }
          };
          reader.readAsDataURL(blob);
        })
        .catch((error: any) => {
          setViewDocument((prev) => ({ ...prev, loading: false }));
          setSnackbar({
            open: true,
            message: 'Failed to load document',
            severity: 'error',
          });
        });
    }
  }, [viewDocument.open, viewDocument.documentId, viewDocument.base64Content]);

  function RenderDocumentFile({
    keyName,
    documentArray,
    fieldMetadata,
  }: {
    keyName: string;
    documentArray: any; // Can be array or object
    fieldMetadata?: any; // NEW: Field metadata from API
  }) {
    let docType = fieldMetadata?.documentType || fieldMetadata?.documentKey;

    // If no metadata provided, try intelligent fallback
    if (!docType) {
      // Try common patterns: keyName + 'File', or just keyName
      docType = keyName;
    }

    let match: any = null;

    // Handle both array and object structures
    if (Array.isArray(documentArray)) {
      // Try multiple matching strategies in order of priority
      const matchingStrategies = [
        // 1. Exact match
        (item: any) =>
          item.fieldKey === docType ||
          item.type === docType ||
          item.documentType === docType,
        // 2. Try keyName + 'File'
        (item: any) =>
          item.fieldKey === `${keyName}File` ||
          item.type === `${keyName}File` ||
          item.documentType === `${keyName}File`,
        // 3. Try without 'File' suffix
        (item: any) => {
          const docTypeWithoutFile = docType.replace(/File$/, '');
          return (
            item.fieldKey === docTypeWithoutFile ||
            item.type === docTypeWithoutFile ||
            item.documentType === docTypeWithoutFile
          );
        },
        // 4. Case-insensitive match
        (item: any) => {
          const docTypeLower = docType.toLowerCase();
          return (
            item.fieldKey?.toLowerCase() === docTypeLower ||
            item.type?.toLowerCase() === docTypeLower ||
            item.documentType?.toLowerCase() === docTypeLower
          );
        },
        // 5. Case-insensitive keyName + 'File'
        (item: any) => {
          const keyWithFile = `${keyName}File`.toLowerCase();
          return (
            item.fieldKey?.toLowerCase() === keyWithFile ||
            item.type?.toLowerCase() === keyWithFile ||
            item.documentType?.toLowerCase() === keyWithFile
          );
        },
        // 6. Partial match - contains keyName (for cases like 'pan' matching 'panFile' or 'pan_document')
        (item: any) => {
          const keyLower = keyName.toLowerCase();
          return (
            item.fieldKey?.toLowerCase().includes(keyLower) ||
            item.type?.toLowerCase().includes(keyLower) ||
            item.documentType?.toLowerCase().includes(keyLower)
          );
        },
      ];

      // Try each strategy until we find a match
      for (const strategy of matchingStrategies) {
        match = documentArray.find(strategy);
        if (match) break;
      }
    } else if (documentArray && typeof documentArray === 'object') {
      // Documents stored as object with keys like { panFile: "base64...", cinFile: "base64..." }
      // Try exact match first
      let docContent = documentArray[docType];

      // If no exact match, try variations
      if (!docContent) {
        // Try with 'File' suffix removed
        const typeWithoutFile = docType.replace(/File$/, '');
        docContent = documentArray[typeWithoutFile];

        // Try direct field name
        if (!docContent) {
          docContent = documentArray[keyName];
        }

        // Try field name + 'File'
        if (!docContent) {
          docContent = documentArray[keyName + 'File'];
        }

        // Case-insensitive search as last resort
        if (!docContent) {
          const docTypeLower = docType.toLowerCase();
          const foundKey = Object.keys(documentArray).find(
            (key) => key.toLowerCase() === docTypeLower
          );
          if (foundKey) {
            docContent = documentArray[foundKey];
          }
        }
      }

      if (docContent) {
        // Handle different formats
        if (typeof docContent === 'string') {
          // Direct base64 string
          match = {
            id: docType,
            base64Content: docContent,
            fileName: docType,
          };
        } else if (typeof docContent === 'object') {
          // Object with properties
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
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              alignSelf: 'center',
            }}
          >
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
                // Simply pass the document ID to modal - it will handle fetching
                if (match.id) {
                  setViewDocument({
                    open: true,
                    documentId: match.id,
                    fileName: match.fileName || keyName,
                    fileType: initialFileType,
                  });
                } else if (match.base64Content) {
                  // Fallback: if we have base64Content directly
                  setViewDocument({
                    open: true,
                    base64Content: match.base64Content,
                    fileName: match.fileName || keyName,
                    fileType: initialFileType,
                  });
                }
              }}
              onKeyDown={async (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();

                  // If we have base64Content, use it directly
                  if (match.base64Content) {
                    setViewDocument({
                      open: true,
                      base64Content: match.base64Content,
                      fileName: match.fileName || keyName,
                      fileType: initialFileType,
                    });
                  } else if (match.id) {
                    // Otherwise, fetch using document ID - use blob MIME type for accurate detection
                    try {
                      const response = await fetch(
                        `${API_BASE_URL_RE}/api/v1/registration/fetch-document?id=${match.id}`
                      );

                      if (!response.ok) {
                        throw new Error(
                          `Failed to fetch document: ${response.status}`
                        );
                      }

                      const blob = await response.blob();

                      // Detect from blob MIME type
                      const actualType: 'pdf' | 'image' =
                        blob.type === 'application/pdf' ||
                        blob.type.includes('pdf')
                          ? 'pdf'
                          : 'image';

                      const reader = new FileReader();

                      reader.onloadend = () => {
                        const base64String = reader.result as string;
                        const base64Content = base64String.split(',')[1];

                        setViewDocument({
                          open: true,
                          base64Content: base64Content,
                          fileName: match.fileName || keyName,
                          fileType: actualType,
                        });
                      };

                      reader.readAsDataURL(blob);
                    } catch (error) {
                      setSnackbar({
                        open: true,
                        message: 'Failed to load document',
                        severity: 'error',
                      });
                    }
                  }
                }
              }}
            >
              {(() => {
                // Use detected file type if available, otherwise fall back to guess
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

                // For images, show image icon or thumbnail if we have base64
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
                      onError={(e) => {
                        // Replace with icon if image fails
                        const img = e.target as HTMLImageElement;
                        const parent = img.parentElement;
                        if (parent) {
                          img.style.display = 'none';
                          const iconBox = document.createElement('div');
                          iconBox.style.cssText =
                            'height: 54px; width: 54px; border: 1px solid #D1D1D1; border-radius: 4px; background-color: #F5F5F5; display: flex; align-items: center; justify-content: center;';
                          iconBox.innerHTML =
                            '<svg style="width: 32px; height: 32px; color: #1976d2;" viewBox="0 0 24 24"><path fill="currentColor" d="M21,19V5c0,-1.1 -0.9,-2 -2,-2H5c-1.1,0 -2,0.9 -2,2v14c0,1.1 0.9,2 2,2h14c1.1,0 2,-0.9 2,-2zM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5,-4.5z"/></svg>';
                          parent.insertBefore(iconBox, img);
                        }
                      }}
                    />
                  );
                }

                // Default: show image icon
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
        // Show loading indicator while fetching
        return (
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              alignSelf: 'center',
            }}
          >
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
      } else {
        // If we only have document ID, show placeholder icon
        return (
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              alignSelf: 'center',
            }}
          >
            <Box
              sx={{
                height: 54,
                width: 54,
                border: '1px solid #D1D1D1',
                borderRadius: '4px',
                backgroundColor: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Document available"
            >
              <Typography variant="caption" sx={{ fontSize: '18px' }}>
                📄
              </Typography>
            </Box>
          </Box>
        );
      }
    }

    return null;
  }

  const [selectedFields, setSelectedFields] =
    React.useState<SelectedFieldsState>({});

  // Modal states
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonType, setRejectReasonType] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [modifyReason, setModifyReason] = useState('');
  const [modifyError, setModifyError] = useState('');
  const [isRejectSuccessModal, setRejectSuccessModal] =
    useState<boolean>(false);
  const groupedFields = useSelector(
    (state: any) => state.applicationDetails?.data?.groupedFields || {}
  );
  const applicationDetailsData = useSelector(
    (state: any) => state.applicationDetailsdataAdmin?.data
  );

  const ackNo = useSelector(
    (state: any) =>
      state.applicationDetailsdataAdmin?.data?.payload?.application_esign
        ?.acknowledgementNo || ''
  );
  const renderValue = (field: any, sectionKey?: string) => {
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

    // Helper function to get raw country code value from data
    const getRawCountryCodeValue = (fieldName: string) => {
      if (!applicationDetailsData?.payload) return null;

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

      return findValueByFieldName(applicationDetailsData.payload, fieldName);
    };

    // Helper function to format country code fields
    const formatCountryCode = (
      value: any,
      fieldName: string,
      fieldInfo?: any
    ) => {
      const countryCodeFields = [
        'hoiCountryCode',
        'noCountryCode',
        'iauCountryCode1',
        'iauCountryCode2',
        'countryCode',
      ];

      if (countryCodeFields.some((field) => fieldName.includes(field))) {
        // If value is already a code like "+91", return as is
        if (typeof value === 'string' && value.startsWith('+')) {
          return value;
        }

        // If value is a country name, try to get the code dynamically
        if (typeof value === 'string' && value.trim() !== '') {
          // First, try to get the raw value from data
          const rawValue = getRawCountryCodeValue(fieldName);

          // If raw value is a code, use it
          if (
            rawValue &&
            typeof rawValue === 'string' &&
            rawValue.startsWith('+')
          ) {
            return `${value} (${rawValue})`;
          }

          // If fieldInfo has fieldOptions, try to find the code from options
          if (
            fieldInfo?.fieldOptions &&
            Array.isArray(fieldInfo.fieldOptions)
          ) {
            const option = fieldInfo.fieldOptions.find(
              (opt: any) => opt.name === value || opt.code === rawValue
            );
            if (
              option &&
              option.code &&
              typeof option.code === 'string' &&
              option.code.startsWith('+')
            ) {
              return `${value} (${option.code})`;
            }
          }
        }

        return value;
      }
      return value;
    };

    const dataPath = field.dataPath || field.valuePath || field.fieldPath;
    if (dataPath && applicationDetailsData?.payload) {
      let actualValue = getNestedValue(
        applicationDetailsData.payload,
        dataPath
      );

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

        // Check if this is a dropdown field and convert code to label
        if (
          field.fieldOptions &&
          field.fieldOptions.length > 0 &&
          (field.fieldType === 'select' || field.fieldType === 'dropdown')
        ) {
          actualValue = getDropdownLabel(actualValue, field.fieldOptions);
        }

        // Format country code if applicable
        actualValue = formatCountryCode(actualValue, field.fieldName);

        return actualValue;
      }
    }

    if (applicationDetailsData?.payload) {
      // Search through all nested objects for matching fieldName
      const findValueByFieldName = (obj: any, fieldName: string): any => {
        if (!obj || typeof obj !== 'object') return undefined;

        // Check current level
        if (obj[fieldName] !== undefined) return obj[fieldName];

        // Search nested objects
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findValueByFieldName(obj[key], fieldName);
            if (found !== undefined) return found;
          }
        }
        return undefined;
      };

      let value = findValueByFieldName(
        applicationDetailsData.payload,
        field.fieldName
      );

      if (value !== undefined && value !== null && value !== '') {
        if (
          field.fieldType === 'file' ||
          field.fieldType === 'upload' ||
          field.fieldType === 'document' ||
          field.fieldType === 'image'
        ) {
          return null;
        }

        // Handle dropdowns
        if (
          field.fieldOptions &&
          field.fieldOptions.length > 0 &&
          (field.fieldType === 'select' || field.fieldType === 'dropdown')
        ) {
          value = getDropdownLabel(value, field.fieldOptions);
        }

        // Format country code if applicable
        value = formatCountryCode(value, field.fieldName);

        return value;
      }
    }

    let fallbackValue = userDetailData?.entityDetails?.[field.fieldName];

    if (
      fallbackValue !== undefined &&
      fallbackValue !== null &&
      fallbackValue !== ''
    ) {
      if (
        field.fieldType === 'file' ||
        field.fieldType === 'upload' ||
        field.fieldType === 'document' ||
        field.fieldType === 'image'
      ) {
        return null; // Don't render anything - RenderDocumentFile will handle it
      }

      // Format country code if applicable
      fallbackValue = formatCountryCode(fallbackValue, field.fieldName);

      return fallbackValue;
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

  // Helper function to check if a condition is met
  const checkCondition = (condition: any, userData: any): boolean => {
    if (!condition || !condition.field) return false;

    // Use local getNestedValue helper
    const getFieldValue = (obj: any, path: string): any => {
      if (!path) return undefined;
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    // Try to get the field value - check multiple possible paths
    let fieldValue = getFieldValue(userData, condition.field);

    // If not found, try with entityDetails prefix
    if (fieldValue === undefined || fieldValue === null) {
      fieldValue = getFieldValue(userData, `entityDetails.${condition.field}`);
    }

    // If still not found, try direct lookup in entityDetails
    if (fieldValue === undefined || fieldValue === null) {
      fieldValue = userData?.entityDetails?.[condition.field];
    }

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'in':
        return (
          Array.isArray(condition.value) && condition.value.includes(fieldValue)
        );
      case 'notIn':
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue)
        );
      case 'isEmpty':
        return (
          !fieldValue ||
          (typeof fieldValue === 'string' && fieldValue.trim() === '')
        );
      case 'isNotEmpty':
        return (
          fieldValue &&
          (typeof fieldValue === 'string' ? fieldValue.trim() !== '' : true)
        );
      default:
        return false;
    }
  };

  const getDynamicFields = (key: string) => {
    const fields = groupedFields?.[key]?.fields || [];
    return fields.map((field: any) => {
      const dataSource = applicationDetailsData?.payload || userDetailData;

      // Process conditionalLogic to extract conditional requirements and validation rules
      let conditionalRequired =
        field.validationRules?.conditionalRequired || field.conditionalRequired;
      let mergedValidationRules = field.validationRules
        ? { ...field.validationRules }
        : {};

      // Handle new conditionalLogic format from API
      if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
        field.conditionalLogic.forEach((logic: any) => {
          if (logic.when && logic.then?.validationRules) {
            // Check if the condition is met
            const conditionMet = checkCondition(logic.when, dataSource);

            // Debug logging for GSTIN field
            if (field.fieldName === 'gstin') {
              console.log('GSTIN Field Debug:', {
                fieldName: field.fieldName,
                conditionField: logic.when.field,
                conditionOperator: logic.when.operator,
                conditionValue: logic.when.value,
                conditionMet,
                dataSource,
                mergedValidationRules,
              });
            }

            if (conditionMet) {
              // Merge validation rules from conditionalLogic
              mergedValidationRules = {
                ...mergedValidationRules,
                ...logic.then.validationRules,
              };
            }

            // Convert conditionalLogic to conditionalRequired format
            if (!conditionalRequired) {
              conditionalRequired = {
                requiredWhen: [],
              };
            }
            if (!conditionalRequired.requiredWhen) {
              conditionalRequired.requiredWhen = [];
            }

            // Add the condition
            conditionalRequired.requiredWhen.push({
              field: logic.when.field,
              operator: logic.when.operator,
              value: logic.when.value,
            });
          }
        });
      }

      const isRequired = isFieldRequired(
        field.fieldName,
        dataSource,
        mergedValidationRules?.required || false,
        conditionalRequired
      );

      return {
        key: field.fieldName,
        label: field.fieldLabel,
        value: renderValue(field, key),
        fieldType: field.fieldType,
        fieldOptions: field.fieldOptions,
        required: isRequired,
        documentType: field.documentType,
        documentKey: field.documentKey,
        ...field,
        validationRules: mergedValidationRules, // Use merged validation rules
      };
    });
  };

  const showRejectModal = () => {
    setRejectReasonError('');
    setIsRejectModalVisible(true);
  };

  const showModifyModal = () => setIsModifyModalVisible(true);
  const workFlowId = params.workFlowId || '';
  const userId = params.userId || '';

  const handleApprove = () => {
    const requestData = {
      workflowId: workFlowId,
      action: 'APPROVE',
      reason: 'Application approved',
      remarks: 'Application has been reviewed and approved',
    };

    dispatch(showLoader('Approving application...'));
    dispatch(updateApplicationStatus(requestData as any))
      .unwrap()
      .then(() => {
        dispatch(hideLoader());
        setIsApproveModalVisible(true);
      })
      .catch((error: any) => {
        dispatch(hideLoader());
        setSnackbar({
          open: true,
          message: error.message || 'Failed to approve application',
          severity: 'error',
        });
      });
  };

  const handleReject = () => {
    const requestData = {
      workflowId: workFlowId,
      action: 'REJECT',
      reason: rejectReason || '',
      remarks: rejectReason || '',
    };

    dispatch(showLoader('Rejecting application...'));
    dispatch(updateApplicationStatus(requestData as any))
      .unwrap()
      .then(() => {
        dispatch(hideLoader());
        setSnackbar({
          open: true,
          message: 'Application rejected successfully',
          severity: 'success',
        });
        setIsRejectModalVisible(false);
        setRejectReason('');
        setRejectReasonType('');
        setRejectSuccessModal(true);
      })
      .catch((error: any) => {
        dispatch(hideLoader());
        setSnackbar({
          open: true,
          message: error.message || 'Failed to reject application',
          severity: 'error',
        });
      });
  };

  const getSectionKeyFromGroupKey = (groupKey: string): string => {
    return groupKey;
  };

  React.useEffect(() => {
    if (!groupedFields || Object.keys(groupedFields).length === 0) return;

    const newSelectedFields: SelectedFieldsState = {};

    Object.keys(groupedFields).forEach((groupKey) => {
      const section = groupedFields[groupKey];
      const sectionKey = getSectionKeyFromGroupKey(groupKey);

      if (section?.fields) {
        newSelectedFields[sectionKey] = section.fields.map(
          (field: any) => field.fieldName
        );
      }
    });

    setSelectedFields(newSelectedFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedFields]);

  const getSectionKey = (title: string): string => {
    const matchingKey = Object.keys(groupedFields || {}).find((key) => {
      const section = groupedFields[key];
      return section?.sectionTitle === title || key === title;
    });
    return matchingKey || title;
  };

  const getDisplayTitle = (groupedFieldKey: string): string => {
    const section = groupedFields?.[groupedFieldKey];

    // If section has a predefined sectionTitle, use it
    if (section?.sectionTitle) {
      return section.sectionTitle;
    }

    // Dynamic mapping for group field keys to user-friendly labels
    const groupFieldLabelMap: Record<string, string> = {
      reEntityprofile: 'Entity Profile',
      reentityprofile: 'Entity Profile',
      registeraddress: 'Register Address',
      registerAddress: 'Register Address',
      correspondenceaddress: 'Correspondence Address',
      correspondenceAddress: 'Correspondence Address',
      reHoi: 'Head of Institutional Details',
      rehoi: 'Head of Institutional Details',
      reNodal: 'Nodal Officer Details',
      renodal: 'Nodal Officer Details',
      adminone: 'Institutional Admin User 1 Details',
      adminOne: 'Institutional Admin User 1 Details',
      admintwo: 'Institutional Admin User 2 Details',
      adminTwo: 'Institutional Admin User 2 Details',
      // Additional common variations
      entityProfile: 'Entity Profile',
      entityprofile: 'Entity Profile',
      headOfInstitution: 'Head of Institutional Details',
      headofinstitution: 'Head of Institutional Details',
      nodalOfficer: 'Nodal Officer Details',
      nodalofficer: 'Nodal Officer Details',
    };

    // Try to find a match in the mapping (case-insensitive)
    const mappedLabel = groupFieldLabelMap[groupedFieldKey];
    if (mappedLabel) {
      return mappedLabel;
    }

    // Fallback: Try case-insensitive lookup
    const keyLower = groupedFieldKey.toLowerCase();
    const foundKey = Object.keys(groupFieldLabelMap).find(
      (k) => k.toLowerCase() === keyLower
    );
    if (foundKey) {
      return groupFieldLabelMap[foundKey];
    }

    // Final fallback: Convert camelCase/PascalCase to Title Case
    // e.g., "reEntityProfile" -> "Re Entity Profile"
    return groupedFieldKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  const getApiKeyFromGroupKey = (groupKey: string): string => {
    const section = groupedFields?.[groupKey];
    return section?.apiKey || groupKey.toUpperCase();
  };

  React.useEffect(() => {
    const fieldsToCheck = applicationDetailsData?.modifiableFields;

    if (fieldsToCheck && Object.keys(fieldsToCheck).length > 0) {
      setSelectedFields((prevState) => {
        const newState = { ...prevState };

        Object.keys(groupedFields || {}).forEach((groupedFieldKey) => {
          const apiKey = getApiKeyFromGroupKey(groupedFieldKey);
          const sectionModifiableFields = fieldsToCheck[apiKey];

          if (
            sectionModifiableFields &&
            Array.isArray(sectionModifiableFields) &&
            sectionModifiableFields.length > 0
          ) {
            const sectionKey = getSectionKeyFromGroupKey(groupedFieldKey);

            if (!sectionKey) return;

            const currentSelectedFields = newState[sectionKey] || [];

            const filteredFields = currentSelectedFields.filter((fieldKey) => {
              return !sectionModifiableFields.includes(fieldKey);
            });

            newState[sectionKey] = filteredFields;
          }
        });

        return newState;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationDetailsData?.modifiableFields, groupedFields]);

  const getAllSectionFields = (section: string): string[] => {
    if (!groupedFields?.[section]) {
      return [];
    }

    const fields = groupedFields[section]?.fields || [];
    const fieldNames = fields.map((field: any) => field.fieldName);

    return fieldNames;
  };

  const getToggledFields = (section: string): string[] => {
    const allFields = getAllSectionFields(section);
    return allFields.filter(
      (field) => !selectedFields[section]?.includes(field)
    );
  };

  interface FieldMappings {
    [key: string]: { [key: string]: string };
  }

  const mapToApiFields = (
    section: string,
    internalFields: string[]
  ): string[] => {
    const fieldMappings: FieldMappings = {
      entityDetails: {},
      addressDetails: {},
      headOfInstitutionDetails: {},
      nodalOfficerDetails: {},
      institutionAdminDetails: {},
    };

    const mappedFields = internalFields.map((field) => {
      if (section === 'addressDetails') {
        const sectionMappings = fieldMappings[section];
        if (sectionMappings) {
          if (field.startsWith('registered')) {
            const fieldKey = field.replace('registered', 'registered');
            return sectionMappings[fieldKey] || field;
          } else if (field.startsWith('correspondence')) {
            const fieldKey = field.replace('correspondence', 'correspondence');
            return sectionMappings[fieldKey] || field;
          }
        }
      }

      if (section === 'adminOneDetails' || section === 'adminTwoDetails') {
        const prefix =
          section === 'adminOneDetails' ? 'adminOne.' : 'adminTwo.';
        const sectionMappings = fieldMappings['institutionAdminDetails'];
        const mappedField = sectionMappings
          ? sectionMappings[field]
          : undefined;
        return mappedField ? `${prefix}${mappedField}` : field;
      }

      const sectionMappings = fieldMappings[section];
      return sectionMappings ? sectionMappings[field] || field : field;
    });

    return mappedFields;
  };

  const handleModify = () => {
    if (!modifyReason.trim()) {
      setModifyError('Modification reason is required');
      return;
    }

    const modifiableFields: any = {};

    // Iterate through groupedFields dynamically
    Object.keys(groupedFields || {}).forEach((groupedFieldKey) => {
      const sectionKey = getSectionKeyFromGroupKey(groupedFieldKey);

      if (!sectionKey) {
        return;
      }

      // Get toggled fields for this section
      const toggledFields = getToggledFields(sectionKey);

      // If there are toggled fields, add them to modifiableFields
      if (toggledFields.length > 0) {
        const apiKey = getApiKeyFromGroupKey(groupedFieldKey);

        // Use the API key from section metadata or default to toggled fields
        modifiableFields[apiKey] = toggledFields;
      }
    });

    // ✅ Final payload
    const requestData: any = {
      workflowId: workFlowId,
      action: 'REQUEST_FOR_MODIFICATION',
      reason: modifyReason,
      remarks: modifyReason || '',
      modifiableFields: modifiableFields,
    };

    dispatch(showLoader('Requesting modification...'));
    dispatch(updateApplicationStatus(requestData as any))
      .unwrap()
      .then(() => {
        dispatch(hideLoader());
        setIsModifyModalVisible(false);
        setModifyReason('');
        setModifyError('');
        setSnackbar({
          open: true,
          message: 'Modification request submitted successfully',
          severity: 'success',
        });
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      })
      .catch((error: any) => {
        dispatch(hideLoader());
        setSnackbar({
          open: true,
          message: error.message || 'Failed to submit modification request',
          severity: 'error',
        });
      });
  };

  const handleModifyReasonChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setModifyReason(e.target.value);
    if (e.target.value.trim()) {
      setModifyError('');
    }
  };

  const handleCancel = () => {
    setIsApproveModalVisible(false);
    setIsRejectModalVisible(false);
    setIsModifyModalVisible(false);
    setRejectReason('');
    setModifyReason('');
  };

  const hasSelectedCheckboxes = React.useMemo(() => {
    const sectionKeys = Object.keys(selectedFields);
    return sectionKeys.some((section) => {
      const allSectionFields = getAllSectionFields(section);
      const selectedSectionFields = selectedFields[section] || [];
      return allSectionFields.some(
        (field) => !selectedSectionFields.includes(field)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFields]);

  const isFieldToggleable = (
    section: keyof SelectedFieldsState,
    fieldKey: string
  ): boolean => {
    const restrictedSections = [
      'headOfInstitutionDetails',
      'nodalOfficerDetails',
      'adminOneDetails',
      'adminTwoDetails',
    ];

    const restrictedFields = [
      'title',
      'firstName',
      'middleName',
      'lastName',
      'gender',
    ];

    if (restrictedSections.includes(section)) {
      return !restrictedFields.some((field) =>
        fieldKey.toLowerCase().includes(field.toLowerCase())
      );
    }

    return true;
  };
  const toggleFieldValidation = (
    section: keyof SelectedFieldsState,
    fieldKey: string
  ) => {
    // Ensure dependent fields toggle together when a parent (e.g., State/Country) is toggled
    const dependentFieldMap: Record<string, string[]> = {
      regulator: ['institutionType', 'gstin'],
      registerCountry: [
        'registerState',
        'registerDistrict',
        'registerCity',
        'registerPincode',
        'registerDigipin',
      ],
      registerState: [
        'registerDistrict',
        'registerCity',
        'registerPincode',
        'registerDigipin',
      ],
      correspondenceCountry: [
        'correspondenceState',
        'correspondenceDistrict',
        'correspondenceCity',
        'correspondencePincode',
        'correspondenceDigipin',
      ],
      correspondenceState: [
        'correspondenceDistrict',
        'correspondenceCity',
        'correspondencePincode',
        'correspondenceDigipin',
      ],
      noRegisterCountry: [
        'noRegisterState',
        'noRegisterDistrict',
        'noRegisterCity',
        'noRegisterPincode',
        'noRegisterDigipin',
      ],
      noRegisterState: [
        'noRegisterDistrict',
        'noRegisterCity',
        'noRegisterPincode',
        'noRegisterDigipin',
      ],
      // Citizenship -> CKYC dependencies
      hoiCitizenship: ['hoiCkycNumber', 'hoiCkycNo'],
      noCitizenship: ['noCkycNumber', 'noCkycNo'],
      iauCitizenship1: ['iauCkycNumber1', 'adminOneCkycNumber'],
      iauCitizenship2: ['iauCkycNumber2', 'adminTwoCkycNumber'],
      adminOneCitizenship: ['adminOneCkycNumber', 'iauCkycNumber1'],
      adminTwoCitizenship: ['adminTwoCkycNumber', 'iauCkycNumber2'],
      iau_citizenship_1: ['iauCkycNumber1', 'adminOneCkycNumber'],
      iau_citizenship_2: ['iauCkycNumber2', 'adminTwoCkycNumber'],
      // Proof of Identity -> Number + Document dependencies
      hoiProofOfIdentity: [
        'hoiProofOfIdentityNumber',
        'hoiProofOfIdentityNumberFile',
      ],
      hoiCountryCode: ['hoiMobile'],
      hoiMobile: ['hoiCountryCode'],
      noCountryCode: ['noMobileNumber'],
      noMobileNumber: ['noCountryCode'],
      noProofOfIdentity: [
        'noProofOfIdentityNumber',
        'noProofOfIdentityNumberFile',
      ],
      iauCountryCode1: ['iauMobileNumber1'],
      iauMobileNumber1: ['iauCountryCode1'],
      iauCountryCode2: ['iauMobileNumber2'],
      iauMobileNumber2: ['iauCountryCode2'],
      iauProofOfIdentity1: [
        'iauProofOfIdentityNumber1',
        'iauProofOfIdentityNumber1File',
      ],
      iauProofOfIdentity2: [
        'iauProofOfIdentityNumber2',
        'iauProofOfIdentityNumber2File',
      ],
      adminOneProofOfIdentity: [
        'adminOneProofOfIdentityNumber',
        'adminOneProofOfIdentityNumberFile',
      ],
      adminTwoProofOfIdentity: [
        'adminTwoProofOfIdentityNumber',
        'adminTwoProofOfIdentityNumberFile',
      ],
      iauCountry1: [
        'iauState1',
        'iauDistrict1',
        'iauCity1',
        'iauPincode1',
        'iauPincodeOther1',
        'iauDigipin1',
      ],
      iauCountry2: [
        'iauState2',
        'iauDistrict2',
        'iauCity2',
        'iauPincode2',
        'iauPincodeOther2',
        'iauDigipin2',
      ],
      iauState1: [
        'iauDistrict1',
        'iauCity1',
        'iauPincode1',
        'iauPincodeOther1',
        'iauDigipin1',
      ],
      iauState2: [
        'iauDistrict2',
        'iauCity2',
        'iauPincode2',
        'iauPincodeOther2',
        'iauDigipin2',
      ],
      constitution: ['proprietorName', 'cin', 'llpin', 'pan'],
    };

    const dependentFields = dependentFieldMap[fieldKey] || [];

    if (!isFieldToggleable(section, fieldKey)) {
      setSnackbar({
        open: true,
        message: 'This field cannot be modified',
        severity: 'warning',
      });
      return;
    }

    setSelectedFields((prev) => {
      if (!prev[section]) {
        return prev;
      }

      const currentSectionFields = prev[section] || [];
      const isSelected = currentSectionFields.includes(fieldKey);
      const updatedSet = new Set(currentSectionFields);

      if (isSelected) {
        // Mark for modification: remove the field and its dependents
        updatedSet.delete(fieldKey);
        dependentFields.forEach((dep) => updatedSet.delete(dep));
      } else {
        // Keep as-is: add back the field and ensure dependents are included
        updatedSet.add(fieldKey);
        dependentFields.forEach((dep) => updatedSet.add(dep));
      }

      return {
        ...prev,
        [section]: Array.from(updatedSet),
      };
    });
  };
  const applicationId =
    params.acknowledgementNo ||
    params.id ||
    params.applicationId ||
    params.userId;

  useEffect(() => {
    const loadData = async () => {
      if (!applicationId) {
        return;
      }
      dispatch(showLoader());
      try {
        await dispatch(
          fetchApplicationDetailsAdmincms({ workFlowId, userId })
        ).then((detail: any) => {
          setUserDetailData(detail?.payload);
        });
      } catch (error) {
        // Error handled silently
      } finally {
        dispatch(hideLoader());
      }
    };
    loadData();
  }, [applicationId, dispatch, params, workFlowId, userId]);
  useEffect(() => {
    const loadFormFields = async () => {
      dispatch(showLoader());
      try {
        // Dispatch your fetchFields thunk
        await dispatch(fetchFields()).then((response: any) => {
          /* eslint-disable no-empty */
          if (response?.payload) {
            // Extract validation rules from form fields
            const rulesMap: Record<string, any> = {};
            if (Array.isArray(response.payload)) {
              response.payload.forEach((field: any) => {
                if (field.fieldName && field.validationRules) {
                  rulesMap[field.fieldName] = {
                    required: field.validationRules.required || false,
                    maxLength: field.validationRules.maxLength
                      ? parseInt(field.validationRules.maxLength)
                      : null,
                    regex: field.validationRules.regx || null,
                    requiredMessage:
                      field.validationRules.requiredMessage ||
                      'This field is required',
                    regexMessage:
                      field.validationRules.regsMessage || 'Invalid format',
                  };
                }
              });
              setValidationRules(rulesMap);
            }
          }
          /* eslint-enable no-empty */
        });
      } catch (error) {
        // Error handled silently
      } finally {
        dispatch(hideLoader());
      }
    };

    loadFormFields();
  }, [dispatch]);

  // Fetch document content when documents are available
  useEffect(() => {
    const fetchDocumentContent = async () => {
      // Check for document object (singular) first
      const documentObj =
        applicationDetailsData?.document ||
        applicationDetailsData?.payload?.document;
      const documentsArray =
        applicationDetailsData?.payload?.documents ||
        applicationDetailsData?.documents;

      // Convert document object to array if needed
      let docsToFetch: any[] = [];

      if (
        documentObj &&
        typeof documentObj === 'object' &&
        !Array.isArray(documentObj)
      ) {
        // Convert object like { panFile: "id123", cinFile: "id456" } to array
        docsToFetch = Object.entries(documentObj)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              // Value is just the ID
              return { id: value, type: key, documentType: key, fieldKey: key };
            } else if (typeof value === 'object' && value !== null) {
              // Value is an object with properties - PRESERVE fieldKey if it exists
              const valueObj = value as any;
              return {
                ...valueObj,
                // Keep the original fieldKey if it exists, otherwise use the object key
                fieldKey: valueObj.fieldKey || key,
                // Also set type and documentType for fallback matching
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

      if (!docsToFetch || docsToFetch.length === 0) {
        return;
      }

      setLoadingDocuments(true);
      const documentsWithBase64: DocumentFile[] = [];

      try {
        // Fetch documents in parallel
        await Promise.all(
          docsToFetch.map(async (doc: any) => {
            try {
              const response = await Secured.get(
                `${API_ENDPOINTS.fetch_document}?id=${doc.id}`,
                {
                  responseType: 'blob',
                }
              );

              const blob = response.data;
              const contentType =
                response.headers['content-type'] || 'application/octet-stream';

              // Convert blob to base64
              const base64Content = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  // Remove data URL prefix to get only base64
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
                // Ensure fieldKey, type, and documentType are all set for matching
                fieldKey: doc.fieldKey || doc.type,
                type: doc.fieldKey || doc.type,
                documentType: doc.fieldKey || doc.type,
              });
            } catch (error) {
              // Error handled silently
            }
          })
        );

        setDocumentsWithContent(documentsWithBase64);
      } catch (error) {
        // Error handled silently
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocumentContent();
  }, [
    applicationDetailsData?.document,
    applicationDetailsData?.payload?.document,
    applicationDetailsData?.documents,
    applicationDetailsData?.payload?.documents,
  ]);
  if (!applicationId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Error</Typography>
          <Typography>No application ID found in URL.</Typography>
          <Typography>
            Please ensure you are accessing this page with a valid URL that
            includes an application ID.
          </Typography>
          <Typography>Example: /request-details/ABC123</Typography>
        </Alert>
      </Box>
    );
  }

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

  const isDropdownField = (fieldType: string): boolean => {
    return (
      fieldType === 'dropdown' ||
      fieldType === 'select' ||
      fieldType === 'dropdown-select'
    );
  };

  // Helper function to check if field is a CKYC number field and if it's verified
  const isCkycFieldVerified = (fieldKey: string, fieldValue: any): boolean => {
    const ckycFields = [
      'hoiCkycNumber',
      'hoiCkycNo', // Alternative field name for HOI CKYC
      'noCkycNumber',
      'iauCkycNumber1',
      'iauCkycNumber2',
      'adminOneCkycNumber',
      'adminTwoCkycNumber',
    ];

    // Check if this is a CKYC field and has a value (14 digits means verified)
    if (ckycFields.includes(fieldKey)) {
      // CKYC number should be 14 digits to be considered verified
      return (
        fieldValue && typeof fieldValue === 'string' && fieldValue.length === 14
      );
    }

    return false;
  };

  // Helper function to evaluate if a field is required based on validation rules and conditional logic
  const checkIfFieldRequired = (field: any, allFields: any[]): boolean => {
    const fieldKey = field.key || field.fieldName;

    // Check if this is a "pincodeOther" type field and mark it as required
    const pincodeOtherFields = [
      'registerPincodeOther',
      'correspondencePincodeOther',
      'noRegisterPincodeOther',
      'iauPincodeOther1',
      'iauPincodeOther2',
      'adminOneRegisterPincodeOther',
      'adminTwoRegisterPincodeOther',
    ];

    if (pincodeOtherFields.includes(fieldKey)) {
      return true;
    }

    const constitutionField = allFields.find(
      (f) =>
        f.key === 'constitution' ||
        f.fieldName === 'constitution' ||
        f.label?.toLowerCase() === 'constitution'
    );

    const constitutionValue = constitutionField?.value;

    if (fieldKey === 'proprietorName') {
      return constitutionValue === 'Sole Proprietorship';
    }

    // LLPIN required ONLY for LLP
    if (fieldKey === 'llpin') {
      return constitutionValue === 'Limited Liability Partnership';
    }

    // CIN required ONLY for Company types
    if (fieldKey === 'cin') {
      return [
        'Private Limited Company',
        'Public Limited Company',
        'Section 8 Companies (Companies Act, 2013)',
      ].includes(constitutionValue);
    }

    const regulatorField = allFields.find(
      (f) =>
        f.key === 'regulator' ||
        f.fieldName === 'regulator' ||
        f.label?.toLowerCase() === 'regulator'
    );

    const regulatorValue = regulatorField?.value;

    if (fieldKey === 'gstin') {
      // GSTIN NOT required when regulator = IFSCA
      if (regulatorValue === 'IFSCA') {
        return false; // not required
      }

      // Required for all other regulators
      return true;
    }

    // First check if field has direct validationRules with required = true or "true"
    if (field.validationRules && field.validationRules.required) {
      // Handle both boolean true and string "true"
      if (
        field.validationRules.required === true ||
        field.validationRules.required === 'true'
      ) {
        return true;
      }
    }

    // If no direct validationRules or required is not true, check conditionalLogic
    if (field.conditionalLogic && Array.isArray(field.conditionalLogic)) {
      for (const condition of field.conditionalLogic) {
        if (condition.when && condition.then) {
          const {
            field: dependentFieldName,
            operator,
            value: conditionValue,
          } = condition.when;

          // Find the dependent field in allFields - check multiple name variations
          const dependentField = allFields.find((f) => {
            const fieldKey = f.key || f.fieldName;
            const fieldNameOnly = f.fieldName;

            // Direct match
            if (
              fieldKey === dependentFieldName ||
              fieldNameOnly === dependentFieldName
            ) {
              return true;
            }

            // Handle field name variations (e.g., iauCitizenship1 vs adminOneCitizenship vs iau_citizenship_1)
            const fieldNameMappings: Record<string, string[]> = {
              iauCitizenship1: [
                'adminOneCitizenship',
                'iauCitizenship1',
                'iau_citizenship_1',
              ],
              iauCitizenship2: [
                'adminTwoCitizenship',
                'iauCitizenship2',
                'iau_citizenship_2',
              ],
              adminOneCitizenship: [
                'iauCitizenship1',
                'adminOneCitizenship',
                'iau_citizenship_1',
              ],
              adminTwoCitizenship: [
                'iauCitizenship2',
                'adminTwoCitizenship',
                'iau_citizenship_2',
              ],
              iau_citizenship_1: [
                'iauCitizenship1',
                'adminOneCitizenship',
                'iau_citizenship_1',
              ],
              iau_citizenship_2: [
                'iauCitizenship2',
                'adminTwoCitizenship',
                'iau_citizenship_2',
              ],
            };

            const alternativeNames = fieldNameMappings[dependentFieldName];
            if (alternativeNames) {
              return (
                alternativeNames.includes(fieldKey) ||
                alternativeNames.includes(fieldNameOnly)
              );
            }

            return false;
          });

          if (dependentField) {
            const dependentFieldValue = dependentField.value;

            // Evaluate the condition
            let conditionMet = false;
            if (operator === 'equals' || operator === '==') {
              conditionMet = dependentFieldValue === conditionValue;

              // Handle common variations: "India" vs "Indian"
              if (
                (!conditionMet &&
                  conditionValue === 'India' &&
                  dependentFieldValue === 'Indian') ||
                (conditionValue === 'Indian' && dependentFieldValue === 'India')
              ) {
                conditionMet = true;
              }
            } else if (operator === 'not_equals' || operator === '!=') {
              conditionMet = dependentFieldValue !== conditionValue;
            }

            // If condition is met, apply the validation rules from then clause
            if (conditionMet && condition.then.validationRules) {
              return condition.then.validationRules.required === true;
            }
          }
        }
      }
    }

    // Fallback to field.required property
    return field.required === true;
  };

  const handleSectionCheckmarkClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
    sectionKey: keyof SelectedFieldsState
  ) => {
    e.stopPropagation();
    const allFields = getAllSectionFields(sectionKey);
    const currentSectionFields = selectedFields[sectionKey] || [];
    const allSelected = allFields.every((field) =>
      currentSectionFields.includes(field)
    );
    setSelectedFields((prev) => ({
      ...prev,
      [sectionKey]: allSelected ? [] : [...allFields],
    }));
  };

  // Helper function to check if a field should be visible based on conditional logic
  const shouldShowField = (field: any, fields: any[]): boolean => {
    const fieldName = field.key || field.fieldName;

    // Check if this is a "pincodeOther" type field
    const pincodeOtherFields = [
      'registerPincodeOther',
      'correspondencePincodeOther',
      'noRegisterPincodeOther',
      'iauPincodeOther1',
      'iauPincodeOther2',
      'adminOneRegisterPincodeOther',
      'adminTwoRegisterPincodeOther',
    ];

    if (pincodeOtherFields.includes(fieldName)) {
      // Find the parent pincode field
      const parentPincodeFieldName = fieldName.replace('Other', '');
      const parentField = fields.find(
        (f) => (f.key || f.fieldName) === parentPincodeFieldName
      );

      if (parentField) {
        const parentValue = parentField.value;

        const isOther =
          parentValue === 'Other' ||
          parentValue === 'Others' ||
          parentValue === 'other';

        return isOther;
      }

      // If parent field not found, don't show the "other" field
      return false;
    }

    // For all other fields, show them if they have a value or are file fields
    return true;
  };

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
    // Use the groupedFieldKey directly as the section key (fully dynamic)
    const sectionKey = groupedFieldKey || getSectionKey(title);
    const validFields = fields.filter((field) => {
      // First check if field should be shown based on conditional logic
      if (!shouldShowField(field, fields)) {
        return false;
      }

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
    const allSectionFields = getAllSectionFields(sectionKey);
    const selectedSectionFields = selectedFields[sectionKey] || [];
    const allFieldsSelected =
      allSectionFields.length > 0 &&
      allSectionFields.every((field) => selectedSectionFields.includes(field));
    const isRequestedModifiedFields = requestedModifiedFields.find(
      (item) => item.entityName === sectionKey
    );

    return (
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${sectionKey}-content`}
          id={`${sectionKey}-header`}
          sx={{
            backgroundColor: isRequestedModifiedFields ? '#FFD952' : '#E6EBFF',
          }}
        >
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Box
                className="section-status-icon"
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={(e) => handleSectionCheckmarkClick(e, sectionKey)}
              >
                {allFieldsSelected ? (
                  <Box
                    sx={{
                      borderStyle: 'solid',
                      borderWidth: 2,
                      borderColor: 'gray',
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      borderRadius: 1,
                      backgroundColor: '#003CFF',
                    }}
                  >
                    <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                  </Box>
                )}
              </Box>
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
            </Box>
          </Box>
        </StyledAccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Grid container>
            {validFields.map((field, index) => {
              const fieldKey = field.key || field.label;
              const isSelected = (selectedFields[sectionKey] || []).includes(
                fieldKey
              );
              const isCheckbox = isCheckboxField(fieldKey, field.label);

              // Render checkbox fields differently
              if (isCheckbox) {
                const isChecked =
                  field.value === true ||
                  field.value === 'true' ||
                  field.value === 'Yes';
                return (
                  <Grid
                    size={{ xs: 12 }}
                    key={index}
                    sx={{
                      px: 2,
                      py: 1.5,
                      backgroundColor: '#fff',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
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
                          borderColor: 'gray',
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          backgroundColor: isChecked ? 'gray' : 'transparent',
                          cursor: 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isChecked && (
                          <CheckBoxIcon
                            fontSize="small"
                            sx={{ color: 'white' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              }

              return (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{
                    p: 2,
                    backgroundColor: '#fff',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      position: 'relative',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFieldToggleable(sectionKey, fieldKey)) {
                            toggleFieldValidation(sectionKey, fieldKey);
                          }
                        }}
                        sx={{
                          padding: 0.5,
                          cursor: isFieldToggleable(sectionKey, fieldKey)
                            ? 'pointer'
                            : 'not-allowed',
                          opacity: isFieldToggleable(sectionKey, fieldKey)
                            ? 1
                            : 0.5,
                        }}
                        title={
                          isFieldToggleable(sectionKey, fieldKey)
                            ? isSelected
                              ? 'Approved - Click to reject'
                              : 'Rejected - Click to approve'
                            : 'This field cannot be modified'
                        }
                      >
                        {isSelected ? (
                          <Box
                            sx={{
                              borderStyle: 'solid',
                              borderWidth: 2,
                              borderColor: 'gray',
                              width: 20,
                              height: 20,
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              borderRadius: 1,
                              backgroundColor: '#003CFF',
                            }}
                          >
                            <CloseIcon
                              fontSize="small"
                              sx={{ color: 'white' }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        pr: 1,
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          marginTop: '5px',
                          fontFamily: 'Gilroy, sans-serif',
                          color: 'black',
                          fontWeight: '600',
                          backgroundColor: isRequestedModifiedFields
                            ? isRequestedModifiedFields.requestFields.includes(
                                fieldKey
                              )
                              ? '#FFD952'
                              : undefined
                            : undefined,
                        }}
                      >
                        {field.label}{' '}
                        {checkIfFieldRequired(field, fields) && (
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
                                  // For long employ codes
                                  ...(field.label
                                    .toLowerCase()
                                    .includes('employ code') &&
                                    field.value &&
                                    field.value.length > 20 && {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontFamily: 'monospace',
                                      fontSize: '0.8rem',
                                    }),
                                }}
                              >
                                {field.label
                                  .toLowerCase()
                                  .includes('employ code') &&
                                field.value &&
                                field.value.length > 20
                                  ? field.value.substring(0, 20) + '...'
                                  : field.value || '-'}
                              </Typography>
                            </Tooltip>
                            {isDateField(field.key || '', field.label) && (
                              <CalendarTodayIcon
                                sx={{
                                  color: '#666',
                                  fontSize: '20px',
                                  ml: 1,
                                }}
                              />
                            )}
                            {field.fieldType &&
                              isDropdownField(field.fieldType) && (
                                <KeyboardArrowDownIcon
                                  sx={{
                                    color: '#666',
                                    fontSize: '20px',
                                    ml: 1,
                                  }}
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
                            } else if (applicationDetailsData?.document) {
                              docSource = applicationDetailsData.document;
                            } else if (
                              applicationDetailsData?.payload?.document
                            ) {
                              docSource =
                                applicationDetailsData.payload.document;
                            } else if (userDetailData?.documents) {
                              docSource = userDetailData.documents;
                            } else if (userDetailData?.document) {
                              docSource = userDetailData.document;
                            } else if (
                              applicationDetailsData?.payload?.documents
                            ) {
                              docSource =
                                applicationDetailsData.payload.documents;
                            } else if (applicationDetailsData?.documents) {
                              docSource = applicationDetailsData.documents;
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
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>
    );
  };

  return (
    <Box sx={requestDetailsStyles.container}>
      <Box sx={requestDetailsStyles.backButtonContainer}>
        <Button
          startIcon={<ArrowBackIcon sx={{ color: 'black' }} />}
          onClick={() => navigate(-1)}
          sx={requestDetailsStyles.backButton}
        >
          Back
        </Button>
      </Box>
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          {
            label: 'RE Registration',
            href: '/ckycrr-admin/my-task/re-registration',
          },
          {
            label: 'New Registration',
            href: '/ckycrr-admin/my-task/new-request',
          },
          {
            label:
              applicationDetailsData?.payload?.entityDetails
                ?.nameOfInstitution || '',
          },
        ]}
      />
      <Box sx={{ paddingY: 2 }}>
        <Typography variant="h5" sx={requestDetailsStyles.pageTitle}>
          Registration Details [{ackNo}]
        </Typography>
      </Box>

      <Box sx={requestDetailsStyles.signedDocContainer}>
        <Typography
          variant="subtitle1"
          sx={requestDetailsStyles.signedDocLink}
          onClick={async () => {
            try {
              // Find signed document from API
              const documents =
                applicationDetailsData?.document ||
                applicationDetailsData?.payload?.document ||
                applicationDetailsData?.documents ||
                applicationDetailsData?.payload?.documents ||
                [];

              let signedDoc = null;
              if (Array.isArray(documents)) {
                signedDoc = documents.find(
                  (doc) =>
                    doc.fieldKey ===
                      'registration_signed_application_pdf.pdf' ||
                    doc.fieldKey?.includes('registration_signed') ||
                    doc.fieldKey?.includes('signed_application')
                );
              }

              if (signedDoc && signedDoc.id) {
                // Fetch the document using the ID
                const response = await fetch(
                  `${API_BASE_URL_RE}/api/v1/registration/fetch-document?id=${signedDoc.id}`
                );

                if (!response.ok) {
                  throw new Error('Failed to fetch document');
                }

                const blob = await response.blob();
                const reader = new FileReader();

                reader.onloadend = () => {
                  const base64String = reader.result as string;
                  const base64Content = base64String.split(',')[1];

                  setViewDocument({
                    open: true,
                    base64Content: base64Content,
                    fileName: 'Signed Registration Application',
                    fileType: 'pdf',
                  });
                };

                reader.readAsDataURL(blob);
              } else {
                setSnackbar({
                  open: true,
                  message: 'Signed document not found',
                  severity: 'warning',
                });
              }
            } catch (error) {
              setSnackbar({
                open: true,
                message: 'Failed to load signed document',
                severity: 'error',
              });
            }
          }}
        >
          View Signed Document
        </Typography>
      </Box>

      <Box sx={requestDetailsStyles.instructionsContainer}>
        <Typography sx={{ fontWeight: 600 }}>Instructions</Typography>
        <ul style={requestDetailsStyles.instructionsList}>
          <li>
            <Typography>
              Select the tab checkbox to mark all fields in the tab for
              modification.
            </Typography>
          </li>
          <li>
            <Typography>
              Select the checkbox beside a field name to mark only that specific
              field for modification.
            </Typography>
          </li>
        </ul>
      </Box>

      <Box>
        {Object.keys(groupedFields).map((key) => {
          const section = groupedFields[key];
          const sectionLabel = getDisplayTitle(key); // Use proper display title
          return (
            <React.Fragment key={key}>
              {renderSection(sectionLabel, getDynamicFields(key), key)}
            </React.Fragment>
          );
        })}
      </Box>

      <Box sx={requestDetailsStyles.actionButtonsContainer}>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={showRejectModal}
          sx={requestDetailsStyles.rejectButton}
        >
          Reject
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={showModifyModal}
          disabled={!hasSelectedCheckboxes}
          sx={requestDetailsStyles.modifyButton}
        >
          Request for Modification
        </Button>
        <Button
          variant="contained"
          onClick={handleApprove}
          disabled={hasSelectedCheckboxes}
          sx={requestDetailsStyles.approveButton}
        >
          Approve
        </Button>
      </Box>

      {/* Approve Modal */}
      <Modal
        open={isApproveModalVisible}
        onClose={handleCancel}
        aria-labelledby="approve-modal-title"
        aria-describedby="approve-modal-description"
        sx={requestDetailsStyles.modalContainer}
      >
        <Box sx={requestDetailsStyles.modalBox}>
          <CheckCircleOutlineIcon sx={requestDetailsStyles.successIcon} />
          <Typography
            id="approve-modal-title"
            variant="h5"
            sx={requestDetailsStyles.modalTitle}
          >
            Application is Approved!
          </Typography>
          <Typography
            id="approve-modal-description"
            sx={requestDetailsStyles.modalDescription}
          >
            {(() => {
              const status =
                applicationDetailsData?.payload?.approval?.approvalStatus;
              const hasApprovalWorkflow =
                applicationDetailsData?.payload?.approvalWorkflow;

              if (status === 'SUBMITTED' || !hasApprovalWorkflow) {
                return 'Application has been reviewed and submitted for Level 2 approval';
              }
              return 'Application has been reviewed and approved successfully';
            })()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setIsApproveModalVisible(false);
              navigate(-1);
            }}
            fullWidth
            sx={requestDetailsStyles.okButton}
          >
            Okay
          </Button>
        </Box>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={isRejectModalVisible}
        onClose={handleCancel}
        aria-labelledby="reject-modal-title"
        aria-describedby="reject-modal-description"
        sx={requestDetailsStyles.modalContainer}
      >
        <Box sx={requestDetailsStyles.modalBoxLarge}>
          <Box sx={requestDetailsStyles.iconContainer}>
            <CancelIcon sx={requestDetailsStyles.cancelIcon} />
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Are you sure you want to reject
            <br />
            this request?
          </Typography>
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
              Remark
            </Typography>
            <TextField
              multiline
              rows={4}
              placeholder="Enter remark for rejection"
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button variant="outlined" fullWidth onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleReject}
                sx={{
                  backgroundColor: '#002CBA',
                  '&:hover': { backgroundColor: '#001a8b' },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modify Modal */}
      <Modal
        open={isModifyModalVisible}
        onClose={handleCancel}
        aria-labelledby="modify-modal-title"
        aria-describedby="modify-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            borderRadius: '8px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component="img"
              src={reqForModificationImage}
              alt="Reject Request"
              sx={{ width: 64, height: 64, mb: 2 }}
            />
          </Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            The application will be sent to the nodal
            <br />
            officer or RE for modifications
          </Typography>
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Modification Remark<span style={{ color: 'red' }}>*</span>
            </Typography>
            <TextField
              multiline
              rows={4}
              placeholder="Type your reason here"
              fullWidth
              value={modifyReason}
              onChange={handleModifyReasonChange}
              error={!!modifyError}
              helperText={modifyError}
              sx={{ mt: 1 }}
            />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button variant="outlined" fullWidth onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleModify}
                sx={{
                  backgroundColor: '#002CBA',
                  '&:hover': { backgroundColor: '#001a8b' },
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <RejectRequestSucessModal
        isOpen={isRejectSuccessModal}
        onClose={() => {
          setRejectSuccessModal(false);
          navigate(-1);
        }}
      />

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
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '60vw',
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
              // Show loading state
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
              // Render the document once loaded
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
              // Show placeholder when no document is loaded yet
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
    </Box>
  );
};

// Helper function to validate field value against regex pattern
const validateFieldRegex = (
  value: string,
  pattern: string | null
): { isValid: boolean; error?: string } => {
  if (!pattern || !value) {
    return { isValid: true };
  }
  try {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      return { isValid: false };
    }
    return { isValid: true };
  } catch (e) {
    return { isValid: true };
  }
};

// Helper function to validate field value against max length
const validateFieldMaxLength = (
  value: string,
  maxLength: number | null
): { isValid: boolean; error?: string } => {
  if (!maxLength || !value) {
    return { isValid: true };
  }
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `Maximum ${maxLength} characters allowed`,
    };
  }
  return { isValid: true };
};

// Helper function to get validation error message for a field
const getFieldValidationError = (
  fieldName: string,
  value: string,
  rules: any
): string | null => {
  if (!rules) return null;

  // Check required
  if (rules.required && (!value || value.trim() === '')) {
    return rules.requiredMessage || 'This field is required';
  }

  // Check max length
  if (value && rules.maxLength) {
    const maxLengthValidation = validateFieldMaxLength(value, rules.maxLength);
    if (!maxLengthValidation.isValid) {
      return maxLengthValidation.error || 'Invalid length';
    }
  }

  // Check regex
  if (value && rules.regex) {
    const regexValidation = validateFieldRegex(value, rules.regex);
    if (!regexValidation.isValid) {
      return rules.regexMessage || 'Invalid format';
    }
  }

  return null;
};

// Helper function to determine if a field is required - NOW FULLY DYNAMIC from API
const isFieldRequired = (
  fieldKey: string,
  userData: any,
  baseRequired: boolean,
  conditionalRules?: any // NEW: Conditional validation rules from API
): boolean => {
  // PRIORITY 1: If validationRules explicitly sets required: true, always show asterisk
  if (baseRequired === true) {
    return true;
  }

  // PRIORITY 2: If validationRules explicitly sets required: false, respect that
  if (baseRequired === false) {
    return false;
  }

  // PRIORITY 3: Check conditional rules from API (if provided)
  if (conditionalRules && typeof conditionalRules === 'object') {
    // Example API structure:
    // conditionalRules: {
    //   requiredWhen: [
    //     { field: "regulator", operator: "equals", value: "IFSCA" },
    //     { field: "constitution", operator: "in", value: ["D", "E", "M"] }
    //   ]
    // }

    if (
      conditionalRules.requiredWhen &&
      Array.isArray(conditionalRules.requiredWhen)
    ) {
      return conditionalRules.requiredWhen.every((condition: any) => {
        const fieldPath = condition.field;
        const fieldValue = getNestedValue(userData, fieldPath);

        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'notEquals':
            return fieldValue !== condition.value;
          case 'in':
            return (
              Array.isArray(condition.value) &&
              condition.value.includes(fieldValue)
            );
          case 'notIn':
            return (
              Array.isArray(condition.value) &&
              !condition.value.includes(fieldValue)
            );
          case 'isEmpty':
            return !fieldValue || fieldValue.trim() === '';
          case 'isNotEmpty':
            return fieldValue && fieldValue.trim() !== '';
          default:
            return false;
        }
      });
    }

    // Handle simple conditional: requiredIf: "fieldName"
    if (conditionalRules.requiredIf) {
      const dependentValue = getNestedValue(
        userData,
        conditionalRules.requiredIf
      );
      return !!dependentValue;
    }
  }

  // PRIORITY 4: Default to false if no rules match
  return false;
};

// Helper function to get nested object values by path (e.g., "entityDetails.constitution")
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default ApplicationDetailsView;
