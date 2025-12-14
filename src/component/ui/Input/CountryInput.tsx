import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { Country } from '@utils/countryUtils';
import React from 'react';

interface ICountryInputField {
  id?: string;
  label: string;
  name: string;
  placeholder?: string;
  value?: string | number; // when undefined, placeholder shows
  codeName: string;
  onChange: (event: SelectChangeEvent<string | number>) => void;
  options: Country[];
  disabled?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  error?: string;
  required?: boolean;
}

const CountryInput = ({
  id,
  label,
  name,
  placeholder = 'Select...',
  value,
  onChange,
  options,
  disabled = false,
  fullWidth = true,
  helperText,
  error,
  required = false,
  codeName,
}: ICountryInputField) => {
  const labelId = `${id ?? label.replace(/\s+/g, '-').toLowerCase()}-label`;
  const selectId = id ?? `${label.replace(/\s+/g, '-').toLowerCase()}-select`;
  const inputId = `input-${name}`;

  return (
    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
      <InputLabel
        id={labelId}
        style={{
          whiteSpace: 'normal', // allow wrapping
          wordBreak: 'break-word', // break long words if needed
        }}
      >
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderStyle: 'solid',
          borderWidth: 0.5,
          borderRadius: 2,
          borderColor: 'gray',
        }}
      >
        <FormControl
          fullWidth={fullWidth}
          disabled={disabled}
          error={!!error}
          // helperText={error || ' '}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          required={required}
          variant="outlined"
          sx={{
            maxWidth: 100,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { border: 'none' }, // remove default border
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' },
            },
          }}
        >
          <Select
            labelId={labelId}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            displayEmpty
            renderValue={(selected) => {
              if (selected === '' || selected === undefined) {
                return (
                  <em
                    style={{
                      color: 'rgba(0,0,0,0.38)' /* theme.text.disabled */,
                    }}
                  >
                    {placeholder}
                  </em>
                );
              }

              return selected;
            }}
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value="" disabled style={{ display: 'none' }}>
              {placeholder}
            </MenuItem>

            {options.map((opt) => (
              <MenuItem key={opt.dial_code} value={opt.dial_code}>
                {opt.dial_code}
              </MenuItem>
            ))}
          </Select>

          {error ? <FormHelperText>{error}</FormHelperText> : null}
          {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
        </FormControl>
        <Box
          sx={{
            width: '100%',
            borderStyle: 'solid',
            borderLeftWidth: 1.5,
            pl: 1,
          }}
        >
          <Typography>{codeName}</Typography>
        </Box>
      </Box>
    </Grid>
    // <div className="input-group">
    //   <label htmlFor="countryCode" className="required">
    //     Country Code
    //   </label>
    //   <div className="country-code-wrapper">
    //     <select
    //       className="country-code-dropdown"
    //       name="countryCode"
    //       value={code}
    //       onChange={handleChange}
    //     >
    //       {options.map((country) => (
    //         <option key={country.code} value={country.dial_code}>
    //           {country.dial_code}
    //         </option>
    //       ))}
    //     </select>
    //     <div className="vertical-divider"></div>

    //     <label className="country-name-input" style={{ marginBottom: '9px' }}>
    //       {value}
    //     </label>
    //     {error}
    //   </div>
    // </div>
  );
};

export default CountryInput;
