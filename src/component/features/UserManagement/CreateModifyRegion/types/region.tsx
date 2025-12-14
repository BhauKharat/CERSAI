// types/region.tsx - General region types for listing and management

// Region Address from List API
export interface RegionAddressFromList {
  line1: string;
  line2: string;
  line3: string | null;
  city: string;
  state: string;
  countryCode: string;
  pinCode: string;
  alternatePinCode: string | null;
  digiPin: string | null;
}

export interface Region {
  regionCode: string;
  regionName: string;
  address: RegionAddressFromList;
  srNo?: number;
  status: string;
  lastUpdatedOn?: string;
  lastUpdatedBy?: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

export interface RegionSuccessResponse {
  success: true;
  message: string;
  data: {
    content: Region[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export interface RegionErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type RegionApiResponse = RegionSuccessResponse | RegionErrorResponse;

export interface RegionState {
  loading: boolean;
  regions: Region[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  error: string | null;
}
