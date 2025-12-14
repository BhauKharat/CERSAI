/* eslint-disable @typescript-eslint/no-explicit-any */
// features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthState,
  LoginRequest,
  LoginResponse,
  VerifyDscRequest,
  VerifyDscResponse,
  AdminUserDetailsRequest,
  AdminUserDetailsResponse,
} from '../types/authSliceTypes';
import { ResponseReinitialize } from '../types/responseReinitialize';
import { API_ENDPOINTS } from 'Constant';
import { Secured, AuthAPI } from '../../../../utils/HelperFunctions/api/index';
import { createSliceErrorObject } from '../../../../utils/HelperFunctions/errorHandler';
// import { tripleEncodePassword } from '../../../utils/encoding';
import {
  ForgotPasswordResponse,
  OTPResponseResponse,
} from '../types/authSliceTypes';
// import { ReinitializeAPI } from '../../../../utils/HelperFunctions/api/index';
import { jwtDecode } from 'jwt-decode';
import { CERSAIUserRoles } from 'enums/userRoles.enum';

const initialState: AuthState = {
  loading: false,
  authToken: null,
  success: false,
  refreshToken: null, // Add refresh token
  userDetails: null,
  errorLogin: null,
  dscVerificationMessage: false,
  otpIdentifier: null,
  userIdMessage: null,
  successMessage: null,
  remainingLoginAttempts: null,
  setPasswordDscLoading: false,
  setPasswordDscError: null,
  setPasswordDscSuccess: false,
  forgotPasswordUserId: null,
  forgotPassworderror: null,
  forgotUserIderror: null,
  verifyDscerror: null,
  reinitializeLoading: false,
  reinitializeError: null,
  reinitializeData: null,
  initialized: false,
  existingDraft: false,
  error: null,
  modificationStatus: null,
  modifiableFields: {},
  isEsigned: false,
  adminUserDetailsLoading: false,
  adminUserDetailsError: null,
  adminUserDetails: null,
  verifyUserLoading: false,
  verifyUserError: null,
  isUserVerified: false,
  sendForgotUserIdLoading: false,
  sendForgotUserIdError: null,
  forgotUserIdResponse: null,
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: { message: string; remainingAttempts?: number } }
>('auth/loginUser', async ({ userId, password }, { rejectWithValue }) => {
  try {
    // const encodedPassword = tripleEncodePassword(password);
    // const plainPassword = password;
    // Use AuthAPI to ensure no Authorization header is sent for login
    const response = await AuthAPI.post(API_ENDPOINTS.post_login, {
      userId,
      password,
    });

    console.log('🚀 ~ file: authSlice.ts ~ loginResponse: ', response.data);

    return response.data as LoginResponse;
  } catch (error: any) {
    const data = error?.response?.data || {};
    const remainingAttempts =
      data?.remainingAttempts ||
      data?.error?.remainingAttempts ||
      data?.error?.data?.remainingAttempts;
    const message =
      data?.error?.message ||
      data?.message ||
      (typeof data === 'string' ? data : 'Something went wrong');
    return rejectWithValue({ message, remainingAttempts });
  }
});

export const verifyDsc = createAsyncThunk<
  VerifyDscResponse,
  VerifyDscRequest,
  { rejectValue: string }
>(
  'auth/verifyDsc',
  async ({ dscCertificate, userId, password }, { rejectWithValue }) => {
    try {
      // Use AuthAPI to ensure no Authorization header is sent for token endpoint
      const response = await AuthAPI.post(API_ENDPOINTS.user_login, {
        dscCertificate,
        userId,
        password,
      });
      // console.log('🚀  verifyDsc: ', response);
      return response?.data as VerifyDscResponse;
    } catch (error: any) {
      console.log('🚀  verifyDsc Error: ', error);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.errorMessage);
      }
      return rejectWithValue('Something went wrong during DSC verification');
    }
  }
);

export const reinitializeApplication = createAsyncThunk<
  ResponseReinitialize,
  void,
  {
    rejectValue: {
      message: string;
      statusCode?: number;
      shouldLogout?: boolean;
    };
  }
