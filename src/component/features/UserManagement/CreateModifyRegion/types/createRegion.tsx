// types/createRegion.tsx - Dedicated types for region creation functionality

// Address interface for region creation
export interface RegionAddress {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state: string;
  district?: string;
  countryCode: string;
  country: string;
  pinCode: string;
  alternatePinCode?: string | null;
  digiPin?: string | null;
}

// Region creation request interface
export interface CreateRegionRequest {
  regionCode: string;
  regionName: string;
  userId: string;
  address: RegionAddress;
}

// Region modify request interface
export interface ModifyRegionRequest {
  regionCode: string;
  regionName: string;
  userId?: string;
  address: RegionAddress;
}

// Region creation success response (actual API structure)
export interface CreateRegionSuccessResponse {
  message: string;
  data: string; // This is the workflow ID
}

export interface CreateRegionSuccess {
  workflowId: string;
  regionCode: string;
  regionName: string;
  status: string;
  message?: string; // Backend success message
}

// Validation error structure
export interface ValidationError {
  status: number;
  type: string;
  message: string;
}

// Region creation error response (actual API structure)
export interface CreateRegionErrorResponse {
  message: string;
  errorMessage?: string;
  error?: ValidationError;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export type CreateRegionApiResponse =
  | CreateRegionSuccessResponse
  | CreateRegionErrorResponse;

// Extended region state interface for creation functionality
export interface CreateRegionState {
  createLoading: boolean;
  createSuccess: boolean;
  createError: string | null;
  workflowId: string | null;
  createSuccessMessage: string | null; // Backend success message
  modifyLoading: boolean;
  modifySuccess: boolean;
  modifyError: string | null;
  modifyWorkflowId: string | null;
  modifySuccessMessage: string | null; // Backend success message
}
