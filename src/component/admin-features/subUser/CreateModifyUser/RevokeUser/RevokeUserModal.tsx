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
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { CERSAIUserRoles } from '../../../../../../src/enums/userRoles.enum';
import { RootState } from '../../../../../redux/store';
import ConfirmationModal from '../../ConfirmationModal/ConfirmationModal';
import {
  cancelButtonStyles,
  charCounterStyles,
  closeButtonStyles,
  contentContainerStyles,
  dialogActionsStyles,
  dialogContentStyles,
  dialogPaperStyles,
  dialogTitleStyles,
  errorIconStyles,
  errorMessageContainerStyles,
  // requiredIndicatorStyles,
  // helperTextStyles,
  // getSelectStyles,
  getTextareaStyles,
  inputContainerStyles,
  inputLabelStyles,
  submitButtonStyles,
  // titleContainerStyles,
  titleTextStyles,
} from './RevokeUserModal.styles';
interface RevokeUserModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onConfirm: (data: { reason: string; remark: string }) => Promise<boolean>;
}

const MAX_REMARK_LENGTH = 500;
// const REVOKE_REASONS = [
//   'Suspension Period Ended',
//   'Issue Resolved',
//   'Reinstatement Requested',
//   'Other',
// ];

const RevokeUserModal: React.FC<RevokeUserModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  // const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    /* reason?: string; */ remark?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const token: any = useSelector((state: RootState) => state?.auth?.authToken);
  const decoded: any = jwtDecode(token);
  const userType = decoded?.groupMembership[0].replace(/^\//, '');
  const validate = () => {
    const newErrors: typeof errors = {};

    // if (!reason.trim()) {
    //   newErrors.reason = 'Revoke reason is required';
    // }

    if (!remark.trim()) {
      newErrors.remark = 'Remark is required';
    } else if (remark.length > MAX_REMARK_LENGTH) {
      newErrors.remark = `Remark must be less than ${MAX_REMARK_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const success = await onConfirm({
        reason: 'Revoke suspension', // reason,
        remark,
      });

      if (success) {
        setShowSuccess(true);
      }
    } catch {
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // setReason('');
      setRemark('');
      setErrors({});
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
            disabled={isSubmitting}
            sx={closeButtonStyles}
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
              Revoke User Suspension
            </Typography>

            {/* <Box sx={inputContainerStyles}>
              <Typography variant="body2" sx={inputLabelStyles}>
                Revoke reason <span style={requiredIndicatorStyles}>*</span>
              </Typography>
              <TextField
                select
                fullWidth
                value={reason}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: unknown): React.ReactNode => {
                    if (!selected) {
                      return (
                        <span style={placeholderTextStyles}>
                          Select revoke reason
                        </span>
                      );
                    }
                    return selected as React.ReactNode;
                  },
                }}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) {
                    setErrors({ ...errors, reason: '' });
                  }
                }}
                error={!!errors.reason}
                helperText={errors.reason}
                FormHelperTextProps={{
                  sx: helperTextStyles,
                }}
                sx={getSelectStyles(!!errors.reason)}
              >
                {REVOKE_REASONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box> */}

            <Box sx={inputContainerStyles}>
              <Typography
                variant="body2"
                sx={{ ...inputLabelStyles, textAlign: 'left' }}
              >
                Remark
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
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
                sx={getTextareaStyles(!!errors.remark)}
              />
              <Typography variant="caption" sx={charCounterStyles}>
                {String(remark.length).padStart(2, '0')}/{MAX_REMARK_LENGTH}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={dialogActionsStyles}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            fullWidth
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !remark.trim()}
            fullWidth
            variant="contained"
            sx={submitButtonStyles}
          >
            {isSubmitting ? (
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
        message={
          userType.toUpperCase() === CERSAIUserRoles.SUPER_ADMIN_USER
            ? 'User suspension revoked successfully'
            : 'Submitted for approval'
        }
        confirmButtonText="Okay"
        onConfirm={handleSuccessClose}
      />
    </>
  );
};

export default RevokeUserModal;
