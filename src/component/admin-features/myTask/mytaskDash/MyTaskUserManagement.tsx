import { useNavigate } from 'react-router-dom';
import { AccordionDetails, Box, Button as StandardButton } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  DashboardContainer,
  GridContainer,
  TaskCard,
  CountBadge,
  IconContainer,
  IconImage,
  TaskLabel,
} from './css/MyTaskDashboard.style';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AdminBreadcrumbUpdateProfile from './AdminBreadcrumbUpdateProfile';

import userCreateIcon from '../../../../assets/icons/user-creation.png';
import userModifyIcon from '../../../../assets/icons/user-modify.png';
import userDeactivateIcon from '../../../../assets/icons/user-deactiate.png';
import userSuspendIcon from '../../../../assets/icons/user-suspended.png';
import userRevokeIcon from '../../../../assets/icons/user-revoke-suspended.png';
import { API_ENDPOINTS } from 'Constant';
import { Secured } from '../../../../utils/HelperFunctions/api';

interface SubModule {
  name: string;
  type: string;
  status: string;
  cnt: number;
}

interface IDashbardCount {
  name: string;
  type: string;
  total: number;
  subModules: SubModule[];
}

const MyTaskUserManagement: React.FC = () => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<IDashbardCount[]>([]); // State to hold API response
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const getDashboardPendingCount = async () => {
    try {
      const response = await Secured.get(API_ENDPOINTS.dashboardTaskCount);
      if (response.status === 200) {
        setPendingCount(response.data.data.modules);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard counts:', error);
    }
  };

  useEffect(() => {
    getDashboardPendingCount();
  }, []);

  const tasks = [
    {
      name: 'Create',
      label: 'Create User',
      type: 'CERSAI_USER_CREATION',
      icon: userCreateIcon,
      alt: 'Create User Icon',
      route: '/ckycrr-admin/my-task/sub-user/approval',
    },
    {
      name: 'Modify',
      label: 'Modify User',
      type: 'CERSAI_USER_MODIFICATION',
      icon: userModifyIcon,
      alt: 'Modify User Icon',
      route: '/ckycrr-admin/my-task/sub-user/approval',
    },
    {
      name: 'De-activate',
      label: 'De-activate User',
      type: 'CERSAI_USER_DEACTIVATION',
      icon: userDeactivateIcon,
      alt: 'De-activate User Icon',
      route: '/ckycrr-admin/my-task/sub-user/approval',
    },
    {
      name: 'Suspend',
      label: 'Suspend User',
      type: 'CERSAI_USER_SUSPENSION',
      icon: userSuspendIcon,
      alt: 'Suspend User Icon',
      route: '/ckycrr-admin/my-task/sub-user/approval',
    },
    {
      name: 'Revoke Suspension',
      label: 'Revoke User Suspension',
      type: 'CERSAI_USER_SUSPENSION_REVOKE',
      icon: userRevokeIcon,
      alt: 'Revoke Suspension Icon',
      route: '/ckycrr-admin/my-task/sub-user/approval',
    },
  ];

  const userManagementModule = pendingCount.find(
    (module) => module.type === 'USER_MANAGEMENT'
  );

  const subModules = userManagementModule
    ? userManagementModule.subModules
    : [];

  return (
    <DashboardContainer>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <StandardButton
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            textTransform: 'none',
            color: '#000',
            fontWeight: 500,
            px: 2.5,
            py: 0.8,
            fontSize: '16px',
            boxShadow: 'none',
            // '&:hover': {
            //   backgroundColor: '#EEEEEE',
            //   boxShadow: 'none',
            // },
          }}
        >
          Back
        </StandardButton>
      </Box>
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          { label: 'User Management' },
        ]}
      />

      <AccordionDetails sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
        <GridContainer>
          {tasks.map((task, index) => {
            const isActive = activeTask === index;

            const subModuleData = subModules.find(
              (subModule) => subModule.type === task.type
            );
            const count = subModuleData ? subModuleData.cnt : 0;

            return (
              <TaskCard
                key={index}
                onClick={() => {
                  setActiveTask(index);

                  navigate(
                    `${task.route}?action=${encodeURIComponent(task.label)}`
                  );
                }}
                sx={{
                  backgroundColor: isActive ? '#F8F9FD' : 'inherit',
                }}
              >
                <IconContainer>
                  <IconImage src={task.icon} alt={task.alt} />
                </IconContainer>

                <TaskLabel
                  sx={{
                    color: isActive ? '#002CBA' : 'inherit',
                    textAlign: 'center',
                  }}
                >
                  {task.label.replace('User', '').trim()}
                </TaskLabel>

                <CountBadge
                  sx={{
                    backgroundColor: isActive ? '#002CBA' : '#000',
                    color: '#fff',
                  }}
                >
                  {count}
                </CountBadge>
              </TaskCard>
            );
          })}
        </GridContainer>
      </AccordionDetails>
    </DashboardContainer>
  );
};

export default MyTaskUserManagement;
