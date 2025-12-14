/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
//import '../../../register/InstitutionDetails/institutionDetails.css';
//import '../../../register/EntityForm/registrationPage.css';
import './update.css';
// import 'react-phone-input-2/lib/style.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { KeyboardArrowDown } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Select,
  MenuItem,
  Typography,
  FormControl,
  Box,
  TextField,
  SelectChangeEvent,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import { fetchCkycDetailsUpdate } from '../../../../redux/slices/updateProfileSlice/updateNodalOfficerSlice';
import { NodelFormSchema } from '../../../../component/validation/EntityProfileForm';
import uploadIconBox from '../../../../assets/uploadIconBox.png';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  markStepCompleted,
  setCurrentStep,
} from '../../../../redux/slices/registerSlice/applicationSlice';
import { Country, District, State } from './types/UpdateProfileAddressDetails';
import * as Yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickerValidDate } from '@mui/x-date-pickers/models';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router';
import { AppDispatch, RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import UploadIconButton from '../../../../assets/UploadIconButton.svg';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Button } from '@mui/material';
import { useFormik } from 'formik';
import { sendOtp } from '../../Authenticate/slice/passSetupOtpSlice';
import { submitNodalOfficerUpdateDetails } from '../../../../redux/slices/updateProfileSlice/updateNodalOfficerSlice';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import SuccessModal from '../../../register/SuccessModalOkay/successModal';
import {
  inputStyles,
  labelStyles,
  selectStyles,
  titleStyles,
} from './RegionCreationRequest.style';

import BreadcrumbUpdateProfile from './BreadcrumbUpdateProfile';
import ApplicationStepperUpdate from './ApplicationStepperUpdate';
import { fetchUpdateAdminDetails } from '../../../../redux/slices/updateProfileSlice/updateInstituteAdminSlice';
import CkycUpdateVerifyModal from './CkycUpdateVerfiyModal';
import OTPModalUpdate from './OtpModalUpdate';
import {
  EntityFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
} from './UpdateProfileAddressDetails.style';
import FileTag from '../../../form/FileTag';
interface Document {
  documentType: string;
  base64Content: string;
  fileName: string;
}

