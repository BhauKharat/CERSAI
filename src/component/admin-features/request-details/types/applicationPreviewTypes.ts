/* eslint-disable @typescript-eslint/no-explicit-any */
// types/applicationDetails.ts
export interface ApplicationDetailsResponse {
  success: boolean;
  message: string;
  data: ApplicationDetails;
}

export interface ApplicationDetails {
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
  payload?: any; // Adding payload to support nested structure
  modifiableFields?: any; // Adding modifiableFields
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
  documentType?: string; // Support legacy field
  type?: string; // Support new API field
  fileName?: string;
  fileSize?: number;
  base64Content?: string;
  contentType?: string;
}
