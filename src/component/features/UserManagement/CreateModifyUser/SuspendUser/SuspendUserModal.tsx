/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../../../redux/store';
import { suspendUser, clearSuspendError } from '../slice/suspendUserSlice';
import {
  revokeSuspendUser,
  clearRevokeSuspendError,
} from '../slice/revokeSuspendUserSlice';
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
  errorIconStyles,
  dialogContentStyles,
  contentContainerStyles,
  errorMessageContainerStyles,
  titleTextStyles,
  inputContainerStyles,
  inputLabelStyles,
  // requiredIndicatorStyles,
  helperTextStyles,
  // getDatePickerStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  submitButtonStyles,
} from './SuspendUserModal.styles';

interface SuspendUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  mode?: 'suspend' | 'revoke';
  userStatus?: string;
}

const MAX_REMARK_LENGTH = 500;
const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  open,
  onClose,
  userId,
  mode = 'suspend',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { suspending } = useSelector((state: RootState) => state.suspendUser);
  const { revokingSuspension } = useSelector(
    (state: RootState) => state.revokeSuspendUser
  );
  // const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<{
    reason?: string;
    fromDate?: string;
    toDate?: string;
    remark?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const newErrors: typeof errors = {};

    // Validate reason for both suspend and revoke modes
    // if (!reason.trim()) {
    //   newErrors.reason = 'Reason is required';
    // }

    if (!remark.trim()) {
      newErrors.remark = 'Remark is required';
    } else if (remark.length > MAX_REMARK_LENGTH) {
      newErrors.remark = `Remark must be less than ${MAX_REMARK_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    // setReason('');
    setRemark('');
    setErrors({});
    setShowSuccess(false);
    dispatch(clearSuspendError());
    dispatch(clearRevokeSuspendError());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      let resultAction;

      if (mode === 'revoke') {
        resultAction = await dispatch(
          revokeSuspendUser({
            userId,
            reason: remark.trim(),
            remarks: remark.trim(),
          })
        );
      } else {
        resultAction = await dispatch(
          suspendUser({
            userId,
            reason: remark.trim(),
            remarks: remark.trim(),
          })
        );
      }

      if (mode === 'revoke') {
        if (revokeSuspendUser.fulfilled.match(resultAction)) {
          setShowSuccess(true);
        } else {
          const errorMsg =
            (resultAction.payload as string) ||
            'Failed to revoke user suspension. Please try again.';
          setErrorMessage(errorMsg);
          setShowError(true);
        }
      } else {
        if (suspendUser.fulfilled.match(resultAction)) {
          setShowSuccess(true);
        } else {
          const errorMsg =
            (resultAction.payload as string) ||
            'Failed to suspend user. Please try again.';
          setErrorMessage(errorMsg);
          setShowError(true);
        }
      }
    } catch {
      // Show error modal even if catch block is triggered
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowError(true);
    }
  };

  const handleClose = () => {
    if (!suspending && !revokingSuspension) {
      resetForm();
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
    // Redirect to track user status page after successful suspend/revoke
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
            disabled={suspending}
            sx={closeButtonStyles}
            data-testid="close-button"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={dialogContentStyles}>
          <Box sx={contentContainerStyles}>
            <Box sx={errorMessageContainerStyles}>
              <ErrorOutlineIcon sx={errorIconStyles} />
            </Box>

            <Typography variant="body1" sx={titleTextStyles}>
              {mode === 'revoke' ? 'Revoke User Suspension' : 'Suspend User'}
            </Typography>

            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* <Box sx={{ ...inputContainerStyles, position: 'relative' }}>
                <Typography
                  variant="body2"
                  sx={{ ...inputLabelStyles, textAlign: 'left', mb: 1 }}
                >
                  Reason <span style={{ color: '#DC2626' }}>*</span>
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Type reason here"
                  value={reason}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_REMARK_LENGTH) {
                      setReason(value);
                      if (errors.reason) {
                        setErrors({ ...errors, reason: '' });
                      }
                    }
                  }}
                  error={!!errors.reason}
                  helperText={errors.reason}
                  FormHelperTextProps={{
                    sx: helperTextStyles,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#D1D5DB',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9CA3AF',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563EB',
                      },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '12px',
                    fontSize: '12px',
                    color: '#6B7280',
                    backgroundColor: 'white',
                    px: 0.5,
                  }}
                >
                  {reason.length}/{MAX_REMARK_LENGTH}
                </Typography>
              </Box> */}

              <Box sx={{ ...inputContainerStyles, position: 'relative' }}>
                <Typography
                  variant="body2"
                  sx={{ ...inputLabelStyles, textAlign: 'left', mb: 1 }}
                >
                  Remark <span style={{ color: '#DC2626' }}>*</span>
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#D1D5DB',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9CA3AF',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563EB',
                      },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '12px',
                    fontSize: '12px',
                    color: '#6B7280',
                    backgroundColor: 'white',
                    px: 0.5,
                  }}
                >
                  {remark.length}/{MAX_REMARK_LENGTH}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={handleClose}
            disabled={suspending || revokingSuspension}
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={suspending || revokingSuspension || !remark.trim()}
            sx={submitButtonStyles}
            onClick={handleSubmit}
          >
            {suspending || revokingSuspension ? (
              <CircularProgress size={20} color="inherit" />
            ) : mode === 'revoke' ? (
              'Submit'
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
        message="Submitted for approval"
        onConfirm={handleSuccessClose}
      />

      {/* Error Modal */}
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

export default SuspendUserModal;
