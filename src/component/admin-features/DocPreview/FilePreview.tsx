/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';
import { Snackbar, Alert } from '@mui/material';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

interface FilePreviewProps {
  base64String?: string;
  mimeType?: string;
  fileName?: string;
  style?: React.CSSProperties;
  fileIcon?: boolean;
  onlyIcon?: boolean;
}

const StyledBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  background-color: white; /* Changed from bgcolor for CSS syntax */
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2); /* Replaced box-shadow: 24 with a CSS equivalent */
  padding: 16px 0;
  max-height: 90vh;
  overflow-y: auto;
`;

const FileLinkButton = styled(Button)`
  padding: 0;
  min-width: auto;
  text-transform: none;
  justify-content: flex-start;
  &:hover {
    background-color: transparent;
  }
`;

const FileNameWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  justifyContent: 'space-between',
}));

const FilePreview: React.FC<FilePreviewProps> = ({
  base64String,
  mimeType = 'application/pdf',
  fileName = 'document',
  style,
  fileIcon,
  onlyIcon,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detectedType, setDetectedType] = useState<'pdf' | 'image' | 'unknown'>(
    'unknown'
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (!base64String) {
      setDetectedType('unknown');
      return;
    }

    try {
      if (atob(base64String.substring(0, 10)).includes('%PDF-')) {
        setDetectedType('pdf');
      } else if (
        base64String.startsWith('/9j/') ||
        base64String.startsWith('iVBOR') ||
        base64String.startsWith('R0lGOD')
      ) {
        setDetectedType('image');
      } else {
        if (mimeType?.includes('pdf')) {
          setDetectedType('pdf');
        } else if (mimeType?.includes('image')) {
          setDetectedType('image');
        } else {
          setDetectedType('unknown');
        }
      }
    } catch (error) {
      console.error('Error detecting file type:', error);
      setDetectedType('unknown');
    }
  }, [base64String, mimeType]);

  const handlePreview = () => {
    if (!base64String) {
      setSnackbar({
        open: true,
        message: 'No file available for preview',
        severity: 'warning',
      });
      return;
    }
    setIsModalVisible(true);
  };

  const handleDownload = () => {
    if (!base64String) return;

    try {
      let fileType = 'application/octet-stream';

      if (detectedType === 'pdf') {
        fileType = 'application/pdf';
      } else if (detectedType === 'image') {
        if (base64String.startsWith('iVBOR')) {
          fileType = 'image/png';
        } else if (base64String.startsWith('R0lGOD')) {
          fileType = 'image/gif';
        } else {
          fileType = 'image/jpeg';
        }
      }

      const link = document.createElement('a');
      link.href = `data:${fileType};base64,${base64String}`;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error',
      });
    }
  };

  const renderPreview = () => {
    if (!base64String) return <Typography>No file available</Typography>;

    try {
      switch (detectedType) {
        case 'pdf':
          return (
            <Box
              component="iframe"
              src={`data:application/pdf;base64,${base64String}#toolbar=0&navpanes=0&scrollbar=0`}
              sx={{ width: '100%', height: '80vh', border: 'none' }}
              title="PDF Preview"
            />
          );
        case 'image':
          let imageMimeType = 'image/jpeg';
          if (base64String.startsWith('iVBOR')) imageMimeType = 'image/png';
          else if (base64String.startsWith('R0lGOD'))
            imageMimeType = 'image/gif';

          return (
            <Box
              sx={{
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={`data:${imageMimeType};base64,${base64String}`}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            </Box>
          );
        default:
          return (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography>Preview not available for this file type</Typography>
              <Button
                variant="contained"
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
                sx={{ mt: 2 }}
              >
                Download File
              </Button>
            </Box>
          );
      }
    } catch (error) {
      console.error('Error rendering preview:', error);
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography>Error loading preview</Typography>
          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            sx={{ mt: 2 }}
          >
            Download File
          </Button>
        </Box>
      );
    }
  };

  const renderIcon = () => {
    const iconStyle = {
      fontSize: '16px',
      marginRight: '8px',
      cursor: 'pointer',
    };

    switch (detectedType) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ ...iconStyle, color: '#ff4d4f' }} />;
      case 'image':
        return <RemoveRedEyeOutlinedIcon sx={{ ...iconStyle }} />;
      default:
        return <InsertDriveFileIcon sx={iconStyle} />;
    }
  };

  if (!base64String) {
    return <Box sx={{ ...style }}>No file available</Box>;
  }

  return (
    <>
      <FileNameWrapper>
        <FileLinkButton
          onClick={fileIcon ? () => {} : handlePreview}
          sx={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            color: onlyIcon ? '#000' : 'primary.main',
            cursor: onlyIcon || fileIcon ? 'default' : 'pointer',
          }}
          aria-label={`View ${fileName}`}
        >
          <Box
            component="span"
            sx={{
              color: 'text.main',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Gilroy',
            }}
          >
            {fileName || 'View File'}
          </Box>
        </FileLinkButton>
        {fileIcon ? (
          <RemoveRedEyeOutlinedIcon
            onClick={handlePreview}
            sx={{ fontSize: '24px', marginRight: '8px', cursor: 'pointer' }}
          />
        ) : (
          <></>
        )}
      </FileNameWrapper>

      <Modal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        aria-labelledby="file-preview-title"
        aria-describedby="file-preview-description"
      >
        <StyledBox>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              pr: 2,
              padding: '0 20px',
            }}
          >
            <Typography
              sx={{ fontFamily: 'Gilroy', fontWeight: 600, fontSize: '16px' }}
              id="file-preview-title"
              variant="h6"
              component="h2"
            >
              {fileName || 'File Preview'}
            </Typography>
            {/* <Tooltip title="Download">
              <IconButton onClick={handleDownload} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip> */}
            <Tooltip title="Close">
              <IconButton
                onClick={() => setIsModalVisible(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box id="file-preview-description">{renderPreview()}</Box>
        </StyledBox>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FilePreview;
