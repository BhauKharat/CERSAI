import React, { useState, useEffect } from 'react';
import './SignUp.css';
import './SignUpPage.css';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../../redux/store';
import { submitSignUp } from '../slice/signupSlice';
import { Country } from '../../../../utils/countryUtils';
import BackgroundElements from './BackgroundElements';
import HeaderLogo from './HeaderLogo';
import OTPVerificationModal from '../../../ui/Modal/OTPVerificationModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import SearchableAutocomplete from '../../../ui/Input/SearchableAutocomplete';
import ResumeRegistrationForm from './ResumeRegistrationForm';
import DynamicFormField from './DynamicFormField';
import { DynamicFormValues } from '../types/formTypes';
import { fetchSignupFormFields } from '../slice/signupFormSlice';
import {
  createDynamicValidationSchema,
  createInitialValues,
} from '../utils/dynamicValidation';
import { handleFormApiError } from '../../../../utils/HelperFunctions/formErrorHandler';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  FormControl,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';

// Single dynamic schema using Yup.when() so we don't need to swap schemas via effects

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// BackgroundElements and HeaderLogo moved to separate components

const SignUp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchParams] = useSearchParams();

  const { citizenships } = useSelector((state: RootState) => state.masters);
  const geographyHierarchy = useSelector(
    (state: RootState) => state.masters.geographyHierarchy
  );
  const signupForm = useSelector((state: RootState) => state.signupForm);

  // Get data from Redux store
  const formFields = signupForm.fields;
  const formConfiguration = signupForm.configuration;
  // const useDynamicForm = signupForm.useDynamicForm;

  useEffect(() => {
    // Fetch dynamic form fields using Redux
    dispatch(fetchSignupFormFields());
  }, [dispatch]);

  useEffect(() => {
    if (geographyHierarchy?.length) {
      const transformedCountries = geographyHierarchy.map(
        ({
          name,
          code,
          countryCode,
        }: {
          name: string;
          code: string;
          countryCode: string;
        }) => ({
          name,
          code,
          dial_code: countryCode,
        })
      );

      setCountries(transformedCountries);
    }
  }, [geographyHierarchy, dispatch]);

  // Initialize tab value from URL parameter, default to 0 (Sign Up tab)
  const initialTabValue = parseInt(searchParams.get('tab') || '0', 10);
  const [tabValue, setTabValue] = useState(initialTabValue);
  const [OTPIdentifier, setOTPIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  // const [isVerifying, setIsVerifying] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [emailOtpValidFlag, setEmailOtpValidFlag] = useState<boolean | null>(
    null
  );
  // Registration form state moved into ResumeRegistrationForm component
  const [isCkycVerified, setIsCkycVerified] = useState(false);
  // Flag to avoid clearing fields when CKYC autofill updates citizenship
  const isCkycAutofillRef = React.useRef(false);

  const staticInitialValues = {
    citizenship: '',
    ckycNo: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    countryCode: '',
    mobile: '',
  };

  const initialValues =
    formFields.length > 0
      ? {
          ...staticInitialValues,
          ...createInitialValues(formFields),
        }
      : staticInitialValues;

  const validationSchema = createDynamicValidationSchema(formFields);

  // Debug CKYC field specifically
  const ckycField = formFields.find(
    (field) =>
      field.fieldName.toLowerCase().includes('ckyc') ||
      field.fieldName.toLowerCase().includes('kyc')
  );
  const TITLE_GENDER_MAP: Record<string, string> = {
    mr: 'Male',
    'mr.': 'Male',
    ms: 'Female',
    'ms.': 'Female',
    mrs: 'Female',
    'mrs.': 'Female',
    mx: 'Transgender',
    'mx.': 'Transgender',
  };

  const formik = useFormik<DynamicFormValues>({
    initialValues,
    validationSchema,
    validateOnMount: false, // Changed to false to prevent initial validation
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log('Form submitted with values:', values);
      // setIsLoading(true);
      setSubmitError('');
      const normalizedTitle = String(values.title || '').toLowerCase();
      values.gender = TITLE_GENDER_MAP[normalizedTitle] || '';

      // 🔍 1) Email regex validation
      const email = String(values.email ?? '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const hasAtSymbol = (email.match(/@/g) || []).length === 1;

      if (email && (!emailRegex.test(email) || !hasAtSymbol)) {
        setSubmitError('Please enter a valid email address');
        //  setIsLoading(false);
        return;
      }

      //   Mobile number validation based on country code
      const mobile = String(values.mobile ?? '').trim();
      const countryCode = String(values.countryCode ?? '').toLowerCase();
      const isIndianCountryCode = ['+91', '91', 'india'].some((v) =>
        countryCode.includes(v)
      );

      if (mobile) {
        const digitsOnly = mobile.replace(/\D/g, '');
        const requiredLength = isIndianCountryCode ? 10 : 8;
        const maxLength = isIndianCountryCode ? 10 : 15;

        if (digitsOnly.length < requiredLength) {
          setSubmitError(
            `Mobile number must have at least ${requiredLength} digits${isIndianCountryCode ? '' : ' (8-15 digits for non-Indian numbers)'}`
          );
          return;
        }
        if (digitsOnly.length > maxLength) {
          setSubmitError(`Mobile number must not exceed ${maxLength} digits`);
          return;
        }
      }

      // Check CKYC verification for Indian citizenship
      if (values.citizenship === 'Indian' && !isCkycVerified) {
        // Check if CKYC number is provided (handle multiple possible field names)
        const ckycValue = values.ckycNo || values[ckycField?.fieldName || ''];
        if (ckycValue) {
          setSubmitError(
            'Please verify your CKYC number before submitting the form.'
          );
        } else {
          setSubmitError('Please enter and verify your CKYC number.');
        }
        // setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await dispatch(submitSignUp(values)).unwrap();

        // Handle successful response
        if (result?.data) {
          // Check if there's an OTP identifier in the response
          const otpIdentifier =
            result?.data?.identifier || result?.data?.otp_identifier;

          // Capture optional email OTP validity flag from API if present
          if (typeof result?.data?.emailOtpValid === 'boolean') {
            setEmailOtpValidFlag(result.data.emailOtpValid);
          } else {
            setEmailOtpValidFlag(null);
          }

          if (otpIdentifier) {
            setOTPIdentifier(otpIdentifier);
            setIsOtpModalOpen(true);
          } else if (
            result?.success === true ||
            result?.data?.userId ||
            result?.message?.toLowerCase().includes('success')
          ) {
            setIsSuccessModalOpen(true);
          } else {
            setIsSuccessModalOpen(true);
          }
        }
      } catch (error: unknown) {
        // Use the reusable form error handler
        const errorMessage = handleFormApiError(error, formik, formFields, [
          'mobile',
          'email',
          'ckycNo',
          'countryCode',
          'firstName',
          'middleName',
          'lastName',
          'title',
          'citizenship',
        ]);

        setSubmitError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // No effect needed; dynamic Yup schema reacts to values.citizenship automatically
  const getTrimmedValue = (fieldName: string) => {
    const value = (formik.values as Record<string, unknown>)[fieldName];

    return typeof value === 'string' ? value.trim() : '';
  };

  const areNameFieldsFilled = [
    'title',
    'firstName',
    'email',
    'countryCode',
    'mobile',
  ].every((field) => getTrimmedValue(field).length > 0);

  const ckycNumberValue = getTrimmedValue('ckycNo');

  const isIndianCitizen = formik.values.citizenship === 'Indian';
  const isCkycRequiredAndMissing =
    isIndianCitizen && ckycNumberValue.length === 0;

  const isSubmitDisabled =
    isLoading || !areNameFieldsFilled || isCkycRequiredAndMissing;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // CKYC Verify handled inside CkycNumberField

  const handleCloseOtpModal = () => {
    setIsOtpModalOpen(false);
  };

  const handleOtpSuccess = () => {
    setIsOtpModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  // Registration form handlers moved into ResumeRegistrationForm component

  // Auto-select country code based on selected citizenship (skip if CKYC verified to avoid overriding user edits)
  React.useEffect(() => {
    if (isCkycVerified) return;
    const { citizenship } = formik.values;
    let nextCode = '';
    if (citizenship === 'Indian') {
      nextCode = '+91';
    } else if (citizenship) {
      const match = countries.find((c) => c.name === citizenship);
      if (match) nextCode = match.dial_code;
    }
    if (formik.values.countryCode !== nextCode) {
      // skip validation on this programmatic sync
      formik.setFieldValue('countryCode', nextCode, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.citizenship, countries, isCkycVerified]);

  // Clear form fields when citizenship changes to prevent mixing data
  React.useEffect(() => {
    // If citizenship changed due to CKYC autofill, skip clearing once
    if (isCkycAutofillRef.current) {
      isCkycAutofillRef.current = false;
      return;
    }
    // Reset verification state on manual citizenship change
    setIsCkycVerified(false);

    // Clear core fields; skip countryCode here as another effect derives it from citizenship
    formik.setFieldValue('ckycNo', '', false);
    // Also clear the actual dynamic field name if different
    if (ckycField?.fieldName && ckycField.fieldName !== 'ckycNo') {
      formik.setFieldValue(ckycField.fieldName, '', false);
    }
    formik.setFieldValue('title', '', false);
    formik.setFieldValue('firstName', '', false);
    formik.setFieldValue('middleName', '', false);
    formik.setFieldValue('lastName', '', false);
    formik.setFieldValue('email', '', false);
    formik.setFieldValue('mobile', '', false);
    formik.setFieldValue('mobile', '', false); // Also clear dynamic form field name

    // Optionally clear touched/errors to hide previous validation messages
    formik.setTouched({}, false);
    formik.setErrors({});
    // Note: countryCode is handled in the previous effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.citizenship]);

  const handleClear = () => {
    formik.resetForm({
      values: {
        citizenship: '',
        ckycNo: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        countryCode: '',
        mobile: '',
      },
      touched: {},
      errors: {},
      isSubmitting: false,
      submitCount: 0,
    });
    // Force a validation cycle so isValid reflects cleared required fields
    formik.validateForm();
    // setIsModalOpen(false);
    // Reset CKYC verification state
    setIsCkycVerified(false);
    setSubmitError('');
  };

  // These variables are used in the fallback static form
  // const isIndianCitizen = formik.values.citizenship === 'Indian';
  // const isOtherCitizen =
  //   formik.values.citizenship && formik.values.citizenship !== 'Indian';

  // Narrow type used for CKYC autofill payload to avoid `any`
  type KycAutofill = {
    data: {
      title?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      emailAddress?: string;
      emailId?: string;
      mobile?: string;
      countryCode?: string;
      country_code?: string;
      citizenship?: string;
      mobileNo?: string;
    };
  };

  const handleCkycVerificationSuccess = (data?: unknown) => {
    setIsCkycVerified(true);
    // Attempt to autofill if API returned mapped fields
    const d: KycAutofill['data'] = (data as KycAutofill)?.data ?? {};
    console.log('CKYC Autofill Data:', d);
    if (d) {
      if (typeof d.title === 'string') formik.setFieldValue('title', d.title);
      if (typeof d.firstName === 'string')
        formik.setFieldValue('firstName', d.firstName);
      if (typeof d.middleName === 'string')
        formik.setFieldValue('middleName', d.middleName);
      if (typeof d.lastName === 'string')
        formik.setFieldValue('lastName', d.lastName);
      // Per requirement: do NOT autofill email or mobileNumber after CKYC verify
      if (typeof d.countryCode === 'string')
        formik.setFieldValue('countryCode', d.countryCode);
      if (typeof d.country_code === 'string')
        formik.setFieldValue('countryCode', d.country_code);
      if (typeof d.citizenship === 'string') {
        // Set skip flag only if CKYC actually changes citizenship value
        if (d.citizenship !== formik.values.citizenship) {
          isCkycAutofillRef.current = true;
        }
        formik.setFieldValue('citizenship', d.citizenship);
      }
      // Do not set mobileNo either

      // Trigger validation after autofill
      setTimeout(() => {
        formik.validateForm();
        console.log('Post-CKYC validation state:', {
          isValid: formik.isValid,
          errors: formik.errors,
          values: formik.values,
        });
      }, 100);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box className="signup-root">
        <BackgroundElements />

        <Container
          maxWidth="lg"
          sx={{ position: 'relative', zIndex: 2, pt: 5 }}
        >
          <Paper
            className="signup-paper"
            elevation={24}
            sx={{ borderRadius: '20px' }}
          >
            {/* Logo */}
            <HeaderLogo />

            {/* Tabs */}
            <Box className="signup-tabs signup-tabs-margin">
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Sign Up" />
                <Tab label="Registration" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {/* Form Title */}
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  color: '#333333',
                  fontWeight: 700,
                  fontFamily: '"Gilroy-Bold", sans-serif',
                  fontSize: '24px',
                  mb: 4,
                }}
              >
                Nodal Officer Details
              </Typography>
              {submitError && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      color: '#ff0707',
                      fontSize: '14px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                    }}
                  >
                    {submitError}
                  </Typography>
                </Box>
              )}

              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} className="signup-grid">
                  {formFields.length > 0 ? (
                    // Dynamic form rendering - 3 fields per row
                    <>
                      {console.log(
                        'Rendering dynamic form with fields:',
                        formFields
                      )}
                      {formFields.map((field) => (
                        <Grid key={field.id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <DynamicFormField
                            field={field}
                            formik={formik}
                            allFields={formFields}
                            onCkycVerificationSuccess={
                              handleCkycVerificationSuccess
                            }
                            isCkycVerified={isCkycVerified}
                            setIsCkycVerified={setIsCkycVerified}
                          />
                        </Grid>
                      ))}
                    </>
                  ) : signupForm.error ? (
                    // Show error message when API fails
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '200px',
                          textAlign: 'center',
                          p: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#ff0707',
                            fontSize: '16px',
                            fontFamily: '"Gilroy-Medium", sans-serif',
                            mb: 2,
                          }}
                        >
                          Failed to load form fields
                        </Typography>
                        <Typography
                          sx={{
                            color: '#666',
                            fontSize: '14px',
                            fontFamily: '"Gilroy-Regular", sans-serif',
                            mb: 3,
                          }}
                        >
                          {signupForm.error}
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => dispatch(fetchSignupFormFields())}
                          sx={{
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              borderColor: '#1565c0',
                              backgroundColor: '#f5f5f5',
                            },
                          }}
                        >
                          Retry
                        </Button>
                      </Box>
                    </Grid>
                  ) : (
                    // Fallback to static form
                    <>
                      {/* Row 1: Citizenship, CKYC Number, Title */}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box className="mb-1">
                          <Typography
                            component="label"
                            className="signup-label"
                          >
                            Citizenship
                            <Typography
                              component="span"
                              className="required-asterisk"
                            >
                              *
                            </Typography>
                          </Typography>
                        </Box>
                        <FormControl
                          fullWidth
                          error={
                            formik.touched.citizenship &&
                            Boolean(formik.errors.citizenship)
                          }
                          className="signup-field"
                        >
                          <SearchableAutocomplete
                            options={citizenships}
                            getOptionLabel={(option: {
                              code: string;
                              name: string;
                            }) => option?.name ?? ''}
                            isOptionEqualToValue={(opt, val) =>
                              opt.name === val.name
                            }
                            value={
                              citizenships.find(
                                (c: { code: string; name: string }) =>
                                  c.name ===
                                  (formik.values.citizenship as string)
                              ) || null
                            }
                            onChange={(newValue) => {
                              const name =
                                (
                                  newValue as {
                                    code: string;
                                    name: string;
                                  } | null
                                )?.name || '';
                              formik.setFieldValue('citizenship', name);
                            }}
                            onBlur={() =>
                              formik.setFieldTouched('citizenship', true)
                            }
                            placeholder="Select Citizenship"
                            error={
                              !!(
                                formik.touched.citizenship &&
                                Boolean(formik.errors.citizenship)
                              )
                            }
                            helperText={
                              formik.touched.citizenship
                                ? (formik.errors.citizenship as string)
                                : ''
                            }
                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}

                  {/* Note and Action Buttons - Common for both dynamic and static forms */}
                  <Box>
                    <Typography className="text">
                      Note:{' '}
                      <Typography component="span" className="light">
                        System will validate email and mobile through OTP.
                      </Typography>
                    </Typography>
                  </Box>
                  {/* Dynamic Action Buttons */}
                  <Grid size={{ xs: 12 }}>
                    <Box
                      className="signup-actions mt-4"
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Clear Button - Show based on API configuration */}
                      {/* {(!formConfiguration ||
                        formConfiguration.submissionSettings.clearButton) && ( */}
                      <Button
                        variant="outlined"
                        onClick={handleClear}
                        // disabled={formik.isValid}
                        // sx={{
                        //   borderColor: formik.isValid
                        //     ? 'rgba(128,128,128,0.55)'
                        //     : '#002CBA',
                        //   color: formik.isValid
                        //     ? 'rgba(128,128,128,0.75)'
                        //     : '#002CBA',
                        //   textTransform: 'none',
                        //   minWidth: { xs: '120px', sm: '138px' },
                        //   height: '48px',
                        //   fontSize: '16px',
                        //   fontFamily: '"Gilroy-Medium", sans-serif',
                        //   borderRadius: '4px',
                        //   flex: { xs: '1 1 auto', sm: '0 0 auto' },
                        //   maxWidth: { xs: '150px', sm: 'none' },
                        //   '&:hover': {
                        //     borderColor: formik.isValid
                        //       ? 'rgba(128,128,128,0.55)'
                        //       : '#002CBA',
                        //     backgroundColor: formik.isValid
                        //       ? 'transparent'
                        //       : 'rgba(0, 44, 186, 0.04)',
                        //   },
                        // }}
                        sx={{
                          borderColor: '#002CBA',
                          color: '#002CBA',
                          textTransform: 'none',
                          minWidth: { xs: '120px', sm: '138px' },
                          height: '48px',
                          fontSize: '16px',
                          fontFamily: '"Gilroy-Medium", sans-serif',
                          borderRadius: '4px',
                          flex: { xs: '1 1 auto', sm: '0 0 auto' },
                          maxWidth: { xs: '150px', sm: 'none' },
                          '&:hover': {
                            borderColor: '#002CBA',
                            backgroundColor: 'rgba(0, 44, 186, 0.04)',
                          },
                        }}
                      >
                        {formConfiguration?.submissionSettings
                          .clearButtonText || 'Clear'}
                      </Button>
                      {/* )} */}

                      {/* Submit Button - Show based on API configuration */}
                      {(!formConfiguration ||
                        formConfiguration.submissionSettings.submitButton) && (
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitDisabled}
                          onClick={() => {
                            console.log('Form validation state:', {
                              isValid: formik.isValid,
                              errors: formik.errors,
                              values: formik.values,
                              touched: formik.touched,
                            });
                          }}
                          sx={{
                            backgroundColor: isSubmitDisabled
                              ? 'rgba(128,128,128,0.55)'
                              : '#002CBA',
                            color: 'white',
                            textTransform: 'none',
                            minWidth: { xs: '150px', sm: '200px' },
                            height: '48px',
                            fontSize: '16px',
                            fontFamily: '"Gilroy-Medium", sans-serif',
                            borderRadius: '4px',
                            flex: { xs: '1 1 auto', sm: '0 0 auto' },
                            maxWidth: { xs: '200px', sm: 'none' },
                            '&:hover': {
                              backgroundColor: isSubmitDisabled
                                ? 'rgba(128,128,128,0.55)'
                                : '#001a8a',
                            },
                          }}
                        >
                          {isLoading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            formConfiguration?.submissionSettings
                              .submitButtonText || 'Validate'
                          )}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>
            {/* Resume Registration Page tab */}
            <TabPanel value={tabValue} index={1}>
              <ResumeRegistrationForm />
            </TabPanel>
          </Paper>
          {/* Footer */}
          {/* CKYC Verification Modal handled inside CkycNumberField */}

          {/* OTP Verification Modal */}
          <OTPVerificationModal
            open={isOtpModalOpen}
            data={OTPIdentifier}
            onClose={handleCloseOtpModal}
            onSuccess={handleOtpSuccess}
            maskedMobile={formik.values.mobile as string}
            maskedEmail={formik.values.email as string}
            maskedCountryCode={formik.values.countryCode as string}
            initialEmailOtpInvalid={emailOtpValidFlag === false}
            initialEmailOtpMessage={
              emailOtpValidFlag === false
                ? 'Email OTP could not be sent. Please verify mobile OTP.'
                : undefined
            }
          />

          {/* Success Modal */}
          <SuccessModal
            open={isSuccessModalOpen}
            onClose={handleCloseSuccessModal}
            title="Sign Up Completed Successfully"
            message="Please check your email for the link to set up your password and DSC."
            okText="Okay"
            onOk={() => {
              // Clear Sign Up form data when user acknowledges success
              handleClear();
              setTabValue(1);
              handleCloseSuccessModal();
            }}
          />

          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#24222B',
                opacity: 0.7,
                fontSize: '12px',
                fontFamily: '"Gilroy-Light", sans-serif',
              }}
            >
              © 2025 CKYCRR, All Rights Reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default SignUp;
