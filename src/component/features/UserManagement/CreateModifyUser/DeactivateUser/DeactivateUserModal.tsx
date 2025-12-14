import React, { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../../../redux/store';
import {
  deactivateUser,
  clearDeactivateError,
} from '../slice/deactivateUserSlice';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../ErrorModal/ErrorModal';
import {
  dialogPaperStyles,
  dialogTitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  contentContainerStyles,
  iconContainerStyles,
  errorIconStyles,
  titleTextStyles,
  inputContainerStyles,
  inputLabelStyles,
  requiredIndicatorStyles,
  getTextFieldStyles,
  helperTextStyles,
  charCounterStyles,
  cancelButtonStyles,
  deactivateButtonStyles,
} from './DeactivateUserModal.styles';

interface DeactivateUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const MAX_REMARK_LENGTH = 500;

const DeactivateUserModal: React.FC<DeactivateUserModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { deactivating } = useSelector(
    (state: RootState) => state.deactivateUser
  );
  const [remark, setRemark] = useState('');
  // const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  // const [reasonError, setReasonError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_REMARK_LENGTH) {
      setRemark(value);
      if (error) setError('');
    }
  };

  // const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   const value = e.target.value;
  //   if (value.length <= MAX_REMARK_LENGTH) {
  //     setReason(value);
  //     if (reasonError) setReasonError('');
  //   }
  // };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let hasError = false;

    // if (!reason.trim()) {
    //   setReasonError('Reason is required');
    //   hasError = true;
    // }

    if (!remark.trim()) {
      setError('Remark is required');
      hasError = true;
    }

    if (hasError) return;

    try {
      const resultAction = await dispatch(
        deactivateUser({
          userId,
          reason: remark.trim(),
          remarks: remark.trim(),
        })
      );

      if (deactivateUser.fulfilled.match(resultAction)) {
        setShowSuccess(true);
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
    // setReason('');
    setError('');
    // setReasonError('');
    setShowSuccess(false);
    dispatch(clearDeactivateError());
  };

  const handleClose = () => {
    if (!deactivating) {
      resetForm();
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
    // Redirect to track user status page after successful deactivation
    navigate('/re/track-user-status');
  };

  return (
    <>
      <Dialog
        open={open && !showSuccess}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }
          handleClose();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: dialogPaperStyles,
        }}
      >
        <DialogTitle sx={dialogTitleStyles}>
          <IconButton
            onClick={handleClose}
            disabled={deactivating}
            sx={closeButtonStyles}
            data-testid="close-button"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={dialogContentStyles}>
          <Box sx={contentContainerStyles}>
            <Box sx={iconContainerStyles}>
              <ErrorOutlineIcon sx={errorIconStyles} />
            </Box>

            <Typography variant="body1" sx={titleTextStyles}>
              De-activate User
            </Typography>
            {/* 
            <Box sx={inputContainerStyles}>
              <Typography variant="body2" sx={inputLabelStyles}>
                Reason <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Type reason here"
                // value={reason}
                // onChange={handleReasonChange}
                // error={!!reasonError}
                // helperText={reasonError}
                FormHelperTextProps={{
                  sx: helperTextStyles,
                }}
                // sx={getTextFieldStyles(!!reasonError)}
              />
              <Typography variant="caption" sx={charCounterStyles}>
                {reason.length}/{MAX_REMARK_LENGTH}
              </Typography>
            </Box> */}

            <Box sx={inputContainerStyles}>
              <Typography variant="body2" sx={inputLabelStyles}>
                Remark <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Type remark here"
                value={remark}
                onChange={handleRemarkChange}
                error={!!error}
                helperText={error}
                FormHelperTextProps={{
                  sx: helperTextStyles,
                }}
                sx={getTextFieldStyles(!!error)}
              />
              <Typography variant="caption" sx={charCounterStyles}>
                {remark.length}/{MAX_REMARK_LENGTH}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 0, gap: 2, display: 'flex', width: '100%' }}>
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
            {deactivating ? 'Deactivating...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccess}
        onClose={handleSuccessClose}
        message="Submitted for approval"
        onConfirm={handleSuccessClose}
      />

      {/* Error Modal */}
      <ErrorModal
        open={showError}
        onClose={() => setShowError(false)}
        title="Deactivation Failed"
        primaryMessage={errorMessage}
      />
    </>
  );
};

export default DeactivateUserModal;
