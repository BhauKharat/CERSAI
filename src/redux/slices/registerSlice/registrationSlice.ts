/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/slices/registrationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../utils/HelperFunctions/api';
import { RegistrationState } from '../../types/register/registrationSlicTypes';
import { FormDataType } from '../../types/register/formDataTypes';
import { RootState } from '../../../redux/store';
import { API_ENDPOINTS } from 'Constant';

export const submitRegistration = createAsyncThunk<
  any,
  FormDataType,
  { state: RootState; rejectValue: string }
>('registration/submit', async (formData, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = state.auth.authToken;
    const userDetails = state.auth.userDetails;
    const appId = state.auth.reinitializeData?.applicationId;

    if (!token || !userDetails)
      return rejectWithValue('Missing authentication or user information.');

    if (!appId) {
      return rejectWithValue('Application ID not found.');
    }
    if (!token) return rejectWithValue('No authentication token found.');

    const form = new FormData();

    // 👇 Create JSON part for `entityDetails`
    const entityDetails = {
      nameOfInstitution: formData.nameOfInstitution,
      regulator: formData.regulator,
      institutionType: formData.institutionType,
      constitution: formData.constitution,
      proprietorName: formData.proprietorName,
      registrationNo: formData.registrationNo,
      panNo: formData.panNo,
      cinNo: formData.cinNo,
      llpinNo: formData.llpinNo,
      gstinNo: formData.gstinNo,
      reWebsite: formData.reWebsite,
    };

    form.append('entityDetails', JSON.stringify(entityDetails)); // ✅ this is what API wants

    // 👇 Append files if present
    if (formData.regulator_licence) {
      form.append('regulator_licence', formData.regulator_licence);
    }
    if (formData.registration_certificate) {
      form.append(
        'registration_certificate',
        formData.registration_certificate
      );
    }
    if (formData.address_proof) {
      form.append('address_proof', formData.address_proof);
    }
    if (formData.re_other_file) {
      form.append('re_other_file', formData.re_other_file);
    }
    if (formData.re_pan) {
      form.append('re_pan', formData.re_pan);
    }
    if (formData.re_cin) {
      form.append('re_cin', formData.re_cin);
    }

    const response = await Secured.post(
      API_ENDPOINTS.entity_details(appId),
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
    return rejectWithValue(error.response?.data || 'Submission failed');
  }
});

const initialState: RegistrationState = {
  formData: {},
  loading: false,
  errorsubmitRegistration: null,
  success: false,
};

console.log('in registration');
const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    resetRegitsration: () => initialState,
    updateFormData: (state, action: PayloadAction<Partial<FormDataType>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormData: (state, action: PayloadAction<Partial<FormDataType>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitRegistration.pending, (state) => {
        state.loading = true;
        state.errorsubmitRegistration = null;
        state.success = false;
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .addCase(submitRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.loading = false;

        const payload = action?.payload as any;
        console.log('Submission error payload:', payload);
        if (typeof payload === 'string') {
          state.errorsubmitRegistration = payload;
          console.log('string payload', payload);
        } else if (payload && typeof payload === 'object') {
          const baseMessage = payload?.data || 'Submission failed';
          console.log(
            'Array.isArray(payload?.data)======',
            Array.isArray(payload?.data)
          );
          const fieldErrors = Array.isArray(payload?.data)
            ? payload?.data?.details
                ?.map((e: any) => `${e?.field}: ${e?.data}`)
                .join('; ')
            : '';
          console.log('fieldErrors', fieldErrors);
          console.log('baseMessage=====', baseMessage);
          if (typeof baseMessage !== 'string') {
            state.errorsubmitRegistration = fieldErrors
              ? `${baseMessage} - ${fieldErrors}`
              : baseMessage?.details?.[0]?.issue || 'Submission failed';
          } else {
            state.errorsubmitRegistration = fieldErrors
              ? `${baseMessage} - ${fieldErrors}`
              : baseMessage;
          }
        } else {
          state.errorsubmitRegistration =
            'Submission failed due to unknown error.';
        }
      });
  },
});

export const { resetRegitsration, updateFormData, setFormData } =
  registrationSlice.actions;
export default registrationSlice.reducer;
