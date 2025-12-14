// redux/loaderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoaderState {
  loading: boolean;
  message: string;
}

const initialState: LoaderState = {
  loading: false,
  message: '',
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    resetLoader: () => initialState,
    showLoader: (state, action: PayloadAction<string | undefined>) => {
      state.loading = true;
      state.message = action.payload || 'Loading...';
    },
    hideLoader: (state) => {
      state.loading = false;
      state.message = '';
    },
  },
});

export const { showLoader, hideLoader, resetLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
