export interface SubUserBranch {
  id: number;
  serialNumber: number;
  userId: string;
  userName: string;
  user_type: string;
  branchName: string;
  regionName: string;
  regionCode: string;
  status: string;
  branchCode: string;
  workflowId: string;
  activity: string;
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

export interface SubUserBranchSuccessResponse {
  success: true;
  message: string;
  data: {
    content: SubUserBranch;
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

export interface SubUserBranchErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type BranchApiResponse =
  | SubUserBranchSuccessResponse
  | SubUserBranchErrorResponse;

export interface BranchState {
  loading: boolean;
  regions: SubUserBranch[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
