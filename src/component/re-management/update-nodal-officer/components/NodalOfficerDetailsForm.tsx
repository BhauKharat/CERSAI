/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { styled, } from '@mui/material';
import { yupResolver } from "@hookform/resolvers/yup";

import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import { validationSchema, NodalFormData, formSchema } from '../../FormSchema/formSchema';
import DatePickerField from '../FormFields/DatePickerField';
import FileUploadField from '../FormFields/FileUploadField';
import InputField from '../FormFields/InputField';
import { SelectField } from '../FormFields/SelectField';
import { DocumentFile } from '../slice/nodalOfficerPreviewSlice';




export interface ChildFormRef {
    submitForm: () => Promise<{ valid: boolean; data: unknown }>;
    resetForm: () => void;
}

const Form = styled('form')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    padding:'10px 30px',
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(1, 1fr)',
    }
}));


const NodalOfficerDetailsForm = forwardRef<ChildFormRef>((_, ref) => {


    const data = useSelector((state: RootState) => state.nodalOfficerPreview.data)
    const methods = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {},
        mode: 'onBlur',
        reValidateMode:'onChange'

    });




    useEffect(() => {
        if (data) {

            const nodalOfficerDetails = data?.data?.nodalOfficerDetails

            const documents = data.data.documents;

            let noBoard: DocumentFile | undefined
            let certifiedPOI: DocumentFile | undefined
            let certifiedPhoto: DocumentFile | undefined

            if (documents.length) {
                noBoard = documents.find((item) => item.documentType === 'NO_BOARD_RESOLUTION')
                certifiedPOI = documents.find((item) => item.documentType === 'NO_CERTIFIED_POI')
                certifiedPhoto = documents.find((item) => item.documentType === 'NO_CERTIFIED_PHOTO_IDENTITY')

            }


            if (nodalOfficerDetails) {
                methods.reset({
                    boardResolutionDate: dayjs(nodalOfficerDetails.dateOfBoardResolution, 'YYYY-MM-DD').toDate() || null,
                    citizenship: nodalOfficerDetails.citizenship,
                    ckycNumber: nodalOfficerDetails.ckycNo,
                    countryCode: nodalOfficerDetails.countryCode,
                    designation: nodalOfficerDetails.designation,
                    gender: nodalOfficerDetails.gender,
                    dateOfBirth: dayjs(nodalOfficerDetails.dateOfBirth, 'YYYY-MM-DD').toDate() || null,
                    email: nodalOfficerDetails.email,
                    employeeCode: '',
                    firstName: nodalOfficerDetails.firstName,
                    lastName: nodalOfficerDetails.lastName,
                    middleName: nodalOfficerDetails.middleName,
                    landlineNumber: nodalOfficerDetails.landline,
                    mobileNumber: nodalOfficerDetails.mobileNumber,
                    officeAddress: nodalOfficerDetails.sameAsRegisteredAddress ? 'registred' : 'correspondence',
                    proofOfIdentity: nodalOfficerDetails.proofOfIdentity,
                    proofOfIdentityNumber: nodalOfficerDetails.identityNumber,
                    title: nodalOfficerDetails.title,
                    board_resolution_file: noBoard ? noBoard.base64Content : '',
                    certified_copy_file: certifiedPOI ? certifiedPOI.base64Content : '',
                    photo_id_card_file: certifiedPhoto ? certifiedPhoto.base64Content : ''
                })
            }

        }
    }, [data, methods])

    const handleFormSubmit = (values: NodalFormData) => {

        const formattedData = {
            ...values,
            dateOfBirth: dayjs(values.dateOfBirth).format('YYYY-MM-DD').toString(),
            boardResolutionDate: dayjs(values.boardResolutionDate).format('YYYY-MM-DD').toString(),
            board_resolution: values.board_resolution,
            certified_copy: values.certified_copy,
            photo_id_card: values.photo_id_card
        }

        return formattedData
    }

    const onFormError = (errors: any) => {
        console.log('Form validation errors:', errors);
    }


    useImperativeHandle(ref, () => ({
        submitForm: async () => {
            const isValid = await methods.trigger();
            if (isValid) {
                const formData = handleFormSubmit(methods.getValues());
                return { valid: true, data: formData };
            } else {
                onFormError(methods.formState.errors);
                return { valid: false, data: null};
            }
        },
        resetForm: () => {
            const clearedValues: Record<string, unknown> = {};
            formSchema.forEach((item) => {
                if (item.type === 'date') {
                    clearedValues[item.name] = null;
                } else if (item.type === 'file') {
                    clearedValues[item.name] = null;
                    if (item.file_field) {
                        clearedValues[item.file_field] = '';
                    }
                } else {
                    clearedValues[item.name] = '';
                }
            });
            methods.reset(clearedValues, { keepErrors: false, keepDirty: false, keepTouched: false });
        }
    }));


    return (
        <React.Fragment>
            <FormProvider {...methods}>
                <Form onSubmit={methods.handleSubmit(handleFormSubmit)}>
                    {
                        formSchema.map((item, index) => (
                            <React.Fragment key={index}>
                                {
                                    item.type === 'text' ? <div>
                                        <InputField name={item.name} label={item.label} required={item.required} />
                                    </div> : item.type === 'select' ? <div><SelectField label={item.label} name={item.name} options={item.options!} required={item.required} /></div> : item.type === 'date' ? <div>
                                        <DatePickerField label={item.label} name={item.name} disabled={false} />
                                    </div> : item.type === 'file' ? <div>
                                        <FileUploadField name={item.name} label={item.label} required={item.required} initialFile={item.file_field!} />
                                    </div> : <></>
                                }
                            </React.Fragment>
                        ))
                    }
                </Form>


            </FormProvider>

        </React.Fragment>
    )
})

NodalOfficerDetailsForm.displayName = 'NodalOfficerDetailsForm';
export default NodalOfficerDetailsForm
