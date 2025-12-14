/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextFieldProps,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  labelStyles,
  inputStyles,
} from '../features/MyTask/UpdateEntityProfile-prevo/RegionCreationRequest.style';
import upploadlight from '../../assets/uploadlight.png';
import uploadlightbg from '../../assets/uploadlightbg.png';
interface FileTagProps {
  label: string;
  required?: boolean;
  name: string;
  disabled?: boolean;
  fileData: any;
  previewUrl: string | null;
  textFieldProps?: TextFieldProps;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType?: string,
    docNum?: number
  ) => void;
  fileType?: string;
  docNum: number;
  acceptedTypes?: string;
  uploadIcon: string;
  error?: string;
}

const FileTag: React.FC<FileTagProps> = ({
  label,
  required = false,
  name,
  disabled = false,
  fileData,
  previewUrl,
  onChange,
  textFieldProps,
  fileType,
  docNum,
  acceptedTypes = '.pdf,.jpg,.jpeg,application/pdf,image/jpeg',
  uploadIcon,
  error,
}) => {
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleUploadClick = () => {
    const fileInput = document.getElementById(
      `upload-${name}`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onChange(event, fileType, docNum);
    }
    setFileInputKey((prev) => prev + 1);
  };

  const handleModalFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      onChange(event, fileType, docNum);
    }
    setFileInputKey((prev) => prev + 1);
  };

  // Keyboard event handlers for accessibility
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleUploadClick();
    }
  };

  // Get the current preview source - FIXED LOGIC
  const getPreviewSrc = () => {
    // First check if we have a previewUrl (for newly uploaded files)
    if (previewUrl) return previewUrl;

    // Then check if we have fileData with base64Content (for existing files)
    if (fileData?.base64Content) {
      // If base64Content already starts with data: or /, return as is
      if (
        fileData.base64Content.startsWith('data:') ||
        fileData.base64Content.startsWith('/')
      ) {
        return `data:image/jpeg;base64,${fileData.base64Content}`;
      }
      // Otherwise, assume it's a base64 string and format it properly
    }

    return '';
  };
  const uploadButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    color: '#002cba',
    border: '1.5px solid #002cba',
    padding: '12px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '12px',
    transition: 'background-color 0.2s',
    height: '48px',
    flex: 1,
    boxSizing: 'border-box',
    textAlign: 'center',
    minWidth: 0,
    textTransform: 'none' as const,
    '&:hover': {
      backgroundColor: '#e8ecff',
      border: '1.5px solid #0020a8',
    },
    '&.Mui-disabled': {
      backgroundColor: '#ffffff',
      color: 'rgba(0, 0, 0, 0.26)',
      border: '1.5px solid #D9D9D9',
      cursor: 'not-allowed',
      '& img': {
        opacity: 0.6,
      },
    },
  };

  const previewSrc = getPreviewSrc();

  // FIXED: Check if we have any file data or preview URL
  const hasFile = fileData != null || previewUrl !== null || previewSrc !== '';

  return (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Typography
        variant="body2"
        sx={labelStyles}
        //className="Gilroy-SemiBold font-16 margin-bottom-10px"
      >
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      <Box>
        <input
          key={fileInputKey}
          type="file"
          id={`upload-${name}`}
          name={name}
          disabled={disabled}
          onChange={handleFileChange}
          accept={acceptedTypes}
          className="hidden-upload"
          style={{ display: 'none' }}
        />
        {textFieldProps ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              sx={inputStyles}
              {...textFieldProps}
              disabled={disabled}
              InputProps={{
                ...textFieldProps.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      onClick={handleUploadClick}
                      onKeyPress={handleKeyPress}
                      disabled={disabled}
                      sx={{
                        p: 0,
                        minWidth: 'auto',
                        paddingRight: '8px',
                        '&:hover': { background: 'none' },
                      }}
                      aria-label={`Upload ${label}`}
                    >
                      <img
                        src={disabled ? upploadlight : uploadIcon}
                        alt="Upload"
                        style={{
                          width: '46px',
                          height: '410px',
                          objectFit: 'contain',
                          padding: 0,
                        }}
                      />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            {/* Preview for TextField version - on the same line */}
            {hasFile && (
              <Button
                className="preview-box"
                onClick={handleUploadClick}
                onKeyPress={handleKeyPress}
                disabled={disabled}
                sx={{
                  marginBottom: '5px',
                  flexShrink: 0,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { background: 'none' },

                  height: '50px',
                  color: '#002CBA',
                  borderColor: disabled ? '#A9A9A9' : '#002CBA',
                  textTransform: 'none',
                }}
                aria-label={`Change ${label} document`}
              >
                {previewSrc &&
                (previewSrc.startsWith('data:image') ||
                  previewSrc.startsWith('/') ||
                  fileData?.fileType?.includes('image')) ? (
                  <img
                    src={previewSrc}
                    alt="File Preview"
                    className="preview-img"
                    style={{
                      cursor: 'pointer',
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#f2f2f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '12px' }}>PDF</span>
                  </div>
                )}
                <span className="tick-icon">
                  <CheckCircleIcon />
                </span>
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              component="label"
              htmlFor={`upload-${name}`}
              onClick={handleUploadClick}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              sx={uploadButtonStyles}
              aria-label={`Upload ${label}`}
            >
              <img
                src={disabled ? uploadlightbg : uploadIcon}
                alt="Upload"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                }}
              />
              <Typography variant="body2" sx={{ fontSize: '13px', ml: 0.5 }}>
                Upload
              </Typography>
            </Button>

            {hasFile && (
              <Button
                className="preview-box"
                onClick={handleUploadClick}
                onKeyPress={handleKeyPress}
                disabled={disabled}
                sx={{
                  marginBottom: '5px',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { background: 'none' },
                  '&.Mui-disabled': {
                    color: 'rgba(0, 0, 0, 0.26)',
                    backgroundColor: disabled ? 'white' : '',
                    borderColor: disabled ? '#D9D9D9' : '',
                  },
                }}
                aria-label={`Change ${label} document`}
              >
                {/* FIXED: Check if previewSrc is an image or PDF */}
                {previewSrc &&
                (previewSrc.startsWith('data:image') ||
                  previewSrc.startsWith('/') ||
                  fileData?.fileType?.includes('image')) ? (
                  <img
                    src={previewSrc}
                    alt="File Preview"
                    className="preview-img"
                    style={{
                      cursor: 'pointer',
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                    }}
                    //style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#f2f2f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <span>PDF</span>
                  </div>
                )}
                <span className="tick-icon">
                  <CheckCircleIcon />
                </span>
              </Button>
            )}
          </Box>
        )}
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}

      {/* Hidden file input for change functionality */}
      <input
        key={`modal-${fileInputKey}`}
        type="file"
        id={`${name}-upload-modal`}
        name={name}
        onChange={handleModalFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
        accept={acceptedTypes}
      />
    </Box>
  );
};

export default FileTag;
