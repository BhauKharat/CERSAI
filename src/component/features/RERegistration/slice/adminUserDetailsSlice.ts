import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  AdminUserDetailsState,
  AdminUserDetailsResponse,
  AdminUserFieldError,
  AdminUserFormField,
} from '../types/adminUserDetailsTypes';
import { resetAuth } from '../../Authenticate/slice/authSlice';

// Initial state
const initialState: AdminUserDetailsState = {
  fields: [],
  groupedFields: {},
  configuration: null,
  formValues: {},
  fieldErrors: [],
  dropdownOptions: {},
  loading: false,
  error: null,
  verifiedSections: [],
  sectionDataHashes: {},
};

// Async thunk to fetch admin user details form fields
export const fetchAdminUserDetailsFields = createAsyncThunk(
  'adminUserDetails/fetchFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.get_admin_user_details_fields
      );
      return response.data as AdminUserDetailsResponse;
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
export const fetchAdminUserDropdownOptions = createAsyncThunk(
  'adminUserDetails/fetchDropdownOptions',
  async (
    {
      url,
      method = 'GET',
      fieldId,
      fieldName,
      headers = {},
      payload = null,
      responseMapping,
    }: {
      url: string;
      method?: string;
      fieldId: number;
      fieldName: string;
      headers?: Record<string, string>;
      payload?: Record<string, unknown> | null;
      responseMapping?: {
        label: string;
        value: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        `🚀 Fetching dropdown options for ${fieldName} (ID: ${fieldId}):`,
        {
          url,
          method,
          headers,
          payload,
          responseMapping,
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

      console.log(`✅ API response for ${fieldName}:`, response.data);

      // Handle different response structures
      let responseData = response.data;
      if (response.data && response.data.data) {
        responseData = response.data.data;
      }

      // Ensure we have an array
      const optionsArray = Array.isArray(responseData) ? responseData : [];

      // Transform options based on response mapping
      let transformedOptions: Array<{ label: string; value: string }> = [];
      if (responseMapping) {
        transformedOptions = optionsArray.map(
          (option: Record<string, unknown>) => {
            // Special handling for pincode fields
            if (
              fieldName.toLowerCase().includes('pincode') &&
              !fieldName.toLowerCase().includes('other')
            ) {
              return {
                label: (option.pincode as string) || '',
                value: (option.pincode as string) || '',
              };
            }

            // Use configured response mapping for other fields
            return {
              label: (option[responseMapping.label] as string) || '',
              value: (option[responseMapping.value] as string) || '',
            };
          }
        );
        console.log(
          `🔄 Transformed ${transformedOptions.length} options for ${fieldName}`
        );
      } else {
        // If no mapping provided, assume options are already in correct format
        transformedOptions = optionsArray as Array<{
          label: string;
          value: string;
        }>;
      }

      return {
        fieldId,
        options: transformedOptions,
        cached: false,
      };
    } catch (error: unknown) {
      console.error(
        `❌ Failed to fetch dropdown options for ${fieldName} (ID: ${fieldId}):`,
        error
      );

      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        if ('response' in error) {
          const axiosError = error as Error & {
            response?: { status?: number; data?: unknown };
            config?: { url?: string };
          };
          console.error('Response status:', axiosError.response?.status);
          console.error('Response data:', axiosError.response?.data);
          console.error('Request URL:', axiosError.config?.url);
        }
      }

      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to fetch dropdown options'
          : 'Failed to fetch dropdown options';
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin User Details Slice
const adminUserDetailsSlice = createSlice({
  name: 'adminUserDetails',
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
      const { fieldName, value } = action.payload;
      state.formValues[fieldName] = value;

      if (fieldName === 'iauCitizenship1' || fieldName === 'iauCitizenship2') {
        const groupKey =
          fieldName === 'iauCitizenship1' ? 'adminone' : 'admintwo';
        const ckycNoFieldName =
          fieldName === 'iauCitizenship1' ? 'iauCkycNumber1' : 'iauCkycNumber2';

        const group = state.groupedFields?.[groupKey];
        if (!group?.fields) return;

        const ckycNoField = group.fields.find(
          (f: AdminUserFormField) => f.fieldName === ckycNoFieldName
        );

        if (ckycNoField) {
          ckycNoField.validationRules = {
            ...ckycNoField.validationRules,
            required: value === 'Indian',
          };
          state.fieldErrors = state.fieldErrors.filter(
            (err) => err.field !== ckycNoFieldName
          );
        }
      }
    },

    // Set field error
    setFieldError: (state, action: PayloadAction<AdminUserFieldError>) => {
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
      state.verifiedSections = [];
      state.sectionDataHashes = {};
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

    // Set verified sections
    setVerifiedSections: (state, action: PayloadAction<string[]>) => {
      state.verifiedSections = action.payload;
    },

    // Add a verified section
    addVerifiedSection: (state, action: PayloadAction<string>) => {
      if (!state.verifiedSections.includes(action.payload)) {
        state.verifiedSections.push(action.payload);
      }
    },

    // Remove a verified section
    removeVerifiedSection: (state, action: PayloadAction<string>) => {
      state.verifiedSections = state.verifiedSections.filter(
        (section) => section !== action.payload
      );
    },

    // Set section data hashes
    setSectionDataHashes: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.sectionDataHashes = action.payload;
    },

    // Update a section data hash
    updateSectionDataHash: (
      state,
      action: PayloadAction<{ section: string; hash: string }>
    ) => {
      state.sectionDataHashes[action.payload.section] = action.payload.hash;
    },
  },
  extraReducers: (builder) => {
    // Fetch admin user details fields
    builder
      .addCase(fetchAdminUserDetailsFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserDetailsFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.data.fields;
        state.groupedFields = action.payload.data.groupedFields;
        state.configuration = action.payload.data.configuration;
        state.error = null;
      })
      .addCase(fetchAdminUserDetailsFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch dropdown options
      .addCase(fetchAdminUserDropdownOptions.fulfilled, (state, action) => {
        console.log(
          'fetchAdminUserDropdownOptions.fulfilled called:',
          action.payload
        );
        const { fieldId, options } = action.payload;
        state.dropdownOptions[fieldId] = options;

        // Update the field's fieldOptions in the fields array
        const fieldIndex = state.fields.findIndex(
          (field) => field.id === fieldId
        );
        if (fieldIndex !== -1) {
          state.fields[fieldIndex].fieldOptions = options;
          console.log(
            `✅ Updated field.fieldOptions for field ID ${fieldId} in fields array`
          );
        }

        // Update in grouped fields as well
        Object.keys(state.groupedFields).forEach((groupName) => {
          const group = state.groupedFields[groupName];
          const fieldInGroupIndex = group.fields.findIndex(
            (field) => field.id === fieldId
          );
          if (fieldInGroupIndex !== -1) {
            group.fields[fieldInGroupIndex].fieldOptions = options;
            console.log(
              `✅ Updated field.fieldOptions for field ID ${fieldId} in group ${groupName}`
            );
          }
        });
      })
      .addCase(fetchAdminUserDropdownOptions.rejected, (state, action) => {
        console.log(
          'fetchAdminUserDropdownOptions.rejected called:',
          action.payload
        );
        // Don't set general error for dropdown failures - they're field-specific
        // state.error = action.payload as string;
      })
      // Reset on logout
      .addCase(resetAuth, () => initialState);
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
  setVerifiedSections,
  addVerifiedSection,
  removeVerifiedSection,
  setSectionDataHashes,
  updateSectionDataHash,
} = adminUserDetailsSlice.actions;

// Selectors
export const selectAdminUserDetailsFields = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.fields;

export const selectAdminUserDetailsGroupedFields = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.groupedFields;

export const selectAdminUserDetailsConfiguration = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.configuration;

export const selectAdminUserDetailsFormValues = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.formValues;

export const selectAdminUserDetailsLoading = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.loading;

export const selectAdminUserDetailsError = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.error;

export const selectAdminUserDetailsFieldErrors = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.fieldErrors;

export const selectAdminUserDetailsDropdownOptions = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.dropdownOptions;

export const selectAdminUserDetailsVerifiedSections = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.verifiedSections;

export const selectAdminUserDetailsSectionDataHashes = (state: {
  adminUserDetails: AdminUserDetailsState;
}) => state.adminUserDetails.sectionDataHashes;

export default adminUserDetailsSlice.reducer;
