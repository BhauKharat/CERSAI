// types/regionWorkflow.ts - Region workflow types for track status

export interface RegionWorkflow {
  workflowId: string;
  regionName: string;
  regionCode: string;
  activity: 'CREATE' | 'MODIFY' | 'DEACTIVATE';
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  submittedOn: string;
  actionOn: string;
}

export interface RegionWorkflowPageable {
  pageNumber: number;
  pageSize: number;
  sort: unknown[];
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface RegionWorkflowSuccessResponse {
  success: true;
  message: string;
  data: {
    content: RegionWorkflow[];
    pageable: RegionWorkflowPageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: unknown[];
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}

export interface RegionWorkflowErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
}

export type RegionWorkflowApiResponse =
  | RegionWorkflowSuccessResponse
  | RegionWorkflowErrorResponse;

export interface RegionWorkflowState {
  loading: boolean;
  workflows: RegionWorkflow[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
