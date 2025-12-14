import React, { ChangeEvent, useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  SelectChangeEvent,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import type { KycDetails, KYCReferenceNumberProps } from '../KYC.types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import KYCDetailsDisplay from './KYCDetailsDisplay';
import MessageModal from '../../../Modal/featuresModals/MessageModal';
import OTPModal from '../../../Modal/featuresModals/OTPModal';
import ConsentModal from '../../../Modal/featuresModals/ConsentModal';

const AuthencationFactor = [
  { label: 'Mobile Number', value: 'mobileNumber' },
  { label: 'Email ID', value: 'emailId' },
  { label: 'Date Of Birth', value: 'dateOfBirth' },
  { label: 'Year of Birth & PIN Code(Current Address)', value: 'yearOfBirth' },
  { label: 'Father/Mother/Spouse Name', value: 'relation' },
];

// Helper function to create initial fields per factor
function getInitialFields(
  authencationFactor: string,
  value = '',
  countryCode = '+91'
) {
  const baseFields = {
    authencationFactor,
    countryCode: countryCode,
    mobileNumber: '',
    emailId: '',
    dateOfBirth: '',
    yearOfBirth: '',
    pinCode: '',
    relationType: '',
    relationName: '',
  };

  if (authencationFactor === 'mobileNumber') {
    return { ...baseFields, mobileNumber: value };
  } else if (authencationFactor === 'emailId') {
    return { ...baseFields, emailId: value };
  } else if (authencationFactor === 'dateOfBirth') {
    return { ...baseFields, dateOfBirth: value };
  } else if (
    authencationFactor === 'yearOfBirth' ||
    authencationFactor === 'pinCode'
  ) {
    return { ...baseFields, yearOfBirth: '', pinCode: '' };
  } else if (authencationFactor === 'name') {
    return { ...baseFields, name: value };
  } else {
    return { ...baseFields, authencationFactor: '' };
  }
}

// Function to generate dummy KYC data
const generateDummyKycData = (factor?: string): KycDetails => {
  const baseData: KycDetails = {
    name: 'HDFC Bank',
    gender: 'Male',
    mobileNumber: '+91 8888 8888 88',
    emailId: 'sandeep123@gmail.com',
    lastUpdated: '12 Dec 2024',
    ckycReferenceNumber: 'KWGU2768327JGL12',
    submittedDocuments: {
      personalDetails: {
        'Date of Birth': '01-01-1990',
        "Father's Name": 'John Doe',
        "Mother's Name": 'Jane Doe',
        'Marital Status': 'Married',
      },
      proofOfIdentityAndAddress: {
        'Document Type (POI)': 'Aadhaar Card',
        'Document Number (POI)': 'XXXX XXXX 1234',
        'Document Type (POA)': 'Electricity Bill',
        'Document Number (POA)': '123456789',
      },
      addressDetails: {
        'Address Line 1': '123, Main Street',
        'Address Line 2': 'Near Central Park',
        City: 'Mumbai',
        State: 'Maharashtra',
        'PIN Code': '400001',
      },
      relatedPartyDetails: {
        'Relationship Type': 'Spouse',
        'Related Party Name': 'Priya Sharma',
        'Related Party CKYC': 'CKYC1234567890',
      },
      otherDetailsAndAttestation: {
        'FATCA Declaration': 'Yes',
        'PEP Status': 'No',
        'Declaration Date': '10-12-2024',
      },
    },
  };

  if (factor === 'mobileNumber') {
    baseData.mobileNumber = '1342567';
  } else if (factor === 'emailId') {
    baseData.emailId = 'dsgdfhfghd';
  } else if (factor === 'dateOfBirth') {
    baseData.name = 'ABC Corp Pvt Ltd';
    baseData.gender = 'N/A';
    baseData.mobileNumber = '+91 9999 9999 99';
    baseData.emailId = 'info@abccorp.com';
    baseData.lastUpdated = '15 Jan 2025';
    baseData.ckycReferenceNumber = 'BUSI7890123456';
    baseData.submittedDocuments.personalDetails['Date of Incorporation'] =
      'value';
    delete baseData.submittedDocuments.personalDetails['Date of Birth'];
    delete baseData.submittedDocuments.personalDetails["Father's Name"];
    delete baseData.submittedDocuments.personalDetails["Mother's Name"];
    delete baseData.submittedDocuments.personalDetails['Marital Status'];
  }

  return baseData;
};

const KYCReferenceNumber: React.FC<KYCReferenceNumberProps> = ({
  onFind,
  loading,
}) => {
  const [dobValue, setDobValue] = useState<Dayjs | null>(null);
  const [yobValue, setYOBValue] = useState<Dayjs | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isOpenOTPModal, setIsOpenOTPModal] = useState(false);
  const [isOpenConsentModal, setIsOpenConsentModal] = useState(false);
  const [, setIscloseModal] = useState(false);
  const [fields, setFields] = useState(getInitialFields(''));
  const [showFields, setShowFields] = useState('');
  const [relationNameFields, setRelationNameFields] = useState('');
  const [error, setError] = useState(false);
  const [kycResult, setKycResult] = useState<KycDetails | null>(null);

  const handleDobChange = (value: Dayjs | null) => {
    setDobValue(value);
    setFields(
      getInitialFields(
        'dateOfBirth',
        value ? value.format('YYYY-MM-DD') : '',
        fields.countryCode
      )
    );
  };

  const handleYearOfBirthChange = (value: Dayjs | null) => {
    setYOBValue(value);
    setFields(
      getInitialFields(
        'yearOfBirth',
        value ? value.format('YYYY') : '',
        fields.yearOfBirth
      )
    );
  };

  const handleChangeAuthencationFactor = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const newFactor = e.target.value;
    setShowFields(newFactor);
    setDobValue(null);
    setFields(getInitialFields(newFactor, '', fields.countryCode));
    setError(false);
    setKycResult(null);
    setRelationNameFields('');
  };

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleChangeRelation = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    console.log('data:----', e.target.value);
    setRelationNameFields(e.target.value);
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleCountryCodeChange = (event: SelectChangeEvent<string>) => {
    setFields({ ...fields, countryCode: event.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const anyFilled = Object.values(fields).some(
      (v) => v !== null && String(v).trim() !== ''
    );

    if (!anyFilled || fields.authencationFactor === '') {
      setError(true);
      setKycResult(null);
      return;
    }
    setError(false);
    setKycResult(null);

    const cleanedFields = Object.fromEntries(
      Object.entries(fields).filter(
        ([v]) => v !== null && v !== undefined && v !== ''
      )
    );

    if (fields.authencationFactor === 'mobileNumber' && fields.mobileNumber) {
      const mergedNumber = `${fields.countryCode}${String(
        fields.mobileNumber
      ).replace(/\s+/g, '')}`;
      cleanedFields.mobileNumber = mergedNumber;
      delete cleanedFields.countryCode;
    }

    onFind(cleanedFields);
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      const dummyData = generateDummyKycData(showFields);
      setKycResult(dummyData);
    }, 1500);
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    setIsOpenOTPModal(true);
  };

  const onVerify = (otp: string): Promise<boolean> => {
    console.log('OTP Verify;---', otp);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
        setIscloseModal(false);
        setIsOpenConsentModal(true);
      }, 500);
    });
  };

  const onVerifyConsent = (otp: string): Promise<boolean> => {
    console.log('OTP Verify Consent;---', otp);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
        setIscloseModal(false);
      }, 500);
    });
  };

  const onResend = async () => true;
  const email = 'test@example.com';
  const mobile = '1234567890';

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Box
        display="flex"
        alignItems="center"
        mb={2}
        sx={{ backgroundColor: '#e8f5e9', p: 1.5, borderRadius: '4px' }}
      >
        <CheckCircleIcon sx={{ color: '#2ecc40', mr: 1 }} />
        <Typography
          variant="h6"
          color="success.main"
          sx={{ fontWeight: 500, fontSize: '1rem' }}
        >
          Reference Number Found
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: '#333' }}
            >
              Select Authentication Factor (Any One)
            </Typography>
            <Select
              name="authencationFactor"
              value={fields.authencationFactor}
              onChange={handleChangeAuthencationFactor}
              size="small"
              fullWidth
              displayEmpty
              className="textFieldStyles"
            >
              <MenuItem value="">Select Authentication Factor</MenuItem>
              {AuthencationFactor.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>

        {showFields === 'mobileNumber' && (
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: '#333' }}
              >
                Mobile Number*
              </Typography>
              <TextField
                name="mobileNumber"
                value={fields.mobileNumber || ''}
                onChange={handleChange}
                size="small"
                fullWidth
                placeholder="8888 8888 88"
                className="textFieldStyles"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ p: 0 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          minWidth: { xs: '65px', sm: '80px' },
                        }}
                      >
                        <Select
                          value={fields.countryCode || '+91'}
                          onChange={handleCountryCodeChange}
                          size="small"
                          disableUnderline
                          IconComponent={ArrowDropDownIcon}
                          sx={{
                            minWidth: { xs: '60px', sm: '75px' },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '.MuiSelect-select': {
                              paddingRight: '24px !important',
                              paddingLeft: '8px',
                              display: 'flex',
                              alignItems: 'center',
                            },
                            '.MuiSelect-icon': { right: 4 },
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          }}
                        >
                          <MenuItem value="+91">+91</MenuItem>
                          <MenuItem value="+1">+1</MenuItem>
                          <MenuItem value="+44">+44</MenuItem>
                        </Select>
                        <Box
                          sx={{
                            height: '24px',
                            width: '1px',
                            backgroundColor: '#ccc',
                            margin: '0 8px',
                          }}
                        />
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
        )}

        {showFields === 'emailId' && (
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 500, color: '#333' }}
              >
                Email Id
              </Typography>
              <TextField
                name="emailId"
                value={fields.emailId || ''}
                onChange={handleChange}
                size="small"
                fullWidth
                placeholder="Enter email id"
                className="textFieldStyles"
              />
            </Box>
          </Grid>
        )}

        {showFields === 'dateOfBirth' && (
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
            <Box>
              <Typography
                variant="body2"
                noWrap
                sx={{ mb: 1, fontWeight: 500, color: '#333' }}
              >
                Date of Birth
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dobValue}
                  onChange={(value) => {
                    const dayjsValue = value as unknown as Dayjs | null;
                    handleDobChange(dayjsValue);
                  }}
                  slotProps={{
                    textField: {
                      name: 'dateOfBirth',
                      size: 'small',
                      fullWidth: true,
                      placeholder: 'YYYY-MM-DD',
                      sx: {
                        background: 'white',
                        '& .MuiOutlinedInput-root': {
                          height: '36px',
                        },
                      },
                      variant: 'outlined',
                      helperText: '',
                    },
                  }}
                  format="YYYY-MM-DD"
                  disableFuture
                />
              </LocalizationProvider>
            </Box>
          </Grid>
        )}

        {showFields === 'yearOfBirth' && (
          <>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: '#333' }}
                >
                  Year of Birth
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year']}
                    value={yobValue}
                    onChange={(value) => {
                      const dayjsValue = value as unknown as Dayjs | null;
                      handleYearOfBirthChange(dayjsValue);
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        placeholder: 'YYYY',
                        sx: {
                          background: 'white',
                          '& .MuiOutlinedInput-root': { height: '36px' },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: '#333' }}
                >
                  PIN Code
                </Typography>
                <TextField
                  name="pinCode"
                  value={fields.pinCode || ''}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  placeholder="Enter PIN Code"
                  className="textFieldStyles"
                />
              </Box>
            </Grid>
          </>
        )}

        {showFields === 'relation' && (
          <>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: '#333',
                  }}
                >
                  Relation
                </Typography>
                <Select
                  name="relationType"
                  value={fields.relationType}
                  onChange={handleChangeRelation}
                  size="small"
                  fullWidth
                  displayEmpty
                  className="textFieldStyles"
                >
                  <MenuItem value="">Select Relation</MenuItem>
                  <MenuItem key="0" value="father">
                    Father
                  </MenuItem>
                  <MenuItem key="1" value="mother">
                    Mother
                  </MenuItem>
                  <MenuItem key="2" value="spouse">
                    Sopuse Name
                  </MenuItem>
                </Select>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: '#333',
                    textTransform: 'capitalize',
                  }}
                >
                  {relationNameFields} Name
                </Typography>
                <TextField
                  name="relationName"
                  value={fields.relationName || ''}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  placeholder={relationNameFields}
                  className="textFieldStyles"
                />
              </Box>
            </Grid>
          </>
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
        <Box sx={{ mt: { xs: 2, sm: 2, md: 2 } }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            className="buttonClass"
          >
            {loading ? 'Searching...' : 'Submit'}
          </Button>
        </Box>
      </Grid>

      {error && (
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="body2"
            sx={{ color: 'error.main', mt: 1, fontWeight: 500 }}
          >
            Please fill at least one field before searching.
          </Typography>
        </Grid>
      )}

      <MessageModal
        open={isSuccessModalOpen}
        onClose={handleModalClose}
        title="Authentication factor provided is Incorrect. Please try again."
        message=""
        buttonText="Okay"
        imageUrl="/ckyc/icons/Failure.svg"
      />

      <OTPModal
        open={isOpenOTPModal}
        onClose={() => {
          setIsOpenOTPModal(false);
        }}
        countryCode={''}
        onVerify={onVerify}
        onResend={onResend}
        email={email}
        mobile={mobile}
      />

      <ConsentModal
        open={isOpenConsentModal}
        onClose={() => setIsOpenConsentModal(false)}
        onVerify={onVerifyConsent}
        onResend={onResend}
        email={email}
        mobile={mobile}
      />
      {kycResult && <KYCDetailsDisplay kycData={kycResult} />}
    </Box>
  );
};

export default KYCReferenceNumber;
