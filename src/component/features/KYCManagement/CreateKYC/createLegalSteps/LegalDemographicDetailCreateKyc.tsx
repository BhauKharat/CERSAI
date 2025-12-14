import React, { useEffect, useState } from 'react';
import { IError } from '../interfaceCreateKyc';
import InputField from '../../../../../component/ui/Input/InputField';
import Grid from '@mui/material/Grid';
import { Box, Button, SelectChangeEvent } from '@mui/material';
import 'react-datepicker/dist/react-datepicker.css';
import MuiDropDown from '../MuiDropDown';
import MuiUploadDoc from '../MuiUploadDoc';
import { ILegalDemographicDetail } from '../interfaceCreateLegalKyc';

const DemographicDetailCreateKyc = ({
  demographicDetailForm,
  setDemographicDetailForm,
}: {
  demographicDetailForm: ILegalDemographicDetail | undefined;
  setDemographicDetailForm: (
    detail: ILegalDemographicDetail,
    name: string
  ) => void;
}) => {
  const [formData, setFormData] = useState<ILegalDemographicDetail>({
    entityName: '',
    entityConstitutionType: '',
    dateOfIncorporation: null,
    dateOfCommencement: null,
    placeOfIncorporation: '',
    countryOfIncorporation: '',
    tinIssuingCountry: '',
    panCard: '',
    form60: null,
    gstRegistrationNumber: '',
  });
  const [error, setError] = useState<IError[]>([]);

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
    if (demographicDetailForm) {
      setFormData(demographicDetailForm);
    }
    console.log(setError);
  }, [demographicDetailForm]);
  return (
    <div>
      <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
        <h1>Legal Entity Details</h1>
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
          <InputField
            label="Entity Name"
            name="entityName"
            value={formData.entityName}
            onChange={handleChange}
            placeholder="Enter Entity Name"
            type="text"
            error={
              error.find((err) => err.name === 'entityName')?.errorMessage || ''
            }
          />

          <MuiDropDown
            label="Entity Constitution Type"
            name="entityConstitutionType"
            value={formData.entityConstitutionType}
            onChange={handleChange}
            placeholder="Select Constitution Type"
            options={[
              { label: 'Private Limited', value: 'Private Limited' },
              { label: 'Public Limited', value: 'Public Limited' },
              { label: 'LLP', value: 'LLP' },
            ]}
            error={
              error.find((err) => err.name === 'entityConstitutionType')
                ?.errorMessage || ''
            }
          />
          <InputField
            label="Place of Incorporation"
            name="placeOfIncorporation"
            value={formData.placeOfIncorporation}
            onChange={handleChange}
            placeholder="Enter Place of Incorporation"
            type="text"
            error={
              error.find((err) => err.name === 'placeOfIncorporation')
                ?.errorMessage || ''
            }
          />

          <InputField
            label="Country of Incorporation"
            name="countryOfIncorporation"
            value={formData.countryOfIncorporation}
            onChange={handleChange}
            placeholder="Enter Country of Incorporation"
            type="text"
            error={
              error.find((err) => err.name === 'countryOfIncorporation')
                ?.errorMessage || ''
            }
          />

          <InputField
            label="TIN Issuing Country"
            name="tinIssuingCountry"
            value={formData.tinIssuingCountry}
            onChange={handleChange}
            placeholder="Enter TIN Issuing Country"
            type="text"
            error={
              error.find((err) => err.name === 'tinIssuingCountry')
                ?.errorMessage || ''
            }
          />

          <InputField
            label="PAN Card"
            name="panCard"
            value={formData.panCard}
            onChange={handleChange}
            placeholder="Enter PAN Card"
            type="text"
            error={
              error.find((err) => err.name === 'panCard')?.errorMessage || ''
            }
          />

          <MuiUploadDoc
            label="Form 60"
            name="form60"
            onChange={handleChange}
            value={formData.form60}
            // error={
            //   error.find((err) => err.name === 'form60')?.errorMessage || ''
            // }
          />

          <InputField
            label="GST Registration Number"
            name="gstRegistrationNumber"
            value={formData.gstRegistrationNumber}
            onChange={handleChange}
            placeholder="Enter GST Registration Number"
            type="text"
            error={
              error.find((err) => err.name === 'gstRegistrationNumber')
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
          onClick={() =>
            setDemographicDetailForm(formData, 'DemographicDetailForm')
          }
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default DemographicDetailCreateKyc;
