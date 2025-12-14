import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

export interface DecisionModalProps {
  type: 'approve' | 'reject';
  title: string;
  message?: string;
  listBefore?: string[];
  listAfter?: string[];
  okLabel?: string;
  isOpen: boolean;
  onClose: () => void;
}

const iconContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 2,
};

const iconStyles = (type: 'approve' | 'reject'): SxProps<Theme> => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: type === 'approve' ? 'success.main' : 'error.main',
  color: 'common.white',
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
});

const dialogTitleStyles: SxProps<Theme> = {
  textAlign: 'center',
  px: 4,
  pt: 6,
  pb: 0,
  '& .MuiTypography-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
};

const dialogContentStyles: SxProps<Theme> = {
  textAlign: 'center',
  px: 4,
  py: 2,
};

const dialogActionsStyles: SxProps<Theme> = {
  px: 4,
  pb: 3,
  pt: 0,
  justifyContent: 'center',
  '& .MuiButton-root': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    fontWeight: 500,
  },
};

const closeButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  right: 8,
  top: 8,
  color: (theme) => theme.palette.grey[500],
};

export const DecisionModal: React.FC<DecisionModalProps> = ({
  type,
  title,
  message,
  listBefore = [],
  listAfter = [],
  okLabel = 'Okay',
  isOpen,
  onClose,
}) => {
  const handleClose = (_: unknown, reason?: string) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="decision-dialog-title"
      aria-modal="true"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: 500,
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <IconButton aria-label="close" onClick={onClose} sx={closeButtonStyles}>
        <CloseIcon />
      </IconButton>

      <DialogTitle id="decision-dialog-title" sx={dialogTitleStyles}>
        <Box sx={iconContainerStyles}>
          <Box sx={iconStyles(type)}>
            {type === 'approve' ? <CheckIcon /> : <ClearIcon />}
          </Box>
        </Box>
        {title && (
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={dialogContentStyles}>
        {type === 'approve' && listBefore.length > 0 && (
          <List dense disablePadding>
            {listBefore.map((item, index) => (
              <ListItem key={`before-${index}`} disableGutters>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    variant: 'body1',
                    sx: { fontFamily: 'Gilroy, sans-serif' },
                  }}
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {message && (
          <Box sx={{ textAlign: 'center' }}>
            {message.split('\n').map((line, index) => {
              // Check if this line contains the region name and code (format: "Name - Code")
              const isRegionLine =
                line.includes(' - ') && /^[A-Za-z0-9\s-]+$/.test(line.trim());
              // Check if this is a rejection message
              const isRejectionMessage =
                type === 'reject' || line.toLowerCase().includes('rejected');

              return (
                <Typography
                  key={index}
                  variant={isRegionLine ? 'h6' : 'body1'}
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Gilroy, sans-serif',
                    fontWeight: isRegionLine
                      ? 600
                      : isRejectionMessage
                        ? 600
                        : 400,
                    fontSize: isRegionLine ? '1.25rem' : '1rem',
                    lineHeight: 1.5,
                    mb: index < message.split('\n').length - 1 ? 0.5 : 0,
                  }}
                >
                  {line}
                </Typography>
              );
            })}
          </Box>
        )}

        {type === 'approve' && listAfter.length > 0 && (
          <List dense disablePadding>
            {listAfter.map((item, index) => (
              <ListItem key={`after-${index}`} disableGutters>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    variant: 'body1',
                    sx: { fontFamily: 'Gilroy, sans-serif' },
                  }}
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            maxWidth: '200px',
            width: '100%',
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: '#002CBA',
            '&:hover': {
              backgroundColor: '#001F8E',
            },
          }}
          onClick={onClose}
        >
          {okLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecisionModal;
