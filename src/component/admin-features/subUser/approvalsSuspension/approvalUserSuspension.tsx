/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SuccessModal from '../Modal/SuccessModal/successModal';
import { ConfirmationModal } from '../Modal/ConfirmationModal';
import RejectionModal from '../Modal/RejectModal/rejectModal';
import '../approvalsdetails/approvalsDetailsPage.css';
import dayjs from 'dayjs';
import {
  approveWorkflow,
  clearWorkflowState,
} from '../../subUser/approvalsSuspension/slice/suspensionSlice';

const UserSuspensionRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Local state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Redux state
  const {
    loading: workflowLoading,
    error: workflowError,
    approvalData: workflowApprovalData,
    success: workflowSuccess,
    message: workflowMessage,
  } = useSelector((state: any) => state.userWorkflow);

  const formatDateString = (dateString: string): string => {
    if (!dateString) return '';

    // Handle YYYY-MM-DD format and convert to DD-MM-YYYY
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const parts = dateString.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD format - convert to DD-MM-YYYY
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        // Already in DD-MM-YYYY format
        return dateString;
      }
    }

    return dateString;
  };

  const stateData = location.state || {};

  const suspensionData = {
    id: stateData.workflowData?.id || stateData.userId || '1',
    userName: stateData?.userName || '-',
    userRole: stateData?.userRole || '-',
    userId: stateData?.userId || '-',
    region: stateData.userData?.region || stateData.workflowData?.region || '-',
    branch: stateData.userData?.branch || stateData.workflowData?.branch || '-',
    fromDate: formatDateString(stateData.suspensionStartDate || '01-02-2025'),
    toDate: formatDateString(stateData.suspensionEndDate || '01-02-2025'),
    remark: stateData.requisitionReason || 'No remark provided',
    activity: stateData.activity || 'SUSPEND',
    suspensionPeriodDays: stateData.suspensionPeriodDays || 0,
    workflowId:
      stateData.workflowId ||
      workflowApprovalData?.approvalWorkflow?.workflowId ||
      'sample-workflow-id',
  };

  // Handle success/error states from Redux
  useEffect(() => {
    if (workflowSuccess && workflowMessage) {
      setSnackbar({
        open: true,
        message: workflowMessage,
        severity: 'success',
      });
      setShowSuccessModal(true);
      dispatch(clearWorkflowState() as any);
    }
  }, [workflowSuccess, workflowMessage, dispatch]);

  useEffect(() => {
    if (workflowError) {
      setSnackbar({ open: true, message: workflowError, severity: 'error' });
      dispatch(clearWorkflowState() as any);
    }
  }, [workflowError, dispatch]);

  const handleApprove = async () => {
    if (
      !suspensionData.workflowId ||
      suspensionData.workflowId === 'sample-workflow-id'
    ) {
      setSnackbar({
        open: true,
        message: 'Invalid workflow ID. Cannot proceed with approval.',
        severity: 'error',
      });
      return;
    }

    try {
      const approvalPayload = {
        workflowId: suspensionData.workflowId,
        action: 'APPROVE',
        remarks: 'Approved from UI - User Suspension Request',
        reason: suspensionData.remark || 'approve suspend',
      };

      await dispatch(approveWorkflow(approvalPayload) as any).unwrap();
    } catch (error) {
      console.error('Failed to approve workflow:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/sub-users/approvals');
  };

  const handleReject = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmationOk = async (values: any) => {
    setConfirmationLoading(true);

    try {
      if (
        !suspensionData.workflowId ||
        suspensionData.workflowId === 'sample-workflow-id'
      ) {
        setSnackbar({
          open: true,
          message: 'Invalid workflow ID. Cannot proceed with rejection.',
          severity: 'error',
        });
        setConfirmationLoading(false);
        return;
      }

      const rejectionPayload = {
        workflowId: suspensionData.workflowId,
        action: 'REJECT',
        remarks: values.remarks || 'Rejected from UI - User Suspension Request',
        reason: values.reason || suspensionData.remark || 'reject suspend',
      };

      await dispatch(approveWorkflow(rejectionPayload) as any).unwrap();

      console.log('Rejection data:', rejectionPayload);

      setShowConfirmationModal(false);
      setConfirmationLoading(false);
      setShowRejectionModal(true);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setSnackbar({
        open: true,
        message: 'Failed to reject workflow',
        severity: 'error',
      });
      setConfirmationLoading(false);
    }
  };

  const handleRejectionModalClose = () => {
    setShowRejectionModal(false);
    navigate('/sub-users/approvals');
  };

  const handleConfirmationCancel = () => {
    setShowConfirmationModal(false);
    setConfirmationLoading(false);
  };

  return (
    <Box className="dashboard">
      <Box className="dashboard-content">
        <Box component="main" className="main-content approval-details-main">
          {/* Header Section */}
          <Box className="page-header approval-details-header">
            <Box className="header-left">
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                className="back-button"
              >
                Back
              </Button>
              <Typography
                variant="h5"
                component="h2"
                className="page-title approval-details-title"
              >
                User Suspension Request
              </Typography>
            </Box>
          </Box>

          {/* Form Section */}
          <Box className="approval-form-container">
            <Card className="approval-details-card" elevation={0}>
              <CardContent>
                {/* First Row - User Name, User Role, User ID */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        User Name
                      </Typography>
                      <TextField
                        value={suspensionData.userName}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        User Role
                      </Typography>
                      <TextField
                        value={suspensionData.userRole}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        User ID
                      </Typography>
                      <TextField
                        value={suspensionData.userId}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Second Row - Region, Branch */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        Region
                      </Typography>
                      <TextField
                        value={suspensionData.region}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        Branch
                      </Typography>
                      <TextField
                        value={suspensionData.branch}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Third Row - From Date, To Date */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        From Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={dayjs(suspensionData.fromDate, 'DD-MM-YYYY')}
                          format="DD-MM-YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              disabled: true,
                              className: 'readonly-input',
                            },
                          }}
                          slots={{
                            openPickerIcon: CalendarMonthIcon,
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        To Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={dayjs(suspensionData.toDate, 'DD-MM-YYYY')}
                          format="DD-MM-YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              disabled: true,
                              className: 'readonly-input',
                            },
                          }}
                          slots={{
                            openPickerIcon: CalendarMonthIcon,
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Grid>
                </Grid>

                {/* Remark Section */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        Remark
                      </Typography>
                      <TextField
                        value={suspensionData.remark}
                        fullWidth
                        multiline
                        rows={4}
                        disabled
                        className="readonly-textarea"
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box
                  className="approval-action-buttons"
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 3,
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleReject}
                    className="reject-button"
                    disabled={workflowLoading}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleApprove}
                    className="approve-button"
                    disabled={workflowLoading}
                    sx={{
                      backgroundColor: '#002CBA',
                      '&:hover': { backgroundColor: '#002CBA' },
                    }}
                  >
                    {workflowLoading ? 'Processing...' : 'Approve'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          onClose={handleSuccessModalClose}
          message={
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Request Approved
              </Typography>
              <Typography variant="body1" sx={{ color: '#8c8c8c' }}>
                [ {suspensionData.userName} ] [ {suspensionData.userRole} ]
              </Typography>
              <Typography variant="body1" sx={{ color: '#8c8c8c', mt: 1 }}>
                suspended successfully.
              </Typography>
            </>
          }
          buttonText="Okay"
          buttonColor="#002CBA"
          width={500}
        />

        {/* Confirmation Modal for Rejection */}
        <ConfirmationModal
          visible={showConfirmationModal}
          onOk={handleConfirmationOk}
          onCancel={handleConfirmationCancel}
          type="deactivate"
          loading={confirmationLoading}
        />

        {/* Rejection Modal */}
        <RejectionModal
          visible={showRejectionModal}
          onClose={handleRejectionModalClose}
          message="Request Successfully Rejected"
          subtitle="The sub-user suspension request has been rejected and the user has been notified."
          buttonText="Okay"
          iconColor="#ff4d4f"
          buttonColor="#002CBA"
        />

        {/* Footer */}
        <Box className="page-footer">
          <Typography className="footer-text">
            © 2025 CKYCRR. All Rights Reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UserSuspensionRequest;
