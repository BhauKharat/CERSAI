import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  FetchUserRequest,
  FetchUserSuccessResponse,
  FetchUserErrorResponse,
  FetchUserState,
  FetchUserData,
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
  FetchUserData,
  FetchUserRequest,
  { rejectValue: string }
>('fetchUser/fetchUser', async (request, { rejectWithValue, dispatch }) => {
  try {
    console.log('Calling fetch user API for userId:', request.userId);

    dispatch(showLoader('Fetching user...'));

    // Use the new POST endpoint with payload
    const payload = [
      {
        operation: 'AND',
        filters: {
          userId: request.userId,
        },
      },
    ];

    const response = await Secured.post(
      `${API_ENDPOINTS.get_sub_users}?page=0&size=10&sortBy=created_date,desc`,
      payload
    );

    const data: FetchUserSuccessResponse | FetchUserErrorResponse =
      response.data;
    dispatch(hideLoader());

    if (data.success === false) {
      console.error('Fetch user API error:', data.message);
      return rejectWithValue(data.message || 'Failed to fetch user');
    }

    // Extract the first user from the paginated response content array
    const responseData = (data as FetchUserSuccessResponse).data;
    const content = responseData?.content;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return rejectWithValue('User not found');
    }

    const user = content[0];

    console.log('Fetch user API success - Full user object:', user);
    console.log('Fetch user API success - ckycNo value:', user.ckycNo);
    console.log('Fetch user API success - All keys:', Object.keys(user));
    return user;
  } catch (error: unknown) {
    console.error('Fetch user API error:', error);
    dispatch(hideLoader());

    // Handle axios error response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
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
        if (axiosError.response?.data?.message) {
          return rejectWithValue(axiosError.response.data.message);
        }
      }

      // Handle other errors
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
