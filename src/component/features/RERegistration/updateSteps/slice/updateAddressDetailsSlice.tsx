/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS, CMS_URL } from 'Constant';
import {
  FormField,
  FieldAttributes as FormFieldAttributes,
} from '../../types/formTypes';
import { EntityProfileSubmissionResponse } from '../../types/entityProfileSubmissionTypes';

// Update the interfaces to match your new data structure
interface AddressStepData {
  correspondenceCity: string;
  correspondenceCountry: string;
  correspondenceDigipin: string;
  correspondenceDistrict: string;
  correspondenceLine1: string;
  correspondenceLine2: string;
  correspondenceLine3: string;
  correspondencePincode: string;
  correspondenceState: string;
  registerCity: string;
  registerCountry: string;
  registerDigipin: string;
  registerDistrict: string;
  registerLine1: string;
  registerLine2: string;
  registerLine3: string;
  registerPincode: string;
  registerState: string;
  last_updated: string;
  last_updated_by: string;
  status: string;
  step_name: string;
}
interface FormFieldsResponse {
  fields: FormField[];
  groupedFields: {
    [key: string]: {
      label: string;
      fields: FormField[];
    };
  };
  configuration: any;
  formType: string;
}
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

interface UpdateStepDataState {
  stepData: AddressStepData | null;
  documents: any[];
  fields: FormField[];
  groupedFields: {
    [key: string]: {
      label: string;
      fields: FormField[];
    };
  };
  configuration: any;
  formType: string;
  fetchedDocuments: Record<string, any>;
  dropdownData: DropdownDataState; // Add this
  loading: boolean;
  error: string | null;
}

const initialState: UpdateStepDataState = {
  stepData: null,
  documents: [],
  fields: [],
  groupedFields: {},
  configuration: null,
  formType: '',
  fetchedDocuments: {},
  dropdownData: {}, // Initialize dropdown data
  loading: false,
  error: null,
};

