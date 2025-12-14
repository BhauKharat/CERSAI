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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

// Custom styled components for a cleaner look
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

// Fix: Use a factory function with a generic type or pass props directly to the styled component
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

const StyledButton = styled(Button)(({ color }) => ({
  backgroundColor: color,
  borderColor: color,
  borderRadius: '6px',
  height: '45px',
  minWidth: '120px',
  fontSize: '16px',
  fontWeight: '500',
  color: 'white',
  '&:hover': {
    backgroundColor: color,
    borderColor: color,
    opacity: 0.9,
  },
}));

interface SuccessModalProps {
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
   * @default "Submitted for approval"
   */
  message?: string | React.ReactNode;

  /**
   * Text for the action button
   * @default "Okay"
   */
  buttonText?: string;

  /**
   * Custom width for the modal
   * @default 400
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
   * Custom icon color
   * @default "#52c41a" (green)
   */
  iconColor?: string;

  /**
   * Custom button color
   * @default "#1890ff" (blue)
   */
  buttonColor?: string;

  /**
   * Additional callback for button click (if different from onClose)
   */
  onButtonClick?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  message = 'Submitted for approval',
  buttonText = 'Okay',
  width = 400,
  maskClosable = false,
  closable = true,
  iconColor = '#52c41a',
  buttonColor = '#002CBA',
  onButtonClick,
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
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
        {/* Success Icon */}
        <IconContainer iconColor={iconColor} color={iconColor}>
          <CheckCircleOutlineIcon sx={{ color: 'white', fontSize: '50px' }} />
        </IconContainer>

        {/* Success Message */}
        <Box sx={{ marginBottom: '40px' }}>
          {typeof message === 'string' ? (
            <Typography
              variant="h6"
              sx={{
                fontSize: '18px',
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
              }}
            >
              {message}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', padding: '0 24px 24px' }}>
        {/* Action Button */}
        <StyledButton
          variant="contained"
          onClick={handleButtonClick}
          color="primary"
          sx={{ backgroundColor: buttonColor }}
        >
          {buttonText}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default SuccessModal;
