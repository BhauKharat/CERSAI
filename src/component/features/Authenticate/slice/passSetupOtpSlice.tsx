/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  SendOtpRequest,
  SendOtpSuccessResponse,
  SendOtpErrorResponse,
  AuthOtpState,
} from '../../../../redux/types/passSetupOtpTypes';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';

export const sendOtp = createAsyncThunk<
  SendOtpSuccessResponse,
  SendOtpRequest & { token: string }, // extend payload with token
  { rejectValue: SendOtpErrorResponse }
>('auth/sendOtp', async ({ emailId, mobileNo, token }, { rejectWithValue }) => {
  try {
    const response = await Secured.post(
      API_ENDPOINTS.post_send_otp,
      { emailId, mobileNo },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as SendOtpSuccessResponse;
  } catch (error: any) {
    return rejectWithValue(error.response.data as SendOtpErrorResponse);
  }
});

export const validateActivateToken = createAsyncThunk<
  any,
  { token: string },
  { rejectValue: any }
>('validate/validateActivateToken', async ({ token }, { rejectWithValue }) => {
  try {
    const response = await Secured.get(API_ENDPOINTS.validate_activate_token, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: AuthOtpState = {
  loading: false,
  otpIdentifier: '',
  error: null,
  token: '',
  tokenValidationLoading: false,
  isTokenValid: false,
  tokenValidationError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.otpIdentifier = '';
      state.error = null;
      state.token = '';
      state.tokenValidationLoading = false;
      state.isTokenValid = false;
      state.tokenValidationError = null;
    },

    setAuthToken: (state, action) => {
      state.token = action.payload;
    },
    resetTokenValidation: (state) => {
      state.tokenValidationLoading = false;
      state.isTokenValid = false;
      state.tokenValidationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpIdentifier = action.payload.data['otp_identifier'];
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data?.[0]?.issue ||
          action.payload?.message ||
          'Something went wrong';
      })
      .addCase(validateActivateToken.pending, (state) => {
        state.tokenValidationLoading = true;
        state.tokenValidationError = null;
        state.isTokenValid = false;
      })
      .addCase(validateActivateToken.fulfilled, (state) => {
        state.tokenValidationLoading = false;
        state.isTokenValid = true;
        state.tokenValidationError = null;
      })
      .addCase(validateActivateToken.rejected, (state, action) => {
        state.tokenValidationLoading = false;
        state.isTokenValid = false;
        state.tokenValidationError =
          action.payload?.data?.errorMessage || 'Token validation failed';
      });
  },
});

//export const { resetAuthState } = authSlice.actions;
export const { resetAuthState, setAuthToken, resetTokenValidation } =
  authSlice.actions;

export default authSlice.reducer;
