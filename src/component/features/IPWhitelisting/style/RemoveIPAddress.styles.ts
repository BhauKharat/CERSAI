import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  Paper,
  TableCell,
  TableCellProps,
  TextField,
} from '@mui/material';

// --- Layout Containers ---

export const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#FFFFFF',
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
  gap: theme.spacing(2), // Increased gap for better spacing
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
  fontsize: '14px',
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

// New component for Previous/Next buttons
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

interface PageButtonProps extends ButtonProps {
  isActive?: boolean;
}

// Styled for the ACTIVE page number button
export const PageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<PageButtonProps>(({ theme }) => ({
  // <-- Corrected: Removed unused 'isActive' prop here
  minWidth: '38px',
  width: '38px',
  height: '38px',
  borderRadius: '4px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600,
  color: theme.palette.common.white,
  backgroundColor: '#002CBA',
  '&:hover': {
    backgroundColor: '#001a8c',
  },
}));

export const SubmitButton = styled(Button)({
  backgroundColor: '#002CBA',
  color: 'white',
  width: '178px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
  padding: '10px 32px', // Adjusted padding for width
  height: '48px', // Set fixed height
  borderRadius: '4px',
  fontFamily: 'Gilroy, sans-serif',
  '&:hover': {
    backgroundColor: '#001a8c',
  },
  '&.Mui-disabled': {
    backgroundColor: '#999999',
    color: '#FFFFFF',
  },
});

// --- Modal Dialog Components ---

export const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '20px',
    width: '400px',
  },
});

export const ModalTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '18px',
  fontFamily: 'Gilroy, sans-serif',
});

export const RemarkTextField = styled(TextField)({
  marginTop: '8px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontFamily: 'Gilroy, sans-serif',
  },
});

export const ModalActions = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '20px',
});

export const CancelButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderColor: theme.palette.grey[400],
  color: theme.palette.text.primary,
  fontFamily: 'Gilroy, sans-serif',
  padding: '8px 24px',
  borderRadius: '8px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));

export const SuccessModalContainer = styled(Box)({
  textAlign: 'center',
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '15px',
});
