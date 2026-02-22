import { combineEpics } from "redux-observable";
import { airplanesEpics } from "./airplanes/epics";

export const rootEpic = combineEpics(...airplanesEpics)
