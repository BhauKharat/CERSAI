export interface SignUpData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  ckycNo?: string;
  citizenship?: string;
  title?: string;
}

export interface SignUpState {
  loading: boolean;
  error: string | null;
  otpIdentifier: string | null;
  successMessage: string | null;
  ckycLoading: boolean | false;
  ckycError: string | null;
  ckycData: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ckycNo: number;
    gender: string;
  } | null;
}
