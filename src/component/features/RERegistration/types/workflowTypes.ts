// Workflow API Types for FormPreviewStep
export interface WorkflowDocument {
  fieldKey: string;
  type: string;
  id: string;
}

export interface FetchedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Content: string;
  dataUrl: string;
}

export interface WorkflowPayload {
  hoi?: Record<string, unknown>;
  addresses?: Record<string, unknown>;
  submission?: {
    submittedAt: string;
    submittedBy: string;
  };
  nodalOfficer?: Record<string, unknown>;
  entityDetails?: Record<string, unknown>;
  application_esign?: {
    declarationDate: number[];
    declarationPlace: string;
    declarationAccepted: boolean;
    acknowledgementNo?: string;
  };
  institutionalAdminUser?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WorkflowData {
  workflowId: string;
  workflowType: string;
  status: string;
  payload: WorkflowPayload;
  currentStep: string;
  executedSteps: string[];
  documents: WorkflowDocument[];
  modifiableFields?: Record<string, string[]>;
}

export interface WorkflowApiResponse {
  success: boolean;
  data: WorkflowData;
  message: string;
  modifiableFields?: Record<string, string[]>;
}

export interface WorkflowState {
  loading: boolean;
  error: string | null;
  workflowData: WorkflowData | null;
  documents: WorkflowDocument[];
  modifiableFields: Record<string, string[]> | null;
  acknowledgementNo?: string;
  // Document fetching state
  fetchedDocuments: Record<string, FetchedDocument>;
  documentLoading: Record<string, boolean>;
}

export interface FetchWorkflowParams {
  workflowId: string;
  userId: string;
}
