// Single Branch Address Type
export interface SubUserBranchAddress {
  id: string | null;
  line1: string;
  line2: string;
  line3: string | null;
  countryCode: string;
  state: string;
  district: string;
  cityTown: string;
  pinCode: string;
  alternatePinCode: string | null;
  digiPin: string | null;
}

// Single Branch Data Type
export interface SubUserSingleBranchData {
  branchCode: string;
  branchName: string;
  address: SubUserBranchAddress;
}

// Single Branch Success Response
export interface SubUserSingleBranchSuccessResponse {
  success: true;
  message: string;
  data: SubUserSingleBranchData;
}

// Single Branch Error Data
export interface SubUserSingleBranchErrorData {
  errorCode: string;
  errorMessage: string;
}

// Single Branch Error Response
export interface SubUserSingleBranchErrorResponse {
  success: false;
  message: string;
  data: SubUserSingleBranchErrorData;
}

// Redux State for Single Branch
export interface SubUserSingleBranchState {
  loading: boolean;
  data: SubUserSingleBranchData | null;
  error: string | null;
}

export interface StatusSubUserBranchType {
  type?: string;
  reason?: string;
  remark?: string;
  branchCode?: string;
}
