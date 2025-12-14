import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  SendOtpRequest,
  SendOtpErrorResponse,
  SendOtpState,
} from '../types/sendOtpTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: SendOtpState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for sending OTP
export const sendOtp = createAsyncThunk<
  {
    otpIdentifier: string;
    maskedEmail: string;
    maskedMobile: string;
    expiryMinutes: number;
    message: string;
  },
  SendOtpRequest,
  { rejectValue: string }
>('sendOtp/sendOtp', async (requestData, { rejectWithValue, dispatch }) => {
  try {
    console.log(
      'Email changed, mobile unchanged5',
      JSON.stringify(requestData, null, 2)
    );
    dispatch(showLoader('Sending OTP...'));
    const response = await Secured.post(
      API_ENDPOINTS.send_otp_user_management,
      requestData
    );

    console.log('Send OTP API Response:', response);

    // Handle success response - check for status 200 and data.data structure
    if (response.status === 200 && response.data?.data) {
      dispatch(hideLoader());
      return response.data.data;
    }

    // Handle error response with success: false
    if (response.data && response.data.success === false) {
      dispatch(hideLoader());
      const errorData = response.data as SendOtpErrorResponse;
      return rejectWithValue(
        errorData.data?.errorMessage ||
          errorData.message ||
          'Failed to send OTP'
      );
    }

    // Fallback error
    dispatch(hideLoader());
    return rejectWithValue('Invalid response format');
  } catch (error: unknown) {
    console.error('Send OTP API error:', error);
    dispatch(hideLoader());
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: SendOtpErrorResponse; status?: number };
      };
      const status = axiosError.response?.status;

      // Handle 500 status
      if (status === 500) {
        return rejectWithValue(
          'Something went wrong on our side. Please try again later'
        );
      }

      // Handle 400 or 401 - show backend error
      if (status === 400 || status === 401) {
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          if (
            errorData.error?.errors &&
            Array.isArray(errorData.error.errors) &&
            errorData.error.errors.length > 0
          ) {
            const errorMessages = errorData.error.errors
              .map((err) => err.message)
              .join(', ');
            return rejectWithValue(errorMessages);
          }

          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to send OTP'
          );
        }
      }

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to send OTP'
        );
      }
    }
    return rejectWithValue('Network error occurred while sending OTP');
  }
});

// Send OTP slice
const sendOtpSlice = createSlice({
  name: 'sendOtp',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
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
        state.data = action.payload;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError, resetState } = sendOtpSlice.actions;
export default sendOtpSlice.reducer;
