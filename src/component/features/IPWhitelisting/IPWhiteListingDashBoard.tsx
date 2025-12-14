/* eslint-disable prettier/prettier */

import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button as StandardButton,
  CircularProgress,
  Typography,
  AccordionDetails,
} from '@mui/material';

import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// --- IMPORTS FROM YOUR EXISTING STYLE FILE ---

// These are used as-is, without any changes to the file itself.

import {
  DashboardContainer,
  GridContainer,
  TaskCard,
  CountBadge,
  IconContainer,
  TaskLabel,
  IconImage,
} from '../../admin-features/myTask/mytaskDash/css/MyTaskDashboard.style';

import replayIcon from '../../../../src/assets/icons/replaceIP.png';
import addNewICon from '../../../../src/assets/icons/addNewIp.png';
import removeIcon from '../../../../src/assets/icons/removeIPI.png';
import extendIcon from '../../../../src/assets/icons/extandValidityIp.png';

// Assuming you have a reusable Breadcrumb component

import { Secured } from '../../../utils/HelperFunctions/api';
import IPBreadcrumbDashboard from '../IPWhitelisting/IPBreadcrumbDashboard';

// --- TYPE DEFINITIONS ---

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
  count: number;
  route: string;
  type: string;
  icon: string;
  alt: string;
}

// Icon mapping based on operation type
const getIconByType = (type: string): string => {
  // TODO: Update these mappings with the correct icons
  const iconMap: Record<string, string> = {
    IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY: replayIcon,
    IP_WHITELISTING_ADD_NEW_IP_ADDRESS: addNewICon,
    IP_WHITELISTING_REMOVE_IP_ADDRESS: removeIcon,
    IP_WHITELISTING_EXTEND_VALIDATION: extendIcon,
  };
  return iconMap[type] || replayIcon;
};

// Route mapping based on operation type
const getRouteByType = (type: string): string => {
  const routeMap: Record<string, string> = {
    IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY: '/re/ip-whitelisting/publickey/approval',
    IP_WHITELISTING_ADD_NEW_IP_ADDRESS: '/re/ip-whitelisting/add-new-ip-approval',
    IP_WHITELISTING_REMOVE_IP_ADDRESS: '/re/ip-whitelisting/remove-ip-approval',
    IP_WHITELISTING_EXTEND_VALIDATION: '/re/ip-whitelisting/extend-validity-approval',
  };
  return routeMap[type] || '/re/ip-whitelisting';
};

// --- DYNAMIC PLACEHOLDER ICON ---

// This component simulates the icon changing from black to blue based on the active state.



// --- RENAMED AND REFACTORED COMPONENT ---

const IPWhiteListingDashBoard: React.FC = () => {
  // 1. Set the initial active state to 1 to select "Add New IP" by default

  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Simple back navigation
  };

  // 2. Updated breadcrumb data to match the image

  const breadcrumbItems = [
    { label: 'My Task', href: '/re/dashboard' },
    { label: 'IP Whitelisting', href: '/re/ip-whitelisting/dashboard' },
  ];

  const getLabelByType = (type: string): string => {
  const labelMap: Record<string, string> = {
    IP_WHITELISTING_UPLOAD_REPLACE_PUBLIC_KEY: 'Upload/Replace Public Key',
    IP_WHITELISTING_ADD_NEW_IP_ADDRESS: 'Add New IP',
    IP_WHITELISTING_REMOVE_IP_ADDRESS: 'Remove IP',
    IP_WHITELISTING_EXTEND_VALIDATION: 'Extend Validity',
  };

  return labelMap[type] || type;
};

  // Fetch dashboard data from API and extract IP_WHITELISTING operations
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          await Secured.get<DashboardResponse>('/api/v1/dashboard');

        if (response.data && response.data.data) {
          const modules = response.data.data;

          // Find IP_WHITELISTING module
          const ipWhitelistingModule = modules.find(
            (module) => module.type === 'IP_WHITELISTING'
          );

          if (ipWhitelistingModule && ipWhitelistingModule.subModules) {
            // Find IP_WHITELISTING subModule
            const ipWhitelistingSubModule = ipWhitelistingModule.subModules.find(
              (subModule) => subModule.type === 'IP_WHITELISTING'
            );

            if (ipWhitelistingSubModule && ipWhitelistingSubModule.operations) {
              // Map operations to tasks
              const mappedTasks: TaskItem[] = ipWhitelistingSubModule.operations.map(
                (operation) => ({
                  label: getLabelByType(operation.type),
                  count: operation.total || 0,
                  route: getRouteByType(operation.type),
                  type: operation.type,
                  icon: getIconByType(operation.type),
                  alt: `${operation.name} Icon`,
                })
              );

              setTasks(mappedTasks);
            } else {
              // Fallback: if no operations found, set empty array
              setTasks([]);
            }
          } else {
            setError('IP Whitelisting data not found in API response');
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
      {/* 4. A simple "Back" button as shown in the top right of the image */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <StandardButton
          startIcon={<ArrowBackIcon sx={{ color: '#1A1A1A' }} />}
          onClick={handleGoBack}
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
        </StandardButton>
      </Box>

       <IPBreadcrumbDashboard breadcrumbItems={breadcrumbItems} />

      {/* 5. A wrapper to control the grid layout */}
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
                  // 6. DYNAMIC STYLING applied via `sx` prop for a perfect match

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
                    className="task-label"
                    // Correctly sets text color based on active state

                    sx={{
                      color: isActive ? '#002CBA' : 'inherit',
                      fontSize: { xs: '14px', sm: '15px', md: '16px' },
                    }}
                  >
                    {task.label}
                  </TaskLabel>

                  <CountBadge
                    className="count-badge"
                    // Correctly sets badge color based on active state

                    sx={{
                      backgroundColor: isActive ? '#002CBA' : '#000',
                      color: '#fff',
                      fontSize: { xs: '0.70rem', sm: '0.8rem', md: '0.85rem' },
                      width: { xs: '45px', sm: '48px', md: '50px' },
                      height: { xs: '20px', sm: '22px', md: '23px' },
                    }}
                  >
                    {task.count}
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

export default IPWhiteListingDashBoard;
