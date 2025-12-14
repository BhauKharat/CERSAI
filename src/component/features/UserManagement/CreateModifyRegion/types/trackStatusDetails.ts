// types/trackStatusDetails.ts - Track status details types

export interface TrackStatusAddress {
  line1: string;
  line2: string;
  line3: string | null;
  city: string;
  state: string;
  district?: string;
  countryCode: string;
  pinCode: string;
  alternatePinCode?: string | null;
  digiPin?: string | null;
}

export interface TrackStatusEntityDetails {
  id: string;
  regionName: string;
  regionCode: string;
  address: TrackStatusAddress;
  status: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCompletionRejected {
  remark: string;
  rejectedBy: string;
  rejectedOn: string;
}

export interface WorkflowCompletionApproved {
  remark?: string;
  approvedBy: string;
  approvedOn: string;
}

export interface WorkflowCompletion {
  remark?: string;
  rejectedBy?: string;
  rejectedOn?: string;
  approvedBy?: string;
  approvedOn?: string;
}

export interface DeactivationDetails {
  deactivationInitiatedBy?: string;
  deactivationInitiatedOn?: string;
  remarks?: string;
}

export interface WorkflowRegion {
  regionCode: string;
  regionName: string;
  address: TrackStatusAddress;
}

export interface WorkflowDetails {
  reason?: string;
  userId?: string;
  regionId?: string;
  regionCode?: string;
  regionName?: string;
  region?: WorkflowRegion;
  rejected?: WorkflowCompletionRejected;
  impactSummary?: {
    totalUsers?: number;
    totalBranches?: number;
  };
}

export interface TrackStatusDetailsData {
  workflowId: string;
  workflowType: string;
  activity: 'CREATE' | 'MODIFY' | 'DEACTIVATE';
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  submittedOn: string;
  actionOn: string;
  actionBy?: string | null;
  rejectionReason?: string | null;
  entityDetails: TrackStatusEntityDetails;
  workflowCompletion?: WorkflowCompletion;
  deactivationDetails?: DeactivationDetails;
  workflowDetails?: WorkflowDetails;
}

export interface TrackStatusDetailsSuccessResponse {
  success: true;
  message: string;
  data: TrackStatusDetailsData;
}

export interface TrackStatusDetailsErrorResponse {
  success: false;
  message: string;
  data?: {
    errorMessage: string;
    errorCode: string;
  };
}

export type TrackStatusDetailsApiResponse =
  | TrackStatusDetailsSuccessResponse
  | TrackStatusDetailsErrorResponse;

export interface TrackStatusDetailsState {
  loading: boolean;
  data: TrackStatusDetailsData | null;
  error: string | null;
}
