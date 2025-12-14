// components/layouts/RegistrationWrapper.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import RegistrationInitializer from '../../../component/register/RegistrationInitializer/RegistrationInitializer';

const RegistrationWrapper: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <RegistrationInitializer key={location.pathname} />
      <Outlet />
    </>
  );
};

export default RegistrationWrapper;
