import React, { useState } from 'react';
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
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { revokeSuspendUser } from '../slice/revokeSuspendUserSlice';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../ErrorModal/ErrorModal';
import {
  dialogPaperStyles,
  dialogTitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  contentContainerStyles,
  titleContainerStyles,
  titleTextStyles,
  inputContainerStyles,
  inputLabelStyles,
  helperTextStyles,
  getTextareaStyles,
  charCounterStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  submitButtonStyles,
} from './RevokeUserModal.styles';
import { useNavigate } from 'react-router-dom';

interface RevokeUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}
const WarningIconContainer = styled(Box)({
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  border: '3px solid #ff4d4f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
});

const MAX_REMARK_LENGTH = 500;

const RevokeUserModal: React.FC<RevokeUserModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { revokingSuspension } = useSelector(
    (state: RootState) => state.revokeSuspendUser
  );
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<{ remark?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const validate = () => {
    console.log();
    const newErrors: typeof errors = {};

    if (remark.length > MAX_REMARK_LENGTH) {
      newErrors.remark = `Remark must be less than ${MAX_REMARK_LENGTH} characters`;
    }

    if (!remark.trim()) {
      newErrors.remark = 'Remark is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = await dispatch(
        revokeSuspendUser({
          userId,
          reason: remark.trim(),
          remarks: remark.trim(),
        })
      ).unwrap();

      console.log('Revoke suspension result:', result);

      // Check for success: if result exists and success is true, or if we got here without error (status 200)
      // The unwrap() will throw if the action was rejected, so if we're here, it's likely success
      if (result && result.success !== false) {
        // Show success modal with correct message
        setShowSuccess(true);
      } else {
        // If result exists but success is explicitly false, show error
        const errorMsg =
          result?.message ||
          (typeof result === 'string'
            ? result
            : 'Failed to revoke user suspension. Please try again.');
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error revoking user suspension:', error);
      // Show error modal with the error message
      const errorMsg =
        typeof error === 'string'
          ? error
          : 'Failed to revoke user suspension. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
    }
  };

  const handleClose = () => {
    if (!revokingSuspension) {
      setRemark('');
      setErrors({});
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
    // Redirect to track user status page after successful revoke
    navigate('/re/track-user-status');
  };

  return (
    <>
      <Dialog
        open={open && !showSuccess && !showError}
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
            disabled={revokingSuspension}
            sx={closeButtonStyles}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={dialogContentStyles}>
          <Box sx={contentContainerStyles}>
            <Box sx={titleContainerStyles}>
              <WarningIconContainer>
                <Typography
                  component="span"
                  sx={{
                    color: '#ff4d4f',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  !
                </Typography>
              </WarningIconContainer>
              <Typography variant="h6" sx={titleTextStyles}>
                Revoke User Suspension
              </Typography>
            </Box>

            <Box sx={inputContainerStyles}>
              <Typography variant="body2" sx={inputLabelStyles}>
                Remark <span style={{ color: '#DC2626' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Type remark here"
                value={remark}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_REMARK_LENGTH) {
                    setRemark(value);
                    if (errors.remark) {
                      setErrors({ ...errors, remark: '' });
                    }
                  }
                }}
                error={!!errors.remark}
                helperText={errors.remark}
                FormHelperTextProps={{
                  sx: helperTextStyles,
                }}
                sx={getTextareaStyles(!!errors.remark)}
              />
              <Typography variant="caption" sx={charCounterStyles}>
                {`${remark.length}/${MAX_REMARK_LENGTH}`}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={handleClose}
            disabled={revokingSuspension}
            fullWidth
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={revokingSuspension || !remark.trim()}
            fullWidth
            variant="contained"
            sx={submitButtonStyles}
          >
            {revokingSuspension ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Submit'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        open={showSuccess}
        onClose={handleSuccessClose}
        message="Submitted for approval"
        confirmButtonText="OK"
        onConfirm={handleSuccessClose}
      />

      <ErrorModal
        open={showError}
        onClose={() => {
          setShowError(false);
          setErrorMessage('');
        }}
        primaryMessage={errorMessage}
        buttonText="Try Again"
      />
    </>
  );
};

export default RevokeUserModal;
