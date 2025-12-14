// Merge Region Request Types
export interface MergeRegionRequest {
  targetRegionCode: string;
  sourceRegionCodes: string[];
  userId?: string;
}

// Merge Region Success Response Types
export interface MergeRegionSuccessResponse {
  message: string;
  data: string; // workflowId
}

// Merge Region Error Response Types
export interface MergeRegionErrorData {
  errorMessage: string;
  errorCode: string;
}

export interface MergeRegionErrorResponse {
  success: false;
  message: string;
  data?: MergeRegionErrorData;
}

// API Error Response (actual structure from API)
export interface ApiErrorResponse {
  error: {
    status: number;
    code: string;
    type: string;
    message: string;
  };
}

// Redux State Types
export interface MergeRegionState {
  loading: boolean;
  data: string | null; // workflowId
  message: string | null; // success message
  error: string | null;
}
