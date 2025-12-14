import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from 'store';
import { useDispatch, useSelector } from 'react-redux';
import { resetAuth } from '../../../redux/slices/registerSlice/authSlice';
import { resetAdminOfficerState } from '../../../redux/slices/registerSlice/institutionadminSlice';
import { resetHeadInstitutionState } from '../../../redux/slices/registerSlice/institutiondetailSlice';
import { resetNodal } from '../../../redux/slices/registerSlice/nodalOfficerSlice';
import { resetRegitsration } from '../../../redux/slices/registerSlice/registrationSlice';
import { RootState } from '@redux/store';
import { useTheme, useMediaQuery } from '@mui/material';
import { allowedGroupsCersai } from '../../../../src/enums/userRoles.enum';

interface HeaderProps {
  onDrawerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { userDetails, groupMembership } = useSelector(
    (state: RootState) => state.auth
  );
  const titlePage =
    groupMembership &&
    groupMembership?.some((role) => allowedGroupsCersai.includes(role))
      ? true
      : false;
  const given_name = userDetails?.firstName;

  // State for user dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/ckyc/icons/user.svg', // Placeholder for avatar
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log('Logout user');
    // Clear all Redux states
    dispatch(resetAuth());
    dispatch(resetAdminOfficerState());
    dispatch(resetHeadInstitutionState());
    dispatch(resetNodal());
    dispatch(resetRegitsration());
    // Navigate to login page
    navigate('ckyc/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#fff',
        color: '#222',
        borderBottom: '1px solid #e5e7eb',
        width: {
          xs: '100%',
          sm: 'calc(100% - 280px)',
          md: 'calc(100% - 326px)',
        },
        ml: {
          xs: 0,
          sm: '280px',
          md: '326px',
        },
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: '56px',
            sm: '64px',
          },
          padding: {
            xs: '0 8px',
            sm: '0 16px',
          },
        }}
      >
        {/* Hamburger menu for small screens */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{
            mr: 2,
            display: { sm: 'none' },
            padding: { xs: '8px' },
          }}
          aria-label="open drawer"
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title */}
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            paddingLeft: { xs: 0, sm: 1 },
            minWidth: 0, // Allow shrinking
          }}
        >
          <Typography
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: '0.9rem',
                sm: '1.1rem',
                md: '1.2rem',
                lg: '1.3rem',
                xl: '1.5rem',
              },
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: {
                xs: '200px',
                sm: '300px',
                md: '400px',
              },
            }}
          >
            {titlePage ? 'Admin' : 'Reporting Entity'}
          </Typography>
        </Box>

        {/* Right-hand side icons and user menu */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {/* Notifications Icon */}
          <IconButton
            color="inherit"
            sx={{
              padding: { xs: '6px', sm: '8px' },
              minWidth: 'auto',
            }}
          >
            <img
              src="/ckyc/icons/notification.svg"
              alt="Notifications"
              style={{
                height: isMobile ? '18px' : '22px',
                width: 'auto',
              }}
            />
          </IconButton>

          {/* Settings Icon */}
          <IconButton
            color="inherit"
            sx={{
              padding: { xs: '6px', sm: '8px' },
              minWidth: 'auto',
            }}
          >
            <img
              src="/ckyc/icons/settings.svg"
              alt="Settings"
              style={{
                height: isMobile ? '18px' : '22px',
                width: 'auto',
              }}
            />
          </IconButton>

          {/* User Avatar, Name, and Arrow */}
          <IconButton
            onClick={handleUserClick}
            size="small"
            sx={{
              ml: { xs: 0.5, sm: 1, md: 2 },
              display: 'flex',
              alignItems: 'center',
              padding: { xs: '4px', sm: '6px', md: '8px' },
              borderRadius: '24px',
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                borderRadius: '50%',
                marginRight: isMobile ? '4px' : '8px',
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color: 'inherit',
                fontWeight: 500,
                lineHeight: 1,
                display: { xs: 'none', sm: 'block' },
                fontSize: {
                  sm: '0.875rem',
                  md: '1rem',
                },
              }}
            >
              {given_name?.charAt(0).toUpperCase()}
              {given_name?.slice(1)}
            </Typography>
            <KeyboardArrowDownIcon
              sx={{
                ml: { xs: 0, sm: 0.5 },
                fontSize: {
                  xs: '1rem',
                  sm: '1.2rem',
                },
              }}
            />
          </IconButton>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 2,
                boxShadow:
                  '0px 2px 8px rgba(0,0,0,0.08), 0px 1.5px 3px rgba(0,0,0,0.05)',
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  px: 2,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
