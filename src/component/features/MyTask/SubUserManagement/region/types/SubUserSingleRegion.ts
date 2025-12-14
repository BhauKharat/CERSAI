// Single Region Address Type
export interface SubUserRegionAddress {
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

// Single Region Data Type
export interface SubUserSingleRegionData {
  regionCode: string;
  regionName: string;
  sourceRegionCodes?: string;
  targetRegionCode: string;
  structureType: string;
  // address: SubUserRegionAddress;
}

// Single Region Success Response
export interface SubUserSingleRegionSuccessResponse {
  loading?: boolean;
  error?: string | null;
  success?: true;
  message?: string;
  data?: SubUserSingleRegionData | undefined;
}

// Single Region Error Data
export interface SubUserSingleRegionErrorData {
  errorCode: string;
  errorMessage: string;
}

// Single Region Error Response
export interface SubUserSingleRegionErrorResponse {
  success: false;
  message: string;
  data: SubUserSingleRegionErrorData;
}

// Redux State for Single Region
export interface SubUserSingleRegionState {
  loading: boolean;
  data: SubUserSingleRegionData | undefined | null;
  error: string | null;
}

export interface StatusSubUserRegionType {
  type: string;
  reason?: string;
}
