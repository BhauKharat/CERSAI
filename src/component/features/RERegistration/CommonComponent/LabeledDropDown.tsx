import React from 'react';
import {
  Box,
  FormControl,
  MenuItem,
  FormHelperText,
  SxProps,
  Theme,
  FormLabel,
  TextField,
} from '@mui/material';
import { StyledSelect } from './CommonComponent.styles';

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
  options: DropdownOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean | string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  // For handling nested regulator/types structure
  fieldName?: string;
}

const LabeledDropDown: React.FC<LabeledDropDownProps> = ({
  label,
  value,
  onChange,
  options,
  error = false,
  helperText,
  required,
  disabled = false,
  placeholder,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  fieldName,
}) => {
  const fieldId = React.useId();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Convert required to boolean if it's a string
  const isRequired =
    typeof required === 'string' ? required === 'true' : required;
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
      } else if (
        fieldName?.toLowerCase().includes('countrycode') ||
        label?.toLowerCase().includes('country code')
      ) {
        // For country code fields, use the actual country code value
        // Check both option.value and option.code as the API might use either
        const menuValue = option.value || option.code;
        if (menuValue !== undefined) {
          availableValues.push(menuValue);
        }
      } else if (
        label?.toLowerCase().includes('country') &&
        !label?.toLowerCase().includes('country code')
      ) {
        // For country name fields, use the country name as the value
        const menuValue = option.label || option.name;
        if (menuValue !== undefined) {
          availableValues.push(menuValue);
        }
      } else if (label?.toLowerCase().includes('state')) {
        const menuValue =
          option.label || option.code || option.name || option.value;
        availableValues.push(menuValue);
      } else {
        // const menuValue = option?.label ?? '';

        const menuValue =
          option.label || option.code || option.name || option.value;
        // console.log('menuValue', menuValue, option);
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

    // For country code fields, try to find the country code by matching the country name
    if (fieldName?.toLowerCase().includes('countrycode')) {
      const matchingOption = options.find(
        (option) =>
          option.label === value ||
          option.name === value ||
          option.value === value ||
          option.code === value ||
          (option.label &&
            option.label.toLowerCase() === String(value).toLowerCase()) ||
          (option.name &&
            option.name.toLowerCase() === String(value).toLowerCase())
      );

      if (matchingOption && matchingOption.value) {
        console.log(
          `🔄 Converting "${value}" to country code "${matchingOption.value}"`,
          { matchingOption }
        );
        return matchingOption.value;
      }
    }

    // For country name fields, ensure we store the country name even if a code/isocode was provided
    if (/country/i.test(label || '') && !/country code/i.test(label || '')) {
      const matchingOption = options.find(
        (option) =>
          option.value === value ||
          option.code === value ||
          option.isocode === value ||
          option.label === value ||
          option.name === value
      );
      if (matchingOption) {
        const countryName = matchingOption.label || matchingOption.name;
        if (countryName) {
          console.log(
            `🔄 Normalizing country value to name "${countryName}" for field "${label}"`
          );
          return countryName;
        }
      }
    }

    // If value doesn't exist in options, log warning and return empty string
    console.warn(
      `⚠️ Dropdown value "${value}" not found in options for field "${label}". Available values:`,
      getAvailableValues
    );

    return '';
  }, [value, getAvailableValues, label, fieldName, options]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!normalizedSearch) return options;
    return options.filter((option) => {
      const candidates = [
        option.label,
        option.name,
        option.code,
        option.value,
        option.isocode,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return candidates.some((text) => text.includes(normalizedSearch));
    });
  }, [normalizedSearch, options]);

  return (
    <Box className={className} sx={sx}>
      <FormLabel
        htmlFor={fieldId}
        required={isRequired}
        sx={{
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: 'Gilroy',
          color: '#333',
          marginBottom: 1,
          display: 'block',
          '& .MuiFormLabel-asterisk': {
            color: '#d32f2f',
          },
        }}
      >
        {label}
      </FormLabel>
      <FormControl fullWidth error={error}>
        <StyledSelect
          sx={{
            backgroundColor: disabled ? '#EEEEEE' : '',
            color: disabled ? '#999999' : '',
          }}
          MenuProps={{
            autoFocus: false,
            disableAutoFocusItem: true,
            MenuListProps: { autoFocusItem: false },
          }}
          id={fieldId}
          value={sanitizedValue}
          onChange={(event) => onChange(event.target.value as string | number)}
          disabled={disabled}
          displayEmpty={!!placeholder}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy || helperTextId}
          aria-required={isRequired}
          aria-invalid={error}
          onClose={() => setSearchTerm('')}
        >
          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{
              cursor: 'default',
              backgroundColor: '#fff',
              '&:hover': { backgroundColor: '#fff' },
              '&.Mui-selected': { backgroundColor: '#fff' },
              '&.Mui-focusVisible': { backgroundColor: '#fff' },
              py: 1,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <TextField
              fullWidth
              placeholder="Search..."
              size="small"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              sx={{ backgroundColor: '#fff' }}
              InputProps={{
                sx: { backgroundColor: '#fff' },
              }}
            />
          </MenuItem>
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
          {filteredOptions.map((option, index) => {
            // Handle country code and country name display for country-related fields
            const isCountryCodeField =
              /countrycode/i.test(fieldName || '') ||
              /country code/i.test(label || '');
            const isCountryField =
              /country/i.test(label || '') &&
              !/country code/i.test(label || '');

            if (isCountryCodeField || isCountryField) {
              // Extract code and name based on the actual data structure
              // For hoiCountryCode, the code might be in option.value or option.code
              const code = option.value || option.code;
              const name = option.label || option.name;

              // The actual value to be stored - for country code fields, use value or code
              const menuValue = isCountryCodeField
                ? option.value || option.code
                : name || option.label || option.name || code;

              // Format display text - if we have both code and name, show "+91 India"
              // Otherwise, show whatever we have
              let displayText = '';

              if (code && name) {
                // Format as "+91 India" when both code and name are available
                displayText =
                  fieldName?.toLowerCase().includes('countrycode') ||
                  fieldName?.toLowerCase().includes('countryCode') ||
                  label?.toLowerCase().includes('country code')
                    ? `${name} (${code})`
                    : `${name}`;
              } else if (code) {
                // If only code is available
                displayText = String(code);
              } else if (name) {
                // If only name is available
                displayText = name;
              } else if (option.label) {
                // Fall back to label if available
                displayText = option.label;
              } else if (option.value) {
                // Final fallback to value if nothing else is available
                displayText = String(option.value);
              }

              // Ensure menuValue is always a string for the key and value props
              const stringMenuValue = String(menuValue);

              return (
                <MenuItem
                  key={`${stringMenuValue}-${index}`}
                  value={stringMenuValue}
                >
                  {displayText}
                </MenuItem>
              );
            } else if (label?.toLowerCase().includes('state')) {
              const menuValue =
                option.label || option.code || option.name || option.value;
              const stringMenuValue = String(menuValue);
              return (
                <MenuItem
                  key={`${stringMenuValue}-${index}`}
                  value={stringMenuValue}
                >
                  {option.label || option.name}
                </MenuItem>
              );
            } else if (label?.toLowerCase().includes('countrycode')) {
              const menuValue =
                option.code || option.label || option.name || option.value;
              const stringMenuValue = String(menuValue);
              return (
                <MenuItem
                  key={`${stringMenuValue}-${index}`}
                  value={stringMenuValue}
                >
                  {option.label || option.name}
                </MenuItem>
              );
            }

            const menuValue =
              option.label || option.code || option.name || option.value;
            const stringMenuValue = String(menuValue);
            return (
              <MenuItem
                key={`${stringMenuValue}-${index}`}
                value={stringMenuValue}
              >
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

export default LabeledDropDown;
