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
      bgcolor: '#fff',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      mt: 'auto',
    }}
  >
    <Typography variant="body2" color="text.secondary">
      &copy; {new Date().getFullYear()} CKYCRR, All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
