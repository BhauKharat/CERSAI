/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { SectionDivider } from '../../DownloadKYC/DownloadKYC.styles';
import { IDemographicDetail, IError, NameFields } from '../interfaceCreateKyc';
import InputField from '../../../../../component/ui/Input/InputField';
import Grid from '@mui/material/Grid';
import { Box, Button, InputLabel, SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import MuiDropDown from '../MuiDropDown';
import MuiCheckBox from '../MuiChecBox';
import MuiUploadDoc from '../MuiUploadDoc';

const nameSections = [
  { key: 'nameDetail', label: 'Name Detail', required: true },
  { key: 'maidenName', label: 'Maiden Name (if any)', required: false },
  { key: 'motherName', label: 'Mother Name', required: true },
  { key: 'fatherName', label: 'Father Name', required: true },
  { key: 'spouseName', label: 'Spouse Name', required: true },
];

const DemographicDetailCreateKyc = ({
  demographicDetailForm,
  setDemographicDetailForm,
}: {
  demographicDetailForm: IDemographicDetail | undefined;
  setDemographicDetailForm: (detail: IDemographicDetail, name: string) => void;
}) => {
  const [formData, setFormData] = useState<IDemographicDetail>({
    dob: undefined as Date | undefined,
    minor: '',
    nameMatch: '',
    dobMatch: '',
    photoMatch: '',
    gender: '',
    genderMatch: '',
    panCard: '',
    form60: null as File | null,
    form61: null as File | null,
    panVerified: '',
    residentialStatus: '',
    residentialStatusDoc: '',
    education: '',
    educationDoc: '',
    nationality: '',
    nationalityDoc: '',
    occupation: '',
    occupationSupportDoc: '',
    disability: '',
    DisabilitySupportDoc: '',
    UDIDNumber: '',
    imageFile: null as File | null,
    residentalStatusFile: null as File | null,
    EQFile: null as File | null,
    occupationFile: null as File | null,
    DisabilityStatusFile: null as File | null,
    // merged name objects
    nameDetail: { firstName: '', middleName: '', lastName: '' },
    maidenName: { firstName: '', middleName: '', lastName: '' },
    motherName: { firstName: '', middleName: '', lastName: '' },
    fatherName: { firstName: '', middleName: '', lastName: '' },
    spouseName: { firstName: '', middleName: '', lastName: '' },
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

      // ✅ handle checkbox
      if (type === 'checkbox') {
        const [base, option] = name.split('.');
        return {
          ...prev,
          [base]: option,
        };
      }

      // ✅ handle nested names (e.g., "motherName.firstName")
      if (name.includes('.')) {
        const [section, field] = name.split('.') as [
          keyof typeof formData,
          keyof NameFields,
        ];
        return {
          ...prev,
          [section]: {
            ...(prev[section] as NameFields),
            [field]: target.value,
          },
        };
      }

      // ✅ normal flat fields
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
        <h1>Demographic Detail</h1>
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
        {nameSections.map(({ key, label, required }, idx) => (
          <div key={key}>
            <h1>{label}</h1>
            <Grid container spacing={2}>
              {['firstName', 'middleName', 'lastName'].map((field, index) => (
                <InputField
                  key={index}
                  label={field
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())} // format: firstName → First Name
                  name={`${key}.${field}`}
                  onChange={handleChange}
                  value={
                    (formData[key as keyof typeof formData] as NameFields)[
                      field as keyof NameFields
                    ]
                  }
                  error={
                    error.find((err) => err.name === `${key}.${field}`)
                      ?.errorMessage || ''
                  }
                  placeholder="Enter Here"
                  type="text"
                  required={
                    required && (field === 'firstName' || field === 'lastName')
                  }
                />
              ))}
            </Grid>
            {idx < nameSections.length - 1 && <SectionDivider />}
          </div>
        ))}
        <div>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <InputLabel>Date of birth</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData?.dob ? dayjs(formData.dob) : null}
                  onChange={(date: any) => {
                    const formattedDate = date
                      ? dayjs(date).format('YYYY-MM-DD')
                      : '';
                    handleChange({
                      target: {
                        name: 'dob',
                        value: formattedDate,
                      },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  maxDate={dayjs()}
                  disabled={false}
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      id: 'dob_actual_two',
                      name: 'adminTwo.dateOfBirth',
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'DD-MM-YYYY',
                      sx: {
                        flex: 1,
                        '& .MuiInputBase-root': {
                          height: '70px',
                        },
                        '& .MuiInputBase-input': {
                          padding: '14px 16px',
                          boxSizing: 'border-box',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <MuiCheckBox
              label="Minor"
              name="minor"
              value={formData.minor}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'minor')?.errorMessage || ''
              }
              required
            />
            <MuiCheckBox
              label="DOB matching with OVD"
              name="dobMatch"
              value={formData.dobMatch}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'dobMatch')?.errorMessage || ''
              }
              required
            />
            <MuiCheckBox
              label="Name matching with OVD"
              name="nameMatch"
              value={formData.nameMatch}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'nameMatch')?.errorMessage ||
                ''
              }
              required
            />
            <MuiCheckBox
              label="Photo matching with OVD"
              name="photoMatch"
              value={formData.photoMatch}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'photoMatch')?.errorMessage ||
                ''
              }
              required
            />
            {/* Gender */}
            <MuiDropDown
              label="Gender"
              name="gender"
              placeholder="Select Gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              disabled={false}
              required
              error={
                error.find((err) => err.name === 'gender')?.errorMessage || ''
              }
            />
            <MuiCheckBox
              label="Gender matching with OVD"
              name="genderMatch"
              value={formData.genderMatch}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'genderMatch')?.errorMessage ||
                ''
              }
            />
            <MuiUploadDoc
              label="Form 60"
              name="form60"
              value={formData.form60}
              onChange={handleChange}
              required
            />
            <MuiUploadDoc
              label="Form 61"
              name="form61"
              value={formData.form61}
              onChange={handleChange}
              required
            />
            <MuiCheckBox
              label="PAN Verified"
              name="panVerified"
              value={formData.panVerified}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'panVerified')?.errorMessage ||
                ''
              }
            />
            <MuiDropDown
              label="Residential Status"
              name="residentialStatus"
              placeholder="Select Residential Status"
              value={formData.residentialStatus}
              onChange={handleChange}
              options={[
                { label: 'Resident', value: 'resident' },
                { label: 'Non-Resident', value: 'non-resident' },
              ]}
              disabled={false} // set true to disable field; label auto-appears disabled
              required
              error={
                error.find((err) => err.name === 'residentialStatus')
                  ?.errorMessage || ''
              }
            />
            {/* Residential Status Doc */}
            <MuiCheckBox
              label="Residential Status supported by the document"
              name="residentialStatusDoc"
              value={formData.residentialStatusDoc}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'residentialStatusDoc')
                  ?.errorMessage || ''
              }
            />
            <MuiDropDown
              label="Educational Qualification"
              name="education"
              placeholder="Select Educational Qualification"
              value={formData.education}
              onChange={handleChange}
              options={[
                { label: 'Graduate', value: 'graduate' },
                { label: 'Post-Graduate', value: 'post-graduate' },
                { label: 'Other', value: 'other' },
              ]}
              disabled={false}
              required
              error={
                error.find((err) => err.name === 'education')?.errorMessage ||
                ''
              }
            />
            {/* Education Doc */}
            <MuiCheckBox
              label="Educational Qualification Supported by document"
              name="educationDoc"
              value={formData.educationDoc}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'educationDoc')
                  ?.errorMessage || ''
              }
            />
            <InputField
              label={'Nationality'}
              name="nationality"
              onChange={handleChange}
              value={formData.nationality}
              placeholder="Enter Nationality"
              type="text"
              error={
                error.find((err) => err.name === 'nationalityDoc')
                  ?.errorMessage || ''
              }
            />
            <MuiCheckBox
              label="Nationality Supported by document"
              name="nationalityDoc"
              value={formData.nationalityDoc}
              onChange={handleChange}
            />
            <MuiDropDown
              label="Occupation"
              name="occupation"
              placeholder="Select Occupation"
              value={formData.occupation}
              onChange={handleChange}
              options={[
                { label: 'Employed', value: 'Employed' },
                { label: 'Self-Employed', value: 'Self-Employed' },
                { label: 'Student', value: 'Student' },
              ]}
              disabled={false}
              required
              error={
                error.find((err) => err.name === 'occupation')?.errorMessage ||
                ''
              }
            />
            <MuiCheckBox
              label="Occupation Supported by document"
              name="occupationSupportDoc"
              value={formData.occupationSupportDoc}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'occupationSupportDoc')
                  ?.errorMessage || ''
              }
            />
            <MuiCheckBox
              label="Disability status"
              name="disability"
              value={formData.disability}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'disability')?.errorMessage ||
                ''
              }
            />
            <MuiCheckBox
              label="Disability status Supported by document"
              name="DisabilitySupportDoc"
              value={formData.DisabilitySupportDoc}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'DisabilitySupportDoc')
                  ?.errorMessage || ''
              }
            />
            <SectionDivider />
            <InputField
              label={'UDID Number'}
              name="UDIDNumber"
              onChange={handleChange}
              value={formData.UDIDNumber}
              placeholder="Enter Here"
              type="text"
            />
            <MuiUploadDoc
              label="Image"
              name="imageFile"
              value={formData.imageFile}
              onChange={handleChange}
              required
            />
            <MuiUploadDoc
              label="Residental Status"
              name="residentalStatusFile"
              value={formData.residentalStatusFile}
              onChange={handleChange}
              required
            />
            <MuiUploadDoc
              label="Educational Qualification"
              name="EQFile"
              value={formData.EQFile}
              onChange={handleChange}
              required
            />

            <MuiUploadDoc
              label="Occupation"
              name="occupationFile"
              value={formData.occupationFile}
              onChange={handleChange}
              required
            />
            <MuiUploadDoc
              label="Disability Status"
              name="DisabilityStatusFile"
              value={formData.DisabilityStatusFile}
              onChange={handleChange}
              required
            />
          </Grid>
        </div>
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
