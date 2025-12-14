import { SxProps, Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import {
  Button,
  ButtonProps,
  TableCell,
  TableCellProps,
  Paper,
  Box,
} from '@mui/material';

// Styled Component Prop Interfaces
export interface StyledTableCellProps extends TableCellProps {
  isBlocked?: boolean;
}

export interface PageButtonProps extends ButtonProps {
  isActive?: boolean;
}

// Styled Components for Layout
export const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#FFFFFF',
  minHeight: '100vh',
  fontFamily: 'Gilroy, sans-serif',
  // Set a base font weight to give text more thickness
  fontWeight: 500,
}));

export const FormWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const TableWrapper = styled(Paper)({
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  overflow: 'hidden',
});

// Styled Components for Table
export const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#E6EBFF',
  borderBottom: 'none',
  padding: '12px 16px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600, // Header remains bold
  fontSize: '14px',
  color: theme.palette.text.primary,
  textAlign: 'center',
  whiteSpace: 'nowrap',
}));

export const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isBlocked',
})<StyledTableCellProps>(({ theme, isBlocked }) => ({
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500, // Body text is now consistently medium-weight
  fontSize: '14px',
  color: isBlocked ? '#FF0000' : theme.palette.text.primary,
  textAlign: 'center',
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const SortableHeaderContainer: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.5,
  cursor: 'pointer',
  '&:hover': {
    color: '#002CBA',
  },
};

export const SortIconContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

// Styled Components for Footer/Pagination
export const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(0, 1),
}));

export const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const PageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<PageButtonProps>(({ theme, isActive }) => ({
  minWidth: '36px',
  height: '36px',
  borderRadius: '4px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 600, // Pagination buttons remain bold
  ...(isActive && {
    backgroundColor: '#002CBA',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: '#001a8c',
    },
  }),
}));

// Styled Components for Form Elements
export const ActionButton = styled(Button)({
  backgroundColor: '#002CBA',
  color: 'white',
  textTransform: 'none',
  fontWeight: 600,
  width: '135px',
  height: '48px',
  padding: '8px 24px',
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

export const BrowseButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderColor: theme.palette.grey[400],
  color: theme.palette.text.primary,
  fontFamily: 'Gilroy, sans-serif',
  padding: '8px 24px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'transparent',
  },
}));
