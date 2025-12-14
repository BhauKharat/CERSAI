import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../../redux/store';
import { API_ENDPOINTS } from '../../../../Constant';
import { Secured } from '../../../../utils/HelperFunctions/api';
import {
  WorkflowState,
  WorkflowApiResponse,
  FetchWorkflowParams,
} from '../types/workflowTypes';

// Initial state
const initialState: WorkflowState = {
  loading: false,
  error: null,
  workflowData: null,
  documents: [],
  modifiableFields: null,
  fetchedDocuments: {},
  documentLoading: {},
};

// Async thunk to fetch workflow data
export const fetchWorkflowData = createAsyncThunk(
  'workflow/fetchData',
  async (params: FetchWorkflowParams, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        `${API_ENDPOINTS.get_workflow_data}?workflowId=${params.workflowId}&userId=${params.userId}`
      );

      const data: WorkflowApiResponse = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch workflow data');
      }

      // Extract modifiableFields from the API response
      // Check multiple possible locations where modifiableFields might be
      let modifiableFields: Record<string, string[]> = {} as Record<
        string,
        string[]
      >;

      // Check if modifiableFields is directly in the response
      if (data.modifiableFields && typeof data.modifiableFields === 'object') {
        modifiableFields = data.modifiableFields as Record<string, string[]>;
      }
      // Check if modifiableFields is in data.data
      else if (
        data.data?.modifiableFields &&
        typeof data.data.modifiableFields === 'object'
      ) {
        modifiableFields = data.data.modifiableFields as Record<
          string,
          string[]
        >;
      }
      // Check if modifiableFields is in data.data.payload
      else if (
        data.data?.payload?.modifiableFields &&
        typeof data.data.payload.modifiableFields === 'object'
      ) {
        modifiableFields = data.data.payload.modifiableFields as Record<
          string,
          string[]
        >;
      } else {
        console.warn(
          '⚠️ Could not find modifiableFields in the expected locations. Using empty object as fallback.'
        );
      }

      // Return both the workflow data and modifiableFields
      return {
        workflowData: data.data,
        modifiableFields,
      };
    } catch (error) {
      console.error('❌ Error fetching workflow data:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Async thunk to fetch document by ID
export const fetchWorkflowDocument = createAsyncThunk(
  'workflow/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${documentId}`,
        {
          responseType: 'blob', // Handle binary data
        }
      );

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

      const fetchedDocument = {
        id: documentId,
        fileName,
        fileSize: blob.size,
        mimeType: contentType,
        base64Content: dataUrl, // Store the base64 data URL for persistence
        dataUrl,
      };

      return { documentId, document: fetchedDocument };
    } catch (error) {
      console.error('❌ Error fetching workflow document:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch document'
      );
    }
  }
);

// Create slice
const workflowSlice = createSlice({
  name: 'workflow',
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch workflow data
      .addCase(fetchWorkflowData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.workflowData = action.payload.workflowData;
        state.modifiableFields = action.payload.modifiableFields || {};

        state.acknowledgementNo =
          action.payload.workflowData.payload?.application_esign
            ?.acknowledgementNo || '';
        state.documents = action.payload.workflowData.documents || [];
      })
      .addCase(fetchWorkflowData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.workflowData = null;
        state.documents = [];
      })
      // Fetch workflow document cases
      .addCase(fetchWorkflowDocument.pending, (state, action) => {
        // Ensure documentLoading object exists
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = true;
      })
      .addCase(fetchWorkflowDocument.fulfilled, (state, action) => {
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
      .addCase(fetchWorkflowDocument.rejected, (state, action) => {
        // Ensure documentLoading object exists
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = false;
        console.error('Failed to fetch workflow document:', action.payload);
      });
  },
});

// Export actions
export const { clearError, resetState } = workflowSlice.actions;

// Selectors
export const selectWorkflowLoading = (state: RootState) =>
  state.workflowPreview?.loading || false;

export const selectWorkflowError = (state: RootState) =>
  state.workflowPreview?.error || null;

export const selectWorkflowData = (state: RootState) =>
  state.workflowPreview?.workflowData || null;

export const selectWorkflowDocuments = (state: RootState) =>
  state.workflowPreview?.documents || [];

export const selectWorkflowPayload = (state: RootState) =>
  state.workflowPreview?.workflowData?.payload || null;

export const selectWorkflowFetchedDocuments = (state: RootState) =>
  state.workflowPreview?.fetchedDocuments || {};

export const selectWorkflowDocumentLoading = (state: RootState) =>
  state.workflowPreview?.documentLoading || {};

export const selectWorkflowAcknowledgementNo = (state: RootState) =>
  state.workflowPreview?.acknowledgementNo || null;

export const selectModifiableFields = (state: RootState) => {
  const modifiableFields = state.workflowPreview?.modifiableFields || {};
  return modifiableFields;
};

// Export reducer
export default workflowSlice.reducer;
