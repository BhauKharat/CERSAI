import React, { useEffect, useState } from 'react';
import { IError } from '../interfaceCreateKyc';
import { Box, Button, Grid, SelectChangeEvent } from '@mui/material';
import InputField from '../../../../../component/ui/Input/InputField';
import { ILegalContactDetails } from '../interfaceCreateLegalKyc';

const ContactDetailsCreateKyc = ({
  ContactDetailsForm,
  setContactDetailsForm,
}: {
  ContactDetailsForm: ILegalContactDetails | undefined;
  setContactDetailsForm: (details: ILegalContactDetails, name: string) => void;
}) => {
  const [, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<ILegalContactDetails>({
    primaryCountryCode: '',
    primaryMobileNumber: '',
    primaryEmail: '',
    secondaryCountryCode: '',
    secondaryMobileNumber: '',
    secondaryEmail: '',
    telephone: '',
    fax: '',
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
          {/* Primary Contact */}
          <InputField
            type="text"
            name="primaryCountryCode"
            label="Primary Country Code"
            placeholder="Enter country code"
            value={formData.primaryCountryCode}
            onChange={handleChange}
          />

          <InputField
            type="tel"
            name="primaryMobileNumber"
            label="Primary Mobile Number"
            placeholder="Enter mobile number"
            value={formData.primaryMobileNumber}
            onChange={handleChange}
          />

          <InputField
            type="email"
            name="primaryEmail"
            label="Primary Email"
            placeholder="Enter primary email"
            value={formData.primaryEmail}
            onChange={handleChange}
          />

          {/* Secondary Contact */}
          <InputField
            type="text"
            name="secondaryCountryCode"
            label="Secondary Country Code"
            placeholder="Enter country code"
            value={formData.secondaryCountryCode}
            onChange={handleChange}
          />

          <InputField
            type="tel"
            name="secondaryMobileNumber"
            label="Secondary Mobile Number"
            placeholder="Enter secondary mobile"
            value={formData.secondaryMobileNumber}
            onChange={handleChange}
          />

          <InputField
            type="email"
            name="secondaryEmail"
            label="Secondary Email"
            placeholder="Enter secondary email"
            value={formData.secondaryEmail}
            onChange={handleChange}
          />

          {/* Other */}
          <InputField
            type="tel"
            name="telephone"
            label="Telephone"
            placeholder="Enter telephone number"
            value={formData.telephone}
            onChange={handleChange}
          />

          <InputField
            type="text"
            name="fax"
            label="Fax"
            placeholder="Enter fax number"
            value={formData.fax}
            onChange={handleChange}
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
