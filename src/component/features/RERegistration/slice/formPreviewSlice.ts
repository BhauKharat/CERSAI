/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { RootState } from '../../../../redux/store';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  FormPreviewApiResponse,
  FormField,
  FormValues,
  initialState,
} from '../types/formPreviewTypes';

// Async thunk to fetch form preview data
export const fetchFormPreviewData = createAsyncThunk<
  FormPreviewApiResponse,
  void,
  { rejectValue: string }
>('formPreview/fetchFormPreviewData', async (_, { rejectWithValue }) => {
  try {
    const response = await Secured.get(API_ENDPOINTS.get_form_preview_fields);
    return response.data as FormPreviewApiResponse;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch form preview data';
    return rejectWithValue(errorMessage);
  }
});

// Form Preview Slice
const formPreviewSlice = createSlice({
  name: 'formPreview',
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
      const { fieldName, value } = action.payload;
      state.formValues[fieldName] = value;
    },

    // Clear form
    clearForm: (state) => {
      state.formValues = {};
    },

    // Set field error (for compatibility with DynamicExpandCollapseForm)
    setFieldError: (
      state,
      action: PayloadAction<{ field: string; message: string }>
    ) => {
      // This can be extended to handle validation errors if needed
      console.log('Field error:', action.payload);
    },

    // Clear field error
    clearFieldError: (state, action: PayloadAction<string>) => {
      // This can be extended to handle validation errors if needed
      console.log('Clear field error:', action.payload);
    },

    // Copy section values (for address copying functionality)
    copySectionValues: (
      state,
      action: PayloadAction<{ fromSection: string; toSection: string }>
    ) => {
      const { fromSection, toSection } = action.payload;

      // Find fields in both sections
      const fromFields = state.groupedFields[fromSection]?.fields || [];
      const toFields = state.groupedFields[toSection]?.fields || [];

      // Copy values from source section to target section
      fromFields.forEach((fromField: FormField) => {
        const fromFieldName = fromField.fieldName;
        const fromValue = state.formValues[fromFieldName];

        // Find corresponding field in target section
        const toField = toFields.find(
          (field: FormField) =>
            field.fieldName.replace(toSection, '') ===
            fromFieldName.replace(fromSection, '')
        );

        if (toField && fromValue !== undefined) {
          state.formValues[toField.fieldName] = fromValue;
        }
      });
    },

    // Clear section values
    clearSectionValues: (state, action: PayloadAction<string>) => {
      const sectionPrefix = action.payload;

      // Find all fields that belong to this section
      Object.keys(state.formValues).forEach((fieldName) => {
        if (fieldName.startsWith(sectionPrefix)) {
          delete state.formValues[fieldName];
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch form preview data
      .addCase(fetchFormPreviewData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormPreviewData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { data } = action.payload;
        state.configuration = data.configuration;

        // Check if formGroup is enabled
        if (data.configuration?.formSettings?.formGroup) {
          // Use groupedFields
          state.groupedFields = data.groupedFields;
          // Extract fields arrays from each group and flatten them
          state.fields = Object.values(data.groupedFields)
            .map(
              (group: { label: string; fields: FormField[] }) => group.fields
            )
            .flat();
        } else {
          // Use fields array
          state.fields = data.fields;
          state.groupedFields = {};
        }

        // Initialize form values with default values from fields
        const formValues: FormValues = {};
        state.fields.forEach((field: FormField) => {
          if (field.defaultValue !== null && field.defaultValue !== undefined) {
            // Convert numbers to strings for form compatibility
            const value =
              typeof field.defaultValue === 'number'
                ? field.defaultValue.toString()
                : field.defaultValue;
            formValues[field.fieldName] = value;
          }
        });

        // Merge with existing form values (preserve user input)
        state.formValues = { ...formValues, ...state.formValues };
      })
      .addCase(fetchFormPreviewData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch form preview data';
      });
  },
});

// Export actions
export const {
  updateFormValue,
  clearForm,
  setFieldError,
  clearFieldError,
  copySectionValues,
  clearSectionValues,
} = formPreviewSlice.actions;

// Selectors
export const selectFormPreviewLoading = (state: RootState) =>
  state.formPreview.loading;
export const selectFormPreviewError = (state: RootState) =>
  state.formPreview.error;
export const selectFormPreviewConfiguration = (state: RootState) =>
  state.formPreview.configuration;
export const selectFormPreviewFields = (state: RootState) =>
  state.formPreview.fields;
export const selectFormPreviewGroupedFields = (state: RootState) =>
  state.formPreview.groupedFields;
export const selectFormPreviewFormValues = (state: RootState) =>
  state.formPreview.formValues;

// Export reducer
export default formPreviewSlice.reducer;
