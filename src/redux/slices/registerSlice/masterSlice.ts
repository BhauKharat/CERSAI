/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from 'Constant';

// Async thunk for fetching dropdown masters
export const fetchDropdownMasters = createAsyncThunk<
  any, // Return type for successful case
  void, // Argument type (you're using _)
  {
    rejectValue: string; // This tells TypeScript that rejectWithValue returns a string
  }
>('masters/fetchDropdownMasters', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.MASTERS);
    if (!response.ok) {
      throw new Error('Failed to fetch dropdown masters');
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Async thunk for fetching countries
export const fetchCountriesGeography = createAsyncThunk<
  any,
  void,
  {
    rejectValue: string;
  }
>('masters/fetchCountries', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.GEO_COUNTRIES);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});
export const fetchGeographyHierarchy = createAsyncThunk<
  any,
  void,
  {
    rejectValue: string;
  }
>('masters/fetchGeographyHierarchy', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(API_ENDPOINTS.CONTRIES);
    if (!response.ok) {
      throw new Error('Failed to fetch geography hierarchy');
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

interface MastersState {
  regulators: any[];
  institutionTypes: any[];
  constitutions: any[];
  titles: any[];
  genders: any[];
  citizenships: any[];
  proofOfIdentities: any[];
  fetchcountries: any[];
  geographyHierarchy: any[]; // New field for geography data
  loading: boolean;
  error: string | null;
}

const initialState: MastersState = {
  regulators: [],
  institutionTypes: [],
  constitutions: [],
  titles: [],
  genders: [],
  citizenships: [],
  proofOfIdentities: [],
  fetchcountries: [],
  geographyHierarchy: [], // Initialize geography hierarchy
  loading: false,
  error: null,
};

const mastersSlice = createSlice({
  name: 'masters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDropdownMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDropdownMasters.fulfilled, (state, action) => {
        state.loading = false;
        // Regulators is a flat array with code, name, status
        state.regulators = action.payload.regulators || [];

        // InstitutionTypes has nested structure - extract types from each regulator
        state.institutionTypes = action.payload.institutiontypes || [];

        // Constitutions has nested structure - extract types array
        state.constitutions = action.payload.constitutions?.[0]?.types || [];

        // Titles has nested structure - extract types array
        state.titles = action.payload.titles?.[0]?.types || [];

        // Genders has nested structure - extract types array
        state.genders = action.payload.genders?.[0]?.types || [];

        // Citizenship is a flat array with code and name
        state.citizenships = action.payload.citizenship || [];

        // ProofOfIdentities has nested structure - extract types array
        state.proofOfIdentities =
          action.payload.proofofidentities?.[0]?.types || [];
      })
      .addCase(fetchDropdownMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Countries fetch cases
      .addCase(fetchCountriesGeography.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountriesGeography.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchcountries = action.payload || [];
      })
      .addCase(fetchCountriesGeography.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // Geography hierarchy fetch cases
      .addCase(fetchGeographyHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeographyHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.geographyHierarchy = action.payload || [];
      })
      .addCase(fetchGeographyHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });
  },
});

export const { clearError } = mastersSlice.actions;
export default mastersSlice.reducer;
