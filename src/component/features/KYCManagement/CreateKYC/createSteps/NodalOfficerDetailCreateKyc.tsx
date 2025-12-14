import React, { useEffect, useState } from 'react';
import { IError, INodalOfficerDetail } from '../interfaceCreateKyc';
import { Box, Button, Grid, SelectChangeEvent } from '@mui/material';
import InputField from '../../../../../component/ui/Input/InputField';
import MuiDropDown from '../MuiDropDown';

const NodalOfficerDetailCreateKyc = ({
  NodalOfficerDetailForm,
  setNodalOfficerDetailForm,
}: {
  NodalOfficerDetailForm: INodalOfficerDetail | undefined;
  setNodalOfficerDetailForm: (
    details: INodalOfficerDetail,
    name: string
  ) => void;
}) => {
  const [error, setError] = useState<IError[]>([]);
  const [formData, setFormData] = useState<INodalOfficerDetail>({
    relation: '',
    ckycNumber: '',
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
    if (NodalOfficerDetailForm) {
      setFormData(NodalOfficerDetailForm);
    }
    console.log(setError);
  }, [NodalOfficerDetailForm]);

  return (
    <div>
      <div style={{ backgroundColor: 'rgb(230, 235, 255)', padding: 10 }}>
        <h1>Related Party Details</h1>
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
          <MuiDropDown
            label="Relation"
            name="relation"
            placeholder="Select any authentication factor"
            value={formData.relation}
            onChange={handleChange}
            options={[
              { label: 'Guardian of minor', value: 'Guardian of minor' },
              { label: 'Assignee', value: 'Assignee' },
              {
                label: 'Authorized representative',
                value: 'Authorized representative',
              },
            ]}
            disabled={false}
            required
            error={
              error.find((err) => err.name === 'relation')?.errorMessage || ''
            }
          />

          <InputField
            label="CKYC Number"
            name="ckycNumber"
            type="text"
            placeholder="Enter CKYC number"
            value={formData.ckycNumber}
            onChange={handleChange}
            error={
              error.find((err) => err.name === 'ckycNumber')?.errorMessage || ''
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
            setNodalOfficerDetailForm(formData, 'NodalOfficerDetailForm')
          }
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Save & Next
        </Button>
      </Box>
    </div>
  );
};

export default NodalOfficerDetailCreateKyc;
