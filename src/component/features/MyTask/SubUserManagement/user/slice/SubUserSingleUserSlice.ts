import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  SubUserSingleUserState,
  SubUserSingleUserSuccessResponse,
  SubUserSingleUserErrorResponse,
  PaginatedUserResponse,
  SubUserSingleUserData,
} from '../types/SubUserSingleUser';

// Async thunk for fetching single region by code
export const fetchSubUserUserByID = createAsyncThunk(
  'singleUser/fetchUserByWorkFlow',
  async (workFlow: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching region details...'));

      const response = await Secured.get(
        API_ENDPOINTS.get_my_task_branch_by_workflow(workFlow)
      );

      // Handle the response data structure
      const responseData = response.data as SubUserSingleUserSuccessResponse;

      // Hide loader on success
      dispatch(hideLoader());

      return responseData.data;
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data: SubUserSingleUserErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch region'
          );
        }

        // Handle other errors
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch region'
        );
      }
      return rejectWithValue('Network error occurred while fetching region');
    }
  }
);

// Async thunk for fetching single region by code
export const fetchSubUserUserById = createAsyncThunk(
  'singleUser/fetchUserById',
  async (userId: string, { rejectWithValue, dispatch }) => {
    try {
      // Show loader
      dispatch(showLoader('Fetching user details...'));

      // Build URL with query parameters
      const url = `${API_ENDPOINTS.get_sub_users}?page=0&size=1000&sort=branchCode,asc`;

      // Build payload with OR operation and userId filter
      const payload = [
        {
          operation: 'OR',
          filters: {
            userId: userId,
          },
        },
      ];

      const response = await Secured.post(url, payload);

      // Handle the response data structure - API returns paginated response
      const responseData = response.data as PaginatedUserResponse;

      // Hide loader on success
      dispatch(hideLoader());

      // Extract the first user from the content array if available
      if (
        responseData?.data?.content &&
        Array.isArray(responseData.data.content) &&
        responseData.data.content.length > 0
      ) {
        // Map the user data to match SubUserSingleUserData structure
        const userData = responseData.data.content[0] as Record<
          string,
          unknown
        >;
        const addressResponseDto =
          (userData.addressResponseDto as Record<string, unknown>) || {};

        return {
          branchCode: (userData.branchCode as string) || '',
          branchName:
            (userData.branchName as string) ||
            (userData.branch as string) ||
            '',
          regionName:
            (userData.region as string) ||
            (userData.regionName as string) ||
            '',
          regionCode: (userData.regionCode as string) || '',
          userType: (userData.userType as string) || '',
          citizenship: (userData.citizenship as string) || '',
          ckycNumber:
            (userData.ckycNumber as string) ||
            (userData.ckycNo as string) ||
            '',
          title: (userData.title as string) || '',
          firstName: (userData.firstName as string) || '',
          middleName: (userData.middleName as string) || '',
          lastName: (userData.lastName as string) || '',
          designation: (userData.designation as string) || '',
          emailAddress: (userData.email as string) || '',
          gender: (userData.gender as string) || '',
          countryCode: (userData.countryCode as string) || '',
          mobileNumber: (userData.mobile as string) || '',
          dob: (userData.dob as string) || '',
          poi: (userData.poi as string) || '',
          poiNumber: (userData.poiNumber as string) || '',
          employeeId: (userData.employeeId as string) || '',
          address: {
            id: (addressResponseDto.id as string) || null,
            line1: (addressResponseDto.line1 as string) || '',
            line2: (addressResponseDto.line2 as string) || '',
            line3: (addressResponseDto.line3 as string) || null,
            countryCode:
              (addressResponseDto.countryCode as string) ||
              (addressResponseDto.country as string) ||
              '',
            state: (addressResponseDto.state as string) || '',
            district: (addressResponseDto.district as string) || '',
            cityTown: (addressResponseDto.city as string) || '',
            pinCode: (addressResponseDto.pincode as string) || '',
            alternatePinCode:
              (addressResponseDto.alternatePincode as string) || null,
            digiPin: (addressResponseDto.digiPin as string) || null,
          },
        } as SubUserSingleUserData;
      }

      // Fallback: return empty structure if no content found
      return {
        branchCode: '',
        branchName: '',
        address: {
          id: null,
          line1: '',
          line2: '',
          line3: null,
          countryCode: '',
          state: '',
          district: '',
          cityTown: '',
          pinCode: '',
          alternatePinCode: null,
          digiPin: null,
        },
      };
    } catch (error: unknown) {
      // Hide loader on error
      dispatch(hideLoader());

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: {
            data: SubUserSingleUserErrorResponse;
            status?: number;
          };
        };
        const status = axiosError.response.status;

        // Handle 500 status
        if (status === 500) {
          return rejectWithValue(
            'Something went wrong on our side. Please try again later'
          );
        }

        // Handle 400 or 401 - show backend error
        if (status === 400 || status === 401) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to fetch user'
          );
        }

        // Handle other errors
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to fetch user'
        );
      }
      return rejectWithValue('Network error occurred while fetching user');
    }
  }
);

const initialState: SubUserSingleUserState = {
  loading: false,
  data: null,
  error: null,
};

const SubUserSingleUserSlice = createSlice({
  name: 'singleUser',
  initialState,
  reducers: {
    resetSingleUserState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
    clearSingleUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubUserUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubUserUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchSubUserUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { resetSingleUserState, clearSingleUserError } =
  SubUserSingleUserSlice.actions;
export default SubUserSingleUserSlice.reducer;
