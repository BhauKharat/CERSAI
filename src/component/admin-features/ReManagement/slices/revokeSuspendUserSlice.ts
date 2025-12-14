import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../utils/HelperFunctions/api';
// import { API_ENDPOINTS } from '../../../../../Constant';
import {
  RevokeSuspendUserParams,
  RevokeSuspendUserResponse,
  RevokeSuspendUserState,
} from '../types/revokeSuspendUserTypes';
import { API_ENDPOINTS } from 'Constant';

// Async thunk for revoking user suspension
export const revokeSuspendUser = createAsyncThunk(
  'revokeSuspendUser/revokeSuspendUser',
  async (params: RevokeSuspendUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Revoking user suspension...'));

      if (!params.file) {
        return rejectWithValue('Please Upload a File');
      }

      const formData = new FormData();

      const revocationData = {
        reportingEntityId: params.userId,
        remarks: params.remark,
      };

      formData.append('supportingDocument', params.file);
      formData.append('revocationData', JSON.stringify(revocationData));

      // const url = API_ENDPOINTS.revoke_suspend_user(params.userId);
      const url = API_ENDPOINTS.REVOKE_SUSPEND_RE;
      const response = await Secured.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = response.data as RevokeSuspendUserResponse;
      dispatch(hideLoader());

      if (responseData.success) {
        return responseData;
      } else {
        const errorData = responseData.data as {
          errorCode: string;
          errorMessage: string;
        };
        return rejectWithValue(
          errorData.errorMessage || 'Failed to revoke user suspension'
        );
      }
    } catch (error: unknown) {
      dispatch(hideLoader());
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
    } finally {
      dispatch(hideLoader());
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
