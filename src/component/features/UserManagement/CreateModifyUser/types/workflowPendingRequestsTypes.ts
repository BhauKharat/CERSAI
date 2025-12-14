// Workflow Pending Requests Types

export interface WorkflowFilter {
  operation: string;
  filters: {
    workflow_type?: string[];
    status?: string[];
    [key: string]: string[] | string | number | boolean | undefined;
  };
}

export interface WorkflowPendingRequestsRequest {
  filters: WorkflowFilter[];
  page: number;
  pageSize: number;
  isPendingRequestAPI: boolean;
  sortBy: string;
  sortDesc: boolean;
  search?: string;
}

export interface UserDetails {
  dob: number[];
  role: string;
  email: string;
  title: string;
  gender: string;
  mobile: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  ckycNumber: string;
  citizenship: string;
  countryCode: string;
  designation: string;
  employeeCode: string;
  proofOfIdentity: string;
  proofOfIdentityNumber: string;
  sameAsRegisteredAddress: boolean;
  regionCode?: string;
}

export interface InitiatorDetails {
  userId: string;
  historyContext: {
    email: string;
    ip: string;
    channel: string;
    authorities: Array<{
      authority: string;
      [key: string]: unknown;
    }>;
  };
  actionDateTime: string;
  actionByUserName: string;
  actionByUserRole: string;
}

export interface ApprovalWorkflow {
  approvals: Array<{
    level: number;
    userId: string;
    userName: string;
    userRole: string;
    status: string;
    actionDateTime?: string;
    remarks?: string;
    [key: string]: unknown;
  }>;
  noOfApprovals: number;
  pendingAtLevel: number;
  finalApproval: string;
  approvalStatus: string;
}

export interface ConcernedUserDetails {
  userType: string;
  username: string;
}

export interface WorkflowPayload {
  userDetails: UserDetails;
  initiatorDetails: InitiatorDetails;
  approvalWorkflow: ApprovalWorkflow;
  concernedUserDetails: ConcernedUserDetails;
}

export interface MetaData {
  role: string;
  email: string;
  ckycNo: string;
  mobile: string;
  username: string;
  lastActionBy: string;
  lastActionOn: string;
  region?: string;
  branch?: string;
  regionCode?: string;
  branchCode?: string;
  userId?: string;
  initiatedBy?: string;
  canApproveBy?: string;
}

export interface WorkflowItem {
  workflow_id: string;
  workflow_type: string;
  initiator_service: string;
  status: string;
  current_step: string;
  payload: WorkflowPayload;
  meta_data: MetaData;
  search_tags: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowPendingRequestsData {
  content: WorkflowItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface WorkflowPendingRequestsSuccessResponse {
  data: WorkflowPendingRequestsData;
}

export interface WorkflowPendingRequestsErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface WorkflowPendingRequestsState {
  loading: boolean;
  data: WorkflowItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  error: string | null;
}
