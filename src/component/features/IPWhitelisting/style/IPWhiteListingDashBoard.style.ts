import { styled } from '@mui/material/styles';
import { Box, Tab, Tabs, Grid, Typography } from '@mui/material';

export const BreadcrumbWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#E3F2FD', // Light blue background from the image
  padding: '8px 12px',
  borderRadius: '6px',
  display: 'inline-flex', // Ensures the container only takes up as much width as needed
  alignItems: 'center',
  fontSize: '14px',
  color: theme.palette.text.secondary, // Default color for separators
}));

export const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#fff',
  minHeight: '100%',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: '15px',
  },
}));

export const TaskLabel = styled(Typography)(({ theme }) => ({
  fontFamily: 'Gilroy-Bold, sans-serif',
  fontWeight: 600,
  lineHeight: '100%',
  letterSpacing: '0px',
  textAlign: 'center',
  fontSize: '14px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '15px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '15px',
  },
  '&:first-child': {
    color: '#002CBA',
  },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: '8px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: '#002CBA',
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontFamily: 'Gilroy-SemiBold, sans-serif',
  fontWeight: 400,
  lineHeight: '100%',
  letterSpacing: '0px',
  textTransform: 'none',
  fontSize: '14px',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  [theme.breakpoints.up('sm')]: {
    fontSize: '15px',
    padding: theme.spacing(1, 3),
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '16px',
    padding: theme.spacing(1, 4),
  },
}));

export const GridContainer = styled(Grid)(({ theme }) => ({
  display: 'grid',
  gap: '8px',
  // Mobile first: 2 columns
  gridTemplateColumns: 'repeat(2, 1fr)',

  // Small devices: 3 columns
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },

  // Medium devices: 4 columns
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },

  // Large devices: 5 columns
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
  },

  // Extra large devices: 6 columns
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '20px',
  },
}));

export const TaskCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  padding: theme.spacing(2),

  // Mobile sizes
  width: '100%',
  minHeight: '140px',

  // Small devices
  [theme.breakpoints.up('sm')]: {
    minHeight: '160px',
    width: '100%',
  },

  // Medium devices and up - fixed sizes
  [theme.breakpoints.up('md')]: {
    width: '188px',
    height: '185px',
    minHeight: 'auto',
  },

  '&:hover': {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

export const CountBadge = styled(Box)(({ theme }) => ({
  marginTop: '8px',
  backgroundColor: '#000',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '15px',
  fontWeight: 500,

  // Mobile sizes
  width: '45px',
  height: '20px',
  fontSize: '0.75rem',

  // Small devices
  [theme.breakpoints.up('sm')]: {
    width: '48px',
    height: '22px',
    fontSize: '0.8rem',
  },

  // Medium devices and up
  [theme.breakpoints.up('md')]: {
    width: '50px',
    height: '23px',
    fontSize: '0.85rem',
  },
}));

export const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '8px',

  // Mobile height
  height: '40px',

  // Small devices
  [theme.breakpoints.up('sm')]: {
    height: '44px',
    marginBottom: '10px',
  },

  // Medium devices and up
  [theme.breakpoints.up('md')]: {
    height: '48px',
    marginBottom: '12px',
  },
}));

export const IconImage = styled('img')(({ theme }) => ({
  objectFit: 'contain',

  // Mobile sizes
  width: '32px',
  height: '32px',

  // Small devices
  [theme.breakpoints.up('sm')]: {
    width: '36px',
    height: '36px',
  },

  // Medium devices and up
  [theme.breakpoints.up('md')]: {
    width: '40px',
    height: '40px',
  },
}));
