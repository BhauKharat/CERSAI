/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import { Box, SxProps, Theme, FormLabel, Tooltip } from '@mui/material';
import {
  StyledTextField,
  FieldWithUploadContainer,
  StyledUploadButton,
  FieldWithUploadAndPreview,
  TextFieldContainer,
  FilePreviewContainer,
  FilePreviewThumbnail,
  FilePreviewFallback,
} from './CommonComponent.styles';
import DocumentPreview from './DocumentPreview';
import { useDocumentPreview } from './useDocumentPreview';
import UploadIcon from '../../../../assets/UploadIconNew.svg';
import { API_ENDPOINTS } from '../../../../Constant';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { deleteDocument } from '../updateSteps/slice/updateStepDataSlice';

interface ValidationRules {
  size?: string;
  sizeMessage?: string;
  imageFormat?: string[];
  required?: string | boolean;
  requiredMessage?: string;
  // New nested validation structure for textfield_with_image
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
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onUpload: (file: File | null) => void;
  onDelete?: (existingDocument?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  }) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  inputMode?:
  | 'text'
  | 'numeric'
  | 'decimal'
  | 'tel'
  | 'search'
  | 'email'
  | 'url';
  accept?: string;
  error?: boolean;
  helperText?: string;
  required?: string | boolean;
  trackStatusShow?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
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
  dependentFieldValue?: string;
}

