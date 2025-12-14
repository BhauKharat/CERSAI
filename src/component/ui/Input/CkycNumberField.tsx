import {
  CircularProgress,
  InputAdornment,
  TextField,
  TextFieldProps,
} from '@mui/material';
import type { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from 'Constant';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../../redux/store';
import { post } from '../../../services/CKYCAdmin/api';
import {
  fetchCkycDetails,
  resendCkycDetails,
} from '../../features/Authenticate/slice/signupSlice';
import CKYCVerificationModal from '../Modal/CKYCVerificationModal';
import VerifiedIcon from './VerifiedIcon';
import { allowedGroupsCersai } from '../../../../src/enums/userRoles.enum';

export interface CkycNumberFieldProps extends Omit<TextFieldProps, 'onChange'> {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isVerified: boolean;
  showVerifyAction?: boolean; // controls whether to show the Verify button
  onVerificationSuccess?: (data?: unknown) => void;
  verifyButtonText?: string;
  verifyDisabled?: boolean;
}

/**
 * CKYC Number input with built-in Verify button and Verified badge.
 * - Pass `showVerifyAction` to show Verify button when not verified.
 * - Pass `isVerified` to show the green badge.
 */
const CkycNumberField: React.FC<CkycNumberFieldProps> = ({
  name,
  value,
  onChange,
  isVerified,
  showVerifyAction = false,
  onVerificationSuccess,
  verifyButtonText = 'Verify',
  verifyDisabled,
  fullWidth = true,
  placeholder = 'Enter CKYC Number',
  ...rest
}) => {
  const [openModal, setOpenModal] = React.useState(false);
  const [OTPIndetifier, setotpIdentifier] = React.useState('');
  const [apiErrorMessageForKYC, setApiErrorMessageForKYC] = React.useState('');
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { adminUserDetails } = useSelector((state: RootState) => state.auth);
  const [is400Error, setIs400Error] = React.useState(false);
  const isAdmin = React.useMemo(() => {
    return (
      // console.log('adminUserDetails?.data?.groups', adminUserDetails?.data?.groups),
      adminUserDetails?.data?.groups?.some((role) =>
        allowedGroupsCersai.includes(role)
      ) ?? false
    );
  }, [adminUserDetails]);
  // Track if the field has ever reached full 14 digits to decide when to show red error on regression
  const [hadFullLength, setHadFullLength] = React.useState(false);

  // Clear API error if the field is programmatically cleared by parent
  React.useEffect(() => {
    if (!value && apiErrorMessageForKYC) {
      setApiErrorMessageForKYC('');
    }
  }, [value, apiErrorMessageForKYC]);

  // Track milestone of reaching 14 digits; reset when cleared
  React.useEffect(() => {
    if (value.length === 14) {
      setHadFullLength(true);
    } else if (value.length === 0) {
      setHadFullLength(false);
    }
  }, [value]);
  // Local API hooks
  const sendCkycOtp = React.useCallback(async (): Promise<boolean> => {
    // try {
    //   console.log('Sending OTP for CKYC Number:', value);
    //   await post<unknown>('/ckyc/send-otp', { ckycNumber: value });
    // } catch (e) {
    //   // eslint-disable-next-line no-console
    //   console.error('Failed to send CKYC OTP', e);
    // }
    try {
      // reset any previous error
      setApiErrorMessageForKYC('');
      // Show loader before starting the async operation
      // dispatch(showLoader());

      const resultAction = await dispatch(fetchCkycDetails(value));
      console.log('Response : ', resultAction);
      // if (fetchCkycDetails.fulfilled.match(resultAction)) {
      if (resultAction?.payload?.success) {
        setotpIdentifier(resultAction?.payload?.data?.otp_identifier);
        return true;
      }

      // handle API error message (prefer validation error for CKYC Number if present)
      const payload = resultAction?.payload as
        | {
            success?: boolean;
            message?: string;
            type?: string;
            error?: {
              message?: string;
              errors?: Array<{
                errorCode?: string;
                message?: string;
                field?: string;
              }>;
            };
          }
        | undefined;

      let derivedMsg: string | undefined;
      if (
        resultAction?.payload?.error?.type === 'ERROR_FORM_VALIDATIONS' &&
        Array.isArray(payload?.error?.errors)
      ) {
        const fieldError = payload?.error?.errors.find(
          (e) => (e.field || '').toLowerCase() === 'ckyc number'
        );

        derivedMsg =
          fieldError?.message ||
          resultAction?.payload?.error?.errors[0]?.message;
      }

      setApiErrorMessageForKYC(
        derivedMsg ||
          payload?.error?.message ||
          payload?.message ||
          'Failed to send OTP. Please try again.'
      );
      return false;

      //   setCkycOTPModalOpen(true);
      // } else if (fetchCkycDetails.rejected.match(resultAction)) {
      //   setApiErrorMessageForKYC('Invalid CYC Number');
      // }
    } catch (error) {
      console.error('Unexpected error:', error);
      setApiErrorMessageForKYC('Something went wrong. Please try again.');
      return false;
    } finally {
      // Hide loader after the operation completes (success or failure)
      // dispatch(hideLoader());
    }
  }, [dispatch, value]);

  const resendCkycOtp = React.useCallback(async (): Promise<boolean> => {
    try {
      // reset any previous error
      setApiErrorMessageForKYC('');
      // Show loader before starting the async operation
      // dispatch(showLoader());

      const resultAction = await dispatch(
        resendCkycDetails({
          otpIdentifier: OTPIndetifier,
          type: 'email',
        })
      );
      console.log('Response : ', resultAction, OTPIndetifier);
      if (resultAction?.payload.error.status === 400) {
        setIs400Error(true);
        toast.error(resultAction?.payload.error.message);
      }
      // if (fetchCkycDetails.fulfilled.match(resultAction)) {
      // if (resultAction?.payload?.success) {
      //   setotpIdentifier(resultAction?.payload?.data?.otp_identifier);
      //   return true;
      // }

      // handle API error message (prefer validation error for CKYC Number if present)
      const payload = resultAction?.payload as
        | {
            success?: boolean;
            message?: string;
            type?: string;
            error?: {
              errors?: Array<{
                errorCode?: string;
                message?: string;
                field?: string;
              }>;
            };
          }
        | undefined;

      let derivedMsg: string | undefined;
      if (
        resultAction?.payload?.error?.type === 'ERROR_FORM_VALIDATIONS' &&
        Array.isArray(payload?.error?.errors)
      ) {
        const fieldError = payload?.error?.errors.find(
          (e) => (e.field || '').toLowerCase() === 'ckyc number'
        );

        derivedMsg =
          fieldError?.message ||
          resultAction?.payload?.error?.errors[0]?.message;
      }

      setApiErrorMessageForKYC(
        derivedMsg ||
          payload?.message ||
          'Failed to send OTP. Please try again.'
      );
      if (resultAction?.payload.error.status === 400) {
        return true;
      }
      return false;

      //   setCkycOTPModalOpen(true);
      // } else if (fetchCkycDetails.rejected.match(resultAction)) {
      //   setApiErrorMessageForKYC('Invalid CYC Number');
      // }
    } catch (error) {
      console.error('Unexpected error:', error);
      setApiErrorMessageForKYC('Something went wrong. Please try again.');
      return false;
    } finally {
      // Hide loader after the operation completes (success or failure)
      // dispatch(hideLoader());
    }
  }, [dispatch, OTPIndetifier]);

  const handleVerifyClick = React.useCallback(async () => {
    try {
      setIsSendingOtp(true);
      const ok = await sendCkycOtp();
      if (ok) setOpenModal(true);
    } finally {
      setIsSendingOtp(false);
    }
  }, [sendCkycOtp]);

  const submitCkycOtp = React.useCallback(
    async (otp: string): Promise<unknown> => {
      try {
        const url = isAdmin
          ? API_ENDPOINTS.CKYC_VERIFIED_ADMIN
          : API_ENDPOINTS.CKYC_VERIFIED;
        // console.log('Submitting CKYC OTP to URL:', url, isAdmin);
        const res = await post<unknown>(url, {
          identifier: OTPIndetifier,
          emailOtp: otp,
          mobileOtp: otp,
        });

        // Define a narrow response type to avoid `any`
        type CkycVerifyData = {
          valid?: boolean;
          emailOtpValid?: boolean;
          smsOtpValid?: boolean;
          otpIdentifier?: string;
          userRef?: string;
          notificationType?: string;
        };
        type CkycVerifyResponse = { success?: boolean; data?: CkycVerifyData };

        const resp = res as AxiosResponse<CkycVerifyResponse>;
        const payload = resp.data;
        const inner: CkycVerifyData = (payload && payload.data) || {};

        // If server indicates email OTP invalid (or overall invalid), return false so modal shows error
        if (inner.emailOtpValid === false || inner.valid === false) {
          return false as unknown as undefined;
        }

        return payload ?? true;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to verify CKYC OTP', e);
        return false as unknown as undefined;
      }
    },
    [OTPIndetifier, isAdmin]
  );
  const handleSanitizedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep only digits and clamp to 14 chars
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 14);
    if (digitsOnly !== e.target.value) {
      // mutate the event target value before forwarding to consumer (Formik's handleChange)
      (e.target as HTMLInputElement).value = digitsOnly;
    }
    // clear field-level API error when user edits value
    if (apiErrorMessageForKYC) setApiErrorMessageForKYC('');
    onChange(e);
  };

  const effectiveVerifyDisabled =
    (typeof verifyDisabled === 'boolean'
      ? verifyDisabled
      : value.length !== 14) || isSendingOtp;

  const showLengthRegressionError =
    hadFullLength && value.length > 0 && value.length < 14;

  // Helper text priority: API error > parent-provided helperText > length regression message
  const computedHelperText =
    apiErrorMessageForKYC ||
    (showLengthRegressionError
      ? 'CKYC Number must be exactly 14 digits'
      : rest.helperText !== undefined
        ? rest.helperText
        : undefined);

  return (
    <TextField
      {...rest}
      fullWidth={fullWidth}
      name={name}
      value={value}
      onChange={handleSanitizedChange}
      placeholder={placeholder}
      // Ensure internal API error is shown even if parent passes props
      error={
        Boolean(apiErrorMessageForKYC) ||
        Boolean(rest.error) ||
        showLengthRegressionError
      }
      helperText={computedHelperText}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 14 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isVerified && value && value.trim().length > 0 ? (
              <VerifiedIcon />
            ) : (
              showVerifyAction && (
                <>
                  <button
                    type="button"
                    onClick={handleVerifyClick}
                    disabled={effectiveVerifyDisabled}
                    style={{
                      backgroundColor: effectiveVerifyDisabled
                        ? 'rgba(128,128,128,0.55)'
                        : '#002CBA',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      height: 34,
                      minWidth: 73,
                      padding: '0 12px',
                      cursor: effectiveVerifyDisabled
                        ? 'not-allowed'
                        : 'pointer',
                      fontSize: 16,
                      fontFamily: '"Gilroy-Medium", sans-serif',
                      transition: 'background-color 0.2s ease-in-out',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {isSendingOtp ? (
                      <>
                        <CircularProgress size={16} color="inherit" />
                        Sending...
                      </>
                    ) : (
                      verifyButtonText
                    )}
                  </button>
                  <CKYCVerificationModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onVerificationSuccess={(data?: unknown) => {
                      onVerificationSuccess?.(data);
                      setOpenModal(false);
                    }}
                    // OTP was sent before opening modal; no need to send again on open
                    onOpenSendOtp={undefined}
                    onSubmitOtp={submitCkycOtp}
                    onResendOtp={async () => {
                      // Reuse same API for resend
                      const ok = await resendCkycOtp();
                      return ok;
                    }}
                    is400Error={is400Error}
                  />
                </>
              )
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default CkycNumberField;
