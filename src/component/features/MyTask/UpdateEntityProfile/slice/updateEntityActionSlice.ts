import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../../../../Constant';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import {
  UpdateEntityActionState,
  UpdateEntityActionRequest,
  UpdateEntityActionResponse,
  UpdateEntityActionError,
} from '../types/updateEntityActionTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

// Initial state
const initialState: UpdateEntityActionState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

// Async thunk for updating entity profile action
export const updateEntityAction = createAsyncThunk(
  'updateEntityAction/updateEntityAction',
  async (
    requestData: UpdateEntityActionRequest,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const actionText =
        requestData.action === 'APPROVED' ? 'Approving' : 'Rejecting';
      dispatch(showLoader(`${actionText} entity profile...`));

      const response = await Secured.post(
        API_ENDPOINTS.update_entity_action,
        requestData
      );

      const successData = response.data as UpdateEntityActionResponse;
      dispatch(hideLoader());
      return successData;
    } catch (error: unknown) {
      dispatch(hideLoader());
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: UpdateEntityActionError };
        };
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          return rejectWithValue(
            errorData.data?.errorMessage ||
              errorData.message ||
              'Failed to update entity action'
          );
        }
      }
      return rejectWithValue(
        'Network error occurred while updating entity action'
      );
    }
  }
);

// Create slice
const updateEntityActionSlice = createSlice({
  name: 'updateEntityAction',
  initialState,
  reducers: {
    clearUpdateEntityAction: (state) => {
      state.data = null;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateEntityAction.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEntityAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.success = true;
      })
      .addCase(updateEntityAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearUpdateEntityAction, clearError } =
  updateEntityActionSlice.actions;
export default updateEntityActionSlice.reducer;
