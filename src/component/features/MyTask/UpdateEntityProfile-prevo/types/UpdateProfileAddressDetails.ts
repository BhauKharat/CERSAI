export interface AddressType {
  line1?: string;
  line2?: string;
  line3?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pinCode?: string;
  phone?: string;
  alternatePinCode?: string;
  countryCode?: string;
  countryName?: string;
}

export interface FormDataType {
  registeredAddress: AddressType;
  correspondenceAddress: AddressType;
  correspondenceAddressSameAsRegisteredAddress: boolean;
  [key: string]: unknown;
}

export interface AddressErrors {
  line1?: string;
  line2?: string;
  line3?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pinCode?: string;
  phone?: string;
  alternatePinCode?: string;
  countryCode?: string;
  countryName?: string;
}

export interface FormErrors {
  registeredAddress: AddressErrors;
  correspondenceAddress: AddressErrors;
  [key: string]: AddressErrors | Record<string, string> | undefined;
}

export interface Country {
  name: string;
  dial_code: string;
  code: string;
  states?: {
    value: string;
    label: string;
    districts: {
      value: string;
      label: string;
      pincodes?: string[];
    }[];
  }[];
}

export interface Address {
  line1?: string;
  line2?: string;
  line3?: string;
  countryCode?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pinCode?: string;
  alternatePinCode?: string;
  countryName?: string;
}

export interface District {
  label: string;
  value: string;
  pincodes?: string[];
}

export interface State {
  code: string;
  name: string;
  districts: District[];
}

export interface Country {
  name: string;
  dial_code: string;
  code: string;
  states?: {
    value: string;
    label: string;
    districts: {
      label: string;
      value: string;
      pincodes?: string[];
    }[];
  }[];
}
