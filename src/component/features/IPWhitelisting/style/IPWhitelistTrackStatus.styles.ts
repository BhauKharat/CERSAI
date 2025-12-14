import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  RadioGroup,
  Paper,
  TableCell,
  TableCellProps,
  TextField,
  Typography,
} from '@mui/material';

// --- Layout Containers ---

export const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#F9FAFC',
  minHeight: '100vh',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const TableWrapper = styled(Paper)({
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  overflow: 'hidden',
});

export const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  padding: theme.spacing(0, 1),
}));

export const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

// --- Table Components ---

export const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#E6EBFF',
  borderBottom: 'none',
  padding: '12px 16px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  color: theme.palette.text.primary,
  textAlign: 'center',
  whiteSpace: 'nowrap',
}));

export const StyledTableCell = styled(TableCell)<TableCellProps>(
  ({ theme }) => ({
    fontFamily: 'Gilroy, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    color: theme.palette.text.primary,
    textAlign: 'center',
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.palette.divider}`,
  })
);

// --- Form & Action Components ---

export const SearchTextField = styled(TextField)({
  width: '238px',
  color: '#999999',
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Gilroy, sans-serif',
    borderRadius: '4px',
    backgroundColor: 'white',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#002CBA',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 6px 10px 4px',
  },
});

export const RadioGroupContainer = styled(RadioGroup)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiFormControlLabel-root': {
    marginRight: theme.spacing(4),
  },
  '& .MuiRadio-root': {
    color: '#002CBA',
  },
}));

export const NavButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.grey[400]}`,
  borderRadius: '4px',
  height: '38px',
  padding: '6px 12px',
}));

export const PageButton = styled(Button)({
  minWidth: '38px',
  width: '38px',
  height: '38px',
  borderRadius: '4px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  color: 'white',
  backgroundColor: '#002CBA',
  '&:hover': {
    backgroundColor: '#001a8c',
  },
});

// --- Status Display ---
interface StatusDisplayProps {
  statusType:
    | 'Approved'
    | 'Rejected'
    | 'Approval Pending'
    | 'IP Verified'
    | 'IP Verification Failed'
    | 'IP Verification in-process'
    | 'PENDING'
    | string;
}

export const StatusDisplay = styled(Typography)<StatusDisplayProps>(({
  theme,
  statusType,
}) => {
  const normalizedStatus = statusType.toUpperCase();

  const statusColors: Record<string, string> = {
    APPROVED: '#52AE32', // Green color for approved
    REJECTED: '#FF0000',
    FAILED: '#FF0000', // Red color for failed
    PENDING: '#F59E0B', // Amber color
    'APPROVAL PENDING': '#FF7600', // Amber color
    'IP VERIFIED': theme.palette.info.main,
    'IP VERIFICATION FAILED': theme.palette.error.main, // Red color for IP Verification Failed
    'IP VERIFICATION IN-PROCESS': theme.palette.text.secondary,
  };

  return {
    fontWeight: 600,
    fontSize: '14px',
    color: statusColors[normalizedStatus] || theme.palette.text.primary,
  };
});
