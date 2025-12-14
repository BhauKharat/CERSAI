import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  ValidateOtpRequest,
  ValidateOtpSuccessResponse,
  ValidateOtpErrorResponse,
  ValidateOtpState,
} from '../types/validateOtpTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: ValidateOtpState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for validating OTP
export const validateOtp = createAsyncThunk<
  { otp_identifier: string },
  ValidateOtpRequest,
  { rejectValue: string }
>(
  'validateOtp/validateOtp',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Validating OTP...'));

      // Ensure both mobileOtp and emailOtp are always present in the payload as strings
      // Explicitly convert to string and default to "-" if undefined/null
      const mobileOtpValue =
        requestData.mobileOtp !== undefined &&
        requestData.mobileOtp !== null &&
        requestData.mobileOtp !== ''
          ? String(requestData.mobileOtp)
          : '-';
      const emailOtpValue =
        requestData.emailOtp !== undefined &&
        requestData.emailOtp !== null &&
        requestData.emailOtp !== ''
          ? String(requestData.emailOtp)
          : '-';

      // Construct payload with both fields always present
      const payload: ValidateOtpRequest = {
        identifier: requestData.identifier,
        mobileOtp: mobileOtpValue, // Always a string, "-" if not provided
        emailOtp: emailOtpValue, // Always a string, "-" if not provided
      };

      // Add optional signUpValidation if present
      if (requestData.signUpValidation !== undefined) {
        payload.signUpValidation = requestData.signUpValidation;
      }

      console.log('Calling validate OTP API (original):', requestData);
      console.log('Calling validate OTP API (payload):', payload);
      console.log(
        'Calling validate OTP API (JSON):',
        JSON.stringify(payload, null, 2)
      );
      console.log('Payload keys:', Object.keys(payload));
      console.log('Payload mobileOtp type:', typeof payload.mobileOtp);
      console.log('Payload emailOtp type:', typeof payload.emailOtp);

      const response = await Secured.post(
        API_ENDPOINTS.validate_otp_user_management,
        payload
      );

      console.log('Validate OTP API Response:', response.data);

      // Handle success response
      if (response.data && response.data.success === true) {
        dispatch(hideLoader());
        const successData = response.data as ValidateOtpSuccessResponse;
        return successData.data;
      }

      // Handle error response with success: false
      if (response.data && response.data.success === false) {
        dispatch(hideLoader());
        const errorData = response.data as ValidateOtpErrorResponse;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to validate OTP'
        );
      }

      // Fallback error
      return rejectWithValue('Invalid response format');
    } catch (error: unknown) {
      console.error('Validate OTP API error:', error);
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: ValidateOtpErrorResponse; status?: number };
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
            return rejectWithValue(
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to validate OTP'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to validate OTP'
          );
        }
      }
      return rejectWithValue('Network error occurred while validating OTP');
    }
  }
);

// Validate OTP slice
const validateOtpSlice = createSlice({
  name: 'validateOtp',
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
      .addCase(validateOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearError, resetState } = validateOtpSlice.actions;
export default validateOtpSlice.reducer;
