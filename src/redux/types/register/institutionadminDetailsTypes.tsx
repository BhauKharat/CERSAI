export interface AdminDetails {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  emailId?: string;
  ckycNumber?: string;
  designation?: string;
  gender?: string;
  citizenship?: string;
  countryCode?: string;
  countryName?: string;
  mobileNo?: string;
  landline?: string;
  proofOfIdentity?: string;
  identityNumber?: string;
  dateOfBirth?: string;
  employeeCode?: string;
  sameAsRegisteredAddress?: boolean;
  authorizationLetterDetails?: string;
  dateOfAuthorization?: string;
  authorizationLetterDetailsPreview?: string;
  authorizationLetterFilePreview?: string; // Keep this in Redux
  authorizationLetterFile?: string;
}

export interface ValidationError {
  field: string;
  issue: string;
}

export interface AdminOfficerState {
  adminOne: Partial<AdminDetails>;
  adminTwo: Partial<AdminDetails>;

  loading: boolean;
  errorInstitutionadminDetails: string | null;
  success: boolean;

  ckycLoading: boolean | false;
  ckycError: string | null;
  ckycDataAdminOne: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ckycNo: number;
    gender: string;
  } | null;
  ckycDataAdminTwo: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ckycNo: number;
    gender: string;
  } | null;
  validationErrors: ValidationError[] | null;
  ckycVerified: {
    adminOne: boolean;
    adminTwo: boolean;
  };
}
