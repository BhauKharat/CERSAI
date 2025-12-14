import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  SingleRegionState,
  SingleRegionData,
  SingleRegionErrorResponse,
} from '../types/singleRegion';

// API Response type (actual API structure)
interface ApiRegionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    regionName: string;
    regionCode: string;
    address: {
      line1: string;
      line2: string;
      line3: string;
      city: string;
      state: string;
      district: string;
      countryCode: string;
      pinCode: string;
      digiPin?: string;
      alternatePinCode?: string;
    };
    status: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Async thunk for fetching single region by code
export const fetchRegionByCode = createAsyncThunk(
  'singleRegion/fetchRegionByCode',
  async (regionCode: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching region details...'));

      const response = await Secured.get(
        API_ENDPOINTS.get_region_by_code(regionCode)
      );

      // Handle the response data structure
      const responseData = response.data as ApiRegionResponse;

      // Transform API response to match SingleRegionData format
      // API returns 'city' but our type expects 'cityTown'
      const transformedData: SingleRegionData = {
        regionCode: responseData.data.regionCode,
        regionName: responseData.data.regionName,
        address: {
          id: responseData.data.id || null,
          line1: responseData.data.address?.line1 || '',
          line2: responseData.data.address?.line2 || '',
          line3: responseData.data.address?.line3 || null,
          countryCode: responseData.data.address?.countryCode || '',
          state: responseData.data.address?.state || '',
          district: responseData.data.address?.district || '',
          cityTown: responseData.data.address?.city || '',
          pinCode: responseData.data.address?.pinCode || '',
          alternatePinCode: responseData.data.address?.alternatePinCode || null,
          digiPin: responseData.data.address?.digiPin || null,
        },
      };

      // Hide loader on success
      dispatch(hideLoader());

      return transformedData;
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      console.log('🚀 fetchRegionByCode catch block - Full error:', error);

      // Handle axios error response
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
              data?: SingleRegionErrorResponse['data'];
              message?: string;
            };
            status?: number;
          };
        };
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data;

        console.log('🚀 Axios error response:', {
          status,
          errorData,
          fullResponse: axiosError.response,
        });

        // Handle 400 or 401 - show backend error message
        if (status === 400 || status === 401) {
          if (errorData) {
            console.log('🚀 Region Fetch Error (400/401):', {
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
              'Failed to fetch region';
            console.log('🚀 Extracted error message:', errorMessage);
            return rejectWithValue(errorMessage);
          }
        }

        // Handle other errors
        if (errorData) {
          const fallbackMessage =
            errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch region';
          console.log('🚀 Other error - returning:', fallbackMessage);
          return rejectWithValue(fallbackMessage);
        }
      }
      console.log('🚀 Network error - returning generic message');
      return rejectWithValue('Network error occurred while fetching region');
    }
  }
);

const initialState: SingleRegionState = {
  loading: false,
  data: null,
  error: null,
};

const singleRegionSlice = createSlice({
  name: 'singleRegion',
  initialState,
  reducers: {
    resetSingleRegionState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    clearSingleRegionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegionByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegionByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchRegionByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
        console.log(
          '🚀 fetchRegionByCode.rejected - Error stored in state:',
          action.payload
        );
      });
  },
});

export const { resetSingleRegionState, clearSingleRegionError } =
  singleRegionSlice.actions;
export default singleRegionSlice.reducer;
