import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import operateurReducer from "./slice/operateurSlice";
import vihiculeReducer from './slice/vihiculeSlice'
import chauffeurReducer from './slice/chauffeurSlice'
import statsReducer from './slice/stateSlice';
import userReducer from './slice/userSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    operateur:operateurReducer,
    vihicule:vihiculeReducer,
    chauffeur:chauffeurReducer,
    stats:statsReducer,
    user:userReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
