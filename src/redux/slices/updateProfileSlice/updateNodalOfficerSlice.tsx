/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/slices/otpModalSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from 'Constant';
import { ValidateOtpSuccessResponse } from '../../types/otpModalTypes';
import { Secured } from '../../../utils/HelperFunctions/api';
import { RootState } from '@redux/store';

interface SignupState {
  isLoading: boolean;
  validationResult: ValidateOtpSuccessResponse | null;
  error: string | null;
}
interface AddressDetailsPayload {
  token: any;
}

interface AddressDetailsResponse {
  // Replace this with the actual response shape from your API
  data: any;
}

const getNodalOfficerDetailsRequest = async (token: any) => {
  const response = await fetch(API_ENDPOINTS.update_address_get, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  console.log('here is the data we are getting', data);
  if (!response.ok) {
    throw new Error('Failed to fetch CKYC details');
  }
  return data;
};
const getCkycDetailsRequest = async (ckycNo: string) => {
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
  return response.json();
};

export const fetchCkycDetailsUpdate = createAsyncThunk(
  'update/fetchCkycDetails',
  async (ckycNo: string, { rejectWithValue }) => {
    try {
      const response = await getCkycDetailsRequest(ckycNo);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface NodalOfficerDetails {
  citizenship: string;
  ckycNumber: string;
  countryCode: string;
  dateOfBirth: string;
  dateOfBoardResolution: string;
  designation: string;
  email: string;
  firstName: string;
  gender: string;
  identityNumber: string;
  landline: string | null;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  proofOfIdentity: string;
  sameAsRegisteredAddress: boolean;
  title: string;
  boardResolution?: File | undefined | null;
  certifiedPic?: File | undefined | null;
  certifiedPoi?: File | undefined | null;
}
export const submitNodalOfficerUpdateDetails = createAsyncThunk<
  any,
  NodalOfficerDetails,
  {
    state: RootState;
    rejectValue: {
      fieldErrors?: Record<string, string>;
      rawMessage?: string;
      error_code?: string;
    };
  }
>(
  'nodalOfficer/Updatesubmit',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      console.log(token, 'tokkk');
      // if (!token || !appId)
      //   return rejectWithValue({
      //     rawMessage: 'Missing token or application ID.',
      //   });

      const form = new FormData();

      const nodalOfficerDetails = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        countryCode: formData.countryCode,
        mobileNumber: formData.mobileNumber,
        ckycNo: formData.ckycNumber,
        designation: formData.designation,
        gender: formData.gender,
        citizenship: formData.citizenship,
        landline: formData.landline,
        proofOfIdentity: formData.proofOfIdentity,
        identityNumber: formData.identityNumber,
        dateOfBirth: formData.dateOfBirth,
        sameAsRegisteredAddress: formData.sameAsRegisteredAddress,
        dateOfBoardResolution: formData.dateOfBoardResolution,
      };

      form.append('nodalOfficerDetails', JSON.stringify(nodalOfficerDetails));
      console.log(JSON.stringify(nodalOfficerDetails), 'stringg');
      // Append files if present
      if (formData.boardResolution)
        form.append('no_board_resolution', formData.boardResolution);
      if (formData.certifiedPoi)
        form.append('no_certified_poi', formData.certifiedPoi);
      if (formData.certifiedPic)
        form.append('no_certified_photoIdentity', formData.certifiedPic);

      const response = await Secured.put(
        API_ENDPOINTS.update_nodal_officer_put,
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
        error_code: error.response?.data?.data?.errorCode,
        rawMessage:
          error.response?.data?.data?.errorMessage || 'Submission failed', // ← Update this line
      });
    }
  }
);

export const fetchUpdateNodalOfficerDetails = createAsyncThunk<
  AddressDetailsResponse, // Return type of the fulfilled action
  AddressDetailsPayload, // Argument type passed to the thunk
  {
    rejectValue: { error: any }; // Shape of the rejected value
  }
>(
  'update/fetchUpdateNoalOfficerDetails',
  async ({ token }, { rejectWithValue }) => {
    try {
      const data = await getNodalOfficerDetailsRequest(token);
      return data;
    } catch (error: any) {
      console.error('Error:', error);
      return rejectWithValue({ error });
    }
  }
);

// console.log("here is final data", fetchUpdateAddressDetails.fulfilled)

const initialState: SignupState = {
  isLoading: false,
  validationResult: null,
  error: null,
};

const updateNodalOfficerSlice = createSlice({
  name: 'updateNodalOfficer',
  initialState,
  reducers: {
    setUpdateSlice: (state) => {
      console.log('this state called', state);
    },
  },
});

export const { setUpdateSlice } = updateNodalOfficerSlice.actions;

export default updateNodalOfficerSlice.reducer;
