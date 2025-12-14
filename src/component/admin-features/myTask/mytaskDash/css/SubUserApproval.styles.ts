import { styled } from '@mui/material/styles';
import {
  TableContainer,
  TableCell,
  TableRow,
  Box,
  Button,
} from '@mui/material';

// --- Colors based on CertifyModifyUser ---
const COLORS = {
  headerBg: '#E6EBFF',
  rowHover: '#E4F6FF',
  textBlue: '#002CBA',
  textDark: '#000000',
  border: '#E0E0E0',
  divider: 'rgba(224, 224, 224, 1)',
};

// 1. The Main Wrapper
export const StyledTableWrapper = styled(Box)({
  margin: '0 24px 24px',
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
  border: `1px solid ${COLORS.border}`,
});

// 2. The Table Container
export const StyledTableContainer = styled(TableContainer)({
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#rgba(0,0,0,0.2)',
    borderRadius: '4px',
  },
});

// 3. The Header Cell (Gray/Blue background, Bold text)
export const StyledHeaderCell = styled(TableCell)({
  backgroundColor: COLORS.headerBg,
  color: COLORS.textDark,
  fontWeight: 600,
  fontSize: '14px',
  fontFamily: 'Gilroy, sans-serif',
  borderBottom: 'none',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  padding: '16px',
  position: 'sticky',
  top: 0,
  zIndex: 10,

  // Flex layout for the content (Label + Sort Icon)
  '& .header-content': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
    '&:hover': {
      color: COLORS.textBlue,
    },
  },

  // Sort Icons Container
  '& .sort-icons': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: '4px',
    height: '14px',
    justifyContent: 'center',
  },
});

// 4. The Body Row (Hover effect + Relative positioning for dividers)
export const StyledTableRow = styled(TableRow)({
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: `${COLORS.rowHover} !important`,
  },
  // Ensure cells handle the vertical divider positioning
  '& .MuiTableCell-root': {
    position: 'relative',
    paddingTop: '16px',
    paddingBottom: '16px',
  },
  // The Vertical Divider Logic (Matches CertifyModifyUser)
  '& .MuiTableCell-root:not(:last-of-type)::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: COLORS.border,
    pointerEvents: 'none',
  },
});

// 5. The Body Cell (Blue text, Centered)
export const StyledBodyCell = styled(TableCell)({
  color: COLORS.textBlue, // The signature blue color
  textAlign: 'center',
  fontSize: '14px',
  fontFamily: 'Gilroy, sans-serif',
  borderBottom: `1px solid ${COLORS.border}`,

  // Specific override for Status column if needed (usually has conditional colors)
  '&.status-cell': {
    fontWeight: 600,
  },

  // Text wrapping logic
  whiteSpace: 'normal',
  wordBreak: 'break-word',
});

// 6. Pagination / Footer Area
export const StyledTableFooter = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  borderTop: `1px solid ${COLORS.border}`,
  backgroundColor: '#FFFFFF',
});

export const PaginationWrapper = styled(Box)({
  backgroundColor: '#FFFFFF',
  borderRadius: '0 0 8px 8px', // Rounded bottom corners
  padding: '16px 0',
  margin: '0 24px 24px', // Match table margin
  display: 'grid',
  gridTemplateColumns: '1fr auto', // Left text | Right buttons
  alignItems: 'center',
  rowGap: '12px',

  // Mobile responsiveness
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
    justifyItems: 'center',
    gap: '16px',
  },
});

export const PaginationInfo = styled('div')({
  textAlign: 'left',
  paddingLeft: '16px',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  color: '#000000',
  '@media (max-width: 900px)': {
    textAlign: 'center',
    paddingLeft: 0,
  },
});

export const PaginationNav = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '40px', // Spacing between Prev - Numbers - Next
  paddingRight: '16px',

  '@media (max-width: 600px)': {
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingRight: 0,
  },
});

export const NavButton = styled(Button)({
  height: '32px',
  borderRadius: '4px',
  border: '1px solid #D0D5DD',
  color: '#344054',
  textTransform: 'none',
  padding: '8px 12px',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
  minWidth: '100px', // Ensure consistent width for Prev/Next
  display: 'flex',
  gap: '6px',

  '&:hover': {
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
  },
  '&:disabled': {
    color: '#98A2B3',
    borderColor: '#EAECF0',
  },
});

// For the 1, 2, 3 numbers
export const PageNumberBtn = styled(Button)<{ active?: boolean }>(
  ({ active }) => ({
    minWidth: '32px',
    height: '32px',
    padding: 0,
    fontFamily: 'Gilroy, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',

    // Conditional Styling based on 'active' prop
    color: active ? '#FFFFFF' : '#667085',
    backgroundColor: active ? '#002CBA' : 'transparent',

    '&:hover': {
      backgroundColor: active ? '#001a8c' : '#F9FAFB',
    },
  })
);
