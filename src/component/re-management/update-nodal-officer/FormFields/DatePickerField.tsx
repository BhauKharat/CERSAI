/* eslint-disable prettier/prettier */
import { Controller, useFormContext } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type RHFDatePickerProps = {
  name: string;
  label: string;
  required?: boolean
  disabled?: boolean;

};

const DatePickerField = ({ name, label, required = false, disabled }: RHFDatePickerProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const value = watch(name)

  const dayjsValue = React.useMemo(() => {
    if (value === null || value === undefined) return null;
    if (dayjs.isDayjs(value)) return value;
    return dayjs(value);
  }, [value]);

  return (

    <React.Fragment>
      <label>{label}

        {required && <span style={{ color: 'red' }}>*</span>}
      </label>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Controller
          name={name}
          control={control}
          rules={{ required: `${label} is required!` }}
          render={({ field }) => (
            <DatePicker
              value={dayjsValue}
              onChange={(newValue) => field.onChange(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors[name],
                  helperText: errors[name]?.message as string,
                  disabled,
                },
              }}
            />
          )}
        />
      </LocalizationProvider>
    </React.Fragment>

  );
};

export default DatePickerField;
