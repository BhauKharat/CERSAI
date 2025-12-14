// Step Data Types

export interface StepDocument {
  fieldKey: string;
  type: string;
  id: string;
}

export interface StepData {
  status: string;
  step_name: string;
  data: Record<string, string | number | boolean>;
  last_updated: string;
  last_updated_by: string;
}

export interface StepDataResponse {
  message: string;
  data: {
    success: boolean;
    message: string;
    data: {
      step: StepData;
      documents: StepDocument[];
    };
    timestamp: number;
  };
}

export interface DocumentFetchResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    base64Content: string;
  };
}

export interface FetchedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Content: string;
  dataUrl: string; // Constructed data URL for preview
}

export interface StepDataState {
  loading: boolean;
  error: string | null;
  stepData: StepData | null;
  documents: StepDocument[];
  fetchedDocuments: Record<string, FetchedDocument>; // Map of document ID to fetched document
  documentLoading: Record<string, boolean>; // Track loading state per document
  lastFetched: string | null;
}
