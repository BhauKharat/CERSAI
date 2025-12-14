import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer: React.FC = () => (
  <Box
    component="footer"
    sx={{
      width: '100%',
      py: 2,
      px: { xs: 1, sm: 3 },
      fontSize: '14px',
      fontWeight: '400',
      color: '#6B7280',
      fontFamily: 'Gilroy',
      textAlign: 'center',
      mt: 'auto',
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        fontSize: '14px',
        fontWeight: '400',
        color: '#6B7280',
        fontFamily: 'Gilroy',
      }}
    >
      &copy; {new Date().getFullYear()} CKYCRR Dashboard. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
