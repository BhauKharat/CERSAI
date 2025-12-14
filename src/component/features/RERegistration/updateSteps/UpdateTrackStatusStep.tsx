/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  LabeledCheckbox,
  LabeledDate,
  LabeledDropDown,
  LabeledTextField,
  LabeledTextFieldWithUpload,
  UploadButton,
} from '../../../../component/features/RERegistration/CommonComponent';
import { SxProps, Theme } from '@mui/material';
import LabeledTextFieldWithVerify from '../../../../component/features/RERegistration/CommonComponent/LabeledTextFieldWithVerify';
import {
  FieldContainer,
  ThreeColumnGrid,
} from '../../../../component/features/RERegistration/DynamicForm.styles';
export const REACT_APP_CMS_URL = process.env.REACT_APP_API_BASE_URL;
import {
  //DropdownOption,
  FormField,
} from './types/formTypesUpdate';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import FormAccordion from 'component/features/RERegistration/CommonComponent/FormAccordion';
export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: FormField[];
  };
}
const trackTitle: SxProps<Theme> = {
  m: 2,
  color: '#1A1A1A',
  fontWeight: 600,
  fontFamily: 'Gilroy-Bold, sans-serif',
  fontSize: '24px',
  textAlign: 'center',
};
const titleStyles: SxProps<Theme> = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 500,
  fontFamily: 'Gilroy-SemiBold, sans-serif',
  marginLeft: '10px',
};
interface DropDownHoi {
  code: string;
  status: string;
  name: string;
}
const UpdateTrackStatusStep = () => {
  const [userProfileFormFields, setUserProfileFormFields] = useState<
    FormField[]
  >([]);
  const [groupedFields, setGroupedFields] = useState<GroupedFields>({});
  const getUserProfileFormFields = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_CMS_URL}/api/forms/RE_trackStatus/fields?is_group=true`
      );

      if (response.status === 200) {
        const data = response.data.data;

        if (data.configuration.formSettings.formGroup && data.groupedFields) {
          setGroupedFields(data.groupedFields);
        } else {
          setUserProfileFormFields(data.fields || []);
        }
      }
    } catch (error) {
      console.error('Error fetching form fields:', error);
    }
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
            // options={[].map((option: DropdownOption, index: number) => {
            //   const optionWithExtras = option as DropdownOption &
            //     Record<string, unknown>;
            //   return {
            //     label:
            //       option?.label ||
            //       (optionWithExtras.name as string) ||
            //       (optionWithExtras.text as string) ||
            //       `Option ${index + 1}`,
            //     value:
            //       option?.value ||
            //       String(
            //         optionWithExtras.id ||
            //           optionWithExtras.code ||
            //           `option_${index}`
            //       ),
            //   };
            // })}
            options={
              field.fieldOptions?.map((option: DropDownHoi, index: number) => ({
                label: option.name || `Option ${index + 1}`,
                value: option.code || `option_${index}`,
              })) || []
            }
            placeholder={field.fieldPlaceholder || `Select ${field.fieldLabel}`}
            required={field.validationRules?.required || false}
            error={undefined}
            helperText={undefined}
          />
        );
      }
      case 'checkbox':
        return (
          <LabeledCheckbox
            key={field.id}
            label={field.fieldLabel}
            checked={false}
            onChange={() => {}}
            required={field.validationRules?.required}
            disabled={false}
          />
        );
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
  const renderFieldGroup = (fields: FormField[]) => {
    const sortedFields = [...fields].sort(
      (a, b) => a.fieldOrder - b.fieldOrder
    );

    return (
      <ThreeColumnGrid>
        {sortedFields.map((field) => {
          if (field.fieldType === 'checkbox') {
            return (
              <FieldContainer
                key={field.id}
                style={{
                  gridColumn: '1 / -1',
                  width: '100%',
                  minHeight: '59px',
                }}
              >
                {renderField(field)}
              </FieldContainer>
            );
          }
          return (
            <FieldContainer key={field.id}>{renderField(field)}</FieldContainer>
          );
        })}
      </ThreeColumnGrid>
    );
  };

  const renderGroupedFields = () => {
    return Object.entries(groupedFields).map(([groupName, fields]) => {
      return (
        <FormAccordion
          key={groupName}
          title={fields?.label}
          groupKey={groupName}
          defaultExpanded={true}
        >
          {renderFieldGroup(fields.fields)}
        </FormAccordion>
      );
    });
  };
  return (
    <>
      <Box>
        <Typography sx={trackTitle}>Track Status</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper}>
          <Table style={{ fontFamily: 'Gilroy' }}>
            <TableHead
              style={{ backgroundColor: '#e6ebff', borderRadius: '4px' }}
            >
              <TableRow>
                <TableCell sx={titleStyles}>Sr. No</TableCell>
                <TableCell sx={titleStyles}>Submission Date</TableCell>
                <TableCell sx={titleStyles}>FI Code</TableCell>
                <TableCell sx={titleStyles}>RE Name</TableCell>
                <TableCell sx={titleStyles}>Status</TableCell>
                <TableCell sx={titleStyles}>Remark</TableCell>
                <TableCell sx={titleStyles}>Action</TableCell>
                {/* <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>01</TableCell>
                <TableCell>
                  {/* {submittedDate
                      ? dayjs(submittedDate).format('DD/MM/YY')
                      : 'N/A'} */}
                  25/04/25
                </TableCell>
                <TableCell>AAAAA79000</TableCell>
                <TableCell>ABC</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 5,
                        height: 10,
                        borderRadius: '50%',
                        // bgcolor: getStatusColor(doc.status),
                        //marginLeft: '-9px',
                        //mr: 1,
                      }}
                    />
                    <Typography
                      fontWeight={500}
                      // color={getStatusColor(workflowStatus || '')}
                      sx={{ textTransform: 'capitalize', color: '#FFB700' }}
                    >
                      Pending Approval [L1]
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>NA</TableCell>
                <TableCell
                  sx={{
                    color: 'text.disabled',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                  }}
                >
                  Edit
                </TableCell>
                {/* <TableCell align="center">
                    <IconButton>
                    <VisibilityOutlinedIcon  sx={{color:'#002CBA'}}/>
                    </IconButton>
                  </TableCell> */}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography sx={trackTitle}>Entity Profile Preview</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {Object.entries(groupedFields).length > 0 ? (
          <Box>{renderGroupedFields()}</Box>
        ) : (
          <ThreeColumnGrid>
            {userProfileFormFields.map((field: FormField) => (
              <FieldContainer key={field.id}>
                {renderField(field)}
              </FieldContainer>
            ))}
          </ThreeColumnGrid>
        )}
      </Box>
    </>
  );
};

export default UpdateTrackStatusStep;
