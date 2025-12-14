// types/branch.ts - Branch types for listing and management

export interface Branch {
  branchCode: string;
  branchName: string;
  address: string | null;
  regionCode: string | null;
  srNo: number;
  status: string;
  activity?: string;
  submittedOn?: string;
  submittedBy?: string;
  lastUpdatedOn?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  id?: string | number;
  workflowId?: string;
  name?: string;
  code?: string;
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

export interface BranchSuccessResponse {
  success: true;
  message: string;
  data: {
    content: Branch[];
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

export interface BranchErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type BranchApiResponse = BranchSuccessResponse | BranchErrorResponse;

export interface BranchState {
  loading: boolean;
  branches: Branch[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
