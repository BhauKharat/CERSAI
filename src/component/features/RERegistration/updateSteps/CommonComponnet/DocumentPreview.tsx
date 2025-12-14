import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { API_ENDPOINTS } from '../../../../../Constant';

// Styled components
const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: '1px solid #f0f0f0',
  fontSize: '18px',
  fontWeight: '600',
  fontFamily: 'Gilroy',
  color: '#333',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
}));

const DocumentImage = styled('img')(() => ({
  maxWidth: '100%',
  maxHeight: '500px',
  objectFit: 'contain',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: '1px solid #f0f0f0',
  gap: theme.spacing(2),
  justifyContent: 'flex-end',
}));

const DeleteButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  border: '1px solid #dc3545',
  color: '#dc3545',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: '#fff5f5',
    borderColor: '#dc3545',
  },
}));

const ChangeButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  borderRadius: theme.spacing(0.5),
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: '500',
  fontFamily: 'Gilroy',
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': {
    backgroundColor: '#001a8a',
  },
}));

const ErrorMessage = styled(Typography)(() => ({
  color: '#666',
  fontSize: '14px',
  fontFamily: 'Gilroy',
  textAlign: 'center',
}));

interface DocumentPreviewProps {
  open: boolean;
  onClose: () => void;
  documentUrl?: string;
  documentName?: string;
  onDelete?: () => void;
  onChange?: () => void;
  showDelete?: boolean;
  showChange?: boolean;
  previewState?: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  };
  selectedFileUrl?: string | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  open,
  onClose,
  documentUrl,
  documentName = 'Document Preview',
  onDelete,
  onChange,
  showDelete = true,
  showChange = true,
  previewState,
  selectedFileUrl,
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  const handleChange = () => {
    if (onChange) {
      onChange();
    }
    onClose();
  };

  const renderDocumentContent = () => {
    if (!documentUrl && !selectedFileUrl && !previewState?.dataUrl) {
      return <ErrorMessage>No document available for preview</ErrorMessage>;
    }

    const imagePattern = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    const pdfPattern = /\.pdf$/i;

    if (selectedFileUrl) {
      const normalizedName = documentName || '';
      const isImageUpload = imagePattern.test(normalizedName);
      const isPdfUpload =
        pdfPattern.test(normalizedName) ||
        selectedFileUrl.startsWith('data:application/pdf');

      if (isImageUpload) {
        return (
          <DocumentImage
            src={selectedFileUrl}
            alt={documentName || 'selected file'}
            onError={(e) => {
              console.error('Error loading selected image:', e);
            }}
          />
        );
      }

      if (isPdfUpload) {
        return (
          <iframe
            src={selectedFileUrl}
            width="100%"
            height="500px"
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
            title={documentName || 'Uploaded document'}
          />
        );
      }

      return (
        <Box textAlign="center" sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontFamily: 'Gilroy', color: '#333' }}
          >
            {documentName || 'Uploaded document'}
          </Typography>
          <ErrorMessage sx={{ mb: 3 }}>
            Preview not available for this file type
          </ErrorMessage>
          <Button
            variant="outlined"
            onClick={() => {
              const link = document.createElement('a');
              link.href = selectedFileUrl;
              link.download = documentName || 'document';
              link.click();
            }}
            sx={{
              fontFamily: 'Gilroy',
              textTransform: 'none',
              borderColor: '#002CBA',
              color: '#002CBA',
              '&:hover': {
                backgroundColor: '#f0f7ff',
              },
            }}
          >
            Download File
          </Button>
        </Box>
      );
    }

    // Check if previewState exists and has valid data before using it
    if (previewState?.dataUrl && previewState?.id) {
      // Prefer the stored base64/dataUrl from Redux to avoid iframe/domain issues
      const storedUrl =
        previewState.dataUrl ||
        `${API_ENDPOINTS.fetch_document}?id=${previewState.id}`;
      const storedIsImage = previewState?.mimeType?.startsWith('image/');
      const storedIsPdf = previewState?.mimeType === 'application/pdf';

      if (storedIsImage) {
        return (
          <DocumentImage
            src={storedUrl}
            alt={previewState.fileName}
            onError={(e) => {
              console.error('Error loading stored image:', e);
            }}
          />
        );
      }

      if (storedIsPdf) {
        return (
          <iframe
            src={storedUrl}
            width="100%"
            height="500px"
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
            title={previewState.fileName}
          />
        );
      }

      return (
        <Box textAlign="center" sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontFamily: 'Gilroy', color: '#333' }}
          >
            {previewState.fileName}
          </Typography>
          <ErrorMessage sx={{ mb: 3 }}>
            Preview not available for this file type
          </ErrorMessage>
          <Button
            variant="outlined"
            onClick={() => {
              const link = document.createElement('a');
              link.href = storedUrl;
              link.download = previewState.fileName || 'document';
              link.click();
            }}
            sx={{
              fontFamily: 'Gilroy',
              textTransform: 'none',
              borderColor: '#002CBA',
              color: '#002CBA',
              '&:hover': {
                backgroundColor: '#f0f7ff',
              },
            }}
          >
            Download File
          </Button>
        </Box>
      );
    }

    if (documentUrl) {
      const isImage =
        documentUrl.startsWith('data:image/') ||
        (documentUrl.startsWith('blob:') &&
          documentName?.match(imagePattern)) ||
        documentUrl.match(imagePattern) ||
        documentName?.match(imagePattern);

      if (isImage) {
        return (
          <DocumentImage
            src={documentUrl}
            alt={documentName}
            onError={(e) => {
              console.error('Error loading inline image:', e);
            }}
          />
        );
      }

      const isPdf =
        documentUrl.startsWith('data:application/pdf') ||
        documentUrl.match(pdfPattern) ||
        (documentUrl.startsWith('blob:') && documentName?.match(pdfPattern));

      if (isPdf) {
        return (
          <iframe
            src={documentUrl}
            width="100%"
            height="500px"
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
            title={documentName}
          />
        );
      }
    }

    const downloadUrl = documentUrl
      ? documentUrl
      : previewState?.id
        ? `${API_ENDPOINTS.fetch_document}?id=${previewState.id}`
        : (selectedFileUrl ?? '');

    // For other file types, show download option
    return (
      <Box textAlign="center" sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontFamily: 'Gilroy', color: '#333' }}
        >
          {documentName}
        </Typography>
        <ErrorMessage sx={{ mb: 3 }}>
          Preview not available for this file type
        </ErrorMessage>
        <Button
          variant="outlined"
          disabled={!downloadUrl}
          onClick={() => {
            if (!downloadUrl) {
              return;
            }
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = documentName || 'document';
            link.click();
          }}
          sx={{
            fontFamily: 'Gilroy',
            textTransform: 'none',
            borderColor: '#002CBA',
            color: '#002CBA',
            '&:hover': {
              backgroundColor: '#f0f7ff',
            },
          }}
        >
          Download File
        </Button>
      </Box>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        {documentName}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#666',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>{renderDocumentContent()}</StyledDialogContent>

      <StyledDialogActions>
        {showDelete && onDelete && (
          <DeleteButton
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </DeleteButton>
        )}

        {showChange && onChange && (
          <ChangeButton variant="contained" onClick={handleChange}>
            Change
          </ChangeButton>
        )}
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default DocumentPreview;
