import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../../Constant';
import axios from 'axios';
import {
  SendOtpRequest,
  SendOtpSuccessResponse,
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
  { otpIdentifier: string },
  SendOtpRequest,
  { rejectValue: string }
>('sendOtp/sendOtp', async (requestData, { rejectWithValue, dispatch }) => {
  try {
    console.log(
      'Calling send OTP API with payload:',
      JSON.stringify(requestData, null, 2)
    );
    dispatch(showLoader('Sending OTP...'));

    // Use axios directly to bypass the interceptor's empty value filtering
    const token = localStorage.getItem('token');
    const response = await axios({
      method: 'post',
      url: `${process.env.REACT_APP_API_BASE_URL}${API_ENDPOINTS.send_otp_user_management}`,
      data: requestData,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      transformRequest: [(data) => JSON.stringify(data)], // Manually stringify to preserve empty strings
    });

    console.log('Send OTP API Response:', response.data);

    // Handle success response
    if (response.data && response.data.success === true) {
      dispatch(hideLoader());
      const successData = response.data as SendOtpSuccessResponse;
      return {
        otpIdentifier: successData.data.otp_identifier,
      };
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
    return rejectWithValue('Invalid response format');
  } catch (error: unknown) {
    console.error('Send OTP API error:', error);
    dispatch(hideLoader());
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: SendOtpErrorResponse };
      };
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
