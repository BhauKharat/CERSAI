/* eslint-disable @typescript-eslint/no-explicit-any */
// PDF Generation API Types
export interface GeneratePdfParams {
  userId: string;
  workflowId: string;
}

export interface GeneratePdfResponse {
  success: boolean;
  data: {
    fieldKey: string;
    type: string;
    id: string;
  };
  message: string;
}

export interface ESignParams {
  workflowId: string;
  userId: string;
  declaration: boolean;
  declarationPlace: string;
  declarationDate: string;
}

export interface ESignResponse {
  message: string;
  data: {
    fieldKey: string;
    type: string;
    id: string;
    ackNo: string;
  };
}

export interface PdfGenerationState {
  loading: boolean;
  error: string | null;
  pdfDocumentId: string | null;
  pdfDocument: any | null;
  documentLoading: boolean;
  eSignLoading: boolean;
  signedDocumentId: string | null;
  signedDocument: any | null;
  ackNo: string | null;
  acknowledgementNo?: string | null;
  submissionLoading: boolean;
  submissionError: any | null;
  submissionSuccess: boolean;
}
