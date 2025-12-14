export interface Application {
  createdAt: string;
  pan: string;
  institutionName: string;
  applicationStatus: string;
  acknowledgementNo: string;
  approvalStatus: string;
  callingServiceMetadata: ServiceMetadataData;
  entityDetails: EntityDetails;
  workflowId: string;
  pendingAtStage: number;
}
export interface ISortBy {
  key: string;
  type: string;
}

export interface ApplicationsResponse {
  content: Application[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  workflowId: string;
}

export interface ApplicationsState {
  data: ApplicationsResponse | null;
  loading: boolean;
  error: string | null;
}

export interface ServiceMetadataData {
  initiatedBy: string;
  applicationId: string;
  reportingEntityName: string;
  callingService: string;
  pan: string;
}

export interface EntityDetails {
  nameOfInstitution: string;
  regulator: string;
  panNo: string;
  cinNo: string;
}
