import { combineEpics } from "redux-observable";
import {
  airplanesInitEpic,
  airplanesNextEpic,
  airplanesPrevEpic,
  airplanesUpdateEpic,
  airplanesSubscriptionEpic,
  airplanesDeleteEpic,
  airplanesCreateEpic,
  airplanesAutoRefreshEpic,
} from "./airplanes/airplanes.epics";

export const rootEpic = combineEpics(
  airplanesInitEpic,
  airplanesNextEpic,
  airplanesPrevEpic,
  airplanesUpdateEpic,
  airplanesDeleteEpic,
  airplanesCreateEpic,
  airplanesSubscriptionEpic,
  airplanesAutoRefreshEpic
);
