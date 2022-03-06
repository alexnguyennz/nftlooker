import { createSlice } from '@reduxjs/toolkit';

export const tabSlice = createSlice({
  name: 'tab',
  initialState: {
    value: 0,
  },
  reducers: {
    changeTab(state, action) {
      state.value = action.payload;
    },
  },
});

export const { changeTab } = tabSlice.actions;
export const tabState = (state) => state.tab.value;

export default tabSlice.reducer;
