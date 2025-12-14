// src/components/layout/AuthLayout.tsx
import React, { ReactNode, useState } from 'react';
import './AuthLayout.css';
import logo from '../../../assets/ckycrr_sign_up_logo.svg';
import bg from '../../../assets/sign_up_bg.svg';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

const AuthLayout: React.FC<Props> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('register');
  const navigate = useNavigate();
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <div className="auth-background" style={{ backgroundImage: `url(${bg})` }}>
      <div className="auth-container">
        {/* <button className="back-button">← Back</button> */}
        <img src={logo} alt="CKYCRR Logo" className="logo" />
        <div className="tab-container">
          <button
            className={activeTab === 'signup' ? 'active' : ''}
            onClick={() => {
              navigate('/re-signup');
              handleTabChange('signup');
            }}
          >
            Sign Up
          </button>
          <button
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => {
              // Redirect the user to the '/re-login' screen
              navigate('/re-login');
              handleTabChange('register');
            }}
          >
            Resume Registration
          </button>
        </div>
        {children}
        <footer className="footer">© 2025 CKYCRR, All Rights Reserved.</footer>
      </div>
    </div>
  );
};

export default AuthLayout;
