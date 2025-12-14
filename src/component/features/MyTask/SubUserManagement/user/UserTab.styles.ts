import styled from '@emotion/styled';
import { Box, Button } from '@mui/material';
import { SxProps, Theme } from '@mui/material';

export const UserContainer = styled(Box)`
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
`;

export const BackButton = styled(Button)`
  color: #000;
  font-weight: 500;
  text-transform: none;
  font-size: 16px;
  align-self: flex-start;
  margin-left: 8px;
`;

export const statusIndicatorStyles: SxProps<Theme> = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 118, 0, 1)',
  mr: 1,
};

export const statusTextStyles = (
  status: 'Approved' | 'Pending Approval' | 'PENDING'
): SxProps<Theme> => ({
  color: status === 'Approved' ? '#52AE32' : 'rgba(255, 118, 0, 1)',
  fontWeight: 600,
  fontFamily: 'Gilroy, sans-serif',
  fontSize: '16px',
});