// Update the fetchStepData thunk to handle the new structure
export const fetchStepDataAddress = createAsyncThunk(
  'updateAddressDetailsSlice/fetchStepData',
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
      const stepData = rows.length > 0 ? rows[0].data?.[stepKey] || {} : {};
      const documents = response.data.data?.documents || {};

      return {
        stepData,
        documents,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update the fetchFormFields thunk to handle the new structure
export const fetchFormFieldsAddress = createAsyncThunk(
  'updateAddressDetailsSlice/fetchFormFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.update_address_form_fields
      );

      // Handle the nested structure - FIXED based on your API response
      const data = response.data.data || {};
      const fields = data.fields || [];
      const groupedFields = data.groupedFields || {};
      const configuration = data.configuration || {};
      const formType = data.formType || '';

      return {
        fields,
        groupedFields,
        configuration,
        formType,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
// Add this async thunk for fetching dropdown data
// Submission async thunk for updating address details
export const submitUpdatedAddressDetails = createAsyncThunk(
  'updateAddressDetailsSlice/submitAddressDetails',
  async (
    {
      formValues,
      userId,
    }: {
      formValues: Record<
        string,
        string | File | number | boolean | object | null
      >;
      userId: string;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const formData = new FormData();

      // Get dropdown data from state to convert IDs to names
      const state = getState() as {
        updateAddressDetailsSlice: UpdateStepDataState;
      };
      const dropdownData = state.updateAddressDetailsSlice.dropdownData;

      // Helper function to get label (name) from dropdown options by value (code/ID)
      const getNameFromDropdown = (
        fieldName: string,
        value: string | number
      ): string => {
        const options = dropdownData[fieldName]?.options || [];
        const matchedOption = options.find(
          (opt: DropdownOption) => String(opt.value) === String(value)
        );
        return matchedOption ? matchedOption.label : String(value);
      };

      // Prepare metadata object (only non-file fields with non-empty values)
      const metadata: Record<string, string> = {};
      const fileFields: Record<string, File> = {};

      // Fields that need to be converted from code to name
      const fieldsToConvertToName = [
        'registerDistrict',
        'correspondenceDistrict',
        'registerState',
        'correspondenceState',
        'registerCity',
        'correspondenceCity',
      ];

      // Separate metadata fields from file fields
      // Only include metadata fields that have non-empty values
      // Only include files that are newly uploaded (File instances)
      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
          // Only send newly uploaded files
          fileFields[key] = value;
        } else if (typeof value === 'boolean') {
          // Always include boolean values (true or false)
          metadata[key] = String(value);
        } else if (value !== null && value !== undefined && value !== '') {
          // Convert code to name for specific fields
          if (fieldsToConvertToName.includes(key)) {
            metadata[key] = getNameFromDropdown(key, value as string | number);
          } else {
            // Only send non-empty metadata values
            metadata[key] = String(value);
          }
        }
      });

      Object.entries(metadata).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });

      // Add metadata as JSON string
      formData.append('metadata', JSON.stringify(metadata));

      // Add userId
      formData.append('userId', userId);

      // Add files with their field names (only newly uploaded files)
      Object.entries(fileFields).forEach(([fieldName, file]) => {
        formData.append(fieldName, file);
      });

      const response = await Secured.put(
        API_ENDPOINTS.submit_update_address_details,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data as EntityProfileSubmissionResponse;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: {
                status?: number;
                code?: string;
                type?: string;
                message?: string;
                errors?: Array<{ field: string; message: string }>;
              };
              status?: number;
              code?: string;
              type?: string;
              errors?: Array<{ field: string; message: string }>;
            };
            status?: number;
            statusText?: string;
            headers?: Record<string, unknown>;
          };
          message?: string;
        };

        const errorData =
          axiosError.response?.data?.error || axiosError.response?.data;

        if (axiosError.response?.data) {
          console.error(
            '🔍 Full error response:',
            JSON.stringify(axiosError.response.data, null, 2)
          );
        }

        // Handle form validation errors
        if (
          axiosError.response?.status === 400 &&
          errorData &&
          typeof errorData === 'object' &&
          'type' in errorData &&
          errorData.type === 'ERROR_FORM_VALIDATION' &&
          'errors' in errorData &&
          Array.isArray(errorData.errors)
        ) {
          return rejectWithValue({
            type: 'FIELD_VALIDATION_ERROR',
            message:
              (errorData as { message?: string }).message ||
              'Form validation failed',
            fieldErrors: errorData.errors.reduce(
              (
                acc: Record<string, string>,
                err: { field: string; message: string }
              ) => {
                acc[err.field] = err.message;
                return acc;
              },
              {}
            ),
            status: axiosError.response.status,
            code: (errorData as { code?: string }).code,
          });
        }

        const errorMessage =
          (errorData && typeof errorData === 'object' && 'message' in errorData
            ? (errorData as { message?: string }).message
            : null) ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to submit address details';

        return rejectWithValue({
          type: 'GENERAL_ERROR',
          message: errorMessage,
          status: axiosError.response?.status,
          code:
            errorData && typeof errorData === 'object' && 'code' in errorData
              ? (errorData as { code?: string }).code
              : undefined,
        });
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit address details';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDropdownData = createAsyncThunk(
  'updateAddressDetailsSlice/fetchDropdownData',
  async (
    {
      fieldName,
      fieldAttributes,
      formData,
    }: {
      fieldName: string;
      fieldAttributes: FormFieldAttributes;
      formData: Record<string, any>;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const { url, method, responseMapping } = fieldAttributes;

      // Handle both urlData and urldata (API returns lowercase)
      const urlParam =
        (fieldAttributes as any).urldata || (fieldAttributes as any).urlData;

      if (!url || !method || !responseMapping || !urlParam) {
        throw new Error(`Missing required field attributes for ${fieldName}`);
      }

      // Map generic urlParam (e.g., "District") to actual form field name (e.g., "registerDistrict" or "correspondenceDistrict")
      let actualFormFieldName = urlParam;
      if (fieldName.startsWith('register')) {
        // For register fields, prefix with "register" if not already
        const capitalizedParam =
          urlParam.charAt(0).toUpperCase() + urlParam.slice(1);
        actualFormFieldName =
          formData[`register${capitalizedParam}`] !== undefined
            ? `register${capitalizedParam}`
            : urlParam;
      } else if (fieldName.startsWith('correspondence')) {
        // For correspondence fields, prefix with "correspondence" if not already
        const capitalizedParam =
          urlParam.charAt(0).toUpperCase() + urlParam.slice(1);
        actualFormFieldName =
          formData[`correspondence${capitalizedParam}`] !== undefined
            ? `correspondence${capitalizedParam}`
            : urlParam;
      }

      let paramValue = formData[actualFormFieldName] || formData[urlParam];

      if (!paramValue) {
        return {
          fieldName,
          options: [],
        };
      }

      // For pincode fields, we need to send district NAME instead of ID
      // Look up the label from dropdown options if paramValue is an ID
      if (
        fieldName.toLowerCase().includes('pincode') &&
        actualFormFieldName.toLowerCase().includes('district')
      ) {
        const state = getState() as {
          updateAddressDetailsSlice: UpdateStepDataState;
        };
        const dropdownOptions =
          state.updateAddressDetailsSlice.dropdownData[actualFormFieldName]
            ?.options || [];

        // Find the option with matching value (ID) and get its label (name)
        const matchedOption = dropdownOptions.find(
          (opt: DropdownOption) => String(opt.value) === String(paramValue)
        );

        if (matchedOption) {
          paramValue = matchedOption.label; // Use the name instead of ID
        }
      }

      // Replace the dynamic parameter in the URL
      let dynamicUrl = url.replace(`{${urlParam}}`, paramValue);

      // If CMS returns a relative URL (starting with '/'), prefix it with CMS_URL
      if (dynamicUrl.startsWith('/')) {
        dynamicUrl = `${CMS_URL}${dynamicUrl}`;
      }

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
        // Check if this is a field that should use name as value (State, District, City)
        const useNameAsValue = ['state', 'district', 'city'].some((suffix) =>
          fieldName.toLowerCase().includes(suffix)
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

          // For State, District, City fields - use name as value instead of code
          if (useNameAsValue) {
            valueValue = labelValue;
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
      return rejectWithValue({
        fieldName,
        error: error.response?.data || error.message,
      });
    }
  }
);
const updateAddressDetailsSlice = createSlice({
  name: 'updateAddressDetailsSlice',
  initialState,
  reducers: {
    clearStepData: (state) => {
      state.stepData = null;
      state.documents = [];
    },
    setFormData: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.stepData) {
        state.stepData = { ...state.stepData, ...action.payload };
      }
    },
    updateFieldValue: (
      state,
      action: PayloadAction<{ fieldName: string; value: any }>
    ) => {
      if (state.stepData) {
        state.stepData = {
          ...state.stepData,
          [action.payload.fieldName]: action.payload.value,
        };
      }
    },
    // Add this to clear dropdown data when needed
    clearDropdownData: (state, action: PayloadAction<string>) => {
      delete state.dropdownData[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases...
      .addCase(fetchStepDataAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepDataAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.stepData = action.payload.stepData;
        state.documents = action.payload.documents;
        state.error = null;
      })
      .addCase(fetchStepDataAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFormFieldsAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFieldsAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.fields;
        state.groupedFields = action.payload.groupedFields;
        state.configuration = action.payload.configuration;
        state.formType = action.payload.formType;
        state.error = null;
      })
      .addCase(fetchFormFieldsAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Dropdown data cases
      .addCase(fetchDropdownData.pending, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: true,
          options: [],
          error: null,
        };
      })
      .addCase(fetchDropdownData.fulfilled, (state, action) => {
        const { fieldName, options } = action.payload;
        state.dropdownData[fieldName] = {
          loading: false,
          options,
          error: null,
        };
      })
      .addCase(fetchDropdownData.rejected, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: false,
          options: [],
          error: action.payload as string,
        };
      });
  },
});

