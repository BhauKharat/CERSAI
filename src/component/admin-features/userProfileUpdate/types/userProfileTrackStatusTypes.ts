/**
 * Types for User Profile Update Track Status
 * Used by RE users and CERSAI users to track status of user profile update applications
 */

import {
  PaginationInfo,
  WorkflowPayload,
  WorkflowDocument,
} from './userProfileApprovalTypes';

// ============================================
// Track Status List Types
// ============================================

export interface UserProfileTrackStatusItem {
  srNo: number;
  workflowId: string;
  profileType: string;
  status: string;
  displayStatus?: string;
  approvalLevel?: number;
  pendingApproverRole?: string;
  pendingApproverDisplay?: string;
  submittedOn: string;
  submittedBy: string;
  acknowledgementNo: string;
}

export interface UserProfileTrackStatusListData {
  applications: UserProfileTrackStatusItem[];
  pagination: PaginationInfo;
}

export interface UserProfileTrackStatusListResponse {
  success: boolean;
  message: string;
  data: UserProfileTrackStatusListData;
}

// Query parameters for track status list
export interface UserProfileTrackStatusListParams {
  userId: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | boolean;
}

// ============================================
// Track Status Detail Types
// ============================================

export interface UserProfileTrackStatusDetailData {
  workflowId: string;
  workflowType: string;
  status: string;
  displayStatus?: string;
  approvalLevel?: number;
  pendingApproverRole?: string;
  pendingApproverDisplay?: string;
  currentStep: string;
  createdAt?: string;
  submittedOn?: string;
  submittedBy: string;
  acknowledgementNo: string;
  payload: WorkflowPayload;
  documents: WorkflowDocument[];
  executedSteps: string[];
}

export interface UserProfileTrackStatusDetailResponse {
  success: boolean;
  message: string;
  data: UserProfileTrackStatusDetailData;
}

// Query parameters for track status detail
export interface UserProfileTrackStatusDetailParams {
  workflowId: string;
  userId: string;
}

// ============================================
// Redux State Types
// ============================================

export interface UserProfileTrackStatusState {
  // List state
  applications: UserProfileTrackStatusItem[];
  pagination: PaginationInfo | null;
  listLoading: boolean;
  listError: string | null;

  // Detail state
  detail: UserProfileTrackStatusDetailData | null;
  detailLoading: boolean;
  detailError: string | null;
}

// ============================================
// Filter Types for Track Status
// ============================================

export type TrackStatusFilterType = 'status' | 'reName';

export interface TrackStatusFilters {
  filterType: TrackStatusFilterType;
  status: string;
  fromDate: string;
  toDate: string;
  searchTerm: string;
}

// Status options for track status
export type TrackStatusOption =
  | 'ALL'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPROVAL_PENDING_LEVEL_1'
  | 'APPROVAL_PENDING_LEVEL_2';

// ============================================
// Table Column Types (for UI)
// ============================================

export interface TrackStatusTableColumn {
  id: keyof UserProfileTrackStatusItem | 'action';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

// Default columns for track status table
export const TRACK_STATUS_TABLE_COLUMNS: TrackStatusTableColumn[] = [
  {
    id: 'srNo',
    label: 'Sr.No.',
    minWidth: 70,
    align: 'center',
    sortable: false,
  },
  {
    id: 'workflowId',
    label: 'Name',
    minWidth: 150,
    align: 'left',
    sortable: true,
  },
  {
    id: 'acknowledgementNo',
    label: 'FI Code',
    minWidth: 120,
    align: 'left',
    sortable: true,
  },
  {
    id: 'profileType',
    label: 'Profile Type',
    minWidth: 100,
    align: 'center',
    sortable: true,
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 150,
    align: 'center',
    sortable: true,
  },
  {
    id: 'submittedOn',
    label: 'Submitted On',
    minWidth: 150,
    align: 'center',
    sortable: true,
  },
  {
    id: 'submittedBy',
    label: 'Submitted By',
    minWidth: 130,
    align: 'center',
    sortable: true,
  },
];
