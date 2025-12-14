// Create User Request and Response Types

// export interface CreateUserRequest {
//   citizenship: string;
//   ckycNumber: string;
//   title: string;
//   firstName: string;
//   middleName?: string;
//   lastName: string;
//   designation: string;
//   emailAddress: string;
//   mobileNumber: string;
//   employeeId: string;
//   poi: string;
//   poiNumber: string;
//   dob: string;
//   gender: string;
//   userType: string;
//   regionName?: string;
//   branchName?: string;
//   sameAsRegisteredAddress?: boolean;
// }

export interface CreateUserRequest {
  user: {
    userId?: string; // Required for modify mode
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    designation: string;
    email: string; // Changed from emailId
    citizenship: string;
    ckycNumber: string | null;
    countryCode: string; // ISO country code
    mobile: string; // Changed from mobileNumber
    proofOfIdentity: string;
    proofOfIdentityNumber: string;
    dateOfBirth: string; // API uses dateOfBirth, not dob
    gender: string;
    employeeCode: string;
    role: string; // API expects 'role' field
    functionalityMapped: Record<string, string[]>; // API format: { "MY_TASK": ["RE_REGISTRATION", ...], ... }
  };
  address: {
    line1?: string;
    line2?: string;
    line3?: string;
    country?: string; // ISO country code in address
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
    digipin?: string;
  };
}

export interface CreateUserSuccessResponse {
  data: {
    workflowId: string;
    workflowStatus: string;
    operationalStatus: string;
    userId: string;
    actionType: string;
    performedBy: string;
    performedAt: string;
    message: string;
  };
}

export interface CreateUserErrorResponse {
  success?: false;
  message?: string;
  data?: {
    errorCode?: string;
    errorMessage?: string;
  };
  error?: {
    status?: number;
    code?: string;
    type?: string;
    message?: string;
    timestamp?: string;
    errors?: ValidationErrors[];
  };
}

export interface ValidationErrors {
  field: string;
  message: string;
}

export interface CreateUserState {
  loading: boolean;
  data: {
    workflowId: string;
    workflowStatus: string;
    operationalStatus: string;
    userId: string;
    actionType: string;
    performedBy: string;
    performedAt: string;
    message: string;
  } | null;
  error: string | null;
}
