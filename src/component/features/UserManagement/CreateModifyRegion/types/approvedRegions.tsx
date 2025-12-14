// Types for approved regions API
export interface ApprovedRegion {
  regionCode: string;
  regionName: string;
}

export interface ApprovedRegionsSuccessResponse {
  success: true;
  data: ApprovedRegion[];
}

export interface ApprovedRegionsErrorResponse {
  success: false;
  message: string;
  data: {
    errorMessage: string;
    errorCode: string;
  };
}

export interface ApprovedRegionsState {
  loading: boolean;
  data: ApprovedRegion[];
  error: string | null;
}
