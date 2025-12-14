/* eslint-disable @typescript-eslint/no-explicit-any */
// Fetch User Request and Response Types

export interface FetchUserRequest {
  userId: string;
}

export interface FetchUserData {
  userType?: string;
  userId?: string;
  regionName?: string;
  region?: string;
  branchName?: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailAddress?: string;
  email?: string;
  mobileNumber?: string;
  mobile?: string;
  landlineNumber?: string;
  designation?: string;
  employeeId?: string;
  citizenship: string;
  ckycNo?: string;
  ckycNumber?: string;
  gender?: string;
  poi?: string;
  poiNumber?: string;
  dob?: string;
  countryCode?: string;
  address?: unknown;
  keycloakUserId?: string;
  operationalStatus?: string;
}

export interface PaginatedFetchUserData {
  content: FetchUserData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FetchUserSuccessResponse {
  success?: true;
  message?: string;
  data: PaginatedFetchUserData;
}

export interface FetchUserErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface FetchUserState {
  loading: boolean;
  data: FetchUserData | null;
  error: string | null;
}
