import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  ApprovedBranch,
  ApprovedBranchesErrorResponse,
  ApprovedBranchesState,
} from '../types/approvedBranchTypes';

// Initial state
const initialState: ApprovedBranchesState = {
  branches: [],
  loading: false,
  error: null,
};

// Async thunk for fetching approved branches
export const fetchApprovedBranches = createAsyncThunk<
  ApprovedBranch[],
  string,
  { rejectValue: string }
>(
  'approvedBranches/fetchApprovedBranches',
  async (regionName, { rejectWithValue }) => {
    try {
      console.log('Calling API for region:', regionName); // Debug log
      console.log('API URL:', API_ENDPOINTS.get_approved_branches(regionName)); // Debug log

      const response = await Secured.get(
        API_ENDPOINTS.get_approved_branches(regionName)
      );

      console.log('API Response:', response.data); // Debug log
      console.log('API Response type:', typeof response.data); // Debug log
      console.log('Is array?', Array.isArray(response.data)); // Debug log

      // Handle direct array response
      if (Array.isArray(response.data)) {
        console.log('Processing array response:', response.data); // Debug log
        return response.data as ApprovedBranch[];
      }

      // Handle wrapped response with success property
      if (response.data && typeof response.data === 'object') {
        const data = response.data as {
          success?: boolean;
          data?: ApprovedBranch[];
          message?: string;
        };
        console.log('Processing object response:', data); // Debug log

        if (data.success === true && Array.isArray(data.data)) {
          console.log(
            'Processing success response with data array:',
            data.data
          ); // Debug log
          return data.data as ApprovedBranch[];
        }

        if (data.success === false) {
          return rejectWithValue(
            data.message || 'Failed to fetch approved branches'
          );
        }
      }

      // Fallback: try to return response.data directly
      console.log('Fallback: returning response.data directly'); // Debug log
      return response.data as ApprovedBranch[];
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: ApprovedBranchesErrorResponse };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch approved branches'
          );
        }
      }
      return rejectWithValue(
        'Network error occurred while fetching approved branches'
      );
    }
  }
);

// Approved branches slice
const approvedBranchSlice = createSlice({
  name: 'approvedBranches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.branches = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
        state.error = null;
      })
      .addCase(fetchApprovedBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetState } = approvedBranchSlice.actions;
export default approvedBranchSlice.reducer;
