import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import { RootState } from '@redux/store';
import React, { useEffect, useState } from 'react'; // ReactNode is not directly used after the change
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'; // <--- Import Outlet
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
//import { reinitializeApplication } from '../../../redux/slices/registerSlice/authSlice';
import { userRoleConstants } from 'Constant';
import { allowedGroupsCersai } from '../../../../src/enums/userRoles.enum';
import AdminSidebar from '../Sidebar/AdminSidebar';

const drawerWidth = 326;

// No longer need LayoutProps for children if you're using Outlet
// interface LayoutProps {
//   children: ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => { // Remove children from props
const Layout: React.FC = () => {
  // <--- Update functional component signature
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  // const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();
  const location = useLocation();
  // const hasInitializedOnce = useRef(false);
  // const [initError] = useState(false);
  const { authToken, userDetails, groupMembership } = useSelector(
    (state: RootState) => state.auth
  );

  const isAuthenticated = authToken;

  // URL protection and role-based navigation
  useEffect(() => {
    if (!isAuthenticated) {
      return; // Don't redirect if not authenticated
    }

    // Admin User URL Protection
    if (
      groupMembership &&
      groupMembership?.some((role) => allowedGroupsCersai.includes(role))
    ) {
      // If admin user tries to access RE URLs, redirect to admin dashboard
      if (location.pathname.startsWith('/re')) {
        // console.log(
        //   'Admin user accessing RE URL, redirecting to admin dashboard'
        // );
        navigate('/ckycrr-admin/dashboard');
        return;
      }

      // If admin user is on login/signup pages, redirect to admin dashboard
      if (
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/signup'
      ) {
        // console.log('Admin user on auth pages, redirecting to admin dashboard');
        navigate('/ckycrr-admin/dashboard');
        return;
      }
    }

    // RE User URL Protection
    if (
      groupMembership?.includes(userRoleConstants.Nodal_Officer) &&
      userDetails?.approved === true
    ) {
      // If RE user tries to access admin URLs, redirect to RE dashboard
      if (location.pathname.startsWith('/ckycrr-admin')) {
        // console.log('RE user accessing admin URL, redirecting to RE dashboard');
        navigate('/re/dashboard');
        return;
      }

      // If RE user is on login/signup pages, redirect to RE dashboard
      if (
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/signup'
      ) {
        // console.log('RE user on auth pages, redirecting to RE dashboard');
        navigate('/re/dashboard');
        return;
      }
    }
  }, [
    groupMembership,
    isAuthenticated,
    location.pathname,
    navigate,
    userDetails?.approved,
  ]);

  // Keep mobile sidebar open when navigating to transfer-branch-list
  useEffect(() => {
    if (location.pathname === '/re/transfer-branch-list') {
      setMobileOpen(true);
    }
  }, [location.pathname]);

  // useEffect(() => {
  //   console.log('state Change1', initialized);
  //   if (window.localStorage.getItem('persist:root') === null) {
  //     // window.localStorage.removeItem('persist:root');
  //     navigate('/re-login', { state: { from: location }, replace: true });
  //   }
  // }, [initialized, location, navigate]);

  // useEffect(() => {
  //   console.log('state Change2', initialized);
  // }, [initialized]);

  if (!isAuthenticated) {
    // window.localStorage.removeItem('persist:root');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {groupMembership?.some((role) => allowedGroupsCersai.includes(role)) ? (
        <AdminSidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      ) : (
        <Sidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      )}
      <Box
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f6f8fa',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header onDrawerToggle={handleDrawerToggle} />
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet /> {/* <--- Replace {children} with <Outlet /> */}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
