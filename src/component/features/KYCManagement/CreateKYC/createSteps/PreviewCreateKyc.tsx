import React from 'react';
import MuiAccordion from '../MuiAccordion';
import { Box, Button } from '@mui/material';

const PreviewCreateKyc = ({
  submit,
  handleEdit,
}: {
  submit: () => void;
  handleEdit: (key: number) => void;
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {[
        'Demographic Details',
        'Proof of Identity and Address',
        'Address Details',
        'Contact Details',
        'Related Party Details',
        'Other & Attestation Details',
        'Preview',
      ].map((title, index) => (
        <MuiAccordion
          title={title}
          key={index}
          itemKey={index}
          handleEdit={handleEdit}
        />
      ))}
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'center', lg: 'flex-end' },
        }}
      >
        <Button
          variant="contained"
          onClick={submit}
          sx={{ backgroundColor: 'rgb(0, 44, 186)', paddingX: 5, paddingY: 2 }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default PreviewCreateKyc;
