import {
  AccordionDetails,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
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
} from './Dashboard.styles';

// Import SVG icons
import reRegistrationIcon from '../../../assets/icons/re-registration.png';
import kycManagementIcon from '../../../assets/icons/KYC management.png';
import billingManagementIcon from '../../../assets/icons/billing.png';
import userManagementIcon from '../../../assets/icons/user.png';
import reManagementIcon from '../../../assets/icons/vector.png';
import reConsolidationIcon from '../../../assets/icons/consolidation.png';
import reDeactivationIcon from '../../../assets/icons/deactivation.png';
import ipWhitelistingIcon from '../../../assets/icons/ip.png';
import updateProfileIcon from '../../../assets/icons/updateprof.png';
import { useNavigate } from 'react-router-dom';
import { Secured } from '../../../utils/HelperFunctions/api';

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

// Icon mapping based on module type
const getIconByType = (type: string): string => {
  const iconMap: Record<string, string> = {
    RE_REGISTRATION: reRegistrationIcon,
    KYC_MANAGEMENT: kycManagementIcon,
    BILL_MANAGEMENT: billingManagementIcon,
    USER_MANAGEMENT: userManagementIcon,
    RE_MANAGEMENT: reManagementIcon,
    RE_CONSOLIDATION: reConsolidationIcon,
    RE_DEACTIVATION: reDeactivationIcon,
    IP_WHITELISTING: ipWhitelistingIcon,
    UPDATE_PROFILE: updateProfileIcon,
  };
  return iconMap[type] || userManagementIcon;
};

// Route mapping based on module type
const getRouteByType = (type: string): string => {
  const routeMap: Record<string, string> = {
    RE_REGISTRATION: '/re/re-registration',
    KYC_MANAGEMENT: '/re/kyc-management',
    BILL_MANAGEMENT: '/re/billing-management',
    USER_MANAGEMENT: '/re/sub-user-management',
    RE_MANAGEMENT: '/re/update-entity-details',
    RE_CONSOLIDATION: '/re/re-consolidation',
    RE_DEACTIVATION: '/re/re-deactivation',
    IP_WHITELISTING: '/re/ip-whitelisting/dashboard',
    UPDATE_PROFILE: '/re/update-profile',
  };
  return routeMap[type] || '/re/dashboard';
};

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          await Secured.get<DashboardResponse>('/api/v1/dashboard');

        if (response.data && response.data.data) {
          const modules = response.data.data;
          const mappedTasks: TaskItem[] = modules.map((module) => ({
            label: module.name,
            icon: getIconByType(module.type),
            alt: `${module.name} Icon`,
            route: getRouteByType(module.type),
            type: module.type,
            cnt: module.total || 0,
          }));

          setTasks(mappedTasks);
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
    <DashboardContainer>
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
                      fontSize: { xs: '0.70rem', sm: '0.8rem', md: '0.85rem' },
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
  );
};

export default Dashboard;
