import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Enable lazy loading for DashboardPage
const DashboardPage = lazy(
  () => import('../component/admin-features/dashboard/DashboardPage')
);
const Layout = lazy(() => import('../component/common/Layout/Layout'));
const ReDetails = lazy(
  () => import('../component/admin-features/ReManagement/RequestDetails')
);
const RequestDetails = lazy(
  () => import('../component/admin-features/request-details/RequestDetails')
);
const ModifiedRequestDetailsView = lazy(
  () =>
    import(
      '../component/admin-features/request-details/ModifiedRequestDetailsView'
    )
);
const NewRequest = lazy(
  () => import('../component/admin-features/myTask/NewRequest')
);
const ModifiedRegistration = lazy(
  () =>
    import('../component/admin-features/request-details/ModifiedRequestDetails')
);
const MyTaskDashboard = lazy(
  () => import('../component/admin-features/myTask/mytaskDash/MyTaskDashboard')
);
const MyTaskUserManagement = lazy(
  () =>
    import('../component/admin-features/myTask/mytaskDash/MyTaskUserManagement')
);
const Re_Registration = lazy(
  () => import('../component/admin-features/myTask/mytaskDash/Re_Registration')
);
const TrackStatus = lazy(
  () => import('../component/admin-features/myTask/mytaskDash/TrackStatus')
);
const Re_Details = lazy(
  () =>
    import(
      '../component/admin-features/myTask/mytaskDash/re-details/Re_Details'
    )
);
const AdminReManagement = lazy(
  () => import('../component/admin-features/ReManagement/NewRequest')
);
const CertifyModifyUser = lazy(
  () => import('../component/admin-features/subUser/CreateModifyUser')
);
const CreateNewUser = lazy(
  () =>
    import('../component/admin-features/subUser/CreateModifyUser/CreateNewUser')
);
const SubUserApproval = lazy(
  () => import('../component/admin-features/myTask/mytaskDash/SubUserApproval')
);
const Approvals = lazy(
  () => import('../component/admin-features/subUser/approvals/approvals')
);
const CreateNewUserApprovals = lazy(
  () =>
    import(
      '../component/admin-features/subUser/approvalsCreateNew/CreateNewUserApprovals'
    )
);
const ApprovalDetails = lazy(
  () =>
    import(
      '../component/admin-features/subUser/approvalsdetails/approvalDetailsPage'
    )
);
const ApprovalModifyUser = lazy(
  () =>
    import(
      '../component/admin-features/subUser/approvalsModify/approvalModifyUser'
    )
);
const ApprovalRevokeSuspension = lazy(
  () =>
    import(
      '../component/admin-features/subUser/approvalsRevokeSuspension/approvalRevokeSuspension'
    )
);
const UserSuspensionRequest = lazy(
  () =>
    import(
      '../component/admin-features/subUser/approvalsSuspension/approvalUserSuspension'
    )
);
const ModifyUser = lazy(
  () => import('../component/admin-features/subUser/ModifyUser/modifyUser')
);

const UpdateNodalOfficerDetails = lazy(
  () =>
    import(
      '../component/re-management/update-nodal-officer/components/UpdateNodalOfficerDetails'
    )
);

const FeesManagement = lazy(
  () => import('../component/admin-features/contentManagement/FeesManagement')
);
const SmsTemplate = lazy(
  () =>
    import(
      '../component/admin-features/contentManagement/TemplateContent/SmsTemplate'
    )
);
const EmailTemplate = lazy(
  () =>
    import(
      '../component/admin-features/contentManagement/TemplateContent/EmailTemplate'
    )
);
const InvoiceTemplate = lazy(
  () =>
    import(
      '../component/admin-features/contentManagement/TemplateContent/InvoiceTemplate'
    )
);

const ViewWhitelistedIPs = lazy(
  () =>
    import(
      '../component/admin-features/ipWhitelisting/viewWhitelistedIp/ViewWhitelistedIP'
    )
);

const BlockIP = lazy(
  () => import('../component/admin-features/ipWhitelisting/blockIp/BlockIP')
);

const UnBlockIP = lazy(
  () => import('../component/admin-features/ipWhitelisting/unblockIp/UnblockIP')
);
const TrackStatusIps = lazy(
  () =>
    import('../component/admin-features/ipWhitelisting/trackStatus/TrackStatus')
);

const IPWhitelistingDashboard = lazy(
  () =>
    import(
      '../component/admin-features/myTask/mytaskDash/IPWhitelistingDashboard'
    )
);

const BlockIPApprover = lazy(
  () =>
    import(
      '../component/admin-features/ipWhitelisting/approvals/BlockIPApprover'
    )
);

const UnblockIPApprover = lazy(
  () =>
    import(
      '../component/admin-features/ipWhitelisting/approvals/UnblockIPApprover'
    )
);

