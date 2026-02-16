import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { createEpicMiddleware } from "redux-observable";

import { airplanesSlice } from "./airplanes/airplanes.slice";
import { rootEpic } from "./rootEpic";

const rootReducer = combineReducers({
  [airplanesSlice.name]: airplanesSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(epicMiddleware),
});

export type AppDispatch = typeof store.dispatch;

epicMiddleware.run(rootEpic);
