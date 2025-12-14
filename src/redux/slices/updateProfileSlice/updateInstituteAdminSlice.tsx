/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from 'Constant';
import { RootState } from '@redux/store';
import {
  AdminState,
  InstituteAdminPayload,
  InstituteAdminResponse,
  InstituteAdminUpdateRequest,
  UpdateAddressPayload,
} from './instituteAdmin';
import { Secured } from '../../../utils/HelperFunctions/api';

const getAddressDetailsRequest = async (token: any) => {
  const response = await fetch(API_ENDPOINTS.update_address_get, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error('Failed to fetch CKYC details');
  }
  return data.data;
};

export const submitInstituteAdminUpdateDetails = createAsyncThunk<
  any,
  InstituteAdminUpdateRequest,
  {
    state: RootState;
    rejectValue: {
      fieldErrors?: Record<string, string>;
      rawMessage?: string;
    };
  }
>('instituteAdmin/Update', async (formData, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const token = state.auth.authToken;
    const form = new FormData();
    const institutionalAdminDetails = {
      adminOne: {
        title: formData.adminOne.title,
        firstName: formData.adminOne.firstName,
        middleName: formData.adminOne.middleName,
        lastName: formData.adminOne.lastName,
        designation: formData.adminOne.designation,
        emailId: formData.adminOne.emailId,
        ckycNumber: formData.adminOne.ckycNumber,
        gender: formData.adminOne.gender,
        citizenship: formData.adminOne.citizenship,
        countryCode: formData.adminOne.countryCode,
        mobileNo: formData.adminOne.mobileNo,
        landline: formData.adminOne.landline,
        proofOfIdentity: formData.adminOne.proofOfIdentity,
        identityNumber: formData.adminOne.identityNumber,
        dateOfBirth: formData.adminOne.dateOfBirth,
        employeeCode: formData.adminOne.employeeCode,
        sameAsRegisteredAddress: formData.adminOne.sameAsRegisteredAddress,
        authorizationLetterDetails:
          formData.adminOne.authorizationLetterDetails,
        dateOfAuthorization: formData.adminOne.dateOfAuthorization,
      },
      adminTwo: {
        title: formData.adminTwo.title,
        firstName: formData.adminTwo.firstName,
        middleName: formData.adminTwo.middleName,
        lastName: formData.adminTwo.lastName,
        designation: formData.adminTwo.designation,
        emailId: formData.adminTwo.emailId,
        ckycNumber: formData.adminTwo.ckycNumber,
        gender: formData.adminTwo.gender,
        citizenship: formData.adminTwo.citizenship,
        countryCode: formData.adminTwo.countryCode,
        mobileNo: formData.adminTwo.mobileNo,
        landline: formData.adminTwo.landline,
        proofOfIdentity: formData.adminTwo.proofOfIdentity,
        identityNumber: formData.adminTwo.identityNumber,
        dateOfBirth: formData.adminTwo.dateOfBirth,
        employeeCode: formData.adminTwo.employeeCode,
        sameAsRegisteredAddress: formData.adminTwo.sameAsRegisteredAddress,
        authorizationLetterDetails:
          formData.adminTwo.authorizationLetterDetails,
        dateOfAuthorization: formData.adminTwo.dateOfAuthorization,
      },
      updateState: formData.updateState,
    };

    form.append(
      'institutionalAdminDetails',
      JSON.stringify(institutionalAdminDetails)
    );
    if (formData.iau_one_certified_poi)
      form.append('iau_one_certified_poi', formData.iau_one_certified_poi);
    if (formData.iau_one_certified_photoIdentity)
      form.append(
        'iau_one_certified_photoIdentity',
        formData.iau_one_certified_photoIdentity
      );
    if (formData.iau_one_authorization_letter)
      form.append(
        'iau_one_authorization_letter',
        formData.iau_one_authorization_letter
      );
    if (formData.iau_two_certified_poi)
      form.append('iau_two_certified_poi', formData.iau_two_certified_poi);
    if (formData.iau_two_certified_photoIdentity)
      form.append(
        'iau_two_certified_photoIdentity',
        formData.iau_two_certified_photoIdentity
      );
    if (formData.iau_two_authorization_letter)
      form.append(
        'iau_two_authorization_letter',
        formData.iau_two_authorization_letter
      );

    const response = await Secured.put(
      API_ENDPOINTS.update_institute_admin_post,
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

export const fetchUpdateAdminDetails = createAsyncThunk<
  InstituteAdminResponse,
  InstituteAdminPayload,
  {
    rejectValue: { error: string };
  }
>('update/fetchUpdateAdminDetails', async ({ token }, { rejectWithValue }) => {
  try {
    const data = await getAddressDetailsRequest(token);
    return data;
  } catch (error: any) {
    console.error('Error:', error);
    return rejectWithValue({ error });
  }
});

export const updateAddressProfile = createAsyncThunk<
  any,
  UpdateAddressPayload,
  {
    state: RootState;
    rejectValue: {
      fieldErrors?: Record<string, string>;
      rawMessage?: string;
    };
  }
>('address/updateEntityProfile', async (payload, { rejectWithValue }) => {
  try {
    const response = await fetch(
      API_ENDPOINTS.update_address_put_report_entity,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`,
        },
        body: JSON.stringify({
          registeredAddress: payload.registeredAddress,
          sameAsRegistrationAddress: payload.sameAsRegistrationAddress,
          ...(payload.correspondenceAddress && {
            correspondanceAddress: payload.correspondenceAddress,
          }),
        }),
      }
    );
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData?.message || 'Failed to update address');
    }
    return responseData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update address';
    return rejectWithValue({ rawMessage: errorMessage });
  }
});

const initialState: AdminState = {
  entityDetails: null,
  correspondenceAddressSameAsRegisteredAddress: false,
  registeredAddress: null,
  correspondanceAddress: null,
  headOfInstitutionDetails: null,
  nodalOfficerDetails: null,
  adminOneDetails: null,
  adminTwoDetails: null,
  documents: [],
  pdfData: null,
  loading: false,
  error: null,
  isSubmitting: false,
  submitError: null,
  submittedAt: null,
  status: null,
  isEsigned: false,

  updationRequestId: null,
  acknowledgementNo: null,
  operationalStatus: null,
  workflowStatus: null,
  lastUpdated: null,
};

const updateInstituteAdminSlice = createSlice({
  name: 'InstituteAdmin',
  initialState,
  reducers: {
    resetPreview: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpdateAdminDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdateAdminDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.entityDetails = action.payload.entityDetails;
        state.documents = action.payload.documents;
        state.registeredAddress = action.payload.registeredAddress;
        state.correspondanceAddress = action.payload.correspondanceAddress;
        state.headOfInstitutionDetails =
          action.payload.headOfInstitutionDetails;
        state.nodalOfficerDetails = action.payload.nodalOfficerDetails;
        state.adminOneDetails = action.payload.adminOneDetails;
        state.adminTwoDetails = action.payload.adminTwoDetails;
        state.correspondenceAddressSameAsRegisteredAddress =
          action.payload.correspondenceAddressSameAsRegisteredAddress;
        state.submittedAt = action.payload.applicationSubmittedAt || null;
        state.status = action.payload.approvalStatus || null;
        state.entityDetails = action.payload.entityDetails;
        state.updationRequestId = action.payload.updationRequestId;
        state.acknowledgementNo = action.payload.acknowledgementNo;
        state.operationalStatus = action.payload.operationalStatus;
        state.workflowStatus = action.payload.workflowStatus;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchUpdateAdminDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.payload?.error || 'Login failed';
      });
  },
});
export const { resetPreview } = updateInstituteAdminSlice.actions;

export default updateInstituteAdminSlice.reducer;
