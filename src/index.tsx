import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './component/admin-features/dashboard/DashboardPage.css';
import { Provider } from 'react-redux';

import { store } from './redux/store';
import { injectStore } from './services/CKYCAdmin/api';
import App from './App';

// Inject Redux store into API service for automatic token handling (same as UpdateEntityProfileStep pattern)
injectStore(store);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>
);
