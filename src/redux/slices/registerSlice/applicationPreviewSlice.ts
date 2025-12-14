/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/slices/applicationPreviewSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../utils/HelperFunctions/api/index'; // Assuming you're using a secured Axios helper
import { AuthState } from '@redux/types/register/authSliceTypes';
import { API_ENDPOINTS } from 'Constant';
import { RootState } from '@redux/store';

interface EntityDetails {
  nameOfInstitution: string;
  regulator: string;
  institutionType: string;
  constitution: string;
  proprietorName: string;
  registrationNo: string;
  panNo: string;
  cinNo: string;
  llpinNo: string;
  gstinNo: string;
  reWebsite: string;
}

interface Document {
  id: number;
  documentType: string;
  fileName: string;
  fileSize: number;
  base64Content: string;
}

interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode?: string;
}

interface HeadOfInstitutionDetails {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  designation: string;
  emailId: string;
  ckycNumber: string;
  gender: string;
  citizenship: string;
  countryCode: string;
  mobileNo: string;
  landline: string;
}

interface NodalOfficerDetails {
  firstName: string;
  middleName: string;
  lastName: string;
  title: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  ckycNo: string;
  designation: string;
  gender: string;
  citizenship: string;
  landline: string;
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  sameAsRegisteredAddress: boolean;
  dateOfBoardResolution: string;
}

interface InstitutionalAdminDetails {
  title: string;
  email: string;
  firstName: string;
  mobileNumber: string;
  middleName: string;
  lastName: string;
  designation: string;
  emailId: string;
  ckycNumber: string;
  gender: string;
  citizenship: string;
  countryCode: string;
  mobileNo: string;
  landline: string;
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  employeeCode: string;
  sameAsRegisteredAddress: boolean;
  authorizationLetterDetails: string;
  dateOfAuthorization: string;
}

interface PreviewState {
  entityDetails: EntityDetails | null;
  correspondenceAddressSameAsRegisteredAddress: boolean;
  registeredAddress: Address | null;
  correspondanceAddress: Address | null;
  headOfInstitutionDetails: HeadOfInstitutionDetails | null;
  nodalOfficerDetails: NodalOfficerDetails | null;
  adminOneDetails: InstitutionalAdminDetails | null;
  adminTwoDetails: InstitutionalAdminDetails | null;
  documents: Document[];
  loading: boolean;
  error: string | null;
  pdfData: string | null;
  isSubmitting: boolean;
  submitError: string | null;

  submittedAt: string | null;
  status: string | null;
  isEsigned: boolean;
}

const initialState: PreviewState = {
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
};

export const submitApplication = createAsyncThunk<
  unknown,
  string,
  { state: RootState; rejectValue: string }
>(
  'registration/submitApplication',
  async (applicationId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;

      if (!token || !applicationId) {
        return rejectWithValue('Missing authentication or application ID.');
      }

      const response = await Secured.post(
        API_ENDPOINTS.SUBMIT_APPLICATION(applicationId),
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

// Define the expected payload for the initiateESignature fulfilled action
interface ESignInitiateResponse {
  data: any;
  fileName: string;
  pdf: string;
  message: string;
}

export const initiateESignature = createAsyncThunk<
  ESignInitiateResponse,
  { place: string; date: string; consent: boolean },
  { state: { auth: AuthState }; rejectValue: string }
>(
  'applicationPreview/initiateESignature',
  async ({ place, date, consent }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      const applicationId = state.auth.reinitializeData?.applicationId;

      if (!token) return rejectWithValue('Authentication token not found.');
      if (!applicationId) return rejectWithValue('Application ID not found.');

      const response = await Secured.post(
        API_ENDPOINTS.INITIATE_ESIGN(applicationId),
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

// Define the expected payload for the generatePdfPreview fulfilled action
interface GeneratePdfResponse {
  pdf: any;
  data: {
    pdf: string;
  };
}

export const generatePdfPreview = createAsyncThunk<
  GeneratePdfResponse,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>(
  'applicationPreview/generatePdfPreview',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      const applicationId = state.auth.reinitializeData?.applicationId;

      if (!token) return rejectWithValue('Authentication token not found.');
      if (!applicationId) return rejectWithValue('Application ID not found.');

      const response = await Secured.post(
        API_ENDPOINTS.GENERATE_PDF(applicationId),
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

// Define the expected payload for the fetchApplicationPreview fulfilled action
export interface FetchPreviewResponse {
  entityDetails: EntityDetails;
  documents: Document[];
  registeredAddress: Address;
  correspondanceAddress: Address;
  headOfInstitutionDetails: HeadOfInstitutionDetails;
  nodalOfficerDetails: NodalOfficerDetails;
  adminOneDetails: InstitutionalAdminDetails;
  adminTwoDetails: InstitutionalAdminDetails;
  correspondenceAddressSameAsRegisteredAddress: boolean;
  applicationSubmittedAt: string | null;
  status: string | null;
  approvalStatus: string | null;
}

export const fetchApplicationPreview = createAsyncThunk<
  FetchPreviewResponse,
  void,
  { state: { auth: AuthState }; rejectValue: string }
>('applicationPreview/fetch', async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as { auth: AuthState };
    const token = state.auth.authToken;
    const applicationId = state.auth.reinitializeData?.applicationId;
    console.log(state.auth.reinitializeData?.applicationId, 'APplication ID');

    if (!token)
      return thunkAPI.rejectWithValue('Authentication token not found.');
    if (!applicationId)
      return thunkAPI.rejectWithValue('Application ID not found.');

    const response = await Secured.get(
      API_ENDPOINTS.preview_document(applicationId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue('Submission failed' + err);
  }
});

const applicationPreviewSlice = createSlice({
  name: 'applicationPreview',
  initialState,
  reducers: {
    resetPreview: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicationPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationPreview.fulfilled, (state, action) => {
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
      })
      .addCase(fetchApplicationPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generatePdfPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Use PayloadAction to specify the type of the payload
      .addCase(
        generatePdfPreview.fulfilled,
        (state, action: PayloadAction<GeneratePdfResponse>) => {
          state.loading = false;
          console.log('PDF Fulfilled Payload:', action.payload);
          // Correctly access the nested data from the payload
          state.pdfData = action.payload.data.pdf;
        }
      )
      .addCase(generatePdfPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(initiateESignature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Use PayloadAction to specify the type of the payload
      .addCase(
        initiateESignature.fulfilled,
        (state, action: PayloadAction<ESignInitiateResponse>) => {
          state.loading = false;
          // Correctly access the pdf property from the payload
          state.pdfData = action.payload.pdf;
          state.isEsigned = true;
        }
      )
      .addCase(initiateESignature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitApplication.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitApplication.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      });
  },
});
export const { resetPreview } = applicationPreviewSlice.actions;
export default applicationPreviewSlice.reducer;