const NodalOfficerDetails = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // Assuming 'register' is the default active tab
  const [countries, setCountries] = useState<Country[]>([]);
  const [open, setOpen] = useState(false);

  const [openBR, setOpenBR] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );
  useEffect(() => {
    // if (geographyHierarchy?.length) {
    //   const transformedCountries = geographyHierarchy.map((country) => ({
    //     name: country.name,
    //     code: country.code,
    //     dial_code: country.countryCode,
    //   }));

    //   setCountries(transformedCountries);
    // }
    if (geographyHierarchy?.length) {
      const countryList = geographyHierarchy.map((country) => ({
        name: country.name,
        code: country.code,
        dial_code: country.countryCode,
        states: country.states.map(
          (state: {
            name: string;
            districts: {
              name: string;
              pincodes: { pincode: string | number }[];
            }[];
          }) => ({
            label: state.name,
            value: state.name,
            districts: state.districts.map(
              (district: {
                name: string;
                pincodes: { pincode: string | number }[];
              }) => ({
                label: district.name,
                value: district.name,
                pincodes: district.pincodes.map(
                  (p: { pincode: string | number }) => p.pincode
                ),
              })
            ),
          })
        ),
      }));
      setCountries(countryList);
    }
  }, [geographyHierarchy]);

  const authToken = useSelector((state: RootState) => state.auth.authToken);

  const [afterSubError, setAfterSubError] = useState('');
  const { proofOfIdentities, citizenships, genders } = useSelector(
    (state: RootState) => state.masters
  );

  const { nodalOfficerDetails, documents, adminOneDetails } = useSelector(
    (state: RootState) => state.instituteAdmin
  );
  const [isVerified, setIsVerified] = useState(false);
  const [otpIdentifier, setotpIdentifier] = useState<string | undefined>();
  const [addNewNodal, setAddNewNodal] = useState(true);
  const formik = useFormik({
    initialValues: {
      citizenship: '',
      ckycNumber: '',
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dateOfBirth: null as Dayjs | null | string,
      designation: '',
      officeAddress: '',
      email: '',
      countryCode: '',
      mobileNumber: '',
      landlineNumber: '',
      employeeCode: '',
      proofOfIdentity: '',
      proofOfIdentityNumber: '',
      boardResolutionDate: null as Dayjs | null | string,
      boardResolution: null,
      certifiedPoi: null,
      certifiedPic: null,
      countryName: '',
      sameAsRegisteredAddress: false,
      addressLine1: 'Times Tower,1st Floor',
      addressLine2: 'Kamala Mills Compound',
      addressLine3: 'Lower Parel, Mumbai',
      country: 'Indian',
      state: 'Maharashtra',
      district: 'Mumbai',
      city: 'Mumbai',
      pincode: '400013',
      digipin: '',
    },
    validationSchema: !addNewNodal ? NodelFormSchema : Yup.object().shape({}),
    onSubmit: async (values, { setSubmitting }) => {
      if (!addNewNodal) {
        console.log(values);
      } else {
        dispatch(markStepCompleted(3));

        dispatch(setCurrentStep(4));
        navigate('/re/update-institutional-admin-details');
        return;
      }
      try {
        const submitData = {
          citizenship: values.citizenship,
          ckycNumber: values.ckycNumber,
          countryCode: values.countryCode,
          dateOfBirth: values.dateOfBirth
            ? typeof values.dateOfBirth === 'string'
              ? values.dateOfBirth
              : values.dateOfBirth.format('YYYY-MM-DD')
            : '',
          dateOfBoardResolution: values.boardResolutionDate
            ? typeof values.boardResolutionDate === 'string'
              ? values.boardResolutionDate
              : values.boardResolutionDate.format('YYYY-MM-DD')
            : '',
          designation: values.designation,
          email: values.email,
          firstName: values.firstName,
          gender: values.gender,
          identityNumber: values.proofOfIdentityNumber,
          landline: values.landlineNumber,
          lastName: values.lastName,
          middleName: values.middleName,
          mobileNumber: values.mobileNumber,
          proofOfIdentity: values.proofOfIdentity,
          sameAsRegisteredAddress: values.sameAsRegisteredAddress, // Fixed this line
          title: values.title,
          boardResolution: values.boardResolution,
          certifiedPic: values.certifiedPic,
          certifiedPoi: values.certifiedPoi,
        };

        await dispatch(submitNodalOfficerUpdateDetails(submitData)).unwrap();

        navigate('/re/update-institutional-admin-details');
        dispatch(markStepCompleted(3));

        dispatch(setCurrentStep(4));
      } catch (error: unknown) {
        console.error('Nodal officer submission failed:', error);

        if (
          typeof error === 'object' &&
          error !== null &&
          'error_code' in error &&
          'rawMessage' in error
        ) {
          const typedError = error as {
            error_code: string;
            rawMessage: string;
          };
          setAfterSubError(typedError.rawMessage);
        }

        console.log(error);
      } finally {
        setSubmitting(false);
        //dispatch(hideLoader());
      }
    },
    enableReinitialize: true,
  });
  const isIndianCitizenShip = formik.values.citizenship === 'Indian';
  const [boardResolutionPreview, setBoardResolutionPreview] = useState<
    string | null
  >(null);
  const [certifiedPoiPreview, setCertifiedPoiPreview] = useState<string | null>(
    null
  );

  const [isOTPModalOpen, setOTPModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isCkycOTPModalOpen, setCkycOTPModalOpen] = useState(false);
  const [isMobileVerfied, setIsMobileVerfied] = useState(true);
  const [isEmailVerfied, setIsEmailVerfied] = useState(true);
  // Remove the separate handleSubmitNodalOfficer function since it's now integrated into Formik
  const [empCode, setEmpCode] = useState('');

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
  // In your component
  const [boardResolutionDoc, setBoardResolutionDoc] = useState<
    Document | null | undefined
  >(null);
  const [certifiedPoiDoc, setCertifiedPoiDoc] = useState<
    Document | null | undefined
  >(null);
  // const [certifiedPicDoc, setCertifiedPicDoc] = useState<
  //   Document | null | undefined
  // >(null);
  const [disableSection] = useState<boolean>(false);

  useEffect(() => {
    if (addNewNodal && nodalOfficerDetails && documents.length > 0) {
      // Format date strings to Dayjs objects
      const dateOfBirth = nodalOfficerDetails.dateOfBirth
        ? dayjs(nodalOfficerDetails.dateOfBirth)
        : null;
      const boardResolutionDate = nodalOfficerDetails.dateOfBoardResolution
        ? dayjs(nodalOfficerDetails.dateOfBoardResolution)
        : null;
      const selectedCountry = countries.find(
        (c) => c.dial_code === nodalOfficerDetails.countryCode
      );
      const countryName = selectedCountry ? selectedCountry.name : '';

      // Find specific documents
      const boardResolution = documents.find(
        (doc: Document) => doc.documentType === 'NO_BOARD_RESOLUTION'
      );

      const certifiedPoi = documents.find(
        (doc: Document) => doc.documentType === 'NO_CERTIFIED_POI'
      );

      setBoardResolutionDoc(boardResolution);
      setCertifiedPoiDoc(certifiedPoi);
      // setCertifiedPicDoc(certifiedPic);
      // if (disabledSections.includes('NODAL_OFFICER')) {
      //   setDisableSection(true);
      // } else {
      //   setDisableSection(false);
      // }
      setEmpCode(adminOneDetails?.employeeCode || '');

      formik.setValues({
        ...formik.values,
        citizenship: nodalOfficerDetails.citizenship || '',
        countryName: countryName,
        ckycNumber: nodalOfficerDetails.ckycNo || '',
        title: nodalOfficerDetails.title || '',
        firstName: nodalOfficerDetails.firstName || '',
        middleName: nodalOfficerDetails.middleName || '',
        lastName: nodalOfficerDetails.lastName || '',
        gender: nodalOfficerDetails.gender || '',
        dateOfBirth: dateOfBirth,
        designation: nodalOfficerDetails.designation || '',
        officeAddress: '', // Not in API response
        email: nodalOfficerDetails.email || '',
        countryCode: nodalOfficerDetails.countryCode || '',
        mobileNumber: nodalOfficerDetails.mobileNumber || '',
        landlineNumber: nodalOfficerDetails.landline || '',
        employeeCode: empCode, // Not in API response
        proofOfIdentity: nodalOfficerDetails.proofOfIdentity || '',
        proofOfIdentityNumber: nodalOfficerDetails.identityNumber || '',
        boardResolutionDate: boardResolutionDate,
        sameAsRegisteredAddress:
          nodalOfficerDetails.sameAsRegisteredAddress || false,
        // boardResolution: boardResolutionFile,
        // certifiedPoi: certifiedPoiFile,
        addressLine1: 'Times Tower,1st Floor',
        addressLine2: 'Kamala Mills Compound',
        addressLine3: 'Lower Parel, Mumbai',
        country: 'Indian',
        state: 'Maharashtra',
        district: 'Mumbai',
      });
      setIsVerified(true);
      setAddNewNodal(true);
    }
  }, [nodalOfficerDetails, documents]);

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find((c) => c.dial_code === selectedCode);

    formik.setValues({
      ...formik.values,
      countryCode: selectedCode,
      countryName: selectedCountry ? selectedCountry.name : '',
    });
  };

  const handleBoardResolutionSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('boardResolution', file);
      const reader = new FileReader();

      reader.onload = (e) => {
        setBoardResolutionPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setBoardResolutionDoc(null);
    }
  };

  const handleCertifiedPoiSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.currentTarget.files?.[0];
    formik.setFieldValue('certifiedPoi', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCertifiedPoiPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewNodalAdd = () => {
    const selectedCountry = countries.find((c) => c.dial_code === '+91');
    const countryName = selectedCountry ? selectedCountry.name : '';
    formik.setValues({
      ...formik.values,
      citizenship: '',
      ckycNumber: '',
      title: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dateOfBirth: null as Dayjs | null,
      designation: '',
      officeAddress: '',
      email: '',
      countryCode: '+91',
      mobileNumber: '',
      landlineNumber: '',
      employeeCode: '',
      proofOfIdentity: '',
      proofOfIdentityNumber: '',
      boardResolutionDate: null as Dayjs | null,
      boardResolution: null,
      certifiedPoi: null,
      certifiedPic: null,
      countryName: countryName,
      sameAsRegisteredAddress: false,
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      country: '',
      state: '',
      city: '',
      district: '',
      pincode: '',
      digipin: '',
    });
    setCertifiedPoiDoc(null);
    setBoardResolutionDoc(null);
    // setCertifiedPicDoc(null);
    setIsEmailVerfied(false);
    setIsMobileVerfied(false);
    setIsVerified(false);
    setAddNewNodal(false);
    //setIsOtpVerified(false);
  };

  const handleValidate = async () => {
    if (!authToken) {
      alert('Token is missing');
      return;
    }

    if (!formik.values.mobileNumber || !formik.values.email) {
      alert('Missing email or mobile number');
      return;
    }

    try {
      //dispatch(showLoader('Please Wait...'));
      const result = await dispatch(
        sendOtp({
          emailId: formik.values.email || '',
          mobileNo: formik.values.mobileNumber || '',
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
      //dispatch(hideLoader());
    }
  };

  const handleOkay = () => {
    setSuccessModalOpen(false);
    //setIsOtpVerified(true);
    setIsEmailVerfied(true);
    setIsMobileVerfied(true);
  };
  const isIndiaAdd = (countryName: string | undefined) =>
    countryName === 'Indian';
  const handleCountryChangeAddress = (event: SelectChangeEvent<string>) => {
    const dial = event.target.value;
    const selectedCountry = countries.find((c) => c.name === dial);

    if (!selectedCountry) {
      setStates([]);
      setDistricts([]);
      setPincodes([]);
      formik.setFieldValue(`country`, '');
      formik.setFieldValue(`state`, '');
      formik.setFieldValue(`district`, '');
      formik.setFieldValue(`pincode`, '');
      return;
    }
    if (!selectedCountry || !selectedCountry.states) {
      return;
    }
    const transformed: State[] = selectedCountry.states.map((st) => ({
      code: st.value,
      name: st.label,
      districts: st.districts.map((d) => ({
        label: d.label,
        value: d.value,
        pincodes: d.pincodes,
      })),
    }));

    setStates(transformed);
    setDistricts([]);
    setPincodes([]);

    formik.setFieldValue(`country`, selectedCountry.name);
    formik.setFieldValue(`state`, '');
    formik.setFieldValue(`district`, '');
    formik.setFieldValue(`pincode`, '');
  };
  const handleStateChange = (event: SelectChangeEvent<string>) => {
    const stateName = event.target.value;
    const sel = states.find((s) => s.name === stateName);

    if (!sel) {
      setDistricts([]);
      setPincodes([]);
      formik.setFieldValue(`state`, '');
      formik.setFieldValue(`district`, '');
      formik.setFieldValue(`pincode`, '');
      return;
    }
    setDistricts(sel.districts || []);
    setPincodes([]);

    formik.setFieldValue(`state`, sel.name);
    formik.setFieldValue(`district`, '');
    formik.setFieldValue(`pincode`, '');
  };
  // useEffect(() => {
  //   const loadAddressDependencies = (
  //     countryCode: string,
  //     stateName: string,
  //     districtValue: string,
  //   ) => {
  //     const selectedCountry = countries.find(
  //       (c) => c.dial_code === countryCode
  //     );
  //     if (!selectedCountry || !selectedCountry.states) {
  //       return;
  //     }
  //     const transformed: State[] = selectedCountry.states.map((st) => ({
  //       code: st.value,
  //       name: st.label,
  //       districts: st.districts.map((d) => ({
  //         label: d.label,
  //         value: d.value,
  //         pincodes: d.pincodes,
  //       })),
  //     }));

  //     const selectedState = transformed.find((s) => s.name === stateName);
  //     const selectedDistrict = selectedState?.districts.find(
  //       (d) => d.value === districtValue
  //     );
  //     const pincodeList = selectedDistrict?.pincodes?.map((p) => p) || [];

  //       setStates(transformed);
  //       setDistricts(selectedState?.districts || []);
  //       setPincodes(pincodeList);

  //   };

  //   if (formik.values.country && formik.values.state && formik.values.district) {
  //     loadAddressDependencies(
  //       formik.values.countryCode,
  //       formik.values.state,
  //       formik.values.district,

  //     );
  //   }

  // }, [formik.values]);

  const handleDistrictChange = (event: SelectChangeEvent<string>) => {
    const districtName = event.target.value;
    const sel = districts.find((s) => s.value === districtName);

    if (!sel) {
      setPincodes([]);
      formik.setFieldValue(`district`, '');
      formik.setFieldValue(`pincode`, '');
      return;
    }
    setPincodes(sel.pincodes || []);

    formik.setFieldValue(`district`, sel.value);
    formik.setFieldValue(`pincode`, '');
  };
  return (
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

      <AccordionDetails sx={{ pl: 0, ml: -12 }}>
        <EntityFormContainer className="entity-form">
          <form onSubmit={formik.handleSubmit}>
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
                <Typography sx={titleStyles}>Nodal Officer Details</Typography>
                {!disableSection && (
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        color: addNewNodal ? '#002cba' : '#999999', // Red when true, blue when false
                        fontWeight: '500',
                        fontSize: '16px',
                        mr: 1,
                        cursor: addNewNodal ? 'pointer' : 'not-allowed', // Change cursor when disabled
                      }}
                      onClick={(e) => {
                        if (!addNewNodal) {
                          return; // Do nothing if addNewNodal is true
                        }
                        e.stopPropagation(); // stop accordion toggle
                        e.preventDefault();
                        handleNewNodalAdd();
                      }}
                    >
                      Add New Nodal Officer
                    </Typography>
                    {/* Arrow still rotates */}
                  </Box>
                )}
              </StyledAccordionSummary>
              <AccordionDetails className="padding-16px">
                {/* new code start */}
                {/* first step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Citizenship <span style={{ color: 'red' }}>*</span>
                    </Typography>

                    <FormControl fullWidth size="small">
                      <Select
                        id="citizenship"
                        native
                        name="citizenship"
                        sx={selectStyles}
                        value={formik.values.citizenship}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={addNewNodal}
                        IconComponent={KeyboardArrowDown}
                      >
                        <option value="">Select Citizenship</option>
                        {citizenships.map(
                          (citizenship: { code: string; name: string }) => (
                            <option
                              key={citizenship.code}
                              value={citizenship.name}
                            >
                              {citizenship.name}
                            </option>
                          )
                        )}
                      </Select>
                    </FormControl>

                    {formik.touched.citizenship &&
                      formik.errors.citizenship && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.citizenship}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    {/* Label */}
                    <Typography variant="body2" sx={labelStyles}>
                      CKYC Number{' '}
                      {isIndianCitizenShip && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>

                    {/* Input with Verified status */}
                    <TextField
                      fullWidth
                      size="small"
                      name="ckycNumber"
                      sx={inputStyles}
                      value={formik.values.ckycNumber}
                      onChange={(e) => {
                        formik.handleChange(e);
                        // Auto reset verification when CKYC number changes
                        if (isIndianCitizenShip) {
                          setIsVerified(false);
                        }
                      }}
                      disabled={addNewNodal}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {formik.values.ckycNumber &&
                              isIndianCitizenShip &&
                              (isVerified || !isIndianCitizenShip ? (
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
                              ))}
                          </InputAdornment>
                        ),
                      }}
                    />
                    {formik.touched.ckycNumber && formik.errors.ckycNumber && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.ckycNumber}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Title <span style={{ color: 'red' }}>*</span>
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                      //error={formik.touched.title && Boolean(formik.errors.title)}
                    >
                      <Select
                        id="title"
                        native
                        name="title"
                        sx={selectStyles}
                        value={formik.values.title}
                        disabled={addNewNodal || isIndianCitizenShip}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        IconComponent={KeyboardArrowDown}
                      >
                        <option value="">Select Title</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms">Ms</option>
                      </Select>
                    </FormControl>
                    {formik.touched.title && formik.errors.title && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.title}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {/* second step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      First Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="firstName"
                      //className="input"
                      sx={inputStyles}
                      placeholder="First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      disabled={addNewNodal || isIndianCitizenShip}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.firstName}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Middle Name
                    </Typography>
                    <TextField
                      name="middleName"
                      sx={inputStyles}
                      placeholder="Middle Name"
                      value={formik.values.middleName}
                      onChange={formik.handleChange}
                      disabled={addNewNodal || isIndianCitizenShip}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.middleName && formik.errors.middleName && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.middleName}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Last Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      id="address-lineone"
                      name="lastName"
                      sx={inputStyles}
                      placeholder="Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      disabled={addNewNodal || isIndianCitizenShip}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.lastName}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {/* third step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Gender <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        id="registered-address-district"
                        native
                        name="gender"
                        sx={selectStyles}
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                        disabled={addNewNodal || isIndianCitizenShip}
                        IconComponent={KeyboardArrowDown}
                      >
                        <option value="">Select Gender</option>
                        {genders.map(
                          (gender: { code: string; name: string }) => (
                            <option key={gender.code} value={gender.name}>
                              {gender.name}
                            </option>
                          )
                        )}
                      </Select>
                    </FormControl>
                    {formik.touched.gender && formik.errors.gender && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.gender}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Date of Birth <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          open={open}
                          onOpen={() => setOpen(true)}
                          onClose={() => setOpen(false)}
                          value={
                            formik.values?.dateOfBirth
                              ? dayjs(formik.values?.dateOfBirth)
                              : null
                          }
                          disabled={addNewNodal}
                          onChange={(value: PickerValidDate | null) => {
                            console.log(value, 'dateee'); // This is already a Dayjs object
                            // No need to convert - value is already a Dayjs object or null
                            formik.setFieldValue('dateOfBirth', value);
                          }}
                          maxDate={dayjs()}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',

                              placeholder: 'DD/MM/YYYY',
                              sx: {
                                '& .MuiInputBase-root': {
                                  height: '35px', // ⬅ reduce overall height
                                },
                                '& .MuiInputBase-input': {
                                  padding: '0px 10px', // ⬅ smaller padding
                                  fontFamily: 'inherit',
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: '#f5f5f5',
                                  '& fieldset': {
                                    borderColor: '#D9D9D9',
                                  },
                                },
                              },
                              InputProps: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => {
                                        setOpen(true);
                                      }}
                                      disabled={addNewNodal}
                                    >
                                      <CalendarMonthIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    {formik.touched.dateOfBirth &&
                      formik.errors.dateOfBirth && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.dateOfBirth}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Designation <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="designation"
                      sx={inputStyles}
                      placeholder="Enter Designation"
                      value={formik.values.designation}
                      onChange={formik.handleChange}
                      disabled={addNewNodal}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.designation &&
                      formik.errors.designation && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.designation}
                        </Typography>
                      )}
                  </Box>
                </Box>
                {/* Four step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Employee Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      id="address-lineone"
                      name="employeeCode"
                      sx={inputStyles}
                      placeholder="Enter Employee code"
                      value={formik.values.employeeCode}
                      onChange={formik.handleChange}
                      disabled={addNewNodal}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.employeeCode &&
                      formik.errors.employeeCode && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.lastName}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Email <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="email"
                      sx={inputStyles}
                      placeholder="Add Email Address"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      disabled={addNewNodal}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.email}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Country Code <span style={{ color: 'red' }}>*</span>
                    </Typography>

                    <FormControl fullWidth size="small">
                      <Select
                        value={formik?.values.countryCode}
                        onChange={(e) => handleCountryChange(e)}
                        disabled={addNewNodal}
                        displayEmpty
                        sx={selectStyles}
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

                    {formik.touched.countryCode &&
                      formik.errors.countryCode && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.countryCode}
                        </Typography>
                      )}
                  </Box>
                </Box>
                {/* Five step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Mobile Number <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      name="mobileNumber"
                      sx={inputStyles}
                      placeholder="Add Mobile Number"
                      value={formik.values.mobileNumber}
                      onChange={formik.handleChange}
                      disabled={addNewNodal}
                      fullWidth
                      size="small"
                    />
                    {formik.touched.mobileNumber &&
                      formik.errors.mobileNumber && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.mobileNumber}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Landline Number
                    </Typography>
                    <TextField
                      id="address-lineone"
                      name="landlineNumber"
                      sx={inputStyles}
                      placeholder="Enter Landline"
                      value={formik.values.landlineNumber}
                      onChange={formik.handleChange}
                      disabled={addNewNodal}
                      fullWidth
                      size="small"
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Office Address <span style={{ color: 'red' }}>*</span>
                    </Typography>

                    <FormControl fullWidth size="small">
                      <Select
                        id="sameAsRegisteredAddress"
                        name="sameAsRegisteredAddress"
                        IconComponent={KeyboardArrowDown}
                        disabled={addNewNodal}
                        sx={selectStyles}
                        value={
                          formik.values.sameAsRegisteredAddress
                            ? 'true'
                            : 'false'
                        } // Convert boolean to string
                        onChange={(e) => {
                          // Convert string back to boolean
                          formik.setFieldValue(
                            'sameAsRegisteredAddress',
                            e.target.value === 'true'
                          );
                        }}
                        onBlur={formik.handleBlur}
                      >
                        <MenuItem
                          value="true"
                          style={{ fontFamily: 'inherit' }}
                        >
                          Same as entity registered address
                        </MenuItem>
                        <MenuItem
                          value="false"
                          style={{ fontFamily: 'inherit' }}
                        >
                          Same as correspondence address
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Address Line 1 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 1 <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 1"
                      name="addressLine1"
                      value={formik.values.addressLine1 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={addNewNodal}
                    />
                    {formik.touched.addressLine1 &&
                      formik.errors.addressLine1 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.addressLine1}
                        </Typography>
                      )}
                  </Box>

                  {/* Address Line 2 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 2
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 2"
                      name="addressLine2"
                      value={formik.values.addressLine2 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={addNewNodal}
                    />
                  </Box>

                  {/* Address Line 3 */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Address Line 3
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                        height: '45px',
                        '& .MuiInputBase-root': {
                          height: '45px',
                        },
                      }}
                      placeholder="Address line 3"
                      name="addressLine1"
                      value={formik.values.addressLine3 || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={addNewNodal}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Country <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formik?.values.country} // This should be "Indian"
                        onChange={(e) => handleCountryChangeAddress(e)}
                        displayEmpty
                        disabled={addNewNodal}
                        sx={selectStyles}
                        IconComponent={KeyboardArrowDown}
                      >
                        {countries.map((c) => (
                          <MenuItem key={c.name} value={c.name}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography>{c.name}</Typography>
                              <Box
                                sx={{
                                  width: 1,
                                  height: 18,
                                  backgroundColor: '#ccc',
                                }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formik.touched.country && formik.errors.country && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.country}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      State/ UT <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={selectStyles}
                          value={formik.values.state}
                          onChange={(e) => handleStateChange(e)}
                          onBlur={formik.handleBlur}
                          disabled={addNewNodal || states.length === 0}
                          IconComponent={KeyboardArrowDown}
                          renderValue={(selected) => {
                            if (!selected) {
                              return 'Select State';
                            }
                            return selected;
                          }}
                        >
                          <MenuItem value="">Select State</MenuItem>
                          {states.map((s) => (
                            <MenuItem key={s.code} value={s.name}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={{
                          ...inputStyles,
                          height: '45px',
                          '& .MuiInputBase-root': {
                            height: '45px',
                          },
                        }}
                        name="state"
                        placeholder="Enter State"
                        value={formik.values.state || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={addNewNodal}
                      />
                    )}
                    {formik.touched.state && formik.errors.state && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {formik.errors.state}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      District <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={selectStyles}
                          name="district"
                          value={formik.values.district}
                          onChange={(e) => handleDistrictChange(e)}
                          onBlur={formik.handleBlur}
                          renderValue={(selected) => {
                            if (!selected) {
                              return 'Select District';
                            }
                            return selected;
                          }}
                          disabled={addNewNodal || districts.length === 0}
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select District</MenuItem>
                          {districts.map((d) => (
                            <MenuItem key={d.value} value={d.value}>
                              {d.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={inputStyles}
                        name="district"
                        placeholder="Enter District"
                        value={formik.values.district || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={addNewNodal}
                      />
                    )}
                    {formik.touched.district && formik.errors.district && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {formik.errors.district}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* City/Town */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      City/Town <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                      }}
                      placeholder="Enter city/town"
                      name="city"
                      value={formik.values.city || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={addNewNodal}
                    />
                    {formik.touched.city && formik.errors.city && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.city}
                      </Typography>
                    )}
                  </Box>

                  {/* Pin Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Pin Code <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    {isIndiaAdd(formik.values.country) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          sx={selectStyles}
                          name="pincode"
                          value={formik.values.pincode}
                          onChange={formik.handleChange}
                          disabled={addNewNodal || pincodes.length === 0} // Disable when not editing or no pincodes
                          renderValue={(selected) =>
                            selected ? selected : 'Select Pincode'
                          }
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value="">Select Pincode</MenuItem>
                          {pincodes?.map((pincode) => (
                            <MenuItem key={pincode} value={pincode}>
                              {pincode}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        sx={inputStyles}
                        name="registeredAddress.pinCode"
                        placeholder="Enter Pin Code"
                        value={formik.values.pincode || ''}
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                        disabled={addNewNodal} // Disable when not editing
                      />
                    )}
                    {formik.touched.pincode && formik.errors.pincode && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
                      >
                        {formik.errors.pincode}
                      </Typography>
                    )}
                  </Box>
                  {/* Alternate Pin Code */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Digipin
                      {formik.values.pincode === 'OTHERS' && (
                        <span style={{ color: 'red' }}>*</span>
                      )}
                    </Typography>
                    <TextField
                      sx={{
                        ...inputStyles,
                      }}
                      placeholder="Enter Pin Code"
                      name="registeredAddress.alternatePinCode"
                      value={formik.values?.digipin || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      fullWidth
                      size="small"
                      disabled={addNewNodal}
                    />
                  </Box>
                </Box>
                {/* Six step */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Proof of Identity <span style={{ color: 'red' }}>*</span>
                    </Typography>

                    <FormControl fullWidth size="small" disabled={true}>
                      <Select
                        id="registered-address-district"
                        native
                        name="proofOfIdentity"
                        sx={selectStyles}
                        IconComponent={KeyboardArrowDown}
                        value={formik.values.proofOfIdentity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={addNewNodal}
                      >
                        <option value="">Select</option>
                        {proofOfIdentities.map(
                          (identity: { code: string; name: string }) => (
                            <option key={identity.code} value={identity.code}>
                              {identity.name}
                            </option>
                          )
                        )}
                      </Select>
                    </FormControl>

                    {/* {formErrors.registeredAddress?.district && ( */}
                    {formik.touched.proofOfIdentity &&
                      formik.errors.proofOfIdentity && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.proofOfIdentity}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FileTag
                      label="Proof of Identity Number"
                      required
                      name="certifiedPoi"
                      fileData={certifiedPoiDoc}
                      previewUrl={certifiedPoiPreview}
                      onChange={handleCertifiedPoiSelection}
                      //onDelete={handleBoardResolutionDelete}
                      fileType="poi"
                      docNum={1}
                      uploadIcon={uploadIconBox}
                      textFieldProps={{
                        name: 'proofOfIdentityNumber',
                        value: formik.values.proofOfIdentityNumber,
                        onChange: formik.handleChange,
                        onBlur: formik.handleBlur,
                        // error:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   Boolean(formik.errors.proofOfIdentityNumber),
                        // helperText:
                        //   formik.touched.proofOfIdentityNumber &&
                        //   formik.errors.proofOfIdentityNumber,
                      }}
                      // error={
                      //   formik.touched?.certifiedPoi &&
                      //   formik.errors?.certifiedPoi
                      //     ? formik.errors.certifiedPoi
                      //     : ''
                      // }
                      disabled={addNewNodal}
                    />
                    {formik.touched.proofOfIdentityNumber &&
                      formik.errors.proofOfIdentityNumber && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.proofOfIdentityNumber}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 200 }}></Box>

                  {/* </Box> */}
                </Box>
                {/* Seven step */}

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 3,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Date of Board Resolution for Appointment
                      <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          open={openBR}
                          onOpen={() => setOpenBR(true)}
                          onClose={() => setOpenBR(false)}
                          value={
                            formik.values?.boardResolutionDate
                              ? dayjs(formik.values?.boardResolutionDate)
                              : null
                          }
                          onChange={(value: PickerValidDate | null) => {
                            formik.setFieldValue('boardResolutionDate', value);
                          }}
                          maxDate={dayjs()}
                          disabled={addNewNodal}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              placeholder: 'DD/MM/YYYY',
                              sx: {
                                '& .MuiInputBase-root': {
                                  height: '35px', // ⬅ reduce overall height
                                },
                                '& .MuiInputBase-input': {
                                  padding: '0px 10px', // ⬅ smaller padding
                                  fontFamily: 'inherit',
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: '#f5f5f5',
                                  '& fieldset': {
                                    borderColor: '#D9D9D9',
                                  },
                                },
                              },
                              InputProps: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => {
                                        setOpenBR(true);
                                      }}
                                      disabled={addNewNodal}
                                    >
                                      <CalendarMonthIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    {formik.touched.boardResolutionDate &&
                      formik.errors.boardResolutionDate && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'error.main',
                            display: 'block',
                            mt: 0.5,
                          }}
                        >
                          {formik.errors.boardResolutionDate}
                        </Typography>
                      )}
                  </Box>
                  <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <Typography variant="body2" sx={labelStyles}>
                      Board Resolution <span style={{ color: 'red' }}>*</span>
                    </Typography>
                    <FileTag
                      label="" // satisfies TypeScript
                      //required
                      name="boardResolution"
                      fileData={boardResolutionDoc}
                      previewUrl={boardResolutionPreview}
                      onChange={handleBoardResolutionSelection}
                      fileType="licence"
                      docNum={1}
                      uploadIcon={UploadIconButton}
                      error={
                        formik.touched?.boardResolution &&
                        formik.errors?.boardResolution
                          ? formik.errors.boardResolution
                          : ''
                      }
                      disabled={addNewNodal}
                    />
                  </Box>
                  <Box
                    sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}
                  ></Box>
                </Box>

                {/* new code start */}
              </AccordionDetails>
            </StyledAccordion>
            {addNewNodal ? (
              <Box textAlign="end" style={{ marginTop: '5px' }}>
                <Button
                  variant="contained"
                  style={{ textTransform: 'none' }}
                  sx={{
                    px: 3,
                    py: 1.2,
                    fontSize: '14px',
                    backgroundColor: '#002BCA',
                    borderRadius: '4px',
                    marginLeft: '0px',
                  }}
                  type="submit"
                  className="submit-btn"
                  //  onClick={handleSubmit}
                  //  disabled={!isFormValid || isViewOnlyAddress}
                  //  style={{
                  //    backgroundColor:
                  //      isFormValid && !isViewOnlyAddress ? '#002CBA' : '#CCCCCC',
                  //    cursor:
                  //      isFormValid && !isViewOnlyAddress
                  //        ? 'pointer'
                  //        : 'not-allowed',
                  //  }}
                >
                  Save and Next
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  marginTop: '5px',
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    px: [3, 4, 8], // [xs, sm, md] and up
                    py: [0.8, 1, 1], // [xs, sm, md] and up,
                    fontSize: '14px',
                    borderRadius: '4px',
                    // Normal state
                    backgroundColor: '#002BCA',
                    border: '1px solid #002BCA',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#001F8E',
                    },
                    // Disabled state
                    '&.Mui-disabled': {
                      backgroundColor: 'white',
                      border: '1px solid #D9D9D9',
                      color: '#D9D9D9',
                    },
                  }}
                  style={{ textTransform: 'none' }}
                  type="button"
                  onClick={handleValidate}
                  disabled={isMobileVerfied && isEmailVerfied}
                >
                  Validate
                </Button>
                <Button
                  variant="contained"
                  style={{ textTransform: 'none' }}
                  sx={{
                    px: [3, 4, 5], // [xs, sm, md] and up
                    py: [0.8, 1, 1], // [xs, sm, md] and up
                    fontSize: '14px',
                    backgroundColor: '#0044cc',
                    borderRadius: '4px',
                    marginLeft: '0px',
                  }}
                  type="submit"
                  className="submit-btn"
                  //  onClick={handleSubmit}
                  disabled={!(isMobileVerfied && isEmailVerfied)}
                  //  style={{
                  //    backgroundColor:
                  //      isFormValid && !isViewOnlyAddress ? '#002CBA' : '#CCCCCC',
                  //    cursor:
                  //      isFormValid && !isViewOnlyAddress
                  //        ? 'pointer'
                  //        : 'not-allowed',
                  //  }}
                >
                  Save and Next
                </Button>
              </Box>
            )}
          </form>
        </EntityFormContainer>

        {addNewNodal && afterSubError ? afterSubError : ''}

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
            email={formik.values?.email}
            mobile={formik.values?.mobileNumber}
          />
        )}
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          onOkay={handleOkay}
          title="Email and Mobile OTP Verified Successfully!"
          message="The Nodal Officers's details have been verified successfully"
        />
      </AccordionDetails>
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
            mobileNumber: data.mobileNo || '',
            email: data.emailAddress || '',
          });
          setCkycOTPModalOpen(false);
        }}
        otpIdentifier={otpIdentifier}
        updateOtpIdentifier={(item) => {
          setotpIdentifier(item);
        }}
      />
    </Box>
  );
};

export default NodalOfficerDetails;
