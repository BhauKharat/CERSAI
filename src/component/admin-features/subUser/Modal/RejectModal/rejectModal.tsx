import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  styled,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// Custom styled components
const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    textAlign: 'center',
    padding: '20px',
  },
  '& .MuiDialogContent-root': {
    padding: '20px 0',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8,
  color: theme.palette.grey[500],
}));

const IconContainer = styled(Box)<{ iconColor: string }>(({ iconColor }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: iconColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 30px',
  boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
}));

const StyledButton = styled(Button)<{ buttonColor: string }>(
  ({ buttonColor }) => ({
    backgroundColor: buttonColor,
    borderColor: buttonColor,
    borderRadius: '6px',
    height: '45px',
    minWidth: '120px',
    fontSize: '16px',
    fontWeight: '500',
    color: 'white',
    '&:hover': {
      backgroundColor: buttonColor,
      borderColor: buttonColor,
      opacity: 0.9,
    },
  })
);

interface RejectionModalProps {
  /**
   * Controls the visibility of the modal
   */
  visible: boolean;

  /**
   * Callback function when modal is closed (OK button or close icon)
   */
  onClose: () => void;

  /**
   * Main message to display in the modal - can be string or React element
   * @default "Request Rejected"
   */
  message?: string | React.ReactNode;

  /**
   * Subtitle or description message
   * @default "The request has been successfully rejected and will not proceed further."
   */
  subtitle?: string | React.ReactNode;

  /**
   * Text for the action button
   * @default "Okay"
   */
  buttonText?: string;

  /**
   * Custom width for the modal
   * @default 500
   */
  width?: number;

  /**
   * Whether the modal can be closed by clicking the mask
   * @default false
   */
  maskClosable?: boolean;

  /**
   * Whether to show the close icon
   * @default true
   */
  closable?: boolean;

  /**
   * Custom icon color for the circle background
   * @default "#ff4d4f" (red)
   */
  iconColor?: string;

  /**
   * Custom button color
   * @default "#002CBA" (blue)
   */
  buttonColor?: string;

  /**
   * Path to custom rejection icon PNG
   * If not provided, uses default "×" symbol
   */
  iconSrc?: string;

  /**
   * Additional callback for button click (if different from onClose)
   */
  onButtonClick?: () => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  visible,
  onClose,
  message = 'Request Rejected',
  subtitle = 'The request has been successfully rejected and will not proceed further.',
  buttonText = 'Okay',
  width = 500,
  maskClosable = false,
  closable = true,
  iconColor = '#ff4d4f',
  buttonColor = '#002CBA',
  iconSrc,
  onButtonClick,
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  const renderIcon = () => {
    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt="rejection"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
          }}
        />
      );
    }

    // Using a more modern and accessible MUI icon
    return <HighlightOffIcon sx={{ color: 'white', fontSize: '50px' }} />;
  };

  return (
    <StyledDialog
      open={visible}
      onClose={maskClosable ? onClose : undefined}
      maxWidth={false}
      PaperProps={{
        style: {
          width: width,
        },
      }}
      disableEscapeKeyDown={!closable}
    >
      {closable && (
        <StyledIconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </StyledIconButton>
      )}
      <DialogContent>
        {/* Rejection Icon */}
        <IconContainer iconColor={iconColor}>{renderIcon()}</IconContainer>

        {/* Main Message */}
        <Box sx={{ marginBottom: '16px' }}>
          {typeof message === 'string' ? (
            <Typography
              variant="h5"
              sx={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#262626',
                margin: '0',
                lineHeight: '1.3',
              }}
            >
              {message}
            </Typography>
          ) : (
            <Box
              sx={{
                color: '#262626',
                lineHeight: '1.4',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              {message}
            </Box>
          )}
        </Box>

        {/* Subtitle Message */}
        {subtitle && (
          <Box sx={{ marginBottom: '40px' }}>
            {typeof subtitle === 'string' ? (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#8c8c8c',
                  margin: '0 auto',
                  lineHeight: '1.4',
                  maxWidth: '350px',
                }}
              >
                {subtitle}
              </Typography>
            ) : (
              <Box
                sx={{
                  color: '#8c8c8c',
                  lineHeight: '1.4',
                  fontSize: '14px',
                }}
              >
                {subtitle}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', padding: '0 24px 24px' }}>
        {/* Action Button */}
        <StyledButton
          variant="contained"
          onClick={handleButtonClick}
          buttonColor={buttonColor}
        >
          {buttonText}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default RejectionModal;
