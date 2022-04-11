import { createSlice } from '@reduxjs/toolkit';

interface Settings {
  autoplay: boolean;
}

interface State {
  settings: Settings;
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autoplay: false,
  },
  reducers: {
    toggleAutoplay(state, action) {
      state.autoplay = action.payload;

      localStorage.setItem('autoplay', action.payload);
    },
  },
});

export const { toggleAutoplay } = settingsSlice.actions;
export const settingsState = (state: State) => state.settings;

export default settingsSlice.reducer;
