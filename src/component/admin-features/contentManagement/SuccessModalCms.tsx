/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React from 'react';
import Successcmstick from '../../../assets/Successcmstick.png';
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOkay?: () => void;
  message?: string;
  title?: string;
}
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  DialogTitle,
  Box,
  IconButton,
} from '@mui/material';
import { styles } from './cms.style';
const SuccessModalCms: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onOkay,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={false}
      sx={{
        backdropFilter: 'blur(5px)',
        '& .MuiDialog-paper': {
          borderRadius: '4px',
          width: '350px',
        },
      }}
    >
      <DialogTitle>
        {' '}
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'block',
          textAlign: 'center',
          justifyContent: 'center',
          justifyItems: 'center',
        }}
      >
        <img src={Successcmstick} alt="img"></img>

        <Typography sx={styles.dialogueTitleFee}>{title}</Typography>
        {message}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: '4px' }}>
        <Button
          sx={{ backgroundColor: '#002CBA', color: 'white', px: 8, py: 1 }}
          onClick={onOkay}
          style={{ textTransform: 'none' }}
        >
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessModalCms;
