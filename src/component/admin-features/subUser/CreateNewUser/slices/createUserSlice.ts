/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// createUserSlice.ts - Updated slice with OTP verification and User Management APIs

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../../../redux/store';

// Types
export interface SendOtpRequest {
  email: string;
  mobile: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  httpCode: number;
  httpStatus: string;
  localDateTime: string;
  data: {
    successResponse: {
      emailOtp: string;
      mobileOtp: string;
    };
  };
}

export interface VerifyOtpRequest {
  emailOrMobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  httpCode: number;
  httpStatus: string;
  localDateTime: string;
  data: any;
}

export interface CreateUserRequest {
  user: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    designation: string;
    emailId: string;
    citizenship: string;
    ckycNumber: string;
    countryCode: string;
    mobileNumber: string;
    proofOfIdentity: string;
    proofOfIdentityNumber: string;
    dob: string;
    gender: string;
    employeeCode: string;
    role: string;
    functionalityMapped: string;
  };
  address: {
    line1: string;
    line2: string;
    line3: string;
    countryCode: string;
    state: string;
    district: string;
    city: string;
    pincode: string;
    pincodeInCaseOfOthers?: string;
  };
}

// Deactivate API Types
export interface DeactivateUserRequest {
  userId: string;
  reason: string;
}

export interface DeactivateUserResponse {
  userId: string;
  workflowId: string;
  operation: string;
  status: string;
  message: string;
  operationTime: string;
  requiresApproval: boolean;
}

// Suspend API Types
export interface SuspendUserRequest {
  userId: string;
  reason: string;
  suspensionStartDate: string; // Format: "YYYY-MM-DD"
  suspensionEndDate: string; // Format: "YYYY-MM-DD"
}

export interface SuspendUserResponse {
  userId: string;
  workflowId: string;
  operation: string;
  status: string;
  message: string;
  operationTime: string;
  requiresApproval: boolean;
}

// Revoke Suspension API Types
export interface RevokeSuspensionRequest {
  userId: string;
  reason: string;
}

export interface RevokeSuspensionResponse {
  userId: string;
  workflowId: string;
  operation: string;
  status: string;
  message: string;
  operationTime: string;
  requiresApproval: boolean;
}

export interface ValidationData {
  email: string;
  mobile: string;
  countryCode: string;
}

export interface ApiError {
  errorCode: string;
  errorMessage: string;
  httpCode?: number;
  httpStatus?: string;
}

// State interface
interface CreateUserState {
  // Loading states
  createLoading: boolean;
  validationLoading: boolean;
  sendOtpLoading: boolean;
  verifyOtpLoading: boolean;
  deactivateLoading: boolean;
  suspendLoading: boolean;
  revokeSuspensionLoading: boolean;

  // Success states
  createSuccess: boolean;
  validationSuccess: boolean;
  sendOtpSuccess: boolean;
  verifyOtpSuccess: boolean;
  deactivateSuccess: boolean;
  suspendSuccess: boolean;
  revokeSuspensionSuccess: boolean;

  // Error states
  createError: ApiError | null;
  validationError: ApiError | null;
  sendOtpError: ApiError | null;
  verifyOtpError: ApiError | null;
  deactivateError: ApiError | null;
  suspendError: ApiError | null;
  revokeSuspensionError: ApiError | null; // Fixed: was revokeSuspensionSuccess

  // Data
  createdUser: any | null;
  formData: CreateUserRequest | null;
  validationData: ValidationData | null;
  otpData: SendOtpResponse | null;
  verifyOtpData: VerifyOtpResponse | null;
  deactivateData: DeactivateUserResponse | null;
  suspendData: SuspendUserResponse | null;
  revokeSuspensionData: RevokeSuspensionResponse | null;
}

// Initial state
const initialState: CreateUserState = {
  createLoading: false,
  validationLoading: false,
  sendOtpLoading: false,
  verifyOtpLoading: false,
  deactivateLoading: false,
  suspendLoading: false,
  revokeSuspensionLoading: false,

  createSuccess: false,
  validationSuccess: false,
  sendOtpSuccess: false,
  verifyOtpSuccess: false,
  deactivateSuccess: false,
  suspendSuccess: false,
  revokeSuspensionSuccess: false,

  createError: null,
  validationError: null,
  sendOtpError: null,
  verifyOtpError: null,
  deactivateError: null,
  suspendError: null,
  revokeSuspensionError: null,

  createdUser: null,
  formData: null,
  validationData: null,
  otpData: null,
  verifyOtpData: null,
  deactivateData: null,
  suspendData: null,
  revokeSuspensionData: null,
};

// API base URL - you might want to move this to a config file
const API_BASE_URL = 'http://10.31.53.53:8083/api/v1';

// Async thunks
export const sendOtp = createAsyncThunk<
  SendOtpResponse,
  SendOtpRequest,
  { rejectValue: ApiError }
