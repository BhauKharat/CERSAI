import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { IError } from '../interfaceCreateKyc';
import MuiUploadDoc from '../MuiUploadDoc';
import { Box, Button, SelectChangeEvent } from '@mui/material';
import InputField from '../../../../../component/ui/Input/InputField';
import { ILegalProofOfIdentity } from '../interfaceCreateLegalKyc';

const ProofOfIdentityCreateKyc = ({
  ProofOfIdentityForm,
  setProofOfIdentityForm,
}: {
  ProofOfIdentityForm: ILegalProofOfIdentity | undefined;
  setProofOfIdentityForm: (
    details: ILegalProofOfIdentity,
    name: string
  ) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<ILegalProofOfIdentity>({
    certificateOfIncorporation: null,
    cin: '',
    memorandumOfAssociation: null,
    resolutionFromBoard: null,
    seniorManagementNames: null,
    certificateOfCommencement: null,
    others: null,
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
        <Grid container spacing={2}>
          <MuiUploadDoc
            label="Certificate of Incorporation"
            name="certificateOfIncorporation"
            value={formData.certificateOfIncorporation}
            onChange={handleChange}
            // error={
            //   error.find((err) => err.name === 'certificateOfIncorporation')
            //     ?.errorMessage || ''
            // }
          />

          <InputField
            label="CIN"
            name="cin"
            value={formData.cin}
            onChange={handleChange}
            placeholder="Enter CIN"
            type="text"
            error={error.find((err) => err.name === 'cin')?.errorMessage || ''}
          />

          <MuiUploadDoc
            label="Memorandum of Association"
            name="memorandumOfAssociation"
            value={formData.memorandumOfAssociation}
            onChange={handleChange}
            // error={
            //   error.find((err) => err.name === 'memorandumOfAssociation')
            //     ?.errorMessage || ''
            // }
          />

          <MuiUploadDoc
            label="Resolution from Board"
            name="resolutionFromBoard"
            value={formData.resolutionFromBoard}
            onChange={handleChange}
            // error={
            //   error.find((err) => err.name === 'resolutionFromBoard')
            //     ?.errorMessage || ''
            // }
          />

          <MuiUploadDoc
            label="Senior Management Names"
            name="seniorManagementNames"
            value={formData.seniorManagementNames}
            onChange={handleChange}
            // error={
            //   error.find((err) => err.name === 'seniorManagementNames')
            //     ?.errorMessage || ''
            // }
          />

          <MuiUploadDoc
            label="Certificate of Commencement"
            name="certificateOfCommencement"
            value={formData.certificateOfCommencement}
            onChange={handleChange}
            // error={
            //   error.find((err) => err.name === 'certificateOfCommencement')
            //     ?.errorMessage || ''
            // }
          />

          <MuiUploadDoc
            label="Others"
            name="others"
            value={formData.others}
            onChange={handleChange}
            // error={
            //   error.find((err) => err.name === 'others')?.errorMessage || ''
            // }
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
