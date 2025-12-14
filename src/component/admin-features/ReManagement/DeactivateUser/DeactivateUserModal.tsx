/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import {
  deactivateUser,
  clearDeactivateError,
} from '../slices/deactivateUserSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../ErrorModal/ErrorModal';
import {
  dialogPaperStyles,
  dialogTitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  titleTextStyles,
  inputContainerStyles,
  inputLabelStyles,
  requiredIndicatorStyles,
  charCounterStyles,
  cancelButtonStyles,
  deactivateButtonStyles,
  dialogActionsStyles,
} from './DeactivateUserModal.styles';
import { useNavigate } from 'react-router-dom';

import uploadIcon from '../../../../assets/upload_icon.svg';
import FilePreview from '../../../admin-features/DocPreview/FilePreview';
import { ReFilePreview } from '../ReFilePreview/ReFilePreview';

interface DeactivateUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const FileUploadWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '15px',
  justifyContent: 'center',
}));

const UploadLabel = styled('label')(() => ({
  border: '1.5px solid rgba(0, 44, 186, 1)',
  display: 'flex',
  width: '100%',
  textAlign: 'center',
  borderRadius: '4px',
  padding: '10px 0',
  color: 'rgba(0, 44, 186, 1)',
  fontSize: '16px',
  fontFamily: 'Gilroy',
  fontWeight: 600,
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
}));

const MAX_REMARK_LENGTH = 500;

const DeactivateUserModal: React.FC<DeactivateUserModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { deactivating, deactivateError } = useSelector(
    (state: RootState) => state.deactivateUser
  );
  const [reason, setReason] = useState('regulator');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!remark.trim()) {
      setError('Remark is required');
      return;
    }

    try {
      const resultAction = await dispatch(
        deactivateUser({
          userId,
          remark,
          reason,
          fileBase64: file,
        })
      );

      if (deactivateUser.fulfilled.match(resultAction)) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          resetForm();
        }, 2000);
      } else {
        // Handle API error
        const errorMsg =
          (resultAction.payload as string) ||
          'Failed to deactivate user. Please try again.';
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const resetForm = () => {
    setRemark('');
    setError('');
    setShowSuccess(false);
    dispatch(clearDeactivateError());
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFileBase64(base64String);
      };
      reader.readAsDataURL(selectedFile); // outputs "data:<mimetype>;base64,<data>"
    }
  };

  const handleClose = () => {
    if (!deactivating) {
      resetForm();
      onClose();
      setFile(null);
      setFileBase64(null);
    }
    setFile(null);
    setFileBase64(null);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open && !showSuccess}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: dialogPaperStyles,
        }}
      >
        {/* Header */}
        <DialogTitle sx={dialogTitleStyles}>
          <Typography sx={titleTextStyles}>
            De-activate Reporting Entity
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={deactivating}
            sx={closeButtonStyles}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Form */}
        <DialogContent sx={dialogContentStyles}>
          {/* Reason dropdown */}
          <Box sx={inputContainerStyles}>
            <Typography sx={inputLabelStyles}>
              De-activation Reason{' '}
              <span style={requiredIndicatorStyles}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  fontSize: '16px',
                  color: 'black',
                  fontFamily: 'Gilroy',
                  fontWeight: 600,
                },
                '& .MuiInputBase-input': {
                  fontSize: '16px',
                  color: '#333333',
                },
              }}
            >
              <MenuItem value="regulator">
                License Cancelled by Regulator/ business closure
              </MenuItem>
              <MenuItem value="voluntary">Voluntary Closure</MenuItem>
            </TextField>
          </Box>

          {/* Remark textarea */}
          <Box sx={inputContainerStyles}>
            <Typography sx={inputLabelStyles}>
              Remark <span style={requiredIndicatorStyles}>*</span>
            </Typography>
            <TextField
              placeholder="Type your remark here"
              fullWidth
              multiline
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <Typography variant="caption" sx={charCounterStyles}>
              {remark.length}/{MAX_REMARK_LENGTH}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: '14px',
                fontFamily: 'Gilroy',
                fontWeight: 600,
              }}
            >
              Supporting Document
            </Typography>

            <FileUploadWrapper>
              <UploadLabel>
                <img src={uploadIcon} alt="upload_icon" />
                Upload
                <input type="file" hidden onChange={handleFileChange} />
              </UploadLabel>

              {fileBase64 && <ReFilePreview file={file} />}
            </FileUploadWrapper>

            {/* <Button variant="contained" component="label">
              {file ? file.name : 'Upload'}
            </Button> */}
          </Box>
        </DialogContent>

        {/* Footer buttons */}
        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={handleClose}
            disabled={deactivating}
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={deactivating || !remark.trim()}
            variant="contained"
            sx={deactivateButtonStyles}
            startIcon={
              deactivating ? (
                <CircularProgress size={20} color="inherit" />
              ) : undefined
            }
          >
            {deactivating ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccess}
        onClose={() => {
          handleSuccessClose();
          resetForm();
          setRemark('');
          setReason('');
          setFile(null);
          setFileBase64('');
          setError('');
          navigate('/ckycrr-admin/re-management/deactivation');
        }}
        message="Submitted for approval"
        onConfirm={() => {
          handleSuccessClose();
          resetForm();
          setRemark('');
          setReason('');
          setFile(null);
          setFileBase64('');
          setError('');
          navigate('/ckycrr-admin/re-management/deactivation');
        }}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showError}
        onClose={() => {
          handleSuccessClose();
          resetForm();
          setRemark('');
          setReason('');
          setFile(null);
          setFileBase64('');
          setError('');
          setShowError(false);
        }}
        title="Deactivation Failed"
        primaryMessage={errorMessage}
      />
    </>
  );
};

export default DeactivateUserModal;
