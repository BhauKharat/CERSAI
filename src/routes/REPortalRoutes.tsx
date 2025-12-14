import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Layout = lazy(() => import('../component/common/Layout/Layout'));
const ModifyRegion = lazy(
  () => import('../component/features/UserManagement/ModifyRegion/ModifyRegion')
);
const CreateNewRegion = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyRegion/CreateNewRegion'
    )
);
const CreateNewRegionWrapper = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyRegion/CreateNewRegionWrapper'
    )
);
const MergeRegion = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyRegion/MergeRegion'
    )
);
// const CreateModifyBranch = lazy(
//   () =>
//     import(
//       '../component/features/UserManagement/CreateModifyBranch/CreateModifyBranch'
//     )
// );
const CreateNewBranch = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/CreateNewBranch'
    )
);

const MergeBranch = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/MergeBranch'
    )
);
const TransferBranch = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/TransferBranch'
    )
);
// const CreateModifyUser = lazy(
//   () =>
//     import(
//       '../component/features/UserManagement/CreateModifyUser/UserListTable'
//     )
// );
const CreateNewUser = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyUser/CreateNewUser'
    )
);
const CreateKYC = lazy(
  () => import('../component/features/KYCManagement/CreateKYC/CreateKYC')
);
const DownloadKYC = lazy(
  () => import('../component/features/KYCManagement/DownloadKYC/DownloadKYC')
);
const SubUserManagement = lazy(
  () => import('../component/features/MyTask/SubUserManagement')
);
const UpdateProfileDashboard = lazy(
  () =>
    import('../component/features/MyTask/UpdateProfile/UpdateProfileDashboard')
);
const SearchKYC = lazy(
  () => import('../component/features/KYCManagement/SearchKYC/SearchKYC')
);
const Dashboard = lazy(
  () => import('../component/features/Dashboard/Dashboard')
);
const UpdateKYC = lazy(
  () => import('../component/features/KYCManagement/UpdateKYC/UpdateKYC')
);
const UpdateEntityProfile = lazy(
  () => import('../component/features/MyTask/UpdateEntityProfile')
);
const UpdateUserProfile = lazy(
  () =>
    import(
      '../component/features/RERegistration/updateSteps/UpdateUserProfileStep'
    )
);
const UpdateProfileAddressDetails = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdateProfileAddressDetails'
    )
);
import REUpdationConatiner from '../component/features/RERegistration/REUpdationConatiner';
import UpdateFormPreviewTrackStatus from '../component/features/RERegistration/updateSteps/UpdateFormPreviewStep';
import UpdateProfileTrackStatus from '../component/features/RERegistration/updateSteps/TrackStatus/UpdateProfileTrackStatus';
import UpdateProfileTrackStatusView from '../component/features/RERegistration/updateSteps/TrackStatus/UpdateProfileTrackStatusView';
import UpdateProfileTrackStatusUserDetailsView from '../component/features/RERegistration/updateSteps/TrackStatus/UpdateProfileTrackStatusUserDetailsView';
import UpdateSubUserProfile from '../component/features/RERegistration/updateSteps/UpdateSubUserProfile';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

const UpdateInstitutionDetails = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdateInstitutionDetails'
    )
);
const UpdateNodalOfficerDetails = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdateNodalOfficerDetails'
    )
);
const UpdateInstitutionalAdminDetails = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdateInstitutionalAdminDetails'
    )
);

const EntityProfileSubUserDetails = lazy(
  () =>
    import(
      '../component/features/MyTask/ReApproval/EntityProfileSubUserDetails'
    )
);

const UpdatePreviewDetails = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdatePreviewDetails'
    )
);
const EntityProfileSubUsersApprovalList = lazy(
  () =>
    import(
      '../component/features/MyTask/ReApproval/EntityProfileSubUsersApprovalList'
    )
);
const UserProfileSubUserApprovalList = lazy(
  () =>
    import(
      '../component/features/MyTask/ReApproval/UserProfileSubUserApprovalList'
    )
);
const UserProfileSubUserDetails = lazy(
  () =>
    import('../component/features/MyTask/ReApproval/UserProfileSubUserDetails')
);
const UpdateEntityProfileForm = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdateEntityProfileForm'
    )
);

const UpdateDSCSetupStep = lazy(
  () =>
    import(
      '../component/features/RERegistration/updateSteps/UpdateDSCSetupStep'
    )
);
const UpdateTrackStatus = lazy(
  () =>
    import(
      '../component/features/MyTask/UpdateEntityProfile-prevo/UpdateTrackStatus'
    )
);

const DeactivateRegion = lazy(
  () =>
    import(
      '../component/features/UserManagement/DeactivateRegion/DeactivateRegion'
    )
);

const TrackStatus = lazy(
  () => import('../component/features/UserManagement/TrackStatus/TrackStatus')
);

const TrackStatusDetails = lazy(
  () =>
    import(
      '../component/features/UserManagement/TrackStatus/TrackStatusDetails'
    )
);

