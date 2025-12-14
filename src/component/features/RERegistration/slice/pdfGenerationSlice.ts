import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../../redux/store';
import { API_ENDPOINTS } from '../../../../Constant';
import { Secured } from '../../../../utils/HelperFunctions/api';
import {
  GeneratePdfParams,
  GeneratePdfResponse,
  PdfGenerationState,
  ESignParams,
  ESignResponse,
} from '../types/pdfGenerationTypes';

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
};

// Async thunk to generate PDF
export const generateRegistrationPdf = createAsyncThunk(
  'pdfGeneration/generatePdf',
  async (params: GeneratePdfParams, { rejectWithValue }) => {
    try {
      console.log('🔄 Generating registration PDF:', params);

      const response = await Secured.get(
        `${API_ENDPOINTS.generate_registration_pdf}?userId=${params.userId}&workflowId=${params.workflowId}`
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
export const fetchGeneratedPdf = createAsyncThunk(
  'pdfGeneration/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching generated PDF document:', documentId);

      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${documentId}`,
        {
          responseType: 'blob', // Handle binary data
        }
      );

      console.log('✅ PDF document fetched successfully:', documentId);

      // Handle binary response (PDF data)
      const blob = response.data;
      const contentType = response.headers['content-type'] || 'application/pdf';

      // Convert blob to base64 data URL for persistence across page reloads
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `registration_form_${documentId}.pdf`;
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
        fileSize: blob.size,
        mimeType: contentType,
        base64Content: dataUrl, // Store the base64 data URL for persistence
        dataUrl,
      };

      console.log('✅ PDF document processed:', fetchedDocument);

      return { documentId, document: fetchedDocument };
    } catch (error) {
      console.error('❌ Error fetching PDF document:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch PDF document'
      );
    }
  }
);

// Async thunk to eSign registration
export const eSignRegistration = createAsyncThunk(
  'pdfGeneration/eSignRegistration',
  async (params: ESignParams, { rejectWithValue }) => {
    try {
      console.log('🔄 eSign registration:', params);

      const response = await Secured.post(
        `${API_ENDPOINTS.esign_registration}?workflowId=${params.workflowId}`,
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
        throw new Error(data.message || 'Failed to eSign registration');
      }

      console.log('✅ eSign registration successful:', data);
      return data;
    } catch (error: unknown) {
      console.error('❌ Error eSign registration:', error);

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
              'eSign registration failed'
          );
        }
      }

      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Async thunk to fetch signed PDF document
export const fetchSignedPdf = createAsyncThunk(
  'pdfGeneration/fetchSignedDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching signed PDF document:', documentId);

      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${documentId}`,
        {
          responseType: 'blob', // Handle binary data
        }
      );

      console.log('✅ Signed PDF document fetched successfully:', documentId);

      // Handle binary response (PDF data)
      const blob = response.data;
      const contentType = response.headers['content-type'] || 'application/pdf';

      // Convert blob to base64 data URL for persistence across page reloads
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `signed_registration_form_${documentId}.pdf`;
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
        fileSize: blob.size,
        mimeType: contentType,
        base64Content: dataUrl, // Store the base64 data URL for persistence
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

// Create slice
const pdfGenerationSlice = createSlice({
  name: 'pdfGeneration',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetState: () => {
      return initialState;
    },

    // Clear PDF document
    clearPdfDocument: (state) => {
      state.pdfDocument = null;
      state.pdfDocumentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate PDF cases
      .addCase(generateRegistrationPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateRegistrationPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.pdfDocumentId = action.payload.data.id;
      })
      .addCase(generateRegistrationPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.pdfDocumentId = null;
      })
      // Fetch PDF document cases
      .addCase(fetchGeneratedPdf.pending, (state) => {
        state.documentLoading = true;
      })
      .addCase(fetchGeneratedPdf.fulfilled, (state, action) => {
        state.documentLoading = false;
        state.pdfDocument = action.payload.document;
      })
      .addCase(fetchGeneratedPdf.rejected, (state, action) => {
        state.documentLoading = false;
        state.error = action.payload as string;
      })
      // eSign registration cases
      .addCase(eSignRegistration.pending, (state) => {
        state.eSignLoading = true;
        state.error = null;
      })
      .addCase(eSignRegistration.fulfilled, (state, action) => {
        state.eSignLoading = false;
        state.error = null;
        state.signedDocumentId = action.payload.data.id;
        state.acknowledgementNo = action.payload.data.ackNo;
      })
      .addCase(eSignRegistration.rejected, (state, action) => {
        state.eSignLoading = false;
        state.error = action.payload as string;
        state.signedDocumentId = null;
      })
      // Fetch signed PDF document cases
      .addCase(fetchSignedPdf.pending, (state) => {
        state.documentLoading = true;
      })
      .addCase(fetchSignedPdf.fulfilled, (state, action) => {
        state.documentLoading = false;
        state.signedDocument = action.payload.document;
      })
      .addCase(fetchSignedPdf.rejected, (state, action) => {
        state.documentLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, resetState, clearPdfDocument } =
  pdfGenerationSlice.actions;

// Selectors
export const selectPdfGenerationLoading = (state: RootState) =>
  state.pdfGeneration?.loading || false;

export const selectPdfGenerationError = (state: RootState) =>
  state.pdfGeneration?.error || null;

export const selectPdfDocumentId = (state: RootState) =>
  state.pdfGeneration?.pdfDocumentId || null;

export const selectPdfDocument = (state: RootState) =>
  state.pdfGeneration?.pdfDocument || null;

export const selectPdfDocumentLoading = (state: RootState) =>
  state.pdfGeneration?.documentLoading || false;

export const selectESignLoading = (state: RootState) =>
  state.pdfGeneration?.eSignLoading || false;

export const selectSignedDocumentId = (state: RootState) =>
  state.pdfGeneration?.signedDocumentId || null;

export const selectSignedDocument = (state: RootState) =>
  state.pdfGeneration?.signedDocument || null;

export const selectAckNo = (state: RootState) =>
  state.pdfGeneration?.acknowledgementNo || null;

// Export reducer
export default pdfGenerationSlice.reducer;
