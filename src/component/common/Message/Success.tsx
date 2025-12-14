import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SuccessProps {
  message: string;
}

const Success: React.FC<SuccessProps> = ({ message }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      mb={2}
      sx={{ backgroundColor: '#e8f5e9', p: 1.5, borderRadius: '4px' }}
    >
      <CheckCircleIcon sx={{ color: '#2ecc40', mr: 1 }} />
      <Typography
        variant="h6"
        color="success.main"
        sx={{ fontWeight: 500, fontSize: '1rem' }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Success;
