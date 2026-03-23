import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./auth/slice";
import { notificationsReducer } from "./notificationsSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { fetchCurrentUser } from "./auth/operations";

const userConfig = {
  key: "user",
  storage,
  blacklist: ['error'],
};

const persistedUserReducer = persistReducer(userConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store, null, () => {
    const state = store.getState();
    const accessToken = state.user.accessToken;

    if (accessToken) {
        store.dispatch(fetchCurrentUser());
    }
});