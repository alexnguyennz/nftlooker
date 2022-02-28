import { configureStore } from '@reduxjs/toolkit';

// slices
import loadingReducer from './loading/loadingSlice';
import testnetsReducer from './testnets/testnetsSlice';
import searchReducer from './search/searchSlice';
import tabReducer from './tab/tabSlice';

export default configureStore({
  reducer: {
    loading: loadingReducer,
    testnets: testnetsReducer,
    search: searchReducer,
    tab: tabReducer,
  },
});
