import React from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const RejectRequestSucessModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="reject-modal-title"
      aria-describedby="reject-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 5,
          textAlign: 'center',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CancelIcon sx={{ fontSize: 80, color: 'red' }} />
        </Box>
        <Typography variant="h5" sx={{ color: 'black' }}>
          Request Rejected
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          The request has been successfully rejected and will not proceed
          further.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            backgroundColor: '#002CBA',
            '&:hover': { backgroundColor: '#001a8b' },
            textTransform: 'none',
            maxWidth: 100,
            p: 2,
          }}
        >
          Okay
        </Button>
      </Box>
    </Modal>
  );
};

export default RejectRequestSucessModal;
