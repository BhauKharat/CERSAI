// Create Sub User Request and Response Types

export interface CreateSubUserRequest {
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

export interface CreateSubUserSuccessResponse {
  success: true;
  message: string;
  data: {
    userId?: string;
    workflowId: string;
    workflowStatus: string;
    operationalStatus?: string;
    actionType?: string;
    performedBy?: string;
    performedAt?: string;
    message: string;
  };
}

export interface CreateSubUserErrorResponse {
  success: false;
  message: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
}

export interface CreateSubUserState {
  loading: boolean;
  data: {
    userId?: string;
    workflowId: string;
    workflowStatus: string;
    operationalStatus?: string;
    actionType?: string;
    performedBy?: string;
    performedAt?: string;
    message: string;
  } | null;
  error: string | null;
}
