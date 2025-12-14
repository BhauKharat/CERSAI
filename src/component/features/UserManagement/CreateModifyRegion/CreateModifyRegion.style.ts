import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  TableCell,
  TableRow,
  Container,
  Paper,
  TableContainer,
  Typography,
  MenuItem,
  IconButton,
  Select,
} from '@mui/material';

// Responsive breakpoints
const breakpoints = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
};

export const StyledSearchContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: '24px',
  [breakpoints.mobile]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
  },
});

export const StyledSearchBox = styled(Box)({
  display: 'flex',
  gap: '24px',
  alignItems: 'flex-end',
  flex: 1,
  [breakpoints.mobile]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
  },
});

export const StyledSearchField = styled(Box)({
  minWidth: '220px',
  maxWidth: '280px',
  flex: 1,
  [breakpoints.mobile]: {
    minWidth: 'unset',
    width: '100%',
  },
  [breakpoints.tablet]: {
    minWidth: '220px',
  },
});

export const StyledSearchInput = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#1A1A1A',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1A1A1A',
    },
    height: '40px',
    color: '#1A1A1A',
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
  },
  '& .MuiInputBase-input': {
    padding: '8px 14px',
  },
};

export const StyledLabel = styled(Typography)({
  marginBottom: '4px',
  color: '#1A1A1A',
  fontWeight: 500,
  fontSize: '14px',
  fontFamily: 'Gilroy, sans-serif',
});

export const StyledSearchFieldContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  width: '100%',
  [breakpoints.mobile]: {
    flexDirection: 'column',
    gap: '12px',
  },
});

export const StyledStatusSelect = styled(Select)({
  '& .MuiSelect-select': {
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
  },
});

export const StyledStatusMenuItem = styled(MenuItem)({
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

export const StyledButton = styled(Button)({
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': { backgroundColor: '#001f8e' },
  textTransform: 'none',
  padding: '0 24px',
  height: '40px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  [breakpoints.mobile]: {
    width: '100%',
    padding: '0 16px',
    fontSize: '16px',
    height: '44px',
  },
});

export const StyledBackButton = styled(Button)({
  color: '#000',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 400,
  padding: 0,
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#333',
  },
});

export const StyledTableHead = styled(TableRow)({
  backgroundColor: '#E6EBFF',
  '& .MuiTableCell-head': {
    backgroundColor: '#E6EBFF',
    borderBottom: 'none',
  },
  '&:hover': { backgroundColor: '#E6EBFF' },
});

export const StyledTableHeaderCell = styled(TableCell)({
  padding: '14px 12px',
  color: '#000000',
  textAlign: 'center',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 700,
  fontSize: '14px',
  whiteSpace: 'nowrap',
  '&:first-of-type': { fontWeight: 'bold' },
  [breakpoints.mobile]: {
    padding: '10px 6px',
    fontSize: '12px',
    minWidth: '60px',
  },
});

export const StyledTableBody = styled(TableRow)({
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#E4F6FF' },
});

export const StyledTableCell = styled(TableCell)({
  padding: '16px 12px',
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  textAlign: 'center',
  fontSize: '14px',
  position: 'relative',
  color: 'rgba(0, 44, 186, 1)',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px',

  '&:not(:last-child)::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: '8px',
    bottom: '8px',
    width: '1px',
    backgroundColor: 'rgba(224, 224, 224, 1)',
  },
  [breakpoints.mobile]: {
    padding: '10px 6px',
    fontSize: '12px',
    minWidth: '60px',
    maxWidth: '150px',
    '&:not(:last-child)::after': {
      top: '4px',
      bottom: '4px',
    },
  },
});

export const StyledContainer = styled(Container)({
  marginTop: '0',
  marginBottom: '24px',
  padding: '0 24px',
  maxWidth: '100%',
  width: '100%',
  [breakpoints.mobile]: {
    padding: '0 16px',
    marginBottom: '16px',
  },
});

export const StyledPaper = styled(Paper)({
  marginBottom: '24px',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  width: '100%',
  '&.search-paper': {
    padding: '0',
    marginBottom: '24px',
    boxShadow: 'none',
    [breakpoints.mobile]: {
      padding: '0 8px',
      marginBottom: '16px',
    },
  },
  [breakpoints.mobile]: {
    marginBottom: '16px',
  },
});

export const StyledTableContainer = styled(TableContainer)({
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid rgba(224, 224, 224, 1)',
  width: '100%',
  '& .MuiTable-root': {
    width: '100%',
  },
  [breakpoints.mobile]: {
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      height: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#c1c1c1',
      borderRadius: '2px',
    },
  },
});

