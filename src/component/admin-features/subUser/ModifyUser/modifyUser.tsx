/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useForm, Controller } from 'react-hook-form';
import './modifyUser.css';
import OTPModal from '../Modal/OTPModal';

import { AppDispatch, RootState } from '../../../../redux/store';
import {
  sendOtp,
  clearSendOtpError,
  clearSendOtpSuccess,
  selectCreateUserState,
} from '../CreateNewUser/slices/createUserSlice';

interface ModifyUserFormData {
  citizenship: string;
  ckycNumber: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  designation: string;
  email: string;
  gender: string;
  countryCode: string;
  mobileNumber: string;
  dateOfBirth: string;
  proofOfIdentity: string;
  proofOfIdentityNumber: string;
  employeeCode: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressCountryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  pinCodeOthers: string;
  functionalities: string;
}

const ModifyUser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ModifyUserFormData>();
  const [loading, setLoading] = useState(false);
  const [userDetailsExpanded, setUserDetailsExpanded] = useState(true);
  const [addressDetailsExpanded, setAddressDetailsExpanded] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const createUserState = useSelector(selectCreateUserState);
  const { sendOtpLoading, sendOtpError, sendOtpSuccess } = createUserState;

  const userData = location.state?.user;

  useEffect(() => {
    if (!userData) {
      setSnackbar({
        open: true,
        message: 'No user data found. Redirecting back...',
        severity: 'error',
      });
      navigate(-1);
      return;
    }

    // Populate form with existing user data using setValue from react-hook-form
    let formattedDate = userData;
    // let formattedValue = values;
    const date = new Date(userData.dob as string);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toISOString().split('T')[0];
    }
    const dob = userData.dob ? formattedDate : null;
    const initialValues: ModifyUserFormData = {
      citizenship: userData.citizenship || '',
      ckycNumber: userData.ckycNumber || '',
      title: userData.title || '',
      firstName: userData.firstName || '',
      middleName: userData.middleName || '',
      lastName: userData.lastName || '',
      designation: userData.designation || '',
      email: userData.emailId || '',
      gender: userData.gender || '',
      countryCode: userData.countryCode || '',
      mobileNumber: userData.mobileNumber || '',
      dateOfBirth: dob,
      proofOfIdentity: userData.proofOfIdentity || '',
      proofOfIdentityNumber: userData.proofOfIdentityNumber || '',
      employeeCode: userData.employeeCode || '',
      addressLine1: userData.address?.line1 || '',
      addressLine2: userData.address?.line2 || '',
      addressLine3: userData.address?.line3 || '',
      addressCountryCode: userData.address?.countryCode || '',
      state: userData.address?.state || '',
      district: userData.address?.district || '',
      cityTown: userData.address?.city || '',
      pinCode: userData.address?.pincode || '',
      pinCodeOthers: userData.address?.pincodeInCaseOfOthers || '',
      functionalities: userData.role || userData.functionalities || '',
    };
    (Object.keys(initialValues) as Array<keyof ModifyUserFormData>).forEach(
      (key) => {
        setValue(key, initialValues[key]);
      }
    );
  }, [userData, navigate, setValue]);

  useEffect(() => {
    if (sendOtpSuccess) {
      setSnackbar({
        open: true,
        message: 'OTP sent successfully to email and mobile',
        severity: 'success',
      });
      setIsOtpModalOpen(true);
      dispatch(clearSendOtpSuccess());
    }
  }, [sendOtpSuccess, dispatch]);

  useEffect(() => {
    if (sendOtpError) {
      let message = 'An unexpected error occurred.';
      // Corrected to use httpCode from the ApiError type in your slice
      const status = sendOtpError.httpCode;

      if (status === 200) {
        // Display the literal string "200" as the message
        message = '200';
      } else if (status === 400) {
        // For 400, show the specific API error message
        message = sendOtpError.errorMessage || 'API Error';
      } else if (status === 500) {
        // For 500, show the generic server error message
        message = 'Something went wrong, Unable to process your request !';
      } else if (sendOtpError.errorMessage) {
        // Fallback for other errors
        message = sendOtpError.errorMessage;
      }

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
      dispatch(clearSendOtpError());
    }
  }, [sendOtpError, dispatch]);

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const onSubmit = async (data: ModifyUserFormData) => {
    try {
      setLoading(true);
      // console.log('Modified form values:', data);

      // Here you would call your Redux action to update the user
      // dispatch(updateUser({ userId: userData.id, updatedData: values }));

      // Simulate API call
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
        setLoading(false);
        navigate(-1); // Go back to previous page
      }, 1000);
    } catch (error) {
      console.error('Validation failed:', error);
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    const email = watch('email');
    const mobileNumber = watch('mobileNumber');

    if (!email || !mobileNumber) {
      setSnackbar({
        open: true,
        message: 'Email and mobile number are required for OTP verification',
        severity: 'error',
      });
      return;
    }

    const otpRequestData = {
      email: email,
      mobile: mobileNumber,
    };

    // console.log('Sending OTP request:', otpRequestData);
    await dispatch(sendOtp(otpRequestData)).unwrap();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!userData) {
    return (
      <Box className="dashboard">
        {/* <Sidebar /> */}
        <Box className="dashboard-content" sx={{ background: '#F5F5F5' }}>
          {/* <Header /> */}
          <Box sx={{ padding: '20px', textAlign: 'center' }}>
            <Typography>Loading user data...</Typography>
          </Box>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={
              snackbar.severity as 'success' | 'error' | 'info' | 'warning'
            }
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="dashboard">
        {/* <Sidebar /> */}
        <Box className="dashboard-content" sx={{ background: '#F5F5F5' }}>
          {/* <Header /> */}
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
                  Modify User - {userData.firstName} {userData.lastName}
                </Typography>
              </Box>
            </Box>

            {/* Functionalities Mapped Section */}
            <Box className="form-field create-new-user-field">
              <FormControl fullWidth>
                <InputLabel id="functionalities-label">
                  Functionalities Mapped
                </InputLabel>
                <Controller
                  name="functionalities"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Please select functionalities!' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="functionalities-label"
                      label="Functionalities Mapped"
                      error={!!errors.functionalities}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="operational">Operational</MenuItem>
                      <MenuItem value="viewer">Viewer</MenuItem>
                    </Select>
                  )}
                />
                {errors.functionalities && (
                  <Typography color="error" variant="caption">
                    {errors.functionalities.message}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Form Content */}
            <Box className="create-user-container create-new-user-container">
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                className="create-user-form create-new-user-form"
              >
                {/* User Details Section */}
                <Card sx={{ mb: 2 }}>
                  <CardHeader
                    title="User Details"
                    action={
                      <IconButton
                        onClick={() =>
                          setUserDetailsExpanded(!userDetailsExpanded)
                        }
                      >
                        {userDetailsExpanded ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    }
                  />

                  {userDetailsExpanded && (
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControl fullWidth>
                            <InputLabel id="citizenship-label">
                              Citizenship
                            </InputLabel>
                            <Controller
                              name="citizenship"
                              control={control}
                              rules={{ required: 'Please select citizenship!' }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="citizenship-label"
                                  label="Citizenship"
                                  error={!!errors.citizenship}
                                >
                                  <MenuItem value="indian">Indian</MenuItem>
                                  <MenuItem value="foreign">Foreign</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.citizenship && (
                            <Typography color="error" variant="caption">
                              {errors.citizenship.message}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="ckycNumber"
                            control={control}
                            rules={{ required: 'Please enter CKYC number!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="CKYC Number"
                                error={!!errors.ckycNumber}
                                helperText={
                                  errors.ckycNumber
                                    ? errors.ckycNumber.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControl fullWidth>
                            <InputLabel id="title-label">Title</InputLabel>
                            <Controller
                              name="title"
                              control={control}
                              rules={{ required: 'Please select title!' }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="title-label"
                                  label="Title"
                                  error={!!errors.title}
                                >
                                  <MenuItem value="mr">Mr.</MenuItem>
                                  <MenuItem value="mrs">Mrs.</MenuItem>
                                  <MenuItem value="ms">Ms.</MenuItem>
                                  <MenuItem value="dr">Dr.</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.title && (
                            <Typography color="error" variant="caption">
                              {errors.title.message}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="firstName"
                            control={control}
                            rules={{ required: 'Please enter first name!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="First Name"
                                error={!!errors.firstName}
                                helperText={
                                  errors.firstName
                                    ? errors.firstName.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="middleName"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Middle Name"
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="lastName"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Last Name"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="designation"
                            control={control}
                            rules={{ required: 'Please enter designation!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Designation"
                                error={!!errors.designation}
                                inputProps={{ maxLength: 100 }}
                                helperText={
                                  errors.designation
                                    ? errors.designation.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="email"
                            control={control}
                            rules={{
                              required: 'Please enter email!',
                              pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Please enter a valid email!',
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Email"
                                inputProps={{ maxLength: 255 }}
                                error={!!errors.email}
                                helperText={
                                  errors.email ? errors.email.message : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControl fullWidth>
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Controller
                              name="gender"
                              control={control}
                              rules={{ required: 'Please select gender!' }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="gender-label"
                                  label="Gender"
                                  error={!!errors.gender}
                                >
                                  <MenuItem value="male">Male</MenuItem>
                                  <MenuItem value="female">Female</MenuItem>
                                  <MenuItem value="other">Other</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.gender && (
                            <Typography color="error" variant="caption">
                              {errors.gender.message}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControl fullWidth>
                            <InputLabel id="country-code-label">
                              Country Code
                            </InputLabel>
                            <Controller
                              name="countryCode"
                              control={control}
                              rules={{
                                required: 'Please select country code!',
                              }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="country-code-label"
                                  label="Country Code"
                                  error={!!errors.countryCode}
                                >
                                  <MenuItem value="+91">+91 (India)</MenuItem>
                                  <MenuItem value="+1">+1 (USA)</MenuItem>
                                  <MenuItem value="+44">+44 (UK)</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.countryCode && (
                            <Typography color="error" variant="caption">
                              {errors.countryCode.message}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="mobileNumber"
                            control={control}
                            rules={{ required: 'Please enter mobile number!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Mobile Number"
                                error={!!errors.mobileNumber}
                                helperText={
                                  errors.mobileNumber
                                    ? errors.mobileNumber.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Controller
                              name="dateOfBirth"
                              control={control}
                              rules={{
                                required: 'Please select date of birth!',
                              }}
                              render={({ field }) => (
                                <DatePicker
                                  {...field}
                                  value={
                                    field.value
                                      ? typeof field.value === 'string'
                                        ? field.value
                                          ? new Date(field.value)
                                          : null
                                        : field.value
                                      : null
                                  }
                                  onChange={(value, _context) => {
                                    // Accepts Dayjs, Date, string, or null
                                    if (
                                      value &&
                                      typeof value === 'object' &&
                                      'toISOString' in value
                                    ) {
                                      // Date object
                                      field.onChange(
                                        (value as Date).toISOString()
                                      );
                                    } else if (
                                      value &&
                                      typeof value === 'object' &&
                                      'toDate' in value
                                    ) {
                                      // Dayjs object
                                      field.onChange(
                                        (value as any).toDate().toISOString()
                                      );
                                    } else if (typeof value === 'string') {
                                      field.onChange(value);
                                    } else {
                                      field.onChange('');
                                    }
                                  }}
                                  label="Date of Birth"
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: !!errors.dateOfBirth,
                                      helperText: errors.dateOfBirth
                                        ? errors.dateOfBirth.message
                                        : null,
                                    },
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControl fullWidth>
                            <InputLabel id="proof-of-identity-label">
                              Proof of Identity
                            </InputLabel>
                            <Controller
                              name="proofOfIdentity"
                              control={control}
                              rules={{
                                required: 'Please select proof of identity!',
                              }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="proof-of-identity-label"
                                  label="Proof of Identity"
                                  error={!!errors.proofOfIdentity}
                                >
                                  <MenuItem value="aadhar">
                                    Aadhar Card
                                  </MenuItem>
                                  <MenuItem value="passport">Passport</MenuItem>
                                  <MenuItem value="driving_license">
                                    Driving License
                                  </MenuItem>
                                  <MenuItem value="voter_id">Voter ID</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.proofOfIdentity && (
                            <Typography color="error" variant="caption">
                              {errors.proofOfIdentity.message}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="proofOfIdentityNumber"
                            control={control}
                            rules={{
                              required:
                                'Please enter proof of identity number!',
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Proof of Identity Number"
                                error={!!errors.proofOfIdentityNumber}
                                helperText={
                                  errors.proofOfIdentityNumber
                                    ? errors.proofOfIdentityNumber.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="employeeCode"
                            control={control}
                            rules={{ required: 'Please enter employee code!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Employee Code"
                                error={!!errors.employeeCode}
                                helperText={
                                  errors.employeeCode
                                    ? errors.employeeCode.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  )}
                </Card>

                {/* User Address Details Section */}
                <Card sx={{ mb: 2 }}>
                  <CardHeader
                    title="User Address Details"
                    action={
                      <IconButton
                        onClick={() =>
                          setAddressDetailsExpanded(!addressDetailsExpanded)
                        }
                      >
                        {addressDetailsExpanded ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    }
                  />

                  {addressDetailsExpanded && (
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="addressLine1"
                            control={control}
                            rules={{ required: 'Please enter address line 1!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Address Line 1"
                                error={!!errors.addressLine1}
                                helperText={
                                  errors.addressLine1
                                    ? errors.addressLine1.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="addressLine2"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Address Line 2"
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="addressLine3"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Address Line 3"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControl fullWidth>
                            <InputLabel id="address-country-code-label">
                              Country Code
                            </InputLabel>
                            <Controller
                              name="addressCountryCode"
                              control={control}
                              rules={{ required: 'Please select country!' }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="address-country-code-label"
                                  label="Country Code"
                                  error={!!errors.addressCountryCode}
                                >
                                  <MenuItem value="IN">IN (India)</MenuItem>
                                  <MenuItem value="US">US (USA)</MenuItem>
                                  <MenuItem value="UK">UK (UK)</MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.addressCountryCode && (
                            <Typography color="error" variant="caption">
                              {errors.addressCountryCode.message}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="state"
                            control={control}
                            rules={{ required: 'Please enter state!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="State / UT"
                                error={!!errors.state}
                                helperText={
                                  errors.state ? errors.state.message : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="district"
                            control={control}
                            rules={{ required: 'Please enter district!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="District"
                                error={!!errors.district}
                                helperText={
                                  errors.district
                                    ? errors.district.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                      </Grid>

                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="cityTown"
                            control={control}
                            rules={{ required: 'Please enter city/town!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="City/Town"
                                error={!!errors.cityTown}
                                helperText={
                                  errors.cityTown
                                    ? errors.cityTown.message
                                    : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="pinCode"
                            control={control}
                            rules={{ required: 'Please enter pin code!' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Pin Code"
                                error={!!errors.pinCode}
                                helperText={
                                  errors.pinCode ? errors.pinCode.message : null
                                }
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="pinCodeOthers"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Pin Code (in case of others)"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  )}
                </Card>

                {/* Action Buttons */}
                <Box
                  className="form-actions create-new-user-form-actions"
                  sx={{ display: 'flex', gap: 2, mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleValidate}
                    disabled={sendOtpLoading}
                    className="validate-button create-new-user-validate-button"
                  >
                    {sendOtpLoading ? 'Sending OTP...' : 'Validate'}
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    className="submit-button create-new-user-submit-button"
                    sx={{ backgroundColor: '#666666' }}
                  >
                    Update User
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          <OTPModal
            isOpen={isOtpModalOpen}
            onClose={() => setIsOtpModalOpen(false)}
            setShowSuccessModal={setShowSuccessModal}
            email={watch('email')}
            mobile={watch('mobileNumber')}
            countryCode={watch('countryCode')}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={
                snackbar.severity as 'success' | 'error' | 'info' | 'warning'
              }
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Footer */}
          <Box className="page-footer create-new-user-page-footer">
            <Typography className="footer-text create-new-user-footer-text">
              © 2025 CKYCRR. All Rights Reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ModifyUser;
