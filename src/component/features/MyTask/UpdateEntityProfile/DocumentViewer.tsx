import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DocumentDetails } from './types/getApplicationTypes';

interface DocumentViewerProps {
  document: DocumentDetails | null;
  documentType: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  documentType,
}) => {
  const [open, setOpen] = useState(false);

  console.log(
    'DocumentViewer rendered for:',
    documentType,
    'with document:',
    document
  );

  const handleOpen = () => {
    if (document && document.base64Content) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Convert base64 to image URL
  const getImageUrl = (base64Content: string) => {
    // Check if base64 already has data URL prefix
    if (base64Content.startsWith('data:')) {
      return base64Content;
    }
    // Assume it's an image (you might want to detect the actual MIME type)
    return `data:image/jpeg;base64,${base64Content}`;
  };

  if (!document || !document.base64Content) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 20,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '2px',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              height: '2px',
              backgroundColor: '#ccc',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '6px',
              left: '2px',
              right: '2px',
              height: '1px',
              backgroundColor: '#ccc',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '9px',
              left: '2px',
              right: '2px',
              height: '1px',
              backgroundColor: '#ccc',
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Tooltip title={`View ${documentType} document`}>
        <Box
          onClick={handleOpen}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#e8f4fd',
            border: '1px solid #3498db',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              backgroundColor: '#d4edda',
              borderColor: '#28a745',
            },
          }}
        >
          <img
            src={getImageUrl(document.base64Content)}
            alt={documentType}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'cover',
              borderRadius: '2px',
            }}
            onError={(e) => {
              // Fallback to document icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <VisibilityIcon sx={{ color: 'white', fontSize: 16 }} />
          </Box>
        </Box>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Gilroy, sans-serif',
            fontWeight: 600,
            color: '#2c3e50',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            {documentType} - {document.fileName}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <img
              src={getImageUrl(document.base64Content)}
              alt={documentType}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '4px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </Box>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: '#7f8c8d', fontFamily: 'Gilroy, sans-serif' }}
            >
              File: {document.fileName} | Size:{' '}
              {(document.fileSize / 1024).toFixed(2)} KB
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentViewer;
