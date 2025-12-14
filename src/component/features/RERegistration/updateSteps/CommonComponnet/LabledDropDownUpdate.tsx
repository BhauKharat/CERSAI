import React from 'react';
import {
  Box,
  FormControl,
  MenuItem,
  FormHelperText,
  SxProps,
  Theme,
  FormLabel,
} from '@mui/material';
import { StyledSelect } from './CommonComp.styles';
import { KeyboardArrowDown } from '@mui/icons-material';

interface DropdownOption {
  label: string;
  code?: string;
  name?: string;
  isocode?: string;
  value: string | number;
  // For nested regulator/types structure
  regulator?: string;
  types?: Array<{
    code: string;
    name: string;
    status: string;
  }>;
}

interface LabeledDropDownProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void; // Callback for validation after selection
  options: DropdownOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  // For handling nested regulator/types structure
  fieldName?: string;
  readonly?: boolean;
}

const LabeledDropDownUpdate: React.FC<LabeledDropDownProps> = ({
  label,
  value,
  onChange,
  options,
  error = false,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  fieldName,
  readonly = false,
}) => {
  const fieldId = React.useId();
  const helperTextId = helperText ? `${fieldId}-helper-text` : undefined;

  // Helper function to get all available values from options
  const getAvailableValues = React.useMemo(() => {
    const availableValues: (string | number)[] = [];

    // Add empty string for placeholder
    if (placeholder) {
      availableValues.push('');
    }

    // Add all option values based on field type
    options.forEach((option) => {
      // Special handling for regulator field with nested types structure
      if (fieldName === 'regulator' && option.regulator) {
        availableValues.push(option.regulator);
      } else if (fieldName === 'institutionType' && option.code) {
        // For institution types, use code as value
        availableValues.push(option.code);
      } else if (fieldName?.toLowerCase().includes('countrycode')) {
        // For country code fields, use the actual country code value
        const menuValue = option.value;
        availableValues.push(menuValue);
      } else if (
        label?.toLowerCase().includes('country') ||
        label?.toLowerCase().includes('citizenship')
      ) {
        const menuValue = option.name || option.label || option.value;
        availableValues.push(menuValue);
      } else if (label?.toLowerCase().includes('state')) {
        const menuValue =
          option.label || option.code || option.name || option.value;
        availableValues.push(menuValue);
      } else {
        // Use option.value first (which contains the code), then fallback to others
        const menuValue =
          option.value || option.code || option.label || option.name || '';
        availableValues.push(menuValue);
      }
    });

    return availableValues;
  }, [options, label, placeholder, fieldName]);

  // Validate and sanitize the current value
  const sanitizedValue = React.useMemo(() => {
    // If value is empty or null, return empty string
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Check if the current value exists in available options
    const valueExists = getAvailableValues.some(
      (availableValue) => String(availableValue) === String(value)
    );

    if (valueExists) {
      return value;
    }
    // Handle Gender: convert "Female" => "F", etc.
    if (label?.toLowerCase() === 'gender') {
      const matchingOption = options.find(
        (option) =>
          option.label?.toLowerCase() === String(value).toLowerCase() ||
          option.name?.toLowerCase() === String(value).toLowerCase()
      );

      if (matchingOption) {
        console.log(
          `🔄 Converting gender "${value}" to code "${matchingOption.value}"`
        );
        return matchingOption.value;
      }
    }
    // Handle Gender: convert "Female" => "F", etc.
    if (label?.toLowerCase() === 'gender') {
      const matchingOption = options.find(
        (option) =>
          option.label?.toLowerCase() === String(value).toLowerCase() ||
          option.name?.toLowerCase() === String(value).toLowerCase()
      );

      if (matchingOption) {
        console.log(
          `🔄 Converting gender "${value}" to code "${matchingOption.value}"`
        );
        return matchingOption.value;
      }
    }

    // Handle Proof of Identity (convert "DRIVING LICENSE" ➝ "DRIVING_LICENSE")
    if (label?.toLowerCase().includes('proof of identity')) {
      const stringValue = String(value);

      const normalizedValue = stringValue.replace(/\s+/g, '_').toUpperCase();

      const matchingOption = options.find(
        (option) =>
          String(option.value) === normalizedValue ||
          option.label?.toUpperCase() === stringValue.toUpperCase()
      );

      if (matchingOption) {
        console.log(
          `🔄 Converting POI "${value}" to code "${matchingOption.value}"`
        );
        return matchingOption.value; // e.g. DRIVING_LICENSE
      }
    }

    // For country code fields, try to find the country code by matching the country name
    if (fieldName?.toLowerCase().includes('countrycode')) {
      const matchingOption = options.find(
        (option) =>
          option.label === value ||
          option.name === value ||
          (option.label &&
            option.label.toLowerCase() === String(value).toLowerCase()) ||
          (option.name &&
            option.name.toLowerCase() === String(value).toLowerCase())
      );

      if (matchingOption && matchingOption.value) {
        console.log(
          `🔄 Converting country name "${value}" to country code "${matchingOption.value}"`
        );
        return matchingOption.value;
      }
    }

    // If value doesn't exist in options, log warning and return empty string
    console.warn(
      `⚠️ Dropdown value "${value}" not found in options for field "${label}". Available values:`,
      getAvailableValues
    );

    return '';
  }, [value, getAvailableValues, label, fieldName, options]);

  return (
    <Box className={className} sx={sx}>
      <FormLabel
        htmlFor={fieldId}
        required={required}
        sx={{
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Gilroy',
          color: '#333',
          marginBottom: 1,
          display: 'block',
          '& .MuiFormLabel-asterisk': {
            color: '#d32f2f',
            marginLeft: '4px',
            fontSize: '14px',
            lineHeight: '1',
          },
        }}
      >
        {label}
      </FormLabel>
      <FormControl fullWidth error={error}>
        <StyledSelect
          id={fieldId}
          value={sanitizedValue}
          onChange={(event) => {
            if (!readonly) {
              const newValue = event.target.value as string | number;
              onChange(newValue);
              // Don't trigger onBlur when a value is selected
              // onBlur should only be triggered when field loses focus without a value
            }
          }}
          IconComponent={KeyboardArrowDown}
          disabled={disabled}
          displayEmpty={!!placeholder}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy || helperTextId}
          aria-required={required}
          aria-invalid={error}
          readOnly={readonly}
        >
          {placeholder && (
            <MenuItem
              value=""
              disabled
              sx={{
                fontFamily: 'Gilroy',
                fontSize: '14px',
                color: '#999',
                fontStyle: 'normal',
              }}
            >
              {placeholder}
            </MenuItem>
          )}
          {options.map((option, index) => {
            // console.log(
            //   'fieldName===',
            //   fieldName?.toLowerCase().includes('countrycode')
            // );
            // Determine the value to use - fallback to label if value is empty
            if (fieldName?.toLowerCase().includes('countrycode')) {
              const menuValue = option.value;
              // console.log('option countrycode----', option);
              return (
                <MenuItem key={`${menuValue}-${index}`} value={menuValue}>
                  {option.label || option.name}
                </MenuItem>
              );
            } else if (
              label?.toLowerCase().includes('country') ||
              label?.toLowerCase().includes('citizenship')
            ) {
              const menuValue = option.name || option.label || option.value;
              // console.log('option country----', option);
              return (
                <MenuItem key={`${menuValue}-${index}`} value={menuValue}>
                  {option.label || option.name}
                </MenuItem>
              );
            } else if (label?.toLowerCase().includes('state')) {
              const menuValue =
                option.label || option.code || option.name || option.value;
              // console.log('option menuValue----',  option);
              return (
                <MenuItem key={`${menuValue}-${index}`} value={menuValue}>
                  {option.label || option.name}
                </MenuItem>
              );
            }

            // Use option.value first (which contains the code), then fallback to code, then others
            const menuValue =
              option.value || option.code || option.name || option.label;
            // console.log('option========', option);
            return (
              <MenuItem key={`${menuValue}-${index}`} value={menuValue}>
                {option.label || option.name}
              </MenuItem>
            );
          })}
        </StyledSelect>
        {helperText && (
          <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default LabeledDropDownUpdate;
