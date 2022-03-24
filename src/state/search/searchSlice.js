import { createSlice } from '@reduxjs/toolkit';

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    limit: 10,
    filter: 'global',
  },
  reducers: {
    changeLimit(state, action) {
      state.limit = action.payload;
    },
    changeFilter(state, action) {
      state.filter = action.payload;
    },
  },
});

export const { changeLimit, changeFilter } = searchSlice.actions;
export const searchLimitState = (state) => state.search.limit;
export const searchFilterState = (state) => state.search.filter;

export default searchSlice.reducer;
