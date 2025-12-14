// redux/slices/addressSlice.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../utils/HelperFunctions/api';
import { AuthState } from '../../../redux/types/register/authSliceTypes';
import { API_ENDPOINTS } from 'Constant';

interface Address {
  line1?: string;
  line2?: string;
  line3?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pinCode?: string;
  alternatePinCode?: string;
  countryCode?: string;
  countryName?: string;
}

interface AddressState {
  registeredAddress: Address;
  correspondenceAddress: Address;
  sameAsRegistrationAddress: boolean | undefined;
  loading: boolean;
  error: string | null;
  success: boolean;
  fieldErrors: Record<string, string>; // <-- key-value for each field
}

// Initial state
const initialState: AddressState = {
  registeredAddress: {},
  correspondenceAddress: {},
  sameAsRegistrationAddress: undefined,
  loading: false,
  error: null,
  success: false,
  fieldErrors: {},
};

// ✅ Thunk with inline API call
export const submitAddressThunk = createAsyncThunk<
  unknown,
  { data: unknown },
  {
    state: { auth: AuthState };
    rejectValue: Array<{ field: string; issue: string }> | string;
  }
>(
  'address/submitAddressThunk',
  async ({ data }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      const appId = state.auth.reinitializeData?.applicationId;

      if (!token) {
        return rejectWithValue('Authentication token not found.');
      }

      if (!appId) {
        return rejectWithValue('Application ID not found.');
      }

      const response = await Secured.post(
        API_ENDPOINTS.SUBMIT_ADDRESS(appId),
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (err: any) {
      // Check if the error response contains field validation errors
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        // Return field errors array
        return rejectWithValue(err.response.data.errors);
      }

      // Check for other common error formats
      if (
        err.response?.data?.fieldErrors &&
        Array.isArray(err.response.data.fieldErrors)
      ) {
        return rejectWithValue(err.response.data.fieldErrors);
      }

      // Fallback to general error message
      return rejectWithValue(
        err.response?.data?.message || 'Submission failed'
      );
    }
  }
);

// Slice
const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setRegisteredAddress(state, action: PayloadAction<Address>) {
      state.registeredAddress = {
        ...state.registeredAddress,
        ...action.payload, // ✅ merge field updates
      };
    },
    setCorrespondenceAddress(state, action: PayloadAction<Address>) {
      state.correspondenceAddress = action.payload;
    },
    setSameAsRegistrationAddress(state, action: PayloadAction<boolean>) {
      state.sameAsRegistrationAddress = action.payload;
    },
    setFullAddressData(state, action: PayloadAction<Partial<AddressState>>) {
      return {
        ...state,
        ...action.payload,
      };
    },

    resetAddressState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitAddressThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.fieldErrors = {}; // Reset before setting new errors
        state.error = null; // Clear general error

        // Check if payload is an array of field errors
        if (Array.isArray(action.payload)) {
          action.payload.forEach((err: { field: string; issue: string }) => {
            state.fieldErrors[err.field] = err.issue;
          });
        } else {
          // Handle general error message
          state.error = action.payload || 'Submission failed';
        }
      });
  },
});

// Export actions and reducer
export const {
  setRegisteredAddress,
  setCorrespondenceAddress,
  setSameAsRegistrationAddress,
  setFullAddressData,
  resetAddressState,
} = addressSlice.actions;

export default addressSlice.reducer;
