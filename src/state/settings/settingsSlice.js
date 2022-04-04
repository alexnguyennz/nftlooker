import { createSlice } from '@reduxjs/toolkit';

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autoplay: false,
  },
  reducers: {
    toggleAutoplay(state, action) {
      state.autoplay = !state.autoplay;

      localStorage.setItem('autoplay', state.autoplay);
      console.log('local', localStorage.getItem('autoplay'));
    },
  },
});

export const { toggleAutoplay } = settingsSlice.actions;
export const settingsState = (state) => state.settings;

export default settingsSlice.reducer;
