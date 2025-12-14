import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  DeactivationStatsSuccessResponse,
  DeactivationStatsErrorResponse,
  DeactivationStatsState,
  DeactivateRegionSuccessResponse,
  DeactivateRegionErrorResponse,
} from '../types/deactivationStats';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state for deactivation stats
const initialState: DeactivationStatsState = {
  loading: false,
  success: false,
  error: null,
  data: null,
  deactivateLoading: false,
  deactivateSuccess: false,
  deactivateError: null,
  deactivateData: null,
  deactivateMessage: null,
};

// Interface for region branches API response
interface RegionBranch {
  branchName: string;
  branchCode: string;
  userCount: number;
}

interface RegionBranchesResponse {
  success: boolean;
  data: {
    associatedBranches: RegionBranch[];
    totalUser: number;
    totalBranchUsers: number;
    totalBranchesCount: number;
    regionUserCount: number;
  };
  message: string;
}

// Async thunk for fetching region branches and calculating stats
export const fetchRegionBranches = createAsyncThunk<
  DeactivationStatsSuccessResponse['data'],
  string,
  { rejectValue: string }
>(
  'deactivationStats/fetchRegionBranches',
  async (regionCode, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Loading branches...'));
    try {
      const response = await Secured.get<RegionBranchesResponse>(
        API_ENDPOINTS.get_region_branches(regionCode)
      );

      if (response.data.success && response.data.data) {
        const apiData = response.data.data;

        dispatch(hideLoader());

        // Use values directly from API response
        return {
          totalBranchesCount: apiData.totalBranchesCount || 0,
          totalUser: apiData.totalUser || 0,
          totalBranchUsers: apiData.totalBranchUsers || 0,
          regionUserCount: apiData.regionUserCount || 0,
          associatedBranches: apiData.associatedBranches || [],
          // Legacy fields for backward compatibility
          totalBranches: apiData.totalBranchesCount || 0,
          totalUsers: apiData.totalBranchUsers || 0,
          branchUserCount: apiData.totalBranchUsers || 0,
          branchUserCounts: (apiData.associatedBranches || []).map(
            (branch) => ({
              branchName: branch.branchName,
              userCount: branch.userCount || 0,
            })
          ),
        };
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          response.data.message || 'Failed to fetch region branches'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.message || 'Failed to fetch region branches'
          );
        }
        // Handle 404 Not Found
        if (axiosError.response?.status === 404) {
          return rejectWithValue('Region not found');
        }
        // Handle 401 Unauthorized
        if (axiosError.response?.status === 401) {
          return rejectWithValue(
            'Authorization token is missing or invalid or expired.'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for fetching region deactivation stats
export const fetchDeactivationStats = createAsyncThunk<
  DeactivationStatsSuccessResponse['data'],
  string,
  { rejectValue: string }
>(
  'deactivationStats/fetchDeactivationStats',
  async (regionCode, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Loading deactivation stats...'));
    try {
      const response = await Secured.get(
        `${API_ENDPOINTS.create_region}/${regionCode}/deactivation-stats`
      );

      const data = response.data as
        | DeactivationStatsSuccessResponse
        | DeactivationStatsErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage ||
            data.message ||
            'Failed to fetch deactivation stats'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: DeactivationStatsErrorResponse; status?: number };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch deactivation stats'
          );
        }
        // Handle 404 Not Found
        if (axiosError.response?.status === 404) {
          return rejectWithValue('Region not found');
        }
        // Handle 401 Unauthorized
        if (axiosError.response?.status === 401) {
          return rejectWithValue(
            'Authorization token is missing or invalid or expired.'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for deactivating a region
export const deactivateRegion = createAsyncThunk<
  {
    deactivateData: DeactivateRegionSuccessResponse['data'];
    message: string;
  },
  { regionCode: string; reason: string; remark: string; userId: string },
  { rejectValue: string }
>(
  'deactivationStats/deactivateRegion',
  async (
    { regionCode, reason, remark, userId },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Deactivating region...'));
    try {
      const response = await Secured.put(
        `${API_ENDPOINTS.create_region}/${regionCode}/deactivate`,
        { regionCode, reason, remark, userId }
      );

      const data = response.data as
        | DeactivateRegionSuccessResponse
        | DeactivateRegionErrorResponse;

      // Check if HTTP status is 200 - treat as success
      if (response.status === 200) {
        dispatch(hideLoader());
        // For success response, data.data is a string (workflowId)
        const workflowId =
          typeof (data as DeactivateRegionSuccessResponse).data === 'string'
            ? (data as DeactivateRegionSuccessResponse).data
            : '';
        return {
          deactivateData: workflowId,
          message: 'Submitted for approval',
        };
      } else {
        dispatch(hideLoader());
        // For error response, data.data is an object with errorMessage
        const errorData = data as DeactivateRegionErrorResponse;
        return rejectWithValue(
          (typeof errorData.data === 'object' &&
            errorData.data?.errorMessage) ||
            errorData.message ||
            'Failed to deactivate region'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: DeactivateRegionErrorResponse; status?: number };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          // Handle validation errors (500 status with error object)
          if (errorData.error?.message) {
            // Try to extract all validation messages from the error
            const validationMatches = errorData.error.message.matchAll(
              /default message \[(.*?)\]/g
            );
            const messages: string[] = [];

            for (const match of validationMatches) {
              if (match[1]) {
                messages.push(match[1]);
              }
            }

            // Return the last validation message (usually the most relevant)
            if (messages.length > 0) {
              return rejectWithValue(messages[messages.length - 1]);
            }

            // If no matches found, return the full error message
            return rejectWithValue(errorData.error.message);
          }

          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to deactivate region'
          );
        }
        // Handle 401 Unauthorized
        if (axiosError.response?.status === 401) {
          return rejectWithValue(
            'Authorization token is missing or invalid or expired.'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Deactivation Stats slice
const deactivationStatsSlice = createSlice({
  name: 'deactivationStats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
    clearDeactivateError: (state) => {
      state.deactivateError = null;
    },
    resetDeactivateState: (state) => {
      state.deactivateLoading = false;
      state.deactivateSuccess = false;
      state.deactivateError = null;
      state.deactivateData = null;
      state.deactivateMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch region branches cases
      .addCase(fetchRegionBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchRegionBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchRegionBranches.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) || 'Failed to fetch region branches';
      })
      // Fetch deactivation stats cases
      .addCase(fetchDeactivationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchDeactivationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDeactivationStats.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to fetch deactivation stats';
      })
      // Deactivate region cases
      .addCase(deactivateRegion.pending, (state) => {
        state.deactivateLoading = true;
        state.deactivateError = null;
        state.deactivateSuccess = false;
      })
      .addCase(deactivateRegion.fulfilled, (state, action) => {
        state.deactivateLoading = false;
        state.deactivateSuccess = true;
        state.deactivateData = action.payload.deactivateData;
        state.deactivateMessage = action.payload.message;
        state.deactivateError = null;
      })
      .addCase(deactivateRegion.rejected, (state, action) => {
        state.deactivateLoading = false;
        state.deactivateSuccess = false;
        state.deactivateError = action.payload || 'Failed to deactivate region';
        state.deactivateData = null;
        state.deactivateMessage = null;
      });
  },
});

export const {
  clearError,
  resetState,
  clearDeactivateError,
  resetDeactivateState,
} = deactivationStatsSlice.actions;
export default deactivationStatsSlice.reducer;
