/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { RootState } from '../../../../redux/store';
import {
  RegistrationConfigApiResponse,
  //   RegistrationFormConfiguration,
  //   MultiStepForm,
  initialState,
} from '../types/registrationConfigTypes';
import { API_ENDPOINTS } from '../../../../Constant';

// Async thunk to fetch registration form configuration
export const fetchRegistrationConfig = createAsyncThunk<
  RegistrationConfigApiResponse,
  void,
  { rejectValue: string }
>(
  'registrationConfig/fetchRegistrationConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Secured.get(API_ENDPOINTS.get_steps_data);
      return response.data as RegistrationConfigApiResponse;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch registration configuration';
      return rejectWithValue(errorMessage);
    }
  }
);

// Registration Config Slice
const registrationConfigSlice = createSlice({
  name: 'registrationConfig',
  initialState,
  reducers: {
    // Clear configuration
    clearConfiguration: (state) => {
      state.configuration = null;
      state.steps = [];
      state.error = null;
    },

    // Set error manually if needed
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch registration configuration
      .addCase(fetchRegistrationConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegistrationConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { data } = action.payload;
        state.configuration = data;

        // Extract and sort multi-step forms
        if (
          data.formSettings?.ismultisteps &&
          data.formSettings?.multistepforms
        ) {
          state.steps = [...data.formSettings.multistepforms].sort(
            (a, b) => a.formorder - b.formorder
          );
        } else {
          state.steps = [];
        }
      })
      .addCase(fetchRegistrationConfig.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to fetch registration configuration';
      });
  },
});

// Export actions
export const { clearConfiguration, setError } = registrationConfigSlice.actions;

// Selectors
export const selectRegistrationConfigLoading = (state: RootState) =>
  state.registrationConfig.loading;

export const selectRegistrationConfigError = (state: RootState) =>
  state.registrationConfig.error;

export const selectRegistrationConfiguration = (state: RootState) =>
  state.registrationConfig.configuration;

export const selectRegistrationSteps = (state: RootState) =>
  state.registrationConfig.steps;

export const selectIsMultiStepEnabled = (state: RootState) =>
  state.registrationConfig.configuration?.formSettings?.ismultisteps || false;

export const selectShowProgress = (state: RootState) =>
  state.registrationConfig.configuration?.formSettings?.showProgress || false;

export const selectEnableCaptcha = (state: RootState) =>
  state.registrationConfig.configuration?.formSettings?.enablecaptcha || false;

// Export reducer
export default registrationConfigSlice.reducer;
