// API Response Types for Get Previous Version
import { GetApplicationData } from './getApplicationTypes';

export interface GetPreviousVersionResponse {
  success: boolean;
  message: string;
  data: GetApplicationData;
}

export interface GetPreviousVersionError {
  success: boolean;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

// Redux State Types
export interface GetPreviousVersionState {
  data: GetApplicationData | null;
  loading: boolean;
  error: string | null;
}
