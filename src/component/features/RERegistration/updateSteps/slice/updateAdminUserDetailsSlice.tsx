/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS, CMS_URL } from 'Constant';
import {
  FormField,
  FieldAttributes as FormFieldAttributes,
} from '../types/formTypesUpdate';

// Interface for Admin User step data
interface AdminUserStepData {
  // Admin 1 fields
  iauCitizenship1: string;
  iauCkycNumber1: string;
  iauTitle1: string;
  iauFirstName1: string;
  iauMiddleName1: string;
  iauLastName1: string;
  iauFatherTitle1: string;
  iauFatherFirstName1: string;
  iauFatherMiddleName1: string;
  iauFatherLastName1: string;
  iauMotherTitle1: string;
  iauMotherFirstName1: string;
  iauMotherMiddleName1: string;
  iauMotherLastName1: string;
  iauSpouseTitle1: string;
  iauSpouseFirstName1: string;
  iauSpouseMiddleName1: string;
  iauSpouseLastName1: string;
  iauGender1: string;
  iauMaritalStatus1: string;
  iauOccupationType1: string;
  iauDob1: string;
  iauMobileNumber1: string;
  iauEmailId1: string;
  iauTelephoneNumber1: string;
  iauPan1: string;
  iauAadhaar1: string;
  iauPassportNumber1: string;
  iauVoterId1: string;
  iauDrivingLicense1: string;
  iauNrega1: string;
  iauLine11: string;
  iauLine21: string;
  iauLine31: string;
  iauCountry1: string;
  iauState1: string;
  iauDistrict1: string;
  iauCity1: string;
  iauPincode1: string;
  iauDigipin1: string;
  // Admin 2 fields
  iauCitizenship2: string;
  iauCkycNumber2: string;
  iauTitle2: string;
  iauFirstName2: string;
  iauMiddleName2: string;
  iauLastName2: string;
  iauFatherTitle2: string;
  iauFatherFirstName2: string;
  iauFatherMiddleName2: string;
  iauFatherLastName2: string;
  iauMotherTitle2: string;
  iauMotherFirstName2: string;
  iauMotherMiddleName2: string;
  iauMotherLastName2: string;
  iauSpouseTitle2: string;
  iauSpouseFirstName2: string;
  iauSpouseMiddleName2: string;
  iauSpouseLastName2: string;
  iauGender2: string;
  iauMaritalStatus2: string;
  iauOccupationType2: string;
  iauDob2: string;
  iauMobileNumber2: string;
  iauEmailId2: string;
  iauTelephoneNumber2: string;
  iauPan2: string;
  iauAadhaar2: string;
  iauPassportNumber2: string;
  iauVoterId2: string;
  iauDrivingLicense2: string;
  iauNrega2: string;
  iauLine12: string;
  iauLine22: string;
  iauLine32: string;
  iauCountry2: string;
  iauState2: string;
  iauDistrict2: string;
  iauCity2: string;
  iauPincode2: string;
  iauDigipin2: string;
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

interface UpdateAdminUserDetailsState {
  stepData: AdminUserStepData | null;
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

const initialState: UpdateAdminUserDetailsState = {
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

// Fetch step data for admin user details
export const fetchStepDataAdminUser = createAsyncThunk(
  'updateAdminUserDetailsSlice/fetchStepData',
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

      // Transform documents object into array format
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
      console.error('❌ Error fetching Admin User step data:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch form fields for admin user details
export const fetchFormFieldsAdminUser = createAsyncThunk(
  'updateAdminUserDetailsSlice/fetchFormFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.update_admin_user_form_fields
      );
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
      console.error('❌ Error fetching admin user form fields:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch dropdown data for cascading dropdowns
export const fetchDropdownDataAdminUser = createAsyncThunk(
  'updateAdminUserDetailsSlice/fetchDropdownData',
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
      //    const dynamicUrl = url.replace(`{${urlParam}}`, paramValue);
      let dynamicUrl = url.replace(`{${urlParam}}`, paramValue);

      // Prepend CMS_URL if the URL is relative
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
      console.error(`❌ Error fetching dropdown data for ${fieldName}:`, error);
      return rejectWithValue({
        fieldName,
        error: error.response?.data || error.message,
      });
    }
  }
);

const updateAdminUserDetailsSlice = createSlice({
  name: 'updateAdminUserDetailsSlice',
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
    clearDropdownData: (state, action: PayloadAction<string>) => {
      delete state.dropdownData[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch step data cases
      .addCase(fetchStepDataAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepDataAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.stepData = action.payload.stepData;
        state.documents = action.payload.documents;
        state.error = null;
      })
      .addCase(fetchStepDataAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch form fields cases
      .addCase(fetchFormFieldsAdminUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormFieldsAdminUser.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.fields;
        state.groupedFields = action.payload.groupedFields;
        state.configuration = action.payload.configuration;
        state.formType = action.payload.formType;
        state.error = null;
      })
      .addCase(fetchFormFieldsAdminUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Dropdown data cases
      .addCase(fetchDropdownDataAdminUser.pending, (state, action) => {
        const { fieldName } = action.meta.arg;
        state.dropdownData[fieldName] = {
          loading: true,
          options: [],
          error: null,
        };
      })
      .addCase(fetchDropdownDataAdminUser.fulfilled, (state, action) => {
        const { fieldName, options } = action.payload;
        state.dropdownData[fieldName] = {
          loading: false,
          options,
          error: null,
        };
      })
      .addCase(fetchDropdownDataAdminUser.rejected, (state, action) => {
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
  clearDropdownData,
} = updateAdminUserDetailsSlice.actions;

// Selectors
export const selectStepDataLoading = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.loading;

export const selectGroupedFields = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.groupedFields;

export const selectFields = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.fields;

export const selectConfiguration = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.configuration;

export const selectStepData = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.stepData;

export const selectDocuments = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.documents;

export const selectDropdownData = (state: {
  updateAdminUserDetailsSlice: UpdateAdminUserDetailsState;
}) => state.updateAdminUserDetailsSlice.dropdownData;

export const selectDropdownOptions =
  (fieldName: string) =>
  (state: { updateAdminUserDetailsSlice: UpdateAdminUserDetailsState }) =>
    state.updateAdminUserDetailsSlice.dropdownData[fieldName]?.options || [];

export const selectDropdownLoading =
  (fieldName: string) =>
  (state: { updateAdminUserDetailsSlice: UpdateAdminUserDetailsState }) =>
    state.updateAdminUserDetailsSlice.dropdownData[fieldName]?.loading || false;

export const selectDropdownError =
  (fieldName: string) =>
  (state: { updateAdminUserDetailsSlice: UpdateAdminUserDetailsState }) =>
    state.updateAdminUserDetailsSlice.dropdownData[fieldName]?.error || null;

export default updateAdminUserDetailsSlice.reducer;
