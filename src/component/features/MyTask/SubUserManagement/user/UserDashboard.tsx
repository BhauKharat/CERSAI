import {
  AccordionDetails,
  CircularProgress,
  Box,
  Typography,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useEffect } from 'react';
import {
  DashboardContainer,
  StyledTabs,
  StyledTab,
  GridContainer,
  TaskCard,
  CountBadge,
  IconContainer,
  IconImage,
  TaskLabel,
} from '../../../Dashboard/Dashboard.styles';

// Import icons
import userCreateIcon from '../../../../../assets/icons/user-creation.png';
import userModifyIcon from '../../../../../assets/icons/user-modify.png';
import userSuspendIcon from '../../../../../assets/icons/user-suspended.png';
import userRevokeSuspensionIcon from '../../../../../assets/icons/user-revoke-suspended.png';
import userDeactivateIcon from '../../../../../assets/icons/user-deactiate.png';
import { useNavigate } from 'react-router-dom';
import NavigationBreadCrumb from '../../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { Secured } from '../../../../../utils/HelperFunctions/api';

// Types for API response
interface DashboardOperation {
  name: string;
  type: string;
  total: number;
}

interface DashboardSubModule {
  name: string;
  type: string;
  total: number;
  operations?: DashboardOperation[];
}

interface DashboardModule {
  name: string;
  type: string;
  total: number;
  subModules?: DashboardSubModule[];
}

interface DashboardResponse {
  data: DashboardModule[];
}

interface TaskItem {
  label: string;
  icon: string;
  alt: string;
  route: string;
  type: string;
  cnt: number;
}

// Icon mapping based on operation type
const getIconByType = (type: string): string => {
  const iconMap: Record<string, string> = {
    USER_CREATION: userCreateIcon,
    USER_MODIFICATION: userModifyIcon,
    USER_SUSPENSION: userSuspendIcon,
    USER_SUSPENSION_REVOKE: userRevokeSuspensionIcon,
    USER_DEACTIVATION: userDeactivateIcon,
  };
  return iconMap[type] || userCreateIcon;
};

// Route mapping based on operation type
const getRouteByType = (type: string): string => {
  const routeMap: Record<string, string> = {
    USER_CREATION: '/re/sub-user-management/user/list/create',
    USER_MODIFICATION: '/re/sub-user-management/user/list/modify',
    USER_SUSPENSION: '/re/sub-user-management/user/list/suspend',
    USER_SUSPENSION_REVOKE:
      '/re/sub-user-management/user/list/revoke-suspension',
    USER_DEACTIVATION: '/re/sub-user-management/user/list/de-activate',
  };
  return routeMap[type] || '/re/sub-user-management/user';
};

// Helper to format operation names into Figma-style labels for cards
const formatOperationLabel = (name: string): string => {
  if (!name) return '';

  const lower = name.toLowerCase();

  // Match by keywords so we don't depend on exact backend text
  if (lower.includes('creation')) return 'Create';
  if (lower.includes('modification') || lower.includes('modify'))
    return 'Modify';
  // Important: check for Revoke Suspension BEFORE generic Suspend/Suspension
  if (lower.includes('revoke') && lower.includes('suspension'))
    return 'Revoke Suspension';
  if (lower.includes('suspend') || lower.includes('suspension'))
    return 'Suspend';
  if (lower.includes('de-activat') || lower.includes('deactivat'))
    return 'De-activate';

  // Fallback: strip "User" word and use remaining text
  return name.replace(/User/gi, '').replace(/\s+/g, ' ').trim();
};

const UserDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'User Management', path: '/re/sub-user-management' },
    { label: 'User' },
  ];

  // Fetch dashboard data from API and extract USER operations
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          await Secured.get<DashboardResponse>('/api/v1/dashboard');

        if (response.data && response.data.data) {
          const modules = response.data.data;

          // Find USER_MANAGEMENT module
          const userManagementModule = modules.find(
            (module) => module.type === 'USER_MANAGEMENT'
          );

          if (userManagementModule && userManagementModule.subModules) {
            // Find USER subModule
            const userSubModule = userManagementModule.subModules.find(
              (subModule) => subModule.type === 'USER'
            );

            if (userSubModule && userSubModule.operations) {
              // Map operations to tasks
              const mappedTasks: TaskItem[] = userSubModule.operations.map(
                (operation) => {
                  const label = formatOperationLabel(operation.name);
                  return {
                    label,
                    icon: getIconByType(operation.type),
                    alt: `${label} Icon`,
                    route: getRouteByType(operation.type),
                    type: operation.type,
                    cnt: operation.total || 0,
                  };
                }
              );

              setTasks(mappedTasks);
            } else {
              // Fallback: if no operations found, set empty array
              setTasks([]);
            }
          } else {
            setError('User data not found in API response');
            setTasks([]);
          }
        } else {
          setError('No data received from API');
        }
      } catch (err: unknown) {
        console.error('Failed to fetch dashboard data:', err);
        let errorMessage = 'Failed to load dashboard data';

        if (err && typeof err === 'object') {
          if (
            'response' in err &&
            err.response &&
            typeof err.response === 'object' &&
            'data' in err.response &&
            err.response.data &&
            typeof err.response.data === 'object' &&
            'message' in err.response.data &&
            typeof err.response.data.message === 'string'
          ) {
            errorMessage = err.response.data.message;
          } else if ('message' in err && typeof err.message === 'string') {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        // Set empty tasks on error to prevent UI breakage
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <DashboardContainer>
        {/* Back Button - Top Right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
            onClick={() => navigate(-1)}
            sx={{
              color: '#1A1A1A',
              fontFamily: 'Gilroy, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Back
          </Button>
        </Box>
        {/* Breadcrumb */}
        <NavigationBreadCrumb crumbsData={crumbsData} />

        {/* Tabs */}
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <StyledTab label="My Task" />
          <StyledTab label="Analytics" />
        </StyledTabs>

        {/* Grid Section */}
        <AccordionDetails sx={{ mt: { xs: 2, sm: 3, md: 5 } }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
              }}
            >
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <GridContainer>
              {tasks.map((task, index) => {
                const isActive = activeTask === index;

                return (
                  <TaskCard
                    key={`${task.type}-${index}`}
                    onClick={() => {
                      setActiveTask(index);
                      navigate(task.route);
                    }}
                    sx={{
                      backgroundColor: isActive ? '#F8F9FD' : 'inherit',
                    }}
                  >
                    <IconContainer>
                      <IconImage
                        src={task.icon}
                        alt={task.alt}
                        sx={{
                          width: { xs: '32px', sm: '36px', md: '40px' },
                          height: { xs: '32px', sm: '36px', md: '40px' },
                          objectFit: 'contain',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </IconContainer>

                    <TaskLabel
                      sx={{
                        color: isActive ? '#002CBA' : 'inherit',
                        fontSize: { xs: '14px', sm: '15px', md: '16px' },
                      }}
                    >
                      {task.label}
                    </TaskLabel>

                    <CountBadge
                      sx={{
                        backgroundColor: isActive ? '#002CBA' : '#000',
                        color: '#fff',
                        fontSize: {
                          xs: '0.70rem',
                          sm: '0.8rem',
                          md: '0.85rem',
                        },
                        width: { xs: '45px', sm: '48px', md: '50px' },
                        height: { xs: '20px', sm: '22px', md: '23px' },
                      }}
                    >
                      {task.cnt}
                    </CountBadge>
                  </TaskCard>
                );
              })}
            </GridContainer>
          )}
        </AccordionDetails>
      </DashboardContainer>
    </Box>
  );
};

export default UserDashboard;
