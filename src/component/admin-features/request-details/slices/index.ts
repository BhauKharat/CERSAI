/**
 * Index file for request-details slices
 * Re-exports all slices for easier imports
 */

// Existing slices for RE Registration
export {
  default as applicationActionReducer,
  updateApplicationStatus,
  resetActionState,
} from './applicationActionSlice';
export {
  default as applicationPreviewReducer,
  fetchApplicationDetails,
  fetchApplicationDetailsAdmin,
  fetchFields,
  clearApplicationDetail,
} from './applicationPreviewSlice';
export { default as applicationDetailsAdminReducer } from './applicationDetailsAdminSlice';

// New slices for User Profile Update
export {
  default as userProfileApprovalReducer,
  fetchUserProfilePendingApprovals,
  fetchUserProfileWorkflowDetails,
  approveUserProfileUpdate,
  rejectUserProfileUpdate,
  resetUserProfileApprovalState,
  resetUserProfileActionState,
  clearUserProfileWorkflowDetails,
  clearUserProfilePendingApprovals,
} from './userProfileApprovalSlice';

export {
  default as userProfileTrackStatusReducer,
  fetchUserProfileTrackStatusList,
  fetchUserProfileTrackStatusDetail,
  resetUserProfileTrackStatusState,
  clearUserProfileTrackStatusList,
  clearUserProfileTrackStatusDetail,
} from './userProfileTrackStatusSlice';
