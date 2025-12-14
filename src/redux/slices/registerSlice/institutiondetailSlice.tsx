/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/slices/headInstitutionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../utils/HelperFunctions/api';
import { AuthState } from '../../types/register/authSliceTypes';
import { API_ENDPOINTS } from 'Constant';

interface HeadInstitutionFormData {
  [key: string]: any;
}

interface ValidationError {
  field: string;
  issue: string;
}

interface HeadInstitutionState {
  formData: HeadInstitutionFormData;
  loading: boolean;
  HOIerror: string | null;
  success: boolean;
  ckycLoading: boolean | false;
  ckycError: string | null;
  ckycDataHOI: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ckycNo: number;
    gender: string;
  } | null;
  // Add validation errors state
  validationErrors: ValidationError[] | null;
  fieldErrors: { [key: string]: string } | null;
}

const initialState: HeadInstitutionState = {
  formData: {},
  loading: false,
  HOIerror: null,
  success: false,
  ckycLoading: false,
  ckycError: null,
  ckycDataHOI: null,
  validationErrors: null,
  fieldErrors: null,
};

export const submitHeadInstitutionThunk = createAsyncThunk<
  any,
  { data: HeadInstitutionFormData },
  { state: { auth: AuthState }; rejectValue: any }
>('headInstitution/submit', async ({ data }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = state.auth.authToken;
    const appId = state.auth.reinitializeData?.applicationId;

    if (!token) {
      return rejectWithValue('Authentication token not found.');
    }

    if (!appId) {
      return rejectWithValue('Application ID not found.');
    }

    const response = await Secured.post(
      API_ENDPOINTS.HEAD_INSTITUTION_SUBMIT(appId),
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle validation errors specifically
    if (error.response?.data?.data?.details) {
      return rejectWithValue({
        message: error.response.data.message || 'Validation failed',
        errorCode: error.response.data.data.errorCode,
        details: error.response.data.data.details,
        isValidationError: true,
      });
    }

    return rejectWithValue({
      message: error.response?.data?.message || 'Submission failed',
      isValidationError: false,
    });
  }
});

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
  if (!response.ok) {
    throw new Error('Failed to fetch CKYC details');
  }
  return response.json();
};

export const fetchCkycDetails = createAsyncThunk(
  'headofInstitution/fetchCkycDetails',
  async (ckycNo: string, { rejectWithValue }) => {
    try {
      const response = await getCkycDetailsRequest(ckycNo);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

console.log('in AuthSlice');
const headInstitutionSlice = createSlice({
  name: 'headInstitution',
  initialState,
  reducers: {
    resetHOI: () => initialState,
    setHeadInstitutionFormData(
      state,
      action: PayloadAction<HeadInstitutionFormData>
    ) {
      state.formData = { ...state.formData, ...action.payload };
    },
    setCkycData: (state, action: PayloadAction<any>) => {
      state.ckycDataHOI = action.payload;
    },
    resetHeadInstitutionState: () => initialState,
    // Clear specific field error
    clearFieldError: (state, action: PayloadAction<string>) => {
      if (state.fieldErrors) {
        delete state.fieldErrors[action.payload];
      }
    },
    // Clear all validation errors
    clearValidationErrors: (state) => {
      state.validationErrors = null;
      state.fieldErrors = null;
      state.HOIerror = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitHeadInstitutionThunk.pending, (state) => {
        state.loading = true;
        state.HOIerror = null;
        state.success = false;
        state.validationErrors = null;
        state.fieldErrors = null;
      })
      .addCase(submitHeadInstitutionThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.validationErrors = null;
        state.fieldErrors = null;
      })
      .addCase(submitHeadInstitutionThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        const payload = action.payload as any;

        if (payload?.isValidationError && payload?.details) {
          // Combine all issues into one message
          const issues = payload.details
            .map((error: any) => error.issue)
            .join(', ');
          state.HOIerror = issues;
        } else {
          state.HOIerror = payload?.message || 'Error occurred';
        }
      })
      .addCase(fetchCkycDetails.pending, (state) => {
        state.ckycLoading = true;
        state.ckycError = null;
      })
      .addCase(fetchCkycDetails.fulfilled, (state, action) => {
        state.ckycLoading = false;
        state.ckycDataHOI = action.payload;
      })
      .addCase(fetchCkycDetails.rejected, (state, action: any) => {
        state.ckycLoading = false;
        state.ckycError = action.payload || 'Failed to fetch CKYC details';
      });
  },
});

export const {
  resetHOI,
  setHeadInstitutionFormData,
  setCkycData,
  resetHeadInstitutionState,
  clearFieldError,
  clearValidationErrors,
} = headInstitutionSlice.actions;

export default headInstitutionSlice.reducer;
