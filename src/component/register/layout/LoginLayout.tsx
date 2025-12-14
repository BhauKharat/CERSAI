// src/components/layout/AuthLayout.tsx
import React, { ReactNode } from 'react';
import './AuthLayout.css';
import logo from '../../../assets/ckycrr_sign_up_logo.svg';
import bg from '../../../assets/sign_up_bg.svg';
import { Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

const LoginLayout: React.FC<Props> = ({ children }) => {
  // const [, setActiveTab] = useState('register');
  // const handleTabChange = (tab: string) => {
  //   setActiveTab(tab);
  // };
  return (
    <div
      className="auth-background"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="auth-container">
        {/* <button className="back-button">← Back</button> */}
        <img src={logo} alt="CKYCRR Logo" className="logo" />
        <Typography
          sx={{
            color: 'black',
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: '"Gilroy-Bold", sans-serif',
          }}
        >
          Login
        </Typography>
        {children}
      </div>
      <footer className="footer">© 2025 CKYCRR, All Rights Reserved.</footer>
    </div>
  );
};

export default LoginLayout;
