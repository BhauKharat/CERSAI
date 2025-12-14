// src/types/register/nodalOfficerTypes.ts
export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode?: string;
}

export interface NodalOfficerFormData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  countryCode?: string;
  mobileNumber?: string;
  ckycNo?: string;
  designation?: string;
  gender?: string;
  citizenship?: string;
  landline?: string;
  proofOfIdentity?: string;
  identityNumber?: string;
  dateOfBirth?: string;
  dateOfBoardResolution?: string;
  sameAsRegisteredAddress?: boolean;
  employeeCode?: string;
  // officeAddress?: Address;
  no_board_resolution?: File;
  no_certified_poi?: File;
  no_certified_photoIdentity?: File;
}

export interface NodalOfficerState {
  formData: NodalOfficerFormData;
  loading: boolean;
  Nodalerror: null | {
    field?: string;
    issue?: string;
    rawMessage?: string;
  };
  success: boolean;
  ckycLoading: boolean | false;
  ckycError: string | null;
  ckycData: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ckycNo: number;
  } | null;
}
