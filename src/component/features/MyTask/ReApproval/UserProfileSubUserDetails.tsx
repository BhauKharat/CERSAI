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
  IconButton,
} from '@mui/material';
import {
  StyledAccordion,
  StyledAccordionSummary,
  styles,
} from './userProfileSubUserDetailStyle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  fetchREUserProfileWorkflowDetails,
  approveREUserProfileUpdate,
  rejectREUserProfileUpdate,
  resetREUserProfileActionState,
  clearREUserProfileWorkflowDetails,
} from './reUserProfileWorkflowSlice';
import AdminBreadcrumbUpdateProfile from '../../../admin-features/myTask/mytaskDash/AdminBreadcrumbUpdateProfile';
import VerifiedIcon from '../../../ui/Input/VerifiedIcon';
import { useSelector } from 'react-redux';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import DateUtils from '../../../../utils/dateUtils';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import RejectConfirmationModal from '../../../common/modals/RejectConfirmationModal';

export const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;

// Field configuration for User Profile - matches API response keys
const userProfileFields = [
  {
    key: 'citizenship',
    label: 'Citizenship',
    required: true,
    type: 'select',
  },
  { key: 'ckycNo', label: 'CKYC Number', required: true, verified: true },
  { key: 'title', label: 'Title', required: true, type: 'select' },
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'middleName', label: 'Middle Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'gender', label: 'Gender', required: true, type: 'select' },
  { key: 'dob', label: 'Date of Birth', required: true, type: 'date' },
  { key: 'designation', label: 'Designation', required: true },
  { key: 'employeeCode', label: 'Employee Code', required: true },
  { key: 'email', label: 'Email', required: true },
  {
    key: 'countryCode',
    label: 'Country Code',
    required: true,
    type: 'select',
  },
  { key: 'mobile', label: 'Mobile Number', required: true },
  { key: 'landline', label: 'Landline Number' },
  { key: 'addressLine1', label: 'Address Line 1', required: true },
  { key: 'addressLine2', label: 'Address Line 2' },
  { key: 'addressLine3', label: 'Address Line 3' },
  {
    key: 'country',
    label: 'Country',
    required: true,
    type: 'select',
  },
  {
    key: 'state',
    label: 'State / UT',
    required: true,
    type: 'select',
  },
  {
    key: 'district',
    label: 'District',
    required: true,
    type: 'select',
  },
  { key: 'city', label: 'City/Town', required: true, type: 'select' },
  { key: 'pincode', label: 'Pin Code', required: true },
  {
    key: 'poi',
    label: 'Proof of Identity',
    required: true,
    type: 'select',
  },
  {
    key: 'poiNumber',
    label: 'Proof of Identity Number',
    required: true,
  },
  { key: 'regionName', label: 'Region', required: false },
  { key: 'userRole', label: 'User Role', required: false },
];

