import { createSlice } from '@reduxjs/toolkit';

export const testnetsSlice = createSlice({
  name: 'testnets',
  initialState: {
    value: false,
  },
  reducers: {
    toggleTestnets: (state) => {
      state.value = !state.value;
    },
  },
});

export const { toggleTestnets } = testnetsSlice.actions;
export const testnetsState = (state) => state.testnets.value;

export default testnetsSlice.reducer;
