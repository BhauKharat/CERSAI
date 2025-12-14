import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface CersaiAddressData {
  line1: string;
  line2: string;
  line3: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  pincodeInCaseOfOthers: string;
  digiPin: string;
}

interface CersaiAddressState {
  data: CersaiAddressData | null;
  loading: boolean;
  error: string | null;
}

const initialState: CersaiAddressState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk to fetch CERSAI address
export const fetchCersaiAddress = createAsyncThunk(
  'cersaiAddress/fetch',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { authToken: string } };
      const token = state?.auth?.authToken;

      const response = await fetch(
        'https://dev.ckycindia.dev/admin/api/v1/user/cersai-address',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch CERSAI address');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      return rejectWithValue(
        (error as Error).message || 'Failed to fetch CERSAI address'
      );
    }
  }
);

const cersaiAddressSlice = createSlice({
  name: 'cersaiAddress',
  initialState,
  reducers: {
    clearCersaiAddress: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCersaiAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCersaiAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchCersaiAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCersaiAddress } = cersaiAddressSlice.actions;
export default cersaiAddressSlice.reducer;
