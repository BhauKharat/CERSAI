// Single User Address Type
export interface SubUserUserAddress {
  id: string | null;
  line1: string;
  line2: string;
  line3: string | null;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode: string | null;
  digiPin: string | null;
}

// Single User Data Type
export interface SubUserSingleUserData {
  branchCode: string;
  branchName: string;
  regionName?: string;
  regionCode?: string;
  userType?: string;
  citizenship?: string;
  ckycNumber?: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  emailAddress?: string;
  gender?: string;
  countryCode?: string;
  mobileNumber?: string;
  dob?: string;
  poi?: string;
  poiNumber?: string;
  employeeId?: string;
  address: SubUserUserAddress;
}

// Single User Success Response
export interface SubUserSingleUserSuccessResponse {
  success: true;
  message: string;
  data: SubUserSingleUserData;
}

// Single User Error Data
export interface SubUserSingleUserErrorData {
  errorCode: string;
  errorMessage: string;
}

// Single User Error Response
export interface SubUserSingleUserErrorResponse {
  success: false;
  message: string;
  data: SubUserSingleUserErrorData;
}

// Redux State for Single User
export interface SubUserSingleUserState {
  loading: boolean;
  data: SubUserSingleUserData | null;
  error: string | null;
}

export interface StatusSubUserUserType {
  type: string;
  reason?: string;
}

// Paginated response structure for fetch-all API
export interface PaginatedUserResponse {
  success: boolean;
  message?: string;
  data: {
    content: Array<Record<string, unknown>>;
    totalElements?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}
