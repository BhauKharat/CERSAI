/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import '../approvalsdetails/approvalsDetailsPage.css';
import RejectionModal from '../Modal/RejectModal/rejectModal';

const ApprovalDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Get data from navigation state or use default
  const approvalData = location.state?.approvalData || {
    id: '1',
    userName: 'Hardik Patel',
    userRole: 'Operational',
    userId: 'Lorem Ipsum',
    region: 'Pune',
    branch: '-',
    activity: 'De-activation',
    remark: 'Lorem Ipsum',
  };

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

  const handleApprove = () => {
    // Show success modal instead of directly navigating
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back after closing modal
    navigate('/sub-users/approvals');
  };

  const getSuccessMessage = () => {
    const action = 'processed';
    return `${action} successfully.`;
  };

  const handleReject = () => {
    // Show confirmation modal for rejection
    setShowConfirmationModal(true);
  };

  const handleConfirmationOk = async (values: any) => {
    setConfirmationLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Rejection data:', values);

      // Close confirmation modal
      setShowConfirmationModal(false);
      setConfirmationLoading(false);

      // Show rejection modal instead of navigating immediately
      setShowRejectionModal(true);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setConfirmationLoading(false);
      // You might want to show an error message here
    }
  };

  const handleRejectionModalClose = () => {
    setShowRejectionModal(false);
    // Navigate back to approvals page after closing rejection modal
    navigate('/sub-users/approvals');
  };

  const handleConfirmationCancel = () => {
    setShowConfirmationModal(false);
    setConfirmationLoading(false);
  };

  const renderActivitySpecificFields = () => {
    switch (approvalData.activity) {
      case 'Suspension':
        return (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Suspend Reason"
                  value="Policy Violation"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="From Date"
                  value="2024-01-15"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="To Date"
                  value="2024-02-15"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          </>
        );

      case 'Revoke':
        return (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                label="Revoke Reason"
                value="Security Concerns"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        );

      case 'Creation':
        return (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Email Address"
                  value="hardik.patel@example.com"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Phone Number"
                  value="+91 98765 43210"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Department"
                  value="Operations"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Reporting Manager"
                  value="John Smith"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          </>
        );

      case 'Modification':
        return (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Previous Role"
                  value="User"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="New Role"
                  value="Operational"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Modification Date"
                  value="2024-01-10"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          </>
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
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="User Name"
                      value={approvalData.userName}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="User Role"
                      value={approvalData.userRole}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="User ID"
                      value={approvalData.userId}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Second Row - Region and Branch */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Region"
                      value={approvalData.region}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Branch"
                      value={approvalData.branch}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Activity Specific Fields */}
                {renderActivitySpecificFields()}

                {/* Remark Section */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Remark"
                      value={approvalData.remark}
                      fullWidth
                      multiline
                      rows={4}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box
                  className="approval-action-buttons"
                  sx={{
                    mt: 3,
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleReject}
                    className="reject-button"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleApprove}
                    className="approve-button"
                    sx={{
                      backgroundColor: '#002CBA',
                      '&:hover': {
                        backgroundColor: '#002CBA',
                      },
                    }}
                  >
                    Approve
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
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Request Approved
              </Typography>
              <Typography variant="body1" sx={{ color: '#8c8c8c', mb: 1 }}>
                [ {approvalData.userName} ] [ {approvalData.userRole} ]
              </Typography>
              <Typography variant="body1" sx={{ color: '#8c8c8c' }}>
                {getSuccessMessage()}
              </Typography>
            </Box>
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

export default ApprovalDetails;
