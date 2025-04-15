import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import operateurReducer from "./slice/operateurSlice";
import vihiculeReducer from './slice/vihiculeSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    operateur:operateurReducer,
    vihicule:vihiculeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
