import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  StepDataResponse,
  StepDataState,
  FetchedDocument,
} from '../types/stepDataTypes';

// Initial state
const initialState: StepDataState = {
  loading: false,
  error: null,
  stepData: null,
  documents: [],
  fetchedDocuments: {},
  documentLoading: {},
  lastFetched: null,
};

// Async thunk to fetch step data
export const fetchStepData = createAsyncThunk(
  'stepData/fetchStepData',
  async (
    {
      stepKey,
      workflowId,
      userId,
    }: {
      stepKey: string;
      workflowId: string;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('Fetching step data:', { stepKey, workflowId, userId });

      const response = await Secured.get(
        `${API_ENDPOINTS.get_step_data}?stepKey=${stepKey}&workflowId=${workflowId}&userId=${userId}`
      );

      console.log('Step data API response:', response.data);
      return response.data as StepDataResponse;
    } catch (error: unknown) {
      console.error('Failed to fetch step data:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
            status?: number;
          };
          message?: string;
        };

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to fetch step data';

        return rejectWithValue(errorMessage);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch step data';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch document by ID
export const fetchDocument = createAsyncThunk(
  'stepData/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      console.log('Fetching document:', documentId);

      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${documentId}`,
        {
          responseType: 'blob', // Handle binary data
        }
      );

      console.log('Document API response:', response);

      // Handle binary response (image/pdf data)
      const blob = response.data;
      const contentType =
        response.headers['content-type'] || 'application/octet-stream';

      // Convert blob to base64 data URL for persistence across page reloads
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `document_${documentId}`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Determine file extension from content type
      const extension = contentType.includes('png')
        ? '.png'
        : contentType.includes('jpg') || contentType.includes('jpeg')
          ? '.jpg'
          : contentType.includes('pdf')
            ? '.pdf'
            : '';

      if (extension && !fileName.includes('.')) {
        fileName += extension;
      }

      const fetchedDocument: FetchedDocument = {
        id: documentId,
        fileName,
        fileSize: blob.size,
        mimeType: contentType,
        base64Content: dataUrl, // Store the base64 data URL for persistence
        dataUrl,
      };

      console.log('✅ Document processed:', fetchedDocument);

      return { documentId, document: fetchedDocument };
    } catch (error: unknown) {
      console.error('Failed to fetch document:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
            status?: number;
          };
          message?: string;
        };

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to fetch document';

        return rejectWithValue(errorMessage);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch document';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete document by ID
export const deleteDocument = createAsyncThunk(
  'stepData/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting document:', documentId);

      const response = await Secured.delete(
        `${API_ENDPOINTS.delete_document}/${documentId}`
      );

      console.log('✅ Document deleted successfully:', response.data);
      return documentId;
    } catch (error: unknown) {
      console.error('❌ Failed to delete document:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
            status?: number;
          };
          message?: string;
        };

        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'Failed to delete document';

        return rejectWithValue(errorMessage);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete document';
      return rejectWithValue(errorMessage);
    }
  }
);

// Step Data slice
const stepDataSlice = createSlice({
  name: 'stepData',
  initialState,
  reducers: {
    clearStepData: (state) => {
      state.stepData = null;
      state.documents = [];
      state.fetchedDocuments = {};
      state.documentLoading = {};
      state.error = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateFetchedDocument: (state, payload) => {
      state.fetchedDocuments = payload.payload;
    },
    updateStepDocument: (state, payload) => {
      state.documents = payload.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStepData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.stepData = action.payload.data.data.step;
        state.documents = action.payload.data.data.documents;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchStepData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.stepData = null;
        state.documents = [];
      })
      // Document fetch cases
      .addCase(fetchDocument.pending, (state, action) => {
        // Ensure documentLoading object exists
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = true;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        const { documentId, document } = action.payload;
        // Ensure both objects exist
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        if (!state.fetchedDocuments) {
          state.fetchedDocuments = {};
        }
        state.documentLoading[documentId] = false;
        state.fetchedDocuments[documentId] = document;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        // Ensure documentLoading object exists
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = false;
        // Could add document-specific error handling here if needed
      })
      // Document delete cases
      .addCase(deleteDocument.pending, (state, action) => {
        // Mark document as being deleted
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const documentId = action.payload;
        // Remove from documents array
        state.documents = state.documents.filter(
          (doc) => doc.id !== documentId
        );
        // Remove from fetchedDocuments
        if (state.fetchedDocuments[documentId]) {
          delete state.fetchedDocuments[documentId];
        }
        // Remove loading state
        if (state.documentLoading[documentId]) {
          delete state.documentLoading[documentId];
        }
        console.log('✅ Document removed from state:', documentId);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        // Clear loading state on error
        if (state.documentLoading && action.meta.arg) {
          state.documentLoading[action.meta.arg] = false;
        }
        console.error('❌ Document deletion failed:', action.payload);
      });
  },
});

export const {
  clearStepData,
  clearError,
  updateFetchedDocument,
  updateStepDocument,
} = stepDataSlice.actions;

// Selectors
export const selectStepDataLoading = (state: { stepData: StepDataState }) =>
  state.stepData.loading;
export const selectStepDataError = (state: { stepData: StepDataState }) =>
  state.stepData.error;
export const selectStepData = (state: { stepData: StepDataState }) =>
  state.stepData.stepData;
export const selectStepDocuments = (state: { stepData: StepDataState }) =>
  state.stepData.documents;
export const selectLastFetched = (state: { stepData: StepDataState }) =>
  state.stepData.lastFetched;
export const selectFetchedDocuments = (state: { stepData: StepDataState }) =>
  state.stepData.fetchedDocuments;
export const selectDocumentLoading = (state: { stepData: StepDataState }) =>
  state.stepData.documentLoading;
export const selectFetchedDocument =
  (documentId: string) => (state: { stepData: StepDataState }) =>
    state.stepData.fetchedDocuments[documentId];
export const selectIsDocumentLoading =
  (documentId: string) => (state: { stepData: StepDataState }) =>
    state.stepData.documentLoading[documentId] || false;

export default stepDataSlice.reducer;
