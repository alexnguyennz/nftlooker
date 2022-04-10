import { createStore, combineReducers } from 'redux';

// reducers
import walletReducer from './wallet/walletSlice';
import loadingReducer from './loading/loadingSlice';
import testnetsReducer from './testnets/testnetsSlice';
import searchReducer from './search/searchSlice';
import tabReducer from './tab/tabSlice';
import settingsReducer from './settings/settingsSlice';

// combine reducers
const rootReducers = combineReducers({
  wallet: walletReducer,
  loading: loadingReducer,
  testnets: testnetsReducer,
  search: searchReducer,
  tab: tabReducer,
  settings: settingsReducer,
});

// convert object to string to store in localStorage
function saveToLocalStorage(state) {
  try {
    const serialisedState = JSON.stringify(state);
    localStorage.setItem('state', serialisedState);
  } catch (error) {
    console.log(error);
  }
}

// load string from localStorage into an object
function loadFromLocalStorage() {
  try {
    const serialisedState = localStorage.getItem('state');
    if (serialisedState === null) return undefined;
    return JSON.parse(serialisedState);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

// create store with rootReducers and load localStorage values to overwrite default state
//const store = createStore(rootReducers, loadFromLocalStorage());
const store = createStore(rootReducers);

// listen for store changes to save them to localStorage
store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;