>('createUser/sendOtp', async (otpRequest, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp/sendOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue({
        errorCode: data.errorCode || response.status.toString(),
        errorMessage: data.errorMessage || data.message || 'Failed to send OTP',
        httpCode: response.status,
        httpStatus: response.statusText,
      });
    }

    return data;
  } catch (error) {
    return rejectWithValue({
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Network error occurred while sending OTP',
    });
  }
});

export const verifyOtp = createAsyncThunk<
  VerifyOtpResponse,
  VerifyOtpRequest,
  { rejectValue: ApiError }
>('createUser/verifyOtp', async (verifyRequest, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp/verifyOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyRequest),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return rejectWithValue({
        errorCode: data.errorCode || response.status.toString(),
        errorMessage: data.message || 'OTP verification failed',
        httpCode: response.status,
        httpStatus: response.statusText,
      });
    }

    return data;
  } catch (error) {
    return rejectWithValue({
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Network error occurred while verifying OTP',
    });
  }
});

export const validateUserData = createAsyncThunk<
  any,
  ValidationData,
  { rejectValue: ApiError }
>(
  'createUser/validateUserData',
  async (validationData, { rejectWithValue }) => {
    try {
      // Replace with your actual validation API endpoint
      const response = await fetch(`${API_BASE_URL}/user/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue({
          errorCode: data.errorCode || response.status.toString(),
          errorMessage:
            data.errorMessage || data.message || 'Validation failed',
          httpCode: response.status,
          httpStatus: response.statusText,
        });
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Network error occurred during validation',
      });
    }
  }
);

export const createUser = createAsyncThunk<
  any,
  CreateUserRequest,
  { rejectValue: ApiError }
>('createUser/createUser', async (userData, { rejectWithValue }) => {
  try {
    // Replace with your actual create user API endpoint
    const response = await fetch(`${API_BASE_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue({
        errorCode: data.errorCode || response.status.toString(),
        errorMessage:
          data.errorMessage || data.message || 'Failed to create user',
        httpCode: response.status,
        httpStatus: response.statusText,
      });
    }

    return data;
  } catch (error) {
    return rejectWithValue({
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Network error occurred while creating user',
    });
  }
});

// Deactivate User API
export const deactivateUser = createAsyncThunk<
  DeactivateUserResponse,
  DeactivateUserRequest,
  { rejectValue: ApiError }
>(
  'createUser/deactivateUser',
  async (deactivateRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deactivateRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue({
          errorCode: data.errorCode || response.status.toString(),
          errorMessage:
            data.errorMessage || data.message || 'Failed to deactivate user',
          httpCode: response.status,
          httpStatus: response.statusText,
        });
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Network error occurred while deactivating user',
      });
    }
  }
);

// Suspend User API
export const suspendUser = createAsyncThunk<
  SuspendUserResponse,
  SuspendUserRequest,
  { rejectValue: ApiError }
>('createUser/suspendUser', async (suspendRequest, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(suspendRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue({
        errorCode: data.errorCode || response.status.toString(),
        errorMessage:
          data.errorMessage || data.message || 'Failed to suspend user',
        httpCode: response.status,
        httpStatus: response.statusText,
      });
    }

    return data;
  } catch (error) {
    return rejectWithValue({
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Network error occurred while suspending user',
    });
  }
});

// Revoke Suspension API
export const revokeSuspension = createAsyncThunk<
  RevokeSuspensionResponse,
  RevokeSuspensionRequest,
  { rejectValue: ApiError }
>('createUser/revokeSuspension', async (revokeRequest, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/revoke-suspension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(revokeRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue({
        errorCode: data.errorCode || response.status.toString(),
        errorMessage:
          data.errorMessage || data.message || 'Failed to revoke suspension',
        httpCode: response.status,
        httpStatus: response.statusText,
      });
    }

    return data;
  } catch (error) {
    return rejectWithValue({
      errorCode: 'NETWORK_ERROR',
      errorMessage: 'Network error occurred while revoking suspension',
    });
  }
});

