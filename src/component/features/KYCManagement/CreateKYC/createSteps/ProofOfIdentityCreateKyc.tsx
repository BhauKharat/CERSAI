/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { IError, IProofOfIdentity } from '../interfaceCreateKyc';
import MuiUploadDoc from '../MuiUploadDoc';
import MuiCheckBox from '../MuiChecBox';
import MuiDropDown from '../MuiDropDown';
import { Box, Button, InputLabel, SelectChangeEvent } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InputField from '../../../../../component/ui/Input/InputField';

const ProofOfIdentityCreateKyc = ({
  ProofOfIdentityForm,
  setProofOfIdentityForm,
}: {
  ProofOfIdentityForm: IProofOfIdentity | undefined;
  setProofOfIdentityForm: (details: IProofOfIdentity, name: string) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<IProofOfIdentity>({
    ovdType: '',
    passportExpiryDate: undefined as Date | undefined,
    drivingLicenseExpiryDate: undefined as Date | undefined,
    idNumber: '',
    ovdCertifiedWithOriginal: '',
    certifiedCopyVerified: '',
    equivalentEDoc: '',
    documentVerifiedFromDigilocker: '',
    presenceOfPassportInMEA: '',
    presenceOfVoterIdInECI: '',
    presenceOfDrivingLicenseInRTO: '',
    presenceOfNREGA: '',
    presenceOfNPR: '',
    offlineVerificationOfAadhaar: '',
    dataReceivedFromOfflineVerification: '',
    ekycAuthentication: '',
    ekycDataReceivedFromUIDAI: '',
    ekycAuthenticationBiometric: '',
    ekycOtpAuthentication: '',
    copyOfOvdPoi: null as File | null,
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
    if (ProofOfIdentityForm) {
      setFormData(ProofOfIdentityForm);
    }
    console.log(setError);
  }, [ProofOfIdentityForm]);
  return (
    <div>
      <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
        <h1>Proof Of Identity</h1>
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
        <h1>OVD Details</h1>
        <Grid container spacing={2}>
          <MuiDropDown
            label="OVD Type"
            name="ovdType"
            placeholder="Select OVD Type"
            value={formData.ovdType}
            onChange={handleChange}
            options={[
              { label: 'Passport', value: 'passport' },
              { label: 'Driving License', value: 'driving_license' },
              { label: 'Voter ID', value: 'voter_id' },
              { label: 'NREGA', value: 'nrega' },
              { label: 'Aadhaar', value: 'aadhaar' },
            ]}
            disabled={false}
            required
            error={
              error.find((err) => err.name === 'ovdType')?.errorMessage || ''
            }
          />

          {/* Passport Expiry Date */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <InputLabel>Passport Expiry Date</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={
                  formData?.passportExpiryDate
                    ? dayjs(formData.passportExpiryDate)
                    : null
                }
                onChange={(date: any) => {
                  const formattedDate = date
                    ? dayjs(date).format('YYYY-MM-DD')
                    : '';
                  handleChange({
                    target: {
                      name: 'passportExpiryDate',
                      value: formattedDate,
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    id: 'passportExpiryDate',
                    name: 'passportExpiryDate',
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'DD-MM-YYYY',
                    sx: { '& .MuiInputBase-root': { height: '70px' } },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Driving License Expiry Date */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <InputLabel>Driving License Expiry Date</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={
                  formData?.drivingLicenseExpiryDate
                    ? dayjs(formData.drivingLicenseExpiryDate)
                    : null
                }
                onChange={(date: any) => {
                  const formattedDate = date
                    ? dayjs(date).format('YYYY-MM-DD')
                    : '';
                  handleChange({
                    target: {
                      name: 'drivingLicenseExpiryDate',
                      value: formattedDate,
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    id: 'drivingLicenseExpiryDate',
                    name: 'drivingLicenseExpiryDate',
                    fullWidth: true,
                    size: 'small',
                    placeholder: 'DD-MM-YYYY',
                    sx: { '& .MuiInputBase-root': { height: '70px' } },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <MuiCheckBox
            required
            label="OVD certified with original"
            name="ovdCertifiedWithOriginal"
            value={formData.ovdCertifiedWithOriginal}
            onChange={handleChange}
          />

          {/* ID Number */}
          <InputField
            label="ID Number"
            name="idNumber"
            onChange={handleChange}
            value={formData.idNumber}
            placeholder="Enter ID Number"
            type="text"
            error={
              error.find((err) => err.name === 'idNumber')?.errorMessage || ''
            }
          />
          <br />

          {/* Yes/No Checkboxes */}

          <MuiCheckBox
            required
            label="Certified copy verified with original OVD"
            name="certifiedCopyVerified"
            value={formData.certifiedCopyVerified}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Equivalent e-doc"
            name="equivalentEDoc"
            value={formData.equivalentEDoc}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Document verified from Digilocker"
            name="documentVerifiedFromDigilocker"
            value={formData.documentVerifiedFromDigilocker}
            onChange={handleChange}
          />

          <MuiCheckBox
            required
            label="Presence of Passport in MEA repository"
            name="presenceOfPassportInMEA"
            value={formData.presenceOfPassportInMEA}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Presence of Voter ID in ECI repository"
            name="presenceOfVoterIdInECI"
            value={formData.presenceOfVoterIdInECI}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Presence of Driving License in RTO repository"
            name="presenceOfDrivingLicenseInRTO"
            value={formData.presenceOfDrivingLicenseInRTO}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Presence of NREGA in respective repository"
            name="presenceOfNREGA"
            value={formData.presenceOfNREGA}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Presence of NPR in census record"
            name="presenceOfNPR"
            value={formData.presenceOfNPR}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="Offline verification of Aadhaar"
            name="offlineVerificationOfAadhaar"
            value={formData.offlineVerificationOfAadhaar}
            onChange={handleChange}
          />

          <MuiCheckBox
            required
            label="Data received from offline verification"
            name="dataReceivedFromOfflineVerification"
            value={formData.dataReceivedFromOfflineVerification}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="E-KYC authentication"
            name="ekycAuthentication"
            value={formData.ekycAuthentication}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="E-KYC data received from UIDAI"
            name="ekycDataReceivedFromUIDAI"
            value={formData.ekycDataReceivedFromUIDAI}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="E-KYC authentication biometric"
            name="ekycAuthenticationBiometric"
            value={formData.ekycAuthenticationBiometric}
            onChange={handleChange}
          />
          <MuiCheckBox
            required
            label="E-KYC OTP authentication carried out"
            name="ekycOtpAuthentication"
            value={formData.ekycOtpAuthentication}
            onChange={handleChange}
          />
        </Grid>
        <h1>Documents</h1>
        <Grid container spacing={2}>
          {/* Upload */}
          <MuiUploadDoc
            label="Copy of OVD/POI"
            name="copyOfOvdPoi"
            value={formData.copyOfOvdPoi}
            onChange={handleChange}
            required
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
            setProofOfIdentityForm(formData, 'ProofOfIdentityForm')
          }
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default ProofOfIdentityCreateKyc;
