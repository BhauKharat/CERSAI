/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './EntityProfile.css';
import { Checkbox, Typography } from '@mui/material';
import AccordionDetails from '@mui/material/AccordionDetails';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardArrowDown } from '@mui/icons-material';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import {
  fetchDropdownMasters,
  fetchGeographyHierarchy,
} from '../../../../redux/slices/registerSlice/masterSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AppDispatch, RootState } from '@redux/store';

import {
  labelStyles,
  inputStyles,
  selectStyles,
  titleStyles,
} from './RegionCreationRequest.style';

import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import {
  markStepCompleted,
  setCurrentStep,
} from '../../../../redux/slices/registerSlice/applicationSlice';
import { addressValidationSchema } from '../../../validation/EntityProfileForm';
import { useFormik } from 'formik';
import {
  Address,
  Country,
  District,
  FormDataType,
  State,
} from './types/UpdateProfileAddressDetails';
import {
  fetchUpdateAdminDetails,
  updateAddressProfile,
} from '../../../../redux/slices/updateProfileSlice/updateInstituteAdminSlice';
import BreadcrumbUpdateProfile from './BreadcrumbUpdateProfile';
import ApplicationStepperUpdate from './ApplicationStepperUpdate';
import '../../MyTask/UpdateEntityProfile-prevo/update.css';
import {
  EntityFormContainer,
  StyledAccordion,
  StyledAccordionSummary,
  StyledAccordionDetails,
  ButtonActionsBox,
  SaveButton,
} from './UpdateProfileAddressDetails.style';
const AddressDetails = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const {
    registeredAddress,
    correspondanceAddress,
    correspondenceAddressSameAsRegisteredAddress,
  } = useSelector((state: RootState) => state.instituteAdmin);
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );

  const { error } = useSelector((state: RootState) => state.address);
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(true); // Track edit state
  const selectedCountry = countries.find(
    (c) => c.dial_code === registeredAddress?.countryCode
  );
  const countryName = selectedCountry ? selectedCountry.name : '';
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [corrStates, setCorrStates] = useState<State[]>([]);
  const [corrDistricts, setCorrDistricts] = useState<District[]>([]);
  const [corrPincodes, setCorrPincodes] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add this useEffect to handle storage errors globally
  useEffect(() => {
    const handleStorageError = (event: ErrorEvent) => {
      if (event.error?.name === 'QuotaExceededError') {
        console.log('Storage quota exceeded, clearing persisted data...');
        localStorage.removeItem('persist:root');
        sessionStorage.removeItem('persist:root');
      }
    };

    window.addEventListener('error', handleStorageError);

    return () => {
      window.removeEventListener('error', handleStorageError);
    };
  }, []);

  useEffect(() => {
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

  const initialAddress: Address = {
    line1: '',
    line2: '',
    line3: '',
    countryCode: '',
    state: '',
    district: '',
    cityTown: '',
    pinCode: '',
    alternatePinCode: '',
    countryName: '',
  };

  const formik = useFormik<FormDataType>({
    initialValues: {
      registeredAddress: initialAddress,
      correspondenceAddress: initialAddress,
      correspondenceAddressSameAsRegisteredAddress: false,
    },
    validationSchema: addressValidationSchema,
    onSubmit: async (values) => {
      console.log('Submitted values:', values);
      if (!authToken) {
        console.error('Token is missing. Cannot submit.');
        return;
      }
      const payload = {
        token: authToken,
        registeredAddress: values.registeredAddress,
        sameAsRegistrationAddress:
          values.correspondenceAddressSameAsRegisteredAddress,
        correspondenceAddress: values.correspondenceAddress,
      };
      const resultAction = await dispatch(
        updateAddressProfile(payload)
      ).unwrap();
      if (resultAction?.success) {
        dispatch(markStepCompleted(1));

        // ✅ Move to next step
        dispatch(setCurrentStep(2));
        setIsEditing(false); // Disable editing after successful submission
        return navigate('/re/update-institutional-details');
      }
    },
  });

  useEffect(() => {
    if (formik.values.correspondenceAddressSameAsRegisteredAddress) {
      formik.setFieldValue('correspondenceAddress', {
        ...formik.values.registeredAddress,
      });
    }
  }, [formik.values.correspondenceAddressSameAsRegisteredAddress]);

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

  useEffect(() => {
    if (registeredAddress && correspondanceAddress) {
      formik.setValues({
        registeredAddress: {
          line1: registeredAddress.line1,
          line2: registeredAddress.line2,
          line3: registeredAddress.line3,
          countryCode: registeredAddress.countryCode,
          state: registeredAddress.state,
          district: registeredAddress.district,
          cityTown: registeredAddress.cityTown,
          pinCode: registeredAddress.pinCode,
          alternatePinCode: registeredAddress.alternatePinCode,
          countryName: countryName,
        },
        correspondenceAddress: {
          line1: correspondanceAddress.line1,
          line2: correspondanceAddress.line2,
          line3: correspondanceAddress.line3,
          countryCode: correspondanceAddress.countryCode,
          state: correspondanceAddress.state,
          district: correspondanceAddress.district,
          cityTown: correspondanceAddress.cityTown,
          pinCode: correspondanceAddress.pinCode,
          alternatePinCode: correspondanceAddress.alternatePinCode,
          countryName: countryName,
        },
        correspondenceAddressSameAsRegisteredAddress:
          correspondenceAddressSameAsRegisteredAddress,
      });
    }
  }, [
    registeredAddress,
    correspondanceAddress,
    correspondenceAddressSameAsRegisteredAddress,
  ]);

  // const handleEditClick = () => {
  //   setIsEditing(true); // Enable editing when Edit button is clicked
  // };

  const handleCountryChange = (
    event: SelectChangeEvent<string>,
    addressType: 'registeredAddress' | 'correspondenceAddress'
  ) => {
    if (!isEditing) return; // Prevent changes if not in edit mode

    const dial = event.target.value;
    const selectedCountry =
      addressType === 'registeredAddress'
        ? countries.find((c) => c.dial_code === dial)
        : countries.find((c) => c.dial_code === dial);

    if (!selectedCountry) {
      setStates([]);
      setDistricts([]);
      setPincodes([]);
      setCorrStates([]);
      setCorrDistricts([]);
      setCorrPincodes([]);
      formik.setFieldValue(`${addressType}.countryCode`, '');
      formik.setFieldValue(`${addressType}.countryName`, '');
      formik.setFieldValue(`${addressType}.state`, '');
      formik.setFieldValue(`${addressType}.district`, '');
      formik.setFieldValue(`${addressType}.pincode`, '');
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
    if (addressType === 'registeredAddress') {
      setStates(transformed);
      setDistricts([]);
      setPincodes([]);
    } else {
      setCorrStates(transformed);
      setCorrDistricts([]);
      setCorrPincodes([]);
    }
    formik.setFieldValue(
      `${addressType}.countryCode`,
      selectedCountry.dial_code
    );
    formik.setFieldValue(`${addressType}.countryName`, selectedCountry.name);
    formik.setFieldValue(`${addressType}.state`, '');
    formik.setFieldValue(`${addressType}.district`, '');
    formik.setFieldValue(`${addressType}.pincode`, '');
  };

  const handleStateChange = (
    event: SelectChangeEvent<string>,
    addressType: 'registeredAddress' | 'correspondenceAddress'
  ) => {
    if (!isEditing) return; // Prevent changes if not in edit mode

    const stateName = event.target.value;
    const sel =
      addressType === 'registeredAddress'
        ? states.find((s) => s.name === stateName)
        : corrStates.find((s) => s.name === stateName);
    if (!sel) {
      setDistricts([]);
      setPincodes([]);
      setCorrDistricts([]);
      setCorrPincodes([]);
      formik.setFieldValue(`${addressType}.state`, '');
      formik.setFieldValue(`${addressType}.district`, '');
      formik.setFieldValue(`${addressType}.pincode`, '');
      return;
    }

    if (addressType === 'registeredAddress') {
      setDistricts(sel.districts || []);
      setPincodes([]);
    } else {
      setCorrDistricts(sel.districts || []);
      setCorrPincodes([]);
    }

    formik.setFieldValue(`${addressType}.state`, sel.name);
    formik.setFieldValue(`${addressType}.district`, '');
    formik.setFieldValue(`${addressType}.pincode`, '');
  };

  const handleDistrictChange = (
    event: SelectChangeEvent<string>,
    addressType: 'registeredAddress' | 'correspondenceAddress'
  ) => {
    if (!isEditing) return; // Prevent changes if not in edit mode

    const districtName = event.target.value;
    const sel =
      addressType === 'registeredAddress'
        ? districts.find((s) => s.value === districtName)
        : corrDistricts.find((s) => s.value === districtName);

    if (!sel) {
      setPincodes([]);
      setCorrPincodes([]);
      formik.setFieldValue(`${addressType}.district`, '');
      formik.setFieldValue(`${addressType}.pincode`, '');
      return;
    }
    if (addressType === 'registeredAddress') {
      setPincodes(sel.pincodes || []);
    } else {
      setCorrPincodes(sel.pincodes || []);
    }
    formik.setFieldValue(`${addressType}.district`, sel.value);
    formik.setFieldValue(`${addressType}.pincode`, '');
  };

  useEffect(() => {
    const loadAddressDependencies = (
      countryCode: string,
      stateName: string,
      districtValue: string,
      addressType: 'registeredAddress' | 'correspondenceAddress'
    ) => {
      const selectedCountry = countries.find(
        (c) => c.dial_code === countryCode
      );
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

      const selectedState = transformed.find((s) => s.name === stateName);
      const selectedDistrict = selectedState?.districts.find(
        (d) => d.value === districtValue
      );
      const pincodeList = selectedDistrict?.pincodes?.map((p) => p) || [];

      if (addressType === 'registeredAddress') {
        setStates(transformed);
        setDistricts(selectedState?.districts || []);
        setPincodes(pincodeList);
      } else {
        setCorrStates(transformed);
        setCorrDistricts(selectedState?.districts || []);
        setCorrPincodes(pincodeList);
      }
    };

    const r = formik.values.registeredAddress;
    const c = formik.values.correspondenceAddress;

    if (r.countryCode && r.state && r.district) {
      loadAddressDependencies(
        r.countryCode,
        r.state,
        r.district,
        'registeredAddress'
      );
    }

    if (c.countryCode && c.state && c.district) {
      loadAddressDependencies(
        c.countryCode,
        c.state,
        c.district,
        'correspondenceAddress'
      );
    }
  }, [formik.values.registeredAddress, formik.values.correspondenceAddress]);

  // Helper function to check if country is India
  const isIndia = (countryCode: string | undefined) => countryCode === '+91';

  return (
    <>
      <Box sx={{ p: 4, backgroundColor: '#fefefeff' }}>
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
                    <Typography sx={titleStyles}>Registered Address</Typography>
                    {/* <Button
                    onClick={(e) => {
                      e.stopPropagation(); // stop accordion toggle
                      e.preventDefault();
                      handleEditClick();
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Edit
                  </Button> */}
                  </Box>
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                  {/* Registered Address Section */}

                  {/* Address Lines 1-3 */}
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
                        name="registeredAddress.line1"
                        value={formik.values.registeredAddress.line1 || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!isEditing}
                        error={
                          formik.touched.registeredAddress?.line1 &&
                          Boolean(formik.errors.registeredAddress?.line1)
                        }
                        helperText={
                          formik.touched.registeredAddress?.line1 &&
                          formik.errors.registeredAddress?.line1
                        }
                      />
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
                        name="registeredAddress.line2"
                        value={formik.values.registeredAddress.line2 || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!isEditing}
                        error={
                          formik.touched.registeredAddress?.line2 &&
                          Boolean(formik.errors.registeredAddress?.line2)
                        }
                        helperText={
                          formik.touched.registeredAddress?.line2 &&
                          formik.errors.registeredAddress?.line2
                        }
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
                        name="registeredAddress.line3"
                        value={formik.values.registeredAddress.line3 || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!isEditing}
                        error={
                          formik.touched.registeredAddress?.line3 &&
                          Boolean(formik.errors.registeredAddress?.line3)
                        }
                        helperText={
                          formik.touched.registeredAddress?.line3 &&
                          formik.errors.registeredAddress?.line3
                        }
                      />
                    </Box>
                  </Box>

                  {/* Country, State, District */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      mb: 2,
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Country Code */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Country <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={formik?.values.registeredAddress.countryCode}
                          onChange={(e) =>
                            handleCountryChange(e, 'registeredAddress')
                          }
                          displayEmpty
                          disabled={!isEditing}
                          sx={{
                            ...selectStyles,
                          }}
                          // Optional: Use a custom icon if needed
                          IconComponent={KeyboardArrowDown}
                        >
                          {countries.map((c) => (
                            <MenuItem key={c.code} value={c.dial_code}>
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
                    </Box>

                    {/* State/UT */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        State/ UT <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      {isIndia(formik.values.registeredAddress.countryCode) ? (
                        <FormControl
                          fullWidth
                          size="small"
                          error={
                            formik.touched.registeredAddress?.state &&
                            Boolean(formik.errors.registeredAddress?.state)
                          }
                        >
                          <Select
                            sx={{ ...selectStyles, height: '45px' }}
                            name="registeredAddress.state"
                            value={formik.values.registeredAddress.state}
                            onChange={(e) =>
                              handleStateChange(e, 'registeredAddress')
                            }
                            onBlur={formik.handleBlur}
                            renderValue={(selected) =>
                              selected ? selected : 'Select State'
                            }
                            disabled={!isEditing || states.length === 0}
                            IconComponent={KeyboardArrowDown}
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
                          name="registeredAddress.state"
                          placeholder="Enter State"
                          value={formik.values.registeredAddress.state || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          fullWidth
                          size="small"
                          disabled={!isEditing}
                        />
                      )}
                      {formik.touched.registeredAddress?.state &&
                        formik.errors.registeredAddress?.state && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {formik.errors.registeredAddress.state}
                          </Typography>
                        )}
                    </Box>

                    {/* District */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        District <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      {isIndia(formik.values.registeredAddress.countryCode) ? (
                        <FormControl
                          fullWidth
                          size="small"
                          error={
                            formik.touched.registeredAddress?.district &&
                            Boolean(formik.errors.registeredAddress?.district)
                          }
                        >
                          <Select
                            sx={{ ...selectStyles, height: '45px' }}
                            name="registeredAddress.district"
                            value={formik.values.registeredAddress.district}
                            onChange={(e) =>
                              handleDistrictChange(e, 'registeredAddress')
                            }
                            onBlur={formik.handleBlur}
                            renderValue={(selected) =>
                              selected ? selected : 'Select District'
                            }
                            disabled={!isEditing || districts.length === 0}
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
                          sx={{
                            ...inputStyles,
                            height: '45px',
                            '& .MuiInputBase-root': {
                              height: '45px',
                            },
                          }}
                          name="registeredAddress.district"
                          placeholder="Enter District"
                          value={formik.values.registeredAddress.district || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          fullWidth
                          size="small"
                          disabled={!isEditing}
                        />
                      )}
                      {formik.touched.registeredAddress?.district &&
                        formik.errors.registeredAddress?.district && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {formik.errors.registeredAddress.district}
                          </Typography>
                        )}
                    </Box>
                  </Box>

                  {/* City, Pin Code, Alternate Pin Code */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
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
                        name="registeredAddress.cityTown"
                        value={formik.values.registeredAddress.cityTown || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!isEditing}
                      />
                    </Box>

                    {/* Pin Code */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Pin Code <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      {isIndia(formik.values.registeredAddress.countryCode) ? (
                        <FormControl fullWidth size="small">
                          <Select
                            sx={selectStyles}
                            name="registeredAddress.pinCode"
                            value={formik.values.registeredAddress.pinCode}
                            onChange={formik.handleChange}
                            disabled={!isEditing || pincodes.length === 0} // Disable when not editing or no pincodes
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
                          value={formik.values.registeredAddress.pinCode || ''}
                          onChange={formik.handleChange}
                          fullWidth
                          size="small"
                          disabled={!isEditing} // Disable when not editing
                        />
                      )}
                    </Box>
                    {/* Alternate Pin Code */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Digipin
                        {formik.values?.registeredAddress?.pinCode ===
                          'OTHERS' && <span style={{ color: 'red' }}>*</span>}
                      </Typography>
                      <TextField
                        sx={{
                          ...inputStyles,
                        }}
                        placeholder="Enter Pin Code"
                        name="registeredAddress.alternatePinCode"
                        value={
                          formik.values?.registeredAddress?.alternatePinCode ||
                          ''
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={!isEditing}
                        error={
                          formik.touched.registeredAddress?.alternatePinCode &&
                          Boolean(
                            formik.errors.registeredAddress?.alternatePinCode
                          )
                        }
                        helperText={
                          formik.touched.registeredAddress?.alternatePinCode &&
                          formik.errors.registeredAddress?.alternatePinCode
                        }
                      />
                    </Box>
                  </Box>

                  {/* Error Display */}
                  {error && (
                    <div className="error-message general-error">{error}</div>
                  )}
                </StyledAccordionDetails>
              </StyledAccordion>
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
                      Correspondence Address
                    </Typography>
                    {/* <Button
                    onClick={(e) => {
                      e.stopPropagation(); // stop accordion toggle
                      e.preventDefault();
                      handleEditClick();
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Edit
                  </Button> */}
                  </Box>
                </StyledAccordionSummary>

                <StyledAccordionDetails>
                  {/* Same Address Checkbox */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography>Same as registered address</Typography>
                    <Checkbox
                      name="correspondenceAddressSameAsRegisteredAddress"
                      checked={
                        formik.values
                          .correspondenceAddressSameAsRegisteredAddress
                      }
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        formik.setFieldValue(
                          'correspondenceAddressSameAsRegisteredAddress',
                          isChecked
                        );

                        if (isChecked) {
                          // Copy all registered address values to correspondence address
                          formik.setFieldValue('correspondenceAddress', {
                            ...formik.values.registeredAddress,
                          });
                        }
                      }}
                      disabled={!isEditing} // Disable when not editing
                    />
                  </Box>

                  {/* Correspondence Address Line 1-3 */}
                  <Box
                    sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}
                  >
                    {/* Address Line 1 */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Address Line 1 <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        sx={inputStyles}
                        id="correspondence-address-lineone"
                        placeholder="Add address here"
                        name="correspondenceAddress.line1"
                        value={formik.values?.correspondenceAddress.line1 || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        fullWidth
                        size="small"
                        disabled={
                          !isEditing ||
                          formik.values
                            .correspondenceAddressSameAsRegisteredAddress
                        }
                      />
                    </Box>
                    {/* Address Line 2 */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Address Line 2
                      </Typography>
                      <TextField
                        sx={inputStyles}
                        id="correspondence-address-linetwo"
                        name="correspondenceAddress.line2"
                        placeholder="Add address here"
                        value={formik.values.correspondenceAddress?.line2 || ''}
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                        disabled={
                          !isEditing ||
                          formik.values
                            .correspondenceAddressSameAsRegisteredAddress
                        }
                      />
                    </Box>

                    {/* Address Line 3 */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Address Line 3
                      </Typography>
                      <TextField
                        sx={inputStyles}
                        id="correspondence-address-linethree"
                        placeholder="Add address here"
                        name="correspondenceAddress.line3"
                        value={formik.values.correspondenceAddress?.line3 || ''}
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                        disabled={
                          !isEditing ||
                          formik.values
                            .correspondenceAddressSameAsRegisteredAddress
                        }
                      />
                    </Box>
                  </Box>

                  {/* Correspondence Address Country, State, District */}
                  <Box
                    sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}
                  >
                    {/* Country Code */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Country<span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={
                            formik?.values.correspondenceAddress.countryCode
                          }
                          onChange={(e) =>
                            handleCountryChange(e, 'correspondenceAddress')
                          }
                          displayEmpty
                          disabled={
                            !isEditing ||
                            formik.values
                              .correspondenceAddressSameAsRegisteredAddress
                          }
                          sx={{
                            ...selectStyles,
                          }}
                          IconComponent={KeyboardArrowDown}
                        >
                          {countries.map((c) => (
                            <MenuItem key={c.code} value={c.dial_code}>
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
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        State/ UT <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      {isIndia(
                        formik.values.correspondenceAddress.countryCode
                      ) ? (
                        <FormControl
                          fullWidth
                          size="small"
                          error={
                            formik.touched.correspondenceAddress?.state &&
                            Boolean(formik.errors.correspondenceAddress?.state)
                          }
                        >
                          <Select
                            sx={selectStyles}
                            name="correspondenceAddress.state"
                            value={formik.values.correspondenceAddress.state}
                            onChange={(e) =>
                              handleStateChange(e, 'correspondenceAddress')
                            }
                            onBlur={formik.handleBlur}
                            renderValue={(selected) =>
                              selected ? selected : 'Select State'
                            }
                            disabled={
                              !isEditing ||
                              formik.values
                                .correspondenceAddressSameAsRegisteredAddress ||
                              corrStates.length === 0
                            }
                            IconComponent={KeyboardArrowDown}
                          >
                            <MenuItem value="">Select State</MenuItem>
                            {corrStates.map((s) => (
                              <MenuItem key={s.code} value={s.name}>
                                {s.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          sx={inputStyles}
                          name="correspondenceAddress.state"
                          placeholder="Enter State"
                          value={
                            formik.values.correspondenceAddress.state || ''
                          }
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          fullWidth
                          size="small"
                          disabled={
                            !isEditing ||
                            formik.values
                              .correspondenceAddressSameAsRegisteredAddress
                          }
                          error={
                            formik.touched.correspondenceAddress?.state &&
                            Boolean(formik.errors.correspondenceAddress?.state)
                          }
                          helperText={
                            formik.touched.correspondenceAddress?.state &&
                            formik.errors.correspondenceAddress?.state
                          }
                        />
                      )}
                      {formik.touched.correspondenceAddress?.state &&
                        formik.errors.correspondenceAddress?.state && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {formik.errors.correspondenceAddress.state}
                          </Typography>
                        )}
                    </Box>

                    {/* District */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        District <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      {isIndia(
                        formik.values.correspondenceAddress.countryCode
                      ) ? (
                        <FormControl
                          fullWidth
                          size="small"
                          error={
                            formik.touched.correspondenceAddress?.district &&
                            Boolean(
                              formik.errors.correspondenceAddress?.district
                            )
                          }
                        >
                          <Select
                            sx={selectStyles}
                            name="correspondenceAddress.district"
                            value={formik.values.correspondenceAddress.district}
                            onChange={(e) =>
                              handleDistrictChange(e, 'correspondenceAddress')
                            }
                            onBlur={formik.handleBlur}
                            renderValue={(selected) =>
                              selected ? selected : 'Select District'
                            }
                            disabled={
                              !isEditing ||
                              formik.values
                                .correspondenceAddressSameAsRegisteredAddress ||
                              corrDistricts.length === 0
                            }
                            IconComponent={KeyboardArrowDown}
                          >
                            <MenuItem value="">Select District</MenuItem>
                            {corrDistricts.map((d) => (
                              <MenuItem key={d.value} value={d.value}>
                                {d.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          sx={inputStyles}
                          name="correspondenceAddress.district"
                          placeholder="Enter District"
                          value={
                            formik.values.correspondenceAddress.district || ''
                          }
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          fullWidth
                          size="small"
                          disabled={
                            !isEditing ||
                            formik.values
                              .correspondenceAddressSameAsRegisteredAddress
                          }
                        />
                      )}
                      {formik.touched.correspondenceAddress?.district &&
                        formik.errors.correspondenceAddress?.district && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {formik.errors.correspondenceAddress.district}
                          </Typography>
                        )}
                    </Box>
                  </Box>

                  {/* Correspondence Address City, Pincode */}
                  <Box
                    sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}
                  >
                    {/* City/Town */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        City/Town <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <TextField
                        sx={inputStyles}
                        name="correspondenceAddress.cityTown"
                        placeholder="Enter city/town"
                        value={
                          formik.values.correspondenceAddress?.cityTown || ''
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur} // Add onBlur
                        fullWidth
                        size="small"
                        disabled={
                          !isEditing ||
                          formik.values
                            .correspondenceAddressSameAsRegisteredAddress
                        }
                      />
                    </Box>

                    {/* Pin Code */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Pin Code <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      {isIndia(
                        formik.values.correspondenceAddress.countryCode
                      ) ? (
                        <FormControl fullWidth size="small">
                          <Select
                            sx={selectStyles}
                            name="correspondenceAddress.pinCode"
                            value={formik.values.correspondenceAddress.pinCode}
                            onChange={formik.handleChange}
                            disabled={
                              !isEditing ||
                              formik.values
                                .correspondenceAddressSameAsRegisteredAddress ||
                              corrPincodes.length === 0
                            }
                            renderValue={(selected) =>
                              selected ? selected : 'Select Pincode'
                            }
                          >
                            <MenuItem value="">Select Pincode</MenuItem>
                            {corrPincodes?.map(
                              (
                                pincode // ← FIXED: use corrPincodes
                              ) => (
                                <MenuItem key={pincode} value={pincode}>
                                  {pincode}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          sx={inputStyles}
                          name="correspondenceAddress.pinCode"
                          placeholder="Enter Pin Code"
                          value={
                            formik.values.correspondenceAddress.pinCode || ''
                          }
                          onChange={formik.handleChange}
                          fullWidth
                          size="small"
                          disabled={!isEditing} // Disable when not editing
                        />
                      )}
                    </Box>

                    {/* Alternate Pin Code */}
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="body2" sx={labelStyles}>
                        Digipin
                        {formik.values?.correspondenceAddress?.pinCode ===
                          'OTHERS' && <span style={{ color: 'red' }}>*</span>}
                      </Typography>
                      <TextField
                        sx={inputStyles}
                        placeholder="Enter Pin Code"
                        name="correspondenceAddress.alternatePinCode"
                        value={
                          formik.values?.correspondenceAddress
                            ?.alternatePinCode || ''
                        }
                        onChange={formik.handleChange}
                        fullWidth
                        size="small"
                        disabled={
                          !isEditing ||
                          formik.values
                            .correspondenceAddressSameAsRegisteredAddress
                        }
                      />
                    </Box>
                  </Box>
                </StyledAccordionDetails>
              </StyledAccordion>

              <ButtonActionsBox>
                {/* <Button
                            style={{
                              textTransform: 'none',
                              borderColor: '#002cba',
                              color: '#002cba',
                              padding: '10px 50px',
                            }}
                            variant="outlined"
                            className="cancel-button"
                            onClick={() => navigate('/re/dashboard')}
                          >
                            Cancel
                          </Button> */}
                <SaveButton
                  sx={{
                    px: [3, 4, 5], // [xs, sm, md] and up
                    py: [0.8, 1, 1], // [xs, sm, md] and up
                  }}
                  style={{ textTransform: 'none' }}
                  variant="contained"
                  type="submit"

                  //disabled={(!formik.isValid) || loading}
                >
                  Save and Next
                </SaveButton>
              </ButtonActionsBox>
              {/* Error Display */}
              {error && (
                <div className="error-message general-error">{error}</div>
              )}
            </form>
          </EntityFormContainer>
        </AccordionDetails>
      </Box>
    </>
  );
};

export default AddressDetails;
