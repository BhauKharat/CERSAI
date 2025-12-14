/* eslint-disable @typescript-eslint/no-explicit-any */
// features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AuthState,
  LoginRequest,
  LoginResponse,
  VerifyDscRequest,
  VerifyDscResponse,
} from '../../types/register/authSliceTypes';
import { ReinitializeResponse } from '../../types/register/reInitializeTypes';
import { API_ENDPOINTS } from 'Constant';
import { Secured, AuthAPI } from '../../../utils/HelperFunctions/api/index';
// import { tripleEncodePassword } from '../../../utils/encoding';
import { ForgotPasswordResponse } from '../../types/register/authSliceTypes';
import { ReinitializeAPI } from '../../../utils/HelperFunctions/api/index';
import { jwtDecode } from 'jwt-decode';

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
};

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    // const encodedPassword = tripleEncodePassword(password);
    const plainPassword = password;
    // Use AuthAPI to ensure no Authorization header is sent for login
    const response = await AuthAPI.post(API_ENDPOINTS.post_login, {
      username,
      password: plainPassword,
    });

    console.log('🚀 ~ file: authSlice.ts ~ loginResponse: ', response.data);

    return response.data as LoginResponse;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data.errorMessage);
    }
    return rejectWithValue('Something went wrong');
  }
});

export const verifyDsc = createAsyncThunk<
  VerifyDscResponse,
  VerifyDscRequest,
  { rejectValue: string }
