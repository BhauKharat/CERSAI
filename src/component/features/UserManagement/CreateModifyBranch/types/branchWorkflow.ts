// types/branchWorkflow.ts - Branch workflow types for track status

export interface BranchWorkflow {
  workflowId: string;
  branchName: string;
  branchCode: string;
  regionName: string;
  activity: string;
  status: string;
  submittedBy: string;
  submittedOn: string;
  actionOn: string;
}

export interface BranchWorkflowSuccessResponse {
  success: true;
  message: string;
  data: {
    content: BranchWorkflow[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: Array<{
        direction: string;
        property: string;
        ignoreCase: boolean;
        nullHandling: string;
        ascending: boolean;
        descending: boolean;
      }>;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: Array<{
      direction: string;
      property: string;
      ignoreCase: boolean;
      nullHandling: string;
      ascending: boolean;
      descending: boolean;
    }>;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}

export interface BranchWorkflowErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type BranchWorkflowApiResponse =
  | BranchWorkflowSuccessResponse
  | BranchWorkflowErrorResponse;

export interface BranchWorkflowState {
  loading: boolean;
  workflows: BranchWorkflow[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
