import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  CreateRegionRequest,
  ModifyRegionRequest,
  CreateRegionErrorResponse,
  CreateRegionState,
  CreateRegionSuccess,
} from '../types/createRegion';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state for region creation
const initialState: CreateRegionState = {
  createLoading: false,
  createSuccess: false,
  createError: null,
  workflowId: null,
  createSuccessMessage: null,
  modifyLoading: false,
  modifySuccess: false,
  modifyError: null,
  modifyWorkflowId: null,
  modifySuccessMessage: null,
};

// Async thunk for creating a new region
export const createRegion = createAsyncThunk<
  CreateRegionSuccess,
  CreateRegionRequest,
  { rejectValue: string }
>(
  'createRegion/createRegion',
  async (regionData, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Creating region...'));
    try {
      const response = await Secured.post(
        API_ENDPOINTS.create_region,
        regionData
      );

      const data = response.data;

      console.log('Full response:', response);
      console.log('Response data:', data);
      console.log('Response status:', response.status);

      if (response.status === 200 && data.data) {
        dispatch(hideLoader());
        // Create the success object with workflow ID
        const successData = {
          workflowId: data.data,
          regionCode: regionData.regionCode,
          regionName: regionData.regionName,
          status: 'Pending Approval',
          message: 'Submitted for approval',
        };
        console.log('Returning success data:', successData);
        return successData;
      } else {
        dispatch(hideLoader());
        console.log('Entering error path - no data.data found');
        const errorMessage = data.message || 'Failed to create region';
        console.log('Error message:', errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: CreateRegionErrorResponse; status?: number };
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

            // Handle validation errors
            if (errorData.error?.message) {
              // Extract the validation message from the error
              const validationMatch = errorData.error.message.match(
                /default message \[(.*?)\](?!.*default message)/
              );
              if (validationMatch && validationMatch[1]) {
                return rejectWithValue(validationMatch[1]);
              }
              return rejectWithValue(errorData.error.message);
            }

            const errorMessage =
              errorData.data?.errorMessage ||
              errorData.message ||
              errorData.errorMessage ||
              'Failed to create region';
            return rejectWithValue(errorMessage);
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          // Handle validation errors
          if (errorData.error?.message) {
            // Extract the validation message from the error
            const validationMatch = errorData.error.message.match(
              /default message \[(.*?)\](?!.*default message)/
            );
            if (validationMatch && validationMatch[1]) {
              return rejectWithValue(validationMatch[1]);
            }
            return rejectWithValue(errorData.error.message);
          }

          const errorMessage =
            errorData.data?.errorMessage ||
            errorData.message ||
            errorData.errorMessage ||
            'Failed to create region';
          return rejectWithValue(errorMessage);
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for modifying an existing region
export const modifyRegion = createAsyncThunk<
  CreateRegionSuccess,
  { regionCode: string; regionData: ModifyRegionRequest },
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

      const data = response.data;

      if (response.status === 200 && data.data) {
        dispatch(hideLoader());
        // Create the success object with workflow ID
        const successData = {
          workflowId: data.data,
          regionCode: regionData.regionCode,
          regionName: regionData.regionName,
          status: 'Pending Approval',
          message: 'Submitted for approval',
        };
        return successData;
      } else {
        dispatch(hideLoader());
        const errorMessage = data.message || 'Failed to modify region';
        return rejectWithValue(errorMessage);
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      console.log('🚀 modifyRegion catch block - Full error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              error?: {
                status?: number;
                code?: string;
                type?: string;
                message?: string;
              };
              data?: CreateRegionErrorResponse['data'];
              message?: string;
            };
            status?: number;
          };
        };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;
        console.log('🚀 Axios error response (modify):', {
          status,
          errorData,
          nestedError: errorData?.error,
          fullResponse: axiosError.response,
        });

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          if (errorData) {
            console.log('🚀 Modify Region Error (400/401):', {
              status,
              errorData,
              nestedError: errorData.error,
              errorMessage: errorData.error?.message,
              errorDataString: JSON.stringify(errorData, null, 2),
            });
            // Extract error message from nested error structure
            const errorMessage =
              errorData.error?.message ||
              errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to modify region';
            console.log('🚀 Extracted modify error message:', errorMessage);
            return rejectWithValue(errorMessage);
          }
        }

        // Handle other errors
        if (errorData) {
          console.log('🚀 Modify Region Error (other):', {
            errorData,
            nestedError: errorData.error,
            errorMessage: errorData.error?.message,
          });
          // Extract error message from nested error structure
          const errorMessage =
            errorData.error?.message ||
            errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to modify region';
          console.log(
            '🚀 Extracted modify error message (other):',
            errorMessage
          );
          return rejectWithValue(errorMessage);
        }
      }
      console.log('🚀 Network error - returning generic message');
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create Region slice
const createRegionSlice = createSlice({
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
      state.workflowId = null;
      state.createSuccessMessage = null;
    },
    clearModifyError: (state) => {
      state.modifyError = null;
    },
    resetModifyState: (state) => {
      state.modifyLoading = false;
      state.modifySuccess = false;
      state.modifyError = null;
      state.modifyWorkflowId = null;
      state.modifySuccessMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create region cases
      .addCase(createRegion.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createRegion.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.workflowId = action.payload.workflowId;
        state.createSuccessMessage = action.payload.message || null;
        state.createError = null;
      })
      .addCase(createRegion.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError = action.payload || 'Failed to create region';
      })
      // Modify region cases
      .addCase(modifyRegion.pending, (state) => {
        state.modifyLoading = true;
        state.modifyError = null;
        state.modifySuccess = false;
      })
      .addCase(modifyRegion.fulfilled, (state, action) => {
        state.modifyLoading = false;
        state.modifySuccess = true;
        state.modifyWorkflowId = action.payload.workflowId;
        state.modifySuccessMessage = action.payload.message || null;
        state.modifyError = null;
      })
      .addCase(modifyRegion.rejected, (state, action) => {
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
} = createRegionSlice.actions;
export default createRegionSlice.reducer;
