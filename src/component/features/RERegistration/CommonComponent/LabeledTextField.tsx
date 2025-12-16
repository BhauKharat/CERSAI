import React, { forwardRef } from 'react';
import { Box, SxProps, Theme, FormLabel } from '@mui/material';
import { StyledTextField } from './CommonComponent.styles';
import { useFieldError } from '../context/FieldErrorContext';

interface LabeledTextFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  fieldName?: string; // Field name for error mapping
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: boolean;
  helperText?: string;
  required?: boolean | string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  inputMode?:
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  isMobileNumber?: boolean;
}

const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  (
    {
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      fieldName,
      placeholder,
      type = 'text',
      error = false,
      helperText,
      required,
      disabled = false,
      multiline = false,
      rows,
      minLength,
      maxLength,
      pattern,
      inputMode,
      className,
      sx,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      isMobileNumber = false,
    },
    ref
  ) => {
    const fieldId = React.useId();

    // Convert required to boolean if it's a string
    const isRequired =
      typeof required === 'string' ? required === 'true' : required;

    // Handle mobile number input changes
    const handleMobileNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const inputValue = e.target.value;

      // Only allow numbers - don't limit length here, let validation handle it
      const numbersOnly = inputValue.replace(/\D/g, '');

      // Create a new event with the sanitized value
      const sanitizedEvent = {
        ...e,
        target: {
          ...e.target,
          value: numbersOnly,
          name: e.target.name,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      // Call the original onChange with the sanitized value
      onChange(sanitizedEvent);
    };

    // Get field error from context (safely handle case where context is not available)
    const { getFieldError, hasFieldError: hasError } = useFieldError();

    const fieldError = fieldName ? getFieldError(fieldName) : undefined;
    const hasFieldError = fieldName ? hasError(fieldName) : false;

    // Determine final error state and helper text
    const finalError = error || hasFieldError;
    const finalHelperText = fieldError || helperText;
    const helperTextId = finalHelperText ? `${fieldId}-helper-text` : undefined;

    // Debug logging for mobile number fields
    if (isMobileNumber) {
      // console.log('📱 LabeledTextField - Mobile field props:', {
      //   fieldName,
      //   isMobileNumber,
      //   maxLength,
      //   minLength,
      //   pattern,
      //   inputMode,
      //   type,
      //   placeholder,
      //   value,
      // });
    }

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
        <StyledTextField
          ref={ref}
          id={fieldId}
          fullWidth
          type={isMobileNumber ? 'tel' : type}
          value={value}
          onChange={isMobileNumber ? handleMobileNumberChange : onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            const inputValue = target.value || '';
            target.value = inputValue;
          }}
          sx={{
            backgroundColor: disabled ? '#EEEEEE' : '',
            color: disabled ? '#999999' : '',
          }}
          error={finalError}
          helperText={finalHelperText}
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          inputProps={{
            minLength: minLength,
            maxLength: maxLength,
            inputMode: inputMode,
            pattern: pattern,
          }}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy || helperTextId}
          aria-required={isRequired}
          aria-invalid={finalError}
        />
      </Box>
    );
  }
);

LabeledTextField.displayName = 'LabeledTextField';

export default LabeledTextField;
