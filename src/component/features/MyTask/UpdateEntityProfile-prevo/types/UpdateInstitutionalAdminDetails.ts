export interface AdminFormValues {
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
  identityNumber: string;
  landline: string;
  lastName: string;
  middleName: string;
  mobileNo: string;
  proofOfIdentity: string;
  sameAsRegisteredAddress: boolean;
  title: string;
  countryName: string;
  photoIdentity: string | File;
  addressProof: string | File;
  regulatorLicence: string | File;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  digipin: string;
}

export interface AdminsForm {
  adminOneDetails: AdminFormValues;
  adminTwoDetails: AdminFormValues;
}
