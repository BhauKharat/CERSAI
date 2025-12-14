/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FocusEvent } from 'react';
import {
  labelStyles,
  selectStyles,
} from '../features/MyTask/UpdateEntityProfile-prevo/RegionCreationRequest.style';
import { KeyboardArrowDown } from '@mui/icons-material';

import {
  Typography,
  FormControl,
  Grid,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';

interface SelectTagProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: SelectChangeEvent) => void;
  onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  options: { code: string; name: string }[];
  disabled?: boolean;
  isCitizenship?: boolean;
  sx?: SxProps<Theme>; // ✅ allow sx
  className?: string; // ✅ allow className
}

const SelectTag: React.FC<SelectTagProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  options,
  disabled = false,
  isCitizenship = false,
}) => {
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="body2" className="form-label" sx={labelStyles}>
        {label} <span style={{ color: 'red' }}>*</span>
      </Typography>

      <FormControl fullWidth>
        <Select
          id={name}
          native
          IconComponent={KeyboardArrowDown}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          sx={{ ...selectStyles }}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option
              key={option.code}
              value={isCitizenship ? option.name : option.code}
            >
              {option.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Typography
          variant="caption"
          sx={{ color: 'error.main', display: 'block', mt: 0.5 }}
        >
          {error}
        </Typography>
      )}
    </Grid>
  );
};

export default SelectTag;
