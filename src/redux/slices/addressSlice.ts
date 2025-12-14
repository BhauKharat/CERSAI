// addressSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from 'Constant';

export interface Address {
  id?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  countryCode?: string;
  countryName?: string;
  state?: string;
  district?: string;
  cityTown?: string;
  pinCode?: string;
  alternatePinCode?: string;
}

interface AddressState {
  isLoading: boolean;
  registeredAddress: Address;
  correspondenceAddress: Address;
  sameAsRegistrationAddress: boolean;
  error: string | null;
}

const initialState: AddressState = {
  isLoading: false,
  registeredAddress: { countryCode: '+91' },
  correspondenceAddress: { countryCode: '+91' },
  sameAsRegistrationAddress: false,
  error: null,
};

// Async thunk for fetching address
export const fetchEntityProfile = createAsyncThunk(
  'address/fetchEntityProfile',
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.update_address_get_report_entity,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address details');
      }

      const data = await response.json();
      return data.data; // API wraps in "data"
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch address';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for updating address
export const updateEntityProfile = createAsyncThunk(
  'address/updateEntityProfile',
  async (
    payload: {
      token: string;
      registeredAddress: Address;
      sameAsRegistrationAddress: boolean;
      correspondenceAddress?: Address;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.update_address_put_report_entity,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.token}`,
          },
          body: JSON.stringify({
            registeredAddress: payload.registeredAddress,
            sameAsRegistrationAddress: payload.sameAsRegistrationAddress,
            ...(payload.correspondenceAddress && {
              correspondanceAddress: payload.correspondenceAddress,
            }),
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || 'Failed to update address');
      }

      return responseData.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update address';
      return rejectWithValue(errorMessage);
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setRegisteredAddress: (state, action: PayloadAction<Address>) => {
      state.registeredAddress = {
        ...state.registeredAddress,
        ...action.payload,
      };
    },
    setCorrespondenceAddress: (state, action: PayloadAction<Address>) => {
      state.correspondenceAddress = {
        ...state.correspondenceAddress,
        ...action.payload,
      };
    },
    setSameAsRegistrationAddress: (state, action: PayloadAction<boolean>) => {
      state.sameAsRegistrationAddress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchEntityProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEntityProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registeredAddress = action.payload.registeredAddress || {};
        state.correspondenceAddress =
          action.payload.correspondanceAddress || {};
        state.sameAsRegistrationAddress =
          action.payload.correspondenceAddressSameAsRegisteredAddress || false;
      })
      .addCase(fetchEntityProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateEntityProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEntityProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registeredAddress = action.payload.registeredAddress || {};
        state.correspondenceAddress =
          action.payload.correspondanceAddress || {};
        state.sameAsRegistrationAddress =
          action.payload.correspondenceAddressSameAsRegisteredAddress || false;
      })
      .addCase(updateEntityProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setRegisteredAddress,
  setCorrespondenceAddress,
  setSameAsRegistrationAddress,
  clearError,
} = addressSlice.actions;

export default addressSlice.reducer;
