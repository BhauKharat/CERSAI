// API Response Types for Get Application
export interface EntityDetails {
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

export interface AddressDetails {
  id: string;
  line1: string;
  line2: string;
  line3: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
}

export interface HeadOfInstitutionDetails {
  id: string;
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

export interface NodalOfficerDetails {
  id: string;
  citizenship: string;
  ckycNo: string;
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  designation: string;
  gender: string;
  landline: string;
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  sameAsRegisteredAddress: boolean;
  dateOfBoardResolution: string;
}

export interface AdminDetails {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  title: string;
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

export interface DocumentDetails {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  base64Content: string;
}

export interface GetApplicationData {
  updationRequestId: string;
  acknowledgementNo: string;
  disabledSections: string[];
  operationalStatus: string;
  workflowStatus: string;
  lastUpdated: string;
  correspondenceAddressSameAsRegisteredAddress: boolean;
  entityDetails: EntityDetails;
  registeredAddress: AddressDetails;
  correspondanceAddress: AddressDetails;
  headOfInstitutionDetails: HeadOfInstitutionDetails;
  nodalOfficerDetails: NodalOfficerDetails;
  adminOneDetails: AdminDetails;
  adminTwoDetails: AdminDetails;
  documents: DocumentDetails[];
  workflowId: string;
}

export interface GetApplicationResponse {
  success: boolean;
  message: string;
  data: GetApplicationData;
}

export interface GetApplicationError {
  success: boolean;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

// Redux State Types
export interface GetApplicationState {
  data: GetApplicationData | null;
  loading: boolean;
  error: string | null;
}
