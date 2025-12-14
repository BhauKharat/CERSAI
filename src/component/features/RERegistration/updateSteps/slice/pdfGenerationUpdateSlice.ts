/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../../../redux/store';
import { API_ENDPOINTS } from '../../../../../Constant';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import {
  GeneratePdfParams,
  GeneratePdfResponse,
  PdfGenerationState,
  ESignParams,
  ESignResponse,
} from '../types/pdfGenerationUpdateTypes';

// Initial state
const initialState: PdfGenerationState = {
  loading: false,
  error: null,
  pdfDocumentId: null,
  pdfDocument: null,
  documentLoading: false,
  eSignLoading: false,
  signedDocumentId: null,
  signedDocument: null,
  ackNo: null,
  acknowledgementNo: null,
  submissionLoading: false,
  submissionError: null,
  submissionSuccess: false,
};

// Async thunk to generate PDF for update flow
export const generateUpdatePdf = createAsyncThunk(
  'pdfGenerationUpdate/generatePdf',
  async (params: GeneratePdfParams, { rejectWithValue }) => {
    try {
      console.log('🔄 Generating update PDF:', params);

      const response = await Secured.get(
        `${API_ENDPOINTS.update_profile_generate_pdf}?workflowId=${params.workflowId}&userId=${params.userId}`
      );

      const data: GeneratePdfResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate PDF');
      }

      console.log('✅ PDF generated successfully:', data);
      return data;
    } catch (error: unknown) {
      console.error('❌ Error generating PDF:', error);

      // Handle specific API error responses
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { error?: { message?: string }; message?: string };
          };
        };
        const apiError = axiosError.response?.data;
        if (apiError) {
          console.error('❌ API Error Details:', apiError);

          // Return specific error message from API
          return rejectWithValue(
            apiError.error?.message ||
              apiError.message ||
              'PDF generation failed'
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Async thunk to fetch generated PDF document
export const fetchGeneratedUpdatePdf = createAsyncThunk(
  'pdfGenerationUpdate/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching generated update PDF document:', documentId);

      const response = await Secured.get(
        API_ENDPOINTS.fetch_document_stream(documentId),
        {
          responseType: 'blob', // Handle binary data
        }
      );

      console.log('✅ PDF document fetched successfully:', documentId);

      // Handle binary response (PDF data)
      const blob = response.data;

      // Force content type to application/pdf for proper iframe display
      // Some APIs return application/octet-stream which doesn't display in iframe
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Convert blob to base64 data URL for persistence across page reloads
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `update_form_${documentId}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      const fetchedDocument = {
        id: documentId,
        fileName,
        fileSize: pdfBlob.size,
        mimeType: 'application/pdf', // Always use application/pdf for proper display
        base64Content: dataUrl, // Store the base64 data URL for persistence
        dataUrl,
      };

      console.log('✅ PDF document processed successfully');
      console.log('📄 Document details:', {
        id: fetchedDocument.id,
        fileName: fetchedDocument.fileName,
        fileSize: fetchedDocument.fileSize,
        mimeType: fetchedDocument.mimeType,
        hasDataUrl: !!fetchedDocument.dataUrl,
        dataUrlPreview: fetchedDocument.dataUrl?.substring(0, 50) + '...',
      });

      return { documentId, document: fetchedDocument };
    } catch (error) {
      console.error('❌ Error fetching PDF document:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch PDF document'
      );
    }
  }
);

// Async thunk to eSign update application
export const eSignUpdate = createAsyncThunk(
  'pdfGenerationUpdate/eSignUpdate',
  async (params: ESignParams & { workflowId: string }, { rejectWithValue }) => {
    try {
      console.log('🔄 eSign update application:', params);

      const response = await Secured.post(
        API_ENDPOINTS.update_profile_esign(params.workflowId),
        {
          userId: params.userId,
          declaration: params.declaration,
          declarationPlace: params.declarationPlace,
          declarationDate: params.declarationDate,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data: ESignResponse = response.data;

      if (!data.data?.id) {
        throw new Error(data.message || 'Failed to eSign update');
      }

      console.log('✅ eSign update successful:', data);
      return data;
    } catch (error: unknown) {
      console.error('❌ Error eSign update:', error);

      // Handle specific API error responses
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { error?: { message?: string }; message?: string };
          };
        };
        const apiError = axiosError.response?.data;
        if (apiError) {
          console.error('❌ API Error Details:', apiError);

          // Return specific error message from API
          return rejectWithValue(
            apiError.error?.message || apiError.message || 'eSign update failed'
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Async thunk to submit update profile after e-sign
export const submitUpdateProfile = createAsyncThunk(
  'pdfGenerationUpdate/submitUpdateProfile',
  async (
    params: {
      workflowId: string;
      userId: string;
      acknowledgementNo: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🔄 Submitting update profile:', params);

      // Create FormData
      const formData = new FormData();

      // Add metadata as JSON blob with correct content type
      const metadata = {
        submittedBy: params.userId,
        submittedAt: new Date().toISOString(),
      };
      formData.append('metadata', JSON.stringify(metadata));

      // Add other required fields
      formData.append('workflowId', params.workflowId);
      formData.append('userId', params.userId);
      formData.append('acknowledgementNo', params.acknowledgementNo);

      const response = await Secured.post(
        API_ENDPOINTS.update_profile_submission,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Update profile submitted successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error submitting update profile:', error);

      // Handle specific API error responses
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: { message?: string; code?: string; type?: string };
              message?: string;
            };
            status?: number;
          };
        };
        const apiError = axiosError.response?.data;
        if (apiError) {
          console.error('❌ API Error Details:', apiError);

          // Return specific error object from API for detailed handling
          return rejectWithValue({
            message:
              apiError.error?.message ||
              apiError.message ||
              'Update profile submission failed',
            code: apiError.error?.code || 'UNKNOWN_ERROR',
            type: apiError.error?.type || 'ERROR',
            status: axiosError.response?.status || 500,
          });
        }
      }

      return rejectWithValue({
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        code: 'UNKNOWN_ERROR',
        type: 'ERROR',
        status: 500,
      });
    }
  }
);

// Async thunk to fetch signed PDF document
export const fetchSignedUpdatePdf = createAsyncThunk(
  'pdfGenerationUpdate/fetchSignedDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching signed update PDF document:', documentId);

      const response = await Secured.get(
        API_ENDPOINTS.fetch_document_stream(documentId),
        {
          responseType: 'blob',
        }
      );

      console.log('✅ Signed PDF document fetched successfully:', documentId);

      // Handle binary response (PDF data)
      const blob = response.data;

      // Force content type to application/pdf for proper iframe display
      // Some APIs return application/octet-stream which doesn't display in iframe
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Convert blob to base64 data URL for persistence
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `signed_update_form_${documentId}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      const fetchedDocument = {
        id: documentId,
        fileName,
        fileSize: pdfBlob.size,
        mimeType: 'application/pdf', // Always use application/pdf for proper display
        base64Content: dataUrl,
        dataUrl,
      };

      console.log('✅ Signed PDF document processed:', fetchedDocument);

      return { documentId, document: fetchedDocument };
    } catch (error) {
      console.error('❌ Error fetching signed PDF document:', error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to fetch signed PDF document'
      );
    }
  }
);

