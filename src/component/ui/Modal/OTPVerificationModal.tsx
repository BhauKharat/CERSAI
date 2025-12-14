import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { validateOtpReq, clearOtpErrors } from './slice/otpModalSlice';
import { resendOtp } from '../../features/Authenticate/slice/authSlice';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
export interface OTPVerificationModalProps {
  open: boolean;
  data: string;
  onClose: () => void;
  onSuccess: () => void;
  // Optional display info
  maskedMobile?: string; // e.g. +91 ********98
  maskedEmail?: string; // e.g. jo********@mail.com
  maskedCountryCode?: string; // e.g. +91
  otpType?: 'both' | 'mobile' | 'email'; // Control which OTP fields to show
  // Optional: pre-seed error state based on server flags
  initialEmailOtpInvalid?: boolean;
  initialEmailOtpMessage?: string;
  reSendOtpObject?: RequestType;
  forceAdminEndpoint?: boolean;
}

interface RequestType {
  requestType: string;
  emailId: string;
  mobileNo: string;
  countryCode: string;
  workflowId: string;
  ckycNo: string | undefined;
  stepKey: string;
  name: string;
}

// Dynamic validation schema based on otpType
const getOtpValidationSchema = (
  otpType: 'both' | 'mobile' | 'email' = 'both'
) => {
  const schema: Record<string, Yup.StringSchema> = {};

  if (otpType === 'both' || otpType === 'mobile') {
    schema.mobileOtp = Yup.string()
      .required('Mobile OTP is required')
      .matches(/^[0-9]{6}$/, 'Mobile OTP must be exactly 6 digits');
  }

  if (otpType === 'both' || otpType === 'email') {
    schema.emailOtp = Yup.string()
      .required('Email OTP is required')
      .matches(/^[0-9]{6}$/, 'Email OTP must be exactly 6 digits');
  }

  return Yup.object(schema);
};

