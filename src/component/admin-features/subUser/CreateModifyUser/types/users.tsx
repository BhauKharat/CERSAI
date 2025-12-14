// Types for users API
export interface ApiUser {
  srNo: number;
  userId: string;
  role: string;
  username: string;
  region: string | null;
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'PENDING';
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

export interface UsersSuccessResponse {
  content: ApiUser[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
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
  status?: 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  search?: string;
  region?: string;
}
