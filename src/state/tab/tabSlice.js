import { createSlice } from '@reduxjs/toolkit';

export const tabSlice = createSlice({
  name: 'tab',
  initialState: {
    value: 0,
    chainTab: null,
  },
  reducers: {
    changeTab(state, action) {
      state.value = action.payload;
    },
    changeChainTab(state, action) {
      state.chainTab = action.payload;
    },
  },
});

export const { changeTab, changeChainTab } = tabSlice.actions;
export const tabState = (state) => state.tab.value;
export const chainTabState = (state) => state.tab.chainTab;

export default tabSlice.reducer;
