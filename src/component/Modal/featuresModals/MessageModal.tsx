import React from 'react';
import {
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  CloseButton,
  SuccessIcon,
  StyledButton,
  StyledDialog,
} from './Modal.styles';

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  imageUrl?: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  open,
  onClose,
  title,
  message,
  buttonText,
  imageUrl,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleBackdropClick}
      fullScreen={fullScreen}
      disableEscapeKeyDown
      aria-labelledby="success-dialog-title"
      aria-describedby="success-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '4px',
          background: '#F8F9FD',
          boxShadow: '0 11px 23px 0 rgba(0, 0, 0, 0.06)',
          height: 'auto',
        },
      }}
    >
      <CloseButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
        }}
      >
        <CloseIcon />
      </CloseButton>
      <DialogContent onClick={handleClose}>
        <SuccessIcon>
          <img
            src={imageUrl}
            alt="Success"
            onError={(e) => {
              // Fallback to MUI icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const container = target.parentElement;
              if (container) {
                const icon = document.createElement('div');
                icon.innerHTML =
                  '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="#4CAF50"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                container.appendChild(icon);
              }
            }}
          />
        </SuccessIcon>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.success.main,
            mb: 2,
            fontSize: '1.5rem',
            lineHeight: 1.2,
            [theme.breakpoints.down('sm')]: {
              fontSize: '1.25rem',
              mb: 1.5,
              lineHeight: 1.3,
            },
            [theme.breakpoints.up('md')]: {
              fontSize: '1.625rem',
              mb: 2.5,
            },
          }}
        >
          {title}
        </Typography>
        <DialogContentText
          id="success-dialog-description"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '320px',
            margin: '0 auto',
            [theme.breakpoints.down('sm')]: {
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              maxWidth: '280px',
            },
            [theme.breakpoints.up('md')]: {
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              maxWidth: '360px',
            },
          }}
        >
          {message}
        </DialogContentText>
        <DialogActions sx={{ justifyContent: 'center', px: 0 }}>
          <StyledButton onClick={onClose} variant="contained" disableElevation>
            {buttonText}
          </StyledButton>
        </DialogActions>
      </DialogContent>
    </StyledDialog>
  );
};

export default MessageModal;
