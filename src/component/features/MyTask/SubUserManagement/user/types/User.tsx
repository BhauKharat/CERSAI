export interface SubUserUser {
  id: number;
  serialNumber: number;
  userId: string;
  userName: string;
  user_type: string;
  regionName: string;
  status: string;
  activity: string;
  workflowId: string;
  role: string;
  userType: string;
  region: string;
  updatedBranch: string;
  updatedRegion: string;
  branch: string;
  branchName: string;
  submittedOn?: string;
  submittedBy?: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

export interface SubUserUserSuccessResponse {
  success: true;
  message: string;
  data: {
    content: SubUserUser[];
    activity: string;
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export interface SubUserUserErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type UserApiResponse =
  | SubUserUserSuccessResponse
  | SubUserUserErrorResponse;

export interface UserState {
  loading: boolean;
  regions: SubUserUser[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
