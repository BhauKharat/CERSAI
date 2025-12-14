import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../utils/HelperFunctions/api';
// import { API_ENDPOINTS } from '../../../../../Constant';
import {
  SuspendUserParams,
  SuspendUserResponse,
  SuspendUserState,
} from '../types/suspendUserTypes';
import { API_ENDPOINTS } from 'Constant';

// Async thunk for suspending user
export const suspendUser = createAsyncThunk(
  'suspendUser/suspendUser',
  async (params: SuspendUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Suspending user...'));

      const requestBody = {
        reportingEntityId: params.userId,
        remarks: params.remark,
        reason: params.suspensionReason,
        suspensionStartDate: params.suspensionFromDate,
        suspensionEndDate: params.suspensionToDate,
      };

      if (!params.file) {
        return rejectWithValue('Please Upload File');
      }

      const formData = new FormData();

      formData.append('supportingDocument', params.file);

      formData.append('suspensionData', JSON.stringify(requestBody));

      // const url = API_ENDPOINTS.suspend_user(params.userId);
      const url = API_ENDPOINTS.SUSPEND_RE;
      const response = await Secured.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = response.data as SuspendUserResponse;
      dispatch(hideLoader());
      return responseData;
    } catch (error: unknown) {
      dispatch(hideLoader());
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: SuspendUserResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(errorData.message || 'Failed to suspend user');
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
