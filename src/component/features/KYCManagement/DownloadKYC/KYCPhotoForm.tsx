import React, {
  ChangeEvent,
  useState,
  useRef,
  FormEvent,
  useEffect,
} from 'react';
import { Grid, TextField, Button, Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { type KYCPhotoFormProps, type KYCPhoto } from '../KYC.types';
import styles from './DownloadKYC.module.css';

const KYCPhotoForm: React.FC<KYCPhotoFormProps> = ({
  onSearch,
  loading,
  onReset,
}) => {
  const [formData, setFormData] = useState<Omit<KYCPhoto, 'photo'>>({
    firstName: '',
    middleName: '',
    lastName: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setFormData({ firstName: '', middleName: '', lastName: '' });
    setFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onReset]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validation: At least one field must be filled
    const anyFilled = Object.values(formData).some((v) => v.trim() !== '');
    if (!anyFilled) {
      setError(true);
      return;
    }
    setError(false);
    onSearch({
      ...formData,
      photo: file,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className={styles.kycForm}>
      <Grid container spacing={2} className={styles.mb3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography className={styles.kycLabel}>First Name</Typography>
          <TextField
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            size="small"
            fullWidth
            placeholder="Enter first name"
            className="textFieldStyles"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography className={styles.kycLabel}>Middle Name</Typography>
          <TextField
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            size="small"
            fullWidth
            placeholder="Enter middle name"
            className="textFieldStyles"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography className={styles.kycLabel}>Last Name</Typography>
          <TextField
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            size="small"
            fullWidth
            placeholder="Enter last name"
            className="textFieldStyles"
          />
        </Grid>
      </Grid>
      <Box className={styles.mb3}>
        <Typography className={styles.kycUploadLabel}>Upload File</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            className={styles.uploadButton}
          >
            <CloudUploadIcon className={styles.uploadIcon} />
            Upload
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </Button>
          {preview && (
            <Box className={styles.previewBox}>
              <img
                src={preview}
                alt="Preview"
                className={styles.previewImage}
              />
              <CheckCircleIcon className={styles.previewCheckIcon} />
            </Box>
          )}
        </Box>
      </Box>
      <Box className={styles.mb3}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          className="buttonClass"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'error.main',
              mt: 1,
              fontWeight: 500,
            }}
          >
            Please fill at least one field before searching.
          </Typography>
        </Grid>
      )}
    </Box>
  );
};

export default KYCPhotoForm;
