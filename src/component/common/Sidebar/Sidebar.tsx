/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

// Material-UI Icons
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { USER_ROLES } from '../../../utils/enumUtils';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface RootState {
  auth: {
    groupMembership: string[];
  };
}

interface MenuItemType {
  label?: string;
  icon?: React.ReactNode | string;
  to?: string;
  children?: MenuItemType[];
  section?: string;
  pathPrefix?: string;
  subChildrens?: ISubChildrenType[];
}

interface IChildrenType {
  label: string;
  to: string;
}
interface ISubChildrenType {
  label: string;
  children: IChildrenType[];
}

// type RouteConfig = [string[], string];

const menuItems: MenuItemType[] = [
  { section: '' },
  {
    label: 'Dashboard',
    icon: '/ckyc/icons/dashboard.png',
    to: '/re/dashboard',
  },
  // {
  //   label: 'My Task',
  //   icon: '/ckyc/icons/Task.png',
  //   children: [
  //     {
  //       label: 'Update Entity Profile',
  //       to: '/re/update-entity-profile',
  //     },
  //     {
  //       label: 'Sub-user management',
  //       to: '/re/sub-user-management',
  //     },
  //     {
  //       label: 'Billing Management',
  //       to: '/re/billing-management',
  //     },
  //     {
  //       label: 'IP Whitelisting',
  //       to: '/re/ip-whitelisting',
  //     },
  //   ],
  // },
  {
    label: 'KYC Management',
    icon: '/ckyc/icons/KYC.png',
    pathPrefix: '/kyc',
    children: [
      { label: 'Search KYC Record', to: '/re/kyc/search' },
      { label: 'Download KYC Record', to: '/re/kyc/download' },
      { label: 'Create KYC Record', to: '/re/kyc/create' },
      { label: 'Update KYC Record', to: '/re/kyc/update' },
    ],
  },
  {
    label: 'User Management',
    icon: '/ckyc/icons/UserManagement.svg',
    subChildrens: [
      {
        label: 'Region',
        children: [
          {
            label: 'Create',
            to: '/re/create-new-region',
          },
          {
            label: 'Modify',
            to: '/re/modify-region',
          },
          {
            label: 'Merge',
            to: '/re/merge-region',
          },

          {
            label: 'De-activate',
            to: '/re/deactivate-region',
          },
          {
            label: 'Track Status',
            to: '/re/track-region-status',
          },
        ],
      },
      {
        label: 'Branch',
        children: [
          {
            label: 'Create',
            to: '/re/create-new-branch',
          },
          {
            label: 'Modify',
            to: '/re/modify-branch',
          },
          {
            label: 'Merge',
            to: '/re/merge-branch',
          },
          {
            label: 'Transfer',
            to: '/re/transfer-branch-list',
          },
          {
            label: 'De-activate',
            to: '/re/deactivate-branch',
          },
          {
            label: 'Track Status',
            to: '/re/track-branch-status',
          },
        ],
      },
      {
        label: 'User',
        children: [
          {
            label: 'Create',
            to: '/re/create-new-user',
          },
          {
            label: 'Modify',
            to: '/re/modify-user',
          },

          {
            label: 'De-activate',
            to: '/re/deactivate-user',
          },
          {
            label: 'Suspend',
            to: '/re/suspend-user',
          },
          {
            label: 'Revoke Suspension',
            to: '/re/revoke-suspension',
          },
          {
            label: 'Track Status',
            to: '/re/track-user-status',
          },
        ],
      },
    ],
  },
  {
    label: 'Billing Management System',
    icon: '/ckyc/icons/Billing.png',
    to: '/re/billing',
  },
  {
    label: 'Update Profile',
    icon: '/ckyc/icons/Sub-User.png',
    //pathPrefix: '/update-profile',
    children: [
      { label: 'Entity Profile', to: '/re/update-entity-profile-step' },
      { label: 'User Profile', to: '/re/update-user-profile' },
      { label: 'DSC Setup', to: '/re/update-dsc-setup' },
      { label: 'Track Status', to: '/re/update-trackstatus' },
    ],
  },
  {
    label: 'Ticket management',
    icon: '/ckyc/icons/Ticket.png',
    to: '/re/tickets',
  },
  {
    label: 'De-Activation',
    icon: '/ckyc/icons/UserCirclePlus.png',
    to: '/re/deactivation',
  },
  {
    label: 'IP Whitelisting',
    icon: '/ckyc/icons/ip 1.png',
    pathPrefix: '/ip-whitelisting',
    children: [
      { label: 'View Whitelisted IPs', to: '/re/ip-whitelisting/view' },
      { label: 'Upload/Replace Public Key', to: '/re/ip-whitelisting/upload' },
      { label: 'Add New IP', to: '/re/ip-whitelisting/addNewIPAddress' },
      { label: 'Remove IP', to: '/re/ip-whitelisting/removeIPAddress' },
      { label: 'Extend Validity', to: '/re/ip-whitelisting/extendValidity' },
      { label: 'Track Status', to: '/re/ip-whitelisting/trackStatus' },
    ],
  },
  { label: 'Merger', icon: '/ckyc/icons/Merger.png', to: '/merger' },
  {
    label: 'MIS Report',
    icon: '/ckyc/icons/MIS.png',
    children: [
      {
        label: 'Create/ modify region',
        to: '/re/create-modify-region',
      },
      {
        label: 'Create/ modify branch',
        to: '/re/create-modify-branch',
      },
      {
        label: 'Create/ modify user',
        to: '/re/create-modify-user',
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const locationState = location.state as {
    deactivate?: boolean;
    suspend?: boolean;
    revoke?: boolean;
    track?: boolean;
    deactivateBranch?: boolean;
    isTrack?: boolean;
    transferBranch?: boolean;
    isTransfer?: boolean;
  } | null;

  // Get groupMembership from Redux store
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership || []
  );

  // Filter menu items based on groupMembership
  const filteredMenuItems = menuItems
    .filter((item) => {
      // User Management should only be accessible to Institutional_Admin_User or Institutional_Regional_Admin
      if (item.label === 'User Management') {
        return (
          groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER) ||
          groupMembership.includes(USER_ROLES.INSTITUTIONAL_REGIONAL_ADMIN)
        );
      }
      return true; // Keep all other menu items
    })
    .map((item) => {
      if (item.label === 'Update Profile' && item.children) {
        // Only show "Entity Profile" if groupMembership includes "Nodal_Officer"
        const filteredChildren = item.children.filter((child) => {
          if (child.label === 'Entity Profile') {
            return (
              groupMembership.includes(USER_ROLES.NODAL_OFFICER) ||
              groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER)
            );
          }
          return true; // Keep all other children
        });
        return { ...item, children: filteredChildren };
      }

      // Filter User Management menu items based on role
      if (item.label === 'User Management' && item.subChildrens) {
        const filteredSubChildrens = item.subChildrens
          .filter((subChild) => {
            // Region submenu should only be accessible to Institutional_Admin_User
            if (subChild.label === 'Region') {
              return groupMembership.includes(
                USER_ROLES.INSTITUTIONAL_ADMIN_USER
              );
            }
            return true; // Keep all other submenus (Branch, User)
          })
          .map((subChild) => {
            // Filter Region submenu
            if (subChild.label === 'Region' && subChild.children) {
              const filteredRegionChildren = subChild.children.filter(
                (child) => {
                  // Only show "Create" if user is Institutional_Admin_User
                  if (
                    child.label === 'Create' ||
                    child.label === 'Modify' ||
                    child.label === 'Merge' ||
                    child.label === 'De-activate' ||
                    child.label === 'Track Status'
                  ) {
                    return groupMembership.includes(
                      USER_ROLES.INSTITUTIONAL_ADMIN_USER
                    );
                  }
                  return true; // Keep all other children (Track Status)
                }
              );
              return { ...subChild, children: filteredRegionChildren };
            }
            // Filter Branch submenu
            if (subChild.label === 'Branch' && subChild.children) {
              const filteredBranchChildren = subChild.children.filter(
                (child) => {
                  // Show "Create" if user is Institutional_Admin_User or Institutional_Regional_Admin
                  if (
                    child.label === 'Create' ||
                    child.label === 'Modify' ||
                    child.label === 'Merge' ||
                    child.label === 'Transfer' ||
                    child.label === 'De-activate' ||
                    child.label === 'Track Status'
                  ) {
                    return (
                      groupMembership.includes(
                        USER_ROLES.INSTITUTIONAL_ADMIN_USER
                      ) ||
                      groupMembership.includes(
                        USER_ROLES.INSTITUTIONAL_REGIONAL_ADMIN
                      )
                    );
                  }
                  return true; // Keep all other children (Modify, Merge, Transfer, De-activate, Track Status)
                }
              );
              return { ...subChild, children: filteredBranchChildren };
            }
            // Filter User submenu
            if (subChild.label === 'User' && subChild.children) {
              const filteredUserChildren = subChild.children.filter((child) => {
                // Only show "Create" if user is Institutional_Admin_User
                if (
                  child.label === 'Create' ||
                  child.label === 'Modify' ||
                  child.label === 'De-activate' ||
                  child.label === 'Suspend' ||
                  child.label === 'Revoke Suspension' ||
                  child.label === 'Track Status'
                ) {
                  return (
                    groupMembership.includes(
                      USER_ROLES.INSTITUTIONAL_ADMIN_USER
                    ) ||
                    groupMembership.includes(
                      USER_ROLES.INSTITUTIONAL_REGIONAL_ADMIN
                    )
                  );
                }
                return true; // Keep all other children (Modify, De-activate, Suspend, Revoke Suspension, Track Status)
              });
              return { ...subChild, children: filteredUserChildren };
            }
            return subChild;
          });
        return { ...item, subChildrens: filteredSubChildrens };
      }

      return item;
    });

  const [openMenus, setOpenMenus] = useState<{ [label: string]: boolean }>({});

  const user = {
    name: 'Jane Admin',
    email: 'jane.admin@example.com',
    avatar: '/ckyc/CKYCRR.png',
  };

  let lastSection: string | null = null;

  // Helper function to check if a path is active
  const isPathActive = useCallback(
    (path: string, currentPath: string) => {
      if (path === currentPath) return true;

      // Check if we're on modify-user page from deactivate/suspend/revoke actions
      if (currentPath.startsWith('/re/modify-user/')) {
        // If deactivate flag is set, only activate deactivate-user menu
        if (locationState?.deactivate) {
          return path === '/re/deactivate-user';
        }
        // If suspend flag is set, only activate suspend-user menu
        if (locationState?.suspend) {
          return path === '/re/suspend-user';
        }
        // If revoke flag is set, only activate revoke-suspension menu
        if (locationState?.revoke) {
          return path === '/re/revoke-suspension';
        }
        // If track flag is set, only activate track-user-status menu
        if (locationState?.track) {
          return path === '/re/track-user-status';
        }
      }

      // Check if we're on modify-region page from deactivate/track actions
      if (currentPath.startsWith('/re/modify-region/')) {
        // If deactivate flag is set, only activate deactivate-region menu
        if (locationState?.deactivate) {
          return path === '/re/deactivate-region';
        }
        // If track flag is set, only activate track-region-status menu
        if (locationState?.track) {
          return path === '/re/track-region-status';
        }
      }

      // Check if we're on transfer-branch page (form page), activate transfer-branch-list menu
      if (currentPath === '/re/transfer-branch') {
        if (path === '/re/transfer-branch-list') {
          return true;
        }
      }

      // Check if we're on modify-branch page from deactivate/track/transfer actions
      if (currentPath.startsWith('/re/modify-branch/')) {
        // If deactivateBranch flag is set, only activate deactivate-branch menu
        if (locationState?.deactivateBranch) {
          return path === '/re/deactivate-branch';
        }
        // If track flag or isTrack flag is set, only activate track-branch-status menu
        if (locationState?.track || locationState?.isTrack) {
          return path === '/re/track-branch-status';
        }
        // If transferBranch flag or isTransfer flag is set, only activate transfer-branch-list menu
        if (locationState?.transferBranch || locationState?.isTransfer) {
          return path === '/re/transfer-branch-list';
        }
        // Default: activate modify-branch menu (when navigating from modify-branch list)
        if (path === '/re/modify-branch') {
          return true;
        }
      }

      if (path === '/re/update-entity-profile-step') {
        return (
          currentPath.startsWith('/update-entity-profile-step') ||
          currentPath.startsWith('/re/update-address-step') ||
          currentPath.startsWith('/re/update-hoi-step') ||
          currentPath.startsWith('/re/update-nodal-officer-step') ||
          currentPath.startsWith('/re/update-admin-user-step') ||
          currentPath.startsWith('/re/update-form-preview-step') ||
          currentPath.startsWith('/re/update-track-status')
        );
      }

      // If the path is a prefix, make sure the next character is a / or the end of the string
      if (currentPath.startsWith(path)) {
        const nextChar = currentPath[path.length];
        return !nextChar || nextChar === '/';
      }
      return false;
    },
    [locationState]
  );

  useEffect(() => {
    const newOpenMenus: { [label: string]: boolean } = {};
    filteredMenuItems.forEach((item) => {
      if (item.children && item.label) {
        let isActive = false;

        // Special handling for Update Profile menu
        if (item.label == 'Update Profile') {
          isActive = item.children.some(
            (child) => child.to && isPathActive(child.to, location.pathname)
          );
        } else {
          // Existing logic for other menus
          const isActiveChild = item.children.some(
            (child) => child.to && isPathActive(child.to, location.pathname)
          );
          const isActiveParent =
            item.pathPrefix && isPathActive(item.pathPrefix, location.pathname);

          isActive = isActiveChild || isActiveParent || false;
        }

        newOpenMenus[item.label] = isActive;
      }

      if (item.subChildrens) {
        let isActive = false;

        const isActiveChild = item.subChildrens.some((child) =>
          child.children.some(
            (sub) => sub.to && isPathActive(sub.to, location.pathname)
          )
        );
        const isActiveParent =
          item.pathPrefix && isPathActive(item.pathPrefix, location.pathname);

        isActive = isActiveChild || isActiveParent || false;

        if (item.label) {
          newOpenMenus[item.label] = isActive;
        }

        item.subChildrens.forEach((subChild) => {
          const isSubChildActive = subChild.children.some(
            (item) => item.to && isPathActive(item.to, location.pathname)
          );

          newOpenMenus[subChild.label] = isSubChildActive;
        });
      }
    });
    setOpenMenus(newOpenMenus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, locationState, groupMembership]);

  const handleMenuClick = (label: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderIcon = (
    icon: MenuItemType['icon'],
    isActive: boolean | string | undefined
  ) => {
    if (typeof icon === 'string') {
      return (
        <img
          src={icon}
          alt="icon"
          style={{
            width: '24px',
            height: '24px',
            filter: isActive
              ? 'invert(100%) brightness(100%) contrast(100%)'
              : 'brightness(0)',
          }}
        />
      );
    } else if (icon) {
      return React.cloneElement(icon as React.ReactElement, {});
    }
    return null;
  };

  const renderSubChildIcon = (
    icon: MenuItemType['icon'],
    isActive: boolean | string | undefined
  ) => {
    if (typeof icon === 'string') {
      return (
        <img
          src={icon}
          alt="icon"
          style={{
            width: '24px',
            height: '24px',
            filter: isActive ? 'brightness(1)' : 'brightness(0)',
          }}
        />
      );
    } else if (icon) {
      return React.cloneElement(icon as React.ReactElement, {});
    }
    return null;
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          justifyContent: 'center',
          height: { xs: 56, sm: 64 },
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <img
          src={user.avatar}
          alt="CKYCRR Logo"
          style={{
            height: 'auto',
            width: '100%',
            maxWidth: isMobile ? '100px' : '180px',
            maxHeight: isMobile ? '32px' : '40px',
            objectFit: 'contain',
            display: 'block',
            // paddingLeft:'5px'
          }}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#fff',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#E6EBFF',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a1a1a1',
            borderRadius: '4px',
          },
        }}
      >
        <List sx={{ pt: 1, px: { xs: 0.5, sm: 0 } }}>
          {filteredMenuItems.map((item, idx) => {
            if (item.section) {
              if (lastSection !== null) {
                lastSection = item.section;
                return (
                  <React.Fragment key={item.section}>
                    <Divider sx={{ my: 1 }} />
                    <Typography
                      sx={{
                        pl: { xs: 1.5, sm: 2 },
                        py: 0.5,
                        fontSize: { xs: 12, sm: 13 },
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.section}
                    </Typography>
                  </React.Fragment>
                );
              } else {
                lastSection = item.section;
                return (
                  <Typography
                    key={item.section}
                    sx={{
                      pl: { xs: 1.5, sm: 2 },
                      py: 0.5,
                      fontSize: { xs: 12, sm: 13 },
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.section}
                  </Typography>
                );
              }
            }

            if (item.children && !item.subChildrens?.length) {
              // For parent menu items with children, do not apply background color
              // only apply color to icon and text if any child is active
              const isAnyChildActive = item.children.some(
                (child) => child.to && isPathActive(child.to, location.pathname)
              );

              return (
                <React.Fragment key={item.label ?? 'no-label'}>
                  <ListItem
                    onClick={(e) => handleMenuClick(item.label ?? '', e)}
                    sx={{
                      cursor: 'pointer',
                      minHeight: 56,
                      px: { xs: 1, sm: 2 },
                      mx: { xs: 1, sm: 2 }, // ✅ Horizontal margin
                      width: 'auto', // ✅ Prevent full width
                      backgroundColor: isAnyChildActive
                        ? '#002CBA'
                        : 'transparent',
                      color: isAnyChildActive ? '#fff' : 'inherit',
                      borderRadius: '8px',
                      marginBottom: 0.2,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 36, sm: 40 },
                        //color: isAnyChildActive ? '#1976d2' : 'inherit',
                        color: isAnyChildActive ? '#fff' : 'inherit',
                      }}
                    >
                      {renderIcon(item.icon, isAnyChildActive)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label ?? ''}
                      slotProps={{
                        primary: {
                          fontWeight: 500,
                          color: isAnyChildActive ? '#fff' : 'inherit',
                        },
                      }}
                    />
                    {item.label &&
                      (openMenus[item.label] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItem>

                  <Collapse
                    in={item.label ? openMenus[item.label] : false}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child) =>
                        child.to ? (
                          <NavLink
                            key={child.label ?? `child-${child.to}`}
                            to={child.to}
                            style={{ textDecoration: 'none' }}
                          >
                            <ListItem
                              sx={{
                                pl: { xs: 4, sm: 6 },
                                minHeight: { xs: 36, sm: 40 },
                                // Apply background color directly to the ListItem of the sub-menu
                                backgroundColor: isPathActive(
                                  child.to,
                                  location.pathname
                                )
                                  ? '#D1DDFF'
                                  : 'inherit',

                                // borderLeft: isPathActive(
                                //   child.to,
                                //   location.pathname
                                // )
                                //   ? '2px solid #1976d2'
                                //   : 'none',
                                borderLeft: 'none',
                                // Apply text color directly to the ListItem
                                color: isPathActive(child.to, location.pathname)
                                  ? '#002CBA'
                                  : 'inherit',
                                ml: { xs: 1, sm: 2 }, // same margin-left as parent
                                mr: { xs: 1, sm: 2 }, // same margin-right as parent
                                width: 'auto', // prevent full width
                              }}
                            >
                              <ListItemText
                                primary={child.label ?? ''}
                                slotProps={{
                                  primary: {
                                    fontSize: 14,
                                    fontFamily: 'Gilroy, sans-serif',
                                    fontWeight: 500,
                                    width: 'auto',
                                    sx: {
                                      pl: 4, // 👈 Left padding for text (adjust as needed)
                                    },
                                  },
                                }}
                              />
                            </ListItem>
                          </NavLink>
                        ) : (
                          <ListItem
                            key={child.label ?? `child-${idx}`}
                            sx={{
                              pl: { xs: 4, sm: 6 },
                              minHeight: { xs: 36, sm: 40 },
                            }}
                          >
                            <ListItemText
                              primary={child.label ?? ''}
                              slotProps={{
                                primary: {
                                  fontSize: { xs: 12, sm: 13 },
                                  fontFamily: 'Gilroy, sans-serif',
                                  fontWeight: 500,
                                },
                              }}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }

            if (item.subChildrens) {
              const isAnyChildActive = item.subChildrens.some((child) =>
                child.children.some(
                  (sub) => sub.to && isPathActive(sub.to, location.pathname)
                )
              );

              return (
                <React.Fragment key={item.label}>
                  <ListItem
                    onClick={(e) => handleMenuClick(item.label ?? '', e)}
                    sx={{
                      cursor: 'pointer',
                      minHeight: 56,
                      px: { xs: 1, sm: 2 },
                      mx: { xs: 1, sm: 2 },
                      width: 'auto',
                      backgroundColor: isAnyChildActive
                        ? '#002CBA'
                        : 'transparent',
                      color: isAnyChildActive ? '#fff' : 'inherit',
                      borderRadius: '8px',
                      marginBottom: 0.2,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 36, sm: 40 },
                        color: isAnyChildActive ? '#fff' : '#000',
                      }}
                    >
                      {renderSubChildIcon(item.icon, isAnyChildActive)}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label ?? ''}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: isAnyChildActive ? '#fff' : '#000',
                      }}
                    />

                    {item.label &&
                      (openMenus[item.label] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItem>

                  <Collapse
                    in={item.label ? openMenus[item.label] : false}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.subChildrens.map((subChild, idx) => {
                        const isSubChildActive = subChild.children.some(
                          (subItem) =>
                            subItem.to &&
                            isPathActive(subItem.to, location.pathname)
                        );

                        return (
                          <React.Fragment key={idx}>
                            <ListItem
                              onClick={(e) =>
                                handleMenuClick(subChild.label ?? '', e)
                              }
                              sx={{
                                cursor: 'pointer',
                                minHeight: 30,
                                px: { xs: 1, sm: 2 },
                                mx: { xs: 1, sm: 2 },
                                width: 'auto',
                                backgroundColor: isSubChildActive
                                  ? 'rgba(209, 221, 255, 1)'
                                  : 'transparent',
                                color: isSubChildActive ? '#fff' : '#000',
                                borderRadius: '8px',
                                marginBottom: 0.2,
                              }}
                            >
                              <ListItemText
                                primary={subChild.label ?? ''}
                                slotProps={{
                                  primary: {
                                    sx: {
                                      fontWeight: 700,
                                      lineHeight: '26px',
                                      color: 'rgba(0, 0, 0, 1)',
                                      fontFamily: 'Gilroy, sans-serif',
                                      fontSize: '14px',
                                      padding: '0 60px',
                                    },
                                  },
                                }}
                              />

                              {subChild.label &&
                                (openMenus[subChild.label] ? (
                                  <ExpandLess
                                    sx={{
                                      color: '#000',
                                    }}
                                  />
                                ) : (
                                  <ExpandMore />
                                ))}
                            </ListItem>

                            <Collapse
                              in={
                                subChild.label
                                  ? openMenus[subChild.label]
                                  : false
                              }
                              timeout="auto"
                              unmountOnExit
                            >
                              <List component="div" disablePadding>
                                {subChild.children && subChild.children.length
                                  ? subChild.children.map((child) => (
                                      <NavLink
                                        key={child.label ?? `child-${child.to}`}
                                        to={child.to}
                                        style={{ textDecoration: 'none' }}
                                      >
                                        <ListItem
                                          sx={{
                                            position: 'relative',
                                            '&::before': {
                                              content: '"•"',
                                              position: 'absolute',
                                              left: '32%',
                                              color: isSubChildActive
                                                ? '#002CBA'
                                                : '#000',
                                              fontSize: 20,
                                              lineHeight: 1,
                                            },
                                            paddingTop: { xs: 0, sm: '3px' },
                                            paddingBottom: { xs: 0, sm: '3px' },
                                            pl: { xs: 4, sm: 6 },
                                            minHeight: { xs: 36, sm: 20 },
                                            backgroundColor: isPathActive(
                                              child.to,
                                              location.pathname
                                            )
                                              ? '#E4F6FF'
                                              : '#fff',
                                            color: isPathActive(
                                              child.to,
                                              location.pathname
                                            )
                                              ? '#002CBA'
                                              : 'inherit',
                                            ml: { xs: 1, sm: 2 },
                                            mr: { xs: 1, sm: 2 },
                                            width: 'auto',
                                          }}
                                        >
                                          <ListItemText
                                            primary={child.label ?? ''}
                                            slotProps={{
                                              primary: {
                                                sx: {
                                                  fontSize: 15,
                                                  fontFamily:
                                                    'Gilroy, sans-serif',
                                                  fontWeight: 600,
                                                  padding: {
                                                    xs: 0,
                                                    sm: '0 60px',
                                                  },
                                                  sx: { pl: 4 },
                                                },
                                              },
                                            }}
                                          />
                                        </ListItem>
                                      </NavLink>
                                    ))
                                  : null}
                              </List>
                            </Collapse>
                          </React.Fragment>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }

            if (item.label) {
              return item.to ? (
                <NavLink
                  key={item.label ?? 'no-label'}
                  to={item.to}
                  style={({ isActive }) => ({
                    textDecoration: 'none',
                    background: 'inherit',
                    color: isActive ? '#f2ebf0ff' : 'inherit',
                  })}
                >
                  <ListItem
                    sx={{
                      minHeight: { xs: 40, sm: 48 },
                      px: { xs: 1, sm: 2 },
                      mx: { xs: 1, sm: 2 },
                      ml: { xs: 1, sm: 2 }, // margin left for all parent headers
                      mr: { xs: 1, sm: 2 }, // margin right for all parent headers
                      backgroundColor: location.pathname.startsWith(item.to)
                        ? '#002CBA'
                        : 'inherit',
                      borderRadius: '8px',
                      width: 'auto',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 36, sm: 40 },
                        color: location.pathname.startsWith(item.to)
                          ? '#1976d2'
                          : 'inherit',
                      }}
                    >
                      {renderIcon(
                        item.icon,
                        location.pathname.startsWith(item.to)
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label ?? ''}
                      slotProps={{
                        primary: {
                          fontSize: { xs: 13, sm: 15 },
                          fontFamily: 'Gilroy, sans-serif',
                          fontWeight: 500,
                        },
                      }}
                    />
                  </ListItem>
                </NavLink>
              ) : (
                <ListItem
                  key={item.label ?? `item-${idx}`}
                  sx={{
                    minHeight: { xs: 40, sm: 48 },
                    px: { xs: 1, sm: 2 },
                    ml: { xs: 1, sm: 2 }, // margin left for all parent headers
                    mr: { xs: 1, sm: 2 }, // margin right for all parent headers
                    width: 'auto',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                    {renderIcon(item.icon, false)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label ?? ''}
                    slotProps={{
                      primary: {
                        fontSize: { xs: 13, sm: 15 },
                        fontFamily: 'Gilroy, sans-serif',
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItem>
              );
            }
            return null;
          })}
        </List>
        <Divider />
      </Box>
    </Box>
  );

  return (
    <nav aria-label="sidebar navigation">
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
          },
        }}
      >
        {drawer}
      </Drawer>
    </nav>
  );
};

export default Sidebar;
