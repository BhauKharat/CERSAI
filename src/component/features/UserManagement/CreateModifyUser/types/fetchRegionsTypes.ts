// Types for Fetch Regions API

export interface RegionAddress {
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

export interface RegionData {
  id: string;
  regionName: string;
  regionCode: string;
  address: RegionAddress;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchRegionsRequest {
  userId: string;
}

export interface FetchRegionsSuccessResponse {
  success: boolean;
  data: RegionData[];
  message: string;
}

export interface FetchRegionsErrorResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface FetchRegionsState {
  loading: boolean;
  data: RegionData[] | null;
  error: string | null;
}
