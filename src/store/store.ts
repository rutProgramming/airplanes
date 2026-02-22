import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";

import { airplanesSlice } from "./airplanes/airplanes.slice";
import { rootEpic } from "./rootEpic";
import type { AppAction } from "./airplanes/epics/airplanes.epics.types";

const rootReducer = combineReducers({
  [airplanesSlice.name]: airplanesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
const epicMiddleware = createEpicMiddleware<AppAction, AppAction,RootState>();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

epicMiddleware.run(rootEpic);

export type AppDispatch = typeof store.dispatch;
