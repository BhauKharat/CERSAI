import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';
import '../../MyTask/UpdateEntityProfile-prevo/update.css';
import SuccessModal from '../../../register/SuccessModalOkay/successModal';
import OTPModalUpdate from './OtpModalUpdate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import { sendOtp } from '../../Authenticate/slice/passSetupOtpSlice';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
//import { setCkycData } from '../../../../redux/slices/registerSlice/institutiondetailSlice';
import {
  markStepCompleted,
  setCurrentStep,
} from '../../../../redux/slices/registerSlice/applicationSlice';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
  Grid,
  Button,
  InputAdornment,
  SelectChangeEvent,
  AccordionDetails,
} from '@mui/material';
import {
  inputStyles,
  selectStyles,
  labelStyles,
  titleStyles,
} from './RegionCreationRequest.style';
import { updateHeadInstitutionDetails } from '../../../../redux/slices/stepSlice';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import { fetchUpdateAdminDetails } from '../../../../redux/slices/updateProfileSlice/updateInstituteAdminSlice';
import { useFormik } from 'formik';
import SelectTag from '../../../form/SelecTag';
import TextTag from '../../../form/TextTag';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Country } from './types/UpdatePreviewDetails';
import { FormDataType } from './types/UpdateInstitutionDetails';
import { headInstituteSchema } from '../../../../component/validation/EntityProfileForm';
// import { Dayjs } from 'dayjs';
import BreadcrumbUpdateProfile from './BreadcrumbUpdateProfile';
import ApplicationStepperUpdate from './ApplicationStepperUpdate';
import { fetchCkycDetailsUpdate } from '../../../../redux/slices/updateProfileSlice/updateNodalOfficerSlice';
import CkycUpdateVerifyModal from '../UpdateEntityProfile-prevo/CkycUpdateVerfiyModal';
import {
  ButtonActionsBox,
  EntityFormContainer,
  StyledAccordion,
  StyledAccordionDetails,
  StyledAccordionSummary,
  CancelButton,
  SaveButton,
} from './UpdateProfileAddressDetails.style';
import { KeyboardArrowDown } from '@mui/icons-material';
const UpdateInstitutionDetails = () => {
  const [otpIdentifier, setotpIdentifier] = useState<string | undefined>();
  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const { HOIerror } = useSelector((state: RootState) => state.headInstitution);
  const { citizenships, geographyHierarchy, titles, genders } = useSelector(
    (state: RootState) => state.masters
  );
  const { headOfInstitutionDetails } = useSelector(
    (state: RootState) => state.instituteAdmin
  );
  // const [isOtpVerified, setIsOtpVerified] = useState(false);
  //const [addNewNodal, setAddNewNodal] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isCkycOTPModalOpen, setCkycOTPModalOpen] = useState(false);
  const [isMobileVerfied, setIsMobileVerfied] = useState(true);
  const [isEmailVerfied, setIsEmailVerfied] = useState(true);

  useEffect(() => {
    if (geographyHierarchy?.length) {
      const transformedCountries = geographyHierarchy.map((country) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
      }));
      setCountries(transformedCountries);
    }
  }, [geographyHierarchy]);

  const handleValidate = async () => {
    if (!authToken || !formik.values.mobileNo || !formik.values.emailId) {
      alert('Missing email or token');
      return;
    }
    try {
      dispatch(showLoader('Please Wait...'));

      const result = await dispatch(
        sendOtp({
          emailId: formik.values?.emailId || '',
          mobileNo: formik.values?.mobileNo || '',
          token: authToken,
        })
      );

      if (sendOtp.fulfilled.match(result)) {
        setOTPModalOpen(true);
      } else {
        alert(
          'Failed to send OTP: ' + (result.payload?.message || 'Unknown error')
        );
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Unexpected error while sending OTP');
    } finally {
      dispatch(hideLoader());
    }
  };

  // const handleNewNodalAdd = () => {
  //   // const selectedCountry = countries.find((c) => c.dial_code === '+91');
  //   // const countryName = selectedCountry ? selectedCountry.name : '';
  //   // formik.setValues({
  //   //   ...formik.values,
  //   //   citizenship: '',
  //   //   ckycNumber: '',
  //   //   title: '',
  //   //   firstName: '',
  //   //   middleName: '',
  //   //   lastName: '',
  //   //   gender: '',
  //   //   dateOfBirth: null as Dayjs | null,
  //   //   designation: '',
  //   //   officeAddress: '',
  //   //   email: '',
  //   //   countryCode: '+91',
  //   //   mobileNumber: '',
  //   //   landlineNumber: '',
  //   //   employeeCode: '',
  //   //   proofOfIdentity: '',
  //   //   proofOfIdentityNumber: '',
  //   //   boardResolutionDate: null as Dayjs | null,
  //   //   boardResolution: null,
  //   //   certifiedPoi: null,
  //   //   certifiedPic: null,
  //   //   countryName: countryName,
  //   //   sameAsRegisteredAddress: false,
  //   // });
  //   setAddNewNodal(false);
  //   //setIsOtpVerified(false);
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(showLoader('Please wait...'));
        dispatch(fetchUpdateAdminDetails({ token: authToken }));
        dispatch(fetchDropdownMasters());
        dispatch(fetchGeographyHierarchy());
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        dispatch(hideLoader());
      }
    };
    fetchData();
  }, [dispatch, authToken]);

  const formik = useFormik<FormDataType>({
    initialValues: {
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      designation: '',
      emailId: '',
      gender: '',
      ckycNumber: '',
      citizenship: '',
      mobileNo: '',
      landline: '',
      countryCode: '',
      countryName: '',
    },
    // validationSchema: !addNewNodal ? headInstituteSchema : Yup.object().shape({}),
    validationSchema: headInstituteSchema,
    onSubmit: async (values) => {
      console.log('form submit values', values);
      if (!authToken) {
        console.error('Auth token is missing');
        return;
      }
      const payload = { ...values };
      const res = await dispatch(
        updateHeadInstitutionDetails({ token: authToken, data: payload })
      ).unwrap();
      console.log('submission response 1', res);
      if (res) {
        dispatch(markStepCompleted(2));

        // ✅ Move to next step
        dispatch(setCurrentStep(3));

        navigate('/re/update-nodal-officer-details');
        return;
      }
    },
  });

  useEffect(() => {
    if (geographyHierarchy?.length) {
      const transformedCountries = geographyHierarchy.map((country) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
      }));
      setCountries(transformedCountries);

      const india = transformedCountries.find((c) => c.dial_code === '+91');
      if (india && !formik.values.countryCode) {
        formik.setFieldValue('countryCode', india.dial_code);
        formik.setFieldValue('countryName', india.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geographyHierarchy]);
  const isIndianCitizenShip = formik.values.citizenship === 'Indian';

  useEffect(() => {
    if (headOfInstitutionDetails) {
      const selectedCountryName = countries.find(
        (c) => c.dial_code === headOfInstitutionDetails.countryCode
      );
      formik.setValues({
        title: headOfInstitutionDetails.title || '',
        firstName: headOfInstitutionDetails.firstName || '',
        middleName: headOfInstitutionDetails.middleName || '',
        lastName: headOfInstitutionDetails.lastName || '',
        designation: headOfInstitutionDetails.designation || '',
        emailId: headOfInstitutionDetails.emailId || '',
        gender: headOfInstitutionDetails.gender || '',
        ckycNumber: headOfInstitutionDetails.ckycNumber || '',
        citizenship: headOfInstitutionDetails.citizenship || '',
        mobileNo: headOfInstitutionDetails.mobileNo || '',
        landline: headOfInstitutionDetails.landline || '',
        countryCode: headOfInstitutionDetails.countryCode || '',
        countryName: selectedCountryName?.name || '',
      });
      setIsVerified(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headOfInstitutionDetails, countries]);

  const handleOkay = () => {
    setIsMobileVerfied(true);
    setIsEmailVerfied(true);
    setSuccessModalOpen(false);
  };

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    console.log('Selected value:', e.target.value);
    console.log('Current formik countryCode:', formik.values.countryCode);
    console.log('Available countries:', countries);

    const selectedCode = e.target.value;
    const selectedCountry = countries.find((c) => c.dial_code === selectedCode);

    console.log(
      'Found country:',
      selectedCountry ? selectedCountry.dial_code : '+91'
    );

    formik.setValues({
      ...formik.values,
      countryCode: selectedCountry ? selectedCountry.dial_code : '+91',
      countryName: selectedCountry ? selectedCountry.name : '',
    });
  };

  // const [expanded, setExpanded] = useState<boolean>(true);
  // const handleChange =
  //   () => (event: React.SyntheticEvent, isExpanded: boolean) => {
  //     setExpanded(isExpanded);
  //   };

  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    formik.setFieldValue('emailId', e.target.value);
    setIsEmailVerfied(false);
  };
  const handleMobileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    formik.setFieldValue('mobileNo', e.target.value);
    setIsMobileVerfied(false);
  };
  return (
    <>
      <Box sx={{ p: 4, backgroundColor: '#fefefeff' }}>
        {/* Back Button */}
        <BreadcrumbUpdateProfile
          breadcrumbItems={[
            { label: 'Update Profile', href: '/re/dashboard' },
            { label: 'Entity Profile' },
          ]}
        />
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            mt: 3,
            ml: 0.5,
          }}
        >
          <Typography
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: '0.9rem',
                sm: '1.05rem',
                md: '1.15rem',
                lg: '1.25rem',
                xl: '1.35rem',
              },
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {'Entity Profile'}
          </Typography>
        </Box>
        <ApplicationStepperUpdate />

        <>
          <AccordionDetails sx={{ pl: 0, ml: -12 }}>
            <EntityFormContainer className="entity-form">
              <StyledAccordion
                sx={{
                  border: '1px solid #e0e0e0',
                  boxShadow: 'none',
                  borderRadius: '5px',
                }}
                defaultExpanded
              >
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: '#e6ebff !important',
                    marginBottom: '0px !important',
                    '&.Mui-expanded': {
                      minHeight: '50px !important',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      height: '0px',
                      minHeight: 'auto',
                    }}
                  >
                    <Typography sx={titleStyles}>
                      Head of Institution Details
                    </Typography>
                    {/* <Typography
                                        sx={{
                                          color: '#002cba',
                                          fontWeight: '500',
                                          fontSize: '16px',
                                          mr: 1,
                                          cursor: 'pointer',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation(); // stop accordion toggle
                                          e.preventDefault();
                                        }}
                                      >
                                        Edit
                                      </Typography> */}
                  </Box>
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                      <SelectTag
                        sx={{ height: 45 }}
                        label="Citizenship"
                        name="citizenship"
                        value={formik.values.citizenship || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.citizenship &&
                          formik.errors?.citizenship
                            ? formik.errors.citizenship
                            : undefined
                        }
                        options={citizenships}
                        isCitizenship={true}
                        //  optional={true}
                        //disabled={addNewNodal}
                      />

                      <TextTag
                        label="CKYC Number"
                        name="ckycNumber"
                        optional={isIndianCitizenShip}
                        placeholder=""
                        value={formik.values.ckycNumber || ''}
                        onChange={(e) => {
                          formik.handleChange(e);
                          // Auto reset verification when CKYC number changes
                          if (isIndianCitizenShip) {
                            setIsVerified(false);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.ckycNumber &&
                          formik.errors?.ckycNumber
                            ? formik.errors.ckycNumber
                            : undefined
                        }
                        //disabled={addNewNodal}
                        endAdornment={
                          <InputAdornment position="end">
                            {isVerified || !isIndianCitizenShip ? (
                              <Box
                                sx={{
                                  color: '#52AE32',
                                  fontWeight: 600,
                                  px: 1.5,
                                  fontSize: '14px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'transparent',
                                  borderRadius: '4px',
                                  height: '32px',
                                }}
                              >
                                <CheckCircleOutlineIcon
                                  sx={{ fontSize: '20px' }}
                                />
                                Verified
                              </Box>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                style={{ textTransform: 'none' }}
                                //startIcon={<VerifyIcon />}
                                //onClick={handleVerify}
                                disabled={!formik.values.ckycNumber} // Disable if no CKYC number
                                sx={{
                                  px: 2,
                                  py: 1,
                                  fontSize: '14px',
                                  color: 'white',
                                  backgroundColor: '#0044cc',
                                  borderRadius: '6px',
                                }}
                                onClick={async () => {
                                  if (
                                    !formik.values.ckycNumber ||
                                    formik.values.ckycNumber.length !== 14
                                  ) {
                                    console.error('Invalid CKYC number');
                                    return;
                                  }
                                  dispatch(showLoader('Please wait...'));
                                  const resultAction = await dispatch(
                                    fetchCkycDetailsUpdate(
                                      formik.values.ckycNumber.trim()
                                    )
                                  );
                                  if (
                                    fetchCkycDetailsUpdate.fulfilled.match(
                                      resultAction
                                    )
                                  ) {
                                    dispatch(hideLoader());
                                    setIsVerified(true);
                                    console.log(
                                      'resultAction.payload',
                                      resultAction.payload
                                    );
                                    setotpIdentifier(
                                      resultAction.payload.otp_identifier
                                    );
                                    setCkycOTPModalOpen(true);
                                  } else {
                                    console.error('Error');
                                  }
                                }}
                              >
                                Verify
                              </Button>
                            )}
                          </InputAdornment>
                        }
                      />

                      {/* Title */}

                      <SelectTag
                        sx={selectStyles}
                        label="Title"
                        name="title"
                        value={formik.values.title || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        options={titles}
                        //  optional={true}
                        disabled={isIndianCitizenShip}
                        error={
                          formik.touched?.title && formik.errors?.title
                            ? formik.errors?.title
                            : undefined
                        }
                      />

                      {/* Second Row - Names */}

                      {/* First Name */}

                      <TextTag
                        sx={inputStyles}
                        optional={true}
                        label="First Name"
                        name="firstName"
                        placeholder="First Name"
                        value={formik.values.firstName || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isIndianCitizenShip}
                        error={
                          formik.touched?.firstName && formik.errors?.firstName
                            ? formik.errors.firstName
                            : undefined
                        }
                        //  optional={true}
                        //disabled={isIndianCitizenShip && addNewNodal}
                      />

                      {/* Middle Name */}

                      <TextTag
                        sx={inputStyles}
                        label="Middle Name"
                        name="middleName"
                        placeholder="Middle Name"
                        value={formik.values.middleName || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.middleName &&
                          formik.errors?.middleName
                            ? formik.errors.middleName
                            : undefined
                        }
                        //  optional={true}
                        disabled={isIndianCitizenShip}
                      />

                      {/* Last Name */}

                      <TextTag
                        //sx={inputStyles}
                        label="Last Name"
                        name="lastName"
                        placeholder="Last Name"
                        value={formik.values.lastName || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.lastName && formik.errors?.lastName
                            ? formik.errors.lastName
                            : undefined
                        }
                        optional={true}
                        disabled={isIndianCitizenShip}
                      />

                      {/* Gender */}

                      {/* Gender */}

                      <SelectTag
                        sx={selectStyles}
                        label="Gender"
                        name="gender"
                        value={formik.values.gender || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.gender && formik.errors?.gender
                            ? formik.errors.gender
                            : undefined
                        }
                        disabled={isIndianCitizenShip}
                        options={genders}
                        // optional={true}
                        // disabled={addNewNodal}
                      />
                      <TextTag
                        sx={inputStyles}
                        label="Designation"
                        name="designation"
                        placeholder="Designation"
                        value={formik.values.designation || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.designation &&
                          formik.errors?.designation
                            ? formik.errors.designation
                            : undefined
                        }
                        optional={true}
                        //    disabled={addNewNodal}
                      />
                      <TextTag
                        sx={inputStyles}
                        label="Email"
                        name="emailId"
                        placeholder="emailId"
                        value={formik.values.emailId || ''}
                        onChange={(e) => {
                          handleEmailChange(e);
                        }}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.emailId && formik.errors?.emailId
                            ? formik.errors.emailId
                            : undefined
                        }
                        optional={true}
                        // disabled={addNewNodal}
                      />

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography
                          variant="body2"
                          className="form-label"
                          sx={labelStyles}
                        >
                          Country Code <span style={{ color: 'red' }}>*</span>
                        </Typography>

                        <FormControl fullWidth>
                          <Select
                            value={formik?.values.countryCode || ''}
                            onChange={(e) => handleCountryChange(e)}
                            // disabled={addNewNodal}
                            sx={selectStyles}
                            displayEmpty
                            IconComponent={KeyboardArrowDown}
                          >
                            {countries.map((country) => (
                              <MenuItem
                                key={country.code}
                                value={country.dial_code}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Typography>{country.name}</Typography>
                                  <Typography>({country.dial_code})</Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {formik.touched?.countryCode &&
                          formik.errors?.countryCode && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'error.main',
                                display: 'block',
                                mt: 0.5,
                              }}
                            >
                              {formik.errors.countryName}
                            </Typography>
                          )}
                      </Grid>

                      {/* Mobile Number */}

                      <TextTag
                        sx={inputStyles}
                        label="Mobile Number"
                        name="mobileNo"
                        placeholder="mobileNo"
                        value={formik.values.mobileNo || ''}
                        onChange={(e) => {
                          handleMobileChange(e);
                        }}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.mobileNo && formik.errors?.mobileNo
                            ? formik.errors.mobileNo
                            : undefined
                        }
                        optional={true}
                        //     disabled={addNewNodal}
                      />

                      {/* Landline Number */}

                      <TextTag
                        sx={inputStyles}
                        label="Landline Number"
                        name="landline"
                        placeholder="landline"
                        value={formik.values.landline || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched?.landline && formik.errors?.landline
                            ? formik.errors.landline
                            : undefined
                        }
                        optional={false}
                        //  disabled={addNewNodal}
                      />
                    </Grid>
                  </form>
                </StyledAccordionDetails>
              </StyledAccordion>
            </EntityFormContainer>
          </AccordionDetails>
          {/* {addNewNodal ? (
            <Box textAlign="end" sx={{ marginTop: '5px' }}>
              <Button
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.2,
                  fontSize: '14px',
                  backgroundColor: '#0044cc',
                  borderRadius: '6px',
                }}
                onClick={() => formik.handleSubmit()}
                type="submit"
                className="submit-btn"
              >
                Save and Next
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '5px',
                gap: 2,
              }}
            >
              <Button
                style={{ textTransform: 'none' }}
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.2,
                  fontSize: '14px',
                  backgroundColor: '#0044cc',
                  borderRadius: '6px',
                }}
                type="button"
                className="submit-btn"
                onClick={handleValidate}
                disabled={isMobileVerfied && isEmailVerfied}
              >
                Validate
              </Button>

              <Button
                style={{ textTransform: 'none' }}
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.2,
                  fontSize: '14px',
                  backgroundColor: '#0044cc',
                  borderRadius: '6px',
                }}
                onClick={() => formik.handleSubmit()}
                type="submit"
                disabled={!(isMobileVerfied && isEmailVerfied)}
                className="submit-btn"
              >
                Save and Next
              </Button>
            </Box>
          )} */}
          <ButtonActionsBox sx={{ mt: 1 }}>
            <CancelButton
              style={{ textTransform: 'none' }}
              variant="contained"
              sx={{
                px: [3, 4, 8], // [xs, sm, md] and up
                py: [0.8, 1, 1], // [xs, sm, md] and up
              }}
              type="button"
              onClick={handleValidate}
              disabled={isMobileVerfied && isEmailVerfied}
            >
              Validate
            </CancelButton>

            <SaveButton
              style={{ textTransform: 'none' }}
              variant="contained"
              sx={{
                px: [3, 4, 5], // [xs, sm, md] and up
                py: [0.8, 1, 1], // [xs, sm, md] and up
              }}
              onClick={() => formik.handleSubmit()}
              type="submit"
              disabled={!(isMobileVerfied && isEmailVerfied)}
            >
              Save and Next
            </SaveButton>
          </ButtonActionsBox>
          {HOIerror && (
            <Box
              sx={{
                color: 'error.main',
                mt: 2,
                p: 1.5,
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'error.light',
              }}
            >
              {HOIerror}
            </Box>
          )}

          {isOTPModalOpen && (
            <OTPModalUpdate
              mobileChange={!isMobileVerfied}
              emailChange={!isEmailVerfied}
              isOpen={isOTPModalOpen}
              onClose={() => setOTPModalOpen(false)}
              onOtpSubmit={(otp) => {
                console.log('Submitted OTP:', otp);
                setOTPModalOpen(false);
                setSuccessModalOpen(true);
              }}
              countryCode={formik.values?.countryCode}
              email={formik.values?.emailId}
              mobile={formik.values?.mobileNo}
            />
          )}

          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => setSuccessModalOpen(false)}
            onOkay={handleOkay}
            title="Email and Mobile OTP Verified Successfully!"
            message="The Head of Institution's details have been verified successfully"
          />
        </>
      </Box>
      <CkycUpdateVerifyModal
        isOpen={isCkycOTPModalOpen}
        onClose={() => setCkycOTPModalOpen(false)}
        ckycNumber={formik.values.ckycNumber || ''}
        setShowSuccessModal={() => {
          setIsVerified(true);
          console.log(isCkycOTPModalOpen);
        }}
        updateData={(data) => {
          //dispatch(setCkycData(data));
          formik.setValues({
            ...formik.values, // Keep all existing values
            firstName: data.firstName || '',
            middleName: data.middleName || '',
            lastName: data.lastName || '',
            gender: data.gender || '',
            title: data.title || '',
            mobileNo: data.mobileNo || '',
            emailId: data.emailAddress || '',
          });
          setCkycOTPModalOpen(false);
        }}
        otpIdentifier={otpIdentifier}
        updateOtpIdentifier={(item) => {
          setotpIdentifier(item);
        }}
      />
    </>
  );
};

export default UpdateInstitutionDetails;
