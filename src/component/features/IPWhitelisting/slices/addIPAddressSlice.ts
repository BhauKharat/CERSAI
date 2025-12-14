/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from '../../../../utils/constants';
import { Secured } from '../../../../utils/HelperFunctions/api';

export interface AddIPAddressPayload {
  ipAddress: string;
  ipWhitelistedFor: string;
  validFrom: string;
  validTill: string;
}

export interface AddIPAddressResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface AddIPAddressState {
  loading: boolean;
  error: string | null;
  success: boolean;
  response: AddIPAddressResponse | null;
}

const initialState: AddIPAddressState = {
  loading: false,
  error: null,
  success: false,
  response: null,
};

export const addIPAddress = createAsyncThunk<
  AddIPAddressResponse,
  AddIPAddressPayload
>('ipWhitelisting/addIPAddress', async (payload, { rejectWithValue }) => {
  try {
    const response = await Secured.post(ENDPOINTS.IP_WHITELISTING, payload);

    console.log('Add IP Address API Response:', response.data);

    // Check if request was successfully submitted for approval
    const message = response.data.message || '';
    const isSubmittedForApproval =
      message.toLowerCase().includes('submitted for approval') ||
      message.toLowerCase().includes('workflow id');

    // Treat "submitted for approval" as a success case
    if (response.data.success || isSubmittedForApproval) {
      return {
        success: true,
        message: message,
        data: response.data.data,
      };
    } else {
      return rejectWithValue(
        response.data.message || 'Failed to add IP address'
      );
    }
  } catch (error: any) {
    console.error('Error in addIPAddress:', error);

    // Handle error response format: { error: { message: "..." } }
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Failed to add IP address';

    return rejectWithValue(errorMessage);
  }
});

const addIPAddressSlice = createSlice({
  name: 'addIPAddress',
  initialState,
  reducers: {
    clearAddIPAddressState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.response = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addIPAddress.pending, (state) => {
        console.log('addIPAddress.pending');
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        addIPAddress.fulfilled,
        (state, action: PayloadAction<AddIPAddressResponse>) => {
          console.log('addIPAddress.fulfilled - Payload:', action.payload);
          state.loading = false;
          state.success = true;
          state.response = action.payload;
          state.error = null;
        }
      )
      .addCase(addIPAddress.rejected, (state, action) => {
        console.error('addIPAddress.rejected:', {
          error: action.error,
          payload: action.payload,
          meta: action.meta,
        });
        state.loading = false;
        state.success = false;
        // Don't set state.error here - error is handled via popup in the component
      });
  },
});

export const { clearAddIPAddressState, clearError } = addIPAddressSlice.actions;

export default addIPAddressSlice.reducer;
