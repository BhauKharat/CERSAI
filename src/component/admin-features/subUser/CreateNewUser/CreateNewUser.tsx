/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useForm, Controller } from 'react-hook-form';
import './CreateNewUser.css';
import OTPModal from '../Modal/OTPModal';

// Redux imports
import type { AppDispatch } from '../../../../redux/store';
import {
  createUser,
  sendOtp,
  clearError,
  clearSendOtpError,
  clearSendOtpSuccess,
  setFormData,
  resetState,
  type CreateUserRequest,
  type SendOtpRequest,
} from '../CreateNewUser/slices/createUserSlice';

// Updated selectors import
import {
  selectCreateLoading,
  selectSendOtpLoading,
  selectCreateError,
  selectSendOtpError,
  selectCreateSuccess,
  selectSendOtpSuccess,
  selectCreatedUser,
  selectAnyLoading,
  selectOtpData,
} from '../CreateNewUser/slices/Selector';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CreateNewUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  // Redux selectors
  const createLoading = useSelector(selectCreateLoading);
  const sendOtpLoading = useSelector(selectSendOtpLoading);
  const createError = useSelector(selectCreateError);
  const sendOtpError = useSelector(selectSendOtpError);
  const createSuccess = useSelector(selectCreateSuccess);
  const sendOtpSuccess = useSelector(selectSendOtpSuccess);
  const createdUser = useSelector(selectCreatedUser);
  const anyLoading = useSelector(selectAnyLoading);
  const otpData = useSelector(selectOtpData);

  // Local state
  const [userDetailsExpanded, setUserDetailsExpanded] = useState(true);
  const [addressDetailsExpanded, setAddressDetailsExpanded] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [, setShowSuccessModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Initialize component
  useEffect(() => {
    dispatch(resetState());

    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  // Handle create success
  useEffect(() => {
    if (createSuccess && createdUser) {
      setSnackbar({
        open: true,
        message: 'User created successfully!',
        severity: 'success',
      });
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [createSuccess, createdUser, navigate]);

  // Handle send OTP success
  useEffect(() => {
    if (sendOtpSuccess && otpData) {
      setIsOtpModalOpen(true);
      setSnackbar({
        open: true,
        message: `OTP sent successfully! ${otpData.message}`,
        severity: 'success',
      });
    }
  }, [sendOtpSuccess, otpData]);

  // Handle errors
  useEffect(() => {
    if (createError) {
      const errorMessage = `${createError.errorCode}: ${createError.errorMessage}`;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      dispatch(clearError());
    }
  }, [createError, dispatch]);

  useEffect(() => {
    if (sendOtpError) {
      const errorMessage = `${sendOtpError.errorCode}: ${sendOtpError.errorMessage}`;
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
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

  // Transform form data to API format
  const transformFormDataToAPI = (values: any): CreateUserRequest => {
    let countryCodeValue = values.countryCode;
    if (countryCodeValue && countryCodeValue.includes('|')) {
      countryCodeValue = countryCodeValue.split('|')[0];
    }

    let addressCountryCodeValue =
      values.addressCountryCode || values.countryCode;
    if (addressCountryCodeValue && addressCountryCodeValue.includes('|')) {
      addressCountryCodeValue = addressCountryCodeValue.split('|')[0];
    }

    let formattedDate = values;
    // let formattedValue = values;
    const date = new Date(values.dateOfBirth as string);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toISOString().split('T')[0];
    }

    const genderMap: Record<string, string> = {
      male: 'M',
      female: 'F',
      other: 'O',
    };

    const citizenshipMap: Record<string, string> = {
      indian: 'IN',
      foreign: 'FN',
    };

    const proofMap: Record<string, string> = {
      aadhar: 'A',
      passport: 'P',
      driving_license: 'D',
      voter_id: 'V',
    };

    return {
      user: {
        title: values.title,
        firstName: values.firstName,
        middleName: values.middleName || '',
        lastName: values.lastName || '',
        designation: values.designation,
        emailId: values.email,
        citizenship: citizenshipMap[values.citizenship] || values.citizenship,
        ckycNumber: values.ckycNumber,
        countryCode: countryCodeValue.replace('+', ''),
        mobileNumber: values.mobileNumber,
        proofOfIdentity:
          proofMap[values.proofOfIdentity] || values.proofOfIdentity,
        dob: formattedDate,
        gender: genderMap[values.gender] || values.gender,
        employeeCode: values.employeeCode,
        role: 'AU',
        functionalityMapped: values.functionalityMapped || 'DASHBOARD',
        proofOfIdentityNumber: values.proofOfIdentityNumber,
      },
      address: {
        line1: values.addressLine1,
        line2: values.addressLine2 || '',
        line3: values.addressLine3 || '',
        countryCode: addressCountryCodeValue,
        state: values.state,
        district: values.district,
        city: values.cityTown,
        pincode: values.pinCode,
        pincodeInCaseOfOthers: values.pinCodeOthers || undefined,
      },
    };
  };

  const handleValidate = async () => {
    try {
      const values = watch();

      const otpRequest: SendOtpRequest = {
        email: values.email,
        mobile: values.mobileNumber,
      };

      // Store form data for later use
      dispatch(setFormData(transformFormDataToAPI(values)));

      // Send OTP
      dispatch(sendOtp(otpRequest));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
      });
    }
  };

  const onSubmit = (values: any) => {
    const apiData = transformFormDataToAPI(values);
    dispatch(setFormData(apiData));
    dispatch(createUser(apiData));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleOtpModalClose = () => {
    setIsOtpModalOpen(false);
    dispatch(clearSendOtpSuccess());
  };

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
                disabled={anyLoading}
              >
                Back
              </Button>
              <Typography
                variant="h5"
                component="h2"
                className="page-title create-new-user-page-title"
              >
                Create New User
              </Typography>
            </Box>
          </Box>

          {/* Form Content */}
          <Box className="create-user-container create-new-user-container">
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              className="create-user-form create-new-user-form"
            >
              {/* Functionalities Mapped Section */}
              <Box className="form-field create-new-user-field">
                <FormControl fullWidth>
                  <InputLabel id="functionality-mapped-label">
                    Functionalities Mapped
                  </InputLabel>
                  <Controller
                    name="functionalityMapped"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Please select functionalities!' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="functionality-mapped-label"
                        label="Functionalities Mapped"
                        error={!!errors.functionalityMapped}
                        disabled={anyLoading}
                      >
                        <MenuItem value="DASHBOARD">Dashboard</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="OPERATIONAL">Operational</MenuItem>
                        <MenuItem value="VIEWER">Viewer</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
                {/* {errors.functionalityMapped && (
                  <Typography color="error" variant="caption">
                    {typeof errors.functionalityMapped === 'string' 
                      ? errors.functionalityMapped 
                      : 'message' in errors.functionalityMapped 
                        ? errors.functionalityMapped.message
                        : 'Invalid selection'}
                  </Typography>
                )} */}
              </Box>

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
                                disabled={anyLoading}
                              >
                                <MenuItem value="indian">Indian</MenuItem>
                                <MenuItem value="foreign">Foreign</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                        {errors.citizenship && (
                          <Typography color="error" variant="caption">
                            {/* {errors.citizenship.message} */}
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
                              // helperText={
                              //   errors.ckycNumber
                              //     ? errors.ckycNumber.message
                              //     : null
                              // }
                              disabled={anyLoading}
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
                                disabled={anyLoading}
                              >
                                <MenuItem value="Mr.">Mr.</MenuItem>
                                <MenuItem value="Mrs.">Mrs.</MenuItem>
                                <MenuItem value="Ms.">Ms.</MenuItem>
                                <MenuItem value="Dr.">Dr.</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                        {errors.title && (
                          <Typography color="error" variant="caption">
                            {/* {errors.title.message} */}
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
                              // helperText={
                              //   errors.firstName
                              //     ? errors.firstName.message
                              //     : null
                              // }
                              disabled={anyLoading}
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
                              disabled={anyLoading}
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
                              disabled={anyLoading}
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
                              inputProps={{ maxLength: 100 }}
                              error={!!errors.designation}
                              // helperText={
                              //   errors.designation
                              //     ? errors.designation.message
                              //     : null
                              // }
                              disabled={anyLoading}
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
                              message: 'Please enter valid email!',
                            },
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Email"
                              inputProps={{ maxLength: 255 }}
                              error={!!errors.email}
                              // helperText={
                              //   errors.email ? errors.email.message : null
                              // }
                              disabled={anyLoading}
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
                                disabled={anyLoading}
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
                            {/* {errors.gender.message} */}
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
                            defaultValue="+91|India"
                            rules={{ required: 'Please select country code!' }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                labelId="country-code-label"
                                label="Country Code"
                                error={!!errors.countryCode}
                                disabled={anyLoading}
                              >
                                <MenuItem value="+91|India">
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                    }}
                                  >
                                    <span className="country-code">+91</span>
                                    <span className="country-name">India</span>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="+1|USA">
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                    }}
                                  >
                                    <span className="country-code">+1</span>
                                    <span className="country-name">USA</span>
                                  </Box>
                                </MenuItem>
                                <MenuItem value="+44|UK">
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                    }}
                                  >
                                    <span className="country-code">+44</span>
                                    <span className="country-name">UK</span>
                                  </Box>
                                </MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                        {errors.countryCode && (
                          <Typography color="error" variant="caption">
                            {/* {errors.countryCode.message} */}
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
                              // helperText={
                              //   errors.mobileNumber
                              //     ? errors.mobileNumber.message
                              //     : null
                              // }
                              disabled={anyLoading}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <Controller
                            name="dateOfBirth"
                            control={control}
                            rules={{ required: 'Please select date of birth!' }}
                            render={({ field }) => (
                              <DatePicker
                                {...field}
                                label="Date of Birth"
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: !!errors.dateOfBirth,
                                    // helperText: errors.dateOfBirth
                                    //   ? errors.dateOfBirth.message
                                    //   : null,
                                    disabled: anyLoading,
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
                                disabled={anyLoading}
                              >
                                <MenuItem value="aadhar">Aadhar Card</MenuItem>
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
                            {/* {errors.proofOfIdentity.message} */}
                          </Typography>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Controller
                          name="proofOfIdentityNumber"
                          control={control}
                          rules={{
                            required: 'Please enter proof of identity number!',
                          }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Proof of Identity Number"
                              error={!!errors.proofOfIdentityNumber}
                              // helperText={
                              //   errors.proofOfIdentityNumber
                              //     ? errors.proofOfIdentityNumber.message
                              //     : null
                              // }
                              disabled={anyLoading}
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
                              // helperText={
                              //   errors.employeeCode
                              //     ? errors.employeeCode.message
                              //     : null
                              // }
                              disabled={anyLoading}
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
                  <>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="addressLine1"
                            rules={{ required: 'Please enter address line 1!' }}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Address Line 1"
                                error={!!errors.addressLine1}
                                // helperText={
                                //   errors.addressLine1
                                //     ? errors.addressLine1.message
                                //     : null
                                // }
                                disabled={anyLoading}
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
                                disabled={anyLoading}
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
                                disabled={anyLoading}
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
                              defaultValue="IN"
                              rules={{
                                required: 'Please select country code!',
                              }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  labelId="address-country-code-label"
                                  label="Country Code"
                                  error={!!errors.addressCountryCode}
                                  disabled={anyLoading}
                                >
                                  <MenuItem value="IN">
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                      }}
                                    >
                                      <span className="country-code">IN</span>
                                      <span className="country-name">
                                        India
                                      </span>
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value="US">
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                      }}
                                    >
                                      <span className="country-code">US</span>
                                      <span className="country-name">USA</span>
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value="GB">
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                      }}
                                    >
                                      <span className="country-code">GB</span>
                                      <span className="country-name">UK</span>
                                    </Box>
                                  </MenuItem>
                                </Select>
                              )}
                            />
                          </FormControl>
                          {errors.addressCountryCode && (
                            <Typography color="error" variant="caption">
                              {/* {errors.addressCountryCode.message} */}
                            </Typography>
                          )}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="state"
                            control={control}
                            rules={{ required: 'Please enter state!' }}
                            defaultValue="Maharashtra"
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="State / UT"
                                error={!!errors.state}
                                // helperText={
                                //   errors.state ? errors.state.message : null
                                // }
                                disabled={anyLoading}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="district"
                            control={control}
                            rules={{ required: 'Please enter district!' }}
                            defaultValue="Pune"
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="District"
                                error={!!errors.district}
                                // helperText={
                                //   errors.district
                                //     ? errors.district.message
                                //     : null
                                // }
                                disabled={anyLoading}
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
                            defaultValue="Pune"
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="City/Town"
                                error={!!errors.cityTown}
                                // helperText={
                                //   errors.cityTown
                                //     ? errors.cityTown.message
                                //     : null
                                // }
                                disabled={anyLoading}
                              />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Controller
                            name="pinCode"
                            control={control}
                            rules={{ required: 'Please enter pin code!' }}
                            defaultValue="411045"
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Pin Code"
                                error={!!errors.pinCode}
                                // helperText={
                                //   errors.pinCode ? errors.pinCode.message : null
                                // }
                                disabled={anyLoading}
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
                                disabled={anyLoading}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </>
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
                  className="validate-button create-new-user-validate-button"
                  disabled={sendOtpLoading || anyLoading}
                >
                  {sendOtpLoading ? 'Sending OTP...' : 'Validate'}
                </Button>

                <Button
                  variant="contained"
                  type="submit"
                  disabled={createLoading || anyLoading || !sendOtpSuccess}
                  className="submit-button create-new-user-submit-button"
                  sx={{
                    backgroundColor: sendOtpSuccess ? '#666666' : '#cccccc',
                    borderColor: sendOtpSuccess ? '#666666' : '#cccccc',
                    '&:hover': {
                      backgroundColor: sendOtpSuccess ? '#555555' : '#cccccc',
                    },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box className="page-footer create-new-user-page-footer">
          <Typography className="footer-text create-new-user-footer-text">
            © 2025 CKYCRR. All Rights Reserved.
          </Typography>
        </Box>
      </Box>

      {/* OTP Modal */}
      <OTPModal
        isOpen={isOtpModalOpen}
        onClose={handleOtpModalClose}
        setShowSuccessModal={setShowSuccessModal}
        email={watch('email') || ''}
        mobile={watch('mobileNumber') || ''}
        countryCode={watch('countryCode')?.split('|')[0] || '+91'}
      />
    </Box>
  );
};

export default CreateNewUser;
