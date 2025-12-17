import React from 'react';
import { Logout } from '@mui/icons-material';
import CKYCRRLogo from '../../../../assets/ckycrr_sign_up_logo.svg';
import {
  HeaderBox,
  HeaderButton,
  LogoSection,
  FullWidthRegistrationSection,
  RegistrationTitle,
} from '../RERegistrationContainer.style';

interface RegistrationHeaderProps {
  onHomeClick?: () => void;
  onLogoutClick?: () => void;
}

const RegistrationHeader: React.FC<RegistrationHeaderProps> = ({
  onHomeClick,
  onLogoutClick,
}) => {
  return (
    <>
      <HeaderBox>
        {/* Left side - Home button */}
        {/* <HeaderButton
          startIcon={<ArrowBack />}
          onClick={onHomeClick}
          sx={{
            justifySelf: 'flex-start',
            minWidth: '100px',
            '@media (max-width: 768px)': {
              minWidth: '80px',
              fontSize: '14px',
              padding: '6px 8px',
            },
            '@media (max-width: 480px)': {
              minWidth: '60px',
              fontSize: '12px',
              padding: '4px 6px',
              '& .MuiButton-startIcon': {
                marginRight: '4px',
              },
            },
          }}
        >
          Home
        </HeaderButton> */}

        {/* Center - Logo */}
        <LogoSection
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            '@media (max-width: 768px)': {
              position: 'static',
              transform: 'none',
              left: 'auto',
              flex: 1,
              justifyContent: 'center',
              margin: '0 4px',
            },
            '@media (max-width: 480px)': {
              margin: '0 2px',
            },
          }}
        >
          <img
            src={CKYCRRLogo}
            alt="CKYCRR Logo"
            style={{
              height: '40px',
              width: 'auto',
              maxWidth: '120px', // Prevent logo from being too wide on mobile
            }}
          />
        </LogoSection>

        {/* Right side - Logout button */}
        <HeaderButton
          startIcon={<Logout />}
          onClick={onLogoutClick}
          sx={{
            marginLeft: 'auto',
            justifySelf: 'flex-end',
            minWidth: '100px',
            '@media (max-width: 768px)': {
              minWidth: '80px',
              fontSize: '14px',
              padding: '6px 8px',
            },
            '@media (max-width: 480px)': {
              minWidth: '60px',
              fontSize: '12px',
              padding: '4px 6px',
              '& .MuiButton-startIcon': {
                marginRight: '4px',
              },
            },
          }}
        >
          Logout
        </HeaderButton>
      </HeaderBox>

      {/* Registration Header Bar */}
      <FullWidthRegistrationSection>
        <RegistrationTitle>Registration</RegistrationTitle>
      </FullWidthRegistrationSection>
    </>
  );
};

export default RegistrationHeader;
