/**
 * Types for User Profile Update Approval Flow
 * Used by CERSAI Approver-I and Approver-II for reviewing and approving user profile updates
 */

// ============================================
// API Response Wrapper Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================
// Pending Approvals List Types
// ============================================

export interface UserProfilePendingApprovalItem {
  srNo: number;
  workflowId: string;
  workflowType: string;
  profileType: string;
  requestorUserId: string;
  requestorName: string;
  requestorUserType: string;
  requestorUserTypeDisplay: string;
  fiCode: string;
  institutionName: string;
  status: string;
  displayStatus: string;
  approvalLevel: number;
  submittedOn: string;
  submittedBy: string;
  submittedByName: string;
  acknowledgementNo: string;
}

export interface UserProfilePendingApprovalsData {
  pendingApprovals: UserProfilePendingApprovalItem[];
  pagination: PaginationInfo;
}

export interface UserProfilePendingApprovalsResponse {
  success: boolean;
  message: string;
  data: UserProfilePendingApprovalsData;
}

// Query parameters for fetching pending approvals
export interface UserProfilePendingApprovalsParams {
  approverId: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | boolean;
}

// ============================================
// Workflow Details Types
// ============================================

export interface UserProfileUpdateData {
  // Nodal Officer fields
  noFirstName?: string;
  noMiddleName?: string;
  noLastName?: string;
  noEmail?: string;
  noCountryCode?: string;
  noNobileNumber?: string;
  mobileNumber?: string;
  noTitle?: string;
  noCitizenship?: string;
  noCkycNumber?: string;
  noDesignation?: string;
  noGender?: string;
  noLandlineNumber?: string;
  noProofOfIdentity?: string;
  noProofOfIdentityNumber?: string;
  noDob?: string;
  noOfficeAddress?: boolean | string;
  noBoardResoluationDate?: string;
  noRegisterCountry?: string;
  noRegisterState?: string;
  noRegisterCity?: string;
  noRegisterDigipin?: string;
  noAddresLine1?: string;
  noRegisterDistrict?: string;
  noEmployCode?: string;

  // IAU (Institutional Admin User) fields
  iauDob1?: string;
  iauEmail1?: string;
  iauTitle1?: string;
  iauGender1?: string;
  iauFirstName1?: string;
  iauMiddleName1?: string;
  iauLastName1?: string;
  iauCkycNumber1?: string;
  iauEmployCode1?: string;
  iauCitizenship1?: string;
  iauCountryCode1?: string;
  iauDesignation1?: string;
  iauMobileNumber1?: string;
  iauLandlineNumber1?: string;
  iauOfficeAddress1?: string;
  iauProofOfIdentity1?: string;
  iauProofOfIdentityNumber1?: string;
  iauAuthorizationLetter1?: string;
  iauDateOfAuthorization1?: string;
  iauAddressLineOne1?: string;
  iauAddressLineTwo1?: string;
  iauCountry1?: string;
  iauState1?: string;
  iauDistrict1?: string;
  iauCity1?: string;
  iauPincode1?: string;
  iauDscId1?: string;
  iauActive1?: string;
  iauKeyCloakUserId1?: string;
  iauWorkflowStatus1?: string;
  iauOperationalStatus1?: string;

  // Sub-user fields
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  designation?: string;
  email?: string;
  countryCode?: string;
  mobile?: string;
  employeeCode?: string;
  proofOfIdentity?: string;
  proofOfIdentityNumber?: string;
  ckycNumber?: string;
  citizenship?: string;

  // Allow additional dynamic fields
  [key: string]: string | boolean | undefined;
}

export interface ProfileUpdateInitiated {
  userId: string;
  updateData: UserProfileUpdateData;
  documentIds: string[];
  changedFields?: string[];
}

export interface ApplicationEsign {
  declarationDate: number[];
  declarationPlace: string;
  acknowledgementNo: string;
  declarationAccepted: boolean;
}

export interface SubmissionInfo {
  submittedAt: string;
  submittedBy: string;
  pendingApproverRole?: string;
  requiresCersaiApproval?: boolean;
  finalSubmission?: boolean;
}

export interface WorkflowPayload {
  submission?: SubmissionInfo;
  SUBMISSION?: SubmissionInfo;
  application_esign?: ApplicationEsign;
  profile_update_initiated?: ProfileUpdateInitiated;
}

export interface WorkflowMetadata {
  fiCode: string;
  userId: string;
  userType: string;
  initiatedBy: string;
  submittedBy: string;
  submittedOn: string;
  workflowType: string;
  requestorName: string;
  acknowledgementNo: string;
  pendingApproverRole: string;
  requiresCersaiApproval: string;
}

export interface WorkflowDocument {
  fieldKey: string;
  type: string;
  id: string;
}

export interface UserProfileWorkflow {
  workflow_id: string;
  workflow_type: string;
  initiator_service: string;
  status: string;
  current_step: string;
  payload: WorkflowPayload;
  meta_data: WorkflowMetadata;
  search_tags: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  executed_steps: string[];
}

export interface UserProfileWorkflowDetailsData {
  workflow: UserProfileWorkflow;
  documents: WorkflowDocument[];
}

export interface UserProfileWorkflowDetailsResponse {
  success: boolean;
  message: string;
  data: UserProfileWorkflowDetailsData;
}

// Query parameters for fetching workflow details
export interface UserProfileWorkflowDetailsParams {
  workflowId: string;
  approverId: string;
}

// ============================================
// Approve/Reject Action Types
// ============================================

export interface UserProfileApproveRequest {
  remark: string;
}

export interface UserProfileApproveResponse {
  success: boolean;
  message: string;
  data: {
    workflowId: string;
    status: string;
    message: string;
    approvedBy: string;
    approvedOn: string;
  };
}

export interface UserProfileRejectRequest {
  reason: string;
}

export interface UserProfileRejectResponse {
  success: boolean;
  message: string;
  data: {
    workflowId: string;
    status: string;
    message: string;
    rejectedBy: string;
    rejectedOn: string;
    rejectionReason: string;
  };
}

// Action parameters
export interface UserProfileApproveParams {
  workflowId: string;
  userId: string;
  remark: string;
}

export interface UserProfileRejectParams {
  workflowId: string;
  userId: string;
  reason: string;
}

// ============================================
// Redux State Types
// ============================================

export interface UserProfileApprovalState {
  // Pending approvals list
  pendingApprovals: UserProfilePendingApprovalItem[];
  pagination: PaginationInfo | null;
  pendingLoading: boolean;
  pendingError: string | null;

  // Selected workflow details
  workflowDetails: UserProfileWorkflowDetailsData | null;
  detailsLoading: boolean;
  detailsError: string | null;

  // Action states
  actionLoading: boolean;
  actionError: string | null;
  actionSuccess: boolean;
  actionMessage: string | null;
}

// ============================================
// Filter/Search Types
// ============================================

export type UserProfileApprovalStatus =
  | 'ALL'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPROVED_BY_CA1'
  | 'APPROVED_BY_CA2';

export interface UserProfileApprovalFilters {
  status: UserProfileApprovalStatus;
  fromDate: string;
  toDate: string;
  searchTerm: string;
}
