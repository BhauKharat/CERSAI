/* eslint-disable @typescript-eslint/no-explicit-any */
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import React, { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../../../redux/store';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import ErrorModal from '../../ErrorModal/ErrorModal';
import {
  clearDeactivateError,
  deactivateUser,
} from '../slice/deactivateUserSlice';
import {
  cancelButtonStyles,
  charCounterStyles,
  closeButtonStyles,
  contentContainerStyles,
  deactivateButtonStyles,
  dialogContentStyles,
  dialogPaperStyles,
  dialogTitleStyles,
  errorIconStyles,
  getTextFieldStyles,
  helperTextStyles,
  iconContainerStyles,
  inputContainerStyles,
  inputLabelStyles,
  requiredIndicatorStyles,
  titleTextStyles,
} from './DeactivateUserModal.styles';
import { CERSAIUserRoles } from '../../../../../../src/enums/userRoles.enum';

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
  const { deactivating, deactivateError } = useSelector(
    (state: RootState) => state.deactivateUser
  );
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const token: any = useSelector((state: RootState) => state?.auth?.authToken);
  const decoded: any = jwtDecode(token);
  const userType = decoded?.groupMembership[0].replace(/^\//, '');
  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_REMARK_LENGTH) {
      setRemark(value);
      if (error) setError('');
    }
  };

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

  const handleClose = () => {
    if (!deactivating) {
      resetForm();
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    handleClose();
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
              {/* <br /> */}
              {/* this user? */}
            </Typography>

            <Box sx={inputContainerStyles}>
              <Typography variant="body2" sx={inputLabelStyles}>
                Remark <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
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
          {/* Display API Error */}
          {deactivateError && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography
                variant="body2"
                color="error"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ErrorOutlineIcon fontSize="small" />
                {deactivateError}
              </Typography>
            </Box>
          )}
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
        onClose={() => {
          handleSuccessClose();
          navigate(
            '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
          ); // Navigate to /ckycrr-admin/sub-users/certify-modify
        }}
        message={
          userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
            ? 'User de-activated successfully'
            : 'Submitted for approval'
        }
        onConfirm={() => {
          handleSuccessClose();
          navigate(
            '/ckycrr-admin/sub-users/certify-modify?action=Track Status'
          ); // Navigate to /ckycrr-admin/sub-users/certify-modify
        }}
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
