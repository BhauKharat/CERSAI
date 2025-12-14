import { AccordionDetails } from '@mui/material';
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

// Import PNG icons
import entityProfileIcon from './assets/icons/new-registration.png';
import userProfileIcon from './assets/icons/modified_reg.png';
import AdminBreadcrumbUpdateProfile from './AdminBreadcrumbUpdateProfile';
import { useNavigate } from 'react-router-dom';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';

interface IPendingCount {
  name: string;
  label: string;
  type: string;
  status: string;
  cnt: number;
}

const UpdateProfileDashboard: React.FC = () => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<IPendingCount[]>([]);
  const navigate = useNavigate();

  // Task data with icons - Entity Profile and User Profile
  const tasks = [
    {
      name: 'Entity Profile',
      type: 'RE_ENTITY_PROFILE_UPDATE',
      icon: entityProfileIcon,
      alt: 'Entity Profile',
      route: '/ckycrr-admin/my-task/update-profile/entity-profile',
    },
    {
      name: 'User Profile',
      type: 'RE_USER_PROFILE_UPDATE',
      icon: userProfileIcon,
      alt: 'User Profile',
      route: '/ckycrr-admin/my-task/update-profile/user-profile',
    },
  ];

  const getdashboardSubModuleCount = async () => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.dashboardSubModuleCount('UPDATE_PROFILE')
      );
      if (response.status === 200) {
        setPendingCount(response.data.data.subModules || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard count:', error);
    }
  };

  useEffect(() => {
    getdashboardSubModuleCount();
  }, []);

  return (
    <DashboardContainer>
      {/* Breadcrumb */}
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          { label: 'Update Profile' },
        ]}
      />

      <AccordionDetails>
        <GridContainer>
          {tasks.map((task, index) => {
            const isActive = activeTask === index;
            let count: string | number = '-';
            const section = pendingCount.find((x) => {
              return x.type === task.type;
            });
            if (section) {
              count = section.cnt;
            }

            return (
              <TaskCard
                key={index}
                onClick={() => {
                  setActiveTask(index);
                  navigate(task.route);
                }}
                sx={{
                  backgroundColor: isActive ? '#F8F9FD' : 'inherit',
                }}
              >
                <IconContainer>
                  <IconImage src={task.icon} alt={task.alt} />
                </IconContainer>

                <TaskLabel sx={{ color: isActive ? '#002CBA' : 'inherit' }}>
                  {task.name}
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

export default UpdateProfileDashboard;
