import React, { useState } from 'react';
import { Box, SxProps, Theme, FormLabel, FormHelperText } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  DateValidationError,
  PickerChangeHandlerContext,
} from '@mui/x-date-pickers/models';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface LabeledDateProps {
  label: string;
  value: string | null; // expected in 'YYYY-MM-DD' or ISO format
  onChange: (value: string | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean | string;
  disabled?: boolean;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  format?: string; // display format, defaults to 'DD/MM/YYYY'
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

const LabeledDate: React.FC<LabeledDateProps> = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  required,
  disabled = false,
  minDate,
  maxDate,
  format = 'DD/MM/YYYY',
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  disableFuture,
  disablePast,
}) => {
  const fieldId = React.useId();
  const helperTextId = helperText ? `${fieldId}-helper-text` : undefined;

  // Convert required to boolean if it's a string
  const isRequired =
    typeof required === 'string' ? required === 'true' : required;

  const [open, setOpen] = useState(false);

  const dayjsValue: Dayjs | null = value ? dayjs(value) : null;
  const parsedMin = minDate ? dayjs(minDate) : null;
  const parsedMax = maxDate ? dayjs(maxDate) : null;
  const dayjsMin: Dayjs | undefined =
    parsedMin && parsedMin.isValid() ? parsedMin : undefined;
  const dayjsMax: Dayjs | undefined =
    parsedMax && parsedMax.isValid() ? parsedMax : undefined;

  // Infer defaults without requiring props
  // Check if this is a DOB field - should disable future dates
  const isDOBField =
    typeof label === 'string' &&
    (/\b(dob|date of birth)\b/i.test(label) ||
      /birth.*date|date.*birth/i.test(label));

  // Check if this is a date field that should disable future dates
  const isDateField =
    typeof label === 'string' &&
    (isDOBField || // All DOB fields
      (/date/i.test(label) &&
        /board/i.test(label) &&
        /resolu/i.test(label) &&
        /appointment/i.test(label)) || // Matches Date of Board Resolution for Appointment
      /date of authorization/i.test(label)); // Matches Date of Authorization

  const inferredDisableFuture = disableFuture ?? isDateField;
  const inferredDisablePast = disablePast ?? false;

  // Compute effective bounds: respect explicit props if valid; otherwise apply inferred rules
  // For DOB fields, min date is 100 years ago (maximum age requirement)
  const effectiveMinDate: Dayjs | undefined =
    dayjsMin ?? (isDOBField ? dayjs().subtract(100, 'year') : undefined);
  // For DOB fields, max date is 18 years ago (minimum age requirement); for other date fields with disableFuture, max date is today
  const effectiveMaxDate: Dayjs | undefined =
    dayjsMax ??
    (inferredDisableFuture
      ? isDOBField
        ? dayjs().subtract(18, 'year')
        : dayjs()
      : undefined);

  // Choose a sensible calendar anchor when no value is selected
  // Priority: current value -> effectiveMaxDate (e.g., DOB cap) -> today
  const calendarAnchor: Dayjs = dayjsValue ?? effectiveMaxDate ?? dayjs();

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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          sx={{
            backgroundColor: disabled ? '#EEEEEE' : '',
            color: disabled ? '#999999' : '',
          }}
          slotProps={{
            textField: {
              id: fieldId,
              fullWidth: true,
              error,
              helperText,
              required: isRequired,
              disabled,
              'aria-label': ariaLabel || label,
              'aria-describedby': ariaDescribedBy || helperTextId,
              'aria-required': isRequired,
              'aria-invalid': error,
              onClick: () => setOpen(true),
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
          minDate={effectiveMinDate}
          maxDate={effectiveMaxDate}
          format={format}
          disableFuture={inferredDisableFuture}
          disablePast={inferredDisablePast}
          referenceDate={calendarAnchor}
        />
      </LocalizationProvider>
      {helperText && (
        <FormHelperText id={helperTextId} error={error}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default LabeledDate;