>(
  'auth/verifyDsc',
  async ({ dscCertificate, username, password }, { rejectWithValue }) => {
    try {
      // Use AuthAPI to ensure no Authorization header is sent for token endpoint
      const response = await AuthAPI.post(API_ENDPOINTS.verify_dsc, {
        dscCertificate,
        username,
        password,
      });
      console.log('🚀  verifyDsc: ', response.data);
      return response.data as VerifyDscResponse;
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
  ReinitializeResponse,
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
    console.log('Reinitialize auth token:', state.auth?.userDetails?.role);
    console.log('abc:', token);
    // const usertype = state.auth?.userDetails?.role;
    // const apiEndpoint = usertype === 'cersai' ? API_ENDPOINTS.REINITIALIZE : API_ENDPOINTS.REINITIALIZE_ADMIN;
    // Use ReinitializeAPI instead of Secured to avoid interceptor
    const response = await ReinitializeAPI.get(API_ENDPOINTS.REINITIALIZE, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Reinitialize response:', response?.data?.data);
    return response?.data?.data as ReinitializeResponse;
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
    const response = await Secured.post(API_ENDPOINTS.forgot_password, {
      userId,
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;

    // Handle 400 errors - show specific error message from API
    if (status === 400) {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.errorMessage ||
        error?.response?.data?.message ||
        'Invalid request';
      return rejectWithValue(errorMessage);
    }

    // Handle 500 errors - show generic message
    if (status === 500) {
      return rejectWithValue('Something went wrong');
    }

    // Handle other errors
    return rejectWithValue(
      error?.response?.data?.errors?.[0]?.errorMessage ||
        error?.response?.data?.message ||
        'Something went wrong'
    );
  }
});

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
        params
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
    { identifier, type }: { identifier: string; type: 'EMAIL' | 'MOBILE' },
    { rejectWithValue }
  ) => {
    try {
      const response = await Secured.post(API_ENDPOINTS.post_resend_otp, {
        identifier,
        type,
      });
      return response.data;
    } catch (err: any) {
      // Prefer top-level errorMessage, then nested, then default
      const top = err?.response?.data?.errorMessage;
      const nested = err?.response?.data?.data?.errorMessage;
      const msg = top || nested || 'Failed to resend OTP';
      return rejectWithValue(msg);
    }
  }
);

export const setNewPasswordWithDsc = createAsyncThunk<
  any,
  { password: string; dscCertificateFile: string; userId: string },
  { rejectValue: string }
>(
  'auth/setNewPasswordWithDsc',
  async ({ password, dscCertificateFile, userId }, { rejectWithValue }) => {
    try {
      const response = await Secured.post(
        API_ENDPOINTS.forgot_new_password_setup,
        {
          password,
          userId,
          dscCertificateFile,
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
      const status = error?.response?.status;

      // Handle 400 errors - show specific error message from API
      if (status === 400) {
        const errorMessage =
          error?.response?.data?.errors?.[0]?.errorMessage ||
          error?.response?.data?.message ||
          'Invalid request';
        return rejectWithValue(errorMessage);
      }

      // Handle 500 errors - show generic message
      if (status === 500) {
        return rejectWithValue('Something went wrong');
      }

      // Handle other errors
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.errorMessage ||
          error?.response?.data?.message ||
          'Something went wrong'
      );
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
      const status = error?.response?.status;

      // Handle 400 errors - show specific error message from API
      if (status === 400) {
        const errorMessage =
          error?.response?.data?.errors?.[0]?.errorMessage ||
          error?.response?.data?.message ||
          'Invalid request';
        return rejectWithValue(errorMessage);
      }

      // Handle 500 errors - show generic message
      if (status === 500) {
        return rejectWithValue('Something went wrong');
      }

      // Handle other errors
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.errorMessage ||
          error?.response?.data?.message ||
          'Something went wrong'
      );
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
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ Fixed: Extract token from correct path
        // state.authToken = action.payload.data.tokenDetails.access_token;
        // state.refreshToken = action.payload.data.tokenDetails.refresh_token;
        // state.userDetails = action.payload.data.userDetails;
        state.success = action.payload.success;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.errorLogin = action.payload || 'Login failed';
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
        // console.log('manipulating state  ');
        state.authToken = action.payload?.data?.accessToken || '';
        const decodeToken: any = jwtDecode(
          action.payload?.data?.accessToken || ''
        );

        console.log('Decode Tojken====', decodeToken);
        console.log(decodeToken?.user_details, 'userDetails Log');

        state.refreshToken = action.payload?.data?.refreshToken || '';
        console.log(
          'USerDetails exsist or not ',
          'email',
          action.payload.data?.emailId || '',
          'firstName:',
          decodeToken?.given_name || '',
          'lastName:',
          decodeToken?.family_name || '',
          'ckycNumber:',
          decodeToken?.user_details?.ckyc_no || '',
          'mobileNo:',
          decodeToken?.user_details?.mobile_no || '',
          'title:',
          decodeToken?.user_details?.title || '',
          'citizenship:',
          decodeToken?.user_details?.citizenship || '',
          'middleName:',
          decodeToken?.user_details?.middle_name || '',
          'countryCode:',
          decodeToken?.user_details?.country_code || ''
        );

        state.userDetails = {
          given_name: decodeToken?.given_name || '',
          email: action.payload.data?.emailId || '',
          firstName: decodeToken?.given_name || '',
          lastName: decodeToken?.family_name || '',
          ckycNumber: decodeToken?.user_details?.ckyc_no || '',
          mobileNo: decodeToken?.user_details?.mobile_no || '',
          title: decodeToken?.user_details?.title || '',
          citizenship: decodeToken?.user_details?.citizenship || '',
          middleName: decodeToken?.user_details?.middle_name || '',
          countryCode: decodeToken?.user_details?.country_code || '',
          role:
            decodeToken?.user_details?.userType ||
            decodeToken?.user_details?.user_type ||
            '',
          is_initialization_complete:
            decodeToken?.user_details?.is_initialization_complete || '',
          approved: decodeToken?.user_details?.approved || '',
        };

        console.log('userDetails exist', state.userDetails);
        state.groupMembership = decodeToken?.groupMembership || [];
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
        state.reinitializeData = action.payload;
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
        state.otpIdentifier = action.payload.data.otp_identifier;
        const userId = action.payload.data.otp_identifier.split('_')[0];
        state.forgotPasswordUserId = userId;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.forgotPassworderror = action.payload as string;
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
} = authSlice.actions;

export default authSlice.reducer;