export default function OTPVerificationModal({
  open,
  data,
  onClose,
  onSuccess,
  otpType = 'both',
  maskedMobile = '',
  maskedEmail = '',
  maskedCountryCode = '',
  initialEmailOtpInvalid,
  initialEmailOtpMessage,
  reSendOtpObject,
  forceAdminEndpoint = false,
}: OTPVerificationModalProps) {
  // Helpers: masking
  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const shown = (local || '').slice(0, 3); // Show first 3 characters
    const starsLen = Math.max((local || '').length - shown.length, 0);
    const stars = '*'.repeat(starsLen); // Use single * instead of **
    return `${shown}${stars}@${domain}`;
  };

  // Handle OTP paste
  const handleOtpPaste = (
    type: 'mobile' | 'email',
    e: React.ClipboardEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();

    const pasteData = e.clipboardData.getData('text').trim();
    const digits = pasteData.replace(/\D/g, '');

    if (!digits) return;

    const otpArray =
      type === 'mobile' ? [...mobileOtpValues] : [...emailOtpValues];

    const refs = type === 'mobile' ? mobileRefs : emailRefs;

    for (let i = 0; i < digits.length && index + i < otpArray.length; i++) {
      otpArray[index + i] = digits[i];

      // Auto focus next
      refs[index + i + 1]?.current?.focus();
    }

    // update state
    if (type === 'mobile') {
      setMobileOtpValues(otpArray);
    } else {
      setEmailOtpValues(otpArray);
    }
  };

  const maskMobile = (mobile: string, countryCode?: string): string => {
    const code = (countryCode || '').trim();
    const digits = (mobile || '').replace(/\D+/g, '');

    if (!digits || digits.length < 2)
      return code ? `${code} ${mobile}` : mobile;

    // Show only country code and last 2 digits
    // e.g., +91 XX****78 (where XX represents masked digits)
    const last = digits.slice(-2);
    const first = digits.slice(0, 0);
    const maskedLen = Math.max(digits.length);
    // const masked =
    //   'X'.repeat(Math.min(2, maskedLen)) +
    //   '*'.repeat(Math.max(maskedLen - 2, 0));
    const masked = first + '*'.repeat(Math.max(maskedLen - 2, 0));
    const prefix = code ? `${code} ` : '';
    return `${prefix}${masked}${last}`;
  };

  const displayMaskedEmail = maskEmail(maskedEmail);
  const displayMaskedMobile = maskMobile(maskedMobile, maskedCountryCode);
  const [mobileOtpValues, setMobileOtpValues] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [emailOtpValues, setEmailOtpValues] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [mobileTimeLeft, setMobileTimeLeft] = useState(30);
  const [emailTimeLeft, setEmailTimeLeft] = useState(30);
  const [mobileResendAttempts, setMobileResendAttempts] = useState(0);
  const [emailResendAttempts, setEmailResendAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendErrorMobile, setResendErrorMobile] = useState<string>('');
  const [resendErrorEmail, setResendErrorEmail] = useState<string>('');

  // Get field-specific errors from Redux
  const { mobileOtpError, emailOtpError } = useSelector(
    (state: RootState) => state.otpModal
  );

  const mobileRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const emailRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const modalFormik = useFormik({
    initialValues: {
      mobileOtp: '',
      emailOtp: '',
    },
    validationSchema: getOtpValidationSchema(otpType),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      dispatch(clearOtpErrors());
      try {
        // Prepare payload based on otpType
        // If only one field is shown, send the entered OTP and 000000 for the other
        const payload = {
          identifier: data,
          mobileOtp:
            otpType === 'both' || otpType === 'mobile'
              ? values.mobileOtp
              : '000000',
          emailOtp:
            otpType === 'both' || otpType === 'email'
              ? values.emailOtp
              : '000000',
          forceAdminEndpoint: forceAdminEndpoint,
        };

        await dispatch(validateOtpReq(payload)).unwrap();

        // Call onSuccess and let parent component handle validation
        onSuccess();
      } catch (err) {
        // Error is already handled by Redux slice with field-specific errors
        let message = 'Something went wrong. Please try again.';
        if (typeof err === 'string') {
          message = err;
        } else if (err && typeof err === 'object') {
          const apiErr = err as {
            success?: boolean;
            message?: string;
          };
          if (typeof apiErr.message === 'string') {
            message = apiErr.message;
          }
        }
        setErrorMessage(message);
        setErrorOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    const otp = mobileOtpValues.join('');
    if (modalFormik.values.mobileOtp !== otp) {
      modalFormik.setFieldValue('mobileOtp', otp, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOtpValues]);

  React.useEffect(() => {
    const otp = emailOtpValues.join('');
    if (modalFormik.values.emailOtp !== otp) {
      modalFormik.setFieldValue('emailOtp', otp, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailOtpValues]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mobileTimeLeft > 0) {
      interval = setInterval(() => setMobileTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mobileTimeLeft]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailTimeLeft > 0) {
      interval = setInterval(() => setEmailTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimeLeft]);

  React.useEffect(() => {
    if (open) {
      setMobileTimeLeft(30);
      setEmailTimeLeft(30);
      setMobileResendAttempts(0);
      setEmailResendAttempts(0);
      setMobileOtpValues(['', '', '', '', '', '']);
      setEmailOtpValues(['', '', '', '', '', '']);
      setResendErrorMobile('');
      setResendErrorEmail('');

      // If server indicated email OTP is invalid/unavailable, surface immediately
      if (initialEmailOtpInvalid === true) {
        // setEmailOtpError(true);
        if (initialEmailOtpMessage) {
          setResendErrorEmail(initialEmailOtpMessage);
        }
      }
    }
    dispatch(clearOtpErrors());
  }, [open, initialEmailOtpInvalid, initialEmailOtpMessage, dispatch]);

  const handleOtpChange = (
    type: 'mobile' | 'email',
    index: number,
    value: string
  ) => {
    if (value.length > 1) return;
    if (!/^[0-9]*$/.test(value)) return;
    const setter = type === 'mobile' ? setMobileOtpValues : setEmailOtpValues;
    const valuesArr = type === 'mobile' ? mobileOtpValues : emailOtpValues;
    const refs = type === 'mobile' ? mobileRefs : emailRefs;

    const updated = [...valuesArr];
    updated[index] = value;
    setter(updated);

    // Clear Redux errors when user starts typing
    dispatch(clearOtpErrors());

    if (value && index < 5) refs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (
    type: 'mobile' | 'email',
    index: number,
    e: React.KeyboardEvent
  ) => {
    const valuesArr = type === 'mobile' ? mobileOtpValues : emailOtpValues;
    const refs = type === 'mobile' ? mobileRefs : emailRefs;
    if (e.key === 'Backspace' && !valuesArr[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleResend = async (type: 'mobile' | 'email') => {
    try {
      // Call resend API via authSlice
      const result = await dispatch(
        resendOtp({
          identifier: data,
          type: type,
          extraFeilds: reSendOtpObject,
        })
      ).unwrap();

      // If API returned a handled error shape (success=false), surface it and exit
      if (result && result.success === false) {
        const apiMsg: string =
          result?.errorMessage ||
          (Array.isArray(result?.errors)
            ? result.errors
                .map((e: { errorMessage?: string }) => e?.errorMessage)
                .filter(Boolean)
                .join(' ')
            : '') ||
          'Failed to resend OTP';
        setErrorMessage(apiMsg);
        setErrorOpen(true);
        if (type === 'mobile') setResendErrorMobile(apiMsg);
        else setResendErrorEmail(apiMsg);
        return;
      }

      if (type === 'mobile') {
        // Reset inputs/errors
        setMobileOtpValues(['', '', '', '', '', '']);
        mobileRefs[0].current?.focus();
        setResendErrorMobile('');
        dispatch(clearOtpErrors());

        // Escalating cooldowns per resend
        const next = mobileResendAttempts + 1;
        setMobileResendAttempts(next);
        if (next === 1) setMobileTimeLeft(30);
        else if (next === 2) setMobileTimeLeft(60);
        else setMobileTimeLeft(90);
      } else {
        setEmailOtpValues(['', '', '', '', '', '']);
        emailRefs[0].current?.focus();
        setResendErrorEmail('');
        dispatch(clearOtpErrors());

        const next = emailResendAttempts + 1;
        setEmailResendAttempts(next);
        if (next === 1) setEmailTimeLeft(30);
        else if (next === 2) setEmailTimeLeft(60);
        else setEmailTimeLeft(90);
      }
    } catch (err) {
      // Show error via snackbar
      let message = 'Failed to resend OTP';
      if (typeof err === 'string') message = err;
      else if (err && typeof err === 'object') {
        const e = err as { errorMessage?: string; message?: string };
        message = e.errorMessage || e.message || message;
      }
      setErrorMessage(message);
      setErrorOpen(true);
      if (type === 'mobile') setResendErrorMobile(message);
      else setResendErrorEmail(message);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}sec`;
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => {}}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(45, 43, 39, 0.3)',
            backdropFilter: 'blur(20px)',
          },
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          component="form"
          onSubmit={modalFormik.handleSubmit}
          sx={{
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow:
              '0px 263px 74px 0px rgba(0,0,0,0), 0px 169px 67px 0px rgba(0,0,0,0.01), 0px 95px 57px 0px rgba(0,0,0,0.03), 0px 42px 42px 0px rgba(0,0,0,0.05), 0px 11px 23px 0px rgba(0,0,0,0.06)',
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: { xs: '90vw', sm: '480px', md: '480px' },
            width: '100%',
            maxHeight: { xs: '95vh', sm: '85vh', md: '90vh' },
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: '"Gilroy-SemiBold", sans-serif',
                color: '#000',
                flex: 1,
              }}
            >
              {otpType === 'mobile'
                ? 'Mobile OTP Verification'
                : otpType === 'email'
                  ? 'Email OTP Verification'
                  : 'OTP Verification'}
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                ml: 2,
                color: '#000',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16.0672 15.1828C16.1253 15.2409 16.1713 15.3098 16.2027 15.3857C16.2342 15.4616 16.2503 15.5429 16.2503 15.625C16.2503 15.7071 16.2342 15.7884 16.2027 15.8643C16.1713 15.9402 16.1253 16.0091 16.0672 16.0672C16.0091 16.1253 15.9402 16.1713 15.8643 16.2027C15.7884 16.2342 15.7071 16.2503 15.625 16.2503C15.5429 16.2503 15.4616 16.2342 15.3857 16.2027C15.3098 16.1713 15.2409 16.1253 15.1828 16.0672L10 10.8836L4.81719 16.0672C4.69991 16.1845 4.54085 16.2503 4.375 16.2503C4.20915 16.2503 4.05009 16.1845 3.93281 16.0672C3.81554 15.9499 3.74965 15.7909 3.74965 15.625C3.74965 15.4591 3.81554 15.3001 3.93281 15.1828L9.11641 10L3.93281 4.81719C3.81554 4.69991 3.74965 4.54085 3.74965 4.375C3.74965 4.20915 3.81554 4.05009 3.93281 3.93281C4.05009 3.81554 4.20915 3.74965 4.375 3.74965C4.54085 3.74965 4.69991 3.81554 4.81719 3.93281L10 9.11641L15.1828 3.93281C15.3001 3.81554 15.4591 3.74965 15.625 3.74965C15.7909 3.74965 15.9499 3.81554 16.0672 3.93281C16.1845 4.05009 16.2503 4.20915 16.2503 4.375C16.2503 4.54085 16.1845 4.69991 16.0672 4.81719L10.8836 10L16.0672 15.1828Z"
                  fill="currentColor"
                />
              </svg>
            </IconButton>
          </Box>

          {/* Mobile OTP */}
          {(otpType === 'both' || otpType === 'mobile') && (
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography
                  component="label"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: '"Gilroy-SemiBold", sans-serif',
                    color: '#000',
                  }}
                >
                  Mobile OTP{' '}
                  <Typography
                    component="span"
                    sx={{ color: '#ff0707', ml: 0.5 }}
                  >
                    *
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      color: '#000',
                    }}
                  >
                    {formatTime(mobileTimeLeft)}
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => handleResend('mobile')}
                    disabled={mobileTimeLeft > 0}
                    sx={{
                      display: mobileTimeLeft > 0 ? 'none' : undefined,
                      fontSize: '12px',
                      fontWeight: 600,
                      fontFamily: '"Gilroy-SemiBold", sans-serif',
                      color: '#002CBA',
                      textTransform: 'none',
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                      '&.Mui-disabled': { color: '#999' },
                    }}
                  >
                    Resend OTP
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(3, 1fr)', // 3 columns on mobile
                    sm: 'repeat(6, 1fr)', // 6 columns on tablet and up
                  },
                  justifyItems: 'center',
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  maxWidth: { xs: '240px', sm: '480px' },
                  mx: 'auto',
                }}
              >
                {mobileOtpValues.map((value, index) => (
                  <TextField
                    key={index}
                    inputRef={mobileRefs[index]}
                    value={value}
                    onChange={(e) =>
                      handleOtpChange('mobile', index, e.target.value)
                    }
                    onKeyDown={(e) => handleOtpKeyDown('mobile', index, e)}
                    onPaste={(e) => handleOtpPaste('mobile', e, index)}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '16px',
                        fontFamily: '"Poppins", sans-serif',
                        padding:
                          window.innerWidth < 600 ? '12px 6px' : '16px 8px',
                      },
                    }}
                    sx={{
                      width: { xs: '50px', sm: '60px' },
                      height: { xs: '50px', sm: '60px' },
                      '& .MuiOutlinedInput-root': {
                        height: { xs: '50px', sm: '60px' },
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: mobileOtpError ? '#ff0707' : '#999999',
                        },
                        '&:hover fieldset': {
                          borderColor: mobileOtpError ? '#ff0707' : '#002CBA',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: mobileOtpError ? '#ff0707' : '#002CBA',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontFamily: '"Gilroy-Medium", sans-serif',
                    color: 'rgba(0,0,0,0.5)',
                  }}
                >
                  OTP Sent on {displayMaskedMobile}
                </Typography>
                {mobileOtpError && (
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      color: '#ff0707',
                    }}
                  >
                    {mobileOtpError}
                  </Typography>
                )}
                {resendErrorMobile && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: '13px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      color: '#ff0707',
                    }}
                  >
                    {resendErrorMobile}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Email OTP */}
          {(otpType === 'both' || otpType === 'email') && (
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography
                  component="label"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: '"Gilroy-SemiBold", sans-serif',
                    color: '#000',
                  }}
                >
                  Email OTP{' '}
                  <Typography
                    component="span"
                    sx={{ color: '#ff0707', ml: 0.5 }}
                  >
                    *
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      color: '#000',
                    }}
                  >
                    {formatTime(emailTimeLeft)}
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => handleResend('email')}
                    disabled={emailTimeLeft > 0}
                    sx={{
                      display: emailTimeLeft > 0 ? 'none' : undefined,
                      fontSize: '12px',
                      fontWeight: 600,
                      fontFamily: '"Gilroy-SemiBold", sans-serif',
                      color: '#002CBA',
                      textTransform: 'none',
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline',
                      },
                      '&.Mui-disabled': { color: '#999' },
                    }}
                  >
                    Resend OTP
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(3, 1fr)', // 3 columns on mobile
                    sm: 'repeat(6, 1fr)', // 6 columns on tablet and up
                  },
                  justifyItems: 'center',
                  mb: { xs: 1, sm: 1.5, md: 2 },
                  maxWidth: { xs: '240px', sm: '480px' },
                  mx: 'auto',
                }}
              >
                {emailOtpValues.map((value, index) => (
                  <TextField
                    key={index}
                    inputRef={emailRefs[index]}
                    value={value}
                    onChange={(e) =>
                      handleOtpChange('email', index, e.target.value)
                    }
                    onKeyDown={(e) => handleOtpKeyDown('email', index, e)}
                    onPaste={(e) => handleOtpPaste('email', e, index)}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '16px',
                        fontFamily: '"Poppins", sans-serif',
                        padding:
                          window.innerWidth < 600 ? '12px 6px' : '16px 8px',
                      },
                    }}
                    sx={{
                      width: { xs: '50px', sm: '60px' },
                      height: { xs: '50px', sm: '60px' },
                      '& .MuiOutlinedInput-root': {
                        height: { xs: '50px', sm: '60px' },
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: emailOtpError ? '#ff0707' : '#999999',
                        },
                        '&:hover fieldset': {
                          borderColor: emailOtpError ? '#ff0707' : '#002CBA',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: emailOtpError ? '#ff0707' : '#002CBA',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontFamily: '"Gilroy-Medium", sans-serif',
                    color: 'rgba(0,0,0,0.5)',
                  }}
                >
                  OTP Sent on {displayMaskedEmail}
                </Typography>
                {emailOtpError && (
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      color: '#ff0707',
                    }}
                  >
                    {emailOtpError}
                  </Typography>
                )}
                {resendErrorEmail && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: '13px',
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      color: '#ff0707',
                    }}
                  >
                    {resendErrorEmail}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting ||
                (otpType === 'both' &&
                  (mobileOtpValues.join('').length !== 6 ||
                    emailOtpValues.join('').length !== 6)) ||
                (otpType === 'mobile' &&
                  mobileOtpValues.join('').length !== 6) ||
                (otpType === 'email' && emailOtpValues.join('').length !== 6)
              }
              sx={{
                backgroundColor: '#002CBA',
                color: 'white',
                textTransform: 'none',
                minWidth: '200px',
                height: '48px',
                fontSize: '16px',
                fontFamily: '"Gilroy-Medium", sans-serif',
                borderRadius: '4px',
                '&:hover': { backgroundColor: '#001a8a' },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(128,128,128,0.55)',
                  color: 'white',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Submit'
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
