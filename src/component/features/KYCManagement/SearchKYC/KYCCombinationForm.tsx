import React, { ChangeEvent, useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
// import {  } from './SearchKYC.styles';

import type { KYCCombinationFormProps } from '../KYC.types';

const genders = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const KYCCombinationForm: React.FC<KYCCombinationFormProps> = ({
  onSearch,
  loading,
}) => {
  const [fields, setFields] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '', // keep as string for compatibility
  });

  // For DatePicker (MUI expects Dayjs object)
  const [dobValue, setDobValue] = useState<Dayjs | null>(null);
  const [error, setError] = useState(false);

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDobChange = (value: Dayjs | null) => {
    setDobValue(value);
    setFields((prev) => ({
      ...prev,
      dob: value ? value.format('YYYY-MM-DD') : '',
    }));
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
              First Name
            </Typography>
            <TextField
              name="firstName"
              value={fields.firstName}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Enter first name"
              className="textFieldStyles"
            />
          </Box>
        </Grid>

        {/* Middle Name */}
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
              Middle Name
            </Typography>
            <TextField
              name="middleName"
              value={fields.middleName}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Enter middle name"
              className="textFieldStyles"
            />
          </Box>
        </Grid>

        {/* Last Name */}
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
              Last Name
            </Typography>
            <TextField
              name="lastName"
              value={fields.lastName}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Enter last name"
              className="textFieldStyles"
            />
          </Box>
        </Grid>

        {/* Gender */}
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
              Gender
            </Typography>
            <Select
              name="gender"
              value={fields.gender}
              onChange={handleChange}
              size="small"
              fullWidth
              displayEmpty
              className="textFieldStyles"
            >
              <MenuItem value="">Select gender</MenuItem>
              {genders.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>

        {/* Date of Incorporation */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box>
            <Typography
              variant="body2"
              noWrap
              sx={{
                mb: 1,
                fontWeight: 500,
                color: '#333',
              }}
            >
              Date of Incorporation
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dobValue}
                onChange={(value) => {
                  // Type assertion to handle the type mismatch
                  const dayjsValue = value as unknown as Dayjs | null;
                  handleDobChange(dayjsValue);
                }}
                slotProps={{
                  textField: {
                    name: 'dob',
                    size: 'small',
                    fullWidth: true,
                    placeholder: 'YYYY-MM-DD',
                    sx: {
                      background: 'white',
                      '& .MuiOutlinedInput-root': {
                        height: '36px',
                      },
                    },
                    variant: 'outlined',
                    helperText: '',
                  },
                }}
                format="YYYY-MM-DD"
                disableFuture
              />
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
      {/* Search Button */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
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

export default KYCCombinationForm;
