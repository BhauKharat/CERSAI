import React, { useState } from 'react';
import { Box, SxProps, Theme, FormLabel } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from '@mui/x-date-pickers/models';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useFieldError } from '../../context/FieldErrorContext';

interface LabeledDateUpdateProps {
  label: string;
  value: string | null; // expected in 'YYYY-MM-DD' or ISO format
  onChange: (value: string | null) => void;
  onBlur?: () => void; // Callback for validation after date selection
  fieldName?: string; // Field name for error mapping
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  format?: string; // display format, defaults to 'DD/MM/YYYY'
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const LabeledDateUpdate: React.FC<LabeledDateUpdateProps> = ({
  label,
  value,
  onChange,
  onBlur,
  fieldName,
  error = false,
  helperText,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  format = 'DD/MM/YYYY',
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const fieldId = React.useId();

  // Get field error from context (safely handle case where context is not available)
  const { getFieldError, hasFieldError: hasError } = useFieldError();

  const fieldError = fieldName ? getFieldError(fieldName) : undefined;
  const hasFieldError = fieldName ? hasError(fieldName) : false;

  // Determine final error state and helper text
  const finalError = error || hasFieldError;
  const finalHelperText = fieldError || helperText;
  const helperTextId = finalHelperText ? `${fieldId}-helper-text` : undefined;

  const [open, setOpen] = useState(false);

  const dayjsValue: Dayjs | null = value ? dayjs(value) : null;
  const dayjsMin: Dayjs | undefined = minDate ? dayjs(minDate) : undefined;
  // Default maxDate to today if not provided
  const dayjsMax: Dayjs = maxDate ? dayjs(maxDate) : dayjs();

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
          },
        }}
      >
        {label}
      </FormLabel>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          open={disabled ? false : open}
          onOpen={() => !disabled && setOpen(true)}
          onClose={() => {
            setOpen(false);
            // Trigger validation after date picker closes
            if (onBlur) {
              setTimeout(() => onBlur(), 0);
            }
          }}
          slotProps={{
            textField: {
              id: fieldId,
              fullWidth: true,
              error: finalError,
              helperText: finalHelperText,
              required,
              disabled,
              'aria-label': ariaLabel || label,
              'aria-describedby': ariaDescribedBy || helperTextId,
              'aria-required': required,
              'aria-invalid': finalError,
              onClick: () => !disabled && setOpen(true),
              sx: {
                cursor: disabled ? 'not-allowed' : 'pointer',
                '& .MuiInputBase-root': {
                  cursor: disabled ? 'not-allowed' : 'pointer',
                },
                '& .MuiIconButton-root': {
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  pointerEvents: disabled ? 'none' : 'auto',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  '& .MuiInputBase-input': {
                    color: '#333333 !important',
                    WebkitTextFillColor: '#333333 !important',
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0',
                  },
                },
              },
            },
          }}
          value={dayjsValue}
          onChange={(d, _ctx) => {
            void (_ctx as PickerChangeHandlerContext<DateValidationError>);
            if (!d) return onChange(null);
            const iso = dayjs.isDayjs(d)
              ? (d as Dayjs).format('YYYY-MM-DD')
              : dayjs(d as Date).format('YYYY-MM-DD');
            onChange(iso);
          }}
          minDate={dayjsMin}
          maxDate={dayjsMax}
          format={format}
          disabled={disabled}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default LabeledDateUpdate;
