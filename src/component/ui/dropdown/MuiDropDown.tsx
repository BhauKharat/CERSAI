import React from 'react';

// MUIDropdown.tsx
import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  InputLabel,
  Grid,
} from '@mui/material';

type Option = { name: string; code: string | number };

interface MUIDropdownProps {
  id?: string;
  label: string;
  name: string;
  placeholder?: string;
  value?: string | number; // when undefined, placeholder shows
  onChange: (event: SelectChangeEvent<string | number>) => void;
  options: Option[];
  disabled?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export default function MuiDropDown({
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
}: MUIDropdownProps) {
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
      <FormControl
        fullWidth={fullWidth}
        disabled={disabled}
        error={!!error}
        // helperText={error || ' '}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
        variant="outlined"
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
            <MenuItem key={opt.code} value={opt.name}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>

        {error ? <FormHelperText>{error}</FormHelperText> : null}
        {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
      </FormControl>
    </Grid>
  );
}
