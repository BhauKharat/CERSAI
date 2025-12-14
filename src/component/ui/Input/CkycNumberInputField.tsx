import React, { HTMLInputTypeAttribute } from 'react';
import { Box, Grid, InputLabel, TextField } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
  isVerified: boolean;
}

const CkycNumberInputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  isVerified,
}) => {
  const inputId = `input-${name}`;
  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
      <Box sx={{ padding: '5px', position: 'relative' }}>
        <InputLabel>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </InputLabel>
        <TextField
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          fullWidth
          error={!!error}
          helperText={error || ' '}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {isVerified && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              position: 'absolute',
              color: 'rgba(82, 174, 50, 1)',
              top: '50%',
              right: 10,
              transform: 'translateY(-50%)',
              alignItems: 'center',
            }}
          >
            <CheckCircleOutlineIcon style={{ fontSize: '22px' }} />
            <span>Verified</span>
          </Box>
        )}
      </Box>
    </Grid>
  );
};

export default CkycNumberInputField;
