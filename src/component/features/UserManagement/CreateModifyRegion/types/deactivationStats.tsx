// types/deactivationStats.tsx - Types for region deactivation stats functionality

// Branch user count interface
export interface BranchUserCount {
  branchName: string;
  userCount: number;
}

// Branch interface from API response
export interface AssociatedBranch {
  branchName: string;
  branchCode: string;
  userCount: number;
}

// Deactivation stats success response
export interface DeactivationStatsSuccessResponse {
  success: true;
  message: string;
  data: {
    associatedBranches?: AssociatedBranch[];
    totalUser: number;
    totalBranchUsers: number;
    totalBranchesCount: number;
    regionUserCount: number;
    // Legacy fields for backward compatibility
    totalBranches?: number;
    totalUsers?: number;
    branchUserCount?: number;
    branchUserCounts?: BranchUserCount[];
  };
}

// Deactivation stats error response
export interface DeactivationStatsErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode?: string;
    errorMessage?: string;
    errors?: Array<{
      field: string;
      issue: string;
    }>;
  };
}

export type DeactivationStatsApiResponse =
  | DeactivationStatsSuccessResponse
  | DeactivationStatsErrorResponse;

// Deactivate region request interface
export interface DeactivateRegionRequest {
  regionCode: string;
  reason: string;
  userId: string;
}

// Deactivate region success response
export interface DeactivateRegionSuccessResponse {
  success: true;
  message: string;
  data: string; // workflowId as string
}

// Deactivate region error response
export interface DeactivateRegionErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
  error?: {
    status: number;
    type: string;
    message: string;
  };
}

export type DeactivateRegionApiResponse =
  | DeactivateRegionSuccessResponse
  | DeactivateRegionErrorResponse;

// Deactivation stats state interface
export interface DeactivationStatsState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: DeactivationStatsSuccessResponse['data'] | null;
  deactivateLoading: boolean;
  deactivateSuccess: boolean;
  deactivateError: string | null;
  deactivateData: DeactivateRegionSuccessResponse['data'] | null;
  deactivateMessage: string | null;
}
