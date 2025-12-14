// features/auth/authTypes.ts

import { ResponseReinitialize } from './responseReinitialize';
import { ReinitializeResponse } from './reinitializeResponse';

export interface LoginRequest {
  userId?: string;
  username?: string;
  password?: string;
}

export interface UserDetails {
  id?: string;
  email?: string;
  title?: string;
  firstName?: string | null;
  middleName?: string;
  lastName?: string | null;
  ckycNumber?: string;
  citizenship?: string;
  countryCode?: string;
  mobileNo?: string;
  role?: string | null;
  userId?: string | null;
  given_name?: string | null;
  ckycNo?: string;
  is_initialization_complete?: boolean | null;
  registered?: boolean | null;
  approved?: boolean | null;
  approvedData?: string | null;
  workflowId?: string | null;
}

// Updated to match actual API response structure
export interface TokenDetails {
  scope: string;
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  refresh_token: string;
  session_state: string;
  'not-before-policy': number;
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  httpCode?: number;
  httpStatus?: string;
  localDateTime?: string;
  data?: string | null;
}

export interface AuthState {
  loading?: boolean;
  authToken?: string | null;
  success?: boolean;
  refreshToken?: string | null; // Add refresh token
  userDetails?: UserDetails | null;
  groupMembership?: string[];
  error?: string | null;
  errorLogin?: string | null;
  dscVerificationMessage?: boolean;
  otpIdentifier?: string | null;
  userIdMessage?: string | null;
  successMessage?: string | null;
  remainingLoginAttempts?: number | null;
  setPasswordDscLoading?: boolean;
  setPasswordDscError?: string | null;
  setPasswordDscSuccess?: boolean;
  forgotPasswordUserId?: string | null;
  forgotPassworderror?: string | null;
  forgotUserIderror?: string | null;
  verifyDscerror?: string | null;
  reinitializeLoading?: boolean;
  reinitializeError?: string | null;
  reinitializeData?: ReinitializeResponse | null;
  reinitializeDataResponse?: ResponseReinitialize | null;
  initialized?: boolean;
  existingDraft?: boolean;
  modificationStatus?: string | null;
  modifiableFields?: Record<string, string[]>;
  isEsigned?: boolean;
  adminUserDetailsLoading?: boolean;
  adminUserDetailsError?: string | null;
  loginUserId?: string | null;
  workflowId?: string | null;
  adminUserDetails?: AdminUserDetailsResponse | null;
  verifyUserLoading?: boolean;
  verifyUserError?: string | null;
  isUserVerified?: boolean;
  sendForgotUserIdLoading?: boolean;
  sendForgotUserIdError?: string | null;
  forgotUserIdResponse?: {
    maskedEmail?: string;
    maskedMobile?: string;
    message?: string;
  } | null;
}

export interface VerifyDscRequest {
  dscCertificate: string;
  username?: string;
  userId?: string;
  password: string;
}

export interface VerifyDscResponse {
  success?: boolean;
  message?: string;
  httpCode?: number;
  httpStatus?: string;
  localDateTime?: string;
  data?: {
    accessToken?: string | null;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    refreshExpiresIn?: number;
    userId?: string | null;
    emailId?: string;
    role?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    family_name?: string | null;
    given_name?: string | null;
    citizenship?: string | null;
    loginTime?: string;
    message?: string;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: {
    otp_identifier: string;
    otpIdentifier?: string;
    mobile?: string;
    email?: string;
    maskedMobile?: string;
    maskedEmail?: string;
  };
}
export interface OTPResponseResponse {
  success: boolean;
  message: string;
  data: {
    otpIdentifier: string;
    maskedEmail?: string;
    maskedMobile?: string;
    expiryMinutes?: string;
    message?: string;
  };
}

export interface AdminUserDetailsRequest {
  userId: string;
}

export interface AdminUserDetailsResponse {
  success: boolean;
  message: string;
  type: string;
  timeStamp: string;
  data: {
    enabled: boolean;
    firstName: string;
    lastName: string;
    email: string;
    attributes: {
      userDetails: {
        approved: string;
        countryCode: string;
        citizenship: string;
        mobile: string;
        isInitializationComplete: boolean | null;
        registered: boolean | null;
        correlationId: string;
        emailId: string;
        middleName: string;
        userType: string;
        title: string;
        userId: string;
        ckycNo: string;
      };
      email: string;
      enabled: boolean;
      firstName: string;
      lastName: string;
      username: string;
    };
    groups: string[];
    username: string;
  };
}
