// src/redux/slices/REEntityUpdate/types.ts

export interface Document {
  documentType: string;
  base64Content?: string;
  file?: File;
  fileName?: string;
  fileSize?: number;
  id?: string;
}

export interface EntityDetails {
  nameOfInstitution: string;
  regulator: string;
  institutionType: string;
  constitution: string;
  proprietorName: string;
  registrationNo: string;
  panNo: string;
  cinNo: string;
  llpinNo: string;
  gstinNo: string;
  reWebsite: string;
}

export interface EntityProfileState {
  entityDetails: Partial<EntityDetails>;
  documents: Document[];
  loading: boolean;
  errors: string | null;
  success: boolean;
}
