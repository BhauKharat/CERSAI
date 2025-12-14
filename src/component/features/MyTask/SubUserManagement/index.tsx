import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SubUserDashboard from './SubUserDashboard';
import Tabs from './Tabs';
import RegionTab from './region/RegionTab';
import RegionDashboard from './region/RegionDashboard';
import BranchTab from './branch/BranchTab';
import BranchDashboard from './branch/BranchDashboard';
import UserTab from './user/UserTab';
import UserDashboard from './user/UserDashboard';
import RegionCreationRequest from './region/RegionCreationRequest';
import RegionMergerRequest from './region/RegionMergerRequest';
import RegionDeactivationRequest from './region/RegionDeactivationRequest';
import BranchCreationRequest from './branch/BranchCreationRequest';
import BranchDeactivationRequest from './branch/BranchDeActivationRequest';
import BranchMergerRequest from './branch/BranchMergerRequest';
import BranchTransferRequest from './branch/BranchTransferRequest';
import NewUserCreationRequest from './user/NewUserCreationRequest';
import UserDeactivationRequest from './user/UserDeactivationRequest';
import UserSuspensionRequest from './user/UserSuspensionRequest';
import RevokeUserSuspensionRequest from './user/RevokeUserSuspensionRequest';

const SubUserManagementWrapper: React.FC = () => {
  const location = useLocation();

  // Hide tabs on dashboard pages (region, branch, user), list pages, and request pages
  const hideTabs =
    location.pathname.endsWith('/region') ||
    location.pathname.endsWith('/branch') ||
    location.pathname.endsWith('/user') ||
    location.pathname.includes('/region/list') ||
    location.pathname.includes('/branch/list') ||
    location.pathname.includes('/user/list') ||
    location.pathname.includes('-request/');

  return (
    <div
      className="sub-user-management"
      style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
    >
      {!hideTabs && <Tabs useRouting={true} />}
      <div
        className="tab-content"
        style={{ padding: '20px', backgroundColor: '#FFFFFF' }}
      >
        <Routes>
          <Route path="region" element={<RegionDashboard />} />
          <Route path="region/list" element={<RegionTab />} />
          <Route path="region/list/:action" element={<RegionTab />} />
          <Route path="branch" element={<BranchDashboard />} />
          <Route path="branch/list" element={<BranchTab />} />
          <Route path="branch/list/:action" element={<BranchTab />} />
          <Route path="user">
            <Route index element={<UserDashboard />} />
            <Route path="list" element={<UserTab />} />
            <Route path="list/:action" element={<UserTab />} />
            <Route
              path="new-user-creation-request/:id"
              element={<NewUserCreationRequest />}
            />
            <Route
              path="user-modification-request/:id"
              element={<NewUserCreationRequest />}
            />
            <Route
              path="user-deactivation-request/:id"
              element={<UserDeactivationRequest />}
            />
            <Route
              path="user-suspension-request/:id"
              element={<UserSuspensionRequest />}
            />
            <Route
              path="revoke-user-suspension-request/:id"
              element={<RevokeUserSuspensionRequest />}
            />
          </Route>
          <Route
            path="region-creation-request/:id"
            element={<RegionCreationRequest />}
          />
          <Route
            path="region-modification-request/:id"
            element={<RegionCreationRequest />}
          />
          <Route
            path="region-merger-request/:id"
            element={<RegionMergerRequest />}
          />
          <Route
            path="region-deactivation-request/:id"
            element={<RegionDeactivationRequest />}
          />
          <Route
            path="branch-creation-request/:id"
            element={<BranchCreationRequest />}
          />
          <Route
            path="branch-modification-request/:id"
            element={<BranchCreationRequest />}
          />
          <Route
            path="branch-deactivation-request/:id"
            element={<BranchDeactivationRequest />}
          />
          <Route
            path="branch-merge-request/:id"
            element={<BranchMergerRequest />}
          />
          <Route
            path="branch-transfer-request/:id"
            element={<BranchTransferRequest />}
          />
        </Routes>
      </div>
    </div>
  );
};

const SubUserManagement: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SubUserDashboard />} />
      <Route path="/*" element={<SubUserManagementWrapper />} />
    </Routes>
  );
};

export default SubUserManagement;
