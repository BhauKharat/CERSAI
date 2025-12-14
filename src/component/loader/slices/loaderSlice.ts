import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoaderState {
  loading: boolean;
  message: string;
}

const initialState: LoaderState = {
  loading: false,
  message: 'Please Wait...',
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state, action: PayloadAction<string | undefined>) => {
      state.loading = true;
      state.message = action.payload || 'Please Wait...';
    },
    hideLoader: (state) => {
      state.loading = false;
      state.message = '';
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
