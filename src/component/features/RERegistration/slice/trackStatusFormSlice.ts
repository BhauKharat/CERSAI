import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  TrackStatusState,
  TrackStatusResponse,
  TrackStatusFieldError,
  WorkflowApiResponse,
  TrackStatusData,
} from '../types/trackStatusFormTypes';

// Initial state
const initialState: TrackStatusState = {
  fields: [],
  groupedFields: {},
  configuration: null,
  formValues: {},
  fieldErrors: [],
  dropdownOptions: {},
  loading: false,
  error: null,
  formSubtitle: '',
  // Workflow data
  workflowData: null,
  workflowLoading: false,
  workflowError: null,
  trackStatusData: [],
};

// Async thunk to fetch admin user details form fields
export const fetchTrackStatusFields = createAsyncThunk(
  'trackStatus/fetchFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.get_track_status_form_fields
      );
      return response.data as TrackStatusResponse;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to fetch admin user details fields'
          : 'Failed to fetch admin user details fields';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch dropdown options for dependent dropdowns
export const fetchTrackStatusDropdownOptions = createAsyncThunk(
  'trackStatus/fetchDropdownOptions',
  async (
    {
      url,
      method = 'GET',
      fieldId,
      headers = {},
      payload = null,
    }: {
      url: string;
      method?: string;
      fieldId: number;
      headers?: Record<string, string>;
      payload?: Record<string, unknown> | null;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        `fetchTrackStatusDropdownOptions called for field ${fieldId}:`,
        {
          url,
          method,
          headers,
          payload,
        }
      );

      const config: {
        method: string;
        url: string;
        headers: Record<string, string>;
        data?: Record<string, unknown>;
      } = {
        method: method.toLowerCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (
        payload &&
        (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')
      ) {
        config.data = payload;
      }

      const response = await Secured(config);

      console.log(
        `fetchTrackStatusDropdownOptions response for field ${fieldId}:`,
        response.data
      );

      return {
        fieldId,
        options: response.data.data || response.data || [],
        cached: false,
      };
    } catch (error: unknown) {
      console.error(
        `fetchTrackStatusDropdownOptions error for field ${fieldId}:`,
        error
      );
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to fetch dropdown options'
          : 'Failed to fetch dropdown options';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch workflow data
export const fetchWorkflowData = createAsyncThunk(
  'trackStatus/fetchWorkflowData',
  async (
    { workflowId, userId }: { workflowId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await Secured.get(
        `${API_ENDPOINTS.get_workflow_data}?workflowId=${workflowId}&userId=${userId}`
      );
      return response.data as WorkflowApiResponse;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to fetch workflow data'
          : 'Failed to fetch workflow data';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin User Details Slice
const trackStatusSlice = createSlice({
  name: 'trackStatus',
  initialState,
  reducers: {
    // Update form value
    updateFormValue: (
      state,
      action: PayloadAction<{
        fieldName: string;
        value: string | File | null | boolean;
      }>
    ) => {
      state.formValues[action.payload.fieldName] = action.payload.value;
    },

    // Set field error
    setFieldError: (state, action: PayloadAction<TrackStatusFieldError>) => {
      const existingErrorIndex = state.fieldErrors.findIndex(
        (error) => error.field === action.payload.field
      );
      if (existingErrorIndex >= 0) {
        state.fieldErrors[existingErrorIndex] = action.payload;
      } else {
        state.fieldErrors.push(action.payload);
      }
    },

    // Clear field error
    clearFieldError: (state, action: PayloadAction<string>) => {
      state.fieldErrors = state.fieldErrors.filter(
        (error) => error.field !== action.payload
      );
    },

    // Clear all form data
    clearForm: (state) => {
      state.formValues = {};
      state.fieldErrors = [];
    },

    // Copy values from one section to another (for admin 1 to admin 2 copying)
    copySectionValues: (
      state,
      action: PayloadAction<{ fromSection: string; toSection: string }>
    ) => {
      const { fromSection, toSection } = action.payload;

      // Find all fields that belong to the source section
      const sourceFields = Object.keys(state.formValues).filter((key) =>
        key.startsWith(fromSection)
      );

      // Copy values to target section
      sourceFields.forEach((sourceKey) => {
        const targetKey = sourceKey.replace(fromSection, toSection);
        state.formValues[targetKey] = state.formValues[sourceKey];
      });
    },

    // Clear values from a specific section
    clearSectionValues: (state, action: PayloadAction<string>) => {
      const sectionPrefix = action.payload;

      // Remove all form values that start with the section prefix
      Object.keys(state.formValues).forEach((key) => {
        if (key.startsWith(sectionPrefix)) {
          delete state.formValues[key];
        }
      });

      // Remove related field errors
      state.fieldErrors = state.fieldErrors.filter(
        (error) => !error.field.startsWith(sectionPrefix)
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch admin user details fields
    builder
      .addCase(fetchTrackStatusFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackStatusFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.data.fields;
        state.groupedFields = action.payload.data.groupedFields;
        state.configuration = action.payload.data.configuration;
        state.error = null;
      })
      .addCase(fetchTrackStatusFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch dropdown options
      .addCase(fetchTrackStatusDropdownOptions.fulfilled, (state, action) => {
        console.log(
          'fetchTrackStatusDropdownOptions.fulfilled called:',
          action.payload
        );
        const { fieldId, options } = action.payload;
        state.dropdownOptions[fieldId] = options;
      })
      .addCase(fetchTrackStatusDropdownOptions.rejected, (state, action) => {
        console.log(
          'fetchTrackStatusDropdownOptions.rejected called:',
          action.payload
        );
        state.error = action.payload as string;
      })
      // Fetch workflow data
      .addCase(fetchWorkflowData.pending, (state) => {
        state.workflowLoading = true;
        state.workflowError = null;
      })
      .addCase(fetchWorkflowData.fulfilled, (state, action) => {
        state.workflowLoading = false;
        state.workflowData = action.payload.data;
        state.workflowError = null;

        // Populate form values from workflow payload
        if (action.payload.data.payload) {
          Object.entries(action.payload.data.payload).forEach(
            ([section, sectionData]) => {
              console.log('section', section);
              if (sectionData && typeof sectionData === 'object') {
                Object.entries(sectionData as Record<string, unknown>).forEach(
                  ([key, value]) => {
                    state.formValues[key] = value as
                      | string
                      | boolean
                      | File
                      | null;
                  }
                );
              }
            }
          );
        }

        // Create track status data for table display
        const workflowData = action.payload.data;
        const trackStatusEntry: TrackStatusData = {
          ackNumber:
            (workflowData.payload.application_esign
              ?.acknowledgementNo as string) || workflowData.workflowId,
          reName:
            (workflowData.payload.entityDetails?.nameOfInstitution as string) ||
            'N/A',
          status: workflowData.status,
          submittedOn: workflowData.payload.submission?.submittedAt
            ? new Date(
                workflowData.payload.submission.submittedAt as string
              ).toLocaleDateString('en-GB')
            : 'N/A',
          pendingAtLevel: workflowData.payload.approvalWorkflow?.pendingAtLevel,
        };
        state.trackStatusData = [trackStatusEntry];
      })
      .addCase(fetchWorkflowData.rejected, (state, action) => {
        state.workflowLoading = false;
        state.workflowError = action.payload as string;
      });
  },
});

// Export actions
export const {
  updateFormValue,
  setFieldError,
  clearFieldError,
  clearForm,
  copySectionValues,
  clearSectionValues,
} = trackStatusSlice.actions;

// Selectors
export const selectTrackStatusFields = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.fields;

export const selectTrackStatusGroupedFields = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.groupedFields;

export const selectTrackStatusConfiguration = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.configuration;

export const selectTrackStatusFormValues = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.formValues;

export const selectTrackStatusLoading = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.loading;

export const selectTrackStatusError = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.error;

export const selectTrackStatusFieldErrors = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.fieldErrors;

export const selectTrackStatusDropdownOptions = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.dropdownOptions;

// Workflow data selectors
export const selectWorkflowData = (state: { trackStatus: TrackStatusState }) =>
  state.trackStatus.workflowData;

export const selectWorkflowLoading = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.workflowLoading;

export const selectWorkflowError = (state: { trackStatus: TrackStatusState }) =>
  state.trackStatus.workflowError;

export const selectTrackStatusTableData = (state: {
  trackStatus: TrackStatusState;
}) => state.trackStatus.trackStatusData;

export default trackStatusSlice.reducer;
