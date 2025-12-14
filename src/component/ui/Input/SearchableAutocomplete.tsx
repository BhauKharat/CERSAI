import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

export interface SearchableAutocompleteProps<T> {
  options: T[];
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  value: T | null;
  onChange: (value: T | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
}

function SearchableAutocomplete<T>(props: SearchableAutocompleteProps<T>) {
  const {
    options,
    getOptionLabel,
    isOptionEqualToValue,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    helperText,
    disabled,
  } = props;

  const equality = React.useMemo(
    () => isOptionEqualToValue || ((opt: T, val: T) => Object.is(opt, val)),
    [isOptionEqualToValue]
  );

  return (
    <Autocomplete<T, false, false, false>
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={equality}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      onBlur={onBlur}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={!!error}
          helperText={helperText}
        />
      )}
    />
  );
}

export default SearchableAutocomplete;
