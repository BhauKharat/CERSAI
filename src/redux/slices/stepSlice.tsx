import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from 'Constant';

// Head of Institution details structure
export interface HeadOfInstitutionDetails {
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  emailId?: string;
  gender?: string;
  ckycNumber?: string;
  citizenship?: string;
  phone?: string;
  mobileNo?: string;
  landline?: string;
  countryCode?: string;
  countryName?: string;
  // [key: string]: any;
}

export interface UpdateHeadDetailsPayload {
  token: string;
  data: HeadOfInstitutionDetails;
}

// State interface
interface StepDetailsState {
  isLoading: boolean;
  result: HeadOfInstitutionDetails | null;

  error: string | null;
}

// Payload for thunk
interface AddressDetailsPayload {
  token: string;
}

// API response interface
interface AddressDetailsResponse {
  data: {
    headOfInstitutionDetails: HeadOfInstitutionDetails;
  };
}

// Fetch function
const getAllStepDetails = async (
  token: string
): Promise<AddressDetailsResponse> => {
  const response = await fetch(API_ENDPOINTS.update_address_get, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CKYC details');
  }

  const data: AddressDetailsResponse = await response.json();
  return data;
};

// API: PUT details
const putHeadInstitutionDetails = async (
  token: string,
  data: HeadOfInstitutionDetails
): Promise<HeadOfInstitutionDetails> => {
  const response = await fetch(API_ENDPOINTS.update_address_put, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json(); // read once

  if (!response.ok) {
    // now you can forward the actual server error details
    throw new Error(
      responseData?.message || 'Failed to update Head of Institution details'
    );
  }

  return responseData;
};

// AsyncThunk - PUT
export const updateHeadInstitutionDetails = createAsyncThunk<
  HeadOfInstitutionDetails,
  UpdateHeadDetailsPayload,
  { rejectValue: { error: string } }
>(
  'update/updateHeadInstitutionDetails',
  async ({ token, data }, { rejectWithValue }) => {
    try {
      // ✅ Build a safe object
      const payload: HeadOfInstitutionDetails = {
        title: data.title ?? '',
        firstName: data.firstName ?? '',
        middleName: data.middleName ?? '',
        lastName: data.lastName ?? '',
        designation: data.designation ?? '',
        emailId: data.emailId ?? '',
        ckycNumber: data.ckycNumber ?? '',
        gender: data.gender ?? '',
        citizenship: data.citizenship ?? '',
        countryCode: data.countryCode ?? '+91',
        mobileNo: data.mobileNo ?? '',
        landline: data.landline ?? '',
      };

      const response = await putHeadInstitutionDetails(token, payload);
      return response;
    } catch (error: unknown) {
      let errorMessage = 'Something went wrong';
      if (error instanceof Error) errorMessage = error.message;
      return rejectWithValue({ error: errorMessage });
    }
  }
);

// AsyncThunk
export const fetchAllStepDetails = createAsyncThunk<
  AddressDetailsResponse,
  AddressDetailsPayload,
  { rejectValue: { error: string } }
>('update/fetchAllStepDetails', async ({ token }, { rejectWithValue }) => {
  try {
    const response = await getAllStepDetails(token);
    return response;
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong';
    if (error instanceof Error) errorMessage = error.message;
    return rejectWithValue({ error: errorMessage });
  }
});

// Initial state
const initialState: StepDetailsState = {
  isLoading: false,
  result: null,
  error: null,
};

// Slice
const stepSlice = createSlice({
  name: 'stepDetails',
  initialState,
  reducers: {
    setUpdateData: (state, action: PayloadAction<HeadOfInstitutionDetails>) => {
      console.log('this state called', state, action.payload);
      state.result = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStepDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStepDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log(
          'response here',
          action.payload.data.headOfInstitutionDetails
        );
        state.result = action.payload.data.headOfInstitutionDetails;
      })
      .addCase(fetchAllStepDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Failed to fetch data';
      });
  },
});

export const { setUpdateData } = stepSlice.actions;
export default stepSlice.reducer;
