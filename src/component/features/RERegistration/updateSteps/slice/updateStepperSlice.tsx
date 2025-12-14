/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api';
import { RootState } from '../../../../../redux/store';
import {
  UpdateConfigApiResponse,
  initialState,
} from '../types/updateConfigTypes';
import { API_ENDPOINTS } from '../../../../../Constant';

// Async thunk to fetch update form configuration
export const fetchUpdateConfig = createAsyncThunk<
  UpdateConfigApiResponse,
  void,
  { rejectValue: string }
>('updateConfig/fetchUpdateConfig', async (_, { rejectWithValue }) => {
  try {
    const response = await Secured.get(API_ENDPOINTS.get_update_steps_data);
    return response.data as UpdateConfigApiResponse;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch update configuration';
    return rejectWithValue(errorMessage);
  }
});

// Update Config Slice
const updateConfigSlice = createSlice({
  name: 'updateConfig',
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
      // Fetch update configuration
      .addCase(fetchUpdateConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpdateConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { data } = action.payload;
        state.configuration = data;

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
      .addCase(fetchUpdateConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch update configuration';
      });
  },
});

// Export actions
export const { clearConfiguration, setError } = updateConfigSlice.actions;

// Selectors
export const selectUpdateConfigLoading = (state: RootState) =>
  state.updateConfig.loading;

export const selectUpdateConfigError = (state: RootState) =>
  state.updateConfig.error;

export const selectUpdateConfiguration = (state: RootState) =>
  state.updateConfig.configuration;

export const selectUpdateSteps = (state: RootState) => state.updateConfig.steps;

export const selectIsUpdateMultiStepEnabled = (state: RootState) =>
  state.updateConfig.configuration?.formSettings?.ismultisteps || false;

export const selectUpdateShowProgress = (state: RootState) =>
  state.updateConfig.configuration?.formSettings?.showProgress || false;

export const selectUpdateEnableCaptcha = (state: RootState) =>
  state.updateConfig.configuration?.formSettings?.enablecaptcha || false;

// Export reducer
export default updateConfigSlice.reducer;
