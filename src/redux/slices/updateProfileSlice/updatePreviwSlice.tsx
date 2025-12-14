/* eslint-disable @typescript-eslint/no-explicit-any */
// redux/slices/otpModalSlice.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from 'Constant';
import { Secured } from '../../../utils/HelperFunctions/api/index'; // Assuming you're using a secured Axios helper
import { AuthState } from '@redux/types/register/authSliceTypes';
// import {
//   ValidateOtpSuccessResponse,
// } from '../../types/otpModalTypes';
// import { Secured } from '../../../utils/HelperFunctions/api';
import { RootState } from '@redux/store';
interface AddressDetailsPayload {
  token: any;
}

interface AddressDetailsResponse {
  // Replace this with the actual response shape from your API
  data: any;
}
const getPreviewDetailsRequest = async (token: any) => {
  // let token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfUGlzNUo2Ym5OMlZUY0lBY3FhbXBQSkJkUVpwRklva05CYXVBVHVESC1nIn0.eyJleHAiOjE3NTgxODI5MzIsImlhdCI6MTc1ODE3OTMzMiwianRpIjoib25ydHJvOjEwZGZiNjFhLTM5OTQtNDlhNi04MTBjLWU4MGE0MWJkNTAyOSIsImlzcyI6Imh0dHA6Ly8xMC4zMS41My41Mzo4MDgwL3JlYWxtcy9DRVJTQUkiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiN2Q0M2JlNjMtMWRhMi00MDcwLTg2ZjMtMDBkNTNiNDJjM2YzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiQ0VSU0FJX1VTRVJfTUFOQUdFTUVOVCIsInNpZCI6Ijc5NDczYWE5LWU5ZWQtNGQ5MC04Y2JkLTdkZGFjN2VkNzMzZCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1jZXJzYWkiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJncm91cF8mX2F0dHJpYnV0ZV9jbGFpbSBwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJ1c2VyX2RldGFpbHMiOnsiZW1haWxfaWQiOiJhYmhheTEyMzQ1NkB5b3BtYWlsLmNvbSIsInJlX2lkIjoiNzc4MDhlZTQtNGViZC00ODg3LWI2ZjctNzEyOGUzNjIxYjI4IiwidXNlcl90eXBlIjoicmVnaXN0cmF0aW9uRW50aXR5IiwidXNlcl9pZCI6IjIwNGE3OGFlLTRhNWEtNDIzZS1iZTQ1LWRiN2M2MGZkOTgwMyIsIm1vYmlsZV9ubyI6Ijg4OTkwMDY2NzciLCJpc19pbml0aWFsaXphdGlvbl9jb21wbGV0ZSI6dHJ1ZX0sIm5hbWUiOiJhYmhheSBzaW5naCIsInByZWZlcnJlZF91c2VybmFtZSI6ImFiaGF5MTIzNDU2IiwiZ3JvdXBNZW1iZXJzaGlwIjpbIi9JbnN0aXR1dGlvbmFsX0FkbWluX1VzZXIiXSwiZ2l2ZW5fbmFtZSI6ImFiaGF5IiwiZmFtaWx5X25hbWUiOiJzaW5naCIsImVtYWlsIjoiYWJoYXkxMjM0NTZAeW9wbWFpbC5jb20ifQ.mzdPjL0QlC6plaYkHRpytq0E2jd_89YWZdOsM-_eWvnZn_TlDWmrI_rbRZHJTL6QAwDbbsbaTJzyCaH4ajvbwJmbIY3JJBAZs1fc4nVZqjJdFGsOinJFr1cGJURyLebRjdaBbM2tYU5MUrb6mAPXpO7fE5ybdW3r19sYV6DVekgMU83LK9nhk5RLyrZKwXlFqejqQrCkgUMrGj39Lu9LXPt2tOGIbW3c23d3U3MpMOulGLdcve75mhcwxAa7jaVD06YOwYL1nakmEdBrWRBcuZK7qdMBP9xTvVvwcdrbhwpm2duToMZqtifMVratDSnwTbifU6lMrqODsccA0kTukw';

  console.log('token are getting', token);

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

export const fetchUpdatePreviewDetails = createAsyncThunk<
  AddressDetailsResponse, // Return type of the fulfilled action
  AddressDetailsPayload, // Argument type passed to the thunk
  {
    rejectValue: { error: any }; // Shape of the rejected value
  }
>('update/fetchPreviewDetails', async ({ token }, { rejectWithValue }) => {
  try {
    const data = await getPreviewDetailsRequest(token);
    return data;
  } catch (error: any) {
    console.error('Error:', error);
    return rejectWithValue({ error });
  }
});
interface GeneratePdfResponse {
  pdf: any;
  data: {
    pdf: string;
  };
}

export const generatePdfPreviewUpdate = createAsyncThunk<
  GeneratePdfResponse,
  { updationId: string }, // Accept an object with applicationId
  { state: { auth: AuthState }; rejectValue: string }
>(
  'applicationPreviewUpdate/generatePdfPreviewUpdate',
  async ({ updationId }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      console.log(updationId, 'updationid');

      if (!token) return rejectWithValue('Authentication token not found.');
      if (!updationId) return rejectWithValue('Application ID not found.');
      const response = await fetch(
        API_ENDPOINTS.update_generate_pdf(updationId),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // const response = await Secured.get(
      //   API_ENDPOINTS.update_generate_pdf(updationId),
      //   {},
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue('Submission failed' + error);
    }
  }
);

interface ESignInitiateResponse {
  data: any;
  fileName: string;
  pdf: string;
  message: string;
}

export const initiateESignatureUpdate = createAsyncThunk<
  ESignInitiateResponse,
  { place: string; date: string; consent: boolean; updationId: string },
  { state: { auth: AuthState }; rejectValue: string }
>(
  'applicationPreviewUpdate/initiateESignatureUpdate',
  async (
    { place, date, consent, updationId },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      // const applicationId = state.auth.reinitializeData?.applicationId;

      if (!token) return rejectWithValue('Authentication token not found.');
      if (!updationId) return rejectWithValue('Application ID not found.');

      const response = await Secured.post(
        API_ENDPOINTS.update_initiate_esign(updationId),
        {
          declaration: consent,
          declarationPlace: place,
          declarationDate: date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue('Submission failed' + error);
    }
  }
);

export const submitApplicationUpdate = createAsyncThunk<
  unknown,
  string,
  { state: RootState; rejectValue: string }
>(
  'update/submitApplicationUpdate',
  async (applicationId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;

      if (!token || !applicationId) {
        return rejectWithValue('Missing authentication or application ID.');
      }

      const response = await Secured.post(
        API_ENDPOINTS.submit_application_update(applicationId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue('Submission failed' + error);
    }
  }
);
