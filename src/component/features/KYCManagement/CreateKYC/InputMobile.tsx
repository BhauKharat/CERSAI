import {
  Box,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { HTMLInputTypeAttribute } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface InputFieldProps {
  label: string;
  type: HTMLInputTypeAttribute;
  name: string;
  placeholder: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  countryCode: string;
  handleCountryCodeChange: (code: string) => void;
}

const InputMobile = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  countryCode,
  handleCountryCodeChange,
}: InputFieldProps) => {
  return (
    <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
      <Box>
        <Typography
          variant="body2"
          sx={{ mb: 1, fontWeight: 500, color: '#333' }}
        >
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
        <TextField
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          size="small"
          fullWidth
          className="textFieldStyles"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ p: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: { xs: '65px', sm: '80px' },
                  }}
                >
                  <Select
                    value={countryCode || '+91'}
                    onChange={() => handleCountryCodeChange('')}
                    size="small"
                    disableUnderline
                    IconComponent={ArrowDropDownIcon}
                    sx={{
                      minWidth: { xs: '60px', sm: '75px' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '.MuiSelect-select': {
                        paddingRight: '24px !important',
                        paddingLeft: '8px',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '.MuiSelect-icon': { right: 4 },
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    }}
                  >
                    <MenuItem value="+91">+91</MenuItem>
                    <MenuItem value="+1">+1</MenuItem>
                    <MenuItem value="+44">+44</MenuItem>
                  </Select>
                  <Box
                    sx={{
                      height: '24px',
                      width: '1px',
                      backgroundColor: '#ccc',
                      margin: '0 8px',
                    }}
                  />
                </Box>
              </InputAdornment>
            ),
          }}
          disabled={disabled}
          required={required}
          error={!!error}
          helperText={error || ' '}
          aria-invalid={!!error}
          aria-describedby={error ? `-error` : undefined}
        />
      </Box>
    </Grid>
  );
};

export default InputMobile;
