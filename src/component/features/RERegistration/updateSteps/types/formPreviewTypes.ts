/* eslint-disable @typescript-eslint/no-explicit-any */

export interface WorkflowDocument {
  fieldKey: string;
  type: string;
  id: string;
}

export interface WorkflowApproval {
  action: string;
  reason: string;
  remarks: string;
  actionBy: string;
  actionDateTime: string;
}

export interface ApprovalWorkflow {
  approvals: WorkflowApproval[];
  finalApproval: string;
  noOfApprovals: number;
  approvalStatus: string;
  pendingAtLevel: number;
}

export interface WorkflowPayload {
  hoi?: Record<string, any>;
  userId?: string;
  addresses?: Record<string, any>;
  submission?: Record<string, any>;
  nodalOfficer?: Record<string, any>;
  entityDetails?: Record<string, any>;
  'nodal-officer'?: Record<string, any>;
  approvalWorkflow?: ApprovalWorkflow;
  application_esign?: Record<string, any>;
  institutionalAdminUser?: Record<string, any>;
  profile_update_initiated?: {
    updateData: Record<string, any>;
  };
  [key: string]: any;
}

export interface WorkflowData {
  workflowId: string;
  workflowType: string;
  status: string;
  submittedOn?: string;
  submittedBy?: string;
  acknowledgementNo?: string;
  payload: WorkflowPayload;
  currentStep: string;
  executedSteps: string[];
  documents: WorkflowDocument[];
  profileData?: Record<string, any>;
}

export interface WorkflowResponse {
  success: boolean;
  data: WorkflowData;
  message: string;
}

export interface FetchedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Content: string;
  dataUrl: string;
}

export interface GroupedFields {
  [groupName: string]: {
    label: string;
    fields: any[];
  };
}

export interface FormPreviewState {
  workflowData: WorkflowData | null;
  groupedFields: GroupedFields;
  fields: any[];
  configuration: any;
  documents: WorkflowDocument[];
  fetchedDocuments: Record<string, FetchedDocument>;
  documentLoading: Record<string, boolean>;
  dropdownData: Record<string, any>;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}
