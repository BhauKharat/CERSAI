/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootState } from '@redux/store';
import {
  NodalOfficerFormData,
  NodalOfficerState,
} from '@redux/types/register/nodalOfficerTypes';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';

export const submitNodalOfficerDetails = createAsyncThunk<
  any,
  NodalOfficerFormData,
  {
    state: RootState;
    rejectValue: {
      fieldErrors?: Record<string, string>;
      rawMessage?: string;
    };
  }
>('nodalOfficer/submit', async (formData, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = state.auth.authToken;
    const appId = state.auth.reinitializeData?.applicationId;

    if (!token || !appId)
      return rejectWithValue({
        rawMessage: 'Missing token or application ID.',
      });

    const form = new FormData();

    const nodalOfficerDetails = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      email: formData.email,
      countryCode: formData.countryCode,
      mobileNumber: formData.mobileNumber,
      ckycNo: formData.ckycNo,
      designation: formData.designation,
      gender: formData.gender,
      citizenship: formData.citizenship,
      landline: formData.landline,
      proofOfIdentity: formData.proofOfIdentity,
      identityNumber: formData.identityNumber,
      dateOfBirth: formData.dateOfBirth,
      dateOfBoardResolution: formData.dateOfBoardResolution,
      sameAsRegisteredAddress: formData.sameAsRegisteredAddress,
      employeeCode: 'M9876543',
    };

    form.append('nodalOfficerDetails', JSON.stringify(nodalOfficerDetails));

    // Append files if present
    if (formData.no_board_resolution)
      form.append('no_board_resolution', formData.no_board_resolution);
    if (formData.no_certified_poi)
      form.append('no_certified_poi', formData.no_certified_poi);
    if (formData.no_certified_photoIdentity)
      form.append(
        'no_certified_photoIdentity',
        formData.no_certified_photoIdentity
      );

    const response = await Secured.post(
      API_ENDPOINTS.SUBMIT_NODAL_OFFICER_DETAILS(appId),
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Map API field-level errors to a simple object
    const details = error.response?.data?.data?.details;
    if (Array.isArray(details)) {
      const fieldErrors: Record<string, string> = {};
      details.forEach((err: any) => {
        const key = err.field?.replace('nodalOfficerDetails.', '');
        if (key) fieldErrors[key] = err.issue;
      });
      return rejectWithValue({
        fieldErrors,
        rawMessage: error.response?.data?.message || 'Submission failed', // ← Add this line
      });
    }

    return rejectWithValue({
      rawMessage: error.response?.data?.message || 'Submission failed', // ← Update this line
    });
  }
});

// ✅ Initial state
const initialState: NodalOfficerState = {
  formData: {} as NodalOfficerFormData,
  loading: false,
  Nodalerror: null,
  success: false,
  ckycLoading: false,
  ckycError: null,
  ckycData: null,
};
console.log('in Nodal');
// ✅ Slice
const nodalOfficerSlice = createSlice({
  name: 'nodalOfficer',
  initialState,
  reducers: {
    resetNodal: () => initialState,
    updateNodalOfficerForm: (
      state,
      action: PayloadAction<Partial<NodalOfficerFormData>>
    ) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetNodalOfficerStatus: (state) => {
      state.success = false;
      state.Nodalerror = null;
    },
    setNodalOfficerFormData(
      state,
      action: PayloadAction<NodalOfficerFormData>
    ) {
      state.formData = { ...state.formData, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitNodalOfficerDetails.pending, (state) => {
        state.loading = true;
        state.Nodalerror = null;
        state.success = false;
      })
      .addCase(submitNodalOfficerDetails.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitNodalOfficerDetails.rejected, (state, action) => {
        state.loading = false;
        state.Nodalerror = action.payload as {
          fieldErrors?: Record<string, string>;
          rawMessage?: string;
        };
      });
  },
});

export const {
  resetNodal,
  updateNodalOfficerForm,
  resetNodalOfficerStatus,
  setNodalOfficerFormData,
} = nodalOfficerSlice.actions;
export default nodalOfficerSlice.reducer;
