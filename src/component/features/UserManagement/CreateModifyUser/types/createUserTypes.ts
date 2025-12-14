// Create User Request and Response Types

export interface CreateUserRequest {
  role: string;
  citizenship: string;
  ckycNumber: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  designation: string;
  email: string;
  countryCode: string;
  mobile: string;
  proofOfIdentity: string;
  proofOfIdentityNumber: string;
  dob: string;
  gender: string;
  employeeCode: string;
  regionCode?: string;
  branchCode?: string;
  sameAsRegisteredAddress?: string;
}

export interface CreateUserSuccessResponse {
  success: true;
  message: string;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus: string;
  };
}

export interface CreateUserErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface CreateUserState {
  loading: boolean;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus: string;
  } | null;
  error: string | null;
}
