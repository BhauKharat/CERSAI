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
import newRegistrationIcon from './assets/icons/new-registration.png';
import modified_reg from './assets/icons/modified_reg.png';
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

const Re_Registration: React.FC = () => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<IPendingCount[]>([]);
  const navigate = useNavigate();
  // Task data with icons
  const tasks = [
    {
      name: 'New Registration',
      label: 'NEW_REGISTRATION',
      icon: newRegistrationIcon,
      alt: 'New Registration',
      route: '/ckycrr-admin/my-task/new-request',
    },
    {
      name: 'Modified Registration',
      label: 'MODIFY_REGISTRATION',
      icon: modified_reg,
      alt: 'Modified Registration',
      route: '/ckycrr-admin/my-task/modified-registration',
    },
  ];

  const getdashboardSubModuleCount = async () => {
    const response = await Secured.get(
      API_ENDPOINTS.dashboardSubModuleCount('RE_REGISTRATION')
    );
    if (response.status === 200) {
      setPendingCount(response.data.data.subModules);
    }
  };

  useEffect(() => {
    getdashboardSubModuleCount();
  }, []);

  return (
    <DashboardContainer>
      {/* Tabs */}
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          { label: 'RE Registration' },
        ]}
      />

      <AccordionDetails>
        <GridContainer>
          {tasks.map((task, index) => {
            const isActive = activeTask === index;
            let count: string | number = '-';
            const section = pendingCount.find((x) => {
              return x.label === task.label;
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
                  backgroundColor: isActive ? '#F8F9FD' : 'inherit', // optional active bg
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

export default Re_Registration;
