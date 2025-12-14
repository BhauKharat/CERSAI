// Types for user roles API

export interface UserRolesSuccessResponse {
  success: true;
  message: string;
  data: string[];
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
  data: string[];
  error: string | null;
}