// Slice
const createUserSlice = createSlice({
  name: 'createUser',
  initialState,
  reducers: {
    // Clear actions
    clearError: (state) => {
      state.createError = null;
    },
    clearValidationError: (state) => {
      state.validationError = null;
    },
    clearSendOtpError: (state) => {
      state.sendOtpError = null;
    },
    clearVerifyOtpError: (state) => {
      state.verifyOtpError = null;
    },
    clearDeactivateError: (state) => {
      state.deactivateError = null;
    },
    clearSuspendError: (state) => {
      state.suspendError = null;
    },
    clearRevokeSuspensionError: (state) => {
      state.revokeSuspensionError = null;
    },
    clearSuccess: (state) => {
      state.createSuccess = false;
    },
    clearValidationSuccess: (state) => {
      state.validationSuccess = false;
    },
    clearSendOtpSuccess: (state) => {
      state.sendOtpSuccess = false;
    },
    clearVerifyOtpSuccess: (state) => {
      state.verifyOtpSuccess = false;
    },
    clearDeactivateSuccess: (state) => {
      state.deactivateSuccess = false;
    },
    clearSuspendSuccess: (state) => {
      state.suspendSuccess = false;
    },
    clearRevokeSuspensionSuccess: (state) => {
      state.revokeSuspensionSuccess = false;
    },

    // Data setters
    setFormData: (state, action: PayloadAction<CreateUserRequest>) => {
      state.formData = action.payload;
    },
    setValidationData: (state, action: PayloadAction<ValidationData>) => {
      state.validationData = action.payload;
    },

    // Reset state
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Send OTP cases
    builder
      .addCase(sendOtp.pending, (state) => {
        state.sendOtpLoading = true;
        state.sendOtpError = null;
        state.sendOtpSuccess = false;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.sendOtpLoading = false;
        state.sendOtpSuccess = true;
        state.otpData = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.sendOtpLoading = false;
        state.sendOtpError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });

    // Verify OTP cases
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.verifyOtpLoading = true;
        state.verifyOtpError = null;
        state.verifyOtpSuccess = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpSuccess = true;
        state.verifyOtpData = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.verifyOtpError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });

    // Validate user data cases
    builder
      .addCase(validateUserData.pending, (state) => {
        state.validationLoading = true;
        state.validationError = null;
        state.validationSuccess = false;
      })
      .addCase(validateUserData.fulfilled, (state) => {
        state.validationLoading = false;
        state.validationSuccess = true;
      })
      .addCase(validateUserData.rejected, (state, action) => {
        state.validationLoading = false;
        state.validationError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });

    // Create user cases
    builder
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.createdUser = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });

    // Deactivate user cases
    builder
      .addCase(deactivateUser.pending, (state) => {
        state.deactivateLoading = true;
        state.deactivateError = null;
        state.deactivateSuccess = false;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.deactivateLoading = false;
        state.deactivateSuccess = true;
        state.deactivateData = action.payload;
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.deactivateLoading = false;
        state.deactivateError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });

    // Suspend user cases
    builder
      .addCase(suspendUser.pending, (state) => {
        state.suspendLoading = true;
        state.suspendError = null;
        state.suspendSuccess = false;
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        state.suspendLoading = false;
        state.suspendSuccess = true;
        state.suspendData = action.payload;
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.suspendLoading = false;
        state.suspendError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });

    // Revoke suspension cases
    builder
      .addCase(revokeSuspension.pending, (state) => {
        state.revokeSuspensionLoading = true;
        state.revokeSuspensionError = null;
        state.revokeSuspensionSuccess = false;
      })
      .addCase(revokeSuspension.fulfilled, (state, action) => {
        state.revokeSuspensionLoading = false;
        state.revokeSuspensionSuccess = true;
        state.revokeSuspensionData = action.payload;
      })
      .addCase(revokeSuspension.rejected, (state, action) => {
        state.revokeSuspensionLoading = false;
        state.revokeSuspensionError = action.payload || {
          errorCode: 'UNKNOWN_ERROR',
          errorMessage: 'An unknown error occurred',
        };
      });
  },
});

export const {
  clearError,
  clearValidationError,
  clearSendOtpError,
  clearVerifyOtpError,
  clearDeactivateError,
  clearSuspendError,
  clearRevokeSuspensionError,
  clearSuccess,
  clearValidationSuccess,
  clearSendOtpSuccess,
  clearVerifyOtpSuccess,
  clearDeactivateSuccess,
  clearSuspendSuccess,
  clearRevokeSuspensionSuccess,
  setFormData,
  setValidationData,
  resetState,
} = createUserSlice.actions;

// Selectors
export const selectCreateUserState = (state: RootState) => state.createUser;
export const selectVerifyOtpLoading = (state: RootState) =>
  state.createUser.verifyOtpLoading;
export const selectVerifyOtpError = (state: RootState) =>
  state.createUser.verifyOtpError;
export const selectVerifyOtpSuccess = (state: RootState) =>
  state.createUser.verifyOtpSuccess;

export const selectDeactivateLoading = (state: RootState) =>
  state.createUser.deactivateLoading;
export const selectDeactivateError = (state: RootState) =>
  state.createUser.deactivateError;
export const selectDeactivateSuccess = (state: RootState) =>
  state.createUser.deactivateSuccess;
export const selectDeactivateData = (state: RootState) =>
  state.createUser.deactivateData;

export const selectSuspendLoading = (state: RootState) =>
  state.createUser.suspendLoading;
export const selectSuspendError = (state: RootState) =>
  state.createUser.suspendError;
export const selectSuspendSuccess = (state: RootState) =>
  state.createUser.suspendSuccess;
export const selectSuspendData = (state: RootState) =>
  state.createUser.suspendData;

export const selectRevokeSuspensionLoading = (state: RootState) =>
  state.createUser.revokeSuspensionLoading;
export const selectRevokeSuspensionError = (state: RootState) =>
  state.createUser.revokeSuspensionError;
export const selectRevokeSuspensionSuccess = (state: RootState) =>
  state.createUser.revokeSuspensionSuccess;
export const selectRevokeSuspensionData = (state: RootState) =>
  state.createUser.revokeSuspensionData;

export default createUserSlice.reducer;
