/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
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
} from './CommonComponent.styles';
import CKYCVerificationModal, {
  CKYCVerificationModalProps,
} from '../../../ui/Modal/CKYCVerificationModal';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { post } from '../../../../services/CKYCAdmin/api';
import type { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from 'Constant';
import VerifiedIcon from '../../../ui/Input/VerifiedIcon';

interface LabeledTextFieldWithVerifyProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Deprecated: retained for backward compatibility; will be invoked AFTER OTP success
  onVerify?: (value: string) => void;
  // OTP workflow hooks (optional)
  onOpenSendOtp?:
    | (() => Promise<boolean | void> | boolean | void)
    | CKYCVerificationModalProps['onOpenSendOtp'];
  onSubmitOtp?: CKYCVerificationModalProps['onSubmitOtp'];
  onResendOtp?: CKYCVerificationModalProps['onResendOtp'];
  // Callback to receive API response on successful OTP verification
  onOtpVerified?: (data?: unknown) => void;
  // External verification (non-OTP) support owned by this component
  externalVerifyUrl?: string; // e.g., https://.../ckyc-verify/
  externalVerifyMethod?: string;
  externalVerifyHeaders?: Record<string, string>;
  externalVerifyUrlDataKey?: string; // e.g., 'ckycNo'
  externalVerifyPayloadTemplate?: Record<string, unknown>; // merged with {[urlDataKey]: value}
  // Additional control to disable verify action externally
  verifyDisabled?: boolean;
  verifyButtonText?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: boolean;
  helperText?: string;
  required?: boolean | string;
  verifyIcon?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  hasData?: boolean;
}

