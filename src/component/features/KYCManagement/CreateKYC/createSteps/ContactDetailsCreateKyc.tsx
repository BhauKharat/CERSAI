import React, { useEffect, useState } from 'react';
import { IContactDetails, IError } from '../interfaceCreateKyc';
import { Box, Button, Grid, SelectChangeEvent } from '@mui/material';
import MuiCheckBox from '../MuiChecBox';
import InputField from '../../../../../component/ui/Input/InputField';
import InputMobile from '../InputMobile';

const ContactDetailsCreateKyc = ({
  ContactDetailsForm,
  setContactDetailsForm,
}: {
  ContactDetailsForm: IContactDetails | undefined;
  setContactDetailsForm: (details: IContactDetails, name: string) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<IContactDetails>({
    email: '',
    countryCode: '',
    mobileNumber: '',
    mobileVerifiedOtp: '',
    emailVerifiedOtp: '',
    mobileVerifiedThirdParty: '',
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | number>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, type } = target;
    if (!name) return;

    setFormData((prev) => {
      // ✅ handle file upload
      if (type === 'file') {
        const updated = { ...prev, [name]: target.files?.[0] || null };
        target.value = ''; // clear file input
        return updated;
      }

      // ✅ handle checkbox
      if (type === 'checkbox') {
        const [base, option] = name.split('.');
        return {
          ...prev,
          [base]: option,
        };
      }

      return { ...prev, [name]: target.value };
    });
  };

  useEffect(() => {
    if (ContactDetailsForm) {
      setFormData(ContactDetailsForm);
    }
    console.log(setError);
  }, [ContactDetailsForm]);
  return (
    <div>
      <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
        <h1>Contact Details</h1>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          backgroundColor: 'rgb(255, 255, 255)',
          padding: 20,
        }}
      >
        <Grid container spacing={2}>
          <InputMobile
            label="mobile Number"
            name="mobileNumber"
            type="number"
            placeholder="Enter mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            countryCode={formData.countryCode}
            handleCountryCodeChange={() => {}}
            error={
              error.find((err) => err.name === 'email')?.errorMessage || ''
            }
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'email')?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Mobile number verified through OTP"
            name="mobileVerifiedOtp"
            value={formData.mobileVerifiedOtp}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'mobileVerifiedOtp')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Email verified through OTP"
            name="emailVerifiedOtp"
            value={formData.emailVerifiedOtp}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'emailVerifiedOtp')
                ?.errorMessage || ''
            }
          />

          <MuiCheckBox
            label="Mobile number verified through 3rd party"
            name="mobileVerifiedThirdParty"
            value={formData.mobileVerifiedThirdParty}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'mobileVerifiedThirdParty')
                ?.errorMessage || ''
            }
          />
        </Grid>
      </div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'center', lg: 'flex-end' },
        }}
      >
        <Button
          variant="contained"
          onClick={() => setContactDetailsForm(formData, 'ContactDetailsForm')}
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default ContactDetailsCreateKyc;
