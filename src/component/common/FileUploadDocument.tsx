/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, ChangeEvent, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  TextFieldProps,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import UploadIconButton from '../../assets/UploadIconButton.svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  labelStyles,
  inputStyles,
} from '../../component/features/MyTask/UpdateEntityProfile-prevo/RegionCreationRequest.style';

interface FileUploadProps {
  label: string;
  required?: boolean;
  documentType: string;
  base64Content?: string;
  fileName?: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFileRemove?: () => void; // New prop for delete functionality
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
  documentFileValue?: any;
  documentTouched?: boolean;
  documentError?: string;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
  label,
  required = false,
  documentType,
  base64Content,
  fileName,
  onFileChange,
  textFieldProps,
  disabled = false,
  documentTouched,
  documentError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBoardResolutionModalOpen, setIsBoardResolutionModalOpen] =
    useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreviewClick = () => {
    if (hasFile && !disabled) {
      setIsBoardResolutionModalOpen(true);
    }
  };

  const handleModalFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    setIsBoardResolutionModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsBoardResolutionModalOpen(false);
  };

  const hasFile = base64Content || fileName;
  const filePreviewSrc =
    base64Content && base64Content.startsWith('data:')
      ? base64Content
      : base64Content
        ? `data:image/jpeg;base64,${base64Content}`
        : null;

  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="body2" sx={labelStyles}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {textFieldProps ? (
          <TextField
            fullWidth
            {...textFieldProps}
            disabled={disabled}
            sx={inputStyles}
            InputProps={{
              ...textFieldProps.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleUploadClick}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': { background: 'none' },
                    }}
                  ></Button>
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Button
            variant="outlined"
            fullWidth
            disabled={disabled}
            sx={{
              height: '48px',
              color: '#002CBA',
              borderColor: disabled ? '#A9A9A9' : '#002CBA',
              textTransform: 'none',
            }}
            startIcon={
              <img
                src={UploadIconButton}
                alt="Upload"
                style={{ height: 24, width: 24, opacity: disabled ? 0.5 : 1 }}
              />
            }
            onClick={handleUploadClick}
          >
            {hasFile ? fileName || 'Upload' : 'Upload'}
          </Button>
        )}

        {hasFile && (
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ccc',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: filePreviewSrc ? 'transparent' : '#f5f5f5',
              cursor: 'pointer',
            }}
            onClick={handlePreviewClick}
          >
            {filePreviewSrc ? (
              <img
                src={filePreviewSrc}
                alt={`${label} Preview`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '10px',
                  textAlign: 'center',
                  color: 'text.secondary',
                  padding: '2px',
                }}
              >
                {fileName ? fileName.substring(0, 8) + '...' : 'File'}
              </Typography>
            )}
            {!textFieldProps && (
              <CheckCircleIcon
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  fontSize: 16,
                  color: 'success.main',
                  zIndex: 1,
                  borderRadius: '4px',
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* MUI Modal with Dialog */}
      <Dialog
        open={isBoardResolutionModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          backdropFilter: 'blur(5px)',
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            padding: '16px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px 8px 24px',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          {label} Preview
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: '10px 10px', textAlign: 'center' }}>
          <Box
            sx={{
              maxWidth: '100%',
              maxHeight: '60vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <img
              src={filePreviewSrc || ''}
              alt="Document Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: '16px 24px',
            gap: 2,
            justifyContent: 'right',
          }}
        >
          <input
            type="file"
            id={`${documentType}-upload-modal`}
            name={documentType}
            onChange={handleModalFileChange}
            disabled={disabled}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx"
          />

          {/* Delete Button with Icon */}
          <Button
            //onClick={handleDeleteClick}
            variant="outlined"
            startIcon={<DeleteForeverOutlinedIcon />}
            sx={{
              color: 'red',
              borderColor: 'red',
              '&:hover': {
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.04)',
              },
              fontWeight: 'bold',
              textTransform: 'none',
              minWidth: '140px', // Fixed width
              padding: '8px 24px',
              height: '40px',
            }}
          >
            Delete
          </Button>

          {/* Change Button */}
          <label htmlFor={`${documentType}-upload-modal`}>
            <Button
              component="span"
              variant="contained"
              sx={{
                backgroundColor: '#002CBA',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#001a75',
                },
                //fontWeight: 'bold',
                textTransform: 'none',
                minWidth: '140px', // Same width as Delete button
                padding: '8px 24px',
                height: '40px',
              }}
            >
              Change
            </Button>
          </label>
        </DialogActions>
      </Dialog>

      {/* ➡️ Added validation message for the file upload part */}
      {documentTouched && documentError && (
        <Typography
          color="error"
          variant="caption"
          sx={{ mt: 0.5, display: 'block' }}
        >
          {documentError}
        </Typography>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        disabled={disabled}
      />
    </Grid>
  );
};

export default FileUploadComponent;
