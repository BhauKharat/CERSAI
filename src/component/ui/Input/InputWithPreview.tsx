import { Box, Grid, InputLabel, TextField, Typography } from '@mui/material';
import React, { HTMLInputTypeAttribute } from 'react';

interface InputFieldProps {
  label: string;
  type: HTMLInputTypeAttribute;
  name: string;
  placeholder: string;
  value: string | number;
  file?: File | null; // optional to show file name
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const InputWithPreview = ({
  label,
  type,
  name,
  placeholder,
  value,
  file,
  onChange,
  error,
  disabled = false,
  required = false,
}: InputFieldProps) => {
  const inputId = `input-${name}`;

  return (
    <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
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
          fullWidth={value ? false : true}
          error={!!error}
          helperText={error || ' '}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {file && (
          <>
            {file.type.startsWith('image/') ? (
              <Box
                component="img"
                src={URL.createObjectURL(file)}
                alt="preview"
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #ddd',
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: 'gray', wordBreak: 'break-word' }}
              >
                {file.name}
              </Typography>
            )}
          </>
        )}
      </div>
    </Grid>
  );
};

export default InputWithPreview;
