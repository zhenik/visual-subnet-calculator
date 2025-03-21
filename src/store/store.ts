import { configureStore } from "@reduxjs/toolkit";
import subnetReducer from "./subnetSlice";

export const store = configureStore({
    reducer: {
        subnets: subnetReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
