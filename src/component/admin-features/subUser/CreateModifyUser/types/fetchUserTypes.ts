// Fetch User Request and Response Types

export interface FetchUserRequest {
  userId: string;
}

export interface FetchUserData {
  userType: string;
  regionName?: string;
  branchName?: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  emailAddress: string;
  mobileNumber: string;
  landlineNumber?: string;
  designation: string;
  employeeId: string;
  citizenship: string;
  ckycNumber: string;
  gender: string;
  poi: string;
  poiNumber: string;
  dob: string;
  countryCode?: string;
  address?: unknown;
}

export interface FetchUserSuccessResponse {
  success: true;
  message: string;
  data: FetchUserData;
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
