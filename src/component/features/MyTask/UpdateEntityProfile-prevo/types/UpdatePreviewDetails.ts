export interface HoiDetails {
  citizenship: string;
  ckycNumber: string;
  countryCode: string;
  countryName: string;
  designation: string;
  emailId: string;
  firstName: string;
  gender: string;
  landline: string | null;
  lastName: string;
  middleName: string;
  mobileNo: string;
  title: string;
}
export interface NodalOfficerDetails {
  citizenship: string;
  ckycNo: string;
  countryCode: string;
  countryName: string;
  dateOfBirth: string;
  dateOfBoardResolution: string;
  designation: string;
  email: string;
  firstName: string;
  gender: string;
  id: string;
  identityNumber: string;
  landline: string | null;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  proofOfIdentity: string;
  sameAsRegisteredAddress: boolean;
  title: string;
  boardResolution: string | null;
  certifiedPoi: string | null;
  certifiedPic?: string | null;
}
export interface NodalDocumentData {
  base64Content: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  id: string;
}
export interface RegisteredAddress {
  line1: string;
  line2: string;
  line3: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode: string;
  id: string;
}
export interface CorrespondenceAddress {
  line1: string;
  line2: string;
  line3: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode: string;
  id: string;
}
export interface EntityDetails {
  cinNo: string;
  constitution: string;
  fiCode: string;
  gstinNo: string;
  institutionType: string;
  llpinNo: string;
  nameOfInstitution: string;
  operationalStatus: string;
  panNo: string;
  proprietorName: string;
  reId: string;
  reWebsite: string;
  registrationNo: string;
  regulator: string;
}
export interface AdminOneDetails {
  authorizationLetterDetails: string;
  citizenship: string;
  ckycNumber: string;
  countryCode: string;
  dateOfAuthorization: string;
  dateOfBirth: string;
  designation: string;
  emailId: string;
  employeeCode: string;
  firstName: string;
  gender: string;
  id: string;
  identityNumber: string;
  landline: string;
  lastName: string;
  middleName: string;
  mobileNo: string;
  proofOfIdentity: string;
  sameAsRegisteredAddress: string;
  title: '';
}

export interface AdminTwoDetails {
  authorizationLetterDetails: string;
  citizenship: string;
  ckycNumber: string;
  countryCode: string;
  dateOfAuthorization: string;
  dateOfBirth: string;
  designation: string;
  emailId: string;
  employeeCode: string;
  firstName: string;
  gender: string;
  id: string;
  identityNumber: string;
  landline: string;
  lastName: string;
  middleName: string;
  mobileNo: string;
  proofOfIdentity: string;
  sameAsRegisteredAddress: string;
  title: string;
}

export interface Country {
  name: string;
  dial_code: string;
  code: string;
  states?: {
    value: string;
    label: string;
    districts: {
      value: string;
      label: string;
      pincodes?: string[];
    }[];
  }[];
}

export interface NodalDataResponse {
  entityDetails: EntityDetails;
  correspondenceAddressSameAsRegisteredAddress: boolean;
  updationRequestId: string;
  headOfInstitutionDetails: HoiDetails;
  nodalOfficerDetails: NodalOfficerDetails;
  documents: NodalDocumentData[];
  registeredAddress: RegisteredAddress;
  correspondanceAddress: CorrespondenceAddress;
  adminOneDetails: AdminOneDetails;
  adminTwoDetails: AdminTwoDetails;
}

export interface PdfModalProps {
  open: boolean;
  onClose: () => void;
  base64Pdf: string;
  onESign: (formData: {
    place: string;
    date: string;
    consent: boolean;
    updationId: string;
  }) => Promise<string>;
  isESigned: boolean;
  applicationId: string;
}
