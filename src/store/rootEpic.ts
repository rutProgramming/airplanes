import { combineEpics } from "redux-observable";
import {
  airplanesInitEpic,
  airplanesNextEpic,
  airplanesPrevEpic,
  airplanesUpdateEpic,
  airplanesSubscriptionEpic,
} from "./airplanes/airplanes.epics";

export const rootEpic = combineEpics(
  airplanesInitEpic,
  airplanesNextEpic,
  airplanesPrevEpic,
  airplanesUpdateEpic,
  airplanesSubscriptionEpic,
);
