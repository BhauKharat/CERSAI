// Types for user address API

export interface UserAddressData {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  addressId: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  district: string;
  stateCode: string;
  countryCode: string;
  pinCode: string;
  alternatePinCode: string;
  addressType: string | null;
  digiPin: string | null;
}

export interface UserAddressSuccessResponse {
  success: true;
  message: string;
  data: UserAddressData;
}

export interface UserAddressErrorResponse {
  success: false;
  message: string;
  data: {
    errorCode: string;
    errorMessage: string;
  };
}

export interface UserAddressState {
  loading: boolean;
  data: UserAddressData | null;
  error: string | null;
}

export interface UserAddressParams {
  userType: string;
  addressType?: string;
  regionName?: string;
  branchName?: string;
}
