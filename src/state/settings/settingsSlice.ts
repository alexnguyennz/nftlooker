import { createSlice } from '@reduxjs/toolkit';

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autoplay: false,
    largenfts: false,
    limit: 25,
    searchFilter: 'global',
  },
  reducers: {
    toggleAutoplay(state, action) {
      state.autoplay = action.payload;

      const settings = {
        settings: state,
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    toggleLargeNfts(state, action) {
      state.largenfts = action.payload;

      const settings = {
        settings: state,
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    changeLimit(state, action) {
      state.limit = action.payload;

      const settings = {
        settings: state,
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    changeSearchFilter(state, action) {
      state.searchFilter = action.payload;

      const settings = {
        settings: state,
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    },
  },
});

export const {
  toggleAutoplay,
  toggleLargeNfts,
  changeLimit,
  changeSearchFilter,
} = settingsSlice.actions;
export const settingsState = (state) => state.settings;

export default settingsSlice.reducer;
