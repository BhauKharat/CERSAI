/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signUpRequest } from '../../api/SignUp/signUpApi';
import { API_ENDPOINTS } from 'Constant';
import { SignUpState } from '@redux/types/signupTypes';

export const submitSignUp = createAsyncThunk(
  'signup/submitSignUp',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await signUpRequest(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getCkycDetailsRequest = async (ckycNo: string) => {
  const payload = {
    ckycNo: ckycNo,
  };
  const response = await fetch(API_ENDPOINTS.CKYC_DETAILS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  // if (!response.ok) {
  //   throw new Error('Failed to fetch CKYC details');
  // }
  return response.json();
};

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

const initialState: SignUpState = {
  loading: false,
  error: null,
  otpIdentifier: null,
  successMessage: null,
  ckycLoading: false,
  ckycError: null,
  ckycData: null,
};

export const fetchCkycDetails = createAsyncThunk(
  'signup/fetchCkycDetails',
  async (ckycNo: string, { rejectWithValue }) => {
    try {
      const response = await getCkycDetailsRequest(ckycNo);
      return response;
    } catch (error: any) {
      console.log('Error : ', error);
      return rejectWithValue({
        error,
      });
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitSignUp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.otpIdentifier = action.payload.data['otp_identifier'];
      })
      .addCase(submitSignUp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Submission failed';
      })
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
        state.ckycError = action.payload || 'Failed to fetch CKYC details';
      });
  },
});

export const { setOtpIdentifier, clearCkycData, setCkycData } =
  signupSlice.actions;
export default signupSlice.reducer;
