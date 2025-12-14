/* eslint-disable react-hooks/exhaustive-deps */
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import '../ModifyUser/modifyUser.css';
import OTPModal from '../Modal/OTPModal';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  approveWorkflow,
  clearWorkflowState,
} from '../approvalsModify/slices/approvalsModifyUserSlice';
import { ConfirmationModal } from '../Modal/ConfirmationModal';
import RejectionModal from '../Modal/RejectModal/rejectModal';
import SuccessModal from '../Modal/SuccessModal/successModal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const ApprovalModifyUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [userDetailsExpanded, setUserDetailsExpanded] = useState(true);
  const [addressDetailsExpanded, setAddressDetailsExpanded] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('success');

  // Redux selectors
  const {
    loading: workflowLoading,
    error: workflowError,
    approvalData: workflowApprovalData,
  } = useSelector((state: RootState) => state.modifyUserWorkflow);

  // Extract data from navigation state
  const stateData = location.state || {};
  const workflowId =
    stateData?.workflowId ||
    stateData?.workflowData?.workflowId ||
    'sample-workflow-id';
  const userInfo =
    stateData.userData?.user || stateData.workflowData?.userDto?.user || {};
  const addressInfo =
    stateData.userData?.address ||
    stateData.workflowData?.userDto?.address ||
    {};

  // Form state, replacing Ant Design's form hook
  const [formState, setFormState] = useState({
    citizenship: '',
    ckycNumber: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    designation: '',
    email: '',
    gender: '',
    countryCode: '',
    mobileNumber: '',
    dateOfBirth: null as Dayjs | null,
    proofOfIdentity: '',
    proofOfIdentityNumber: '',
    employeeCode: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressCountryCode: '',
    state: '',
    district: '',
    cityTown: '',
    pinCode: '',
    pinCodeOthers: '',
    functionalities: [],
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  // Fix: The DatePicker's onChange handler expects a `Moment | null` value,
  // which matches the type of `formState.dateOfBirth`.
  // const handleDateChange = (date: Dayjs | null) => {
  //   setFormState((prevState) => ({ ...prevState, dateOfBirth: date }));
  // };

  useEffect(() => {
    // Populate form with existing user data
    if (userInfo && Object.keys(userInfo).length > 0) {
      setFormState({
        citizenship: userInfo.citizenship || '',
        ckycNumber: userInfo.ckycNumber || '',
        title: userInfo.title || '',
        firstName: userInfo.firstName || '',
        middleName: userInfo.middleName || '',
        lastName: userInfo.lastName || '',
        designation: userInfo.designation || '',
        email: userInfo.emailId || '',
        gender: userInfo.gender || '',
        countryCode: userInfo.countryCode || '',
        mobileNumber: userInfo.mobileNumber || '',
        dateOfBirth: userInfo?.dob ? dayjs(userInfo?.dob) : null,
        proofOfIdentity: userInfo.proofOfIdentity || '',
        proofOfIdentityNumber: userInfo.proofOfIdentityNumber || '',
        employeeCode: userInfo.employeeCode || '',
        addressLine1: addressInfo.line1 || '',
        addressLine2: addressInfo.line2 || '',
        addressLine3: addressInfo.line3 || '',
        addressCountryCode: addressInfo.countryCode || '',
        state: addressInfo.state || '',
        district: addressInfo.district || '',
        cityTown: addressInfo.city || '',
        pinCode: addressInfo.pincode || '',
        pinCodeOthers: addressInfo.pincodeInCaseOfOthers || '',
        functionalities: userInfo.role || userInfo.functionalities || [],
      });
    } else {
      setSnackbarMessage('No user data found. Redirecting back...');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setTimeout(() => navigate(-1), 3000);
    }
  }, [userInfo, addressInfo, navigate]);

  const handleApprove = async () => {
    if (!workflowId || workflowId === 'sample-workflow-id') {
      setSnackbarMessage('Invalid workflow ID. Cannot proceed with approval.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const approvalPayload = {
      workflowId,
      action: 'APPROVE',
      remarks: 'Approved from UI',
      reason: 'approve modify user',
    };

    try {
      await dispatch(approveWorkflow(approvalPayload)).unwrap();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmationOk = async (values: any) => {
    setConfirmationLoading(true);

    if (!workflowId || workflowId === 'sample-workflow-id') {
      setSnackbarMessage('Invalid workflow ID. Cannot proceed with rejection.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setConfirmationLoading(false);
      return;
    }

    const rejectionPayload = {
      workflowId,
      action: 'REJECT',
      remarks: values.remarks || 'Rejected from UI',
      reason: values.reason || 'reject modify user',
    };

    try {
      await dispatch(approveWorkflow(rejectionPayload)).unwrap();
      setShowConfirmationModal(false);
      setShowRejectionModal(true);
    } catch (error) {
      console.error('Rejection failed:', error);
      setSnackbarMessage('Failed to reject workflow');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setConfirmationLoading(false);
    }
  };

  useEffect(() => {
    if (workflowApprovalData && !workflowLoading && !workflowError) {
      setShowSuccessModal(true);
      setSnackbarMessage('Workflow approved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  }, [workflowApprovalData, workflowLoading, workflowError]);

  useEffect(() => {
    if (workflowError) {
      setSnackbarMessage(`Failed: ${workflowError}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setTimeout(() => {
        dispatch(clearWorkflowState());
      }, 3000);
    }
  }, [workflowError, dispatch]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (!userInfo || Object.keys(userInfo).length === 0) {
    return (
      <Box className="dashboard">
        <Box className="dashboard-content" sx={{ background: '#F5F5F5' }}>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Loading user data...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="dashboard">
      <Box className="dashboard-content" sx={{ background: '#F5F5F5' }}>
        <Box component="main" className="main-content create-new-user-main">
          {/* Header Section */}
          <Box className="page-header create-new-user-page-header">
            <Box className="header-left create-new-user-header-left">
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                className="back-button create-new-user-back-button"
              >
                Back
              </Button>
              <Typography
                variant="h5"
                component="h2"
                className="page-title create-new-user-page-title"
              >
                Modify User - {userInfo.firstName} {userInfo.lastName}
              </Typography>
            </Box>
          </Box>

          {/* Form Content */}
          <Box className="create-user-container create-new-user-container">
            <Box
              component="form"
              noValidate
              autoComplete="off"
              className="create-user-form create-new-user-form"
            >
              {/* User Details Section */}
              <Card className="details-card create-new-user-details-card">
                <Box
                  className="card-header create-new-user-card-header"
                  onClick={() => setUserDetailsExpanded(!userDetailsExpanded)}
                >
                  <Typography variant="subtitle1">User Details</Typography>
                  {userDetailsExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>

                {userDetailsExpanded && (
                  <CardContent className="card-content create-new-user-card-content">
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth disabled>
                          <InputLabel>Citizenship *</InputLabel>
                          <Select
                            name="citizenship"
                            value={formState.citizenship}
                            onChange={handleSelectChange}
                            label="Citizenship *"
                          >
                            <MenuItem value="IN">Indian</MenuItem>
                            <MenuItem value="foreign">Foreign</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="ckycNumber"
                          label="CKYC Number *"
                          value={formState.ckycNumber}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth disabled>
                          <InputLabel>Title *</InputLabel>
                          <Select
                            name="title"
                            value={formState.title}
                            onChange={handleSelectChange}
                            label="Title *"
                          >
                            <MenuItem value="mr">Mr.</MenuItem>
                            <MenuItem value="mrs">Mrs.</MenuItem>
                            <MenuItem value="ms">Ms.</MenuItem>
                            <MenuItem value="dr">Dr.</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="firstName"
                          label="First Name *"
                          inputProps={{ maxLength: 33 }}
                          value={formState.firstName}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="middleName"
                          label="Middle Name"
                          inputProps={{ maxLength: 33 }}
                          value={formState.middleName}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="lastName"
                          label="Last Name"
                          inputProps={{ maxLength: 33 }}
                          value={formState.lastName}
                          fullWidth
                          disabled
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="designation"
                          label="Designation *"
                          value={formState.designation}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="email"
                          label="Email *"
                          value={formState.email}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth disabled>
                          <InputLabel>Gender *</InputLabel>
                          <Select
                            name="gender"
                            value={formState.gender}
                            onChange={handleSelectChange}
                            label="Gender *"
                          >
                            <MenuItem value="M">Male</MenuItem>
                            <MenuItem value="F">Female</MenuItem>
                            <MenuItem value="O">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth disabled>
                          <InputLabel>Country Code *</InputLabel>
                          <Select
                            name="countryCode"
                            value={formState.countryCode}
                            onChange={handleSelectChange}
                            label="Country Code *"
                          >
                            <MenuItem value="+91">+91 (India)</MenuItem>
                            <MenuItem value="+1">+1 (USA)</MenuItem>
                            <MenuItem value="+44">+44 (UK)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="mobileNumber"
                          label="Mobile Number *"
                          value={formState.mobileNumber}
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Date of Birth *"
                            // inputFormat="DD-MM-YYYY"
                            value={formState.dateOfBirth}
                            // onChange={handleDateChange}
                            disabled
                            slotProps={{
                              textField: {
                                fullWidth: true,
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Proof of Identity *</InputLabel>
                          <Select
                            name="proofOfIdentity"
                            value={formState.proofOfIdentity}
                            onChange={handleSelectChange}
                            label="Proof of Identity *"
                          >
                            <MenuItem value="A">Aadhar Card</MenuItem>
                            <MenuItem value="P">Passport</MenuItem>
                            <MenuItem value="D">Driving License</MenuItem>
                            <MenuItem value="V">Voter ID</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="proofOfIdentityNumber"
                          label="Proof of Identity Number *"
                          value={formState.proofOfIdentityNumber}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="employeeCode"
                          label="Employee Code *"
                          value={formState.employeeCode}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                )}
              </Card>

              {/* User Address Details Section */}
              <Card className="details-card create-new-user-details-card">
                <Box
                  className="card-header create-new-user-card-header"
                  onClick={() =>
                    setAddressDetailsExpanded(!addressDetailsExpanded)
                  }
                >
                  <Typography variant="subtitle1">
                    User Address Details
                  </Typography>
                  {addressDetailsExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>

                {addressDetailsExpanded && (
                  <CardContent className="card-content create-new-user-card-content">
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="addressLine1"
                          label="Address Line 1 *"
                          value={formState.addressLine1}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="addressLine2"
                          label="Address Line 2"
                          value={formState.addressLine2}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="addressLine3"
                          label="Address Line 3"
                          value={formState.addressLine3}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Country Code *</InputLabel>
                          <Select
                            name="addressCountryCode"
                            value={formState.addressCountryCode}
                            onChange={handleSelectChange}
                            label="Country Code *"
                          >
                            <MenuItem value="IN">IN (India)</MenuItem>
                            <MenuItem value="US">US (USA)</MenuItem>
                            <MenuItem value="UK">UK (UK)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="state"
                          label="State / UT *"
                          value={formState.state}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="district"
                          label="District *"
                          value={formState.district}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="cityTown"
                          label="City/Town *"
                          value={formState.cityTown}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="pinCode"
                          label="Pin Code *"
                          value={formState.pinCode}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          name="pinCodeOthers"
                          label="Pin Code (in case of others)"
                          value={formState.pinCodeOthers}
                          onChange={handleInputChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                )}
              </Card>

              {/* Action Buttons */}
              <Box
                className="form-actions create-new-user-form-actions"
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
                  className="validate-button create-new-user-validate-button"
                  disabled={workflowLoading}
                >
                  Reject
                </Button>

                <OTPModal
                  isOpen={isOtpModalOpen}
                  onClose={() => setIsOtpModalOpen(false)}
                  setShowSuccessModal={setShowSuccessModal}
                  email={formState.email}
                  mobile={formState.mobileNumber}
                  countryCode={formState.countryCode}
                />

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleApprove}
                  disabled={workflowLoading} // use disabled prop instead of custom 'loading'
                  className="submit-button create-new-user-submit-button"
                  sx={{
                    backgroundColor: '#002CBA',
                    '&:hover': {
                      backgroundColor: '#002CBA',
                    },
                  }}
                >
                  {workflowLoading ? 'Processing...' : 'Approve'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        <SuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message="Modify User Request Approved Successfully"
          buttonText="Okay"
          buttonColor="#002CBA"
          width={500}
        />

        <ConfirmationModal
          visible={showConfirmationModal}
          onOk={handleConfirmationOk}
          onCancel={() => setShowConfirmationModal(false)}
          type="deactivate"
          loading={confirmationLoading}
        />

        <RejectionModal
          visible={showRejectionModal}
          onClose={() => setShowRejectionModal(false)}
          message="Modify User Request Rejected"
          subtitle="The sub-user request has been rejected and the user has been notified."
          buttonText="Okay"
          iconColor="#ff4d4f"
          buttonColor="#002CBA"
        />

        {/* Footer */}
        <Box className="page-footer create-new-user-page-footer">
          <Typography className="footer-text create-new-user-footer-text">
            © 2025 CKYCRR. All Rights Reserved.
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalModifyUser;
