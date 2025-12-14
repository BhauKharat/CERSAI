/**
 * Types for Entity Profile Update Approval Flow
 * Used by CERSAI Approver-I and Approver-II for reviewing and approving entity profile updates
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

export interface EntityProfilePendingApprovalItem {
  workflowId: string;
  workflowType?: string;
  fiCode: string;
  institutionName?: string;
  status: string;
  submittedOn: string;
  submittedBy: string;
  acknowledgementNo: string;
  reId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntityProfilePendingApprovalsData {
  pendingApprovals: EntityProfilePendingApprovalItem[];
  pagination: PaginationInfo;
}

export interface EntityProfilePendingApprovalsResponse {
  success: boolean;
  message: string;
  data: EntityProfilePendingApprovalsData;
}

// Request body for fetching pending approvals (POST request)
export interface EntityProfilePendingApprovalsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  status?: string;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
}

// ============================================
// Workflow Details Types
// ============================================

export interface EntityProfileUpdateData {
  // Entity fields
  entityName?: string;
  entityType?: string;
  registeredAddress?: string;
  correspondenceAddress?: string;
  registrationNumber?: string;
  dateOfIncorporation?: string;
  panNumber?: string;
  gstNumber?: string;

  // Allow additional dynamic fields
  [key: string]: string | boolean | undefined;
}

export interface ProfileUpdateInitiated {
  userId: string;
  updateData: EntityProfileUpdateData;
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

export interface EntityProfileWorkflow {
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

export interface EntityProfileWorkflowDetailsData {
  workflow: EntityProfileWorkflow;
  documents: WorkflowDocument[];
}

export interface EntityProfileWorkflowDetailsResponse {
  success: boolean;
  message: string;
  data: EntityProfileWorkflowDetailsData;
}

// Query parameters for fetching workflow details
export interface EntityProfileWorkflowDetailsParams {
  workflowId: string;
}

// ============================================
// Approve/Reject Action Types
// ============================================

export interface EntityProfileApproveRequest {
  remark: string;
}

export interface EntityProfileApproveResponse {
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

export interface EntityProfileRejectRequest {
  reason: string;
}

export interface EntityProfileRejectResponse {
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
export interface EntityProfileApproveParams {
  workflowId: string;
  remark: string;
}

export interface EntityProfileRejectParams {
  workflowId: string;
  reason: string;
}

// ============================================
// Redux State Types
// ============================================

export interface EntityProfileApprovalState {
  // Pending approvals list
  pendingApprovals: EntityProfilePendingApprovalItem[];
  pagination: PaginationInfo | null;
  pendingLoading: boolean;
  pendingError: string | null;

  // Selected workflow details
  workflowDetails: EntityProfileWorkflowDetailsData | null;
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

export type EntityProfileApprovalStatus =
  | 'ALL'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPROVED_BY_CA1'
  | 'APPROVED_BY_CA2';

export interface EntityProfileApprovalFilters {
  status: EntityProfileApprovalStatus;
  fromDate: string;
  toDate: string;
  searchTerm: string;
}
