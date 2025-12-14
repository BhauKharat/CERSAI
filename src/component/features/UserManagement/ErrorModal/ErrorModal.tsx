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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  dialogStyles,
  closeButtonStyles,
  dialogTitleStyles,
  iconContainerStyles,
  errorIconStyles,
  dialogContentStyles,
  messageTextStyles,
  dialogActionsStyles,
  buttonStyles,
} from './ErrorModal.styles';

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  primaryMessage: string;
  secondaryMessage?: string;
  buttonText?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onClose,
  title = '',
  primaryMessage,
  buttonText = 'Okay',
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      maxWidth="xs"
      fullWidth={false}
      role="alertdialog"
      sx={dialogStyles}
    >
      <IconButton aria-label="close" onClick={onClose} sx={closeButtonStyles}>
        <CloseIcon />
      </IconButton>

      <DialogTitle id="error-dialog-title" sx={dialogTitleStyles}>
        <Box sx={iconContainerStyles}>
          <ErrorOutlineIcon sx={errorIconStyles} />
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
          sx={{
            ...messageTextStyles,
            whiteSpace: 'pre-line',
          }}
        >
          {primaryMessage}
        </Typography>
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button
          onClick={onClose}
          variant="contained"
          className="medium-text"
          sx={buttonStyles}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal;
