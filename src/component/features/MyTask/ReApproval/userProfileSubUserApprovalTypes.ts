/* eslint-disable @typescript-eslint/no-explicit-any */
// User Profile Sub User Approval types

export interface UserProfileSubUserApprovalPayload {
  approverId: string;
}

export interface UserProfileSubUserApprovalData {
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

export interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserProfileSubUserApprovalResponseData {
  pendingApprovals: UserProfileSubUserApprovalData[];
  pagination: PaginationData;
}

export interface UserProfileSubUserApprovalResponse {
  success: boolean;
  message: string;
  data: UserProfileSubUserApprovalResponseData;
}
