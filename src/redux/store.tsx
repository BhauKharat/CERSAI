import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import signupReducer from '../component/features/Authenticate/slice/signupSlice';
import otpModalReducer from '../component/ui/Modal/slice/otpModalSlice';
import signupFormReducer from '../component/features/Authenticate/slice/signupFormSlice';
import authSliceReducer from '../component/features/Authenticate/slice/authSlice';
// import authReducer from '../redux/slices/registerSlice/authSlice';
import loaderReducer from './slices/loader/loaderSlice';
import passSetupOtpReducer from '../component/features/Authenticate/slice/passSetupOtpSlice';
import passSetupReducer from '../component/features/Authenticate/types/passSetupSlice';
import registrationReducer from './slices/registerSlice/registrationSlice';
import addressReducer from './slices/registerSlice/addressSlice';
import headInstitutionReducer from './slices/registerSlice/institutiondetailSlice';
import nodalOfficerReducer from './slices/registerSlice/nodalOfficerSlice';
import adminOfficerReducer from './slices/registerSlice/institutionadminSlice';
import applicationPreviewReducer from './slices/registerSlice/applicationPreviewSlice';
import applicationReducer from './slices/registerSlice/applicationSlice';
import mastersReducer from './slices/registerSlice/masterSlice';
import applicationActionReducer from '../component/admin-features/request-details/slices/applicationActionSlice';
import applicationPreviewReducerAdmin from '../component/admin-features/request-details/slices/applicationPreviewSlice';
import applicationReducerTask from '../component/admin-features/myTask/slices/applicationSlice';
import regionReducer from '../component/features/UserManagement/CreateModifyRegion/slice/regionSlice';
import regionWorkflowReducer from '../component/features/UserManagement/CreateModifyRegion/slice/regionWorkflowSlice';
import trackStatusDetailsReducer from '../component/features/UserManagement/CreateModifyRegion/slice/trackStatusDetailsSlice';
import subUserRegionReducer from '../component/features/MyTask/SubUserManagement/region/slice/SubUserRegionSlice';
import createRegionReducer from '../component/features/UserManagement/CreateModifyRegion/slice/createRegionSlice';
import deactivationStatsReducer from '../component/features/UserManagement/CreateModifyRegion/slice/deactivationStatsSlice';
import branchSliceReducer from '../component/features/MyTask/SubUserManagement/branch/slice/BranchSlice';
import approvedRegionsReducer from '../component/features/UserManagement/CreateModifyRegion/slice/approvedRegionsSlice';
import mergeRegionReducer from '../component/features/UserManagement/CreateModifyRegion/slice/mergeRegionSlice';
import singleRegionReducer from '../component/features/UserManagement/CreateModifyRegion/slice/singleRegionSlice';
import branchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/branchSlice';
import createBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/createBranchSlice';
import getBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/getBranchSlice';
import modifyBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/modifyBranchSlice';
import deactivateBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/deactivateBranchSlice';
import mergeBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/mergeBranchSlice';
import transferBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/transferBranchSlice';
import approvedBranchReducer from '../component/features/UserManagement/CreateModifyBranch/slice/approvedBranchSlice';
import branchWorkflowReducer from '../component/features/UserManagement/CreateModifyBranch/slice/branchWorkflowSlice';
import branchTrackStatusReducer from '../component/features/UserManagement/CreateModifyBranch/slice/branchTrackStatusSlice';
import usersReducer from '../component/features/UserManagement/CreateModifyUser/slice/usersSlice';
import subUsersReducer from '../component/features/UserManagement/CreateModifyUser/slice/subUsersSlice';
import suspendUserReducer from '../component/features/UserManagement/CreateModifyUser/slice/suspendUserSlice';
import deactivateUserReducer from '../component/features/UserManagement/CreateModifyUser/slice/deactivateUserSlice';
import revokeSuspendUserReducer from '../component/features/UserManagement/CreateModifyUser/slice/revokeSuspendUserSlice';
import userAddressReducer from '../component/features/UserManagement/CreateModifyUser/slice/userAddressSlice';
import userRolesReducer from '../component/features/UserManagement/CreateModifyUser/slice/userRolesSlice';
import userProfileReducer from '../component/features/MyTask/UpdateUserProfile/UpdateUserProfileSlice';
import sendOtpReducer from '../component/features/UserManagement/CreateModifyUser/slice/sendOtpSlice';
import validateOtpReducer from '../component/features/UserManagement/CreateModifyUser/slice/validateOtpSlice';
import createUserManagementReducer from '../component/features/UserManagement/CreateModifyUser/slice/createUserSlice';
import createSubUserManagementReducer from '../component/features/UserManagement/CreateModifyUser/slice/createSubUserSlice';
import fetchRegionsManagementReducer from '../component/features/UserManagement/CreateModifyUser/slice/fetchRegionsSlice';
import fetchOfficeAddressReducer from '../component/features/UserManagement/CreateModifyUser/slice/fetchOfficeAddressSlice';
import fetchBranchesManagementReducer from '../component/features/UserManagement/CreateModifyBranch/slice/fetchBranchesSlice';
import fetchUserReducer from '../component/features/UserManagement/CreateModifyUser/slice/fetchUserSlice';
import modifyUserReducer from '../component/features/UserManagement/CreateModifyUser/slice/modifyUserSlice';
import suspensionDetailsReducer from '../component/features/UserManagement/CreateModifyUser/slice/suspensionDetailsSlice';
import cersaiAddressReducer from '../component/admin-features/subUser/CreateModifyUser/slice/cersaiAddressSlice';
import workflowPendingRequestsReducer from '../component/features/UserManagement/CreateModifyUser/slice/workflowPendingRequestsSlice';
import SubUserReducer from '../component/admin-features/subUser/slices/subUserSlice';
import createUserReducer from '../component/admin-features/subUser/CreateNewUser/slices/createUserSlice';
import workFlowReducer from '../component/admin-features/subUser/approvals/slice/workFlowSLice';
import suspensionReducer from '../component/admin-features/subUser/approvalsRevokeSuspension/slices/revokeSuspensionSlice';
import userWorkflowReducer from '../component/admin-features/subUser/approvalsRevokeSuspension/slices/revokeSuspensionSlice';
import userSuspensionWorkflowReducer from '../component/admin-features/subUser/approvalsSuspension/slice/suspensionSlice';
import modifyUserWorkflowReducer from '../component/admin-features/subUser/approvalsModify/slices/approvalsModifyUserSlice';
import reportingEntitiesReducer from '../component/admin-features/ReManagement/slices/applicationSlice';
import reportingEntityReducer from '../component/admin-features/ReManagement/slices/reportingEntitySlice';
import getApplicationReducer from '../component/features/MyTask/UpdateEntityProfile/slice/getApplicationSlice';
import updateEntityActionReducer from '../component/features/MyTask/UpdateEntityProfile/slice/updateEntityActionSlice';
import getPreviousVersionReducer from '../component/features/MyTask/UpdateEntityProfile/slice/getPreviousVersionSlice';
import nodalOfficerPreviewReducer from '../component/re-management/update-nodal-officer/slice/nodalOfficerPreviewSlice';
import updateOfficerReducer from '../component/re-management/update-nodal-officer/slice/updateOfficerSlice';
import dynamicFormReducer from '../component/features/RERegistration/slice/formSlice';
import addressDetailsReducer from '../component/features/RERegistration/slice/addressDetailsSlice';
import adminUserDetailsReducer from '../component/features/RERegistration/slice/adminUserDetailsSlice';
import formPreviewReducer from '../component/features/RERegistration/slice/formPreviewSlice';
import trackStatusFormPreviewReducer from '../component/features/RERegistration/slice/trackStatusFormPreviewSlice';
import registrationConfigReducer from '../component/features/RERegistration/slice/registrationConfigSlice';
import updateInstitutionAdminReducer from './slices/updateProfileSlice/updateInstituteAdminSlice';
import entityProfileReducer from './slices/REEntityUpdateSlice';
import updateInstituteAdminReducer from '../../src/redux/slices/updateProfileSlice/updateInstituteAdminSlice';
import trackStatusReducer from '../component/features/RERegistration/slice/trackStatusFormSlice';
import entityProfileSubmissionReducer from '../component/features/RERegistration/slice/entityProfileSubmissionSlice';
import addressDetailsSubmissionReducer from '../component/features/RERegistration/slice/addressDetailsSubmissionSlice';
import headOfInstitutionSubmissionReducer from '../component/features/RERegistration/slice/headOfInstitutionSubmissionSlice';
import nodalOfficerSubmissionReducer from '../component/features/RERegistration/slice/nodalOfficerSubmissionSlice';
import adminUserDetailsSubmissionReducer from '../component/features/RERegistration/slice/adminUserDetailsSubmissionSlice';
import stepDataReducer from '../component/features/RERegistration/slice/stepDataSlice';
import workflowReducer from '../component/features/RERegistration/slice/workflowSlice';
import pdfGenerationReducer from '../component/features/RERegistration/slice/pdfGenerationSlice';
import dahsboardSubUserReducer from '../component/admin-features/myTask/slices/dashboardSubUserSlice';
import ipWhitelistingReducer from '../component/features/IPWhitelisting/slices/ipWhitelistingSlice';
import addIPAddressReducer from '../component/features/IPWhitelisting/slices/addIPAddressSlice';

