import React, { useEffect, useState } from 'react';
import { IError } from '../interfaceCreateKyc';
import { Box, Button, Grid, SelectChangeEvent } from '@mui/material';
import InputField from '../../../../../component/ui/Input/InputField';
import MuiCheckBox from '../MuiChecBox';
import { ILegalAttestationDetail } from '../interfaceCreateLegalKyc';

const AttestationDetailCreationKyc = ({
  AttestationDetailForm,
  setAttestationDetailForm,
}: {
  AttestationDetailForm: ILegalAttestationDetail | undefined;
  setAttestationDetailForm: (
    details: ILegalAttestationDetail,
    name: string
  ) => void;
}) => {
  const [, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<ILegalAttestationDetail>({
    remarks: '',
    certifiedCopies: '',
    equivalentEDoc: '',
    kycVerificationDate: null,
    empName: '',
    empCode: '',
    empDesignation: '',
    empBranch: '',
    empCKYCId: '',
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
              type="text"
              name="remarks"
              label="Remarks"
              placeholder="Enter Remarks"
              value={formData.remarks}
              onChange={handleChange}
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
              label="Certified Copies"
              name="certifiedCopies"
              value={formData.certifiedCopies}
              onChange={handleChange}
            />

            <MuiCheckBox
              label="Equivalent E-Doc"
              name="equivalentEDoc"
              value={formData.equivalentEDoc}
              onChange={handleChange}
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
            <InputField
              type="text"
              name="empName"
              label="Employee Name"
              placeholder="Enter Employee Name"
              value={formData.empName}
              onChange={handleChange}
            />

            <InputField
              type="text"
              name="empCode"
              label="Employee Code"
              placeholder="Enter Employee Code"
              value={formData.empCode}
              onChange={handleChange}
            />

            <InputField
              type="text"
              name="empDesignation"
              label="Employee Designation"
              placeholder="Enter Employee Designation"
              value={formData.empDesignation}
              onChange={handleChange}
            />

            <InputField
              type="text"
              name="empBranch"
              label="Employee Branch"
              placeholder="Enter Employee Branch"
              value={formData.empBranch}
              onChange={handleChange}
            />

            <InputField
              type="text"
              name="empCKYCId"
              label="Employee CKYC Id"
              placeholder="Enter Employee CKYC Id"
              value={formData.empCKYCId}
              onChange={handleChange}
            />
          </Grid>
          <h1>Institutional details</h1>
          <Grid container spacing={2}>
            <InputField
              type="text"
              name="institutionName"
              label="Institution Name"
              placeholder="Enter Institution Name"
              value={formData.institutionName}
              onChange={handleChange}
            />

            <InputField
              type="text"
              name="institutionCode"
              label="Institution Code"
              placeholder="Enter Institution Code"
              value={formData.institutionCode}
              onChange={handleChange}
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
