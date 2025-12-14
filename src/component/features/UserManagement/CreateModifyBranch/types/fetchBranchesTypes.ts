// Types for Fetch Branches API

export interface BranchAddress {
  line1: string;
  line2: string;
  line3: string;
  city: string;
  state: string;
  district: string;
  countryCode: string;
  pinCode: string;
  alternatePinCode?: string;
  digiPin?: string;
}

export interface BranchData {
  id: string;
  regionCode: string;
  regionName: string;
  branchName: string;
  branchCode: string;
  address: BranchAddress;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchBranchesRequest {
  regionId: string;
}

export interface FetchBranchesSuccessResponse {
  success: boolean;
  data: BranchData[];
  message: string;
}

export interface FetchBranchesErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface FetchBranchesState {
  loading: boolean;
  data: BranchData[] | null;
  error: string | null;
}
