/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  hideLoader,
  showLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  CreateUserErrorResponse,
  CreateUserRequest,
  CreateUserState,
  CreateUserSuccessResponse,
} from '../types/createUserTypes';

// Initial state
const initialState: CreateUserState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for creating user
// export const createUser = createAsyncThunk<
//   { userId: string; workflowId: string; workflowStatus: string },
//   CreateUserRequest,
//   { rejectValue: string }
// >(
//   'createUser/createUser',
//   async (requestData, { rejectWithValue, dispatch }) => {
//     try {
//       dispatch(showLoader('Creating user...'));
//       console.log('Calling create user API:', requestData);

//       const response = await Secured.post(
//         API_ENDPOINTS.create_user_management,
//         requestData
//       );

//       console.log('Create user API Response:', response.data);

//       // Handle success response
//       if (response.data && response.data.success === true) {
//         dispatch(hideLoader());
//         const successData = response.data as CreateUserSuccessResponse;
//         return successData.data;
//       }

//       // Handle error response with success: false
//       if (response.data && response.data.success === false) {
//         dispatch(hideLoader());
//         const errorData = response.data as CreateUserErrorResponse;
//         return rejectWithValue(
//           errorData.data?.errorMessage ||
//             errorData.message ||
//             'Failed to create user'
//         );
//       }
//       dispatch(hideLoader());
//       // Fallback error
//       return rejectWithValue('Invalid response format');
//     } catch (error: unknown) {
//       console.error('Create user API error:', error);
//       dispatch(hideLoader());

//       if (error && typeof error === 'object' && 'response' in error) {
//         const axiosError = error as {
//           response?: { data?: CreateUserErrorResponse };
//         };
//         if (axiosError.response?.data) {
//           const errorData = axiosError.response.data;
//           return rejectWithValue(
//             errorData.data?.errorMessage ||
//               errorData.message ||
//               'Failed to create user'
//           );
//         }
//       }
//       dispatch(hideLoader());
//       return rejectWithValue('Network error occurred while creating user');
//     }
//   }
// );

export const createUser = createAsyncThunk<
  {
    workflowId: string;
    workflowStatus: string;
    operationalStatus: string;
    userId: string;
    actionType: string;
    performedBy: string;
    performedAt: string;
    message: string;
  },
  CreateUserRequest,
  { rejectValue: string }
>(
  'createUser/createUser',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Creating user...'));
      console.log('Calling create user API:', requestData);
      console.log(
        'API Endpoint:',
        API_ENDPOINTS.createNewUser_adminSubUser_management
      );
      const response = await Secured.post(
        API_ENDPOINTS.createNewUser_adminSubUser_management,
        requestData
      );

      console.log('Create user API Response:', response.data);

      // Handle new response format: { data: { workflowId, workflowStatus, ... } }
      if (response.data && response.data.data) {
        dispatch(hideLoader());
        const successData = response.data as CreateUserSuccessResponse;
        return successData.data;
      }

      // Handle error response with success: false
      if (response.data && response.data.success === false) {
        dispatch(hideLoader());
        const errorData = response.data as CreateUserErrorResponse;
        return rejectWithValue(
          errorData.data?.errorMessage ||
            errorData.message ||
            'Failed to create user'
        );
      }
      dispatch(hideLoader());
      // Fallback error
      return rejectWithValue('Invalid response format');
    } catch (error: unknown) {
      console.error('=== CREATE USER API ERROR ===');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);

      if (error && typeof error === 'object') {
        console.error('Error keys:', Object.keys(error));
        if ('response' in error) {
          const axiosError = error as {
            response?: {
              status?: number;
              data?: unknown;
              headers?: Record<string, string>;
            };
          };
          console.error('Response status:', axiosError.response?.status);
          console.error('Response data:', axiosError.response?.data);
          console.error('Response headers:', axiosError.response?.headers);
        }
        if ('message' in error) {
          console.error(
            'Error message:',
            (error as { message: string }).message
          );
        }
      }
      console.error('============================');

      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: CreateUserErrorResponse };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          if (
            typeof errorData === 'object' &&
            errorData.error !== null &&
            errorData.error?.errors &&
            errorData.error?.errors.length > 0
          ) {
            const errorMessage =
              errorData.error?.errors.map((err) => err.message).join(', \n') ||
              errorData.error?.message ||
              'Failed to create user';
            return rejectWithValue(errorMessage);
          }

          return rejectWithValue(
            errorData.error?.message ||
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

export const modifyUserThunk = createAsyncThunk<
  {
    workflowId: string;
    workflowStatus: string;
    operationalStatus: string;
    userId: string;
    actionType: string;
    performedBy: string;
    performedAt: string;
    message: string;
  },
  CreateUserRequest,
  { rejectValue: string }
>(
  'modifyUser/modifyUser',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Updating user...'));
      console.log('Calling Update user API:', requestData);
      const API_ENDPOINT = API_ENDPOINTS.createNewUser_adminSubUser_management;
      const response = await Secured.put(API_ENDPOINT, requestData);

      console.log('Update user API Response:', response.data);

      // Handle new response format: { data: { workflowId, workflowStatus, ... } }
      if (response.data && response.data.data) {
        dispatch(hideLoader());
        const successData = response.data as CreateUserSuccessResponse;
        return successData.data;
      }

      // Handle error response with success: false
      if (response.data && response.data.success === false) {
        dispatch(hideLoader());
        const errorData = response.data as CreateUserErrorResponse;
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
      console.error('Update user API error:', error);
      dispatch(hideLoader());

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: CreateUserErrorResponse };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          if (
            typeof errorData === 'object' &&
            errorData.error !== null &&
            errorData.error?.errors &&
            errorData.error?.errors.length > 0
          ) {
            const errorMessage =
              errorData.error?.errors.map((err) => err.message).join(', \n') ||
              errorData.error?.message ||
              'Failed to modify user';
            return rejectWithValue(errorMessage);
          }
          return rejectWithValue(
            errorData.error?.message ||
              errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to update user'
          );
        }
      }
      dispatch(hideLoader());
      return rejectWithValue('Network error occurred while updating user');
    }
  }
);

// Create user slice
const createUserSlice = createSlice({
  name: 'createUserManagement',
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
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })

      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string | undefined) || 'An error occurred';
        state.data = null;
      })

      .addCase(modifyUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(modifyUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string | undefined) || 'An error occurred';
        state.data = null;
      });
  },
});

export const { clearError, resetState } = createUserSlice.actions;
export default createUserSlice.reducer;
