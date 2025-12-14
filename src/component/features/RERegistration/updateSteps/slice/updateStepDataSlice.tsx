import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  StepDataResponse,
  StepDataState,
  FetchedDocument,
  StepDocument,
} from '../types/updateStepDataSlice';
import axios from 'axios';
import { FormFieldsResponse } from '../types/formTypesUpdate';
// Initial state
const initialState: StepDataState = {
  fields: [],
  configuration: null,
  loading: false,
  error: null,
  stepData: null,
  documents: [],
  totalSteps: 0,
  fetchedDocuments: {},
  documentLoading: {},
  lastFetched: null,
};

// Async thunk to fetch step data
export const fetchStepData = createAsyncThunk(
  'updateStepData/fetchStepData',
  async (
    {
      stepKey,
      userId,
    }: {
      stepKey: string;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        includeWorkflow: true,
        filters: {
          userId: userId,
          workflow_type: 'RE_ENTITY_PROFILE_UPDATE',
          status: 'IN_PROGRESS',
        },
        stepKey: stepKey,
        userTypes: [],
        sort: {
          field: 'created_at',
          dir: 'desc',
        },
        page: 1,
        pageSize: 10,
      };

      const response = await Secured.post(
        API_ENDPOINTS.search_registrations,
        payload
      );

      // Handle the new response structure
      const rows = response.data.data?.rows || [];
      const rawData = rows.length > 0 ? rows[0].data?.[stepKey] || {} : {};
      const documents = response.data.data?.documents || {};

      // Transform the response to match the expected structure
      const transformedResponse: StepDataResponse = {
        message: response.data.message || 'Success',
        data: {
          success: response.data.success || true,
          message: response.data.message || 'Success',
          data: {
            step: {
              status: rawData.status || 'IN_PROGRESS',
              step_name: stepKey,
              data: rawData,
              last_updated: rawData.last_updated || new Date().toISOString(),
              last_updated_by: rawData.last_updated_by || userId,
            },
            documents: Object.values(documents) as StepDocument[],
          },
          timestamp: Date.now(),
        },
      };

      return transformedResponse;
    } catch (error: unknown) {
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

export const fetchDocument = createAsyncThunk(
  'UpdateStepData/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${documentId}`,
        {
          responseType: 'blob',
        }
      );

      const blob = response.data;
      const contentType =
        response.headers['content-type'] || 'application/octet-stream';

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
        base64Content: dataUrl,
        dataUrl,
      };
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

export const fetchFormFields = createAsyncThunk(
  'updateStepData/fetchFormFields',
  async (
    {
      url,
    }: {
      url: string;
    },
    { rejectWithValue }
  ) => {
    try {
      let APICall = '';
      if (url === 'entity_profile') {
        APICall = API_ENDPOINTS.update_entity_form_fields;
      } else if (url === 'addresses') {
        APICall = API_ENDPOINTS.update_address_form_fields;
      } else if (url === 'head_of_institution') {
        APICall = API_ENDPOINTS.get_head_of_institution_fields;
      } else if (url === 'nodal_officer') {
        APICall = API_ENDPOINTS.get_nodal_officer_fields;
      }
      // Use direct axios call since CMS APIs use different base URL than Secured instance
      const response = await axios.get(APICall);
      return response.data as FormFieldsResponse;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch form fields';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'updateStepData/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.delete(
        `${API_ENDPOINTS.delete_document}/${documentId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to delete document:', error);

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
const updateStepDataSlice = createSlice({
  name: 'updateStepData',
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

      .addCase(fetchFormFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.data.fields.sort(
          (a, b) => a.fieldOrder - b.fieldOrder
        );
        state.configuration = action.payload.data.configuration;
        state.totalSteps = Math.ceil(state.fields.length / 3);
        state.error = null;
      })
      .addCase(fetchFormFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete document cases
      .addCase(deleteDocument.pending, (state, action) => {
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = true;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        const documentId = action.meta.arg;
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[documentId] = false;

        // Remove from fetchedDocuments
        if (state.fetchedDocuments) {
          delete state.fetchedDocuments[documentId];
        }

        // Remove from documents list
        if (state.documents) {
          state.documents = state.documents.filter(
            (doc) => doc.id !== documentId
          );
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = false;
        // Could add error handling here
      });
  },
});

export const { clearStepData, clearError } = updateStepDataSlice.actions;

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
export const stepFormFields = (state: { stepData: StepDataState }) =>
  state.stepData.fields || false;
export const selectFormConfiguration = (state: { stepData: StepDataState }) =>
  state.stepData.configuration;
export default updateStepDataSlice.reducer;
