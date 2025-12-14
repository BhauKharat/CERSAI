// KYC.types.ts

export interface KYCResult {
  name: string;
  dob: string;
  gender: string;
  ref: string;
  docs: boolean;
}

export interface CombinationResult {
  gender: string;
  ref: string;
  dob: string;
  name: string;
  mobile: string;
  email: string;
  lastUpdated: string;
  photoUrl: string;
  documents: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}
export interface KYCReferenceResultProps {
  authencationFactor: string;
  mobile: string;
  dob: string;
  dateOfIncorporation: string;
  kycReferenceNumber: string;
}

export interface KYCombine {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
}
export interface KYCRefrence {
  kycReferenceNumber: string | undefined;
}
export interface KYCPhoto {
  firstName: string;
  middleName: string;
  lastName: string;
  photo: File | null;
}
export interface KYCPan {
  pan: string;
}
export interface KYCLegalCombination {
  name: string;
  dateOfIncorporation: string;
}

export interface KYCCombinationFormProps {
  onSearch: (fields: {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    dob: string;
  }) => void;
  loading?: boolean;
}
export interface KYCReferenceFormProps {
  onSearch: (data: KYCRefrence) => void;
  loading?: boolean;
}

export interface KYCRefrenceNumber {
  authencationFactor?: string | null;
  mobileNumber?: string | null;
  emailId?: string | null;
}
export interface KYCReferenceNumberProps {
  onFind: (data: KYCRefrenceNumber) => void;
  loading?: boolean;
}
export interface KYCLegalCombinationFormProps {
  onSearch: (fields: { name: string; dateOfIncorporation: string }) => void;
  loading?: boolean;
}

export interface KYCPanFormProps {
  onSearch: (fields: { pan: string }) => void;
  loading?: boolean;
}

export type KYCPhotoFormProps = {
  onSearch: (data: KYCPhoto) => void;
  loading: boolean;
  onReset: () => void;
};

// Define the props interface for SingleKYCSearch
export interface SingleKYCSearchProps {
  // States to be managed by the parent (SearchKYC) and passed down
  entityType: EntityType;
  setEntityType: (type: EntityType) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchResults: KYCResult[];
  setSearchResults: (results: KYCResult[]) => void;
  searchAttempted: boolean;
  setSearchAttempted: (attempted: boolean) => void;
  mockResults: KYCResult[]; // Mock data passed from parent
}
export interface SingleKYCDownloadProps {
  // States to be managed by the parent (SearchKYC) and passed down
  entityType: EntityType;
  setEntityType: (type: EntityType) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchResults: KYCResult[];
  setSearchResults: (results: KYCResult[]) => void;
  searchAttempted: boolean;
  setSearchAttempted: (attempted: boolean) => void;
  mockResults: KYCResult[]; // Mock data passed from parent
}

export interface KycDetails {
  name: string;
  gender: string;
  mobileNumber: string;
  emailId: string;
  lastUpdated: string;
  ckycReferenceNumber: string;
  submittedDocuments: {
    personalDetails: { [key: string]: string };
    proofOfIdentityAndAddress: { [key: string]: string };
    addressDetails: { [key: string]: string };
    relatedPartyDetails: { [key: string]: string };
    otherDetailsAndAttestation: { [key: string]: string };
  };
}
export interface KycDetailsDisplayProps {
  kycData: KycDetails | null;
}

export type EntityType = 'individual' | 'legal' | null;
export type IAccountType = 'Normal' | 'Minor' | 'Aadhaar' | null;
export type SearchType = 'ovd' | 'combination' | 'photo' | 'pan' | null;
