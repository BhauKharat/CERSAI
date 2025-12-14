// Single Region Address Type
export interface RegionAddress {
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
export interface SingleRegionData {
  regionCode: string;
  regionName: string;
  address: RegionAddress;
}

// Single Region Success Response
export interface SingleRegionSuccessResponse {
  success: true;
  message: string;
  data: SingleRegionData;
}

// Single Region Error Data
export interface SingleRegionErrorData {
  errorCode: string;
  errorMessage: string;
}

// Single Region Error Response
export interface SingleRegionErrorResponse {
  success: false;
  message: string;
  data: SingleRegionErrorData;
}

// Redux State for Single Region
export interface SingleRegionState {
  loading: boolean;
  data: SingleRegionData | null;
  error: string | null;
}
