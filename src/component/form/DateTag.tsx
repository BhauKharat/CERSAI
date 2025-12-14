/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { labelStyles } from '../features/MyTask/UpdateEntityProfile-prevo/RegionCreationRequest.style';

interface DateTagProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  error?: string;
  disabled?: boolean;
}

const DateTag: React.FC<DateTagProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false); // <-- Popup control

  const handleDateChange = (
    value: unknown
    // context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    const newValue = value as Dayjs | null;
    const formatted = newValue ? newValue.format('YYYY-MM-DD') : '';

    onChange({
      target: {
        name,
        value: formatted,
      },
    } as React.ChangeEvent<any>);
  };

  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography variant="body2" sx={labelStyles}>
        {label} <span style={{ color: 'red' }}>*</span>
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          format="DD/MM/YYYY"
          value={value ? dayjs(value, 'YYYY-MM-DD') : null}
          onChange={handleDateChange}
          maxDate={dayjs()}
          disabled={disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              error: Boolean(error),
              helperText: error || '',
              placeholder: 'DD/MM/YYYY',
              name,
              onBlur,
              sx: {
                '& .MuiInputBase-root': {
                  height: '45px',
                },
                '& .MuiInputBase-input': {
                  padding: '0px 10px',
                  fontFamily: 'inherit',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: '#D9D9D9',
                  },
                },
              },
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setOpen(true)}
                      disabled={disabled}
                    >
                      <CalendarMonthIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateTag;
