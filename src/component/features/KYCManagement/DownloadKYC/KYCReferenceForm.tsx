import React, { ChangeEvent, useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
// import {  } from './SearchKYC.styles';

import type { KYCReferenceFormProps } from '../KYC.types';

const KYCReferenceForm: React.FC<KYCReferenceFormProps> = ({
  onSearch,
  loading,
}) => {
  const [fields, setFields] = useState({
    kycReferenceNumber: '',
  });
  const [error, setError] = useState(false);

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: At least one field must be filled
    const anyFilled = Object.values(fields).some((v) => v.trim() !== '');
    if (!anyFilled) {
      setError(true);
      onSearch(fields);
      return;
    }
    setError(false);
    onSearch(fields);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        {/* Search Reference Number */}
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3, xl: 3 }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 500,
                color: '#333',
              }}
            >
              Search CKYC Reference Number
            </Typography>
            <TextField
              name="kycReferenceNumber"
              value={fields.kycReferenceNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Enter CKYC Reference Number"
              className="textFieldStyles"
            />
          </Box>
        </Grid>
        {/* Search Button */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ mt: { xs: 1, sm: 1, md: 3.8 } }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              className="buttonClass"
              sx={{ color: 'white' }}
            >
              {loading ? 'Searching...' : 'Submit'}
            </Button>
          </Box>
        </Grid>

        {/* Error Message */}
        {error && (
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                mt: 1,
                fontWeight: 500,
              }}
            >
              Please fill at least one field before searching.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default KYCReferenceForm;
