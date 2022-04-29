import { createSlice } from '@reduxjs/toolkit';

interface Settings {
  autoplay: boolean;
  largenfts: boolean;
  walletLimit: number;
  searchLimit: number;
  searchFilter: string;
}


interface State {
  settings: Settings;
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    autoplay: false,
    largenfts: false,
    walletLimit: 25,
    searchLimit: 25,
    searchFilter: 'global'
  },
  reducers: {
    toggleAutoplay(state, action) {
      state.autoplay = action.payload;

      const settings = {
        'settings': state
      }
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    toggleLargeNfts(state, action) {
      state.largenfts = action.payload;

      const settings = {
        'settings': state
      }
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    changeWalletLimit(state, action) {
      state.walletLimit = action.payload;

      const settings = {
        'settings': state
      }
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    changeSearchLimit(state, action) {
      state.searchLimit = action.payload;

      const settings = {
        'settings': state
      }
      localStorage.setItem('settings', JSON.stringify(settings));
    },
    changeSearchFilter(state, action) {
      state.searchFilter = action.payload;

      const settings = {
        'settings': state
      }
      localStorage.setItem('settings', JSON.stringify(settings));
    },
  },
});

export const { toggleAutoplay, toggleLargeNfts, changeWalletLimit, changeSearchLimit, changeSearchFilter } = settingsSlice.actions;
export const settingsState = (state) => state.settings;

export default settingsSlice.reducer;
