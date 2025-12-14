// types/userProfile.tsx - Dedicated types for user profile functionality

// Types
// interface FormDataType {
//   citizenShip?: string;
//   ckycNumber?: string;
//   title?: string;
//   firstName?: string;
//   middleName?: string;
//   lastName?: string;
//   gender?: string;
//   dateOfBirth?: string;
//   designation?: string;
//   officeAddress?: string;
//   email?: string;
//   countryCode?: string;
//   mobileNumber?: string;
//   landline?: string;
//   employeeCode?: string;
//   proofofIdentity?: string;
//   proofofIdentityNumber?: string;
//   dateofBoardAppointment?: string;
//   [key: string]: unknown;
// }

// User Profile request interface
export interface UserProfileRequest {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  designation: string;
  emailId: string;
  citizenship: string;
  ckycNumber: string;
  countryCode: string;
  mobileNumber: string;
  proofOfIdentity: string;
  proofOfIdentityNumber: string;
  dob: string;
  gender: string;
  employeeCode: string;
  role: string;
  functionalityMapped: string;
}

// User Profile success response
export interface UserProfileSuccessResponse {
  success: true;
  message: string;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus: string;
  };
}

// User Profile error response
export interface UserProfileErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export type UserProfileApiResponse =
  | UserProfileSuccessResponse
  | UserProfileErrorResponse;

// Extended region state interface for creation functionality
export interface UserProfileState {
  loading: boolean;
  data: {
    userId: string;
    workflowId: string;
    workflowStatus: string;
  } | null;
  error: string | null;
}