const ModifyBranch = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/ModifyBranch/ModifyBranch'
    )
);

const DeactivateBranch = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/DeactivateBranch/DeactivateBranch'
    )
);

const BranchTransferList = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/Transfer/BranchTransferList'
    )
);

const TrackBranchStatus = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyBranch/TrackBranchStatus/TrackBranchStatus'
    )
);

const ModifyUser = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyUser/modifyUser/ModifyUser'
    )
);

const DeactivateUser = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyUser/DeactivateUser/DeactivateUser'
    )
);

const SuspendUser = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyUser/SuspendUser/SuspendUser'
    )
);

const RevokeUserSuspension = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyUser/RevokeSuspension/RevokeSuspension'
    )
);

const TrackUserStatus = lazy(
  () =>
    import(
      '../component/features/UserManagement/CreateModifyUser/TrackStatus/TrackStatus'
    )
);

const ViewWhitelistedIPs = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ManagementWhitelist/ViewWhiteListedIPs'
    )
);
const UploadPublicKey = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ManagementWhitelist/UploadPublicKey'
    )
);
const AddNewIPAddress = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ManagementWhitelist/AddNewIPAddress'
    )
);
const RemoveIPAddress = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ManagementWhitelist/RemoveIPAddress'
    )
);
const ExtendValidity = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ManagementWhitelist/ExtendValidity'
    )
);
const IPWhitelistTrackStatus = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ManagementWhitelist/IPWhitelistTrackStatus'
    )
);
const IPWhiteListingDashBoard = lazy(
  () => import('../component/features/IPWhitelisting/IPWhiteListingDashBoard')
);
const IPWhitelistApproval = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ApprovalWhitelist/IPWhitelistApproval'
    )
);
const IPWorkflowApproval = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ApprovalWhitelist/IPWorkflowApproval'
    )
);
const ExtendValidityApproval = lazy(
  () =>
    import(
      '../component/features/IPWhitelisting/ApprovalWhitelist/ExtendValidityApproval'
    )
);

