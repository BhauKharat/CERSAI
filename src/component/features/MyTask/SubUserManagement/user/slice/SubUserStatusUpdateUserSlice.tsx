import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../../redux/slices/loader/loaderSlice';
import {
  SubUserCreateUserErrorResponse,
  SubUserCreateUserState,
  SubUserCreateUserSuccessResponse,
  SubUserModifyUserRequest,
} from '../types/SubUserCreateUser';
import { StatusSubUserUserType } from '../types/SubUserSingleUser';

// Initial state for region creation
const initialState: SubUserCreateUserState = {
  createLoading: false,
  createSuccess: false,
  createError: null,
  workflowId: null,
  modifyLoading: false,
  modifySuccess: false,
  modifyError: null,
  modifyWorkflowId: null,
};

// Async thunk for modifying an existing region
export const StatusSubUserUser = createAsyncThunk<
  SubUserCreateUserSuccessResponse,
  {
    regionCode: string;
    regionData: StatusSubUserUserType;
    statusType: string;
  },
  { rejectValue: string }
>(
  'createUser/modifyUser',
  async (
    { regionCode, regionData, statusType },
    { rejectWithValue, dispatch }
  ) => {
    dispatch(showLoader('Modifying region...'));
    try {
      const response = await Secured.post(
        `${API_ENDPOINTS.get_my_task_user_status(regionCode) + '/' + statusType}`,
        regionData
      );

      const data = response.data as
        | SubUserCreateUserSuccessResponse
        | SubUserCreateUserErrorResponse;
      console.log('data;====', data);
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
            data?: SubUserCreateUserErrorResponse;
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
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to modify region'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to modify region'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Async thunk for modifying an existing region
export const modifySubUserUser = createAsyncThunk<
  SubUserCreateUserSuccessResponse['data'],
  { regionCode: string; regionData: SubUserModifyUserRequest },
  { rejectValue: string }
>(
  'createUser/modifyUser',
  async ({ regionCode, regionData }, { rejectWithValue, dispatch }) => {
    dispatch(showLoader('Modifying region...'));
    try {
      const response = await Secured.put(
        `${API_ENDPOINTS.create_region}/${regionCode}`,
        regionData
      );

      const data = response.data as
        | SubUserCreateUserSuccessResponse
        | SubUserCreateUserErrorResponse;

      if (data.success) {
        dispatch(hideLoader());
        return data.data;
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
            data?: SubUserCreateUserErrorResponse;
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
              errorData.data?.errorMessage ||
                errorData.message ||
                'Failed to modify region'
            );
          }
        }

        // Handle other errors
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to modify region'
          );
        }
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

// Create User slice
const SubUserStatusUpdateUserSlice = createSlice({
  name: 'createUser',
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
    },
    clearModifyError: (state) => {
      state.modifyError = null;
    },
    resetModifyState: (state) => {
      state.modifyLoading = false;
      state.modifySuccess = false;
      state.modifyError = null;
      state.modifyWorkflowId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create region cases
      .addCase(StatusSubUserUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(StatusSubUserUser.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.workflowId = action?.payload?.data?.workflowId;
        state.createError = null;
      })
      .addCase(StatusSubUserUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError = action.payload || 'Failed to create region';
      })
      // Modify region cases
      .addCase(modifySubUserUser.pending, (state) => {
        state.modifyLoading = true;
        state.modifyError = null;
        state.modifySuccess = false;
      })
      .addCase(modifySubUserUser.fulfilled, (state, action) => {
        state.modifyLoading = false;
        state.modifySuccess = true;
        state.modifyWorkflowId = action.payload.workflowId;
        state.modifyError = null;
      })
      .addCase(modifySubUserUser.rejected, (state, action) => {
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
} = SubUserStatusUpdateUserSlice.actions;
export default SubUserStatusUpdateUserSlice.reducer;
