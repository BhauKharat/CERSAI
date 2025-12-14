import React, { useState, useEffect, useCallback } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

interface MenuItemType {
  label?: string;
  icon?: React.ReactNode | string;
  to?: string;
  children?: MenuItemType[];
  section?: string;
}

const menuItems: MenuItemType[] = [
  { section: '' },
  {
    label: 'Dashboard',
    icon: '/ckyc/icons/dashboard.png',
    to: '/ckycrr-admin/dashboard',
  },
  {
    label: 'My Task',
    icon: '/ckyc/icons/Task.png',
    children: [
      {
        label: 'New Request',
        to: '/ckycrr-admin/my-task/dashboard',
      },
      {
        label: 'Track Status',
        to: '/ckycrr-admin/my-task/trackstatus',
      },
    ],
  },
  {
    icon: '/ckyc/icons/UserManagement.png',
    label: 'User Management',
    children: [
      {
        label: 'User',
        children: [
          {
            label: 'View User Details',
            to: '/ckycrr-admin/sub-users/certify-modify?action=View User Details',
          },
          {
            label: 'Create',
            to: '/ckycrr-admin/sub-users/create-new-user',
          },
          {
            label: 'Modify',
            to: '/ckycrr-admin/sub-users/certify-modify?action=Modify',
          },
          {
            label: 'De-activate',
            to: '/ckycrr-admin/sub-users/certify-modify?action=De-activate',
          },
          {
            label: 'Suspend',
            to: '/ckycrr-admin/sub-users/certify-modify?action=Suspend',
          },
          {
            label: 'Revoke Suspension',
            to: '/ckycrr-admin/sub-users/certify-modify?action=Revoke Suspension',
          },
          {
            label: 'Track Status',
            to: '/ckycrr-admin/sub-users/certify-modify?action=Track Status',
          },
          // {
          //   label: 'Approvals',
          //   to: '/ckycrr-admin/sub-users/approvals',
          // },
        ],
      },
    ],
  },
  {
    label: 'RE Management',
    icon: '/ckyc/icons/reManagementIcon.svg',
    children: [
      {
        label: 'De-activation',
        to: '/ckycrr-admin/re-management/deactivation',
      },
      {
        label: 'Suspension',
        to: '/ckycrr-admin/re-management/suspension',
      },
      {
        label: 'Revoke Suspension',
        to: '/ckycrr-admin/re-management/revoke-suspension',
      },
      {
        label: 'Update Nodal Officer & IAU',
        to: '/ckycrr-admin/re-management/update-nodal-officer-and-iau',
      },
    ],
  },
  {
    label: 'Content Management System',
    icon: '/ckyc/icons/reManagementIcon.svg',
    children: [
      {
        label: 'Homepage',
        to: '/ckycrr-admin/cms/home',
      },
      {
        label: 'Template/Content',
        to: '/ckycrr-admin/cms/template',
      },
      {
        label: 'Form Validation',
        to: '/ckycrr-admin/cms/form',
      },
      {
        label: 'Document Validation',
        to: '/ckycrr-admin/cms/doc',
      },
      {
        label: 'Fees Management',
        to: '/ckycrr-admin/cms/fees-management',
      },
    ],
  },
];

const AdminSidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<{ [label: string]: boolean }>({});

  const user = {
    name: 'Jane Admin',
    email: 'jane.admin@example.com',
    avatar: '/ckyc/CKYCRR.png',
  };

  const isPathActive = useCallback(
    (path: string) => {
      // Special case for CMS template paths
      if (path === '/ckycrr-admin/cms/template') {
        return (
          location.pathname.startsWith(path) ||
          location.pathname.startsWith('/ckycrr-admin/cms/email-template') ||
          location.pathname.startsWith('/ckycrr-admin/cms/invoice-template')
        );
      }

      // Split path into pathname and search params
      const [pathOnly, searchParams] = path.split('?');

      // Check if pathname matches
      const pathnameMatches = location.pathname === pathOnly;

      // Special case: Check if we're on a modify-user detail page
      // e.g., /sub-users/modify-user/:id should match /sub-users/certify-modify with same action
      const isModifyUserDetailPage = location.pathname.startsWith(
        '/ckycrr-admin/sub-users/modify-user/'
      );
      const isCertifyModifyPath =
        pathOnly === '/ckycrr-admin/sub-users/certify-modify';

      // If there are no search params in the menu item, just check pathname
      if (!searchParams) {
        return pathnameMatches;
      }

      // If there are search params, check both pathname and search params
      if (pathnameMatches || (isModifyUserDetailPage && isCertifyModifyPath)) {
        const currentSearch = location.search.substring(1); // Remove leading '?'

        // Decode both URLs for comparison (handles spaces and special characters)
        const decodedCurrentSearch = decodeURIComponent(currentSearch);
        const decodedMenuSearch = decodeURIComponent(searchParams);

        return decodedCurrentSearch === decodedMenuSearch;
      }

      return false;
    },
    [location.pathname, location.search]
  );
  useEffect(() => {
    const newOpenMenus: { [label: string]: boolean } = {};
    menuItems.forEach((item) => {
      if (item.children && item.label) {
        // Check if any child's route is active or any grandchild's route is active
        const isActiveChild = item.children.some((child) => {
          if (child.to) {
            return isPathActive(child.to);
          }
          if (child.children) {
            const isActiveGrandChild = child.children.some(
              (grandChild) => grandChild.to && isPathActive(grandChild.to)
            );
            // If any grandchild is active, open both parent and child menus
            if (isActiveGrandChild && child.label && item.label) {
              newOpenMenus[child.label] = true;
              // Also ensure parent menu stays open
              newOpenMenus[item.label] = true;
            }
            return isActiveGrandChild;
          }
          return false;
        });
        // Set parent menu open state if any child is active
        if (isActiveChild) {
          newOpenMenus[item.label] = true;
        }
      }
    });
    setOpenMenus(newOpenMenus);
  }, [isPathActive, location.pathname, location.search]);

  const handleMenuClick = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };
  // const checkChildRouteActive = (childTo: string, isActive: boolean) => {
  //   if (childTo === '/ckycrr-admin/cms/template') {
  //     return (
  //       isActive ||
  //       location.pathname.startsWith('/ckycrr-admin/cms/email-template') ||
  //       location.pathname.startsWith('/ckycrr-admin/cms/invoice-template')
  //     );
  //   }
  //   return isActive;
  // };
  const renderIcon = (
    icon: MenuItemType['icon'],
    isActive: boolean | undefined
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
              ? 'invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(110%) contrast(100%)'
              : 'none',
            backgroundColor: 'transparent',
            borderRadius: '0px',
            transition: 'filter 150ms ease',
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
          alignItems: 'center',
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
            maxWidth: isMobile ? '100px' : '120px',
            maxHeight: isMobile ? '32px' : '40px',
            objectFit: 'contain',
            display: 'block',
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
            backgroundColor: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a1a1a1',
            borderRadius: '4px',
          },
        }}
      >
        <List sx={{ pt: 1, px: { xs: 0.5, sm: 0 }, pr: { xs: 1.5, sm: 2 } }}>
          {menuItems.map((item, idx) => {
            if (item.section !== undefined) {
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

            // Check if item has children
            if (item.children) {
              const isAnyChildActive = item.children.some((child) => {
                if (child.to) {
                  return isPathActive(child.to);
                }
                if (child.children) {
                  return child.children.some(
                    (grandChild) => grandChild.to && isPathActive(grandChild.to)
                  );
                }
                return false;
              });

              return (
                <React.Fragment key={item.label}>
                  <ListItem
                    onClick={() => handleMenuClick(item.label ?? '')}
                    sx={{
                      cursor: 'pointer',
                      minHeight: { xs: 40, sm: 48 },
                      px: { xs: 1, sm: 2 },
                      pr: { xs: 1.5, sm: 2 },
                      backgroundColor: isAnyChildActive ? '#002CBA' : 'inherit',
                      color: isAnyChildActive ? '#ffffff' : 'inherit',
                      borderRadius: isAnyChildActive ? '12px' : 0,
                      mx: 1, // Use consistent margin regardless of active state
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 36, sm: 40 },
                        color: isAnyChildActive ? '#ffffff' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                      }}
                    >
                      {renderIcon(item.icon, isAnyChildActive)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label ?? ''}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      slotProps={{
                        primary: {
                          fontSize: 16,
                          fontFamily: 'Gilroy, sans-serif',
                          fontWeight: 500,
                        },
                      }}
                    />
                    {item.label &&
                      (openMenus[item.label] ? (
                        <ExpandLess
                          sx={{
                            color: isAnyChildActive ? '#ffffff' : 'inherit',
                            ml: 1,
                          }}
                        />
                      ) : (
                        <ExpandMore
                          sx={{
                            color: isAnyChildActive ? '#ffffff' : 'inherit',
                            ml: 1,
                          }}
                        />
                      ))}
                  </ListItem>
                  <Collapse
                    in={item.label ? openMenus[item.label] : false}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        // If child has its own children (third level), render as expandable
                        if (child.children) {
                          const isAnyGrandChildActive = child.children.some(
                            (grandChild) =>
                              grandChild.to && isPathActive(grandChild.to)
                          );

                          return (
                            <React.Fragment key={child.label}>
                              <ListItem
                                onClick={() =>
                                  handleMenuClick(child.label ?? '')
                                }
                                sx={{
                                  cursor: 'pointer',
                                  pl: { xs: 8, sm: 10 },
                                  minHeight: { xs: 36, sm: 40 },
                                  backgroundColor: isAnyGrandChildActive
                                    ? '#e3f2fd'
                                    : 'inherit',
                                  color: isAnyGrandChildActive
                                    ? '#002CBA'
                                    : 'inherit',
                                  marginLeft: 0,
                                  mx: 1, // Use consistent margin regardless of active state
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  pr: { xs: 1.5, sm: 2 },
                                }}
                              >
                                <ListItemText
                                  primary={child.label ?? ''}
                                  slotProps={{
                                    primary: {
                                      fontSize: 15,
                                      fontFamily: 'Gilroy, sans-serif',
                                      fontWeight: 600,
                                    },
                                  }}
                                />
                                {child.label &&
                                  (openMenus[child.label] ? (
                                    <ExpandLess sx={{ ml: 1 }} />
                                  ) : (
                                    <ExpandMore sx={{ ml: 1 }} />
                                  ))}
                              </ListItem>
                              <Collapse
                                in={
                                  child.label ? openMenus[child.label] : false
                                }
                                timeout="auto"
                                unmountOnExit
                              >
                                <List component="div" disablePadding>
                                  {child.children.map((grandChild) => {
                                    // Use isPathActive to check if this grandchild is active
                                    const isActive = grandChild.to
                                      ? isPathActive(grandChild.to)
                                      : false;

                                    return (
                                      <NavLink
                                        key={
                                          grandChild.label ??
                                          `grandchild-${grandChild.to}`
                                        }
                                        to={grandChild.to!}
                                        style={{ textDecoration: 'none' }}
                                      >
                                        <ListItem
                                          sx={{
                                            pl: { xs: 12, sm: 14 },
                                            minHeight: { xs: 32, sm: 36 },
                                            backgroundColor: isActive
                                              ? '#f0f4ff'
                                              : 'transparent',
                                            color: isActive
                                              ? '#002CBA'
                                              : '#000000',
                                            marginLeft: 0,
                                            borderRadius: 0,
                                            mx: 1, // Always apply horizontal margin for alignment
                                            display: 'flex',
                                            alignItems: 'center',
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: '4px',
                                              height: '4px',
                                              borderRadius: '50%',
                                              backgroundColor: isActive
                                                ? '#002CBA'
                                                : '#000000',
                                              mr: 1,
                                              flexShrink: 0,
                                            }}
                                          />
                                          <ListItemText
                                            primary={grandChild.label ?? ''}
                                            slotProps={{
                                              primary: {
                                                fontSize: 14,
                                                fontFamily:
                                                  'Gilroy, sans-serif',
                                                fontWeight: 500,
                                              },
                                            }}
                                          />
                                        </ListItem>
                                      </NavLink>
                                    );
                                  })}
                                </List>
                              </Collapse>
                            </React.Fragment>
                          );
                        }

                        // If child has direct route (second level)
                        return (
                          <NavLink
                            key={child.label ?? `child-${child.to}`}
                            to={child.to!}
                            style={{ textDecoration: 'none' }}
                          >
                            {({ isActive }) => (
                              <ListItem
                                sx={{
                                  pl: { xs: 8, sm: 10 },
                                  minHeight: { xs: 36, sm: 40 },
                                  backgroundColor: isActive
                                    ? '#f0f4ff'
                                    : 'inherit',
                                  color: isActive ? '#002CBA' : 'inherit',
                                  marginLeft: 0,
                                  // borderRadius: 0,
                                  mx: 1, // Always apply horizontal margin for alignment
                                }}
                              >
                                <ListItemText
                                  primary={child.label ?? ''}
                                  slotProps={{
                                    primary: {
                                      fontSize: 15,
                                      fontFamily: 'Gilroy, sans-serif',
                                      fontWeight: 600,
                                    },
                                  }}
                                />
                              </ListItem>
                            )}
                          </NavLink>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }
            return item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                style={{ textDecoration: 'none' }}
                // We use a render prop here to get the isActive state from NavLink
              >
                {({ isActive: navLinkIsActive }) => (
                  <ListItem
                    sx={{
                      minHeight: { xs: 40, sm: 48 },
                      px: { xs: 1, sm: 2 },
                      backgroundColor: navLinkIsActive ? '#002CBA' : 'inherit',
                      color: navLinkIsActive ? '#ffffff' : 'inherit',
                      borderRadius: navLinkIsActive ? '8px' : 0,
                      mx: 1, // Use consistent margin regardless of active state
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 36, sm: 40 },
                        color: navLinkIsActive ? '#ffffff' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                      }}
                    >
                      {renderIcon(item.icon, navLinkIsActive)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label ?? ''}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      slotProps={{
                        primary: {
                          fontSize: 16,
                          fontFamily: 'Gilroy, sans-serif',
                          fontWeight: 500,
                        },
                      }}
                    />
                  </ListItem>
                )}
              </NavLink>
            ) : (
              <ListItem
                key={item.label ?? `item-${idx}`}
                sx={{
                  minHeight: { xs: 40, sm: 48 },
                  px: { xs: 1, sm: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { xs: 36, sm: 40 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  {renderIcon(item.icon, false)}
                </ListItemIcon>
                <ListItemText
                  primary={item.label ?? ''}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  slotProps={{
                    primary: {
                      fontSize: 16,
                      fontFamily: 'Gilroy, sans-serif',
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItem>
            );
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

export default AdminSidebar;
