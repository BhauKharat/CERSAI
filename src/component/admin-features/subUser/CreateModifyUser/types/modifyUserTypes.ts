// Modify User Request and Response Types

export interface ModifyUserRequest {
  citizenship: string;
  ckycNumber: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  designation: string;
  emailAddress: string;
  mobileNumber: string;
  employeeId: string;
  poi: string;
  poiNumber: string;
  dob: string;
  gender: string;
  userType: string;
  regionName?: string;
  branchName?: string;
  sameAsRegisteredAddress?: boolean;
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
  } | null;
  error: string | null;
}
