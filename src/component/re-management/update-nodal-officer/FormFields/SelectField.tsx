/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, useFormContext } from 'react-hook-form';
import {
    FormControl,
    MenuItem,
    Select,
    FormHelperText,
    styled,
} from '@mui/material';
import React from 'react';

type Option = {
    label: string;
    value: string | number;
};

type FormSelectProps = {
    name: string;
    label: string;
    options: Option[];
    required?: boolean;
};

const StyledSelect = styled(Select)(({ theme }) => ({
    height:'48px',
    "& .MuiSelect-select": {
        
        // paddingTop: theme.spacing(1),
        // paddingBottom: theme.spacing(1),
        minHeight: "auto",
        // height: "45px",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        fontFamily: "Gilroy, sans-serif",
        fontSize: "14px",
        fontWeight: 400,
        backgroundColor: "#fff",
        "&:focus": {
            backgroundColor: "#fff",
        },
    },
}));

export const SelectField = ({
    name,
    label,
    options,
    required,
}: FormSelectProps) => {
    const { control } = useFormContext();

    return (

        <React.Fragment>
           <label>{label}
            {required && <span style={{ color: 'red' }}>*</span>}
           </label>
            <FormControl fullWidth>

                <Controller
                    name={name}
                    control={control}
                    rules={{ required: required ? `${label} is required` : false }}
                    render={({ field, fieldState }) => (
                        <>
                            <StyledSelect
                                {...field}
                                labelId={`${name}-label`}
                                value={field.value || ''}
                                fullWidth
                            >
                                {options.map((option, index) => (
                                    <MenuItem key={index} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </StyledSelect>

                            {fieldState.error && (
                                <FormHelperText error>{fieldState.error.message}</FormHelperText>
                            )}
                        </>
                    )}
                />
            </FormControl>
        </React.Fragment>

    );
};
