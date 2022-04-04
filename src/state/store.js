import { configureStore } from '@reduxjs/toolkit';

// slices
import walletReducer from './wallet/walletSlice';
import loadingReducer from './loading/loadingSlice';
import testnetsReducer from './testnets/testnetsSlice';
import searchReducer from './search/searchSlice';
import tabReducer from './tab/tabSlice';
import settingsReducer from './settings/settingsSlice';

export default configureStore({
  reducer: {
    wallet: walletReducer,
    loading: loadingReducer,
    testnets: testnetsReducer,
    search: searchReducer,
    tab: tabReducer,
    settings: settingsReducer,
  },
});
