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
      const response = await Secured.get(
        API_ENDPOINTS.update_profile_track_status_userdetails(
          workflowId,
          userId
        )
      );

      // Extract the workflow data from the response
      const responseData = response.data.data;

      if (!responseData) {
        throw new Error('No workflow data found');
      }

      // Extract the update data from profileData.profile_update_initiated.updateData
      const updateData =
        responseData?.payload?.profile_update_initiated?.updateData || {};
      const documents = responseData?.documents || [];

      // Return in the expected format
      return {
        success: true,
        data: {
          workflowId: responseData.workflowId,
          workflowType: responseData.workflowType,
          status: responseData.status,
          currentStep: responseData.currentStep,
          submittedOn: responseData.payload.submission.submittedAt,
          submittedBy: responseData.submittedBy,
          acknowledgementNo: responseData.acknowledgementNo,
          payload: {
            profile_update_initiated: {
              updateData: updateData,
            },
          },
          documents: documents,
          profileData: responseData.profileData,
          executedSteps: responseData.executedSteps,
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
export const fetchUserDetailsFormPreviewFields = createAsyncThunk(
  'formPreview/fetchFormFields',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('Fetching form preview fields');

      // Get the current state to access auth
      const state = getState() as any;
      const groupMembership = state.auth?.groupMembership;

      // Use the function from API_ENDPOINTS to get the correct URL
      const url = API_ENDPOINTS.getUserDetailsFormFields(groupMembership);

      const response = await axios.get(url);

      return response.data;
    } catch (error: unknown) {
      console.error('❌ Failed to fetch form preview fields:', error);

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
      console.log('Fetching document:', documentId);

      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?id=${documentId}`,
        {
          responseType: 'blob',
        }
      );

      console.log('Document API response:', response);

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

      console.log(`🌐 Fetching Preview dropdown data for ${fieldName}:`, {
        url: dynamicUrl,
        method,
        paramValue,
      });

      let response;

      if (method.toUpperCase() === 'GET') {
        response = await Secured.get(dynamicUrl);
      } else if (method.toUpperCase() === 'POST') {
        response = await Secured.post(dynamicUrl);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }

      console.log(
        `📥 Preview Dropdown response for ${fieldName}:`,
        response.data
      );
      console.log(`📋 Response mapping for ${fieldName}:`, responseMapping);

      // Extract data using responseMapping
      const responseData = response.data.data || response.data;
      let options: DropdownOption[] = [];

      if (Array.isArray(responseData)) {
        console.log(
          `📊 First item structure for ${fieldName}:`,
          responseData[0]
        );

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

      console.log(
        `✅ Processed Preview dropdown options for ${fieldName}:`,
        options
      );

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
const formPreviewSliceTrackStatus = createSlice({
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
      .addCase(fetchUserDetailsFormPreviewFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetailsFormPreviewFields.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const data = action.payload.data;

        if (data.configuration?.formSettings?.formGroup && data.groupedFields) {
          // CMS already provides grouped fields, use them directly
          state.groupedFields = data.groupedFields;
          state.fields = data.fields || [];
        } else {
          const fields = data.fields || [];

          // For forms like RE_userProfile where we still want a single accordion,
          // wrap all fields into one synthetic group so the UI can render them
          // inside UpdateFormAccordion on the User Details track-status page.
          state.groupedFields = {
            user_profile: {
              label: data.configuration?.formTitle || 'User Profile',
              fields,
            },
          };

          // Keep fields as well in case any other consumer expects the flat list
          state.fields = fields;
        }

        state.configuration = data.configuration;
      })
      .addCase(fetchUserDetailsFormPreviewFields.rejected, (state, action) => {
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

export const { clearFormPreview, clearPreviewError } =
  formPreviewSliceTrackStatus.actions;

// Selectors
export const selectFormPreviewLoading = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.loading;
export const selectFormPreviewError = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.error;
export const selectWorkflowData = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.workflowData;
export const selectGroupedFields = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.groupedFields;
export const selectPreviewFields = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.fields;
export const selectPreviewConfiguration = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.configuration;
export const selectPreviewDocuments = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.documents;
export const selectFetchedPreviewDocuments = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.fetchedDocuments;
export const selectPreviewDocumentLoading = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.documentLoading;
export const selectFetchedPreviewDocument =
  (documentId: string) =>
  (state: { updateUserDetailsFormPreview: FormPreviewState }) =>
    state.updateUserDetailsFormPreview.fetchedDocuments[documentId];
export const selectIsPreviewDocumentLoading =
  (documentId: string) =>
  (state: { updateUserDetailsFormPreview: FormPreviewState }) =>
    state.updateUserDetailsFormPreview.documentLoading[documentId] || false;
export const selectPreviewDropdownData = (state: {
  updateUserDetailsFormPreview: FormPreviewState;
}) => state.updateUserDetailsFormPreview.dropdownData;

export default formPreviewSliceTrackStatus.reducer;