// Update Profile Components
const UpdateProfileDashboard = lazy(
  () =>
    import(
      '../component/admin-features/myTask/mytaskDash/UpdateProfileDashboard'
    )
);
const UserProfileApprovalList = lazy(
  () =>
    import(
      '../component/admin-features/myTask/mytaskDash/UserProfileApprovalList'
    )
);
const EntityProfileApprovalList = lazy(
  () =>
    import(
      '../component/admin-features/myTask/mytaskDash/EntityProfileApprovalList'
    )
);
const UserProfileDetails = lazy(
  () =>
    import('../component/admin-features/userProfileUpdate/UserProfileDetails')
);
const EntityProfileDetails = lazy(
  () =>
    import(
      '../component/admin-features/entityProfileUpdate/EntityProfileDetails'
    )
);

const CKYCRRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/">
        {/* Default redirect for the /re base path to the dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="my-task/requests/:id/:workFlowId/:userId"
            element={<RequestDetails />}
          />
          {/* shubham */}
          <Route
            path="my-task/modified-requests-view/:id/:workFlowId/:userId"
            element={<ModifiedRequestDetailsView />}
          />
          <Route
            path="/my-task/modified-registration"
            element={<ModifiedRegistration />}
          />
          <Route path="/my-task/new-request" element={<NewRequest />} />
          <Route path="/my-task/dashboard" element={<MyTaskDashboard />} />
          <Route path="/my-task/trackstatus" element={<TrackStatus />} />
          <Route
            path="/my-task/Re_Details/:id/:workFlowId/:userId"
            element={<Re_Details />}
          />

          <Route
            path="/my-task/re-registration"
            element={<Re_Registration />}
          />
          <Route
            path="/my-task/ip-whitelisting"
            element={<IPWhitelistingDashboard />}
          />
          {/* Update Profile Routes */}
          <Route
            path="/my-task/update-profile"
            element={<UpdateProfileDashboard />}
          />
          <Route
            path="/my-task/update-profile/user-profile"
            element={<UserProfileApprovalList />}
          />
          <Route
            path="/my-task/update-profile/user-profile/details/:id/:workFlowId/:userId"
            element={<UserProfileDetails />}
          />
          <Route
            path="/my-task/update-profile/entity-profile"
            element={<EntityProfileApprovalList />}
          />
          <Route
            path="/my-task/update-profile/entity-profile/details/:id/:workFlowId/:userId"
            element={<EntityProfileDetails />}
          />
          <Route
            path="/my-task/ip-whitelisting/block-ip-approver"
            element={<BlockIPApprover />}
          />
          <Route
            path="/my-task/ip-whitelisting/unblock-ip-approver"
            element={<UnblockIPApprover />}
          />
          <Route
            path="/ip-whitelisting/view-whitelisted-ips"
            element={<ViewWhitelistedIPs />}
          />
          <Route path="/ip-whitelisting/block-ips" element={<BlockIP />} />
          <Route path="/ip-whitelisting/unblock-ips" element={<UnBlockIP />} />
          <Route
            path="/ip-whitelisting/track-status"
            element={<TrackStatusIps />}
          />
          <Route
            path="/my-task/user-management"
            element={<MyTaskUserManagement />}
          />
          {/* cms shubham-sakshi */}
          <Route path="/cms/fees-management" element={<FeesManagement />} />
          <Route path="/cms/template" element={<SmsTemplate />} />
          <Route path="/cms/email-template" element={<EmailTemplate />} />
          <Route path="/cms/invoice-template" element={<InvoiceTemplate />} />
          <Route
            path="/sub-users/certify-modify"
            element={<CertifyModifyUser />}
          />
          <Route
            path="/sub-users/create-new-user"
            element={<CreateNewUser />}
          />
          <Route
            path="/sub-users/modify-user/:id"
            element={<CreateNewUser />}
          />
          <Route
            path="/my-task/sub-user/approval"
            element={<SubUserApproval />}
          />

          <Route path="sub-users/approvals" element={<Approvals />} />
          <Route
            path="/sub-users/approval-details"
            element={<ApprovalDetails />}
          />
          <Route
            path="/approvals-modify-user"
            element={<ApprovalModifyUser />}
          />
          <Route
            path="/sub-users/approvals-suspension-user"
            element={<UserSuspensionRequest />}
          />
          <Route
            path="/sub-users/approvals-revoke-suspension-user"
            element={<ApprovalRevokeSuspension />}
          />
          <Route path="/sub-users/modify-user" element={<ModifyUser />} />

          <Route
            path="/create-new-user-approvals"
            element={<CreateNewUserApprovals />}
          />

          <Route
            path="/re-management/update-nodal-officer-and-iau"
            element={<AdminReManagement action="update" />}
          />

          <Route
            path="/re-management/update-nodal-officer-and-iau/:nodal_id"
            element={<UpdateNodalOfficerDetails />}
          />

          <Route
            path="/re-management/deactivation"
            element={<AdminReManagement action="deactivate" />}
          />
          <Route
            path="/re-management/suspension"
            element={<AdminReManagement action="suspend" />}
          />
          <Route
            path="/re-management/revoke-suspension"
            element={<AdminReManagement action="revoke" />}
          />
          <Route
            path="re-management/re-details/:reId"
            element={<ReDetails />}
          />
        </Route>
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default CKYCRRoutes;
