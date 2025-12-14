import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  showLoader,
  hideLoader,
} from '../../../../redux/slices/loader/loaderSlice';
import { Secured } from '../../../../utils/HelperFunctions/api';
// import { API_ENDPOINTS } from '../../../../../Constant';
import {
  DeactivateUserParams,
  DeactivateUserResponse,
  DeactivateUserState,
} from '../types/deactivateUserTypes';
import { API_ENDPOINTS } from 'Constant';

// Async thunk for deactivating user
export const deactivateUser = createAsyncThunk(
  'deactivateUser/deactivateUser',
  async (params: DeactivateUserParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Deactivating user...'));

      if (!params.fileBase64) {
        return rejectWithValue('Please upload a file');
      }

      const formData = new FormData();
      formData.append('supportingDocument', params.fileBase64);

      const deactivationData = {
        reportingEntityId: params.userId,
        reason: params.reason,
        remarks: params.remark,
      };

      formData.append('deactivationData', JSON.stringify(deactivationData));

      // const url = API_ENDPOINTS.deactivate_user(params.userId);
      const url = API_ENDPOINTS.DEACTIVATE_RE;
      const response = await Secured.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API Response:', response);

      const responseData = response.data as DeactivateUserResponse;
      dispatch(hideLoader());
      return responseData;
    } catch (error: unknown) {
      dispatch(hideLoader());
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: DeactivateUserResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.message || 'Failed to deactivate user'
        );
      }
      return rejectWithValue('Network error occurred while deactivating user');
    } finally {
      dispatch(hideLoader());
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
