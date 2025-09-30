import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import candidatesReducer from './candidatesSlice';
import interviewsReducer from './interviewsSlice';
import chatReducer from './chatSlice';
import appReducer from './appSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['candidates', 'interviews', 'chatMessages'], // Only persist these slices
};

const rootReducer = combineReducers({
  candidates: candidatesReducer,
  interviews: interviewsReducer,
  chatMessages: chatReducer,
  app: appReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: [
          // Ignore File objects in action payloads
          'payload.resumeFile',
          'meta.arg.resumeFile'
        ],
        ignoredPaths: [
          // Ignore File objects in candidates state
          'candidates.byId.resumeFile',
          // Ignore any path containing resumeFile
          /candidates\.byId\.[^.]+\.resumeFile/
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;