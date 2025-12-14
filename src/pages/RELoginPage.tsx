// src/pages/LoginPage.tsx
import React from 'react';
// import LoginLayout from '../component/register/layout/LoginLayout';
import RELoginForm from '../component/login/RELoginForm';
import AuthLayout from '../component/register/layout/AuthLayout';

const RELoginPage = () => {
  return (
    <AuthLayout>
      <RELoginForm />
    </AuthLayout>
  );
};

export default RELoginPage;
