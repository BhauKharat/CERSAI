import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const TabButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>(({ isActive }) => ({
  position: 'relative',
  padding: '12px 24px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  outline: 'none',
  color: isActive ? '#002CBA' : '#666666',
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '14px',
  fontWeight: isActive ? 600 : 500,
  lineHeight: '20px',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: '#002CBA',
    backgroundColor: 'rgba(0, 44, 186, 0.04)',
  },
  '&:focus-visible': {
    boxShadow: '0 0 0 2px rgba(0, 44, 186, 0.3)',
    borderRadius: '4px',
  },
  '&[aria-selected="true"]': {
    color: '#002CBA',
  },
}));

export const ActiveTabIndicator = styled('div')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '2px',
  backgroundColor: '#002CBA',
  borderRadius: '2px 2px 0 0',
});

export const TabListContainer = styled(Box)({
  display: 'flex',
  borderBottom: '1px solid #E0E0E0',
  margin: '5px 5px 12px 5px',
  padding: '0 24px',
  // width: '100%',
  boxSizing: 'border-box',
});
