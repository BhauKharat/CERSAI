import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface RemarkForRejectionProps {
  title: string;
  remarkLabel?: string;
  remarkPlaceholder?: string;
  remarkMaxLength?: number;
  cancelLabel?: string;
  submitLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (remark: string) => void;
}

const dialogTitleStyles: SxProps<Theme> = {
  position: 'relative',
  textAlign: 'start',
  pt: 6,
  pb: 2,
  px: 4,
  '& .MuiTypography-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1A1A1A',
  },
};

const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 8,
  top: 8,
  color: (theme) => theme.palette.grey[500],
};

const dialogContentStyles: SxProps<Theme> = {
  px: 4,
  pb: 2,
  '& .MuiInputBase-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
  },
  '& .MuiFormLabel-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
  },
};

const dialogActionsStyles: SxProps<Theme> = {
  px: 4,
  pb: 3,
  pt: 0,
  display: 'flex',
  gap: 2,
  justifyContent: 'center',
  '& .MuiButton-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
    flex: 1,
    minWidth: '120px',
    maxWidth: '200px',
  },
};

const RemarkForRejectionModal: React.FC<RemarkForRejectionProps> = ({
  title,
  remarkLabel = 'Remark',
  remarkPlaceholder = 'Enter your remark here',
  remarkMaxLength = 500,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  const handleClose = useCallback(
    (_?: unknown, reason?: string) => {
      if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
        onClose();
      }
    },
    [onClose]
  );

  const handleRemarkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= remarkMaxLength) {
      setRemark(value);
      if (error && value.trim()) {
        setError('');
      }
    }
  };

  const handleSubmit = () => {
    const trimmedRemark = remark.trim();
    if (!trimmedRemark) {
      setError('Remark is required');
      return;
    }
    onSubmit(trimmedRemark);
    setRemark('');
    setError('');
  };

  const handleModalClose = () => {
    setRemark('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="remark-for-rejection-dialog"
      PaperProps={{
        sx: {
          maxWidth: 520,
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle sx={dialogTitleStyles}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleModalClose}
          sx={closeButtonStyles}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={dialogContentStyles}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            fontWeight: 600,
            fontFamily: 'Gilroy, sans-serif',
            color: 'text.primary',
          }}
        >
          {remarkLabel} <span style={{ color: '#d32f2f' }}>*</span>
        </Typography>

        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder={remarkPlaceholder}
            value={remark}
            onChange={handleRemarkChange}
            inputProps={{ maxLength: remarkMaxLength }}
            error={!!error}
            helperText={error}
            required
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Gilroy, sans-serif',
                '& fieldset': {
                  borderColor: error ? 'error.main' : 'grey.300',
                },
                '&:hover fieldset': {
                  borderColor: error ? 'error.main' : 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: error ? 'error.main' : 'primary.main',
                },
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {remark.length}/{remarkMaxLength}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button
          variant="outlined"
          onClick={handleModalClose}
          sx={{
            minWidth: 120,
            height: 44,
            textTransform: 'none',
            fontWeight: 500,
            fontFamily: 'Gilroy, sans-serif',
            color: '#002CBA',
            borderColor: '#002CBA',
            '&:hover': {
              borderColor: '#001F8E',
              backgroundColor: 'rgba(0, 44, 186, 0.04)',
            },
          }}
        >
          {cancelLabel}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!remark.trim()}
          sx={{
            minWidth: 120,
            height: 44,
            textTransform: 'none',
            fontWeight: 500,
            fontFamily: 'Gilroy, sans-serif',
            backgroundColor: '#002CBA',
            '&:hover': {
              backgroundColor: '#001F8E',
            },
            '&:disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            },
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemarkForRejectionModal;
