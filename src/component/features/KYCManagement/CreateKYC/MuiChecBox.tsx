import React from 'react';
import {
  Grid,
  InputLabel,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
interface CheckboxGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options?: string[]; // optional, defaults to Yes/No
  error?: string;
  required?: boolean;
}

const MuiCheckBox: React.FC<CheckboxGroupProps> = ({
  label,
  name,
  value,
  onChange,
  options = ['Yes', 'No'], // default options
  error,
  required,
}) => {
  return (
    <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
      <InputLabel
        style={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      >
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          name={`${name}.${option}`}
          control={<Checkbox checked={value === option} onChange={onChange} />}
          label={option}
        />
      ))}
      {error ? <FormHelperText>{error}</FormHelperText> : null}
    </Grid>
  );
};

export default MuiCheckBox;
