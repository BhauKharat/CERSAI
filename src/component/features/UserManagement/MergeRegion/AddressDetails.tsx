/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import {
  addressFieldStyles,
  addressRowStyles,
  addressSectionContainer,
  addressSectionTitle,
  formRowStyles,
  inputStyles,
  labelStyles,
  // regionFieldStyles,
  requiredField,
  sectionTitleStyles,
} from '../CreateModifyRegion/CreateNewRegion.style';
import {
  Box,
  styled,
  TextField,
  Typography,
} from '@mui/material';


import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  fetchCountryCodes,
  Country as CountryCode,
} from '../../../../utils/countryUtils';

const validationSchema = Yup.object({
  line1: Yup.string().optional(),
  line2: Yup.string().optional(),
  line3: Yup.string().optional(),
  countryCode: Yup.string().optional(),
  state: Yup.string().optional(),
  district: Yup.string().optional(),
  cityTown: Yup.string().optional(),
  pinCode: Yup.string().optional(),
  alternatePinCode: Yup.string().optional(),
  digiPin: Yup.string().optional(),
});

const Form = styled('form')(() => ({}));

type Props = {
    line1:string | undefined
    line2:string | undefined
    line3:string | undefined | null
    countryCode:string | undefined
    state:string | undefined
    district:string | undefined
    cityTown:string | undefined
    pincode:string | undefined
    alternatePinCode:string | undefined | null
    digiPin:string | undefined | null
}

const AddressDetails:React.FC<Props> = (props) => {
  const [allCountries, setAllCountries] = useState<CountryCode[]>([]);

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchCountryCodes();
        setAllCountries(countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Helper function to get country name from code
  const getCountryName = (countryCode: string | undefined): string => {
    if (!countryCode) return '-';
    const country = allCountries.find(
      (c) => c.code.toUpperCase() === countryCode.toUpperCase()
    );
    return country ? country.name : countryCode;
  };

  // Check if country is India
  const isIndiaSelected = props.countryCode === 'IN' || props.countryCode === 'India' || !props.countryCode;

  const formik = useFormik({
    initialValues: {
      line1: props.line1,
      line2: props.line2,
      line3: props.line3,
      countryCode: props.countryCode,
      state: props.state,
      district: props.district,
      cityTown: props.cityTown,
      pincode: props.pincode,
      alternatePinCode: props.alternatePinCode,
      digiPin: props.digiPin,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => console.log(values),
    enableReinitialize: true,
  });




  return (
    <React.Fragment>
      <Box sx={addressSectionContainer}>
        {/* Address Details Section */}

        <Form onSubmit={formik.handleSubmit}>
          <Box sx={addressSectionTitle}>
            <Typography
              variant="h6"
              className="medium-text"
              sx={sectionTitleStyles}
            >
              Address Details
            </Typography>

            <Box sx={addressRowStyles}>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Address Line 1 <span style={requiredField}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="addressLine1"
                  value={formik.values.line1}
                  placeholder="Enter address line 1"
                  required
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Address Line 2
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="addressLine2"
                  value={formik.values.line2}
                  placeholder="Enter address line 2"
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Address Line 3
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="addressLine3"
                  value={formik.values.line3}
                  placeholder="Enter address line 3"
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
            </Box>

            {/* Row 2: Country, State, District */}
            <Box sx={formRowStyles}>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Country <span style={requiredField}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="countryCode"
                  value={getCountryName(formik.values.countryCode)}
                  placeholder="Enter Country Code"
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  State / UT {isIndiaSelected && <span style={requiredField}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="state"
                  value={formik.values.state}
                  placeholder="Enter address line 3"
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  District {isIndiaSelected && <span style={requiredField}>*</span>}
                </Typography>

                <TextField
                  fullWidth
                  variant="outlined"
                  name="district"
                  value={formik.values.district}
                  placeholder="Enter address line 3"
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              
              </Box>
            </Box>

            {/* Row 3: City, Pincode, Other Pincode (conditional), Digipin (conditional) */}
            <Box sx={formRowStyles}>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  City/Town {isIndiaSelected && <span style={requiredField}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="city"
                  value={formik.values.cityTown}
                  placeholder="Enter city/town"
                  required={isIndiaSelected}
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
              <Box sx={addressFieldStyles}>
                <Typography variant="subtitle2" sx={labelStyles}>
                  Pin Code {isIndiaSelected && <span style={requiredField}>*</span>}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="otherPincode"
                  value={
                    formik.values.pincode === '000000' ||
                    formik.values.pincode === 'other' ||
                    formik.values.pincode === 'Others'
                      ? 'Other'
                      : formik.values.pincode || ''
                  }
                  placeholder="Enter other pin code"
                  size="small"
                  disabled
                  sx={inputStyles}
                />
              </Box>
              {(formik.values.pincode === '000000' || formik.values.pincode === 'other') && (
                <Box sx={addressFieldStyles}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Pin Code (in case of others)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="otherPincode"
                    value={formik.values.alternatePinCode}
                    placeholder="Enter other pin code"
                    size="small"
                    disabled
                    sx={inputStyles}
                  />
                </Box>
              )}
              {!(formik.values.pincode === '000000' || formik.values.pincode === 'other') && (
                <Box sx={{ ...addressFieldStyles, maxWidth: '350px' }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Digipin
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="digipin"
                    value={formik.values.digiPin}
                    placeholder="Enter Digipin"
                    size="small"
                    disabled
                    sx={inputStyles}
                  />
                </Box>
              )}
            </Box>

            {/* Row 4: Digipin (only when Pin Code (in case of others) is shown) */}
            {(formik.values.pincode === '000000' || formik.values.pincode === 'other') && (
              <Box sx={formRowStyles}>
                <Box sx={{ ...addressFieldStyles, maxWidth: '350px' }}>
                  <Typography variant="subtitle2" sx={labelStyles}>
                    Digipin
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="digipin"
                    value={formik.values.digiPin}
                    placeholder="Enter Digipin"
                    size="small"
                    disabled
                    sx={inputStyles}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Form>
      </Box>
    </React.Fragment>
  );
};

export default AddressDetails;
