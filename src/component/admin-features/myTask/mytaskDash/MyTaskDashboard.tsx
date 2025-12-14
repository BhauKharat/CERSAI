import { AccordionDetails } from '@mui/material';
import { useEffect, useState } from 'react';
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
} from './css/MyTaskDashboard.style';

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

// Import PNG icons
import reRegistrationIcon from './assets/icons/re-registration.png';
import kycManagementIcon from './assets/icons/KYC management.png';
import billingManagementIcon from './assets/icons/billing.png';
import userManagementIcon from './assets/icons/user.png';
import reManagementIcon from './assets/icons/Vector.png';
import reConsolidationIcon from './assets/icons/consolidation.png';
import reDeactivationIcon from './assets/icons/deactivation.png';
import ipWhitelistingIcon from './assets/icons/ip.png';
import updateprof from './assets/icons/updateprof.png';
import master_managment from './assets/icons/master_managment.png';
import { useNavigate } from 'react-router-dom';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';

const MyTaskDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<IDashbardCount[]>([]);
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Task data with icons
  const tasks = [
    {
      label: 'RE Registration',
      icon: reRegistrationIcon,
      alt: 'RE Registration Icon',
      route: '/ckycrr-admin/my-task/re-registration',
      type: 'RE_REGISTRATION',
    },
    {
      label: 'KYC Management',
      icon: kycManagementIcon,
      alt: 'KYC Management Icon',
      route: '/my-task/kyc-management',
      type: 'KYC_MANAGEMENT',
    },
    {
      label: 'Billing Management',
      icon: billingManagementIcon,
      alt: 'Billing Management Icon',
      route: '/my-task/billing-management',
      type: 'BILLING_MANAGEMENT',
    },
    {
      label: 'Update Profile',
      icon: updateprof,
      alt: 'update profile icon',
      route: '/ckycrr-admin/my-task/update-profile',
      type: 'UPDATE_PROFILE',
    },
    {
      label: 'User Management',
      icon: userManagementIcon,
      alt: 'User Management Icon',
      route: '/ckycrr-admin/my-task/user-management',
      type: 'USER_MANAGEMENT',
    },
    {
      label: 'RE Management',
      icon: reManagementIcon,
      alt: 'RE Management Icon',
      route: '/re-management',
      type: 'RE_MANAGEMENT',
    },
    {
      label: 'RE Consolidation',
      icon: reConsolidationIcon,
      alt: 'RE Consolidation Icon',
      route: '/re-consolidation',
      type: 'RE_CONSOLIDATION',
    },
    {
      label: 'RE De-activation',
      icon: reDeactivationIcon,
      alt: 'RE De-activation Icon',
      route: '/my-task/re-deactivation',
      type: 'RE_DEACTIVATION',
    },
    {
      label: 'Master Management',
      icon: master_managment,
      alt: 'RE De-activation Icon',
      route: '/my-task/master_managment',
      type: 'MASTER_MANAGEMENT',
    },
    {
      label: 'IP Whitelisting',
      icon: ipWhitelistingIcon,
      alt: 'IP Whitelisting Icon',
      route: '/ckycrr-admin/my-task/ip-whitelisting',
      type: 'IP_WHITELISTING',
    },
  ];

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
        <GridContainer>
          {tasks.map((task, index) => {
            const isActive = activeTask === index;
            const moduleData = pendingCount.find(
              (module) => module.type === task.type
            );
            const count = moduleData ? moduleData.total : 0;

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
                  <IconImage
                    src={task.icon}
                    alt={task.alt}
                    sx={{
                      width:
                        task.label === 'Update Profile'
                          ? { xs: '42px', sm: '48px', md: '54px' }
                          : { xs: '32px', sm: '36px', md: '40px' },
                      height:
                        task.label === 'Update Profile'
                          ? { xs: '42px', sm: '48px', md: '54px' }
                          : { xs: '32px', sm: '36px', md: '40px' },
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

export default MyTaskDashboard;
