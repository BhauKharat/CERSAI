import React, { HTMLInputTypeAttribute } from 'react';
import { Grid, InputLabel, TextField } from '@mui/material';

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
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}) => {
  const inputId = `input-${name}`;

  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
      <div style={{ padding: '5px' }}>
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
      </div>
    </Grid>
  );
};

export default InputField;
