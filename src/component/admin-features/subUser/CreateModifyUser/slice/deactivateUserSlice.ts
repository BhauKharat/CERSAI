import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  DeactivateUserParams,
  DeactivateUserResponse,
  DeactivateUserState,
} from '../types/deactivateUserTypes';

// Async thunk for deactivating user
export const deactivateUser = createAsyncThunk(
  'deactivateUser/deactivateUser',
  async (params: DeactivateUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Deactivating user...'));

      const requestBody = {
        userId: params.userId,
        actionType: 'DEACTIVATE',
        reason: params.remark,
        remarks: params.remark,
      };

      // console.log('Deactivate user request:', requestBody);

      // Use the new perform-action endpoint
      const url = `${API_ENDPOINTS.createNewUser_adminSubUser_management}/action`;
      const response = await Secured.post(url, requestBody);

      // console.log('Deactivate user response:', response.data);

      const responseData = response.data as DeactivateUserResponse;
      dispatch(hideLoader());
      return responseData;
    } catch (error: unknown) {
      dispatch(hideLoader());
      console.error('Deactivate user error:', error);

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: DeactivateUserResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.error?.message ||
            errorData.message ||
            'Failed to deactivate user'
        );
      }
      return rejectWithValue('Network error occurred while deactivating user');
    }
  }
);

const initialState: DeactivateUserState = {
  deactivating: false,
  deactivateError: null,
};

const deactivateUserSlice = createSlice({
  name: 'deactivateUser',
  initialState,
  reducers: {
    clearDeactivateError: (state) => {
      state.deactivateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deactivateUser.pending, (state) => {
        state.deactivating = true;
        state.deactivateError = null;
      })
      .addCase(deactivateUser.fulfilled, (state) => {
        state.deactivating = false;
        state.deactivateError = null;
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.deactivating = false;
        state.deactivateError = action.payload as string;
      });
  },
});

export const { clearDeactivateError } = deactivateUserSlice.actions;
export default deactivateUserSlice.reducer;
