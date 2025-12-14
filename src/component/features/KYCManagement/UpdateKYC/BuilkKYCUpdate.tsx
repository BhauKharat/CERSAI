import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Radio,
  Button,
  Alert,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

export interface BulkKYCSearchProps {
  onSearch?: (searchType: string, file: File) => void;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const BuilkKYCUpdate: React.FC<BulkKYCSearchProps> = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('individual');
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

  const handleSubmit = () => {
    if (uploadedFile && onSearch) {
      onSearch(searchType, uploadedFile);
    }
  };

  return (
    <Box>
      <FormControl component="fieldset">
        <RadioGroup
          row
          name="searchType"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <FormControlLabel
            value="individual"
            control={<Radio />}
            label="Individual"
          />
          <FormControlLabel
            value="legalEntity"
            control={<Radio />}
            label="Legal Entity"
          />
        </RadioGroup>
      </FormControl>

      <Typography variant="body1" sx={{ mt: 3, mb: 1, fontWeight: 'medium' }}>
        Upload Zip File
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          disabled={!uploadedFile}
          onClick={handleSubmit}
          type="submit"
          color="primary"
          className="buttonClass"
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default BuilkKYCUpdate;
