import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  dialogStyles,
  closeButtonStyles,
  dialogTitleStyles,
  iconContainerStyles,
  checkIconStyles,
  dialogContentStyles,
  messageTextStyles,
  dialogActionsStyles,
  confirmButtonStyles,
} from './ConfirmationModal.styles';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmButtonText?: string;
  onConfirm?: () => void;
  showCloseButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  title,
  message,
  confirmButtonText = 'Okay',
  onConfirm,
  showCloseButton = true,
}) => {
  const descriptionElementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      maxWidth="xs"
      fullWidth={false}
      role="dialog"
      sx={dialogStyles}
    >
      {showCloseButton && (
        <IconButton aria-label="close" onClick={onClose} sx={closeButtonStyles}>
          <CloseIcon />
        </IconButton>
      )}

      <DialogTitle id="confirmation-dialog-title" sx={dialogTitleStyles}>
        <Box sx={iconContainerStyles}>
          <CheckCircleIcon sx={checkIconStyles} />
        </Box>
        {title && (
          <Typography variant="h6" component="div" className="medium-text">
            {title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={dialogContentStyles}>
        <Typography
          variant="body1"
          className="medium-text"
          sx={messageTextStyles}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button
          onClick={handleConfirm}
          variant="contained"
          className="medium-text"
          sx={confirmButtonStyles}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
