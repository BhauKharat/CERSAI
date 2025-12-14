export interface SubUserRegion {
  id: number;
  serialNo: string;
  regionCode: string;
  regionName: string;
  status: string;
  activity: string;
  workflowId: string;
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

export interface SubUserRegionSuccessResponse {
  success: true;
  message: string;
  data: {
    content: SubUserRegion;
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

export interface SubUserRegionErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type RegionApiResponse =
  | SubUserRegionSuccessResponse
  | SubUserRegionErrorResponse;

export interface RegionState {
  loading: boolean;
  regions: SubUserRegion[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
