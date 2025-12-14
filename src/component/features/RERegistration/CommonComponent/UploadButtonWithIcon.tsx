import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';
import {
  Box,
  FormLabel,
  Typography,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import DocumentPreview from './DocumentPreview';
import { useDocumentPreview } from './useDocumentPreview';
import UploadIcon from '../../../../assets/UploadIconButton.svg';
import { API_ENDPOINTS } from '../../../../Constant';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { deleteDocument } from '../updateSteps/slice/updateStepDataSlice';
import { StyledUploadBox } from './CommonComponent.styles';

interface UploadButtonProps {
  label?: string;
  onUpload: (file: File | null) => void;
  onValidationError?: (error: string | null) => void;
  onDelete?: (existingDocument?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  }) => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  showPreview?: boolean;
  required?: string | boolean;
  'aria-label'?: string;
  // New props for existing document display
  existingDocument?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
  validationRules?: ValidationRules;
  showExistingDocument?: boolean;
  error?: boolean;
  helperText?: string;
}

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

const UploadButton: React.FC<UploadButtonProps> = ({
  label = 'Upload',
  onUpload,
  onDelete,
  accept = '.pdf,.jpg,.jpeg,.png',
  disabled = false,
  className,
  sx,
  required = false,
  'aria-label': ariaLabel,
  existingDocument,
  showExistingDocument = false,
  validationRules,
  onValidationError,
  error,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Document preview hook
  const {
    previewState,
    openPreview,
    closePreview,
    handleDelete,
    handleChange,
  } = useDocumentPreview({
    onDelete: async () => {
      console.log('UploadButton handleDelete called', {
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
    },
    onChange: () => {
      // Trigger file input click for changing file
      document.getElementById(inputId)?.click();
    },
  });
  const inputId = React.useId();

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const getFileExtension = (file: File) => {
    return file && file.name
      ? file.name.split('.').pop()?.toUpperCase() || 'FILE'
      : 'FILE';
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
  }, [previewUrl]);

  const FilePreview = ({ file }: { file: File }) => {
    const handlePreviewClick = () => {
      if (previewUrl) {
        openPreview(previewUrl, file.name);
      }
    };

    return (
      <Box
        onClick={handlePreviewClick}
        sx={{
          position: 'relative',
          width: '42px',
          height: '42px',
          flexShrink: 0,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
            transform: 'scale(1.05)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        {isImageFile(file) && previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt={file.name}
            title={`Click to preview5 ${file.name}`}
            sx={{
              width: '42px',
              height: '42px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            title={`Click to preview6 ${file.name}`}
            sx={{
              width: '42px',
              height: '42px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#666',
            }}
          >
            {getFileExtension(file)}
          </Box>
        )}
      </Box>
    );
  };

  // Component to display existing document from API
  const ExistingDocumentPreview = useMemo(() => {
    if (!existingDocument) return null;

    const handlePreviewClick = () => {
      openPreview(existingDocument.dataUrl, existingDocument.fileName);
    };

    const isImage = existingDocument.mimeType.startsWith('image/');
    const fileExtension =
      existingDocument.fileName.split('.').pop()?.toUpperCase() || 'FILE';

    return (
      <Box
        onClick={handlePreviewClick}
        sx={{
          position: 'relative',
          width: '42px',
          height: '42px',
          flexShrink: 0,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
            transform: 'scale(1.05)',
            transition: 'all 0.2s ease-in-out',
          },
        }}
      >
        {isImage ? (
          <Box
            component="img"
            src={API_ENDPOINTS.fetch_document + '?id=' + existingDocument.id}
            alt={existingDocument.fileName}
            title={`Click to preview7 ${existingDocument.fileName}`}
            sx={{
              width: '42px',
              height: '42px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            title={`Click to preview8 ${existingDocument.fileName}`}
            sx={{
              width: '42px',
              height: '42px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#666',
            }}
          >
            {fileExtension}
          </Box>
        )}
      </Box>
    );
    // eslint-disable-next-line
  }, [existingDocument]);

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
      const maxSizeInBytes = parseFloat(sizeRule.replace('kb', '')) * 1024;

      console.log('Size validation:', {
        maxSizeRule: sizeRule,
        maxSizeInBytes,
        actualFileSize: file.size,
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

  const isRequired =
    typeof required === 'string' ? required === 'true' : required;

  return (
    <Box
      className={className}
      sx={{ display: 'flex', flexDirection: 'column', ...sx }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {label && (
          <FormLabel
            htmlFor={inputId}
            required={isRequired}
            sx={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Gilroy',
              color: '#333',
              marginBottom: 1,
              '& .MuiFormLabel-asterisk': {
                color: '#d32f2f',
              },
            }}
          >
            {label}
            {/* {required && (
            <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span>
          )} */}
          </FormLabel>
        )}
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <StyledUploadBox
          className={disabled ? 'disabled' : ''}
          onClick={() => !disabled && document.getElementById(inputId)?.click()}
          sx={{ flex: 1 }}
        >
          <img src={UploadIcon} alt="" />
          <Typography className="upload-text">Upload</Typography>

          <input
            id={inputId}
            type="file"
            onChange={handleFileChange}
            accept={accept}
            disabled={disabled}
            style={{ display: 'none' }}
            aria-describedby={selectedFile ? `${inputId}-filename` : undefined}
            aria-label={ariaLabel || `${label} file`}
          />
        </StyledUploadBox>

        {/* Show existing document if available and no new file selected */}
        {showExistingDocument && existingDocument && !selectedFile && (
          <Box sx={{ flexShrink: 0 }}>{ExistingDocumentPreview}</Box>
        )}
        {error}

        {/* Show newly selected file preview */}
        {selectedFile && (
          <Box sx={{ flexShrink: 0 }}>
            <FilePreview file={selectedFile} />
          </Box>
        )}
      </Box>

      {/* Document Preview Modal */}
      <DocumentPreview
        open={previewState.isOpen}
        onClose={closePreview}
        documentUrl={previewState.documentUrl}
        documentName={previewState.documentName}
        onDelete={handleDelete}
        onChange={handleChange}
        showDelete={disabled ? false : true}
        showChange={disabled ? false : true}
        previewState={existingDocument}
        selectedFileUrl={previewUrl}
      />
    </Box>
  );
};

export default UploadButton;
