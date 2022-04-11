import { createSlice } from '@reduxjs/toolkit';

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    address: '',
    chain: '',
  },
  reducers: {
    setWallet(state, action) {
      state.address = action.payload.address;
      state.chain = action.payload.chain;
    },
  },
});

export const { setWallet } = walletSlice.actions;
export const walletState = (state) => state.wallet;

export default walletSlice.reducer;
