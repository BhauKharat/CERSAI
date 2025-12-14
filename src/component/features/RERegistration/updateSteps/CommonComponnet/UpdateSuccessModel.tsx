import React from 'react';
import {
  Backdrop,
  Box,
  Button,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';

export interface UpdateSuccessModalProps {
  open: boolean;
  messageType?: 'success' | 'error';
  onClose: () => void;
  title?: string;
  message?: string;
  okText?: string;
  onOk?: () => void;
}

export default function UpdateSuccessModal({
  open,
  onClose,
  title,
  message,
  okText,
  onOk,
  messageType = 'success',
}: UpdateSuccessModalProps) {
  return (
    <Modal
      open={open}
      onClose={() => {}}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(45, 43, 39, 0.3)',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow:
            '0px 263px 74px 0px rgba(0,0,0,0), 0px 169px 67px 0px rgba(0,0,0,0.01), 0px 95px 57px 0px rgba(0,0,0,0.03), 0px 42px 42px 0px rgba(0,0,0,0.05), 0px 11px 23px 0px rgba(0,0,0,0.06)',
          p: { xs: 3, md: 6 },
          maxWidth: { xs: '90vw', sm: '400px', md: '433px' },
          width: '100%',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#000',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M16.0672 15.1828C16.1253 15.2409 16.1713 15.3098 16.2027 15.3857C16.2342 15.4616 16.2503 15.5429 16.2503 15.625C16.2503 15.7071 16.2342 15.7884 16.2027 15.8643C16.1713 15.9402 16.1253 16.0091 16.0672 16.0672C16.0091 16.1253 15.9402 16.1713 15.8643 16.2027C15.7884 16.2342 15.7071 16.2503 15.625 16.2503C15.5429 16.2503 15.4616 16.2342 15.3857 16.2027C15.3098 16.1713 15.2409 16.1253 15.1828 16.0672L10 10.8836L4.81719 16.0672C4.69991 16.1845 4.54085 16.2503 4.375 16.2503C4.20915 16.2503 4.05009 16.1845 3.93281 16.0672C3.81554 15.9499 3.74965 15.7909 3.74965 15.625C3.74965 15.4591 3.81554 15.3001 3.93281 15.1828L9.11641 10L3.93281 4.81719C3.81554 4.69991 3.74965 4.54085 3.74965 4.375C3.74965 4.20915 3.81554 4.05009 3.93281 3.93281C4.05009 3.81554 4.20915 3.74965 4.375 3.74965C4.54085 3.74965 4.69991 3.81554 4.81719 3.93281L10 9.11641L15.1828 3.93281C15.3001 3.81554 15.4591 3.74965 15.625 3.74965C15.7909 3.74965 15.9499 3.81554 16.0672 3.93281C16.1845 4.05009 16.2503 4.20915 16.2503 4.375C16.2503 4.54085 16.1845 4.69991 16.0672 4.81719L10.8836 10L16.0672 15.1828Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box sx={{ width: '48px', height: '48px' }}>
            {messageType === 'success' ? (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="19" fill="#54B749" />
                <path
                  d="M15 23L21 29L33 18"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24.5"
                  cy="24"
                  r="18"
                  stroke="#FF0707"
                  strokeWidth="2"
                />
                <path
                  d="M24.8515 27.5L24.8516 13"
                  stroke="#FF0707"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="24.5" cy="34" r="2" fill="#FF0707" />
              </svg>
            )}
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: '"Gilroy-SemiBold", sans-serif',
                color: '#000',
                mb: 1,
                lineHeight: 1.4,
              }}
            >
              {title}
            </Typography>
            {message && (
              <Typography
                sx={{
                  fontSize: '16px',
                  fontFamily: '"Gilroy-Medium", sans-serif',
                  color: '#646464',
                  lineHeight: 1.4,
                }}
              >
                {message}
              </Typography>
            )}
          </Box>
          <Button
            onClick={onOk ?? onClose}
            variant="contained"
            sx={{
              backgroundColor: '#002CBA',
              color: 'white',
              textTransform: 'none',
              minWidth: '200px',
              height: '48px',
              fontSize: '16px',
              fontFamily: '"Gilroy-Medium", sans-serif',
              borderRadius: '4px',
              '&:hover': { backgroundColor: '#001a8a' },
            }}
          >
            {okText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
