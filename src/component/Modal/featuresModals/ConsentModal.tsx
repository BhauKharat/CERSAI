import React, { useState, useRef, FC } from 'react';
import {
  // Modal as MuiModal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme, // Uncommented: Access MUI theme
  useMediaQuery,
  DialogContent,
  IconButton,
  Stack, // Uncommented: Check if screen is mobile size
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StyledModal, CloseButton, VisuallyHiddenInput } from './Modal.styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Define the props interface for the OTPModal component
export interface ConsentModalProps {
  open: boolean; // Controls the visibility of the modal
  onClose: () => void; // Callback function to close the modal
  onVerify: (otp: string) => Promise<boolean>; // Callback to verify the OTP, returns true if valid
  onResend: () => Promise<boolean>; // Callback to resend OTP, returns true if successful
  email: string; // User's email to display
  mobile: string; // User's mobile number to display
}

const ConsentModal: FC<ConsentModalProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false); // State for verification loading indicator
  const theme = useTheme(); // Access MUI theme - UNCOMMENTED
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 1 * 1024 * 1024) {
        alert('File size should not exceed 1MB.');
        return;
      }
      setUploadedFile(file);
    }
  };
  // Handler for OTP verification
  const handleVerify = async () => {
    setLoading(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.size > 1 * 1024 * 1024) {
        alert('File size should not exceed 1MB.');
        return;
      }
      setUploadedFile(file);
    }
  };

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBackdropClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  return (
    <StyledModal
      open={open}
      onClose={handleBackdropClick}
      fullScreen={fullScreen}
      disableEscapeKeyDown
      aria-labelledby="otp-modal-title"
      aria-describedby="otp-modal-description"
      PaperProps={{
        sx: {
          borderRadius: '4px',
          background: '#F8F9FD',
          boxShadow: '0 11px 23px 0 rgba(0, 0, 0, 0.06)',
          height: 'auto',
          width: isMobile ? 'auto' : '500px', // Set a max width for desktop
        },
      }}
    >
      <CloseButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
        }}
      >
        <CloseIcon />
      </CloseButton>
      <DialogContent onClick={handleClose}>
        {/* Header section with title and close button */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            id="otp-modal-title"
            variant="h6"
            component="h2"
            fontWeight="bold"
            sx={{ pr: 2 }} // Add some padding to prevent overlap
          >
            Please upload client-signed consent document
          </Typography>
          {/* <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton> */}
        </Box>

        {/* "Mobile/Email OTP*" Label */}
        <Typography variant="subtitle2" fontWeight="medium" mb={1}>
          Upload File
        </Typography>

        {uploadedFile ? (
          <Alert
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            action={
              <Box>
                <Button
                  color="inherit"
                  size="small"
                  sx={{ textTransform: 'none', textDecoration: 'underline' }}
                >
                  View
                </Button>
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => setUploadedFile(null)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            sx={{ '.MuiAlert-message': { width: '100%' } }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Zip File Uploaded
            </Typography>
            <Typography variant="body2">{uploadedFile.name}</Typography>
          </Alert>
        ) : (
          <Box
            sx={{
              border: '2px dashed #e0e0e0',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Typography variant="body1" color="textSecondary">
              Drag & Drop your files here or
            </Typography>
            <Button
              component="label"
              variant="outlined"
              sx={{ mt: 2, textTransform: 'none' }}
              startIcon={<CloudUploadIcon />}
            >
              Upload
              <VisuallyHiddenInput
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".zip"
              />
            </Button>
            <Typography
              variant="caption"
              display="block"
              color="textSecondary"
              mt={1}
            >
              1MB max file size
            </Typography>
          </Box>
        )}

        {/* Action buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              py: 1.5,
              fontWeight: 'medium',
              color: '#000',
              borderColor: '#ccc',
              '&:hover': {
                borderColor: '#000',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerify}
            disabled={loading || !uploadedFile} // Disable if no file is uploaded
            sx={{
              py: 1.5,
              fontWeight: 'medium',
              backgroundColor: '#1a73e8', // Use a more standard blue
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Submit'
            )}
          </Button>
        </Stack>
      </DialogContent>
    </StyledModal>
  );
};

export default ConsentModal;
