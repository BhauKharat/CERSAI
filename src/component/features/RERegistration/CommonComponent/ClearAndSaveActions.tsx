import React from 'react';
import { SxProps, Theme } from '@mui/material';
import {
  ActionButtonsContainer,
  ClearButton,
  ActionButton,
} from './CommonComponent.styles';

// Interface for submission settings from API
interface SubmissionSettings {
  emailNotification?: boolean;
  webhookUrl?: string;
  clearButton?: boolean | string;
  clearButtonText?: string;
  submitButton?: boolean | string;
  submitButtonText?: string;
  validateIsGroup?: boolean;
  validateButton?: boolean | string;
  validateButtonText?: string;
}

interface FormActionButtonsProps {
  onClear?: () => void;
  onSave?: () => void;
  onPrevious?: () => void;
  onValidate?: () => void;
  showSave?: boolean | string;
  showClear?: boolean | string;
  showPrevious?: boolean;
  showValidate?: boolean | string;
  clearLabel?: string;
  saveLabel?: string;
  previousLabel?: string;
  validateLabel?: string;
  disabled?: boolean | string;
  saveDisabled?: boolean | string;
  clearDisabled?: boolean | string;
  previousDisabled?: boolean | string;
  validateDisabled?: boolean | string;
  loading?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  // New prop for dynamic configuration
  submissionSettings?: SubmissionSettings;
}

const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onClear,
  onSave,
  onPrevious,
  onValidate,
  showSave = true,
  showClear = true,
  showPrevious = false,
  showValidate = false,
  clearLabel = 'Clear',
  saveLabel = 'Save',
  previousLabel = 'Previous',
  validateLabel,
  disabled = false,
  saveDisabled,
  clearDisabled = false,
  previousDisabled = false,
  validateDisabled = false,
  loading = false,
  className,
  sx,
  submissionSettings,
}) => {
  // Helper to safely convert boolean | string to boolean
  const toBoolean = (value: boolean | string | undefined): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  };

  // Use dynamic configuration if provided, otherwise fall back to props
  const dynamicShowClear =
    submissionSettings?.clearButton !== undefined
      ? toBoolean(submissionSettings.clearButton)
      : toBoolean(showClear);
  const dynamicShowSave =
    submissionSettings?.submitButton !== undefined
      ? toBoolean(submissionSettings.submitButton)
      : toBoolean(showSave);
  const dynamicShowValidate =
    submissionSettings?.validateButton !== undefined
      ? toBoolean(submissionSettings.validateButton)
      : toBoolean(showValidate);

  const dynamicClearLabel = submissionSettings?.clearButtonText || clearLabel;
  const dynamicSaveLabel = submissionSettings?.submitButtonText || saveLabel;
  const dynamicValidateLabel = validateLabel;

  // Determine individual button disabled states
  const isSaveDisabled =
    saveDisabled !== undefined ? toBoolean(saveDisabled) : toBoolean(disabled);
  const isClearDisabled = toBoolean(clearDisabled);
  const isPreviousDisabled = toBoolean(previousDisabled);
  const isValidateDisabled = toBoolean(validateDisabled);
  // console.log('dynamicShowValidate====', onValidate);
  return (
    <ActionButtonsContainer className={className} sx={sx}>
      {showPrevious && onPrevious && (
        <ClearButton
          variant="outlined"
          onClick={onPrevious}
          disabled={isPreviousDisabled || loading}
          aria-label={previousLabel}
        >
          {previousLabel}
        </ClearButton>
      )}

      {dynamicShowClear && onClear && (
        <ClearButton
          variant="outlined"
          onClick={onClear}
          disabled={isClearDisabled || loading}
          aria-label={dynamicClearLabel}
        >
          {dynamicClearLabel}
        </ClearButton>
      )}

      {dynamicShowValidate && onValidate && (
        <ClearButton
          variant="outlined"
          onClick={onValidate}
          disabled={isValidateDisabled || loading}
          aria-label={dynamicValidateLabel}
        >
          {dynamicValidateLabel}
        </ClearButton>
      )}

      {dynamicShowSave && onSave && (
        <ActionButton
          variant="contained"
          onClick={onSave}
          disabled={isSaveDisabled || loading}
          aria-label={dynamicSaveLabel}
        >
          {loading ? 'Saving...' : dynamicSaveLabel}
        </ActionButton>
      )}
    </ActionButtonsContainer>
  );
};

export default FormActionButtons;
