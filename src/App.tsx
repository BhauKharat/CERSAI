import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Loader from './component/loader/Loader';
import { initializeStorageMonitoring } from './utils/storageUtils';
import { setupQuotaErrorMonitoring } from './utils/quotaErrorHandler';
import { attachCopyGuard, detachCopyGuard } from './utils/clipboardGuards';
import './component/admin-features/dashboard/DashboardPage.css';

const App: React.FC = () => {
  // Initialize storage monitoring and quota error handling on app startup
  useEffect(() => {
    attachCopyGuard();
    initializeStorageMonitoring();
    setupQuotaErrorMonitoring();

    return () => {
      detachCopyGuard();
    };
  }, []);

  return (
    <>
      <Loader />
      <AppRoutes />
    </>
  );
};

export default App;
