/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  LabeledDate,
  LabeledDropDown,
  LabeledTextField,
  LabeledTextFieldWithUpload,
  UploadButton,
} from '../../../../component/features/RERegistration/CommonComponent';
import LabeledTextFieldWithVerify from '../../../../component/features/RERegistration/CommonComponent/LabeledTextFieldWithVerify';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
import {
  DropdownOption,
  FormField,
} from '../../../../component/features/RERegistration/types/formTypes';
import { Box } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
export const REACT_APP_CMS_URL = process.env.REACT_APP_API_BASE_URL;
const UpdateUserProfile = () => {
  const [userProfileFormFields, setUserProfileFormFields] = useState<
    FormField[]
  >([]);

  const getUserProfileFormFields = async () => {
    const response = await axios.get(
      `${REACT_APP_CMS_URL}/api/forms/RE_nodal/fields?is_group=true`
    );
    if (response.status === 200) {
      setUserProfileFormFields(response.data.data.fields);
    }
    console.log(response);
  };

  useEffect(() => {
    getUserProfileFormFields();
  }, []);

  const renderField = (field: FormField) => {
    switch (field.fieldType) {
      case 'textfield':
        return (
          <LabeledTextField
            key={field.id}
            label={field.fieldLabel}
            value={''}
            onChange={() => {}}
            placeholder={field.fieldPlaceholder || ''}
            required={field.validationRules?.required || false}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={
              field.validationRules?.maxLength
                ? parseInt(field.validationRules.maxLength)
                : undefined
            }
            error={undefined}
            helperText={''}
            type={field.fieldName.includes('website') ? 'url' : 'text'}
          />
        );

      case 'dropdown': {
        return (
          <LabeledDropDown
            key={`${field.id}`}
            label={field.fieldLabel}
            value={''}
            onChange={() => {}}
            options={[].map((option: DropdownOption, index: number) => {
              const optionWithExtras = option as DropdownOption &
                Record<string, unknown>;
              return {
                label:
                  option?.label ||
                  (optionWithExtras.name as string) ||
                  (optionWithExtras.text as string) ||
                  `Option ${index + 1}`,
                value:
                  option?.value ||
                  String(
                    optionWithExtras.id ||
                      optionWithExtras.code ||
                      `option_${index}`
                  ),
              };
            })}
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={field.validationRules?.required || false}
            error={undefined}
            helperText={undefined}
          />
        );
      }

      case 'date':
        return (
          <LabeledDate
            key={`${field.id}`}
            label={field.fieldLabel}
            value={''}
            onChange={() => {}}
            required={field.validationRules?.required || false}
            error={undefined}
            helperText={undefined}
          />
        );

      case 'textfield_with_image':
        return (
          <LabeledTextFieldWithUpload
            key={`${field.id}`}
            label={field.fieldLabel}
            value={''}
            onChange={() => {}}
            onUpload={() => {}}
            placeholder={field.fieldPlaceholder}
            required={field.validationRules?.required || false}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={
              field.validationRules?.maxLength
                ? parseInt(field.validationRules.maxLength)
                : undefined
            }
            error={undefined}
            helperText={undefined}
            accept={
              (
                field.validationRules?.validationFile?.imageFormat ||
                field.validationRules?.imageFormat
              )
                ?.map((format: any) => `.${format}`)
                .join(',') || '.jpg,.jpeg,.png'
            }
            validationRules={field.validationRules || undefined}
            onValidationError={() => {}}
          />
        );

      case 'textfield_with_verify':
        return (
          <LabeledTextFieldWithVerify
            key={`${field.id}`}
            label={field.fieldLabel}
            value={''}
            onChange={() => {}}
            placeholder={field.fieldPlaceholder}
            required={field.validationRules?.required || false}
            minLength={
              field.validationRules?.minLength
                ? parseInt(field.validationRules.minLength)
                : undefined
            }
            maxLength={
              field.validationRules?.maxLength
                ? parseInt(field.validationRules.maxLength)
                : undefined
            }
            error={undefined}
            helperText={undefined}
            externalVerifyUrl={
              field?.conditionalLogic?.[0]?.then?.fieldAttributes?.url
            }
            onOpenSendOtp={async () => {}}
            onSubmitOtp={async () => {}}
            onOtpVerified={() => {}}
            onVerify={async () => {}}
          />
        );

      case 'file':
        return (
          <div>
            <UploadButton
              key={`${field.id}`}
              label={field.fieldLabel}
              onUpload={() => {}}
              required={field.validationRules?.required || false}
              accept={
                (
                  field.validationRules?.validationFile?.imageFormat ||
                  field.validationRules?.imageFormat
                )
                  ?.map((format: any) => `.${format}`)
                  .join(',') || '.jpg,.jpeg,.png,.pdf'
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <ThreeColumnGrid>
        {userProfileFormFields.map((field: FormField) => (
          <FieldContainer key={field.id}>{renderField(field)}</FieldContainer>
        ))}
      </ThreeColumnGrid>
    </Box>
  );
};

export default UpdateUserProfile;
