/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';

import { styled } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { ChildFormRef } from '../components/NodalOfficerDetailsForm';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

import { validationSchemaInstitutionalAdmin, InstitutionalData, formSchemaInstitutionalAdmin } from '../../FormSchema/formSchema';
import DatePickerField from '../FormFields/DatePickerField';
import FileUploadField from '../FormFields/FileUploadField';
import InputField from '../FormFields/InputField';
import { SelectField } from '../FormFields/SelectField';
import { AdminOneDetails, DocumentFile } from '../slice/nodalOfficerPreviewSlice';

const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  padding:'10px 30px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
  }
}));

export interface InstitutionalAdminFormProps {
  initialValues: AdminOneDetails | undefined
  iau: string
}

const InstitutionalAdminForm = forwardRef<ChildFormRef, InstitutionalAdminFormProps>(({ initialValues, iau }, ref) => {


  const methods = useForm({
    resolver: yupResolver(validationSchemaInstitutionalAdmin),
    defaultValues: {},
    mode: 'onBlur',
    reValidateMode:'onChange'
  });

  const data = useSelector((state: RootState) => state.nodalOfficerPreview.data)


  

  useEffect(() => {
    if (initialValues) {

      const documents = data?.data.documents
      let authorization: DocumentFile | undefined
      let poi: DocumentFile | undefined
      let photoIdentity: DocumentFile | undefined
      if (documents?.length) {
        authorization = documents.find((item) => item.documentType === `IAU_${iau}_AUTHORIZATION_LETTER`)
        poi = documents.find((item) => item.documentType === `IAU_${iau}_CERTIFIED_POI`)
        photoIdentity = documents.find((item) => item.documentType === `IAU_${iau}_CERTIFIED_PHOTO_IDENTITY`)
      }


      methods.reset(
        {
          citizenship: initialValues?.citizenship,
          ckycNumber: initialValues?.ckycNumber,
          countryCode: initialValues?.countryCode,
          dateOfBirth: dayjs(initialValues?.dateOfBirth, 'YYYY-MM-DD').toDate() || null,
          designation: initialValues?.designation,
          email: initialValues?.emailId,
          employeeCode: initialValues?.employeeCode,
          firstName: initialValues?.firstName,
          gender: initialValues?.gender,
          landlineNumber: initialValues?.landline,
          middleName: initialValues?.middleName,
          mobileNumber: initialValues?.mobileNo,
          officeAddress: initialValues?.sameAsRegisteredAddress ? 'registered' : 'correspondence',
          proofOfIdentity: initialValues?.proofOfIdentity,
          proofOfIdentityNumber: initialValues?.identityNumber,
          title: initialValues?.title,
          lastName: initialValues?.lastName,
          authorization_date: dayjs(initialValues?.dateOfAuthorization, 'YYYY-MM-DD').toDate() || null,
          authorisation_letter_file: authorization ? authorization.base64Content : '',
          proof_of_identity_file: poi ? poi.base64Content : '',
          proof_of_identity_card_file: photoIdentity ? photoIdentity.base64Content : ''
        },
      )
    }
  }, [initialValues, methods, iau, data]);





  const handleFormSubmit = (value: InstitutionalData) => {
    const { authorisation_letter_file, proof_of_identity_card_file, proof_of_identity_file, ...rest } = value


    const formattedData = {
      ...rest,
      dateOfBirth: dayjs(rest.dateOfBirth).format('YYYY-MM-DD').toString(),
      boardResolutionDate: dayjs(rest.authorization_date).format('YYYY-MM-DD').toString(),
      authorisation_letter: rest.authorisation_letter ? rest.authorisation_letter : null,
      proof_of_identity: rest.proof_of_identity,
      proof_of_identity_card: rest.proof_of_identity_card,
      authorization_date: dayjs(rest.authorization_date).format('YYYY-MM-DD').toString()
    };

    return formattedData
  };

  const onFormError = (errors: FieldErrors) => {
    console.log('Form validation errors:', errors);
  }


  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      const isValid = await methods.trigger();
      if (isValid) {
        const iaus = [handleFormSubmit(methods.getValues() as unknown as InstitutionalData)];
        return { valid: true, data: iaus };
      } else {
        onFormError(methods.formState.errors);
         return { valid: false, data: null };
      }
     
    },
    resetForm: () => {
      const clearedValues: Record<string, unknown> = {};
      formSchemaInstitutionalAdmin.forEach((item) => {
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
          {formSchemaInstitutionalAdmin.map((item, index) => (
            <React.Fragment key={index}>
              {
                item.type === 'text' ? <div>
                  <InputField name={item.name} label={item.label} required={item.required} />
                </div> : item.type === 'select' ? <div><SelectField label={item.label} name={item.name} options={item.options!} required={item.required} /></div> : item.type === 'date' ? <div>
                  <DatePickerField label={item.label} name={item.name} disabled={false} required={item.required} />
                </div> : item.type === 'file' ? <div>
                  <FileUploadField name={item.name} label={item.label} required={item.required} initialFile={item.file_field!} />
                </div> : <></>
              }
            </React.Fragment>
          ))}
        </Form>
      </FormProvider>
    </React.Fragment>
  );
});

InstitutionalAdminForm.displayName = 'InstitutionalAdminForm';

export default InstitutionalAdminForm;


