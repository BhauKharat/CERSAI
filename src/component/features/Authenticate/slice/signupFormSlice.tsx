import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  FormFieldsResponse,
  DynamicFormValues,
  FormField,
  FormConfiguration,
} from '../types/formTypes';

// Define types specific to signup slice
export interface SignupFieldError {
  field: string;
  message: string;
}

export interface SignupFormState {
  fields: FormField[];
  groupedFields: FormField[][];
  configuration: FormConfiguration | null;
  formValues: DynamicFormValues;
  fieldErrors: SignupFieldError[];
  loading: boolean;
  error: string | null;
  isCkycVerified: boolean;
  useDynamicForm: boolean;
}

// Initial state
const initialState: SignupFormState = {
  fields: [],
  groupedFields: [],
  configuration: null,
  formValues: {
    citizenship: '',
    ckycNumber: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    countryCode: '',
    mobileNumber: '',
    mobile: '',
  },
  fieldErrors: [],
  loading: false,
  error: null,
  isCkycVerified: false,
  useDynamicForm: true,
};

// Async thunk to fetch signup form fields
export const fetchSignupFormFields = createAsyncThunk(
  'signupForm/fetchFields',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(
        API_ENDPOINTS.get_signup_form_fields + '?is_group=true'
      );
      return response.data as FormFieldsResponse;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || 'Failed to fetch signup form fields'
          : 'Failed to fetch signup form fields';
      return rejectWithValue(errorMessage);
    }
  }
);

// Signup Form Slice
const signupFormSlice = createSlice({
  name: 'signupForm',
  initialState,
  reducers: {
    // Update form value
    updateFormValue: (
      state,
      action: PayloadAction<{
        fieldName: string;
        value: string | number | boolean;
      }>
    ) => {
      state.formValues[action.payload.fieldName] = action.payload.value;
    },

    // Update multiple form values (for CKYC autofill)
    updateMultipleFormValues: (
      state,
      action: PayloadAction<Partial<DynamicFormValues>>
    ) => {
      Object.assign(state.formValues, action.payload);
    },

    // Set field error
    setFieldError: (state, action: PayloadAction<SignupFieldError>) => {
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

    // Clear all field errors
    clearAllFieldErrors: (state) => {
      state.fieldErrors = [];
    },

    // Set CKYC verification status
    setCkycVerified: (state, action: PayloadAction<boolean>) => {
      state.isCkycVerified = action.payload;
    },

    // Toggle dynamic form usage
    setUseDynamicForm: (state, action: PayloadAction<boolean>) => {
      state.useDynamicForm = action.payload;
    },

    // Clear form data
    clearForm: (state) => {
      state.formValues = {
        citizenship: '',
        ckycNumber: '',
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        countryCode: '',
        mobileNumber: '',
        mobile: '',
      };
      state.fieldErrors = [];
      state.isCkycVerified = false;
    },

    // Reset specific fields (for citizenship change)
    resetFieldsOnCitizenshipChange: (state) => {
      state.formValues.ckycNumber = '';
      state.formValues.title = '';
      state.formValues.firstName = '';
      state.formValues.middleName = '';
      state.formValues.lastName = '';
      state.formValues.email = '';
      state.formValues.mobileNumber = '';
      state.formValues.mobile = '';
      state.fieldErrors = [];
      state.isCkycVerified = false;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch signup form fields
    builder
      .addCase(fetchSignupFormFields.pending, (state) => {
        console.log('API Call: Starting to fetch signup form fields...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSignupFormFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields = action.payload.data.fields;
        state.groupedFields = action.payload.data.grouped_fields;
        state.configuration = action.payload.data.configuration;
        state.error = null;
        console.log('API Response:', action.payload);
      })
      .addCase(fetchSignupFormFields.rejected, (state, action) => {
        console.log(
          'API Call: Failed to fetch signup form fields',
          action.payload
        );
        state.loading = false;
        state.error = action.payload as string;
        // Fallback to static form on error
        state.useDynamicForm = false;
      });
  },
});

// Export actions
export const {
  updateFormValue,
  updateMultipleFormValues,
  setFieldError,
  clearFieldError,
  clearAllFieldErrors,
  setCkycVerified,
  setUseDynamicForm,
  clearForm,
  resetFieldsOnCitizenshipChange,
  setLoading,
  setError,
} = signupFormSlice.actions;

// Export reducer
export default signupFormSlice.reducer;
