// types/createUser.tsx - Dedicated types for region creation functionality

// Address interface for region creation
export interface SubUserUserAddress {
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

// User creation request interface
export interface SubUserCreateUserRequest {
  userCode: string;
  userName: string;
  address: SubUserUserAddress;
}

// User modify request interface (excludes regionCode as it's in URL)
export interface SubUserModifyUserRequest {
  userName: string;
  userCode: string;
  address?: SubUserUserAddress;
}

// User creation success response
export interface SubUserCreateUserSuccessResponse {
  success: true;
  message: string;
  data: {
    workflowId: string;
    regionCode: string;
    regionName: string;
    status: string;
  };
}

// User creation error response
export interface SubUserCreateUserErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export type CreateUserApiResponse =
  | SubUserCreateUserSuccessResponse
  | SubUserCreateUserErrorResponse;

// Extended region state interface for creation functionality
export interface SubUserCreateUserState {
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
  associatedUseres?: number;
  associatedUsers?: number;
}

export interface UserDeactivationDetails {
  userCode: string;
  userName: string;
  associatedUseres?: number;
  associatedUsers?: number;
  userType?: string | undefined;
  userId?: string | undefined;
  region?: string | undefined;
  branch?: string | undefined;
  remark?: string | undefined;
}

export interface UserMergerDetails {
  userCode: string;
  userName: string;
  associatedUseres?: number;
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
