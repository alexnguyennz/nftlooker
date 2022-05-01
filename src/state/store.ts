import { createStore, combineReducers } from 'redux';

// Reducers
import walletReducer from './wallet/walletSlice';
import loadingReducer from './loading/loadingSlice';
import testnetsReducer from './testnets/testnetsSlice';
import searchReducer from './search/searchSlice';
import tabReducer from './tab/tabSlice';
import settingsReducer from './settings/settingsSlice';

// Combine reducers
const rootReducers = combineReducers({
  wallet: walletReducer,
  loading: loadingReducer,
  testnets: testnetsReducer,
  search: searchReducer,
  tab: tabReducer,
  settings: settingsReducer,
});

// Convert object to string for localStorage
function saveToLocalStorage(state) {
  try {

    const settings = {
      "settings": state
    }
    localStorage.setItem('settings', JSON.stringify(settings));
  } catch (err) {
    console.log(err);
  }
}

// load string from localStorage into an object
function loadFromLocalStorage() {
  try {
    const serialisedState = localStorage.getItem('settings');
    if (serialisedState === null) return undefined;
    return JSON.parse(serialisedState);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}



// create store with rootReducers and load localStorage values to overwrite default state
//const store = createStore(rootReducers, loadFromLocalStorage());
// const settingsStore = createStore(settingsReducer);
const store = createStore(rootReducers, loadFromLocalStorage());

// Listen for store changes to save them to localStorage
// store.subscribe(() => saveToLocalStorage(settingsStore.getState()));

// loadFromLocalStorage();
//store.subscribe(() => saveToLocalStorage(settingsStore.getState()));


export default store;
