export interface IDemographicDetail {
  dob: Date | undefined;
  minor: string;
  nameMatch: string;
  dobMatch: string;
  photoMatch: string;
  gender: string;
  genderMatch: string;
  panCard: string;
  form60: File | null;
  form61: File | null;
  panVerified: string;
  residentialStatus: string;
  residentialStatusDoc: string;
  education: string;
  educationDoc: string;
  nationality: string;
  nationalityDoc: string;
  occupation: string;
  occupationSupportDoc: string;
  disability: string;
  DisabilitySupportDoc: string;
  UDIDNumber: string;
  imageFile: File | null;
  residentalStatusFile: File | null;
  EQFile: File | null;
  occupationFile: File | null;
  DisabilityStatusFile: File | null;

  // merged name objects
  nameDetail: NameFields;
  maidenName: NameFields;
  motherName: NameFields;
  fatherName: NameFields;
  spouseName: NameFields;
}
export interface IProofOfIdentity {
  ovdType: string; // dropdown
  passportExpiryDate: Date | undefined;
  drivingLicenseExpiryDate: Date | undefined;
  idNumber: string;
  ovdCertifiedWithOriginal: string; // Yes/No
  certifiedCopyVerified: string; // Yes/No
  equivalentEDoc: string; // Yes/No
  documentVerifiedFromDigilocker: string; // Yes/No
  presenceOfPassportInMEA: string; // Yes/No
  presenceOfVoterIdInECI: string; // Yes/No
  presenceOfDrivingLicenseInRTO: string; // Yes/No
  presenceOfNREGA: string; // Yes/No
  presenceOfNPR: string; // Yes/No
  offlineVerificationOfAadhaar: string; // Yes/No
  dataReceivedFromOfflineVerification: string; // Yes/No
  ekycAuthentication: string; // Yes/No
  ekycDataReceivedFromUIDAI: string; // Yes/No
  ekycAuthenticationBiometric: string; // Yes/No
  ekycOtpAuthentication: string; // Yes/No

  copyOfOvdPoi: File | null; // upload
}
export interface IAddressDetail {
  // Permanent Address
  permanentHouseNo: string;
  permanentApartmentName: string;
  permanentStreet: string;
  permanentVillage: string;
  permanentState: string;
  permanentCity: string;
  permanentPinCode: string;
  permanentCountryCode: string;
  permanentAddressSupported: string; // Yes/No
  permanentExactlyMatchWithOvd: string; // Yes/No
  permanentPartialMatchWithOvd: string; // Yes/No

  // Current Address
  sameAsPermanent: string;
  currentHouseNo: string;
  currentApartmentName: string;
  currentStreet: string;
  currentVillage: string;
  currentState: string;
  currentCity: string;
  currentPinCode: string;
  currentCountryCode: string;
  deemedProofOfAddress: string;
  deemedPoAVerified: string; // 'Yes' | 'No' | ''
  declaredAddress: string; // 'Yes' | 'No' | ''
  geoTagged: string; // 'Yes' | 'No' | ''
  currentAddressExactlyMatchWithOvd: string; // Yes/No
  currentPositiveVerification: string; // Yes/No
  currentPhysicalVerificationByThirdParty: string; // Yes/No
  currentPhysicalVerificationByReOfficial: string; // Yes/No

  // Upload
  otherDocument: File | null;
}
export interface IContactDetails {
  email: string;
  countryCode: string;
  mobileNumber: string;
  mobileVerifiedOtp: string;
  emailVerifiedOtp: string;
  mobileVerifiedThirdParty: string;
}
export interface INodalOfficerDetail {
  relation: string;
  ckycNumber: string;
}
export interface IAttestationDetail {
  remarks: string;
  videoKycWithoutOfficial: string;
  digitalKycProcess: string;
  faceToFaceWithOfficial: string;
  nonFaceToFaceOnboarding: string;
  faceToFaceOnboarding: string;
  date: Date | null;
  empName: string;
  empCode: string;
  empDesignation: string;
  empBranch: string;
  empCkycId: string;
  institutionName: string;
  institutionCode: string;
}

export interface NameFields {
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface ICreateKyc {
  DemographicDetailForm: IDemographicDetail | undefined;
  ProofOfIdentityForm: IProofOfIdentity | undefined;
  AddressDetailForm: IAddressDetail | undefined;
  ContactDetailsForm: IContactDetails | undefined;
  NodalOfficerDetailForm: INodalOfficerDetail | undefined;
  AttestationDetailForm: IAttestationDetail | undefined;
}

export interface IError {
  name: string;
  errorMessage: string;
}
