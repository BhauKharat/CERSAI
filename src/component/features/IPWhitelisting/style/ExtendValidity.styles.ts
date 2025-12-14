import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Dialog,
  Paper,
  TableCell,
  TableCellProps,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
    padding: '8px 16px',
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

export const StyledDatePicker = styled(DatePicker)(() => ({
  width: '150px',
  '& .MuiOutlinedInput-root': {
    height: '40px',
    fontFamily: 'Gilroy, sans-serif',
    borderRadius: '4px',
    '& .MuiOutlinedInput-input': {
      padding: '0 14px',
    },
  },
  '& .MuiInputAdornment-root .MuiButtonBase-root': {
    marginRight: '-8px',
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

export const SubmitButton = styled(Button)({
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  width: '178px',
  fontWeight: 600,
  fontSize: '16px',
  padding: '10px 32px',
  height: '48px',
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

export const SuccessDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '16px',
    width: '350px',
  },
});

export const SuccessModalTitle = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const SuccessModalContainer = styled(Box)({
  textAlign: 'center',
  padding: '0px 20px 30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px',
});
