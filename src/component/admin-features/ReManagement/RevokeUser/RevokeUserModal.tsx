/* eslint-disable @typescript-eslint/no-unused-vars */

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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import {
  dialogPaperStyles,
  dialogTitleStyles,
  closeButtonStyles,
  dialogContentStyles,
  inputContainerStyles,
  inputLabelStyles,
  requiredIndicatorStyles,
  helperTextStyles,
  getTextareaStyles,
  dialogActionsStyles,
  cancelButtonStyles,
  submitButtonStyles,
  charCounterStyles,
} from './RevokeUserModal.styles';

import { revokeSuspendUser } from '../slices/revokeSuspendUserSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store';

import uploadIcon from '../../../../assets/upload_icon.svg';
import { ReFilePreview } from '../ReFilePreview/ReFilePreview';

interface RevokeUserModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

const MAX_REMARK_LENGTH = 500;
const UploadButtonWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const ImagePreviewBox = styled(Box)(() => ({
  height: '40px',
  marginBottom: '5px',
}));

const RevokeUserModal: React.FC<RevokeUserModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [base64File, setBase64File] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ remark?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showError, setShowError] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  console.log(userId);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!remark.trim()) {
      newErrors.remark = 'Remark is required';
    } else if (remark.length > MAX_REMARK_LENGTH) {
      newErrors.remark = `Remark must be less than ${MAX_REMARK_LENGTH} characters`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64File(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // const handleSubmit = async () => {
  //   if (!validate()) return;

  //   try {
  //     setIsSubmitting(true);
  //   } catch (error) {
  //     console.error('Error revoking user suspension:', error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const resetForm = () => {
    setRemark('');
    setFile(null);
    setBase64File(undefined);
    setErrors({});
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!validate()) {
      return;
    }

    try {
      const resultAction = await dispatch(
        revokeSuspendUser({
          userId: userId || null,
          remark,
          file: file,
        })
      );

      if (revokeSuspendUser.fulfilled.match(resultAction)) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          resetForm();
        }, 2000);
      } else {
        const errorMsg =
          (resultAction.payload as string) ||
          'Failed to revoke user suspension. Please try again.';
        setErrorMessage(errorMsg);
        setShowError(true);
      }
    } catch (error) {
      console.error('Error revoking suspension:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRemark('');
      setFile(null);
      setBase64File(undefined);
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
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          handleClose();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: dialogPaperStyles }}
      >
        <DialogTitle sx={dialogTitleStyles}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: '16px', fontFamily: 'Gilroy' }}
          >
            Revoke Suspension of Reporting Entity
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={isSubmitting}
            sx={closeButtonStyles}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={dialogContentStyles}>
          {/* Remark */}
          <Box sx={inputContainerStyles}>
            <Typography sx={inputLabelStyles}>
              Remark <span style={requiredIndicatorStyles}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Type your remark here"
              value={remark}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= MAX_REMARK_LENGTH) {
                  setRemark(value);
                  if (errors.remark) setErrors({});
                }
              }}
              error={!!errors.remark}
              helperText={errors.remark}
              FormHelperTextProps={{ sx: helperTextStyles }}
              sx={getTextareaStyles(!!errors.remark)}
            />
            <Typography variant="caption" sx={charCounterStyles}>
              {`${remark.length}/${MAX_REMARK_LENGTH}`}
            </Typography>
          </Box>

          {/* Supporting Document */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <UploadButtonWrapper>
              <Typography sx={inputLabelStyles}>Supporting Document</Typography>
              <Button
                fullWidth
                variant="outlined"
                component="label"
                sx={{
                  height: '48px',
                  borderColor: 'rgba(0, 44, 186, 1)',
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'rgba(0, 44, 186, 1)',
                  '&:hover': {
                    borderColor: '#002CBA',
                    backgroundColor: 'transparent',
                  },
                }}
                startIcon={<img src={uploadIcon} alt="upload_icon" />}
              >
                Upload
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </UploadButtonWrapper>

            <ImagePreviewBox>
              {file && <ReFilePreview file={file} />}
            </ImagePreviewBox>
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
        message="User suspension has been revoked successfully."
        confirmButtonText="OK"
        onConfirm={handleSuccessClose}
      />
    </>
  );
};

export default RevokeUserModal;
