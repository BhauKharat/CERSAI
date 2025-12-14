import React, { useState, useCallback } from 'react';
import { Box, SxProps, Theme, FormLabel } from '@mui/material';
import { StyledTextField } from './CommonComp.styles';
import { useFieldError } from '../../context/FieldErrorContext';

interface LabeledTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string | React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void; // Callback for blur event to trigger validation
  fieldName?: string; // Field name for error mapping
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  regx?: string; // Regex pattern for input validation
  requiredMessage?: string; // Custom required message
  regxMessage?: string; // Custom regex error message
  minLengthMessage?: string; // Custom minLength message
  maxLengthMessage?: string; // Custom maxLength message
  instantValidation?: boolean; // Enable instant validation on every change
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const LabeledTextFieldUpdate: React.FC<LabeledTextFieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  fieldName,
  placeholder,
  type = 'text',
  error = false,
  helperText,
  required = false,
  disabled = false,
  multiline = false,
  rows,
  minLength,
  maxLength,
  regx,
  requiredMessage,
  regxMessage,
  minLengthMessage,
  maxLengthMessage,
  instantValidation = false,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const fieldId = React.useId();
  const [localError, setLocalError] = useState<string>('');
  const [isTouched, setIsTouched] = useState<boolean>(false);

  // Get field error from context (safely handle case where context is not available)
  const { getFieldError, hasFieldError: hasError } = useFieldError();

  const fieldError = fieldName ? getFieldError(fieldName) : undefined;
  const hasFieldError = fieldName ? hasError(fieldName) : false;

  // Real-time validation function
  const validateValue = useCallback(
    (val: string): string => {
      // 1. Required validation - check first
      if (required && (!val || val.trim() === '')) {
        return requiredMessage || `${label} is required`;
      }

      // If value is empty and not required, skip other validations
      if (!val || val.trim() === '') {
        return '';
      }

      // 2. Regex validation - prioritize regex over min/max length
      // This allows regex to provide more specific error messages (e.g., "PIN code must be exactly 6 digits")
      if (regx) {
        try {
          const regex = new RegExp(regx);
          if (!regex.test(val)) {
            return regxMessage || `${label} format is invalid`;
          }
        } catch {
          // Invalid regex, skip validation
        }
      }

      // 3. MinLength validation (only if no regex or regex passed)
      if (minLength && val.length < minLength) {
        return (
          minLengthMessage ||
          `${label} must be at least ${minLength} characters`
        );
      }

      // 4. MaxLength validation
      if (maxLength && val.length > maxLength) {
        return (
          maxLengthMessage || `${label} cannot exceed ${maxLength} characters`
        );
      }

      return '';
    },
    [
      required,
      requiredMessage,
      label,
      minLength,
      minLengthMessage,
      maxLength,
      maxLengthMessage,
      regx,
      regxMessage,
    ]
  );

  // Determine final error state and helper text
  const finalError = error || hasFieldError || (isTouched && !!localError);
  const finalHelperText =
    fieldError || (isTouched ? localError : '') || helperText;
  const helperTextId = finalHelperText ? `${fieldId}-helper-text` : undefined;

  // Handle change event and enforce maxLength
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    // Enforce maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    // Instant validation: validate on every change for specific fields
    // Otherwise, validate only if field has been touched
    if (instantValidation || isTouched) {
      setIsTouched(true);
      const errorMsg = validateValue(newValue);
      setLocalError(errorMsg);
    }

    // Call onChange with the value (for compatibility with parent components)
    onChange(newValue);
  };

  // Handle blur event for validation
  const handleBlur = () => {
    setIsTouched(true);

    // Always validate on blur - this will show errors for invalid values
    // and clear errors for valid values
    const errorMsg = validateValue(value);
    setLocalError(errorMsg);

    // Call parent onBlur if provided
    if (onBlur) {
      onBlur();
    }
  };

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
      <StyledTextField
        id={fieldId}
        fullWidth
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        error={finalError}
        helperText={finalHelperText}
        disabled={disabled}
        multiline={multiline}
        rows={rows}
        inputProps={{
          minLength,
          maxLength,
        }}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy || helperTextId}
        aria-required={required}
        aria-invalid={finalError}
      />
    </Box>
  );
};

export default LabeledTextFieldUpdate;
