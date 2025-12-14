/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Secured } from '../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import {
  UserProfileErrorResponse,
  UserProfileRequest,
  UserProfileState,
  UserProfileSuccessResponse,
} from './types/UpdateUserProfileTypes';
import { AuthState } from '@redux/types/register/authSliceTypes';

// Types
// interface FormDataType {
//   citizenShip?: string;
//   ckycNumber?: string;
//   title?: string;
//   firstName?: string;
//   middleName?: string;
//   lastName?: string;
//   gender?: string;
//   dateOfBirth?: string;
//   designation?: string;
//   officeAddress?: string;
//   email?: string;
//   countryCode?: string;
//   mobileNumber?: string;
//   landline?: string;
//   employeeCode?: string;
//   proofofIdentity?: string;
//   proofofIdentityNumber?: string;
//   dateofBoardAppointment?: string;
//   [key: string]: unknown;
// }

// // Initial state for update user profile
// const initialState: UserProfileState = {
// //   userProfileLoading: false,
// //   userProfileSuccess: {},
// //   userProfileError: null,
// //   workflowId: null,
//   formData: {},
//   loading: false,
//   errorsubmitRegistration: null,
//   success: false,
// };

// Initial state
const initialState: UserProfileState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for creating a new region
export const fetchUpdateUserProfile = createAsyncThunk(
  'updateUserProfile/updateUserProfile',
  async (userProfileData, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Creating region...'));
    try {
      const response = await Secured.get(
        API_ENDPOINTS.get_my_task_user_profile
      );

      const data = response.data as UserProfileSuccessResponse;

      if (data.success) {
        console.log('success', data.success);
        dispatch(hideLoader());
        return data.data;
      } else {
        dispatch(hideLoader());
        return rejectWithValue(
          data.data || data.message || 'Failed to create region'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: UserProfileSuccessResponse; status?: number };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.message || 'Failed to create region'
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

// Async thunk for modifying an existing region
// export const modifyRegion = createAsyncThunk<
//   CreateRegionSuccessResponse['data'],
//   { regionCode: string; regionData: ModifyRegionRequest },
//   { rejectValue: string }
// >(
//   'createRegion/modifyRegion',
//   async ({ regionCode, regionData }, { rejectWithValue, dispatch }) => {
//     dispatch(showLoader('Modifying region...'));
//     try {
//       const response = await Secured.put(
//         `${API_ENDPOINTS.create_region}/${regionCode}`,
//         regionData
//       );

//       const data = response.data as
//         | CreateRegionSuccessResponse
//         | CreateRegionErrorResponse;

//       if (data.success) {
//         dispatch(hideLoader());
//         return data.data;
//       } else {
//         dispatch(hideLoader());
//         return rejectWithValue(
//           data.data?.errorMessage || data.message || 'Failed to modify region'
//         );
//       }
//     } catch (error: unknown) {
//       dispatch(hideLoader());
//       if (error && typeof error === 'object' && 'response' in error) {
//         const axiosError = error as {
//           response?: { data?: CreateRegionErrorResponse; status?: number };
//         };
//         if (axiosError.response?.data) {
//           const errorData = axiosError.response.data;
//           return rejectWithValue(
//             errorData.data?.errorMessage ||
//               errorData.message ||
//               'Failed to modify region'
//           );
//         }
//         // Handle 401 Unauthorized
//         if (axiosError.response?.status === 401) {
//           return rejectWithValue(
//             'Authorization token is missing or invalid or expired.'
//           );
//         }
//       }
//       return rejectWithValue('Network error occurred');
//     }
//   }
// );

// Create Region slice
// const userProfileSlice = createSlice({
//   name: 'userProfile',
//   initialState,
//   reducers: {
//     resetUserProfile: () => initialState,
//     updateFormData: (state, action: PayloadAction<Partial<FormDataType>>) => {
//       state.formData = { ...state.formData, ...action.payload };
//     },
//     setFormData: (state, action: PayloadAction<Partial<FormDataType>>) => {
//       state.formData = { ...state.formData, ...action.payload };
//     },
//   },
// //   initialState,
// //   reducers: {
// //     clearUserProfileError: (state) => {
// //       state.userProfileError = null;
// //     },
// //     resetUserProfileState: (state) => {
// //       state.userProfileLoading = false;
// //       state.userProfileSuccess = {};
// //       state.userProfileError = null;
// //       state.workflowId = null;
// //     },
// //     // clearModifyError: (state) => {
// //     //   state.modifyError = null;
// //     // },
// //     // resetModifyState: (state) => {
// //     //   state.modifyLoading = false;
// //     //   state.modifySuccess = false;
// //     //   state.modifyError = null;
// //     //   state.modifyWorkflowId = null;
// //     // },
// //   },
// });

export const modifyUserProfile = createAsyncThunk<
  { userId: string; workflowId: string; workflowStatus: string },
  UserProfileRequest,
  { state: { auth: AuthState }; rejectValue: string }
>(
  'modifyUserProfile/modifyUserProfile',
  async (requestData, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth.authToken;
      dispatch(showLoader('Updating user...'));
      console.log('Calling Update user API:', requestData);

      const jsonString = JSON.stringify(requestData);
      const formData = new FormData();
      formData.append('user_details', jsonString);

      const response = await Secured.put(
        API_ENDPOINTS.update_my_task_user_profile,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Update user API Response:', response.data);

      // Handle success response
      if (response.data && response.data.success === true) {
        dispatch(hideLoader());
        const successData = response.data as UserProfileSuccessResponse;
        return successData.data;
      }

      // Handle error response with success: false
      if (response.data && response.data.success === false) {
        dispatch(hideLoader());
        const errorData = response.data as UserProfileErrorResponse;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to Update user'
        );
      }
      dispatch(hideLoader());
      // Fallback error
      return rejectWithValue('Invalid response format');
    } catch (error: unknown) {
      console.error('Create user API error:', error);
      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: UserProfileErrorResponse };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to create user'
          );
        }
      }
      dispatch(hideLoader());
      return rejectWithValue('Network error occurred while creating user');
    }
  }
);

// Create user slice
const userProfileSlice = createSlice({
  name: 'updateUserProfile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(modifyUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(modifyUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

// export const { clearError, resetState } = createUserSlice.actions;
// export default createUserSlice.reducer;

export const { clearError, resetState } = userProfileSlice.actions;
export default userProfileSlice.reducer;