import applicationDetailsReducer from '../component/admin-features/request-details/slices/applicationPreviewSlice';
import applicationDetailsAdminReducer from '../component/admin-features/request-details/slices/applicationDetailsAdminSlice';
import updateStepData from '../component/features/RERegistration/updateSteps/slice/updateStepDataSlice';
import updateAddressDetailsSlice from '../component/features/RERegistration/updateSteps/slice/updateAddressDetailsSlice';
import updateHeadOfInstitutionReducer from '../component/features/RERegistration/updateSteps/slice/updateHeadOfInstitutionSlice';
import updateNodalOfficerReducer from '../component/features/RERegistration/updateSteps/slice/updateNodalOfficerSlice';
import updateAdminUserDetailsReducer from '../component/features/RERegistration/updateSteps/slice/updateAdminUserDetailsSlice';
import updateFormPreviewReducer from '../component/features/RERegistration/updateSteps/slice/formPreviewSlice';
import updateUserDetailsFormPreviewReducer from '../component/features/RERegistration/updateSteps/slice/trackStatus_userDetailsformPreviewSlice';
import updateWorkflowReducer from '../component/features/RERegistration/updateSteps/slice/updateWorkflowSlice';
import pdfGenerationUpdateReducer from '../component/features/RERegistration/updateSteps/slice/pdfGenerationUpdateSlice';
import updateConfigReducer from '../component/features/RERegistration/updateSteps/slice/updateStepperSlice';
import updateProfileTrackStatusReducer from '../component/features/RERegistration/updateSteps/TrackStatus/UpdateProfileTrackStatusSlice';
import updateDSCSetupReducer from '../component/features/RERegistration/updateSteps/slice/updateDSCSetupSlice';
import updateUserProfileReducer from '../component/features/RERegistration/updateSteps/slice/updateUserProfileSlice';
import ipWhitelistingAdminReducer from '../component/admin-features/ipWhitelisting/slices/ipWhitelistingSlice';
import ipWhitelistingTrackStatusReducer from '../component/admin-features/ipWhitelisting/slices/ipWhitelistingTrackStatusSlice';
import reDropdownReducer from '../component/admin-features/ipWhitelisting/slices/reDropdownSlice';
import blockIpReducer from '../component/admin-features/ipWhitelisting/slices/blockIpSlice';
import ipWhitelistingWorkflowReducer from '../component/admin-features/ipWhitelisting/slices/ipWhitelistingWorkflowSlice';
import userProfileApprovalReducer from '../component/admin-features/request-details/slices/userProfileApprovalSlice';
import userProfileTrackStatusReducer from '../component/admin-features/request-details/slices/userProfileTrackStatusSlice';
import entityProfileApprovalReducer from '../component/admin-features/request-details/slices/entityProfileApprovalSlice';
import reApprovalRegistrationReducer from '../component/features/MyTask/ReApproval/registrationSlice';
import reApprovalWorkflowPendingRequestReducer from '../component/features/MyTask/ReApproval/workflowPendingRequestSlice';
import userProfileSubUserApprovalReducer from '../component/features/MyTask/ReApproval/userProfileSubUserApprovalSlice';
import reUserProfileWorkflowReducer from '../component/features/MyTask/ReApproval/reUserProfileWorkflowSlice';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    // Exclude heavy data slices that don't need persistencesidebar
    'updateOfficer',
    'dynamicForm',
    'stepData',
    'workflowPreview', // Contains large document data (fetchedDocuments with base64)
    'formPreview', // Contains form preview data
    'trackStatusFormPreview', // Contains preview data
    'pdfGeneration', // Contains PDF document data
    'applicationPreview', // Contains large application data
    'applicationPreviewAdmin', // Contains large admin preview data
    'reportingEntities', // Contains large entity lists
    'reportingEntity', // Contains entity data
    'ipWhitelisting', // Contains IP whitelisting lists
    'ipWhitelistingTrackStatus', // Contains IP whitelisting track status data
    'ipWhitelistingWorkflow', // Contains IP whitelisting workflow data that can be refetched
    'reDropdown', // Contains RE dropdown data that can be refetched
    'blockIp', // Block IP status update state, doesn't need persistence
    'userProfileApproval', // User profile approval state can be refetched
    'userProfileTrackStatus', // User profile track status can be refetched
    'entityProfileApproval', // Entity profile approval state can be refetched
    'reApprovalRegistration', // RE approval registration data can be refetched
    'reApprovalWorkflowPendingRequest', // RE approval workflow pending request can be refetched
    'userProfileSubUserApproval', // User profile sub user approval can be refetched
    'reUserProfileWorkflow', // RE user profile workflow details can be refetched
    'masters', // Contains master data that can be refetched
    'loader', // UI state, doesn't need persistence
    'otpModal', // Modal state, doesn't need persistence
    'sendOtp', // OTP loading state should not be persisted
    'validateOtp', // OTP validation state should not be persisted
    'suspensionDetails', // Suspension details can be refetched, doesn't need persistence
  ],
};
//
const rootReducer = combineReducers({
  loader: loaderReducer,
  signup: signupReducer,
  signupForm: signupFormReducer,
  auth: authSliceReducer,
  otpModal: otpModalReducer,
  // auth: authReducer,
  masters: mastersReducer,
  passSetupOtp: passSetupOtpReducer,
  passSetup: passSetupReducer,
  registration: registrationReducer,
  address: addressReducer,
  headInstitution: headInstitutionReducer,
  nodalOfficer: nodalOfficerReducer,
  adminOfficer: adminOfficerReducer,
  applicationPreview: applicationPreviewReducer,
  applicationDetails: applicationDetailsReducer,
  application: applicationReducer,
  applicationTask: applicationReducerTask,
  applicationAction: applicationActionReducer,
  applicationPreviewAdmin: applicationPreviewReducerAdmin,
  userProfile: userProfileReducer,
  region: regionReducer,
  regionWorkflow: regionWorkflowReducer,
  trackStatusDetails: trackStatusDetailsReducer,
  subUserRegion: subUserRegionReducer,
  subUserBranch: branchSliceReducer,
  createRegion: createRegionReducer,
  deactivationStats: deactivationStatsReducer,
  approvedRegions: approvedRegionsReducer,
  mergeRegion: mergeRegionReducer,
  singleRegion: singleRegionReducer,
  branch: branchReducer,
  createBranch: createBranchReducer,
  getBranch: getBranchReducer,
  modifyBranch: modifyBranchReducer,
  deactivateBranch: deactivateBranchReducer,
  mergeBranch: mergeBranchReducer,
  transferBranch: transferBranchReducer,
  approvedBranches: approvedBranchReducer,
  branchWorkflow: branchWorkflowReducer,
  branchTrackStatus: branchTrackStatusReducer,
  users: usersReducer,
  subUsers: subUsersReducer,
  suspendUser: suspendUserReducer,
  deactivateUser: deactivateUserReducer,
  revokeSuspendUser: revokeSuspendUserReducer,
  userAddress: userAddressReducer,
  userRoles: userRolesReducer,
  cersaiAddress: cersaiAddressReducer,
  sendOtp: sendOtpReducer,
  validateOtp: validateOtpReducer,
  createUserManagement: createUserManagementReducer,
  createSubUserManagement: createSubUserManagementReducer,
  fetchRegionsManagement: fetchRegionsManagementReducer,
  fetchOfficeAddress: fetchOfficeAddressReducer,
  fetchBranchesManagement: fetchBranchesManagementReducer,
  fetchUser: fetchUserReducer,
  modifyUser: modifyUserReducer,
  suspensionDetails: suspensionDetailsReducer,
  workflowPendingRequests: workflowPendingRequestsReducer,
  subUser: SubUserReducer,
  createUser: createUserReducer,
  workflow: workFlowReducer,
  suspension: suspensionReducer,
  userWorkflow: userWorkflowReducer,
  userSuspensionWorkflow: userSuspensionWorkflowReducer,
  modifyUserWorkflow: modifyUserWorkflowReducer,
  reportingEntities: reportingEntitiesReducer,
  reportingEntity: reportingEntityReducer,
  ipWhitelistingAdmin: ipWhitelistingAdminReducer,
  ipWhitelistingTrackStatus: ipWhitelistingTrackStatusReducer,
  ipWhitelistingWorkflow: ipWhitelistingWorkflowReducer,
  reDropdown: reDropdownReducer,
  blockIp: blockIpReducer,
  nodalOfficerPreview: nodalOfficerPreviewReducer,
  updateOfficer: updateOfficerReducer,
  getApplication: getApplicationReducer,
  updateEntityAction: updateEntityActionReducer,
  getPreviousVersion: getPreviousVersionReducer,
  dynamicForm: dynamicFormReducer,
  addressDetails: addressDetailsReducer,
  adminUserDetails: adminUserDetailsReducer,
  formPreview: formPreviewReducer,
  trackStatus: trackStatusReducer,
  trackStatusFormPreview: trackStatusFormPreviewReducer,
  registrationConfig: registrationConfigReducer,
  institutionAdmin: updateInstitutionAdminReducer,
  reportentityaddress: addressReducer,
  entityProfile: entityProfileReducer,
  instituteAdmin: updateInstituteAdminReducer,
  entityProfileSubmission: entityProfileSubmissionReducer,
  addressDetailsSubmission: addressDetailsSubmissionReducer,
  headOfInstitutionSubmission: headOfInstitutionSubmissionReducer,
  nodalOfficerSubmission: nodalOfficerSubmissionReducer,
  adminUserDetailsSubmission: adminUserDetailsSubmissionReducer,
  stepData: stepDataReducer,
  workflowPreview: workflowReducer,
  pdfGeneration: pdfGenerationReducer,
  applicationDetailsdataAdmin: applicationDetailsAdminReducer,
  updateStepData: updateStepData,
  updateAddressDetailsSlice: updateAddressDetailsSlice,
  updateHeadOfInstitution: updateHeadOfInstitutionReducer,
  updateNodalOfficer: updateNodalOfficerReducer,
  updateUserProfile: updateUserProfileReducer,
  updateAdminUserDetailsSlice: updateAdminUserDetailsReducer,
  updateFormPreview: updateFormPreviewReducer,
  updateUserDetailsFormPreview: updateUserDetailsFormPreviewReducer,
  updateWorkflow: updateWorkflowReducer,
  pdfGenerationUpdate: pdfGenerationUpdateReducer,
  updateConfig: updateConfigReducer,
  updateProfileTrackStatus: updateProfileTrackStatusReducer,
  dahsboardSubUser: dahsboardSubUserReducer,
  ipWhitelisting: ipWhitelistingReducer,
  addIPAddress: addIPAddressReducer,
  dsc: updateDSCSetupReducer,
  userProfileApproval: userProfileApprovalReducer,
  userProfileTrackStatus: userProfileTrackStatusReducer,
  entityProfileApproval: entityProfileApprovalReducer,
  reApprovalRegistration: reApprovalRegistrationReducer,
  reApprovalWorkflowPendingRequest: reApprovalWorkflowPendingRequestReducer,
  userProfileSubUserApproval: userProfileSubUserApprovalReducer,
  reUserProfileWorkflow: reUserProfileWorkflowReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const typedPersistConfig: PersistConfig<RootState> =
  persistConfig as PersistConfig<RootState>;

type PersistedReducer = ReturnType<typeof persistReducer<RootState>>;

const persistedReducer = persistReducer(
  typedPersistConfig,
  rootReducer
) as PersistedReducer;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Immutable state checks can be expensive with large states in dev
      // Disable in production; in dev increase the warning threshold to avoid performance warnings
      immutableCheck:
        process.env.NODE_ENV === 'production' ? false : { warnAfter: 128 },
      // You already have non-serializable items due to redux-persist, disable this
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