const UserProfileSubUserDetails: React.FC = () => {
  const { workflowId, userId: paramUserId } = useParams<{
    workflowId: string;
    userId: string;
  }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get userId (approverId) from Redux auth store
  const approverId = useSelector(
    (state: any) => state.auth?.userDetails?.userId || ''
  );
  console.log(paramUserId);

  // Redux state
  const {
    workflowDetails,
    detailsLoading,
    detailsError,
    actionLoading,
    actionSuccess,
    actionMessage,
    actionError,
  } = useAppSelector((state: any) => state.reUserProfileWorkflow || {});

  // Local state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    type: 'success' | 'reject';
    title: string;
    message: string;
  }>({ open: false, type: 'success', title: '', message: '' });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Document viewer state
  const [viewDocument, setViewDocument] = useState<{
    open: boolean;
    documentId?: string;
    base64Content?: string;
    fileName: string;
    fileType?: 'pdf' | 'image';
    loading?: boolean;
  }>({ open: false, fileName: '', loading: false });

  // Document file types tracking
  const [documentFileTypes, setDocumentFileTypes] = useState<
    Record<string, 'pdf' | 'image'>
  >({});

  // Previous version state
  const [previousVersionData, setPreviousVersionData] = useState<any>(null);
  const [previousVersionLoading, setPreviousVersionLoading] = useState(false);
  const [isPreviousVersionModalOpen, setIsPreviousVersionModalOpen] =
    useState(false);

  // Fetch workflow details on mount
  useEffect(() => {
    if (workflowId && approverId) {
      dispatch(
        fetchREUserProfileWorkflowDetails({
          workflowId: workflowId,
          approverId: approverId,
        })
      );
    }

    return () => {
      dispatch(clearREUserProfileWorkflowDetails());
      dispatch(resetREUserProfileActionState());
    };
  }, [dispatch, workflowId, approverId]);

  // Handle action success
  useEffect(() => {
    if (actionSuccess && actionMessage) {
      const isReject = actionMessage.toLowerCase().includes('reject');
      setSuccessModal({
        open: true,
        type: isReject ? 'reject' : 'success',
        title: isReject
          ? 'Update User Profile Request Rejected'
          : 'Request Approved Successfully',
        message: actionMessage,
      });
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

  // Get update data from workflow
  const updateData = useMemo(() => {
    const data =
      workflowDetails?.workflow?.payload?.profile_update_initiated
        ?.updateData || {};
    return data;
  }, [workflowDetails]);

  // Get documents from workflow
  const documents = useMemo(() => {
    return workflowDetails?.documents || [];
  }, [workflowDetails]);

  // Handle approve
  const handleApprove = () => {
    if (!workflowId || !approverId) return;

    dispatch(
      approveREUserProfileUpdate({
        workflowId: workflowId,
        userId: approverId,
        remark: 'Profile update verified and approved',
      })
    );
  };

  // Handle reject
  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  // Handle reject confirmation from RejectConfirmationModal
  const handleRejectSubmit = (remark: string) => {
    if (!workflowId || !approverId) return;

    dispatch(
      rejectREUserProfileUpdate({
        workflowId: workflowId,
        userId: approverId,
        remark: remark,
      })
    );
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setSuccessModal({ open: false, type: 'success', title: '', message: '' });
    navigate('/re/user-profile-sub-user-list');
  };

  // Function to fetch previous version data
  const fetchPreviousVersion = async () => {
    // Get userId from workflowDetails or updateData
    const userId =
      workflowDetails?.workflow?.payload?.profile_update_initiated?.userId ||
      workflowDetails?.workflow?.payload?.userId ||
      updateData?.userId ||
      paramUserId;

    if (!userId) {
      setSnackbar({
        open: true,
        message: 'User ID not found',
        severity: 'error',
      });
      return;
    }

    setPreviousVersionLoading(true);

    try {
      const response = await Secured.post(
        `${API_ENDPOINTS.get_sub_users}?page=0&size=10`,
        [
          {
            operation: 'AND',
            filters: {
              userId: userId,
            },
          },
        ]
      );

      if (
        response?.data?.data?.content &&
        response.data.data.content.length > 0
      ) {
        setPreviousVersionData(response.data.data.content[0]);
        setIsPreviousVersionModalOpen(true);
      } else if (response?.data?.data) {
        setPreviousVersionData(response.data.data);
        setIsPreviousVersionModalOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: 'No previous version found',
          severity: 'info',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch previous version:', error);
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to fetch previous version',
        severity: 'error',
      });
    } finally {
      setPreviousVersionLoading(false);
    }
  };

  // Get field value from update data
  const getFieldValue = (fieldKey: string): string => {
    const value = updateData[fieldKey];
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  // Render a field row
  const renderField = (field: {
    key: string;
    label: string;
    required?: boolean;
    type?: string;
    verified?: boolean;
  }) => {
    const value = getFieldValue(field.key);
    const isDateField = field.type === 'date';
    const isSelectField = field.type === 'select';

    return (
      <Grid
        size={{ xs: 12, sm: 6, md: 4 }}
        key={field.key}
        sx={{ p: 2, backgroundColor: '#fff' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              color: 'black',
              fontWeight: '600',
            }}
          >
            {field.label}{' '}
            {field.required && <span style={{ color: 'red' }}>*</span>}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
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
              <Tooltip title={value} placement="top" arrow>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'black',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    flex: 1,
                  }}
                >
                  {value || '-'}
                </Typography>
              </Tooltip>
              {isDateField && (
                <CalendarTodayIcon
                  sx={{ color: '#666', fontSize: '20px', ml: 1 }}
                />
              )}
              {isSelectField && (
                <KeyboardArrowDownIcon
                  sx={{ color: '#666', fontSize: '20px', ml: 1 }}
                />
              )}
              {field.key === 'ckycNo' && value && value !== '-' && (
                <Box sx={{ ml: 1 }}>
                  <VerifiedIcon showText={true} size={19} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Grid>
    );
  };

  // Render document preview
  const renderDocumentField = (label: string, docFieldKey: string) => {
    const doc = documents?.find(
      (d: any) =>
        d?.fieldKey?.toLowerCase() === docFieldKey.toLowerCase() ||
        d?.fieldKey?.toLowerCase().includes(docFieldKey.toLowerCase())
    );
    return (
      <Grid
        size={{ xs: 12, sm: 6, md: 4 }}
        key={docFieldKey}
        sx={{ p: 2, backgroundColor: '#fff' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Gilroy, sans-serif',
              color: 'black',
              fontWeight: '600',
            }}
          >
            {label} <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
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
              <Typography
                variant="body2"
                sx={{
                  color: 'black',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  flex: 1,
                }}
              >
                {doc ? 'Document uploaded' : '-'}
              </Typography>
            </Box>
            {doc && (
              <Box
                sx={{ display: 'flex', height: '100%', alignSelf: 'center' }}
              >
                <Box
                  component="button"
                  type="button"
                  aria-label={`View ${label} document`}
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setViewDocument({
                      open: true,
                      documentId: doc.id,
                      fileName: label,
                      fileType: documentFileTypes[doc.id] || undefined,
                    });
                  }}
                >
                  {(() => {
                    const detectedType = doc.id
                      ? documentFileTypes[doc.id]
                      : undefined;

                    if (detectedType === 'pdf') {
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
                        title="Click to view document"
                      >
                        <ImageIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                      </Box>
                    );
                  })()}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Grid>
    );
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
                fetchREUserProfileWorkflowDetails({
                  workflowId: workflowId!,
                  approverId: approverId,
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

  const workflowStatus = workflowDetails?.workflow?.status;
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
          { label: 'My Task', href: '/re/update-profile' },
          {
            label: 'User Profile',
            href: '/re/user-profile-sub-user-list',
          },
          { label: 'User Details' },
        ]}
      />

      {/* View Signed Document Link */}
      <Box sx={styles.signedDocBanner}>
        <Typography
          sx={styles.viewSignedDocLink}
          onClick={() => {
            const signedDoc = documents?.find(
              (d: any) =>
                d?.fieldKey?.toLowerCase().includes('user_updation_signed') ||
                (d?.fieldKey?.toLowerCase().includes('signed') &&
                  d?.fieldKey?.toLowerCase().includes('pdf'))
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

      {/* User Details Section Title */}
      <Typography sx={styles.sectionTitle}>User Details</Typography>

      {/* User Profile Accordion */}
      <StyledAccordion defaultExpanded>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="user-profile-content"
          id="user-profile-header"
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Gilroy',
              fontWeight: 600,
              fontSize: '16px',
              fontStyle: 'normal',
              lineHeight: '100%',
              letterSpacing: 0,
              color: 'text.primary',
            }}
          >
            User Profile
          </Typography>
        </StyledAccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Grid container>
            {userProfileFields.map((field) => renderField(field))}
            {renderDocumentField(
              'Proof of Identity Document',
              'iauProofOfIdentityNumber1File'
            )}
            {renderDocumentField(
              'Board Resolution',
              'iauAuthorizationLetter1File'
            )}
            {renderDocumentField(
              'Employee Code Document',
              'iauEmployCode1File'
            )}
          </Grid>
        </AccordionDetails>
      </StyledAccordion>

      {/* View Previous Version Link */}
      <Box sx={{ marginTop: 2, marginBottom: 2 }}>
        <Typography
          sx={{
            color: '#002CBA',
            cursor: previousVersionLoading ? 'wait' : 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            fontWeight: 500,
            fontSize: '14px',
            fontFamily: 'Gilroy',
            '&:hover': {
              color: '#001a8b',
            },
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
          onClick={() => {
            if (!previousVersionLoading) {
              fetchPreviousVersion();
            }
          }}
        >
          View Previous Version
          {previousVersionLoading && (
            <CircularProgress size={14} sx={{ color: '#002CBA' }} />
          )}
        </Typography>
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

      {/* Reject Confirmation Modal */}
      <RejectConfirmationModal
        title="Reject Update User Profile"
        remarkLabel="Remark"
        remarkPlaceholder="Type your Remark here"
        remarkMaxLength={500}
        cancelLabel="Cancel"
        submitLabel="Submit"
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
      />

      {/* Success/Reject Result Modal */}
      <SuccessModal
        open={successModal.open}
        messageType={successModal.type}
        title={successModal.title}
        message={successModal.message}
        okText="Okay"
        onClose={handleSuccessModalClose}
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
            minWidth: viewDocument.fileType === 'pdf' ? '600px' : 'auto',
            maxWidth: viewDocument.fileType === 'pdf' ? '95vw' : '90vw',
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

      {/* Previous Version Modal */}
      <Modal
        open={isPreviousVersionModalOpen}
        onClose={() => setIsPreviousVersionModalOpen(false)}
        aria-labelledby="previous-version-modal"
        aria-describedby="previous-version-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '90vw',
            maxWidth: '900px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #E0E0E0',
              backgroundColor: '#F8F9FD',
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontFamily: 'Gilroy', fontWeight: 600 }}
            >
              Previous Version Details
            </Typography>
            <IconButton
              onClick={() => setIsPreviousVersionModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Content */}
          <Box
            sx={{
              p: 3,
              maxHeight: 'calc(90vh - 140px)',
              overflow: 'auto',
            }}
          >
            {previousVersionData &&
            Object.keys(previousVersionData).length > 0 ? (
              <Grid container spacing={2}>
                {Object.entries(previousVersionData).map(([key, value]) => {
                  // Skip null/undefined values and internal fields
                  if (
                    value === null ||
                    value === undefined ||
                    key.includes('DocumentId') ||
                    key.includes('KeyCloak') ||
                    key.includes('File') ||
                    key === 'version' ||
                    key === 'createdBy' ||
                    key === 'updatedBy' ||
                    key === 'keyCloakUserId' ||
                    key === 'reportingEntityId' ||
                    typeof value === 'object'
                  ) {
                    return null;
                  }

                  // Format the label from camelCase
                  const formatLabel = (str: string) => {
                    return str
                      .replace(/^iau/, '') // Remove 'iau' prefix for sub user
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase())
                      .trim();
                  };

                  // Check if the field is a date field and format it
                  const isDateField = (fieldKey: string): boolean => {
                    const dateFieldKeys = [
                      'dob',
                      'date',
                      'createdDate',
                      'updatedDate',
                      'createdAt',
                      'updatedAt',
                    ];
                    const fieldKeyLower = fieldKey.toLowerCase();
                    return dateFieldKeys.some((dateKey) =>
                      fieldKeyLower.includes(dateKey.toLowerCase())
                    );
                  };

                  // Format the value - use DateUtils.formatOnlyDate for date fields
                  const formatValue = (
                    fieldKey: string,
                    fieldValue: any
                  ): string => {
                    if (isDateField(fieldKey) && fieldValue) {
                      return (
                        DateUtils.formatOnlyDate(fieldValue) ||
                        String(fieldValue)
                      );
                    }
                    return String(fieldValue) || '-';
                  };

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#666',
                            fontSize: '12px',
                            fontFamily: 'Gilroy',
                          }}
                        >
                          {formatLabel(key)}
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: '#F6F6F6',
                            padding: '10px 12px',
                            borderRadius: '4px',
                            border: '1px solid #E0E0E0',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#1A1A1A',
                              fontSize: '14px',
                              fontFamily: 'Gilroy',
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatValue(key, value)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
                {/* Render Address Fields if available */}
                {previousVersionData?.addressResponseDto && (
                  <>
                    {Object.entries(previousVersionData.addressResponseDto).map(
                      ([key, value]) => {
                        if (
                          value === null ||
                          value === undefined ||
                          key === 'active' ||
                          key === 'createdAt' ||
                          key === 'updatedAt' ||
                          key === 'addressType'
                        ) {
                          return null;
                        }

                        const formatLabel = (str: string) => {
                          return str
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (s) => s.toUpperCase())
                            .trim();
                        };

                        return (
                          <Grid
                            size={{ xs: 12, sm: 6, md: 4 }}
                            key={`address-${key}`}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#666',
                                  fontSize: '12px',
                                  fontFamily: 'Gilroy',
                                }}
                              >
                                {key === 'line1'
                                  ? 'Address Line 1'
                                  : formatLabel(key)}
                              </Typography>
                              <Box
                                sx={{
                                  backgroundColor: '#F6F6F6',
                                  padding: '10px 12px',
                                  borderRadius: '4px',
                                  border: '1px solid #E0E0E0',
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: '#1A1A1A',
                                    fontSize: '14px',
                                    fontFamily: 'Gilroy',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {String(value) || '-'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      }
                    )}
                  </>
                )}
              </Grid>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                }}
              >
                <Typography color="text.secondary">
                  No previous version data available
                </Typography>
              </Box>
            )}
          </Box>

          {/* Modal Footer */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
              borderTop: '1px solid #E0E0E0',
              backgroundColor: '#F8F9FD',
            }}
          >
            <Button
              variant="contained"
              onClick={() => setIsPreviousVersionModalOpen(false)}
              sx={{
                backgroundColor: '#002CBA',
                textTransform: 'none',
                px: 4,
                '&:hover': { backgroundColor: 'rgba(0, 44, 186, 0.9)' },
              }}
            >
              Close
            </Button>
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

export default UserProfileSubUserDetails;
