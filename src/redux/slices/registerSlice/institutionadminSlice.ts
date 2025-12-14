/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/slices/adminOfficerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../utils/HelperFunctions/api';
import { AuthState } from '../../types/register/authSliceTypes';
import {
  AdminOfficerState,
  AdminDetails,
} from '../../types/register/institutionadminDetailsTypes';
import { API_ENDPOINTS } from 'Constant';

// Add interface for validation error details
interface ValidationError {
  field: string;
  issue: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  data?: {
    errorCode: string;
    errorMessage: string;
    details: ValidationError[];
  };
}

const initialState: AdminOfficerState = {
  adminOne: {},
  adminTwo: {},
  loading: false,
  errorInstitutionadminDetails: null,
  success: false,
  ckycLoading: false,
  ckycError: null,
  ckycDataAdminOne: null,
  ckycDataAdminTwo: null,
  // Add field for detailed validation errors
  validationErrors: null,
  ckycVerified: {
    adminOne: false,
    adminTwo: false,
  },
};

export const getCkycDetailsRequest = async (ckycNo: string) => {
  const response = await fetch(API_ENDPOINTS.CKYC_DETAILS_HOI(ckycNo));
  if (!response.ok) {
    throw new Error('Failed to fetch CKYC details');
  }
  return response.json();
};

export const fetchCkycDetails = createAsyncThunk(
  'signup/fetchCkycDetails',
  async (
    { ckycNo, role }: { ckycNo: string; role: 'adminOne' | 'adminTwo' },
    { rejectWithValue }
  ) => {
    try {
      const response = await getCkycDetailsRequest(ckycNo);
      return { role, data: response.data };
    } catch (error: any) {
      return rejectWithValue({ role, message: error.message });
    }
  }
);

// Helper function to format validation errors for display
// const formatValidationErrors = (details: ValidationError[]): string => {
//   return details.map(error => `${error.field}: ${error.issue}`).join('\n');
// };

// Async Thunk to submit data
export const submitAdminOfficers = createAsyncThunk<
  any,
  {
    adminOne: AdminDetails;
    adminTwo: AdminDetails;
    iau_one_certified_poi: File;
    iau_one_certified_photoIdentity: File;
    iau_two_certified_poi: File;
    iau_two_certified_photoIdentity: File;
    iau_one_authorization_letter: File;
    iau_two_authorization_letter: File;
  },
  {
    state: { auth: AuthState };
    rejectValue: { message: string; validationErrors?: ValidationError[] };
  }
>(
  'adminOfficer/submitAdminOfficers',
  async (
    {
      adminOne,
      adminTwo,
      iau_one_certified_poi,
      iau_one_certified_photoIdentity,
      iau_two_certified_poi,
      iau_two_certified_photoIdentity,
      iau_one_authorization_letter,
      iau_two_authorization_letter,
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      const appId = state.auth.reinitializeData?.applicationId;

      if (!token)
        return rejectWithValue({ message: 'Authentication token not found.' });
      if (!appId)
        return rejectWithValue({ message: 'Application ID not found.' });

      const formData = new FormData();
      formData.append(
        'institutionalAdminDetails',
        JSON.stringify({ adminOne, adminTwo })
      );
      formData.append('iau_one_certified_poi', iau_one_certified_poi);
      formData.append(
        'iau_one_certified_photoIdentity',
        iau_one_certified_photoIdentity
      );
      formData.append('iau_two_certified_poi', iau_two_certified_poi);
      formData.append(
        'iau_two_certified_photoIdentity',
        iau_two_certified_photoIdentity
      );
      formData.append(
        'iau_one_authorization_letter',
        iau_one_authorization_letter
      );
      formData.append(
        'iau_two_authorization_letter',
        iau_two_authorization_letter
      );

      const response = await Secured.post(
        API_ENDPOINTS.SUBMIT_ADMIN_OFFICERS(appId),
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const responseData: ErrorResponse = response.data;

      if (!responseData.success) {
        // Check if there are detailed validation errors
        if (
          responseData.data?.details &&
          Array.isArray(responseData.data.details)
        ) {
          return rejectWithValue({
            message: responseData.message,
            validationErrors: responseData.data.details,
          });
        }

        // Fallback to generic error message
        return rejectWithValue({
          message: responseData.message || 'Submission failed',
        });
      }

      return responseData;
    } catch (err: any) {
      // Handle network/axios errors
      const errorResponse: ErrorResponse = err.response?.data;

      if (
        errorResponse?.data?.details &&
        Array.isArray(errorResponse.data.details) &&
        errorResponse.data.details.length > 0
      ) {
        // Get only the first validation error
        const firstError = errorResponse.data.details[0];
        return rejectWithValue({
          message: firstError.issue, // Use the first error's issue as the main message
          validationErrors: [firstError], // Store only the first error
        });
      }

      return rejectWithValue({
        message: err.response?.data?.message || 'Submission failed',
      });
    }
  }
);
console.log('in institutionAdminSlice');
// Slice
const adminOfficerSlice = createSlice({
  name: 'adminOfficer',
  initialState,
  reducers: {
    setAdminOne(state, action: PayloadAction<Partial<AdminDetails>>) {
      state.adminOne = { ...state.adminOne, ...action.payload };
    },
    setAdminTwo(state, action: PayloadAction<Partial<AdminDetails>>) {
      state.adminTwo = { ...state.adminTwo, ...action.payload };
    },
    resetAdminOfficerState: () => initialState,
    // Add reducer to clear validation errors
    clearValidationErrors(state) {
      state.validationErrors = null;
    },
    setCkycVerified(
      state,
      action: PayloadAction<{
        section: 'adminOne' | 'adminTwo';
        status: boolean;
      }>
    ) {
      const { section, status } = action.payload;
      state.ckycVerified[section] = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAdminOfficers.pending, (state) => {
        state.loading = true;
        state.errorInstitutionadminDetails = null;
        state.validationErrors = null;
        state.success = false;
      })
      .addCase(submitAdminOfficers.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.validationErrors = null;
      })
      .addCase(submitAdminOfficers.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.errorInstitutionadminDetails = action.payload.message;
          state.validationErrors = action.payload.validationErrors || null;
        } else {
          state.errorInstitutionadminDetails = 'Submission failed';
        }
      })
      .addCase(fetchCkycDetails.pending, (state) => {
        state.ckycLoading = true;
        state.ckycError = null;
      })
      .addCase(fetchCkycDetails.fulfilled, (state, action) => {
        state.ckycLoading = false;
        const { role, data } = action.payload;
        if (role === 'adminOne') {
          state.ckycDataAdminOne = data;
          state.ckycVerified.adminOne = true;
        } else {
          state.ckycDataAdminTwo = data;
          state.ckycVerified.adminTwo = true;
        }
      })
      .addCase(fetchCkycDetails.rejected, (state, action: any) => {
        state.ckycLoading = false;
        state.ckycError = action.payload || 'Failed to fetch CKYC details';
        // ✅ Set verification status to false on failure
        const role = action.meta.arg.role;
        if (role === 'adminOne') {
          state.ckycVerified.adminOne = false;
        } else {
          state.ckycVerified.adminTwo = false;
        }
      });
  },
});

export const {
  setAdminOne,
  setAdminTwo,
  resetAdminOfficerState,
  clearValidationErrors,
  setCkycVerified,
} = adminOfficerSlice.actions;
export default adminOfficerSlice.reducer;
