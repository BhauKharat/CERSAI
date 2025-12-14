/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';
import { Grid, Typography, TextField, SxProps, Theme } from '@mui/material';
import {
  labelStyles,
  inputStyles,
} from '../features/MyTask/UpdateEntityProfile-prevo/RegionCreationRequest.style';

interface TextTagProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: React.ChangeEventHandler<any>;
  onBlur: React.FocusEventHandler<any>;
  error?: string;
  disabled?: boolean;
  endAdornment?: ReactNode;
  optional?: boolean;
  sx?: SxProps<Theme>; // 👈 allow sx prop
}

const TextTag: React.FC<TextTagProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  endAdornment,
  optional,
  //sx, // 👈 consume sx
}) => {
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="body2" className="form-label" sx={labelStyles}>
        {label} {optional && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <TextField
        fullWidth
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        error={!!error}
        helperText={error || ' '}
        disabled={disabled}
        sx={inputStyles}
        InputProps={{
          endAdornment: endAdornment || null,
        }}
      />
    </Grid>
  );
};

export default TextTag;
