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
import { API_ENDPOINTS } from '../../../../Constant';

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
  // onChange,
  showDelete = true,
  // showChange = true,
  previewState,
  selectedFileUrl,
}) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  // const handleChange = () => {
  //   if (onChange) {
  //     onChange();
  //   }
  //   onClose();
  // };

  const renderDocumentContent = () => {
    console.log('previewState=====', previewState);
    if (!documentUrl) {
      return <ErrorMessage>No document available for preview</ErrorMessage>;
    }

    if (selectedFileUrl) {
      const isSelectedPdf =
        /^data:application\/pdf/i.test(selectedFileUrl) ||
        /\.pdf$/i.test(documentName || '') ||
        /pdf/i.test(previewState?.mimeType || '');

      if (isSelectedPdf) {
        // Render PDF preview for blob/data/pdf
        const pdfSrc = selectedFileUrl;
        return (
          <object
            data={pdfSrc}
            type="application/pdf"
            width="100%"
            height="500px"
            style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}
          >
            <iframe
              src={pdfSrc}
              width="100%"
              height="500px"
              style={{ border: 0 }}
              title={documentName}
            />
            <Box textAlign="center" sx={{ p: 2 }}>
              <ErrorMessage sx={{ mb: 1 }}>
                PDF preview not available. You can download the file instead.
              </ErrorMessage>
              <Button
                variant="outlined"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = pdfSrc;
                  a.download = (
                    /\.pdf$/i.test(documentName || '')
                      ? documentName
                      : `${documentName || 'document'}.pdf`
                  ) as string;
                  a.click();
                }}
                sx={{
                  fontFamily: 'Gilroy',
                  textTransform: 'none',
                  borderColor: '#002CBA',
                  color: '#002CBA',
                  '&:hover': { backgroundColor: '#f0f7ff' },
                }}
              >
                Download PDF
              </Button>
            </Box>
          </object>
        );
      }

      return (
        <DocumentImage
          src={selectedFileUrl}
          alt={'selected file'}
          onError={(e) => {
            console.error('Error loading image:', e);
          }}
        />
      );
    }

    if (previewState?.dataUrl) {
      const src = `${API_ENDPOINTS.fetch_document}?id=${previewState.id}`;
      const name = previewState.fileName || 'Document';
      const isPdf =
        /pdf/i.test(previewState?.mimeType || '') || /\.pdf$/i.test(name);

      if (isPdf) {
        return (
          <object
            data={src}
            type="application/pdf"
            width="100%"
            height="500px"
            style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}
          >
            {/* Fallback if the browser can't display PDFs or the server blocks embedding */}
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
          </object>
        );
      }

      return (
        <DocumentImage
          src={API_ENDPOINTS.fetch_document + '?id=' + previewState.id}
          alt={previewState.fileName}
          onError={(e) => {
            console.error('Error loading image:', e);
          }}
        />
      );
    }

    // Check if it's an image (base64 or blob URL)
    if (
      documentUrl.startsWith('data:image/') ||
      documentUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ||
      (documentUrl.startsWith('blob:') &&
        documentName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i))
    ) {
      return (
        <DocumentImage
          src={API_ENDPOINTS.fetch_document + '?id=' + documentUrl}
          alt={documentName}
          onError={(e) => {
            console.error('Error loading image:', e);
          }}
        />
      );
    }

    // Check if it's a PDF
    // if (
    //   documentUrl.startsWith('data:application/pdf') ||
    //   documentUrl.match(/\.pdf$/i) ||
    //   (documentUrl.startsWith('blob:') && documentName?.match(/\.pdf$/i))
    // ) {
    //   return (
    //     <iframe
    //       src={documentUrl}
    //       width="100%"
    //       height="500px"
    //       style={{
    //         border: '1px solid #e0e0e0',
    //         borderRadius: '8px',
    //       }}
    //       title={documentName}
    //     />
    //   );
    // }

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
          onClick={() => {
            const link = document.createElement('a');
            link.href = documentUrl;
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
        <ChangeButton variant="contained" onClick={onClose}>
          Close
        </ChangeButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default DocumentPreview;
