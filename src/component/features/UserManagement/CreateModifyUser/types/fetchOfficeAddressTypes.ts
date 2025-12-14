// Types for Fetch Office Address API

export interface OfficeAddressData {
  line1: string;
  line2?: string;
  line_2?: string;
  line3?: string;
  line_3?: string;
  state: string;
  district: string;
  country: string;
  countryCode?: string;
  city: string;
  pinCode?: string;
  pincode?: string;
  pin_code?: string;
  alternatePinCode?: string;
  otherPinCode?: string;
  pincode_other?: string;
  digiPin?: string;
  digipin?: string;
  digi_pin?: string;
  addressType?: 'REGISTERED' | 'CORRESPONDENCE';
  address_type?: 'REGISTERED' | 'CORRESPONDENCE';
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  id?: string;
  same_as_correspondence_address?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FetchOfficeAddressRequest {
  // No request params needed for GET request
  [key: string]: never;
}

export interface FetchOfficeAddressSuccessResponse {
  data: OfficeAddressData[];
}

export interface FetchOfficeAddressErrorResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface FetchOfficeAddressState {
  loading: boolean;
  data: OfficeAddressData[] | null;
  error: string | null;
}
