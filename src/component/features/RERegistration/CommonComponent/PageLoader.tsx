import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

interface PageLoaderProps {
  open: boolean;
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  open,
  message = 'Please wait...',
}) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" size={50} />
        <Typography variant="h6" component="div">
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default PageLoader;

