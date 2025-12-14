// Head of Institution interface
export interface HoiDetails {
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
  hoiLandlineNumber: string;
  [key: string]: unknown;
}

// Addresses interface
export interface AddressDetails {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
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
  correspondenceAddressLine1: string;
  correspondenceAddressLine2: string;
  correspondenceAddressLine3: string;
  correspondencePincodeOther: string;
  sameAsCorrespondenceAddress: boolean;
  [key: string]: unknown;
}

// Nodal Officer interface
export interface NodalOfficerDetails {
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
  noBoardResoluationDate: string;
  noProofOfIdentityNumber: string;
  [key: string]: unknown;
}

// Entity Details interface
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
  [key: string]: unknown;
}

// Institutional Admin User interface
export interface InstitutionalAdminUserDetails {
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
  [key: string]: unknown;
}

// Payload interface containing all form data
export interface WorkflowPayload {
  hoi: HoiDetails;
  addresses: AddressDetails;
  nodalOfficer: NodalOfficerDetails;
  entityDetails: EntityDetails;
  institutionalAdminUser: InstitutionalAdminUserDetails;
  [key: string]: unknown;
}

// Workflow data interface
export interface WorkflowData {
  workflowId: string;
  workflowType: string;
  status: string;
  payload: WorkflowPayload;
  currentStep: string;
  executedSteps: string[];
}

// Main ReinitializeResponse interface
export interface ResponseReinitialize {
  success?: boolean;
  message?: string;
  workflowId?: string;
  data?: WorkflowData;
  // Legacy properties for backward compatibility
  applicationId?: number;
  acknowledgement_no?: string | null;
  approvalStatus?: string;
  existingDraft?: boolean;
  lastUpdated?: string;
  completionPercentage?: number;
  pendingSections?: string[];
  modificationStatus?: string | null;
  modifiableFields?: Record<string, string[]>;
}
