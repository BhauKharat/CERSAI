// Types for users API
export interface ApiUser {
  srNo: number;
  userId: string;
  role: string;
  username: string;
  region: string | null;
  regionCode?: string;
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING';
  branch?: string;
  lastUpdatedOn?: string;
  lastUpdatedBy?: string;
  address?: string;
  citizenship?: string; // Add citizenship field
  workflowType?: string; // For workflow activity display
  createdAt?: string; // For submitted on display
  submittedByRole?: string; // For submitted by role
  submittedByName?: string; // For submitted by name
  workflowData?: {
    workflowId?: string;
    activity?: string;
    status?: string;
    submittedBy?: string;
    submittedOn?: string;
    [key: string]: unknown;
  }; // Complete workflow data for navigation
}

// Raw API response structure
export interface RawApiUser {
  userId: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  citizenship?: string;
  ckycNo?: string;
  countryCode?: string;
  mobile?: string;
  keycloakUserId?: string;
  userType?: string;
  roleType?: string;
  updatedBy?: string;
  updatedDate?: string;
  workflowStatus?: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING';
  operationalStatus?: string;
  region?: string;
  regionCode?: string;
  branch?: string;
  branchCode?: string;
}

export interface UsersSuccessResponse {
  data: {
    content: RawApiUser[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface UsersErrorResponse {
  success: false;
  message: string;
  data: {
    errorMessage: string;
    errorCode: string;
  };
}

export interface UsersState {
  data: ApiUser[];
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface FetchUsersParams {
  size?: number;
  page?: number;
  status?: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE';
  operationalStatus?: 'ACTIVE' | 'SUSPENDED';
  search?: string;
  searchText?: string;
  region?: string;
  branch?: string;
  userType?: string | string[];
}
