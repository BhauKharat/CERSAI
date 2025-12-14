/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { IAttestationDetail, IError } from '../interfaceCreateKyc';
import {
  Box,
  Button,
  Grid,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import InputField from '../../../../../component/ui/Input/InputField';
import MuiCheckBox from '../MuiChecBox';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AttestationDetailCreationKyc = ({
  AttestationDetailForm,
  setAttestationDetailForm,
}: {
  AttestationDetailForm: IAttestationDetail | undefined;
  setAttestationDetailForm: (details: IAttestationDetail, name: string) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<IAttestationDetail>({
    remarks: '',
    videoKycWithoutOfficial: '',
    digitalKycProcess: '',
    faceToFaceWithOfficial: '',
    nonFaceToFaceOnboarding: '',
    faceToFaceOnboarding: '',
    date: null,
    empName: '',
    empCode: '',
    empDesignation: '',
    empBranch: '',
    empCkycId: '',
    institutionName: '',
    institutionCode: '',
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

      // ✅ normal flat fields
      return { ...prev, [name]: target.value };
    });
  };

  useEffect(() => {
    if (AttestationDetailForm) {
      setFormData(AttestationDetailForm);
    }
    console.log(setError);
  }, [AttestationDetailForm]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div>
        <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
          <h1>Other Details </h1>
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
              label="Remarks"
              name="remarks"
              placeholder="Enter Remarks here"
              value={formData.remarks}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'remarks')?.errorMessage || ''
              }
              type="text"
            />
          </Grid>
        </div>
      </div>

      <div>
        <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
          <h1>Mode of KYC</h1>
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
          <h1>Select any one of the below</h1>
          <Grid container spacing={2}>
            <MuiCheckBox
              label="Video based KYC without official"
              name="videoKycWithoutOfficial"
              value={formData.videoKycWithoutOfficial}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'videoKycWithoutOfficial')
                  ?.errorMessage || ''
              }
            />

            <MuiCheckBox
              label="Digital KYC process"
              name="digitalKycProcess"
              value={formData.digitalKycProcess}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'digitalKycProcess')
                  ?.errorMessage || ''
              }
            />

            <MuiCheckBox
              label="Face to face / video KYC with official"
              name="faceToFaceWithOfficial"
              value={formData.faceToFaceWithOfficial}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'faceToFaceWithOfficial')
                  ?.errorMessage || ''
              }
            />

            <MuiCheckBox
              label="Non face to face customer onboarding"
              name="nonFaceToFaceOnboarding"
              value={formData.nonFaceToFaceOnboarding}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'nonFaceToFaceOnboarding')
                  ?.errorMessage || ''
              }
            />

            <MuiCheckBox
              label="Face to face customer onboarding"
              name="faceToFaceOnboarding"
              value={formData.faceToFaceOnboarding}
              onChange={handleChange}
              error={
                error.find((err) => err.name === 'faceToFaceOnboarding')
                  ?.errorMessage || ''
              }
            />
          </Grid>
        </div>
      </div>
      <div>
        <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
          <h1>Attestation Details</h1>
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
          <h1>KYC verification carried out by </h1>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
              <InputLabel>Date</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Enter Date"
                  value={formData.date ? dayjs(formData.date) : null}
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
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!error.find((e) => e.name === 'date'),
                      helperText:
                        error.find((e) => e.name === 'date')?.errorMessage ||
                        '',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <InputField
              label="Emp Name"
              name="empName"
              placeholder="Enter Emp Name"
              value={formData.empName}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'empName')?.errorMessage || ''
              }
            />

            <InputField
              label="Emp Code"
              name="empCode"
              placeholder="Enter Emp Code"
              value={formData.empCode}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'empCode')?.errorMessage || ''
              }
            />

            <InputField
              label="Emp Designation"
              name="empDesignation"
              placeholder="Enter Emp Designation"
              value={formData.empDesignation}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'empDesignation')
                  ?.errorMessage || ''
              }
            />

            <InputField
              label="Emp Branch"
              name="empBranch"
              placeholder="Enter Emp Branch"
              value={formData.empBranch}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'empBranch')?.errorMessage ||
                ''
              }
            />

            <InputField
              label="Emp CKYC ID"
              name="empCkycId"
              placeholder="Enter CKYC ID"
              value={formData.empCkycId}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'empCkycId')?.errorMessage ||
                ''
              }
            />

            <InputField
              label="Institution Name"
              name="institutionName"
              placeholder="Enter Institution Name"
              value={formData.institutionName}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'institutionName')
                  ?.errorMessage || ''
              }
            />

            <InputField
              label="Institution Code"
              name="institutionCode"
              placeholder="Enter Institution Code"
              value={formData.institutionCode}
              onChange={handleChange}
              type="text"
              error={
                error.find((err) => err.name === 'institutionCode')
                  ?.errorMessage || ''
              }
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
            setAttestationDetailForm(formData, 'AttestationDetailForm')
          }
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Save & Next
        </Button>
      </Box>
    </Box>
  );
};

export default AttestationDetailCreationKyc;
