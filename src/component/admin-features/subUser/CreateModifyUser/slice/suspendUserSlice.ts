import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  SuspendUserParams,
  SuspendUserResponse,
  SuspendUserState,
} from '../types/suspendUserTypes';

// Async thunk for suspending user
export const suspendUser = createAsyncThunk(
  'suspendUser/suspendUser',
  async (params: SuspendUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Suspending user...'));

      const requestBody = {
        userId: params.userId,
        actionType: 'SUSPEND',
        reason: params.remark,
        remarks: params.remark,
        suspensionStartDate: params.suspensionFromDate,
        suspensionEndDate: params.suspensionToDate,
      };

      // console.log('Suspend user request:', requestBody);

      // Use the new perform-action endpoint
      const url = `${API_ENDPOINTS.createNewUser_adminSubUser_management}/action`;
      const response = await Secured.post(url, requestBody);

      // console.log('Suspend user response:', response.data);

      const responseData = response.data as SuspendUserResponse;
      dispatch(hideLoader());
      return responseData;
    } catch (error: unknown) {
      dispatch(hideLoader());
      console.error('Suspend user error:', error);

      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: SuspendUserResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.error?.message ||
            errorData.message ||
            'Failed to suspend user'
        );
      }
      return rejectWithValue('Network error occurred while suspending user');
    }
  }
);

const initialState: SuspendUserState = {
  suspending: false,
  suspendError: null,
};

const suspendUserSlice = createSlice({
  name: 'suspendUser',
  initialState,
  reducers: {
    clearSuspendError: (state) => {
      state.suspendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(suspendUser.pending, (state) => {
        state.suspending = true;
        state.suspendError = null;
      })
      .addCase(suspendUser.fulfilled, (state) => {
        state.suspending = false;
        state.suspendError = null;
      })
      .addCase(suspendUser.rejected, (state, action) => {
        state.suspending = false;
        state.suspendError = action.payload as string;
      });
  },
});

export const { clearSuspendError } = suspendUserSlice.actions;
export default suspendUserSlice.reducer;
