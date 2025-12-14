// Modify User Request and Response Types

export interface ModifyUserRequest {
  userId?: string; // Will be added in the slice before sending
  role?: string; // Optional - not sent in modify user API payload
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

export interface ModifyUserSuccessResponse {
  success: true;
  message: string;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus: string;
  };
}

export interface ModifyUserErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface ModifyUserState {
  loading: boolean;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus: string;
    message: string;
  } | null;
  error: string | null;
}
