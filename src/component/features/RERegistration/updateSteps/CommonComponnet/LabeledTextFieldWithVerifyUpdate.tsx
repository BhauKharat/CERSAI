/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  SxProps,
  Theme,
  FormLabel,
  Button,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  StyledTextField,
  FieldWithUploadContainer,
  FieldWithUploadAndPreview,
  TextFieldContainer,
} from './CommonComp.styles';
import CKYCVerificationModalUpdate from './CKYCVerificationModalUpdate';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { post } from '../../../../../services/CKYCAdmin/api';
import type { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from 'Constant';
import VerifiedIcon from '../../../../ui/Input/VerifiedIcon';

interface LabeledTextFieldWithVerifyUpdateProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Deprecated: retained for backward compatibility; will be invoked AFTER OTP success
  onVerify?: (value: string) => void;
  // OTP workflow hooks (optional)
  onOpenSendOtp?: () => Promise<boolean | void> | boolean | void;
  onSubmitOtp?: (otp: string) => Promise<unknown>;
  onResendOtp?: () => Promise<void>;
  // Callback to receive API response on successful OTP verification
  onOtpVerified?: (data?: unknown) => void;
  // Callback to notify parent when verification is required (value changed but not verified)
  onVerificationRequired?: (required: boolean) => void;
  // External verification (non-OTP) support owned by this component
  externalVerifyUrl?: string; // e.g., https://.../ckyc-verify/
  externalVerifyMethod?: string;
  externalVerifyHeaders?: Record<string, string>;
  externalVerifyUrlDataKey?: string; // e.g., 'ckycNo'
  externalVerifyPayloadTemplate?: Record<string, unknown>; // merged with {[urlDataKey]: value}
  // Additional control to disable verify button only (without disabling input field)
  verifyDisabled?: boolean;
  // Show as pre-verified (e.g., for existing data from backend)
  isPreVerified?: boolean;
  // Only show verify button after user changes the value (not just when value exists)
  showVerifyOnlyAfterChange?: boolean;
  verifyButtonText?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const LabeledTextFieldWithVerifyUpdate: React.FC<
  LabeledTextFieldWithVerifyUpdateProps
> = ({
  label,
  value,
  onChange,
  onVerify,
  onOpenSendOtp,
  onSubmitOtp,
  onResendOtp,
  onOtpVerified,
  onVerificationRequired,
  externalVerifyUrl,
  externalVerifyMethod = 'GET',
  externalVerifyHeaders,
  externalVerifyUrlDataKey,
  externalVerifyPayloadTemplate,
  verifyDisabled,
  isPreVerified = false,
  showVerifyOnlyAfterChange = false,
  verifyButtonText,
  placeholder,
  type = 'text',
  error = false,
  helperText,
  required = false,
  disabled = false,
  minLength,
  // maxLength,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const effectiveLabel = label || 'Enter details';
  const effectivePlaceholder = placeholder || effectiveLabel;
  const fieldId = React.useId();
  const helperTextId = helperText ? `${fieldId}-helper-text` : undefined;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );
  const [otpIdentifier, setOtpIdentifier] = React.useState<string>('');
  const [isVerified, setIsVerified] = React.useState<boolean>(false);
  const [verifiedValue, setVerifiedValue] = React.useState<string>('');
  const [initialValue, setInitialValue] = React.useState<string>(value);
  const [hasInitialValueBeenSet, setHasInitialValueBeenSet] =
    React.useState<boolean>(!!value);
  const [showAsPreVerified, setShowAsPreVerified] = React.useState<boolean>(
    isPreVerified && !!value
  );
  const [hasValueChanged, setHasValueChanged] = React.useState<boolean>(false);

  // Track value changes and reset verified state
  React.useEffect(() => {
    // If value becomes non-empty for the first time, set it as initial value
    if (!hasInitialValueBeenSet && value) {
      setInitialValue(value);
      setHasInitialValueBeenSet(true);
      // If isPreVerified is true and value exists, show as pre-verified
      if (isPreVerified) {
        setShowAsPreVerified(true);
      }
      return; // Early return to avoid processing other logic on initial set
    }

    // Track if value has been changed from initial
    if (showVerifyOnlyAfterChange && value !== initialValue) {
      setHasValueChanged(true);
      setShowAsPreVerified(false);
    }

    // If user changes the value from the initial pre-verified value, reset pre-verification
    if (isPreVerified && value !== initialValue && initialValue) {
      // Value changed from the initial pre-verified value
      setShowAsPreVerified(false);
    } else if (isPreVerified && value === initialValue && initialValue) {
      // Value matches the initial pre-verified value
      setShowAsPreVerified(true);
    } else if (!isPreVerified && showAsPreVerified) {
      // If parent says not pre-verified anymore, reset our state
      setShowAsPreVerified(false);
    }

    // If user changes the value after manual verification, reset verification
    if (isVerified && value !== verifiedValue) {
      setIsVerified(false);
    }
  }, [
    value,
    initialValue,
    isPreVerified,
    verifiedValue,
    isVerified,
    showVerifyOnlyAfterChange,
    hasInitialValueBeenSet,
    showAsPreVerified,
  ]);

  // Notify parent when verification is required
  React.useEffect(() => {
    if (onVerificationRequired) {
      // Verification is required if:
      // 1. Value exists
      // 2. Not disabled or verifyDisabled
      // 3. Value has changed from initial (if showVerifyOnlyAfterChange)
      // 4. Not currently verified
      const needsVerification =
        !!value &&
        !disabled &&
        !verifyDisabled &&
        (!showVerifyOnlyAfterChange || hasValueChanged) &&
        !isVerified &&
        !showAsPreVerified;

      onVerificationRequired(needsVerification);
    }
  }, [
    value,
    disabled,
    verifyDisabled,
    hasValueChanged,
    isVerified,
    showAsPreVerified,
    showVerifyOnlyAfterChange,
    onVerificationRequired,
  ]);

  const handleVerifyClick = () => {
    if (disabled || !value || verifyDisabled) return;
    // If caller supplied an OTP sender, use it before opening modal
    const run = async () => {
      // If component has all external props, it will own the API call.
      if (externalVerifyUrl) {
        try {
          setIsSendingOtp(true);
          setLocalError(undefined);
          const method =
            (externalVerifyMethod || 'GET').toUpperCase() === 'POST'
              ? 'POST'
              : 'GET';
          let url = externalVerifyUrl;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(externalVerifyHeaders || {}),
          };

          if (method === 'GET') {
            // API expects CKYC number in the path
            url = externalVerifyUrl.endsWith('/')
              ? `${externalVerifyUrl}${value}`
              : `${externalVerifyUrl}/${value}`;
            const resp = await Secured.get(url, { headers });

            const raw = resp?.data as any;
            const data = raw;
            if (data?.success === true) {
              // capture OTP identifier if provided
              const id =
                data?.data?.otp_identifier || data?.otp_identifier || '';
              if (id) setOtpIdentifier(String(id));
              setModalOpen(true);
              return;
            }
            if (data?.type === 'ERROR_FORM_VALIDATION') {
              const msg = data?.errors?.[0]?.errorMessage || 'Validation error';
              setLocalError(msg);
              return;
            }
            const generic = data?.message || 'Verification failed';
            setLocalError(generic);
          } else {
            const key = externalVerifyUrlDataKey || 'ckycNo';
            const payload = {
              ...(externalVerifyPayloadTemplate || {}),
              [key]: value,
            } as Record<string, unknown>;
            const resp = await Secured.post(externalVerifyUrl, payload, {
              headers,
            });
            const raw = resp?.data as any;
            const data = (raw as any) || raw;

            if (data?.success === true) {
              const id =
                data?.data?.otp_identifier || data?.otp_identifier || '';
              if (id) setOtpIdentifier(String(id));
              setModalOpen(true);
              return;
            }
            if (data?.type === 'ERROR_FORM_VALIDATION') {
              const msg = data?.errors?.[0]?.message || 'Validation error';
              setLocalError(msg);
              return;
            }
            const generic = data?.message || 'Verification failed';
            setLocalError(generic);
          }
        } catch (e: any) {
          const respData = e?.response?.data;
          const msg =
            respData?.error?.errors?.[0]?.message ||
            respData?.message ||
            'Verification failed';
          setLocalError(msg);
        } finally {
          setIsSendingOtp(false);
        }
      } else if (onOpenSendOtp) {
        try {
          setIsSendingOtp(true);
          const result = await Promise.resolve(onOpenSendOtp());
          // If handler explicitly returns false, don't open the modal
          if (result === false) return;
          setModalOpen(true);
        } finally {
          setIsSendingOtp(false);
        }
      } else {
        // No pre-send required; open modal directly
        setModalOpen(true);
      }
    };
    void run();
  };

  const handleModalClose = () => setModalOpen(false);

  const handleVerificationSuccess = (data?: unknown) => {
    // First, emit the OTP-verified payload to parent if provided
    onOtpVerified?.(data);
    // Backward compatibility: trigger onVerify after success with current value
    onVerify?.(value);
    setIsVerified(true);
    setVerifiedValue(value); // Store the verified value
    setModalOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // If value changes from initial value, reset pre-verified and verified states
    if (newValue !== initialValue && hasInitialValueBeenSet) {
      setShowAsPreVerified(false);
      setIsVerified(false);
      setHasValueChanged(true);
    }

    onChange(newValue);
  };

  return (
    <Box className={className} sx={sx}>
      <FormLabel
        htmlFor={fieldId}
        required={required}
        sx={{
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'Gilroy',
          color: '#333',
          marginBottom: 1,
          display: 'block',
          '& .MuiFormLabel-asterisk': {
            color: '#d32f2f',
          },
        }}
      >
        {effectiveLabel}
      </FormLabel>
      <FieldWithUploadAndPreview>
        <TextFieldContainer>
          <FieldWithUploadContainer>
            <StyledTextField
              id={fieldId}
              fullWidth
              type={type}
              value={value}
              onChange={handleChange}
              placeholder={effectivePlaceholder}
              error={error || Boolean(localError)}
              helperText={localError || helperText}
              disabled={disabled}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 14,
              }}
              aria-label={ariaLabel || effectiveLabel}
              aria-describedby={ariaDescribedBy || helperTextId}
              aria-required={required}
              aria-invalid={error}
              sx={{
                '&.Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  '& .MuiInputBase-input': {
                    color: '#333333 !important',
                    WebkitTextFillColor: '#333333 !important',
                    opacity: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E0E0E0',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0.5 }}>
                    {showAsPreVerified || isVerified ? (
                      // Show VerifiedIcon for both pre-verified and manually verified states
                      <VerifiedIcon />
                    ) : verifyDisabled ? null : (
                      // Show verify button only when not verifyDisabled (e.g., Indian citizen)
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        onClick={handleVerifyClick}
                        disabled={
                          disabled ||
                          !value ||
                          isSendingOtp ||
                          (minLength !== undefined &&
                            value.length < minLength) ||
                          (showVerifyOnlyAfterChange && !hasValueChanged)
                        }
                        aria-label={`Verify ${effectiveLabel}`}
                        sx={{
                          minWidth: 88,
                          px: 2,
                          textTransform: 'none',
                          bgcolor: '#0039D7',
                          '&:hover': { bgcolor: '#002bb0' },
                          borderRadius: '8px',
                          height: 36,
                          '&.Mui-disabled': {
                            bgcolor: '#E0E0E0 !important',
                            color: '#9E9E9E !important',
                            cursor: 'not-allowed',
                            pointerEvents: 'none',
                          },
                        }}
                      >
                        {isSendingOtp ? (
                          <>
                            <CircularProgress
                              size={16}
                              color="inherit"
                              sx={{ mr: 1 }}
                            />
                            Sending...
                          </>
                        ) : typeof verifyButtonText === 'string' &&
                          verifyButtonText.trim() !== '' ? (
                          verifyButtonText
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </FieldWithUploadContainer>
        </TextFieldContainer>
      </FieldWithUploadAndPreview>

      {/* CKYC OTP Verification Modal */}
      <CKYCVerificationModalUpdate
        open={modalOpen}
        onClose={handleModalClose}
        onVerificationSuccess={handleVerificationSuccess}
        onOpenSendOtp={
          // If this component already performed the OTP send via external props,
          // avoid triggering a second send from the modal.
          externalVerifyUrl
            ? undefined
            : onOpenSendOtp
              ? async () => {
                  await Promise.resolve(onOpenSendOtp());
                }
              : undefined
        }
        onSubmitOtp={
          externalVerifyUrl
            ? async (otp: string) => {
                setLocalError(undefined);
                const res = await post<unknown>(API_ENDPOINTS.CKYC_VERIFIED, {
                  identifier: otpIdentifier,
                  emailOtp: otp,
                  mobileOtp: '000000',
                });
                const data = (res as AxiosResponse<unknown>).data as unknown;
                return data ?? true;
              }
            : onSubmitOtp
              ? onSubmitOtp
              : async (otp: string) => {
                  setLocalError(undefined);
                  const res = await post<unknown>(API_ENDPOINTS.CKYC_VERIFIED, {
                    identifier: otpIdentifier,
                    otp: otp,
                  });
                  const data = (res as AxiosResponse<unknown>).data as unknown;
                  return data ?? true;
                }
        }
        onResendOtp={onResendOtp}
      />
    </Box>
  );
};

export default LabeledTextFieldWithVerifyUpdate;
