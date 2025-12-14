/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ApplicationDetails,
  ApplicationDetailsResponse,
} from '../types/applicationPreviewTypes';
import { get } from '../../../../services/CKYCAdmin/api'; // Adjust path as needed
import { ENDPOINTS } from '../../../../utils/constants';
import { CMS_URL } from 'Constant';

interface ApplicationDetailsState {
  data: ApplicationDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationDetailsState = {
  data: null,
  loading: false,
  error: null,
};
interface ValidationRules {
  required?: boolean;
  requiredMessage?: string;
  maxLength?: string;
  maxLengthMessage?: string;
  regx?: string;
  regxMessage?: string;
}

interface FieldOption {
  code: string;
  name: string;
  status: string;
}

interface Field {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  fieldPlaceholder?: string;
  fieldOptions: FieldOption[];
  validationRules: ValidationRules;
  fieldOrder: number;
  fieldWidth: string;
}

interface GroupedField {
  label: string;
  fields: Field[];
}

interface FieldsResponse {
  status: boolean;
  message: string;
  data: {
    fields: Field[];
    groupedFields: Record<string, GroupedField>;
  };
}

export const fetchApplicationDetails = createAsyncThunk<
  ApplicationDetails,
  string, // acknowledgementNo is now required
  { rejectValue: string }
>(
  'applicationDetails/fetch',
  async (acknowledgementNo, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getApplicationDetails(acknowledgementNo);
      const response = await get<ApplicationDetailsResponse>(url);
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch application details'
        );
      }
      return response.data.data; // Return the nested data property of type ApplicationDetails
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch application details'
      );
    }
  }
);
export const fetchApplicationDetailsAdmin = createAsyncThunk<
  ApplicationDetails,
  { workFlowId: string; userId: string }, // acknowledgementNo is now required
  { rejectValue: string }
>(
  'applicationDetails/fetchAdmin',
  async ({ workFlowId, userId }, { rejectWithValue }) => {
    try {
      const url = ENDPOINTS.getApplicationDetailsadmin(workFlowId, userId);
      const response = await get<ApplicationDetailsResponse>(url);
      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || 'Failed to fetch application details'
        );
      }
      return response.data.data; // Return the nested data property of type ApplicationDetails
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch application details'
      );
    }
  }
);

export const fetchFields = createAsyncThunk<
  FieldsResponse['data'], // The return type (we only care about data part)
  void, // No argument required
  { rejectValue: string }
>('formFields/fetchFields', async (_, { rejectWithValue }) => {
  try {
    const url = `${CMS_URL}/api/forms/RE_trackStatus/fields?is_group=true`;
    const response = await get<FieldsResponse>(url);

    if (!response.data.status) {
      return rejectWithValue(
        response.data.message || 'Failed to fetch form fields'
      );
    }

    return response.data.data; // return only data (fields + groupedFields)
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch form fields');
  }
});

// Fetch User Profile Fields (RE_nodal form)
export const fetchUserProfileFields = createAsyncThunk<
  FieldsResponse['data'],
  void,
  { rejectValue: string }
>('formFields/fetchUserProfileFields', async (_, { rejectWithValue }) => {
  try {
    const url = `${CMS_URL}/api/forms/RE_nodal/fields?is_group=true`;
    const response = await get<FieldsResponse>(url);

    if (!response.data.status) {
      return rejectWithValue(
        response.data.message || 'Failed to fetch user profile fields'
      );
    }

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.message || 'Failed to fetch user profile fields'
    );
  }
});

const applicationDetailsSlice = createSlice({
  name: 'applicationDetails',
  initialState,
  reducers: {
    clearApplicationDetail: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // -------------------------
    // Application Details Thunks
    // -------------------------
    builder
      .addCase(fetchApplicationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchApplicationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });

    // -------------------------
    // Form Fields Thunk
    // -------------------------
    builder
      .addCase(fetchFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.loading = false;
        // You can either store fields separately or reuse `data`
        state.data = action.payload as any;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch fields';
      });

    // -------------------------
    // User Profile Fields Thunk (RE_nodal)
    // -------------------------
    builder
      .addCase(fetchUserProfileFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileFields.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload as any;
      })
      .addCase(fetchUserProfileFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch user profile fields';
      });
  },
});

export const { clearApplicationDetail } = applicationDetailsSlice.actions;
export default applicationDetailsSlice.reducer;
