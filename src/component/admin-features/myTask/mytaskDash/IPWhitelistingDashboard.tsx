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
import blockIpIcon from './assets/icons/blockIP.png';
import unblockIpIcon from './assets/icons/unblockIp.png';
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

const IPWhitelistingDashboard: React.FC = () => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<IPendingCount[]>([]);
  const navigate = useNavigate();

  const tasks = [
    {
      name: 'Block',
      label: 'Block',
      icon: blockIpIcon,
      alt: 'Block IP ',
      route: '/ckycrr-admin/my-task/ip-whitelisting/block-ip-approver',
    },
    {
      name: 'Unblock',
      label: 'Unblock',
      icon: unblockIpIcon,
      alt: 'Unblock IP ',
      route: '/ckycrr-admin/my-task/ip-whitelisting/unblock-ip-approver',
    },
  ];

  const getdashboardSubModuleCount = async () => {
    const response = await Secured.get(
      API_ENDPOINTS.dashboardSubModuleCount('IP_WHITELISTING')
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
      {/* Breadcrumb */}
      <AdminBreadcrumbUpdateProfile
        breadcrumbItems={[
          { label: 'My Task', href: '/ckycrr-admin/my-task/dashboard' },
          { label: 'IP Whitelisting' },
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

export default IPWhitelistingDashboard;