export const {
  clearStepData,
  setFormData,
  updateFieldValue,
  clearDropdownData, // Export the new action
} = updateAddressDetailsSlice.actions;

// FIXED SELECTORS - match the slice name
export const selectStepDataLoading = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.loading;

export const selectGroupedFields = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.groupedFields;

export const selectFields = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.fields;

export const selectConfiguration = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.configuration;

export const selectStepData = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.stepData;

export const selectDocuments = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.documents;
// Add these selectors
export const selectDropdownData = (state: {
  updateAddressDetailsSlice: UpdateStepDataState;
}) => state.updateAddressDetailsSlice.dropdownData;

export const selectDropdownOptions =
  (fieldName: string) =>
  (state: { updateAddressDetailsSlice: UpdateStepDataState }) =>
    state.updateAddressDetailsSlice.dropdownData[fieldName]?.options || [];

export const selectDropdownLoading =
  (fieldName: string) =>
  (state: { updateAddressDetailsSlice: UpdateStepDataState }) =>
    state.updateAddressDetailsSlice.dropdownData[fieldName]?.loading || false;

export const selectDropdownError =
  (fieldName: string) =>
  (state: { updateAddressDetailsSlice: UpdateStepDataState }) =>
    state.updateAddressDetailsSlice.dropdownData[fieldName]?.error || null;
export default updateAddressDetailsSlice.reducer;