>('auth/reinitializeApplication', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.authToken;

    // console.log('Reinitialize auth token:', token);

    if (!token) {
      return rejectWithValue({
        message: 'No auth token found',
        shouldLogout: true,
      });
    }
    // console.log('Reinitialize auth token:', state.auth);
    // console.log('abc:', token);
    // const usertype = state.auth?.userDetails?.role;
    // const apiEndpoint = usertype === 'cersai' ? API_ENDPOINTS.REINITIALIZE : API_ENDPOINTS.REINITIALIZE_ADMIN;
    // Use ReinitializeAPI instead of Secured to avoid interceptor
    const response = await AuthAPI.post(
      API_ENDPOINTS.REINITIALIZE,
      {
        userId: state.auth?.userDetails?.userId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // console.log('Reinitialize response:', response?.data);
    return response?.data as ResponseReinitialize;
  } catch (error: any) {
    console.error('Reinitialize error:', error);

    // Handle 403/401 specifically - session expired
    if (error.response?.status === 403 || error.response?.status === 401) {
      return rejectWithValue({
        message: 'Session expired or Invalid Credentials. Please login again.',
        statusCode: error.response.status,
        shouldLogout: true,
      });
    }

    // Handle other errors
    if (error.response && error.response.data) {
      return rejectWithValue({
        message:
          error.response.data.message ||
          error.response.data.errorMessage ||
          'Reinitialize failed',
        statusCode: error.response.status,
      });
    }

    return rejectWithValue({
      message: 'Something went wrong during reinitialize',
    });
  }
});

export const forgotPassword = createAsyncThunk<
  ForgotPasswordResponse,
  { userId: string },
  { rejectValue: string }
>('auth/forgotPassword', async ({ userId }, { rejectWithValue }) => {
  try {
    // const isReForgotRoute =
    //   typeof window !== 'undefined' &&
    //   window.location.pathname.includes('/re/re-forgot-password');

    // const url = isReForgotRoute
    //   ? API_ENDPOINTS.otp_send
    //   : API_ENDPOINTS.forgot_password_otp_send;
    const url = API_ENDPOINTS.forgot_password_otp_send;
    const response = await Secured.post(url, {
      requestType: 'USER_VERIFY',
      userId: userId,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.error?.message || 'Something went wrong'
    );
  }
});

export const OTPSend = createAsyncThunk<
  OTPResponseResponse,
  {
    emailId?: string;
    mobileNo?: string;
    countryCode?: string;
    workflowId?: string;
    ckycNo?: string;
    stepKey?: string;
    name?: string;
  },
  {
    rejectValue: {
      field: string;
      message: string;
    };
  }
>(
  'auth/OTPSend',
  async (
    { emailId, mobileNo, countryCode, ckycNo, name, stepKey, workflowId },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const { adminUserDetails } = state.auth;

      const isAdmin =
        adminUserDetails?.data?.groups?.some(
          (g: string) =>
            g.toUpperCase() ===
            (CERSAIUserRoles.ADMIN_USER ||
              CERSAIUserRoles.SUPER_ADMIN_USER ||
              CERSAIUserRoles.OPERATIONAL_USER)
        ) ?? false;

      const url = isAdmin
        ? API_ENDPOINTS.OTP_SEND_ADMIN
        : API_ENDPOINTS.otp_send;

      // Build payload conditionally - only include fields that have values
      const payload: Record<string, string | undefined> = {
        requestType: 'DIRECT',
      };

      // Only add emailId if it has a value
      if (emailId) {
        payload.emailId = emailId;
      }

      // Only add mobileNo and countryCode if mobileNo has a value
      if (mobileNo) {
        payload.mobileNo = mobileNo;
        if (countryCode) {
          payload.countryCode = countryCode;
        }
      }

      // Add optional fields if they have values
      if (ckycNo) payload.ckycNo = ckycNo;
      if (name) payload.name = name;
      if (stepKey) payload.stepKey = stepKey;
      if (workflowId) payload.workflowId = workflowId;

      const response = await Secured.post(url, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error.errors[0] || 'Something went wrong'
      );
    }
  }
);

