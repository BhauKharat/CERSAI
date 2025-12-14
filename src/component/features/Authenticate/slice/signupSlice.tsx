/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import { SignUpState } from '../types/signupTypes';
import { filterEmptyValues } from '../../../../utils/HelperFunctions/formDataUtils';
import { AuthAPI } from '../../../../utils/HelperFunctions/api/index';
import { createSliceErrorObject } from '../../../../utils/HelperFunctions/errorHandler';
import { RootState } from '../../../../redux/store';
import { allowedGroupsCersai } from '../../../../../src/enums/userRoles.enum';

// Define the metadata structure for the API
export interface EntityProfileSignupMetadata {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobile: string;
  ckycNo: string;
  title: string;
  citizenship: string;
}

// Define types specific to signup slice
export interface SignupFieldError {
  field: string;
  message: string;
}

// Initial state
const initialState: SignUpState = {
  loading: false,
  error: null,
  otpIdentifier: null,
  successMessage: null,
  ckycLoading: false,
  ckycError: null,
  ckycData: null,
};

interface ResendCkycPayload {
  otpIdentifier: string;
  type: string; // or 'email' | 'mobile'
}

// Async thunk for signup submission
export const submitSignUp = createAsyncThunk(
  'signup/submitSignUp',
  async (formData: any, { rejectWithValue }) => {
    try {
      console.log('🚀 SignUp API - Form data received:', formData);
      console.log(
        '🚀 SignUp API - Calling endpoint:',
        API_ENDPOINTS.post_sign_up
      );
      // Filter out empty values from formData using common utility
      const filteredFormData = filterEmptyValues(formData);
      console.log('🚀 SignUp API - Filtered form data:', filteredFormData);

      const response = await AuthAPI.post(
        API_ENDPOINTS.post_sign_up,
        filteredFormData
      );

      const responseData = await response.data;
      console.log('🚀 SignUp API - Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('🚀 SignUp API - Error:', error);
      const processedError = createSliceErrorObject(error);
      console.log('🚀 SignUp API - Processed Error:', processedError);
      return rejectWithValue(processedError);
    }
  }
);

// CKYC Details Request
export const getCkycDetailsRequest = async (
  ckycNo: string,
  isAdmin: boolean = false
) => {
  const payload = {
    ckycNo: ckycNo,
  };
  const url = isAdmin
    ? API_ENDPOINTS.CKYC_DETAILS_ADMIN
    : API_ENDPOINTS.CKYC_DETAILS;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const resendCkycDetailsRequest = async (
  data: ResendCkycPayload,
  isAdmin: boolean = false
) => {
  const url = isAdmin
    ? API_ENDPOINTS.RESEND_CKYC_DETAILS_ADMIN
    : API_ENDPOINTS.RESEND_CKYC_DETAILS;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  // if (!response.ok) {
  //   throw new Error('Failed to fetch CKYC details');
  // }
  return response.json();
};

// CKYC Verification Request
export const getCkycVerifiedRequest = async ({
  identifier,
  otp,
}: {
  identifier: string;
  otp: string;
}) => {
  const payload = {
    identifier: identifier,
    otp: otp,
  };
  const response = await fetch(API_ENDPOINTS.CKYC_VERIFIED, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CKYC details');
  }

  return response.json();
};

// Async thunk for CKYC details
export const fetchCkycDetails = createAsyncThunk(
  'signup/fetchCkycDetails',
  async (ckycNo: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const { adminUserDetails } = state.auth;

      const isAdmin =
        adminUserDetails?.data?.groups?.some((role) =>
          allowedGroupsCersai.includes(role)
        ) ?? false;

      const response = await getCkycDetailsRequest(ckycNo, isAdmin);
      return response;
    } catch (error: any) {
      console.log('Error : ', error);
      return rejectWithValue({
        error,
      });
    }
  }
);

export const resendCkycDetails = createAsyncThunk(
  'signup/resendCkycDetails',
  async (
    { otpIdentifier, type }: { otpIdentifier: string; type: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const { adminUserDetails } = state.auth;

      const isAdmin =
        adminUserDetails?.data?.groups?.some((role) =>
          allowedGroupsCersai.includes(role)
        ) ?? false;

      const response = await resendCkycDetailsRequest(
        { otpIdentifier, type },
        isAdmin
      );
      return response;
    } catch (error: any) {
      console.log('Error : ', error);
      return rejectWithValue({
        error,
      });
    }
  }
);

// Signup Slice
const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setOtpIdentifier: (state, action: PayloadAction<string>) => {
      state.otpIdentifier = action.payload;
    },
    clearCkycData: (state) => {
      state.ckycData = null;
      state.ckycError = null;
    },
    setCkycData: (state, action: PayloadAction<any>) => {
      state.ckycData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit signup
      .addCase(submitSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitSignUp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action?.payload?.data?.message;
        state.otpIdentifier = action.payload.data?.otp_identifier;
      })
      .addCase(submitSignUp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Submission failed';
      })
      // Fetch CKYC details
      .addCase(fetchCkycDetails.pending, (state) => {
        state.ckycLoading = true;
        state.ckycError = null;
      })
      .addCase(fetchCkycDetails.fulfilled, (state, action) => {
        state.ckycLoading = false;
        state.ckycData = action.payload;
      })
      .addCase(fetchCkycDetails.rejected, (state, action: any) => {
        state.ckycLoading = false;
        state.ckycError = action.payload || 'Failed to fetch CKYC details ';
      })
      .addCase(resendCkycDetails.pending, (state) => {
        state.ckycLoading = true;
        state.ckycError = null;
      })
      .addCase(resendCkycDetails.fulfilled, (state, action) => {
        state.ckycLoading = false;
        state.ckycData = action.payload;
      })
      .addCase(resendCkycDetails.rejected, (state, action: any) => {
        state.ckycLoading = false;
        state.ckycError = action.payload || 'Failed to fetch CKYC details';
      });
  },
});

// Export actions
export const {
  setOtpIdentifier,
  clearCkycData,
  setCkycData,
  clearError,
  clearSuccessMessage,
} = signupSlice.actions;

// Selectors
export const selectSignupLoading = (state: { signup: SignUpState }) =>
  state.signup.loading;
export const selectSignupError = (state: { signup: SignUpState }) =>
  state.signup.error;
export const selectSignupSuccess = (state: { signup: SignUpState }) =>
  state.signup.successMessage;
export const selectOtpIdentifier = (state: { signup: SignUpState }) =>
  state.signup.otpIdentifier;
export const selectCkycLoading = (state: { signup: SignUpState }) =>
  state.signup.ckycLoading;
export const selectCkycError = (state: { signup: SignUpState }) =>
  state.signup.ckycError;
export const selectCkycData = (state: { signup: SignUpState }) =>
  state.signup.ckycData;

// Export reducer
export default signupSlice.reducer;
