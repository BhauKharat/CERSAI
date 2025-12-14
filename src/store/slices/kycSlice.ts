import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface KYC {
  id: number;
  name: string;
  status: boolean;
  // Add other KYC properties as needed
}

interface KYCState {
  kycList: KYC[];
}

const initialState: KYCState = {
  kycList: [],
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setKYCList(state, action: PayloadAction<KYC[]>) {
      state.kycList = action.payload;
    },
  },
});

export const { setKYCList } = kycSlice.actions;
export default kycSlice.reducer;
