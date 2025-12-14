/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface ILegalDemographicDetail {
  entityName: string;
  entityConstitutionType: string;
  dateOfIncorporation: Date | null;
  dateOfCommencement: Date | null;
  placeOfIncorporation: string;
  countryOfIncorporation: string;
  tinIssuingCountry: string;
  panCard: string;
  form60: File | null;
  gstRegistrationNumber: string;
}
export interface ILegalProofOfIdentity {
  certificateOfIncorporation: File | null;
  cin: string;
  memorandumOfAssociation: File | null;
  resolutionFromBoard: File | null;
  seniorManagementNames: File | null;
  certificateOfCommencement: File | null;
  others: File | null;
}
export interface ILegalAddressDetail {
  // Registered Address
  regFlatNo: string;
  regPlotNo: string;
  regLocality: string;
  regCity: string;
  regState: string;
  regCountry: string;
  regPincode: string;
  regIsoCountryCode: string;
  regAddressProofDoc: string;
  regExactMatchWithCVD: boolean;
  regPartialMatchWithCVD: boolean;

  // Principal Place of Business
  sameAsRegistered: boolean;
  prinFlatNo: string;
  prinPlotNo: string;
  prinLocality: string;
  prinCity: string;
  prinState: string;
  prinCountry: string;
  prinPincode: string;
  prinIsoCountryCode: string;
  prinAddressProofDoc: string;
  prinCvdVerified: boolean;
  prinDeclaredSame: boolean;
  prinVerifiedByThirdParty: boolean;
  prinPhysicallyVerified: boolean;

  // Document Upload
  otherDocument: File | null;
}
export interface ILegalContactDetails {
  primaryCountryCode: string;
  primaryMobileNumber: string;
  primaryEmail: string;
  secondaryCountryCode: string;
  secondaryMobileNumber: string;
  secondaryEmail: string;
  telephone: string;
  fax: string;
}
export interface ILegalNodalOfficerDetail {
  authenticationFactor: string;
  ckycNumber: string;
}
export interface ILegalAttestationDetail {
  remarks: string;
  certifiedCopies: string;
  equivalentEDoc: string;
  kycVerificationDate: Date | null;
  empName: string;
  empCode: string;
  empDesignation: string;
  empBranch: string;
  empCKYCId: string;
  institutionName: string;
  institutionCode: string;
}
export interface ILegalPreview {}

export interface ILegalCreateKyc {
  DemographicDetailForm: ILegalDemographicDetail | undefined;
  ProofOfIdentityForm: ILegalProofOfIdentity | undefined;
  AddressDetailForm: ILegalAddressDetail | undefined;
  ContactDetailsForm: ILegalContactDetails | undefined;
  NodalOfficerDetailForm: ILegalNodalOfficerDetail | undefined;
  AttestationDetailForm: ILegalAttestationDetail | undefined;
  PreviewForm: ILegalPreview | undefined;
}
