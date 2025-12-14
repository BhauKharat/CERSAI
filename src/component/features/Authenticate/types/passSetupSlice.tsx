/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  PassSetupRequest,
  PassSetupResponse,
  PassSetupState,
} from './passSetupTypes';
import { Secured } from '../../../../utils/HelperFunctions/api';
import { API_ENDPOINTS } from 'Constant';
import { RootState } from '../../../../redux/store'; // adjust if needed

export const setupPasswordAndDSC = createAsyncThunk<
  PassSetupResponse,
  PassSetupRequest,
  { rejectValue: string; state: RootState }
>(
  'passSetup/setupPasswordAndDSC',
  async (requestData, { rejectWithValue, getState }) => {
    try {
      const token = getState().passSetupOtp.token;
      console.log(token);
      const response = await Secured.post(
        API_ENDPOINTS.post_password_dsc_setup,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        'Something went wrong. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: PassSetupState = {
  loading: false,
  error: null,
  success: false,
  message: '',
};

const passSetupSlice = createSlice({
  name: 'passSetup',
  initialState,
  reducers: {
    resetPassSetupState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    resetPassSetupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setupPasswordAndDSC.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = '';
      })
      .addCase(setupPasswordAndDSC.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(setupPasswordAndDSC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Setup failed';
        state.success = false;
      });
  },
});

export const { resetPassSetupState, resetPassSetupError } =
  passSetupSlice.actions;
export default passSetupSlice.reducer;
