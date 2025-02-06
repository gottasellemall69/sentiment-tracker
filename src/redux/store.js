import { configureStore } from '@reduxjs/toolkit';
import feedbackReducer from '../redux/feedbackSlice';

let store;

const createStore = (preloadedState) => {
  return configureStore({
    reducer: {
      feedback: feedbackReducer,
    },
    preloadedState,
  });
};

export const initializeStore = (preloadedState) => {
  let _store = store ?? createStore(preloadedState);

  // For SSR and SSG, always create a new store
  if (preloadedState && store) {
    _store = createStore({
      ...store.getState(),
      ...preloadedState,
    });
    store = undefined;
  }

  // For the client, re-use the store
  if (!store) {
    store = _store;
  }

  return _store;
};

export const useStore = (initialState) => {
  return initializeStore(initialState);
};
