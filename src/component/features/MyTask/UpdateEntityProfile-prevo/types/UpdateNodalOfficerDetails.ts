interface NodalOfficerDetailsTypes {
  citizenship: string;
  ckycNo: string;
  countryCode: string;
  countryName: string;
  dateOfBirth: string;
  dateOfBoardResolution: string;
  designation: string;
  email: string;
  firstName: string;
  gender: string;
  id: string;
  identityNumber: string;
  landline: string | null;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  proofOfIdentity: string;
  sameAsRegisteredAddress: boolean;
  title: string;
  boardResolution: string | null;
  certifiedPoi: string | null;
  certifiedPic?: string | null;
}
interface NodalDocumentData {
  base64Content: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  id: string;
}

export interface NodalDataResponse {
  nodalOfficerDetails: NodalOfficerDetailsTypes;
  documents: NodalDocumentData[];
  disabledSections: string[];
}
