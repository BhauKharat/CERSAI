import { USER_ROLES } from './utils/enumUtils';

export const API_URL = 'https://dev.ckycindia.dev';
export const CMS_URL = 'https://dev.ckycindia.dev/cms';
export const API_URL_REINITILIZE = 'https://dev.ckycindia.dev';
export const BASE_ENV = 'admin';
export const API_DROPDOWN_URL = 'https://dev.ckycindia.dev';
export const API_ADMIN_BASE_URL = 'https://dev.ckycindia.dev';

// ✅ Use API_ADMIN_BASE_URL instead of undefined
export const ADMIN_API_URLS = API_ADMIN_BASE_URL;

export const API_ENDPOINTS = {
  // Admin APIs
  // post_validate_otp: `${API_URL}/${BASE_ENV}/v1/re/signup/validate-otp`,
  post_resend_otp: `${API_URL}/${BASE_ENV}/v1/otp/resend`,
  post_resend_otp_v1: `${API_URL}/${BASE_ENV}/v1/otp/resend/v1`,
  // post_resend_otp: `${API_URL}/${BASE_ENV}/v1/re/signup/resend-otp`,
  // post_login: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/auth/login`,
  verify_dsc: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/auth/token`,
  post_send_otp: `${API_URL}/${BASE_ENV}/v1/re/signup/send-otp`,
  send_otp_user_management: `${API_URL}/${BASE_ENV}/v1/otp/send-otp`,
  // send_otp_user_management: `${API_URL}/${BASE_ENV}/v1/re/signup/send-otp`,
  // validate_otp_user_management: `${API_URL}/${BASE_ENV}/v1/re/signup/validate-otp`,
  create_user_management: `${API_URL}/${BASE_ENV}/v1/users`,
  create_sub_user: `${API_URL}/${BASE_ENV}/v1/sub-users`,

  createNewUser_adminSubUser_management: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/user`,
  // getUsers_adminSubUser_management: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/users/filter`,
  admin_subuser_workflow_list: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/user-workflow`,

  // Reinitialize APIs
  // REINITIALIZE: `/${BASE_ENV}/v1/re/initialize`,

  ADMINREINITIALIZE: `${API_URL}/v1/ckycrr/initialize`,

  // RE Portal APIs
  // post_password_dsc_setup: `${BASE_ENV}/v1/re/auth/password-dsc-setup`,
  otp_send: `${API_URL}/${BASE_ENV}/v1/otp/send-otp`,
  forgot_password_otp_send: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/send-otp`,
  forgot_password: `${API_URL}/${BASE_ENV}/v1/otp/send-otp`,
  forgot_user_id: `${BASE_ENV}/v1/re/auth/forgot-userId`,
  forgot_new_password_setup: `${BASE_ENV}/v1/auth/forgot-password-setup`,
  forgot_new_password_setup_admin: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/auth/forgot-password-setup`,

  //sub-user-management
  get_region: `${API_URL}/${BASE_ENV}/v1/regions`,
  create_region: `${API_URL}/${BASE_ENV}/v1/regions`,
  fetch_regions: `${API_URL}/${BASE_ENV}/v1/regions/list`,
  fetch_branches: `${API_URL}/${BASE_ENV}/v1/branches/list`,
  // otp_send_CU: `${API_URL}/${BASE_ENV}/v1/otp/send-otp`,
  // get_approved_regions: `${API_URL}/${BASE_ENV}/v1/regions/approved`,
  get_approved_regions: `${API_URL}/${BASE_ENV}/v1/regions`,
  get_users: `${API_URL}/${BASE_ENV}/v1/users`,
  get_sub_users: `${API_URL}/${BASE_ENV}/v1/sub-users/fetch-all`,
  get_sub_users_address: `${API_URL}/${BASE_ENV}/v1/sub-users/address`,
  workflow_pending_requests: `${API_URL}/${BASE_ENV}/v1/sub-users-workflow/pending-requests`,
  sub_users_workflow_approval: `${API_URL}/${BASE_ENV}/v1/sub-users-workflow/approval`,
  get_user_by_id: (userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/users/${userId}`,
  modify_user: (userId: string) => `${API_URL}/${BASE_ENV}/v1/users/${userId}`,
  suspend_user: `${API_URL}/${BASE_ENV}/v1/sub-users/action`,
  deactivate_user: `${API_URL}/${BASE_ENV}/v1/sub-users/action`,
  revoke_suspend_user: `${API_URL}/${BASE_ENV}/v1/sub-users/action`,
  merge_region: `${API_URL}/${BASE_ENV}/v1/regions/merge`,
  get_region_by_code: (regionCode: string) =>
    `${API_URL}/${BASE_ENV}/v1/regions/${regionCode}`,
  get_region_branches: (regionCode: string) =>
    `${API_URL}/${BASE_ENV}/v1/regions/branches?regionCode=${regionCode}`,
  get_branch: `${API_URL}/${BASE_ENV}/v1/branches`,
  get_branch_by_code: (branchCode: string) =>
    `${API_URL}/${BASE_ENV}/v1/branches/${branchCode}`,
  get_branch_track_status: (workflowId: string) =>
    `${API_URL}/${BASE_ENV}/v1/branches/track-status/${workflowId}`,
  create_branch: `${API_URL}/${BASE_ENV}/v1/branches`,
  modify_branch: `${API_URL}/${BASE_ENV}/v1/branches`,
  deactivate_branch: `${API_URL}/${BASE_ENV}/v1/branches`,
  merge_branch: `${API_URL}/${BASE_ENV}/v1/branches/merge`,
  transfer_branch: `${API_URL}/${BASE_ENV}/v1/branches/transfer`,
  get_approved_branches: (regionName: string) =>
    `${API_URL}/${BASE_ENV}/v1/branch/approved/${regionName}`,
  get_user_address: `${API_URL}/${BASE_ENV}/v1/users/address`,
  get_user_roles: `${API_URL}/${BASE_ENV}/v1/users/roles`,
  get_pending_user: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/user-workflow`,
  approval_reject_user: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/user-workflow`,
  // get_all_user:`${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/user/getAll`,
  get_all_user: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/user/fetch-all`,
  // My-Task SubUser Management
  get_my_task_region: `${API_URL}/${BASE_ENV}/v1/region-workflows`,
  get_my_task_branch: `${API_URL}/${BASE_ENV}/v1/branch-workflows`,
  get_my_task_user: `${API_URL}/${BASE_ENV}/v1/user-workflows`,
  get_sub_users_workflow_pending_requests: `${API_URL}/${BASE_ENV}/v1/sub-users-workflow/pending-requests`,
  get_my_task_user_detail: (userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/user-workflows/pending/${userId}`,
  get_my_task_user_profile: `${API_URL}/${BASE_ENV}/v1/user-profile`,
  update_my_task_user_profile: `${API_URL}/${BASE_ENV}/v1/user-profile`,
  get_my_task_user_status: (userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/user-workflows/${userId}`,
  get_my_task_region_by_workflow: (workFlowId: string) =>
    `${API_URL}/${BASE_ENV}/v1/regions/track-status/${workFlowId}`,
  approve_region_workflow: (workflowId: string, userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/region-workflows/${workflowId}/approve?userId=${userId}`,
  reject_region_workflow: (workflowId: string, userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/region-workflows/${workflowId}/reject?userId=${userId}`,
  get_my_task_branch_by_workflow: (workFlowId: string) =>
    `${API_URL}/${BASE_ENV}/v1/branch-workflows/${workFlowId}`,
  get_my_task_branch_by_code: (workFlowId: string) =>
    `${API_URL}/${BASE_ENV}/v1/branch/${workFlowId}`,

  // Masters
  MASTERS: `${API_DROPDOWN_URL}/api/dropdown/`,
  // CONTRIES: `${API_DROPDOWN_URL}/api/v1/geography/all`,
  CONTRIES: `${API_DROPDOWN_URL}/api/masters/address`,
  GEO_COUNTRIES: `${API_DROPDOWN_URL}/api/v1/geography/countries`,

  // Applications
  preview_document: (applicationId: number | string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${applicationId}/preview`,
  entity_details: (appId: number | string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${appId}/entity-details`,
  SUBMIT_ADDRESS: (appId: number | string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${appId}/address-details`,
  HEAD_INSTITUTION_SUBMIT: (appId: number | string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${appId}/head-of-institution-details`,
  SUBMIT_NODAL_OFFICER_DETAILS: (appId: number | string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${appId}/nodal-officer-details`,
  SUBMIT_ADMIN_OFFICERS: (applicationId: number | string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${applicationId}/institutional-admin-details`,
  SUBMIT_APPLICATION: (id: string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${id}/submit`,
  INITIATE_ESIGN: (id: number) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${id}/esign-initiate`,
  GENERATE_PDF: (id: number) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/applications/${id}/generate-pdf`,

  // CKYC
  CKYC_DETAILS_HOI: (ckycNo: string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/re/ckyc/${ckycNo}/get-ckyc-details`,
  CKYC_DETAILS: `${API_URL_REINITILIZE}/${BASE_ENV}/v1/otp/ckyc-verify`,
  RESEND_CKYC_DETAILS: `${API_URL_REINITILIZE}/${BASE_ENV}/v1/otp/resend`,
  CKYC_VERIFIED: `${API_URL_REINITILIZE}/${BASE_ENV}/v1/otp/ckyc-validate-otp`,

  // ckyc Admin URL
  CKYC_DETAILS_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/ckyc-verify`,
  RESEND_CKYC_DETAILS_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/resend`,
  RESEND_OTP_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/resend`,
  CKYC_VERIFIED_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/ckyc-validate-otp`,
  OTP_SEND_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/send-otp`,
  POST_RESEND_OTP_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/resend`,
  POST_VALIDATE_OTP: `${API_URL}/${BASE_ENV}/v1/otp/validate`,
  POST_VALIDATE_OTP_ADMIN: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/otp/validate`,

  //updateaddress
  update_address_get: `${API_URL}/${BASE_ENV}/v1/entity-profile`,
  update_address_put: `${API_URL}/${BASE_ENV}/v1/entity-profile/hoi-details`,
  update_entity_profile_address_put: `${API_URL}/${BASE_ENV}/v1/entity-profile/address-details`,
  update_nodal_officer_put: `${API_URL}/${BASE_ENV}/v1/entity-profile/change/nodal-officer`,
  update_address_get_report_entity: `${API_URL}/${BASE_ENV}/v1/entity-profile`,
  update_address_put_report_entity: `${API_URL}/${BASE_ENV}/v1/entity-profile/address-details`,
  get_entity_details: `${API_URL}/${BASE_ENV}/v1/entity-profile/entity-details`,
  update_entity: `${API_URL}/${BASE_ENV}/v1/entity-profile`,

  update_institute_admin_post: `${API_URL}/${BASE_ENV}/v1/entity-profile/change/iau`,
  update_generate_pdf: (id: string) =>
    `${API_URL}/${BASE_ENV}/v1/entity-profile/generate-pdf?updateRequestId=${id}`,
  update_initiate_esign: (id: string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/entity-profile/esign-application?updateRequestId=${id}`,
  submit_application_update: (id: string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/entity-profile-workflow/initiate-update?updateRequestId=${id}`,

  // Re Management
  ENTITIES_DETAILS: (reId: string) =>
    `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai/re-management/workflow/entities/${reId}/details`,

  UPDATE_OFFICERS: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai-initiate/re/update-officers`,

  RE_LIST: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai/re-management/workflow/entities/list`,

  ADMIN_CALLBACK: (entityId: string) =>
    `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai/re-management/workflow/entities/${entityId}/details`,

  DEACTIVATE_RE: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai-initiate/re/deactivate`,

  SUSPEND_RE: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai-initiate/re/suspend`,

  REVOKE_SUSPEND_RE: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/cersai-initiate/re/revoke-suspension`,

  // Update Entity Profile
  get_application: `${API_URL}/${BASE_ENV}/v1/entity-profile-workflow`,
  update_entity_action: `${API_URL}/${BASE_ENV}/v1/entity-profile-workflow/action`,
  get_previous_version: (updateRequestId: string) =>
    `${API_URL}/${BASE_ENV}/v1/entity-profile/previous-version?updateRequestId=${updateRequestId}`,

  // Dynamic Form Fields
  post_sign_up: `${API_URL}/api/v1/entity-profile/signup`,
  get_signup_form_fields: `${CMS_URL}/api/forms/signup/fields`,
  get_form_fields: `${CMS_URL}/api/forms/RE_entityProfile/fields?is_group=true`,

  // Entity Profile Registration
  submit_entity_profile: `${API_URL}/re/api/v1/registration/entityDetails/RE_entityProfile`,
  submit_address_details: `${API_URL}/${BASE_ENV}/v1/registration/addresses/RE_addressDetails`,
  submit_head_of_institution: `${API_URL}/${BASE_ENV}/v1/registration/hoi/RE_hoi`,
  submit_nodal_officer: `${API_URL}/${BASE_ENV}/v1/registration/nodalOfficer/RE_nodal`,
  submit_admin_user_details: `${API_URL}/${BASE_ENV}/v1/registration/institutionalAdminUser/RE_iau`,
  get_step_data: `${API_URL}/re/api/v1/registration/step-data`,
  get_workflow_data: `${API_URL}/${BASE_ENV}/v1/registration`,
  fetch_document: `${API_URL}/re/api/v1/registration/fetch-document`,
  delete_document: `${API_URL}/${BASE_ENV}/v1/registration/delete-document`,
  generate_registration_pdf: `${API_URL}/${BASE_ENV}/v1/registration/pdf`,
  esign_registration: `${API_URL}/${BASE_ENV}/v1/registration/esign`,
  get_address_details_fields: `${CMS_URL}/api/forms/RE_addressDetails/fields?is_group=true`,
  get_head_of_institution_fields: `${CMS_URL}/api/forms/RE_hoi/fields?is_group=true`,
  get_nodal_officer_fields: `${CMS_URL}/api/forms/RE_nodal/fields?is_group=true`,
  get_admin_user_details_fields: `${CMS_URL}/api/forms/RE_iau/fields?is_group=true`,
  get_form_preview_fields: `${CMS_URL}/api/forms/RE_formPreview/fields?is_group=true`,
  get_track_status_form_fields: `${CMS_URL}/api/forms/RE_trackStatus/fields?is_group=true`,
  get_steps_data: `${CMS_URL}/api/forms/config/registrations`,
  submit_final_registration: `${API_URL}/${BASE_ENV}/v1/registration/submission`,

  post_validate_otp: `${API_URL}/${BASE_ENV}/v1/otp/validate`,
  post_login: `${API_ADMIN_BASE_URL}/${BASE_ENV}/api/v2/auth/login`,
  auth_verify_user: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/auth/verify-user`,
  forgot_user_id_new: `${API_ADMIN_BASE_URL}/${BASE_ENV}/v1/auth/forgot-userId`,
  validate_otp_user_management: `${API_URL}/${BASE_ENV}/v1/otp/validate`,

  REINITIALIZE: `${API_URL}/re/api/v1/registration/initialize`,
  get_user_info: `${API_ADMIN_BASE_URL}/${BASE_ENV}/api/v1/user/info`,
  user_login: `${API_ADMIN_BASE_URL}/${BASE_ENV}/api/v2/auth/token`,

  post_password_dsc_setup: `${API_ADMIN_BASE_URL}/api/v1/auth/password-dsc-setup`,
  validate_activate_token: `${API_ADMIN_BASE_URL}/api/v1/auth/validate/password-setup-link`,
  //validate_activate_token: `${API_URL}/${BASE_ENV}/v1/auth/validate-activate-token`,

  update_entity_form_fields: `${CMS_URL}/api/forms/RE_entityProfile/fields?is_group=true`,
  update_address_form_fields: `${CMS_URL}/api/forms/RE_addressDetails/fields?is_group=true`,
  update_hoi_form_fields: `${CMS_URL}/api/forms/RE_hoi/fields?is_group=true`,
  update_nodal_officer_form_fields: `${CMS_URL}/api/forms/RE_nodal/fields?is_group=true`,
  update_admin_user_form_fields: `${CMS_URL}/api/forms/RE_iau/fields?is_group=true`,
  update_form_preivew_form_fields: `${CMS_URL}/api/forms/RE_formPreview/fields?is_group=true`,

  // Function to get user details form fields based on group membership
  getUserDetailsFormFields: (groupMembership?: string | string[]) => {
    const isInstitutionalAdmin = Array.isArray(groupMembership)
      ? groupMembership.includes(USER_ROLES.INSTITUTIONAL_ADMIN_USER)
      : groupMembership === USER_ROLES.INSTITUTIONAL_ADMIN_USER;

    const formType = isInstitutionalAdmin ? 'RE_iau' : 'RE_nodal';
    return `${CMS_URL}/api/forms/${formType}/fields?is_group=true`;
  },
  // Deprecated: kept for backward compatibility
  update_user_details_form_preivew_form_fields: `${CMS_URL}/api/forms/RE_nodal/fields?is_group=true`,
  // Update Profile APIs
  submit_update_entity_profile: `${API_URL}/${BASE_ENV}/v1/update-profile/entityDetails/RE_entityProfile`,
  submit_update_address_details: `${API_URL}/${BASE_ENV}/v1/update-profile/addresses/RE_addressDetails`,
  submit_update_hoi_details: `${API_URL}/${BASE_ENV}/v1/update-profile/hoi/RE_hoi`,
  submit_update_nodal_officer_details: `${API_URL}/${BASE_ENV}/v1/update-profile/nodalOfficer/RE_nodal`,
  submit_update_admin_user_details: `${API_URL}/${BASE_ENV}/v1/update-profile/institutionalAdminUser/RE_iau`,
  get_update_step_data: `${API_URL}/${BASE_ENV}/v1/registration/step-data`,
  update_profile_generate_pdf: `${API_URL}/${BASE_ENV}/v1/update-profile/pdf`,
  get_update_steps_data: `${CMS_URL}/api/forms/config/registrations`,
  //update_profile_submission: `${CMS_URL}/${BASE_ENV}/v1/update-profile/submission`,
  update_profile_submission: `${API_URL}/${BASE_ENV}/v1/update-profile/submission`,
  update_user_profile_submit: `${API_URL}/${BASE_ENV}/v1/update-user-profile`,

  fetch_document_stream: (documentId: string) =>
    `${API_URL}/${BASE_ENV}/v1/registration/fetch-document/stream/${documentId}`,
  update_profile_esign: (workflowId: string) =>
    `${API_URL}/${BASE_ENV}/v1/update-profile/esign?workflowId=${workflowId}`,

  // User Profile Update APIs
  submit_update_user_profile: `${API_URL}/${BASE_ENV}/v1/update-user-profile`,
  user_profile_update_esign: (workflowId: string) =>
    `${API_URL}/${BASE_ENV}/v1/update-user-profile/esign?workflowId=${workflowId}`,

  search_registrations: `${API_URL}/${BASE_ENV}/v1/registrations/search`,
  search_sub_registrations: `${API_URL}/${BASE_ENV}/v1/sub-users/fetch-all`,
  update_profile_track_status_userdetails: (
    workflowId: string,
    userId: string
  ) =>
    `${API_URL}/${BASE_ENV}/v1/update-user-profile/track-status/${workflowId}?userId=${userId}`,

  // Entity Profile Registration
  // submit_entity_profile: `${API_URL}/${BASE_ENV}/v1/registration/entityDetails/RE_entityProfile`,

  //dashboard admin
  dashboardTaskCount: `${API_ADMIN_BASE_URL}/api/v1/dashboard`,
  dashboardSubModuleCount: (section: string) =>
    `${API_ADMIN_BASE_URL}/api/v1/dashboard/parents/${section}/sub-modules`,
  get_dsc_details: (userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/dsc/profile/${userId}`,
  upload_dsc: `${API_URL}/${BASE_ENV}/v1/dsc/update`,
  delete_dsc: (userId: string) =>
    `${API_URL}/${BASE_ENV}/v1/dsc/profile/${userId}`,
  // Submit not required – kept for backward-compatibility
  submit_dsc: `${API_URL}/${BASE_ENV}/v1/dsc/update`,

  track_status_update: (id: string) =>
    `${API_URL_REINITILIZE}/${BASE_ENV}/v1/update-user-profile/track-status?userId=${id}`,

  // IP Whitelisting
  IP_WHITELISTING: `${API_ADMIN_BASE_URL}/api/v1/ip-whitelisting`,
  IP_WHITELISTING_TRACK_STATUS: `${API_ADMIN_BASE_URL}/api/v1/ip-whitelisting/workflow/track-status`,
  IP_WHITELISTING_RE_LIST: `${API_ADMIN_BASE_URL}/api/v1/ip-whitelisting/reporting-entity-list-lite`,
  IP_WHITELISTING_STATUS_UPDATE: `${API_ADMIN_BASE_URL}/api/v1/ip-whitelisting/block-unblock`,

  // User Profile Previous Version
  user_profile_previous_version: `${API_ADMIN_BASE_URL}/api/v1/re-user-profile-workflow/previous-version`,
};
// Toast error messages
export const toastErrorMessages = {
  unauthorizedErrorMessage: 'Unauthorized access, token might be invalid',
  enterPhoneNumberErrorMessage: 'Please enter phone number',
  enterValidPhoneNumberErrorMessage: 'Please enter a valid phone number',
  somethingWentWrongErrorMessage: 'Something went wrong..',
};

export const userRoleConstants = {
  Nodal_Officer: '/Nodal_Officer',
  Institutional_Admin_User: '/Institutional_Admin_User',
  Institutional_Branch_User: '/Institutional_Branch_User',
  Institutional_Regional_Admin: '/Institutional_Regional_Admin',
  Institutional_Regional_User: '/Institutional_Regional_User',
  Institutional_User: '/Institutional_User',
  Operational_User: '/Operational_User',
  Super_Admin_User: '/Super_Admin_User',
};
