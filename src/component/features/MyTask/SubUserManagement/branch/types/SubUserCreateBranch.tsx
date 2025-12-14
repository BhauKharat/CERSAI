// types/createBranch.tsx - Dedicated types for region creation functionality

// Address interface for region creation
export interface SubUserBranchAddress {
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

// Branch creation request interface
export interface SubUserCreateBranchRequest {
  branchCode: string;
  branchName: string;
  address: SubUserBranchAddress;
}

// Branch modify request interface (excludes regionCode as it's in URL)
export interface SubUserModifyBranchRequest {
  branchName: string;
  branchCode: string;
  region: string;
  sourceBranchCodes: string[];
  address?: SubUserBranchAddress;
}

// Branch creation success response
export interface SubUserCreateBranchSuccessResponse {
  success: true;
  message: string;
  data: {
    workflowId: string;
    regionCode: string;
    regionName: string;
    status: string;
  };
}

// Branch creation error response
export interface SubUserCreateBranchErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export type CreateBranchApiResponse =
  | SubUserCreateBranchSuccessResponse
  | SubUserCreateBranchErrorResponse;

// Extended region state interface for creation functionality
export interface SubUserCreateBranchState {
  createLoading: boolean;
  createSuccess: boolean;
  createError: string | null;
  workflowId: string | null;
  modifyLoading: boolean;
  modifySuccess: boolean;
  modifyError: string | null;
  modifyWorkflowId: string | null;
}

export interface DeactivationDetails {
  regionName: string;
  regionCode: string;
  associatedBranches?: number;
  associatedUsers?: number;
}

export interface BranchDeactivationDetails {
  branchCode: string;
  branchName: string;
  remark?: string;
  associatedBranches?: number;
  associatedUsers?: number;
  deactivationInitiatedBy?: string;
  deactivationInitiatedOn?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  district?: string;
  city?: string;
  pinCode?: string;
  alternatePinCode?: string;
  digipin?: string;
}

export interface BranchMergerDetails {
  branchCode: string;
  branchName: string;
  associatedBranches?: number;
  associatedUsers?: number;
}

// TypeScript interfaces for geography hierarchy
export interface District {
  districtCode: string;
  districtName: string;
}

export interface State {
  stateCode: string;
  stateName: string;
  districts: District[];
}

export interface Country {
  countryCode: string;
  countryName: string;
  states: State[];
}
