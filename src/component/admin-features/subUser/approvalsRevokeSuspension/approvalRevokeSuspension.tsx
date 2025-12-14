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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SuccessModal from '../Modal/SuccessModal/successModal';
import { ConfirmationModal } from '../Modal/ConfirmationModal';
import RejectionModal from '../Modal/RejectModal/rejectModal';
import {
  approveWorkflow,
  clearWorkflowState,
} from './slices/revokeSuspensionSlice';
import { AppDispatch, RootState } from '../../../../redux/store';
import '../approvalsdetails/approvalsDetailsPage.css';
import { AlertColor } from '@mui/material/Alert';

const ApprovalRevokeSuspension: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Local state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor | undefined;
  }>({ open: false, message: '', severity: undefined });

  // Redux state for workflow operations
  const {
    loading: workflowLoading,
    error: workflowError,
    approvalData: workflowApprovalData,
  } = useSelector((state: RootState) => state.userWorkflow);

  // Get data from navigation state or use default
  const approvalData = location.state?.approvalData || {
    id: '1',
    userName: 'Hardik Patel',
    userRole: 'Operational',
    userId: 'Lorem Ipsum',
    workflowId: 'sample-workflow-id',
    region: 'Pune',
    branch: '-',
    activity: 'De-activation',
    requisitionReason: 'Lorem Ipsum',
  };

  const requisitionReason =
    location.state?.requisitionReason || 'No reason provided';

  // Handle workflow success (updated)
  useEffect(() => {
    if (workflowApprovalData && !workflowLoading && !workflowError) {
      setSnackbar({
        open: true,
        message: 'Workflow approved successfully!',
        severity: 'success',
      });
      setShowSuccessModal(true);
      dispatch(clearWorkflowState());
    }
  }, [workflowApprovalData, workflowLoading, workflowError, dispatch]);

  // Handle workflow error (updated)
  useEffect(() => {
    if (workflowError) {
      setSnackbar({
        open: true,
        message: `Failed to approve workflow: ${workflowError}`,
        severity: 'error',
      });
      console.error('Workflow approval error:', workflowError);

      // Clear error after showing
      const timer = setTimeout(() => {
        dispatch(clearWorkflowState());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [workflowError, dispatch]);

  const getPageTitle = () => {
    switch (approvalData.activity) {
      case 'Creation':
        return 'User Creation Request';
      case 'Modification':
        return 'User Modification Request';
      case 'De-activation':
        return 'User De-activation Request';
      case 'Suspension':
        return 'User Suspension Request';
      case 'Revoke':
        return 'User Revoke Request';
      default:
        return 'Approval Request';
    }
  };

  const handleApprove = async () => {
    if (
      !approvalData.workflowId ||
      approvalData.workflowId === 'sample-workflow-id'
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
        workflowId: approvalData.workflowId,
        action: 'APPROVE',
        remarks: 'Approved from UI',
        reason: requisitionReason || 'approve suspend revoke',
      };

      await dispatch(approveWorkflow(approvalPayload)).unwrap();
    } catch (error) {
      console.error('Failed to approve workflow:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    dispatch(clearWorkflowState());
    navigate('/sub-users/approvals');
  };

  const getSuccessMessage = () => {
    if (workflowApprovalData) {
      return (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            Request Approved Successfully
          </Typography>
          <Typography variant="body1" sx={{ color: '#8c8c8c' }}>
            [ {approvalData.userName} ] [ {approvalData.userRole} ]
          </Typography>
          <Typography variant="body1" sx={{ color: '#8c8c8c', mt: 1 }}>
            Workflow ID: {approvalData.workflowId}
          </Typography>
          <Typography variant="body1" sx={{ color: '#8c8c8c', mt: '4px' }}>
            Status: Approved
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#666', mt: 1, display: 'block' }}
          >
            Time: {new Date().toLocaleString()}
          </Typography>
        </Box>
      );
    }

    return `Request approved successfully.`;
  };

  const handleReject = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmationOk = async (values: any) => {
    setConfirmationLoading(true);

    try {
      if (
        !approvalData.workflowId ||
        approvalData.workflowId === 'sample-workflow-id'
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
        workflowId: approvalData.workflowId,
        action: 'REJECT',
        remarks: values.remarks || 'Rejected from UI',
        reason: values.reason || requisitionReason || 'reject suspend revoke',
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
  };

  const handleConfirmationCancel = () => {
    setShowConfirmationModal(false);
    setConfirmationLoading(false);
  };

  const renderActivitySpecificFields = () => {
    switch (approvalData.activity) {
      case 'Revoke':
        return (
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box className="form-field">
                <Typography variant="subtitle2" className="field-label">
                  Revoke Reason
                </Typography>
                <TextField
                  value="Security Concerns"
                  fullWidth
                  disabled
                  className="readonly-input"
                />
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
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
                {getPageTitle()}
              </Typography>
            </Box>
          </Box>

          {/* Form Section */}
          <Box className="approval-form-container">
            <Card className="approval-details-card" elevation={0}>
              <CardContent>
                {/* Basic User Information - First Row */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        User Name
                      </Typography>
                      <TextField
                        value={approvalData.userName}
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
                        value={approvalData.userRole}
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
                        value={approvalData.userId}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Second Row - Region and Branch */}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        Region
                      </Typography>
                      <TextField
                        value={approvalData.region}
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
                        value={approvalData.branch}
                        fullWidth
                        disabled
                        className="readonly-input"
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Activity Specific Fields */}
                {renderActivitySpecificFields()}

                {/* Remark Section */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <Box className="form-field">
                      <Typography variant="subtitle2" className="field-label">
                        Remark
                      </Typography>
                      <TextField
                        value={requisitionReason}
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
                    loading={workflowLoading}
                    className="approve-button"
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
          message={getSuccessMessage()}
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
          subtitle="The sub-user request has been rejected and the user has been notified."
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

export default ApprovalRevokeSuspension;
