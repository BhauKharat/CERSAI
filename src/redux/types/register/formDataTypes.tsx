/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/register/formDataTypes.ts

export interface FormDataType {
  nameOfInstitution?: string;
  institutionType?: string;
  constitution?: string;
  regulator?: string;
  proprietorName?: string;
  registrationNo?: string;
  panNo?: string;
  cinNo?: string;
  cin?: File;
  re_cinPreview?: string;
  llpinNo?: string;
  gstinNo?: string;
  reWebsite?: string;
  pan?: File;
  re_panPreview?: string;
  registration_certificate?: File;
  registration_certificatePreview?: string;
  regulator_licence?: File | null;
  regulator_licencePreview?: string;
  address_proof?: File | null;
  address_proofPreview?: string;
  re_other_file?: File | null;
  re_other_filePreview?: string;
  re_pan?: File | null;
  re_cin?: File | null;
  [key: string]: any;
}
