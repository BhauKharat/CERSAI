import React, { useState } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import UploadIcon from '../../../../../assets/UploadIconButton.svg';
import TickCircle from '../../../../../assets/tick-circle.svg';
import { API_ENDPOINTS } from '../../../../../Constant';
import DocumentPreview from '../CommonComponnet/DocumentPreview';
import { useDocumentPreview } from '../../CommonComponent/useDocumentPreview';

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

interface UploadButtonUpdateProps {
  label?: string;
  onUpload: (file: File | null) => void;
  onDelete?: () => void;
  onDeleteDocument?: () => void;
  accept?: string;
  disabled?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  showPreview?: boolean;
  required?: boolean;
  'aria-label'?: string;
  // Props for existing document display
  existingDocument?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
  showExistingDocument?: boolean;
  validationRules?: ValidationRules;
  onValidationError?: (error: string | null) => void;
}

const UploadButtonUpdate: React.FC<UploadButtonUpdateProps> = ({
  label = 'Upload',
  onUpload,
  onDeleteDocument,
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
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isDocumentDeleted, setIsDocumentDeleted] = useState<boolean>(false);

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
      onDeleteDocument?.();
    },
    onChange: () => {
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

  // File validation function
  const validateFile = (file: File): string | null => {
    if (!validationRules) {
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
          opacity: 1,
          '&:hover': {
            opacity: 0.9,
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
            title={file.name}
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
            title={file.name}
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
        <Box
          component="img"
          src={TickCircle}
          alt="Success"
          sx={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '12px',
            height: '12px',
            zIndex: 2,
          }}
        />
      </Box>
    );
  };

  // Component to display existing document from API - now clickable for preview
  const ExistingDocumentPreview = () => {
    if (!existingDocument) return null;

    const isImage = existingDocument.mimeType.startsWith('image/');
    const fileExtension =
      existingDocument.fileName.split('.').pop()?.toUpperCase() || 'FILE';

    const handlePreviewClick = () => {
      if (!existingDocument) return;
      openPreview(existingDocument.dataUrl, existingDocument.fileName);
    };

    return (
      <Box
        onClick={handlePreviewClick}
        sx={{
          position: 'relative',
          width: '42px',
          height: '42px',
          flexShrink: 0,
          cursor: 'pointer', // Always show pointer - preview is always available
          opacity: disabled ? 0.8 : 1,
          '&:hover': {
            opacity: 0.9,
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
            title={`Click to preview ${existingDocument.fileName}`}
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
            title={`Click to preview ${existingDocument.fileName}`}
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
        <Box
          component="img"
          src={TickCircle}
          alt="Existing Document"
          sx={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '12px',
            height: '12px',
            zIndex: 2,
          }}
        />
      </Box>
    );
  };

  return (
    <Box
      className={className}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, ...sx }}
    >
      {label && (
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Gilroy',
            color: '#333',
            marginBottom: 0.5,
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span>
          )}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Only show upload button if NOT disabled */}
        {!disabled && (
          <Box
            sx={{
              border: '1px solid #002CBA',
              borderRadius: '4px',
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              cursor: 'pointer',
              flex: 1,
              '&:hover': {
                backgroundColor: '#f8f9ff',
                borderColor: '#1565c0',
              },
            }}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <img src={UploadIcon} alt="" width="20" height="20" />
            <Typography
              sx={{
                fontSize: '14px',
                fontFamily: 'Gilroy',
                color: '#002CBA',
                fontWeight: '500',
              }}
            >
              Upload
            </Typography>

            <input
              id={inputId}
              type="file"
              hidden
              onChange={handleFileChange}
              accept={accept}
              disabled={disabled}
              aria-describedby={
                selectedFile ? `${inputId}-filename` : undefined
              }
              aria-label={ariaLabel || `${label} file`}
            />
          </Box>
        )}

        {/* Show existing document if available and no new file selected and not deleted */}
        {showExistingDocument &&
          existingDocument &&
          !selectedFile &&
          !isDocumentDeleted && (
            <Box sx={{ flexShrink: 0 }}>
              <ExistingDocumentPreview />
            </Box>
          )}

        {/* Show newly selected file preview */}
        {selectedFile && (
          <Box sx={{ flexShrink: 0 }}>
            <FilePreview file={selectedFile} />
          </Box>
        )}
      </Box>

      {/* Error message display */}
      {fileError && (
        <Typography
          sx={{
            fontSize: '12px',
            fontFamily: 'Gilroy',
            color: '#d32f2f',
            marginTop: '8px',
          }}
        >
          {fileError}
        </Typography>
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

export default UploadButtonUpdate;
