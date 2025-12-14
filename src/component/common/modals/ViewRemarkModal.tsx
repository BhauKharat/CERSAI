import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  SxProps,
  Theme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface ViewRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  remark: string;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  // New props for rejected status - showing both reason and rejection remark
  rejectionRemark?: string;
  rejectionRemarkLabel?: string;
  // Props for unblock IP rejected - showing blocked reason
  blockedReason?: string;
  blockedReasonLabel?: string;
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

const ViewRemarkModal: React.FC<ViewRemarkModalProps> = ({
  isOpen,
  onClose,
  remark,
  title,
  subtitle,
  disabled = false,
  rejectionRemark,
  rejectionRemarkLabel = 'Remark for Rejection',
  blockedReason,
  blockedReasonLabel = 'Remark for Block IP',
}) => {
  const remarkLength = remark?.length || 0;
  const rejectionRemarkLength = rejectionRemark?.length || 0;
  const blockedReasonLength = blockedReason?.length || 0;
  const maxLength = 500;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="view-remark-dialog"
      PaperProps={{
        sx: {
          maxWidth: 520,
          borderRadius: 0,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle sx={dialogTitleStyles}>
        <Typography variant="h6" component="div">
          {title || 'View Remark'}
        </Typography>
        <IconButton aria-label="close" onClick={onClose} sx={closeButtonStyles}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={dialogContentStyles}>
        {/* Show blocked reason section first when blockedReason is provided (for unblock IP rejected) */}
        {blockedReason !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                fontFamily: 'Gilroy, sans-serif',
                color: 'text.primary',
              }}
            >
              {blockedReasonLabel}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={blockedReason || 'No remark available'}
              disabled={disabled}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Gilroy, sans-serif',
                  backgroundColor: disabled ? '#D1D1D1' : '#F9F9F9',
                  '& fieldset': {
                    borderColor: 'grey.300',
                  },
                  '&:hover fieldset': {
                    borderColor: 'grey.300',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'grey.300',
                    borderWidth: '1px',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#D1D1D1',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Gilroy, sans-serif',
                }}
              >
                {blockedReasonLength}/{maxLength}
              </Typography>
            </Box>
          </Box>
        )}

        {subtitle && (
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontWeight: 600,
              fontFamily: 'Gilroy, sans-serif',
              color: 'text.primary',
            }}
          >
            {subtitle}
          </Typography>
        )}

        <Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={remark || 'No remark available'}
            disabled={disabled}
            InputProps={{
              readOnly: true,
            }}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Gilroy, sans-serif',
                backgroundColor: disabled ? '#D1D1D1' : '#F9F9F9',
                '& fieldset': {
                  borderColor: 'grey.300',
                },
                '&:hover fieldset': {
                  borderColor: 'grey.300',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'grey.300',
                  borderWidth: '1px',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#D1D1D1',
                },
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontFamily: 'Gilroy, sans-serif' }}
            >
              {remarkLength}/{maxLength}
            </Typography>
          </Box>
        </Box>

        {/* Show rejection remark section only when rejectionRemark is provided */}
        {rejectionRemark !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                fontFamily: 'Gilroy, sans-serif',
                color: 'text.primary',
              }}
            >
              {rejectionRemarkLabel}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={rejectionRemark || 'No remark available'}
              disabled={disabled}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Gilroy, sans-serif',
                  backgroundColor: disabled ? '#D1D1D1' : '#F9F9F9',
                  '& fieldset': {
                    borderColor: 'grey.300',
                  },
                  '&:hover fieldset': {
                    borderColor: 'grey.300',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'grey.300',
                    borderWidth: '1px',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#D1D1D1',
                  },
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'Gilroy, sans-serif',
                }}
              >
                {rejectionRemarkLength}/{maxLength}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={dialogActionsStyles}>
        <Button
          variant="contained"
          onClick={onClose}
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
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRemarkModal;
