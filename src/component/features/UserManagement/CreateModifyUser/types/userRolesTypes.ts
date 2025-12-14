// Types for user roles API

export interface UserRole {
  roleFullForm: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRolesSuccessResponse {
  success?: true;
  message?: string;
  data: UserRole[];
}

export interface UserRolesErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export interface UserRolesState {
  loading: boolean;
  data: UserRole[];
  error: string | null;
}
