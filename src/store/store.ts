import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";
import type { AnyAction } from "@reduxjs/toolkit";

import { airplanesSlice } from "./airplanes/airplanes.slice";
import { rootEpic } from "./rootEpic";

const rootReducer = combineReducers({
  [airplanesSlice.name]: airplanesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);