// Async thunk to submit update application
export const submitUpdateApplication = createAsyncThunk(
  'pdfGenerationUpdate/submitApplication',
  async (params: { updateRequestId: string }, { rejectWithValue }) => {
    try {
      console.log('🔄 Submitting update application:', params);

      const response = await Secured.post(
        API_ENDPOINTS.submit_application_update(params.updateRequestId),
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        '✅ Update application submitted successfully:',
        response.data
      );
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error submitting update application:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { error?: { message?: string }; message?: string };
          };
        };
        const apiError = axiosError.response?.data;
        if (apiError) {
          console.error('❌ API Error Details:', apiError);

          return rejectWithValue(
            apiError.error?.message ||
              apiError.message ||
              'Update application submission failed'
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// PDF Generation Update slice
const pdfGenerationUpdateSlice = createSlice({
  name: 'pdfGenerationUpdate',
  initialState,
  reducers: {
    clearPdfDocument: (state) => {
      state.pdfDocumentId = null;
      state.pdfDocument = null;
      state.documentLoading = false;
      state.error = null;
    },
    clearSignedDocument: (state) => {
      state.signedDocumentId = null;
      state.signedDocument = null;
      state.eSignLoading = false;
    },
    resetPdfGenerationUpdate: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate PDF cases
      .addCase(generateUpdatePdf.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.pdfDocumentId = null;
        state.pdfDocument = null;
      })
      .addCase(generateUpdatePdf.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.pdfDocumentId = action.payload.data.id;
      })
      .addCase(generateUpdatePdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch PDF document cases
      .addCase(fetchGeneratedUpdatePdf.pending, (state) => {
        console.log('🔄 Redux: Fetch PDF document pending...');
        state.documentLoading = true;
      })
      .addCase(fetchGeneratedUpdatePdf.fulfilled, (state, action) => {
        console.log(
          '✅ Redux: PDF document fetched successfully, updating state...'
        );
        console.log('📦 Redux: Document payload:', {
          id: action.payload.document.id,
          hasDataUrl: !!action.payload.document.dataUrl,
        });
        state.documentLoading = false;
        state.pdfDocument = action.payload.document;
        console.log('✅ Redux: State updated with PDF document');
      })
      .addCase(fetchGeneratedUpdatePdf.rejected, (state, action) => {
        console.error(
          '❌ Redux: Failed to fetch PDF document:',
          action.payload
        );
        state.documentLoading = false;
        state.error = action.payload as string;
      })
      // eSign cases
      .addCase(eSignUpdate.pending, (state) => {
        state.eSignLoading = true;
        state.error = null;
      })
      .addCase(eSignUpdate.fulfilled, (state, action) => {
        state.eSignLoading = false;
        state.signedDocumentId = action.payload.data.id;
        state.ackNo = action.payload.data.ackNo;
        state.acknowledgementNo = action.payload.data.ackNo;
      })
      .addCase(eSignUpdate.rejected, (state, action) => {
        state.eSignLoading = false;
        state.error = action.payload as string;
      })
      // Fetch signed PDF document cases
      .addCase(fetchSignedUpdatePdf.pending, (state) => {
        state.documentLoading = true;
      })
      .addCase(fetchSignedUpdatePdf.fulfilled, (state, action) => {
        state.documentLoading = false;
        state.signedDocument = action.payload.document;
      })
      .addCase(fetchSignedUpdatePdf.rejected, (state, action) => {
        state.documentLoading = false;
        state.error = action.payload as string;
      })
      // Submit update profile cases
      .addCase(submitUpdateProfile.pending, (state) => {
        state.submissionLoading = true;
        state.submissionError = null;
        state.submissionSuccess = false;
      })
      .addCase(submitUpdateProfile.fulfilled, (state) => {
        state.submissionLoading = false;
        state.submissionError = null;
        state.submissionSuccess = true;
      })
      .addCase(submitUpdateProfile.rejected, (state, action) => {
        state.submissionLoading = false;
        state.submissionError = action.payload || null;
        state.submissionSuccess = false;
      });
  },
});

export const {
  clearPdfDocument,
  clearSignedDocument,
  resetPdfGenerationUpdate,
} = pdfGenerationUpdateSlice.actions;

// Selectors
export const selectPdfUpdateGenerationLoading = (state: RootState) =>
  state.pdfGenerationUpdate?.loading || false;
export const selectPdfUpdateGenerationError = (state: RootState) =>
  state.pdfGenerationUpdate?.error || null;
export const selectPdfUpdateDocumentId = (state: RootState) =>
  state.pdfGenerationUpdate?.pdfDocumentId || null;
export const selectPdfUpdateDocument = (state: RootState) =>
  state.pdfGenerationUpdate?.pdfDocument || null;
export const selectPdfUpdateDocumentLoading = (state: RootState) =>
  state.pdfGenerationUpdate?.documentLoading || false;
export const selectESignUpdateLoading = (state: RootState) =>
  state.pdfGenerationUpdate?.eSignLoading || false;
export const selectSignedUpdateDocumentId = (state: RootState) =>
  state.pdfGenerationUpdate?.signedDocumentId || null;
export const selectSignedUpdateDocument = (state: RootState) =>
  state.pdfGenerationUpdate?.signedDocument || null;
export const selectUpdateAckNo = (state: RootState) =>
  state.pdfGenerationUpdate?.ackNo || null;
export const selectUpdateAcknowledgementNo = (state: RootState) =>
  state.pdfGenerationUpdate?.acknowledgementNo || null;
export const selectSubmissionLoading = (state: RootState) =>
  state.pdfGenerationUpdate?.submissionLoading || false;
export const selectSubmissionError = (state: RootState) =>
  state.pdfGenerationUpdate?.submissionError || null;
export const selectSubmissionSuccess = (state: RootState) =>
  state.pdfGenerationUpdate?.submissionSuccess || false;

export default pdfGenerationUpdateSlice.reducer;
