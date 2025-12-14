/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */

import React, { HTMLInputTypeAttribute } from 'react';
import { Grid, InputLabel, TextField } from '@mui/material';

interface ForgotPasswordInputFieldProps {
  label: string;
  type: HTMLInputTypeAttribute;
  name: string;
  placeholder: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  width?: string;
  disabled?: boolean;
  required?: boolean;
}

const ForgotPasswordInputField: React.FC<ForgotPasswordInputFieldProps> = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  error,
  width,
  disabled = false,
  required = false,
}) => {
  const inputId = `input-${name}`;

  return (
    <>
      {/* <Grid size={{ xs: 12, sm: 12, lg: 4 }}> */}
      {/* //   <div style={{ padding: '5px' }}> */}
      <InputLabel
        sx={{
          fontFamily: 'inherit',
          textAlign: 'start' /* right align the link */,
          display: 'block',
          fontSize: '14px',
          color: '#333',
          fontWeight: 'normal',
          marginBottom: '8px',
          width: width,
          paddingLeft: '0',
        }}
      >
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>
      <TextField
        variant="outlined"
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
        helperText={error ? error : ''}
        sx={{
          // root TextField level adjustments
          '&.MuiFormControl-root': {
            width: width,
          },
          '& .MuiOutlinedInput-root': {
            // border: '1px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '14px',
            // fontWeight: '400',
            transition: 'border-color 0.3s',
            // normal border
            '& fieldset': {
              borderColor: '#ddd',
            },
            // on hover remove border
            '&:hover fieldset': {
              borderColor: `${error ? 'red' : '#ddd'}`,
            },
            // on focus (if you want)
            '&.Mui-focused fieldset': {
              border: '1px solid',
              borderColor: `${error ? 'red' : '#002CBA'}`,
              transition: 'border-color 0.3s',
            },
          },
          // inner input padding/font to match screenshot
          '& .MuiInputBase-input': {
            fontFamily: "'Gilroy', sans-serif",
            padding: '14px 16px',
            fontSize: '14px',
            // fontWeight: '400',
            color: '#222',
          },
          '& .MuiInputBase-input::placeholder': {
            fontFamily: "'Gilroy', sans-serif", // placeholder font
            fontSize: '14px',
            // padding: '14px 16px',
            // fontStyle: 'italic',
            color: '#222',
            // opacity: 1, // ensure placeholder is fully visible
          },
          '& .MuiFormHelperText-root.Mui-error': {
            fontFamily: "'Gilroy', sans-serif",
            fontSize: '12px',
            color: 'red',
            marginTop: '5px',
            marginLeft: '0',
            // paddingLeft: '9%',
          },
          //   '& .MuiFormHelperText-root': {
          //     fontSize: '12px',
          //     color: 'red',
          //     marginTop: '5px',
          //     // paddingLeft: '9%',
          //   },
        }}
      />
      {/* <TextField
          sx={{
            width: '100%',
            maxWidth: '300px',
            // padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '14px',
            fontWeight: '400',
            transition: 'border-color 0.3s',
            textAlign: 'left',
          }}
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
        /> */}
      {/* </div> */}
      {/* </Grid> */}
    </>
  );
};

export default ForgotPasswordInputField;
