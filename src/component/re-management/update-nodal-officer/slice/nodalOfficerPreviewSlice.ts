/* eslint-disable prettier/prettier */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { nodalOfficePreview } from "../thunk/nodalOfficerPreview";


export interface INodalOfficerDetails {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  applicationId: string
  acknowledgementNo: string
  operationalStatus: string
  approvalStatus: string
  lastUpdated: string
  applicationSubmittedAt: string
  correspondenceAddressSameAsRegisteredAddress: boolean
  entityDetails: EntityDetails
  registeredAddress: RegisteredAddress
  correspondanceAddress: CorrespondanceAddress
  headOfInstitutionDetails: HeadOfInstitutionDetails
  nodalOfficerDetails: NodalOfficerDetails
  adminOneDetails: AdminOneDetails
  adminTwoDetails: AdminTwoDetails
  documents: DocumentFile[]
}

export interface EntityDetails {
  reId: string | null
  nameOfInstitution: string
  regulator: string
  institutionType: string
  constitution: string
  proprietorName: string
  registrationNo: string
  panNo: string
  cinNo: string
  llpinNo: string
  gstinNo: string
  reWebsite: string | null
  operationalStatus: string | null
  createdAt: string | null
  fiCode: string | null
}

export interface RegisteredAddress {
  id: string
  line1: string
  line2: string
  line3: string
  countryCode: string
  state: string
  district: string
  cityTown: string
  pinCode: string
  alternatePinCode: string
}

export interface CorrespondanceAddress {
  id: string
  line1: string
  line2: string
  line3: string
  countryCode: string
  state: string
  district: string
  cityTown: string
  pinCode: string
  alternatePinCode: string
}

export interface HeadOfInstitutionDetails {
  id: string
  title: string
  firstName: string
  middleName: string
  lastName: string
  designation: string
  emailId: string
  ckycNumber: string
  gender: string
  citizenship: string
  countryCode: string
  mobileNo: string
  landline: string | null
}

export interface NodalOfficerDetails {
  citizenship: string
  ckycNo: string
  title: string
  firstName: string
  middleName: string
  lastName: string
  email: string
  countryCode: string
  mobileNumber: string
  id: string
  designation: string
  gender: string
  landline: string | null
  proofOfIdentity: string
  identityNumber: string
  dateOfBirth: string
  sameAsRegisteredAddress: boolean
  dateOfBoardResolution: string
}

export interface AdminOneDetails {
  id: string
  firstName: string
  middleName: string
  lastName: string
  title: string
  designation: string
  emailId: string
  ckycNumber: string
  gender: string
  citizenship: string
  countryCode: string
  mobileNo: string
  landline: string | null
  proofOfIdentity: string
  identityNumber: string
  dateOfBirth: string
  employeeCode: string
  sameAsRegisteredAddress: boolean
  authorizationLetterDetails: string
  dateOfAuthorization: string
}

export interface AdminTwoDetails {
  id: string
  firstName: string
  middleName: string
  lastName: string
  title: string
  designation: string
  emailId: string
  ckycNumber: string
  gender: string
  citizenship: string
  countryCode: string
  mobileNo: string
  landline: string | null
  proofOfIdentity: string
  identityNumber: string
  dateOfBirth: string
  employeeCode: string
  sameAsRegisteredAddress: boolean
  authorizationLetterDetails: string
  dateOfAuthorization: string
}

export interface DocumentFile {
  id: string
  documentType: string
  fileName: string
  fileSize: number
  base64Content: string
}



interface ApplicationState {
  data: INodalOfficerDetails | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  data: null,
  isLoading: false,
  error: null
};



const nodalOfficerPreviewSlice = createSlice({
  initialState,
  name: 'nodal-officer-preview',
  reducers: {
    resetNodalDetails: (state) => {
      if (state.data) {
        state.data = {
          ...state.data,
          data: {
            ...state.data.data,
            nodalOfficerDetails: {
              citizenship: "",
              ckycNo: "",
              title: "",
              firstName: "",
              middleName: "",
              lastName: "",
              email: "",
              countryCode: "",
              mobileNumber: "",
              id: "",
              designation: "",
              gender: "",
              landline: null,
              proofOfIdentity: "",
              identityNumber: "",
              dateOfBirth: "",
              sameAsRegisteredAddress: false,
              dateOfBoardResolution: ""
            }
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(nodalOfficePreview.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    }).addCase(nodalOfficePreview.fulfilled, (state, action: PayloadAction<INodalOfficerDetails>) => {
      state.isLoading = false;
      state.data = action.payload;
    })
      .addCase(nodalOfficePreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

  }
})

export const {resetNodalDetails} = nodalOfficerPreviewSlice.actions 
export default nodalOfficerPreviewSlice.reducer;

