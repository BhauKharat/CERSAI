import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../../../redux/store';
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
  deactivateBranch,
  clearDeactivateError,
  resetDeactivateState,
} from '../slice/deactivateBranchSlice';
import type { DeactivateBranchRequest } from '../types/deactivateBranch';
import {
  dialogPaperStyles,
  dialogTitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  contentContainerStyles,
  iconContainerStyles,
  errorIconStyles,
  titleTextStyles,
  remarkLabelStyles,
  requiredFieldStyles,
  helperTextStyles,
  textFieldStyles,
  characterCountStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  confirmButtonStyles,
} from './DeactivateBranchModal.styles';

interface DeactivateBranchModalProps {
  open: boolean;
  onClose: () => void;
  branchName: string;
  branchCode: string;
}

const MAX_REMARK_LENGTH = 500;

const DeactivateBranchModal: React.FC<DeactivateBranchModalProps> = ({
  open,
  onClose,
  branchCode,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    loading,
    success,
    error,
    message: deactivateMessage,
  } = useSelector((state: RootState) => state.deactivateBranch);

  // Get userId from auth state
  const authState = useSelector((state: RootState) => state.auth);
  const userId = authState?.userDetails?.userId || '';

  const [remark, setRemark] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_REMARK_LENGTH) {
      setRemark(value);
      if (validationError) setValidationError('');
    }
  };

  const handleSubmit = async () => {
    if (!remark.trim()) {
      setValidationError('Remark is required');
      return;
    }

    if (!userId) {
      setValidationError('User ID is required');
      return;
    }

    const deactivateRequest: DeactivateBranchRequest = {
      branchCode,
      remark: remark.trim(),
      userId,
    };

    dispatch(deactivateBranch(deactivateRequest));
  };

  const handleClose = () => {
    if (!loading) {
      setRemark('');
      setValidationError('');
      dispatch(resetDeactivateState());
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setRemark('');
    dispatch(resetDeactivateState());
    onClose();
    // Navigate to track-branch-status page after successful deactivation
    navigate('/re/track-branch-status');
  };

  const handleErrorClose = () => {
    setShowError(false);
    dispatch(clearDeactivateError());
  };

  // Handle success/error states
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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
        PaperProps={{ sx: dialogPaperStyles }}
      >
        <DialogTitle sx={dialogTitleStyles}>
          <IconButton
            onClick={handleClose}
            disabled={loading}
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
              De-activate Branch
            </Typography>

            <Box width="100%" mb={2}>
              <Typography variant="body2" sx={remarkLabelStyles}>
                Remark{' '}
                <Box component="span" sx={requiredFieldStyles}>
                  *
                </Box>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type remark here"
                value={remark}
                onChange={handleRemarkChange}
                error={!!validationError}
                helperText={validationError}
                FormHelperTextProps={{
                  sx: helperTextStyles,
                }}
                sx={textFieldStyles(!!error)}
              />
              <Typography variant="caption" sx={characterCountStyles}>
                {remark.length}/{MAX_REMARK_LENGTH}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={handleClose}
            disabled={loading}
            fullWidth
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !remark.trim()}
            fullWidth
            variant="contained"
            sx={confirmButtonStyles}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <ConfirmationModal
        open={showSuccess}
        onClose={handleSuccessClose}
        onConfirm={handleSuccessClose}
        message={
          deactivateMessage || 'Branch deactivation Submitted for approval'
        }
        confirmButtonText="Okay"
      />

      {/* Error Modal */}
      <ErrorModal
        open={showError}
        onClose={handleErrorClose}
        primaryMessage={
          error?.includes('Branch not found')
            ? 'Branch not found.\nPlease check the branch code.'
            : error?.includes('Authorization token')
              ? 'Authorization token is missing or invalid or expired.'
              : error || 'An error occurred while deactivating the branch.'
        }
        buttonText="Okay"
      />
    </>
  );
};

export default DeactivateBranchModal;
