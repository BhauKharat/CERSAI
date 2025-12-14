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
  GridContainer,
  TaskCard,
  CountBadge,
  IconContainer,
  IconImage,
  TaskLabel,
} from '../../Dashboard/Dashboard.styles';

// Import icons
import updateProfileIcon from '../../../../assets/icons/updateprof.png';
import { useNavigate } from 'react-router-dom';
import NavigationBreadCrumb from '../../UserManagement/NavigationBreadCrumb/NavigationBreadCrumb';
import { Secured } from '../../../../utils/HelperFunctions/api';

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

// Icon mapping based on subModule type - using same icon for both
const getIconByType = (): string => {
  return updateProfileIcon;
};

// Route mapping based on subModule type
const getRouteByType = (type: string): string => {
  const routeMap: Record<string, string> = {
    ENTITY_PROFILE_UPDATE: '/re/entity-profile-sub-user-list',
    USER_PROFILE_UPDATE: '/re/user-profile-sub-user-list',
  };
  return routeMap[type] || '/re/update-profile';
};

const UpdateProfileDashboard: React.FC = () => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Breadcrumb data
  const crumbsData = [
    { label: 'My Task', path: '/re/dashboard' },
    { label: 'Update Profile' },
  ];

  // Fetch dashboard data from API and extract UPDATE_PROFILE subModules
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          await Secured.get<DashboardResponse>('/api/v1/dashboard');

        if (response.data && response.data.data) {
          const modules = response.data.data;

          // Find UPDATE_PROFILE module
          const updateProfileModule = modules.find(
            (module) => module.type === 'UPDATE_PROFILE'
          );

          if (updateProfileModule && updateProfileModule.subModules) {
            // Map subModules to tasks
            const mappedTasks: TaskItem[] = updateProfileModule.subModules.map(
              (subModule) => ({
                label: subModule.name.replace(/update/gi, '').trim(),
                icon: getIconByType(),
                alt: `${subModule.name} Icon`,
                route: getRouteByType(subModule.type),
                type: subModule.type,
                cnt: subModule.total || 0,
              })
            );

            setTasks(mappedTasks);
          } else {
            // Fallback: if no subModules found, set empty array
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

export default UpdateProfileDashboard;
