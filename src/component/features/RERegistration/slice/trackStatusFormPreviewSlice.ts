import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../../redux/store';
import { API_ENDPOINTS } from '../../../../Constant';
import { Secured } from '../../../../utils/HelperFunctions/api';
import {
  TrackStatusFormPreviewState,
  TrackStatusFormPreviewApiResponse,
  TrackStatusFormField,
  TrackStatusFormValues,
} from '../types/trackStatusFormPreviewTypes';

// Initial state
const initialState: TrackStatusFormPreviewState = {
  loading: false,
  error: null,
  configuration: null,
  fields: [],
  groupedFields: {},
  formValues: {},
};

// Async thunk to fetch track status form preview data
export const fetchTrackStatusFormPreviewData = createAsyncThunk(
  'trackStatusFormPreview/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.get_track_status_form_fields
      );

      const data: TrackStatusFormPreviewApiResponse = response.data;

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch form data');
      }

      return data;
    } catch (error) {
      console.error('Error fetching track status form preview data:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }
);

// Create slice
const trackStatusFormPreviewSlice = createSlice({
  name: 'trackStatusFormPreview',
  initialState,
  reducers: {
    // Update form values
    updateFormValue: (
      state,
      action: PayloadAction<{
        fieldName: string;
        value: string | boolean | number | null | undefined;
      }>
    ) => {
      const { fieldName, value } = action.payload;
      state.formValues[fieldName] = value;
    },

    // Update multiple form values
    updateFormValues: (state, action: PayloadAction<TrackStatusFormValues>) => {
      state.formValues = { ...state.formValues, ...action.payload };
    },

    // Reset form values
    resetFormValues: (state) => {
      state.formValues = {};
    },

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
      // Fetch track status form preview data
      .addCase(fetchTrackStatusFormPreviewData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackStatusFormPreviewData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { data } = action.payload;

        // Set configuration with formGroup check
        state.configuration = {
          formSettings: {
            formGroup: true, // Based on API response structure, this should be true
          },
          formSubtitle: 'Track Status Form Preview',
        };

        // Set fields and grouped fields based on formGroup setting
        if (state.configuration.formSettings?.formGroup) {
          // Use groupedFields when formGroup is true
          state.groupedFields = data.groupedFields || {};
          // Extract fields arrays from each group and flatten them
          state.fields = Object.values(data.groupedFields || {})
            .map(
              (group: { label: string; fields: TrackStatusFormField[] }) =>
                group.fields
            )
            .flat();
        } else {
          // Use fields array when formGroup is false
          state.fields = data.fields || [];
          state.groupedFields = {}; // Empty grouped fields when using fields array
        }

        // Initialize form values with default values
        const initialFormValues: TrackStatusFormValues = {};

        if (state.configuration.formSettings?.formGroup) {
          // Initialize from grouped fields
          Object.values(state.groupedFields).forEach((fieldGroup) => {
            fieldGroup.fields.forEach((field) => {
              if (
                field.defaultValue !== null &&
                field.defaultValue !== undefined
              ) {
                initialFormValues[field.fieldName] = field.defaultValue;
              }
            });
          });
        } else {
          // Initialize from fields array
          state.fields.forEach((field) => {
            if (
              field.defaultValue !== null &&
              field.defaultValue !== undefined
            ) {
              initialFormValues[field.fieldName] = field.defaultValue;
            }
          });
        }

        state.formValues = initialFormValues;
      })
      .addCase(fetchTrackStatusFormPreviewData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.configuration = null;
        state.fields = [];
        state.groupedFields = {};
        state.formValues = {};
      });
  },
});

// Export actions
export const {
  updateFormValue,
  updateFormValues,
  resetFormValues,
  clearError,
  resetState,
} = trackStatusFormPreviewSlice.actions;

// Selectors
export const selectTrackStatusFormPreviewLoading = (state: RootState) =>
  state.trackStatusFormPreview.loading;

export const selectTrackStatusFormPreviewError = (state: RootState) =>
  state.trackStatusFormPreview.error;

export const selectTrackStatusFormPreviewConfiguration = (state: RootState) =>
  state.trackStatusFormPreview.configuration;

export const selectTrackStatusFormPreviewFields = (state: RootState) =>
  state.trackStatusFormPreview.fields;

export const selectTrackStatusFormPreviewGroupedFields = (state: RootState) =>
  state.trackStatusFormPreview.groupedFields;

export const selectTrackStatusFormPreviewFormValues = (state: RootState) =>
  state.trackStatusFormPreview.formValues;

// Derived selectors
export const selectTrackStatusFormPreviewIsFormGroupEnabled = (
  state: RootState
) =>
  state.trackStatusFormPreview.configuration?.formSettings?.formGroup || false;

export const selectTrackStatusFormPreviewAllFields = (state: RootState) => {
  const isFormGroupEnabled =
    selectTrackStatusFormPreviewIsFormGroupEnabled(state);

  if (isFormGroupEnabled) {
    // Flatten grouped fields
    const allFields: TrackStatusFormField[] = [];
    Object.values(state.trackStatusFormPreview.groupedFields).forEach(
      (fieldGroup) => {
        allFields.push(...fieldGroup.fields);
      }
    );
    return allFields;
  } else {
    return state.trackStatusFormPreview.fields;
  }
};

// Export reducer
export default trackStatusFormPreviewSlice.reducer;
