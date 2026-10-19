import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import { customerApi } from './api/customerApi'; // 1. customerApi import edildi

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        [customerApi.reducerPath]: customerApi.reducer, // 2. Reducer eklendi
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            apiSlice.middleware,
            customerApi.middleware // 3. Middleware eklendi
        ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;