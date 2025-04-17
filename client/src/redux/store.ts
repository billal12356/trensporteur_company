import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import operateurReducer from "./slice/operateurSlice";
import vihiculeReducer from './slice/vihiculeSlice'
import chauffeurReducer from './slice/chauffeurSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    operateur:operateurReducer,
    vihicule:vihiculeReducer,
    chauffeur:chauffeurReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
