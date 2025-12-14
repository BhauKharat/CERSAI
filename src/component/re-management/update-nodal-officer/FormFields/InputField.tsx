/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { styled } from '@mui/material';
import React, { useEffect } from 'react'
import { useFormContext, useWatch } from "react-hook-form";

type FormInputProps = {
    name: string;
    label: string;
    required?: boolean
};

const TextInput = styled("input")(({ theme }) => ({
    padding: "12px 14px",
    border: "1px solid #ccc",
    borderRadius: "4px !important",
    fontSize: "14px",
    lineHeight: 1.4,
    appearance: "none",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    minHeight: "48px",
    fontFamily: "inherit",
    width: "100%",

    "&:focus": {
        borderColor: theme.palette.primary.main,
        outline: "none",
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
    },

    "&:disabled": {
        backgroundColor: "#f5f5f5",
        cursor: "not-allowed",
    },
}));


const ErrorMessage = styled('span')(({ theme }) => ({
    fontSize: '13px',
    fontWeight: 500,
    color: 'red',


}))


const AADHAR_REGEX = /^[2-9]{1}[0-9]{11}$/;

const InputField: React.FC<FormInputProps> = ({ name, label, required = false }) => {
    const {
        register,
        control,
        setValue,
        setError,
        formState: { errors },
    } = useFormContext();

    const phone = useWatch({
        control,
        name: "mobileNumber"
    })

    const landlineNumber = useWatch({
        control,
        name: "landlineNumber"
    })

    const ckycNumber = useWatch({
        control,
        name: "ckycNumber"
    })

    const proofOfIdentity = useWatch({
        control,
        name:'proofOfIdentity'
    })

    const proofOfIdentityNumber = useWatch({
        control,
        name:'proofOfIdentityNumber'
    })

    useEffect(() => {
        if(proofOfIdentity === "AADHAAR") {
            const onlyNums = String(proofOfIdentityNumber).replace(/\D/g, "");
            const valid = AADHAR_REGEX.test(onlyNums);
            if(valid) {
                setValue('proofOfIdentityNumber', onlyNums)
            }else {
                setError('proofOfIdentityNumber', {
                    type: 'manual',
                    message: 'Please enter a valid AADHAAR number'
                })
            }

        }
    }, [proofOfIdentityNumber, proofOfIdentity, setValue, setError])

    

    useEffect(() => {
        const onlyNums = String(ckycNumber).replace(/\D/g, "");

        if (onlyNums !== ckycNumber) {
            setValue('ckycNumber', onlyNums)
        }
    }, [ckycNumber, setValue]);
    useEffect(() => {
        const onlyNums = String(phone).replace(/\D/g, "");

        if (onlyNums !== phone) {
            setValue('mobileNumber', onlyNums)
        }
    }, [phone, setValue]);

    useEffect(() => {

        let value = landlineNumber?.replace(/\D/g, "");
        if (value?.length > 3 && value?.length <= 6) {
            value = value.slice(0, 3) + "-" + value.slice(3);
        } else if (value?.length > 6) {
            value =
                value.slice(0, 3) +
                "-" +
                value.slice(3, 6) +
                "-" +
                value.slice(6, 10);
        }

        setValue('landlineNumber', value)



    }, [landlineNumber, setValue])



    return (
        <React.Fragment>
            <label>{label}

                {required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <TextInput
                type="text"
                {...register(name, {
                    onChange: (e) => {
                        if (name === 'mobileNumber') {
                            let value = e.target.value;
                            value = value.replace(/\D/g, "");
                            value = value.slice(0, 10);
                            e.target.value = value;
                        }

                        if (name === 'ckycNumber') {
                            let value = e.target.value;
                            value = value.replace(/\D/g, "");
                            value = value.slice(0, 14);
                            e.target.value = value;
                        }

                        if (name === 'landlineNumber') {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length > 3 && value.length <= 6) {
                                value = value.slice(0, 3) + "-" + value.slice(3);
                            } else if (value.length > 6) {
                                value =
                                    value.slice(0, 3) +
                                    "-" +
                                    value.slice(3, 6) +
                                    "-" +
                                    value.slice(6, 10);
                            }


                            e.target.value = value;
                        }


                        if(name === 'proofOfIdentityNumber' && proofOfIdentity === 'AADHAAR') {
                            let onlyNums = String(e.target.value).replace(/\D/g, "");
                            onlyNums = onlyNums.slice(0, 12);
                            e.target.value = onlyNums;
                        }

                        if (
                            name === "firstName" ||
                            name === "lastName" ) {
                            let value = e.target.value;
                            value = value.replace(/[^a-zA-Z\s]/g, "");
                            e.target.value = value;
                          }
                    }
                })}

            />

            {errors[name] && (
                <ErrorMessage>
                    {errors[name]?.message as string} *
                </ErrorMessage>
            )}
        </React.Fragment>
    )
}

export default InputField
