import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../../../redux/store';
import { put } from '../../../../services/CKYCAdmin/api';
import { API_ENDPOINTS } from 'Constant';

/*
  Slice: blockIp
  Purpose: Handle Block IP status update API
*/

// -------------------- Types --------------------
export interface BlockIpParams {
  ipWhitelistingIds: string[];
  status: 'BLOCKED' | 'UNBLOCKED';
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BlockIpErrorData {
  existingRequestIds: string[];
}

export interface BlockIpState {
  loading: boolean;
  error: string | null;
  errorData: BlockIpErrorData | null;
  success: boolean;
}

// -------------------- Initial State --------------------
const initialState: BlockIpState = {
  loading: false,
  error: null,
  errorData: null,
  success: false,
};

// -------------------- Thunk --------------------
export interface BlockIpRejectValue {
  message: string;
  existingRequestIds?: string[];
}

export const blockIpStatusUpdate = createAsyncThunk<
  unknown,
  BlockIpParams,
  { state: RootState; rejectValue: BlockIpRejectValue }
>('blockIp/statusUpdate', async (params, thunkAPI) => {
  try {
    const url = API_ENDPOINTS.IP_WHITELISTING_STATUS_UPDATE;

    // Read token from state
    const token = (thunkAPI.getState() as RootState).auth?.authToken;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await put<ApiResponse<unknown>>(url, params, config);
    console.log('Response in blockIpStatusUpdate: ', response);

    // Validate response
    if (!response?.data) {
      return thunkAPI.rejectWithValue({ message: 'Unexpected API response' });
    }

    return response.data;
  } catch (err: unknown) {
    interface ErrorResponse {
      response?: {
        data?: {
          message?: string;
          data?: {
            existingRequestIds?: string[];
          };
        };
      };
      message?: string;
    }
    const error = err as ErrorResponse;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update IP status';
    const existingRequestIds = error?.response?.data?.data?.existingRequestIds;
    return thunkAPI.rejectWithValue({
      message: String(message),
      existingRequestIds,
    });
  }
});

// -------------------- Slice --------------------
const blockIpSlice = createSlice({
  name: 'blockIp',
  initialState,
  reducers: {
    resetBlockIpState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(blockIpStatusUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorData = null;
        state.success = false;
      })
      .addCase(blockIpStatusUpdate.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.errorData = null;
      })
      .addCase(blockIpStatusUpdate.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          action.payload?.message ??
          action.error?.message ??
          'Failed to update IP status';
        state.errorData = action.payload?.existingRequestIds
          ? { existingRequestIds: action.payload.existingRequestIds }
          : null;
      });
  },
});

// -------------------- Exports --------------------
export const { resetBlockIpState } = blockIpSlice.actions;

export const selectBlockIpState = (state: RootState) => state.blockIp;
export const selectBlockIpLoading = (state: RootState) => state.blockIp.loading;
export const selectBlockIpSuccess = (state: RootState) => state.blockIp.success;
export const selectBlockIpError = (state: RootState) => state.blockIp.error;
export const selectBlockIpErrorData = (state: RootState) =>
  state.blockIp.errorData;

export default blockIpSlice.reducer;
