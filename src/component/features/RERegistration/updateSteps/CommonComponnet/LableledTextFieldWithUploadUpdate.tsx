/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback } from 'react';
import { Box, SxProps, Theme, FormLabel } from '@mui/material';
import {
  StyledTextField,
  FieldWithUploadContainer,
  StyledUploadButton,
  FieldWithUploadAndPreview,
  TextFieldContainer,
  FilePreviewContainer,
  FilePreviewThumbnail,
  FilePreviewFallback,
  SuccessIcon,
} from './CommonComp.styles';
import DocumentPreview from '../CommonComponnet/DocumentPreview';
import { useDocumentPreview } from '../../CommonComponent/useDocumentPreview';
import UploadIcon from '../../../../../assets/UploadIconNew.svg';
import TickCircle from '../../../../../assets/tick-circle.svg';
import { API_ENDPOINTS } from '../../../../../Constant';

interface ValidationRules {
  size?: string;
  sizeMessage?: string;
  imageFormat?: string[];
  required?: boolean;
  requiredMessage?: string;
  validationFile?: {
    imageFormat?: string[];
    imageRequired?: boolean;
    imageRequiredMessage?: string;
    size?: string;
    sizeMessage?: string;
  };
}

interface LabeledTextFieldWithUploadProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onUpload: (file: File | null) => void;
  onDelete?: () => void;
  onDeleteDocument?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  accept?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  trackStatusShow?: boolean;
  disabled?: boolean;
  textFieldDisabled?: boolean; // Disable only the text field, keep upload enabled
  minLength?: number;
  maxLength?: number;
  regx?: string; // Regex pattern for input validation
  requiredMessage?: string; // Custom required message
  regxMessage?: string; // Custom regex error message
  minLengthMessage?: string; // Custom minLength message
  maxLengthMessage?: string; // Custom maxLength message
  instantValidation?: boolean; // Enable instant validation on every change
  className?: string;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  validationRules?: ValidationRules;
  onValidationError?: (error: string | null) => void;
  // New props for existing document display
  existingDocument?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
  showExistingDocument?: boolean;
}

