import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
import { TabButton, ActiveTabIndicator, TabListContainer } from './Tabs.styles';

type TabType = 'Region' | 'Branch' | 'User';

interface TabsProps {
  onTabChange?: (tab: TabType) => void;
  activeTab?: TabType;
  useRouting?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  onTabChange,
  activeTab: externalActiveTab,
  useRouting = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on route or prop
  const getActiveTabFromRoute = (): TabType => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/region')) return 'Region';
    if (path.includes('/branch')) return 'Branch';
    if (path.includes('/user')) return 'User';
    return 'Region'; // Default to first tab
  };

  const activeTab = externalActiveTab || getActiveTabFromRoute();

  const handleTabClick = (tab: TabType) => {
    console.log('useRouting==', useRouting);
    if (useRouting) {
      navigate(`/re/sub-user-management/${tab.toLowerCase()}`);
    }
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'Region', label: 'Region' },
    { id: 'Branch', label: 'Branch' },
    { id: 'User', label: 'User' },
  ];

  return (
    <TabListContainer role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TabButton
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            isActive={isActive}
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
            tabIndex={0}
          >
            <Typography variant="subtitle2" fontWeight={isActive ? 600 : 500}>
              {tab.label}
            </Typography>
            {isActive && <ActiveTabIndicator />}
          </TabButton>
        );
      })}
    </TabListContainer>
  );
};

export default Tabs;
