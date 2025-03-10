import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { setupListeners } from '@reduxjs/toolkit/query';
// import thunk from 'redux-thunk';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { persistReducer, persistStore } from 'redux-persist';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import userReducer from './slices/user';

import userApi from '@/api/user';
import React from 'react';

import authApi from '@/api/auth';
import planApi from '@/api/plan';
import eventApi from '@/api/event';
import chatApi from '@/api/chat';
import notificationApi from '@/api/notification';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  user: persistReducer(persistConfig, userReducer),
  [userApi.reducerPath]: userApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [planApi.reducerPath]: planApi.reducer,
  [eventApi.reducerPath]: eventApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    })
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(planApi.middleware)
      .concat(eventApi.middleware)
      .concat(chatApi.middleware)
      .concat(notificationApi.middleware),
});

setupListeners(store.dispatch);

const persistorStore = persistStore(store);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistorStore}>
      {children}
    </PersistGate>
  </Provider>
);
