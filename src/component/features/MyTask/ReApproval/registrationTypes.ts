/* eslint-disable @typescript-eslint/no-explicit-any */
// Registration data types for ReApproval module

export interface RegistrationDataResponse {
  success: boolean;
  message: string;
  data: RegistrationData;
}

export interface RegistrationData {
  applicationId: number;
  applicationStatusFlag: string | null;
  acknowledgementNo: string;
  status: string;
  message: string | null;
  lastUpdated: string;
  applicationSubmittedAt: string;
  correspondenceAddressSameAsRegisteredAddress: boolean;
  entityDetails: EntityDetails;
  registeredAddress: Address;
  correspondanceAddress: Address;
  headOfInstitutionDetails: PersonDetails;
  nodalOfficerDetails: NodalOfficerDetails;
  adminOneDetails: AdminDetails;
  adminTwoDetails: AdminDetails;
  documents: DocumentItem[];
  payload?: any; // Support nested structure from API
  modifiableFields?: any; // Support modifiable fields tracking
  document?: any; // Support document object
}

interface EntityDetails {
  website: any;
  registrationLicenseCertificate: any;
  registrationCertificate: any;
  addressProof: any;
  otherDocument: any;
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
  regulatorLicense: string;
  reOtherFile: string;
}

interface Address {
  pincode: any;
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

interface PersonDetails {
  email: any;
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

interface NodalOfficerDetails
  extends Omit<PersonDetails, 'emailId' | 'ckycNumber'> {
  email: string;
  ckycNo: string;
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  sameAsRegisteredAddress: boolean;
  dateOfBoardResolution: string;
  noBoardResolution: string;
  noCertifiedPoi: string;
  noCertifiedPhotoIdentity: string;
}

interface AdminDetails extends PersonDetails {
  email: any;
  proofOfIdentity: string;
  identityNumber: string;
  dateOfBirth: string;
  employeeCode: string;
  sameAsRegisteredAddress: boolean;
  authorizationLetterDetails: string;
  dateOfAuthorization: string;
  iauCertifiedPoi: string;
  iauCertifiedPhotoIdentity: string;
}

interface DocumentItem {
  id: number | string;
  documentType?: string; // Legacy field name
  type?: string; // New API field name
  fieldKey?: string; // Field key for matching
  fileName?: string;
  fileSize?: number;
  base64Content?: string;
  contentType?: string;
}
