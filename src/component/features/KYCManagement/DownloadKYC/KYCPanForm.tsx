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

import type { KYCPanFormProps } from '../KYC.types';

const KYCPanForm: React.FC<KYCPanFormProps> = ({ onSearch, loading }) => {
  const [fields, setFields] = useState({
    pan: '',
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
      return;
    }
    setError(false);
    onSearch(fields);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        {/* First Name */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                fontWeight: 500,
                color: '#333',
              }}
            >
              PAN/CKYC/GSTIN Number
            </Typography>
            <TextField
              name="pan"
              value={fields.pan}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Enter PAN/CKYC/GSTIN Number"
              className="textFieldStyles"
            />
          </Box>
        </Grid>
      </Grid>
      {/* Search Button */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Box
          sx={{
            mt: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: { xs: 'flex-start', sm: 'flex-start' },
            alignItems: 'center',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            className="buttonClass"
          >
            {loading ? 'Searching...' : 'Search'}
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
    </Box>
  );
};

export default KYCPanForm;
