import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableContainer,
  TableHead,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import deleteIcon from '../../../../assets/delete_icon.svg';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// Import all styled components from the dedicated styles file
import {
  MainContainer,
  FormWrapper,
  ActionButton,
  BrowseButton,
  StyledTableHeadCell,
  StyledTableCell,
} from '../style/ViewWhitelistedIPs.styles';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import {
  fetchPublicKeyData,
  uploadPublicKeyFile,
  createReplacePublicKey,
  deletePublicKey,
  clearPublicKeyState,
} from '../slices/ipWhitelistingSlice';

import NavigationBreadCrumb from '../../../features/UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import RemarkForRejectionModal from '../../../common/modals/RemarkForRejectionModal';
import SuccessModal from '../../../ui/Modal/SuccessModal';
import DateUtils from '../../../../utils/dateUtils';

const UploadPublicKey = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const {
    publicKeyData,
    publicKeyLoading,
    publicKeyError,
    uploadedPublicKeyId,
  } = useAppSelector((state) => state.ipWhitelisting);

  // Local state for the form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isSubmitSuccessModalOpen, setSubmitSuccessModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [isDeleteSuccessModalOpen, setDeleteSuccessModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date validation limits
  const minDate = dayjs().subtract(18, 'year');
  const maxDate = dayjs().add(100, 'year');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing public key data on component mount
  useEffect(() => {
    dispatch(fetchPublicKeyData());

    // Cleanup on unmount
    return () => {
      dispatch(clearPublicKeyState());
    };
  }, [dispatch]);

  // Handle success modal close and reset form
  const handleSubmitSuccessModalClose = () => {
    setSubmitSuccessModalOpen(false);
    setSelectedFile(null);
    setFromDate(null);
    setToDate(null);
    // Refresh the public key data
    dispatch(fetchPublicKeyData());
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.cer')) {
        alert('Please upload only .cer files');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        setIsUploading(true);
        await dispatch(uploadPublicKeyFile(selectedFile)).unwrap();
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    // Public key ID comes from Upload API only (uploadedPublicKeyId)
    if (!uploadedPublicKeyId || !fromDate || !toDate) {
      alert('Please upload a file and select validity dates');
      return;
    }

    if (
      fromDate.isBefore(minDate) ||
      fromDate.isAfter(maxDate) ||
      toDate.isBefore(minDate) ||
      toDate.isAfter(maxDate)
    ) {
      alert('Date must be between 18 years ago and 100 years in the future');
      return;
    }

    try {
      // Clear any previous error
      setSubmitError(null);
      setIsSubmitting(true);

      await dispatch(
        createReplacePublicKey({
          publicKeyId: uploadedPublicKeyId,
          validFrom: fromDate.toISOString(),
          validTill: toDate.toISOString(),
          fileName: selectedFile?.name,
        })
      ).unwrap();

      // Show success modal
      setSubmitSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error('Submit failed:', error);
      // Handle the error and show in Alert box
      // When unwrap() throws, it throws the rejectWithValue payload directly
      // If it's a string, use it directly; otherwise try to extract message from object
      let message = 'Something went wrong. Please try again.';
      if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        const err = error as { message?: string; error?: { message?: string } };
        message = err?.error?.message || err?.message || message;
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKey = () => {
    setDeleteConfirmModalOpen(true);
  };

  const handleDeleteConfirmSubmit = async () => {
    const id = publicKeyData?.id;

    if (!id) {
      console.error('No ID found for deletion');
      return;
    }

    try {
      // Call delete API: DELETE /api/v1/ip-whitelisting/{id}/public-key/remove
      await dispatch(deletePublicKey({ id })).unwrap();

      // Close the confirmation modal after API success
      setDeleteConfirmModalOpen(false);

      // Open the success modal
      setDeleteSuccessModalOpen(true);
    } catch (error) {
      console.error('Error deleting public key:', error);
      // Keep the modal open on error so user can retry
    }
  };

  // A type-safe handler for the DatePicker change event
  const handleDateChange = (
    newValue: unknown,
    setter: React.Dispatch<React.SetStateAction<Dayjs | null>>
  ) => {
    if (dayjs.isDayjs(newValue) || newValue === null) {
      setter(newValue);
    }
  };

  // Determine if form should be disabled (when existing key exists from GET API)
  // If data available from GET API -> disable everything
  // If no data from GET API -> enable everything
  const hasExistingKey = !!publicKeyData;
  const isFormDisabled = hasExistingKey;

  // Upload button: disabled if no file selected, or already uploaded, or form is disabled, or loading
  const isUploadDisabled =
    !selectedFile ||
    !!uploadedPublicKeyId ||
    isFormDisabled ||
    publicKeyLoading;

  // Submit button: disabled if public key data exists (form disabled), or no uploaded key ID, or dates not selected, or loading
  const isSubmitDisabled =
    isFormDisabled ||
    !uploadedPublicKeyId ||
    !fromDate ||
    !toDate ||
    publicKeyLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MainContainer>
        <NavigationBreadCrumb
          crumbsData={[
            { label: 'IP Whitelisting' },
            { label: 'Upload / Replace Public Key' },
          ]}
        />

        <Typography variant="h5" sx={{ fontWeight: 600, mt: 3, mb: 3 }}>
          Upload/Replace Public Key
        </Typography>

        {/* Error Alert */}
        {(publicKeyError || submitError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError || publicKeyError}
          </Alert>
        )}

        {/* Loading State */}
        {publicKeyLoading && !selectedFile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <FormWrapper>
          {/* File Upload Section */}
          <Box>
            <Typography
              component="label"
              sx={{ fontWeight: 600, color: '#1A1A1A' }}
            >
              Upload Public Key <span style={{ color: 'red' }}>*</span>
              <Typography
                component="span"
                sx={{ color: 'text.secondary', ml: 1, fontWeight: 500 }}
              >
                [Please upload .cer file]
              </Typography>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <TextField
                // fullWidth
                size="small"
                variant="outlined"
                value={selectedFile?.name || ''}
                placeholder={
                  isFormDisabled
                    ? publicKeyData?.fileName || 'protean.cer'
                    : 'Browse files to upload'
                }
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <BrowseButton
                        variant="outlined"
                        onClick={handleBrowseClick}
                        disabled={isFormDisabled}
                        sx={{ width: '84px', height: '32px', color: '#999999' }}
                      >
                        Browse
                      </BrowseButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: '433px',
                  '& .MuiOutlinedInput-root': {
                    height: '48px',
                  },
                  backgroundColor: isFormDisabled ? '#F5F5F5' : 'transparent',
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".cer"
                style={{ display: 'none' }}
              />
              <ActionButton onClick={handleUpload} disabled={isUploadDisabled}>
                {isUploading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Upload'
                )}
              </ActionButton>
            </Box>
          </Box>

          {/* Validity Period Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              component="label"
              sx={{
                fontWeight: 600,
                color: '#1A1A1A',
                mb: 1,
                display: 'block',
              }}
            >
              Validity Period <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, color: 'text.secondary' }}
                >
                  From Date
                </Typography>
                <DatePicker
                  value={fromDate}
                  format="DD/MM/YYYY"
                  onChange={(newValue) =>
                    handleDateChange(newValue, setFromDate)
                  }
                  disabled={isFormDisabled || !uploadedPublicKeyId}
                  minDate={minDate}
                  maxDate={toDate || maxDate}
                  slots={{ openPickerIcon: CalendarIcon }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, color: 'text.secondary' }}
                >
                  To Date
                </Typography>
                <DatePicker
                  value={toDate}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => handleDateChange(newValue, setToDate)}
                  disabled={isFormDisabled || !uploadedPublicKeyId}
                  minDate={fromDate || minDate}
                  maxDate={maxDate}
                  slots={{ openPickerIcon: CalendarIcon }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>
            </Box>
          </Box>

          {/* Existing Key Table (Conditional) */}
          {hasExistingKey && publicKeyData && (
            <TableContainer
              component={Paper}
              sx={{ mt: 4, border: '1px solid #E0E0E0' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>Public Key</StyledTableHeadCell>
                    <StyledTableHeadCell>Valid From</StyledTableHeadCell>
                    <StyledTableHeadCell>Valid Till</StyledTableHeadCell>
                    <StyledTableHeadCell>Delete</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledTableCell>{publicKeyData.fileName}</StyledTableCell>
                    <StyledTableCell>
                      {DateUtils.formatOnlyDate(publicKeyData.validFrom)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {DateUtils.formatOnlyDate(publicKeyData.validTill)}
                    </StyledTableCell>
                    <StyledTableCell>
                      <IconButton
                        onClick={handleDeleteKey}
                        sx={{
                          p: 0,
                          '&:hover': { backgroundColor: 'transparent' },
                        }}
                      >
                        <img
                          src={deleteIcon}
                          alt="Delete"
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'contain',
                          }}
                        />
                      </IconButton>
                    </StyledTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <ActionButton onClick={handleSubmit} disabled={isSubmitDisabled}>
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Submit'
              )}
            </ActionButton>
          </Box>
        </FormWrapper>

        {/* Submit Success Modal */}
        <SuccessModal
          open={isSubmitSuccessModalOpen}
          onClose={handleSubmitSuccessModalClose}
          title="Submitted for approval"
          okText="Okay"
          messageType="success"
        />

        {/* Delete Confirmation Modal */}
        <RemarkForRejectionModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => setDeleteConfirmModalOpen(false)}
          onSubmit={handleDeleteConfirmSubmit}
          title="Confirm Delete"
          remarkLabel="Reason for Deletion"
          remarkPlaceholder="Enter reason for deleting this public key"
          remarkMaxLength={500}
          cancelLabel="Cancel"
          submitLabel="Delete"
        />

        {/* Delete Success Modal */}
        <SuccessModal
          open={isDeleteSuccessModalOpen}
          onClose={() => {
            setDeleteSuccessModalOpen(false);
            // Refresh the public key data after successful deletion
            dispatch(fetchPublicKeyData());
          }}
          messageType="reject"
          title="Deleted Successfully"
          okText="Okay"
        />
      </MainContainer>
    </LocalizationProvider>
  );
};

export default UploadPublicKey;
