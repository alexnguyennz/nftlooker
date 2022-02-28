import { createSlice } from '@reduxjs/toolkit';

export const loadingSlice = createSlice({
  name: 'loading',
  initialState: {
    value: false,
  },
  reducers: {
    isLoading: (state) => {
      state.value = true;
    },
    isNotLoading: (state) => {
      state.value = false;
    },
  },
});

export const { isLoading, isNotLoading } = loadingSlice.actions;
export const loadingState = (state) => state.loading.value;

export default loadingSlice.reducer;