export const StyledStatusIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: 'Approved' | 'Rejected' | 'Approval Pending' }>(({ status }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .status-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor:
      status === 'Approved'
        ? '#52AE32'
        : status === 'Rejected'
          ? 'rgba(255, 0, 0, 1)'
          : 'transparent',
    marginRight: '8px',
    [breakpoints.mobile]: {
      width: 6,
      height: 6,
      marginRight: '4px',
    },
  },
  '& .status-text': {
    color:
      status === 'Approved'
        ? '#52AE32'
        : status === 'Rejected'
          ? 'rgba(255, 0, 0, 1)'
          : status === 'Approval Pending'
            ? 'rgba(255, 118, 0, 1)'
            : 'rgba(0, 0, 0, 0.6)',
    fontWeight: 600,
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '16px',
    [breakpoints.mobile]: {
      fontSize: '12px',
    },
  },
}));

export const StyledPaginationContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '24px',
  padding: '0',
  [breakpoints.mobile]: {
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  },
});

export const StyledPaginationInfo = styled(Typography)({
  color: '#666',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  [breakpoints.mobile]: {
    fontSize: '12px',
    textAlign: 'center',
  },
});

export const StyledPaginationButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isDisabled',
})<{ isActive?: boolean; isDisabled?: boolean }>(
  ({ isActive, isDisabled }) => ({
    minWidth: 'auto',
    padding: '6px 12px',
    color: isDisabled ? '#ccc' : isActive ? '#fff' : '#1A1A1A',
    borderColor: '#E0E0E0',
    textTransform: 'none',
    backgroundColor: isActive ? '#002CBA' : 'transparent',
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    '&:hover': {
      borderColor: '#1A1A1A',
      backgroundColor: isActive ? '#001f8e' : 'rgba(0, 44, 186, 0.04)',
      color: isActive ? '#fff' : '#1A1A1A',
    },
    '&.page-button': {
      minWidth: '32px',
      minHeight: '32px',
      padding: 0,
      borderRadius: '4px',
      [breakpoints.mobile]: {
        minWidth: '36px',
        minHeight: '36px',
        fontSize: '14px',
      },
    },
    [breakpoints.mobile]: {
      padding: '8px 16px',
      fontSize: '14px',
    },
  })
);

export const StyledMenuItem = styled(MenuItem)({
  color: '#1A1A1A',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
});

export const StyledIconButton = styled(IconButton)({
  color: 'rgba(0, 0, 0, 0.6)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '&.enabled': {
    opacity: 1,
    cursor: 'pointer',
  },
  '&.disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const tableColumnWidths = {
  serial: '6%',
  name: '15%',
  code: '12%',
  status: '12%',
  activity: '12%',
  submittedOn: '15%',
  submittedBy: '12%',
  action: '15%',
  lastUpdatedOn: '15%',
  lastUpdatedBy: '15%',
};

// Mobile table widths with minimum widths
export const mobileTableColumnWidths = {
  serial: '50px',
  name: '120px',
  code: '100px',
  status: '100px',
  activity: '100px',
  submittedOn: '120px',
  submittedBy: '100px',
  action: '80px',
  lastUpdatedOn: '120px',
  lastUpdatedBy: '120px',
};

// Additional styled components for inline styles
export const StyledBackButtonContainer = styled(Box)({
  marginTop: '16px',
  marginBottom: '24px',
  [breakpoints.mobile]: {
    marginTop: '12px',
    marginBottom: '16px',
  },
});

export const StyledStatusFilterContainer = styled(Box)({
  minWidth: '150px',
  width: '150px',
  [breakpoints.mobile]: {
    width: '100%',
  },
});

export const StyledButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  alignSelf: 'flex-end',
  [theme.breakpoints.down('md')]: {
    alignSelf: 'stretch',
    marginTop: '16px',
  },
}));

export const StyledCreateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#002CBA',
  color: 'white',
  '&:hover': { backgroundColor: '#001f8e' },
  textTransform: 'none',
  padding: '0 24px',
  height: '40px',
  fontFamily: 'Gilroy, sans-serif',
  fontWeight: 500,
  fontSize: '14px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const StyledSerialHeaderCell = styled(StyledTableHeaderCell)({
  fontWeight: 700,
});

export const StyledSortableHeaderCell = styled(StyledTableHeaderCell)({
  cursor: 'pointer',
  userSelect: 'none',
});

export const StyledSortContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontWeight: 800,
});

export const StyledSortIconContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    height: '16px',
    width: '16px',
    color: '#000000',
    marginLeft: '4px',
  },
});

export const StyledPaginationButtonContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  [breakpoints.mobile]: {
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