export const validateOtp = createAsyncThunk(
  'auth/validateOtp',
  async (
    params: {
      identifier: string;
      mobileOtp: string;
      emailOtp: string;
      signUpValidation: boolean;
    },
    thunkAPI
  ) => {
    try {
      const response = await Secured.post(
        API_ENDPOINTS.post_validate_otp,
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: ``,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.errorMessage || 'OTP validation failed'
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (
    {
      identifier,
      type,
      extraFeilds,
    }: { identifier: string; type: 'email' | 'mobile'; extraFeilds?: any },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const { adminUserDetails } = state.auth;

      const isAdmin =
        adminUserDetails?.data?.groups?.some(
          (g: string) =>
            g.toUpperCase() ===
            (CERSAIUserRoles.ADMIN_USER ||
              CERSAIUserRoles.SUPER_ADMIN_USER ||
              CERSAIUserRoles.OPERATIONAL_USER)
        ) ?? false;

      const url = isAdmin
        ? API_ENDPOINTS.RESEND_OTP_ADMIN
        : extraFeilds
          ? API_ENDPOINTS.post_resend_otp_v1
          : API_ENDPOINTS.post_resend_otp;

      let requestObject = {
        otpIdentifier: identifier,
        type,
      };
      if (extraFeilds) {
        requestObject = { ...extraFeilds, ...requestObject };
      }

      const response = await Secured.post(url, requestObject);
      return response.data;
    } catch (err: any) {
      // Prefer top-level errorMessage, then nested, then default
      const top = err?.message;
      const nested = err?.response?.data?.error?.message;
      const msg = top || nested || 'Max otp limit reached.';
      return rejectWithValue(msg);
    }
  }
);

export const setNewPasswordWithDsc = createAsyncThunk<
  any,
  { newPassword: string; dscCertificateBase64: string; email: string },
  { rejectValue: string }
>(
  'auth/setNewPasswordWithDsc',
  async ({ newPassword, dscCertificateBase64, email }, { rejectWithValue }) => {
    try {
      const response = await Secured.post(
        // API_ENDPOINTS.forgot_new_password_setup,
        API_ENDPOINTS.forgot_new_password_setup_admin,
        {
          newPassword,
          email,
          dscCertificateBase64,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        return rejectWithValue(data.message || 'DSC validation failed');
      }

      return data;
    } catch (error: any) {
      const backendError =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong';

      return rejectWithValue(backendError);
    }
  }
);

export const forgotUserId = createAsyncThunk(
  'auth/forgotUserId',
  async (
    { identifier, type }: { identifier: string; type: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await Secured.post(API_ENDPOINTS.forgot_user_id, {
        identifier,
        type,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.data?.errorMessage || 'Something went wrong'
      );
    }
  }
);

// Verify if user exists
export const verifyUser = createAsyncThunk(
  'auth/verifyUser',
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      const response = await Secured.post(API_ENDPOINTS.auth_verify_user, {
        userId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'User verification failed'
      );
    }
  }
);

// Send forgot userId request
export const sendForgotUserId = createAsyncThunk(
  'auth/sendForgotUserId',
  async (
    { email, fiCode }: { email: string; fiCode: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await Secured.post(API_ENDPOINTS.forgot_user_id_new, {
        email,
        fiCode,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send User ID'
      );
    }
  }
);

export const fetchAdminUserDetails = createAsyncThunk<
  AdminUserDetailsResponse,
  AdminUserDetailsRequest,
  { rejectValue: string }
>(
  'auth/fetchAdminUserDetails',
  async ({ userId }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.authToken;
      console.log('userDetail', userId);
      console.log('token', token);
      if (!token) {
        return rejectWithValue('No auth token found');
      }
      const response = await AuthAPI.get(
        API_ENDPOINTS.get_user_info + '/' + userId
        // ,
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // }
      );

      console.log('🚀 fetchAdminUserDetails response:', response);
      return response.data as AdminUserDetailsResponse;
    } catch (error: any) {
      console.log('🚀 fetchAdminUserDetails Error:', error);
      const processedError = createSliceErrorObject(error);
      console.log('🚀 Processed Error:', processedError);

      // Return the processed error object as a string for now, but log the full details
      return rejectWithValue(processedError.message);
    }
  }
);
console.log('in AuthSlice');

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => initialState,
    clearDscMessage: (state) => {
      state.dscVerificationMessage = false;
    },
    setForgotPasswordUserId(state, action) {
      state.forgotPasswordUserId = action.payload;
    },
    setModifiableFields: (
      state,
      action: PayloadAction<Record<string, string[]>>
    ) => {
      if (state.reinitializeData) {
        state.reinitializeData.modifiableFields = action.payload;
      }
    },
    clearForgotPasswordError(state) {
      state.forgotPassworderror = null;
    },
    clearForgotuserIdError(state) {
      state.forgotUserIderror = null;
    },
    clearverifyDscerror(state) {
      state.verifyDscerror = null;
    },
    clearReinitializeError(state) {
      state.reinitializeError = null;
    },
    clearLoginError(state) {
      state.errorLogin = null;
    },
    clearAdminUserDetailsError(state) {
      state.adminUserDetailsError = null;
    },
    clearVerifyUserError(state) {
      state.verifyUserError = null;
      state.isUserVerified = false;
    },
    clearSendForgotUserIdError(state) {
      state.sendForgotUserIdError = null;
      state.forgotUserIdResponse = null;
    },

    // Add action to update token (for refresh scenarios)
    updateAuthToken(state, action: PayloadAction<string>) {
      state.authToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.errorLogin = null;
        state.remainingLoginAttempts = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ Fixed: Extract token from correct path
        // state.authToken = action.payload.data.tokenDetails.access_token;
        // state.refreshToken = action.payload.data.tokenDetails.refresh_token;
        // state.userDetails = action.payload.data.userDetails;
        state.success = action.payload.success;
        state.remainingLoginAttempts = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as
          | { message?: string; remainingAttempts?: number }
          | undefined;
        state.errorLogin = payload?.message || 'Login failed';
        state.remainingLoginAttempts =
          typeof payload?.remainingAttempts === 'number'
            ? payload?.remainingAttempts
            : null;
      })
      .addCase(verifyDsc.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.dscVerificationMessage = false;
        console.log('dscVerificationMessage Pending');
      })
      .addCase(verifyDsc.fulfilled, (state, action) => {
        console.log('dscVerificationMessage Fullfilled');
        state.loading = false;
        state.dscVerificationMessage = true;
        console.log('manipulating state  ', action);
        state.authToken = action.payload?.data?.accessToken || '';
        const decodeToken: any = jwtDecode(
          action.payload?.data?.accessToken || ''
        );

        console.log('Decode Tojken====', decodeToken);
        console.log(decodeToken?.user_details, 'userDetails Log');

        state.refreshToken = action.payload?.data?.refreshToken || '';
        state.loginUserId = decodeToken?.sub;
        // state.userDetails = {
        //   given_name: decodeToken?.given_name || '',
        //   email: action.payload.data?.emailId || '',
        //   firstName: decodeToken?.given_name || '',
        //   lastName: decodeToken?.family_name || '',
        //   ckycNumber: decodeToken?.user_details?.ckyc_no || '',
        //   mobileNo: decodeToken?.user_details?.mobile_no || '',
        //   title: decodeToken?.user_details?.title || '',
        //   citizenship: decodeToken?.user_details?.citizenship || '',
        //   middleName: decodeToken?.user_details?.middle_name || '',
        //   countryCode: decodeToken?.user_details?.country_code || '',
        //   role:
        //     decodeToken?.user_details?.userType ||
        //     decodeToken?.user_details?.user_type ||
        //     '',
        //   is_initialization_complete:
        //     decodeToken?.user_details?.is_initialization_complete || '',
        //   approved: decodeToken?.user_details?.approved || '',
        //   userId: decodeToken?.sub,
        // };

        console.log('userDetails exist', state.userDetails);
        // state.groupMembership = decodeToken?.groupMembership || [];
        console.log('DSCVerify----', state.dscVerificationMessage);
      })
      .addCase(verifyDsc.rejected, (state, action) => {
        state.loading = false;
        state.verifyDscerror = action.payload || 'DSC verification failed';
      })
      .addCase(reinitializeApplication.pending, (state) => {
        console.log('reinitializeApplication pending');
        state.reinitializeLoading = true;
        state.reinitializeError = null;
      })
      .addCase(reinitializeApplication.fulfilled, (state, action) => {
        console.log('reinitializeApplication fullfilled');
        state.reinitializeLoading = false;
        console.log('action.payload====', action.payload);
        state.reinitializeDataResponse = action.payload;
        state.workflowId = action.payload?.data?.workflowId;
        state.initialized = true;
        state.modificationStatus = action.payload?.approvalStatus;
        state.modifiableFields = action.payload?.modifiableFields || {};
      })
      .addCase(reinitializeApplication.rejected, (state, action) => {
        state.reinitializeLoading = false;
        if (action.payload?.shouldLogout) {
          // Clear auth data when session expires
          state.authToken = null;
          state.refreshToken = null;
          state.userDetails = null;
          state.initialized = false;
          state.modifiableFields = {};
          state.modificationStatus = null;
          state.reinitializeData = null;
          state.reinitializeError = action.payload.message;
        } else {
          // For other errors, just set the error message
          state.reinitializeError =
            action.payload?.message || 'Reinitialize failed';
        }
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both possible property names from API response
        const otpIdentifier =
          action.payload.data.otpIdentifier ||
          action.payload.data.otp_identifier;
        state.otpIdentifier = otpIdentifier || null;

        // Extract userId from otpIdentifier if it exists
        const userId = otpIdentifier ? otpIdentifier.split('_')[0] || '' : '';
        state.forgotPasswordUserId = userId;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.forgotPassworderror = action.payload as string;
      })
      .addCase(OTPSend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(OTPSend.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both possible property names from API response
        const otpIdentifier = action.payload.data.otpIdentifier;
        state.otpIdentifier = otpIdentifier || null;
      })
      .addCase(OTPSend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message as any;
      })
      .addCase(validateOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setNewPasswordWithDsc.pending, (state) => {
        state.setPasswordDscLoading = true;
        state.setPasswordDscError = null;
        state.setPasswordDscSuccess = false;
      })
      .addCase(setNewPasswordWithDsc.fulfilled, (state) => {
        state.setPasswordDscLoading = false;
        state.setPasswordDscSuccess = true;
      })
      .addCase(setNewPasswordWithDsc.rejected, (state, action) => {
        state.setPasswordDscLoading = false;
        state.setPasswordDscError = action.payload as string;
      })
      .addCase(forgotUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.userIdMessage = action.payload.message;
      })
      .addCase(forgotUserId.rejected, (state, action) => {
        state.loading = false;
        state.forgotUserIderror = action.payload as string;
      })
      .addCase(fetchAdminUserDetails.pending, (state) => {
        state.adminUserDetailsLoading = true;
        state.adminUserDetailsError = null;
      })
      .addCase(fetchAdminUserDetails.fulfilled, (state, action) => {
        state.adminUserDetailsLoading = false;
        state.adminUserDetails = action.payload;
        console.log(
          '🚀 Admin user details fetched successfully:',
          action.payload
        );
        state.userDetails = {
          given_name:
            action.payload?.data?.attributes?.firstName +
              ' ' +
              action.payload?.data?.attributes?.lastName || '',
          email: action.payload.data?.email || '',
          firstName: action.payload?.data?.firstName || '',
          lastName: action.payload?.data?.lastName || '',
          userId: action.payload?.data?.attributes?.userDetails?.userId || '',
          ckycNo: action.payload?.data?.attributes?.userDetails?.ckycNo || '',
          // mobileNo: decodeToken?.user_details?.mobile_no || '',
          title: action.payload?.data?.attributes?.userDetails?.title || '',
          citizenship:
            action.payload?.data?.attributes?.userDetails?.citizenship || '',
          middleName:
            action.payload?.data?.attributes?.userDetails?.middleName || '',
          approvedData:
            action.payload?.data?.attributes?.userDetails?.approved || '',
          role: action.payload?.data?.attributes?.userDetails?.userType || '',
          is_initialization_complete:
            action.payload?.data?.attributes?.userDetails
              ?.isInitializationComplete,
          registered: action.payload?.data?.attributes?.userDetails?.registered,
        };
        state.groupMembership = action.payload?.data?.groups || [];
      })
      .addCase(fetchAdminUserDetails.rejected, (state, action) => {
        state.adminUserDetailsLoading = false;
        state.adminUserDetailsError = action.payload as string;
        console.log('🚀 Admin user details fetch failed:', action.payload);
      })
      .addCase(verifyUser.pending, (state) => {
        state.verifyUserLoading = true;
        state.verifyUserError = null;
        state.isUserVerified = false;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.verifyUserLoading = false;
        state.isUserVerified = action.payload.success;
        console.log('🚀 User verification successful:', action.payload);
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.verifyUserLoading = false;
        state.verifyUserError = action.payload as string;
        state.isUserVerified = false;
        console.log('🚀 User verification failed:', action.payload);
      })
      .addCase(sendForgotUserId.pending, (state) => {
        state.sendForgotUserIdLoading = true;
        state.sendForgotUserIdError = null;
        state.forgotUserIdResponse = null;
      })
      .addCase(sendForgotUserId.fulfilled, (state, action) => {
        state.sendForgotUserIdLoading = false;
        state.forgotUserIdResponse = action.payload.data;
        console.log('🚀 Forgot UserId sent successfully:', action.payload);
      })
      .addCase(sendForgotUserId.rejected, (state, action) => {
        state.sendForgotUserIdLoading = false;
        state.sendForgotUserIdError = action.payload as string;
        console.log('🚀 Forgot UserId failed:', action.payload);
      });
  },
});

export const {
  resetAuth,
  clearDscMessage,
  clearForgotPasswordError,
  clearForgotuserIdError,
  clearverifyDscerror,
  clearReinitializeError,
  setModifiableFields,
  updateAuthToken,
  clearLoginError,
  clearAdminUserDetailsError,
  clearVerifyUserError,
  clearSendForgotUserIdError,
} = authSlice.actions;

export default authSlice.reducer;
