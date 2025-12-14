/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api'; // axios instance
import { RootState } from '../../../../redux/store';
import { API_ENDPOINTS } from 'Constant';

// ----------------------
// Types
// ----------------------

export interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  base64Content: string;
}

export interface ReportingEntityDetails {
  applicationId: string;
  acknowledgementNo: string;
  operationalStatus: string;
  approvalStatus: string;
  lastUpdated: string;
  applicationSubmittedAt: string;
  correspondenceAddressSameAsRegisteredAddress: boolean;
}

export interface EntityDetails {
  reId: string | null;
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
  reWebsite: string | null;
  operationalStatus: string | null;
  createdAt: string | null;
  fiCode: string | null;
  documents: Document[];
}

export interface Address {
  id: string;
  line1: string;
  line2: string;
  line3: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode: string;
}

export interface PersonBase {
  id: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  designation: string;
  emailId?: string;
  email?: string;
  ckycNumber?: string;
  ckycNo?: string;
  gender: string;
  citizenship: string;
  countryCode: string;
  mobileNo?: string;
  mobileNumber?: string;
  landline: string | null;
}

// export interface HeadOfInstitutionDetails extends PersonBase {}
export type HeadOfInstitutionDetails = PersonBase;

export interface NodalOfficerDetails extends PersonBase {
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  sameAsRegisteredAddress: boolean;
  dateOfBoardResolution: string;
  documents?: Document[];
}

export interface AdminDetails extends PersonBase {
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  employeeCode: string;
  sameAsRegisteredAddress: boolean;
  authorizationLetterDetails: string;
  dateOfAuthorization: string;
  documents?: Document[];
}

export interface ReportingEntityState {
  loading: boolean;
  error: string | null;
  data: {
    ReportingEntityDetails: ReportingEntityDetails | null;
    entityDetails: EntityDetails | null;
    registeredAddress: Address | null;
    correspondanceAddress: Address | null;
    headOfInstitutionDetails: HeadOfInstitutionDetails | null;
    nodalOfficerDetails: NodalOfficerDetails | null;
    adminOneDetails: AdminDetails | null;
    adminTwoDetails: AdminDetails | null;
  };
}

// ----------------------
// Initial State
// ----------------------

const initialState: ReportingEntityState = {
  loading: false,
  error: null,
  data: {
    ReportingEntityDetails: null,
    entityDetails: null,
    registeredAddress: null,
    correspondanceAddress: null,
    headOfInstitutionDetails: null,
    nodalOfficerDetails: null,
    adminOneDetails: null,
    adminTwoDetails: null,
  },
};

// ----------------------
// Thunk
// ----------------------

export const fetchReportingEntityDetails = createAsyncThunk<
  ReportingEntityState['data'],
  string,
  { rejectValue: string }
>('reportingEntity/fetchDetails', async (entityId, { rejectWithValue }) => {
  try {
    const BASE_URL = API_ENDPOINTS.ADMIN_CALLBACK(entityId);
    const response = await Secured.get(BASE_URL);

    const apiData = response.data.data;

    // map API → state structure
    return {
      ReportingEntityDetails: {
        applicationId: apiData.applicationId,
        acknowledgementNo: apiData.acknowledgementNo,
        operationalStatus: apiData.operationalStatus,
        approvalStatus: apiData.approvalStatus,
        lastUpdated: apiData.lastUpdated,
        applicationSubmittedAt: apiData.applicationSubmittedAt,
        correspondenceAddressSameAsRegisteredAddress:
          apiData.correspondenceAddressSameAsRegisteredAddress,
      },
      entityDetails: {
        ...apiData.entityDetails,
        documents: apiData.documents.filter((doc: Document) =>
          [
            'RE_PAN',
            'RE_CIN',
            'REGULATOR_LICENCE',
            'REGISTRATION_CERTIFICATE',
            'ADDRESS_PROOF',
          ].includes(doc.documentType)
        ),
      },
      registeredAddress: apiData.registeredAddress,
      correspondanceAddress: apiData.correspondanceAddress,
      headOfInstitutionDetails: apiData.headOfInstitutionDetails,
      nodalOfficerDetails: {
        ...apiData.nodalOfficerDetails,
        documents: apiData.documents.filter((doc: Document) =>
          [
            'NO_BOARD_RESOLUTION',
            'NO_CERTIFIED_POI',
            'NO_CERTIFIED_PHOTO_IDENTITY',
          ].includes(doc.documentType)
        ),
      },
      adminOneDetails: {
        ...apiData.adminOneDetails,
        documents: apiData.documents.filter((doc: Document) =>
          [
            'IAU_ONE_AUTHORIZATION_LETTER',
            'IAU_ONE_CERTIFIED_POI',
            'IAU_ONE_CERTIFIED_PHOTO_IDENTITY',
          ].includes(doc.documentType)
        ),
      },
      adminTwoDetails: {
        ...apiData.adminTwoDetails,
        documents: apiData.documents.filter((doc: Document) =>
          [
            'IAU_TWO_AUTHORIZATION_LETTER',
            'IAU_TWO_CERTIFIED_POI',
            'IAU_TWO_CERTIFIED_PHOTO_IDENTITY',
          ].includes(doc.documentType)
        ),
      },
    };
  } catch (err: any) {
    return rejectWithValue(
      err.message || 'Failed to fetch reporting entity details'
    );
  }
});

// ----------------------
// Slice
// ----------------------

const reportingEntitySlice = createSlice({
  name: 'reportingEntity',
  initialState,
  reducers: {
    clearReportingEntity: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportingEntityDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchReportingEntityDetails.fulfilled,
        (state, action: PayloadAction<ReportingEntityState['data']>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchReportingEntityDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearReportingEntity } = reportingEntitySlice.actions;

export const selectReportingEntity = (state: RootState) =>
  state.reportingEntity;

export default reportingEntitySlice.reducer;
