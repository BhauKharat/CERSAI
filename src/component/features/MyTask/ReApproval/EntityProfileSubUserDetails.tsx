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
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../admin-features/app/hooks';
import {
  resetEntityProfileActionState,
  clearEntityProfileWorkflowDetails,
} from '../../../admin-features/request-details/slices/entityProfileApprovalSlice';
import { fetchFields } from '../../../admin-features/request-details/slices/applicationPreviewSlice';
import { clearRegistrationData } from './registrationSlice';
import {
  fetchWorkflowPendingRequest,
  clearWorkflowPendingRequest,
} from './workflowPendingRequestSlice';
import AdminBreadcrumbUpdateProfile from '../../../admin-features/myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import { useSelector } from 'react-redux';
import VerifiedIcon from '../../../ui/Input/VerifiedIcon';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';

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

const EntityProfileSubUserDetails: React.FC = () => {
  const { workFlowId, reId } = useParams<{
    id: string;
    workFlowId: string;
    userId: string;
    reId?: string;
  }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state for entity profile approval
  const {
    workflowDetails,
    detailsLoading,
    detailsError,
    actionSuccess,
    actionMessage,
    actionError,
  } = useAppSelector((state: any) => state.entityProfileApproval || {});

  // Redux state for dynamic form fields
  const groupedFields = useSelector(
    (state: any) => state.applicationDetails?.data?.groupedFields || {}
  );

  // Redux state for application details (registration API data from ReApproval slice)
  const applicationDetailsData = useSelector(
    (state: any) => state.reApprovalRegistration?.data
  );

  // Get userId and token from auth Redux store
  const userId = useSelector(
    (state: any) => state.auth?.userDetails?.userId || ''
  );
  const authToken = useSelector((state: any) => state.auth?.authToken || '');

  // Local state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isRejectSuccessModalOpen, setIsRejectSuccessModalOpen] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
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

  // Get workflow pending request data from Redux (the pending-request API data)
  const workflowPendingData = useSelector(
    (state: any) => state.reApprovalWorkflowPendingRequest?.data || []
  );

  // Debug log to see what we have
  useEffect(() => {
    console.log('🔍 Debug - workflowPendingData:', workflowPendingData);
    console.log(
      '🔍 Debug - workflowId from data:',
      workflowPendingData?.workflowId
    );
    console.log('🔍 Debug - workFlowId from URL:', workFlowId);
    console.log('🔍 Debug - userId:', userId);
  }, [workflowPendingData, workFlowId, userId]);

  // Get payload data from workflow (response API)
  const payload = useMemo(() => {
    console.log('========================================');
    console.log('🔍 Extracting payload...');
    console.log('  workflowPendingData:', workflowPendingData);
    console.log('  workflowDetails:', workflowDetails);

    // Priority 1: Use workflowPendingData (from pending-request API)
    // The API returns a single workflow object, not an array
    if (workflowPendingData && typeof workflowPendingData === 'object') {
      console.log('✅ Using workflowPendingData.payload');

      if (workflowPendingData.payload) {
        console.log(
          '  → Payload keys:',
          Object.keys(workflowPendingData.payload)
        );
        console.log('  → Sample data:');
        console.log(
          '    - entityDetails:',
          workflowPendingData.payload.entityDetails
        );
        console.log('    - addresses:', workflowPendingData.payload.addresses);
        console.log('    - hoi:', workflowPendingData.payload.hoi);
        console.log('========================================');
        return workflowPendingData.payload;
      }
    }

    // Priority 2: Use workflowDetails (from workflow details API)
    if (workflowDetails?.payload) {
      console.log('✅ Using workflowDetails.payload');
      console.log('  Payload keys:', Object.keys(workflowDetails.payload));
      console.log('========================================');
      return workflowDetails.payload;
    }

    console.log('⚠️ No payload found');
    console.log('========================================');
    return {};
  }, [workflowPendingData, workflowDetails]);

  // Get documents from workflow
  const documents = useMemo(() => {
    console.log('🔍 Extracting documents...');

    // Priority 1: Get documents from workflowPendingData
    if (workflowPendingData?.documents) {
      console.log('✅ Using workflowPendingData.documents');
      const docs = workflowPendingData.documents;

      // Documents can be object or array
      if (Array.isArray(docs)) {
        return docs;
      }

      // Convert object to array
      const docsArray = Object.entries(docs).map(
        ([key, doc]: [string, any]) => ({
          ...doc,
          fieldKey: doc.fieldKey || key,
          documentType: doc.type || doc.fieldKey || key,
        })
      );
      console.log('  → Converted', docsArray.length, 'documents');
      return docsArray;
    }

    // Priority 2: Get documents from workflowDetails
    if (workflowDetails?.documents) {
      console.log('✅ Using workflowDetails.documents');
      if (Array.isArray(workflowDetails.documents)) {
        return workflowDetails.documents;
      }
      const docsArray = Object.entries(workflowDetails.documents).map(
        ([key, doc]: [string, any]) => ({
          ...doc,
          fieldKey: doc.fieldKey || key,
          documentType: doc.type || doc.fieldKey || key,
        })
      );
      return docsArray;
    }

    console.log('⚠️ No documents found');
    return [];
  }, [workflowPendingData, workflowDetails]);

  // Debug effect to log the full workflowDetails structure
  useEffect(() => {
    if (workflowDetails) {
      console.log('=== WORKFLOW DETAILS STRUCTURE ===');
      console.log('Full workflowDetails:', workflowDetails);
      console.log('workflowDetails.payload:', workflowDetails.payload);
      console.log('workflowDetails.documents:', workflowDetails.documents);
      console.log('workflowDetails.status:', workflowDetails.status);
      console.log('workflowDetails.currentStep:', workflowDetails.currentStep);
      console.log('=================================');
    }
  }, [workflowDetails]);

  // Debug effect to log applicationDetailsData

  // Fetch form fields on mount (removed fetchEntityProfileWorkflowDetails - not needed for RE portal)
  useEffect(() => {
    // Fetch dynamic form fields (same API as RequestDetails)
    dispatch(fetchFields());

    return () => {
      dispatch(clearEntityProfileWorkflowDetails());
      dispatch(resetEntityProfileActionState());
      dispatch(clearRegistrationData());
      dispatch(clearWorkflowPendingRequest());
    };
  }, [dispatch]);

  // Fetch workflow pending request data
  useEffect(() => {
    const loadWorkflowPendingRequest = async () => {
      if (!reId || !userId) {
        return;
      }

      try {
        await dispatch(
          fetchWorkflowPendingRequest({
            filters: {
              userId: userId,
              workflow_type: 'RE_ENTITY_PROFILE_UPDATE',
              pendingWith: userId,
            },
          })
        );
      } catch (error) {
        console.error('Failed to fetch workflow pending request:', error);
      }
    };

    // Only fetch if reId and userId are available
    if (reId && userId) {
      loadWorkflowPendingRequest();
    }
  }, [dispatch, reId, userId]);

  // Note: Removed fetchRegistrationData - not needed for RE portal
  // The workflowPendingRequest API already provides the payload data needed

  // Handle action success
  useEffect(() => {
    if (actionSuccess && actionMessage) {
      setSuccessMessage(actionMessage);
      if (actionMessage.toLowerCase().includes('reject')) {
        setIsRejectSuccessModalOpen(true);
      } else {
        setIsSuccessModalOpen(true);
      }
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
      let docsToFetch: any[] = [];

      // Priority 1: Use the documents array from useMemo (already converted from object)
      if (documents && documents.length > 0) {
        console.log('Using documents from useMemo:', documents);
        docsToFetch = documents;
      }
      // Priority 2: Check applicationDetailsData sources
      else if (applicationDetailsData?.payload?.documents) {
        const docs = applicationDetailsData.payload.documents;
        if (Array.isArray(docs)) {
          docsToFetch = docs;
        } else if (typeof docs === 'object') {
          docsToFetch = Object.entries(docs).map(
            ([key, value]: [string, any]) => {
              if (typeof value === 'string') {
                return {
                  id: value,
                  type: key,
                  documentType: key,
                  fieldKey: key,
                };
              }
              return {
                ...value,
                fieldKey: value.fieldKey || key,
                type: value.type || key,
                documentType: value.type || key,
              };
            }
          );
        }
      } else if (applicationDetailsData?.documents) {
        const docs = applicationDetailsData.documents;
        if (Array.isArray(docs)) {
          docsToFetch = docs;
        } else if (typeof docs === 'object') {
          docsToFetch = Object.entries(docs).map(
            ([key, value]: [string, any]) => {
              if (typeof value === 'string') {
                return {
                  id: value,
                  type: key,
                  documentType: key,
                  fieldKey: key,
                };
              }
              return {
                ...value,
                fieldKey: value.fieldKey || key,
                type: value.type || key,
                documentType: value.type || key,
              };
            }
          );
        }
      }
      // Priority 3: Check payload.documents
      else if (payload?.documents) {
        const docs = payload.documents;
        if (Array.isArray(docs)) {
          docsToFetch = docs;
        } else if (typeof docs === 'object') {
          docsToFetch = Object.entries(docs).map(
            ([key, value]: [string, any]) => {
              if (typeof value === 'string') {
                return {
                  id: value,
                  type: key,
                  documentType: key,
                  fieldKey: key,
                };
              }
              return {
                ...value,
                fieldKey: value.fieldKey || key,
                type: value.type || key,
                documentType: value.type || key,
              };
            }
          );
        }
      }

      console.log('Documents to fetch:', docsToFetch);

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
    documents, // This includes workflowDetails.documents converted to array
    applicationDetailsData?.payload?.documents,
    applicationDetailsData?.documents,
    payload?.documents,
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

    // First try to get value from applicationDetailsData (registration API)
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

    // Try applicationDetailsData payload with fieldName search
    if (applicationDetailsData?.payload) {
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

    // Fallback to payload from workflowDetails
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

    return (
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${groupedFieldKey}-content`}
          id={`${groupedFieldKey}-header`}
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
                          } else if (documents && documents.length > 0) {
                            // Use the converted documents array from useMemo
                            docSource = documents;
                          } else if (
                            applicationDetailsData?.payload?.documents
                          ) {
                            docSource =
                              applicationDetailsData.payload.documents;
                          } else if (applicationDetailsData?.documents) {
                            docSource = applicationDetailsData.documents;
                          } else if (payload?.documents) {
                            docSource = payload.documents;
                          } else if (workflowDetails?.documents) {
                            // workflowDetails.documents is an object, convert to array
                            const docsObj = workflowDetails.documents;
                            if (
                              typeof docsObj === 'object' &&
                              !Array.isArray(docsObj)
                            ) {
                              docSource = Object.entries(docsObj).map(
                                ([key, doc]: [string, any]) => ({
                                  ...doc,
                                  fieldKey: doc.fieldKey || key,
                                  documentType: doc.type || key,
                                })
                              );
                            } else {
                              docSource = docsObj;
                            }
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
  const handleApprove = async () => {
    // Get workflowId from Redux data or URL param
    const workflowIdToUse = workflowPendingData?.workflowId || workFlowId;

    if (!workflowIdToUse || !userId) {
      setSnackbar({
        open: true,
        message: 'Missing required parameters for approval',
        severity: 'error',
      });
      console.error('Missing params:', { workflowIdToUse, userId });
      return;
    }

    console.log('🚀 Approving with params:', {
      userId,
      workflowId: workflowIdToUse,
    });

    setIsActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL_RE}/api/v1/update-profile/workflow/action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userId: userId,
            workflowId: workflowIdToUse,
            action: 'APPROVE',
            reason: 'Approved',
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(
          data.message || 'Entity profile update approved successfully'
        );
        setIsSuccessModalOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to approve entity profile update',
          severity: 'error',
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to approve entity profile update',
        severity: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    // Get workflowId from Redux data or URL param
    const workflowIdToUse = workflowPendingData?.workflowId || workFlowId;

    if (!workflowIdToUse || !userId) {
      setSnackbar({
        open: true,
        message: 'Missing required parameters for rejection',
        severity: 'error',
      });
      console.error('Missing params:', { workflowIdToUse, userId });
      return;
    }

    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for rejection',
        severity: 'warning',
      });
      return;
    }

    console.log('🚀 Rejecting with params:', {
      userId,
      workflowId: workflowIdToUse,
      reason: rejectReason,
    });

    setIsActionLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL_RE}/api/v1/update-profile/workflow/action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userId: userId,
            workflowId: workflowIdToUse,
            action: 'REJECT',
            reason: rejectReason,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(
          data.message || 'Entity profile update rejected successfully'
        );
        setIsRejectSuccessModalOpen(true);
        setIsRejectModalOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to reject entity profile update',
          severity: 'error',
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reject entity profile update',
        severity: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    setIsRejectSuccessModalOpen(false);
    navigate('/ckyc/re/my-task');
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
            onClick={() => {
              if (reId && userId) {
                dispatch(
                  fetchWorkflowPendingRequest({
                    filters: {
                      userId: userId,
                      workflow_type: 'RE_ENTITY_PROFILE_UPDATE',
                      pendingWith: userId,
                    },
                  })
                );
              }
            }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

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
            label: 'Entity Profile',
            href: '/re/entity-profile-sub-user-list',
          },
          { label: 'Reporting Entity Details' },
        ]}
      />

      {/* View Signed Document Link */}
      <Box sx={styles.signedDocBanner}>
        <Typography
          sx={styles.viewSignedDocLink}
          onClick={() => {
            // documents is an array converted from object in useMemo
            const signedDoc = documents?.find(
              (d: any) =>
                d?.fieldKey?.toLowerCase().includes('signed') &&
                d?.fieldKey?.toLowerCase().includes('pdf')
            );

            console.log('Looking for signed document in:', documents);
            console.log('Found signed document:', signedDoc);

            if (signedDoc && signedDoc.id) {
              setViewDocument({
                open: true,
                documentId: signedDoc.id,
                fileName: signedDoc.fieldKey || 'Signed Document',
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
      <Box sx={styles.actionButtons}>
        <Button
          variant="outlined"
          onClick={handleReject}
          sx={styles.rejectButton}
          disabled={isActionLoading}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          onClick={handleApprove}
          sx={styles.approveButton}
          disabled={isActionLoading}
        >
          {isActionLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Approve'
          )}
        </Button>
      </Box>

      {/* Reject Modal */}
      <Modal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
      >
        <Box sx={styles.modalBox}>
          <CancelIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ mb: 2, fontFamily: 'Gilroy-SemiBold', fontSize: '18px' }}
          >
            Reject Update Entity Profile
          </Typography>
          <Typography
            sx={{ mb: 1, textAlign: 'left', fontWeight: 500, fontSize: '14px' }}
          >
            Remark
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your Remark here"
            value={rejectReason}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setRejectReason(e.target.value);
              }
            }}
            sx={{ mb: 1 }}
            inputProps={{ maxLength: 500 }}
          />
          <Typography
            sx={{ mb: 2, textAlign: 'right', color: '#666', fontSize: '12px' }}
          >
            {rejectReason.length}/500
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
              }}
              sx={{
                textTransform: 'none',
                px: 4,
                borderColor: '#1A1A1A',
                color: '#1A1A1A',
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmReject}
              sx={{
                backgroundColor: '#002CBA',
                textTransform: 'none',
                px: 4,
                '&:hover': { backgroundColor: 'rgba(0, 44, 186, 0.9)' },
              }}
              disabled={isActionLoading || !rejectReason.trim()}
            >
              {isActionLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Submit'
              )}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Success Modal for Approval */}
      <Modal open={isSuccessModalOpen} onClose={handleSuccessModalClose}>
        <Box sx={styles.modalBox}>
          <CheckCircleIcon sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ mb: 2, fontFamily: 'Gilroy-SemiBold', fontSize: '16px' }}
          >
            {successMessage || 'Entity profile submitted for Level 2 approval'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSuccessModalClose}
            sx={{
              backgroundColor: '#002CBA',
              textTransform: 'none',
              px: 6,
              '&:hover': { backgroundColor: 'rgba(0, 44, 186, 0.9)' },
            }}
          >
            Okay
          </Button>
        </Box>
      </Modal>

      {/* Reject Success Modal */}
      <Modal open={isRejectSuccessModalOpen} onClose={handleSuccessModalClose}>
        <Box sx={styles.modalBox}>
          <CancelIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ mb: 2, fontFamily: 'Gilroy-SemiBold', fontSize: '16px' }}
          >
            Update Entity Profile Request Rejected
          </Typography>
          <Button
            variant="contained"
            onClick={handleSuccessModalClose}
            sx={{
              backgroundColor: '#002CBA',
              textTransform: 'none',
              px: 6,
              '&:hover': { backgroundColor: 'rgba(0, 44, 186, 0.9)' },
            }}
          >
            Okay
          </Button>
        </Box>
      </Modal>

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

export default EntityProfileSubUserDetails;
