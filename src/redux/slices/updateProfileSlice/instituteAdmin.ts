/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
export interface InstituteAdminDetails {
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
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  employeeCode: string;
  sameAsRegisteredAddress: boolean;
  authorizationLetterDetails: string;
  dateOfAuthorization: string;
}

export interface InstituteAdminUpdateRequest {
  adminOne: InstituteAdminDetails;
  adminTwo: InstituteAdminDetails;
  updateState: string;
  iau_one_certified_poi: File | string;
  iau_one_certified_photoIdentity: File | string;
  iau_one_authorization_letter: File | string;
  iau_two_certified_poi: File | string;
  iau_two_certified_photoIdentity: File | string;
  iau_two_authorization_letter: File | string;
}

export interface Address {
  line1?: string;
  line2?: string;
  line3?: string;
  countryCode?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pinCode?: string;
  alternatePinCode?: string;
  countryName?: string;
}

export interface UpdateAddressPayload {
  token: string;
  registeredAddress?: Address;
  sameAsRegistrationAddress: boolean;
  correspondenceAddress?: Address;
}

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

export interface Document {
  id: number;
  documentType: string;
  fileName: string;
  fileSize: number;
  base64Content: string;
}

export interface HeadOfInstitutionDetails {
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

export interface InstitutionalAdminDetails {
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

export interface AdminState {
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

  updationRequestId: string | null;
  acknowledgementNo: string | null;
  operationalStatus: string | null;
  workflowStatus: string | null;
  lastUpdated: string | null;
}

export interface InstituteAdminPayload {
  token: any;
}

export interface InstituteAdminResponse {
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
  updationRequestId: string;
  acknowledgementNo: string;
  operationalStatus: string;
  workflowStatus: string;
  lastUpdated: string;
}