// Memoized component to display existing document from API - prevents image blinking
const ExistingDocumentPreviewMemo = React.memo<{
  existingDocument: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
  disabled: boolean;
  onPreviewClick: () => void;
}>(
  ({ existingDocument, disabled, onPreviewClick }) => {
    const isImage = existingDocument.mimeType.startsWith('image/');
    const fileExtension =
      existingDocument.fileName.split('.').pop()?.toUpperCase() || 'FILE';

    return (
      <FilePreviewContainer
        onClick={onPreviewClick}
        sx={{
          cursor: 'pointer', // Always show pointer cursor - preview is always available
          opacity: disabled ? 0.8 : 1, // Slightly reduced opacity when disabled, but still visible
          '&:hover': {
            opacity: 0.9,
            transform: 'scale(1.05)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        {isImage ? (
          <FilePreviewThumbnail
            src={API_ENDPOINTS.fetch_document + '?id=' + existingDocument.id}
            alt={existingDocument.fileName}
            title={`Click to preview ${existingDocument.fileName}`}
          />
        ) : (
          <FilePreviewFallback
            title={`Click to preview ${existingDocument.fileName}`}
          >
            {fileExtension}
          </FilePreviewFallback>
        )}
        <SuccessIcon src={TickCircle} alt="Existing Document" />
      </FilePreviewContainer>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if existingDocument reference or disabled state changes
    return (
      prevProps.existingDocument === nextProps.existingDocument &&
      prevProps.disabled === nextProps.disabled
    );
  }
);

ExistingDocumentPreviewMemo.displayName = 'ExistingDocumentPreviewMemo';

const LabeledTextFieldWithUploadUpdate: React.FC<
  LabeledTextFieldWithUploadProps
> = ({
  label,
  value,
  onChange,
  onBlur,
  onUpload,
  onDelete,
  placeholder,
  type = 'text',
  accept = '.pdf,.jpg,.jpeg,.png',
  error = false,
  helperText,
  required = false,
  disabled = false,
  textFieldDisabled = false,
  minLength,
  maxLength,
  regx,
  requiredMessage,
  regxMessage,
  minLengthMessage,
  maxLengthMessage,
  instantValidation = false,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  validationRules,
  onValidationError,
  existingDocument,
  showExistingDocument = false,
  trackStatusShow = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isDocumentDeleted, setIsDocumentDeleted] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');
  const [isTouched, setIsTouched] = useState<boolean>(false);

  // Real-time validation function for text field
  const validateTextValue = useCallback(
    (val: string): string => {
      // 1. Required validation - check first
      if (required && (!val || val.trim() === '')) {
        return requiredMessage || `${label} is required`;
      }

      // If value is empty and not required, skip other validations
      if (!val || val.trim() === '') {
        return '';
      }

      // 2. MinLength validation
      if (minLength && val.length < minLength) {
        return (
          minLengthMessage ||
          `${label} must be at least ${minLength} characters`
        );
      }

      // 3. MaxLength validation
      if (maxLength && val.length > maxLength) {
        return (
          maxLengthMessage || `${label} cannot exceed ${maxLength} characters`
        );
      }

      // 4. Regex validation
      if (regx) {
        try {
          const regex = new RegExp(regx);
          if (!regex.test(val)) {
            return regxMessage || `${label} format is invalid`;
          }
        } catch {
          // Invalid regex, skip validation
        }
      }

      return '';
    },
    [
      required,
      requiredMessage,
      label,
      minLength,
      minLengthMessage,
      maxLength,
      maxLengthMessage,
      regx,
      regxMessage,
    ]
  );

  const {
    previewState,
    openPreview,
    closePreview,
    handleDelete,
    handleChange,
  } = useDocumentPreview({
    onDelete: () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsDocumentDeleted(true);
      onDelete?.();
    },
    onChange: () => {
      document.getElementById(uploadId)?.click();
    },
  });
  const fieldId = React.useId();
  const uploadId = React.useId();
  const helperTextId = helperText ? `${fieldId}-helper-text` : undefined;

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const getFileExtension = (file: File) => {
    return file.name.split('.').pop()?.toUpperCase() || 'FILE';
  };

  // File validation function
  const validateFile = (file: File): string | null => {
    if (!validationRules) {
      console.log('No validation rules provided');
      return null;
    }

    const useNestedValidation = validationRules.validationFile;
    const sizeRule = useNestedValidation
      ? validationRules.validationFile?.size
      : validationRules.size;
    const sizeMessage = useNestedValidation
      ? validationRules.validationFile?.sizeMessage
      : validationRules.sizeMessage;
    const imageFormats = useNestedValidation
      ? validationRules.validationFile?.imageFormat
      : validationRules.imageFormat;

    if (sizeRule) {
      let maxSizeInBytes = 0;
      let sizeInMB = 0;

      if (sizeRule.toLowerCase().includes('kb')) {
        const sizeInKB = parseFloat(sizeRule.toLowerCase().replace('kb', ''));
        maxSizeInBytes = sizeInKB * 1024;
        sizeInMB = sizeInKB / 1024;
      } else {
        // Assume MB if not KB (or if explicitly MB)
        sizeInMB = parseFloat(sizeRule.toLowerCase().replace('mb', ''));
        maxSizeInBytes = sizeInMB * 1024 * 1024;
      }

      if (file.size > maxSizeInBytes) {
        // Convert to KB for better readability if size is less than 1 MB
        // Special case: 0.5 MB should display as 500 KB per user requirement
        let sizeLimit = '';
        if (
          sizeInMB === 0.5 ||
          (sizeRule.toLowerCase().includes('kb') &&
            parseFloat(sizeRule) === 500)
        ) {
          sizeLimit = '500 KB';
        } else {
          sizeLimit =
            sizeInMB < 1
              ? `${Math.round(sizeInMB * 1024)} KB`
              : `${sizeInMB} MB`;
        }

        const errorMessage =
          sizeMessage || `File size exceeds the maximum limit of ${sizeLimit}.`;
        return errorMessage;
      }
    }

    if (imageFormats && imageFormats.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !imageFormats.includes(fileExtension)) {
        const errorMessage = `File must be in one of these formats: ${imageFormats.join(', ')}`;
        return errorMessage;
      }
    }

    return null;
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    // Enforce maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
      // Update the event value
      event.target.value = newValue;
    }

    // Instant validation: validate on every change for specific fields
    // Otherwise, validate only if field has been touched
    if (instantValidation || isTouched) {
      setIsTouched(true);
      const errorMsg = validateTextValue(newValue);
      setLocalError(errorMsg);
    }

    // Call the original onChange
    onChange(event);
  };

  // Handle blur event for validation
  const handleTextBlur = () => {
    setIsTouched(true);
    const errorMsg = validateTextValue(value);
    setLocalError(errorMsg);

    // Call parent onBlur if provided
    if (onBlur) {
      onBlur();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Validate the file
      const validationError = validateFile(file);

      if (validationError) {
        // File validation failed
        setFileError(validationError);
        onValidationError?.(validationError);
        // Clear the file input
        event.target.value = '';
        return;
      } else {
        // Clear any previous validation errors
        setFileError('');
        onValidationError?.(null);
      }
    } else {
      // No file selected, clear errors
      setFileError('');
      onValidationError?.(null);
    }

    setSelectedFile(file);
    onUpload(file);

    // Reset deleted state when a new file is uploaded
    if (file) {
      setIsDocumentDeleted(false);
    }

    // Create preview URL for all files (images, PDFs, etc.)
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const FilePreview = ({ file }: { file: File }) => {
    const handlePreviewClick = () => {
      // Don't allow preview if field is disabled
      if (disabled) {
        return;
      }
      if (previewUrl) {
        openPreview(previewUrl, file.name);
      }
    };

    return (
      <FilePreviewContainer
        onClick={handlePreviewClick}
        sx={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          '&:hover': disabled
            ? {}
            : {
                opacity: 0.8,
                transform: 'scale(1.05)',
                transition: 'all 0.2s ease-in-out',
              },
        }}
      >
        {isImageFile(file) && previewUrl ? (
          <FilePreviewThumbnail
            src={previewUrl}
            alt={file.name}
            title={
              disabled ? 'Preview disabled' : `Click to preview ${file.name}`
            }
          />
        ) : (
          <FilePreviewFallback
            title={
              disabled ? 'Preview disabled' : `Click to preview ${file.name}`
            }
          >
            {getFileExtension(file)}
          </FilePreviewFallback>
        )}
        <SuccessIcon src={TickCircle} alt="Success" />
      </FilePreviewContainer>
    );
  };

  // Callback for previewing existing document
  // Allow preview even when disabled - users should be able to view uploaded documents
  const handleExistingDocPreviewClick = React.useCallback(() => {
    if (!existingDocument) {
      return;
    }
    openPreview(existingDocument.dataUrl, existingDocument.fileName);
  }, [existingDocument, openPreview]);

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
        {label}
      </FormLabel>
      <FieldWithUploadAndPreview>
        <TextFieldContainer>
          <FieldWithUploadContainer>
            <StyledTextField
              id={fieldId}
              fullWidth
              type={type}
              value={value}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              placeholder={placeholder}
              error={error || (isTouched && !!localError)}
              helperText={(isTouched && localError) || helperText}
              disabled={textFieldDisabled || disabled}
              inputProps={{
                minLength,
                maxLength,
              }}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy || helperTextId}
              aria-required={required}
              aria-invalid={error || (isTouched && !!localError)}
            />
            {trackStatusShow === false && (
              <>
                {!disabled && (
                  <StyledUploadButton
                    onClick={() => document.getElementById(uploadId)?.click()}
                    disabled={disabled}
                    aria-label={`Upload file for ${label}`}
                  >
                    <img src={UploadIcon} alt="" width="16" height="16" />
                  </StyledUploadButton>
                )}
                <input
                  id={uploadId}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept={accept}
                  disabled={disabled}
                />
              </>
            )}
          </FieldWithUploadContainer>
        </TextFieldContainer>
        {/* Show existing document if available and no new file selected and not deleted */}
        {showExistingDocument &&
          existingDocument &&
          !selectedFile &&
          !isDocumentDeleted &&
          existingDocument.dataUrl &&
          existingDocument.fileName &&
          existingDocument.mimeType && (
            <ExistingDocumentPreviewMemo
              existingDocument={existingDocument}
              disabled={disabled}
              onPreviewClick={handleExistingDocPreviewClick}
            />
          )}
        {/* Show newly selected file preview */}
        {selectedFile && <FilePreview file={selectedFile} />}
      </FieldWithUploadAndPreview>

      {/* Error message display */}
      {fileError && (
        <Box
          sx={{
            fontSize: '12px',
            fontFamily: 'Gilroy',
            color: '#d32f2f',
            marginTop: '4px',
            marginLeft: '14px',
          }}
        >
          {fileError}
        </Box>
      )}

      {/* Document Preview Modal */}
      <DocumentPreview
        open={previewState.isOpen}
        onClose={closePreview}
        documentUrl={previewState.documentUrl}
        documentName={previewState.documentName}
        onDelete={handleDelete}
        onChange={handleChange}
        showDelete={!disabled}
        showChange={!disabled}
        previewState={existingDocument}
        selectedFileUrl={previewUrl}
      />
    </Box>
  );
};

export default LabeledTextFieldWithUploadUpdate;
