import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  RevokeSuspendUserParams,
  RevokeSuspendUserState,
} from '../types/revokeSuspendUserTypes';

// Async thunk for revoking user suspension
export const revokeSuspendUser = createAsyncThunk(
  'revokeSuspendUser/revokeSuspendUser',
  async (params: RevokeSuspendUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Revoking user suspension...'));

      const requestBody = {
        userId: params.userId,
        actionType: 'SUSPENSION_REVOKE', // ✅ Fixed to match Swagger spec
        reason: params.remark,
        remarks: params.remark,
      };

      // Use the new perform-action endpoint
      const url = `${API_ENDPOINTS.createNewUser_adminSubUser_management}/action`;
      const response = await Secured.post(url, requestBody);

      dispatch(hideLoader());

      // Check if response has data field (successful response)
      if (response.data && response.data.data) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || 'Failed to revoke user suspension'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
      console.error('Revoke suspension error:', error);

      const axiosError = error as {
        response?: {
          data?: { message?: string; data?: { errorMessage?: string } };
        };
      };
      const errorMessage =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.data?.errorMessage ||
        'Failed to revoke user suspension';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: RevokeSuspendUserState = {
  revokingSuspension: false,
  revokeSuspendError: null,
};

const revokeSuspendUserSlice = createSlice({
  name: 'revokeSuspendUser',
  initialState,
  reducers: {
    clearRevokeSuspendError: (state) => {
      state.revokeSuspendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(revokeSuspendUser.pending, (state) => {
        state.revokingSuspension = true;
        state.revokeSuspendError = null;
      })
      .addCase(revokeSuspendUser.fulfilled, (state) => {
        state.revokingSuspension = false;
        state.revokeSuspendError = null;
      })
      .addCase(revokeSuspendUser.rejected, (state, action) => {
        state.revokingSuspension = false;
        state.revokeSuspendError = action.payload as string;
      });
  },
});

export const { clearRevokeSuspendError } = revokeSuspendUserSlice.actions;
export default revokeSuspendUserSlice.reducer;
