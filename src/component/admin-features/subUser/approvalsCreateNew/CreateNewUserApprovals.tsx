import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ArrowBackOutlined as ArrowBackIcon,
  ExpandMoreOutlined as ExpandMoreIcon,
  ExpandLessOutlined as ExpandLessIcon,
} from '@mui/icons-material';
import OTPModal from '../Modal/OTPModal';

// Redux imports
import type { AppDispatch } from '../../../../redux/store';
import {
  createUser,
  validateUserData,
  clearError,
  clearValidationError,
  clearValidationSuccess,
  setFormData,
  setValidationData,
  resetState,
  type CreateUserRequest,
} from '../CreateNewUser/slices/createUserSlice';
import {
  selectCreateError,
  selectValidationError,
  selectCreateSuccess,
  selectValidationSuccess,
  selectCreatedUser,
  selectAnyLoading,
} from '../CreateNewUser/slices/Selector';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Local state for form values
interface FormDataState {
  functionalityMapped: string;
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
  dateOfBirth: dayjs.Dayjs | null;
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
}

const CreateNewUserApprovals: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const createError = useSelector(selectCreateError);
  const validationError = useSelector(selectValidationError);
  const createSuccess = useSelector(selectCreateSuccess);
  const validationSuccess = useSelector(selectValidationSuccess);
  const createdUser = useSelector(selectCreatedUser);
  const anyLoading = useSelector(selectAnyLoading);

  // Local state
  const [userDetailsExpanded, setUserDetailsExpanded] = useState(true);
  const [addressDetailsExpanded, setAddressDetailsExpanded] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [, setShowSuccessModal] = useState(false);
  const [formData, setFormDataState] = useState<FormDataState>({
    functionalityMapped: '',
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
    state: 'Maharashtra',
    district: 'Pune',
    cityTown: 'Pune',
    pinCode: '411045',
    pinCodeOthers: '',
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<FormDataState>
  >({});
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | null;
  }>({ text: '', type: null });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = <K extends keyof FormDataState>(
    name: K, // Change this line
    value: FormDataState[K]
  ) => {
    setFormDataState((prev) => ({ ...prev, [name]: value }));
  };

  // Show Ant Design-style messages
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: null }), 3000);
  };

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
      showMessage('User created successfully!', 'success');
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [createSuccess, createdUser, navigate]);

  // Handle validation success
  useEffect(() => {
    if (validationSuccess) {
      setIsOtpModalOpen(true);
      showMessage('Validation successful! Please verify OTP.', 'success');
    }
  }, [validationSuccess]);

  // Handle errors
  useEffect(() => {
    if (createError) {
      const errorMessage = `${createError.errorCode}: ${createError.errorMessage}`;
      showMessage(errorMessage, 'error');
      dispatch(clearError());
    }
  }, [createError, dispatch]);

  useEffect(() => {
    if (validationError) {
      const errorMessage = `${validationError.errorCode}: ${validationError.errorMessage}`;
      showMessage(errorMessage, 'error');
      dispatch(clearValidationError());
    }
  }, [validationError, dispatch]);

  // Transform form data to API format
  const transformFormDataToAPI = (values: FormDataState): CreateUserRequest => {
    let countryCodeValue = values.countryCode;
    if (countryCodeValue && countryCodeValue.includes('|')) {
      countryCodeValue = countryCodeValue.split('|')[0];
    }

    let addressCountryCodeValue =
      values.addressCountryCode || values.countryCode;
    if (addressCountryCodeValue && addressCountryCodeValue.includes('|')) {
      addressCountryCodeValue = addressCountryCodeValue.split('|')[0];
    }

    const formattedDate = values.dateOfBirth
      ? dayjs(values.dateOfBirth).format('YYYY-MM-DD')
      : '';

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
        countryCode: countryCodeValue,
        mobileNumber: values.mobileNumber,
        proofOfIdentity:
          proofMap[values.proofOfIdentity] || values.proofOfIdentity,
        proofOfIdentityNumber: values.proofOfIdentityNumber,
        dob: formattedDate,
        gender: genderMap[values.gender] || values.gender,
        employeeCode: values.employeeCode,
        role: 'AU',
        functionalityMapped: values.functionalityMapped || 'DASHBOARD',
      },
      address: {
        line1: values.addressLine1,
        line2: values.addressLine2 || '',
        line3: values.addressLine3 || '',
        countryCode: addressCountryCodeValue.replace('+', ''),
        state: values.state,
        district: values.district,
        city: values.cityTown,
        pincode: values.pinCode,
        pincodeInCaseOfOthers: values.pinCodeOthers || undefined,
      },
    };
  };

  const validateForm = (fieldsToValidate: string[]): boolean => {
    const newErrors: Partial<FormDataState> = {};
    let isValid = true;
    const requiredFields: (keyof FormDataState)[] = [
      'functionalityMapped',
      'citizenship',
      'ckycNumber',
      'title',
      'firstName',
      'designation',
      'email',
      'gender',
      'countryCode',
      'mobileNumber',
      'dateOfBirth',
      'proofOfIdentity',
      'proofOfIdentityNumber',
      'employeeCode',
      'addressLine1',
      'addressCountryCode',
      'state',
      'district',
      'cityTown',
      'pinCode',
    ];

    for (const field of requiredFields) {
      if (fieldsToValidate.includes(field)) {
        // if (!formData[field]) {
        //   newErrors[field] = 'This field is required.';
        //   isValid = false;
        // }
      }
    }

    if (
      fieldsToValidate.includes('email') &&
      formData.email &&
      !/^\S+@\S+\.\S+$/.test(formData.email)
    ) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleValidate = () => {
    const requiredFields: (keyof FormDataState)[] = [
      'email',
      'mobileNumber',
      'countryCode',
    ];
    if (validateForm(requiredFields)) {
      const validationData = {
        email: formData.email,
        mobile: formData.mobileNumber,
        countryCode: formData.countryCode.split('|')[0],
      };
      dispatch(setValidationData(validationData));
      dispatch(validateUserData(validationData));
    } else {
      showMessage('Please fill all required fields.', 'error');
    }
  };

  const handleSubmit = () => {
    const allFields: (keyof FormDataState)[] = [
      'functionalityMapped',
      'citizenship',
      'ckycNumber',
      'title',
      'firstName',
      'designation',
      'email',
      'gender',
      'countryCode',
      'mobileNumber',
      'dateOfBirth',
      'proofOfIdentity',
      'proofOfIdentityNumber',
      'employeeCode',
      'addressLine1',
      'addressCountryCode',
      'state',
      'district',
      'cityTown',
      'pinCode',
    ];
    if (validateForm(allFields)) {
      const apiData = transformFormDataToAPI(formData);
      dispatch(setFormData(apiData));
      dispatch(createUser(apiData));
    } else {
      showMessage('Please fill all required fields.', 'error');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleOtpModalClose = () => {
    setIsOtpModalOpen(false);
    dispatch(clearValidationSuccess());
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
            {message.type && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: '4px',
                  backgroundColor:
                    message.type === 'success' ? '#d4edda' : '#f8d7da',
                  color: message.type === 'success' ? '#155724' : '#721c24',
                }}
              >
                <Typography>{message.text}</Typography>
              </Box>
            )}

            <form>
              {/* Functionalities Mapped Section */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="functionality-mapped-label">
                  Functionalities Mapped *
                </InputLabel>
                <Select
                  labelId="functionality-mapped-label"
                  id="functionalityMapped"
                  name="functionalityMapped"
                  value={formData.functionalityMapped}
                  onChange={(e) =>
                    handleSelectChange('functionalityMapped', e.target.value)
                  }
                  disabled={anyLoading}
                  error={!!validationErrors.functionalityMapped}
                  label="Functionalities Mapped *"
                >
                  <MenuItem value="DASHBOARD">Dashboard</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="OPERATIONAL">Operational</MenuItem>
                  <MenuItem value="VIEWER">Viewer</MenuItem>
                </Select>
                {validationErrors.functionalityMapped && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {validationErrors.functionalityMapped}
                  </Typography>
                )}
              </FormControl>

              {/* User Details Section */}
              <Card
                sx={{ mb: 3 }}
                className="details-card create-new-user-details-card"
              >
                <Box
                  className="card-header create-new-user-card-header"
                  onClick={() => setUserDetailsExpanded(!userDetailsExpanded)}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    User Details
                  </Typography>
                  {userDetailsExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>

                <Collapse in={userDetailsExpanded}>
                  <CardContent className="card-content create-new-user-card-content">
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Citizenship *</InputLabel>
                          <Select
                            name="citizenship"
                            value={formData.citizenship}
                            onChange={(e) =>
                              handleSelectChange('citizenship', e.target.value)
                            }
                            disabled={anyLoading}
                            error={!!validationErrors.citizenship}
                            label="Citizenship *"
                          >
                            <MenuItem value="indian">Indian</MenuItem>
                            <MenuItem value="foreign">Foreign</MenuItem>
                          </Select>
                          {validationErrors.citizenship && (
                            <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}
                            >
                              {validationErrors.citizenship}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="CKYC Number *"
                          name="ckycNumber"
                          value={formData.ckycNumber}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.ckycNumber}
                          helperText={validationErrors.ckycNumber}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Title *</InputLabel>
                          <Select
                            name="title"
                            value={formData.title}
                            onChange={(e) =>
                              handleSelectChange('title', e.target.value)
                            }
                            disabled={anyLoading}
                            error={!!validationErrors.title}
                            label="Title *"
                          >
                            <MenuItem value="Mr.">Mr.</MenuItem>
                            <MenuItem value="Mrs.">Mrs.</MenuItem>
                            <MenuItem value="Ms.">Ms.</MenuItem>
                            <MenuItem value="Dr.">Dr.</MenuItem>
                          </Select>
                          {validationErrors.title && (
                            <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}
                            >
                              {validationErrors.title}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="First Name *"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.firstName}
                          helperText={validationErrors.firstName}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Middle Name"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                          disabled={anyLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={anyLoading}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Designation *"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.designation}
                          helperText={validationErrors.designation}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Email *"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.email}
                          helperText={validationErrors.email}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Gender *</InputLabel>
                          <Select
                            name="gender"
                            value={formData.gender}
                            onChange={(e) =>
                              handleSelectChange('gender', e.target.value)
                            }
                            disabled={anyLoading}
                            error={!!validationErrors.gender}
                            label="Gender *"
                          >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                          {validationErrors.gender && (
                            <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}
                            >
                              {validationErrors.gender}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Country Code *</InputLabel>
                          <Select
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={(e) =>
                              handleSelectChange('countryCode', e.target.value)
                            }
                            disabled={anyLoading}
                            error={!!validationErrors.countryCode}
                            label="Country Code *"
                          >
                            <MenuItem value="+91|India">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography>+91</Typography>
                                <Typography>India</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="+1|USA">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography>+1</Typography>
                                <Typography>USA</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="+44|UK">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography>+44</Typography>
                                <Typography>UK</Typography>
                              </Box>
                            </MenuItem>
                          </Select>
                          {validationErrors.countryCode && (
                            <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}
                            >
                              {validationErrors.countryCode}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Mobile Number *"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.mobileNumber}
                          helperText={validationErrors.mobileNumber}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Date of Birth *"
                            value={formData.dateOfBirth}
                            // onChange={(newValue: dayjs.Dayjs | null) =>
                            //   handleSelectChange('dateOfBirth', newValue)
                            // }
                            disabled={anyLoading}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!validationErrors.dateOfBirth,
                                // helperText: validationErrors.dateOfBirth,
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
                            value={formData.proofOfIdentity}
                            onChange={(e) =>
                              handleSelectChange(
                                'proofOfIdentity',
                                e.target.value
                              )
                            }
                            disabled={anyLoading}
                            error={!!validationErrors.proofOfIdentity}
                            label="Proof of Identity *"
                          >
                            <MenuItem value="aadhar">Aadhar Card</MenuItem>
                            <MenuItem value="passport">Passport</MenuItem>
                            <MenuItem value="driving_license">
                              Driving License
                            </MenuItem>
                            <MenuItem value="voter_id">Voter ID</MenuItem>
                          </Select>
                          {validationErrors.proofOfIdentity && (
                            <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}
                            >
                              {validationErrors.proofOfIdentity}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Proof of Identity Number *"
                          name="proofOfIdentityNumber"
                          value={formData.proofOfIdentityNumber}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.proofOfIdentityNumber}
                          helperText={validationErrors.proofOfIdentityNumber}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Employee Code *"
                          name="employeeCode"
                          value={formData.employeeCode}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.employeeCode}
                          helperText={validationErrors.employeeCode}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>

              {/* User Address Details Section */}
              <Card
                sx={{ mb: 3 }}
                className="details-card create-new-user-details-card"
              >
                <Box
                  className="card-header create-new-user-card-header"
                  onClick={() =>
                    setAddressDetailsExpanded(!addressDetailsExpanded)
                  }
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    User Address Details
                  </Typography>
                  {addressDetailsExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>

                <Collapse in={addressDetailsExpanded}>
                  <CardContent className="card-content create-new-user-card-content">
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Address Line 1 *"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.addressLine1}
                          helperText={validationErrors.addressLine1}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Address Line 2"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleChange}
                          disabled={anyLoading}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Address Line 3"
                          name="addressLine3"
                          value={formData.addressLine3}
                          onChange={handleChange}
                          disabled={anyLoading}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Country Code *</InputLabel>
                          <Select
                            name="addressCountryCode"
                            value={formData.addressCountryCode}
                            onChange={(e) =>
                              handleSelectChange(
                                'addressCountryCode',
                                e.target.value
                              )
                            }
                            disabled={anyLoading}
                            error={!!validationErrors.addressCountryCode}
                            label="Country Code *"
                          >
                            <MenuItem value="IN|India">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography>IN</Typography>
                                <Typography>India</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="US|USA">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography>US</Typography>
                                <Typography>USA</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="GB|UK">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography>GB</Typography>
                                <Typography>UK</Typography>
                              </Box>
                            </MenuItem>
                          </Select>
                          {validationErrors.addressCountryCode && (
                            <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}
                            >
                              {validationErrors.addressCountryCode}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="State / UT *"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.state}
                          helperText={validationErrors.state}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="District *"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.district}
                          helperText={validationErrors.district}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="City/Town *"
                          name="cityTown"
                          value={formData.cityTown}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.cityTown}
                          helperText={validationErrors.cityTown}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Pin Code *"
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleChange}
                          disabled={anyLoading}
                          error={!!validationErrors.pinCode}
                          helperText={validationErrors.pinCode}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          fullWidth
                          label="Pin Code (in case of others)"
                          name="pinCodeOthers"
                          value={formData.pinCodeOthers}
                          onChange={handleChange}
                          disabled={anyLoading}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
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
                  onClick={handleValidate}
                  className="validate-button create-new-user-validate-button"
                  disabled={anyLoading}
                  sx={{
                    color: '#666666',
                    borderColor: '#666666',
                    '&:hover': {
                      borderColor: '#666666',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(0, 0, 0, 0.26)',
                      borderColor: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  Validate
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={anyLoading}
                  className="submit-button create-new-user-submit-button"
                  sx={{
                    backgroundColor: '#666666',
                    '&:hover': {
                      backgroundColor: '#555555',
                    },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </form>
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
        email={formData.email || ''}
        mobile={formData.mobileNumber || ''}
        countryCode={formData.countryCode?.split('|')[0] || '+91'}
      />
    </Box>
  );
};

export default CreateNewUserApprovals;
