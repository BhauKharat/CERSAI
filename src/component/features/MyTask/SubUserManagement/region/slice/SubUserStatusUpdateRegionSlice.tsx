import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  SubUserCreateRegionErrorResponse,
  SubUserCreateRegionState,
  SubUserCreateRegionSuccessResponse,
  SubUserModifyRegionRequest,
} from '../types/SubUserCreateRegion';
import { StatusSubUserRegionType } from '../types/SubUserSingleRegion';

// Helper type for error response with nested error object
interface ErrorResponseWithNestedError {
  error?: {
    message?: string;
    status?: number;
    code?: string;
    type?: string;
  };
  data?: {
    errorMessage?: string;
  };
  message?: string;
}

// Helper function to extract error message from various error response formats
const extractErrorMessage = (
  errorData: SubUserCreateRegionErrorResponse | ErrorResponseWithNestedError,
  fallback: string
): string => {
  const data = errorData as ErrorResponseWithNestedError;
  return (
    data.error?.message || data.data?.errorMessage || data.message || fallback
  );
};

// Initial state for region creation
const initialState: SubUserCreateRegionState = {
  createLoading: false,
  createSuccess: false,
  createError: null,
  reportingEntity: null,
  modifyLoading: false,
  modifySuccess: false,
  modifyError: null,
  modifyReportingEntity: null,
};

// Async thunk for modifying an existing region
export const StatusSubUserRegion = createAsyncThunk<
  SubUserCreateRegionSuccessResponse,
  {
    regionCode: string;
    regionData: StatusSubUserRegionType;
    statusType: string;
    userId: string;
  },
  { rejectValue: string }
>(
  'createRegion/modifyRegion',
  async (
    { regionCode, regionData, statusType, userId },
    { rejectWithValue, dispatch }
  ) => {
    console.log('StatusSubUserRegion called with:', {
      regionCode,
      statusType,
      userId,
    });
    dispatch(
      showLoader(statusType === 'approve' ? 'Approving...' : 'Rejecting...')
    );
    try {
      const endpoint =
        statusType === 'approve'
          ? API_ENDPOINTS.approve_region_workflow(regionCode, userId)
          : API_ENDPOINTS.reject_region_workflow(regionCode, userId);

      console.log('API Endpoint:', endpoint);

      const response = await Secured.post(endpoint, {
        remark:
          regionData.reason ||
          (statusType === 'approve'
            ? 'Approved after verification of all details'
            : 'Rejected'),
      });

      const data = response.data;
      console.log('data;====', data);
      dispatch(hideLoader());

      // Return success data in the expected format
      return {
        success: true,
        message: data?.message || 'Operation completed successfully',
        data: data?.data || data,
      } as SubUserCreateRegionSuccessResponse;
    } catch (error: unknown) {
      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: SubUserCreateRegionErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response?.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            return rejectWithValue(
              extractErrorMessage(errorData, 'Failed to modify region')
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            extractErrorMessage(errorData, 'Failed to modify region')
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for modifying an existing region
export const modifySubUserRegion = createAsyncThunk<
  SubUserCreateRegionSuccessResponse,
  { regionCode: string; regionData: SubUserModifyRegionRequest },
  { rejectValue: string }
>(
  'createRegion/modifyRegion',
  async ({ regionCode, regionData }, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Modifying region...'));
    try {
      const response = await Secured.put(
        `${API_ENDPOINTS.create_region}/${regionCode}`,
        regionData
      );

      const data = response.data as
        | SubUserCreateRegionSuccessResponse
        | SubUserCreateRegionErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.data?.errorMessage || data.message || 'Failed to modify region'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: SubUserCreateRegionErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response?.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          if (axiosError.response?.data) {
            const errorData = axiosError.response.data;
            return rejectWithValue(
              extractErrorMessage(errorData, 'Failed to modify region')
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            extractErrorMessage(errorData, 'Failed to modify region')
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create Region slice
const SubUserStatusUpdateRegionSlice = createSlice({
  name: 'createRegion',
  initialState,
  reducers: {
    clearCreateError: (state) => {
      state.createError = null;
    },
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createSuccess = false;
      state.createError = null;
      state.reportingEntity = null;
    },
    clearModifyError: (state) => {
      state.modifyError = null;
    },
    resetModifyState: (state) => {
      state.modifyLoading = false;
      state.modifySuccess = false;
      state.modifyError = null;
      state.modifyReportingEntity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create region cases
      .addCase(StatusSubUserRegion.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(StatusSubUserRegion.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.reportingEntity = action?.payload?.data?.reportingEntity || null;
        state.createError = null;
      })
      .addCase(StatusSubUserRegion.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError =
          (action.payload as string) || 'Failed to create region';
      })
      // Modify region cases
      .addCase(modifySubUserRegion.pending, (state) => {
        state.modifyLoading = true;
        state.modifyError = null;
        state.modifySuccess = false;
      })
      .addCase(modifySubUserRegion.fulfilled, (state, action) => {
        state.modifyLoading = false;
        state.modifySuccess = true;
        state.modifyReportingEntity =
          action?.payload?.data?.reportingEntity || null;
        state.modifyError = null;
      })
      .addCase(modifySubUserRegion.rejected, (state, action) => {
        state.modifyLoading = false;
        state.modifySuccess = false;
        state.modifyError = action.payload || 'Failed to modify region';
      });
  },
});

export const {
  clearCreateError,
  resetCreateState,
  clearModifyError,
  resetModifyState,
} = SubUserStatusUpdateRegionSlice.actions;
export default SubUserStatusUpdateRegionSlice.reducer;
