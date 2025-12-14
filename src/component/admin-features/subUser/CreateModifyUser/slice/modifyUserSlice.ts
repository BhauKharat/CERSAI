import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  ModifyUserRequest,
  ModifyUserSuccessResponse,
  ModifyUserErrorResponse,
  ModifyUserState,
} from '../types/modifyUserTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: ModifyUserState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for modifying user
export const modifyUser = createAsyncThunk<
  { userId: string; workflowId: string; workflowStatus: string },
  { userId: string; requestData: ModifyUserRequest },
  { rejectValue: string }
>(
  'modifyUser/modifyUser',
  async ({ userId, requestData }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(showLoader('Modifying user...'));
      console.log(
        'Calling modify user API for userId:',
        userId,
        'with data:',
        requestData
      );

      const response = await Secured.put(
        API_ENDPOINTS.modify_user(userId),
        requestData
      );

      const data: ModifyUserSuccessResponse | ModifyUserErrorResponse =
        response.data;
      dispatch(hideLoader());
      if (data.success === false) {
        console.error('Modify user API error:', data.message);
        return rejectWithValue(data.message || 'Failed to modify user');
      }

      console.log('Modify user API success:', data.data);
      return (data as ModifyUserSuccessResponse).data;
    } catch (error: unknown) {
      console.error('Modify user API error:', error);
      dispatch(hideLoader());
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          return rejectWithValue(axiosError.response.data.message);
        }
      }

      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while modifying user'
      );
    }
  }
);

const modifyUserSlice = createSlice({
  name: 'modifyUser',
  initialState,
  reducers: {
    clearData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(modifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(modifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to modify user';
        state.data = null;
      });
  },
});

export const { clearData, clearError } = modifyUserSlice.actions;
export default modifyUserSlice.reducer;