const LabeledTextFieldWithUpload: React.FC<LabeledTextFieldWithUploadProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  onUpload,
  onDelete,
  placeholder,
  type = 'text',
  inputMode,
  accept = '.pdf,.jpg,.jpeg,.png',
  error = false,
  helperText,
  required = false,
  disabled = false,
  minLength,
  maxLength,
  className,
  sx,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  validationRules,
  onValidationError,
  existingDocument,
  showExistingDocument = false,
  trackStatusShow = false,
  dependentFieldValue,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showExisting, setShowExisting] = useState(showExistingDocument);
  const isFirstRender = React.useRef(true);
  const prevValueRef = React.useRef<string | undefined>(undefined);
  const prevDependentFieldRef = React.useRef<string | undefined>(undefined);
  const onUploadRef = React.useRef(onUpload);
  const isRequired = Boolean(required);

  React.useEffect(() => {
    onUploadRef.current = onUpload;
  }, [onUpload]);

  React.useEffect(() => {
    setShowExisting(showExistingDocument);
  }, [showExistingDocument]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      prevDependentFieldRef.current = dependentFieldValue;
      return;
    }

    const prevValue = prevValueRef.current;
    const prevDependentField = prevDependentFieldRef.current;
    const valueChanged = prevValue !== value;

    const dependentFieldChanged =
      dependentFieldValue !== undefined &&
      prevDependentField !== undefined &&
      prevDependentField !== dependentFieldValue;

    prevValueRef.current = value;
    prevDependentFieldRef.current = dependentFieldValue;

    if (dependentFieldChanged) {
      setShowExisting(false);
      setSelectedFile(null);
      setPreviewUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
      onUploadRef.current(null);
      return;
    }

    // COMMENTED OUT: Don't auto-clear file when text field is cleared
    // Files should only be deleted when user explicitly clicks delete button
    // if (
    //   valueChanged &&
    //   (!value || value === '' || value === null || value === undefined)
    // ) {
    //   setShowExisting(false);
    //   setSelectedFile(null);
    //   setPreviewUrl((prevUrl) => {
    //     if (prevUrl) {
    //       URL.revokeObjectURL(prevUrl);
    //     }
    //     return null;
    //   });
    //   onUploadRef.current(null);
    // }
  }, [value, dependentFieldValue]);

  // Document preview hook
  const handleExistingDelete = async () => {
    console.log('handleExistingDelete called', {
      existingDocument,
      showExistingDocument,
      selectedFile,
    });

    setSelectedFile(null);
    setPreviewUrl(null);

    if (existingDocument && showExistingDocument) {
      console.log(
        'Deleting existing document from server:',
        existingDocument.id
      );
      await dispatch(deleteDocument(existingDocument.id));
      onDelete?.(existingDocument);
      return;
    }

    // For newly uploaded files, call onDelete with undefined to clear the field
    console.log('Clearing newly uploaded file (no API call)');
    onDelete?.(undefined);
  };

  const { previewState, openPreview, closePreview, handleDelete } =
    useDocumentPreview({
      onDelete: handleExistingDelete,
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
    console.log('Validating file:', {
      fileName: file.name,
      fileSize: file.size,
      fileSizeInMB: (file.size / (1024 * 1024)).toFixed(2),
      validationRules,
    });

    if (!validationRules) {
      console.log('No validation rules provided');
      return null;
    }

    // Determine which validation structure to use
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

    // File size validation
    if (sizeRule) {
      const lowerSizeRule = sizeRule.toLowerCase();
      let maxSizeInBytes = 0;

      if (lowerSizeRule.includes('mb')) {
        maxSizeInBytes =
          parseFloat(lowerSizeRule.replace('mb', '')) * 1024 * 1024;
      } else if (lowerSizeRule.includes('kb')) {
        maxSizeInBytes = parseFloat(lowerSizeRule.replace('kb', '')) * 1024;
      } else {
        // Assume bytes if no unit specified
        maxSizeInBytes = parseFloat(lowerSizeRule);
      }

      console.log('Size validation:', {
        maxSizeRule: sizeRule,
        maxSizeInBytes,
        maxSizeInMB: (maxSizeInBytes / (1024 * 1024)).toFixed(2),
        actualFileSize: file.size,
        actualFileSizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        isValid: file.size <= maxSizeInBytes,
      });

      if (file.size > maxSizeInBytes) {
        const errorMessage =
          sizeMessage || `File size must not exceed ${sizeRule}`;
        console.log('File size validation failed:', errorMessage);
        return errorMessage;
      }
    }

    // File format validation
    if (imageFormats && imageFormats.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      console.log('Format validation:', {
        allowedFormats: imageFormats,
        fileExtension,
        isValid: fileExtension && imageFormats.includes(fileExtension),
      });

      if (!fileExtension || !imageFormats.includes(fileExtension)) {
        const errorMessage = `File must be in one of these formats: ${imageFormats.join(', ')}`;
        console.log('File format validation failed:', errorMessage);
        return errorMessage;
      }
    }

    console.log('File validation passed');
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file && (selectedFile || existingDocument)) {
      return;
    }
    if (file) {
      // Validate the file
      let validationError = validateFile(file);

      if (file.size > 512000) {
        validationError = `File size must not exceed 500kb`;
      }

      if (validationError) {
        // File validation failed
        onValidationError?.(validationError);
        // Clear the file input
        event.target.value = '';
        return;
      } else {
        // Clear any previous validation errors
        onValidationError?.(null);
      }
    }

    setSelectedFile(file);
    onUpload(file);

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
    // eslint-disable-next-line
  }, [previewUrl]);

  const FilePreview = ({ file }: { file: File }) => {
    const handlePreviewClick = () => {
      if (previewUrl) {
        openPreview(previewUrl, file.name);
      }
    };
    console.log('isImageFile=====', isImageFile(file));
    return (
      <FilePreviewContainer
        onClick={handlePreviewClick}
        sx={{
          cursor: 'pointer',
          marginTop: '4px',
          '&:hover': {
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
            title={`Click to preview3 ${file.name}`}
          />
        ) : (
          <FilePreviewFallback title={`Click to preview4 ${file.name}`}>
            {getFileExtension(file)}
          </FilePreviewFallback>
        )}
      </FilePreviewContainer>
    );
  };

  // Component to display existing document from API
  const ExistingDocumentPreview = useMemo(() => {
    if (!showExisting || !existingDocument) return null;

    // Safety checks for required properties
    if (
      !existingDocument.dataUrl ||
      !existingDocument.fileName ||
      !existingDocument.mimeType
    ) {
      console.warn(
        'ExistingDocumentPreview: Missing required document properties',
        {
          hasDataUrl: !!existingDocument.dataUrl,
          hasFileName: !!existingDocument.fileName,
          hasMimeType: !!existingDocument.mimeType,
          existingDocument,
        }
      );
      return null;
    }

    const handlePreviewClick = () => {
      openPreview(existingDocument.dataUrl, existingDocument.fileName);
    };

    const isImage = existingDocument.mimeType.startsWith('image/');
    const fileExtension =
      existingDocument.fileName.split('.').pop()?.toUpperCase() || 'FILE';

    return (
      <FilePreviewContainer
        onClick={handlePreviewClick}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
            transform: 'scale(1.05)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        {isImage ? (
          <FilePreviewThumbnail
            src={API_ENDPOINTS.fetch_document + '?id=' + existingDocument.id}
            alt={existingDocument.fileName}
            title={`Click to preview1 ${existingDocument.fileName}`}
          />
        ) : (
          <FilePreviewFallback
            title={`Click to preview2 ${existingDocument.fileName}`}
          >
            {fileExtension}
          </FilePreviewFallback>
        )}
      </FilePreviewContainer>
    );
    // eslint-disable-next-line
  }, [existingDocument, showExisting, value]);

  return (
    <Box className={className} sx={sx}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <FormLabel
          htmlFor={fieldId}
          required={isRequired}
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
          {label}
        </FormLabel>
        <Tooltip
          title={
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong>Upload Requirements</strong>
              <span>• Max file size: 500 KB</span>
              <span>• Allowed formats: PDF, JPG, JPEG</span>
            </div>
          }
        >
          <ErrorOutlineIcon sx={{ fontSize: '20px' }} />
        </Tooltip>
      </Box>
      <FieldWithUploadAndPreview>
        <TextFieldContainer>
          <FieldWithUploadContainer>
            <StyledTextField
              id={fieldId}
              fullWidth
              sx={{
                backgroundColor: disabled ? '#EEEEEE' : '',
                color: disabled ? '#999999' : '',
              }}
              type={type}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              error={error}
              helperText={helperText}
              disabled={disabled}
              inputProps={{
                minLength,
                maxLength,
                inputMode,
              }}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy || helperTextId}
              aria-required={isRequired}
              aria-invalid={error}
            />
            {trackStatusShow === false &&
              !selectedFile &&
              (!existingDocument || !showExisting) && (
                <>
                  <StyledUploadButton
                    onClick={() => document.getElementById(uploadId)?.click()}
                    disabled={disabled}
                    aria-label={`Upload file for ${label}`}
                  >
                    <img src={UploadIcon} alt="" width="16" height="16" />
                  </StyledUploadButton>
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
        {/* Show existing document if available and no new file selected */}
        {showExisting &&
          existingDocument &&
          !selectedFile &&
          ExistingDocumentPreview}
        {/* Show newly selected file preview */}
        {selectedFile && <FilePreview file={selectedFile} />}
      </FieldWithUploadAndPreview>

      {/* Document Preview Modal */}
      <DocumentPreview
        open={previewState.isOpen}
        onClose={closePreview}
        documentUrl={previewState.documentUrl}
        documentName={previewState.documentName}
        onDelete={handleDelete}
        onChange={() => document.getElementById(uploadId)?.click()}
        showDelete={disabled ? false : true}
        showChange={disabled ? false : true}
        previewState={existingDocument}
        selectedFileUrl={previewUrl}
      />
    </Box>
  );
};

export default LabeledTextFieldWithUpload;