// Conditional wrapper component for Update User Profile
const UpdateUserProfileWrapper: React.FC = () => {
  const groupMembership = useSelector(
    (state: RootState) => state.auth.groupMembership
  );

  // Check if user has Nodal_officer or Institutional_Admin_User role
  const hasNodalOrAdminRole = groupMembership?.some((group) => {
    const normalizedGroup = group.replace(/^\//, '').toLowerCase();
    return (
      normalizedGroup === 'nodal_officer' ||
      normalizedGroup === 'institutional_admin_user'
    );
  });

  // If user has Nodal_officer or Institutional_Admin_User role, show UpdateUserProfile
  // Otherwise, show UpdateSubUserProfile
  return hasNodalOrAdminRole ? <UpdateUserProfile /> : <UpdateSubUserProfile />;
};

// Conditional wrapper component for Update User Profile
// const UpdateSubUserWrapper: React.FC = () => {
//   const groupMembership = useSelector(
//     (state: RootState) => state.auth.groupMembership
//   );

//   // Check if user has Nodal_officer or Institutional_Admin_User role
//   const hasIAURole = groupMembership?.some((group) => {
//     const normalizedGroup = group.replace(/^\//, '').toLowerCase();
//     return normalizedGroup === 'Institutional_Admin_User';
//   });

//   // If user has Nodal_officer or Institutional_Admin_User role, show UpdateUserProfile
//   // Otherwise, show UpdateSubUserProfile
//   return hasIAURole ? (
//     <EntityProfileSubUsersApprovalList />
//   ) : (
//     <UpdateSubUserProfile />
//   );
// };

const REPortalRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/">
        {/* Default redirect for the /re base path to the dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<Layout />}>
          {/* Main application features */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kyc/search" element={<SearchKYC />} />
          <Route path="kyc/create" element={<CreateKYC />} />
          <Route path="kyc/download" element={<DownloadKYC />} />
          <Route path="/re/kyc/update" element={<UpdateKYC />} />
          <Route
            path="/update-address-details"
            element={<UpdateProfileAddressDetails />}
          />
          <Route
            path="/update-institutional-details"
            element={<UpdateInstitutionDetails />}
          />
          <Route
            path="/update-nodal-officer-details"
            element={<UpdateNodalOfficerDetails />}
          />
          <Route
            path="/update-institutional-admin-details"
            element={<UpdateInstitutionalAdminDetails />}
          />
          <Route
            path="/update-preview-details"
            element={<UpdatePreviewDetails />}
          />
          <Route
            path="/update-entity-details"
            element={<UpdateEntityProfileForm />}
          />
          <Route path="/update-track-status" element={<UpdateTrackStatus />} />

          {/* User and Location Management */}
          <Route path="modify-region" element={<ModifyRegion />} />
          <Route path="create-new-region" element={<CreateNewRegion />} />
          <Route
            path="modify-region/:id"
            element={<CreateNewRegionWrapper />}
          />
          <Route path="merge-region" element={<MergeRegion />} />
          <Route path="modify-branch" element={<ModifyBranch />} />
          <Route path="create-new-branch" element={<CreateNewBranch />} />
          <Route path="modify-branch/:id" element={<CreateNewBranch />} />
          <Route path="merge-branch" element={<MergeBranch />} />
          <Route path="transfer-branch" element={<TransferBranch />} />
          {/* <Route path="create-user" element={<CreateModifyUser />} /> */}
          <Route path="create-new-user" element={<CreateNewUser />} />
          <Route path="modify-user/:id" element={<CreateNewUser />} />
          <Route path="suspend-user/:id" element={<CreateNewUser />} />
          <Route path="deactivate-region" element={<DeactivateRegion />} />
          <Route path="track-region-status" element={<TrackStatus />} />
          <Route path="deactivate-branch" element={<DeactivateBranch />} />
          <Route path="transfer-branch-list" element={<BranchTransferList />} />
          <Route path="track-branch-status" element={<TrackBranchStatus />} />
          <Route
            path="track-region-status/:code"
            element={<TrackStatusDetails />}
          />
          <Route path="sub-user-management/*" element={<SubUserManagement />} />
          <Route path="update-profile" element={<UpdateProfileDashboard />} />
          <Route
            path="update-entity-profile"
            element={<UpdateEntityProfile />}
          />
          <Route
            path="update-user-profile"
            element={<UpdateUserProfileWrapper />}
          />

          <Route path="modify-user" element={<ModifyUser />} />

          <Route path="deactivate-user" element={<DeactivateUser />} />

          <Route path="suspend-user" element={<SuspendUser />} />

          <Route path="revoke-suspension" element={<RevokeUserSuspension />} />

          <Route path="track-user-status" element={<TrackUserStatus />} />

          {/* RE approval routes */}

          <Route
            path="entity-profile-sub-user-details/:reId/:workFlowId"
            element={<EntityProfileSubUserDetails />}
          />
          <Route
            path="entity-profile-sub-user-list"
            element={<EntityProfileSubUsersApprovalList />}
          />
          <Route
            path="user-profile-sub-user-list"
            element={<UserProfileSubUserApprovalList />}
          />
          <Route
            path="user-profile-sub-user-details/:userId/:workflowId"
            element={<UserProfileSubUserDetails />}
          />

          {/* Update Profile Stepper Routes */}
          <Route
            path="update-entity-profile-step"
            element={<REUpdationConatiner />}
          />
          <Route
            path="update-entity-profile-trackstatus"
            element={<UpdateFormPreviewTrackStatus />}
          />
          <Route
            path="update-trackstatus"
            element={<UpdateProfileTrackStatus />}
          />
          <Route
            path="update-trackstatus-view/:workflowId"
            element={<UpdateProfileTrackStatusView />}
          />
          <Route
            path="update-trackstatus-user-details-view/:workflowId"
            element={<UpdateProfileTrackStatusUserDetailsView />}
          />
          <Route path="update-address-step" element={<REUpdationConatiner />} />
          <Route path="update-hoi-step" element={<REUpdationConatiner />} />
          <Route
            path="update-nodal-officer-step"
            element={<REUpdationConatiner />}
          />
          <Route
            path="update-admin-user-step"
            element={<REUpdationConatiner />}
          />
          <Route
            path="update-form-preview-step"
            element={<REUpdationConatiner />}
          />
          <Route path="update-dsc-setup" element={<UpdateDSCSetupStep />} />

          {/* IP Whitelisting */}
          <Route path="ip-whitelisting/view" element={<ViewWhitelistedIPs />} />
          <Route path="ip-whitelisting/upload" element={<UploadPublicKey />} />
          <Route
            path="ip-whitelisting/addNewIPAddress"
            element={<AddNewIPAddress />}
          />
          <Route
            path="ip-whitelisting/removeIPAddress"
            element={<RemoveIPAddress />}
          />
          <Route
            path="ip-whitelisting/extendValidity"
            element={<ExtendValidity />}
          />
          <Route
            path="ip-whitelisting/trackStatus"
            element={<IPWhitelistTrackStatus />}
          />
          {/* IP Whitelisting  Approval*/}
          <Route
            path="ip-whitelisting/dashboard"
            element={<IPWhiteListingDashBoard />}
          />
          <Route
            path="ip-whitelisting/publickey/approval"
            element={<IPWhitelistApproval />}
          />
          <Route
            path="ip-whitelisting/add-new-ip-approval"
            element={
              <IPWorkflowApproval workflowType="IP_WHITELISTING_ADD_NEW_IP_ADDRESS" />
            }
          />
          <Route
            path="ip-whitelisting/remove-ip-approval"
            element={
              <IPWorkflowApproval workflowType="IP_WHITELISTING_REMOVE_IP_ADDRESS" />
            }
          />
          <Route
            path="ip-whitelisting/extend-validity-approval"
            element={<ExtendValidityApproval />}
          />
        </Route>
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default REPortalRoutes;
