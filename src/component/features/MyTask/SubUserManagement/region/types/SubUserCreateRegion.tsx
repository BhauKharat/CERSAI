// types/createRegion.tsx - Dedicated types for region creation functionality

// Address interface for region creation
export interface SubUserRegionAddress {
  line1: string;
  line2?: string;
  line3?: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode?: string;
  digiPin?: string;
}

// Region creation request interface
export interface SubUserCreateRegionRequest {
  regionCode: string;
  regionName: string;
  address: SubUserRegionAddress;
}

// Region modification request interface
export interface SubUserCreateRegionRequest {
  regionCode: string;
  regionName: string;
}

// Region modify request interface (excludes regionCode as it's in URL)
export interface SubUserModifyRegionRequest {
  regionName: string;
  regionCode: string;
  address?: SubUserRegionAddress;
  sourceRegionCodes?: string[];
  reportingEntity?: string;
}

// Region creation success response
export interface SubUserCreateRegionSuccessResponse {
  success: true;
  message: string;
  data: {
    reportingEntity: string;
    regionCode: string;
    regionName: string;
    structureType: string;
    targetRegionCode: string;
    sourceRegionCodes: string[];
  };
}

// Region creation error response
export interface SubUserCreateRegionErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export type CreateRegionApiResponse =
  | SubUserCreateRegionSuccessResponse
  | SubUserCreateRegionErrorResponse;

// Extended region state interface for creation functionality
export interface SubUserCreateRegionState {
  createLoading: boolean;
  createSuccess: boolean;
  createError: string | null;
  reportingEntity: string | null;
  modifyLoading: boolean;
  modifySuccess: boolean;
  modifyError: string | null;
  modifyReportingEntity: string | null;
}

export interface DeactivationDetails {
  regionName: string;
  regionCode: string;
  associatedBranches?: number;
  associatedUsers?: number;
}
