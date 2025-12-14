// types/branchTrackStatus.ts - Branch track status types

export interface BranchTrackStatusAddress {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state: string;
  district?: string;
  countryCode: string;
  pinCode: string;
  alternatePinCode?: string;
  digiPin?: string;
}

export interface BranchTrackStatusEntityDetails {
  id: string;
  regionCode: string;
  regionName: string;
  branchName: string;
  branchCode: string;
  address: BranchTrackStatusAddress;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCompletion {
  approvedBy?: string;
  approvedOn?: string;
  rejectedBy?: string;
  rejectedOn?: string;
  remark?: string;
}

export interface BranchTrackStatusData {
  workflowId: string;
  workflowType: string;
  activity: string;
  status: string;
  submittedBy: string;
  submittedOn: string;
  actionOn: string;
  entityDetails: BranchTrackStatusEntityDetails;
  workflowCompletion?: WorkflowCompletion | null;
}

export interface BranchTrackStatusSuccessResponse {
  success: true;
  message: string;
  data: BranchTrackStatusData;
}

export interface BranchTrackStatusErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
  errorCode?: string;
}

export type BranchTrackStatusApiResponse =
  | BranchTrackStatusSuccessResponse
  | BranchTrackStatusErrorResponse;

export interface BranchTrackStatusState {
  loading: boolean;
  data: BranchTrackStatusData | null;
  error: string | null;
}
