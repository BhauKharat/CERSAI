import React from 'react';
import { Box, Checkbox, FormControlLabel, SxProps, Theme } from '@mui/material';

interface LabeledCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean | string;
  disabled?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  checkboxSx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const LabeledCheckbox: React.FC<LabeledCheckboxProps> = ({
  label,
  checked,
  onChange,
  required = false,
  disabled = false,
  className,
  sx,
  checkboxSx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const fieldId = React.useId();

  // Convert required to boolean if it's a string
  const isRequired =
    typeof required === 'string' ? required === 'true' : required;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Box className={className} sx={sx}>
      <FormControlLabel
        control={
          <Checkbox
            id={fieldId}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
            aria-required={isRequired}
            sx={{
              color: disabled ? '#999999' : '#002CBA',
              '&.Mui-checked': {
                color: '#002CBA',
              },
              '&.Mui-disabled': {
                color: '#B0B0B0',
              },
              backgroundColor: disabled ? '#EEEEEE' : '',

              ...checkboxSx,
              position: 'absolute',
              left: '210px',
            }}
          />
        }
        label={label}
        sx={{
          mb: 2,
          fontFamily: 'Gilroy',
          '& .MuiFormControlLabel-label': {
            fontFamily: 'Gilroy',
            fontSize: '14px',
            fontWeight: '400',
            marginLeft: '10px',
            color: disabled ? '#B0B0B0' : '#333',
            '&::after': isRequired
              ? {
                  content: '" *"',
                  color: '#d32f2f',
                }
              : undefined,
          },
          '&.Mui-disabled .MuiFormControlLabel-label': {
            color: '#B0B0B0',
          },
        }}
        disabled={disabled}
      />
    </Box>
  );
};

export default LabeledCheckbox;
