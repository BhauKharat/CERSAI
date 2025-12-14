// App-wide constants
export const APP_NAME = 'CKYCRR Dashboard';
// export const API_BASE_URL = '/api';

export const API_BASE_URL_RE = process.env.REACT_APP_API_BASE_URL;
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL_ADMIN;

export const ENDPOINTS = {
  // APPLICATIONS: '/cersai/applications',
  // APPLICATIONS: `${API_BASE_URL}/api/v1/re-initiated-workflow/pending-requests`,  old 7-11-25
  APPLICATIONS: `${API_BASE_URL}/api/v1/re-initiated-workflow/pending`,
  // TRACK_STATUS: `${API_BASE_URL}/api/v1/re-initiated-workflow/requests`,
  TRACK_STATUS: `${API_BASE_URL}/api/v1/re-initiated-workflow/track-status`,
  // getApplicationDetails: (acknowledgementNo: string) =>
  //   `${API_BASE_URL}/cersai/application/${acknowledgementNo}`,
  getApplicationDetails: (acknowledgementNo: string) =>
    `${API_BASE_URL_RE}/api/v1/re/applications/${acknowledgementNo}/preview`,
  getApplicationDetailsadmin: (workflowId: string, userId: string) =>
    `${API_BASE_URL_RE}/api/v1/registration?workflowId=${workflowId}&userId=${userId}`,

  getApplicationDetailsadmincms: (workflowId: string, userId: string) =>
    `${API_BASE_URL_RE}/api/v1/registration?workflowId=${workflowId}&userId=${userId}`,

  updateApplicationStatus: (apiStatus: string) =>
    `${API_BASE_URL}/api/v1/re-approval-workflow/${apiStatus}`,
  updateApplicationStatusCersai: `${API_BASE_URL}/api/v1/re-initiated-workflow/approval`,

  // IP Whitelisting Workflows
  IP_WHITELISTING_WORKFLOWS: `${API_BASE_URL}/api/v1/ip-whitelisting/workflow/pending-requests`,
  IP_WHITELISTING_APPROVAL: `${API_BASE_URL}/api/v1/ip-whitelisting/workflow/approve`,
  IP_WHITELISTING_REJECT: `${API_BASE_URL}/api/v1/ip-whitelisting/workflow/reject`,

  // updateApplicationStatus: `${API_BASE_URL}/cersai/application/action`,
  LOGIN: `${API_BASE_URL}/re/auth/login`,
  VALIDATE_DSC: `${API_BASE_URL}/re/auth/verify-dsc`,

  // User Profile Update Approval Workflows
  USER_PROFILE_PENDING_APPROVALS: `${API_BASE_URL}/api/v1/re-user-profile-workflow/pending`,

  // Entity Profile Update Approval Workflows
  ENTITY_PROFILE_PENDING_APPROVALS: `${API_BASE_URL}/api/v1/re-initiated-workflow/pending`,
  ENTITY_SUB_USER_PROFILE_PENDING_APPROVALS: `${API_BASE_URL}/api/v1/update-profile/workflow/pending-request`,
  getEntityProfileWorkflowDetails: (workflowId: string) =>
    `${API_BASE_URL}/api/v1/re-user-profile-workflow/track-status/${workflowId}/details`,
  ENTITY_PROFILE_ACTION: `${API_BASE_URL}/api/v1/update-profile/workflow/action`,
  getUserProfileWorkflowDetails: (workflowId: string) =>
    `${API_BASE_URL}/api/v1/re-user-profile-workflow/track-status/${workflowId}/details`,
  // Single endpoint for approve/reject - action is passed in body
  USER_PROFILE_APPROVAL: `${API_BASE_URL}/api/v1/re-user-profile-workflow/approval`,

  // User Profile Track Status
  USER_PROFILE_TRACK_STATUS: `${API_BASE_URL_RE}/api/v1/update-user-profile/track-status`,
  getUserProfileTrackStatusDetails: (workflowId: string, userId: string) =>
    `${API_BASE_URL_RE}/api/v1/update-user-profile/track-status/${workflowId}?userId=${userId}`,

  // RE Portal - User Profile Sub User Details
  getREUserProfileWorkflowDetails: (workflowId: string, approverId: string) =>
    `${API_BASE_URL_RE}/api/v1/user-profile-workflows/${workflowId}/details?approverId=${approverId}`,
  getREUserProfileApprove: (workflowId: string, userId: string) =>
    `${API_BASE_URL_RE}/api/v1/user-profile-workflows/${workflowId}/approve?userId=${userId}`,
  getREUserProfileReject: (workflowId: string, userId: string) =>
    `${API_BASE_URL_RE}/api/v1/user-profile-workflows/${workflowId}/reject?userId=${userId}`,
  IP_WHITELISTING: `${API_BASE_URL_RE}/api/v1/ip-whitelisting`,
  PUBLIC_KEY_UPLOAD: `${API_BASE_URL_RE}/api/v1/ip-whitelisting/public-key/upload-file`,
  PUBLIC_KEY_CREATE_REPLACE: `${API_BASE_URL_RE}/api/v1/ip-whitelisting/public-key/create-replace`,
  PUBLIC_KEY_DATA: `${API_BASE_URL_RE}/api/v1/ip-whitelisting/public-key/data`,
} as const;
