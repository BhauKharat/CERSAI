import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  FetchUserRequest,
  FetchUserSuccessResponse,
  FetchUserErrorResponse,
  FetchUserState,
} from '../types/fetchUserTypes';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';

const initialState: FetchUserState = {
  loading: false,
  data: null,
  error: null,
};

// Async thunk for fetching user data
export const fetchUser = createAsyncThunk<
  FetchUserSuccessResponse['data'],
  FetchUserRequest,
  { rejectValue: string }
>('fetchUser/fetchUser', async (request, { rejectWithValue, dispatch }) => {
  try {
    console.log('Calling fetch user API for userId:', request.userId);

    dispatch(showLoader('Fetching user...'));
    const API_ENDPOINT = `${API_ENDPOINTS.createNewUser_adminSubUser_management}/${request.userId}`;
    const response = await Secured.get(
      // API_ENDPOINTS.get_user_by_id(request.userId)
      API_ENDPOINT
    );

    const data: FetchUserSuccessResponse | FetchUserErrorResponse =
      response.data;
    dispatch(hideLoader());

    if (data.success === false) {
      console.error('Fetch user API error:', data.message);
      return rejectWithValue(data.message || 'Failed to fetch user');
    }

    console.log('Fetch user API success:', data.data);
    return (data as FetchUserSuccessResponse).data;
  } catch (error: unknown) {
    console.error('Fetch user API error:', error);
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
        : 'An unexpected error occurred while fetching user'
    );
  }
});

const fetchUserSlice = createSlice({
  name: 'fetchUser',
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
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
        state.data = null;
      });
  },
});

export const { clearData, clearError } = fetchUserSlice.actions;
export default fetchUserSlice.reducer;
