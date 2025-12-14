import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { FormikProps } from 'formik';
import { FormField, FieldOption, DynamicFormValues } from '../types/formTypes';
import SearchableAutocomplete from '../../../ui/Input/SearchableAutocomplete';
import CkycNumberField from '../../../ui/Input/CkycNumberField';
// import { fetchExternalApiData } from '../../../services/formFieldsService';

interface DynamicFormFieldProps {
  field: FormField;
  formik: FormikProps<DynamicFormValues>;
  allFields: FormField[];
  onCkycVerificationSuccess?: (data: unknown) => void;
  isCkycVerified?: boolean;
  setIsCkycVerified?: (verified: boolean) => void;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  formik,
  allFields,
  onCkycVerificationSuccess,
  isCkycVerified = false,
  setIsCkycVerified,
}) => {
  const [externalOptions] = useState<FieldOption[]>([]);

  const {
    fieldName,
    fieldLabel,
    fieldType,
    fieldPlaceholder,
    fieldOptions = [],
    validationRules,
    conditionalLogic,
    // fieldAttributes,
  } = field;

  // useEffect(() => {
  //   if (fieldName === 'email') {
  //     const emailValue = formik.values.email as string;
  //     const currentError = formik.errors.email;
  //     const customErrorMessage = 'Invalid email format';

  //     if (emailValue) {
  //       const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  //       const isEmailValid = emailRegex.test(emailValue);

  //       if (!isEmailValid) {
  //         formik.setFieldError('email', customErrorMessage);
  //       } else if (currentError === customErrorMessage) {
  //         formik.setFieldError('email', undefined);
  //       }
  //     } else if (currentError === customErrorMessage) {
  //       formik.setFieldError('email', undefined);
  //     }
  //   }
  // }, [formik.values.email, fieldName, formik]);

  const setFieldValue = useCallback(
    (field: string, value: string) => {
      formik.setFieldValue(field, value);
    },
    [formik]
  );

  // Auto-select countryCode when citizenship changes
  useEffect(() => {
    if (fieldName === 'citizenship') {
      const citizenshipValue = formik.values.citizenship;
      const currentCountryCode = formik.values.countryCode;

      if (citizenshipValue) {
        // Find the countryCode field in allFields to get its options
        const countryCodeField = allFields.find(
          (f: FormField) => f.fieldName === 'countryCode'
        );
        if (countryCodeField && countryCodeField.fieldOptions) {
          // Find matching country by citizenship name
          const matchingCountry = countryCodeField.fieldOptions.find(
            (option: FieldOption) => option.name === citizenshipValue
          );

          if (
            matchingCountry &&
            matchingCountry.code &&
            currentCountryCode !== matchingCountry.code
          ) {
            // Auto-set the countryCode field only if it's different
            setFieldValue('countryCode', matchingCountry.code);
            console.log(
              `🚀 Auto-selected countryCode: ${matchingCountry.code} for citizenship: ${citizenshipValue}`
            );
          }
        }
      }
    }
    // eslint-disable-next-line
  }, [
    formik.values.citizenship,
    fieldName,
    allFields,
    // setFieldValue,
    // formik.values.countryCode,
  ]);

  // Check if field should be shown based on conditional logic
  const shouldShowField = () => {
    // Always show CKYC number and mobile number fields by default
    if (
      fieldName === 'ckycNumber' ||
      fieldName === 'ckycNo' ||
      fieldName === 'mobileNumber' ||
      fieldName === 'mobile'
    ) {
      return true;
    }

    if (!conditionalLogic || conditionalLogic.length === 0) return true;

    return conditionalLogic.some((logic) => {
      const { when } = logic;
      const fieldValue = formik.values[when.field];

      switch (when.operator) {
        case 'equals':
          return fieldValue === when.value;
        case 'in':
          return (
            Array.isArray(when.value) &&
            when.value.includes(fieldValue as string)
          );
        default:
          return true;
      }
    });
  };

  // Get current validation rules based on conditional logic
  const getCurrentValidationRules = () => {
    if (!conditionalLogic || conditionalLogic.length === 0)
      return validationRules;

    for (const logic of conditionalLogic) {
      const { when, then, else: elseRules } = logic;
      const fieldValue = formik.values[when.field];

      let conditionMet = false;
      switch (when.operator) {
        case 'equals':
          conditionMet = fieldValue === when.value;
          break;
        case 'in':
          conditionMet =
            Array.isArray(when.value) &&
            when.value.includes(fieldValue as string);
          break;
        default:
          conditionMet = true;
      }

      if (conditionMet && then?.validationRules) {
        return { ...validationRules, ...then.validationRules };
      } else if (!conditionMet && elseRules?.validationRules) {
        return { ...validationRules, ...elseRules.validationRules };
      }
    }

    return validationRules;
  };

  // Get current field attributes based on conditional logic
  //   const getCurrentFieldAttributes = () => {
  //     if (!conditionalLogic || conditionalLogic.length === 0)
  //       return fieldAttributes;

  //     for (const logic of conditionalLogic) {
  //       const { when, then, else: elseRules } = logic;
  //       const fieldValue = formik.values[when.field];

  //       let conditionMet = false;
  //       switch (when.operator) {
  //         case 'equals':
  //           conditionMet = fieldValue === when.value;
  //           break;
  //         case 'in':
  //           conditionMet =
  //             Array.isArray(when.value) &&
  //             when.value.includes(fieldValue as string);
  //           break;
  //         default:
  //           conditionMet = true;
  //       }

  //       if (conditionMet && then?.fieldAttributes) {
  //         return { ...fieldAttributes, ...then.fieldAttributes };
  //       } else if (!conditionMet && elseRules?.fieldAttributes) {
  //         return { ...fieldAttributes, ...elseRules.fieldAttributes };
  //       }
  //     }

  //     return fieldAttributes;
  //   };

  const currentValidationRules = getCurrentValidationRules();
  //   const currentFieldAttributes = getCurrentFieldAttributes();
  const isRequired = currentValidationRules?.required || false;

  // Monitor citizenship changes to prevent auto-verification
  //   useEffect(() => {
  //     if (fieldName === 'ckycNumber' || fieldName === 'ckycNo') {
  //       // Set prevention flag when citizenship changes
  //       setPreventAutoVerify(true);

  //       // Reset the flag after a short delay to allow manual verification
  //       const timer = setTimeout(() => {
  //         setPreventAutoVerify(false);
  //       }, 500);

  //       return () => clearTimeout(timer);
  //     }
  //   }, [formik.values.citizenship, fieldName]);

  // Fetch external API data if field has external API configuration
  //   useEffect(() => {
  //     const fetchExternalOptions = async () => {
  //       if (
  //         currentFieldAttributes?.type === 'external_api' &&
  //         currentFieldAttributes.url
  //       ) {
  //         try {
  //           const data = await fetchExternalApiData(
  //             currentFieldAttributes.url,
  //             currentFieldAttributes.method
  //           );

  //           if (data && Array.isArray(data)) {
  //             const mappedOptions = data.map((item: Record<string, unknown>) => ({
  //               code: String(
  //                 item[currentFieldAttributes.responseMapping?.value || 'code'] ||
  //                   item.code ||
  //                   ''
  //               ),
  //               name: String(
  //                 item[currentFieldAttributes.responseMapping?.label || 'name'] ||
  //                   item.name ||
  //                   ''
  //               ),
  //               isocode: item.isocode ? String(item.isocode) : undefined,
  //             }));
  //             setExternalOptions(mappedOptions);
  //           }
  //         } catch (error) {
  //           console.error('Error fetching external options:', error);
  //         }
  //       }
  //     };

  //     fetchExternalOptions();
  //   }, [currentFieldAttributes]);

  // Determine if field should be disabled
  const isFieldDisabled = () => {
    // Special logic for Indian citizenship fields
    const isIndianCitizen = formik.values.citizenship === 'Indian';

    // After CKYC verification, lock citizenship so user cannot change it
    if (fieldName === 'citizenship') {
      return isCkycVerified;
    }

    if (fieldName === 'ckycNumber' || fieldName === 'ckycNo') {
      return !isIndianCitizen;
    }

    if (['title', 'firstName', 'middleName', 'lastName'].includes(fieldName)) {
      return isIndianCitizen;
    }

    if (
      ['email', 'countryCode', 'mobileNumber', 'mobile'].includes(fieldName)
    ) {
      return isIndianCitizen && !isCkycVerified;
    }

    return false;
  };

  const fieldValue = formik.values[fieldName] || '';
  const fieldError = formik.touched[fieldName] && formik.errors[fieldName];
  const options = externalOptions.length > 0 ? externalOptions : fieldOptions;

  if (!shouldShowField()) {
    return null;
  }

  const renderLabel = () => (
    <Box className="mb-1">
      <Typography
        component="label"
        className={`signup-label ${isFieldDisabled() ? 'disabled' : ''}`}
      >
        {fieldLabel}
        {isRequired && (
          <Typography component="span" className="required-asterisk">
            *
          </Typography>
        )}
      </Typography>
    </Box>
  );

  const renderField = () => {
    switch (fieldType) {
      case 'dropdown':
        if (fieldName === 'citizenship' || fieldName === 'countryCode') {
          return (
            <FormControl
              fullWidth
              error={Boolean(fieldError)}
              className={`signup-field ${isFieldDisabled() ? 'signup-disabled' : ''}`}
            >
              <SearchableAutocomplete
                options={options}
                getOptionLabel={(option: FieldOption) => {
                  if (fieldName === 'countryCode') {
                    return `${option?.name ?? ''} (${option?.code ?? ''})`.trim();
                  }
                  return option?.name ?? '';
                }}
                isOptionEqualToValue={(opt, val) => {
                  if (fieldName === 'countryCode') {
                    return opt.code === val.code;
                  }
                  return opt.name === val.name;
                }}
                value={
                  options.find((option: FieldOption) => {
                    if (fieldName === 'countryCode') {
                      return option.code === fieldValue;
                    }
                    return option.name === fieldValue;
                  }) || null
                }
                onChange={(newValue) => {
                  const value =
                    fieldName === 'countryCode'
                      ? (newValue as FieldOption | null)?.code || ''
                      : (newValue as FieldOption | null)?.name || '';
                  formik.setFieldValue(fieldName, value);
                }}
                onBlur={() => formik.setFieldTouched(fieldName, true)}
                placeholder={fieldPlaceholder || `Select ${fieldLabel}`}
                error={Boolean(fieldError)}
                helperText={fieldError ? String(fieldError) : ''}
                disabled={isFieldDisabled()}
              />
            </FormControl>
          );
        } else {
          return (
            <FormControl
              fullWidth
              disabled={isFieldDisabled()}
              error={Boolean(fieldError)}
              className={`signup-field signup-select ${isFieldDisabled() ? 'signup-disabled' : ''}`}
            >
              <Select
                name={fieldName}
                value={fieldValue}
                onChange={formik.handleChange}
                displayEmpty
              >
                <MenuItem value="">
                  {fieldPlaceholder || `Select ${fieldLabel}`}
                </MenuItem>
                {options.map((option: FieldOption) => (
                  <MenuItem
                    key={option.code}
                    value={option.name || option.code}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldError && (
                <FormHelperText>{String(fieldError)}</FormHelperText>
              )}
            </FormControl>
          );
        }

      case 'textfield':
        if (fieldName === 'ckycNumber' || fieldName === 'ckycNo') {
          return (
            <CkycNumberField
              name={fieldName}
              value={fieldValue as string}
              onChange={(e) => {
                formik.handleChange(e);
                // Reset verification status when CKYC number changes
                if (isCkycVerified && setIsCkycVerified) {
                  setIsCkycVerified(false);
                }
              }}
              isVerified={isCkycVerified}
              showVerifyAction={Boolean(
                formik.values.citizenship === 'Indian' && !isFieldDisabled()
              )}
              onVerificationSuccess={onCkycVerificationSuccess}
              verifyDisabled={(fieldValue as string).length !== 14}
              disabled={isFieldDisabled()}
              className={`signup-field ${isFieldDisabled() ? 'signup-disabled' : ''}`}
              error={Boolean(fieldError)}
              helperText={fieldError ? String(fieldError) : undefined}
              placeholder={fieldPlaceholder || `Enter ${fieldLabel}`}
            />
          );
        } else if (fieldName === 'mobileNumber' || fieldName === 'mobile') {
          const isIndianCitizen = formik.values.countryCode === '+91';
          return (
            <TextField
              fullWidth
              name={fieldName}
              placeholder={fieldPlaceholder || `Enter ${fieldLabel}`}
              value={fieldValue}
              onChange={formik.handleChange}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                const digits = (target.value || '').replace(/\D/g, '');
                const maxLen = isIndianCitizen ? 10 : 15;
                target.value = digits.slice(0, maxLen);
              }}
              error={Boolean(fieldError)}
              disabled={isFieldDisabled()}
              InputProps={{
                readOnly: isFieldDisabled(),
              }}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              helperText={fieldError ? String(fieldError) : ''}
              className={`signup-field ${isFieldDisabled() ? 'signup-disabled' : ''}`}
            />
          );
        } else {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (fieldName === 'email' && !formik.touched.email) {
              formik.setFieldTouched('email', true, false);
            }
            formik.handleChange(e);
          };

          return (
            <TextField
              fullWidth
              name={fieldName}
              placeholder={fieldPlaceholder || `Enter ${fieldLabel}`}
              value={fieldValue}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              disabled={isFieldDisabled()}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                const inputValue = target.value || '';
                target.value = inputValue;
              }}
              error={Boolean(fieldError)}
              helperText={fieldError ? String(fieldError) : ''}
              className={`signup-field ${isFieldDisabled() ? 'signup-disabled' : ''}`}
              inputProps={{
                maxLength: currentValidationRules?.maxLength
                  ? parseInt(currentValidationRules.maxLength)
                  : undefined,
              }}
            />
          );
        }

      default:
        return null;
    }
  };

  return (
    <>
      {renderLabel()}
      {renderField()}
    </>
  );
};

export default DynamicFormField;
