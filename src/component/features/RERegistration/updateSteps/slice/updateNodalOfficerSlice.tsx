/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS, CMS_URL } from 'Constant';
import {
  FormField,
  FieldAttributes as FormFieldAttributes,
} from '../../types/formTypes';

// Interface for Nodal Officer step data
interface NodalOfficerStepData {
  noCitizenship: string;
  noCkycNumber: string;
  noTitle: string;
  noFirstName: string;
  noMiddleName: string;
  noLastName: string;
  noGender: string;
  noDob: string;
  noDesignation: string;
  noEmployCode: string;
  noEmail: string;
  noCountryCode: string;
  noNobileNumber: string;
  noLandlineNumber: string;
  noOfficeAddress: string;
  noAddresLine1: string;
  noAddresLine2: string;
  noAddresLine3: string;
  noRegisterCountry: string;
  noRegisterState: string;
  noRegisterDistrict: string;
  noRegisterCity: string;
  noRegisterPincode: string;
  noRegisterPincodeOther: string;
  noRegisterDigipin: string;
  noProofOfIdentity: string;
  noProofOfIdentityNumber: string;
  noBoardResoluationDate: string;
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

// Interface for registration addresses data
interface RegistrationAddresses {
  // Register address fields
  registerLine1?: string;
  registerLine2?: string;
  registerLine3?: string;
  registerCountry?: string;
  registerState?: string;
  registerDistrict?: string;
  registerCity?: string;
  registerPincode?: string;
  registerPincodeOther?: string;
  registerDigipin?: string;
  // Correspondence address fields
  correspondenceLine1?: string;
  correspondenceLine2?: string;
  correspondenceLine3?: string;
  correspondenceCountry?: string;
  correspondenceState?: string;
  correspondenceDistrict?: string;
  correspondenceCity?: string;
  correspondencePincode?: string;
  correspondencePincodeOther?: string;
  correspondenceDigipin?: string;
}

interface UpdateNodalOfficerState {
  stepData: NodalOfficerStepData | null;
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
  registrationAddresses: RegistrationAddresses | null;
  registrationAddressesLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UpdateNodalOfficerState = {
  stepData: null,
  documents: [],
  fields: [],
  groupedFields: {},
  configuration: null,
  formType: '',
  fetchedDocuments: {},
  dropdownData: {},
  registrationAddresses: null,
  registrationAddressesLoading: false,
  loading: false,
  error: null,
};

// Fetch Nodal Officer step data
export const fetchStepDataNodal = createAsyncThunk(
  'updateNodalOfficer/fetchStepData',
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

      // Transform documents object into array format (same as UpdateAdminUserDetailsSlice)
      const documentsArray = Object.entries(documents).map(
        ([fieldKey, docData]: [string, any]) => ({
          id: docData.id || docData.documentId,
          fieldKey: docData.fieldKey || fieldKey,
          type: docData.type,
          ...docData,
        })
      );
      return {
        stepData,
        documents: documentsArray,
      };
    } catch (error: any) {
      console.error('❌ Error fetching Nodal Officer step data:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Nodal Officer form fields
export const fetchFormFieldsNodal = createAsyncThunk(
  'updateNodalOfficer/fetchFormFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.update_nodal_officer_form_fields
      );

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
      console.error('❌ Error fetching Nodal Officer form fields:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Note: Document fetching is handled by shared updateStepDataSlice.fetchDocument

// Fetch registration addresses for "Same as" dropdown functionality
export const fetchRegistrationAddresses = createAsyncThunk(
  'updateNodalOfficer/fetchRegistrationAddresses',
  async (
    {
      userId,
    }: {
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
        stepKey: 'addresses',
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

      // Extract addresses data
      const rows = response.data.data?.rows || [];
      const addressData = rows.length > 0 ? rows[0].data?.addresses || {} : {};

      return addressData as RegistrationAddresses;
    } catch (error: any) {
      console.error('❌ Error fetching registration addresses:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch dropdown data dynamically
export const fetchDropdownDataNodal = createAsyncThunk(
  'updateNodalOfficer/fetchDropdownData',
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
      let dynamicUrl = url.replace(`{${urlParam}}`, paramValue);

      // Prepend CMS_URL if API URL begins with "/"
      if (dynamicUrl.startsWith('/')) {
        dynamicUrl = `${CMS_URL}${dynamicUrl}`;
      }

      // Replace the dynamic parameter in the URL
      // const dynamicUrl = url.replace(`{${urlParam}}`, paramValue);

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
        `❌ Error fetching Nodal Officer dropdown data for ${fieldName}:`,
        error
      );
      return rejectWithValue({
        fieldName,
        error: error.response?.data || error.message,
      });
    }
  }
);

const updateNodalOfficerSlice = createSlice({
  name: 'updateNodalOfficer',
  initialState,
  reducers: {
    clearStepDataNodal: (state) => {
      state.stepData = null;
      state.documents = [];
    },
    setFormDataNodal: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.stepData) {
        state.stepData = { ...state.stepData, ...action.payload };
      }
    },
    updateFieldValueNodal: (
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
    clearDropdownDataNodal: (state, action: PayloadAction<string>) => {
      delete state.dropdownData[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch step data cases
      .addCase(fetchStepDataNodal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepDataNodal.fulfilled, (state, action) => {
        state.loading = false;
        state.stepData = action.payload.stepData;
        state.documents = action.payload.documents;
        state.error = null;
      })
      .addCase(fetchStepDataNodal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch form fields cases
      .addCase(fetchFormFieldsNodal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFieldsNodal.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.fields;
        state.groupedFields = action.payload.groupedFields;
        state.configuration = action.payload.configuration;
        state.formType = action.payload.formType;
        state.error = null;
      })
      .addCase(fetchFormFieldsNodal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Note: Document fetching is handled by shared updateStepDataSlice.fetchDocument
      // Dropdown data cases
      .addCase(fetchDropdownDataNodal.pending, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: true,
          options: [],
          error: null,
        };
      })
      .addCase(fetchDropdownDataNodal.fulfilled, (state, action) => {
        const { fieldName, options } = action.payload;
        state.dropdownData[fieldName] = {
          loading: false,
          options,
          error: null,
        };
      })
      .addCase(fetchDropdownDataNodal.rejected, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: false,
          options: [],
          error: action.payload as string,
        };
      })
      // Fetch registration addresses cases
      .addCase(fetchRegistrationAddresses.pending, (state) => {
        state.registrationAddressesLoading = true;
      })
      .addCase(fetchRegistrationAddresses.fulfilled, (state, action) => {
        state.registrationAddressesLoading = false;
        state.registrationAddresses = action.payload;
      })
      .addCase(fetchRegistrationAddresses.rejected, (state) => {
        state.registrationAddressesLoading = false;
        state.registrationAddresses = null;
      });
  },
});

export const {
  clearStepDataNodal,
  setFormDataNodal,
  updateFieldValueNodal,
  clearDropdownDataNodal,
} = updateNodalOfficerSlice.actions;

// Selectors
export const selectNodalStepDataLoading = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.loading;

export const selectNodalFields = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.fields;

export const selectNodalGroupedFields = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.groupedFields;

export const selectNodalConfiguration = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.configuration;

export const selectNodalStepData = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.stepData;

export const selectNodalDocuments = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.documents;

// Note: Use selectFetchedDocuments from updateStepDataSlice for document data

export const selectNodalDropdownData = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.dropdownData;

export const selectNodalDropdownOptions =
  (fieldName: string) =>
  (state: { updateNodalOfficer: UpdateNodalOfficerState }) =>
    state.updateNodalOfficer.dropdownData[fieldName]?.options || [];

export const selectNodalDropdownLoading =
  (fieldName: string) =>
  (state: { updateNodalOfficer: UpdateNodalOfficerState }) =>
    state.updateNodalOfficer.dropdownData[fieldName]?.loading || false;

export const selectNodalDropdownError =
  (fieldName: string) =>
  (state: { updateNodalOfficer: UpdateNodalOfficerState }) =>
    state.updateNodalOfficer.dropdownData[fieldName]?.error || null;

export const selectRegistrationAddresses = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.registrationAddresses;

export const selectRegistrationAddressesLoading = (state: {
  updateNodalOfficer: UpdateNodalOfficerState;
}) => state.updateNodalOfficer.registrationAddressesLoading;

export default updateNodalOfficerSlice.reducer;
