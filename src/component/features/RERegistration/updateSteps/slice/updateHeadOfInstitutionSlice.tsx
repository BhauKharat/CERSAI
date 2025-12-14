/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';
import {
  FormField,
  FieldAttributes as FormFieldAttributes,
} from '../../types/formTypes';

// Interface for HOI step data
interface HoiStepData {
  hoiCitizenship: string;
  hoiCkycNo: string;
  hoiTitle: string;
  hoiFirstName: string;
  hoiMiddleName: string;
  hoiLastName: string;
  hoiGender: string;
  hoiDesignation: string;
  hoiEmail: string;
  hoiCountryCode: string;
  hoiMobile: string;
  hoiLandline: string;
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

interface UpdateHeadOfInstitutionState {
  stepData: HoiStepData | null;
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
  dropdownData: DropdownDataState;
  loading: boolean;
  error: string | null;
}

const initialState: UpdateHeadOfInstitutionState = {
  stepData: null,
  documents: [],
  fields: [],
  groupedFields: {},
  configuration: null,
  formType: '',
  fetchedDocuments: {},
  dropdownData: {},
  loading: false,
  error: null,
};

// Fetch HOI step data
export const fetchStepDataHoi = createAsyncThunk(
  'updateHeadOfInstitution/fetchStepData',
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
      console.error('❌ Error fetching HOI step data:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch HOI form fields
export const fetchFormFieldsHoi = createAsyncThunk(
  'updateHeadOfInstitution/fetchFormFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(API_ENDPOINTS.update_hoi_form_fields);

      // Handle the nested structure
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
      console.error('❌ Error fetching HOI form fields:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch document by ID
export const fetchDocumentHoi = createAsyncThunk(
  'updateHeadOfInstitution/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        `${API_ENDPOINTS.fetch_document}?documentId=${documentId}`
      );

      return {
        documentId,
        documentData: response.data.data || {},
      };
    } catch (error: any) {
      console.error(`❌ Error fetching HOI document ${documentId}:`, error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch dropdown data dynamically
export const fetchDropdownDataHoi = createAsyncThunk(
  'updateHeadOfInstitution/fetchDropdownData',
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
    { rejectWithValue }
  ) => {
    try {
      const { url, method, responseMapping } = fieldAttributes;

      // Handle both urlData and urldata (API returns lowercase)
      const urlParam =
        (fieldAttributes as any).urldata || (fieldAttributes as any).urlData;

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
        `❌ Error fetching HOI dropdown data for ${fieldName}:`,
        error
      );
      return rejectWithValue({
        fieldName,
        error: error.response?.data || error.message,
      });
    }
  }
);

const updateHeadOfInstitutionSlice = createSlice({
  name: 'updateHeadOfInstitution',
  initialState,
  reducers: {
    clearStepDataHoi: (state) => {
      state.stepData = null;
      state.documents = [];
    },
    setFormDataHoi: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.stepData) {
        state.stepData = { ...state.stepData, ...action.payload };
      }
    },
    updateFieldValueHoi: (
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
    clearDropdownDataHoi: (state, action: PayloadAction<string>) => {
      delete state.dropdownData[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch step data cases
      .addCase(fetchStepDataHoi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepDataHoi.fulfilled, (state, action) => {
        state.loading = false;
        state.stepData = action.payload.stepData;
        state.documents = action.payload.documents;
        state.error = null;
      })
      .addCase(fetchStepDataHoi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch form fields cases
      .addCase(fetchFormFieldsHoi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFieldsHoi.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.fields;
        state.groupedFields = action.payload.groupedFields;
        state.configuration = action.payload.configuration;
        state.formType = action.payload.formType;
        state.error = null;
      })
      .addCase(fetchFormFieldsHoi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch document cases
      .addCase(fetchDocumentHoi.fulfilled, (state, action) => {
        state.fetchedDocuments[action.payload.documentId] =
          action.payload.documentData;
      })
      // Dropdown data cases
      .addCase(fetchDropdownDataHoi.pending, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: true,
          options: [],
          error: null,
        };
      })
      .addCase(fetchDropdownDataHoi.fulfilled, (state, action) => {
        const { fieldName, options } = action.payload;
        state.dropdownData[fieldName] = {
          loading: false,
          options,
          error: null,
        };
      })
      .addCase(fetchDropdownDataHoi.rejected, (state, action) => {
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
  clearStepDataHoi,
  setFormDataHoi,
  updateFieldValueHoi,
  clearDropdownDataHoi,
} = updateHeadOfInstitutionSlice.actions;

// Selectors
export const selectHoiStepDataLoading = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.loading;

export const selectHoiFields = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.fields;

export const selectHoiGroupedFields = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.groupedFields;

export const selectHoiConfiguration = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.configuration;

export const selectHoiStepData = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.stepData;

export const selectHoiDocuments = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.documents;

export const selectHoiFetchedDocuments = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.fetchedDocuments;

export const selectHoiDropdownData = (state: {
  updateHeadOfInstitution: UpdateHeadOfInstitutionState;
}) => state.updateHeadOfInstitution.dropdownData;

export const selectHoiDropdownOptions =
  (fieldName: string) =>
  (state: { updateHeadOfInstitution: UpdateHeadOfInstitutionState }) =>
    state.updateHeadOfInstitution.dropdownData[fieldName]?.options || [];

export const selectHoiDropdownLoading =
  (fieldName: string) =>
  (state: { updateHeadOfInstitution: UpdateHeadOfInstitutionState }) =>
    state.updateHeadOfInstitution.dropdownData[fieldName]?.loading || false;

export const selectHoiDropdownError =
  (fieldName: string) =>
  (state: { updateHeadOfInstitution: UpdateHeadOfInstitutionState }) =>
    state.updateHeadOfInstitution.dropdownData[fieldName]?.error || null;

export default updateHeadOfInstitutionSlice.reducer;
