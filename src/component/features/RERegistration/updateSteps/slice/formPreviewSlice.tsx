/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../../Constant';
import axios from 'axios';
import {
  FormPreviewState,
  WorkflowResponse,
  FetchedDocument,
} from '../types/formPreviewTypes';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownDataState {
  [fieldName: string]: {
    loading: boolean;
    options: DropdownOption[];
    error: string | null;
  };
}

// Initial state
const initialState: FormPreviewState = {
  workflowData: null,
  groupedFields: {},
  fields: [],
  configuration: null,
  documents: [],
  fetchedDocuments: {},
  documentLoading: {},
  dropdownData: {},
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch workflow data
export const fetchWorkflowData = createAsyncThunk(
  'formPreview/fetchWorkflowData',
  async (
    {
      workflowId,
      userId,
    }: {
      workflowId: string;
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
        stepKey: '', // Empty stepKey to get all data
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

      // Extract the workflow data from search response
      const responseData = response.data.data;
      const rows = responseData?.rows || [];
      const documents = responseData?.documents || {};

      // Find the workflow that matches the workflowId
      const workflowRow =
        rows.find((row: any) => row.workflowId === workflowId) || rows[0];

      if (!workflowRow) {
        throw new Error('No workflow data found');
      }

      // The actual form data is in workflowRow.data
      // Structure: { hoi: {...}, addresses: {...}, entityDetails: {...}, institutionalAdminUser: {...}, nodalOfficer: {...} }
      const workflowPayload = workflowRow.data || {};

      // Flatten all step data into a single object for easy field mapping
      const flattenedPayload: Record<string, any> = {};

      Object.entries(workflowPayload).forEach(([stepKey, stepData]) => {
        if (
          stepData &&
          typeof stepData === 'object' &&
          !Array.isArray(stepData)
        ) {
          Object.entries(stepData).forEach(([fieldKey, fieldValue]) => {
            flattenedPayload[fieldKey] = fieldValue;
          });
        }
      });
      // Transform documents object into array format expected by the component
      const documentsArray = Object.entries(documents).map(
        ([fieldKey, docData]: [string, any]) => ({
          id: docData.id || docData.documentId,
          fieldKey: docData.fieldKey || fieldKey,
          type: docData.type,
          ...docData,
        })
      );
      // Return in the expected format
      return {
        success: true,
        data: {
          workflowId: workflowRow.workflowId,
          payload: flattenedPayload, // Flattened form data
          documents: documentsArray, // Documents array
          ...workflowRow, // Include other workflow metadata
        },
      } as WorkflowResponse;
    } catch (error: unknown) {
      console.error('Failed to fetch workflow data:', error);

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
          'Failed to fetch workflow data';

        return rejectWithValue(errorMessage);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch workflow data';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch form fields for preview
export const fetchFormPreviewFields = createAsyncThunk(
  'formPreview/fetchFormFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.update_form_preivew_form_fields
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch form preview fields:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch form preview fields';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch document by ID
export const fetchPreviewDocument = createAsyncThunk(
  'formPreview/fetchDocument',
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

      // Convert blob to base64 data URL
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

// Async thunk to fetch dropdown data dynamically
export const fetchDropdownDataPreview = createAsyncThunk(
  'formPreview/fetchDropdownData',
  async (
    {
      fieldName,
      fieldAttributes,
      formData,
    }: {
      fieldName: string;
      fieldAttributes: any;
      formData: Record<string, any>;
    },
    { rejectWithValue }
  ) => {
    try {
      const { url, method, responseMapping } = fieldAttributes;

      // Handle both urlData and urldata (API returns lowercase)
      const urlParam = fieldAttributes.urldata || fieldAttributes.urlData;

      if (!url || !method || !responseMapping || !urlParam) {
        throw new Error(`Missing required field attributes for ${fieldName}`);
      }

      const paramValue = formData[urlParam];

      if (!paramValue) {
        console.warn(
          `Required parameter ${urlParam} is missing for ${fieldName}`
        );
        return {
          fieldName,
          options: [],
        };
      }

      // Replace the dynamic parameter in the URL
      const dynamicUrl = url.replace(`{${urlParam}}`, paramValue);

      let response;

      if (method.toUpperCase() === 'GET') {
        response = await Secured.get(dynamicUrl);
      } else if (method.toUpperCase() === 'POST') {
        response = await Secured.post(dynamicUrl);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      // Extract data using responseMapping
      const responseData = response.data.data || response.data;
      let options: DropdownOption[] = [];

      if (Array.isArray(responseData)) {
        options = responseData.map((item: any) => {
          // Helper function to safely get nested property
          const getNestedProperty = (obj: any, path: string) => {
            return path.split('.').reduce((acc, part) => acc?.[part], obj);
          };

          // Try to get label and value using responseMapping, then fallback to common properties
          let labelValue = getNestedProperty(item, responseMapping.label);
          let valueValue = getNestedProperty(item, responseMapping.value);

          // Fallback chain for common properties
          if (!labelValue || typeof labelValue === 'object') {
            labelValue =
              item.name || item.pincode || item.label || String(item);
          }

          if (!valueValue || typeof valueValue === 'object') {
            valueValue =
              item.code ||
              item.pincode ||
              item.value ||
              item.id ||
              String(item);
          }

          return {
            label: String(labelValue),
            value: String(valueValue),
          };
        });
      }

      return {
        fieldName,
        options,
      };
    } catch (error: any) {
      console.error(
        `❌ Error fetching Preview dropdown data for ${fieldName}:`,
        error
      );
      return rejectWithValue({
        fieldName,
        error: error.response?.data || error.message,
      });
    }
  }
);

// Form Preview slice
const formPreviewSlice = createSlice({
  name: 'formPreview',
  initialState,
  reducers: {
    clearFormPreview: (state) => {
      state.workflowData = null;
      state.groupedFields = {};
      state.fields = [];
      state.configuration = null;
      state.documents = [];
      state.fetchedDocuments = {};
      state.documentLoading = {};
      state.error = null;
      state.lastFetched = null;
    },
    clearPreviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Workflow data cases
      .addCase(fetchWorkflowData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.workflowData = action.payload.data;
        state.documents = action.payload.data.documents || [];
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchWorkflowData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.workflowData = null;
        state.documents = [];
      })
      // Form fields cases
      .addCase(fetchFormPreviewFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormPreviewFields.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const data = action.payload.data;

        if (data.configuration?.formSettings?.formGroup && data.groupedFields) {
          state.groupedFields = data.groupedFields;
        } else {
          state.fields = data.fields || [];
        }

        state.configuration = data.configuration;
      })
      .addCase(fetchFormPreviewFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Document fetch cases
      .addCase(fetchPreviewDocument.pending, (state, action) => {
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = true;
      })
      .addCase(fetchPreviewDocument.fulfilled, (state, action) => {
        const { documentId, document } = action.payload;
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        if (!state.fetchedDocuments) {
          state.fetchedDocuments = {};
        }
        state.documentLoading[documentId] = false;
        state.fetchedDocuments[documentId] = document;
      })
      .addCase(fetchPreviewDocument.rejected, (state, action) => {
        if (!state.documentLoading) {
          state.documentLoading = {};
        }
        state.documentLoading[action.meta.arg] = false;
      })
      // Dropdown data fetch cases
      .addCase(fetchDropdownDataPreview.pending, (state, action) => {
        const fieldName = action.meta.arg.fieldName;
        if (!state.dropdownData) {
          state.dropdownData = {};
        }
        state.dropdownData[fieldName] = {
          loading: true,
          options: state.dropdownData[fieldName]?.options || [],
          error: null,
        };
      })
      .addCase(fetchDropdownDataPreview.fulfilled, (state, action) => {
        const { fieldName, options } = action.payload;
        if (!state.dropdownData) {
          state.dropdownData = {};
        }
        state.dropdownData[fieldName] = {
          loading: false,
          options: options as any[],
          error: null,
        };
      })
      .addCase(fetchDropdownDataPreview.rejected, (state, action) => {
        const fieldName =
          (action.payload as any)?.fieldName || action.meta.arg.fieldName;
        if (!state.dropdownData) {
          state.dropdownData = {};
        }
        state.dropdownData[fieldName] = {
          loading: false,
          options: [],
          error:
            (action.payload as any)?.error || 'Failed to fetch dropdown data',
        };
      });
  },
});

export const { clearFormPreview, clearPreviewError } = formPreviewSlice.actions;

// Selectors
export const selectFormPreviewLoading = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.loading;
export const selectFormPreviewError = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.error;
export const selectWorkflowData = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.workflowData;
export const selectGroupedFields = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.groupedFields;
export const selectPreviewFields = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.fields;
export const selectPreviewConfiguration = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.configuration;
export const selectPreviewDocuments = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.documents;
export const selectFetchedPreviewDocuments = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.fetchedDocuments;
export const selectPreviewDocumentLoading = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.documentLoading;
export const selectFetchedPreviewDocument =
  (documentId: string) => (state: { updateFormPreview: FormPreviewState }) =>
    state.updateFormPreview.fetchedDocuments[documentId];
export const selectIsPreviewDocumentLoading =
  (documentId: string) => (state: { updateFormPreview: FormPreviewState }) =>
    state.updateFormPreview.documentLoading[documentId] || false;
export const selectPreviewDropdownData = (state: {
  updateFormPreview: FormPreviewState;
}) => state.updateFormPreview.dropdownData;

export default formPreviewSlice.reducer;
