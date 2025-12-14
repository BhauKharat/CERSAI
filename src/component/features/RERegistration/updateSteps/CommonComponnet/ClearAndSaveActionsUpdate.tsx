import React from 'react';
import { SxProps, Theme } from '@mui/material';
import {
  ActionButtonsContainer,
  ClearButton,
  ActionButton,
} from './CommonComp.styles';

// Interface for submission settings from API
interface SubmissionSettings {
  clearButton?: boolean;
  clearButtonText?: string;
  submitButton?: boolean;
  submitButtonText?: string;
  validateIsGroup?: boolean;
  validateButton?: boolean;
  validateButtonText?: string;
}

interface FormActionButtonsUpdateProps {
  onClear?: () => void;
  onSave?: () => void;
  onPrevious?: () => void;
  onValidate?: () => void;
  showSave?: boolean;
  showClear?: boolean;
  showPrevious?: boolean;
  showValidate?: boolean;
  clearLabel?: string;
  saveLabel?: string;
  previousLabel?: string;
  validateLabel?: string;
  disabled?: boolean;
  saveDisabled?: boolean;
  clearDisabled?: boolean;
  previousDisabled?: boolean;
  validateDisabled?: boolean;
  loading?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  // New prop for dynamic configuration
  submissionSettings?: SubmissionSettings;
}

const FormActionButtonsUpdate: React.FC<FormActionButtonsUpdateProps> = ({
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
  // Use dynamic configuration if provided, otherwise fall back to props
  const dynamicShowClear =
    submissionSettings?.clearButton !== undefined
      ? submissionSettings.clearButton
      : showClear;
  const dynamicShowSave =
    submissionSettings?.submitButton !== undefined
      ? submissionSettings.submitButton
      : showSave;
  // const dynamicShowValidate =
  //   submissionSettings?.validateButton !== undefined
  //     ? submissionSettings.validateButton
  //     : showValidate;

  const dynamicShowValidate = showValidate;
  const dynamicClearLabel = submissionSettings?.clearButtonText || clearLabel;
  const dynamicSaveLabel = submissionSettings?.submitButtonText || saveLabel;
  const dynamicValidateLabel = validateLabel;

  // Determine individual button disabled states
  const isSaveDisabled = saveDisabled !== undefined ? saveDisabled : disabled;
  const isClearDisabled = clearDisabled;
  const isPreviousDisabled = previousDisabled;
  const isValidateDisabled = validateDisabled;

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

export default FormActionButtonsUpdate;