const LabeledTextFieldWithVerify: React.FC<LabeledTextFieldWithVerifyProps> = ({
  label,
  value,
  onChange,
  onVerify,
  onOpenSendOtp,
  onSubmitOtp,
  onResendOtp,
  onOtpVerified,
  externalVerifyUrl,
  externalVerifyMethod = 'GET',
  externalVerifyHeaders,
  externalVerifyUrlDataKey,
  externalVerifyPayloadTemplate,
  verifyDisabled,
  verifyButtonText,
  placeholder,
  type = 'text',
  error = false,
  helperText,
  required,
  disabled = false,
  // minLength,
  // maxLength,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  hasData,
  verifyIcon,
}) => {
  const effectiveLabel = label || 'Enter details';
  const effectivePlaceholder = placeholder || effectiveLabel;
  const fieldId = React.useId();
  const helperTextId = helperText ? `${fieldId}-helper-text` : undefined;

  // Convert required prop to boolean
  const isRequired =
    required === undefined
      ? false
      : typeof required === 'boolean'
        ? required
        : required === 'true' || required === 'required';

  const [modalOpen, setModalOpen] = React.useState(false);
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );
  const [otpIdentifier, setOtpIdentifier] = React.useState<string>('');
  const [isVerified, setIsVerified] = React.useState<boolean>(false);
  // Track initial prefilled value to keep Verify disabled until user edits
  const initialValueRef = React.useRef<string>(value);
  const [hasEdited, setHasEdited] = React.useState(false);
  // Track the prefilled/verified value to decide when to show the tick
  const prefilledValueRef = React.useRef<string | null>(null);

  // Capture the initial prefilled value once (when provided) and mark verified
  React.useEffect(() => {
    const lenOk = typeof value === 'string' && value.length === 14;
    const wasPrefilled = Boolean(verifyIcon || hasData);
    if (wasPrefilled && lenOk && prefilledValueRef.current === null) {
      prefilledValueRef.current = value;
      setIsVerified(true);
    }
  }, [hasData, verifyIcon, value]);

  // If user changes the value from the prefilled/verified one, require verification
  React.useEffect(() => {
    if (prefilledValueRef.current !== null) {
      if (value !== prefilledValueRef.current) {
        setIsVerified(false);
      } else {
        // unchanged from the prefilled/verified value
        setIsVerified(true);
      }
    }
  }, [value]);

  // Keep baseline in sync when parent populates a new value without user edit
  React.useEffect(() => {
    if (!hasEdited && value !== initialValueRef.current) {
      initialValueRef.current = value;
    }
  }, [hasEdited, value]);

  // Keep once when hasData flips true with a valid value
  React.useEffect(() => {
    if (hasData && value !== '' && value.length === 14) {
      setIsVerified(true);
    }
    // eslint-disable-next-line
  }, [hasData]);

  const handleVerifyClick = () => {
    if (disabled || !value || verifyDisabled) return;
    // If caller supplied an OTP sender, use it before opening modal
    const run = async () => {
      // If component has all external props, it will own the API call.
      if (externalVerifyUrl) {
        try {
          console.log('externalVerifyUrl', externalVerifyMethod);
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
            console.log('data====', data);
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
    console.log('🎯 handleVerificationSuccess called with data:', data);
    
    // First, close the modal
    setModalOpen(false);
    
    // Mark the current value as the new verified baseline
    prefilledValueRef.current = value;
    setIsVerified(true);
    
    // Then emit the OTP-verified payload to parent if provided
    try {
      onOtpVerified?.(data);
    } catch (error) {
      console.error('Error in onOtpVerified callback:', error);
    }
    
    // Backward compatibility: trigger onVerify after success with current value
    try {
      onVerify?.(value);
    } catch (error) {
      console.error('Error in onVerify callback:', error);
    }
  };

  useEffect(() => {
    if (isVerified) {
      setLocalError(undefined);
    }
  }, [isVerified]);

  return (
    <Box className={className} sx={sx}>
      <FormLabel
        htmlFor={fieldId}
        sx={{
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: 'Gilroy',
          color: '#333',
          marginBottom: 1,
          display: 'block',
          '& .MuiFormLabel-asterisk': {
            color: '#d32f2f',
          },
        }}
      >
        {effectiveLabel} {isRequired && <span style={{ color: 'red' }}>*</span>}
      </FormLabel>
      <FieldWithUploadAndPreview>
        <TextFieldContainer>
          <FieldWithUploadContainer>
            <StyledTextField
              id={fieldId}
              fullWidth
              type={type}
              value={value}
              sx={{
                backgroundColor: disabled ? '#EEEEEE' : '',
                color: disabled ? '#999999' : '',
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e);
                const nextVal = e.target.value;
                setHasEdited(nextVal !== initialValueRef.current);
                setIsVerified(false);
              }}
              placeholder={effectivePlaceholder}
              error={error || Boolean(localError)}
              helperText={localError || helperText}
              disabled={disabled}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 14,
                onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
                  // Ensure only numbers are entered
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                },
                onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  // Prevent non-numeric characters
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete' &&
                    e.key !== 'Tab' &&
                    !e.ctrlKey &&
                    !e.metaKey
                  ) {
                    e.preventDefault();
                  }
                },
                onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                  // Clean pasted content to only allow numbers
                  const pastedText = e.clipboardData.getData('text/plain');
                  if (!/^\d+$/.test(pastedText)) {
                    e.preventDefault();
                    const cleaned = pastedText.replace(/\D/g, '');
                    document.execCommand('insertText', false, cleaned);
                  }
                },
              }}
              aria-label={ariaLabel || effectiveLabel}
              aria-describedby={ariaDescribedBy || helperTextId}
              aria-required={isRequired}
              aria-invalid={error}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0.5 }}>
                    {isVerified ? (
                      <VerifiedIcon />
                    ) : verifyDisabled ? null : (
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        onClick={handleVerifyClick}
                        disabled={
                          !(value.length === 14) ||
                          disabled ||
                          !value ||
                          isSendingOtp ||
                          (!hasEdited &&
                            value === initialValueRef.current &&
                            value.length === 14)
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
      <CKYCVerificationModal
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
                try {
                  const res = await post<unknown>(API_ENDPOINTS.CKYC_VERIFIED, {
                    identifier: otpIdentifier,
                    emailOtp: otp,
                    mobileOtp: '000000',
                  });
                  type CkycVerifyData = {
                    valid?: boolean;
                    emailOtpValid?: boolean;
                    smsOtpValid?: boolean;
                  };
                  type CkycVerifyResponse = {
                    success?: boolean;
                    data?: CkycVerifyData;
                  };
                  const payload = (res as AxiosResponse<CkycVerifyResponse>)
                    .data;
                  const inner: CkycVerifyData = payload?.data || {};
                  if (inner.emailOtpValid === false || inner.valid === false) {
                    return false as unknown as undefined;
                  }
                  return payload ?? true;
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error('Failed to verify CKYC OTP', e);
                  return false as unknown as undefined;
                }
              }
            : onSubmitOtp
              ? onSubmitOtp
              : async (otp: string) => {
                  setLocalError(undefined);
                  try {
                    const res = await post<unknown>(
                      API_ENDPOINTS.CKYC_VERIFIED,
                      {
                        identifier: otpIdentifier,
                        otp: otp,
                      }
                    );
                    type CkycVerifyData = {
                      valid?: boolean;
                      emailOtpValid?: boolean;
                      smsOtpValid?: boolean;
                    };
                    type CkycVerifyResponse = {
                      success?: boolean;
                      data?: CkycVerifyData;
                    };
                    const payload = (res as AxiosResponse<CkycVerifyResponse>)
                      .data;
                    const inner: CkycVerifyData = payload?.data || {};
                    if (
                      inner.emailOtpValid === false ||
                      inner.valid === false
                    ) {
                      return false as unknown as undefined;
                    }
                    return payload ?? true;
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to verify CKYC OTP', e);
                    return false as unknown as undefined;
                  }
                }
        }
        onResendOtp={onResendOtp}
      />
    </Box>
  );
};
export default LabeledTextFieldWithVerify;
