export interface Application {
  workflow_id: string;
  workflow_type: string;
  initiator_service: string;
  status: string;
  current_step: string;
  payload: Payload;
  meta_data: MetaData;
  search_tags: string;
  created_at: string;
  updated_at: string;
}

export interface Payload {
  approval: Approval;
  approvalWorkflow: approvalWorkflows;
  nodalOfficer: NodalOfficer;
  hoi: Hoi;
  addresses: Addresses;
  entityDetails: EntityDetails;
  institutionalAdminUser: InstitutionalAdminUser;
  userId: string;
  application_esign?: ApplicationEsign;
  submission: submissionDetails;
}
export interface ApplicationEsign {
  acknowledgementNo?: string;
  signedAt?: string;
  signerName?: string;
  declarationDate?: number[];
  declarationPlace?: string;
  declarationAccepted?: boolean;
}
export interface Approval {
  approvals: Approval2[];
  approvalStatus: string;
  pendingAtLevel: number;
  noOfApprovalsRequired: number;
}
export interface approvalWorkflows {
  approvals: Approval2[];
  approvalStatus: string;
  pendingAtLevel: number;
  noOfApprovalsRequired: number;
}

export interface submissionDetails {
  submittedBy: string;
  submittedAt: string;
}
export interface Approval2 {
  reason: string;
  status: string;
  remarks: string;
  cersaiUserId: string;
  approvalLevel: number;
  actionBy?: string;
  actionByUserName?: string;
  action?: string;
  actionDate?: string;
}

export interface NodalOfficer {
  noDob: string;
  noEmail: string;
  noTitle: string;
  noGender: string;
  noLastName: string;
  noFirstName: string;
  mobileNumber: string;
  noCkycNumber: string;
  noEmployCode: string;
  noMiddleName: string;
  noAddresLine1?: string;
  noCitizenship: string;
  noCountryCode: string;
  noDesignation: string;
  noNobileNumber: string;
  noRegisterCity: string;
  noOfficeAddress: boolean;
  noRegisterState: string;
  noLandlineNumber: string;
  noProofOfIdentity: string;
  noRegisterCountry: string;
  noRegisterDigipin: string;
  noRegisterDistrict?: string;
  noBoardResoluationDate: string;
  noProofOfIdentityNumber: string;
  userId: string;
}

export interface Hoi {
  hoiEmail: string;
  hoiTitle: string;
  hoiCkycNo: string;
  hoiGender: string;
  hoiMobile: string;
  hoiLastName: string;
  hoiFirstName: string;
  hoiMiddleName: string;
  hoiCitizenship: string;
  hoiCountryCode: string;
  hoiDesignation: string;
  hoiLandline?: string;
  hoiLandlineNumber?: string;
}

export interface Addresses {
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  registerLine1?: string;
  registerLine2?: string;
  registerLine3?: string;
  registerCity: string;
  registerState: string;
  registerCountry: string;
  registerDigipin: string;
  registerPincode: string;
  registerDistrict: string;
  correspondenceCity: string;
  correspondenceState: string;
  registerPincodeOther: string;
  correspondenceCountry: string;
  correspondenceDigipin: string;
  correspondencePincode: string;
  correspondenceDistrict: string;
  correspondenceAddressLine1?: string;
  correspondenceAddressLine2?: string;
  correspondenceAddressLine3?: string;
  correspondenceLine1?: string;
  correspondenceLine2?: string;
  correspondenceLine3?: string;
  correspondencePincodeOther: string;
  sameAsCorrespondenceAddress: boolean;
  acknowledgementNo?: string;
  declarationPlace?: string;
  declarationAccepted?: boolean;
}

export interface InstitutionalAdminUser {
  iauDob1: string;
  iauDob2: string;
  iauEmail1: string;
  iauEmail2: string;
  iauTitle1: string;
  iauTitle2: string;
  iauGender1: string;
  iauGender2: string;
  iauLastName1: string;
  iauLastName2: string;
  iauFirstName1: string;
  iauFirstName2: string;
  iauCkycNumber1: string;
  iauCkycNumber2: string;
  iauEmployCode1: string;
  iauEmployCode2: string;
  iauMiddleName1: string;
  iauMiddleName2: string;
  iauCitizenship1: string;
  iauCitizenship2: string;
  iauCountryCode1: string;
  iauCountryCode2: string;
  iauDesignation1: string;
  iauDesignation2: string;
  iauMobileNumbmer1: string;
  iauMobileNumbmer2: string;
  iauOfficeAddress1: boolean;
  iauOfficeAddress2: boolean;
  iauLandLineNumber1: string;
  iauLandLineNumber2: string;
  iauProofOfIdentity1: string;
  iauProofOfIdentity2: string;
  iauAuthorizationLetter1: string;
  iauAuthorizationLetter2: string;
  iauDateOfAuthorization1: string;
  iauDateOfAuthorization2: string;
  iauProofOfIdentityNumber1: string;
  iauProofOfIdentityNumber2: string;
}
export interface MetaData {
  email?: string;
  mobile?: string;
  userId?: string;
  ckycNumber?: string;
  searchWith?: string;
  acknowledgementNo?: string;
  isModifiableRequest?: string;
}

export interface ISortBy {
  key: string;
  type: string;
}

export interface ApplicationsResponse {
  content: Application[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  workflowId: string;
}

export interface ApplicationsState {
  data: ApplicationsResponse | null;
  loading: boolean;
  error: string | null;
}

export interface ServiceMetadataData {
  initiatedBy: string;
  applicationId: string;
  reportingEntityName: string;
  callingService: string;
  pan: string;
  registartionDate: string;
}

export interface EntityDetails {
  cin: string;
  pan: string;
  gstin: string;
  llpin: string;
  reWebsite: string;
  regulator: string;
  constitution: string;
  proprietorName: string;
  registrationNo: string;
  institutionType: string;
  nameOfInstitution: string;
  regulatorLicenseNumber?: string;
}
