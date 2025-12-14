import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Secured } from '../../../../../utils/HelperFunctions/api/index';
import { API_ENDPOINTS } from '../../../../../Constant';
import {
  showLoader,
  hideLoader,
} from '../../../../../redux/slices/loader/loaderSlice';
import {
  UsersState,
  FetchUsersParams,
  UsersSuccessResponse,
  UsersErrorResponse,
} from '../types/users';

// Async thunk for fetching users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: FetchUsersParams = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(showLoader('Fetching users...'));
      const queryParams = new URLSearchParams();

      if (params.size) queryParams.append('size', params.size.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.region) queryParams.append('region', params.region);

      const url = `${API_ENDPOINTS.get_users}?${queryParams.toString()}`;
      const response = await Secured.get(url);

      // Handle the response data structure
      const responseData = response.data as UsersSuccessResponse;
      dispatch(hideLoader());
      return responseData;
    } catch (error: unknown) {
      dispatch(hideLoader());
      // Handle axios error response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { data: UsersErrorResponse };
        };
        const errorData = axiosError.response.data;
        return rejectWithValue(
          errorData.data?.errorMessage || 'Failed to fetch users'
        );
      }
      return rejectWithValue('Network error occurred while fetching users');
    }
  }
);

const initialState: UsersState = {
  data: [],
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetState: (state) => {
      state.data = [];
      state.error = null;
      state.totalElements = 0;
      state.totalPages = 0;
      state.currentPage = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.data = action.payload.content;
        state.error = null;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload as string;
        state.data = [];
        state.totalElements = 0;
        state.totalPages = 0;
      });
  },
});

export const { resetState, clearError } = usersSlice.actions;
export default usersSlice.reducer;
