import { styled } from '@mui/material/styles';
import { Box, TableContainer, TableCell, IconButton } from '@mui/material';

// Main container for the page
export const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#F9FAFB',
  minHeight: '100vh',
}));

// Container for the top bar elements like the Back button
export const TopBarContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
});

// Styled Table components
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  boxShadow: 'none',
  marginTop: theme.spacing(2),
}));

export const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#F8F9FD',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  fontSize: '14px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const StyledTableBodyCell = styled(TableCell)({
  fontWeight: 500,
  fontSize: '14px',
  borderBottom: 'none',
});

// Container for action buttons (Approve/Reject)
export const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(4),
}));

// Styled Modal components
export const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
  padding: theme.spacing(3, 3, 4),
  textAlign: 'center',
  outline: 'none',
}));

export const ModalIconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const CloseButton = styled(IconButton)({
  position: 'absolute',
  right: 8,
  top: 8,
  color: '#002CBA',
});
